import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { FloorDimensions } from '../types';
import { GAME_CONFIG } from './constants';
import { getDifficultyForFloor, getStabilizationMaxForce, StabilizationStatus } from './difficultyCurve';

export interface PhysicsFloorRecord {
  id: number;
  body: CANNON.Body;
  mesh: THREE.Group;
  dimensions: FloorDimensions;
  settled: boolean;
  spawnTime: number;
  firstContactTime: number | null;
  lowVelocityDuration: number;
  supportRatio: number;
  lockConstraint?: CANNON.LockConstraint;
  expectedSupportY: number;
  stablePosition?: { x: number; y: number; z: number };
  stableY?: number;
  isFrozen?: boolean;
  frozenPosition?: { x: number; y: number; z: number };
  frozenQuaternion?: { x: number; y: number; z: number; w: number };
  isDetached?: boolean;
  detachedTime?: number;
}

export class PhysicsWorld {
  public world: CANNON.World;
  private floorMaterial: CANNON.Material;
  private foundationMaterial: CANNON.Material;
  public records: PhysicsFloorRecord[] = [];
  public currentFallingFloor: PhysicsFloorRecord | null = null;
  private foundationBody: CANNON.Body;
  private constraints: CANNON.Constraint[] = [];

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, GAME_CONFIG.GRAVITY, 0),
    });

    // Zero bounce, high friction, stable contact equations
    this.world.defaultContactMaterial.friction = GAME_CONFIG.FLOOR_FRICTION;
    this.world.defaultContactMaterial.restitution = GAME_CONFIG.FLOOR_RESTITUTION;
    this.world.defaultContactMaterial.contactEquationStiffness = 1e6;
    this.world.defaultContactMaterial.contactEquationRelaxation = 3;

    this.floorMaterial = new CANNON.Material('floor');
    this.foundationMaterial = new CANNON.Material('foundation');

    const contactMat = new CANNON.ContactMaterial(
      this.floorMaterial,
      this.floorMaterial,
      {
        friction: GAME_CONFIG.FLOOR_FRICTION,
        restitution: GAME_CONFIG.FLOOR_RESTITUTION, // Strictly zero bounce
        contactEquationStiffness: 1e6,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e6,
        frictionEquationRelaxation: 3,
      }
    );
    this.world.addContactMaterial(contactMat);

    const groundContactMat = new CANNON.ContactMaterial(
      this.floorMaterial,
      this.foundationMaterial,
      {
        friction: 0.98,
        restitution: 0.0,
        contactEquationStiffness: 1e6,
        contactEquationRelaxation: 3,
      }
    );
    this.world.addContactMaterial(groundContactMat);

    // Ground plane
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: this.foundationMaterial,
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.position.set(0, -6.0, 0);
    this.world.addBody(groundBody);

    // Tower Foundation rigid body
    const fw = (GAME_CONFIG.BASE_WIDTH * 1.3) / 2;
    const fd = (GAME_CONFIG.BASE_DEPTH * 1.3) / 2;
    const fh = GAME_CONFIG.FOUNDATION_HEIGHT / 2;
    this.foundationBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(fw, fh, fd)),
      material: this.foundationMaterial,
    });
    this.foundationBody.position.set(0, fh - 6.0, 0);
    this.world.addBody(this.foundationBody);
  }

  public getFoundationTopY(): number {
    return GAME_CONFIG.FOUNDATION_HEIGHT - 6.0;
  }

  /**
   * Drops a floor: Creates a dynamic rigid body with exact position, orientation, and momentum.
   * NEVER SNAPS floors or centers them!
   */
  public releaseFloor(
    id: number,
    mesh: THREE.Group,
    dimensions: FloorDimensions,
    linearVelocity: THREE.Vector3,
    angularVelocityY: number
  ): PhysicsFloorRecord {
    const halfExtents = new CANNON.Vec3(
      dimensions.width / 2,
      dimensions.height / 2,
      dimensions.depth / 2
    );

    const body = new CANNON.Body({
      mass: GAME_CONFIG.FLOOR_MASS,
      shape: new CANNON.Box(halfExtents),
      material: this.floorMaterial,
      linearDamping: GAME_CONFIG.LINEAR_DAMPING,
      angularDamping: GAME_CONFIG.ANGULAR_DAMPING,
      allowSleep: true,
      sleepSpeedLimit: 0.15,
      sleepTimeLimit: 0.4,
    });

    // Exact position & rotation - NO SNAPPING!
    body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    body.quaternion.set(
      mesh.quaternion.x,
      mesh.quaternion.y,
      mesh.quaternion.z,
      mesh.quaternion.w
    );

    // Exact momentum
    body.velocity.set(linearVelocity.x, linearVelocity.y, linearVelocity.z);
    body.angularVelocity.set(0, angularVelocityY, 0);

    const expectedSupportY = this.getSettledTowerTopY();

    const record: PhysicsFloorRecord = {
      id,
      body,
      mesh,
      dimensions,
      settled: false,
      spawnTime: performance.now(),
      firstContactTime: null,
      lowVelocityDuration: 0,
      supportRatio: 1.0,
      expectedSupportY,
    };

    // HEAVY CONCRETE IMPACT DAMPING: Zero recoil upward on contact
    body.addEventListener('collide', () => {
      if (record.firstContactTime === null) {
        record.firstContactTime = performance.now();
      }
      // Strictly prevent upward bouncing
      if (body.velocity.y > 0) {
        body.velocity.y = 0;
      }
      // Damp excess lateral slide and spin on heavy impact
      body.velocity.x *= 0.55;
      body.velocity.z *= 0.55;
      body.angularVelocity.x *= 0.4;
      body.angularVelocity.y *= 0.5;
      body.angularVelocity.z *= 0.4;
    });

    this.world.addBody(body);
    this.records.push(record);
    this.currentFallingFloor = record;
    return record;
  }

  /**
   * Advance physics world by delta
   */
  public step(delta: number) {
    const clampedDelta = Math.min(delta, 0.05);
    this.world.step(1 / 60, clampedDelta, 3);

    // Anti-bounce enforcement on falling floor after first contact
    if (this.currentFallingFloor && this.currentFallingFloor.firstContactTime !== null) {
      const b = this.currentFallingFloor.body;
      if (b.velocity.y > 0.02) {
        b.velocity.y = 0;
      }
    }

    // Sync 3D meshes to physics bodies
    for (const rec of this.records) {
      if (rec.isFrozen && rec.frozenPosition && rec.frozenQuaternion) {
        // Authoritative frozen transform: preserve exact player-created crookedness and position!
        rec.mesh.position.set(rec.frozenPosition.x, rec.frozenPosition.y, rec.frozenPosition.z);
        rec.mesh.quaternion.set(
          rec.frozenQuaternion.x,
          rec.frozenQuaternion.y,
          rec.frozenQuaternion.z,
          rec.frozenQuaternion.w
        );
        rec.body.position.set(rec.frozenPosition.x, rec.frozenPosition.y, rec.frozenPosition.z);
        rec.body.quaternion.set(
          rec.frozenQuaternion.x,
          rec.frozenQuaternion.y,
          rec.frozenQuaternion.z,
          rec.frozenQuaternion.w
        );
        rec.body.velocity.set(0, 0, 0);
        rec.body.angularVelocity.set(0, 0, 0);
      } else {
        rec.mesh.position.set(rec.body.position.x, rec.body.position.y, rec.body.position.z);
        rec.mesh.quaternion.set(
          rec.body.quaternion.x,
          rec.body.quaternion.y,
          rec.body.quaternion.z,
          rec.body.quaternion.w
        );
      }
    }

    // Keep active physics window enforced continuously
    if (this.records.length > GAME_CONFIG.ACTIVE_PHYSICS_WINDOW) {
      this.enforceActivePhysicsWindow();
    }
  }

  /**
   * Evaluates if the newly dropped floor has settled, or if it missed the tower completely.
   */
  public checkCurrentFloorStatus(delta: number): {
    settled: boolean;
    missed: boolean;
    impactSpeed: number;
    tiltAngle: number;
  } {
    if (!this.currentFallingFloor) {
      return { settled: false, missed: false, impactSpeed: 0, tiltAngle: 0 };
    }

    const { body, spawnTime, firstContactTime, expectedSupportY } = this.currentFallingFloor;
    const now = performance.now();
    const elapsedSinceDrop = (now - spawnTime) / 1000;

    // Up vector for tilt check
    const up = new CANNON.Vec3(0, 1, 0);
    const bodyUp = body.vectorToWorldFrame(new CANNON.Vec3(0, 1, 0));
    const tiltAngle = Math.acos(Math.max(-1, Math.min(1, up.dot(bodyUp))));

    const vx = body.velocity.x;
    const vy = body.velocity.y;
    const vz = body.velocity.z;
    const linearSpeed = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const angularSpeed = body.angularVelocity.length();

    // CASE A: Check if floor clearly missed the tower and is falling away
    // It must fall significantly below expectedSupportY (e.g. 4.5m below support top or below ground -2.0m)
    // AND have been falling for at least 0.75s to let the player visibly see it drop past the tower
    const fallThresholdY = expectedSupportY - 4.5;
    const isFarBelow = body.position.y < fallThresholdY || body.position.y < -2.0;

    if (isFarBelow && elapsedSinceDrop > 0.75) {
      // Floor has clearly fallen away from the tower
      return { settled: false, missed: true, impactSpeed: linearSpeed, tiltAngle };
    }

    // Settling Phase Logic:
    if (firstContactTime !== null) {
      const contactDuration = (now - firstContactTime) / 1000;

      if (
        linearSpeed < GAME_CONFIG.SETTLING_VELOCITY_THRESH &&
        angularSpeed < GAME_CONFIG.SETTLING_ANGULAR_THRESH
      ) {
        this.currentFallingFloor.lowVelocityDuration += delta;
      } else {
        this.currentFallingFloor.lowVelocityDuration = Math.max(
          0,
          this.currentFallingFloor.lowVelocityDuration - delta * 0.4
        );
      }

      // Settled if low velocity sustained for at least 0.20s and contact time >= SETTLING_MIN_TIME_S
      if (
        contactDuration >= GAME_CONFIG.SETTLING_MIN_TIME_S &&
        this.currentFallingFloor.lowVelocityDuration >= 0.20
      ) {
        return { settled: true, missed: false, impactSpeed: linearSpeed, tiltAngle };
      }

      // Safety limit: if contact has lasted >= 1.05s and floor is resting safely near/above expected support
      if (
        contactDuration >= GAME_CONFIG.SETTLING_MAX_TIME_S &&
        linearSpeed < 0.65 &&
        body.position.y >= expectedSupportY - 1.0
      ) {
        return { settled: true, missed: false, impactSpeed: linearSpeed, tiltAngle };
      }
    } else if (elapsedSinceDrop > 1.8 && linearSpeed < 0.35 && body.position.y >= expectedSupportY - 1.0) {
      // Fallback
      return { settled: true, missed: false, impactSpeed: linearSpeed, tiltAngle };
    }

    return { settled: false, missed: false, impactSpeed: linearSpeed, tiltAngle };
  }

  /**
   * HIDDEN SOFT STABILIZATION:
   * Evaluates horizontal overlap with the supporting floor/foundation.
   * If supported, creates an invisible soft LockConstraint that prevents sliding/jitter,
   * while STRICTLY PRESERVING exact position, rotation, and crookedness!
   */
  public applySoftStabilization(
    record: PhysicsFloorRecord,
    currentFloorCount: number
  ): {
    supportRatio: number;
    status: 'VERY_STABLE' | 'STABLE' | 'RISKY' | 'DANGEROUS';
  } {
    record.settled = true;
    record.stablePosition = {
      x: record.body.position.x,
      y: record.body.position.y,
      z: record.body.position.z,
    };
    record.stableY = record.body.position.y;

    // Find supporting body among surviving settled floors beneath this floor
    let prevRec: PhysicsFloorRecord | null = null;
    let highestPrevY = -Infinity;
    for (const r of this.records) {
      if (r !== record && r.settled && !r.isDetached) {
        const rTop = r.body.position.y + r.dimensions.height / 2;
        if (rTop <= record.body.position.y + 0.1 && rTop > highestPrevY) {
          highestPrevY = rTop;
          prevRec = r;
        }
      }
    }

    let supX = 0;
    let supZ = 0;
    let supW = GAME_CONFIG.BASE_WIDTH * 1.3;
    let supD = GAME_CONFIG.BASE_DEPTH * 1.3;
    let supBody: CANNON.Body = this.foundationBody;

    if (prevRec) {
      supX = prevRec.body.position.x;
      supZ = prevRec.body.position.z;
      supW = prevRec.dimensions.width;
      supD = prevRec.dimensions.depth;
      supBody = prevRec.body;
    }

    const curPos = record.body.position;
    const curDim = record.dimensions;

    // 1D Overlaps along X and Z
    const minX1 = curPos.x - curDim.width / 2;
    const maxX1 = curPos.x + curDim.width / 2;
    const minX2 = supX - supW / 2;
    const maxX2 = supX + supW / 2;
    const overlapX = Math.max(0, Math.min(maxX1, maxX2) - Math.max(minX1, minX2));

    const minZ1 = curPos.z - curDim.depth / 2;
    const maxZ1 = curPos.z + curDim.depth / 2;
    const minZ2 = supZ - supD / 2;
    const maxZ2 = supZ + supD / 2;
    const overlapZ = Math.max(0, Math.min(maxZ1, maxZ2) - Math.max(minZ1, minZ2));

    const contactArea = overlapX * overlapZ;
    const floorArea = curDim.width * curDim.depth;
    const supportRatio = Math.min(1.0, contactArea / floorArea);
    record.supportRatio = supportRatio;

    // Categorize support according to rules
    let status: StabilizationStatus;

    if (supportRatio >= GAME_CONFIG.STABILIZATION_VERY_STABLE_SUPPORT) {
      // 70 - 100% supported: VERY STABLE
      status = 'VERY_STABLE';
    } else if (supportRatio >= GAME_CONFIG.STABILIZATION_STABLE_SUPPORT) {
      // 45 - 70% supported: STABLE (allows tiny wobble)
      status = 'STABLE';
    } else if (supportRatio >= GAME_CONFIG.STABILIZATION_RISKY_SUPPORT) {
      // 25 - 45% supported: RISKY (allows visible tilt, rotation and slow sliding under off-center loads, but holds)
      status = 'RISKY';
    } else {
      // Below 25%: VERY DANGEROUS
      status = 'DANGEROUS';
    }

    // Smooth difficulty progression (replaces binary floor <= 20 cliff)
    const difficulty = getDifficultyForFloor(currentFloorCount);
    const maxForce = getStabilizationMaxForce(status, difficulty);

    // Development-only temporary debug log
    if (import.meta.env.DEV) {
      console.debug(
        `[Stabilization] Floor: ${currentFloorCount} | Support: ${(supportRatio * 100).toFixed(1)}% | Status: ${status} | Difficulty: ${difficulty.toFixed(2)} | ConstraintForce: ${maxForce.toExponential(2)}`
      );
    }

    if (maxForce > 0) {
      // LockConstraint locks current relative position and rotation (NO SNAPPING OR CENTERING!)
      const lock = new CANNON.LockConstraint(record.body, supBody, { maxForce });
      this.world.addConstraint(lock);
      record.lockConstraint = lock;
      this.constraints.push(lock);
    }

    // Dampen micro-jitter on settled floor
    record.body.linearDamping = 0.55;
    record.body.angularDamping = 0.75;

    // Enforce Active Physics Window:
    // Only the top active floors (ACTIVE_PHYSICS_WINDOW = 4) remain fully dynamic.
    // Older floors below this window become STATIC bodies (preserving their exact position, rotation, and crookedness).
    this.enforceActivePhysicsWindow();

    return { supportRatio, status };
  }

  /**
   * Safely converts an old settled floor to STATIC.
   * Follows the strict 13-step freeze transition to ensure zero visible
   * movement, jump, rotation, tilt, or realignment, while permanently
   * preserving the player's crooked tower architecture.
   */
  private freezeFloor(rec: PhysicsFloorRecord) {
    if (rec.isFrozen) return;

    // 1. Store its exact current position
    const posX = rec.body.position.x;
    const posY = rec.body.position.y;
    const posZ = rec.body.position.z;

    // 2. Store its exact current quaternion
    const quatX = rec.body.quaternion.x;
    const quatY = rec.body.quaternion.y;
    const quatZ = rec.body.quaternion.z;
    const quatW = rec.body.quaternion.w;

    rec.isFrozen = true;
    rec.frozenPosition = { x: posX, y: posY, z: posZ };
    rec.frozenQuaternion = { x: quatX, y: quatY, z: quatZ, w: quatW };

    // 3. Remove constraints that could apply forces to it during or after the transition
    if (rec.lockConstraint) {
      this.world.removeConstraint(rec.lockConstraint);
      const idx = this.constraints.indexOf(rec.lockConstraint);
      if (idx !== -1) this.constraints.splice(idx, 1);
      rec.lockConstraint = undefined;
    }

    // 4. Change the body safely to STATIC
    rec.body.type = CANNON.Body.STATIC;

    // 5. Update mass properties
    rec.body.mass = 0;
    rec.body.updateMassProperties();

    // 6. Restore the exact stored position
    rec.body.position.set(posX, posY, posZ);

    // 7. Restore the exact stored quaternion
    rec.body.quaternion.set(quatX, quatY, quatZ, quatW);

    // 8. Set velocity to zero
    rec.body.velocity.set(0, 0, 0);

    // 9. Set angular velocity to zero
    rec.body.angularVelocity.set(0, 0, 0);

    // 10. Clear accumulated force and torque
    rec.body.force.set(0, 0, 0);
    rec.body.torque.set(0, 0, 0);

    // 11. Wake/update the physics body if required by Cannon-es
    rec.body.updateInertiaWorld(true);

    // 12. Update its AABB / bounding information if required
    rec.body.updateAABB();
    rec.body.aabbNeedsUpdate = true;

    // 13. Ensure the Three.js mesh receives exactly the same transform
    rec.mesh.position.set(posX, posY, posZ);
    rec.mesh.quaternion.set(quatX, quatY, quatZ, quatW);
  }

  /**
   * ACTIVE PHYSICS WINDOW:
   * Keeps the newest floors (ACTIVE_PHYSICS_WINDOW = 4) fully dynamic.
   * Older floors below this window become STATIC CANNON bodies with authoritative frozen transforms,
   * perfectly preserving their exact position, crookedness, and rotation,
   * while eliminating jitter compounding, preventing chain-reaction collapse,
   * and ensuring smooth 60fps on mobile for runs of 100-200+ floors!
   */
  public enforceActivePhysicsWindow() {
    const activeWindowSize = GAME_CONFIG.ACTIVE_PHYSICS_WINDOW;
    // Only count surviving settled floors for the active window cutoff
    const survivingFloors = this.records.filter((r) => r.settled && !r.isDetached);
    const cutoff = survivingFloors.length - activeWindowSize;
    if (cutoff <= 0) return;

    for (let i = 0; i < cutoff; i++) {
      const rec = survivingFloors[i];
      if (!rec.isFrozen) {
        // DO NOT FREEZE A FLOOR TOO EARLY:
        // A floor may enter the frozen section ONLY if settled === true,
        // and it has already been stable (not falling or sliding significantly).
        const speed = rec.body.velocity.length();
        const angSpeed = rec.body.angularVelocity.length();
        if (rec.settled && speed < 0.25 && angSpeed < 0.25) {
          this.freezeFloor(rec);
        }
      }
    }

    // Constraint Rule:
    // Do NOT leave an unstable chain of LockConstraints crossing
    // the boundary between STATIC frozen floors and DYNAMIC active floors.
    const boundaryFloor = survivingFloors[cutoff];
    if (boundaryFloor && boundaryFloor.lockConstraint) {
      this.world.removeConstraint(boundaryFloor.lockConstraint);
      const idx = this.constraints.indexOf(boundaryFloor.lockConstraint);
      if (idx !== -1) this.constraints.splice(idx, 1);
      boundaryFloor.lockConstraint = undefined;

      // Damp micro-jitter on the boundary floor as it rests upon the static top floor
      boundaryFloor.body.velocity.set(0, 0, 0);
      boundaryFloor.body.angularVelocity.set(0, 0, 0);
      boundaryFloor.body.force.set(0, 0, 0);
      boundaryFloor.body.torque.set(0, 0, 0);
    }
  }

  /**
   * Determines if a given floor is still structurally valid and surviving as part of the tower.
   */
  public isFloorSurviving(rec: PhysicsFloorRecord): boolean {
    if (!rec.settled) return false;
    if (rec.isDetached) return false;
    if (rec.body.position.y < -0.5) return false;

    // Permanently frozen floors are solid base structures
    if (rec.isFrozen) return true;

    // Check vertical drop from settled position
    if (rec.stableY !== undefined) {
      const drop = rec.stableY - rec.body.position.y;
      const dropLimit = Math.max(2.8, rec.dimensions.height * 1.35);
      if (drop > dropLimit) return false;
    }

    // Check excessive tilt angle (> 1.25 rad / ~72 deg)
    const up = new CANNON.Vec3(0, 1, 0);
    const bodyUp = rec.body.vectorToWorldFrame(up);
    const tilt = Math.acos(Math.max(-1, Math.min(1, up.dot(bodyUp))));
    if (tilt > 1.25) return false;

    return true;
  }

  /**
   * Returns the top Y position of the highest surviving, structurally connected module.
   * If all floors fell or no floors placed, returns the foundation top.
   */
  public getSurvivingTowerTopY(): number {
    const surviving = this.records.filter((r) => this.isFloorSurviving(r));
    if (surviving.length === 0) {
      return this.getFoundationTopY();
    }
    let maxY = this.getFoundationTopY();
    for (const rec of surviving) {
      const topOfFloor = rec.body.position.y + rec.dimensions.height / 2;
      if (topOfFloor > maxY) {
        maxY = topOfFloor;
      }
    }
    return maxY;
  }

  /**
   * Returns the highest surviving floor module record, or null if none.
   */
  public getSurvivingTopFloor(): PhysicsFloorRecord | null {
    const surviving = this.records.filter((r) => this.isFloorSurviving(r));
    if (surviving.length === 0) return null;
    let highestRec: PhysicsFloorRecord | null = null;
    let highestTop = -Infinity;
    for (const rec of surviving) {
      const topOfFloor = rec.body.position.y + rec.dimensions.height / 2;
      if (topOfFloor > highestTop) {
        highestTop = topOfFloor;
        highestRec = rec;
      }
    }
    return highestRec;
  }

  public getSettledTowerTopY(): number {
    return this.getSurvivingTowerTopY();
  }

  public getTowerTopY(): number {
    return this.getSurvivingTowerTopY();
  }

  /**
   * Processes partial collapse detection, disconnects falling floors,
   * cleanly removes out-of-bounds fallen floors from world & scene,
   * and reports whether a catastrophic structural cascade occurred.
   */
  public processPartialCollapseAndCleanup(onRemoveMesh: (mesh: THREE.Group) => void): {
    newlyDetached: PhysicsFloorRecord[];
    hasSevereCascade: boolean;
    survivingTopY: number;
    survivingTopFloor: PhysicsFloorRecord | null;
  } {
    const newlyDetached: PhysicsFloorRecord[] = [];
    const up = new CANNON.Vec3(0, 1, 0);

    // 1. Detect any settled floors that have detached / fallen
    for (const rec of this.records) {
      if (!rec.settled || rec.isFrozen || rec.isDetached) continue;

      const stableY = rec.stableY ?? rec.body.position.y;
      const fallDist = stableY - rec.body.position.y;
      const fallLimit = Math.max(2.8, rec.dimensions.height * 1.35);

      const bodyUp = rec.body.vectorToWorldFrame(up);
      const tilt = Math.acos(Math.max(-1, Math.min(1, up.dot(bodyUp))));

      const isFallen = (fallDist > fallLimit || rec.body.position.y < -2.0) ||
                       (tilt > 1.25 && rec.body.velocity.y < -0.8);

      if (isFallen) {
        rec.isDetached = true;
        rec.detachedTime = performance.now();
        newlyDetached.push(rec);

        // Sever lock constraint immediately so it falls away cleanly
        if (rec.lockConstraint) {
          this.world.removeConstraint(rec.lockConstraint);
          const idx = this.constraints.indexOf(rec.lockConstraint);
          if (idx !== -1) this.constraints.splice(idx, 1);
          rec.lockConstraint = undefined;
        }
      }
    }

    const survivingTopY = this.getSurvivingTowerTopY();
    const survivingTopFloor = this.getSurvivingTopFloor();
    const survivingFloors = this.records.filter((r) => this.isFloorSurviving(r));

    // 2. Visible fall delay & cleanup when safely outside play area
    const now = performance.now();
    const recordsToKeep: PhysicsFloorRecord[] = [];

    for (const rec of this.records) {
      if (rec.isDetached) {
        const detachedDuration = (now - (rec.detachedTime ?? now)) / 1000;
        // Allow player to visibly see the fallen floor tumble for a short time
        const isFarBelow = rec.body.position.y < -15.0 ||
                           rec.body.position.y < (survivingTopY - 22.0) ||
                           (detachedDuration > 3.0 && rec.body.position.y < survivingTopY - 6.0);

        if (isFarBelow) {
          // Cleanup body and mesh
          if (rec.lockConstraint) {
            this.world.removeConstraint(rec.lockConstraint);
            const idx = this.constraints.indexOf(rec.lockConstraint);
            if (idx !== -1) this.constraints.splice(idx, 1);
            rec.lockConstraint = undefined;
          }
          this.world.removeBody(rec.body);
          onRemoveMesh(rec.mesh);

          if (import.meta.env.DEV) {
            console.debug(`[Collapse] Cleaned up fallen floor #${rec.id}`);
          }
          continue; // Do not keep in records
        }
      }
      recordsToKeep.push(rec);
    }
    this.records = recordsToKeep;

    // 3. Evaluate whether collapse is SEVERE (Game Over condition)
    // Principle: Losing 1, 2, or 3 upper floors is SURVIVABLE as long as a valid supported top remains.
    let hasSevereCascade = false;

    // Total placed floors (excluding current falling floor)
    const placedCount = this.records.filter((r) => r.settled).length;

    if (placedCount >= 3) {
      if (survivingFloors.length === 0) {
        // Complete obliteration down to foundation
        hasSevereCascade = true;
      } else if (placedCount >= 4 && survivingTopY <= this.getFoundationTopY() + 0.5) {
        // Tower collapsed down to foundation
        hasSevereCascade = true;
      } else {
        // Count how many floors are currently detached and tumbling simultaneously
        const tumblingCount = this.records.filter((r) => r.isDetached).length;

        // Check if the surviving top floor itself is in an unrecoverable state
        if (survivingTopFloor && !survivingTopFloor.isFrozen) {
          const bodyUp = survivingTopFloor.body.vectorToWorldFrame(up);
          const topTilt = Math.acos(Math.max(-1, Math.min(1, up.dot(bodyUp))));
          const topSpeedY = survivingTopFloor.body.velocity.y;

          // If surviving top is tilting severely (> 66 deg) and sinking, no buildable surface remains
          if (topTilt > 1.15 && topSpeedY < -1.0) {
            hasSevereCascade = true;
          }
        }

        // Catastrophic cascade: 4 or more floors tumbling simultaneously AND active top unstable
        if (tumblingCount >= 4) {
          if (!survivingTopFloor || !survivingTopFloor.isFrozen) {
            hasSevereCascade = true;
          }
        }
      }
    }

    return {
      newlyDetached,
      hasSevereCascade,
      survivingTopY,
      survivingTopFloor,
    };
  }

  /**
   * Backwards-compatible structural collapse check:
   * Returns whether a severe structural collapse has occurred.
   */
  public checkActiveTopCollapse(): {
    hasCollapsed: boolean;
    activeFallenFloorCount: number;
  } {
    const surviving = this.records.filter((r) => this.isFloorSurviving(r));
    const detached = this.records.filter((r) => r.isDetached);

    const placedCount = this.records.filter((r) => r.settled).length;
    if (placedCount >= 3 && surviving.length === 0) {
      return { hasCollapsed: true, activeFallenFloorCount: detached.length };
    }

    if (detached.length >= 4) {
      const topFloor = this.getSurvivingTopFloor();
      if (!topFloor || !topFloor.isFrozen) {
        return { hasCollapsed: true, activeFallenFloorCount: detached.length };
      }
    }

    return { hasCollapsed: false, activeFallenFloorCount: detached.length };
  }

  /**
   * Prepares all bodies for dramatic endgame collapse animation:
   * Converts all bodies back to dynamic so the entire crooked tower tumbles down!
   */
  public wakeAllForCollapse() {
    for (const c of this.constraints) {
      this.world.removeConstraint(c);
    }
    this.constraints = [];

    for (const rec of this.records) {
      rec.isFrozen = false;
      rec.frozenPosition = undefined;
      rec.frozenQuaternion = undefined;
      rec.lockConstraint = undefined;
      rec.body.type = CANNON.Body.DYNAMIC;
      rec.body.mass = GAME_CONFIG.FLOOR_MASS;
      rec.body.updateMassProperties();
      rec.body.wakeUp();
      rec.body.applyImpulse(
        new CANNON.Vec3(
          (Math.random() - 0.5) * 450,
          (Math.random() - 0.2) * 120,
          (Math.random() - 0.5) * 450
        ),
        new CANNON.Vec3(0, 0, 0)
      );
    }
  }

  /**
   * Reset physics world
   */
  public reset() {
    for (const c of this.constraints) {
      this.world.removeConstraint(c);
    }
    this.constraints = [];

    for (const rec of this.records) {
      rec.isFrozen = false;
      rec.frozenPosition = undefined;
      rec.frozenQuaternion = undefined;
      this.world.removeBody(rec.body);
    }
    this.records = [];
    this.currentFallingFloor = null;
  }
}

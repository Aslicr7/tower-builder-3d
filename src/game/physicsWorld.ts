import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { FloorDimensions } from '../types';
import { GAME_CONFIG } from './constants';

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
      rec.mesh.position.set(rec.body.position.x, rec.body.position.y, rec.body.position.z);
      rec.mesh.quaternion.set(
        rec.body.quaternion.x,
        rec.body.quaternion.y,
        rec.body.quaternion.z,
        rec.body.quaternion.w
      );
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

    // Find supporting body
    const prevRec = this.records.length >= 2 ? this.records[this.records.length - 2] : null;

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
    let status: 'VERY_STABLE' | 'STABLE' | 'RISKY' | 'DANGEROUS';
    let maxForce = 0;

    // Floors 1-20 are intentionally extra forgiving (User requirement #10)
    const isEarlyGame = currentFloorCount <= 20;

    if (supportRatio >= GAME_CONFIG.STABILIZATION_VERY_STABLE_SUPPORT) {
      // 70 - 100% supported: VERY STABLE
      status = 'VERY_STABLE';
      maxForce = isEarlyGame ? 4e6 : 2.5e6;
    } else if (supportRatio >= GAME_CONFIG.STABILIZATION_STABLE_SUPPORT) {
      // 45 - 70% supported: STABLE (allows tiny wobble)
      status = 'STABLE';
      maxForce = isEarlyGame ? 3e6 : 1.5e6;
    } else if (supportRatio >= GAME_CONFIG.STABILIZATION_RISKY_SUPPORT) {
      // 25 - 45% supported: RISKY (allows visible tilt, rotation and slow sliding under off-center loads, but holds)
      status = 'RISKY';
      maxForce = isEarlyGame ? 1.5e6 : 4.5e5;
    } else {
      // Below 25%: VERY DANGEROUS
      status = 'DANGEROUS';
      maxForce = isEarlyGame ? 6e5 : 0;
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
    // Only the top 10 floors remain fully dynamic. Older floors below this window
    // become STATIC bodies (preserving their exact position, rotation, and crookedness).
    this.enforceActivePhysicsWindow();

    return { supportRatio, status };
  }

  /**
   * ACTIVE PHYSICS WINDOW:
   * Keeps the newest ~10 floors fully dynamic.
   * Older floors below this window become STATIC CANNON bodies,
   * perfectly preserving their exact position, crookedness, and rotation,
   * while eliminating jitter compounding, preventing chain-reaction collapse,
   * and ensuring smooth 60fps on mobile for runs of 100-200+ floors!
   */
  public enforceActivePhysicsWindow() {
    const activeWindowSize = GAME_CONFIG.ACTIVE_PHYSICS_WINDOW; // 10
    const cutoff = this.records.length - activeWindowSize;

    for (let i = 0; i < cutoff; i++) {
      const rec = this.records[i];
      if (rec.body.type !== CANNON.Body.STATIC) {
        rec.body.type = CANNON.Body.STATIC;
        rec.body.mass = 0;
        rec.body.updateMassProperties();
        rec.body.velocity.set(0, 0, 0);
        rec.body.angularVelocity.set(0, 0, 0);
      }
      // Deep static floors don't need active constraint solving
      if (i < cutoff - 1 && rec.lockConstraint) {
        this.world.removeConstraint(rec.lockConstraint);
        const idx = this.constraints.indexOf(rec.lockConstraint);
        if (idx !== -1) this.constraints.splice(idx, 1);
        rec.lockConstraint = undefined;
      }
    }
  }

  public getSettledTowerTopY(): number {
    const settledFloors = this.records.filter((r) => r.settled);
    if (settledFloors.length === 0) {
      return this.getFoundationTopY();
    }
    let maxY = this.getFoundationTopY();
    for (const rec of settledFloors) {
      const topOfFloor = rec.body.position.y + rec.dimensions.height / 2;
      if (topOfFloor > maxY) {
        maxY = topOfFloor;
      }
    }
    return maxY;
  }

  public getTowerTopY(): number {
    if (this.records.length === 0) {
      return this.getFoundationTopY();
    }
    let maxY = this.getFoundationTopY();
    for (const rec of this.records) {
      const topOfFloor = rec.body.position.y + rec.dimensions.height / 2;
      if (topOfFloor > maxY) {
        maxY = topOfFloor;
      }
    }
    return maxY;
  }

  /**
   * Evaluates if the ACTIVE TOP SECTION has experienced a meaningful structural collapse.
   * Compares each settled active floor's current Y against its own recorded stableY.
   * Requires at least 2 settled active floors to have fallen more than 1.3 floor heights (~2.5m).
   * NO tilt angle or rotation threshold is used as a failure condition!
   */
  public checkActiveTopCollapse(): {
    hasCollapsed: boolean;
    activeFallenFloorCount: number;
  } {
    const settledFloors = this.records.filter((r) => r.settled && r.stableY !== undefined);
    if (settledFloors.length < 2) {
      return { hasCollapsed: false, activeFallenFloorCount: 0 };
    }

    // Only examine active top section
    const activeFloors = settledFloors.slice(-GAME_CONFIG.ACTIVE_PHYSICS_WINDOW);

    let fallenCount = 0;
    for (const rec of activeFloors) {
      if (rec.stableY === undefined) continue;

      const fallDistance = rec.stableY - rec.body.position.y;
      const fallThreshold = Math.max(2.5, rec.dimensions.height * 1.3);

      // Floor has physically fallen significantly below its stable position, or reached ground/abyss
      if (fallDistance > fallThreshold || rec.body.position.y < -2.0) {
        fallenCount++;
      }
    }

    // Meaningful structural collapse requires at least 2 active settled floors to have fallen
    return {
      hasCollapsed: fallenCount >= 2,
      activeFallenFloorCount: fallenCount,
    };
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
      this.world.removeBody(rec.body);
    }
    this.records = [];
    this.currentFallingFloor = null;
  }
}

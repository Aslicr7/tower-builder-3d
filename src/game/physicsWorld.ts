import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { FloorDimensions, PlacementQuality } from '../types';
import { GAME_CONFIG } from './constants';
import {
  getDifficultyForFloor,
  getCraneKinematicsForFloor,
  getReleaseMomentumMultipliers,
  getSpeedMultiplierForFloor,
  getStabilizationMaxForce,
  getSettledDampingForFloor,
  getActivePhysicsWindowSize,
  getEarlyGripFactor,
  getEarlyGripWindowFactor,
  getEarlySlipStrength,
  getImpactMomentumRetention,
  evaluatePlacementQuality,
  getBaseStabilityAssist,
  StabilizationStatus,
} from './difficultyCurve';

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
  placementQuality?: PlacementQuality;
  horizontalSpeedAtImpact?: number;
  horizontalSpeedAfterImpact?: number;
  angularSpeedAtImpact?: number;
  angularSpeedAfterImpact?: number;
  impactRetention?: number;
  rotRetention?: number;
  deadZone?: number;
  extraVeryStableDampingApplied?: boolean;
  initialPlacementForce?: number;
  initialLinearDamping?: number;
  initialAngularDamping?: number;
}

export class PhysicsWorld {
  public world: CANNON.World;
  private floorMaterial: CANNON.Material;
  private foundationMaterial: CANNON.Material;
  public records: PhysicsFloorRecord[] = [];
  public currentFallingFloor: PhysicsFloorRecord | null = null;
  private foundationBody: CANNON.Body;
  private constraints: CANNON.Constraint[] = [];
  private foundationConstraint: CANNON.LockConstraint | null = null;
  private foundationConstraintMaxForce: number = 0;
  private foundationConstraintInitializedForProgression: boolean = false;

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, GAME_CONFIG.GRAVITY, 0),
    });

    // Solver configuration: Increase iterations to 20 to ensure high-mass frictional stacking stability
    if ('iterations' in this.world.solver) {
      (this.world.solver as CANNON.GSSolver).iterations = 20;
    }

    // Zero bounce, high friction, stiff contact & friction equations (stone/concrete resistance)
    this.world.defaultContactMaterial.friction = GAME_CONFIG.FLOOR_FRICTION;
    this.world.defaultContactMaterial.restitution = GAME_CONFIG.FLOOR_RESTITUTION;
    this.world.defaultContactMaterial.contactEquationStiffness = 1e8;
    this.world.defaultContactMaterial.contactEquationRelaxation = 3;
    this.world.defaultContactMaterial.frictionEquationStiffness = 1e8;
    this.world.defaultContactMaterial.frictionEquationRelaxation = 3;

    this.floorMaterial = new CANNON.Material('floor');
    this.foundationMaterial = new CANNON.Material('foundation');

    const contactMat = new CANNON.ContactMaterial(
      this.floorMaterial,
      this.floorMaterial,
      {
        friction: GAME_CONFIG.FLOOR_FRICTION,
        restitution: GAME_CONFIG.FLOOR_RESTITUTION, // Strictly zero bounce
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e8,
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
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e8,
        frictionEquationRelaxation: 3,
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

    // Tower Foundation rigid body (matches physical and visual 75% footprint scale)
    const fw = (GAME_CONFIG.BASE_WIDTH * GAME_CONFIG.FOUNDATION_FOOTPRINT_SCALE) / 2;
    const fd = (GAME_CONFIG.BASE_DEPTH * GAME_CONFIG.FOUNDATION_FOOTPRINT_SCALE) / 2;
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
      allowSleep: false, // Do not let Cannon put active falling/sliding floor to sleep!
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
    // Impact Momentum Philosophy (Parts 3 & 4):
    // Floors 1-15:
    // PERFECT: strong impact absorption (~0.50 linear, ~0.45 angular retention)
    // GREAT: good impact absorption (~0.60 linear, ~0.60 angular retention)
    // NORMAL: less absorption (~0.85 linear, ~0.80 angular retention) -> release momentum survives contact!
    // RISKY: minimal absorption (~0.96 linear, ~0.94 angular retention) -> slides outward!
    // High Floors (30+): smooth transition toward ~0.72 linear absorption to prevent chaotic collapse
    body.addEventListener('collide', () => {
      if (record.firstContactTime === null) {
        record.firstContactTime = performance.now();
      }
      // Strictly prevent upward bouncing (restitution = 0)
      if (body.velocity.y > 0) {
        body.velocity.y = 0;
      }

      // Record speeds right before impact retention multiplier
      const hSpeedAtImpact = Math.sqrt(
        body.velocity.x * body.velocity.x + body.velocity.z * body.velocity.z
      );
      const angSpeedAtImpact = body.angularVelocity.length();

      // Estimate initial placement offset against the supporting floor below
      let supX = 0;
      let supZ = 0;
      for (const r of this.records) {
        if (r !== record && r.settled && !r.isDetached) {
          const rTop = r.body.position.y + r.dimensions.height / 2;
          if (rTop <= body.position.y + 0.5) {
            supX = r.body.position.x;
            supZ = r.body.position.z;
          }
        }
      }
      const dx = body.position.x - supX;
      const dz = body.position.z - supZ;
      const distOffset = Math.sqrt(dx * dx + dz * dz);
      const rotOffset = 2 * Math.atan2(Math.abs(body.quaternion.y), Math.abs(body.quaternion.w));
      const contactQuality = evaluatePlacementQuality(distOffset, rotOffset);
      record.placementQuality = contactQuality;

      const retention = getImpactMomentumRetention(contactQuality, id);
      record.impactRetention = retention.linear;
      record.rotRetention = retention.angular;

      body.velocity.x *= retention.linear;
      body.velocity.z *= retention.linear;
      body.angularVelocity.x *= retention.angular;
      body.angularVelocity.y *= retention.angular;
      body.angularVelocity.z *= retention.angular;

      record.horizontalSpeedAtImpact = hSpeedAtImpact;
      record.horizontalSpeedAfterImpact = Math.sqrt(
        body.velocity.x * body.velocity.x + body.velocity.z * body.velocity.z
      );
      record.angularSpeedAtImpact = angSpeedAtImpact;
      record.angularSpeedAfterImpact = body.angularVelocity.length();
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

    // SETTLED FLOOR GRIP & RESIDUAL VELOCITY DEAD-ZONE (Parts 8 & 9):
    for (const rec of this.records) {
      if (rec.settled && !rec.isFrozen && !rec.isDetached) {
        const isDangerous = rec.supportRatio < GAME_CONFIG.STABILIZATION_RISKY_SUPPORT;
        const vx = rec.body.velocity.x;
        const vz = rec.body.velocity.z;
        const hSpeed = Math.sqrt(vx * vx + vz * vz);
        const angSpeed = rec.body.angularVelocity.length();

        const quality = rec.placementQuality || 'NORMAL';
        const w = getEarlySlipStrength(rec.id);

        let deadZoneThresh: number;
        if (isDangerous) {
          deadZoneThresh = 0; // DANGEROUS: zero dead-zone
        } else if (w > 0) {
          let earlyDZ = 0.030;
          if (quality === 'PERFECT' || quality === 'GREAT') {
            earlyDZ = 0.030;
          } else if (quality === 'NORMAL') {
            earlyDZ = 0.008; // 0.8 cm/s: allows visible sliding >= 0.8 cm/s!
          } else {
            // RISKY
            earlyDZ = 0.005; // 0.5 cm/s
          }
          deadZoneThresh = (1.0 - w) * 0.030 + w * earlyDZ;
        } else {
          deadZoneThresh = 0.030;
        }
        rec.deadZone = deadZoneThresh;

        if (hSpeed < deadZoneThresh) {
          // Velocity Dead-Zone: zero out numerical micro-residual noise / sub-pixel drift
          rec.body.velocity.x = 0;
          rec.body.velocity.z = 0;
          if (angSpeed < deadZoneThresh) {
            rec.body.angularVelocity.set(0, 0, 0);
          }
        } else if (rec.supportRatio >= GAME_CONFIG.STABILIZATION_STABLE_SUPPORT) {
          // Well-supported floors get compressive friction resistance against lateral drift
          // For Floors 1-15 (w=1.0), NORMAL and RISKY receive NO extra compressive damping
          // As w transitions from Floor 16 to 35, NORMAL gradually receives compressive grip
          let extraDampingFactor = 0;
          if (quality === 'PERFECT' || quality === 'GREAT') {
            extraDampingFactor = 1.0;
          } else if (quality === 'NORMAL') {
            extraDampingFactor = Math.max(0, 1.0 - w);
          } else if (quality === 'RISKY') {
            extraDampingFactor = w <= 0 ? 0.40 : 0;
          }

          if (extraDampingFactor > 0.05) {
            const dampingFactor = Math.exp(-8.0 * extraDampingFactor * clampedDelta);
            rec.body.velocity.x *= dampingFactor;
            rec.body.velocity.z *= dampingFactor;
            rec.extraVeryStableDampingApplied = true;
          } else {
            rec.extraVeryStableDampingApplied = false;
          }
        }
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
    // For floors with active slip (w > 0.40) and NORMAL/RISKY placements, allow active physical motion to complete
    // before declaring settled, so visible physical sliding/tipping does not get cut short!
    if (firstContactTime !== null) {
      const contactDuration = (now - firstContactTime) / 1000;
      const w = getEarlySlipStrength(this.currentFallingFloor.id);
      const quality = this.currentFallingFloor.placementQuality || 'NORMAL';
      const isEarlyUnsafe = w > 0.40 && (quality === 'NORMAL' || quality === 'RISKY');

      const velThresh = isEarlyUnsafe ? 0.14 : GAME_CONFIG.SETTLING_VELOCITY_THRESH;
      const angThresh = isEarlyUnsafe ? 0.12 : GAME_CONFIG.SETTLING_ANGULAR_THRESH;
      const minDuration = isEarlyUnsafe ? 0.35 : 0.20;
      const minContactTime = isEarlyUnsafe ? 0.70 : GAME_CONFIG.SETTLING_MIN_TIME_S;

      if (linearSpeed < velThresh && angularSpeed < angThresh) {
        this.currentFallingFloor.lowVelocityDuration += delta;
      } else {
        this.currentFallingFloor.lowVelocityDuration = Math.max(
          0,
          this.currentFallingFloor.lowVelocityDuration - delta * 0.5
        );
      }

      // Settled if low velocity sustained for at least minDuration and contact time >= minContactTime
      if (
        contactDuration >= minContactTime &&
        this.currentFallingFloor.lowVelocityDuration >= minDuration
      ) {
        return { settled: true, missed: false, impactSpeed: linearSpeed, tiltAngle };
      }

      // Safety limit: if contact has lasted >= maxTime and floor is resting safely near/above expected support
      const maxTime = isEarlyUnsafe ? 1.50 : GAME_CONFIG.SETTLING_MAX_TIME_S;
      const maxSpeed = isEarlyUnsafe ? 0.22 : 0.65;
      if (
        contactDuration >= maxTime &&
        linearSpeed < maxSpeed &&
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
    currentFloorCount: number,
    placementQuality: PlacementQuality = 'NORMAL'
  ): {
    supportRatio: number;
    status: 'VERY_STABLE' | 'STABLE' | 'RISKY' | 'DANGEROUS';
  } {
    record.settled = true;
    record.placementQuality = placementQuality;
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
    let supW = GAME_CONFIG.BASE_WIDTH * GAME_CONFIG.FOUNDATION_FOOTPRINT_SCALE;
    let supD = GAME_CONFIG.BASE_DEPTH * GAME_CONFIG.FOUNDATION_FOOTPRINT_SCALE;
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

    // Smooth difficulty progression & early grip scaling
    const difficulty = getDifficultyForFloor(currentFloorCount);
    const maxForce = getStabilizationMaxForce(
      status,
      difficulty,
      currentFloorCount,
      supportRatio,
      placementQuality
    );

    if (maxForce > 0) {
      // LockConstraint locks current relative position and rotation (NO SNAPPING OR CENTERING!)
      const lock = new CANNON.LockConstraint(record.body, supBody, { maxForce });
      this.world.addConstraint(lock);
      record.lockConstraint = lock;
      this.constraints.push(lock);
    }

    // Settled Damping scaled by floor progression, placement quality, and support status
    const damping = getSettledDampingForFloor(currentFloorCount, placementQuality, status);
    record.body.linearDamping = damping.linear;
    record.body.angularDamping = damping.angular;

    // Foundation ↔ Floor 1 Connection
    if (record.id === 1) {
      record.initialPlacementForce = maxForce;
      record.initialLinearDamping = damping.linear;
      record.initialAngularDamping = damping.angular;

      // Ensure a LockConstraint exists between Floor 1 and foundationBody.
      // If maxForce was 0 (NORMAL/RISKY in early game), create it with maxForce: 0
      // so it registers the exact resting transform without applying artificial early grip.
      if (!record.lockConstraint) {
        const lock = new CANNON.LockConstraint(record.body, this.foundationBody, { maxForce: 0 });
        this.world.addConstraint(lock);
        record.lockConstraint = lock;
        this.constraints.push(lock);
      }
      this.foundationConstraint = record.lockConstraint;
      this.foundationConstraintMaxForce = maxForce;
    }

    // Update progressive foundation stabilization for the current tower floor count
    this.updateFoundationStabilization(currentFloorCount);

    // Enforce Active Physics Window
    const activeWindowSize = getActivePhysicsWindowSize(currentFloorCount);
    this.enforceActivePhysicsWindow(activeWindowSize);

    // Development-only required debug log (Part 19)
    if (import.meta.env.DEV) {
      const retention = getImpactMomentumRetention(placementQuality, currentFloorCount);
      const slipStrength = getEarlySlipStrength(currentFloorCount);
      const craneSpeedMult = getSpeedMultiplierForFloor(currentFloorCount);
      const craneDiff = getDifficultyForFloor(currentFloorCount);

      const isDangerous = status === 'DANGEROUS';
      const deadZone =
        isDangerous
          ? 0
          : slipStrength > 0
          ? placementQuality === 'PERFECT' || placementQuality === 'GREAT'
            ? 0.030
            : placementQuality === 'NORMAL'
            ? (1.0 - slipStrength) * 0.030 + slipStrength * 0.008
            : (1.0 - slipStrength) * 0.030 + slipStrength * 0.005
          : 0.030;

      const extraVeryStableDampingApplied =
        record.extraVeryStableDampingApplied ??
        ((slipStrength <= 0 || placementQuality === 'PERFECT' || placementQuality === 'GREAT') &&
          supportRatio >= GAME_CONFIG.STABILIZATION_STABLE_SUPPORT);

      console.log('[EarlyGrip]', {
        Floor: currentFloorCount,
        PlacementQuality: placementQuality,
        SupportRatio: Number(supportRatio.toFixed(3)),
        SupportStatus: status,
        EarlySlipStrength: Number(slipStrength.toFixed(3)),
        ImpactRetention: Number((record.impactRetention ?? retention.linear).toFixed(3)),
        AngularRetention: Number((record.rotRetention ?? retention.angular).toFixed(3)),
        ConstraintMaxForce: maxForce === 0 ? 0 : Number(maxForce.toExponential(2)),
        LinearDamping: Number(record.body.linearDamping.toFixed(3)),
        AngularDamping: Number(record.body.angularDamping.toFixed(3)),
        DeadZone: Number(deadZone.toFixed(4)),
        CraneSpeedMult: Number(craneSpeedMult.toFixed(3)),
        CraneDifficulty: Number(craneDiff.toFixed(3)),
        HorizontalSpeedAtImpact: Number((record.horizontalSpeedAtImpact ?? 0).toFixed(3)),
        HorizontalSpeedAfterImpact: Number((record.horizontalSpeedAfterImpact ?? 0).toFixed(3)),
        AngularSpeedAtImpact: Number((record.angularSpeedAtImpact ?? 0).toFixed(3)),
        AngularSpeedAfterImpact: Number((record.angularSpeedAfterImpact ?? 0).toFixed(3)),
        ExtraVeryStableDampingApplied: extraVeryStableDampingApplied,
      });

      // DEV mode FoundationPhysics diagnostics
      const floor1 = this.records.find((r) => r.id === 1);
      const assist = getBaseStabilityAssist(currentFloorCount);
      const constraintActive =
        this.foundationConstraint !== null && this.foundationConstraintMaxForce > 0;
      const constraintMaxForce = this.foundationConstraint ? this.foundationConstraintMaxForce : 0;
      const f1Pos = floor1 ? floor1.body.position : { x: 0, z: 0 };
      const f1Rot = floor1
        ? 2 * Math.atan2(Math.abs(floor1.body.quaternion.y), Math.abs(floor1.body.quaternion.w))
        : 0;
      const topRec = this.records[this.records.length - 1];
      const towerLeanEst =
        topRec && floor1 && topRec !== floor1
          ? Math.sqrt(
              (topRec.body.position.x - f1Pos.x) ** 2 + (topRec.body.position.z - f1Pos.z) ** 2
            )
          : 0;

      console.log('[FoundationPhysics]', {
        TowerFloorCount: currentFloorCount,
        FoundationFootprintScale: GAME_CONFIG.FOUNDATION_FOOTPRINT_SCALE,
        BaseAssistFactor: Number(assist.toFixed(3)),
        ConstraintActive: constraintActive,
        ConstraintMaxForce: constraintMaxForce === 0 ? 0 : Number(constraintMaxForce.toExponential(2)),
        Floor1OffsetX: Number(f1Pos.x.toFixed(3)),
        Floor1OffsetZ: Number(f1Pos.z.toFixed(3)),
        Floor1Rotation: Number(f1Rot.toFixed(3)),
        TowerLeanEstimate: Number(towerLeanEst.toFixed(3)),
      });
    }

    return { supportRatio, status };
  }

  /**
   * Progressive Foundation ↔ Floor 1 Stabilization:
   * Floors 1-15: 0% assistance (full smaller base effect, tower can lean/tip/collapse from bottom).
   * Floors 16-20: Ramp ~5% to ~18%.
   * Floors 21-25: Ramp ~25% to ~65%.
   * Floors 26-30: Ramp ~72% to 100%.
   * Floors 30+: 100% solid anchor (1.2e7 N).
   *
   * CRITICAL:
   * - Only modifies the Foundation ↔ Floor 1 constraint!
   * - Does NOT propagate upward to Floor 2, 3, etc.
   * - Preserves the exact resting transform (position, tilt, rotation) of Floor 1.
   * - No snap, no auto-center, no auto-straighten.
   */
  public updateFoundationStabilization(currentFloorCount: number) {
    if (!this.foundationConstraint) return;

    const floor1 = this.records.find((r) => r.id === 1);
    if (!floor1 || floor1.isDetached) return;

    // If Floor 1 is in DANGEROUS status (<25% support), do not save it
    if (floor1.supportRatio < 0.25) return;

    const assist = getBaseStabilityAssist(currentFloorCount);

    // When assistance first begins at Floor 16, re-anchor constraint to Floor 1's
    // exact achieved transform so that any accumulated early lean is 100% preserved
    // with ZERO snap, jerk, or rotation jump!
    if (currentFloorCount >= 16 && !this.foundationConstraintInitializedForProgression) {
      this.reanchorFoundationConstraint(floor1);
      this.foundationConstraintInitializedForProgression = true;
    }

    const BASE_MAX_ANCHOR_FORCE = 1.2e7; // Firm anchor for 30+ tall towers
    const progressiveForce = assist * BASE_MAX_ANCHOR_FORCE;
    const initialForce = floor1.initialPlacementForce ?? 0;
    const targetForce = Math.max(initialForce, progressiveForce);

    this.foundationConstraintMaxForce = targetForce;
    for (const eq of this.foundationConstraint.equations) {
      eq.maxForce = targetForce;
      eq.minForce = -targetForce;
    }

    // Blend Floor 1 damping smoothly with progression assistance
    if (assist > 0) {
      const initLin = floor1.initialLinearDamping ?? 0.22;
      const initAng = floor1.initialAngularDamping ?? 0.30;
      floor1.body.linearDamping = initLin + assist * (0.85 - initLin);
      floor1.body.angularDamping = initAng + assist * (0.90 - initAng);
    }
  }

  private reanchorFoundationConstraint(floor1: PhysicsFloorRecord) {
    if (this.foundationConstraint) {
      this.world.removeConstraint(this.foundationConstraint);
      const idx = this.constraints.indexOf(this.foundationConstraint);
      if (idx !== -1) this.constraints.splice(idx, 1);
      floor1.lockConstraint = undefined;
      this.foundationConstraint = null;
    }

    // Create fresh LockConstraint capturing Floor 1's exact current transform relative to foundationBody
    const lock = new CANNON.LockConstraint(floor1.body, this.foundationBody, { maxForce: 0 });
    this.world.addConstraint(lock);
    floor1.lockConstraint = lock;
    this.constraints.push(lock);
    this.foundationConstraint = lock;
    this.foundationConstraintMaxForce = 0;
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
   * ACTIVE PHYSICS WINDOW (Part C10):
   * Keeps the newest floors fully dynamic based on activeWindowSize.
   * Older floors below this window become STATIC CANNON bodies with authoritative frozen transforms,
   * perfectly preserving their exact position, crookedness, and rotation,
   * while eliminating jitter compounding, preventing chain-reaction collapse,
   * and ensuring smooth 60fps on mobile for runs of 100-200+ floors!
   */
  public enforceActivePhysicsWindow(customWindowSize?: number) {
    const activeWindowSize =
      customWindowSize || getActivePhysicsWindowSize(this.records.filter((r) => r.settled).length);
    // Only count surviving settled floors for the active window cutoff
    const survivingFloors = this.records.filter((r) => r.settled && !r.isDetached);
    const cutoff = survivingFloors.length - activeWindowSize;
    if (cutoff <= 0) return;

    for (let i = 0; i < cutoff; i++) {
      const rec = survivingFloors[i];
      // Floor 1 is the dynamic anchor to the foundation - it is stabilized via foundationConstraint,
      // never frozen to world-static!
      if (rec.id === 1) continue;

      if (!rec.isFrozen) {
        // A floor may enter the frozen section ONLY if settled === true,
        // and it has already been stable (not falling or sliding significantly).
        const speed = rec.body.velocity.length();
        const angSpeed = rec.body.angularVelocity.length();
        if (rec.settled && speed < 0.25 && angSpeed < 0.25) {
          this.freezeFloor(rec);
        }
      }
    }

    // Boundary floor stabilization:
    // The boundary floor (bottom-most dynamic floor in the active window) rests directly
    // upon the top static floor. Keep its LockConstraint to provide structural anchoring
    // against sliding off the static lower tower, while dampening any numerical jitter.
    const boundaryFloor = survivingFloors[cutoff];
    if (boundaryFloor) {
      if (boundaryFloor.body.velocity.length() < 0.15) {
        boundaryFloor.body.velocity.set(0, 0, 0);
        boundaryFloor.body.angularVelocity.set(0, 0, 0);
      }
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
    this.foundationConstraint = null;
    this.foundationConstraintInitializedForProgression = false;
  }
}

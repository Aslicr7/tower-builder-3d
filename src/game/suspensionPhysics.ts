/**
 * SuspensionPhysics
 * 
 * Causal, inertia-based suspended-load physics simulator.
 * 
 * Physical principles:
 * 1. Load swings because the support point accelerates:
 *    swingAcceleration = -springK * swingOffset - damping * swingVelocity - supportAcceleration * inertiaFactor
 * 
 * 2. When support velocity is constant:
 *    supportAcceleration = 0
 *    Zero new energy is injected. Existing swing dampens smoothly toward vertical.
 * 
 * 3. Rotational inertia:
 *    Yaw rotation is driven by torsion restoring spring and damping, perturbed causally
 *    by lateral accelerations. No autonomous time-based sine wave.
 */

export interface SuspensionState {
  loadX: number;
  loadZ: number;
  loadVelX: number;
  loadVelZ: number;
  swingOffsetX: number;
  swingOffsetZ: number;
  swingVelocityX: number;
  swingVelocityZ: number;
  rollTilt: number;
  pitchTilt: number;
  yawRot: number;
  yawRotVel: number;
  liftY: number;
}

export interface SuspensionConfig {
  springKX: number;
  springKZ: number;
  damping: number;
  inertiaFactor: number;
  rotSpring: number;
  rotDamping: number;
  rotCoupling: number;
  suspensionHeight: number;
  maxSwingDist: number;
  initialAngularOffset?: number;
  zInfluence?: number;
  riggingDir?: number;
  suspensionPlaneBiasZ?: number;
  initialOffsetZ?: number;
  initialVelocityZ?: number;
}

export class SuspensionSimulator {
  public swingOffsetX = 0;
  public swingOffsetZ = 0;
  public swingVelocityX = 0;
  public swingVelocityZ = 0;
  public angularOffsetY = 0;
  public angularVelocityY = 0;

  private config: SuspensionConfig;

  constructor(config: SuspensionConfig) {
    this.config = { ...config };
    this.angularOffsetY = config.initialAngularOffset || 0;
    this.swingOffsetZ = config.initialOffsetZ || 0;
    this.swingVelocityZ = config.initialVelocityZ || 0;
  }

  public reset(
    initialAngularOffset: number = 0,
    initialOffsetZ: number = 0,
    initialVelocityZ: number = 0
  ) {
    this.swingOffsetX = 0;
    this.swingOffsetZ = initialOffsetZ;
    this.swingVelocityX = 0;
    this.swingVelocityZ = initialVelocityZ;
    this.angularOffsetY = initialAngularOffset;
    this.angularVelocityY = 0;
  }

  public updateConfig(partial: Partial<SuspensionConfig>) {
    Object.assign(this.config, partial);
  }

  public step(
    dt: number,
    trolleyX: number,
    trolleyZ: number,
    trolleyVelX: number,
    trolleyVelZ: number,
    trolleyAccX: number,
    trolleyAccZ: number
  ): SuspensionState {
    const stepDt = Math.min(Math.max(dt, 0.001), 0.05);

    const biasZ = this.config.suspensionPlaneBiasZ ?? 0;
    const invNormBias = 1.0 / (1.0 + biasZ * biasZ);

    // Dynamic inertial excitation on the 3D suspension:
    // Trolley traversal acceleration along X projects primarily into X and via the suspension plane orientation into Z.
    // In steady cruise (trolleyAccX = 0), this is 0; during offscreen entry, turnaround, and S-curve modulation it smoothly excites the 3D pendulum.
    const accExtX = -trolleyAccX * invNormBias * this.config.inertiaFactor;
    const accExtZ =
      -trolleyAccX * (biasZ * invNormBias) * this.config.inertiaFactor -
      trolleyAccZ * this.config.inertiaFactor;

    // Cross-axis physical restoring stiffness from rectangular 4-sling attachment & suspension skew:
    // When the load swings along X, the skewed suspension plane and rectangular geometry difference
    // (springKX vs springKZ) naturally exerts a continuous restoring force on Z, and vice versa.
    const crossK =
      this.config.springKX * biasZ * 0.42 +
      (this.config.springKX - this.config.springKZ) * 0.5 * Math.sin(2 * this.angularOffsetY + 0.35);

    // Dynamic acceleration on the suspended module (relative to support point)
    // Primary X axis
    const accX =
      -this.config.springKX * this.swingOffsetX -
      crossK * this.swingOffsetZ -
      this.config.damping * this.swingVelocityX +
      accExtX;

    // Secondary Z axis (depth)
    const accZ =
      -this.config.springKZ * this.swingOffsetZ -
      crossK * this.swingOffsetX -
      this.config.damping * this.swingVelocityZ +
      accExtZ;

    this.swingVelocityX += accX * stepDt;
    this.swingOffsetX += this.swingVelocityX * stepDt;

    this.swingVelocityZ += accZ * stepDt;
    this.swingOffsetZ += this.swingVelocityZ * stepDt;

    // Soft clamp displacement so cable angle does not exceed physical limits
    const curDist = Math.sqrt(this.swingOffsetX * this.swingOffsetX + this.swingOffsetZ * this.swingOffsetZ);
    if (curDist > this.config.maxSwingDist && curDist > 0.0001) {
      const scale = this.config.maxSwingDist / curDist;
      this.swingOffsetX *= scale;
      this.swingOffsetZ *= scale;
      const normX = this.swingOffsetX / this.config.maxSwingDist;
      const normZ = this.swingOffsetZ / this.config.maxSwingDist;
      const vDotN = this.swingVelocityX * normX + this.swingVelocityZ * normZ;
      if (vDotN > 0) {
        this.swingVelocityX -= vDotN * normX;
        this.swingVelocityZ -= vDotN * normZ;
      }
    }

    // Rotational dynamics around vertical Y axis:
    // Torsion restoring spring + damping, perturbed causally by lateral trolley acceleration
    const rotPerturb = trolleyAccX * this.config.rotCoupling;
    const rotAccY =
      -this.config.rotSpring * this.angularOffsetY -
      this.config.rotDamping * this.angularVelocityY +
      rotPerturb;

    this.angularVelocityY += rotAccY * stepDt;
    this.angularOffsetY += this.angularVelocityY * stepDt;

    // Compute visual tilt resulting from cable angle in 3D
    const rollTilt = -this.swingOffsetX / this.config.suspensionHeight;
    const pitchTilt = this.swingOffsetZ / this.config.suspensionHeight;
    const yawRot = this.angularOffsetY;

    // Natural vertical lift due to spherical cable geometry
    const liftY = (this.swingOffsetX * this.swingOffsetX + this.swingOffsetZ * this.swingOffsetZ) / (2 * this.config.suspensionHeight);

    return {
      loadX: trolleyX + this.swingOffsetX,
      loadZ: trolleyZ + this.swingOffsetZ,
      loadVelX: trolleyVelX + this.swingVelocityX,
      loadVelZ: trolleyVelZ + this.swingVelocityZ,
      swingOffsetX: this.swingOffsetX,
      swingOffsetZ: this.swingOffsetZ,
      swingVelocityX: this.swingVelocityX,
      swingVelocityZ: this.swingVelocityZ,
      rollTilt,
      pitchTilt,
      yawRot,
      yawRotVel: this.angularVelocityY,
      liftY,
    };
  }
}

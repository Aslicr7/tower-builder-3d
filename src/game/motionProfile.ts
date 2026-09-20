import { FloorDimensions, FloorModuleStyle } from '../types';
import { getCraneKinematicsForFloor, getDifficultyForFloor, getZInfluenceForFloor } from './difficultyCurve';
import { GAME_CONFIG } from './constants';

/**
 * ModuleMotionProfile
 * Lightweight, bounded per-module motion parameters that eliminate repeatable timing exploits
 * while preserving smooth, readable, and visually predictable physical flight.
 */
export interface ModuleMotionProfile {
  floor: number;
  difficulty: number;
  entrySide: 'LEFT' | 'RIGHT';
  entrySpawnX: number;
  speedMultiplier: number;
  speedVariation: number;
  ampX: number;
  ampZ: number;
  zInfluence: number;
  riggingDir: number;
  rotY: number;
  swingSpringKX: number;
  swingSpringKZ: number;
  swingDamping: number;
  inertiaFactor: number;
  rotSpring: number;
  rotDamping: number;
  rotCoupling: number;
  initialAngularOffset: number;
  suspensionPlaneBiasZ: number;
  initialOffsetZ: number;
  initialVelocityZ: number;
  // Legacy compatibility fields
  freqX: number;
  freqZ: number;
  freqRot: number;
  startPhaseX: number;
  startPhaseZ: number;
  startPhaseRot: number;
  speedModulationAmp: number;
  speedModulationFreq: number;
  speedModulationPhase: number;
  targetEntryX: number;
  targetEntryZ: number;
}

/**
 * Generates a bounded, unique motion profile for a newly spawned module.
 * Stays constant throughout the lifetime of this specific module.
 */
export function createMotionProfile(
  floorNumber: number,
  style: FloorModuleStyle,
  entrySide: 'LEFT' | 'RIGHT' = 'LEFT',
  dims?: FloorDimensions | null,
  customSpawnX?: number
): ModuleMotionProfile {
  const difficulty = getDifficultyForFloor(floorNumber);
  const kinematics = getCraneKinematicsForFloor(floorNumber);

  const ampX = kinematics.ampX;
  const ampZ = kinematics.ampZ;
  const rotY = kinematics.rotY;
  const zInfluence = getZInfluenceForFloor(floorNumber);
  // Deterministic rigging asymmetry direction per delivery (+1 or -1)
  const riggingDir = entrySide === 'LEFT' ? (floorNumber % 2 === 0 ? 1.0 : -1.0) : (floorNumber % 2 === 0 ? -1.0 : 1.0);

  // Floor progression controls subtle parameter variation:
  // Floor 1-5: subtle variation (±5%) to help players learn readability
  // Floor 6-20: moderate variation (±8%)
  // Floor 21+: full variation (±10%)
  const varScale = floorNumber <= 5 ? 0.50 : floorNumber <= 20 ? 0.75 : 1.0;

  // 1. Trolley speed variation: ±6% to ±9%
  const speedVar = 1.0 + (Math.random() - 0.5) * 0.16 * varScale;

  // 2. Physical suspension restoring stiffness and damping
  let baseSpringK = 4.8;
  let baseDamping = 0.32; // Realistic low damping for 50-ton suspended load on 4.8m cables: swings continuously without premature decay
  let inertiaFactor = 1.0;

  // Subtle style nuance (wide/heavy modules have slightly higher damping;
  // open/lighter modules have slightly more responsive spring)
  if (
    style === 'BRUTALIST_CONCRETE' ||
    style === 'CONCRETE_CANTILEVER' ||
    style === 'BRICK_APARTMENT'
  ) {
    baseDamping *= 1.06;
    inertiaFactor = 1.05;
  } else if (
    style === 'GLASS_OFFICE' ||
    style === 'INDUSTRIAL_FRAME' ||
    style === 'BALCONY_GARDEN'
  ) {
    baseSpringK *= 1.04;
    inertiaFactor = 0.96;
  }

  const springKVar = 1.0 + (Math.random() - 0.5) * 0.10 * varScale;
  const swingSpringKX = baseSpringK * springKVar;
  // Detune KZ by ~10% for rectangular sling attachment geometry, enabling natural 3D precession into open ellipses
  const swingSpringKZ = baseSpringK * springKVar * 0.90;
  const dampingVar = 1.0 + (Math.random() - 0.5) * 0.10 * varScale;
  const swingDamping = baseDamping * dampingVar;

  // 3. Rotational suspension parameters
  const rotSpring = 2.8;
  const rotDamping = 1.15;
  const rotCoupling = -0.015 * rotY;
  // Small initial angular offset (±0.025 rad max, ~1.4°) that damps naturally
  const initialAngularOffset = (Math.random() - 0.5) * 0.05 * varScale;

  // 4. Per-load 3D suspension plane bias and initial pendulum state:
  // Chosen ONCE when the module is attached and kept constant throughout its delivery.
  // Alternating base direction with pseudo-random per-module spread guarantees consecutive modules
  // do NOT all trace the same path: some bias +Z, some -Z, some stay near center.
  const baseSign = ((floorNumber * 3 + (entrySide === 'LEFT' ? 1 : 2)) % 2 === 0) ? 1.0 : -1.0;
  const biasSpread = 0.45 + Math.random() * 0.70; // Bounded spread ~0.45 to 1.15
  const suspensionPlaneBiasZ = zInfluence * baseSign * biasSpread;

  // Initial 3D pendulum state at delivery attachment:
  const initialOffsetZ = suspensionPlaneBiasZ * 0.65;
  const initialVelocityZ = suspensionPlaneBiasZ * 0.35 * (entrySide === 'LEFT' ? 1.0 : -1.0);

  // 5. Entry spawn coordinate (guaranteed off-screen)
  const defaultSpawnX = entrySide === 'LEFT' ? -16.0 : 15.0;
  const entrySpawnX = customSpawnX !== undefined ? customSpawnX : defaultSpawnX;

  const baseSpeed = GAME_CONFIG.CRANE_MIN_SPEED * kinematics.speedMult;
  const freqX = baseSpeed * speedVar;
  const freqZ = baseSpeed * speedVar * 0.73;
  const freqRot = baseSpeed * speedVar * 0.59;
  const startPhaseX = entrySide === 'LEFT' ? -Math.PI / 2 : Math.PI / 2;
  const startPhaseZ = -Math.PI / 2;
  const startPhaseRot = 0;

  return {
    floor: floorNumber,
    difficulty,
    entrySide,
    entrySpawnX,
    speedMultiplier: kinematics.speedMult,
    speedVariation: speedVar,
    ampX,
    ampZ,
    zInfluence,
    riggingDir,
    rotY,
    swingSpringKX,
    swingSpringKZ,
    swingDamping,
    inertiaFactor,
    rotSpring,
    rotDamping,
    rotCoupling,
    initialAngularOffset,
    suspensionPlaneBiasZ,
    initialOffsetZ,
    initialVelocityZ,
    freqX,
    freqZ,
    freqRot,
    startPhaseX,
    startPhaseZ,
    startPhaseRot,
    speedModulationAmp: 0,
    speedModulationFreq: 0,
    speedModulationPhase: 0,
    targetEntryX: entrySpawnX,
    targetEntryZ: 0,
  };
}

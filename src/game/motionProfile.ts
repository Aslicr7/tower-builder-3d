import { FloorDimensions, FloorModuleStyle } from '../types';
import { getCraneKinematicsForFloor, getDifficultyForFloor } from './difficultyCurve';
import { GAME_CONFIG } from './constants';

/**
 * ModuleMotionProfile
 * Lightweight, bounded per-module motion parameters that eliminate repeatable timing exploits
 * while preserving smooth, readable, and visually predictable physical flight.
 */
export interface ModuleMotionProfile {
  floor: number;
  difficulty: number;
  speedMultiplier: number;
  freqX: number;
  freqZ: number;
  freqRot: number;
  startPhaseX: number;
  startPhaseZ: number;
  startPhaseRot: number;
  swingSpringKX: number;
  swingSpringKZ: number;
  swingDamping: number;
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
  dims?: FloorDimensions | null
): ModuleMotionProfile {
  const difficulty = getDifficultyForFloor(floorNumber);
  const kinematics = getCraneKinematicsForFloor(floorNumber);

  // Baseline speed from difficulty curve
  const baseSpeed = GAME_CONFIG.CRANE_MIN_SPEED * kinematics.speedMult;
  const ampX = kinematics.ampX;
  const ampZ = kinematics.ampZ;

  // Floor progression controls variation bandwidth:
  // Floor 1-5: subtle variation (±6%) to help players learn readability without fixed timing
  // Floor 6-20: moderate variation (±9%)
  // Floor 21+: full variation (±12%)
  const varScale = floorNumber <= 5 ? 0.65 : floorNumber <= 20 ? 0.85 : 1.0;

  // 1. Trolley speed variation: ±8% to ±11%
  const speedVar = 1.0 + (Math.random() - 0.5) * 0.20 * varScale;
  const finalSpeed = baseSpeed * speedVar;

  // 2. Multi-frequency motion with incommensurable frequency ratios:
  // X frequency: ratio ~1.00 (±7%)
  const xRatio = 1.0 + (Math.random() - 0.5) * 0.14 * varScale;
  const freqX = finalSpeed * xRatio;

  // Z frequency: ratio ~0.73 (±8%) - non-harmonic with X to prevent simple Lissajous repeat
  const zRatio = 0.73 * (1.0 + (Math.random() - 0.5) * 0.16 * varScale);
  const freqZ = finalSpeed * zRatio;

  // Rotation frequency: ratio ~0.59 (±10%) - independent rotational rhythm
  let rotRatio = 0.59 * (1.0 + (Math.random() - 0.5) * 0.20 * varScale);

  // 3. Physical suspension pendulum response (stiffness and damping)
  let baseSpringK = 5.2;
  let baseDamping = 1.35;

  // Subtle style nuance (wide/heavy modules have slightly slower rotation and higher damping;
  // open/lighter modules have slightly more responsive swing)
  if (
    style === 'BRUTALIST_CONCRETE' ||
    style === 'CONCRETE_CANTILEVER' ||
    style === 'BRICK_APARTMENT'
  ) {
    rotRatio *= 0.93;
    baseDamping *= 1.06;
  } else if (
    style === 'GLASS_OFFICE' ||
    style === 'INDUSTRIAL_FRAME' ||
    style === 'BALCONY_GARDEN'
  ) {
    baseSpringK *= 1.05;
  } else if (dims && dims.width > 4.5) {
    rotRatio *= 0.95;
  }

  const freqRot = finalSpeed * rotRatio;

  const springKVar = 1.0 + (Math.random() - 0.5) * 0.14 * varScale;
  const swingSpringKX = baseSpringK * springKVar;
  // Slight asymmetry between X and Z pendulums prevents synchronized planar lock
  const swingSpringKZ = baseSpringK * springKVar * 0.94;
  const dampingVar = 1.0 + (Math.random() - 0.5) * 0.14 * varScale;
  const swingDamping = baseDamping * dampingVar;

  // 4. Starting phase offsets for continuous, non-snapping delivery handoff:
  // X: Handing off from negative X travel (pickupX = 15.5m -> center).
  // phase around Math.PI keeps cos(phase) < 0 (continuation of leftward motion!).
  const xPhaseOffset = (Math.random() - 0.5) * 0.90 * varScale; // ±0.45 rad max
  const startPhaseX = Math.PI + xPhaseOffset;
  const targetEntryX = Math.sin(startPhaseX) * ampX;

  // Z: Handing off from positive Z travel (pickupZ = -3.5m -> center).
  // phase around -Math.PI/2 keeps sin(phase) < 0, so -sin(phase) > 0 (continuation of forward motion!).
  const zPhaseOffset = (Math.random() - 0.5) * 1.10 * varScale; // ±0.55 rad max
  const startPhaseZ = -Math.PI / 2 + zPhaseOffset;
  const targetEntryZ = Math.cos(startPhaseZ) * ampZ;

  // Rotation: independent random starting phase (0 to 2*PI)
  const startPhaseRot = (Math.random() - 0.5) * 2 * Math.PI;

  // 5. Very subtle slow speed modulation (±3% over ~28-36s wave) to eliminate long-term timer counting
  const speedModulationAmp = 0.032 * varScale;
  const speedModulationFreq = 0.22 + (Math.random() - 0.5) * 0.05;
  const speedModulationPhase = Math.random() * 2 * Math.PI;

  return {
    floor: floorNumber,
    difficulty,
    speedMultiplier: speedVar * kinematics.speedMult,
    freqX,
    freqZ,
    freqRot,
    startPhaseX,
    startPhaseZ,
    startPhaseRot,
    swingSpringKX,
    swingSpringKZ,
    swingDamping,
    speedModulationAmp,
    speedModulationFreq,
    speedModulationPhase,
    targetEntryX,
    targetEntryZ,
  };
}

/**
 * Shared difficulty curve and physics parameters for Tower Builder.
 * 
 * Target progression:
 * Floor 1–5:   Very Forgiving
 * Floor 6–10:  Forgiving
 * Floor 11–20: Normal / Learning
 * Floor 21–30: Challenging but Recoverable
 * Floor 31–40: Hard
 * Floor 41–50: Very Hard
 * Floor 50+:   Endless High Difficulty (capped, no infinite acceleration)
 */

import { PlacementQuality } from '../types';
import { GAME_CONFIG } from './constants';

export interface DifficultyKnot {
  floor: number;
  difficulty: number;
  speedMult: number;
  ampX: number;
  ampZ: number;
  rotY: number;
  swayFactor: number;
  linearMomentum: number;
  angularMomentum: number;
}

/**
 * Key difficulty calibration knots (interpolated smoothly):
 * Tuned to meet Part B exact speed multiplier and difficulty targets:
 * Floor 1:   diff 0.08, speed 1.00x, ampX 1.70m, ampZ 0.12m, rotY 0.04 rad, linear 0.42, angular 0.20
 * Floor 5:   diff 0.11, speed 1.05x, ampX 1.75m, ampZ 0.16m, rotY 0.06 rad, linear 0.45, angular 0.22
 * Floor 10:  diff 0.17, speed 1.10x, ampX 1.85m, ampZ 0.22m, rotY 0.08 rad, linear 0.48, angular 0.25
 * Floor 15:  diff 0.23, speed 1.18x, ampX 1.98m, ampZ 0.35m, rotY 0.11 rad, linear 0.51, angular 0.28
 * Floor 20:  diff 0.30, speed 1.32x, ampX 2.15m, ampZ 0.55m, rotY 0.15 rad, linear 0.55, angular 0.32
 * Floor 25:  diff 0.37, speed 1.55x, ampX 2.32m, ampZ 0.75m, rotY 0.20 rad, linear 0.60, angular 0.35
 * Floor 30:  diff 0.45, speed 1.75x, ampX 2.55m, ampZ 0.95m, rotY 0.26 rad, linear 0.64, angular 0.38
 * Floor 35:  diff 0.54, speed 1.90x, ampX 2.72m, ampZ 1.15m, rotY 0.32 rad, linear 0.68, angular 0.41
 * Floor 40:  diff 0.64, speed 2.05x, ampX 2.92m, ampZ 1.35m, rotY 0.38 rad, linear 0.72, angular 0.44
 * Floor 45:  diff 0.74, speed 2.18x, ampX 3.10m, ampZ 1.50m, rotY 0.43 rad, linear 0.75, angular 0.46
 * Floor 50:  diff 0.83, speed 2.30x, ampX 3.28m, ampZ 1.65m, rotY 0.48 rad, linear 0.78, angular 0.48
 * Floor 55:  diff 0.90, speed 2.40x, ampX 3.38m, ampZ 1.72m, rotY 0.50 rad, linear 0.81, angular 0.50
 * Floor 60:  diff 0.95, speed 2.50x, ampX 3.46m, ampZ 1.78m, rotY 0.52 rad, linear 0.83, angular 0.52
 * Floor 65:  diff 0.98, speed 2.58x, ampX 3.52m, ampZ 1.82m, rotY 0.54 rad, linear 0.85, angular 0.53
 * Floor 70+: diff 1.00, speed 2.65x, ampX 3.58m, ampZ 1.86m, rotY 0.55 rad, linear 0.86, angular 0.55
 */
export const DIFFICULTY_KNOTS: DifficultyKnot[] = [
  { floor: 1,  difficulty: 0.08, speedMult: 1.08, ampX: 1.70, ampZ: 0.12, rotY: 0.04, swayFactor: 0.020, linearMomentum: 0.42, angularMomentum: 0.20 },
  { floor: 5,  difficulty: 0.12, speedMult: 1.33, ampX: 1.75, ampZ: 0.16, rotY: 0.06, swayFactor: 0.022, linearMomentum: 0.45, angularMomentum: 0.22 },
  { floor: 10, difficulty: 0.18, speedMult: 1.73, ampX: 1.85, ampZ: 0.22, rotY: 0.08, swayFactor: 0.025, linearMomentum: 0.48, angularMomentum: 0.25 },
  { floor: 15, difficulty: 0.25, speedMult: 2.08, ampX: 1.98, ampZ: 0.35, rotY: 0.11, swayFactor: 0.029, linearMomentum: 0.52, angularMomentum: 0.28 },
  { floor: 20, difficulty: 0.32, speedMult: 2.26, ampX: 2.15, ampZ: 0.55, rotY: 0.15, swayFactor: 0.035, linearMomentum: 0.56, angularMomentum: 0.32 },
  { floor: 25, difficulty: 0.40, speedMult: 2.38, ampX: 2.35, ampZ: 0.75, rotY: 0.20, swayFactor: 0.042, linearMomentum: 0.60, angularMomentum: 0.35 },
  { floor: 30, difficulty: 0.48, speedMult: 2.45, ampX: 2.55, ampZ: 0.95, rotY: 0.26, swayFactor: 0.050, linearMomentum: 0.64, angularMomentum: 0.38 },
  { floor: 35, difficulty: 0.56, speedMult: 2.48, ampX: 2.75, ampZ: 1.15, rotY: 0.32, swayFactor: 0.058, linearMomentum: 0.68, angularMomentum: 0.41 },
  { floor: 40, difficulty: 0.65, speedMult: 2.50, ampX: 2.95, ampZ: 1.35, rotY: 0.38, swayFactor: 0.065, linearMomentum: 0.72, angularMomentum: 0.44 },
  { floor: 45, difficulty: 0.74, speedMult: 2.52, ampX: 3.12, ampZ: 1.50, rotY: 0.43, swayFactor: 0.070, linearMomentum: 0.75, angularMomentum: 0.46 },
  { floor: 50, difficulty: 0.83, speedMult: 2.53, ampX: 3.30, ampZ: 1.65, rotY: 0.48, swayFactor: 0.075, linearMomentum: 0.78, angularMomentum: 0.48 },
  { floor: 55, difficulty: 0.89, speedMult: 2.54, ampX: 3.40, ampZ: 1.72, rotY: 0.50, swayFactor: 0.078, linearMomentum: 0.81, angularMomentum: 0.50 },
  { floor: 60, difficulty: 0.94, speedMult: 2.545, ampX: 3.48, ampZ: 1.78, rotY: 0.52, swayFactor: 0.080, linearMomentum: 0.83, angularMomentum: 0.52 },
  { floor: 65, difficulty: 0.97, speedMult: 2.55, ampX: 3.54, ampZ: 1.82, rotY: 0.54, swayFactor: 0.082, linearMomentum: 0.85, angularMomentum: 0.53 },
  { floor: 70, difficulty: 1.00, speedMult: 2.55, ampX: 3.58, ampZ: 1.86, rotY: 0.55, swayFactor: 0.085, linearMomentum: 0.86, angularMomentum: 0.55 },
];

/**
 * Exact target speed progression for early game:
 * Floor 1  = 1.08x
 * Floor 2  = 1.13x
 * Floor 3  = 1.18x
 * Floor 4  = 1.25x
 * Floor 5  = 1.33x
 * Floor 6  = 1.41x
 * Floor 7  = 1.49x
 * Floor 8  = 1.57x
 * Floor 9  = 1.65x
 * Floor 10 = 1.73x
 * Floor 11 = 1.80x
 * Floor 12 = 1.87x
 * Floor 13 = 1.94x
 * Floor 14 = 2.01x
 * Floor 15 = 2.08x
 */
export const EARLY_SPEED_TABLE: Record<number, number> = {
  1: 1.08,
  2: 1.13,
  3: 1.18,
  4: 1.25,
  5: 1.33,
  6: 1.41,
  7: 1.49,
  8: 1.57,
  9: 1.65,
  10: 1.73,
  11: 1.80,
  12: 1.87,
  13: 1.94,
  14: 2.01,
  15: 2.08,
};

/**
 * Calculates the authoritative, strictly monotonic speed multiplier based on the placed floor count.
 * Single source of truth — NO double speed multiplier.
 * Smoothly transitions Floor 15 (2.08x) into Floor 16 (2.13x) and connects to late-game curve.
 */
export function getSpeedMultiplierForFloor(floorNumber: number): number {
  if (floorNumber <= 1) return 1.08;

  // Exact target speed progression for Floors 1–15
  if (floorNumber <= 15) {
    const fLow = Math.floor(floorNumber);
    const fHigh = Math.ceil(floorNumber);
    if (fLow === fHigh) {
      return EARLY_SPEED_TABLE[fLow] ?? 1.08;
    }
    const vLow = EARLY_SPEED_TABLE[fLow] ?? 1.08;
    const vHigh = EARLY_SPEED_TABLE[fHigh] ?? 2.08;
    return vLow + (floorNumber - fLow) * (vHigh - vLow);
  }

  // Floor 15 -> 16 smooth transition (+0.05 step to 2.13x)
  if (floorNumber <= 16) {
    return 2.08 + (floorNumber - 15) * (2.13 - 2.08);
  }

  // Floors 16–20: smooth transition into later game (2.13x -> 2.26x)
  if (floorNumber <= 20) {
    return 2.13 + (floorNumber - 16) * ((2.26 - 2.13) / 4);
  }

  // Floors 20–25: smooth progression (2.26x -> 2.38x)
  if (floorNumber <= 25) {
    return 2.26 + (floorNumber - 20) * ((2.38 - 2.26) / 5);
  }

  // Floors 25–30: smooth progression (2.38x -> 2.45x)
  if (floorNumber <= 30) {
    return 2.38 + (floorNumber - 25) * ((2.45 - 2.38) / 5);
  }

  // Floors 30+: Progressively diminishing growth rate approaching soft cap of 2.55x.
  // Maintains C^1 continuity with preceding slope (0.014/floor).
  const s30 = 2.45;
  const sCap = 2.55;
  const k = 0.014 / (sCap - s30); // 0.14
  const m = floorNumber - 30;
  return sCap - (sCap - s30) * Math.exp(-k * m);
}

/**
 * Returns interpolated DifficultyKnot for any floor number.
 */
export function getDifficultyKnotForFloor(floorNumber: number): DifficultyKnot {
  const speedMult = getSpeedMultiplierForFloor(floorNumber);

  if (floorNumber <= DIFFICULTY_KNOTS[0].floor) {
    return {
      ...DIFFICULTY_KNOTS[0],
      speedMult,
    };
  }
  const lastKnot = DIFFICULTY_KNOTS[DIFFICULTY_KNOTS.length - 1];
  if (floorNumber >= lastKnot.floor) {
    return {
      ...lastKnot,
      floor: floorNumber,
      speedMult,
    };
  }

  for (let i = 0; i < DIFFICULTY_KNOTS.length - 1; i++) {
    const k0 = DIFFICULTY_KNOTS[i];
    const k1 = DIFFICULTY_KNOTS[i + 1];
    if (floorNumber >= k0.floor && floorNumber <= k1.floor) {
      const rawT = (floorNumber - k0.floor) / (k1.floor - k0.floor);
      // Smooth interpolation
      const t = rawT * rawT * (3 - 2 * rawT);
      return {
        floor: floorNumber,
        difficulty: k0.difficulty + t * (k1.difficulty - k0.difficulty),
        speedMult,
        ampX: k0.ampX + t * (k1.ampX - k0.ampX),
        ampZ: k0.ampZ + t * (k1.ampZ - k0.ampZ),
        rotY: k0.rotY + t * (k1.rotY - k0.rotY),
        swayFactor: k0.swayFactor + t * (k1.swayFactor - k0.swayFactor),
        linearMomentum: k0.linearMomentum + t * (k1.linearMomentum - k0.linearMomentum),
        angularMomentum: k0.angularMomentum + t * (k1.angularMomentum - k0.angularMomentum),
      };
    }
  }

  return {
    ...lastKnot,
    floor: floorNumber,
    speedMult,
  };
}

/**
 * Returns normalized difficulty [0.08, 1.00] for a given floor number.
 */
export function getDifficultyForFloor(floorNumber: number): number {
  return getDifficultyKnotForFloor(floorNumber).difficulty;
}

/**
 * Authoritative Z-influence factor for 3D suspended load dynamics.
 * Represents the relative secondary-axis (Z depth) coupling/amplitude relative to primary X traversal.
 * 
 * Target progression:
 * Floor 1 = 0.05
 * Floor 2 = 0.07
 * Floor 3 = 0.10
 * Floor 4 = 0.14
 * Floor 5 = 0.18
 * Floor 6 = 0.22
 * Floor 7 = 0.27
 * Floor 8 = 0.32
 * Floor 1 = 0.12
 * Floor 2 = 0.15
 * Floor 5 = 0.26
 * Floor 10 = 0.48
 * Floors 11–15: smoothly approach ~0.54
 * Floors 16–25: smoothly approach ~0.60
 * Floors 25+: soft-capped at 0.60 to remain skill-based, readable, and bounded.
 */
export function getZInfluenceForFloor(floorNumber: number): number {
  if (floorNumber <= 1) return 0.12;
  if (floorNumber === 2) return 0.15;
  if (floorNumber === 3) return 0.18;
  if (floorNumber === 4) return 0.22;
  if (floorNumber === 5) return 0.26;
  if (floorNumber === 6) return 0.31;
  if (floorNumber === 7) return 0.36;
  if (floorNumber === 8) return 0.40;
  if (floorNumber === 9) return 0.44;
  if (floorNumber === 10) return 0.48;
  if (floorNumber <= 15) {
    return 0.48 + (floorNumber - 10) * ((0.54 - 0.48) / 5);
  }
  if (floorNumber <= 25) {
    return 0.54 + (floorNumber - 15) * ((0.60 - 0.54) / 10);
  }
  return 0.60;
}

/**
 * Returns crane kinematics parameters for a given floor number.
 */
export function getCraneKinematicsForFloor(floorNumber: number): {
  speedMult: number;
  ampX: number;
  ampZ: number;
  zInfluence: number;
  rotY: number;
  swayFactor: number;
} {
  const knot = getDifficultyKnotForFloor(floorNumber);
  const zInfluence = getZInfluenceForFloor(floorNumber);
  return {
    speedMult: knot.speedMult,
    ampX: knot.ampX,
    ampZ: knot.ampZ,
    zInfluence,
    rotY: knot.rotY,
    swayFactor: knot.swayFactor,
  };
}

/**
 * Returns linear and angular crane momentum transfer multipliers.
 */
export function getReleaseMomentumMultipliers(floorNumber: number): {
  linear: number;
  angular: number;
  difficulty: number;
} {
  const knot = getDifficultyKnotForFloor(floorNumber);
  return {
    linear: knot.linearMomentum,
    angular: knot.angularMomentum,
    difficulty: knot.difficulty,
  };
}

export type StabilizationStatus = 'VERY_STABLE' | 'STABLE' | 'RISKY' | 'DANGEROUS';

/**
 * Authoritative Drop Height Multiplier progression across floors:
 * Floors 1–2: 2.25x
 * Floor 3: 2.23x, Floor 4: 2.20x, Floor 5: 2.18x
 * Floor 6: 2.15x, Floor 7: 2.13x, Floor 8: 2.10x, Floor 9: 2.08x, Floor 10: 2.05x
 * Floor 11: 2.02x, Floor 12: 1.99x, Floor 13: 1.96x, Floor 14: 1.93x, Floor 15: 1.90x
 * Floor 16: 1.87x, Floor 17: 1.84x, Floor 18: 1.81x, Floor 19: 1.78x, Floor 20: 1.75x
 * Floor 21: 1.72x, Floor 22: 1.69x, Floor 23: 1.66x, Floor 24: 1.63x, Floor 25: 1.60x
 * Floor 30: 1.58x, Floor 35: 1.56x, Floor 40: 1.54x, Floor 50: 1.52x, Floor 60: 1.50x, Floor 70: 1.48x, Floor 80+: 1.47x (soft-cap)
 * High floors maintain a substantial vertical gap (1.47x - 1.60x) and never return to 1.00x.
 */
export const DROP_HEIGHT_KEYFRAMES: Record<number, number> = {
  1: 2.25,
  2: 2.25,
  3: 2.23,
  4: 2.20,
  5: 2.18,
  6: 2.15,
  7: 2.13,
  8: 2.10,
  9: 2.08,
  10: 2.05,
  11: 2.02,
  12: 1.99,
  13: 1.96,
  14: 1.93,
  15: 1.90,
  16: 1.87,
  17: 1.84,
  18: 1.81,
  19: 1.78,
  20: 1.75,
  21: 1.72,
  22: 1.69,
  23: 1.66,
  24: 1.63,
  25: 1.60,
  30: 1.58,
  35: 1.56,
  40: 1.54,
  50: 1.52,
  60: 1.50,
  70: 1.48,
  80: 1.47,
};

export function getDropHeightMultiplierForFloor(floorNumber: number): number {
  if (floorNumber <= 1) return 2.25;
  if (floorNumber >= 80) return 1.47;

  const fLow = Math.floor(floorNumber);
  const fHigh = Math.ceil(floorNumber);
  if (fLow === fHigh && DROP_HEIGHT_KEYFRAMES[fLow] !== undefined) {
    return DROP_HEIGHT_KEYFRAMES[fLow];
  }

  const keys = Object.keys(DROP_HEIGHT_KEYFRAMES)
    .map(Number)
    .sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i];
    const k1 = keys[i + 1];
    if (floorNumber >= k0 && floorNumber <= k1) {
      const t = (floorNumber - k0) / (k1 - k0);
      return DROP_HEIGHT_KEYFRAMES[k0] + t * (DROP_HEIGHT_KEYFRAMES[k1] - DROP_HEIGHT_KEYFRAMES[k0]);
    }
  }

  return 1.47;
}

export function getActualDropDistanceForFloor(floorNumber: number): number {
  return GAME_CONFIG.CRANE_CLEARANCE * getDropHeightMultiplierForFloor(floorNumber);
}

/**
 * Authoritative placement quality evaluator matching GAME_CONFIG scoring thresholds.
 * Evaluates placement offset and rotation against the supporting floor/foundation.
 */
export function evaluatePlacementQuality(
  distOffset: number,
  rotOffset: number,
  tiltAngle: number = 0
): PlacementQuality {
  if (
    distOffset < GAME_CONFIG.PERFECT_THRESHOLD_DIST &&
    rotOffset < GAME_CONFIG.PERFECT_THRESHOLD_ROT
  ) {
    return 'PERFECT';
  } else if (distOffset < GAME_CONFIG.GREAT_THRESHOLD_DIST) {
    return 'GREAT';
  } else if (distOffset > 1.6 || tiltAngle > 0.45) {
    return 'RISKY';
  } else {
    return 'NORMAL';
  }
}

/**
 * Reference target feel table for EarlySlipStrength across Floors 1–35.
 * Floors 1–15: 1.00 (full early-game slip penalty on inaccurate drops)
 * Floors 16–20: 0.98 -> 0.88 (still fairly slippery, sliding remains active)
 * Floors 21–25: 0.82 -> 0.52 (gradual transition, structural grip starts returning)
 * Floors 26–35: 0.44 -> 0.00 (progressively restore structural stability)
 * Floors 35+: 0.00 (intentional early-game slippery penalty is fully faded; standard high-tower model)
 */
export const EARLY_SLIP_TARGET_TABLE: Record<number, number> = {
  1: 1.00,
  5: 1.00,
  10: 1.00,
  15: 1.00,
  16: 0.98,
  17: 0.96,
  18: 0.94,
  19: 0.91,
  20: 0.88,
  21: 0.82,
  22: 0.75,
  23: 0.68,
  24: 0.60,
  25: 0.52,
  26: 0.44,
  27: 0.37,
  28: 0.31,
  29: 0.26,
  30: 0.21,
  31: 0.16,
  32: 0.12,
  33: 0.08,
  34: 0.04,
  35: 0.00,
};

/**
 * Computes EarlySlipStrength w(floorNumber).
 * Smoothly interpolates across the target feel table with no discontinuities at 15->16, 20->21, 25->26, or 35->36.
 */
export function getEarlySlipStrength(floorNumber: number): number {
  if (floorNumber <= 15) return 1.0;
  if (floorNumber >= 35) return 0.0;

  const fLow = Math.floor(floorNumber);
  const fHigh = Math.ceil(floorNumber);
  if (fLow === fHigh) {
    return EARLY_SLIP_TARGET_TABLE[fLow] ?? 0.0;
  }
  const vLow = EARLY_SLIP_TARGET_TABLE[fLow] ?? 0.0;
  const vHigh = EARLY_SLIP_TARGET_TABLE[fHigh] ?? 0.0;
  const frac = floorNumber - fLow;
  return vLow + frac * (vHigh - vLow);
}

/**
 * Alias for backward compatibility.
 */
export const getEarlyGripWindowFactor = getEarlySlipStrength;

/**
 * Computes the effective early grip factor for a given placement quality and floor number.
 *
 * Target FEEL during Floors 1-15:
 * - PERFECT:   100% of normal safe assistance
 * - GREAT:     85% safe assistance
 * - NORMAL:    0% LockConstraint early
 * - RISKY:     0% LockConstraint early
 * - DANGEROUS: 0% at all floors
 *
 * Fades smoothly toward 100% for non-dangerous placements above Floor 15 up to Floor 35.
 */
export function getEarlyGripFactor(
  quality: PlacementQuality,
  floorNumber: number,
  status?: StabilizationStatus
): number {
  if (status === 'DANGEROUS') {
    return 0.0;
  }

  const w = getEarlySlipStrength(floorNumber);
  if (w <= 0) {
    return 1.0;
  }

  const qualityAssistance =
    quality === 'PERFECT' ? 1.0 : quality === 'GREAT' ? 0.85 : 0.0;

  return (1.0 - w) * 1.0 + w * qualityAssistance;
}

/**
 * Returns impact momentum retention multipliers (first contact damping).
 * For Floors 1-15 (Target feel per Part D):
 * - PERFECT:   horizontal momentum retention ≈ 0.55, angular ≈ 0.50
 * - GREAT:     horizontal ≈ 0.68, angular ≈ 0.65
 * - NORMAL:    horizontal ≈ 0.90, angular ≈ 0.86 (release momentum survives contact!)
 * - RISKY:     horizontal ≈ 0.98, angular ≈ 0.96 (slides outward easily!)
 * - DANGEROUS: horizontal ≈ 1.00, angular ≈ 0.99 (zero artificial damping)
 *
 * Smoothly transitions from Floor 16 to 35 into baseline high-tower continuous impact damping.
 */
export function getImpactMomentumRetention(
  quality: PlacementQuality,
  floorNumber: number,
  status?: StabilizationStatus
): { linear: number; angular: number } {
  // Baseline high-tower continuous impact damping
  const tImpact = Math.min(Math.max((floorNumber - 1) / 49, 0), 1.0);
  const baseLat = 0.90 - tImpact * (0.90 - 0.72);
  const baseRot = 0.82 - tImpact * (0.82 - 0.55);

  let highLat = baseLat;
  let highRot = baseRot;
  if (quality === 'PERFECT') {
    highLat = Math.max(0.40, baseLat - 0.15);
    highRot = Math.max(0.35, baseRot - 0.15);
  } else if (quality === 'GREAT') {
    highLat = Math.max(0.50, baseLat - 0.08);
    highRot = Math.max(0.45, baseRot - 0.08);
  } else if (quality === 'RISKY') {
    highLat = Math.min(0.92, baseLat + 0.08);
    highRot = Math.min(0.85, baseRot + 0.08);
  }

  const w = getEarlySlipStrength(floorNumber);
  if (w <= 0) {
    return { linear: highLat, angular: highRot };
  }

  let targetLat: number;
  let targetRot: number;

  if (status === 'DANGEROUS') {
    targetLat = 1.00;
    targetRot = 0.99;
  } else {
    switch (quality) {
      case 'PERFECT':
        targetLat = 0.55;
        targetRot = 0.50;
        break;
      case 'GREAT':
        targetLat = 0.68;
        targetRot = 0.65;
        break;
      case 'NORMAL':
        targetLat = 0.90;
        targetRot = 0.86;
        break;
      case 'RISKY':
        targetLat = 0.98;
        targetRot = 0.96;
        break;
    }
  }

  const linear = (1.0 - w) * highLat + w * targetLat;
  const angular = (1.0 - w) * highRot + w * targetRot;
  return { linear, angular };
}

/**
 * Computes the LockConstraint maxForce dynamically based on placement status, support ratio,
 * floor progression, and placement quality.
 *
 * Reverse Assistance & Early-Game Philosophy (Parts 11 & 15, and Part E):
 * - DANGEROUS (<25% support): Strictly 0 at ALL floors. Real physics dictates collapse.
 * - PERFECT: limited stabilization allowed (provided supportRatio >= 0.25).
 * - GREAT: small/moderate stabilization allowed (provided supportRatio >= 0.25).
 * - NORMAL (Floors 1-15): STRICTLY ZERO LockConstraint (maxForce = 0).
 * - RISKY (Floors 1-15): STRICTLY ZERO LockConstraint (maxForce = 0).
 * - SUPPORT GEOMETRY ALWAYS WINS: Even PERFECT/GREAT cannot override genuinely poor physical support (<35% support).
 * - NORMAL (Floors 16-20): Still little or no LockConstraint (w=0.98..0.88).
 * - NORMAL (Floors 21-25): Small assistance begins returning (w=0.82..0.52).
 * - NORMAL (Floors 26-35): Progressively restore reasonable stabilization (w=0.44..0.00).
 * - NORMAL (Floor 35+): Normal high-tower support-aware stabilization.
 */
export function getStabilizationMaxForce(
  status: StabilizationStatus,
  difficulty: number,
  floorNumber: number,
  supportRatio?: number,
  quality: PlacementQuality = 'NORMAL'
): number {
  // Geometric support strictly overrides safety!
  // If supportRatio < 0.25 (or DANGEROUS status): ZERO LockConstraint at all floors!
  if (status === 'DANGEROUS' || (supportRatio !== undefined && supportRatio < 0.25)) {
    return 0;
  }

  const w = getEarlySlipStrength(floorNumber);

  // Baseline high-tower force calculation:
  const t = Math.min(Math.max((floorNumber - 1) / 49, 0), 1.0);
  const progressFactor = floorNumber >= 50 ? 1.0 : 0.83 + 0.17 * Math.pow(t, 0.85);

  let highTowerForce = 0;
  switch (status) {
    case 'VERY_STABLE':
      highTowerForce = 3.6e6 * progressFactor;
      break;
    case 'STABLE':
      highTowerForce = 2.4e6 * progressFactor;
      break;
    case 'RISKY': {
      const ratioT =
        supportRatio !== undefined
          ? Math.min(Math.max((supportRatio - 0.25) / 0.20, 0), 1.0)
          : 0.5;
      highTowerForce = (1.5e5 + ratioT * 3.0e5) * progressFactor;
      break;
    }
  }

  // Cap assistance for RISKY placement quality so off-center/tilted floors
  // NEVER receive powerful lock constraint:
  if (quality === 'RISKY') {
    if (supportRatio !== undefined && supportRatio < 0.35) {
      highTowerForce = Math.min(highTowerForce, 8.0e4);
    } else {
      highTowerForce = Math.min(highTowerForce, 2.8e5); // limited assistance, never glued
    }
  }

  // Early-game forces (Floors 1-15 where w = 1.0):
  // NORMAL: NO LockConstraint (0)
  // RISKY: NO LockConstraint (0)
  // DANGEROUS: NO LockConstraint (0)
  // PERFECT / GREAT: only allowed if supportRatio >= 0.25, and heavily diminished if supportRatio < 0.35
  let earlyForce = 0;
  const isMarginalSupport = supportRatio !== undefined && supportRatio < 0.35;

  if (quality === 'PERFECT') {
    if (status === 'VERY_STABLE') {
      earlyForce = 2.5e6;
    } else if (status === 'STABLE') {
      earlyForce = 1.5e6;
    } else if (status === 'RISKY') {
      earlyForce = isMarginalSupport ? 0 : 1.5e4;
    }
  } else if (quality === 'GREAT') {
    if (status === 'VERY_STABLE') {
      earlyForce = 1.5e6;
    } else if (status === 'STABLE') {
      earlyForce = 8.0e5;
    } else if (status === 'RISKY') {
      earlyForce = isMarginalSupport ? 0 : 8.0e3;
    }
  } else {
    // NORMAL or RISKY during Floors 1-15: STRICTLY 0 LockConstraint!
    earlyForce = 0;
  }

  if (w >= 1.0) {
    return earlyForce;
  }
  if (w <= 0.0) {
    return highTowerForce;
  }

  return (1.0 - w) * highTowerForce + w * earlyForce;
}

/**
 * Returns settled linear and angular damping based on floor progression and placement quality (Part 13 & Part F).
 *
 * Philosophy:
 * - Lower floors (1-15):
 *   - PERFECT: linear 0.58, angular 0.70 (settles relatively quickly)
 *   - GREAT: linear 0.45, angular 0.58 (settles reasonably)
 *   - NORMAL: linear 0.18, angular 0.24 (takes longer and may continue sliding/rotating)
 *   - RISKY: linear 0.10, angular 0.12 (clearly remains physically active)
 *   - DANGEROUS: linear 0.04, angular 0.06 (almost no artificial settling assistance)
 * - Floors 16-20: Still relatively low damping (w=0.98..0.88).
 * - Floors 21-25: Gradually increasing damping (w=0.82..0.52).
 * - Floors 26-35: More clearly increasing damping (w=0.44..0.00).
 * - High floors (35+): High damping suppresses residual creep and vibration on tall towers.
 */
export function getSettledDampingForFloor(
  floorNumber: number,
  quality: PlacementQuality = 'NORMAL',
  status?: StabilizationStatus
): {
  linear: number;
  angular: number;
} {
  let highTowerLinear: number;
  let highTowerAngular: number;

  if (floorNumber <= 50) {
    const t = Math.min(Math.max((floorNumber - 1) / 49, 0), 1.0);
    highTowerLinear = 0.44 + t * (0.70 - 0.44);
    highTowerAngular = 0.58 + t * (0.80 - 0.58);
  } else {
    const m = floorNumber - 50;
    highTowerLinear = 0.75 - (0.75 - 0.70) * Math.exp(-0.04 * m);
    highTowerAngular = 0.85 - (0.85 - 0.80) * Math.exp(-0.04 * m);
  }

  let highLin = highTowerLinear;
  let highAng = highTowerAngular;
  if (quality === 'PERFECT') {
    highLin = Math.min(0.75, highTowerLinear + 0.06);
    highAng = Math.min(0.85, highTowerAngular + 0.06);
  } else if (quality === 'GREAT') {
    highLin = Math.min(0.72, highTowerLinear + 0.03);
    highAng = Math.min(0.82, highTowerAngular + 0.03);
  } else if (quality === 'RISKY') {
    highLin = Math.max(0.35, highTowerLinear - 0.08);
    highAng = Math.max(0.45, highTowerAngular - 0.08);
  }

  const w = getEarlySlipStrength(floorNumber);
  if (w <= 0) {
    return { linear: highLin, angular: highAng };
  }

  let earlyLinear: number;
  let earlyAngular: number;

  if (status === 'DANGEROUS') {
    earlyLinear = 0.04;
    earlyAngular = 0.06;
  } else {
    switch (quality) {
      case 'PERFECT':
        earlyLinear = 0.58;
        earlyAngular = 0.70;
        break;
      case 'GREAT':
        earlyLinear = 0.45;
        earlyAngular = 0.58;
        break;
      case 'NORMAL':
        earlyLinear = 0.18;
        earlyAngular = 0.24;
        break;
      case 'RISKY':
        earlyLinear = 0.10;
        earlyAngular = 0.12;
        break;
    }
  }

  const linear = (1.0 - w) * highLin + w * earlyLinear;
  const angular = (1.0 - w) * highAng + w * earlyAngular;
  return { linear, angular };
}

/**
 * Progressive Foundation Stabilization Assistance (Floors 1-30+):
 * - Floors 1-15: 0% assistance (full smaller base effect, tower can lean/tip/collapse from bottom)
 * - Floor 16: ~5% (0.05)
 * - Floor 18: ~10% (0.10)
 * - Floor 20: ~18% (0.18)
 * - Floor 21: ~25% (0.25)
 * - Floor 22: ~35% (0.35)
 * - Floor 23: ~45% (0.45)
 * - Floor 24: ~55% (0.55)
 * - Floor 25: ~65% (0.65)
 * - Floor 26: ~72% (0.72)
 * - Floor 27: ~80% (0.80)
 * - Floor 28: ~88% (0.88)
 * - Floor 29: ~95% (0.95)
 * - Floor 30+: 100% (1.00)
 */
export const BASE_STABILITY_ASSIST_KEYFRAMES: Record<number, number> = {
  1: 0.0,
  4: 0.0,
  6: 0.05,
  8: 0.10,
  10: 0.18,
  12: 0.25,
  14: 0.35,
  16: 0.45,
  18: 0.55,
  20: 0.65,
  22: 0.75,
  25: 0.85,
  28: 0.95,
  30: 1.0,
};

export function getBaseStabilityAssist(floorNumber: number): number {
  if (floorNumber <= 4) return 0.0;
  if (floorNumber >= 30) return 1.0;

  const fLow = Math.floor(floorNumber);
  const fHigh = Math.ceil(floorNumber);
  if (fLow === fHigh) {
    return BASE_STABILITY_ASSIST_KEYFRAMES[fLow] ?? 0.0;
  }
  const vLow = BASE_STABILITY_ASSIST_KEYFRAMES[fLow] ?? 0.0;
  const vHigh = BASE_STABILITY_ASSIST_KEYFRAMES[fHigh] ?? 0.0;
  const frac = floorNumber - fLow;
  return vLow + frac * (vHigh - vLow);
}

/**
 * Active Physics Window scaling:
 * Floors 1-4: All placed floors remain dynamic so early tower center-of-mass
 *             can physically lean, tip, or collapse on the foundation.
 * Floors 5+: Exactly 6 active dynamic upper floors, providing responsive
 *            wobble, lean, and placement reaction without numerical multi-body jitter.
 */
export function getActivePhysicsWindowSize(floorNumber: number): number {
  if (floorNumber <= 4) return Math.max(4, floorNumber);
  return 6;
}



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
  { floor: 1,  difficulty: 0.08, speedMult: 1.00, ampX: 1.70, ampZ: 0.12, rotY: 0.04, swayFactor: 0.020, linearMomentum: 0.42, angularMomentum: 0.20 },
  { floor: 5,  difficulty: 0.12, speedMult: 1.05, ampX: 1.75, ampZ: 0.16, rotY: 0.06, swayFactor: 0.022, linearMomentum: 0.45, angularMomentum: 0.22 },
  { floor: 10, difficulty: 0.18, speedMult: 1.15, ampX: 1.85, ampZ: 0.22, rotY: 0.08, swayFactor: 0.025, linearMomentum: 0.48, angularMomentum: 0.25 },
  { floor: 15, difficulty: 0.25, speedMult: 1.25, ampX: 1.98, ampZ: 0.35, rotY: 0.11, swayFactor: 0.029, linearMomentum: 0.52, angularMomentum: 0.28 },
  { floor: 20, difficulty: 0.32, speedMult: 1.35, ampX: 2.15, ampZ: 0.55, rotY: 0.15, swayFactor: 0.035, linearMomentum: 0.56, angularMomentum: 0.32 },
  { floor: 25, difficulty: 0.40, speedMult: 1.47, ampX: 2.35, ampZ: 0.75, rotY: 0.20, swayFactor: 0.042, linearMomentum: 0.60, angularMomentum: 0.35 },
  { floor: 30, difficulty: 0.48, speedMult: 1.60, ampX: 2.55, ampZ: 0.95, rotY: 0.26, swayFactor: 0.050, linearMomentum: 0.64, angularMomentum: 0.38 },
  { floor: 35, difficulty: 0.56, speedMult: 1.72, ampX: 2.75, ampZ: 1.15, rotY: 0.32, swayFactor: 0.058, linearMomentum: 0.68, angularMomentum: 0.41 },
  { floor: 40, difficulty: 0.65, speedMult: 1.85, ampX: 2.95, ampZ: 1.35, rotY: 0.38, swayFactor: 0.065, linearMomentum: 0.72, angularMomentum: 0.44 },
  { floor: 45, difficulty: 0.74, speedMult: 1.95, ampX: 3.12, ampZ: 1.50, rotY: 0.43, swayFactor: 0.070, linearMomentum: 0.75, angularMomentum: 0.46 },
  { floor: 50, difficulty: 0.83, speedMult: 2.05, ampX: 3.30, ampZ: 1.65, rotY: 0.48, swayFactor: 0.075, linearMomentum: 0.78, angularMomentum: 0.48 },
  { floor: 55, difficulty: 0.89, speedMult: 2.14, ampX: 3.40, ampZ: 1.72, rotY: 0.50, swayFactor: 0.078, linearMomentum: 0.81, angularMomentum: 0.50 },
  { floor: 60, difficulty: 0.94, speedMult: 2.21, ampX: 3.48, ampZ: 1.78, rotY: 0.52, swayFactor: 0.080, linearMomentum: 0.83, angularMomentum: 0.52 },
  { floor: 65, difficulty: 0.97, speedMult: 2.26, ampX: 3.54, ampZ: 1.82, rotY: 0.54, swayFactor: 0.082, linearMomentum: 0.85, angularMomentum: 0.53 },
  { floor: 70, difficulty: 1.00, speedMult: 2.30, ampX: 3.58, ampZ: 1.86, rotY: 0.55, swayFactor: 0.085, linearMomentum: 0.86, angularMomentum: 0.55 },
];

// Reference nodes and tangents for monotonic C1 cubic Hermite speed interpolation
const SPEED_NODES: [number, number, number][] = [
  // [floor, speedTarget, tangentSlope]
  [1,  1.00, 0.0125],
  [5,  1.05, 0.01625],
  [10, 1.15, 0.0200],
  [20, 1.35, 0.0225],
  [30, 1.60, 0.0250],
  [40, 1.85, 0.0225],
  [50, 2.05, 0.0200],
];

/**
 * Calculates the strictly continuous, monotonic speed multiplier based on the placed floor count.
 * Every successfully placed floor increases the speed of the next floor:
 * S(N + 1) > S(N) for all N >= 1.
 * 
 * Progression targets:
 * - Floor 1:   1.00x
 * - Floor 5:   1.05x
 * - Floor 10:  1.15x
 * - Floor 20:  1.35x
 * - Floor 30:  1.60x
 * - Floor 40:  1.85x
 * - Floor 50:  2.05x
 * - Floor 50+: Continuous diminishing asymptotic approach toward a soft cap of 2.45x.
 *   C^1 continuous derivative at Floor 50 (slope matches 0.020/floor).
 */
export function getSpeedMultiplierForFloor(floorNumber: number): number {
  if (floorNumber <= 1) return 1.00;
  if (floorNumber >= 50) {
    const s50 = 2.05;
    const sCap = 2.45;
    const k = 0.020 / (sCap - s50);
    const m = floorNumber - 50;
    return sCap - (sCap - s50) * Math.exp(-k * m);
  }

  for (let i = 0; i < SPEED_NODES.length - 1; i++) {
    const [x0, y0, m0] = SPEED_NODES[i];
    const [x1, y1, m1] = SPEED_NODES[i + 1];
    if (floorNumber >= x0 && floorNumber <= x1) {
      const h = x1 - x0;
      const t = (floorNumber - x0) / h;
      const t2 = t * t;
      const t3 = t2 * t;

      // Standard cubic Hermite basis functions
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;

      return h00 * y0 + h10 * h * m0 + h01 * y1 + h11 * h * m1;
    }
  }

  return 2.05;
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
 * Returns crane kinematics parameters for a given floor number.
 */
export function getCraneKinematicsForFloor(floorNumber: number): {
  speedMult: number;
  ampX: number;
  ampZ: number;
  rotY: number;
  swayFactor: number;
} {
  const knot = getDifficultyKnotForFloor(floorNumber);
  return {
    speedMult: knot.speedMult,
    ampX: knot.ampX,
    ampZ: knot.ampZ,
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
 * Computes the early-game slippery window factor w(floorNumber).
 * Active during Floors 1–15 with strongest penalties on inaccurate placements,
 * then smoothly fades from Floor 15 to 26 so high-floor towers retain normal stability.
 *
 * Curve checkpoints:
 * Floor 1:  1.000 (full early penalty)
 * Floor 5:  ~0.920 (still strong)
 * Floor 10: ~0.780 (clearly active)
 * Floor 15: ~0.607 (last floor where mechanic is strong)
 * Floor 20: ~0.241 (smoothly fading out)
 * Floor 26+: 0.000 (high-tower baseline)
 * Floor 30:  0.000
 */
export function getEarlyGripWindowFactor(floorNumber: number): number {
  if (floorNumber <= 1) return 1.0;
  if (floorNumber >= 26) return 0.0;

  if (floorNumber <= 10) {
    const t = (floorNumber - 1) / 9;
    return 1.0 - 0.22 * Math.pow(t, 1.25);
  } else {
    const t = (floorNumber - 10) / 16;
    return 0.78 * 0.5 * (1 + Math.cos(Math.PI * t));
  }
}

/**
 * Computes the effective early grip factor for a given placement quality and floor number.
 *
 * Target FEEL during Floors 1-15:
 * - PERFECT:   100% of normal safe assistance
 * - GREAT:     ~85-95% (calibrated base: 90%)
 * - NORMAL:    ~30-45% (calibrated base: 38%)
 * - RISKY:     ~0-20%  (calibrated base: 12%)
 * - DANGEROUS: 0% at all floors
 *
 * Fades smoothly toward 100% for non-dangerous placements above Floor 15.
 */
export function getEarlyGripFactor(
  quality: PlacementQuality,
  floorNumber: number,
  status?: StabilizationStatus
): number {
  if (status === 'DANGEROUS') {
    return 0.0;
  }

  const w = getEarlyGripWindowFactor(floorNumber);
  if (w <= 0) {
    return 1.0;
  }

  const qualityAssistance =
    quality === 'PERFECT' ? 1.0 : quality === 'GREAT' ? 0.90 : quality === 'NORMAL' ? 0.38 : 0.12;

  return (1.0 - w) * 1.0 + w * qualityAssistance;
}

/**
 * Returns impact momentum retention multipliers (first contact damping).
 * For Floors 1-15:
 * - PERFECT: strong impact absorption (retention ~0.65 linear, ~0.50 angular)
 * - GREAT:   good impact absorption (~0.74 linear, ~0.62 angular)
 * - NORMAL:  less absorption (~0.86 linear, ~0.74 angular) -> momentum survives contact!
 * - RISKY:   much less absorption (~0.92 linear, ~0.82 angular) -> slides easily!
 * - DANGEROUS: minimal artificial absorption (~0.97 linear, ~0.90 angular)
 */
export function getImpactMomentumRetention(
  quality: PlacementQuality,
  floorNumber: number
): { linear: number; angular: number } {
  // Baseline high-tower continuous impact damping
  const tImpact = Math.min(Math.max((floorNumber - 1) / 49, 0), 1.0);
  const baseLat = 0.90 - tImpact * (0.90 - 0.72);
  const baseRot = 0.82 - tImpact * (0.82 - 0.55);

  const w = getEarlyGripWindowFactor(floorNumber);
  if (w <= 0) {
    return { linear: baseLat, angular: baseRot };
  }

  let targetLat: number;
  let targetRot: number;

  switch (quality) {
    case 'PERFECT':
      targetLat = 0.65;
      targetRot = 0.50;
      break;
    case 'GREAT':
      targetLat = 0.74;
      targetRot = 0.62;
      break;
    case 'NORMAL':
      targetLat = 0.86;
      targetRot = 0.74;
      break;
    case 'RISKY':
      targetLat = 0.92;
      targetRot = 0.82;
      break;
  }

  const linear = (1.0 - w) * baseLat + w * targetLat;
  const angular = (1.0 - w) * baseRot + w * targetRot;
  return { linear, angular };
}

/**
 * Computes the LockConstraint maxForce dynamically based on placement status, support ratio,
 * floor progression, and placement quality.
 *
 * Reverse Assistance & Early-Game Philosophy:
 * - DANGEROUS (<25% support): Strictly 0 at ALL floors. Real physics dictates collapse.
 * - PERFECT / GREAT: Safe and reliable grip.
 * - NORMAL (Floors 1-15): Weak stabilization (~30-45% grip early), allowing physical sliding/tilt.
 * - RISKY (Floors 1-15): Very weak or zero stabilization (~0-20% grip early).
 * - High floors (30+): High tower stability returns to suppress micro-sliding and creep.
 */
export function getStabilizationMaxForce(
  status: StabilizationStatus,
  difficulty: number,
  floorNumber: number,
  supportRatio?: number,
  quality?: PlacementQuality
): number {
  if (status === 'DANGEROUS') {
    return 0;
  }

  const t = Math.min(Math.max((floorNumber - 1) / 49, 0), 1.0);
  const progressFactor = floorNumber >= 50 ? 1.0 : 0.83 + 0.17 * Math.pow(t, 0.85);

  let baseForce: number;
  switch (status) {
    case 'VERY_STABLE':
      baseForce = 3.6e6 * progressFactor;
      break;

    case 'STABLE':
      baseForce = 2.4e6 * progressFactor;
      break;

    case 'RISKY': {
      const ratioT =
        supportRatio !== undefined
          ? Math.min(Math.max((supportRatio - 0.25) / 0.20, 0), 1.0)
          : 0.5;
      baseForce = (1.5e5 + ratioT * 3.0e5) * progressFactor;
      break;
    }
  }

  if (quality) {
    const earlyGrip = getEarlyGripFactor(quality, floorNumber, status);
    return baseForce * earlyGrip;
  }

  return baseForce;
}

/**
 * Returns settled linear and angular damping based on floor progression and placement quality.
 *
 * Philosophy:
 * - Lower floors (1-15):
 *   - PERFECT/GREAT: Standard calibrated damping to settle securely.
 *   - NORMAL/RISKY: Reduced damping allows real physical sliding and tilting.
 * - High floors (30-50+): High damping suppresses residual creep and vibration on tall towers.
 */
export function getSettledDampingForFloor(
  floorNumber: number,
  quality: PlacementQuality = 'PERFECT'
): {
  linear: number;
  angular: number;
} {
  let baseLinear: number;
  let baseAngular: number;

  if (floorNumber <= 50) {
    const t = Math.min(Math.max((floorNumber - 1) / 49, 0), 1.0);
    baseLinear = 0.44 + t * (0.70 - 0.44);
    baseAngular = 0.58 + t * (0.80 - 0.58);
  } else {
    const m = floorNumber - 50;
    baseLinear = 0.75 - (0.75 - 0.70) * Math.exp(-0.04 * m);
    baseAngular = 0.85 - (0.85 - 0.80) * Math.exp(-0.04 * m);
  }

  const w = getEarlyGripWindowFactor(floorNumber);
  if (w <= 0 || quality === 'PERFECT') {
    return { linear: baseLinear, angular: baseAngular };
  }

  const dampMult = quality === 'GREAT' ? 0.95 : quality === 'NORMAL' ? 0.78 : 0.55;
  const linear = (1 - w) * baseLinear + w * (baseLinear * dampMult);
  const angular = (1 - w) * baseAngular + w * (baseAngular * dampMult);
  return { linear, angular };
}

/**
 * Active Physics Window scaling (Part C10):
 * Floor 1-20:  4 active upper floors
 * Floor 21-35: 5
 * Floor 36-50: 6
 * Floor 51-65: 7
 * Floor 66+:   8 (capped at 8)
 */
export function getActivePhysicsWindowSize(floorNumber: number): number {
  if (floorNumber <= 20) return 4;
  if (floorNumber <= 35) return 5;
  if (floorNumber <= 50) return 6;
  if (floorNumber <= 65) return 7;
  return 8;
}


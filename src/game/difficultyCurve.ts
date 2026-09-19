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
  { floor: 5,  difficulty: 0.11, speedMult: 1.05, ampX: 1.75, ampZ: 0.16, rotY: 0.06, swayFactor: 0.022, linearMomentum: 0.45, angularMomentum: 0.22 },
  { floor: 10, difficulty: 0.17, speedMult: 1.10, ampX: 1.85, ampZ: 0.22, rotY: 0.08, swayFactor: 0.025, linearMomentum: 0.48, angularMomentum: 0.25 },
  { floor: 15, difficulty: 0.23, speedMult: 1.18, ampX: 1.98, ampZ: 0.35, rotY: 0.11, swayFactor: 0.029, linearMomentum: 0.51, angularMomentum: 0.28 },
  { floor: 20, difficulty: 0.30, speedMult: 1.32, ampX: 2.15, ampZ: 0.55, rotY: 0.15, swayFactor: 0.035, linearMomentum: 0.55, angularMomentum: 0.32 },
  { floor: 25, difficulty: 0.37, speedMult: 1.55, ampX: 2.32, ampZ: 0.75, rotY: 0.20, swayFactor: 0.042, linearMomentum: 0.60, angularMomentum: 0.35 },
  { floor: 30, difficulty: 0.45, speedMult: 1.75, ampX: 2.55, ampZ: 0.95, rotY: 0.26, swayFactor: 0.050, linearMomentum: 0.64, angularMomentum: 0.38 },
  { floor: 35, difficulty: 0.54, speedMult: 1.90, ampX: 2.72, ampZ: 1.15, rotY: 0.32, swayFactor: 0.058, linearMomentum: 0.68, angularMomentum: 0.41 },
  { floor: 40, difficulty: 0.64, speedMult: 2.05, ampX: 2.92, ampZ: 1.35, rotY: 0.38, swayFactor: 0.065, linearMomentum: 0.72, angularMomentum: 0.44 },
  { floor: 45, difficulty: 0.74, speedMult: 2.18, ampX: 3.10, ampZ: 1.50, rotY: 0.43, swayFactor: 0.070, linearMomentum: 0.75, angularMomentum: 0.46 },
  { floor: 50, difficulty: 0.83, speedMult: 2.30, ampX: 3.28, ampZ: 1.65, rotY: 0.48, swayFactor: 0.075, linearMomentum: 0.78, angularMomentum: 0.48 },
  { floor: 55, difficulty: 0.90, speedMult: 2.40, ampX: 3.38, ampZ: 1.72, rotY: 0.50, swayFactor: 0.078, linearMomentum: 0.81, angularMomentum: 0.50 },
  { floor: 60, difficulty: 0.95, speedMult: 2.50, ampX: 3.46, ampZ: 1.78, rotY: 0.52, swayFactor: 0.080, linearMomentum: 0.83, angularMomentum: 0.52 },
  { floor: 65, difficulty: 0.98, speedMult: 2.58, ampX: 3.52, ampZ: 1.82, rotY: 0.54, swayFactor: 0.082, linearMomentum: 0.85, angularMomentum: 0.53 },
  { floor: 70, difficulty: 1.00, speedMult: 2.65, ampX: 3.58, ampZ: 1.86, rotY: 0.55, swayFactor: 0.085, linearMomentum: 0.86, angularMomentum: 0.55 },
];

/**
 * Returns interpolated DifficultyKnot for any floor number.
 */
export function getDifficultyKnotForFloor(floorNumber: number): DifficultyKnot {
  if (floorNumber <= DIFFICULTY_KNOTS[0].floor) {
    return DIFFICULTY_KNOTS[0];
  }
  const lastKnot = DIFFICULTY_KNOTS[DIFFICULTY_KNOTS.length - 1];
  if (floorNumber >= lastKnot.floor) {
    return lastKnot;
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
        speedMult: k0.speedMult + t * (k1.speedMult - k0.speedMult),
        ampX: k0.ampX + t * (k1.ampX - k0.ampX),
        ampZ: k0.ampZ + t * (k1.ampZ - k0.ampZ),
        rotY: k0.rotY + t * (k1.rotY - k0.rotY),
        swayFactor: k0.swayFactor + t * (k1.swayFactor - k0.swayFactor),
        linearMomentum: k0.linearMomentum + t * (k1.linearMomentum - k0.linearMomentum),
        angularMomentum: k0.angularMomentum + t * (k1.angularMomentum - k0.angularMomentum),
      };
    }
  }

  return lastKnot;
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
 * Computes the LockConstraint maxForce dynamically based on placement status and continuous difficulty.
 * Part C Calibration:
 * VERY_STABLE: Strong early assistance (3.5e6), meaningful late assistance (1.8e6)
 * STABLE: Early 2.4e6, mid 1.2e6, late 5.0e5
 * RISKY: Early 9.0e5, floor 30 ~3.5e5, floor 40 ~1.0e5, floor 50+ -> 0!
 * DANGEROUS: Drops to 0 by floor 25-30. High floors: strictly 0!
 */
export function getStabilizationMaxForce(
  status: StabilizationStatus,
  difficulty: number,
  floorNumber: number
): number {
  const norm = Math.min(Math.max((difficulty - 0.08) / (1.00 - 0.08), 0), 1.0);

  switch (status) {
    case 'VERY_STABLE':
      // 3.5e6 at low difficulty down to 1.8e6 at high difficulty
      return 3.5e6 - norm * (3.5e6 - 1.8e6);

    case 'STABLE':
      // 2.4e6 at low difficulty down to 5.0e5 at high difficulty
      return 2.4e6 - norm * (2.4e6 - 5.0e5);

    case 'RISKY':
      // Floor 1-15: ~9.0e5 to 6.0e5
      // Floor 30 (diff 0.45): ~3.5e5 (limited assistance)
      // Floor 40 (diff 0.64): ~1.2e5 (very little)
      // Floor 50+ (diff >= 0.83): 0 (no artificial holding force!)
      if (floorNumber >= 50 || difficulty >= 0.82) return 0;
      const riskyNorm = Math.min(Math.max((difficulty - 0.08) / (0.82 - 0.08), 0), 1.0);
      return 9.0e5 * (1.0 - riskyNorm);

    case 'DANGEROUS':
      // Drops smoothly to 0 by floor 25-30 (diff >= 0.40)
      // High floors: strictly 0! Let physics decide.
      if (floorNumber >= 26 || difficulty >= 0.40) return 0;
      const dangerousNorm = Math.min(Math.max((difficulty - 0.08) / (0.40 - 0.08), 0), 1.0);
      return 3.2e5 * (1.0 - dangerousNorm);
  }
}

/**
 * Returns settled linear and angular damping based on floor number (Part C9).
 * Floors 1-15:  strong damping (linear 0.60, angular 0.75)
 * Floors 16-30: medium-high (linear 0.52, angular 0.65)
 * Floors 31-40: medium (linear 0.44, angular 0.55)
 * Floors 41-50: medium-low (linear 0.36, angular 0.45)
 * Floors 51+:   only enough to prevent jitter (linear 0.30, angular 0.38)
 */
export function getSettledDampingForFloor(floorNumber: number): {
  linear: number;
  angular: number;
} {
  if (floorNumber <= 15) {
    return { linear: 0.60, angular: 0.75 };
  } else if (floorNumber <= 30) {
    const t = (floorNumber - 15) / 15;
    return {
      linear: 0.60 - t * (0.60 - 0.52),
      angular: 0.75 - t * (0.75 - 0.65),
    };
  } else if (floorNumber <= 40) {
    const t = (floorNumber - 30) / 10;
    return {
      linear: 0.52 - t * (0.52 - 0.44),
      angular: 0.65 - t * (0.65 - 0.55),
    };
  } else if (floorNumber <= 50) {
    const t = (floorNumber - 40) / 10;
    return {
      linear: 0.44 - t * (0.44 - 0.36),
      angular: 0.55 - t * (0.55 - 0.45),
    };
  } else {
    const t = Math.min((floorNumber - 50) / 20, 1.0);
    return {
      linear: 0.36 - t * (0.36 - 0.30),
      angular: 0.45 - t * (0.45 - 0.38),
    };
  }
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


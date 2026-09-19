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
 * Computes the LockConstraint maxForce dynamically based on placement status, support ratio, and floor progression.
 * 
 * Reverse Assistance Philosophy (Parts C, E, F, G):
 * - Low floors (1-10): somewhat LESS artificial grip (~82-85% at Floor 1, ~85-87% at Floor 5).
 *   Centered placements are stable; poor overhangs visibly shift/tilt/slide. Several bad drops can fail.
 * - High floors (30-50+): progressively MORE structural assistance (~95-97% at Floor 30, 100% at Floor 50+).
 *   Suppresses micro-sliding and numerical creep on well-placed floors.
 * - SUPPORT RATIO MATTERS (Part G):
 *   * VERY_STABLE (>=70% support): Strong assistance (3.0e6 N at Floor 1 up to 3.6e6 N at Floor 50+).
 *   * STABLE (45-70% support): Useful assistance (2.0e6 N at Floor 1 up to 2.4e6 N at Floor 50+).
 *   * RISKY (25-45% support): Limited assistance only (~1.5e5 - 4.5e5 N). May tilt/shift/fall. Never glued!
 *   * DANGEROUS (<25% support): Strictly 0 at ALL floors. Real physics dictates collapse.
 */
export function getStabilizationMaxForce(
  status: StabilizationStatus,
  difficulty: number,
  floorNumber: number,
  supportRatio?: number
): number {
  // Smooth progression factor reflecting structural target feel:
  // Floor 1:   ~83%
  // Floor 5:   ~85%
  // Floor 10:  ~87%
  // Floor 15:  ~89%
  // Floor 20:  ~91%
  // Floor 30:  ~94%
  // Floor 40:  ~97%
  // Floor 50+: 100%
  const t = Math.min(Math.max((floorNumber - 1) / 49, 0), 1.0);
  const progressFactor = floorNumber >= 50 ? 1.0 : 0.83 + 0.17 * Math.pow(t, 0.85);

  switch (status) {
    case 'VERY_STABLE':
      // Good centered placement: strong assistance against micro-sliding and creep
      return 3.6e6 * progressFactor;

    case 'STABLE':
      // Well-supported placement (45-70% support): preserves player-created placement reliably
      return 2.4e6 * progressFactor;

    case 'RISKY': {
      // Overhang placement (25-45% support): limited assistance only!
      // May shift, tilt, or slide under momentum. Never glued in place.
      const ratioT =
        supportRatio !== undefined
          ? Math.min(Math.max((supportRatio - 0.25) / 0.20, 0), 1.0)
          : 0.5;
      const baseForce = 1.5e5 + ratioT * 3.0e5; // 1.5e5 to 4.5e5 N
      return baseForce * progressFactor;
    }

    case 'DANGEROUS':
      // Very low support (<25%): strictly 0 artificial force at all floors.
      // High stabilization must NOT save a clearly unsupported floor.
      return 0;
  }
}

/**
 * Returns settled linear and angular damping based on floor progression (Part H).
 * 
 * Philosophy:
 * - Lower floors (1-10): Moderate damping (linear ~0.44-0.49, angular ~0.58-0.62)
 *   Allows physical reaction, tilting, and sliding when poorly placed.
 * - Mid floors (15-30): Moderate-high damping (linear ~0.52-0.60, angular ~0.65-0.71).
 * - High floors (40-50+): High damping (linear ~0.65-0.70, angular ~0.76-0.80)
 *   Suppresses unwanted residual creep and micro-drifting on tall towers.
 * - Floors 50+: Diminishing asymptotic approach toward soft cap (linear 0.75, angular 0.85).
 */
export function getSettledDampingForFloor(floorNumber: number): {
  linear: number;
  angular: number;
} {
  if (floorNumber <= 50) {
    const t = Math.min(Math.max((floorNumber - 1) / 49, 0), 1.0);
    return {
      linear: 0.44 + t * (0.70 - 0.44),
      angular: 0.58 + t * (0.80 - 0.58),
    };
  } else {
    const m = floorNumber - 50;
    return {
      linear: 0.75 - (0.75 - 0.70) * Math.exp(-0.04 * m),
      angular: 0.85 - (0.85 - 0.80) * Math.exp(-0.04 * m),
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


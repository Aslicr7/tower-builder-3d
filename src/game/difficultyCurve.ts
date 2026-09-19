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
  linearMomentum: number;
  angularMomentum: number;
}

/**
 * Key difficulty calibration knots (interpolated smoothly):
 * Floor 1:   diff 0.08, linear 0.40, angular 0.18
 * Floor 5:   diff 0.10, linear 0.42, angular 0.20
 * Floor 10:  diff 0.16, linear 0.45, angular 0.25
 * Floor 15:  diff 0.22, linear 0.47, angular 0.28
 * Floor 20:  diff 0.28, linear 0.50, angular 0.30
 * Floor 25:  diff 0.34, linear 0.53, angular 0.32
 * Floor 30:  diff 0.40, linear 0.56, angular 0.35
 * Floor 35:  diff 0.47, linear 0.59, angular 0.38
 * Floor 40:  diff 0.55, linear 0.62, angular 0.42
 * Floor 50:  diff 0.68, linear 0.68, angular 0.48
 * Floor 60:  diff 0.78, linear 0.70, angular 0.50
 * Floor 70+: diff 0.85, linear 0.72, angular 0.52 (capped)
 */
export const DIFFICULTY_KNOTS: DifficultyKnot[] = [
  { floor: 1,  difficulty: 0.08, linearMomentum: 0.40, angularMomentum: 0.18 },
  { floor: 5,  difficulty: 0.10, linearMomentum: 0.42, angularMomentum: 0.20 },
  { floor: 10, difficulty: 0.16, linearMomentum: 0.45, angularMomentum: 0.25 },
  { floor: 15, difficulty: 0.22, linearMomentum: 0.47, angularMomentum: 0.28 },
  { floor: 20, difficulty: 0.28, linearMomentum: 0.50, angularMomentum: 0.30 },
  { floor: 25, difficulty: 0.34, linearMomentum: 0.53, angularMomentum: 0.32 },
  { floor: 30, difficulty: 0.40, linearMomentum: 0.56, angularMomentum: 0.35 },
  { floor: 35, difficulty: 0.47, linearMomentum: 0.59, angularMomentum: 0.38 },
  { floor: 40, difficulty: 0.55, linearMomentum: 0.62, angularMomentum: 0.42 },
  { floor: 50, difficulty: 0.68, linearMomentum: 0.68, angularMomentum: 0.48 },
  { floor: 60, difficulty: 0.78, linearMomentum: 0.70, angularMomentum: 0.50 },
  { floor: 70, difficulty: 0.85, linearMomentum: 0.72, angularMomentum: 0.52 },
];

/**
 * Returns normalized difficulty [0.10, 1.00] for a given floor number.
 * Smoothly interpolated, capped at floor 60+.
 */
export function getDifficultyForFloor(floorNumber: number): number {
  if (floorNumber <= DIFFICULTY_KNOTS[0].floor) {
    return DIFFICULTY_KNOTS[0].difficulty;
  }
  const lastKnot = DIFFICULTY_KNOTS[DIFFICULTY_KNOTS.length - 1];
  if (floorNumber >= lastKnot.floor) {
    return lastKnot.difficulty;
  }

  for (let i = 0; i < DIFFICULTY_KNOTS.length - 1; i++) {
    const k0 = DIFFICULTY_KNOTS[i];
    const k1 = DIFFICULTY_KNOTS[i + 1];
    if (floorNumber >= k0.floor && floorNumber <= k1.floor) {
      const t = (floorNumber - k0.floor) / (k1.floor - k0.floor);
      return k0.difficulty + t * (k1.difficulty - k0.difficulty);
    }
  }

  return lastKnot.difficulty;
}

/**
 * Returns linear and angular crane momentum transfer multipliers.
 */
export function getReleaseMomentumMultipliers(floorNumber: number): {
  linear: number;
  angular: number;
  difficulty: number;
} {
  const difficulty = getDifficultyForFloor(floorNumber);

  if (floorNumber <= DIFFICULTY_KNOTS[0].floor) {
    return {
      linear: DIFFICULTY_KNOTS[0].linearMomentum,
      angular: DIFFICULTY_KNOTS[0].angularMomentum,
      difficulty,
    };
  }
  const lastKnot = DIFFICULTY_KNOTS[DIFFICULTY_KNOTS.length - 1];
  if (floorNumber >= lastKnot.floor) {
    return {
      linear: lastKnot.linearMomentum,
      angular: lastKnot.angularMomentum,
      difficulty,
    };
  }

  for (let i = 0; i < DIFFICULTY_KNOTS.length - 1; i++) {
    const k0 = DIFFICULTY_KNOTS[i];
    const k1 = DIFFICULTY_KNOTS[i + 1];
    if (floorNumber >= k0.floor && floorNumber <= k1.floor) {
      const t = (floorNumber - k0.floor) / (k1.floor - k0.floor);
      return {
        linear: k0.linearMomentum + t * (k1.linearMomentum - k0.linearMomentum),
        angular: k0.angularMomentum + t * (k1.angularMomentum - k0.angularMomentum),
        difficulty,
      };
    }
  }

  return {
    linear: lastKnot.linearMomentum,
    angular: lastKnot.angularMomentum,
    difficulty,
  };
}

export type StabilizationStatus = 'VERY_STABLE' | 'STABLE' | 'RISKY' | 'DANGEROUS';

/**
 * Computes the LockConstraint maxForce dynamically based on placement status and continuous difficulty.
 * Replaces the old binary (floor <= 20) cliff with a smooth, imperceptible transition.
 */
export function getStabilizationMaxForce(
  status: StabilizationStatus,
  difficulty: number
): number {
  const norm = Math.min(Math.max((difficulty - 0.08) / (0.85 - 0.08), 0), 1.0);

  switch (status) {
    case 'VERY_STABLE':
      // 4.0e6 at low difficulty down to 2.8e6 at high difficulty
      return 4.0e6 - norm * (4.0e6 - 2.8e6);

    case 'STABLE':
      // 3.2e6 at low difficulty down to 1.8e6 at high difficulty
      // At Floor 30 (difficulty 0.40, norm ~0.415), maxForce is ~2.62e6 (substantial!)
      return 3.2e6 - norm * (3.2e6 - 1.8e6);

    case 'RISKY':
      // 1.8e6 at low difficulty down to 6.0e5 at high difficulty
      // At Floor 30 (difficulty 0.40, norm ~0.415), maxForce is ~1.30e6 (meaningful!)
      return 1.8e6 - norm * (1.8e6 - 6.0e5);

    case 'DANGEROUS':
      // Drops smoothly to 0 by difficulty ~0.75 (around floor 55+)
      // At Floor 30 (difficulty 0.40), maxForce is ~3.8e5 (weak support!)
      if (difficulty >= 0.75) return 0;
      return 7.5e5 * (1.0 - (difficulty - 0.08) / (0.75 - 0.08));
  }
}

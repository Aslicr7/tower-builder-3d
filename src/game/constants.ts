export const GAME_CONFIG = {
  // Dimensions
  BASE_WIDTH: 4.2,
  BASE_DEPTH: 4.2,
  BASE_HEIGHT: 2.3,
  FOUNDATION_HEIGHT: 2.3, // Matches height of 1 typical floor module (2.3m)
  FOUNDATION_FOOTPRINT_SCALE: 1.00, // 100% of normal floor footprint width & depth (fair, full starting platform)
  
  // Height metric ratio (matches reference image: ~26m per floor)
  METERS_PER_FLOOR: 26.0,
  
  // Active Physics Window: Only the newest/top 4 floors remain fully dynamic CANNON bodies.
  // Everything below them becomes COMPLETED TOWER (permanently preserved, solid static support).
  ACTIVE_PHYSICS_WINDOW: 4,
  
  // Crane and suspension - drop clearance 2.5m for crisp, heavy thud drops
  CRANE_CLEARANCE: 2.5,
  
  // Difficulty curve bounds (smoothly interpolated across floors 1 to 200+)
  CRANE_MIN_SWING_X: 1.6,
  CRANE_MAX_SWING_X: 3.1,
  CRANE_MIN_SWING_Z: 0.15,
  CRANE_MAX_SWING_Z: 0.95,
  CRANE_MIN_ROTATION_Y: 0.05, // ~3 degrees
  CRANE_MAX_ROTATION_Y: 0.38, // ~22 degrees
  CRANE_MIN_SPEED: 0.75,
  CRANE_MAX_SPEED: 2.55,
  
  // Physics parameters - ZERO BOUNCE, HIGH FRICTION & DAMPING
  GRAVITY: -28.0,
  FLOOR_MASS: 3500, // kg - heavy architectural module
  FLOOR_FRICTION: 0.95, // high friction
  FLOOR_RESTITUTION: 0.0, // STRICTLY ZERO BOUNCE
  LINEAR_DAMPING: 0.48, // absorbs kinetic bounce & lateral slide
  ANGULAR_DAMPING: 0.72, // prevents rubbery rotational rebound
  
  // Scoring parameters (Part 2)
  BASE_FLOOR_SCORE: 1,
  GREAT_BONUS: 1,
  PERFECT_BONUS: 2,

  // Tolerances
  PERFECT_THRESHOLD_DIST: 0.25,
  PERFECT_THRESHOLD_ROT: 0.09,
  GREAT_THRESHOLD_DIST: 0.60,
  
  // Support & Stabilization rules
  STABILIZATION_VERY_STABLE_SUPPORT: 0.70,
  STABILIZATION_STABLE_SUPPORT: 0.45,
  STABILIZATION_RISKY_SUPPORT: 0.25,
  
  // Settling phase: 0.5 - 0.8s contact before soft stabilization
  SETTLING_MIN_TIME_S: 0.55,
  SETTLING_MAX_TIME_S: 1.05,
  SETTLING_VELOCITY_THRESH: 0.28,
  SETTLING_ANGULAR_THRESH: 0.24,
  
  // Collapse criteria & camera observation settings
  COLLAPSE_TILT_LIMIT_RAD: 1.15, // ~66 degrees tilt before active top collapse
  COLLAPSE_FALL_THRESHOLD_Y: -4.0,
  COLLAPSE_OBSERVE_DURATION_MS: 2400, // legacy fallback duration
  COLLAPSE_MIN_OBSERVE_DURATION_S: 2.2, // ~2-2.5s minimum viewing time
  COLLAPSE_MAX_OBSERVE_DURATION_S: 5.0, // ~5.0s maximum viewing ceiling
  COLLAPSE_SETTLE_REQUIRED_S: 0.6,      // continuous low velocity to consider pile settled
  COLLAPSE_POST_SETTLE_HOLD_S: 0.8,     // hold camera on settled wreckage before Game Over UI
  COLLAPSE_GROUND_TARGET_MIN_Y: -2.0,   // sensible clamp to keep foundation & ground in view
  COLLAPSE_DEAD_ZONE_M: 0.20,           // dead zone to prevent camera jitter from micro-bounces
};


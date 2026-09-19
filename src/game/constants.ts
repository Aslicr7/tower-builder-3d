export const GAME_CONFIG = {
  // Dimensions
  BASE_WIDTH: 4.2,
  BASE_DEPTH: 4.2,
  BASE_HEIGHT: 2.3,
  FOUNDATION_HEIGHT: 6.0,
  
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
  CRANE_MAX_SPEED: 1.65,
  
  // Physics parameters - ZERO BOUNCE, HIGH FRICTION & DAMPING
  GRAVITY: -28.0,
  FLOOR_MASS: 3500, // kg - heavy architectural module
  FLOOR_FRICTION: 0.95, // high friction
  FLOOR_RESTITUTION: 0.0, // STRICTLY ZERO BOUNCE
  LINEAR_DAMPING: 0.48, // absorbs kinetic bounce & lateral slide
  ANGULAR_DAMPING: 0.72, // prevents rubbery rotational rebound
  
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
  
  // Collapse criteria
  COLLAPSE_TILT_LIMIT_RAD: 1.15, // ~66 degrees tilt before active top collapse
  COLLAPSE_FALL_THRESHOLD_Y: -4.0,
  COLLAPSE_OBSERVE_DURATION_MS: 2400, // let player watch the collapse before menu
};


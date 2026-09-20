import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { FeedbackEvent, FeedbackType, FloorDimensions, FloorModuleStyle, GameState, GameStats, PlacementQuality } from '../types';
import { sounds } from '../audio/sound';
import { CityScenery } from './cityScenery';
import { CraneSystem } from './crane';
import { createFloorModule, createTowerFoundation } from './floorGenerator';
import { selectFloorModule } from './moduleSelector';
import {
  getReleaseMomentumMultipliers,
  getCraneKinematicsForFloor,
  getDifficultyForFloor,
  evaluatePlacementQuality,
  getBaseStabilityAssist,
  getEarlySlipStrength,
  getSpeedMultiplierForFloor,
  getDropHeightMultiplierForFloor,
  getActualDropDistanceForFloor,
} from './difficultyCurve';
import { PhysicsWorld } from './physicsWorld';
import { GAME_CONFIG } from './constants';
import { createMotionProfile, ModuleMotionProfile } from './motionProfile';
import { TrolleyKinematics } from './trolleyKinematics';
import { SuspensionSimulator } from './suspensionPhysics';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onStateChange: (state: GameState) => void;
  onFeedback: (feedback: FeedbackEvent) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;

  // Three.js
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;

  // Subsystems
  private scenery!: CityScenery;
  private crane!: CraneSystem;
  private physics!: PhysicsWorld;

  // Game state
  private state: GameState = 'START';
  private floorCount = 0;
  private score = 0;
  private bestScore = 0;
  private bestHeight = 0;
  private perfectStreak = 0;
  private isNewBest = false;

  // Active hanging floor
  private hangingFloorGroup: THREE.Group | null = null;
  private hangingFloorDims: FloorDimensions | null = null;
  private hangingFloorStyle: FloorModuleStyle = 'MODERN_APARTMENT_V1';
  private floorStyleHistory: FloorModuleStyle[] = [];
  private isFloorHanging = false;

  // Crane motion state
  private swingTime = 0;
  private craneX = 0;
  private craneZ = 0;
  private craneRotY = 0;
  private craneVelX = 0;
  private craneVelZ = 0;
  private craneAccX = 0;
  private craneAccZ = 0;
  private craneRotVelY = 0;
  private trolleyKinematics: TrolleyKinematics | null = null;
  private suspensionSimulator: SuspensionSimulator | null = null;
  private prevTurnaroundSign = 0;

  // Hanging module suspension & pendulum dynamics (lag, swing, tilt, inertia)
  private moduleX = 0;
  private moduleZ = 0;
  private moduleVelX = 0;
  private moduleVelZ = 0;
  private swingOffsetX = 0;
  private swingOffsetZ = 0;
  private swingVelocityX = 0;
  private swingVelocityZ = 0;

  // Camera tracking & Orbit View
  private cameraTarget = new THREE.Vector3(0, 3.2, 0);
  private cameraDesiredTarget = new THREE.Vector3(0, 3.2, 0);
  private cameraOffset = new THREE.Vector3(20, 13, 31);
  private cameraBaseDistance = 38.0;
  private collapseStartTime = 0;
  private baseAzimuth = 28 * (Math.PI / 180);
  private elevationAngle = 9.5 * (Math.PI / 180);
  private currentOrbitAngle = 0; // Animated orbit angle around Y axis (radians)
  private targetOrbitAngle = 0;  // Target orbit angle around Y axis (multiples of PI/4 = 45°)
  private orbitAngleIndex = 0;   // 0 to 7 (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)

  // Game Over & Failure Timing States
  private gameOverTriggered = false;
  private gameOverReason: 'MISSED_FLOOR' | 'REAL_TOP_COLLAPSE' = 'REAL_TOP_COLLAPSE';
  private lastReleaseTime = 0;
  private missedFloorFailureDuration = 0;
  private collapseFailureDuration = 0;

  // Continuous Module Entry & Suspension State Machine
  private transitionPhase: 'READY' | 'IN_FLIGHT' | 'SETTLING' = 'READY';
  private transitionTimer = 0;
  private cranePhaseX = 0;
  private cranePhaseZ = 0;
  private cranePhaseRot = 0;
  private canDrop = false;
  private currentCraneY = 0;
  private currentHookY = 0;
  private currentTrolleyX = 0;
  private currentTrolleyZ = 0;
  private currentMotionProfile: ModuleMotionProfile | null = null;
  private lastEntrySide: 'LEFT' | 'RIGHT' | null = null;
  private sameEntrySideStreak = 0;
  private nextEntrySide: 'LEFT' | 'RIGHT' = 'LEFT';
  private debugForceEntrySide: 'LEFT' | 'RIGHT' | null = null;
  private hasLoggedCenterCrossingThisFloor = false;
  private hasLoggedDropEnabledThisFloor = false;
  private moduleHangingTime = 0;
  private prevCenterCrossModX = 0;

  // Animation frame
  private animId: number | null = null;
  private lastTime = 0;
  private boundResize: () => void;
  private currentRegionName = 'CITY / GROUND';

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // Load saved best score from localStorage (separate from best height)
    try {
      const savedScore = localStorage.getItem('tower_builder_best_score');
      if (savedScore) this.bestScore = parseInt(savedScore, 10) || 0;
    } catch {
      // LocalStorage fallback
    }

    // Load saved best height from localStorage (internally preserved)
    try {
      const savedBest = localStorage.getItem('tower_builder_best_height');
      if (savedBest) this.bestHeight = parseFloat(savedBest) || 0;
    } catch {
      // LocalStorage fallback
    }

    this.initThree();
    this.initWorld();

    this.boundResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.boundResize);

    this.startLoop();
    this.startNewGame();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8);
    // Soft atmospheric distance haze that keeps midground and tower crisp
    this.scene.fog = new THREE.FogExp2(0xe0f2fe, 0.0035);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Initialize PerspectiveCamera - updateCameraResponsiveConfig configures exact FOV & distance
    this.camera = new THREE.PerspectiveCamera(54, width / height, 0.5, 800);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    this.container.appendChild(this.renderer.domElement);

    // Apply dedicated responsive framing (mobile portrait vs tablet vs desktop)
    this.updateCameraResponsiveConfig(width, height);

    this.camera.position.set(
      this.cameraTarget.x + this.cameraOffset.x,
      this.cameraTarget.y + this.cameraOffset.y,
      this.cameraTarget.z + this.cameraOffset.z
    );
    this.camera.lookAt(this.cameraTarget);

    // Bright natural daylight: warm sunlight with sky fill & soft shadows
    this.ambientLight = new THREE.AmbientLight(0xffedd5, 0.95);
    this.scene.add(this.ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0xfde68a, 0.7);
    this.scene.add(hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffedd5, 2.0);
    this.sunLight.position.set(35, 60, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 300;
    this.sunLight.shadow.camera.left = -35;
    this.sunLight.shadow.camera.right = 35;
    this.sunLight.shadow.camera.top = 45;
    this.sunLight.shadow.camera.bottom = -35;
    this.sunLight.shadow.bias = -0.0003;
    this.scene.add(this.sunLight);
  }

  private computeCameraOffsetVector(): THREE.Vector3 {
    const azimuth = this.baseAzimuth + this.currentOrbitAngle;
    const dirX = Math.sin(azimuth) * Math.cos(this.elevationAngle);
    const dirY = Math.sin(this.elevationAngle);
    const dirZ = Math.cos(azimuth) * Math.cos(this.elevationAngle);
    return new THREE.Vector3(
      dirX * this.cameraBaseDistance,
      dirY * this.cameraBaseDistance,
      dirZ * this.cameraBaseDistance
    );
  }

  /**
   * Dedicated responsive framing ensuring:
   * 1. Portrait mobile: FOV ~44°, elevated 3/4 perspective looking across city,
   *    floor occupies 26-32% screen width with expansive skyline panorama.
   * 2. Tablet / square: FOV ~40°, balanced framing.
   * 3. Desktop: FOV ~36°, wide skyline vista.
   */
  private updateCameraResponsiveConfig(width: number, height: number) {
    const aspect = width / height;
    this.camera.aspect = aspect;

    if (aspect < 0.75) {
      // Portrait mobile (e.g. 9:16, 9:19.5, 9:20)
      this.camera.fov = 44;
      this.cameraBaseDistance = 45.0;
    } else if (aspect <= 1.25) {
      // Tablet / square
      this.camera.fov = 40;
      this.cameraBaseDistance = 42.0;
    } else {
      // Desktop
      this.camera.fov = 36;
      this.cameraBaseDistance = 38.0;
    }

    this.cameraOffset.copy(this.computeCameraOffsetVector());
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Rotates camera orbit angle by 45 degrees around the vertical Y axis (visual only).
   * Direction: 1 for clockwise (next 45°), -1 for counter-clockwise.
   * Visual-only orbit around tower center: does NOT alter world coordinates, physics, or crane mechanics.
   */
  public rotateCamera(direction: number = 1) {
    if (this.state === 'COLLAPSING' || this.state === 'GAMEOVER') return;

    this.orbitAngleIndex = (this.orbitAngleIndex + direction + 8) % 8;
    this.targetOrbitAngle += direction * (Math.PI / 4);
  }

  public getOrbitAngleDegrees(): number {
    return ((this.orbitAngleIndex * 45) % 360 + 360) % 360;
  }

  private initWorld() {
    // Scenery: Distant City, mountains, clouds, river, sky
    this.scenery = new CityScenery();
    this.scene.add(this.scenery.group);

    // Tower Foundation
    const { group: foundationMesh } = createTowerFoundation();
    this.scene.add(foundationMesh);

    // Crane System
    this.crane = new CraneSystem();
    this.scene.add(this.crane.group);

    // Physics
    this.physics = new PhysicsWorld();
  }

  public startNewGame() {
    this.gameOverTriggered = false;
    this.gameOverReason = 'REAL_TOP_COLLAPSE';
    this.missedFloorFailureDuration = 0;
    this.collapseFailureDuration = 0;
    this.lastReleaseTime = 0;

    // Clean existing floor meshes from scene
    for (const rec of this.physics.records) {
      this.scene.remove(rec.mesh);
    }
    if (this.hangingFloorGroup) {
      this.scene.remove(this.hangingFloorGroup);
      this.hangingFloorGroup = null;
      this.hangingFloorDims = null;
    }

    this.physics.reset();
    this.floorCount = 0;
    this.score = 0;
    this.perfectStreak = 0;
    this.isNewBest = false;
    this.floorStyleHistory = [];
    this.state = 'PLAYING';
    this.callbacks.onStateChange(this.state);

    this.updateStatsUI();

    // Reset camera orbit to default angle (0°) on new run
    this.orbitAngleIndex = 0;
    this.targetOrbitAngle = 0;
    this.currentOrbitAngle = 0;
    this.cameraOffset.copy(this.computeCameraOffsetVector());

    // Reset camera desired target with cinematic elevated 3/4 framing
    const towerTopY = this.physics.getTowerTopY();
    const initialTargetY = Math.max(towerTopY - 3.2, 3.2);
    this.cameraDesiredTarget.set(0, initialTargetY, 0);
    this.cameraTarget.set(0, initialTargetY, 0);
    this.camera.position.set(
      this.cameraTarget.x + this.cameraOffset.x,
      this.cameraTarget.y + this.cameraOffset.y,
      this.cameraTarget.z + this.cameraOffset.z
    );
    this.camera.lookAt(this.cameraTarget);

    // Initialize crane positions (spacious vertical hoist cables and suspended slings)
    const initialDropDistance = getActualDropDistanceForFloor(1);
    const initialFloorTopY = towerTopY + initialDropDistance + 2.3;
    this.currentCraneY = initialFloorTopY + 12.0;
    this.currentHookY = initialFloorTopY + 6.56;
    this.currentTrolleyX = 0;
    this.currentTrolleyZ = 0;
    this.moduleX = 0;
    this.moduleZ = 0;
    this.moduleVelX = 0;
    this.moduleVelZ = 0;
    this.swingOffsetX = 0;
    this.swingOffsetZ = 0;
    this.swingVelocityX = 0;
    this.swingVelocityZ = 0;
    this.craneAccX = 0;
    this.craneAccZ = 0;
    this.trolleyKinematics = null;
    this.suspensionSimulator = null;
    this.prevTurnaroundSign = 0;
    this.cranePhaseX = 0;
    this.cranePhaseZ = 0;
    this.cranePhaseRot = 0;
    this.lastEntrySide = null;
    this.sameEntrySideStreak = 0;
    this.transitionPhase = 'READY';
    this.nextEntrySide = this.selectNextEntrySide();

    // Spawn first suspended floor directly in ready position
    this.spawnNextFloorImmediately();
  }

  /**
   * Selects the next floor archetype using the module selector:
   * - Queries the current environment region from EnvironmentManager (Single Source of Truth)
   * - Biases 82% towards environment-compatible module archetypes and 18% towards UNIVERSAL modules
   * - Preserves the anti-3-in-a-row rule (no archetype can appear 3 times in a row)
   * - Gracefully falls back to UNIVERSAL modules when an environment has no specialized module
   */
  private selectNextFloorStyle(): FloorModuleStyle {
    const nextFloorNumber = this.floorCount + 1;
    const selection = selectFloorModule(nextFloorNumber, this.floorStyleHistory);
    this.floorStyleHistory.push(selection.style);
    return selection.style;
  }

  /**
   * Selects the next entry side ('LEFT' or 'RIGHT') ensuring balanced frequency
   * and enforcing the anti-3-in-a-row rule (no side can appear 4+ consecutive times).
   */
  private selectNextEntrySide(): 'LEFT' | 'RIGHT' {
    if (this.debugForceEntrySide) {
      this.lastEntrySide = this.debugForceEntrySide;
      this.sameEntrySideStreak = 1;
      return this.debugForceEntrySide;
    }

    if (this.sameEntrySideStreak >= 3 && this.lastEntrySide !== null) {
      const forcedSide = this.lastEntrySide === 'LEFT' ? 'RIGHT' : 'LEFT';
      this.lastEntrySide = forcedSide;
      this.sameEntrySideStreak = 1;
      return forcedSide;
    }

    const chosenSide: 'LEFT' | 'RIGHT' = Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
    if (chosenSide === this.lastEntrySide) {
      this.sameEntrySideStreak++;
    } else {
      this.lastEntrySide = chosenSide;
      this.sameEntrySideStreak = 1;
    }
    return chosenSide;
  }

  public setForceEntrySide(side: 'LEFT' | 'RIGHT' | null) {
    this.debugForceEntrySide = side;
  }

  /**
   * Computes a guaranteed off-screen horizontal coordinate (X) for the current camera viewpoint,
   * ensuring that the entire incoming module (and hook/cables) begins completely outside the visible screen.
   */
  public computeOffscreenSpawnX(entrySide: 'LEFT' | 'RIGHT', yLevel: number): number {
    // For standard camera distance and framing, an offscreen spawn of -16.0m (LEFT)
    // or +15.0m (RIGHT) guarantees the entire module (bounding radius ~2.6m) and hook
    // start completely outside the visible screen viewport.
    return entrySide === 'LEFT' ? -16.0 : 15.0;
  }

  private spawnNextFloorImmediately() {
    if (this.state !== 'PLAYING') return;

    if (this.hangingFloorGroup) {
      this.scene.remove(this.hangingFloorGroup);
      this.hangingFloorGroup = null;
      this.hangingFloorDims = null;
    }

    this.hangingFloorStyle = this.selectNextFloorStyle();

    const { group, dimensions } = createFloorModule(this.hangingFloorStyle, this.floorCount + 1);
    this.hangingFloorGroup = group;
    this.hangingFloorDims = dimensions;
    this.scene.add(group);

    const entrySide = this.nextEntrySide || this.selectNextEntrySide();

    // Crane height: above highest placed floor (scaled by early drop distance curve)
    const towerTopY = this.physics.getTowerTopY();
    const floorH = dimensions.height;
    const dropDistance = getActualDropDistanceForFloor(this.floorCount + 1);
    const hangingY = towerTopY + dropDistance + floorH / 2;

    // Guaranteed off-screen spawn point calculated from active camera view
    const spawnX = this.computeOffscreenSpawnX(entrySide, hangingY);

    // Bounded, unique motion profile for this module
    this.currentMotionProfile = createMotionProfile(
      this.floorCount + 1,
      this.hangingFloorStyle,
      entrySide,
      dimensions,
      spawnX
    );

    this.isFloorHanging = true;
    this.canDrop = false; // Enabled once within active gameplay boundary (|moduleX| <= dropBoundary)
    this.transitionPhase = 'READY';
    this.transitionTimer = 0;
    this.moduleHangingTime = 0;
    this.hasLoggedCenterCrossingThisFloor = false;
    this.hasLoggedDropEnabledThisFloor = false;

    const kinematics = getCraneKinematicsForFloor(this.floorCount + 1);

    // Initialize deterministic, smooth TrolleyKinematics
    this.trolleyKinematics = new TrolleyKinematics(
      this.currentMotionProfile.entrySpawnX,
      entrySide,
      kinematics.ampX,
      kinematics.ampZ,
      kinematics.speedMult,
      this.currentMotionProfile.speedVariation
    );

    // Initialize causal SuspensionSimulator
    const difficulty = getDifficultyForFloor(this.floorCount + 1);
    const maxSwingDist = THREE.MathUtils.lerp(0.75, 1.45, difficulty);
    const suspensionHeight = 4.80;

    this.suspensionSimulator = new SuspensionSimulator({
      springKX: this.currentMotionProfile.swingSpringKX,
      springKZ: this.currentMotionProfile.swingSpringKZ,
      damping: this.currentMotionProfile.swingDamping,
      inertiaFactor: this.currentMotionProfile.inertiaFactor,
      rotSpring: this.currentMotionProfile.rotSpring,
      rotDamping: this.currentMotionProfile.rotDamping,
      rotCoupling: this.currentMotionProfile.rotCoupling,
      suspensionHeight,
      maxSwingDist,
      initialAngularOffset: this.currentMotionProfile.initialAngularOffset,
    });

    const initTrolley = this.trolleyKinematics.evaluate(0);
    this.craneX = initTrolley.x;
    this.craneZ = initTrolley.z;
    this.craneVelX = initTrolley.vx;
    this.craneVelZ = initTrolley.vz;
    this.craneAccX = initTrolley.ax;
    this.craneAccZ = initTrolley.az;

    this.currentTrolleyX = initTrolley.x;
    this.currentTrolleyZ = initTrolley.z;
    this.moduleX = initTrolley.x;
    this.prevCenterCrossModX = initTrolley.x;
    this.moduleZ = initTrolley.z;
    this.moduleVelX = initTrolley.vx;
    this.moduleVelZ = initTrolley.vz;
    this.swingOffsetX = 0;
    this.swingOffsetZ = 0;
    this.swingVelocityX = 0;
    this.swingVelocityZ = 0;
    this.craneRotY = this.currentMotionProfile.initialAngularOffset;
    this.craneRotVelY = 0;
    this.prevTurnaroundSign = 0;

    this.hangingFloorGroup.position.set(this.moduleX, hangingY, this.moduleZ);
    this.hangingFloorGroup.rotation.set(0, this.craneRotY, 0);

    const targetY = Math.max(towerTopY - 3.2, 3.2);
    this.cameraDesiredTarget.set(0, targetY, 0);

    console.log(
      `[ModuleEntry] Floor ${this.floorCount + 1}: Entry Side: ${entrySide} | ` +
      `SpawnX: ${this.moduleX.toFixed(2)}m (Off-Screen) | ` +
      `TargetAmpX: ${kinematics.ampX.toFixed(2)}m | ` +
      `SpeedMult: ${this.currentMotionProfile.speedMultiplier.toFixed(2)}`
    );

    this.logFloorMovementSpeed();
    this.logSuspensionPhysics('SPAWN_ENTRY');
    this.logMotionProfile(this.currentMotionProfile);

    const spawnFloor = this.floorCount + 1;
    const spawnSpeed = getSpeedMultiplierForFloor(spawnFloor);
    const spawnAssist = getBaseStabilityAssist(spawnFloor);
    const spawnGrip = getEarlySlipStrength(spawnFloor);
    const dropMultiplier = getDropHeightMultiplierForFloor(spawnFloor);
    const actualDrop = getActualDropDistanceForFloor(spawnFloor);
    const spawnNominalSpeed = spawnSpeed * 3.8;
    console.log(
      `[DifficultyCheck] Spawn Floor: ${spawnFloor} | ` +
      `EffectiveSpeedMultiplier: ${spawnSpeed.toFixed(2)}x | ` +
      `EffectiveMovementSpeed: ${spawnNominalSpeed.toFixed(2)} m/s | ` +
      `DropHeightMultiplier: ${dropMultiplier.toFixed(2)}x | ` +
      `ActualDropDistance: ${actualDrop.toFixed(2)}m | ` +
      `FoundationAssist: ${(spawnAssist * 100).toFixed(0)}% | ` +
      `FoundationFootprintScale: ${GAME_CONFIG.FOUNDATION_FOOTPRINT_SCALE} | ` +
      `EarlySlipStrength: ${spawnGrip.toFixed(2)}`
    );
  }

  public static readonly DROP_ZONE_X_MAX = 8.5;
  public static readonly DROP_ZONE_Z_MAX = 6.0;

  public isInsideDropZone(): boolean {
    return (
      Math.abs(this.moduleX) <= GameEngine.DROP_ZONE_X_MAX &&
      Math.abs(this.moduleZ) <= GameEngine.DROP_ZONE_Z_MAX
    );
  }

  /**
   * The player's ONLY gameplay action:
   * CLICK / TAP / SPACE = RELEASE THE FLOOR.
   * Logs complete [DropInput] diagnostics as requested.
   */
  public releaseCurrentFloor(pointerTarget: string = 'unknown'): boolean {
    const insideDropZone = this.isInsideDropZone();
    const entrySide = this.currentMotionProfile?.entrySide || 'UNKNOWN';

    // Temporary input debugging as specified in Requirement 8
    let blockedReason = 'NONE (Floor released successfully)';
    let isBlocked = false;

    if (this.state !== 'PLAYING') {
      blockedReason = `Game state is ${this.state} (not PLAYING)`;
      isBlocked = true;
    } else if (!this.isFloorHanging || !this.hangingFloorGroup || !this.hangingFloorDims) {
      blockedReason = 'No floor is currently hanging';
      isBlocked = true;
    } else if (this.transitionPhase !== 'READY') {
      blockedReason = `Transition phase is ${this.transitionPhase} (not READY)`;
      isBlocked = true;
    } else if (!this.canDrop) {
      blockedReason = !insideDropZone
        ? `Outside valid drop zone (|X|=${Math.abs(this.moduleX).toFixed(2)} > ${GameEngine.DROP_ZONE_X_MAX})`
        : 'canDrop flag is false';
      isBlocked = true;
    }

    console.log(
      `[DropInput]\n` +
      `  Floor: ${this.floorCount + 1}\n` +
      `  EntrySide: ${entrySide}\n` +
      `  CurrentState: ${this.state}\n` +
      `  CanDrop: ${this.canDrop}\n` +
      `  IsEntering: ${this.trolleyKinematics ? (this.moduleHangingTime < this.trolleyKinematics.T_entryTotal) : false}\n` +
      `  IsReady: ${this.transitionPhase === 'READY'}\n` +
      `  LoadX: ${this.moduleX.toFixed(3)}\n` +
      `  LoadZ: ${this.moduleZ.toFixed(3)}\n` +
      `  InsideDropZone: ${insideDropZone}\n` +
      `  PointerTarget: ${pointerTarget}\n` +
      `  BlockedReason: ${blockedReason}`
    );

    if (isBlocked || !this.hangingFloorGroup || !this.hangingFloorDims) {
      return false;
    }

    const hangingGroup = this.hangingFloorGroup;
    const hangingDims = this.hangingFloorDims;

    sounds.playRelease();

    // Start 1.8s grace period for structural collapse and reset failure timers
    this.lastReleaseTime = performance.now();
    this.missedFloorFailureDuration = 0;
    this.collapseFailureDuration = 0;

    // Lock drop input during in-flight, settling, and delivery sequence
    this.canDrop = false;
    this.isFloorHanging = false;
    this.transitionPhase = 'IN_FLIGHT';
    this.transitionTimer = 0;

    // Calculate release momentum based on smooth difficulty progression
    // Preserves the real instantaneous momentum of the suspended hanging module!
    const momentum = getReleaseMomentumMultipliers(this.floorCount + 1);
    const kinematics = getCraneKinematicsForFloor(this.floorCount + 1);
    const linearVelocity = new THREE.Vector3(
      this.moduleVelX * momentum.linear,
      0,
      this.moduleVelZ * momentum.linear
    );
    const angularVelocityY = this.craneRotVelY * momentum.angular;

    console.log(
      `[ModuleRelease] Floor ${this.floorCount + 1}: Released at X = ${this.moduleX.toFixed(2)}m, Z = ${this.moduleZ.toFixed(2)}m | ` +
      `LinearVel: (${linearVelocity.x.toFixed(2)}, ${linearVelocity.z.toFixed(2)}) m/s | ` +
      `AngVel: ${(angularVelocityY * 180 / Math.PI).toFixed(1)}°/s`
    );

    this.logSuspensionPhysics('RELEASE_DROP');

    if (import.meta.env.DEV) {
      console.debug('[CraneKinematics]', {
        Floor: this.floorCount + 1,
        SpeedMult: kinematics.speedMult.toFixed(2),
        AmpX: kinematics.ampX.toFixed(2),
        AmpZ: kinematics.ampZ.toFixed(2),
        RotY: kinematics.rotY.toFixed(3),
        SwayFactor: kinematics.swayFactor.toFixed(3),
        LinearTransfer: momentum.linear.toFixed(2),
        AngularTransfer: momentum.angular.toFixed(2),
      });
    }

    // Rigid body physics takes over - zero snapping!
    this.physics.releaseFloor(
      this.floorCount + 1,
      hangingGroup,
      hangingDims,
      linearVelocity,
      angularVelocityY
    );

    this.hangingFloorGroup = null;
    this.hangingFloorDims = null;
    return true;
  }

  private updateCraneMotion(delta: number) {
    this.swingTime += delta;

    if (this.isFloorHanging) {
      this.moduleHangingTime += delta;
    }

    // 1. Evaluate causal trolley kinematics
    if (this.trolleyKinematics) {
      const trolleyState = this.trolleyKinematics.evaluate(this.moduleHangingTime);
      this.craneX = trolleyState.x;
      this.craneZ = trolleyState.z;
      this.craneVelX = trolleyState.vx;
      this.craneVelZ = trolleyState.vz;
      this.craneAccX = trolleyState.ax;
      this.craneAccZ = trolleyState.az;

      // Detect turnaround event for physics logging
      if (trolleyState.isTurning && Math.abs(trolleyState.ax) > 0.5) {
        const turnSign = Math.sign(trolleyState.ax);
        if (this.prevTurnaroundSign !== 0 && this.prevTurnaroundSign !== turnSign) {
          this.logSuspensionPhysics('TURNAROUND');
        }
        this.prevTurnaroundSign = turnSign;
      }
    } else {
      this.craneVelX = 0;
      this.craneVelZ = 0;
      this.craneAccX = 0;
      this.craneAccZ = 0;
    }

    // Smooth continuous crane body elevation relative to current surviving tower top
    const towerTopY = this.physics.getTowerTopY();
    const activeFloorH = this.hangingFloorDims ? this.hangingFloorDims.height : 2.3;
    const activeFloorNum = this.isFloorHanging ? this.floorCount + 1 : Math.max(1, this.floorCount);
    const dropDistance = getActualDropDistanceForFloor(activeFloorNum);
    const floorY = towerTopY + dropDistance + activeFloorH / 2;
    const floorTopY = floorY + activeFloorH / 2;

    const targetCraneY = floorTopY + 12.0;
    if (this.currentCraneY === 0) {
      this.currentCraneY = targetCraneY;
    } else {
      const craneAlpha = 1.0 - Math.exp(-2.5 * delta);
      this.currentCraneY = THREE.MathUtils.lerp(this.currentCraneY, targetCraneY, craneAlpha);
    }

    const suspensionHeight = 4.80;
    const saddleOffsetY = 1.76;
    const defaultHookY = floorTopY + suspensionHeight + saddleOffsetY;

    if (this.transitionPhase === 'IN_FLIGHT') {
      const targetRetractY = defaultHookY + 0.8;
      const hookAlpha = 1.0 - Math.exp(-4.0 * delta);
      this.currentHookY = THREE.MathUtils.lerp(this.currentHookY, targetRetractY, hookAlpha);
      this.currentTrolleyX = THREE.MathUtils.lerp(this.currentTrolleyX, this.craneX, hookAlpha);
      this.currentTrolleyZ = THREE.MathUtils.lerp(this.currentTrolleyZ, this.craneZ, hookAlpha);

      this.crane.updatePosition(
        this.currentCraneY,
        this.currentTrolleyX,
        this.currentTrolleyZ,
        this.currentHookY,
        null,
        undefined,
        false
      );
    } else if (this.transitionPhase === 'SETTLING') {
      this.transitionTimer += delta;

      const nextSide = this.nextEntrySide || 'LEFT';
      const targetTrolleyX = this.computeOffscreenSpawnX(nextSide, floorTopY + 2.0);

      const trolleyAlpha = 1.0 - Math.exp(-5.5 * delta);
      this.currentTrolleyX = THREE.MathUtils.lerp(this.currentTrolleyX, targetTrolleyX, trolleyAlpha);
      this.currentTrolleyZ = THREE.MathUtils.lerp(this.currentTrolleyZ, 0, trolleyAlpha);

      const targetRetractY = defaultHookY + 0.6;
      this.currentHookY = THREE.MathUtils.lerp(this.currentHookY, targetRetractY, trolleyAlpha);

      this.crane.updatePosition(
        this.currentCraneY,
        this.currentTrolleyX,
        this.currentTrolleyZ,
        this.currentHookY,
        null,
        undefined,
        false
      );

      if (this.transitionTimer >= 0.45 && this.state === 'PLAYING') {
        this.spawnNextFloorImmediately();
      }
    } else if (this.isFloorHanging && this.hangingFloorGroup && this.hangingFloorDims && this.suspensionSimulator) {
      // ACTIVE CAUSAL SUSPENSION SIMULATION
      this.currentTrolleyX = this.craneX;
      this.currentTrolleyZ = this.craneZ;
      this.currentHookY = defaultHookY;

      const suspension = this.suspensionSimulator.step(
        delta,
        this.craneX,
        this.craneZ,
        this.craneVelX,
        this.craneVelZ,
        this.craneAccX,
        this.craneAccZ
      );

      this.moduleX = suspension.loadX;
      this.moduleZ = suspension.loadZ;
      this.moduleVelX = suspension.loadVelX;
      this.moduleVelZ = suspension.loadVelZ;
      this.swingOffsetX = suspension.swingOffsetX;
      this.swingOffsetZ = suspension.swingOffsetZ;
      this.swingVelocityX = suspension.swingVelocityX;
      this.swingVelocityZ = suspension.swingVelocityZ;
      this.craneRotY = suspension.yawRot;
      this.craneRotVelY = suspension.yawRotVel;

      // Check physical drop boundary:
      // Drop input is enabled as soon as the load is inside the active gameplay area (|X| <= 8.5m, |Z| <= 6.0m)
      // Symmetric and identical for BOTH LEFT and RIGHT entry directions!
      if (!this.canDrop) {
        if (this.isInsideDropZone()) {
          this.canDrop = true;
          if (!this.hasLoggedDropEnabledThisFloor) {
            this.hasLoggedDropEnabledThisFloor = true;
            console.log(
              `[ModuleEntry] Floor ${this.floorCount + 1}: DROP ENABLED inside playfield at X = ${this.moduleX.toFixed(2)}m, Z = ${this.moduleZ.toFixed(2)}m (Moving ${this.moduleVelX >= 0 ? 'RIGHT' : 'LEFT'})`
            );
            this.logSuspensionPhysics('DROP_ENABLED');
          }
        }
      }

      // Center Crossing logging:
      // Verifies high horizontal velocity, zero pause, zero hesitation, and continuous physics
      if (
        this.prevCenterCrossModX !== 0 &&
        this.prevCenterCrossModX * this.moduleX <= 0
      ) {
        const direction = this.moduleVelX >= 0 ? 'RIGHT' : 'LEFT';
        console.log(
          `[CenterCross]\n` +
          `  Floor: ${this.floorCount + 1}\n` +
          `  Direction: ${direction}\n` +
          `  X: ${this.moduleX.toFixed(3)}\n` +
          `  VelocityX: ${this.moduleVelX.toFixed(3)}\n` +
          `  Z: ${this.moduleZ.toFixed(3)}\n` +
          `  VelocityZ: ${this.moduleVelZ.toFixed(3)}\n` +
          `  SwingOffsetX: ${this.swingOffsetX.toFixed(3)}\n` +
          `  SwingOffsetZ: ${this.swingOffsetZ.toFixed(3)}\n` +
          `  SwingVelocityX: ${this.swingVelocityX.toFixed(3)}\n` +
          `  SwingVelocityZ: ${this.swingVelocityZ.toFixed(3)}\n` +
          `  RotationY: ${(this.craneRotY * 180 / Math.PI).toFixed(2)}°\n` +
          `  AngularVelocityY: ${(this.craneRotVelY * 180 / Math.PI).toFixed(2)}°/s\n` +
          `  CurrentState: ${this.state}/${this.transitionPhase}`
        );
        this.logSuspensionPhysics('CENTER_CROSSING');
      }
      this.prevCenterCrossModX = this.moduleX;

      // Central hook block hangs between trolley and load with subtle cable lead
      const hookX = this.craneX + 0.12 * this.swingOffsetX;
      const hookZ = this.craneZ + 0.12 * this.swingOffsetZ;

      this.hangingFloorGroup.position.set(this.moduleX, floorY + suspension.liftY, this.moduleZ);
      this.hangingFloorGroup.rotation.set(suspension.pitchTilt, suspension.yawRot, suspension.rollTilt);

      this.crane.updatePosition(
        this.currentCraneY,
        this.craneX,
        this.craneZ,
        defaultHookY,
        this.hangingFloorGroup,
        this.hangingFloorDims,
        false,
        hookX,
        hookZ
      );
    } else {
      this.crane.updatePosition(
        this.currentCraneY,
        this.craneX,
        this.craneZ,
        defaultHookY,
        null,
        undefined,
        false
      );
    }
  }

  private logMotionProfile(profile: ModuleMotionProfile) {
    console.log(
      `[MotionProfile] Floor: ${profile.floor} | EntrySide: ${profile.entrySide} | SpawnX: ${profile.entrySpawnX.toFixed(2)}m | ` +
      `Difficulty: ${profile.difficulty.toFixed(2)} | ` +
      `SpeedMult: ${profile.speedMultiplier.toFixed(2)} | SpeedVar: ${profile.speedVariation.toFixed(3)} | ` +
      `SpringKX: ${profile.swingSpringKX.toFixed(2)} | SpringKZ: ${profile.swingSpringKZ.toFixed(2)} | ` +
      `Damping: ${profile.swingDamping.toFixed(2)} | InertiaFactor: ${profile.inertiaFactor.toFixed(2)} | ` +
      `AmpX: ${profile.ampX.toFixed(2)}m | AmpZ: ${profile.ampZ.toFixed(2)}m`
    );
  }

  public logSuspensionPhysics(eventLabel: string) {
    console.log(
      `[SuspensionPhysics] Event: ${eventLabel} (Floor ${this.floorCount + 1})\n` +
      `  TrolleyVelocityX:     ${this.craneVelX.toFixed(3)} m/s\n` +
      `  TrolleyAccelerationX: ${this.craneAccX.toFixed(3)} m/s²\n` +
      `  LoadVelocityX:        ${this.moduleVelX.toFixed(3)} m/s\n` +
      `  SwingOffsetX:         ${this.swingOffsetX.toFixed(3)} m\n` +
      `  SwingVelocityX:       ${this.swingVelocityX.toFixed(3)} m/s\n` +
      `  TrolleyVelocityZ:     ${this.craneVelZ.toFixed(3)} m/s\n` +
      `  TrolleyAccelerationZ: ${this.craneAccZ.toFixed(3)} m/s²\n` +
      `  LoadVelocityZ:        ${this.moduleVelZ.toFixed(3)} m/s\n` +
      `  SwingOffsetZ:         ${this.swingOffsetZ.toFixed(3)} m\n` +
      `  SwingVelocityZ:       ${this.swingVelocityZ.toFixed(3)} m/s`
    );
  }

  public logFloorMovementSpeed() {
    if (!this.currentMotionProfile || !this.trolleyKinematics) return;
    const kinematics = getCraneKinematicsForFloor(this.floorCount + 1);
    console.log(
      `[FloorMovementSpeed]\n` +
      `  Floor: ${this.floorCount + 1}\n` +
      `  BaseSpeed: ${GAME_CONFIG.CRANE_MIN_SPEED.toFixed(3)}\n` +
      `  FloorSpeedMultiplier: ${kinematics.speedMult.toFixed(3)}\n` +
      `  ModuleVariation: ${this.currentMotionProfile.speedVariation.toFixed(3)}\n` +
      `  FinalMovementSpeed: ${(kinematics.speedMult * this.currentMotionProfile.speedVariation).toFixed(3)}\n` +
      `  Acceleration: ${this.trolleyKinematics.a_peak_osc.toFixed(3)}\n` +
      `  MaxVelocity: ${this.trolleyKinematics.maxVelocity.toFixed(3)}`
    );
  }

  private handleLandedFloor(tiltAngle: number) {
    const fallenRec = this.physics.currentFallingFloor;
    this.physics.currentFallingFloor = null;

    if (!fallenRec) return;

    // Reset failure timers when a floor successfully lands & stabilizes
    this.missedFloorFailureDuration = 0;
    this.collapseFailureDuration = 0;

    sounds.playImpact(1.0);
    this.floorCount++;

    // 1. Calculate placement metrics against previous floor (or foundation)
    let distOffset = Math.sqrt(
      fallenRec.body.position.x * fallenRec.body.position.x +
      fallenRec.body.position.z * fallenRec.body.position.z
    );

    const prevFloor = this.physics.records[this.physics.records.length - 2];
    if (prevFloor) {
      const dx = fallenRec.body.position.x - prevFloor.body.position.x;
      const dz = fallenRec.body.position.z - prevFloor.body.position.z;
      distOffset = Math.sqrt(dx * dx + dz * dz);
    }

    const rotOffset = Math.abs(this.craneRotY);

    // 2. Authoritative placement quality (Section 32)
    const placementQuality = evaluatePlacementQuality(distOffset, rotOffset, tiltAngle);

    // 3. Apply Hidden Soft Stabilization with authoritative placement quality:
    // Creates an invisible soft LockConstraint between floors (preserving exact position & rotation)
    // and enforces the active physics window (top 4 floors)!
    const { status } = this.physics.applySoftStabilization(
      fallenRec,
      this.floorCount,
      placementQuality
    );

    // 4. Placement Scoring & Feedback using the SAME authoritative quality result (Section 32)
    let pointsAwarded = GAME_CONFIG.BASE_FLOOR_SCORE;
    let feedbackType: FeedbackType = null;
    let feedbackMessage = `+${GAME_CONFIG.BASE_FLOOR_SCORE}`;

    const effectiveFeedback: PlacementQuality =
      (status === 'DANGEROUS' || status === 'RISKY') &&
      placementQuality !== 'PERFECT' &&
      placementQuality !== 'GREAT'
        ? 'RISKY'
        : placementQuality;

    if (effectiveFeedback === 'PERFECT') {
      this.perfectStreak++;
      pointsAwarded += GAME_CONFIG.PERFECT_BONUS; // +2 bonus => 3 total
      feedbackType = 'PERFECT';
      feedbackMessage = this.perfectStreak > 1
        ? `PERFECT x${this.perfectStreak}! +${pointsAwarded}`
        : `PERFECT! +${pointsAwarded}`;
      sounds.playPerfectChime();
    } else if (effectiveFeedback === 'GREAT') {
      this.perfectStreak = 0;
      pointsAwarded += GAME_CONFIG.GREAT_BONUS; // +1 bonus => 2 total
      feedbackType = 'GREAT';
      feedbackMessage = `GREAT! +${pointsAwarded}`;
    } else if (effectiveFeedback === 'RISKY') {
      this.perfectStreak = 0;
      feedbackType = 'RISKY';
      feedbackMessage = 'RISKY!';
      sounds.playCreak();
    } else {
      this.perfectStreak = 0;
      feedbackMessage = `+${pointsAwarded}`;
    }

    this.score += pointsAwarded;

    // Check if new best score
    if (this.score > this.bestScore && this.floorCount > 1) {
      if (!this.isNewBest) {
        this.isNewBest = true;
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.25 },
        });
      }
      this.bestScore = this.score;
      try {
        localStorage.setItem('tower_builder_best_score', this.bestScore.toString());
      } catch {
        // storage fallback
      }
    }

    this.callbacks.onFeedback({
      id: Date.now(),
      type: feedbackType,
      message: feedbackMessage,
    });

    const currentSpeed = getSpeedMultiplierForFloor(this.floorCount);
    const currentAssist = getBaseStabilityAssist(this.floorCount);
    const currentGripWindow = getEarlySlipStrength(this.floorCount);
    const dropMultiplier = getDropHeightMultiplierForFloor(this.floorCount);
    const actualDrop = getActualDropDistanceForFloor(this.floorCount);
    const effectiveMovementSpeed = currentSpeed * 3.8;

    console.log(
      `[DifficultyCheck] Floor: ${this.floorCount} | ` +
      `EffectiveSpeedMultiplier: ${currentSpeed.toFixed(2)}x | ` +
      `EffectiveMovementSpeed: ${effectiveMovementSpeed.toFixed(2)} m/s | ` +
      `DropHeightMultiplier: ${dropMultiplier.toFixed(2)}x | ` +
      `ActualDropDistance: ${actualDrop.toFixed(2)}m | ` +
      `FoundationAssist: ${(currentAssist * 100).toFixed(0)}% | ` +
      `FoundationFootprintScale: ${GAME_CONFIG.FOUNDATION_FOOTPRINT_SCALE} | ` +
      `EarlySlipStrength: ${currentGripWindow.toFixed(2)} | ` +
      `PlacementQuality: ${effectiveFeedback} | ` +
      `SupportRatio: ${fallenRec.supportRatio !== undefined ? Number(fallenRec.supportRatio.toFixed(3)) : 'N/A'}`
    );

    this.updateStatsUI();

    // Internal height calculation preserved for environment and camera progression
    const currentHeight = Math.round(this.floorCount * GAME_CONFIG.METERS_PER_FLOOR);
    if (currentHeight > this.bestHeight && this.floorCount > 1) {
      this.bestHeight = currentHeight;
      try {
        localStorage.setItem('tower_builder_best_height', this.bestHeight.toString());
      } catch {
        // storage fallback
      }
    }

    // PHASE 1 -> PHASE 2:
    // Floor has settled physically.
    // Begin gentle camera follow toward new tower top.
    // Camera does NOT jump! Exponential smoothing gently leads the camera up.
    const towerTopY = this.physics.getTowerTopY();
    const targetY = Math.max(towerTopY - 3.2, 3.2);
    this.cameraDesiredTarget.set(0, targetY, 0);

    // Pre-select next entry side so crane trolley can reposition during settling
    this.nextEntrySide = this.selectNextEntrySide();

    // Begin settling delay in game loop before next floor delivery
    this.transitionPhase = 'SETTLING';
    this.transitionTimer = 0;
  }

  private triggerCollapse(reason: 'MISSED_FLOOR' | 'REAL_TOP_COLLAPSE') {
    if (this.gameOverTriggered || this.state === 'COLLAPSING' || this.state === 'GAMEOVER') return;

    this.gameOverTriggered = true;
    this.gameOverReason = reason;
    this.state = 'COLLAPSING';
    this.collapseStartTime = performance.now();

    const currentSpeed = getSpeedMultiplierForFloor(this.floorCount);
    const currentAssist = getBaseStabilityAssist(this.floorCount);
    const currentGripWindow = getEarlySlipStrength(this.floorCount);
    const dropMultiplier = getDropHeightMultiplierForFloor(this.floorCount);
    const actualDrop = getActualDropDistanceForFloor(this.floorCount);
    console.log(
      `[DifficultyCheck] Collapse Triggered | Floor: ${this.floorCount} | Reason: ${reason} | ` +
      `EffectiveSpeedMultiplier: ${currentSpeed.toFixed(2)}x | ` +
      `DropHeightMultiplier: ${dropMultiplier.toFixed(2)}x | ` +
      `ActualDropDistance: ${actualDrop.toFixed(2)}m | ` +
      `FoundationAssist: ${(currentAssist * 100).toFixed(0)}% | ` +
      `FoundationFootprintScale: ${GAME_CONFIG.FOUNDATION_FOOTPRINT_SCALE} | ` +
      `EarlySlipStrength: ${currentGripWindow.toFixed(2)}`
    );

    // Debug logging matching Requirement 12:
    const activeFloor =
      this.physics.currentFallingFloor ||
      (this.physics.records.length > 0 ? this.physics.records[this.physics.records.length - 1] : null);

    const fallenSettled = this.physics.records.filter(
      (r) =>
        r.settled &&
        r.stableY !== undefined &&
        (r.stableY - r.body.position.y > Math.max(2.5, r.dimensions.height * 1.3) || r.body.position.y < -2.0)
    );

    console.log("GAME OVER:", {
      reason,
      floorCount: this.floorCount,
      activeFloorId: activeFloor ? activeFloor.id : null,
      position: activeFloor
        ? { x: activeFloor.body.position.x, y: activeFloor.body.position.y, z: activeFloor.body.position.z }
        : null,
      stablePosition: activeFloor?.stablePosition || null,
      fallDistance:
        activeFloor && activeFloor.stableY !== undefined ? activeFloor.stableY - activeFloor.body.position.y : null,
      velocity: activeFloor
        ? { x: activeFloor.body.velocity.x, y: activeFloor.body.velocity.y, z: activeFloor.body.velocity.z }
        : null,
      angularVelocity: activeFloor
        ? {
            x: activeFloor.body.angularVelocity.x,
            y: activeFloor.body.angularVelocity.y,
            z: activeFloor.body.angularVelocity.z,
          }
        : null,
      supported: activeFloor ? activeFloor.supportRatio : null,
      activeFallenFloorCount: fallenSettled.length,
    });

    this.updateStatsUI();
    this.callbacks.onStateChange(this.state);
    sounds.playCollapse();

    // Wake all physics bodies dynamically for endgame collapse animation
    this.physics.wakeAllForCollapse();
  }

  private updateCamera(delta: number) {
    if (this.state === 'COLLAPSING' || this.state === 'GAMEOVER') {
      // Collapse camera: Slowly pull outward and reveal the falling crooked tower
      const elapsed = (performance.now() - this.collapseStartTime) / 1000;
      const collapseTarget = new THREE.Vector3(0, Math.max(this.floorCount * 0.9, 4.0), 0);
      const collapseAlpha = 1.0 - Math.exp(-1.5 * delta);
      this.cameraTarget.lerp(collapseTarget, collapseAlpha);

      const pullBackDist = this.cameraBaseDistance * 1.35 + Math.min(elapsed * 6, 20);
      const targetCamPos = new THREE.Vector3(
        this.cameraTarget.x + (this.cameraOffset.x / this.cameraBaseDistance) * pullBackDist,
        this.cameraTarget.y + (this.cameraOffset.y / this.cameraBaseDistance) * pullBackDist * 1.05,
        this.cameraTarget.z + (this.cameraOffset.z / this.cameraBaseDistance) * pullBackDist
      );
      this.camera.position.lerp(targetCamPos, 1.0 - Math.exp(-1.8 * delta));
      this.camera.lookAt(this.cameraTarget);

      // Check if collapse observation time has completed
      if (this.state === 'COLLAPSING' && performance.now() - this.collapseStartTime > GAME_CONFIG.COLLAPSE_OBSERVE_DURATION_MS) {
        this.state = 'GAMEOVER';
        this.callbacks.onStateChange(this.state);
      }
      return;
    }

    // Smooth camera orbit animation to target 45-degree angle (~0.25 - 0.35s)
    const orbitSpeed = 11.0;
    const orbitAlpha = 1.0 - Math.exp(-orbitSpeed * delta);
    this.currentOrbitAngle = THREE.MathUtils.lerp(this.currentOrbitAngle, this.targetOrbitAngle, orbitAlpha);
    if (Math.abs(this.currentOrbitAngle - this.targetOrbitAngle) < 0.0005) {
      this.currentOrbitAngle = this.targetOrbitAngle;
    }
    this.cameraOffset.copy(this.computeCameraOffsetVector());

    // Smooth tracking during gameplay: delta-time-independent exponential smoothing
    const followSpeed = 2.4;
    const alpha = 1.0 - Math.exp(-followSpeed * delta);
    this.cameraTarget.lerp(this.cameraDesiredTarget, alpha);

    const desiredCamPos = new THREE.Vector3(
      this.cameraTarget.x + this.cameraOffset.x,
      this.cameraTarget.y + this.cameraOffset.y,
      this.cameraTarget.z + this.cameraOffset.z
    );

    this.camera.position.lerp(desiredCamPos, alpha);
    this.camera.lookAt(this.cameraTarget);

    // Follow sun light target with camera
    this.sunLight.target.position.copy(this.cameraTarget);
    this.sunLight.target.updateMatrixWorld();
    this.sunLight.position.set(
      this.cameraTarget.x + 35,
      this.cameraTarget.y + 60,
      this.cameraTarget.z + 40
    );
  }

  private updateStatsUI() {
    const currentHeight = Math.round(this.floorCount * GAME_CONFIG.METERS_PER_FLOOR);
    this.callbacks.onStatsUpdate({
      score: this.score,
      bestScore: Math.max(this.bestScore, this.score),
      currentHeight,
      bestHeight: Math.max(this.bestHeight, currentHeight),
      currentFloor: this.floorCount,
      perfectStreak: this.perfectStreak,
      isNewBest: this.isNewBest,
      gameOverReason: this.gameOverReason,
      regionName: this.currentRegionName,
    });
  }

  private loop = (time: number) => {
    this.animId = requestAnimationFrame(this.loop);

    const delta = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    if (this.state === 'PAUSED') {
      return;
    }

    // 1. Scenery environmental animation (traffic, clouds, and continuous vertical journey)
    const regionState = this.scenery.update(
      delta,
      this.cameraTarget.y,
      this.floorCount,
      this.scene,
      this.sunLight,
      this.ambientLight
    );
    if (regionState && regionState.regionName !== this.currentRegionName) {
      this.currentRegionName = regionState.regionName;
      this.updateStatsUI();
    }

    // 2. Physics simulation
    this.physics.step(delta);

    // 3. Crane motion & floor swinging
    if (this.state === 'PLAYING') {
      this.updateCraneMotion(delta);

      // Check if current falling floor has settled or missed
      if (this.physics.currentFallingFloor) {
        const status = this.physics.checkCurrentFloorStatus(delta);
        if (status.settled) {
          this.handleLandedFloor(status.tiltAngle);
          this.missedFloorFailureDuration = 0;
        } else if (status.missed) {
          // Requirement 4: Require continuous failure for 0.75-1.0s before Game Over is confirmed
          this.missedFloorFailureDuration += delta;
          if (this.missedFloorFailureDuration >= 0.75) {
            this.triggerCollapse('MISSED_FLOOR');
          }
        } else {
          // Structure recovered or floor still settling
          this.missedFloorFailureDuration = 0;
        }
      } else {
        this.missedFloorFailureDuration = 0;
      }

      // Partial collapse detection and fallen module cleanup
      const collapseResult = this.physics.processPartialCollapseAndCleanup((mesh) => {
        this.scene.remove(mesh);
      });

      if (collapseResult.newlyDetached.length > 0 && import.meta.env.DEV) {
        for (const detached of collapseResult.newlyDetached) {
          const topId = collapseResult.survivingTopFloor ? collapseResult.survivingTopFloor.id : 'foundation';
          console.debug(
            `[Collapse] Old settled floor fell: #${detached.id} | Surviving top: #${topId} | Run continues.`
          );
        }
      }

      // Check structural collapse (REAL_TOP_COLLAPSE):
      // Requirement: Grace period (disable structural Game Over detection for 1.8s after release)
      const inGracePeriod = performance.now() - this.lastReleaseTime < 1800;

      // Early game safety rule: floors 1-20 are very forgiving and cannot trigger structural collapse
      const isEarlyGame = this.floorCount <= 20;

      if (!inGracePeriod && !isEarlyGame) {
        if (collapseResult.hasSevereCascade) {
          // Requirement: Continuous failure for >= 0.85s before Game Over
          this.collapseFailureDuration += delta;
          if (this.collapseFailureDuration >= 0.85) {
            if (import.meta.env.DEV) {
              console.debug(
                '[Collapse] Major cascade detected. Remaining supported top invalid. GAME OVER.'
              );
            }
            this.triggerCollapse('REAL_TOP_COLLAPSE');
          }
        } else {
          // If structure recovers or remains survivable, cancel failure timer!
          this.collapseFailureDuration = 0;
        }
      } else {
        this.collapseFailureDuration = 0;
      }

      // Smooth camera framing continuously tracking the surviving tower top
      const survivingTopY = this.physics.getTowerTopY();
      const targetY = Math.max(survivingTopY - 3.2, 3.2);
      this.cameraDesiredTarget.set(0, targetY, 0);
    }

    // 4. Smooth camera tracking
    this.updateCamera(delta);

    // 5. Render
    this.renderer.render(this.scene, this.camera);
  };

  public startLoop() {
    if (!this.animId) {
      this.lastTime = performance.now();
      this.animId = requestAnimationFrame(this.loop);
    }
  }

  public pause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.callbacks.onStateChange(this.state);
    }
  }

  public resume() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      this.callbacks.onStateChange(this.state);
    }
  }

  public getState(): GameState {
    return this.state;
  }

  private onWindowResize() {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.updateCameraResponsiveConfig(width, height);
  }

  public destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this.boundResize);
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

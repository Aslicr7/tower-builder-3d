import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { FeedbackEvent, FeedbackType, FloorDimensions, FloorModuleStyle, GameState, GameStats } from '../types';
import { sounds } from '../audio/sound';
import { CityScenery } from './cityScenery';
import { CraneSystem } from './crane';
import { createFloorModule, createTowerFoundation } from './floorGenerator';
import { selectFloorModule } from './moduleSelector';
import { getReleaseMomentumMultipliers, getCraneKinematicsForFloor } from './difficultyCurve';
import { PhysicsWorld } from './physicsWorld';
import { GAME_CONFIG } from './constants';
import { createMotionProfile, ModuleMotionProfile } from './motionProfile';

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
  private craneRotVelY = 0;

  // Hanging module suspension & pendulum dynamics (lag, swing, tilt, inertia)
  private moduleX = 0;
  private moduleZ = 0;
  private moduleVelX = 0;
  private moduleVelZ = 0;

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

  // Continuous Smooth Drop & Delivery Transition State Machine
  private transitionPhase: 'READY' | 'IN_FLIGHT' | 'SETTLING' | 'DELIVERING' | 'SUSPENDING' = 'READY';
  private transitionTimer = 0;
  private readonly blendDuration = 0.45;
  private startPitchTilt = 0;
  private startRollTilt = 0;
  private startYawRot = 0;
  private cranePhaseX = 0;
  private cranePhaseZ = 0;
  private cranePhaseRot = 0;
  private loggedHandoffMilestones = new Set<number>();
  private canDrop = true;
  private currentCraneY = 0;
  private currentHookY = 0;
  private currentTrolleyX = 0;
  private currentTrolleyZ = 0;
  private currentMotionProfile: ModuleMotionProfile | null = null;

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
    const initialFloorTopY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + 2.3;
    this.currentCraneY = initialFloorTopY + 12.0;
    this.currentHookY = initialFloorTopY + 6.56;
    this.currentTrolleyX = 0;
    this.currentTrolleyZ = 0;
    this.moduleX = 0;
    this.moduleZ = 0;
    this.moduleVelX = 0;
    this.moduleVelZ = 0;
    this.cranePhaseX = 0;
    this.cranePhaseZ = 0;
    this.cranePhaseRot = 0;
    this.startPitchTilt = 0;
    this.startRollTilt = 0;
    this.startYawRot = 0;
    this.loggedHandoffMilestones.clear();

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

  private spawnNextFloorImmediately() {
    if (this.state !== 'PLAYING') return;

    this.hangingFloorStyle = this.selectNextFloorStyle();

    const { group, dimensions } = createFloorModule(this.hangingFloorStyle, this.floorCount + 1);
    this.hangingFloorGroup = group;
    this.hangingFloorDims = dimensions;
    this.scene.add(group);

    // Bounded, unique motion profile for this module
    this.currentMotionProfile = createMotionProfile(this.floorCount + 1, this.hangingFloorStyle, dimensions);

    this.isFloorHanging = true;
    this.canDrop = true;
    this.transitionPhase = 'READY';
    this.transitionTimer = 0;
    this.currentTrolleyX = this.currentMotionProfile.targetEntryX;
    this.currentTrolleyZ = this.currentMotionProfile.targetEntryZ;
    this.moduleX = this.currentMotionProfile.targetEntryX;
    this.moduleZ = this.currentMotionProfile.targetEntryZ;
    this.moduleVelX = 0;
    this.moduleVelZ = 0;
    this.cranePhaseX = this.currentMotionProfile.startPhaseX;
    this.cranePhaseZ = this.currentMotionProfile.startPhaseZ;
    this.cranePhaseRot = this.currentMotionProfile.startPhaseRot;

    // Crane height: above highest placed floor
    const towerTopY = this.physics.getTowerTopY();
    const floorH = dimensions.height;
    const hangingY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + floorH / 2;

    this.hangingFloorGroup.position.set(this.moduleX, hangingY, this.moduleZ);

    const targetY = Math.max(towerTopY - 3.2, 3.2);
    this.cameraDesiredTarget.set(0, targetY, 0);

    this.logMotionProfile(this.currentMotionProfile);
  }

  /**
   * The player's ONLY gameplay action:
   * CLICK / TAP / SPACE = RELEASE THE FLOOR.
   */
  public releaseCurrentFloor() {
    if (
      !this.canDrop ||
      this.transitionPhase !== 'READY' ||
      this.state !== 'PLAYING' ||
      !this.isFloorHanging ||
      !this.hangingFloorGroup ||
      !this.hangingFloorDims
    ) {
      return;
    }

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
      this.hangingFloorGroup,
      this.hangingFloorDims,
      linearVelocity,
      angularVelocityY
    );

    this.hangingFloorGroup = null;
    this.hangingFloorDims = null;
  }

  private updateCraneMotion(delta: number) {
    this.swingTime += delta;

    // Single source of truth: Crane kinematics from difficulty curve
    const kinematics = getCraneKinematicsForFloor(this.floorCount + 1);
    const swingXRange = kinematics.ampX;
    const swingZRange = kinematics.ampZ;
    const rotYRange = kinematics.rotY;

    const profile = this.currentMotionProfile;

    // Subtle slow speed modulation drift (±3%, non-synchronized slow wave ~28-36s period)
    const slowWave = profile
      ? profile.speedModulationAmp * Math.sin(this.swingTime * profile.speedModulationFreq + profile.speedModulationPhase)
      : 0;
    const speedMod = 1.0 + slowWave;

    const prevX = this.craneX;
    const prevZ = this.craneZ;
    const prevRot = this.craneRotY;

    // 1. Advance crane oscillation phases using independent, incommensurable frequencies
    const freqX = (profile ? profile.freqX : GAME_CONFIG.CRANE_MIN_SPEED * kinematics.speedMult) * speedMod;
    this.cranePhaseX += delta * freqX;
    this.craneX = Math.sin(this.cranePhaseX) * swingXRange;

    // 2. Movement along depth/Z axis (independent frequency & phase)
    const freqZ = (profile ? profile.freqZ : GAME_CONFIG.CRANE_MIN_SPEED * kinematics.speedMult * 0.73) * speedMod;
    this.cranePhaseZ += delta * freqZ;
    this.craneZ = Math.cos(this.cranePhaseZ) * swingZRange;

    // 3. Rotation around vertical Y axis (independent frequency & phase)
    const freqRot = (profile ? profile.freqRot : GAME_CONFIG.CRANE_MIN_SPEED * kinematics.speedMult * 0.59) * speedMod;
    this.cranePhaseRot += delta * freqRot;
    this.craneRotY = Math.sin(this.cranePhaseRot) * rotYRange;

    // Calculate velocities for momentum preservation
    this.craneVelX = delta > 0 ? (this.craneX - prevX) / delta : 0;
    this.craneVelZ = delta > 0 ? (this.craneZ - prevZ) / delta : 0;
    this.craneRotVelY = delta > 0 ? (this.craneRotY - prevRot) / delta : 0;

    // Smooth continuous crane body elevation relative to current surviving tower top
    const towerTopY = this.physics.getTowerTopY();
    const activeFloorH = this.hangingFloorDims ? this.hangingFloorDims.height : 2.3;
    const floorY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + activeFloorH / 2;
    const floorTopY = floorY + activeFloorH / 2;

    // Crane boom elevation: raised so hook has ample vertical cable travel
    const targetCraneY = floorTopY + 12.0;
    if (this.currentCraneY === 0) {
      this.currentCraneY = targetCraneY;
    } else {
      const craneAlpha = 1.0 - Math.exp(-2.5 * delta);
      this.currentCraneY = THREE.MathUtils.lerp(this.currentCraneY, targetCraneY, craneAlpha);
    }

    // Increased visible distance between hook and module (Requirement 5 & 9):
    // Hook saddle hangs at floorTopY + 4.80m; hook block center is at saddle + 1.76m = floorTopY + 6.56m
    const suspensionHeight = 4.80;
    const saddleOffsetY = 1.76;
    const defaultHookY = floorTopY + suspensionHeight + saddleOffsetY;

    if (this.transitionPhase === 'IN_FLIGHT') {
      // Floor in flight: Hook stays suspended above, retracting slightly clear of falling floor
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
        null, // Slings release from falling floor!
        undefined,
        false
      );
    } else if (this.transitionPhase === 'SETTLING') {
      // PHASE 1 -> PHASE 2: Allow visible settling (0.45s) while camera gently drifts upward
      this.transitionTimer += delta;

      const pickupX = CraneSystem.MAST_X - 2.5;
      const trolleyAlpha = 1.0 - Math.exp(-3.5 * delta);
      this.currentTrolleyX = THREE.MathUtils.lerp(this.currentTrolleyX, pickupX, trolleyAlpha);
      this.currentTrolleyZ = THREE.MathUtils.lerp(this.currentTrolleyZ, CraneSystem.MAST_Z, trolleyAlpha);

      const targetRetractY = defaultHookY + 0.5;
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
        // Transition to PHASE 3: NEXT FLOOR ARRIVAL
        this.transitionPhase = 'DELIVERING';
        this.transitionTimer = 0;

        // Pre-create next floor module at crane jib pickup position
        this.hangingFloorStyle = this.selectNextFloorStyle();

        const { group, dimensions } = createFloorModule(this.hangingFloorStyle, this.floorCount + 1);
        this.hangingFloorGroup = group;
        this.hangingFloorDims = dimensions;
        this.scene.add(group);

        // Generate bounded per-module motion profile for the newly created module
        this.currentMotionProfile = createMotionProfile(this.floorCount + 1, this.hangingFloorStyle, dimensions);

        const pickupFloorY = floorY + 1.2;
        this.hangingFloorGroup.position.set(pickupX, pickupFloorY, CraneSystem.MAST_Z);
        this.hangingFloorGroup.rotation.set(0, 0, 0);

        this.currentTrolleyX = pickupX;
        this.currentTrolleyZ = CraneSystem.MAST_Z;
        this.currentHookY = pickupFloorY + dimensions.height / 2 + suspensionHeight + saddleOffsetY;
        this.moduleX = pickupX;
        this.moduleZ = CraneSystem.MAST_Z;
        this.moduleVelX = 0;
        this.moduleVelZ = 0;
      }
    } else if (this.transitionPhase === 'DELIVERING' && this.hangingFloorGroup && this.hangingFloorDims) {
      // PHASE 3: NEXT FLOOR TRANSPORT
      // Trolley smoothly glides along crane boom into active gameplay area over 0.85s
      this.transitionTimer += delta;
      const deliveryDuration = 0.85;
      const p = Math.min(this.transitionTimer / deliveryDuration, 1.0);
      const ease = p * p * (3 - 2 * p); // Smoothstep easing

      const pickupX = CraneSystem.MAST_X - 2.5;
      const pickupZ = CraneSystem.MAST_Z;
      const pickupFloorY = floorY + 1.2;
      const targetFloorY = floorY;
      const entryX = this.currentMotionProfile ? this.currentMotionProfile.targetEntryX : 0;
      const entryZ = this.currentMotionProfile ? this.currentMotionProfile.targetEntryZ : 0;

      const prevTrolleyX = this.currentTrolleyX;
      const prevTrolleyZ = this.currentTrolleyZ;
      this.currentTrolleyX = THREE.MathUtils.lerp(pickupX, entryX, ease);
      this.currentTrolleyZ = THREE.MathUtils.lerp(pickupZ, entryZ, ease);

      const curFloorY = THREE.MathUtils.lerp(pickupFloorY, targetFloorY, ease);

      // Instantaneous trolley velocity derived from actual delta
      const tVelX = delta > 0 ? (this.currentTrolleyX - prevTrolleyX) / delta : 0;
      const tVelZ = delta > 0 ? (this.currentTrolleyZ - prevTrolleyZ) / delta : 0;

      // Suspended module lags naturally behind the moving trolley (small natural lag, 1°–3° tilt)
      const lagTime = 0.035;
      const targetModX = this.currentTrolleyX - tVelX * lagTime;
      const targetModZ = this.currentTrolleyZ - tVelZ * lagTime;
      const followAlpha = 1.0 - Math.exp(-12.0 * delta);
      const prevModX = this.moduleX;
      const prevModZ = this.moduleZ;
      this.moduleX = THREE.MathUtils.lerp(this.moduleX, targetModX, followAlpha);
      this.moduleZ = THREE.MathUtils.lerp(this.moduleZ, targetModZ, followAlpha);
      this.moduleVelX = delta > 0 ? (this.moduleX - prevModX) / delta : 0;
      this.moduleVelZ = delta > 0 ? (this.moduleZ - prevModZ) / delta : 0;

      // Natural tilt from suspension sling angle during transport
      const curRollTilt = -(this.moduleX - this.currentTrolleyX) / suspensionHeight;
      const curPitchTilt = (this.moduleZ - this.currentTrolleyZ) / suspensionHeight;

      this.hangingFloorGroup.position.set(this.moduleX, curFloorY, this.moduleZ);
      this.hangingFloorGroup.rotation.set(curPitchTilt, 0, curRollTilt);

      this.currentHookY = curFloorY + this.hangingFloorDims.height / 2 + suspensionHeight + saddleOffsetY;

      // Central hook block has subtle lead between trolley and load
      const hookX = this.currentTrolleyX + 0.12 * (this.moduleX - this.currentTrolleyX);
      const hookZ = this.currentTrolleyZ + 0.12 * (this.moduleZ - this.currentTrolleyZ);

      this.crane.updatePosition(
        this.currentCraneY,
        this.currentTrolleyX,
        this.currentTrolleyZ,
        this.currentHookY,
        this.hangingFloorGroup,
        this.hangingFloorDims,
        false,
        hookX,
        hookZ
      );

      if (p >= 1.0) {
        // Seamless handoff into 0.45s suspension blend (Phase 4: SUSPENDING)
        this.transitionPhase = 'SUSPENDING';
        this.transitionTimer = 0;
        this.startRollTilt = curRollTilt;
        this.startPitchTilt = curPitchTilt;
        this.startYawRot = 0;

        // Phase synchronization: establish oscillation phases from motion profile - zero positional or velocity discontinuity!
        this.cranePhaseX = this.currentMotionProfile ? this.currentMotionProfile.startPhaseX : Math.PI;
        this.cranePhaseZ = this.currentMotionProfile ? this.currentMotionProfile.startPhaseZ : -Math.PI / 2;
        this.cranePhaseRot = this.currentMotionProfile ? this.currentMotionProfile.startPhaseRot : 0;
        this.loggedHandoffMilestones.clear();
      }
    } else if (this.transitionPhase === 'SUSPENDING' && this.hangingFloorGroup && this.hangingFloorDims) {
      // PHASE 4: SUSPENSION BLEND (0.45s)
      // Smoothly blend transport influence (1.0 -> 0.0) into full suspension influence (0.0 -> 1.0)
      this.transitionTimer += delta;
      const u = Math.min(this.transitionTimer / this.blendDuration, 1.0);
      const blendAlpha = u * u * (3 - 2 * u); // Smoothstep 0.0 -> 1.0
      const swingStrength = blendAlpha; // 0% -> 20% -> 50% -> 80% -> 100%

      this.currentTrolleyX = this.craneX;
      this.currentTrolleyZ = this.craneZ;
      this.currentHookY = defaultHookY;

      // Natural pendulum simulation parameters smoothly ramping into motion profile values:
      const targetSpringKX = this.currentMotionProfile ? this.currentMotionProfile.swingSpringKX : 5.2;
      const targetSpringKZ = this.currentMotionProfile ? this.currentMotionProfile.swingSpringKZ : 5.2;
      const targetDamping = this.currentMotionProfile ? this.currentMotionProfile.swingDamping : 1.35;

      const springKX = THREE.MathUtils.lerp(3.2, targetSpringKX, swingStrength);
      const springKZ = THREE.MathUtils.lerp(3.0, targetSpringKZ, swingStrength);
      const damping = THREE.MathUtils.lerp(2.2, targetDamping, swingStrength);

      const normDiff = Math.min(Math.max(this.floorCount / 50, 0), 1.0);
      const maxSwingDist = THREE.MathUtils.lerp(0.75, 1.45, normDiff);

      const dispX = this.moduleX - this.craneX;
      const dispZ = this.moduleZ - this.craneZ;
      const relVelX = this.moduleVelX - this.craneVelX;
      const relVelZ = this.moduleVelZ - this.craneVelZ;

      const accX = -springKX * dispX - damping * relVelX;
      const accZ = -springKZ * dispZ - damping * relVelZ;

      const stepDt = Math.min(delta, 0.05);
      this.moduleVelX += accX * stepDt;
      this.moduleVelZ += accZ * stepDt;
      this.moduleX += this.moduleVelX * stepDt;
      this.moduleZ += this.moduleVelZ * stepDt;

      const curDispX = this.moduleX - this.craneX;
      const curDispZ = this.moduleZ - this.craneZ;
      const curDist = Math.sqrt(curDispX * curDispX + curDispZ * curDispZ);

      if (curDist > maxSwingDist && curDist > 0.0001) {
        const scale = maxSwingDist / curDist;
        this.moduleX = this.craneX + curDispX * scale;
        this.moduleZ = this.craneZ + curDispZ * scale;
        const normX = curDispX / curDist;
        const normZ = curDispZ / curDist;
        const vDotN = this.moduleVelX * normX + this.moduleVelZ * normZ;
        if (vDotN > 0) {
          this.moduleVelX -= vDotN * normX;
          this.moduleVelZ -= vDotN * normZ;
        }
      }

      const hookX = this.craneX + 0.12 * (this.moduleX - this.craneX);
      const hookZ = this.craneZ + 0.12 * (this.moduleZ - this.craneZ);

      // Smoothly blend tilt from transport starting tilt to full suspension sling tilt
      const targetRollTilt = -(this.moduleX - this.craneX) / suspensionHeight;
      const targetPitchTilt = (this.moduleZ - this.craneZ) / suspensionHeight;
      const rollTilt = THREE.MathUtils.lerp(this.startRollTilt, targetRollTilt, swingStrength);
      const pitchTilt = THREE.MathUtils.lerp(this.startPitchTilt, targetPitchTilt, swingStrength);

      // Smoothly blend yaw rotation from 0 to full crane rotation oscillation
      const yawRot = THREE.MathUtils.lerp(this.startYawRot, this.craneRotY, blendAlpha);

      const liftY = (curDispX * curDispX + curDispZ * curDispZ) / (2 * suspensionHeight);

      this.hangingFloorGroup.position.set(this.moduleX, floorY + liftY, this.moduleZ);
      this.hangingFloorGroup.rotation.set(pitchTilt, yawRot, rollTilt);

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

      // Section 28 Dev Debug Log around handoff
      this.logHandoffState(u, pitchTilt, rollTilt, yawRot);

      if (u >= 1.0) {
        this.transitionPhase = 'READY';
        this.isFloorHanging = true;
        this.canDrop = true; // Player input safely re-enabled in active play area
        if (this.currentMotionProfile) {
          this.logMotionProfile(this.currentMotionProfile);
        }
      }
    } else if (this.isFloorHanging && this.hangingFloorGroup && this.hangingFloorDims) {
      // PHASE 5 / SUSPENDED LOAD PENDULUM SIMULATION (Full Gameplay Suspension)
      // The module has its own independent suspension state; the trolley acts as the moving anchor.
      this.currentTrolleyX = this.craneX;
      this.currentTrolleyZ = this.craneZ;
      this.currentHookY = defaultHookY;

      // Natural pendulum simulation parameters from active module's motion profile:
      const springKX = this.currentMotionProfile ? this.currentMotionProfile.swingSpringKX : 5.2;
      const springKZ = this.currentMotionProfile ? this.currentMotionProfile.swingSpringKZ : 5.2;
      const damping = this.currentMotionProfile ? this.currentMotionProfile.swingDamping : 1.35;

      // Clamped swing angle/displacement based on floor difficulty (Requirement 23: 10°–17.5° max)
      const normDiff = Math.min(Math.max(this.floorCount / 50, 0), 1.0);
      const maxSwingDist = THREE.MathUtils.lerp(0.75, 1.45, normDiff);

      // Relative displacement and velocity between suspended module and trolley anchor
      const dispX = this.moduleX - this.craneX;
      const dispZ = this.moduleZ - this.craneZ;
      const relVelX = this.moduleVelX - this.craneVelX;
      const relVelZ = this.moduleVelZ - this.craneVelZ;

      // Dynamic acceleration on the suspended module
      const accX = -springKX * dispX - damping * relVelX;
      const accZ = -springKZ * dispZ - damping * relVelZ;

      const stepDt = Math.min(delta, 0.05);
      this.moduleVelX += accX * stepDt;
      this.moduleVelZ += accZ * stepDt;
      this.moduleX += this.moduleVelX * stepDt;
      this.moduleZ += this.moduleVelZ * stepDt;

      // Soft clamp displacement so the suspended load remains safe and predictable
      const curDispX = this.moduleX - this.craneX;
      const curDispZ = this.moduleZ - this.craneZ;
      const curDist = Math.sqrt(curDispX * curDispX + curDispZ * curDispZ);

      if (curDist > maxSwingDist && curDist > 0.0001) {
        const scale = maxSwingDist / curDist;
        this.moduleX = this.craneX + curDispX * scale;
        this.moduleZ = this.craneZ + curDispZ * scale;
        const normX = curDispX / curDist;
        const normZ = curDispZ / curDist;
        const vDotN = this.moduleVelX * normX + this.moduleVelZ * normZ;
        if (vDotN > 0) {
          this.moduleVelX -= vDotN * normX;
          this.moduleVelZ -= vDotN * normZ;
        }
      }

      // Central hook block hangs between trolley and load with subtle cable lead
      const hookX = this.craneX + 0.12 * (this.moduleX - this.craneX);
      const hookZ = this.craneZ + 0.12 * (this.moduleZ - this.craneZ);

      // Visual roll and pitch tilt resulting from sling angle
      const rollTilt = -(this.moduleX - this.craneX) / suspensionHeight;
      const pitchTilt = (this.moduleZ - this.craneZ) / suspensionHeight;
      const yawRot = this.craneRotY;

      // Subtle vertical arc lift during lateral swing
      const liftY = (curDispX * curDispX + curDispZ * curDispZ) / (2 * suspensionHeight);

      this.hangingFloorGroup.position.set(this.moduleX, floorY + liftY, this.moduleZ);
      this.hangingFloorGroup.rotation.set(pitchTilt, yawRot, rollTilt);

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
      `[MotionProfile] Floor: ${profile.floor} | Difficulty: ${profile.difficulty.toFixed(2)} | ` +
      `XFrequency: ${profile.freqX.toFixed(3)} | ZFrequency: ${profile.freqZ.toFixed(3)} | ` +
      `XPhase: ${profile.startPhaseX.toFixed(2)} | ZPhase: ${profile.startPhaseZ.toFixed(2)} | ` +
      `SwingXFactor: ${(profile.swingSpringKX / 5.2).toFixed(2)} | ` +
      `SwingZFactor: ${(profile.swingSpringKZ / 5.2).toFixed(2)} | ` +
      `RotationFrequency: ${profile.freqRot.toFixed(3)} | ` +
      `RotationPhase: ${profile.startPhaseRot.toFixed(2)} | ` +
      `SpeedMultiplier: ${profile.speedMultiplier.toFixed(2)}`
    );
  }

  private logHandoffState(u: number, pitch: number, roll: number, yaw: number) {
    const milestones = [0.0, 0.25, 0.5, 0.75, 1.0];
    for (const m of milestones) {
      if (u >= m && !this.loggedHandoffMilestones.has(m)) {
        this.loggedHandoffMilestones.add(m);
        const swingOffsetX = this.moduleX - this.currentTrolleyX;
        const swingOffsetZ = this.moduleZ - this.currentTrolleyZ;
        const swingVelX = this.moduleVelX - this.craneVelX;
        const swingVelZ = this.moduleVelZ - this.craneVelZ;
        console.log(
          `[SuspensionHandoff] State: ${this.transitionPhase} | Blend: ${u.toFixed(2)} | ` +
          `ModulePosition: (${this.moduleX.toFixed(3)}, ${this.moduleZ.toFixed(3)}) | ` +
          `ModuleVelocity: (${this.moduleVelX.toFixed(3)}, ${this.moduleVelZ.toFixed(3)}) | ` +
          `SwingOffsetX: ${swingOffsetX.toFixed(3)} | SwingOffsetZ: ${swingOffsetZ.toFixed(3)} | ` +
          `SwingVelocityX: ${swingVelX.toFixed(3)} | SwingVelocityZ: ${swingVelZ.toFixed(3)} | ` +
          `Rotation: (P:${(pitch * 180 / Math.PI).toFixed(1)}°, Y:${(yaw * 180 / Math.PI).toFixed(1)}°, R:${(roll * 180 / Math.PI).toFixed(1)}°) | ` +
          `TrolleyPosition: (${this.currentTrolleyX.toFixed(3)}, ${this.currentTrolleyZ.toFixed(3)}) | ` +
          `TrolleyVelocity: (${this.craneVelX.toFixed(3)}, ${this.craneVelZ.toFixed(3)})`
        );
        break;
      }
    }
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

    // Apply Hidden Soft Stabilization:
    // Creates an invisible soft LockConstraint between floors (preserving exact position & rotation)
    // and enforces the active physics window (top 4 floors)!
    const { status } = this.physics.applySoftStabilization(fallenRec, this.floorCount);

    // Alignment evaluation against previous floor (or foundation)
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

    // Placement Scoring & Feedback (Parts 2, 3, 4, 5)
    let pointsAwarded = GAME_CONFIG.BASE_FLOOR_SCORE;
    let feedbackType: FeedbackType = null;
    let feedbackMessage = `+${GAME_CONFIG.BASE_FLOOR_SCORE}`;

    if (distOffset < GAME_CONFIG.PERFECT_THRESHOLD_DIST && rotOffset < GAME_CONFIG.PERFECT_THRESHOLD_ROT) {
      this.perfectStreak++;
      pointsAwarded += GAME_CONFIG.PERFECT_BONUS; // +2 bonus => 3 total
      feedbackType = 'PERFECT';
      feedbackMessage = this.perfectStreak > 1
        ? `PERFECT x${this.perfectStreak}! +${pointsAwarded}`
        : `PERFECT! +${pointsAwarded}`;
      sounds.playPerfectChime();
    } else if (distOffset < GAME_CONFIG.GREAT_THRESHOLD_DIST) {
      this.perfectStreak = 0;
      pointsAwarded += GAME_CONFIG.GREAT_BONUS; // +1 bonus => 2 total
      feedbackType = 'GREAT';
      feedbackMessage = `GREAT! +${pointsAwarded}`;
    } else if (status === 'RISKY' || status === 'DANGEROUS' || distOffset > 1.6 || tiltAngle > 0.45) {
      this.perfectStreak = 0;
      feedbackType = 'RISKY';
      feedbackMessage = `RISKY! +${pointsAwarded}`;
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

  /**
   * Diagnostic / Testing tool: Allows instant warp to any target floor
   * to immediately verify all 10 environment regions (e.g. Floors 5, 15, 25, 34, 41, 48, 55, 62, 69, 76, 85).
   */
  public jumpToFloorForTesting(targetFloor: number) {
    if (this.state === 'GAMEOVER' || this.state === 'COLLAPSING') {
      this.state = 'PLAYING';
      this.gameOverTriggered = false;
      this.missedFloorFailureDuration = 0;
      this.collapseFailureDuration = 0;
      this.callbacks.onStateChange(this.state);
    }

    this.floorCount = Math.max(0, targetFloor);
    this.score = this.floorCount * GAME_CONFIG.BASE_FLOOR_SCORE;
    const towerTopY = this.floorCount * 2.3;
    const initialTargetY = Math.max(towerTopY - 3.2, 3.2);

    this.cameraDesiredTarget.set(0, initialTargetY, 0);
    this.cameraTarget.set(0, initialTargetY, 0);
    this.camera.position.set(
      this.cameraTarget.x + this.cameraOffset.x,
      this.cameraTarget.y + this.cameraOffset.y,
      this.cameraTarget.z + this.cameraOffset.z
    );
    this.camera.lookAt(this.cameraTarget);

    const floorTopY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + 2.3;
    this.currentCraneY = floorTopY + 12.0;
    this.currentHookY = floorTopY + 6.56;
    this.moduleX = 0;
    this.moduleZ = 0;
    this.moduleVelX = 0;
    this.moduleVelZ = 0;
    this.transitionPhase = 'READY';
    this.canDrop = true;
    this.isFloorHanging = true;
    this.cranePhaseX = 0;
    this.cranePhaseZ = 0;
    this.cranePhaseRot = 0;
    this.startPitchTilt = 0;
    this.startRollTilt = 0;
    this.startYawRot = 0;
    this.loggedHandoffMilestones.clear();

    if (this.hangingFloorGroup && this.hangingFloorDims) {
      const hangingY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + this.hangingFloorDims.height / 2;
      this.hangingFloorGroup.position.set(0, hangingY, 0);
    }

    // Immediately trigger scenery update
    const regionState = this.scenery.update(
      0.016,
      this.cameraTarget.y,
      this.floorCount,
      this.scene,
      this.sunLight,
      this.ambientLight
    );
    if (regionState) {
      this.currentRegionName = regionState.regionName;
    }
    this.updateStatsUI();
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

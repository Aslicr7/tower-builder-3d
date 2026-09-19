import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { FeedbackEvent, FloorDimensions, FloorModuleStyle, GameState, GameStats } from '../types';
import { sounds } from '../audio/sound';
import { CityScenery } from './cityScenery';
import { CraneSystem } from './crane';
import { ALL_STYLES, createFloorModule, createTowerFoundation } from './floorGenerator';
import { PhysicsWorld } from './physicsWorld';
import { GAME_CONFIG } from './constants';

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
  private bestHeight = 0;
  private perfectStreak = 0;
  private isNewBest = false;

  // Active hanging floor
  private hangingFloorGroup: THREE.Group | null = null;
  private hangingFloorDims: FloorDimensions | null = null;
  private hangingFloorStyle: FloorModuleStyle = 'GLASS_MODERN';
  private isFloorHanging = false;

  // Crane motion state
  private swingTime = 0;
  private craneX = 0;
  private craneZ = 0;
  private craneRotY = 0;
  private craneVelX = 0;
  private craneVelZ = 0;
  private craneRotVelY = 0;

  // Camera tracking
  private cameraTarget = new THREE.Vector3(0, 3.2, 0);
  private cameraDesiredTarget = new THREE.Vector3(0, 3.2, 0);
  private cameraOffset = new THREE.Vector3(20, 13, 31);
  private cameraBaseDistance = 38.0;
  private collapseStartTime = 0;

  // Game Over & Failure Timing States
  private gameOverTriggered = false;
  private gameOverReason: 'MISSED_FLOOR' | 'REAL_TOP_COLLAPSE' = 'REAL_TOP_COLLAPSE';
  private lastReleaseTime = 0;
  private missedFloorFailureDuration = 0;
  private collapseFailureDuration = 0;

  // Continuous Smooth Drop & Delivery Transition State Machine
  private transitionPhase: 'READY' | 'IN_FLIGHT' | 'SETTLING' | 'DELIVERING' = 'READY';
  private transitionTimer = 0;
  private canDrop = true;
  private currentCraneY = 0;
  private currentHookY = 0;
  private currentTrolleyX = 0;
  private currentTrolleyZ = 0;

  // Animation frame
  private animId: number | null = null;
  private lastTime = 0;
  private boundResize: () => void;
  private currentRegionName = 'CITY / GROUND';

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // Load saved best height from localStorage
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

    // Cinematic elevated 3/4 viewing angle:
    // Gentle 9.5° downward elevation looking across the city, world horizon and sky clearly visible!
    const azimuth = 28 * (Math.PI / 180);
    const elevation = 9.5 * (Math.PI / 180);
    const dirX = Math.sin(azimuth) * Math.cos(elevation); // ~0.463
    const dirY = Math.sin(elevation);                    // ~0.165
    const dirZ = Math.cos(azimuth) * Math.cos(elevation); // ~0.871

    if (aspect < 0.75) {
      // Portrait mobile (e.g. 9:16, 9:19.5, 9:20)
      const fov = 44;
      this.camera.fov = fov;
      const distance = 45.0;
      this.cameraBaseDistance = distance;
      this.cameraOffset.set(dirX * distance, dirY * distance, dirZ * distance);
    } else if (aspect <= 1.25) {
      // Tablet / square
      const fov = 40;
      this.camera.fov = fov;
      const distance = 42.0;
      this.cameraBaseDistance = distance;
      this.cameraOffset.set(dirX * distance, dirY * distance, dirZ * distance);
    } else {
      // Desktop
      const fov = 36;
      this.camera.fov = fov;
      const distance = 38.0;
      this.cameraBaseDistance = distance;
      this.cameraOffset.set(dirX * distance, dirY * distance, dirZ * distance);
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
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
    this.perfectStreak = 0;
    this.isNewBest = false;
    this.state = 'PLAYING';
    this.callbacks.onStateChange(this.state);

    this.updateStatsUI();

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

    // Initialize crane positions
    const initialFloorTopY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + 2.3;
    this.currentCraneY = initialFloorTopY + 9.4;
    this.currentHookY = initialFloorTopY + 4.85;
    this.currentTrolleyX = 0;
    this.currentTrolleyZ = 0;

    // Spawn first suspended floor directly in ready position
    this.spawnNextFloorImmediately();
  }

  private spawnNextFloorImmediately() {
    if (this.state !== 'PLAYING') return;

    // TEMP: Modern Apartment V1 visual test
    this.hangingFloorStyle = 'MODERN_APARTMENT_V1';
    // Original style selection preserved:
    // const styleIdx = (this.floorCount + Math.floor(Math.random() * 3)) % ALL_STYLES.length;
    // this.hangingFloorStyle = ALL_STYLES[styleIdx];

    const { group, dimensions } = createFloorModule(this.hangingFloorStyle, this.floorCount + 1);
    this.hangingFloorGroup = group;
    this.hangingFloorDims = dimensions;
    this.scene.add(group);

    this.isFloorHanging = true;
    this.canDrop = true;
    this.transitionPhase = 'READY';
    this.transitionTimer = 0;

    // Crane height: above highest placed floor
    const towerTopY = this.physics.getTowerTopY();
    const floorH = dimensions.height;
    const hangingY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + floorH / 2;

    this.hangingFloorGroup.position.set(0, hangingY, 0);

    const targetY = Math.max(towerTopY - 3.2, 3.2);
    this.cameraDesiredTarget.set(0, targetY, 0);
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

    // Calculate release momentum
    const linearVelocity = new THREE.Vector3(this.craneVelX * 0.9, 0, this.craneVelZ * 0.9);
    const angularVelocityY = this.craneRotVelY * 0.8;

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

    // Continuous smooth difficulty scaling (Floors 1 to 200+)
    const progress = Math.min(Math.max(this.floorCount / 180, 0), 1.0);
    const t = progress * progress * (3 - 2 * progress);

    const speed = THREE.MathUtils.lerp(GAME_CONFIG.CRANE_MIN_SPEED, GAME_CONFIG.CRANE_MAX_SPEED, t);
    const swingXRange = THREE.MathUtils.lerp(GAME_CONFIG.CRANE_MIN_SWING_X, GAME_CONFIG.CRANE_MAX_SWING_X, t);
    const swingZRange = THREE.MathUtils.lerp(GAME_CONFIG.CRANE_MIN_SWING_Z, GAME_CONFIG.CRANE_MAX_SWING_Z, t);
    const rotYRange = THREE.MathUtils.lerp(GAME_CONFIG.CRANE_MIN_ROTATION_Y, GAME_CONFIG.CRANE_MAX_ROTATION_Y, t);

    const prevX = this.craneX;
    const prevZ = this.craneZ;
    const prevRot = this.craneRotY;

    // 1. Horizontal left and right
    const freqX = speed;
    this.craneX = Math.sin(this.swingTime * freqX) * swingXRange;

    // 2. Movement along depth/Z axis (very small in early floors)
    const freqZ = speed * 0.65;
    this.craneZ = Math.cos(this.swingTime * freqZ) * swingZRange;

    // 3. Slow rotation around vertical Y axis (very small in early floors)
    const freqRot = speed * 0.55;
    this.craneRotY = Math.sin(this.swingTime * freqRot) * rotYRange;

    // Calculate velocities for momentum preservation
    this.craneVelX = delta > 0 ? (this.craneX - prevX) / delta : 0;
    this.craneVelZ = delta > 0 ? (this.craneZ - prevZ) / delta : 0;
    this.craneRotVelY = delta > 0 ? (this.craneRotY - prevRot) / delta : 0;

    // Smooth continuous crane body elevation (crane boom at top edge of screen)
    const towerTopY = this.physics.getTowerTopY();
    const activeFloorH = this.hangingFloorDims ? this.hangingFloorDims.height : 2.3;
    const floorY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + activeFloorH / 2;
    const floorTopY = floorY + activeFloorH / 2;

    const targetCraneY = floorTopY + 9.4;
    if (this.currentCraneY === 0) {
      this.currentCraneY = targetCraneY;
    } else {
      const craneAlpha = 1.0 - Math.exp(-2.5 * delta);
      this.currentCraneY = THREE.MathUtils.lerp(this.currentCraneY, targetCraneY, craneAlpha);
    }

    // Default hook block center position (hook saddle sits at defaultHookY - 2.15 = floorTopY + 2.7m)
    const defaultHookY = floorTopY + 4.85;

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
        // TEMP: Modern Apartment V1 visual test
        this.hangingFloorStyle = 'MODERN_APARTMENT_V1';
        // Original style selection preserved:
        // const styleIdx = (this.floorCount + Math.floor(Math.random() * 3)) % ALL_STYLES.length;
        // this.hangingFloorStyle = ALL_STYLES[styleIdx];

        const { group, dimensions } = createFloorModule(this.hangingFloorStyle, this.floorCount + 1);
        this.hangingFloorGroup = group;
        this.hangingFloorDims = dimensions;
        this.scene.add(group);

        const pickupFloorY = floorY + 1.2;
        this.hangingFloorGroup.position.set(pickupX, pickupFloorY, CraneSystem.MAST_Z);
        this.currentTrolleyX = pickupX;
        this.currentTrolleyZ = CraneSystem.MAST_Z;
        this.currentHookY = pickupFloorY + dimensions.height / 2 + 4.85;
      }
    } else if (this.transitionPhase === 'DELIVERING' && this.hangingFloorGroup && this.hangingFloorDims) {
      // PHASE 3: NEXT FLOOR ARRIVAL
      // Trolley smoothly glides along crane boom into hanging position over 0.75s
      this.transitionTimer += delta;
      const deliveryDuration = 0.75;
      const p = Math.min(this.transitionTimer / deliveryDuration, 1.0);
      const ease = p * p * (3 - 2 * p); // Smoothstep easing

      const pickupX = CraneSystem.MAST_X - 2.5;
      const pickupFloorY = floorY + 1.2;
      const targetFloorY = floorY;

      this.currentTrolleyX = THREE.MathUtils.lerp(pickupX, this.craneX, ease);
      this.currentTrolleyZ = THREE.MathUtils.lerp(CraneSystem.MAST_Z, this.craneZ, ease);

      const curFloorY = THREE.MathUtils.lerp(pickupFloorY, targetFloorY, ease);
      const curRotY = THREE.MathUtils.lerp(0, this.craneRotY, ease);

      this.hangingFloorGroup.position.set(this.currentTrolleyX, curFloorY, this.currentTrolleyZ);
      this.hangingFloorGroup.rotation.set(0, curRotY, 0);

      this.currentHookY = curFloorY + this.hangingFloorDims.height / 2 + 4.85;

      this.crane.updatePosition(
        this.currentCraneY,
        this.currentTrolleyX,
        this.currentTrolleyZ,
        this.currentHookY,
        this.hangingFloorGroup,
        this.hangingFloorDims,
        false // arrows hidden during delivery
      );

      if (p >= 1.0) {
        // PHASE 4: READY!
        this.transitionPhase = 'READY';
        this.isFloorHanging = true;
        this.canDrop = true; // Player input re-enabled
      }
    } else if (this.isFloorHanging && this.hangingFloorGroup && this.hangingFloorDims) {
      // PHASE 4 / NORMAL SWINGING MOTION
      this.currentTrolleyX = this.craneX;
      this.currentTrolleyZ = this.craneZ;
      this.currentHookY = defaultHookY;

      const swayFactor = 0.02 + t * 0.02;
      const swayRoll = -this.craneVelX * swayFactor;
      const swayPitch = this.craneVelZ * swayFactor;

      this.hangingFloorGroup.position.set(this.craneX, floorY, this.craneZ);
      this.hangingFloorGroup.rotation.set(swayPitch, this.craneRotY, swayRoll);

      this.crane.updatePosition(
        this.currentCraneY,
        this.craneX,
        this.craneZ,
        defaultHookY,
        this.hangingFloorGroup,
        this.hangingFloorDims,
        true // arrows visible when ready
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
    // and enforces the 10-floor active physics window!
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

    // Feedback
    if (distOffset < GAME_CONFIG.PERFECT_THRESHOLD_DIST && rotOffset < GAME_CONFIG.PERFECT_THRESHOLD_ROT) {
      this.perfectStreak++;
      sounds.playPerfectChime();
      this.callbacks.onFeedback({
        id: Date.now(),
        type: 'PERFECT',
        message: this.perfectStreak > 1 ? `PERFECT x${this.perfectStreak}!` : 'PERFECT!',
      });
    } else if (distOffset < GAME_CONFIG.GREAT_THRESHOLD_DIST) {
      this.perfectStreak = 0;
      this.callbacks.onFeedback({
        id: Date.now(),
        type: 'GREAT',
        message: 'GREAT!',
      });
    } else if (status === 'RISKY' || status === 'DANGEROUS' || distOffset > 1.6 || tiltAngle > 0.45) {
      this.perfectStreak = 0;
      sounds.playCreak();
      this.callbacks.onFeedback({
        id: Date.now(),
        type: 'RISKY',
        message: 'RISKY OVERHANG!',
      });
    } else {
      this.perfectStreak = 0;
    }

    this.updateStatsUI();

    // Check if new best height
    const currentHeight = Math.round(this.floorCount * GAME_CONFIG.METERS_PER_FLOOR);
    if (currentHeight > this.bestHeight && this.floorCount > 1) {
      if (!this.isNewBest) {
        this.isNewBest = true;
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.25 },
        });
      }
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
   * to immediately verify all 10 environment regions (e.g. Floors 5, 16, 25, 38, 45, 65, 85, 105, 125, 145, 165, 185).
   */
  public jumpToFloorForTesting(targetFloor: number) {
    this.floorCount = Math.max(0, targetFloor);
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
    this.currentCraneY = floorTopY + 9.4;
    this.currentHookY = floorTopY + 4.85;

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

      // Check structural collapse (REAL_TOP_COLLAPSE):
      // Requirement 3: Grace period (disable structural Game Over detection for 1.8s after release)
      const inGracePeriod = performance.now() - this.lastReleaseTime < 1800;

      // Early game safety rule: floors 1-20 are very forgiving and cannot trigger structural collapse
      const isEarlyGame = this.floorCount <= 20;

      if (!inGracePeriod && !isEarlyGame) {
        const collapseStatus = this.physics.checkActiveTopCollapse();
        if (collapseStatus.hasCollapsed) {
          // Requirement 4: Continuous failure for >= 0.85s
          this.collapseFailureDuration += delta;
          if (this.collapseFailureDuration >= 0.85) {
            this.triggerCollapse('REAL_TOP_COLLAPSE');
          }
        } else {
          // If structure recovers, cancel failure timer!
          this.collapseFailureDuration = 0;
        }
      } else {
        this.collapseFailureDuration = 0;
      }
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

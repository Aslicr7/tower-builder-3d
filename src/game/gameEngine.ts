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
  private nextFloorSpawnTimeout: ReturnType<typeof setTimeout> | null = null;

  // Animation frame
  private animId: number | null = null;
  private lastTime = 0;
  private boundResize: () => void;

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
   * 1. Portrait mobile: FOV ~54°, floor occupies 26-32% screen width (visible scenery on BOTH sides).
   * 2. Tablet / square: FOV ~48°, balanced framing.
   * 3. Desktop: FOV ~42°, expansive skyline panorama.
   */
  private updateCameraResponsiveConfig(width: number, height: number) {
    const aspect = width / height;
    this.camera.aspect = aspect;

    // Diagonal 3D viewing angle (front face + side face visible for depth & rotation judgment)
    const azimuth = 33 * (Math.PI / 180);
    const elevation = 20 * (Math.PI / 180);
    const dirX = Math.sin(azimuth) * Math.cos(elevation); // ~0.512
    const dirY = Math.sin(elevation);                    // ~0.342
    const dirZ = Math.cos(azimuth) * Math.cos(elevation); // ~0.788

    if (aspect < 0.75) {
      // Portrait mobile (e.g. 9:16, 9:19.5, 9:20)
      const fov = 54;
      this.camera.fov = fov;

      // Desired visible width at tower center: ~19.2 units
      // Floor diagonal is ~5.8m -> 5.8 / 19.2 ≈ 30.2% screen width!
      const targetVisibleWidth = 19.2;
      const fovRad = THREE.MathUtils.degToRad(fov);
      const calculatedDist = targetVisibleWidth / (2 * Math.tan(fovRad / 2) * aspect);

      // Distance is at least 38 units so the tower starts with plenty of surrounding scenery
      const distance = Math.max(calculatedDist, 38.0);
      this.cameraBaseDistance = distance;
      this.cameraOffset.set(dirX * distance, dirY * distance, dirZ * distance);
    } else if (aspect <= 1.25) {
      // Tablet / square
      const fov = 48;
      this.camera.fov = fov;
      const distance = 35.0;
      this.cameraBaseDistance = distance;
      this.cameraOffset.set(dirX * distance, dirY * distance, dirZ * distance);
    } else {
      // Desktop
      const fov = 42;
      this.camera.fov = fov;
      const distance = 30.0;
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
    if (this.nextFloorSpawnTimeout) {
      clearTimeout(this.nextFloorSpawnTimeout);
      this.nextFloorSpawnTimeout = null;
    }
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
    }

    this.physics.reset();
    this.floorCount = 0;
    this.perfectStreak = 0;
    this.isNewBest = false;
    this.state = 'PLAYING';
    this.callbacks.onStateChange(this.state);

    this.updateStatsUI();

    // Reset camera desired target
    this.cameraDesiredTarget.set(0, 3.2, 0);
    this.cameraTarget.set(0, 3.2, 0);
    this.camera.position.set(
      this.cameraTarget.x + this.cameraOffset.x,
      this.cameraTarget.y + this.cameraOffset.y,
      this.cameraTarget.z + this.cameraOffset.z
    );
    this.camera.lookAt(this.cameraTarget);

    // Spawn first suspended floor
    this.spawnNextFloor();
  }

  private spawnNextFloor() {
    if (this.state !== 'PLAYING') return;

    // Pick style from 12 distinct architectural styles
    const styleIdx = (this.floorCount + Math.floor(Math.random() * 3)) % ALL_STYLES.length;
    this.hangingFloorStyle = ALL_STYLES[styleIdx];

    const { group, dimensions } = createFloorModule(this.hangingFloorStyle, this.floorCount + 1);
    this.hangingFloorGroup = group;
    this.hangingFloorDims = dimensions;
    this.scene.add(group);

    this.isFloorHanging = true;

    // Crane height: above highest placed floor
    const towerTopY = this.physics.getTowerTopY();
    const floorH = dimensions.height;
    const hangingY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + floorH / 2;

    this.hangingFloorGroup.position.set(0, hangingY, 0);

    // Frame vertical region: top of existing tower at ~50-55% screen height,
    // active hanging floor in upper-middle (~60-65%), 6-9 previous floors below visible
    const targetY = Math.max(towerTopY - 1.2, 3.2);
    this.cameraDesiredTarget.set(0, targetY, 0);
  }

  /**
   * The player's ONLY gameplay action:
   * CLICK / TAP / SPACE = RELEASE THE FLOOR.
   */
  public releaseCurrentFloor() {
    if (this.state !== 'PLAYING' || !this.isFloorHanging || !this.hangingFloorGroup || !this.hangingFloorDims) {
      return;
    }

    sounds.playRelease();

    // Start 1.8s grace period for structural collapse and reset failure timers
    this.lastReleaseTime = performance.now();
    this.missedFloorFailureDuration = 0;
    this.collapseFailureDuration = 0;

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

    this.isFloorHanging = false;
    this.hangingFloorGroup = null;
    this.hangingFloorDims = null;
  }

  private updateCraneMotion(delta: number) {
    this.swingTime += delta;

    // Continuous smooth difficulty scaling (Floors 1 to 200+)
    // Floors 1-20: Beginner / relaxing (slow, small rotation, small Z sway)
    // Floors 21-50: Easy -> Normal
    // Floors 51-100: Normal
    // Floors 101-150: Hard
    // Floors 151-200: Very Hard
    // Floors 200+: Clamped extreme endgame
    const progress = Math.min(Math.max(this.floorCount / 180, 0), 1.0);
    // Smoothstep interpolation for gradual, seamless scaling
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

    const towerTopY = this.physics.getTowerTopY();
    const craneY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + 3.0;

    if (this.isFloorHanging && this.hangingFloorGroup && this.hangingFloorDims) {
      const hookY = craneY - 1.2;
      const floorY = towerTopY + GAME_CONFIG.CRANE_CLEARANCE + this.hangingFloorDims.height / 2;

      // 4. Gentle pendulum sway while hanging (scales mildly with speed)
      const swayFactor = 0.02 + t * 0.02;
      const swayRoll = -this.craneVelX * swayFactor;
      const swayPitch = this.craneVelZ * swayFactor;

      this.hangingFloorGroup.position.set(this.craneX, floorY, this.craneZ);
      this.hangingFloorGroup.rotation.set(swayPitch, this.craneRotY, swayRoll);

      this.crane.updatePosition(
        craneY,
        this.craneX,
        this.craneZ,
        hookY,
        this.hangingFloorGroup,
        this.hangingFloorDims,
        true
      );
    } else {
      this.crane.updatePosition(craneY, this.craneX, this.craneZ, craneY - 1.2, null, undefined, false);
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

    // Spawn the next floor on the crane
    if (this.nextFloorSpawnTimeout) {
      clearTimeout(this.nextFloorSpawnTimeout);
    }
    this.nextFloorSpawnTimeout = setTimeout(() => {
      if (this.state === 'PLAYING') {
        this.spawnNextFloor();
      }
    }, 450);
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
      this.cameraTarget.lerp(collapseTarget, delta * 1.5);

      const pullBackDist = this.cameraBaseDistance * 1.35 + Math.min(elapsed * 6, 20);
      const targetCamPos = new THREE.Vector3(
        this.cameraTarget.x + (this.cameraOffset.x / this.cameraBaseDistance) * pullBackDist,
        this.cameraTarget.y + (this.cameraOffset.y / this.cameraBaseDistance) * pullBackDist * 1.05,
        this.cameraTarget.z + (this.cameraOffset.z / this.cameraBaseDistance) * pullBackDist
      );
      this.camera.position.lerp(targetCamPos, delta * 1.8);
      this.camera.lookAt(this.cameraTarget);

      // Check if collapse observation time has completed
      if (this.state === 'COLLAPSING' && performance.now() - this.collapseStartTime > GAME_CONFIG.COLLAPSE_OBSERVE_DURATION_MS) {
        this.state = 'GAMEOVER';
        this.callbacks.onStateChange(this.state);
      }
      return;
    }

    // Smooth tracking during gameplay
    this.cameraTarget.lerp(this.cameraDesiredTarget, delta * 2.2);

    const desiredCamPos = new THREE.Vector3(
      this.cameraTarget.x + this.cameraOffset.x,
      this.cameraTarget.y + this.cameraOffset.y,
      this.cameraTarget.z + this.cameraOffset.z
    );

    this.camera.position.lerp(desiredCamPos, delta * 2.2);
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
    });
  }

  private loop = (time: number) => {
    this.animId = requestAnimationFrame(this.loop);

    const delta = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    if (this.state === 'PAUSED') {
      return;
    }

    // 1. Scenery environmental animation (traffic, clouds)
    this.scenery.update(delta);

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

      // Requirement 5: Early game safety rule (floors 1-10 cannot trigger structural collapse)
      const isEarlyGame = this.floorCount <= 10;

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
    if (this.nextFloorSpawnTimeout) {
      clearTimeout(this.nextFloorSpawnTimeout);
      this.nextFloorSpawnTimeout = null;
    }
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

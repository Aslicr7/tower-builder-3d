import * as THREE from 'three';

// Procedural Architectural Textures for City Buildings
let glassTexture: THREE.CanvasTexture | null = null;
let concreteTexture: THREE.CanvasTexture | null = null;
let brickTexture: THREE.CanvasTexture | null = null;
let stoneTexture: THREE.CanvasTexture | null = null;
let slateTexture: THREE.CanvasTexture | null = null;
let earthTexture: THREE.CanvasTexture | null = null;
let moonTexture: THREE.CanvasTexture | null = null;

function getGlassTexture(): THREE.CanvasTexture {
  if (glassTexture) return glassTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1e3247';
  ctx.fillRect(0, 0, 256, 256);
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const cols = 8;
  const rows = 12;
  const cellW = 256 / cols;
  const cellH = 256 / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      const y = r * cellH;
      const isLit = (c * 3 + r * 7) % 5 === 0;
      ctx.fillStyle = isLit ? 'rgba(254, 240, 138, 0.45)' : (c + r) % 2 === 0 ? '#26425e' : '#1e3247';
      ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellW, cellH);
    }
  }
  glassTexture = new THREE.CanvasTexture(canvas);
  glassTexture.wrapS = THREE.RepeatWrapping;
  glassTexture.wrapT = THREE.RepeatWrapping;
  return glassTexture;
}

function getConcreteTexture(): THREE.CanvasTexture {
  if (concreteTexture) return concreteTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ece8e1';
  ctx.fillRect(0, 0, 256, 256);

  const cols = 6;
  const rows = 8;
  const cellW = 256 / cols;
  const cellH = 256 / rows;
  for (let r = 0; r < rows; r++) {
    ctx.strokeStyle = '#d3cdc2';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(256, r * cellH);
    ctx.stroke();
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + cellW * 0.2;
      const y = r * cellH + cellH * 0.22;
      const w = cellW * 0.6;
      const h = cellH * 0.56;
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
      ctx.fillStyle = '#94b4d6';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 2, y + h, w + 4, 2);
    }
  }
  concreteTexture = new THREE.CanvasTexture(canvas);
  concreteTexture.wrapS = THREE.RepeatWrapping;
  concreteTexture.wrapT = THREE.RepeatWrapping;
  return concreteTexture;
}

function getBrickTexture(): THREE.CanvasTexture {
  if (brickTexture) return brickTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#9c4333';
  ctx.fillRect(0, 0, 256, 256);

  const cols = 6;
  const rows = 8;
  const cellW = 256 / cols;
  const cellH = 256 / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + cellW * 0.22;
      const y = r * cellH + cellH * 0.25;
      const w = cellW * 0.56;
      const h = cellH * 0.52;
      ctx.fillStyle = '#f1ece1';
      ctx.fillRect(x - 2, y - 3, w + 4, 3);
      ctx.fillRect(x - 3, y + h, w + 6, 3);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    }
  }
  brickTexture = new THREE.CanvasTexture(canvas);
  brickTexture.wrapS = THREE.RepeatWrapping;
  brickTexture.wrapT = THREE.RepeatWrapping;
  return brickTexture;
}

function getStoneTexture(): THREE.CanvasTexture {
  if (stoneTexture) return stoneTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#dfd6c5';
  ctx.fillRect(0, 0, 256, 256);

  const cols = 5;
  const rows = 8;
  const cellW = 256 / cols;
  const cellH = 256 / rows;
  for (let c = 0; c < cols; c++) {
    const x = c * cellW;
    ctx.strokeStyle = '#c5baaa';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, 0, cellW - 4, 256);
    for (let r = 0; r < rows; r++) {
      const y = r * cellH;
      ctx.fillStyle = '#6b5742';
      ctx.fillRect(x + cellW * 0.25, y + cellH * 0.75, cellW * 0.5, cellH * 0.2);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + cellW * 0.25, y + cellH * 0.2, cellW * 0.5, cellH * 0.52);
    }
  }
  stoneTexture = new THREE.CanvasTexture(canvas);
  stoneTexture.wrapS = THREE.RepeatWrapping;
  stoneTexture.wrapT = THREE.RepeatWrapping;
  return stoneTexture;
}

function getSlateTexture(): THREE.CanvasTexture {
  if (slateTexture) return slateTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 256, 256);

  const cols = 6;
  const rows = 10;
  const cellW = 256 / cols;
  const cellH = 256 / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      const y = r * cellH;
      if ((c + r) % 3 === 0) {
        ctx.fillStyle = '#a16207';
        ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 2, y + 3, cellW - 4, cellH - 6);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(x + 3, y + 4, cellW - 6, cellH - 8);
      }
    }
  }
  slateTexture = new THREE.CanvasTexture(canvas);
  slateTexture.wrapS = THREE.RepeatWrapping;
  slateTexture.wrapT = THREE.RepeatWrapping;
  return slateTexture;
}

// Procedural Earth surface texture with muted blue oceans, stylized landmasses, and soft cloud bands
function getEarthTexture(): THREE.CanvasTexture {
  if (earthTexture) return earthTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Ocean base - deep muted blue (#0c2340)
  ctx.fillStyle = '#0c2340';
  ctx.fillRect(0, 0, 512, 256);

  // Stylized continents (restrained muted olive & forest tones #1b382b)
  ctx.fillStyle = '#1b382b';
  // North America shape
  ctx.beginPath();
  ctx.ellipse(120, 80, 50, 32, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // South America
  ctx.beginPath();
  ctx.ellipse(150, 165, 32, 48, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Eurasia
  ctx.beginPath();
  ctx.ellipse(320, 75, 100, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  // Africa
  ctx.beginPath();
  ctx.ellipse(280, 150, 42, 55, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Australia
  ctx.beginPath();
  ctx.ellipse(420, 185, 30, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle topography layer (#284832)
  ctx.fillStyle = '#284832';
  ctx.beginPath();
  ctx.ellipse(330, 70, 70, 25, 0, 0, Math.PI * 2);
  ctx.ellipse(125, 75, 35, 20, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Soft stylized cloud swirls (translucent off-white, not harsh)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    ctx.ellipse(i * 38 + 20, 65 + Math.sin(i * 1.3) * 20, 24, 8, 0.12, 0, Math.PI * 2);
    ctx.ellipse(i * 38 + 20, 130 + Math.cos(i * 1.4) * 25, 28, 10, -0.08, 0, Math.PI * 2);
    ctx.ellipse(i * 38 + 20, 185 + Math.sin(i * 1.8) * 18, 18, 7, 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  // Faint warm city cluster lights on night quadrant
  ctx.fillStyle = 'rgba(253, 230, 138, 0.35)';
  for (let i = 0; i < 100; i++) {
    const x = (i * 37) % 512;
    const y = 40 + (i * 19) % 180;
    ctx.fillRect(x, y, 1.0, 1.0);
  }

  earthTexture = new THREE.CanvasTexture(canvas);
  return earthTexture;
}

// Procedural Moon texture with craters & maria
function getMoonTexture(): THREE.CanvasTexture {
  if (moonTexture) return moonTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Moon light grey regolith
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 512, 256);

  // Darker lunar maria
  ctx.fillStyle = '#64748b';
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.ellipse(60 + i * 48, 120 + Math.sin(i * 1.5) * 45, 30 + (i % 3) * 12, 22 + (i % 4) * 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Impact craters with white rims and dark centers
  for (let i = 0; i < 40; i++) {
    const x = (i * 27) % 512;
    const y = 30 + (i * 19) % 200;
    const rad = 4 + (i % 6) * 3;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(x - 0.5, y + 0.5, rad * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  moonTexture = new THREE.CanvasTexture(canvas);
  return moonTexture;
}

export type EnvironmentRegionId =
  | 'CITY'
  | 'HIGH_MOUNTAINS'
  | 'CLOUD_WORLD'
  | 'ABOVE_THE_CLOUDS'
  | 'HIGH_ATMOSPHERE'
  | 'EDGE_OF_SPACE'
  | 'SPACE_EARTH_BELOW'
  | 'ORBITAL_REGION'
  | 'MOON_APPROACH'
  | 'MOON_REGION'
  | 'ENDLESS_SPACE';

export interface RegionState {
  regionIndex: number;
  regionId: EnvironmentRegionId;
  regionName: string;
  nextRegionName: string;
  transitionProgress: number; // 0.0 to 1.0 (smooth blend)
}

/**
 * Continuous Environment Manager powering the retimed vertical journey:
 * - FLOORS 0–10: CITY / GROUND WORLD
 * - FLOORS 11–20: HIGH MOUNTAINS
 * - FLOORS 21–30: CLOUD WORLD
 * - FLOORS 31–37: ABOVE THE CLOUDS
 * - FLOORS 38–44: HIGH ATMOSPHERE
 * - FLOORS 45–51: EDGE OF SPACE
 * - FLOORS 52–58: SPACE / EARTH BELOW
 * - FLOORS 59–65: ORBITAL REGION
 * - FLOORS 66–72: MOON APPROACH
 * - FLOORS 73–80: MOON REGION
 * - FLOOR 81+: ENDLESS SPACE
 */
export class EnvironmentManager {
  public group: THREE.Group;

  // Region root groups
  private skyGroup: THREE.Group;
  private cityGroup: THREE.Group;
  private mountainGroup: THREE.Group;
  private cloudWorldGroup: THREE.Group;
  private aboveCloudSeaGroup: THREE.Group;
  private highAtmoGroup: THREE.Group;
  private spaceGroup: THREE.Group;
  private orbitalGroup: THREE.Group;
  private moonGroup: THREE.Group;

  // Animated elements
  private skyMaterial: THREE.ShaderMaterial;
  private trafficGroup: THREE.Group | null = null;
  private trafficCars: {
    mesh: THREE.Group;
    x: number;
    y: number;
    z: number;
    speed: number;
    direction: 1 | -1;
  }[] = [];
  private beaconLights: THREE.Mesh[] = [];
  private beaconTimer = 0;
  private airplaneGroup: THREE.Group | null = null;
  private airplaneX = -240;
  private satelliteMesh: THREE.Group | null = null;
  private spaceStationGroup: THREE.Group | null = null;
  private earthMesh: THREE.Mesh | null = null;
  private earthLimb: THREE.Mesh | null = null;
  private moonMesh: THREE.Mesh | null = null;
  private lunarCragsGroup: THREE.Group | null = null;
  private starsMesh: THREE.Points | null = null;
  private mountainEagles: THREE.Group | null = null;
  private cityBuildingFootprints: { x: number; z: number; radius: number }[] = [];
  private lastLoggedFloor = -1;

  // Current calculated region state
  private currentRegion = 0;
  private transitionT = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'EnvironmentManager';

    this.skyGroup = new THREE.Group();
    this.cityGroup = new THREE.Group();
    this.mountainGroup = new THREE.Group();
    this.cloudWorldGroup = new THREE.Group();
    this.cloudWorldGroup.position.y = -50; // Aligns cloud formations with Floors 21–30
    this.aboveCloudSeaGroup = new THREE.Group();
    this.highAtmoGroup = new THREE.Group();
    this.spaceGroup = new THREE.Group();
    this.orbitalGroup = new THREE.Group();
    this.moonGroup = new THREE.Group();

    this.group.add(this.skyGroup);
    this.group.add(this.cityGroup);
    this.group.add(this.mountainGroup);
    this.group.add(this.cloudWorldGroup);
    this.group.add(this.aboveCloudSeaGroup);
    this.group.add(this.highAtmoGroup);
    this.group.add(this.spaceGroup);
    this.group.add(this.orbitalGroup);
    this.group.add(this.moonGroup);

    this.skyMaterial = this.createDynamicSkyShader();

    this.buildCity();
    this.buildMountains();
    this.buildCloudWorld();
    this.buildAboveCloudSea();
    this.buildHighAtmosphere();
    this.buildSpaceAndEarth();
    this.buildOrbitalStationAndSatellites();
    this.buildMoon();
  }

  // ========================================================================
  // 1. DYNAMIC SKY & ATMOSPHERE SHADER
  // ========================================================================
  private createDynamicSkyShader(): THREE.ShaderMaterial {
    const skyGeo = new THREE.SphereGeometry(600, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x38bdf8) },
        horizonColor: { value: new THREE.Color(0xfef08a) },
        groundHaze: { value: new THREE.Color(0xdbeafe) },
        sunPosition: { value: new THREE.Vector3(120, 90, -180).normalize() },
        starIntensity: { value: 0.0 },
        spaceDarkness: { value: 0.0 },
        sunGlowStrength: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 groundHaze;
        uniform vec3 sunPosition;
        uniform float starIntensity;
        uniform float spaceDarkness;
        uniform float sunGlowStrength;
        varying vec3 vWorldPosition;

        // Pseudo-random hash for procedural stars
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = dir.y;

          // Sky gradient
          vec3 sky = mix(horizonColor, topColor, max(pow(max(h, 0.0), 0.45), 0.0));
          if (h < 0.0) {
            sky = mix(horizonColor, groundHaze, min(pow(-h, 0.5), 1.0));
          }

          // Directional Sun Flare
          float sunDot = max(dot(dir, sunPosition), 0.0);
          vec3 sunGlow = vec3(1.0, 0.95, 0.78) * (pow(sunDot, 128.0) * 2.2 + pow(sunDot, 14.0) * 0.4) * sunGlowStrength;

          // Space void blending
          vec3 spaceVoid = vec3(0.005, 0.008, 0.02);
          sky = mix(sky, spaceVoid, spaceDarkness);

          // Stars in upper space
          if (starIntensity > 0.01 && dir.y > -0.2) {
            vec3 starCoord = floor(dir * 240.0);
            float starRand = hash(starCoord);
            if (starRand > 0.985) {
              float sparkle = sin(dir.x * 40.0 + dir.y * 30.0) * 0.3 + 0.7;
              vec3 starColor = (starRand > 0.995) ? vec3(0.7, 0.85, 1.0) : vec3(1.0, 0.95, 0.85);
              sky += starColor * starIntensity * sparkle * 1.5;
            }
          }

          gl_FragColor = vec4(sky + sunGlow, 1.0);
        }
      `,
    });

    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.skyGroup.add(skyMesh);
    return skyMat;
  }

  // ========================================================================
  // 2. REGION 1: CITY & GROUND (FLOORS 1–20)
  // ========================================================================
  private buildCity() {
    this.cityBuildingFootprints = [];

    // Ground tarmac plane (Base Level Y = -6.05)
    const groundGeo = new THREE.PlaneGeometry(600, 600, 4, 4);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -6.05;
    ground.receiveShadow = true;
    this.cityGroup.add(ground);

    // Architectural Urban Landscaping & Irregular Park System (Y = -6.00, Curbs Y = -5.94)
    // Replaces flat monolithic green rectangles with irregular polygonal garden plots,
    // roadside green strips, and riverfront parklands bounded by stone retaining curbs
    // (zero Z-fighting, zero straight-edged box, clear of central construction plaza).
    this.buildUrbanLandscaping();

    // River (Y = -6.04, sunken into base ground)
    const riverGeo = new THREE.PlaneGeometry(42, 500);
    const riverMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, metalness: 0.85 });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.rotation.z = 0.28;
    river.position.set(65, -6.04, 0);
    this.cityGroup.add(river);

    // Bridges
    [-80, -22, 15, 110].forEach((zPos) => {
      const bridgeGroup = new THREE.Group();
      const deckWidth = zPos === -22 ? 14.5 : 6.5;
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(70, 1.2, deckWidth),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 })
      );
      deck.position.set(65, -5.1, zPos);
      deck.rotation.y = -0.28;
      bridgeGroup.add(deck);

      const pylonGeo = new THREE.BoxGeometry(1.6, 20, 1.6);
      const pMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 });
      const p1 = new THREE.Mesh(pylonGeo, pMat);
      p1.position.set(54, 2.5, zPos - deckWidth * 0.5);
      bridgeGroup.add(p1);
      const p2 = new THREE.Mesh(pylonGeo, pMat);
      p2.position.set(76, 2.5, zPos + deckWidth * 0.5);
      bridgeGroup.add(p2);
      this.cityGroup.add(bridgeGroup);
    });

    // Dedicated City Boulevard in background behind tower (Z = -22m)
    // Clean, distinct Y-hierarchy: Ground (-6.05) < Grass (-6.03) < Road (-5.99) < Markings (-5.98) < Curbs (-5.84)
    const boulevardGroup = new THREE.Group();
    boulevardGroup.name = 'city_boulevard';

    // Road asphalt surface (280m long by 14m wide, Y = -5.99)
    const roadGeo = new THREE.PlaneGeometry(280, 14);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x272e3b, roughness: 0.88 });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, -5.99, -22.0);
    roadMesh.receiveShadow = true;
    boulevardGroup.add(roadMesh);

    // Center divider double yellow line (clean geometric elevation at Y = -5.98, +10mm above road surface)
    const centerLineGeo = new THREE.PlaneGeometry(280, 0.35);
    const centerLineMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
    });
    const centerLine = new THREE.Mesh(centerLineGeo, centerLineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, -5.98, -22.0);
    boulevardGroup.add(centerLine);

    // North and South curbs / sidewalks (3D box geometry with 16cm real height, top at Y = -5.84)
    const curbGeo = new THREE.BoxGeometry(280, 0.16, 1.4);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const northCurb = new THREE.Mesh(curbGeo, curbMat);
    northCurb.position.set(0, -5.92, -14.3);
    boulevardGroup.add(northCurb);
    const southCurb = new THREE.Mesh(curbGeo, curbMat);
    southCurb.position.set(0, -5.92, -29.7);
    boulevardGroup.add(southCurb);

    this.cityGroup.add(boulevardGroup);

    // Near Architectural Buildings (Radius 65 to 90m, Heights 22 to 42m)
    const nearSpecs: {
      type: 'GLASS' | 'CONCRETE' | 'BRICK' | 'STONE' | 'SLATE';
      angle: number;
      radius: number;
      w: number;
      d: number;
      h: number;
      rot: number;
    }[] = [
      { type: 'GLASS', angle: 0.35, radius: 76, w: 12, d: 11, h: 36, rot: 0.2 },
      { type: 'CONCRETE', angle: 0.75, radius: 88, w: 13, d: 10, h: 28, rot: 0.4 },
      { type: 'BRICK', angle: 1.55, radius: 84, w: 10, d: 11, h: 26, rot: -0.2 },
      { type: 'STONE', angle: 1.95, radius: 78, w: 11, d: 11, h: 32, rot: 0.1 },
      { type: 'SLATE', angle: 2.35, radius: 92, w: 11, d: 10, h: 34, rot: 0.3 },
      { type: 'GLASS', angle: 2.75, radius: 80, w: 12, d: 11, h: 38, rot: -0.15 },
      { type: 'CONCRETE', angle: 3.15, radius: 86, w: 13, d: 10, h: 26, rot: 0.5 },
      { type: 'BRICK', angle: 3.55, radius: 78, w: 10, d: 11, h: 30, rot: 0.2 },
      { type: 'STONE', angle: 3.95, radius: 94, w: 12, d: 12, h: 36, rot: -0.3 },
      { type: 'GLASS', angle: 4.45, radius: 82, w: 11, d: 11, h: 42, rot: 0.1 },
      { type: 'SLATE', angle: 4.95, radius: 80, w: 10, d: 10, h: 28, rot: 0.4 },
      { type: 'CONCRETE', angle: 5.45, radius: 90, w: 13, d: 11, h: 34, rot: -0.25 },
      { type: 'BRICK', angle: 5.95, radius: 84, w: 11, d: 10, h: 32, rot: 0.15 },
    ];

    nearSpecs.forEach((spec) => {
      const bldg = this.createBuildingMesh(spec.type, spec.w, spec.d, spec.h);
      const x = Math.cos(spec.angle) * spec.radius;
      const z = Math.sin(spec.angle) * spec.radius;
      bldg.position.set(x, -6.0, z);
      bldg.rotation.y = spec.rot;
      this.cityGroup.add(bldg);
      this.cityBuildingFootprints.push({
        x,
        z,
        radius: Math.hypot(spec.w, spec.d) * 0.5,
      });
    });

    // Midground City (Radius 95 to 160m, Heights 30 to 52m)
    const midCount = 36;
    const types: ('GLASS' | 'CONCRETE' | 'BRICK' | 'STONE' | 'SLATE')[] = [
      'GLASS', 'CONCRETE', 'BRICK', 'STONE', 'SLATE'
    ];
    for (let i = 0; i < midCount; i++) {
      const angle = (i / midCount) * Math.PI * 2 + (i % 3) * 0.08;
      const radius = 98 + (i % 5) * 14;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = (i % 3 === 0) ? 46 + (i % 5) * 4 : 28 + (i % 4) * 5;
      const bldg = this.createBuildingMesh(types[i % types.length], 10, 10, height);
      bldg.position.set(x, -6.0, z);
      bldg.rotation.y = (Math.PI / 4) * (i % 4);
      this.cityGroup.add(bldg);
      this.cityBuildingFootprints.push({
        x,
        z,
        radius: Math.hypot(10, 10) * 0.5,
      });
    }

    // Build Procedural Low-Poly Background Traffic
    this.buildTraffic();
  }

  private buildTraffic() {
    this.trafficGroup = new THREE.Group();
    this.trafficGroup.name = 'city_traffic';
    this.trafficCars = [];

    // Shared Materials for optimal GPU performance
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.15,
      metalness: 0.85,
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
    });
    const headlightMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
    });
    const taillightMat = new THREE.MeshBasicMaterial({
      color: 0x991b1b,
    });

    // Shared Geometries (unscaled base shapes, scaled to 0.70x at car group root)
    const sharedGeos = {
      sedanBody: new THREE.BoxGeometry(4.40, 0.52, 1.86),
      sedanCabin: new THREE.BoxGeometry(2.35, 0.52, 1.62),
      sedanRoof: new THREE.BoxGeometry(2.15, 0.08, 1.58),
      compactBody: new THREE.BoxGeometry(3.75, 0.52, 1.78),
      compactCabin: new THREE.BoxGeometry(2.10, 0.52, 1.54),
      compactRoof: new THREE.BoxGeometry(1.95, 0.08, 1.50),
      vanBody: new THREE.BoxGeometry(4.65, 0.58, 1.92),
      vanCargo: new THREE.BoxGeometry(3.10, 0.88, 1.88),
      vanCabWindow: new THREE.BoxGeometry(1.05, 0.72, 1.82),
      vanCabRoof: new THREE.BoxGeometry(1.10, 0.08, 1.84),
      wheel: new THREE.CylinderGeometry(0.35, 0.35, 0.26, 12).rotateX(Math.PI / 2),
      light: new THREE.BoxGeometry(0.05, 0.12, 0.32),
    };

    const sharedMats = {
      window: windowMat,
      wheel: wheelMat,
      headlight: headlightMat,
      taillight: taillightMat,
    };

    // Subdued, low-saturation architectural vehicle colors (no distracting bright neons)
    const CAR_COLORS = [
      0x64748b, // Muted Slate Grey
      0x334155, // Midnight Charcoal
      0x3b526b, // Dusty Muted Navy
      0x274332, // Restrained Dark Pine
      0x9c9484, // Warm Low-Saturation Beige
      0xe2e8f0, // Soft Off-White
      0x8c5b43, // Muted Terracotta Earth
    ];

    // Dedicated boulevard lanes positioned in the background half of the 14m roadbed (Z: -29 to -15)
    // Speed reduced to calm cruising (~75% of previous speed: 7.2 to 8.4 m/s)
    const laneDefs: { z: number; direction: 1 | -1; baseSpeed: number; initX: number; variant: 'SEDAN' | 'COMPACT' | 'VAN'; color: number }[] = [
      { z: -20.8, direction: 1, baseSpeed: 7.2, initX: -75, variant: 'SEDAN', color: CAR_COLORS[0] },   // Eastbound Mid-Inner
      { z: -22.4, direction: 1, baseSpeed: 8.4, initX: 30, variant: 'COMPACT', color: CAR_COLORS[2] },  // Eastbound Mid
      { z: -24.4, direction: -1, baseSpeed: -8.4, initX: -15, variant: 'SEDAN', color: CAR_COLORS[4] }, // Westbound Mid
      { z: -26.0, direction: -1, baseSpeed: -7.2, initX: 85, variant: 'VAN', color: CAR_COLORS[1] },    // Westbound Outer (Deep background)
    ];

    // Exactly 1 vehicle per lane ensures spacious 100m+ separation, ZERO bumper-to-bumper bunching,
    // and produces approximately 2 to 4 visible background vehicles at any time.
    laneDefs.forEach((lane) => {
      const carMesh = this.createLowPolyCar(lane.variant, lane.color, sharedGeos, sharedMats);
      carMesh.position.set(lane.initX, -5.99, lane.z);
      carMesh.rotation.y = lane.direction === 1 ? 0 : Math.PI;

      this.trafficGroup!.add(carMesh);
      this.trafficCars.push({
        mesh: carMesh,
        x: lane.initX,
        y: -5.99,
        z: lane.z,
        speed: lane.baseSpeed,
        direction: lane.direction,
      });
    });

    this.cityGroup.add(this.trafficGroup);
  }

  private createLowPolyCar(
    variant: 'SEDAN' | 'COMPACT' | 'VAN',
    colorHex: number,
    sharedGeos: {
      sedanBody: THREE.BufferGeometry;
      sedanCabin: THREE.BufferGeometry;
      sedanRoof: THREE.BufferGeometry;
      compactBody: THREE.BufferGeometry;
      compactCabin: THREE.BufferGeometry;
      compactRoof: THREE.BufferGeometry;
      vanBody: THREE.BufferGeometry;
      vanCargo: THREE.BufferGeometry;
      vanCabWindow: THREE.BufferGeometry;
      vanCabRoof: THREE.BufferGeometry;
      wheel: THREE.BufferGeometry;
      light: THREE.BufferGeometry;
    },
    sharedMats: {
      window: THREE.Material;
      wheel: THREE.Material;
      headlight: THREE.Material;
      taillight: THREE.Material;
    }
  ): THREE.Group {
    const carGroup = new THREE.Group();
    const paintMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.45,
      metalness: 0.15,
    });

    if (variant === 'SEDAN') {
      // SEDAN (Scaled to 0.70x: Length: 3.08m, Width: 1.30m, Height: 1.01m)
      // Lower Body
      const body = new THREE.Mesh(sharedGeos.sedanBody, paintMat);
      body.position.set(0, 0.54, 0);
      carGroup.add(body);

      // Cabin Glass Core (Windshield, Rear Window, Side Windows)
      const cabin = new THREE.Mesh(sharedGeos.sedanCabin, sharedMats.window);
      cabin.position.set(-0.15, 1.05, 0);
      carGroup.add(cabin);

      // Cabin Roof Panel
      const roof = new THREE.Mesh(sharedGeos.sedanRoof, paintMat);
      roof.position.set(-0.15, 1.33, 0);
      carGroup.add(roof);

      // 4 Wheels
      const wFL = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wFL.position.set(1.30, 0.35, -0.92);
      carGroup.add(wFL);
      const wFR = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wFR.position.set(1.30, 0.35, 0.92);
      carGroup.add(wFR);
      const wRL = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wRL.position.set(-1.30, 0.35, -0.92);
      carGroup.add(wRL);
      const wRR = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wRR.position.set(-1.30, 0.35, 0.92);
      carGroup.add(wRR);

      // Front Headlights (+X bumper)
      const hlL = new THREE.Mesh(sharedGeos.light, sharedMats.headlight);
      hlL.position.set(2.205, 0.54, -0.62);
      carGroup.add(hlL);
      const hlR = new THREE.Mesh(sharedGeos.light, sharedMats.headlight);
      hlR.position.set(2.205, 0.54, 0.62);
      carGroup.add(hlR);

      // Rear Taillights (-X bumper)
      const tlL = new THREE.Mesh(sharedGeos.light, sharedMats.taillight);
      tlL.position.set(-2.205, 0.54, -0.62);
      carGroup.add(tlL);
      const tlR = new THREE.Mesh(sharedGeos.light, sharedMats.taillight);
      tlR.position.set(-2.205, 0.54, 0.62);
      carGroup.add(tlR);
    } else if (variant === 'COMPACT') {
      // COMPACT HATCHBACK (Scaled to 0.70x: Length: 2.62m, Width: 1.25m, Height: 1.01m)
      // Lower Body
      const body = new THREE.Mesh(sharedGeos.compactBody, paintMat);
      body.position.set(0, 0.54, 0);
      carGroup.add(body);

      // Cabin Glass Core
      const cabin = new THREE.Mesh(sharedGeos.compactCabin, sharedMats.window);
      cabin.position.set(-0.35, 1.05, 0);
      carGroup.add(cabin);

      // Cabin Roof Panel
      const roof = new THREE.Mesh(sharedGeos.compactRoof, paintMat);
      roof.position.set(-0.35, 1.33, 0);
      carGroup.add(roof);

      // 4 Wheels
      const wFL = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wFL.position.set(1.10, 0.35, -0.88);
      carGroup.add(wFL);
      const wFR = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wFR.position.set(1.10, 0.35, 0.88);
      carGroup.add(wFR);
      const wRL = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wRL.position.set(-1.10, 0.35, -0.88);
      carGroup.add(wRL);
      const wRR = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wRR.position.set(-1.10, 0.35, 0.88);
      carGroup.add(wRR);

      // Front Headlights (+X bumper)
      const hlL = new THREE.Mesh(sharedGeos.light, sharedMats.headlight);
      hlL.position.set(1.88, 0.54, -0.58);
      carGroup.add(hlL);
      const hlR = new THREE.Mesh(sharedGeos.light, sharedMats.headlight);
      hlR.position.set(1.88, 0.54, 0.58);
      carGroup.add(hlR);

      // Rear Taillights (-X bumper)
      const tlL = new THREE.Mesh(sharedGeos.light, sharedMats.taillight);
      tlL.position.set(-1.88, 0.54, -0.58);
      carGroup.add(tlL);
      const tlR = new THREE.Mesh(sharedGeos.light, sharedMats.taillight);
      tlR.position.set(-1.88, 0.54, 0.58);
      carGroup.add(tlR);
    } else {
      // SMALL VAN (Scaled to 0.70x: Length: 3.25m, Width: 1.34m, Height: 1.27m)
      // Lower Chassis
      const body = new THREE.Mesh(sharedGeos.vanBody, paintMat);
      body.position.set(0, 0.57, 0);
      carGroup.add(body);

      // Upper Cargo Box
      const cargo = new THREE.Mesh(sharedGeos.vanCargo, paintMat);
      cargo.position.set(-0.55, 1.28, 0);
      carGroup.add(cargo);

      // Cab Windshield Block
      const cabWindow = new THREE.Mesh(sharedGeos.vanCabWindow, sharedMats.window);
      cabWindow.position.set(0.80, 1.20, 0);
      carGroup.add(cabWindow);

      // Cab Roof Panel
      const cabRoof = new THREE.Mesh(sharedGeos.vanCabRoof, paintMat);
      cabRoof.position.set(0.80, 1.60, 0);
      carGroup.add(cabRoof);

      // 4 Wheels
      const wFL = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wFL.position.set(1.45, 0.35, -0.94);
      carGroup.add(wFL);
      const wFR = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wFR.position.set(1.45, 0.35, 0.94);
      carGroup.add(wFR);
      const wRL = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wRL.position.set(-1.40, 0.35, -0.94);
      carGroup.add(wRL);
      const wRR = new THREE.Mesh(sharedGeos.wheel, sharedMats.wheel);
      wRR.position.set(-1.40, 0.35, 0.94);
      carGroup.add(wRR);

      // Front Headlights (+X bumper)
      const hlL = new THREE.Mesh(sharedGeos.light, sharedMats.headlight);
      hlL.position.set(2.33, 0.57, -0.65);
      carGroup.add(hlL);
      const hlR = new THREE.Mesh(sharedGeos.light, sharedMats.headlight);
      hlR.position.set(2.33, 0.57, 0.65);
      carGroup.add(hlR);

      // Rear Taillights (-X bumper)
      const tlL = new THREE.Mesh(sharedGeos.light, sharedMats.taillight);
      tlL.position.set(-2.33, 0.57, -0.65);
      carGroup.add(tlL);
      const tlR = new THREE.Mesh(sharedGeos.light, sharedMats.taillight);
      tlR.position.set(-2.33, 0.57, 0.65);
      carGroup.add(tlR);
    }

    // Explicit scale reduction (0.70x of original dimensions) ensuring background subordination
    const CAR_SCALE = 0.70;
    carGroup.scale.set(CAR_SCALE, CAR_SCALE, CAR_SCALE);

    return carGroup;
  }

  /**
   * Architectural Urban Landscaping System:
   * Replaces flat monolithic green sheets with an intentional system of irregular polygonal
   * garden beds, roadside planter strips, and riverfront parklands bounded by stone retaining curbs.
   *
   * Key Design Decisions:
   * 1. Low-poly, desaturated architectural tones (muted sage/olive greens) to avoid visual noise.
   * 2. Irregular convex/trapezoidal plots that naturally follow street grid and river contours.
   * 3. Clear 14m central plaza radius around (0,0) to prevent interference with construction/crane/drops.
   * 4. Elevation hierarchy: Ground (-6.05) < Turf (-6.00) < Road (-5.99) < Curbs (-5.94)
   *    guarantees ZERO coplanar Z-fighting at road/grass transitions.
   */
  private buildUrbanLandscaping() {
    const landscapingGroup = new THREE.Group();
    landscapingGroup.name = 'city_landscaping';

    // Desaturated, sophisticated architectural lawn & foliage materials
    const turfMat1 = new THREE.MeshStandardMaterial({
      color: 0x384a32, // Muted natural olive turf
      roughness: 0.90,
      side: THREE.DoubleSide,
    });
    const turfMat2 = new THREE.MeshStandardMaterial({
      color: 0x44583b, // Sunlit park meadow turf
      roughness: 0.88,
      side: THREE.DoubleSide,
    });
    const turfMat3 = new THREE.MeshStandardMaterial({
      color: 0x2e3e29, // Deep shaded forest turf
      roughness: 0.92,
      side: THREE.DoubleSide,
    });
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Clean architectural stone retaining curb
      roughness: 0.72,
    });
    const treeTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f,
      roughness: 0.92,
    });
    const treeFoliageMats = [
      new THREE.MeshStandardMaterial({ color: 0x344c31, roughness: 0.85, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x425838, roughness: 0.82, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x2b3d27, roughness: 0.88, flatShading: true }),
    ];

    // Helper: Create polygonal lawn plot with stone retaining curbs
    const addPlot = (points: [number, number][], material: THREE.Material, withCurbs = true) => {
      const shape = new THREE.Shape();
      // Use negative Y in shape space so rotateX(-Math.PI/2) yields identical positive Z in world space
      shape.moveTo(points[0][0], -points[0][1]);
      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i][0], -points[i][1]);
      }
      shape.closePath();

      const geo = new THREE.ShapeGeometry(shape);
      geo.rotateX(-Math.PI / 2);

      const lawnMesh = new THREE.Mesh(geo, material);
      lawnMesh.position.y = -6.00;
      lawnMesh.receiveShadow = true;
      landscapingGroup.add(lawnMesh);

      if (withCurbs) {
        for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const dx = p2[0] - p1[0];
          const dz = p2[1] - p1[1];
          const len = Math.hypot(dx, dz);
          if (len < 0.2) continue;

          const midX = (p1[0] + p2[0]) / 2;
          const midZ = (p1[1] + p2[1]) / 2;
          const rotY = -Math.atan2(dz, dx);

          const curbGeo = new THREE.BoxGeometry(len, 0.12, 0.35);
          const curbMesh = new THREE.Mesh(curbGeo, curbMat);
          curbMesh.position.set(midX, -5.94, midZ);
          curbMesh.rotation.y = rotY;
          curbMesh.receiveShadow = true;
          landscapingGroup.add(curbMesh);
        }
      }
    };

    // Helper: Add stylized low-poly park tree
    const addTree = (x: number, z: number, scale = 1.0, matIndex = 0) => {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 1.8 * scale, 6),
        treeTrunkMat
      );
      trunk.position.y = -5.1 + 0.9 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.25 * scale, 0),
        treeFoliageMats[matIndex % treeFoliageMats.length]
      );
      canopy.position.y = -5.1 + 1.8 * scale + 0.9 * scale;
      canopy.rotation.y = (x * 3 + z * 7) % Math.PI;
      canopy.castShadow = true;
      canopy.receiveShadow = true;
      treeGroup.add(canopy);

      treeGroup.position.set(x, 0, z);
      landscapingGroup.add(treeGroup);
    };

    // ========================================================================
    // 1. North-East Riverfront Parklands (Angled alongside riverbank X ~ 45-60)
    // ========================================================================
    // Plot NE-1 (Near Waterfront Garden)
    addPlot([
      [24, 18],
      [44, 23],
      [41, 56],
      [21, 50],
    ], turfMat1);

    // Plot NE-2 (Mid-Reach River Promenade Lawn)
    addPlot([
      [19, 64],
      [38, 70],
      [33, 115],
      [13, 108],
    ], turfMat2);

    // Plot NE-3 (North Meadow & Tree Grove)
    addPlot([
      [11, 124],
      [30, 131],
      [22, 182],
      [4, 174],
    ], turfMat3);

    // NE Park Trees
    addTree(32, 28, 1.1, 0);
    addTree(28, 42, 1.3, 1);
    addTree(36, 48, 0.9, 2);
    addTree(26, 78, 1.2, 0);
    addTree(22, 98, 1.4, 1);
    addTree(18, 140, 1.3, 2);
    addTree(12, 162, 1.1, 0);

    // ========================================================================
    // 2. South-East Riverfront Parklands (South of the boulevard)
    // ========================================================================
    // Plot SE-1 (South Bridge Approach Lawn)
    addPlot([
      [36, -34],
      [53, -39],
      [57, -78],
      [39, -72],
    ], turfMat2);

    // Plot SE-2 (South Riverside Terraces)
    addPlot([
      [41, -86],
      [59, -92],
      [64, -145],
      [44, -138],
    ], turfMat1);

    // Plot SE-3 (Far South Riverfront Green)
    addPlot([
      [46, -154],
      [66, -161],
      [71, -215],
      [50, -207],
    ], turfMat3);

    // SE Park Trees
    addTree(46, -46, 1.2, 1);
    addTree(42, -62, 1.0, 2);
    addTree(52, -105, 1.3, 0);
    addTree(48, -125, 1.1, 1);
    addTree(58, -175, 1.4, 2);

    // ========================================================================
    // 3. Boulevard Parkway Verges (Roadside Planter Strips along Z=-22 road)
    // Roadbed occupies Z = -29 to Z = -15. Strips sit neatly at Z = -13.6 and Z = -30.4.
    // ========================================================================
    // North Roadside Verges (Z = -13.2 to -14.4)
    addPlot([
      [-75, -13.0],
      [-38, -13.0],
      [-36, -14.2],
      [-77, -14.2],
    ], turfMat1);
    addPlot([
      [-26, -13.0],
      [6, -13.0],
      [8, -14.2],
      [-24, -14.2],
    ], turfMat1);
    addPlot([
      [18, -13.0],
      [55, -13.0],
      [57, -14.2],
      [16, -14.2],
    ], turfMat1);

    // South Roadside Verges (Z = -29.8 to -31.0)
    addPlot([
      [-75, -29.8],
      [-38, -29.8],
      [-36, -31.0],
      [-77, -31.0],
    ], turfMat1);
    addPlot([
      [-26, -29.8],
      [6, -29.8],
      [8, -31.0],
      [-24, -31.0],
    ], turfMat1);
    addPlot([
      [18, -29.8],
      [55, -29.8],
      [57, -31.0],
      [16, -31.0],
    ], turfMat1);

    // Low roadside decorative ornamental trees along boulevard verges
    addTree(-55, -13.6, 0.75, 0);
    addTree(-10, -13.6, 0.75, 1);
    addTree(35, -13.6, 0.75, 2);
    addTree(-55, -30.4, 0.75, 1);
    addTree(-10, -30.4, 0.75, 0);
    addTree(35, -30.4, 0.75, 2);

    // ========================================================================
    // 4. North-West Civic Garden Terrace (Angled Urban Park)
    // ========================================================================
    addPlot([
      [-28, 24],
      [-52, 29],
      [-58, 62],
      [-32, 56],
    ], turfMat2);

    addPlot([
      [-34, 68],
      [-60, 75],
      [-65, 115],
      [-38, 107],
    ], turfMat1);

    // NW Garden Trees
    addTree(-40, 36, 1.2, 0);
    addTree(-46, 52, 1.3, 1);
    addTree(-48, 85, 1.1, 2);
    addTree(-42, 102, 1.4, 0);

    // ========================================================================
    // 5. South-West Neighborhood Pocket Park
    // ========================================================================
    addPlot([
      [-26, -44],
      [-48, -49],
      [-53, -84],
      [-29, -78],
    ], turfMat1);

    addPlot([
      [-31, -90],
      [-55, -97],
      [-60, -135],
      [-34, -127],
    ], turfMat2);

    // SW Park Trees
    addTree(-36, -56, 1.1, 1);
    addTree(-42, -72, 1.2, 2);
    addTree(-46, -105, 1.3, 0);
    addTree(-40, -120, 1.1, 1);

    this.cityGroup.add(landscapingGroup);
  }

  private createBuildingMesh(
    type: 'GLASS' | 'CONCRETE' | 'BRICK' | 'STONE' | 'SLATE',
    width: number,
    depth: number,
    totalHeight: number
  ): THREE.Group {
    const bGroup = new THREE.Group();
    let facadeMat: THREE.Material;
    let trimColor = 0x94a3b8;
    let roofColor = 0x475569;

    switch (type) {
      case 'GLASS': {
        const tex = getGlassTexture();
        tex.repeat.set(Math.max(1, Math.round(width / 6)), Math.max(1, Math.round(totalHeight / 8)));
        facadeMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25, metalness: 0.7 });
        trimColor = 0x64748b;
        roofColor = 0x334155;
        break;
      }
      case 'CONCRETE': {
        const tex = getConcreteTexture();
        tex.repeat.set(Math.max(1, Math.round(width / 5)), Math.max(1, Math.round(totalHeight / 6)));
        facadeMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.1 });
        trimColor = 0xcbd5e1;
        roofColor = 0x64748b;
        break;
      }
      case 'BRICK': {
        const tex = getBrickTexture();
        tex.repeat.set(Math.max(1, Math.round(width / 5)), Math.max(1, Math.round(totalHeight / 6)));
        facadeMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.05 });
        trimColor = 0xf1ece1;
        roofColor = 0x44403c;
        break;
      }
      case 'STONE': {
        const tex = getStoneTexture();
        tex.repeat.set(Math.max(1, Math.round(width / 6)), Math.max(1, Math.round(totalHeight / 7)));
        facadeMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75, metalness: 0.2 });
        trimColor = 0xb45309;
        roofColor = 0x78716c;
        break;
      }
      case 'SLATE':
      default: {
        const tex = getSlateTexture();
        tex.repeat.set(Math.max(1, Math.round(width / 5)), Math.max(1, Math.round(totalHeight / 7)));
        facadeMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.3 });
        trimColor = 0xd97706;
        roofColor = 0x1e293b;
        break;
      }
    }

    const trimMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.5 });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.8 });

    // Podium
    const podiumH = 4.5;
    const podiumGeo = new THREE.BoxGeometry(width + 0.8, podiumH, depth + 0.8);
    const podium = new THREE.Mesh(podiumGeo, trimMat);
    podium.position.y = podiumH / 2;
    podium.castShadow = true;
    bGroup.add(podium);

    // Shaft
    const hasSetback = totalHeight > 34;
    const shaftH = hasSetback ? totalHeight * 0.68 : totalHeight - podiumH;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(width, shaftH, depth), facadeMat);
    shaft.position.y = podiumH + shaftH / 2;
    shaft.castShadow = true;
    bGroup.add(shaft);

    let curTopY = podiumH + shaftH;

    // Setback tier
    if (hasSetback) {
      const upperH = totalHeight - curTopY;
      const upper = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.78, upperH, depth * 0.78),
        facadeMat
      );
      upper.position.y = curTopY + upperH / 2;
      upper.castShadow = true;
      bGroup.add(upper);
      curTopY += upperH;
    }

    // Parapet
    const parapet = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.8, 0.5, depth * 0.8),
      trimMat
    );
    parapet.position.y = curTopY + 0.25;
    bGroup.add(parapet);
    curTopY += 0.5;

    // Rooftop equipment & mast with blinking aircraft beacon
    const pentH = 2.4;
    const penthouse = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.4, pentH, depth * 0.4),
      roofMat
    );
    penthouse.position.y = curTopY + pentH / 2;
    bGroup.add(penthouse);

    if (totalHeight > 32) {
      const mastH = 6.0;
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.18, mastH, 6),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 })
      );
      mast.position.set(0, curTopY + pentH + mastH / 2, 0);
      bGroup.add(mast);

      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      beacon.position.set(0, curTopY + pentH + mastH + 0.2, 0);
      bGroup.add(beacon);
      this.beaconLights.push(beacon);
    }

    return bGroup;
  }

  // ========================================================================
  // 3. REGION 2: HIGH MOUNTAINS (FLOORS 21–40) — Reference Images 3 & 4
  // ========================================================================
  private buildMountains() {
    // 3A. Karst Rock Pillars & Peaks (Radius 85 to 140m, Heights 50 to 95m)
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x57534e,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });
    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.8,
      metalness: 0.0,
      flatShading: true,
    });
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Mountain pine
      roughness: 0.8,
      flatShading: true,
    });
    const autumnMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Autumn maple from Ref 3
      roughness: 0.8,
      flatShading: true,
    });
    const mistMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Mountain peaks placed on the distant background perimeter (180m to 240m radius)
    // City buildings end at radius 160m; mountains form an authentic background horizon behind the skyline.
    const pillarSpecs = [
      { angle: 0.45, dist: 195, rad: 26, height: 85, snow: true },
      { angle: 1.15, dist: 215, rad: 32, height: 95, snow: true },
      { angle: 1.95, dist: 185, rad: 24, height: 78, snow: false },
      { angle: 2.75, dist: 235, rad: 38, height: 110, snow: true },
      { angle: 3.65, dist: 200, rad: 28, height: 88, snow: true },
      { angle: 4.55, dist: 220, rad: 30, height: 92, snow: true },
      { angle: 5.45, dist: 190, rad: 25, height: 82, snow: false },
    ];

    const placedPeaks: { x: number; z: number; rad: number; height: number }[] = [];

    pillarSpecs.forEach((p, idx) => {
      let currentDist = Math.max(p.dist, 175);
      const cosA = Math.cos(p.angle);
      const sinA = Math.sin(p.angle);
      let x = cosA * currentDist;
      let z = sinA * currentDist;

      // Enforce strict spatial clearance against all city building footprints
      if (this.cityBuildingFootprints && this.cityBuildingFootprints.length > 0) {
        let maxOverlapPush = 0;
        for (const bldg of this.cityBuildingFootprints) {
          const distToBldg = Math.hypot(x - bldg.x, z - bldg.z);
          const minRequired = p.rad + bldg.radius + 16;
          if (distToBldg < minRequired) {
            maxOverlapPush = Math.max(maxOverlapPush, minRequired - distToBldg);
          }
        }
        if (maxOverlapPush > 0) {
          currentDist += maxOverlapPush + 10;
          x = cosA * currentDist;
          z = sinA * currentDist;
        }
      }

      placedPeaks.push({ x, z, rad: p.rad, height: p.height });

      const peakGroup = new THREE.Group();

      // Lower rock body (tapered cylinder / cone)
      const baseGeo = new THREE.CylinderGeometry(p.rad * 0.45, p.rad, p.height * 0.75, 7);
      const baseMesh = new THREE.Mesh(baseGeo, rockMat);
      baseMesh.position.y = (p.height * 0.75) / 2;
      peakGroup.add(baseMesh);

      // Upper snow cap peak (Ref 4)
      const peakH = p.height * 0.25;
      const peakGeo = new THREE.ConeGeometry(p.rad * 0.45, peakH, 7);
      const peakMesh = new THREE.Mesh(peakGeo, p.snow ? snowMat : rockMat);
      peakMesh.position.y = p.height * 0.75 + peakH / 2;
      peakGroup.add(peakMesh);

      // Pine & Autumn trees clinging to rocky ledges (Ref 3)
      for (let t = 0; t < 5; t++) {
        const treeGeo = new THREE.ConeGeometry(2.2, 4.8, 5);
        const tree = new THREE.Mesh(treeGeo, (t % 2 === 0) ? foliageMat : autumnMat);
        const tAng = (t / 5) * Math.PI * 2;
        const tDist = p.rad * 0.48;
        tree.position.set(Math.cos(tAng) * tDist, p.height * 0.45 + (t % 3) * 4, Math.sin(tAng) * tDist);
        peakGroup.add(tree);
      }

      // Waterfall ribbon cascading down one dramatic cliff (Ref 4)
      if (idx === 1) {
        const waterGeo = new THREE.PlaneGeometry(4.5, 45);
        const waterMat = new THREE.MeshBasicMaterial({
          color: 0xbae6fd,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        });
        const waterfall = new THREE.Mesh(waterGeo, waterMat);
        waterfall.position.set(p.rad * 0.46, 30, 0);
        peakGroup.add(waterfall);
      }

      peakGroup.position.set(x, 0, z);
      this.mountainGroup.add(peakGroup);
    });

    // Mountain suspension footbridge connecting the two adjacent peaks (indices 0 & 1)
    if (placedPeaks.length >= 2) {
      const p1 = placedPeaks[0];
      const p2 = placedPeaks[1];
      const midX = (p1.x + p2.x) * 0.5;
      const midZ = (p1.z + p2.z) * 0.5;
      const span = Math.hypot(p2.x - p1.x, p2.z - p1.z) * 0.45;
      const bridgeGeo = new THREE.BoxGeometry(span, 0.5, 2.4);
      const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const mBridge = new THREE.Mesh(bridgeGeo, bridgeMat);
      mBridge.position.set(midX, 52, midZ);
      mBridge.rotation.y = Math.atan2(p2.z - p1.z, p2.x - p1.x);
      this.mountainGroup.add(mBridge);
    }

    // Deep valley mist planes floating in the distant mountain ring at Y = 28m to 48m
    for (let m = 0; m < 8; m++) {
      const mistGeo = new THREE.PlaneGeometry(180, 180);
      const mist = new THREE.Mesh(mistGeo, mistMat);
      mist.rotation.x = -Math.PI / 2;
      const mAng = (m / 8) * Math.PI * 2;
      mist.position.set(Math.cos(mAng) * 195, 32 + (m % 3) * 6, Math.sin(mAng) * 195);
      this.mountainGroup.add(mist);
    }

    // Soaring mountain eagles in updrafts (Ref 4)
    this.mountainEagles = new THREE.Group();
    for (let e = 0; e < 6; e++) {
      const eagleWing = new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial({ color: 0x1c1917, side: THREE.DoubleSide })
      );
      // Small simple V-shape bird mesh
      const vertices = new Float32Array([
        -1.4, 0, -0.5,
         0.0, 0,  0.5,
         1.4, 0, -0.5,
      ]);
      eagleWing.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const eAng = (e / 6) * Math.PI * 2;
      eagleWing.position.set(Math.cos(eAng) * 155, 62 + (e % 3) * 6, Math.sin(eAng) * 155);
      this.mountainEagles.add(eagleWing);
    }
    this.mountainGroup.add(this.mountainEagles);
  }

  // ========================================================================
  // 4. REGION 3: CLOUD WORLD (FLOORS 41–60) — Low-Poly Layered Cloud Formations
  // ========================================================================
  private buildCloudWorld() {
    const cloudPuffMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.88,
      metalness: 0.0,
      transparent: true,
      opacity: 0.92,
      flatShading: true,
    });

    const farCloudMat = new THREE.MeshStandardMaterial({
      color: 0xf0f9ff,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.72,
      flatShading: true,
    });

    // Helper: builds an asymmetric, stylized low-poly cumulus cluster with controlled bounds
    const createCloudCluster = (
      coreRadius: number,
      numLobes: number,
      mat: THREE.Material,
      spreadX = 1.25,
      spreadZ = 1.1
    ) => {
      const cluster = new THREE.Group();
      const core = new THREE.Mesh(new THREE.DodecahedronGeometry(coreRadius, 1), mat);
      core.scale.set(1.0, 0.72, 1.0);
      cluster.add(core);

      for (let i = 0; i < numLobes; i++) {
        const r = coreRadius * (0.55 + (i % 3) * 0.15);
        const lobe = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), mat);
        const ang = (i / numLobes) * Math.PI * 2 + (i % 2) * 0.4;
        const dist = coreRadius * 0.75;
        lobe.position.set(
          Math.cos(ang) * dist * spreadX,
          ((i % 3) - 1) * (coreRadius * 0.22),
          Math.sin(ang) * dist * spreadZ
        );
        lobe.scale.set(1.0, 0.68, 1.0);
        cluster.add(lobe);
      }
      return cluster;
    };

    // DEPTH LAYER 1: NEAR CLOUDS (Flanking outer viewport edges only; never close to camera or blocking gameplay)
    // Left lateral framing
    const nearLeft = createCloudCluster(3.6, 3, cloudPuffMat, 1.2, 1.0);
    nearLeft.position.set(-68, 102, -25);
    this.cloudWorldGroup.add(nearLeft);

    // Right lateral framing
    const nearRight = createCloudCluster(3.5, 3, cloudPuffMat, 1.2, 1.1);
    nearRight.position.set(38, 106, -30);
    this.cloudWorldGroup.add(nearRight);

    // Lower-left edge accent
    const nearLowerLeft = createCloudCluster(3.2, 3, cloudPuffMat, 1.3, 1.0);
    nearLowerLeft.position.set(-58, 92, -35);
    this.cloudWorldGroup.add(nearLowerLeft);

    // DEPTH LAYER 2: MID-DISTANCE CLOUDS (Scenic flanking cloud banks leaving the central corridor X: [-30, +15] open)
    const midCloudSpecs = [
      // Left side formations
      { x: -85, y: 96, z: -85, rad: 3.8, lobes: 4 },
      { x: -65, y: 106, z: -110, rad: 3.5, lobes: 3 },
      { x: -52, y: 114, z: -125, rad: 4.0, lobes: 4 },
      { x: -92, y: 118, z: -95, rad: 3.4, lobes: 3 },
      { x: -75, y: 110, z: -75, rad: 3.6, lobes: 3 },
      // Right side formations
      { x: 32, y: 102, z: -80, rad: 3.5, lobes: 3 },
      { x: 55, y: 112, z: -105, rad: 3.8, lobes: 4 },
      { x: 75, y: 98, z: -75, rad: 3.6, lobes: 3 },
      { x: 65, y: 118, z: -90, rad: 3.4, lobes: 3 },
      { x: 88, y: 115, z: -110, rad: 3.6, lobes: 4 },
    ];

    midCloudSpecs.forEach((spec) => {
      const cluster = createCloudCluster(spec.rad, spec.lobes, cloudPuffMat);
      cluster.position.set(spec.x, spec.y, spec.z);
      this.cloudWorldGroup.add(cluster);
    });

    // DEPTH LAYER 3: DISTANT CLOUDS (Smaller, soft low-opacity wisps creating atmospheric depth)
    for (let f = 0; f < 14; f++) {
      const fAng = (f / 14) * Math.PI * 1.5 + 0.85;
      const fDist = 180 + (f % 5) * 18;
      const fAlt = 86 + (f % 6) * 7;
      const fCluster = createCloudCluster(2.2 + (f % 3) * 0.4, 3, farCloudMat, 1.4, 1.2);
      fCluster.position.set(Math.cos(fAng) * fDist, fAlt, Math.sin(fAng) * fDist - 60);
      this.cloudWorldGroup.add(fCluster);
    }

    // Floating classical sky pavilion / temple ruin nestled in the distant right clouds
    const templeGroup = new THREE.Group();
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const blueTileMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.8 });

    const platform = new THREE.Mesh(new THREE.BoxGeometry(14, 1.8, 11), marbleMat);
    templeGroup.add(platform);

    for (let colX of [-5.0, 0, 5.0]) {
      for (let colZ of [-3.5, 3.5]) {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.45, 6.5, 8), marbleMat);
        column.position.set(colX, 4.2, colZ);
        templeGroup.add(column);
      }
    }

    const roof = new THREE.Mesh(new THREE.ConeGeometry(9.5, 3.8, 4), blueTileMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 9.2, 0);
    templeGroup.add(roof);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4, 6), goldMat);
    spire.position.set(0, 12.5, 0);
    templeGroup.add(spire);

    // Proportional cloud base for temple (radius 5.5m)
    const templeCloud = createCloudCluster(5.5, 4, cloudPuffMat, 1.3, 1.2);
    templeCloud.position.set(0, -3.5, 0);
    templeGroup.add(templeCloud);

    templeGroup.position.set(90, 104, -125);
    this.cloudWorldGroup.add(templeGroup);
  }

  // ========================================================================
  // 5. REGION 4: ABOVE THE CLOUDS (FLOORS 61–80) — Rolling Cloud Ocean Below
  // ========================================================================
  private buildAboveCloudSea() {
    // Crisp sunlit cloud tops for the ocean below
    const oceanMoundMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.76,
      metalness: 0.02,
      flatShading: true,
    });

    // Soft shading for lower cloud depth
    const oceanDepthMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.90,
      flatShading: true,
    });

    // Soft misty bed underneath mounds to seal the cloud carpet
    const hazeBedMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.95,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });

    // LAYER 1: Distant Undulating Cloud Horizon Line (at Z = -230m to -290m, centered at X = -140m)
    // 20 overlapping low-poly billow crests forming a distinct, undulating cloud horizon
    for (let h = 0; h < 20; h++) {
      const hRad = 15 + (h % 4) * 2.8;
      const hMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(hRad, 1), oceanMoundMat);
      hMesh.scale.set(1.45, 0.42, 1.25);
      const hX = -250 + h * 22;
      const hZ = -245 - (h % 3) * 20;
      const hY = Math.sin(h * 0.75) * 2.2;
      hMesh.position.set(hX, hY, hZ);
      this.aboveCloudSeaGroup.add(hMesh);
    }

    // LAYER 2: Rolling Cloud Ocean Mounds Below the Player (terraced downward from Y = -2m to -16m)
    // 30 low-poly billow mounds creating a vast, undulating ocean surface
    for (let m = 0; m < 30; m++) {
      const mRad = 12 + (m % 5) * 2.5;
      const mat = (m % 3 === 0) ? oceanDepthMat : oceanMoundMat;
      const mound = new THREE.Mesh(new THREE.DodecahedronGeometry(mRad, 1), mat);
      mound.scale.set(1.35, 0.38, 1.35);

      const mAng = (m / 30) * Math.PI * 1.6 + 0.65;
      const mDist = 80 + (m % 6) * 25;
      const mY = -4 - (m % 4) * 2.8;
      mound.position.set(Math.cos(mAng) * mDist - 40, mY, Math.sin(mAng) * mDist - 120);
      this.aboveCloudSeaGroup.add(mound);
    }

    // LAYER 3: Sub-bed sealing the cloud ocean carpet (placed far below at Y = -18m)
    for (let b = 0; b < 8; b++) {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(85, 3.5, 85), hazeBedMat);
      const bAng = (b / 8) * Math.PI * 2;
      const bDist = 95 + (b % 3) * 30;
      bed.position.set(Math.cos(bAng) * bDist - 40, -18, Math.sin(bAng) * bDist - 130);
      this.aboveCloudSeaGroup.add(bed);
    }

    // LAYER 4: Solitary extreme mountain summit piercing the cloud ocean (Everest tip on far left)
    const everestTip = new THREE.Mesh(
      new THREE.ConeGeometry(18, 30, 7),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9, flatShading: true })
    );
    everestTip.position.set(-160, 10, -230);
    this.aboveCloudSeaGroup.add(everestTip);

    const everestSnow = new THREE.Mesh(
      new THREE.ConeGeometry(9, 14, 7),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, flatShading: true })
    );
    everestSnow.position.set(-160, 18, -230);
    this.aboveCloudSeaGroup.add(everestSnow);

    // LAYER 5: Distant high-altitude cirrus wisps in upper open sky
    for (let w = 0; w < 4; w++) {
      const wisp = new THREE.Mesh(
        new THREE.DodecahedronGeometry(5.0, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42 })
      );
      wisp.scale.set(3.0, 0.22, 0.8);
      wisp.position.set(-130 + w * 65, 48 + (w % 2) * 6, -260);
      this.aboveCloudSeaGroup.add(wisp);
    }

    // LAYER 6: Distant commercial passenger airplane cruising the upper sky
    this.airplaneGroup = new THREE.Group();
    const planeFuselage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    planeFuselage.rotation.z = Math.PI / 2;
    this.airplaneGroup.add(planeFuselage);

    const planeWing = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.18, 12),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    );
    this.airplaneGroup.add(planeWing);

    // Dual white contrail lines
    const contrailGeo = new THREE.CylinderGeometry(0.18, 0.35, 55, 4);
    const contrailMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.72,
    });
    const c1 = new THREE.Mesh(contrailGeo, contrailMat);
    c1.rotation.z = Math.PI / 2;
    c1.position.set(-29, 0, -2.2);
    this.airplaneGroup.add(c1);

    const c2 = new THREE.Mesh(contrailGeo, contrailMat);
    c2.rotation.z = Math.PI / 2;
    c2.position.set(-29, 0, 2.2);
    this.airplaneGroup.add(c2);

    this.airplaneGroup.position.set(-220, 32, -200);
    this.aboveCloudSeaGroup.add(this.airplaneGroup);
  }

  // ========================================================================
  // 6. REGION 5: HIGH ATMOSPHERE (FLOORS 81–100) — Curved Atmospheric Horizon Below
  // ========================================================================
  private buildHighAtmosphere() {
    // Subtle curved atmospheric horizon arc aligned with camera optical line (X = -150m, Z = -280m)
    // Curvature radius R = 420m, top crest at Y = -96m relative to camera target (lower 32% of screen)
    const arcRadius = 420;
    const segments = 52;
    const spanAng = 0.82; // ~47 degrees horizontal field
    const ribbonWidth = 5.5;

    // Glowing cyan atmospheric fringe along the curved top edge
    const fringeGeo = new THREE.BufferGeometry();
    const fringeVerts: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const a = -spanAng / 2 + (i / segments) * spanAng;
      const x = Math.sin(a) * arcRadius;
      // Center crest is at Y = -96m; drops smoothly at lateral edges
      const yTop = -96 - (arcRadius - Math.cos(a) * arcRadius);
      const yBottom = yTop - ribbonWidth;
      fringeVerts.push(x, yTop, 0);
      fringeVerts.push(x, yBottom, 0);
    }

    const fringeIndices: number[] = [];
    for (let i = 0; i < segments; i++) {
      const v = i * 2;
      fringeIndices.push(v, v + 1, v + 2);
      fringeIndices.push(v + 1, v + 3, v + 2);
    }

    fringeGeo.setAttribute('position', new THREE.Float32BufferAttribute(fringeVerts, 3));
    fringeGeo.setIndex(fringeIndices);
    fringeGeo.computeVertexNormals();

    const fringeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const fringeMesh = new THREE.Mesh(fringeGeo, fringeMat);
    fringeMesh.position.set(-150, 0, -280);
    this.highAtmoGroup.add(fringeMesh);

    // Deep atmospheric ocean body below the glowing fringe
    const bodyGeo = new THREE.BufferGeometry();
    const bodyVerts: number[] = [];
    const bodyDepth = 50.0;

    for (let i = 0; i <= segments; i++) {
      const a = -spanAng / 2 + (i / segments) * spanAng;
      const x = Math.sin(a) * arcRadius;
      const yTop = -96 - ribbonWidth - (arcRadius - Math.cos(a) * arcRadius);
      const yBottom = yTop - bodyDepth;
      bodyVerts.push(x, yTop, 0);
      bodyVerts.push(x, yBottom, 0);
    }

    bodyGeo.setAttribute('position', new THREE.Float32BufferAttribute(bodyVerts, 3));
    bodyGeo.setIndex(fringeIndices);
    bodyGeo.computeVertexNormals();

    const bodyMat = new THREE.MeshBasicMaterial({
      color: 0x08203c,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(-150, 0, -280);
    this.highAtmoGroup.add(bodyMesh);

    // Subtle micro-scale cloud streaks far below the horizon curve (satellite weather view)
    for (let s = 0; s < 6; s++) {
      const streak = new THREE.Mesh(
        new THREE.DodecahedronGeometry(5, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.24 })
      );
      streak.scale.set(3.2, 0.15, 0.8);
      streak.position.set(-190 + s * 32, -108 + (s % 3) * 3, -290);
      this.highAtmoGroup.add(streak);
    }
  }

  // ========================================================================
  // 7. REGION 6 & 7: EDGE OF SPACE & SPACE (FLOORS 101–140) — SPACE ABOVE, EARTH BELOW
  // ========================================================================
  private buildSpaceAndEarth() {
    // 7A. 1400+ Sharp Star Points in deep space void (upper hemisphere)
    const starCount = 1400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const rad = 500 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 1.5 - 0.5); // strictly upper celestial hemisphere

      starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = rad * Math.cos(phi) + 120; // centered in upper sky
      starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);

      const isBlue = Math.random() > 0.75;
      const isWarm = Math.random() > 0.85;
      starColors[i * 3] = isBlue ? 0.75 : 1.0;
      starColors[i * 3 + 1] = isWarm ? 0.9 : (isBlue ? 0.88 : 1.0);
      starColors[i * 3 + 2] = isWarm ? 0.7 : 1.0;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
    });
    this.starsMesh = new THREE.Points(starGeo, starMat);
    this.spaceGroup.add(this.starsMesh);

    // 7B. Stylized Curved Earth Sphere below in distance
    // Aligned with optical center: Z = -280m, X = -150m, Radius = 180m
    // Center at Y = -276m relative to cameraTargetY -> top crest at Y = -96m (strictly in lower 33% of screen)
    // The upper 67% of the viewport is dark starry space; Earth forms an elegant curved arc below!
    const earthGeo = new THREE.SphereGeometry(180, 36, 36);
    const earthTex = getEarthTexture();
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.75,
      metalness: 0.05,
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthMesh.position.set(-150, -276, -280);
    this.spaceGroup.add(this.earthMesh);

    // 7C. Luminous cyan atmospheric limb ring hugging the top curved crest of the Earth
    const limbGeo = new THREE.RingGeometry(179, 185, 64, 1, 0, Math.PI);
    const limbMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.earthLimb = new THREE.Mesh(limbGeo, limbMat);
    this.earthLimb.position.set(-150, -276, -276);
    this.earthLimb.rotation.x = -0.165; // Tilted ~9.5 deg to face camera elevation
    this.spaceGroup.add(this.earthLimb);
  }

  // ========================================================================
  // 8. REGION 8: ORBITAL REGION (FLOORS 141–160) — Ref Image 1
  // ========================================================================
  private buildOrbitalStationAndSatellites() {
    // 8A. Communication Satellite drifting in background
    this.satelliteMesh = new THREE.Group();
    const satBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.4, 3.2),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 }) // Gold foil
    );
    this.satelliteMesh.add(satBody);

    // Solar Wings
    const solarWingMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.2, metalness: 0.6 });
    const wing1 = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.1, 2.4), solarWingMat);
    wing1.position.set(5.8, 0, 0);
    this.satelliteMesh.add(wing1);

    const wing2 = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.1, 2.4), solarWingMat);
    wing2.position.set(-5.8, 0, 0);
    this.satelliteMesh.add(wing2);

    // Parabolic antenna dish
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.4),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, side: THREE.DoubleSide })
    );
    dish.rotation.x = Math.PI;
    dish.position.set(0, 1.8, 0);
    this.satelliteMesh.add(dish);

    this.satelliteMesh.position.set(75, 335, -80);
    this.orbitalGroup.add(this.satelliteMesh);

    // 8B. Futuristic Orbital Space Station inspired by Reference Image 1
    // Large geometric octagonal truss ring with glowing neon cyan strips & solar wings
    this.spaceStationGroup = new THREE.Group();

    const ringMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
    const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const stationWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.4 });

    // Outer octagonal ring modules
    const ringRadius = 26;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const nextAng = ((i + 1) / 8) * Math.PI * 2;
      const midAng = (ang + nextAng) / 2;

      const segLen = 2 * ringRadius * Math.sin(Math.PI / 8);
      const segMesh = new THREE.Mesh(new THREE.BoxGeometry(segLen, 3.2, 4.0), ringMat);
      segMesh.position.set(Math.cos(midAng) * ringRadius, Math.sin(midAng) * ringRadius, 0);
      segMesh.rotation.z = midAng + Math.PI / 2;
      this.spaceStationGroup.add(segMesh);

      // Glowing blue neon light strip (Ref 1)
      const neonStrip = new THREE.Mesh(new THREE.BoxGeometry(segLen * 0.9, 0.3, 0.4), neonCyanMat);
      neonStrip.position.set(Math.cos(midAng) * ringRadius, Math.sin(midAng) * ringRadius, 2.1);
      neonStrip.rotation.z = midAng + Math.PI / 2;
      this.spaceStationGroup.add(neonStrip);

      // Spoke truss to hub
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, ringRadius, 6), stationWhiteMat);
      spoke.position.set((Math.cos(ang) * ringRadius) / 2, (Math.sin(ang) * ringRadius) / 2, 0);
      spoke.rotation.z = ang + Math.PI / 2;
      this.spaceStationGroup.add(spoke);
    }

    // Central Docking Hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 12, 12), stationWhiteMat);
    hub.rotation.x = Math.PI / 2;
    this.spaceStationGroup.add(hub);

    // Large solar wings on space station
    const stSolar = new THREE.Mesh(new THREE.BoxGeometry(34, 4.5, 0.2), solarWingMat);
    stSolar.position.set(0, 0, -8);
    this.spaceStationGroup.add(stSolar);

    this.spaceStationGroup.position.set(-95, 360, -140);
    this.spaceStationGroup.rotation.y = 0.5;
    this.orbitalGroup.add(this.spaceStationGroup);
  }

  // ========================================================================
  // 9. REGION 9 & 10: MOON APPROACH & MOON REGION (FLOORS 66–80)
  // ========================================================================
  private buildMoon() {
    // Stylized 3D Moon
    const moonGeo = new THREE.SphereGeometry(35, 32, 32);
    const moonTex = getMoonTexture();
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: false,
    });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(65, 430, -160);
    this.moonGroup.add(this.moonMesh);

    // Lunar mountain silhouette crags at bottom of Moon for Moon Region (Floors 73–80)
    this.lunarCragsGroup = new THREE.Group();
    const lunarCragMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.95,
      flatShading: true,
    });
    for (let c = 0; c < 12; c++) {
      const cragGeo = new THREE.ConeGeometry(12 + (c % 3) * 5, 22 + (c % 4) * 8, 6);
      const crag = new THREE.Mesh(cragGeo, lunarCragMat);
      const cAng = (c / 12) * Math.PI * 0.8 + 0.2;
      crag.position.set(
        Math.cos(cAng) * 60 + 20,
        -18 - (c % 3) * 4,
        Math.sin(cAng) * 50 - 160
      );
      this.lunarCragsGroup.add(crag);
    }
    this.moonGroup.add(this.lunarCragsGroup);
  }

  /**
   * Single Source of Truth for environment region progression thresholds and transition blending.
   */
  public static getRegionState(floorCount: number): RegionState {
    let regionIndex = 0;
    let regionId: EnvironmentRegionId = 'CITY';
    let transitionProgress = 0;
    let regionName = 'CITY / GROUND';
    let nextRegionName = 'HIGH MOUNTAINS';

    if (floorCount < 8) {
      regionIndex = 0;
      regionId = 'CITY';
      transitionProgress = 0;
      regionName = 'CITY / GROUND';
      nextRegionName = 'HIGH MOUNTAINS';
    } else if (floorCount <= 10) {
      regionIndex = 0;
      regionId = 'CITY';
      transitionProgress = (floorCount - 7) / 3; // Floor 8: 0.33, Floor 10: 1.0
      regionName = 'LEAVING CITY';
      nextRegionName = 'HIGH MOUNTAINS';
    } else if (floorCount < 16) {
      regionIndex = 1;
      regionId = 'HIGH_MOUNTAINS';
      transitionProgress = 0;
      regionName = 'HIGH MOUNTAINS';
      nextRegionName = 'CLOUD WORLD';
    } else if (floorCount <= 20) {
      regionIndex = 1;
      regionId = 'HIGH_MOUNTAINS';
      // Smooth 5-floor transition window across floors 16 to 20
      // Floor 16: 0.2, Floor 17: 0.4, Floor 18: 0.6, Floor 19: 0.8, Floor 20: 1.0
      transitionProgress = (floorCount - 15) / 5;
      regionName = 'APPROACHING CLOUDS';
      nextRegionName = 'CLOUD WORLD';
    } else if (floorCount < 28) {
      regionIndex = 2;
      regionId = 'CLOUD_WORLD';
      transitionProgress = 0;
      regionName = 'CLOUD WORLD';
      nextRegionName = 'ABOVE THE CLOUDS';
    } else if (floorCount <= 30) {
      regionIndex = 2;
      regionId = 'CLOUD_WORLD';
      transitionProgress = (floorCount - 27) / 3; // Floor 28: 0.33, Floor 30: 1.0
      regionName = 'BREAKING THROUGH CLOUDS';
      nextRegionName = 'ABOVE THE CLOUDS';
    } else if (floorCount < 36) {
      regionIndex = 3;
      regionId = 'ABOVE_THE_CLOUDS';
      transitionProgress = 0;
      regionName = 'ABOVE THE CLOUDS';
      nextRegionName = 'HIGH ATMOSPHERE';
    } else if (floorCount <= 37) {
      regionIndex = 3;
      regionId = 'ABOVE_THE_CLOUDS';
      transitionProgress = (floorCount - 35) / 2; // Floor 36: 0.5, Floor 37: 1.0
      regionName = 'CLIMBING UPPER SKY';
      nextRegionName = 'HIGH ATMOSPHERE';
    } else if (floorCount < 43) {
      regionIndex = 4;
      regionId = 'HIGH_ATMOSPHERE';
      transitionProgress = 0;
      regionName = 'HIGH ATMOSPHERE';
      nextRegionName = 'EDGE OF SPACE';
    } else if (floorCount <= 44) {
      regionIndex = 4;
      regionId = 'HIGH_ATMOSPHERE';
      transitionProgress = (floorCount - 42) / 2; // Floor 43: 0.5, Floor 44: 1.0
      regionName = 'ATMOSPHERE THINNING';
      nextRegionName = 'EDGE OF SPACE';
    } else if (floorCount < 50) {
      regionIndex = 5;
      regionId = 'EDGE_OF_SPACE';
      transitionProgress = 0;
      regionName = 'EDGE OF SPACE';
      nextRegionName = 'SPACE / EARTH BELOW';
    } else if (floorCount <= 51) {
      regionIndex = 5;
      regionId = 'EDGE_OF_SPACE';
      transitionProgress = (floorCount - 49) / 2; // Floor 50: 0.5, Floor 51: 1.0
      regionName = 'ENTERING SPACE';
      nextRegionName = 'SPACE / EARTH BELOW';
    } else if (floorCount < 57) {
      regionIndex = 6;
      regionId = 'SPACE_EARTH_BELOW';
      transitionProgress = 0;
      regionName = 'SPACE / EARTH BELOW';
      nextRegionName = 'ORBITAL REGION';
    } else if (floorCount <= 58) {
      regionIndex = 6;
      regionId = 'SPACE_EARTH_BELOW';
      transitionProgress = (floorCount - 56) / 2; // Floor 57: 0.5, Floor 58: 1.0
      regionName = 'APPROACHING ORBIT';
      nextRegionName = 'ORBITAL REGION';
    } else if (floorCount < 64) {
      regionIndex = 7;
      regionId = 'ORBITAL_REGION';
      transitionProgress = 0;
      regionName = 'ORBITAL REGION';
      nextRegionName = 'MOON APPROACH';
    } else if (floorCount <= 65) {
      regionIndex = 7;
      regionId = 'ORBITAL_REGION';
      transitionProgress = (floorCount - 63) / 2; // Floor 64: 0.5, Floor 65: 1.0
      regionName = 'LEAVING ORBIT';
      nextRegionName = 'MOON APPROACH';
    } else if (floorCount < 71) {
      regionIndex = 8;
      regionId = 'MOON_APPROACH';
      transitionProgress = 0;
      regionName = 'MOON APPROACH';
      nextRegionName = 'MOON REGION';
    } else if (floorCount <= 72) {
      regionIndex = 8;
      regionId = 'MOON_APPROACH';
      transitionProgress = (floorCount - 70) / 2; // Floor 71: 0.5, Floor 72: 1.0
      regionName = 'LUNAR DESCENT';
      nextRegionName = 'MOON REGION';
    } else if (floorCount < 79) {
      regionIndex = 9;
      regionId = 'MOON_REGION';
      transitionProgress = 0;
      regionName = 'MOON REGION';
      nextRegionName = 'ENDLESS SPACE';
    } else if (floorCount <= 80) {
      regionIndex = 9;
      regionId = 'MOON_REGION';
      transitionProgress = (floorCount - 78) / 2; // Floor 79: 0.5, Floor 80: 1.0
      regionName = 'APPROACHING DEEP SPACE';
      nextRegionName = 'ENDLESS SPACE';
    } else {
      regionIndex = 10;
      regionId = 'ENDLESS_SPACE';
      transitionProgress = Math.min(1.0, (floorCount - 80) / 3);
      regionName = 'ENDLESS SPACE';
      nextRegionName = 'DEEP COSMOS';
    }

    return {
      regionIndex,
      regionId,
      regionName,
      nextRegionName,
      transitionProgress,
    };
  }

  public getRegionState(floorCount: number): RegionState {
    return EnvironmentManager.getRegionState(floorCount);
  }

  // ========================================================================
  // 10. CONTINUOUS TRANSITION ENGINE (FLOOR COUNT DRIVEN)
  // ========================================================================
  public update(
    delta: number,
    cameraTargetY: number = 0,
    floorCount: number = 0,
    scene?: THREE.Scene,
    sunLight?: THREE.DirectionalLight,
    ambientLight?: THREE.AmbientLight
  ): RegionState {
    // 10A. Calculate Region & Smooth Continuous Transitions from Single Source of Truth
    const state = EnvironmentManager.getRegionState(floorCount);
    const { regionIndex, transitionProgress } = state;

    this.currentRegion = regionIndex;
    this.transitionT = transitionProgress;

    // 10B. Stream and Cull Scenery with smooth overlapping transitions:
    // "OLD ENVIRONMENT MUST MOVE BELOW"
    // Ground city stays at Y = 0. Gradually sinks via parallax and remains visible until floor 26.
    this.cityGroup.visible = floorCount <= 26;
    if (this.cityGroup.visible) {
      const citySink = Math.max(0, floorCount - 12) * 2.2;
      this.cityGroup.position.y = -citySink;
    }

    // Mountains are visible from Floor 5 up to Floor 36
    this.mountainGroup.visible = floorCount >= 5 && floorCount <= 36;
    if (this.mountainGroup.visible) {
      if (floorCount > 18) {
        const mountainSink = THREE.MathUtils.smoothstep(floorCount, 18, 34) * 45;
        this.mountainGroup.position.y = -mountainSink;
      } else {
        this.mountainGroup.position.y = 0;
      }
    }

    // Cloud world is visible from Floor 15 up to Floor 38 with smooth entrance & exit scaling
    this.cloudWorldGroup.visible = floorCount >= 15 && floorCount <= 38;
    if (this.cloudWorldGroup.visible) {
      if (floorCount < 21) {
        // Floor 15-20: incoming cloud world grows and rises smoothly into view
        const cloudEntrance = THREE.MathUtils.smoothstep(floorCount, 15, 21);
        const cloudScale = THREE.MathUtils.lerp(0.15, 1.0, cloudEntrance);
        this.cloudWorldGroup.scale.set(cloudScale, cloudScale, cloudScale);
        this.cloudWorldGroup.position.y = THREE.MathUtils.lerp(-80, -45, cloudEntrance);
      } else if (floorCount > 28) {
        // Floor 28-36: cloud world gently sinks beneath the tower
        const cloudExit = THREE.MathUtils.smoothstep(floorCount, 28, 36);
        this.cloudWorldGroup.position.y = THREE.MathUtils.lerp(-45, -110, cloudExit);
        const exitScale = THREE.MathUtils.lerp(1.0, 0.4, cloudExit);
        this.cloudWorldGroup.scale.set(exitScale, exitScale, exitScale);
      } else {
        this.cloudWorldGroup.scale.set(1, 1, 1);
        this.cloudWorldGroup.position.y = -45;
      }
    }

    // Above cloud ocean is visible from Floor 26 up to Floor 50
    this.aboveCloudSeaGroup.visible = floorCount >= 26 && floorCount <= 50;
    // High atmosphere curved horizon is visible from Floor 34 up to Floor 56
    this.highAtmoGroup.visible = floorCount >= 34 && floorCount <= 56;
    // Space & Earth globe are visible from Floor 42 onward
    this.spaceGroup.visible = floorCount >= 42;
    // Orbital station is visible from Floor 54 to Floor 76
    this.orbitalGroup.visible = floorCount >= 54 && floorCount <= 76;
    // Moon is visible from Floor 62 onward
    this.moonGroup.visible = floorCount >= 62;

    // 10C. Dynamic Parallax Tracking:
    // Old scenery remains at world altitude; celestial / sky elements follow smoothly
    this.skyGroup.position.y = cameraTargetY * 0.95;

    if (this.aboveCloudSeaGroup.visible) {
      // Dynamic vertical climbing parallax for the cloud ocean below
      this.aboveCloudSeaGroup.position.y = cameraTargetY - 32 - (floorCount - 31) * 1.5;
    }

    if (this.highAtmoGroup.visible) {
      this.highAtmoGroup.position.y = cameraTargetY;
    }

    if (this.spaceGroup.visible && this.earthMesh) {
      // Earth remains in distant background below the player (strictly lower 33% of view)
      this.earthMesh.position.set(-150, cameraTargetY - 276, -280);
      this.earthMesh.rotation.y += delta * 0.012;
      if (this.earthLimb) {
        this.earthLimb.position.set(-150, cameraTargetY - 276, -276);
      }
    }

    if (this.starsMesh) {
      this.starsMesh.position.y = cameraTargetY;
    }

    if (this.moonMesh) {
      // Moon approach scaling:
      // Floor 66: scale 0.3 (small Moon disc)
      // Floor 72: scale 0.75 (approaching Moon)
      // Floor 76+: scale 1.2 (dominates view in Moon Region)
      const moonProg = Math.max(0, Math.min(1.0, (floorCount - 65) / 15));
      const moonScale = THREE.MathUtils.lerp(0.3, 1.2, moonProg);
      this.moonMesh.scale.set(moonScale, moonScale, moonScale);
      this.moonMesh.position.y = cameraTargetY + 45;
    }

    if (this.lunarCragsGroup) {
      this.lunarCragsGroup.position.y = cameraTargetY - 25;
      this.lunarCragsGroup.visible = floorCount >= 71;
    }

    if (this.spaceStationGroup && this.spaceStationGroup.visible) {
      this.spaceStationGroup.position.y = cameraTargetY + 18;
      this.spaceStationGroup.rotation.z += delta * 0.08; // slow rotation
    }

    if (this.satelliteMesh && this.satelliteMesh.visible) {
      this.satelliteMesh.position.y = cameraTargetY + 12;
      this.satelliteMesh.rotation.y += delta * 0.15;
    }

    // 10D. Update animated vehicles and creatures
    // City Traffic (Procedural Low-Poly Cars on Boulevard)
    if (this.trafficCars.length > 0 && this.cityGroup.visible) {
      const dt = Math.min(delta, 0.1);
      for (let i = 0; i < this.trafficCars.length; i++) {
        const car = this.trafficCars[i];
        car.x += car.speed * dt;

        // Smooth wrap outside camera view frustum (-125m to +125m)
        if (car.direction === 1 && car.x > 125) {
          car.x = -125;
        } else if (car.direction === -1 && car.x < -125) {
          car.x = 125;
        }

        car.mesh.position.x = car.x;
      }
    }

    // City Beacons
    if (this.cityGroup.visible) {
      this.beaconTimer += delta;
      const bState = Math.sin(this.beaconTimer * 4.5) > 0.1;
      this.beaconLights.forEach((b) => (b.visible = bState));
    }

    // Mountain Eagles circling
    if (this.mountainEagles && this.mountainGroup.visible) {
      this.mountainEagles.rotation.y += delta * 0.25;
    }

    // Airplane crossing in background (Above Clouds)
    if (this.airplaneGroup && this.aboveCloudSeaGroup.visible) {
      this.airplaneX += delta * 18;
      if (this.airplaneX > 240) this.airplaneX = -240;
      this.airplaneGroup.position.x = this.airplaneX;
    }

    // 10E. Update Sky Shader, Fog, and Sun/Ambient Lighting
    this.updateLightingAndSky(floorCount, regionIndex, transitionProgress, scene, sunLight, ambientLight);

    // Development-only required debug log (logged only when floor count changes to avoid console spam)
    if (import.meta.env.DEV && floorCount !== this.lastLoggedFloor) {
      this.lastLoggedFloor = floorCount;
      console.debug('[EnvironmentTransition]', {
        Floor: floorCount,
        CurrentRegion: state.regionName,
        NextRegion: state.nextRegionName,
        Blend: Number(state.transitionProgress.toFixed(2)),
      });
    }

    return state;
  }

  private updateLightingAndSky(
    floorCount: number,
    regionIndex: number,
    transitionProgress: number,
    scene?: THREE.Scene,
    sunLight?: THREE.DirectionalLight,
    ambientLight?: THREE.AmbientLight
  ) {
    // Sky color targets based on progression
    const uniforms = this.skyMaterial.uniforms;

    if (regionIndex === 0) {
      // City: bright azure sky, golden horizon
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(
        THREE.MathUtils.lerp(0.22, 0.08, t),
        THREE.MathUtils.lerp(0.74, 0.52, t),
        THREE.MathUtils.lerp(0.97, 0.85, t)
      );
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.99, 0.88, t),
        THREE.MathUtils.lerp(0.94, 0.95, t),
        THREE.MathUtils.lerp(0.54, 0.99, t)
      );
      uniforms.starIntensity.value = 0.0;
      uniforms.spaceDarkness.value = 0.0;

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(0.88, 0.95, 0.99);
        scene.fog.density = 0.0035;
      }
      if (sunLight) {
        sunLight.color.setHex(0xffedd5);
        sunLight.intensity = 2.0;
      }
      if (ambientLight) {
        ambientLight.color.setHex(0xffedd5);
        ambientLight.intensity = 0.95;
      }
    } else if (regionIndex === 1) {
      // High Mountains -> approaching clouds (seamless connection to Cloud World)
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(
        THREE.MathUtils.lerp(0.08, 0.22, t),
        THREE.MathUtils.lerp(0.52, 0.65, t),
        THREE.MathUtils.lerp(0.85, 0.98, t)
      );
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.88, 0.96, t),
        THREE.MathUtils.lerp(0.95, 0.98, t),
        THREE.MathUtils.lerp(0.99, 1.0, t)
      );
      uniforms.groundHaze.value.setRGB(
        THREE.MathUtils.lerp(0.88, 0.94, t),
        THREE.MathUtils.lerp(0.94, 0.97, t),
        THREE.MathUtils.lerp(0.98, 1.0, t)
      );
      uniforms.starIntensity.value = 0.0;
      uniforms.spaceDarkness.value = 0.0;

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(
          THREE.MathUtils.lerp(0.85, 0.95, t),
          THREE.MathUtils.lerp(0.92, 0.98, t),
          THREE.MathUtils.lerp(0.99, 1.0, t)
        );
        scene.fog.density = THREE.MathUtils.lerp(0.0035, 0.005, t);
      }
    } else if (regionIndex === 2) {
      // Cloud World -> breakthrough into upper sky
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(
        THREE.MathUtils.lerp(0.22, 0.06, t),
        THREE.MathUtils.lerp(0.65, 0.35, t),
        THREE.MathUtils.lerp(0.98, 0.85, t)
      );
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.96, 0.92, t),
        THREE.MathUtils.lerp(0.98, 0.96, t),
        THREE.MathUtils.lerp(1.0, 1.0, t)
      );
      uniforms.groundHaze.value.setRGB(0.94, 0.97, 1.0);
      uniforms.starIntensity.value = 0.0;
      uniforms.spaceDarkness.value = 0.0;

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(0.95, 0.98, 1.0);
        scene.fog.density = THREE.MathUtils.lerp(0.005, 0.0015, t);
      }
    } else if (regionIndex === 3) {
      // Above the Clouds (Floors 61-80) -> High Atmosphere
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(
        THREE.MathUtils.lerp(0.06, 0.02, t),
        THREE.MathUtils.lerp(0.35, 0.08, t),
        THREE.MathUtils.lerp(0.85, 0.35, t)
      );
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.92, 0.42, t),
        THREE.MathUtils.lerp(0.96, 0.78, t),
        THREE.MathUtils.lerp(1.0, 0.98, t)
      );
      uniforms.groundHaze.value.setRGB(
        THREE.MathUtils.lerp(0.92, 0.15, t),
        THREE.MathUtils.lerp(0.95, 0.28, t),
        THREE.MathUtils.lerp(0.99, 0.55, t)
      );
      uniforms.starIntensity.value = 0.0;
      uniforms.spaceDarkness.value = t * 0.25;

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(0.82, 0.92, 0.99);
        scene.fog.density = THREE.MathUtils.lerp(0.0015, 0.0006, t);
      }
    } else if (regionIndex === 4) {
      // High Atmosphere (Floors 81-100) -> Edge of space
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(
        THREE.MathUtils.lerp(0.015, 0.003, t),
        THREE.MathUtils.lerp(0.06, 0.008, t),
        THREE.MathUtils.lerp(0.25, 0.03, t)
      );
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.42, 0.08, t),
        THREE.MathUtils.lerp(0.78, 0.18, t),
        THREE.MathUtils.lerp(0.98, 0.35, t)
      );
      uniforms.groundHaze.value.setRGB(
        THREE.MathUtils.lerp(0.08, 0.01, t),
        THREE.MathUtils.lerp(0.18, 0.02, t),
        THREE.MathUtils.lerp(0.38, 0.04, t)
      );
      uniforms.starIntensity.value = THREE.MathUtils.lerp(0.25, 0.85, t);
      uniforms.spaceDarkness.value = THREE.MathUtils.lerp(0.35, 0.88, t);

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(0.04, 0.08, 0.20);
        scene.fog.density = THREE.MathUtils.lerp(0.0006, 0.0001, t);
      }
      if (sunLight) {
        sunLight.intensity = 2.4;
      }
      if (ambientLight) {
        ambientLight.intensity = 0.7;
      }
    } else if (regionIndex === 5) {
      // Edge of Space (Floors 101-120) -> Full Space
      // The sky above is dark space void with stars; only the Earth below has the cyan atmospheric rim
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(0.002, 0.003, 0.008);
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.012, 0.003, t),
        THREE.MathUtils.lerp(0.025, 0.006, t),
        THREE.MathUtils.lerp(0.06, 0.015, t)
      );
      uniforms.groundHaze.value.setRGB(0.003, 0.005, 0.012);
      uniforms.starIntensity.value = THREE.MathUtils.lerp(0.85, 1.0, t);
      uniforms.spaceDarkness.value = THREE.MathUtils.lerp(0.88, 1.0, t);

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(0.005, 0.008, 0.015);
        scene.fog.density = 0.00003; // crystal clear cosmic void
      }
      if (sunLight) {
        sunLight.color.setHex(0xffffff);
        sunLight.intensity = 2.5;
      }
      if (ambientLight) {
        ambientLight.color.setHex(0x94a3b8);
        ambientLight.intensity = 0.45;
      }
    } else {
      // Space, Orbital, Moon Approach, Moon Region & Endless Space (Floors 121+)
      uniforms.topColor.value.setRGB(0.003, 0.005, 0.015);
      uniforms.horizonColor.value.setRGB(0.003, 0.005, 0.015);
      uniforms.starIntensity.value = 1.0;
      uniforms.spaceDarkness.value = 1.0;

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.density = 0.00002;
      }
      if (sunLight) {
        sunLight.color.setHex(0xffffff);
        sunLight.intensity = 2.6;
      }
      if (ambientLight) {
        ambientLight.color.setHex(0x64748b);
        ambientLight.intensity = 0.38;
      }
    }
  }
}

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

// Procedural Earth surface texture with blue oceans, landmasses, and swirling clouds
function getEarthTexture(): THREE.CanvasTexture {
  if (earthTexture) return earthTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Ocean base
  ctx.fillStyle = '#09254d';
  ctx.fillRect(0, 0, 512, 256);

  // Continents (stylized curved landmasses)
  ctx.fillStyle = '#1e4828';
  // North America shape
  ctx.beginPath();
  ctx.ellipse(120, 80, 55, 35, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // South America
  ctx.beginPath();
  ctx.ellipse(150, 165, 35, 55, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Eurasia
  ctx.beginPath();
  ctx.ellipse(320, 75, 110, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  // Africa
  ctx.beginPath();
  ctx.ellipse(280, 150, 45, 60, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Australia
  ctx.beginPath();
  ctx.ellipse(420, 185, 35, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swirling white clouds bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.arc(i * 35 + 20, 60 + Math.sin(i) * 25, 22, 0, Math.PI * 2);
    ctx.arc(i * 35 + 20, 130 + Math.cos(i) * 30, 28, 0, Math.PI * 2);
    ctx.arc(i * 35 + 20, 190 + Math.sin(i * 2) * 20, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Night side city lights in amber
  ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    ctx.fillRect(x, y, 1.5, 1.5);
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

export interface RegionState {
  regionIndex: number;
  regionName: string;
  nextRegionName: string;
  transitionProgress: number; // 0.0 to 1.0 (smooth blend)
}

/**
 * Continuous Environment Manager powering the full 10-region vertical journey:
 * - FLOORS 1–20: CITY / GROUND WORLD
 * - FLOORS 21–40: HIGH MOUNTAINS (Reference Images 3 & 4)
 * - FLOORS 41–60: CLOUD WORLD (Reference Image 2)
 * - FLOORS 61–80: ABOVE THE CLOUDS
 * - FLOORS 81–100: HIGH ATMOSPHERE
 * - FLOORS 101–120: EDGE OF SPACE (Reference Image 1)
 * - FLOORS 121–140: SPACE / EARTH BELOW (Reference Image 1)
 * - FLOORS 141–160: ORBITAL REGION (Reference Image 1)
 * - FLOORS 161–180: MOON APPROACH
 * - FLOORS 181–200: MOON REGION
 * - FLOOR 200+: ENDLESS SPACE
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
  private trafficMesh: THREE.InstancedMesh | null = null;
  private trafficData: { x: number; z: number; speed: number; laneY: number }[] = [];
  private beaconLights: THREE.Mesh[] = [];
  private beaconTimer = 0;
  private airplaneGroup: THREE.Group | null = null;
  private airplaneX = -240;
  private satelliteMesh: THREE.Group | null = null;
  private spaceStationGroup: THREE.Group | null = null;
  private earthMesh: THREE.Mesh | null = null;
  private moonMesh: THREE.Mesh | null = null;
  private starsMesh: THREE.Points | null = null;
  private mountainEagles: THREE.Group | null = null;

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
    // Ground tarmac plane
    const groundGeo = new THREE.PlaneGeometry(600, 600, 4, 4);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -6.05;
    ground.receiveShadow = true;
    this.cityGroup.add(ground);

    // Green city park
    const parkGeo = new THREE.PlaneGeometry(45, 450);
    const parkMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85 });
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.rotation.x = -Math.PI / 2;
    park.rotation.z = 0.28;
    park.position.set(28, -6.03, 0);
    this.cityGroup.add(park);

    // River
    const riverGeo = new THREE.PlaneGeometry(42, 500);
    const riverMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, metalness: 0.85 });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.rotation.z = 0.28;
    river.position.set(65, -6.0, 0);
    this.cityGroup.add(river);

    // Bridges
    [-80, 15, 110].forEach((zPos) => {
      const bridgeGroup = new THREE.Group();
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(70, 1.2, 6.5),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 })
      );
      deck.position.set(65, -5.1, zPos);
      deck.rotation.y = -0.28;
      bridgeGroup.add(deck);

      const pylonGeo = new THREE.BoxGeometry(1.6, 20, 1.6);
      const pMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 });
      const p1 = new THREE.Mesh(pylonGeo, pMat);
      p1.position.set(54, 2.5, zPos - 3.2);
      bridgeGroup.add(p1);
      const p2 = new THREE.Mesh(pylonGeo, pMat);
      p2.position.set(76, 2.5, zPos + 3.2);
      bridgeGroup.add(p2);
      this.cityGroup.add(bridgeGroup);
    });

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
    }

    // Traffic Mesh (moving vehicle lights on roads)
    const carCount = 45;
    const carGeo = new THREE.BoxGeometry(0.8, 0.4, 1.4);
    const carMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    this.trafficMesh = new THREE.InstancedMesh(carGeo, carMat, carCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < carCount; i++) {
      const lane = i % 2 === 0 ? 1 : -1;
      const x = -100 + i * 4.5;
      const z = -20 + lane * 18 + (i % 3) * 2;
      const speed = (0.28 + (i % 4) * 0.08) * lane;
      this.trafficData.push({ x, z, speed, laneY: -5.8 });
      dummy.position.set(x, -5.8, z);
      dummy.updateMatrix();
      this.trafficMesh.setMatrixAt(i, dummy.matrix);
    }
    this.trafficMesh.instanceMatrix.needsUpdate = true;
    this.cityGroup.add(this.trafficMesh);
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

    const pillarSpecs = [
      { angle: 0.45, dist: 95, rad: 22, height: 75, snow: true },
      { angle: 1.25, dist: 110, rad: 28, height: 85, snow: true },
      { angle: 2.15, dist: 100, rad: 20, height: 68, snow: false },
      { angle: 2.95, dist: 125, rad: 34, height: 98, snow: true },
      { angle: 3.85, dist: 105, rad: 24, height: 78, snow: true },
      { angle: 4.75, dist: 115, rad: 26, height: 82, snow: true },
      { angle: 5.55, dist: 98, rad: 22, height: 72, snow: false },
    ];

    pillarSpecs.forEach((p, idx) => {
      const peakGroup = new THREE.Group();
      const x = Math.cos(p.angle) * p.dist;
      const z = Math.sin(p.angle) * p.dist;

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
        const waterGeo = new THREE.PlaneGeometry(3.5, 35);
        const waterMat = new THREE.MeshBasicMaterial({
          color: 0xbae6fd,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        });
        const waterfall = new THREE.Mesh(waterGeo, waterMat);
        waterfall.position.set(p.rad * 0.46, 25, 0);
        peakGroup.add(waterfall);
      }

      peakGroup.position.set(x, 0, z);
      this.mountainGroup.add(peakGroup);
    });

    // Mountain suspension footbridge connecting two peaks (Ref 3)
    const bridgeGeo = new THREE.BoxGeometry(26, 0.4, 2.2);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const mBridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    mBridge.position.set(65, 48, -75);
    mBridge.rotation.y = 0.6;
    this.mountainGroup.add(mBridge);

    // Deep valley mist planes floating at Y = 25m to 45m
    for (let m = 0; m < 8; m++) {
      const mistGeo = new THREE.PlaneGeometry(160, 160);
      const mist = new THREE.Mesh(mistGeo, mistMat);
      mist.rotation.x = -Math.PI / 2;
      const mAng = (m / 8) * Math.PI * 2;
      mist.position.set(Math.cos(mAng) * 120, 28 + (m % 3) * 6, Math.sin(mAng) * 120);
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
        -1.2, 0, -0.4,
         0.0, 0,  0.4,
         1.2, 0, -0.4,
      ]);
      eagleWing.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const eAng = (e / 6) * Math.PI * 2;
      eagleWing.position.set(Math.cos(eAng) * 65, 52 + (e % 3) * 6, Math.sin(eAng) * 65);
      this.mountainEagles.add(eagleWing);
    }
    this.mountainGroup.add(this.mountainEagles);
  }

  // ========================================================================
  // 4. REGION 3: CLOUD WORLD (FLOORS 41–60) — Reference Image 2
  // ========================================================================
  private buildCloudWorld() {
    const cloudPuffMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.88,
      flatShading: true,
    });

    // Stylized volumetric clouds clustered into flanking banks
    // Placed at Y = 90m to 140m (Floors 38 to 60)
    for (let c = 0; c < 24; c++) {
      const puffGroup = new THREE.Group();
      const numSpheres = 6;
      for (let s = 0; s < numSpheres; s++) {
        const rad = 7.0 + (s % 4) * 2.5;
        const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(rad, 1), cloudPuffMat);
        sphere.position.set(
          ((s % 3) - 1) * 9,
          (s % 2) * 3.5,
          ((s % 4) - 1.5) * 8
        );
        puffGroup.add(sphere);
      }

      // Arrange around the perimeter so the center gameplay zone stays crystal clear
      const angle = (c / 24) * Math.PI * 2;
      const radius = 55 + (c % 4) * 22;
      const altitude = 92 + (c % 6) * 8;
      puffGroup.position.set(Math.cos(angle) * radius, altitude, Math.sin(angle) * radius);
      this.cloudWorldGroup.add(puffGroup);
    }

    // Floating classical sky pavilion / temple ruin in the clouds (Ref 2)
    const templeGroup = new THREE.Group();
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const blueTileMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.8 });

    // Temple platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(22, 2.5, 16), marbleMat);
    templeGroup.add(platform);

    // Columns
    for (let colX of [-8, 0, 8]) {
      for (let colZ of [-5, 5]) {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 9, 8), marbleMat);
        column.position.set(colX, 5.75, colZ);
        templeGroup.add(column);
      }
    }

    // Temple roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(14, 5, 4), blueTileMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 12.5, 0);
    templeGroup.add(roof);

    // Golden spire
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.8, 6, 6), goldMat);
    spire.position.set(0, 17, 0);
    templeGroup.add(spire);

    // Nestled on a fluffy cloud base
    const templeCloud = new THREE.Mesh(new THREE.DodecahedronGeometry(18, 1), cloudPuffMat);
    templeCloud.position.set(0, -7, 0);
    templeGroup.add(templeCloud);

    templeGroup.position.set(135, 115, -120);
    this.cloudWorldGroup.add(templeGroup);
  }

  // ========================================================================
  // 5. REGION 4: ABOVE THE CLOUDS (FLOORS 61–80)
  // ========================================================================
  private buildAboveCloudSea() {
    // Vast rolling Cloud Ocean deck stretching to horizon at Y = 138m (Floor 60 level)
    const oceanGeo = new THREE.PlaneGeometry(800, 800, 16, 16);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    const cloudSea = new THREE.Mesh(oceanGeo, oceanMat);
    cloudSea.rotation.x = -Math.PI / 2;
    cloudSea.position.y = 138;
    this.aboveCloudSeaGroup.add(cloudSea);

    // Billowy cloud top mounds on the sea surface
    for (let i = 0; i < 35; i++) {
      const moundGeo = new THREE.DodecahedronGeometry(14 + (i % 4) * 5, 1);
      const mound = new THREE.Mesh(moundGeo, oceanMat);
      const ang = (i / 35) * Math.PI * 2;
      const r = 80 + (i % 6) * 35;
      mound.position.set(Math.cos(ang) * r, 138, Math.sin(ang) * r);
      this.aboveCloudSeaGroup.add(mound);
    }

    // Solitary extreme mountain summit piercing the cloud ocean (e.g. Everest tip)
    const everestTip = new THREE.Mesh(
      new THREE.ConeGeometry(24, 38, 7),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, flatShading: true })
    );
    everestTip.position.set(-180, 145, -210);
    this.aboveCloudSeaGroup.add(everestTip);

    const everestSnow = new THREE.Mesh(
      new THREE.ConeGeometry(12, 18, 7),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, flatShading: true })
    );
    everestSnow.position.set(-180, 155, -210);
    this.aboveCloudSeaGroup.add(everestSnow);

    // Distant passenger airplane crossing far in the background (Floors 70–75)
    this.airplaneGroup = new THREE.Group();
    const planeFuselage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    planeFuselage.rotation.z = Math.PI / 2;
    this.airplaneGroup.add(planeFuselage);

    const planeWing = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.2, 14),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    );
    planeWing.position.set(0, 0, 0);
    this.airplaneGroup.add(planeWing);

    // Dual white contrail lines
    const contrailGeo = new THREE.CylinderGeometry(0.2, 0.4, 60, 4);
    const contrailMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
    });
    const c1 = new THREE.Mesh(contrailGeo, contrailMat);
    c1.rotation.z = Math.PI / 2;
    c1.position.set(-32, 0, -2.5);
    this.airplaneGroup.add(c1);

    const c2 = new THREE.Mesh(contrailGeo, contrailMat);
    c2.rotation.z = Math.PI / 2;
    c2.position.set(-32, 0, 2.5);
    this.airplaneGroup.add(c2);

    this.airplaneGroup.position.set(-240, 175, -180);
    this.aboveCloudSeaGroup.add(this.airplaneGroup);
  }

  // ========================================================================
  // 6. REGION 5: HIGH ATMOSPHERE (FLOORS 81–100)
  // ========================================================================
  private buildHighAtmosphere() {
    // Curved Earth horizon glow disc at Y = 175m
    const discGeo = new THREE.RingGeometry(220, 260, 48);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const atmoRing = new THREE.Mesh(discGeo, discMat);
    atmoRing.rotation.x = -Math.PI / 2;
    atmoRing.position.set(0, 175, 0);
    this.highAtmoGroup.add(atmoRing);
  }

  // ========================================================================
  // 7. REGION 6 & 7: EDGE OF SPACE & SPACE (FLOORS 101–140) — Ref Image 1
  // ========================================================================
  private buildSpaceAndEarth() {
    // 7A. 1500+ Star Points in deep space void
    const starCount = 1400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const rad = 500 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 1.6 - 0.6); // mostly upper hemisphere

      starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = rad * Math.cos(phi) + 150; // offset upward
      starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);

      const isBlue = Math.random() > 0.75;
      const isWarm = Math.random() > 0.85;
      starColors[i * 3] = isBlue ? 0.7 : 1.0;
      starColors[i * 3 + 1] = isWarm ? 0.9 : (isBlue ? 0.85 : 1.0);
      starColors[i * 3 + 2] = isWarm ? 0.7 : 1.0;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    this.starsMesh = new THREE.Points(starGeo, starMat);
    this.spaceGroup.add(this.starsMesh);

    // 7B. Stylized Curved Earth Sphere below in space (Ref Image 1)
    const earthGeo = new THREE.SphereGeometry(140, 32, 32);
    const earthTex = getEarthTexture();
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.6,
      metalness: 0.1,
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    // Positioned below-left in the field of view
    this.earthMesh.position.set(-110, 110, -180);
    this.earthMesh.rotation.y = 0.8;
    this.spaceGroup.add(this.earthMesh);

    // Glowing cyan atmospheric limb ring around Earth (Ref 1)
    const limbGeo = new THREE.RingGeometry(139, 146, 48);
    const limbMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const limb = new THREE.Mesh(limbGeo, limbMat);
    limb.position.set(-110, 110, -170);
    limb.lookAt(0, 280, 0);
    this.spaceGroup.add(limb);
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
  // 9. REGION 9 & 10: MOON APPROACH & MOON REGION (FLOORS 161–200+)
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

    // Lunar mountain silhouette crags at bottom of Moon for when player reaches Floor 181–200
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
        410 - (c % 3) * 4,
        Math.sin(cAng) * 50 - 160
      );
      this.moonGroup.add(crag);
    }
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
    // 10A. Calculate Region & Smooth Continuous Transitions
    // Transitions start 5 to 7 floors BEFORE boundary!
    // Floor 1-15: City (Region 0)
    // Floor 16-20: City -> Mountains Transition (ramp 0 to 1)
    // Floor 21-33: Mountains (Region 1)
    // Floor 34-40: Mountains -> Cloud World Transition (ramp 0 to 1)
    // Floor 41-54: Cloud World (Region 2)
    // Floor 55-60: Cloud World -> Above Clouds Transition (ramp 0 to 1)
    // Floor 61-74: Above Clouds (Region 3)
    // Floor 75-80: Above Clouds -> High Atmosphere Transition (ramp 0 to 1)
    // Floor 81-94: High Atmosphere (Region 4)
    // Floor 95-100: High Atmosphere -> Edge of Space Transition (ramp 0 to 1)
    // Floor 101-114: Edge of Space (Region 5)
    // Floor 115-120: Edge of Space -> Space Transition (ramp 0 to 1)
    // Floor 121-134: Space (Region 6)
    // Floor 135-140: Space -> Orbital Transition (ramp 0 to 1)
    // Floor 141-154: Orbital Region (Region 7)
    // Floor 155-160: Orbital -> Moon Approach Transition (ramp 0 to 1)
    // Floor 161-174: Moon Approach (Region 8)
    // Floor 175-180: Moon Approach -> Moon Region Transition (ramp 0 to 1)
    // Floor 181-194: Moon Region (Region 9)
    // Floor 195+: Endless Space (Region 10)

    let regionIndex = 0;
    let transitionProgress = 0;
    let regionName = 'CITY / GROUND';
    let nextRegionName = 'HIGH MOUNTAINS';

    if (floorCount < 16) {
      regionIndex = 0;
      transitionProgress = 0;
      regionName = 'CITY / GROUND';
      nextRegionName = 'HIGH MOUNTAINS';
    } else if (floorCount <= 20) {
      regionIndex = 0;
      transitionProgress = (floorCount - 15) / 5; // Floor 16: 0.2, Floor 20: 1.0
      regionName = 'LEAVING CITY';
      nextRegionName = 'HIGH MOUNTAINS';
    } else if (floorCount < 34) {
      regionIndex = 1;
      transitionProgress = 0;
      regionName = 'HIGH MOUNTAINS';
      nextRegionName = 'CLOUD WORLD';
    } else if (floorCount <= 40) {
      regionIndex = 1;
      transitionProgress = (floorCount - 33) / 7; // Floor 34: 0.14, Floor 40: 1.0
      regionName = 'APPROACHING CLOUDS';
      nextRegionName = 'CLOUD WORLD';
    } else if (floorCount < 55) {
      regionIndex = 2;
      transitionProgress = 0;
      regionName = 'CLOUD WORLD';
      nextRegionName = 'ABOVE THE CLOUDS';
    } else if (floorCount <= 60) {
      regionIndex = 2;
      transitionProgress = (floorCount - 54) / 6;
      regionName = 'BREAKING THROUGH CLOUDS';
      nextRegionName = 'ABOVE THE CLOUDS';
    } else if (floorCount < 75) {
      regionIndex = 3;
      transitionProgress = 0;
      regionName = 'ABOVE THE CLOUDS';
      nextRegionName = 'HIGH ATMOSPHERE';
    } else if (floorCount <= 80) {
      regionIndex = 3;
      transitionProgress = (floorCount - 74) / 6;
      regionName = 'CLIMBING UPPER SKY';
      nextRegionName = 'HIGH ATMOSPHERE';
    } else if (floorCount < 95) {
      regionIndex = 4;
      transitionProgress = 0;
      regionName = 'HIGH ATMOSPHERE';
      nextRegionName = 'EDGE OF SPACE';
    } else if (floorCount <= 100) {
      regionIndex = 4;
      transitionProgress = (floorCount - 94) / 6;
      regionName = 'ATMOSPHERE THINNING';
      nextRegionName = 'EDGE OF SPACE';
    } else if (floorCount < 115) {
      regionIndex = 5;
      transitionProgress = 0;
      regionName = 'EDGE OF SPACE';
      nextRegionName = 'SPACE / EARTH BELOW';
    } else if (floorCount <= 120) {
      regionIndex = 5;
      transitionProgress = (floorCount - 114) / 6;
      regionName = 'ENTERING SPACE';
      nextRegionName = 'SPACE / EARTH BELOW';
    } else if (floorCount < 135) {
      regionIndex = 6;
      transitionProgress = 0;
      regionName = 'SPACE / EARTH BELOW';
      nextRegionName = 'ORBITAL REGION';
    } else if (floorCount <= 140) {
      regionIndex = 6;
      transitionProgress = (floorCount - 134) / 6;
      regionName = 'APPROACHING ORBIT';
      nextRegionName = 'ORBITAL REGION';
    } else if (floorCount < 155) {
      regionIndex = 7;
      transitionProgress = 0;
      regionName = 'ORBITAL REGION';
      nextRegionName = 'MOON APPROACH';
    } else if (floorCount <= 160) {
      regionIndex = 7;
      transitionProgress = (floorCount - 154) / 6;
      regionName = 'LEAVING ORBIT';
      nextRegionName = 'MOON APPROACH';
    } else if (floorCount < 175) {
      regionIndex = 8;
      transitionProgress = 0;
      regionName = 'MOON APPROACH';
      nextRegionName = 'MOON REGION';
    } else if (floorCount <= 180) {
      regionIndex = 8;
      transitionProgress = (floorCount - 174) / 6;
      regionName = 'LUNAR DESCENT';
      nextRegionName = 'MOON REGION';
    } else if (floorCount < 195) {
      regionIndex = 9;
      transitionProgress = 0;
      regionName = 'MOON REGION';
      nextRegionName = 'ENDLESS SPACE';
    } else {
      regionIndex = 10;
      transitionProgress = Math.min(1.0, (floorCount - 194) / 6);
      regionName = 'ENDLESS SPACE';
      nextRegionName = 'DEEP COSMOS';
    }

    this.currentRegion = regionIndex;
    this.transitionT = transitionProgress;

    // 10B. Stream and Cull Scenery based on altitude:
    // "OLD ENVIRONMENT MUST MOVE BELOW"
    // Ground city stays at Y = -6m. When floor > 32, it's far below and culled for performance.
    this.cityGroup.visible = floorCount <= 35;
    // Mountains are visible from Floor 12 (distant view) up to Floor 62 (far below in clouds)
    this.mountainGroup.visible = floorCount >= 10 && floorCount <= 65;
    // Cloud world is visible from Floor 32 up to Floor 72
    this.cloudWorldGroup.visible = floorCount >= 32 && floorCount <= 72;
    // Above cloud ocean is visible from Floor 54 up to Floor 110
    this.aboveCloudSeaGroup.visible = floorCount >= 54 && floorCount <= 110;
    // High atmosphere ring
    this.highAtmoGroup.visible = floorCount >= 74 && floorCount <= 125;
    // Space & Earth globe are visible from Floor 95 onward
    this.spaceGroup.visible = floorCount >= 95;
    // Orbital station is visible from Floor 135 to 175
    this.orbitalGroup.visible = floorCount >= 135 && floorCount <= 175;
    // Moon is visible from Floor 155 onward
    this.moonGroup.visible = floorCount >= 155;

    // 10C. Dynamic Parallax Tracking:
    // Old scenery remains at world altitude; celestial / sky elements follow smoothly
    this.skyGroup.position.y = cameraTargetY * 0.95;

    if (this.spaceGroup.visible && this.earthMesh) {
      // Earth remains below the player as they climb in space
      this.earthMesh.position.y = cameraTargetY - 80;
      this.earthMesh.rotation.y += delta * 0.02;
    }

    if (this.starsMesh) {
      this.starsMesh.position.y = cameraTargetY;
    }

    if (this.moonMesh) {
      // Moon approach scaling:
      // Floor 161: scale 0.25 (small Moon disc)
      // Floor 165: scale 0.45
      // Floor 175: scale 0.8
      // Floor 180+: scale 1.15 (visually dominant)
      const moonProg = Math.max(0, Math.min(1.0, (floorCount - 155) / 25));
      const moonScale = THREE.MathUtils.lerp(0.25, 1.2, moonProg);
      this.moonMesh.scale.set(moonScale, moonScale, moonScale);
      this.moonMesh.position.y = cameraTargetY + 45;
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
    // City Traffic
    if (this.trafficMesh && this.cityGroup.visible) {
      const dummy = new THREE.Object3D();
      this.trafficData.forEach((car, i) => {
        car.x += car.speed * delta * 24;
        if (car.x > 110) car.x = -110;
        if (car.x < -110) car.x = 110;
        dummy.position.set(car.x, car.laneY, car.z);
        dummy.updateMatrix();
        this.trafficMesh!.setMatrixAt(i, dummy.matrix);
      });
      this.trafficMesh.instanceMatrix.needsUpdate = true;
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

    return {
      regionIndex,
      regionName,
      nextRegionName,
      transitionProgress,
    };
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
      // High Mountains -> approaching clouds
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(
        THREE.MathUtils.lerp(0.08, 0.58, t),
        THREE.MathUtils.lerp(0.52, 0.76, t),
        THREE.MathUtils.lerp(0.85, 0.99, t)
      );
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.88, 0.99, t),
        THREE.MathUtils.lerp(0.95, 0.95, t),
        THREE.MathUtils.lerp(0.99, 0.82, t)
      );
      uniforms.starIntensity.value = 0.0;
      uniforms.spaceDarkness.value = 0.0;

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(
          THREE.MathUtils.lerp(0.85, 0.99, t),
          THREE.MathUtils.lerp(0.92, 0.95, t),
          THREE.MathUtils.lerp(0.99, 0.85, t)
        );
        scene.fog.density = THREE.MathUtils.lerp(0.0035, 0.006, t);
      }
    } else if (regionIndex === 2) {
      // Cloud World -> breakthrough
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(
        THREE.MathUtils.lerp(0.58, 0.01, t),
        THREE.MathUtils.lerp(0.76, 0.45, t),
        THREE.MathUtils.lerp(0.99, 0.75, t)
      );
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.99, 0.95, t),
        THREE.MathUtils.lerp(0.95, 0.98, t),
        THREE.MathUtils.lerp(0.82, 1.0, t)
      );
      uniforms.starIntensity.value = 0.0;
      uniforms.spaceDarkness.value = 0.0;

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(0.98, 0.98, 1.0);
        scene.fog.density = THREE.MathUtils.lerp(0.006, 0.002, t);
      }
    } else if (regionIndex === 3) {
      // Above the Clouds -> High Atmosphere
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(
        THREE.MathUtils.lerp(0.01, 0.11, t),
        THREE.MathUtils.lerp(0.45, 0.31, t),
        THREE.MathUtils.lerp(0.75, 0.85, t)
      );
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.95, 0.38, t),
        THREE.MathUtils.lerp(0.98, 0.65, t),
        THREE.MathUtils.lerp(1.0, 0.98, t)
      );
      uniforms.starIntensity.value = 0.0;
      uniforms.spaceDarkness.value = t * 0.25;

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(0.72, 0.88, 0.99);
        scene.fog.density = THREE.MathUtils.lerp(0.002, 0.0008, t);
      }
    } else if (regionIndex === 4) {
      // High Atmosphere -> Edge of space
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(
        THREE.MathUtils.lerp(0.11, 0.03, t),
        THREE.MathUtils.lerp(0.31, 0.07, t),
        THREE.MathUtils.lerp(0.85, 0.25, t)
      );
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.38, 0.22, t),
        THREE.MathUtils.lerp(0.65, 0.74, t),
        THREE.MathUtils.lerp(0.98, 0.97, t)
      );
      uniforms.starIntensity.value = t * 0.45;
      uniforms.spaceDarkness.value = THREE.MathUtils.lerp(0.25, 0.75, t);

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(0.1, 0.18, 0.4);
        scene.fog.density = THREE.MathUtils.lerp(0.0008, 0.0002, t);
      }
      if (sunLight) {
        sunLight.intensity = 2.2;
      }
      if (ambientLight) {
        ambientLight.intensity = 0.75;
      }
    } else if (regionIndex === 5) {
      // Edge of Space -> Full Space
      const t = transitionProgress;
      uniforms.topColor.value.setRGB(
        THREE.MathUtils.lerp(0.03, 0.005, t),
        THREE.MathUtils.lerp(0.07, 0.008, t),
        THREE.MathUtils.lerp(0.25, 0.02, t)
      );
      uniforms.horizonColor.value.setRGB(
        THREE.MathUtils.lerp(0.22, 0.02, t),
        THREE.MathUtils.lerp(0.74, 0.05, t),
        THREE.MathUtils.lerp(0.97, 0.12, t)
      );
      uniforms.starIntensity.value = THREE.MathUtils.lerp(0.45, 1.0, t);
      uniforms.spaceDarkness.value = THREE.MathUtils.lerp(0.75, 1.0, t);

      if (scene && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setRGB(0.01, 0.01, 0.02);
        scene.fog.density = 0.00005; // clear void
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

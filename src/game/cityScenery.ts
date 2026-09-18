import * as THREE from 'three';

// Procedural Architectural Textures for Reusable Building Families
let glassTexture: THREE.CanvasTexture | null = null;
let concreteTexture: THREE.CanvasTexture | null = null;
let brickTexture: THREE.CanvasTexture | null = null;
let stoneTexture: THREE.CanvasTexture | null = null;
let slateTexture: THREE.CanvasTexture | null = null;

function getGlassTexture(): THREE.CanvasTexture {
  if (glassTexture) return glassTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Deep muted architectural blue-slate curtain wall
  ctx.fillStyle = '#1e3247';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle gradient for glass depth
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Window grid with crisp aluminum mullions
  const cols = 8;
  const rows = 12;
  const cellW = 256 / cols;
  const cellH = 256 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      const y = r * cellH;

      // Window pane
      const isLit = (c * 3 + r * 7) % 5 === 0;
      if (isLit) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)'; // Soft warm lit office window
      } else {
        ctx.fillStyle = (c + r) % 2 === 0 ? '#26425e' : '#1e3247';
      }
      ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

      // Mullion outline
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

  // Warm off-white architectural concrete
  ctx.fillStyle = '#ece8e1';
  ctx.fillRect(0, 0, 256, 256);

  // Regular punched residential windows
  const cols = 6;
  const rows = 8;
  const cellW = 256 / cols;
  const cellH = 256 / rows;

  for (let r = 0; r < rows; r++) {
    // Horizontal floor slab seam
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

      // Dark window frame
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 1, y - 1, w + 2, h + 2);

      // Glass pane
      ctx.fillStyle = '#94b4d6';
      ctx.fillRect(x, y, w, h);

      // White sill
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

  // Warm terracotta brick base
  ctx.fillStyle = '#9c4333';
  ctx.fillRect(0, 0, 256, 256);

  // Brick rows
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

      // Off-white decorative lintel & sill
      ctx.fillStyle = '#f1ece1';
      ctx.fillRect(x - 2, y - 3, w + 4, 3);
      ctx.fillRect(x - 3, y + h, w + 6, 3);

      // Dark window frame and glass
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

  // Warm limestone / sandstone
  ctx.fillStyle = '#dfd6c5';
  ctx.fillRect(0, 0, 256, 256);

  // Vertical fluting & spandrel panels
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
      // Recessed bronze spandrel
      ctx.fillStyle = '#6b5742';
      ctx.fillRect(x + cellW * 0.25, y + cellH * 0.75, cellW * 0.5, cellH * 0.2);

      // Glass window
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

  // Dark graphite slate with warm cedar wood accents
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
        // Cedar wood panel
        ctx.fillStyle = '#a16207';
        ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
      } else {
        // Modern horizontal ribbon window
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

export class CityScenery {
  public group: THREE.Group;
  private nearCityGroup: THREE.Group;
  private midCityGroup: THREE.Group;
  private farCityGroup: THREE.Group;
  private skyAndAtmosphereGroup: THREE.Group;
  private clouds: THREE.Group[] = [];
  private trafficMesh: THREE.InstancedMesh | null = null;
  private trafficData: { x: number; z: number; speed: number; laneY: number }[] = [];
  private beaconLights: THREE.Mesh[] = [];
  private beaconTimer = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CityScenery';

    this.nearCityGroup = new THREE.Group();
    this.nearCityGroup.name = 'NearCityGroup';

    this.midCityGroup = new THREE.Group();
    this.midCityGroup.name = 'MidCityGroup';

    this.farCityGroup = new THREE.Group();
    this.farCityGroup.name = 'FarCityGroup';

    this.skyAndAtmosphereGroup = new THREE.Group();
    this.skyAndAtmosphereGroup.name = 'SkyAndAtmosphereGroup';

    this.group.add(this.skyAndAtmosphereGroup);
    this.group.add(this.farCityGroup);
    this.group.add(this.midCityGroup);
    this.group.add(this.nearCityGroup);

    this.createSkyAndAtmosphere();
    this.createGroundAndRiver();
    this.createNearDetailedCity();
    this.createMidgroundCity();
    this.createDistantSkyline();
    this.createDistantMountains();
    this.createClouds();
    this.createTraffic();
  }

  private createSkyAndAtmosphere() {
    const skyGeo = new THREE.SphereGeometry(450, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x38bdf8) }, // Bright azure sky
        horizonColor: { value: new THREE.Color(0xfef08a) }, // Warm sunny golden horizon
        groundHaze: { value: new THREE.Color(0xdbeafe) },
        sunPosition: { value: new THREE.Vector3(120, 90, -180).normalize() },
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
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = dir.y;
          
          vec3 sky = mix(horizonColor, topColor, max(pow(max(h, 0.0), 0.45), 0.0));
          if (h < 0.0) {
            sky = mix(horizonColor, groundHaze, min(pow(-h, 0.5), 1.0));
          }
          
          float sunDot = max(dot(dir, sunPosition), 0.0);
          vec3 sunGlow = vec3(1.0, 0.92, 0.7) * (pow(sunDot, 64.0) * 1.5 + pow(sunDot, 10.0) * 0.4);
          
          gl_FragColor = vec4(sky + sunGlow, 1.0);
        }
      `,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.group.add(skyMesh);
  }

  private createGroundAndRiver() {
    // Ground plane with cool tarmac city base
    const groundGeo = new THREE.PlaneGeometry(600, 600, 8, 8);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -6.05;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Green city park areas along river banks
    const parkMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.85,
      metalness: 0.0,
    });
    const parkGeo = new THREE.PlaneGeometry(45, 450);
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.rotation.x = -Math.PI / 2;
    park.rotation.z = 0.28;
    park.position.set(28, -6.03, 0);
    this.group.add(park);

    // Winding reflective river
    const riverGeo = new THREE.PlaneGeometry(42, 500);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.12,
      metalness: 0.88,
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.rotation.z = 0.28;
    river.position.set(65, -6.0, 0);
    this.group.add(river);

    // Suspension bridges spanning the river
    [-80, 15, 110].forEach((zPos) => {
      const bridgeGroup = new THREE.Group();
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(70, 1.2, 6.5),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 })
      );
      deck.position.set(65, -5.1, zPos);
      deck.rotation.y = -0.28;
      bridgeGroup.add(deck);

      // Bridge pylons
      const pylonGeo = new THREE.BoxGeometry(1.6, 20, 1.6);
      const pMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 });
      const p1 = new THREE.Mesh(pylonGeo, pMat);
      p1.position.set(54, 2.5, zPos - 3.2);
      bridgeGroup.add(p1);

      const p2 = new THREE.Mesh(pylonGeo, pMat);
      p2.position.set(76, 2.5, zPos + 3.2);
      bridgeGroup.add(p2);

      this.group.add(bridgeGroup);
    });
  }

  /**
   * Helper: Builds a detailed building with recognized architectural family,
   * realistic setbacks, window grids, entrance canopies, roof ledges, and rooftop equipment.
   */
  private createArchitecturalBuilding(
    type: 'GLASS' | 'CONCRETE' | 'BRICK' | 'STONE' | 'SLATE' | 'ROUNDED',
    width: number,
    depth: number,
    totalHeight: number
  ): THREE.Group {
    const bGroup = new THREE.Group();

    // Select materials
    let facadeMat: THREE.Material;
    let trimColor = 0x94a3b8;
    let roofColor = 0x475569;

    switch (type) {
      case 'GLASS': {
        const tex = getGlassTexture();
        tex.repeat.set(Math.max(1, Math.round(width / 6)), Math.max(1, Math.round(totalHeight / 8)));
        facadeMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.25,
          metalness: 0.7,
        });
        trimColor = 0x64748b;
        roofColor = 0x334155;
        break;
      }
      case 'CONCRETE': {
        const tex = getConcreteTexture();
        tex.repeat.set(Math.max(1, Math.round(width / 5)), Math.max(1, Math.round(totalHeight / 6)));
        facadeMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.85,
          metalness: 0.1,
        });
        trimColor = 0xcbd5e1;
        roofColor = 0x64748b;
        break;
      }
      case 'BRICK': {
        const tex = getBrickTexture();
        tex.repeat.set(Math.max(1, Math.round(width / 5)), Math.max(1, Math.round(totalHeight / 6)));
        facadeMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.9,
          metalness: 0.05,
        });
        trimColor = 0xf1ece1;
        roofColor = 0x44403c;
        break;
      }
      case 'STONE': {
        const tex = getStoneTexture();
        tex.repeat.set(Math.max(1, Math.round(width / 6)), Math.max(1, Math.round(totalHeight / 7)));
        facadeMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.75,
          metalness: 0.2,
        });
        trimColor = 0xb45309;
        roofColor = 0x78716c;
        break;
      }
      case 'SLATE':
      case 'ROUNDED':
      default: {
        const tex = getSlateTexture();
        tex.repeat.set(Math.max(1, Math.round(width / 5)), Math.max(1, Math.round(totalHeight / 7)));
        facadeMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.6,
          metalness: 0.3,
        });
        trimColor = 0xd97706;
        roofColor = 0x1e293b;
        break;
      }
    }

    const trimMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.5 });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.8 });

    // 1. Ground Entrance Podium (5m tall)
    const podiumH = 5.0;
    const podiumGeo = new THREE.BoxGeometry(width + 0.8, podiumH, depth + 0.8);
    const podium = new THREE.Mesh(podiumGeo, trimMat);
    podium.position.y = podiumH / 2;
    podium.castShadow = true;
    podium.receiveShadow = true;
    bGroup.add(podium);

    // Entrance Canopy
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.45, 0.4, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 })
    );
    canopy.position.set(0, 3.8, depth / 2 + 1.2);
    bGroup.add(canopy);

    // 2. Main Shaft
    const hasSetback = totalHeight > 32;
    const shaftH = hasSetback ? totalHeight * 0.65 : totalHeight - podiumH;
    const shaftGeo = new THREE.BoxGeometry(width, shaftH, depth);
    const shaft = new THREE.Mesh(shaftGeo, facadeMat);
    shaft.position.y = podiumH + shaftH / 2;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    bGroup.add(shaft);

    let curTopY = podiumH + shaftH;

    // 3. Setback Upper Tier (if tall building)
    if (hasSetback) {
      // Setback terrace ledge
      const ledgeH = 0.5;
      const ledge = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.4, ledgeH, depth + 0.4),
        trimMat
      );
      ledge.position.y = curTopY + ledgeH / 2;
      bGroup.add(ledge);
      curTopY += ledgeH;

      const upperH = totalHeight - curTopY;
      const upperW = width * 0.76;
      const upperD = depth * 0.76;
      const upperGeo = new THREE.BoxGeometry(upperW, upperH, upperD);
      const upper = new THREE.Mesh(upperGeo, facadeMat);
      upper.position.y = curTopY + upperH / 2;
      upper.castShadow = true;
      upper.receiveShadow = true;
      bGroup.add(upper);

      curTopY += upperH;
    }

    // 4. Roof Parapet Ledge
    const parapetW = hasSetback ? width * 0.78 : width + 0.2;
    const parapetD = hasSetback ? depth * 0.78 : depth + 0.2;
    const parapet = new THREE.Mesh(
      new THREE.BoxGeometry(parapetW, 0.6, parapetD),
      trimMat
    );
    parapet.position.y = curTopY + 0.3;
    bGroup.add(parapet);
    curTopY += 0.6;

    // 5. Rooftop Equipment / Penthouse
    const pentW = parapetW * 0.5;
    const pentD = parapetD * 0.5;
    const pentH = 2.8;
    const penthouse = new THREE.Mesh(
      new THREE.BoxGeometry(pentW, pentH, pentD),
      roofMat
    );
    penthouse.position.y = curTopY + pentH / 2;
    penthouse.castShadow = true;
    bGroup.add(penthouse);

    // Rooftop AC chiller units
    const acUnit = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 })
    );
    acUnit.position.set(pentW * 0.4, curTopY + 0.6, -pentD * 0.4);
    bGroup.add(acUnit);

    // Rooftop Communications Mast with blinking red beacon light
    if (totalHeight > 35) {
      const mastH = 7.0;
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.2, mastH, 6),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 })
      );
      mast.position.set(0, curTopY + pentH + mastH / 2, 0);
      bGroup.add(mast);

      // Red aircraft warning beacon
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

  /**
   * LAYER 1: NEAR DETAILED CITY (Radius 52 to 85m)
   * Hand-composed, architectural signature buildings framing the view
   * at safe distances, never occluding the tower or camera.
   */
  private createNearDetailedCity() {
    const nearBuildings: {
      type: 'GLASS' | 'CONCRETE' | 'BRICK' | 'STONE' | 'SLATE';
      angle: number;
      radius: number;
      w: number;
      d: number;
      h: number;
      rot: number;
    }[] = [
      // East flank (river side)
      { type: 'GLASS', angle: 0.35, radius: 76, w: 12, d: 11, h: 36, rot: 0.2 },
      { type: 'CONCRETE', angle: 0.75, radius: 88, w: 13, d: 10, h: 28, rot: 0.4 },
      // South-East flank (well clear of camera line of sight)
      { type: 'BRICK', angle: 1.55, radius: 84, w: 10, d: 11, h: 26, rot: -0.2 },
      { type: 'STONE', angle: 1.95, radius: 78, w: 11, d: 11, h: 32, rot: 0.1 },
      // South-West flank
      { type: 'SLATE', angle: 2.35, radius: 92, w: 11, d: 10, h: 34, rot: 0.3 },
      { type: 'GLASS', angle: 2.75, radius: 80, w: 12, d: 11, h: 38, rot: -0.15 },
      // West flank
      { type: 'CONCRETE', angle: 3.15, radius: 86, w: 13, d: 10, h: 26, rot: 0.5 },
      { type: 'BRICK', angle: 3.55, radius: 78, w: 10, d: 11, h: 30, rot: 0.2 },
      // North-West flank
      { type: 'STONE', angle: 3.95, radius: 94, w: 12, d: 12, h: 36, rot: -0.3 },
      { type: 'GLASS', angle: 4.45, radius: 82, w: 11, d: 11, h: 42, rot: 0.1 },
      // North flank
      { type: 'SLATE', angle: 4.95, radius: 80, w: 10, d: 10, h: 28, rot: 0.4 },
      { type: 'CONCRETE', angle: 5.45, radius: 90, w: 13, d: 11, h: 34, rot: -0.25 },
      // North-East flank
      { type: 'BRICK', angle: 5.95, radius: 84, w: 11, d: 10, h: 32, rot: 0.15 },
    ];

    nearBuildings.forEach((spec) => {
      const bldg = this.createArchitecturalBuilding(spec.type, spec.w, spec.d, spec.h);
      const x = Math.cos(spec.angle) * spec.radius;
      const z = Math.sin(spec.angle) * spec.radius;
      bldg.position.set(x, -6.0, z);
      bldg.rotation.y = spec.rot;
      this.nearCityGroup.add(bldg);
    });
  }

  /**
   * LAYER 2: MIDGROUND CITY (Radius 90 to 175m)
   * 45 stylized buildings with varied stepped silhouettes, architectural textures,
   * creating rich urban depth without visual noise or giant raw boxes.
   */
  private createMidgroundCity() {
    const count = 48;
    const types: ('GLASS' | 'CONCRETE' | 'BRICK' | 'STONE' | 'SLATE')[] = [
      'GLASS',
      'CONCRETE',
      'BRICK',
      'STONE',
      'SLATE',
    ];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.08;
      const radius = 92 + (i % 5) * 16 + Math.random() * 8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const type = types[i % types.length];
      const isHighrise = (i % 3) === 0;
      const height = isHighrise ? 55 + (i % 7) * 9 : 28 + (i % 5) * 7;
      const width = 9 + (i % 4) * 2.5;
      const depth = 9 + ((i + 1) % 4) * 2.5;

      const bldg = this.createArchitecturalBuilding(type, width, depth, height);
      bldg.position.set(x, -6.0, z);
      bldg.rotation.y = (Math.PI / 4) * (i % 4);
      this.midCityGroup.add(bldg);
    }
  }

  /**
   * LAYER 3: DISTANT SKYLINE & HAZE (Radius 180 to 300m)
   * Soft, atmospheric silhouettes with varying heights, spires, and supertall needles.
   */
  private createDistantSkyline() {
    const count = 80;
    const bGeo = new THREE.BoxGeometry(1, 1, 1);
    const bMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd, // Soft atmospheric blue
      roughness: 0.5,
      metalness: 0.2,
    });

    const instMesh = new THREE.InstancedMesh(bGeo, bMat, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 185 + (i % 7) * 16;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const height = 45 + (i % 11) * 8 + (i % 4 === 0 ? 35 : 0);
      const width = 11 + (i % 5) * 2;
      const depth = 11 + (i % 5) * 2;

      dummy.position.set(x, -6.0 + height / 2, z);
      dummy.scale.set(width, height, depth);
      dummy.rotation.y = ((i % 6) * Math.PI) / 3;
      dummy.updateMatrix();

      instMesh.setMatrixAt(i, dummy.matrix);
    }

    instMesh.instanceMatrix.needsUpdate = true;
    this.farCityGroup.add(instMesh);

    // Iconic Supertall Spire in the distance
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 4.8, 140, 8),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.9,
      })
    );
    spire.position.set(-110, 60, -180);
    this.farCityGroup.add(spire);
  }

  private createDistantMountains() {
    const mCount = 14;
    const mMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.95,
      metalness: 0.05,
    });

    for (let i = 0; i < mCount; i++) {
      const angle = (i / mCount) * Math.PI * 1.6 - 0.9;
      const dist = 270 + (i % 4) * 12;
      const mHeight = 55 + (i % 5) * 14;
      const mRadius = 45 + (i % 4) * 12;

      const coneGeo = new THREE.ConeGeometry(mRadius, mHeight, 7);
      const mountain = new THREE.Mesh(coneGeo, mMat);
      mountain.position.set(Math.cos(angle) * dist, -6 + mHeight / 2 - 10, Math.sin(angle) * dist);
      this.farCityGroup.add(mountain);
    }
  }

  private createClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
    });

    for (let c = 0; c < 18; c++) {
      const cloudPuff = new THREE.Group();
      const puffCount = 5;

      for (let p = 0; p < puffCount; p++) {
        const rad = 4.5 + (p % 3) * 1.5;
        const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(rad, 1), cloudMat);
        sphere.position.set(
          ((p % 3) - 1) * 6.5,
          (p % 2) * 2.0,
          ((p % 4) - 1.5) * 5.5
        );
        cloudPuff.add(sphere);
      }

      const angle = (c / 18) * Math.PI * 2;
      const dist = 50 + (c % 5) * 25;
      const altitude = 22 + (c % 6) * 14;

      cloudPuff.position.set(Math.cos(angle) * dist, altitude, Math.sin(angle) * dist);
      this.group.add(cloudPuff);
      this.clouds.push(cloudPuff);
    }
  }

  private createTraffic() {
    const count = 50;
    const carGeo = new THREE.BoxGeometry(0.8, 0.4, 1.4);
    const carMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    this.trafficMesh = new THREE.InstancedMesh(carGeo, carMat, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const lane = i % 2 === 0 ? 1 : -1;
      const x = -100 + i * 4;
      const z = -20 + lane * 18 + (i % 3) * 2;
      const speed = (0.28 + (i % 4) * 0.08) * lane;

      this.trafficData.push({ x, z, speed, laneY: -5.8 });
      dummy.position.set(x, -5.8, z);
      dummy.updateMatrix();
      this.trafficMesh.setMatrixAt(i, dummy.matrix);
    }

    this.trafficMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.trafficMesh);
  }

  public update(delta: number, cameraTargetY?: number) {
    // Drift clouds smoothly
    this.clouds.forEach((cloud, idx) => {
      cloud.position.x += delta * (1.1 + (idx % 3) * 0.4);
      if (cloud.position.x > 240) {
        cloud.position.x = -240;
      }
    });

    // Move traffic lights along road
    if (this.trafficMesh) {
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

    // Blink beacon lights on tower rooftops
    this.beaconTimer += delta;
    const beaconState = Math.sin(this.beaconTimer * 4.5) > 0.1;
    this.beaconLights.forEach((beacon) => {
      beacon.visible = beaconState;
    });

    // Subtle, calming parallax offset as tower rises
    // Ground stays rooted, mid and far layers follow with gentle fractional parallax
    if (cameraTargetY !== undefined) {
      const clampedHeight = Math.max(0, cameraTargetY);
      this.farCityGroup.position.y = clampedHeight * 0.08;
      this.skyAndAtmosphereGroup.position.y = clampedHeight * 0.15;
    }
  }
}

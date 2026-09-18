import * as THREE from 'three';
import { FloorDimensions, FloorModuleStyle } from '../types';
import { GAME_CONFIG } from './constants';

// Shared materials cache for high performance
const materialCache: Record<string, THREE.Material> = {};

function getMaterial(key: string, creator: () => THREE.Material): THREE.Material {
  if (!materialCache[key]) {
    materialCache[key] = creator();
  }
  return materialCache[key];
}

// Procedural textures for rich architectural surfaces
function createBrickCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#b44a32';
  ctx.fillRect(0, 0, 256, 256);
  
  const rowH = 16;
  const colW = 32;
  for (let y = 0; y < 256; y += rowH) {
    const offset = (y / rowH) % 2 === 0 ? 0 : colW / 2;
    for (let x = -colW; x < 256 + colW; x += colW) {
      ctx.fillStyle = Math.random() > 0.5 ? '#c2553b' : '#9c3d26';
      ctx.fillRect(x + offset + 1, y + 1, colW - 2, rowH - 2);
    }
  }
  ctx.strokeStyle = '#e2d9cd';
  ctx.lineWidth = 1.5;
  for (let y = 0; y <= 256; y += rowH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  return canvas;
}

function createConcreteCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#c7c2b8';
  ctx.fillRect(0, 0, 256, 256);
  
  // Subtle grain and formwork panel seams
  const idata = ctx.getImageData(0, 0, 256, 256);
  const d = idata.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() - 0.5) * 18;
    d[i] = Math.min(255, Math.max(0, d[i] + v));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + v));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + v));
  }
  ctx.putImageData(idata, 0, 0);

  // Formwork tie holes & seam lines
  ctx.strokeStyle = '#a8a398';
  ctx.lineWidth = 1.0;
  ctx.strokeRect(0, 0, 256, 128);
  ctx.strokeRect(0, 128, 256, 128);
  return canvas;
}

function createWoodCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#b8773e';
  ctx.fillRect(0, 0, 256, 256);
  
  const slatH = 16;
  for (let y = 0; y < 256; y += slatH) {
    ctx.fillStyle = (y / slatH) % 2 === 0 ? '#c78447' : '#aa6d36';
    ctx.fillRect(0, y, 256, slatH - 2);
    ctx.fillStyle = '#5c3817';
    ctx.fillRect(0, y + slatH - 2, 256, 2);
  }
  return canvas;
}

function createAcGrillCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 128, 128);

  // Fan circular grill
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(64, 64, 42, 0, Math.PI * 2);
  ctx.stroke();

  // Fan blades
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(64, 64, 12, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(64, 64);
    ctx.rotate((i * Math.PI) / 2);
    ctx.fillRect(-4, -40, 8, 30);
    ctx.restore();
  }
  return canvas;
}

export function getArchMaterials() {
  const brickTex = new THREE.CanvasTexture(createBrickCanvas());
  brickTex.wrapS = THREE.RepeatWrapping;
  brickTex.wrapT = THREE.RepeatWrapping;
  brickTex.repeat.set(3, 1.5);

  const concreteTex = new THREE.CanvasTexture(createConcreteCanvas());
  concreteTex.wrapS = THREE.RepeatWrapping;
  concreteTex.wrapT = THREE.RepeatWrapping;
  concreteTex.repeat.set(2, 2);

  const woodTex = new THREE.CanvasTexture(createWoodCanvas());
  woodTex.wrapS = THREE.RepeatWrapping;
  woodTex.wrapT = THREE.RepeatWrapping;
  woodTex.repeat.set(2, 2);

  const acTex = new THREE.CanvasTexture(createAcGrillCanvas());

  return {
    concreteLight: getMaterial('concLight', () => new THREE.MeshStandardMaterial({
      color: 0xe2ded4,
      map: concreteTex,
      roughness: 0.75,
      metalness: 0.05,
    })),
    concreteWarm: getMaterial('concWarm', () => new THREE.MeshStandardMaterial({
      color: 0xd4cabb,
      map: concreteTex,
      roughness: 0.7,
      metalness: 0.05,
    })),
    concreteDark: getMaterial('concDark', () => new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.65,
      metalness: 0.1,
    })),
    redBrick: getMaterial('brick', () => new THREE.MeshStandardMaterial({
      map: brickTex,
      roughness: 0.75,
      metalness: 0.05,
    })),
    woodPlanks: getMaterial('wood', () => new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.6,
      metalness: 0.05,
    })),
    glassReflective: getMaterial('glassRefl', () => new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    })),
    glassWarmLit: getMaterial('glassWarm', () => new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.65,
      roughness: 0.15,
      metalness: 0.2,
    })),
    glassSunset: getMaterial('glassSunset', () => new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.3,
    })),
    blackMetal: getMaterial('blackMetal', () => new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.85,
    })),
    bronzeMetal: getMaterial('bronzeMetal', () => new THREE.MeshStandardMaterial({
      color: 0x785c42,
      roughness: 0.4,
      metalness: 0.75,
    })),
    whitePlaster: getMaterial('whitePlaster', () => new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.6,
      metalness: 0.02,
    })),
    foliageGreen: getMaterial('foliage', () => new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.85,
      metalness: 0.0,
    })),
    terracottaPot: getMaterial('pot', () => new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.8,
      metalness: 0.05,
    })),
    acUnitMat: getMaterial('acUnit', () => new THREE.MeshStandardMaterial({
      map: acTex,
      roughness: 0.5,
      metalness: 0.4,
    })),
  };
}

export const ALL_STYLES: FloorModuleStyle[] = [
  'GLASS_MODERN',
  'BRUTALIST_CONCRETE',
  'RED_BRICK',
  'BALCONY_GARDEN',
  'WOOD_CLAD',
  'INDUSTRIAL_LOFT',
  'TERRACE_PERGOLA',
  'ART_DECO',
  'CANTILEVER_BAY',
  'AERODYNAMIC_METALLIC',
  'CORNER_BALCONY',
  'DUPLEX_PLANTERS',
];

// Architectural helper to create an outdoor AC compressor unit
function createAcUnit(mats: ReturnType<typeof getArchMaterials>): THREE.Group {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.48, 0.32), mats.acUnitMat);
  box.castShadow = true;
  g.add(box);

  // Mounting brackets
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.06), mats.blackMetal);
  bracket.position.set(0, -0.26, -0.12);
  g.add(bracket);
  return g;
}

// Architectural helper to create a planter with foliage on a balcony ledge
function createPlanter(mats: ReturnType<typeof getArchMaterials>, width: number): THREE.Group {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(width, 0.28, 0.35), mats.terracottaPot);
  box.castShadow = true;
  g.add(box);

  const plantCount = Math.max(1, Math.floor(width / 0.45));
  for (let i = 0; i < plantCount; i++) {
    const px = -width / 2 + (i + 0.5) * (width / plantCount);
    const shrub = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.24 + Math.random() * 0.08, 1),
      mats.foliageGreen
    );
    shrub.position.set(px, 0.22, (Math.random() - 0.5) * 0.08);
    shrub.castShadow = true;
    g.add(shrub);
  }
  return g;
}

/**
 * Creates an attractive stylized 3D architectural apartment floor module.
 */
export function createFloorModule(
  style: FloorModuleStyle,
  floorIndex: number
): { group: THREE.Group; dimensions: FloorDimensions } {
  const mats = getArchMaterials();
  const group = new THREE.Group();
  group.name = `Floor_${floorIndex}_${style}`;

  // Parametric slight variation for visual diversity
  const widthVariance = ((floorIndex * 19) % 5 - 2) * 0.06;
  const depthVariance = ((floorIndex * 29) % 5 - 2) * 0.06;
  const heightVariance = ((floorIndex * 13) % 3 - 1) * 0.04;

  const w = GAME_CONFIG.BASE_WIDTH + widthVariance;
  const d = GAME_CONFIG.BASE_DEPTH + depthVariance;
  const h = GAME_CONFIG.BASE_HEIGHT + heightVariance;

  const dimensions: FloorDimensions = { width: w, depth: d, height: h };

  const setupMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  // 1. BEVELED CONCRETE CEILING & FLOOR SLABS (Distinct architectural edges)
  const slabH = 0.18;
  const slabOverhang = 0.08;
  const slabGeo = new THREE.BoxGeometry(w + slabOverhang, slabH, d + slabOverhang);

  const bottomSlab = new THREE.Mesh(slabGeo, mats.concreteLight);
  bottomSlab.position.y = -h / 2 + slabH / 2;
  setupMesh(bottomSlab);
  group.add(bottomSlab);

  const topSlab = new THREE.Mesh(slabGeo, mats.concreteLight);
  topSlab.position.y = h / 2 - slabH / 2;
  setupMesh(topSlab);
  group.add(topSlab);

  // Interior core with warm room illumination
  const wallH = h - slabH * 2;
  const coreW = w - 0.15;
  const coreD = d - 0.15;
  const coreGeo = new THREE.BoxGeometry(coreW, wallH, coreD);
  const interiorCore = new THREE.Mesh(coreGeo, mats.concreteWarm);
  setupMesh(interiorCore);
  group.add(interiorCore);

  // Pick window glow style (alternating warm glowing living rooms & reflective glass)
  const isLit = floorIndex % 2 === 0 || floorIndex % 3 === 0;
  const primaryGlassMat = isLit ? mats.glassWarmLit : mats.glassReflective;
  const secondaryGlassMat = isLit ? mats.glassSunset : mats.glassReflective;

  // 2. STYLE-SPECIFIC ARCHITECTURAL FACADES
  switch (style) {
    case 'GLASS_MODERN': {
      // Floor A: Modern concrete columns + floor-to-ceiling glass panoramic windows
      const glassGeo = new THREE.BoxGeometry(w + 0.04, wallH, d + 0.04);
      const glassMesh = new THREE.Mesh(glassGeo, primaryGlassMat);
      setupMesh(glassMesh);
      group.add(glassMesh);

      // Black metal structural mullions & corner pillars
      const pillarGeo = new THREE.BoxGeometry(0.24, wallH, 0.24);
      [
        [-w / 2, -d / 2],
        [w / 2, -d / 2],
        [w / 2, d / 2],
        [-w / 2, d / 2],
      ].forEach(([px, pz]) => {
        const pillar = new THREE.Mesh(pillarGeo, mats.blackMetal);
        pillar.position.set(px, 0, pz);
        setupMesh(pillar);
        group.add(pillar);
      });

      // Window mullion bars
      [-w / 4, w / 4].forEach((mx) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, wallH, 0.06), mats.blackMetal);
        bar.position.set(mx, 0, d / 2 + 0.03);
        setupMesh(bar);
        group.add(bar);
      });

      // Wall-mounted AC unit
      const ac = createAcUnit(mats);
      ac.position.set(w / 2 + 0.05, 0.1, -d / 4);
      ac.rotation.y = Math.PI / 2;
      group.add(ac);
      break;
    }

    case 'RED_BRICK': {
      // Floor B: Classic Red Brick facade with recessed white-trim sash windows
      const brickWallGeo = new THREE.BoxGeometry(w + 0.02, wallH, d + 0.02);
      const brickWall = new THREE.Mesh(brickWallGeo, mats.redBrick);
      setupMesh(brickWall);
      group.add(brickWall);

      // Recessed glass windows with white stone lintels & sills
      const winW = 0.85;
      const winH = 1.25;
      const winGeo = new THREE.BoxGeometry(winW, winH, 0.08);
      const sillGeo = new THREE.BoxGeometry(winW + 0.15, 0.08, 0.14);

      [-w / 3, 0, w / 3].forEach((wx) => {
        // Front window
        const win = new THREE.Mesh(winGeo, primaryGlassMat);
        win.position.set(wx, 0.05, d / 2 + 0.02);
        setupMesh(win);
        group.add(win);

        const sill = new THREE.Mesh(sillGeo, mats.whitePlaster);
        sill.position.set(wx, -winH / 2 + 0.01, d / 2 + 0.06);
        setupMesh(sill);
        group.add(sill);

        const lintel = new THREE.Mesh(sillGeo, mats.whitePlaster);
        lintel.position.set(wx, winH / 2 + 0.09, d / 2 + 0.06);
        setupMesh(lintel);
        group.add(lintel);
      });

      // Side window
      const sideWin = new THREE.Mesh(winGeo, secondaryGlassMat);
      sideWin.rotation.y = Math.PI / 2;
      sideWin.position.set(w / 2 + 0.02, 0.05, 0);
      setupMesh(sideWin);
      group.add(sideWin);
      break;
    }

    case 'BRUTALIST_CONCRETE': {
      // Floor C: Architectural exposed concrete with deep recessed windows & sunshade louvers
      const concWall = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, wallH, d + 0.02), mats.concreteLight);
      setupMesh(concWall);
      group.add(concWall);

      // Wide ribbon window
      const ribbonGeo = new THREE.BoxGeometry(w * 0.75, 0.9, 0.08);
      const ribbon = new THREE.Mesh(ribbonGeo, primaryGlassMat);
      ribbon.position.set(0, 0.1, d / 2 + 0.02);
      setupMesh(ribbon);
      group.add(ribbon);

      // Concrete sunshade overhang
      const finGeo = new THREE.BoxGeometry(w * 0.8, 0.1, 0.35);
      const fin = new THREE.Mesh(finGeo, mats.concreteWarm);
      fin.position.set(0, 0.65, d / 2 + 0.18);
      setupMesh(fin);
      group.add(fin);

      // AC unit on side
      const ac = createAcUnit(mats);
      ac.position.set(-w / 2 - 0.05, 0, 0);
      ac.rotation.y = -Math.PI / 2;
      group.add(ac);
      break;
    }

    case 'WOOD_CLAD': {
      // Floor D: Architectural warm teak wood siding panels combined with black metal frames
      const woodWall = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, wallH, d + 0.02), mats.woodPlanks);
      setupMesh(woodWall);
      group.add(woodWall);

      // Large corner window bay
      const bayW = w * 0.55;
      const bayGeo = new THREE.BoxGeometry(bayW, wallH * 0.8, 0.08);
      const bayWin = new THREE.Mesh(bayGeo, primaryGlassMat);
      bayWin.position.set(w / 4, 0, d / 2 + 0.02);
      setupMesh(bayWin);
      group.add(bayWin);

      // Black architectural frame around window
      const frameGeo = new THREE.BoxGeometry(bayW + 0.1, wallH * 0.85, 0.12);
      const frame = new THREE.Mesh(frameGeo, mats.blackMetal);
      frame.position.set(w / 4, 0, d / 2 + 0.01);
      setupMesh(frame);
      group.add(frame);

      // Planter under window
      const planter = createPlanter(mats, bayW * 0.9);
      planter.position.set(w / 4, -wallH / 2 + 0.2, d / 2 + 0.22);
      group.add(planter);
      break;
    }

    case 'CORNER_BALCONY': {
      // Floor E: Wrap-around corner balcony with black metal railing and potted plants (like reference image!)
      const balconyW = w * 0.48;
      const balconyD = d * 0.48;

      // Recessed apartment corner
      const innerWall = new THREE.Mesh(
        new THREE.BoxGeometry(w - balconyW, wallH, d - balconyD),
        mats.concreteWarm
      );
      innerWall.position.set(-balconyW / 2, 0, -balconyD / 2);
      setupMesh(innerWall);
      group.add(innerWall);

      // Sliding glass balcony door
      const glassDoor = new THREE.Mesh(
        new THREE.BoxGeometry(balconyW + 0.2, wallH * 0.88, 0.08),
        primaryGlassMat
      );
      glassDoor.position.set(balconyW / 2, 0, d / 2 - balconyD);
      setupMesh(glassDoor);
      group.add(glassDoor);

      // Balcony slab
      const bFloorGeo = new THREE.BoxGeometry(balconyW + 0.1, 0.12, balconyD + 0.1);
      const bFloor = new THREE.Mesh(bFloorGeo, mats.concreteLight);
      bFloor.position.set(w / 2 - balconyW / 2, -h / 2 + 0.15, d / 2 - balconyD / 2);
      setupMesh(bFloor);
      group.add(bFloor);

      // Balcony metal railings
      const railH = 0.65;
      const railGeoFront = new THREE.BoxGeometry(balconyW + 0.1, railH, 0.04);
      const railFront = new THREE.Mesh(railGeoFront, mats.blackMetal);
      railFront.position.set(w / 2 - balconyW / 2, -h / 2 + 0.15 + railH / 2, d / 2 + 0.04);
      setupMesh(railFront);
      group.add(railFront);

      const railGeoSide = new THREE.BoxGeometry(0.04, railH, balconyD + 0.1);
      const railSide = new THREE.Mesh(railGeoSide, mats.blackMetal);
      railSide.position.set(w / 2 + 0.04, -h / 2 + 0.15 + railH / 2, d / 2 - balconyD / 2);
      setupMesh(railSide);
      group.add(railSide);

      // Potted plants on the corner balcony (just like in the reference image!)
      const planter = createPlanter(mats, 0.8);
      planter.position.set(w / 2 - 0.55, -h / 2 + 0.35, d / 2 - 0.3);
      group.add(planter);

      // AC unit on back wall
      const ac = createAcUnit(mats);
      ac.position.set(-w / 4, 0.2, -d / 2 - 0.05);
      group.add(ac);
      break;
    }

    case 'BALCONY_GARDEN': {
      // Floor F: Front protruding cantilever terrace with lush balcony garden
      const terraceD = 0.6;
      const tSlab = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.14, terraceD), mats.concreteLight);
      tSlab.position.set(0, -h / 2 + 0.18, d / 2 + terraceD / 2);
      setupMesh(tSlab);
      group.add(tSlab);

      // Glass balustrade railing
      const railMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.85, 0.6, 0.05),
        mats.glassReflective
      );
      railMesh.position.set(0, -h / 2 + 0.5, d / 2 + terraceD);
      setupMesh(railMesh);
      group.add(railMesh);

      // Floor-to-ceiling glass sliding doors behind terrace
      const doors = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.85, wallH, 0.08),
        primaryGlassMat
      );
      doors.position.set(0, 0, d / 2 + 0.02);
      setupMesh(doors);
      group.add(doors);

      // Planter boxes along terrace edge
      const p1 = createPlanter(mats, 1.2);
      p1.position.set(-w * 0.22, -h / 2 + 0.4, d / 2 + terraceD - 0.2);
      group.add(p1);

      const p2 = createPlanter(mats, 1.2);
      p2.position.set(w * 0.22, -h / 2 + 0.4, d / 2 + terraceD - 0.2);
      group.add(p2);
      break;
    }

    case 'INDUSTRIAL_LOFT': {
      // Floor G: Charcoal steel facade with bronze window frames and multi-pane industrial grids
      const steelWall = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, wallH, d + 0.02), mats.concreteDark);
      setupMesh(steelWall);
      group.add(steelWall);

      // Industrial multi-pane window
      const winGeo = new THREE.BoxGeometry(w * 0.82, wallH * 0.78, 0.08);
      const win = new THREE.Mesh(winGeo, primaryGlassMat);
      win.position.set(0, 0, d / 2 + 0.02);
      setupMesh(win);
      group.add(win);

      // Bronze multi-pane grid
      const bronzeFrame = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.84, wallH * 0.8, 0.1),
        mats.bronzeMetal
      );
      bronzeFrame.position.set(0, 0, d / 2 + 0.01);
      setupMesh(bronzeFrame);
      group.add(bronzeFrame);

      // AC unit on side
      const ac = createAcUnit(mats);
      ac.position.set(w / 2 + 0.05, 0.1, 0);
      ac.rotation.y = Math.PI / 2;
      group.add(ac);
      break;
    }

    case 'TERRACE_PERGOLA': {
      // Floor H: Contemporary white facade with minimalist recessed window strips
      const whiteWall = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, wallH, d + 0.02), mats.whitePlaster);
      setupMesh(whiteWall);
      group.add(whiteWall);

      // Thin elegant horizontal ribbon windows
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.7, 0.08), primaryGlassMat);
      ribbon.position.set(0, 0.15, d / 2 + 0.02);
      setupMesh(ribbon);
      group.add(ribbon);

      // Vertical black metal architectural fins
      [-w / 3, -w / 6, 0, w / 6, w / 3].forEach((fx) => {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, wallH, 0.18), mats.blackMetal);
        fin.position.set(fx, 0, d / 2 + 0.08);
        setupMesh(fin);
        group.add(fin);
      });

      // Side planter
      const planter = createPlanter(mats, 1.4);
      planter.position.set(-w / 2 - 0.2, -h / 2 + 0.35, 0);
      planter.rotation.y = Math.PI / 2;
      group.add(planter);
      break;
    }

    case 'ART_DECO': {
      // Floor I: Older apartment architecture with pilasters, masonry trims, and classic windows
      const masonry = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, wallH, d + 0.02), mats.concreteWarm);
      setupMesh(masonry);
      group.add(masonry);

      // Classic paired arched-look windows
      [-w / 4, w / 4].forEach((wx) => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.08), primaryGlassMat);
        win.position.set(wx, 0, d / 2 + 0.02);
        setupMesh(win);
        group.add(win);

        // Fluted pilasters
        const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.18, wallH, 0.12), mats.whitePlaster);
        pilaster.position.set(wx - 0.65, 0, d / 2 + 0.06);
        setupMesh(pilaster);
        group.add(pilaster);
      });
      break;
    }

    case 'CANTILEVER_BAY':
    case 'AERODYNAMIC_METALLIC':
    case 'DUPLEX_PLANTERS':
    default: {
      // Floor J: Modern duplex apartment with cantilevered concrete bay & wooden sun louvers
      const bayD = 0.45;
      const bay = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, wallH * 0.9, bayD), mats.concreteLight);
      bay.position.set(0, 0, d / 2 + bayD / 2);
      setupMesh(bay);
      group.add(bay);

      // Glass front on bay
      const bayGlass = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.62, wallH * 0.75, 0.08),
        primaryGlassMat
      );
      bayGlass.position.set(0, 0, d / 2 + bayD + 0.02);
      setupMesh(bayGlass);
      group.add(bayGlass);

      // Teak wood louvers on sides of bay
      const louverSideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, wallH * 0.8, bayD), mats.woodPlanks);
      louverSideL.position.set(-w * 0.35, 0, d / 2 + bayD / 2);
      setupMesh(louverSideL);
      group.add(louverSideL);

      const louverSideR = new THREE.Mesh(new THREE.BoxGeometry(0.08, wallH * 0.8, bayD), mats.woodPlanks);
      louverSideR.position.set(w * 0.35, 0, d / 2 + bayD / 2);
      setupMesh(louverSideR);
      group.add(louverSideR);

      // AC unit
      const ac = createAcUnit(mats);
      ac.position.set(w / 2 + 0.05, 0, -d / 3);
      ac.rotation.y = Math.PI / 2;
      group.add(ac);
      break;
    }
  }

  return { group, dimensions };
}

/**
 * Creates the robust tower foundation base matching the city ground.
 */
export function createTowerFoundation(): { group: THREE.Group } {
  const mats = getArchMaterials();
  const group = new THREE.Group();
  group.name = 'TowerFoundation';

  const fw = GAME_CONFIG.BASE_WIDTH * 1.35;
  const fd = GAME_CONFIG.BASE_DEPTH * 1.35;
  const fh = GAME_CONFIG.FOUNDATION_HEIGHT;

  // Solid concrete base pedestal
  const baseGeo = new THREE.BoxGeometry(fw, fh, fd);
  const baseMesh = new THREE.Mesh(baseGeo, mats.concreteLight);
  baseMesh.position.y = fh / 2 - 6.0;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Grand lobby glass entrance on ground level
  const lobbyGlassGeo = new THREE.BoxGeometry(fw * 0.75, 2.6, 0.12);
  const lobbyGlass = new THREE.Mesh(lobbyGlassGeo, mats.glassWarmLit);
  lobbyGlass.position.set(0, 1.3 - 6.0, fd / 2 + 0.04);
  lobbyGlass.castShadow = true;
  group.add(lobbyGlass);

  // Entrance canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(fw * 0.85, 0.18, 1.8), mats.blackMetal);
  canopy.position.set(0, 2.65 - 6.0, fd / 2 + 0.9);
  canopy.castShadow = true;
  group.add(canopy);

  // Steel entrance pillars
  [-fw * 0.38, fw * 0.38].forEach((px) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 12), mats.blackMetal);
    col.position.set(px, 1.3 - 6.0, fd / 2 + 1.7);
    col.castShadow = true;
    group.add(col);
  });

  // Top foundation platform rim
  const rimGeo = new THREE.BoxGeometry(fw + 0.2, 0.25, fd + 0.2);
  const rimMesh = new THREE.Mesh(rimGeo, mats.blackMetal);
  rimMesh.position.y = fh - 6.0 - 0.12;
  rimMesh.castShadow = true;
  group.add(rimMesh);

  return { group };
}

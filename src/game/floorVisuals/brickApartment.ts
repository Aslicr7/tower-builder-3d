import * as THREE from 'three';
import { FloorDimensions } from '../../types';

// ============================================================================
// BRICK APARTMENT V1.1
// Architectural Masonry Archetype
// Visual refinement:
// 1. Natural architectural brick colors (Burnt Clay, Dark Brown, Terracotta)
// 2. Subtle procedural brick & mortar variation (no expensive geometry)
// 3. Removed harsh white horizontal stripes (thinner, muted warm stone slabs)
// 4. Dramatic silhouette differentiation:
//    - Variant A: Major projecting bay window (0.95m forward projection, 2.20m wide)
//    - Variant B: Deep corner cutout recessed balcony (2.10m x 1.90m negative space)
//    - Variant C: Stepped dual-mass architecture (1.10m depth offset between masses)
// 5. Simplified open balcony railings (strong top rail, 2-3 supports, no cages)
// 6. Deeply recessed masonry windows with muted stone sills & lintels
// 7. Deterministic 15-20% soft amber interior lighting
// ============================================================================

// ============================================================================
// CACHED PROCEDURAL BRICK & STONE TEXTURES
// Generated once on demand and cached. Ensures crisp, high-performance rendering.
// ============================================================================

const textureCache: Record<string, THREE.CanvasTexture> = {};

function getCachedTexture(key: string, generator: () => HTMLCanvasElement): THREE.CanvasTexture {
  if (!textureCache[key]) {
    const tex = new THREE.CanvasTexture(generator());
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    textureCache[key] = tex;
  }
  return textureCache[key];
}

/**
 * Procedural brick canvas generator.
 * Creates subtle, natural tone shifts across individual bricks, realistic warm mortar,
 * and delicate surface grain — avoiding flat "painted box" appearance.
 */
function createUrbanBrickCanvas(
  baseHex: string,
  darkHex: string,
  lightHex: string,
  warmHex: string,
  mortarHex: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm, muted mortar base
  ctx.fillStyle = mortarHex;
  ctx.fillRect(0, 0, 256, 256);

  const rowH = 16;
  const colW = 32;
  const mortarThick = 2;

  const hexColors = [baseHex, darkHex, lightHex, warmHex, baseHex];

  for (let y = 0; y < 256; y += rowH) {
    const isOdd = Math.floor(y / rowH) % 2 === 1;
    const offsetX = isOdd ? colW / 2 : 0;

    for (let x = -colW; x < 256 + colW; x += colW) {
      // Deterministic pseudo-random variation per brick
      const colorIdx = Math.abs((x * 19 + y * 37) % hexColors.length);
      ctx.fillStyle = hexColors[colorIdx];
      ctx.fillRect(
        x + offsetX + mortarThick,
        y + mortarThick,
        colW - mortarThick * 2,
        rowH - mortarThick * 2
      );

      // Subtle surface grain & slight micro-wear
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(
        x + offsetX + mortarThick,
        y + mortarThick,
        (colW - mortarThick * 2) * 0.5,
        rowH - mortarThick * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(
        x + offsetX + mortarThick + 4,
        y + mortarThick + 2,
        (colW - mortarThick * 2) * 0.4,
        (rowH - mortarThick * 2) * 0.4
      );
    }
  }

  // Soft atmospheric weathering bands
  ctx.fillStyle = 'rgba(30, 25, 20, 0.04)';
  for (let i = 0; i < 256; i += 32) {
    ctx.fillRect(0, i, 256, 3);
  }

  return canvas;
}

/**
 * Procedural stone/concrete canvas generator.
 * Creates muted, earthy, warm stone texture to prevent harsh white stripes.
 */
function createMasonryStoneCanvas(baseHex: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle natural flecks
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  for (let i = 0; i < 400; i++) {
    const rx = (i * 41) % 256;
    const ry = (i * 83) % 256;
    ctx.fillRect(rx, ry, 2, 2);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i < 300; i++) {
    const rx = (i * 59) % 256;
    const ry = (i * 97) % 256;
    ctx.fillRect(rx, ry, 2, 2);
  }
  return canvas;
}

// ============================================================================
// MATERIAL DEFINITIONS (3 RESTRAINED ARCHITECTURAL PALETTES)
// ============================================================================

const materialCache: Record<string, THREE.Material> = {};

function getMat(key: string, creator: () => THREE.Material): THREE.Material {
  if (!materialCache[key]) {
    materialCache[key] = creator();
  }
  return materialCache[key];
}

export function getBrickMaterials() {
  // Palettes:
  // A: Burnt Clay (Muted, earthy red-brown: #9B4936, #A8543E, #8F4435 — NOT bright red)
  const brickTexA = getCachedTexture('b_v11_brickTexA', () =>
    createUrbanBrickCanvas('#9B4936', '#853E2E', '#A8543E', '#8F4435', '#5C5248')
  );
  brickTexA.repeat.set(3, 1.6);

  // B: Dark Brown Brick (Deep brown, visibly brown under lighting — NOT black: #6B493E, #745044, #60463D)
  const brickTexB = getCachedTexture('b_v11_brickTexB', () =>
    createUrbanBrickCanvas('#6B493E', '#5A3D34', '#785347', '#60463D', '#483E38')
  );
  brickTexB.repeat.set(3, 1.6);

  // C: Weathered Terracotta (Dusty terracotta, restrained saturation: #B06B52, #A9614A, #B9785F)
  const brickTexC = getCachedTexture('b_v11_brickTexC', () =>
    createUrbanBrickCanvas('#B06B52', '#9E5D47', '#B9785F', '#A9614A', '#6E645A')
  );
  brickTexC.repeat.set(3, 1.6);

  // Warm stone textures (Muted stone grey / warm concrete — prevents bright white stripes)
  const stoneTexA = getCachedTexture('b_v11_stoneTexA', () => createMasonryStoneCanvas('#7A7369'));
  stoneTexA.repeat.set(2, 2);

  const stoneTexB = getCachedTexture('b_v11_stoneTexB', () => createMasonryStoneCanvas('#68625A'));
  stoneTexB.repeat.set(2, 2);

  const stoneTexC = getCachedTexture('b_v11_stoneTexC', () => createMasonryStoneCanvas('#827A70'));
  stoneTexC.repeat.set(2, 2);

  return {
    // ---------------- Palette A: Burnt Clay ----------------
    brickWallA: getMat('b_v11_brickWallA', () => new THREE.MeshStandardMaterial({
      color: 0xffffff, // 100% fidelity to procedural canvas colors
      map: brickTexA,
      roughness: 0.85,
      metalness: 0.02,
    })),
    stoneA: getMat('b_v11_stoneA', () => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: stoneTexA,
      roughness: 0.80,
      metalness: 0.04,
    })),
    frameA: getMat('b_v11_frameA', () => new THREE.MeshStandardMaterial({
      color: 0x25282D, // Charcoal frame
      roughness: 0.45,
      metalness: 0.45,
    })),
    metalA: getMat('b_v11_metalA', () => new THREE.MeshStandardMaterial({
      color: 0x2B2E33, // Dark Graphite
      roughness: 0.50,
      metalness: 0.60,
    })),
    glassA: getMat('b_v11_glassA', () => new THREE.MeshStandardMaterial({
      color: 0x343C45, // Smoky dark blue-grey
      roughness: 0.28,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
    })),

    // ---------------- Palette B: Dark Brown Brick ----------------
    brickWallB: getMat('b_v11_brickWallB', () => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: brickTexB,
      roughness: 0.86,
      metalness: 0.02,
    })),
    stoneB: getMat('b_v11_stoneB', () => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: stoneTexB,
      roughness: 0.80,
      metalness: 0.04,
    })),
    frameB: getMat('b_v11_frameB', () => new THREE.MeshStandardMaterial({
      color: 0x222428,
      roughness: 0.42,
      metalness: 0.50,
    })),
    metalB: getMat('b_v11_metalB', () => new THREE.MeshStandardMaterial({
      color: 0x24262A,
      roughness: 0.52,
      metalness: 0.60,
    })),
    glassB: getMat('b_v11_glassB', () => new THREE.MeshStandardMaterial({
      color: 0x36393E, // Smoky neutral grey
      roughness: 0.28,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
    })),

    // ---------------- Palette C: Weathered Terracotta ----------------
    brickWallC: getMat('b_v11_brickWallC', () => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: brickTexC,
      roughness: 0.84,
      metalness: 0.02,
    })),
    stoneC: getMat('b_v11_stoneC', () => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: stoneTexC,
      roughness: 0.78,
      metalness: 0.04,
    })),
    frameC: getMat('b_v11_frameC', () => new THREE.MeshStandardMaterial({
      color: 0x2A2723, // Bronze-charcoal
      roughness: 0.44,
      metalness: 0.48,
    })),
    metalC: getMat('b_v11_metalC', () => new THREE.MeshStandardMaterial({
      color: 0x2D2A26,
      roughness: 0.52,
      metalness: 0.58,
    })),
    glassC: getMat('b_v11_glassC', () => new THREE.MeshStandardMaterial({
      color: 0x323B38, // Subtle grey-green smoke
      roughness: 0.28,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
    })),

    // Common materials
    interiorDark: getMat('b_v11_interiorDark', () => new THREE.MeshBasicMaterial({
      color: 0x1F2328, // Deep charcoal interior (provides depth, not pure black)
    })),
    interiorWarm: getMat('b_v11_interiorWarm', () => new THREE.MeshBasicMaterial({
      color: 0xA67644, // Soft, muted amber interior backing (architectural, not neon)
    })),
    acUnit: getMat('b_v11_acUnit', () => new THREE.MeshStandardMaterial({
      color: 0x9E9991, // Muted concrete/metal casing
      roughness: 0.60,
      metalness: 0.20,
    })),
    acGrill: getMat('b_v11_acGrill', () => new THREE.MeshStandardMaterial({
      color: 0x2C3035,
      roughness: 0.70,
      metalness: 0.50,
    })),
  };
}

// ============================================================================
// ARCHITECTURAL HELPERS: DEEP RECESSED WINDOW & SIMPLIFIED OPEN BALCONY
// ============================================================================

/**
 * Creates a deeply recessed masonry window opening:
 * Outer brick reveal -> Muted Stone Sill at base -> Muted Stone Lintel on top -> Dark Frame -> Glass -> Interior Backing
 */
function createMasonryWindow(
  width: number,
  height: number,
  recessDepth: number,
  stoneMat: THREE.Material,
  frameMat: THREE.Material,
  glassMat: THREE.Material,
  useWarmInterior: boolean
): THREE.Group {
  const g = new THREE.Group();
  const materials = getBrickMaterials();

  const sillH = 0.06; // Thinner sill for refined profile
  const lintelH = 0.08;
  const sillOverhang = 0.04;

  // 1. Muted Stone Sill at bottom
  const sillGeo = new THREE.BoxGeometry(width + sillOverhang * 2, sillH, recessDepth + 0.06);
  const sill = new THREE.Mesh(sillGeo, stoneMat);
  sill.position.set(0, -height / 2 + sillH / 2, 0.03);
  sill.castShadow = true;
  sill.receiveShadow = true;
  g.add(sill);

  // 2. Muted Stone Lintel across top
  const lintelGeo = new THREE.BoxGeometry(width + sillOverhang * 2, lintelH, recessDepth + 0.04);
  const lintel = new THREE.Mesh(lintelGeo, stoneMat);
  lintel.position.set(0, height / 2 - lintelH / 2, 0.02);
  lintel.castShadow = true;
  lintel.receiveShadow = true;
  g.add(lintel);

  // 3. Deep Recessed Metal Frame
  const actualGlassW = Math.max(0.12, width - 0.06);
  const actualGlassH = Math.max(0.12, height - sillH - lintelH - 0.03);
  const frameY = (-sillH + lintelH) / 2;

  const frameThick = 0.04;
  const frameGeo = new THREE.BoxGeometry(actualGlassW, actualGlassH, 0.07);
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, frameY, -recessDepth * 0.35);
  frame.castShadow = true;
  frame.receiveShadow = true;
  g.add(frame);

  // 4. Glass Pane
  const glassGeo = new THREE.BoxGeometry(
    actualGlassW - frameThick * 2,
    actualGlassH - frameThick * 2,
    0.02
  );
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, frameY, -recessDepth * 0.32);
  g.add(glass);

  // 5. Interior Backing Plane (Dark or Soft Amber)
  const backGeo = new THREE.PlaneGeometry(
    actualGlassW - frameThick * 2,
    actualGlassH - frameThick * 2
  );
  const backMat = useWarmInterior ? materials.interiorWarm : materials.interiorDark;
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.position.set(0, frameY, -recessDepth * 0.48);
  g.add(backMesh);

  // Optional central vertical mullion for wide masonry openings
  if (width > 0.85) {
    const mullionGeo = new THREE.BoxGeometry(0.04, actualGlassH, 0.05);
    const mullion = new THREE.Mesh(mullionGeo, frameMat);
    mullion.position.set(0, frameY, -recessDepth * 0.30);
    mullion.castShadow = true;
    g.add(mullion);
  }

  return g;
}

/**
 * Creates an outdoor AC compressor unit on masonry brackets
 */
function createBrickAcUnit(mats: ReturnType<typeof getBrickMaterials>): THREE.Group {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.46, 0.32), mats.acUnit);
  box.castShadow = true;
  box.receiveShadow = true;
  g.add(box);

  const grill = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.02), mats.acGrill);
  grill.position.set(0.04, 0, -0.17);
  g.add(grill);

  const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.42), mats.metalA);
  b1.position.set(-0.22, -0.24, 0.06);
  b1.castShadow = true;
  g.add(b1);

  const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.42), mats.metalA);
  b2.position.set(0.22, -0.24, 0.06);
  b2.castShadow = true;
  g.add(b2);

  return g;
}

/**
 * Simplified Urban Metal Balcony Railing:
 * - Strong top rail
 * - 2-3 vertical supports
 * - Single mid-rail with large open sections
 * - Avoids thin cage bars so architectural recess and mass remain primary.
 */
function createUrbanMetalBalcony(
  width: number,
  depth: number,
  height: number,
  metalMat: THREE.Material
): THREE.Group {
  const g = new THREE.Group();
  const postW = 0.04;
  const postGeo = new THREE.BoxGeometry(postW, height, postW);

  // Outer corner posts
  const pFrontL = new THREE.Mesh(postGeo, metalMat);
  pFrontL.position.set(-width / 2 + postW / 2, height / 2, depth / 2 - postW / 2);
  pFrontL.castShadow = true;
  g.add(pFrontL);

  const pFrontR = new THREE.Mesh(postGeo, metalMat);
  pFrontR.position.set(width / 2 - postW / 2, height / 2, depth / 2 - postW / 2);
  pFrontR.castShadow = true;
  g.add(pFrontR);

  if (depth > 0.25) {
    const pBackL = new THREE.Mesh(postGeo, metalMat);
    pBackL.position.set(-width / 2 + postW / 2, height / 2, -depth / 2 + postW / 2);
    pBackL.castShadow = true;
    g.add(pBackL);

    const pBackR = new THREE.Mesh(postGeo, metalMat);
    pBackR.position.set(width / 2 - postW / 2, height / 2, -depth / 2 + postW / 2);
    pBackR.castShadow = true;
    g.add(pBackR);
  }

  // Strong Top Handrails (bold square profile)
  const topFront = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, 0.05), metalMat);
  topFront.position.set(0, height, depth / 2 - postW / 2);
  topFront.castShadow = true;
  g.add(topFront);

  if (depth > 0.25) {
    const topSideL = new THREE.Mesh(new THREE.BoxGeometry(postW, 0.05, depth), metalMat);
    topSideL.position.set(-width / 2 + postW / 2, height, 0);
    topSideL.castShadow = true;
    g.add(topSideL);

    const topSideR = new THREE.Mesh(new THREE.BoxGeometry(postW, 0.05, depth), metalMat);
    topSideR.position.set(width / 2 - postW / 2, height, 0);
    topSideR.castShadow = true;
    g.add(topSideR);
  }

  // Single Mid-Rail (large open sections, not a dense cage)
  const midFront = new THREE.Mesh(new THREE.BoxGeometry(width - postW * 2, 0.025, 0.025), metalMat);
  midFront.position.set(0, height * 0.45, depth / 2 - postW / 2);
  g.add(midFront);

  if (depth > 0.25) {
    const midSideL = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, depth - postW * 2), metalMat);
    midSideL.position.set(-width / 2 + postW / 2, height * 0.45, 0);
    g.add(midSideL);

    const midSideR = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, depth - postW * 2), metalMat);
    midSideR.position.set(width / 2 - postW / 2, height * 0.45, 0);
    g.add(midSideR);
  }

  // 1 Center Vertical Support Post
  if (width > 0.8) {
    const midPost = new THREE.Mesh(new THREE.BoxGeometry(postW, height, postW), metalMat);
    midPost.position.set(0, height / 2, depth / 2 - postW / 2);
    midPost.castShadow = true;
    g.add(midPost);
  }

  return g;
}

// ============================================================================
// BRICK APARTMENT ARCHETYPE BUILDER
// ============================================================================

export function buildBrickApartment(
  floorIndex: number,
  w: number,
  d: number,
  h: number
): { group: THREE.Group; dimensions: FloorDimensions } {
  const mats = getBrickMaterials();
  const group = new THREE.Group();

  const variantIndex = Math.abs(floorIndex) % 3; // 0 = Variant A, 1 = Variant B, 2 = Variant C
  const variantLetter = ['A', 'B', 'C'][variantIndex];
  group.name = `Floor_${floorIndex}_BRICK_APARTMENT_${variantLetter}`;

  const dimensions: FloorDimensions = { width: w, depth: d, height: h };

  const setupMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  // Thinner slab bands (0.08m instead of 0.14m) to eliminate continuous white horizontal stripes
  const slabH = 0.08;
  const wallH = h - slabH * 2;

  // Deterministic 15-20% warm interior distribution across major windows (no Math.random())
  const isWindowWarm = (slotId: number) =>
    Math.abs(floorIndex * 13 + slotId * 7 + 5) % 6 === 0;

  // =========================================================================
  // BRICK VARIANT A: THE PROJECTING BRICK BAY (BURNT CLAY PALETTE)
  // Major Silhouette Feature:
  // - Large heavy brick bay window projecting forward by 0.95m (width 2.20m)
  // - Front masonry window + Left/Right reveal windows
  // - Opposite front corner has compact balcony with simplified metal railing
  // - Reads unmistakably as a forward-projecting volume from 3/4 camera
  // =========================================================================
  if (variantIndex === 0) {
    const brickMat = mats.brickWallA;
    const stoneMat = mats.stoneA;
    const frameMat = mats.frameA;
    const metalMat = mats.metalA;
    const glassMat = mats.glassA;

    // 1. BASE AND TOP SLABS (Muted warm stone grey, thin profile)
    const botSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), stoneMat);
    botSlab.position.y = -h / 2 + slabH / 2;
    setupMesh(botSlab);
    group.add(botSlab);

    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), stoneMat);
    topSlab.position.y = h / 2 - slabH / 2;
    setupMesh(topSlab);
    group.add(topSlab);

    // 2. MAIN BRICK CORE VOLUME
    const core = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, wallH, d - 0.04), brickMat);
    setupMesh(core);
    group.add(core);

    // 3. SIGNATURE MAJOR PROJECTING BRICK BAY (Width: 2.20m, Forward Projection: 0.95m)
    const bayW = 2.20;
    const bayProj = 0.95;
    const bayCenterX = -0.55;
    const bayCenterZ = d / 2 + bayProj / 2;

    // Bay bottom and top stone slabs
    const bayBotSlab = new THREE.Mesh(new THREE.BoxGeometry(bayW, slabH, bayProj), stoneMat);
    bayBotSlab.position.set(bayCenterX, -h / 2 + slabH / 2, bayCenterZ);
    setupMesh(bayBotSlab);
    group.add(bayBotSlab);

    const bayTopSlab = new THREE.Mesh(new THREE.BoxGeometry(bayW, slabH, bayProj), stoneMat);
    bayTopSlab.position.set(bayCenterX, h / 2 - slabH / 2, bayCenterZ);
    setupMesh(bayTopSlab);
    group.add(bayTopSlab);

    // Heavy solid brick side piers of the bay
    const pierW = 0.28;
    const bayPierL = new THREE.Mesh(new THREE.BoxGeometry(pierW, wallH, bayProj), brickMat);
    bayPierL.position.set(bayCenterX - bayW / 2 + pierW / 2, 0, bayCenterZ);
    setupMesh(bayPierL);
    group.add(bayPierL);

    const bayPierR = new THREE.Mesh(new THREE.BoxGeometry(pierW, wallH, bayProj), brickMat);
    bayPierR.position.set(bayCenterX + bayW / 2 - pierW / 2, 0, bayCenterZ);
    setupMesh(bayPierR);
    group.add(bayPierR);

    // Brick parapet/fascia above and below bay window
    const bayFasciaH = 0.22;
    const bayTopFascia = new THREE.Mesh(
      new THREE.BoxGeometry(bayW - pierW * 2, bayFasciaH, 0.12),
      brickMat
    );
    bayTopFascia.position.set(bayCenterX, wallH / 2 - bayFasciaH / 2, d / 2 + bayProj - 0.06);
    setupMesh(bayTopFascia);
    group.add(bayTopFascia);

    const bayBotFascia = new THREE.Mesh(
      new THREE.BoxGeometry(bayW - pierW * 2, bayFasciaH, 0.12),
      brickMat
    );
    bayBotFascia.position.set(bayCenterX, -wallH / 2 + bayFasciaH / 2, d / 2 + bayProj - 0.06);
    setupMesh(bayBotFascia);
    group.add(bayBotFascia);

    // Bay Front Deep Masonry Window
    const bayFrontW = bayW - pierW * 2;
    const bayFrontWin = createMasonryWindow(
      bayFrontW,
      wallH - bayFasciaH * 2,
      0.16,
      stoneMat,
      frameMat,
      glassMat,
      isWindowWarm(0)
    );
    bayFrontWin.position.set(bayCenterX, 0, d / 2 + bayProj - 0.08);
    group.add(bayFrontWin);

    // Bay Left and Right Reveal Glazing (looking sideways out of the projecting bay)
    const sideWinL = createMasonryWindow(
      bayProj - 0.18,
      wallH * 0.78,
      0.12,
      stoneMat,
      frameMat,
      glassMat,
      false
    );
    sideWinL.rotation.y = -Math.PI / 2;
    sideWinL.position.set(bayCenterX - bayW / 2 + 0.05, 0, bayCenterZ);
    group.add(sideWinL);

    const sideWinR = createMasonryWindow(
      bayProj - 0.18,
      wallH * 0.78,
      0.12,
      stoneMat,
      frameMat,
      glassMat,
      false
    );
    sideWinR.rotation.y = Math.PI / 2;
    sideWinR.position.set(bayCenterX + bayW / 2 - 0.05, 0, bayCenterZ);
    group.add(sideWinR);

    // 4. FRONT RIGHT: COMPACT URBAN BALCONY WITH SIMPLIFIED RAILING
    const balcW = 1.15;
    const balcD = 0.70;
    const balcCenterX = 1.25;
    const balcCenterZ = d / 2 + balcD / 2;

    const balcSlab = new THREE.Mesh(new THREE.BoxGeometry(balcW, slabH, balcD), stoneMat);
    balcSlab.position.set(balcCenterX, -h / 2 + slabH / 2, balcCenterZ);
    setupMesh(balcSlab);
    group.add(balcSlab);

    const balcRailH = 0.85;
    const balcRail = createUrbanMetalBalcony(balcW, balcD, balcRailH, metalMat);
    balcRail.position.set(balcCenterX, -h / 2 + slabH, balcCenterZ);
    group.add(balcRail);

    // Deep French Doorway leading onto Balcony
    const balcDoor = createMasonryWindow(
      balcW - 0.20,
      wallH * 0.90,
      0.18,
      stoneMat,
      frameMat,
      glassMat,
      isWindowWarm(1)
    );
    balcDoor.position.set(balcCenterX, 0, d / 2 - 0.06);
    group.add(balcDoor);

    // 5. LEFT FACADE: Two deeply punched masonry windows
    const leftWin1 = createMasonryWindow(0.85, wallH * 0.76, 0.18, stoneMat, frameMat, glassMat, false);
    leftWin1.rotation.y = -Math.PI / 2;
    leftWin1.position.set(-w / 2 + 0.06, 0, 0.85);
    group.add(leftWin1);

    const leftWin2 = createMasonryWindow(0.85, wallH * 0.76, 0.18, stoneMat, frameMat, glassMat, isWindowWarm(2));
    leftWin2.rotation.y = -Math.PI / 2;
    leftWin2.position.set(-w / 2 + 0.06, 0, -0.85);
    group.add(leftWin2);

    // 6. RIGHT FACADE: Deep masonry window on rear half
    const rightWin = createMasonryWindow(0.95, wallH * 0.76, 0.18, stoneMat, frameMat, glassMat, false);
    rightWin.rotation.y = Math.PI / 2;
    rightWin.position.set(w / 2 - 0.06, 0, -0.75);
    group.add(rightWin);

    // 7. REAR FACADE: Two robust masonry windows + 1 wall-mounted AC unit
    const rearWin1 = createMasonryWindow(0.95, wallH * 0.74, 0.18, stoneMat, frameMat, glassMat, false);
    rearWin1.rotation.y = Math.PI;
    rearWin1.position.set(-0.85, 0, -d / 2 + 0.06);
    group.add(rearWin1);

    const rearWin2 = createMasonryWindow(0.95, wallH * 0.74, 0.18, stoneMat, frameMat, glassMat, isWindowWarm(3));
    rearWin2.rotation.y = Math.PI;
    rearWin2.position.set(0.85, 0, -d / 2 + 0.06);
    group.add(rearWin2);

    const ac = createBrickAcUnit(mats);
    ac.position.set(-w / 2 + 0.55, 0.15, -d / 2 - 0.18);
    group.add(ac);
  }

  // =========================================================================
  // BRICK VARIANT B: DEEP RECESSED BALCONY / CORNER CUT (DARK BROWN BRICK)
  // Major Silhouette Feature:
  // - True negative-space feature: front-left corner is completely carved out (2.10m x 1.90m)
  // - Missing corner clearly visible from 3/4 gameplay camera (NO outer corner post)
  // - Balcony floor sits inside the recess with simplified dark metal railing
  // - Brick back wall with deep French door, inner reveal window
  // - Solid right wing (2.10m wide) with deeply punched masonry windows
  // =========================================================================
  else if (variantIndex === 1) {
    const brickMat = mats.brickWallB;
    const stoneMat = mats.stoneB;
    const frameMat = mats.frameB;
    const metalMat = mats.metalB;
    const glassMat = mats.glassB;

    const cutW = 2.10; // Exact half of width
    const cutD = 1.90; // Deep corner recess
    const solidW = w - cutW; // 2.10m
    const solidRearD = d - cutD; // 2.30m

    // 1. BASE AND TOP SLABS
    const botSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), stoneMat);
    botSlab.position.y = -h / 2 + slabH / 2;
    setupMesh(botSlab);
    group.add(botSlab);

    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), stoneMat);
    topSlab.position.y = h / 2 - slabH / 2;
    setupMesh(topSlab);
    group.add(topSlab);

    // 2. MAIN SOLID BRICK WING (Right side, full depth)
    const rightMassGeo = new THREE.BoxGeometry(solidW, wallH, d - 0.04);
    const rightMass = new THREE.Mesh(rightMassGeo, brickMat);
    rightMass.position.set(w / 2 - solidW / 2, 0, 0);
    setupMesh(rightMass);
    group.add(rightMass);

    // 3. REAR BRICK MASS (Left-rear quadrant behind the recessed balcony)
    const rearMassGeo = new THREE.BoxGeometry(cutW, wallH, solidRearD);
    const rearMass = new THREE.Mesh(rearMassGeo, brickMat);
    rearMass.position.set(-w / 2 + cutW / 2, 0, -d / 2 + solidRearD / 2);
    setupMesh(rearMass);
    group.add(rearMass);

    // 4. DEEP RECESSED CORNER BALCONY (Front-left quadrant)
    const recessCenterX = -w / 2 + cutW / 2;
    const recessCenterZ = d / 2 - cutD / 2;

    // Dark finish for the recessed ceiling so the entire corner looks hollow from below
    const ceilingRecess = new THREE.Mesh(
      new THREE.BoxGeometry(cutW - 0.04, 0.02, cutD - 0.04),
      mats.interiorDark
    );
    ceilingRecess.position.set(recessCenterX, h / 2 - slabH - 0.01, recessCenterZ);
    group.add(ceilingRecess);

    // Balcony stone floor deck inside recess
    const deckGeo = new THREE.BoxGeometry(cutW - 0.04, 0.04, cutD - 0.04);
    const deck = new THREE.Mesh(deckGeo, stoneMat);
    deck.position.set(recessCenterX, -h / 2 + slabH + 0.02, recessCenterZ);
    setupMesh(deck);
    group.add(deck);

    // Open Corner Railing:
    // Follows the front and left perimeter of the recess. NO thick outer corner brick post.
    // This leaves the corner visually completely carved out!
    const railH = 0.85;
    const railPostW = 0.04;

    // Front railing segment (from -w/2 to -w/2 + cutW)
    const frontRailW = cutW - 0.08;
    const frontRailX = -w / 2 + cutW / 2;
    const frontRailZ = d / 2 - 0.04;

    const railTopFront = new THREE.Mesh(new THREE.BoxGeometry(frontRailW, 0.05, 0.05), metalMat);
    railTopFront.position.set(frontRailX, -h / 2 + slabH + railH, frontRailZ);
    railTopFront.castShadow = true;
    group.add(railTopFront);

    const railMidFront = new THREE.Mesh(new THREE.BoxGeometry(frontRailW, 0.025, 0.025), metalMat);
    railMidFront.position.set(frontRailX, -h / 2 + slabH + railH * 0.45, frontRailZ);
    group.add(railMidFront);

    // Corner post at the front-left edge of the floor
    const postCorner = new THREE.Mesh(new THREE.BoxGeometry(railPostW, railH, railPostW), metalMat);
    postCorner.position.set(-w / 2 + railPostW, -h / 2 + slabH + railH / 2, frontRailZ);
    postCorner.castShadow = true;
    group.add(postCorner);

    // Intermediate post along front rail
    const postMid = new THREE.Mesh(new THREE.BoxGeometry(railPostW, railH, railPostW), metalMat);
    postMid.position.set(frontRailX, -h / 2 + slabH + railH / 2, frontRailZ);
    postMid.castShadow = true;
    group.add(postMid);

    // Side railing segment along outer left edge
    const sideRailD = cutD - 0.08;
    const sideRailX = -w / 2 + railPostW;
    const sideRailZ = d / 2 - cutD / 2;

    const railTopSide = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, sideRailD), metalMat);
    railTopSide.position.set(sideRailX, -h / 2 + slabH + railH, sideRailZ);
    railTopSide.castShadow = true;
    group.add(railTopSide);

    const railMidSide = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, sideRailD), metalMat);
    railMidSide.position.set(sideRailX, -h / 2 + slabH + railH * 0.45, sideRailZ);
    group.add(railMidSide);

    const postSideBack = new THREE.Mesh(new THREE.BoxGeometry(railPostW, railH, railPostW), metalMat);
    postSideBack.position.set(sideRailX, -h / 2 + slabH + railH / 2, d / 2 - cutD + 0.04);
    postSideBack.castShadow = true;
    group.add(postSideBack);

    // Deep French Door in back wall of the recess
    const doorW = cutW * 0.65;
    const loggiaDoor = createMasonryWindow(
      doorW,
      wallH * 0.88,
      0.16,
      stoneMat,
      frameMat,
      glassMat,
      isWindowWarm(0)
    );
    loggiaDoor.position.set(recessCenterX, 0, d / 2 - cutD + 0.06);
    group.add(loggiaDoor);

    // Side Reveal Window on inner brick wall facing the balcony
    const innerSideWin = createMasonryWindow(
      cutD * 0.55,
      wallH * 0.74,
      0.14,
      stoneMat,
      frameMat,
      glassMat,
      isWindowWarm(1)
    );
    innerSideWin.rotation.y = -Math.PI / 2;
    innerSideWin.position.set(w / 2 - solidW + 0.06, 0, recessCenterZ);
    group.add(innerSideWin);

    // 5. SOLID RIGHT WING FACADE: Two deeply punched masonry windows
    const rightFrontWin1 = createMasonryWindow(
      0.85,
      wallH * 0.76,
      0.18,
      stoneMat,
      frameMat,
      glassMat,
      false
    );
    rightFrontWin1.position.set(w / 2 - solidW + 0.55, 0, d / 2 - 0.06);
    group.add(rightFrontWin1);

    const rightFrontWin2 = createMasonryWindow(
      0.85,
      wallH * 0.76,
      0.18,
      stoneMat,
      frameMat,
      glassMat,
      isWindowWarm(2)
    );
    rightFrontWin2.position.set(w / 2 - 0.55, 0, d / 2 - 0.06);
    group.add(rightFrontWin2);

    // 6. RIGHT FACADE: Deep masonry window
    const rightSideWin = createMasonryWindow(1.05, wallH * 0.76, 0.18, stoneMat, frameMat, glassMat, false);
    rightSideWin.rotation.y = Math.PI / 2;
    rightSideWin.position.set(w / 2 - 0.06, 0, 0);
    group.add(rightSideWin);

    // 7. LEFT FACADE: Masonry window on rear solid section
    const leftSideWin = createMasonryWindow(1.05, wallH * 0.76, 0.18, stoneMat, frameMat, glassMat, false);
    leftSideWin.rotation.y = -Math.PI / 2;
    leftSideWin.position.set(-w / 2 + 0.06, 0, -d / 2 + solidRearD / 2);
    group.add(leftSideWin);

    // 8. BACK FACADE: Two robust masonry windows + 1 AC unit
    const backWin1 = createMasonryWindow(0.95, wallH * 0.74, 0.18, stoneMat, frameMat, glassMat, false);
    backWin1.rotation.y = Math.PI;
    backWin1.position.set(-0.85, 0, -d / 2 + 0.06);
    group.add(backWin1);

    const backWin2 = createMasonryWindow(0.95, wallH * 0.74, 0.18, stoneMat, frameMat, glassMat, isWindowWarm(3));
    backWin2.rotation.y = Math.PI;
    backWin2.position.set(0.85, 0, -d / 2 + 0.06);
    group.add(backWin2);

    const acB = createBrickAcUnit(mats);
    acB.position.set(w / 2 - 0.55, 0.15, -d / 2 - 0.18);
    group.add(acB);
  }

  // =========================================================================
  // BRICK VARIANT C: STEPPED DUAL-MASS BRICK (WEATHERED TERRACOTTA)
  // Major Silhouette Feature:
  // - Composed of TWO offset large brick masses with dramatic depth difference (1.10m step)
  // - Mass 1 (Left Block, 2.30m wide) projects forward by +0.90m beyond base depth
  // - Mass 2 (Right Block, 1.90m wide) sits recessed by -0.20m behind base depth
  // - Stepped side seam with masonry reveal window
  // - Massive geometric step readable in solid black silhouette
  // =========================================================================
  else {
    const brickMat = mats.brickWallC;
    const stoneMat = mats.stoneC;
    const frameMat = mats.frameC;
    const glassMat = mats.glassC;

    const stepW1 = 2.30; // Primary forward projecting block
    const stepW2 = w - stepW1; // 1.90m recessed secondary block
    const stepProj = 0.90; // Mass 1 forward projection
    const stepIndent = 0.20; // Mass 2 recessed depth

    // 1. BASE AND TOP SLABS (Follow the structural perimeter)
    const botSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), stoneMat);
    botSlab.position.y = -h / 2 + slabH / 2;
    setupMesh(botSlab);
    group.add(botSlab);

    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), stoneMat);
    topSlab.position.y = h / 2 - slabH / 2;
    setupMesh(topSlab);
    group.add(topSlab);

    // 2. PRIMARY FORWARD BRICK MASS (Left Side: projects forward by stepProj = 0.90m)
    const mass1D = d + stepProj;
    const mass1Geo = new THREE.BoxGeometry(stepW1, wallH, mass1D);
    const mass1 = new THREE.Mesh(mass1Geo, brickMat);
    const mass1CenterX = -w / 2 + stepW1 / 2;
    const mass1CenterZ = stepProj / 2;
    mass1.position.set(mass1CenterX, 0, mass1CenterZ);
    setupMesh(mass1);
    group.add(mass1);

    // Projecting stone cap slabs for Mass 1
    const capGeo = new THREE.BoxGeometry(stepW1, slabH, stepProj);
    const capBot = new THREE.Mesh(capGeo, stoneMat);
    capBot.position.set(mass1CenterX, -h / 2 + slabH / 2, d / 2 + stepProj / 2);
    setupMesh(capBot);
    group.add(capBot);

    const capTop = new THREE.Mesh(capGeo, stoneMat);
    capTop.position.set(mass1CenterX, h / 2 - slabH / 2, d / 2 + stepProj / 2);
    setupMesh(capTop);
    group.add(capTop);

    // 3. SECONDARY RECESSED BRICK MASS (Right Side: recessed by stepIndent = 0.20m)
    const mass2D = d - stepIndent;
    const mass2Geo = new THREE.BoxGeometry(stepW2, wallH, mass2D);
    const mass2 = new THREE.Mesh(mass2Geo, brickMat);
    const mass2CenterX = w / 2 - stepW2 / 2;
    const mass2CenterZ = -stepIndent / 2;
    mass2.position.set(mass2CenterX, 0, mass2CenterZ);
    setupMesh(mass2);
    group.add(mass2);

    // 4. WINDOWS ON PRIMARY FORWARD BRICK MASS (Front Z = d/2 + stepProj)
    const frontZ1 = d / 2 + stepProj - 0.06;

    // Narrow vertical masonry slit window
    const narrowWin = createMasonryWindow(
      0.55,
      wallH * 0.80,
      0.18,
      stoneMat,
      frameMat,
      glassMat,
      false
    );
    narrowWin.position.set(mass1CenterX - stepW1 * 0.25, 0, frontZ1);
    group.add(narrowWin);

    // Wide masonry opening with stone sill & lintel
    const wideWin = createMasonryWindow(
      1.10,
      wallH * 0.80,
      0.18,
      stoneMat,
      frameMat,
      glassMat,
      isWindowWarm(0)
    );
    wideWin.position.set(mass1CenterX + stepW1 * 0.22, 0, frontZ1);
    group.add(wideWin);

    // Reveal window along the 1.10m step transition seam (facing +X)
    const totalStepOffset = stepProj + stepIndent; // 1.10m step!
    const seamWin = createMasonryWindow(
      totalStepOffset * 0.60,
      wallH * 0.72,
      0.12,
      stoneMat,
      frameMat,
      glassMat,
      false
    );
    seamWin.rotation.y = Math.PI / 2;
    seamWin.position.set(mass1CenterX + stepW1 / 2 - 0.04, 0, d / 2 + stepProj / 2);
    group.add(seamWin);

    // 5. WINDOWS ON RECESSED BRICK MASS (Front Z = d/2 - stepIndent)
    const frontZ2 = d / 2 - stepIndent - 0.06;
    const recessedWin = createMasonryWindow(
      stepW2 * 0.70,
      wallH * 0.78,
      0.18,
      stoneMat,
      frameMat,
      glassMat,
      isWindowWarm(1)
    );
    recessedWin.position.set(mass2CenterX, 0, frontZ2);
    group.add(recessedWin);

    // 6. LEFT FACADE: Two deeply set masonry windows
    const leftWin1 = createMasonryWindow(0.95, wallH * 0.76, 0.18, stoneMat, frameMat, glassMat, false);
    leftWin1.rotation.y = -Math.PI / 2;
    leftWin1.position.set(-w / 2 + 0.06, 0, 0.85);
    group.add(leftWin1);

    const leftWin2 = createMasonryWindow(0.95, wallH * 0.76, 0.18, stoneMat, frameMat, glassMat, isWindowWarm(2));
    leftWin2.rotation.y = -Math.PI / 2;
    leftWin2.position.set(-w / 2 + 0.06, 0, -0.85);
    group.add(leftWin2);

    // 7. RIGHT FACADE: Deep masonry window
    const rightWin = createMasonryWindow(1.05, wallH * 0.76, 0.18, stoneMat, frameMat, glassMat, false);
    rightWin.rotation.y = Math.PI / 2;
    rightWin.position.set(w / 2 - 0.06, 0, -stepIndent / 2);
    group.add(rightWin);

    // 8. REAR FACADE: Two robust masonry windows + 1 AC unit
    const rearWin1 = createMasonryWindow(0.95, wallH * 0.74, 0.18, stoneMat, frameMat, glassMat, false);
    rearWin1.rotation.y = Math.PI;
    rearWin1.position.set(-0.85, 0, -d / 2 + 0.06);
    group.add(rearWin1);

    const rearWin2 = createMasonryWindow(0.95, wallH * 0.74, 0.18, stoneMat, frameMat, glassMat, isWindowWarm(3));
    rearWin2.rotation.y = Math.PI;
    rearWin2.position.set(0.85, 0, -d / 2 + 0.06);
    group.add(rearWin2);

    const acC = createBrickAcUnit(mats);
    acC.position.set(-w / 2 + 0.55, 0.15, -d / 2 - 0.18);
    group.add(acC);
  }

  return { group, dimensions };
}

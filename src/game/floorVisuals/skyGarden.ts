/**
 * Sky Garden Floor Visual Archetype (Redesigned)
 *
 * Archetype #6: SKY GARDEN — "GARDEN FLOOR"
 * Redesigned in place:
 * - One complete architectural floor with an integrated open garden.
 * - Same overall visual height as other floor archetypes (~2.4m).
 * - Clear vertical hierarchy:
 *     TOP BEAM / PERGOLA FRAME (up to full floor height y = +h/2)
 *             ↓
 *     OPEN GARDEN ZONE (upper 50-65% open air, posts, organic foliage)
 *             ↓
 *     LOW ARCHITECTURAL CORE / WALL (lower 35-45% height, 25-35% footprint, with 1 large opening)
 *             ↓
 *     STRONG ARCHITECTURAL FLOOR SLAB (thick slab edge, solid grounded foundation)
 *
 * Foliage Design:
 * - ABSOLUTELY NO GREEN CUBES, RECTANGULAR BOXES, OR SPHERICAL BALL TREES.
 * - Foliage clusters built from 3-4 overlapping irregular 6-sided faceted polyhedra
 *   with varied scales, orientations, and 3 organic tones:
 *   - Dark Foliage: #3F6545
 *   - Mid Foliage: #55794D
 *   - Light Foliage: #70895A
 *
 * Curated Variants:
 * - Variant A: GARDEN FRAME (Strong base, low service core on left with smoky glass slot,
 *   full-height structural pergola, long planting zone, open center)
 * - Variant B: GREEN TERRACE (Central offset core with deep recessed opening, two integrated
 *   planting zones, partial overhead canopy, sweeping open terrace)
 * - Variant C: HANGING GARDEN (Asymmetric low core, edge planter strip with overhanging foliage forms,
 *   prominent timber pergola on opposite side, maximum asymmetric openness)
 *
 * Physics:
 * - Purely visual geometry.
 * - Simple box collider matching { width: w, depth: d, height: h } is strictly preserved.
 */

import * as THREE from 'three';
import { FloorDimensions } from '../../types';

// ============================================================================
// TEXTURE & MATERIAL CACHING (MOBILE-OPTIMIZED)
// ============================================================================

const textureCache = new Map<string, THREE.CanvasTexture>();
const materialCache = new Map<string, THREE.Material>();

function getTex(key: string, factory: () => HTMLCanvasElement): THREE.CanvasTexture {
  let tex = textureCache.get(key);
  if (!tex) {
    const canvas = factory();
    tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    textureCache.set(key, tex);
  }
  return tex;
}

function getMat<T extends THREE.Material>(key: string, factory: () => T): T {
  let mat = materialCache.get(key) as T | undefined;
  if (!mat) {
    mat = factory();
    materialCache.set(key, mat);
  }
  return mat;
}

/**
 * Procedural Warm Concrete Texture:
 * Architectural concrete with subtle grain and horizontal formwork lines.
 */
function createConcreteCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#A9A392';
  ctx.fillRect(0, 0, 128, 128);

  // Subtle horizontal formwork line
  ctx.fillStyle = '#9B9585';
  ctx.fillRect(0, 64, 128, 2);

  return canvas;
}

/**
 * Procedural Warm Wood Plank Canvas:
 * Architectural timber planks with rich teak/cedar grain.
 */
function createWoodPlankCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#826A49';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#6B5436';
  for (let y = 16; y < 128; y += 16) {
    ctx.fillRect(0, y, 128, 2);
  }

  return canvas;
}

function getSkyGardenMaterials() {
  const concreteTex = getTex('sg_conc_tex_v2', createConcreteCanvas);
  concreteTex.repeat.set(2, 1);

  const woodTex = getTex('sg_wood_tex_v2', createWoodPlankCanvas);
  woodTex.repeat.set(2, 2);

  return {
    // Warm Concrete Base & Walls (#A9A392)
    warmConcrete: getMat('sg_mat_conc_v2', () => new THREE.MeshStandardMaterial({
      color: 0xA9A392,
      map: concreteTex,
      roughness: 0.85,
      metalness: 0.05,
    })),
    // Light Stone Planter (#B6AF9D)
    planterStone: getMat('sg_mat_planter_v2', () => new THREE.MeshStandardMaterial({
      color: 0xB6AF9D,
      roughness: 0.80,
      metalness: 0.05,
    })),
    // Dark Core & Structure (#414846)
    darkCore: getMat('sg_mat_dark_v2', () => new THREE.MeshStandardMaterial({
      color: 0x414846,
      roughness: 0.68,
      metalness: 0.25,
    })),
    // Warm Wood Pergola & Beams (#826A49)
    warmWood: getMat('sg_mat_wood_v2', () => new THREE.MeshStandardMaterial({
      color: 0x826A49,
      map: woodTex,
      roughness: 0.65,
      metalness: 0.05,
    })),
    // Secondary Wood Slats (#967B53)
    woodSlat: getMat('sg_mat_slat_v2', () => new THREE.MeshStandardMaterial({
      color: 0x967B53,
      roughness: 0.60,
      metalness: 0.04,
    })),
    // Smoky Glass Window Slot (#60777A)
    smokyGlass: getMat('sg_mat_glass_v2', () => new THREE.MeshStandardMaterial({
      color: 0x60777A,
      roughness: 0.20,
      metalness: 0.60,
      transparent: true,
      opacity: 0.78,
    })),
    // Foliage Dark (#3F6545)
    foliageDark: getMat('sg_mat_fol_dark_v2', () => new THREE.MeshStandardMaterial({
      color: 0x3F6545,
      roughness: 0.88,
      metalness: 0.02,
      flatShading: true,
    })),
    // Foliage Mid (#55794D)
    foliageMid: getMat('sg_mat_fol_mid_v2', () => new THREE.MeshStandardMaterial({
      color: 0x55794D,
      roughness: 0.85,
      metalness: 0.02,
      flatShading: true,
    })),
    // Foliage Light (#70895A)
    foliageLight: getMat('sg_mat_fol_light_v2', () => new THREE.MeshStandardMaterial({
      color: 0x70895A,
      roughness: 0.82,
      metalness: 0.02,
      flatShading: true,
    })),
    // Soil Bed (#2A2521)
    soil: getMat('sg_mat_soil_v2', () => new THREE.MeshStandardMaterial({
      color: 0x2A2521,
      roughness: 0.95,
      metalness: 0.0,
    })),
  };
}

// ============================================================================
// ORGANIC LOW-POLY FOLIAGE GENERATOR
// Creates an organic, sculptural foliage mass from 3-4 overlapping
// 6-sided faceted polyhedra. NO SPHERES, NO CUBES, NO FLAT RECTANGLES.
// ============================================================================

function createOrganicFoliageCluster(
  mats: ReturnType<typeof getSkyGardenMaterials>,
  width: number,
  height: number,
  depth: number,
  seed: number,
  hasOverhang = false
): THREE.Group {
  const group = new THREE.Group();

  // Deterministic pseudo-random helper
  const pseudo = (offset: number) => {
    const val = Math.sin(seed * 37.19 + offset * 91.73) * 43758.5453;
    return val - Math.floor(val);
  };

  // 1. Foundational Faceted Mound (6-sided prism, Dark Foliage #3F6545)
  const baseGeom = new THREE.CylinderGeometry(
    width * 0.44,
    width * 0.52,
    height * 0.65,
    6
  );
  const baseMesh = new THREE.Mesh(baseGeom, mats.foliageDark);
  baseMesh.scale.set(1.0, 1.0, depth / Math.max(width, 0.001));
  baseMesh.rotation.y = (pseudo(1) - 0.5) * 0.6;
  baseMesh.position.set(0, height * 0.325, 0);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 2. Secondary Asymmetric Mound (6-sided prism, Mid Foliage #55794D)
  const midGeom = new THREE.CylinderGeometry(
    width * 0.36,
    width * 0.44,
    height * 0.80,
    6
  );
  const midMesh = new THREE.Mesh(midGeom, mats.foliageMid);
  const midScaleZ = (depth / Math.max(width, 0.001)) * 0.85;
  midMesh.scale.set(0.9, 1.0, Math.max(midScaleZ, 0.4));
  midMesh.rotation.y = Math.PI / 6 + (pseudo(2) - 0.5) * 0.4;
  midMesh.position.set(
    (pseudo(3) - 0.5) * width * 0.28,
    height * 0.42,
    (pseudo(4) - 0.5) * depth * 0.22
  );
  midMesh.castShadow = true;
  midMesh.receiveShadow = true;
  group.add(midMesh);

  // 3. Upper Angular Foliage Crest (6-sided prism, Light Foliage #70895A)
  const topGeom = new THREE.CylinderGeometry(
    width * 0.22,
    width * 0.32,
    height * 0.48,
    6
  );
  const topMesh = new THREE.Mesh(topGeom, mats.foliageLight);
  topMesh.rotation.y = (pseudo(5) - 0.5) * 0.9;
  topMesh.rotation.z = (pseudo(6) - 0.5) * 0.2;
  topMesh.position.set(
    (pseudo(7) - 0.5) * width * 0.22,
    height * 0.72,
    (pseudo(8) - 0.5) * depth * 0.20
  );
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  group.add(topMesh);

  // 4. Optional Overhanging Drooping Mass (For Variant C Hanging Garden)
  if (hasOverhang) {
    const hangGeom = new THREE.CylinderGeometry(
      width * 0.22,
      width * 0.28,
      height * 0.42,
      6
    );
    const hangMesh = new THREE.Mesh(hangGeom, mats.foliageMid);
    hangMesh.rotation.z = Math.PI / 4.2; // ~43-degree droop over planter rim
    hangMesh.position.set(width * 0.46, height * 0.26, (pseudo(9) - 0.5) * depth * 0.2);
    hangMesh.castShadow = true;
    hangMesh.receiveShadow = true;
    group.add(hangMesh);
  }

  return group;
}

// ============================================================================
// MAIN BUILD FUNCTION
// ============================================================================

export function buildSkyGarden(
  floorIndex: number,
  w: number,
  d: number,
  h: number
): { group: THREE.Group; dimensions: FloorDimensions } {
  const mats = getSkyGardenMaterials();
  const group = new THREE.Group();

  const variantIndex = Math.abs(floorIndex) % 3; // 0 = A, 1 = B, 2 = C
  const variantLetter = ['A', 'B', 'C'][variantIndex];
  group.name = `Floor_${floorIndex}_SKY_GARDEN_${variantLetter}`;

  const dimensions: FloorDimensions = { width: w, depth: d, height: h };

  const setupMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  // Base Slab & Level Coordinates
  const slabThickness = 0.32; // Thick architectural floor slab
  const slabBottomY = -h / 2;
  const slabTopY = slabBottomY + slabThickness; // e.g. -1.2 + 0.32 = -0.88m
  const slabCenterY = slabBottomY + slabThickness / 2;
  const ceilingY = h / 2; // +1.2m

  // =========================================================================
  // COMMON ARCHITECTURAL BASE FOUNDATION
  // Gives the floor module a solid grounded mass in the tower stack
  // =========================================================================

  // 1. Thick Base Slab in Warm Concrete
  const baseSlab = new THREE.Mesh(
    new THREE.BoxGeometry(w, slabThickness - 0.06, d),
    mats.warmConcrete
  );
  baseSlab.position.y = slabCenterY + 0.03;
  setupMesh(baseSlab);
  group.add(baseSlab);

  // 2. Dark Foundation Reveal Trim at Bottom
  const shadowReveal = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.08, 0.06, d - 0.08),
    mats.darkCore
  );
  shadowReveal.position.y = slabBottomY + 0.03;
  setupMesh(shadowReveal);
  group.add(shadowReveal);

  // =========================================================================
  // VARIANT A: GARDEN FRAME
  // Silhouette:
  // - Solid base + low service core on the left (~30% footprint, lower 42% height)
  // - Core features ONE large horizontal smoky-glass slot opening
  // - Full-height timber pergola anchored on the left reaching top of floor (y = +h/2)
  // - One long integrated planter running along the right edge with sculpted foliage
  // - Generous open central pedestrian terrace giving see-through depth
  // =========================================================================
  if (variantIndex === 0) {
    const coreW = 1.70;
    const coreD = 2.80;
    const coreH = 0.95; // Lower 40% height above slab
    const coreX = -w / 2 + coreW / 2 + 0.20;
    const coreZ = 0.0;
    const coreCenterY = slabTopY + coreH / 2;

    // 1. Low Architectural Service Core (Warm Concrete)
    const coreBox = new THREE.Mesh(
      new THREE.BoxGeometry(coreW, coreH, coreD),
      mats.warmConcrete
    );
    coreBox.position.set(coreX, coreCenterY, coreZ);
    setupMesh(coreBox);
    group.add(coreBox);

    // Dark Core Roof Cap
    const coreCap = new THREE.Mesh(
      new THREE.BoxGeometry(coreW + 0.06, 0.06, coreD + 0.06),
      mats.darkCore
    );
    coreCap.position.set(coreX, slabTopY + coreH + 0.03, coreZ);
    setupMesh(coreCap);
    group.add(coreCap);

    // 2. One Large Opening: Horizontal Smoky Glass Slot facing central garden
    const windowW = 0.10;
    const windowH = 0.38;
    const windowD = coreD - 0.60;
    const slotGlass = new THREE.Mesh(
      new THREE.BoxGeometry(windowW, windowH, windowD),
      mats.smokyGlass
    );
    slotGlass.position.set(coreX + coreW / 2 + 0.02, slabTopY + coreH * 0.55, coreZ);
    setupMesh(slotGlass);
    group.add(slotGlass);

    // Dark Frame Trim around the glass slot
    const slotFrame = new THREE.Mesh(
      new THREE.BoxGeometry(windowW + 0.02, windowH + 0.08, windowD + 0.08),
      mats.darkCore
    );
    slotFrame.position.set(coreX + coreW / 2 + 0.01, slabTopY + coreH * 0.55, coreZ);
    setupMesh(slotFrame);
    group.add(slotFrame);

    // 3. Full-Height Pergola Structure (Reaches full floor ceiling y = +h/2)
    const postW = 0.18;
    const postH = ceilingY - slabTopY - 0.06; // ~2.02m high
    const postCenterY = slabTopY + postH / 2;

    const pX1 = coreX - coreW / 2 + postW / 2 + 0.05;
    const pX2 = coreX + coreW / 2 + 0.35; // Posts extend out over garden terrace
    const pZ1 = -coreD / 2 + 0.25;
    const pZ2 = coreD / 2 - 0.25;

    const postCoords = [
      [pX1, pZ1],
      [pX2, pZ1],
      [pX1, pZ2],
      [pX2, pZ2],
    ];

    for (const [px, pz] of postCoords) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(postW, postH, postW),
        mats.warmWood
      );
      post.position.set(px, postCenterY, pz);
      setupMesh(post);
      group.add(post);

      // Dark structural base shoe
      const baseShoe = new THREE.Mesh(
        new THREE.BoxGeometry(postW + 0.04, 0.10, postW + 0.04),
        mats.darkCore
      );
      baseShoe.position.set(px, slabTopY + 0.05, pz);
      setupMesh(baseShoe);
      group.add(baseShoe);
    }

    // Two Longitudinal Beams at Top of Pergola
    const beamW = postW;
    const beamH = 0.18;
    const beamD = coreD + 0.40;
    const beamY = slabTopY + postH - beamH / 2;

    const beam1 = new THREE.Mesh(new THREE.BoxGeometry(beamW, beamH, beamD), mats.warmWood);
    beam1.position.set(pX1, beamY, coreZ);
    setupMesh(beam1);
    group.add(beam1);

    const beam2 = new THREE.Mesh(new THREE.BoxGeometry(beamW, beamH, beamD), mats.warmWood);
    beam2.position.set(pX2, beamY, coreZ);
    setupMesh(beam2);
    group.add(beam2);

    // 4 Bold Roof Slats Spanning Across Top
    const slatW = pX2 - pX1 + 0.45;
    const slatH = 0.12;
    const slatD = 0.16;
    const slatY = beamY + beamH / 2 + slatH / 2;
    const slatGeom = new THREE.BoxGeometry(slatW, slatH, slatD);

    for (let i = 0; i < 4; i++) {
      const sz = pZ1 + (i / 3) * (pZ2 - pZ1);
      const slat = new THREE.Mesh(slatGeom, mats.woodSlat);
      slat.position.set((pX1 + pX2) / 2, slatY, sz);
      setupMesh(slat);
      group.add(slat);
    }

    // 4. One Long Integrated Planter on Right Edge
    const planW = 1.15;
    const planD = 3.40;
    const planH = 0.52;
    const planX = w / 2 - planW / 2 - 0.20;
    const planZ = 0.0;

    const planter = new THREE.Mesh(
      new THREE.BoxGeometry(planW, planH, planD),
      mats.planterStone
    );
    planter.position.set(planX, slabTopY + planH / 2, planZ);
    setupMesh(planter);
    group.add(planter);

    const planterRim = new THREE.Mesh(
      new THREE.BoxGeometry(planW + 0.04, 0.06, planD + 0.04),
      mats.darkCore
    );
    planterRim.position.set(planX, slabTopY + planH + 0.03, planZ);
    setupMesh(planterRim);
    group.add(planterRim);

    // Soil Bed
    const soil = new THREE.Mesh(
      new THREE.BoxGeometry(planW - 0.12, 0.08, planD - 0.12),
      mats.soil
    );
    soil.position.set(planX, slabTopY + planH + 0.01, planZ);
    group.add(soil);

    // 5. Irregular Low-Poly Sculptural Foliage (2 connected clusters along the planter)
    const folGroup1 = createOrganicFoliageCluster(mats, planW * 0.95, 0.90, planD * 0.50, 101);
    folGroup1.position.set(planX, slabTopY + planH, planZ - 0.75);
    group.add(folGroup1);

    const folGroup2 = createOrganicFoliageCluster(mats, planW * 0.95, 1.05, planD * 0.50, 202);
    folGroup2.position.set(planX, slabTopY + planH, planZ + 0.75);
    group.add(folGroup2);
  }

  // =========================================================================
  // VARIANT B: GREEN TERRACE
  // Silhouette:
  // - Central offset architectural core with deep dark recessed portal opening
  // - Two integrated planting zones (one large front-left, one raised rear-right)
  // - Partial overhead structural canopy connecting to top floor frame
  // - Open terrace corridor wrapping through the floor
  // =========================================================================
  else if (variantIndex === 1) {
    const coreW = 1.65;
    const coreD = 1.45;
    const coreH = 0.98;
    const coreX = 0.20;
    const coreZ = -d / 2 + coreD / 2 + 0.25;

    // 1. Central/Rear Architectural Core (Warm Concrete + Dark Core Trim)
    const coreMesh = new THREE.Mesh(
      new THREE.BoxGeometry(coreW, coreH, coreD),
      mats.warmConcrete
    );
    coreMesh.position.set(coreX, slabTopY + coreH / 2, coreZ);
    setupMesh(coreMesh);
    group.add(coreMesh);

    // Warm Wood Front Accent Panel
    const woodPanel = new THREE.Mesh(
      new THREE.BoxGeometry(coreW - 0.10, coreH - 0.10, 0.05),
      mats.warmWood
    );
    woodPanel.position.set(coreX, slabTopY + coreH / 2, coreZ + coreD / 2 + 0.02);
    setupMesh(woodPanel);
    group.add(woodPanel);

    // 2. ONE Deep Dark Recessed Portal Opening
    const portalW = 0.85;
    const portalH = 0.65;
    const portalD = 0.40;
    const portal = new THREE.Mesh(
      new THREE.BoxGeometry(portalW, portalH, portalD),
      mats.darkCore
    );
    portal.position.set(coreX, slabTopY + portalH / 2 + 0.05, coreZ + coreD / 2 - portalD / 2 + 0.03);
    setupMesh(portal);
    group.add(portal);

    // Smoky Glass back inside portal
    const portalGlass = new THREE.Mesh(
      new THREE.BoxGeometry(portalW - 0.10, portalH - 0.10, 0.04),
      mats.smokyGlass
    );
    portalGlass.position.set(coreX, slabTopY + portalH / 2 + 0.05, coreZ + coreD / 2 - portalD + 0.04);
    group.add(portalGlass);

    // 3. Planting Zone 1 (Large Front-Left Garden Planter)
    const z1W = 1.70;
    const z1D = 1.80;
    const z1H = 0.50;
    const z1X = -w / 2 + z1W / 2 + 0.25;
    const z1Z = d / 2 - z1D / 2 - 0.25;

    const planter1 = new THREE.Mesh(
      new THREE.BoxGeometry(z1W, z1H, z1D),
      mats.planterStone
    );
    planter1.position.set(z1X, slabTopY + z1H / 2, z1Z);
    setupMesh(planter1);
    group.add(planter1);

    const rim1 = new THREE.Mesh(
      new THREE.BoxGeometry(z1W + 0.04, 0.05, z1D + 0.04),
      mats.darkCore
    );
    rim1.position.set(z1X, slabTopY + z1H + 0.025, z1Z);
    setupMesh(rim1);
    group.add(rim1);

    // Foliage Zone 1: Organic Sculptural Low-Poly Foliage
    const folZ1 = createOrganicFoliageCluster(mats, z1W * 0.90, 1.10, z1D * 0.90, 303);
    folZ1.position.set(z1X, slabTopY + z1H, z1Z);
    group.add(folZ1);

    // 4. Planting Zone 2 (Secondary Raised Planter on Right)
    const z2W = 1.25;
    const z2D = 1.60;
    const z2H = 0.65;
    const z2X = w / 2 - z2W / 2 - 0.25;
    const z2Z = 0.10;

    const planter2 = new THREE.Mesh(
      new THREE.BoxGeometry(z2W, z2H, z2D),
      mats.planterStone
    );
    planter2.position.set(z2X, slabTopY + z2H / 2, z2Z);
    setupMesh(planter2);
    group.add(planter2);

    const rim2 = new THREE.Mesh(
      new THREE.BoxGeometry(z2W + 0.04, 0.05, z2D + 0.04),
      mats.darkCore
    );
    rim2.position.set(z2X, slabTopY + z2H + 0.025, z2Z);
    setupMesh(rim2);
    group.add(rim2);

    // Foliage Zone 2: Organic Sculptural Foliage (Different height & shape)
    const folZ2 = createOrganicFoliageCluster(mats, z2W * 0.92, 0.95, z2D * 0.92, 404);
    folZ2.position.set(z2X, slabTopY + z2H, z2Z);
    group.add(folZ2);

    // 5. Overhead Structural Pergola Canopy (Full floor height y = +h/2)
    const postW = 0.16;
    const postH = ceilingY - slabTopY - 0.06;
    const postCenterY = slabTopY + postH / 2;

    const canPosts = [
      [-0.45, -0.60],
      [w / 2 - 0.35, -0.60],
      [w / 2 - 0.35, 1.20],
    ];

    for (const [px, pz] of canPosts) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(postW, postH, postW),
        mats.darkCore
      );
      post.position.set(px, postCenterY, pz);
      setupMesh(post);
      group.add(post);
    }

    // Top Runner Beam
    const runnerL = 1.95;
    const runner = new THREE.Mesh(
      new THREE.BoxGeometry(postW, 0.18, runnerL),
      mats.darkCore
    );
    runner.position.set(w / 2 - 0.35, slabTopY + postH - 0.09, 0.30);
    setupMesh(runner);
    group.add(runner);

    // 4 Overhead Slats in Warm Wood
    const slatW = (w / 2 - 0.35) - (-0.45) + 0.40;
    const slatGeom = new THREE.BoxGeometry(slatW, 0.12, 0.16);
    for (let i = 0; i < 4; i++) {
      const sz = -0.50 + (i / 3) * 1.60;
      const slat = new THREE.Mesh(slatGeom, mats.woodSlat);
      slat.position.set(0.65, slabTopY + postH + 0.06, sz);
      setupMesh(slat);
      group.add(slat);
    }
  }

  // =========================================================================
  // VARIANT C: HANGING GARDEN
  // Silhouette:
  // - Asymmetric low core on rear-left corner
  // - Prominent planting strip along the right edge with overhanging foliage forms
  // - Large timber pergola frame on the opposite side reaching full ceiling height
  // - Strongest asymmetric outdoor garden silhouette
  // =========================================================================
  else {
    // 1. Asymmetric Low Core (Rear-Left)
    const coreW = 1.60;
    const coreD = 1.60;
    const coreH = 0.90;
    const coreX = -w / 2 + coreW / 2 + 0.20;
    const coreZ = -d / 2 + coreD / 2 + 0.20;

    const coreMesh = new THREE.Mesh(
      new THREE.BoxGeometry(coreW, coreH, coreD),
      mats.warmConcrete
    );
    coreMesh.position.set(coreX, slabTopY + coreH / 2, coreZ);
    setupMesh(coreMesh);
    group.add(coreMesh);

    // Core Cap
    const coreCap = new THREE.Mesh(
      new THREE.BoxGeometry(coreW + 0.04, 0.06, coreD + 0.04),
      mats.darkCore
    );
    coreCap.position.set(coreX, slabTopY + coreH + 0.03, coreZ);
    setupMesh(coreCap);
    group.add(coreCap);

    // Horizontal Recessed Dark Metal Slot Opening
    const slotW = coreW - 0.40;
    const slotH = 0.25;
    const slotD = 0.15;
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(slotW, slotH, slotD),
      mats.darkCore
    );
    slot.position.set(coreX, slabTopY + coreH * 0.55, coreZ + coreD / 2 - slotD / 2 + 0.02);
    setupMesh(slot);
    group.add(slot);

    // 2. Large Planting Strip Along Right Edge with Overhang
    const stripW = 1.15;
    const stripD = 3.60;
    const stripH = 0.58;
    const stripX = w / 2 - stripW / 2 - 0.18;
    const stripZ = 0.0;

    const planterStrip = new THREE.Mesh(
      new THREE.BoxGeometry(stripW, stripH, stripD),
      mats.planterStone
    );
    planterStrip.position.set(stripX, slabTopY + stripH / 2, stripZ);
    setupMesh(planterStrip);
    group.add(planterStrip);

    const rimStrip = new THREE.Mesh(
      new THREE.BoxGeometry(stripW + 0.04, 0.05, stripD + 0.04),
      mats.darkCore
    );
    rimStrip.position.set(stripX, slabTopY + stripH + 0.025, stripZ);
    setupMesh(rimStrip);
    group.add(rimStrip);

    // 3. Foliage with Overhanging Drooping Forms (The "Hanging Garden" Signature)
    // Section 1: Front foliage cluster with overhanging mass
    const folHang1 = createOrganicFoliageCluster(mats, stripW * 0.95, 1.15, stripD * 0.45, 505, true);
    folHang1.position.set(stripX, slabTopY + stripH, stripZ - 0.85);
    group.add(folHang1);

    // Section 2: Rear foliage cluster with secondary overhanging mass
    const folHang2 = createOrganicFoliageCluster(mats, stripW * 0.95, 1.00, stripD * 0.45, 606, true);
    folHang2.position.set(stripX, slabTopY + stripH, stripZ + 0.85);
    group.add(folHang2);

    // 4. Large Structural Timber Pergola on Opposite Side (Full floor height y = +h/2)
    const postW = 0.18;
    const postH = ceilingY - slabTopY - 0.06;
    const postCenterY = slabTopY + postH / 2;

    const pergX1 = -w / 2 + 0.40;
    const pergX2 = 0.25;
    const pergZ1 = -1.30;
    const pergZ2 = 1.30;

    const timberPosts = [
      [pergX1, pergZ1],
      [pergX2, pergZ1],
      [pergX1, pergZ2],
      [pergX2, pergZ2],
    ];

    for (const [px, pz] of timberPosts) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(postW, postH, postW),
        mats.warmWood
      );
      post.position.set(px, postCenterY, pz);
      setupMesh(post);
      group.add(post);

      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(postW + 0.04, 0.10, postW + 0.04),
        mats.darkCore
      );
      shoe.position.set(px, slabTopY + 0.05, pz);
      setupMesh(shoe);
      group.add(shoe);
    }

    // Heavy Girders
    const girderGeomZ = new THREE.BoxGeometry(postW, 0.18, pergZ2 - pergZ1 + 0.40);
    const girder1 = new THREE.Mesh(girderGeomZ, mats.warmWood);
    girder1.position.set(pergX1, slabTopY + postH - 0.09, 0);
    setupMesh(girder1);
    group.add(girder1);

    const girder2 = new THREE.Mesh(girderGeomZ, mats.warmWood);
    girder2.position.set(pergX2, slabTopY + postH - 0.09, 0);
    setupMesh(girder2);
    group.add(girder2);

    // 4 Angled/Transverse Roof Slats
    const slatW = pergX2 - pergX1 + 0.45;
    const slatGeom = new THREE.BoxGeometry(slatW, 0.12, 0.16);
    for (let i = 0; i < 4; i++) {
      const sz = pergZ1 + (i / 3) * (pergZ2 - pergZ1);
      const slat = new THREE.Mesh(slatGeom, mats.woodSlat);
      slat.position.set((pergX1 + pergX2) / 2, slabTopY + postH + 0.06, sz);
      setupMesh(slat);
      group.add(slat);
    }
  }

  return { group, dimensions };
}

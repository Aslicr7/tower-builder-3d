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
import { FloorDimensions, LiftingPoint } from '../../types';

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

  // =========================================================================
  // COMPLETE STACKABLE STRUCTURAL MODULE ENVELOPE
  // - Full standard module height `h` (matching ~2.3m)
  // - Standard footprint `w` x `d` (matching ~4.2m)
  // - Flat structural top perimeter frame at y = +h/2 for predictable stacking
  // - Four visible structural lifting lugs at the four top corners
  // - All garden elements contained strictly inside the module (below stacking plane)
  // =========================================================================
  const slabThickness = 0.28; // Solid load-bearing foundation slab
  const slabBottomY = -h / 2;
  const slabTopY = slabBottomY + slabThickness;
  const slabCenterY = slabBottomY + slabThickness / 2;

  // Four top corner column locations
  const colHalfX = w * 0.44;
  const colHalfZ = d * 0.44;
  const colW = 0.22;
  const colD = 0.22;
  const colH = h - slabThickness;
  const colCenterY = slabTopY + colH / 2; // Column tops reach exactly y = +h/2

  // Top structural frame (Stacking Rim)
  const topFrameH = 0.16;
  const topFrameW = 0.22;
  const topFrameCenterY = h / 2 - topFrameH / 2; // Top surface is at exactly y = +h/2

  // Four structural lifting attachment points right on top of the 4 corner columns
  const topAnchorY = h / 2 + 0.04;
  const liftingPoints: LiftingPoint[] = [
    { x: -colHalfX, y: topAnchorY, z: -colHalfZ },
    { x: colHalfX, y: topAnchorY, z: -colHalfZ },
    { x: colHalfX, y: topAnchorY, z: colHalfZ },
    { x: -colHalfX, y: topAnchorY, z: colHalfZ },
  ];

  // Full module dimensions matching standard rectangular physics collider
  const dimensions: FloorDimensions = {
    width: w,
    depth: d,
    height: h,
    liftingPoints,
  };

  const setupMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  // =========================================================================
  // 1. LOAD-BEARING BASE FOUNDATION SLAB
  // =========================================================================
  const baseSlab = new THREE.Mesh(
    new THREE.BoxGeometry(w, slabThickness - 0.06, d),
    mats.warmConcrete
  );
  baseSlab.position.y = slabCenterY + 0.03;
  setupMesh(baseSlab);
  group.add(baseSlab);

  // Dark foundation reveal trim underneath
  const shadowReveal = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.08, 0.06, d - 0.08),
    mats.darkCore
  );
  shadowReveal.position.y = slabBottomY + 0.03;
  setupMesh(shadowReveal);
  group.add(shadowReveal);

  // =========================================================================
  // 2. FOUR REINFORCED VERTICAL CORNER COLUMNS
  // Connects the base slab to the top structural stacking frame
  // =========================================================================
  const cornerCoords: [number, number][] = [
    [-colHalfX, -colHalfZ],
    [colHalfX, -colHalfZ],
    [colHalfX, colHalfZ],
    [-colHalfX, colHalfZ],
  ];

  for (const [cx, cz] of cornerCoords) {
    // Vertical structural column in dark architectural steel/composite
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(colW, colH, colD),
      mats.darkCore
    );
    col.position.set(cx, colCenterY, cz);
    setupMesh(col);
    group.add(col);

    // Reinforced column base shoe on terrace slab
    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(colW + 0.06, 0.08, colD + 0.06),
      mats.darkCore
    );
    shoe.position.set(cx, slabTopY + 0.04, cz);
    setupMesh(shoe);
    group.add(shoe);

    // =======================================================================
    // 3. FOUR TOP LIFTING ANCHOR BRACKETS (MOUNTED ON CORNER COLUMNS)
    // The 4 crane slings attach directly to these 4 visible top steel lugs!
    // =======================================================================
    // Anchor base bracket plate
    const bracketPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.04, 0.24),
      mats.darkCore
    );
    bracketPlate.position.set(cx, h / 2 + 0.02, cz);
    setupMesh(bracketPlate);
    group.add(bracketPlate);

    // Solid structural pad-eye shackle lug with center eyelet hole
    const lug = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.10, 0.16),
      mats.darkCore
    );
    lug.position.set(cx, topAnchorY, cz);
    setupMesh(lug);
    group.add(lug);
  }

  // =========================================================================
  // 4. TOP STRUCTURAL PERIMETER FRAME (FLAT STACKING SURFACE)
  // Provides a continuous flat structural rim at y = +h/2 for next floor module
  // Center remains completely open to view garden down from above
  // =========================================================================
  // Longitudinal perimeter beams (North and South along X)
  const beamNorth = new THREE.Mesh(
    new THREE.BoxGeometry(w, topFrameH, topFrameW),
    mats.darkCore
  );
  beamNorth.position.set(0, topFrameCenterY, -colHalfZ);
  setupMesh(beamNorth);
  group.add(beamNorth);

  const beamSouth = new THREE.Mesh(
    new THREE.BoxGeometry(w, topFrameH, topFrameW),
    mats.darkCore
  );
  beamSouth.position.set(0, topFrameCenterY, colHalfZ);
  setupMesh(beamSouth);
  group.add(beamSouth);

  // Cross perimeter beams (East and West along Z)
  const beamEast = new THREE.Mesh(
    new THREE.BoxGeometry(topFrameW, topFrameH, d - topFrameW * 2),
    mats.darkCore
  );
  beamEast.position.set(colHalfX, topFrameCenterY, 0);
  setupMesh(beamEast);
  group.add(beamEast);

  const beamWest = new THREE.Mesh(
    new THREE.BoxGeometry(topFrameW, topFrameH, d - topFrameW * 2),
    mats.darkCore
  );
  beamWest.position.set(-colHalfX, topFrameCenterY, 0);
  setupMesh(beamWest);
  group.add(beamWest);

  // Corner joint reinforcement caps
  for (const [cx, cz] of cornerCoords) {
    const jointCap = new THREE.Mesh(
      new THREE.BoxGeometry(colW + 0.04, 0.04, colD + 0.04),
      mats.darkCore
    );
    jointCap.position.set(cx, h / 2 - 0.02, cz);
    setupMesh(jointCap);
    group.add(jointCap);
  }

  // =========================================================================
  // 5. OPEN GARDEN INTERIOR (ALL ELEMENTS SAFELY BELOW TOP STACKING PLANE)
  // Internal ceiling clearance: y <= +h/2 - 0.20m (~ +0.95m max)
  // =========================================================================

  // VARIANT A: GARDEN FRAME
  if (variantIndex === 0) {
    const coreW = 1.45;
    const coreD = 2.40;
    const coreH = 0.85;
    const coreX = -w / 2 + coreW / 2 + 0.35;
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

    // 2. Horizontal Smoky Glass Slot Opening
    const windowW = 0.10;
    const windowH = 0.35;
    const windowD = coreD - 0.60;
    const slotGlass = new THREE.Mesh(
      new THREE.BoxGeometry(windowW, windowH, windowD),
      mats.smokyGlass
    );
    slotGlass.position.set(coreX + coreW / 2 + 0.02, slabTopY + coreH * 0.55, coreZ);
    setupMesh(slotGlass);
    group.add(slotGlass);

    const slotFrame = new THREE.Mesh(
      new THREE.BoxGeometry(windowW + 0.02, windowH + 0.08, windowD + 0.08),
      mats.darkCore
    );
    slotFrame.position.set(coreX + coreW / 2 + 0.01, slabTopY + coreH * 0.55, coreZ);
    setupMesh(slotFrame);
    group.add(slotFrame);

    // 3. Slender Internal Timber Pergola (Well below top frame: peak y = +0.43m)
    const postW = 0.14;
    const postH = 1.25;
    const postCenterY = slabTopY + postH / 2;

    const pX1 = coreX - coreW / 2 + postW / 2 + 0.05;
    const pX2 = coreX + coreW / 2 + 0.30;
    const pZ1 = -coreD / 2 + 0.25;
    const pZ2 = coreD / 2 - 0.25;

    for (const [px, pz] of [
      [pX1, pZ1],
      [pX2, pZ1],
      [pX1, pZ2],
      [pX2, pZ2],
    ]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(postW, postH, postW),
        mats.warmWood
      );
      post.position.set(px, postCenterY, pz);
      setupMesh(post);
      group.add(post);

      const baseShoe = new THREE.Mesh(
        new THREE.BoxGeometry(postW + 0.04, 0.08, postW + 0.04),
        mats.darkCore
      );
      baseShoe.position.set(px, slabTopY + 0.04, pz);
      setupMesh(baseShoe);
      group.add(baseShoe);
    }

    // Pergola longitudinal runner beams
    const beamD = coreD + 0.20;
    const beamY = slabTopY + postH - 0.08;

    const b1 = new THREE.Mesh(new THREE.BoxGeometry(postW, 0.14, beamD), mats.warmWood);
    b1.position.set(pX1, beamY, coreZ);
    setupMesh(b1);
    group.add(b1);

    const b2 = new THREE.Mesh(new THREE.BoxGeometry(postW, 0.14, beamD), mats.warmWood);
    b2.position.set(pX2, beamY, coreZ);
    setupMesh(b2);
    group.add(b2);

    // 4 Cross slats (Peak height: slabTopY + postH + 0.05 ≈ +0.43m)
    const slatW = pX2 - pX1 + 0.40;
    const slatGeom = new THREE.BoxGeometry(slatW, 0.09, 0.14);
    for (let i = 0; i < 4; i++) {
      const sz = pZ1 + (i / 3) * (pZ2 - pZ1);
      const slat = new THREE.Mesh(slatGeom, mats.woodSlat);
      slat.position.set((pX1 + pX2) / 2, beamY + 0.10, sz);
      setupMesh(slat);
      group.add(slat);
    }

    // 4. One Long Integrated Stone Planter on Right Edge
    const planW = 1.05;
    const planD = 2.80;
    const planH = 0.44;
    const planX = w / 2 - planW / 2 - 0.35;
    const planZ = 0.0;

    const planter = new THREE.Mesh(
      new THREE.BoxGeometry(planW, planH, planD),
      mats.planterStone
    );
    planter.position.set(planX, slabTopY + planH / 2, planZ);
    setupMesh(planter);
    group.add(planter);

    const planterRim = new THREE.Mesh(
      new THREE.BoxGeometry(planW + 0.04, 0.05, planD + 0.04),
      mats.darkCore
    );
    planterRim.position.set(planX, slabTopY + planH + 0.025, planZ);
    setupMesh(planterRim);
    group.add(planterRim);

    const soil = new THREE.Mesh(
      new THREE.BoxGeometry(planW - 0.12, 0.08, planD - 0.12),
      mats.soil
    );
    soil.position.set(planX, slabTopY + planH + 0.01, planZ);
    group.add(soil);

    // Sculptural Faceted Foliage Clusters (Peak y ≈ +0.42m, safely below +1.15m)
    const folGroup1 = createOrganicFoliageCluster(mats, planW * 0.95, 0.85, planD * 0.46, 101);
    folGroup1.position.set(planX, slabTopY + planH, planZ - 0.65);
    group.add(folGroup1);

    const folGroup2 = createOrganicFoliageCluster(mats, planW * 0.95, 0.88, planD * 0.46, 202);
    folGroup2.position.set(planX, slabTopY + planH, planZ + 0.65);
    group.add(folGroup2);

    // 5. Central Terrace Timber Deck Inset & Stone Seating Bench
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(1.40, 0.04, 2.20),
      mats.warmWood
    );
    deck.position.set(0.15, slabTopY + 0.02, 0);
    setupMesh(deck);
    group.add(deck);

    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(0.50, 0.36, 1.20),
      mats.planterStone
    );
    bench.position.set(0.15, slabTopY + 0.18, 0);
    setupMesh(bench);
    group.add(bench);
  }

  // VARIANT B: GREEN TERRACE
  else if (variantIndex === 1) {
    const coreW = 1.45;
    const coreD = 1.35;
    const coreH = 0.88;
    const coreX = 0.10;
    const coreZ = -d / 2 + coreD / 2 + 0.35;

    // 1. Central/Rear Architectural Core
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

    // Deep Dark Recessed Portal Opening with Smoky Glass
    const portalW = 0.75;
    const portalH = 0.54;
    const portalD = 0.36;
    const portal = new THREE.Mesh(
      new THREE.BoxGeometry(portalW, portalH, portalD),
      mats.darkCore
    );
    portal.position.set(coreX, slabTopY + portalH / 2 + 0.06, coreZ + coreD / 2 - portalD / 2 + 0.03);
    setupMesh(portal);
    group.add(portal);

    const portalGlass = new THREE.Mesh(
      new THREE.BoxGeometry(portalW - 0.10, portalH - 0.10, 0.04),
      mats.smokyGlass
    );
    portalGlass.position.set(coreX, slabTopY + portalH / 2 + 0.06, coreZ + coreD / 2 - portalD + 0.04);
    group.add(portalGlass);

    // 2. Planting Zone 1 (Front-Left Garden Planter)
    const z1W = 1.45;
    const z1D = 1.50;
    const z1H = 0.44;
    const z1X = -w / 2 + z1W / 2 + 0.35;
    const z1Z = d / 2 - z1D / 2 - 0.35;

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

    const folZ1 = createOrganicFoliageCluster(mats, z1W * 0.90, 0.88, z1D * 0.90, 303);
    folZ1.position.set(z1X, slabTopY + z1H, z1Z);
    group.add(folZ1);

    // 3. Planting Zone 2 (Secondary Raised Planter on Right)
    const z2W = 1.10;
    const z2D = 1.40;
    const z2H = 0.52;
    const z2X = w / 2 - z2W / 2 - 0.35;
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

    const folZ2 = createOrganicFoliageCluster(mats, z2W * 0.92, 0.80, z2D * 0.92, 404);
    folZ2.position.set(z2X, slabTopY + z2H, z2Z);
    group.add(folZ2);

    // 4. Overhead Structural Trellis Canopy (Peak height y ≈ +0.38m)
    const postW = 0.14;
    const postH = 1.20;
    const postCenterY = slabTopY + postH / 2;

    const canPosts = [
      [-0.30, -0.45],
      [w / 2 - 0.45, -0.45],
      [w / 2 - 0.45, 1.05],
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

    const runnerL = 1.70;
    const runner = new THREE.Mesh(
      new THREE.BoxGeometry(postW, 0.14, runnerL),
      mats.darkCore
    );
    runner.position.set(w / 2 - 0.45, slabTopY + postH - 0.07, 0.30);
    setupMesh(runner);
    group.add(runner);

    const slatW = (w / 2 - 0.45) - (-0.30) + 0.30;
    const slatGeom = new THREE.BoxGeometry(slatW, 0.09, 0.14);
    for (let i = 0; i < 4; i++) {
      const sz = -0.40 + (i / 3) * 1.40;
      const slat = new THREE.Mesh(slatGeom, mats.woodSlat);
      slat.position.set(0.50, slabTopY + postH + 0.04, sz);
      setupMesh(slat);
      group.add(slat);
    }
  }

  // VARIANT C: HANGING GARDEN
  else {
    // 1. Asymmetric Low Core (Rear-Left)
    const coreW = 1.35;
    const coreD = 1.35;
    const coreH = 0.85;
    const coreX = -w / 2 + coreW / 2 + 0.35;
    const coreZ = -d / 2 + coreD / 2 + 0.35;

    const coreMesh = new THREE.Mesh(
      new THREE.BoxGeometry(coreW, coreH, coreD),
      mats.warmConcrete
    );
    coreMesh.position.set(coreX, slabTopY + coreH / 2, coreZ);
    setupMesh(coreMesh);
    group.add(coreMesh);

    const coreCap = new THREE.Mesh(
      new THREE.BoxGeometry(coreW + 0.04, 0.06, coreD + 0.04),
      mats.darkCore
    );
    coreCap.position.set(coreX, slabTopY + coreH + 0.03, coreZ);
    setupMesh(coreCap);
    group.add(coreCap);

    // Horizontal Recessed Dark Metal Slot Opening
    const slotW = coreW - 0.35;
    const slotH = 0.25;
    const slotD = 0.15;
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(slotW, slotH, slotD),
      mats.darkCore
    );
    slot.position.set(coreX, slabTopY + coreH * 0.55, coreZ + coreD / 2 - slotD / 2 + 0.02);
    setupMesh(slot);
    group.add(slot);

    // 2. Long Planting Strip Along Right Edge with Overhang
    const stripW = 1.00;
    const stripD = 3.00;
    const stripH = 0.48;
    const stripX = w / 2 - stripW / 2 - 0.32;
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

    // Foliage with Overhanging Drooping Forms (Peak height y ≈ +0.56m)
    const folHang1 = createOrganicFoliageCluster(mats, stripW * 0.95, 0.95, stripD * 0.45, 505, true);
    folHang1.position.set(stripX, slabTopY + stripH, stripZ - 0.75);
    group.add(folHang1);

    const folHang2 = createOrganicFoliageCluster(mats, stripW * 0.95, 0.88, stripD * 0.45, 606, true);
    folHang2.position.set(stripX, slabTopY + stripH, stripZ + 0.75);
    group.add(folHang2);

    // 3. Structural Timber Pergola on Opposite Side (Peak height y ≈ +0.43m)
    const postW = 0.14;
    const postH = 1.25;
    const postCenterY = slabTopY + postH / 2;

    const pergX1 = -w / 2 + 0.45;
    const pergX2 = 0.15;
    const pergZ1 = -1.15;
    const pergZ2 = 1.15;

    for (const [px, pz] of [
      [pergX1, pergZ1],
      [pergX2, pergZ1],
      [pergX1, pergZ2],
      [pergX2, pergZ2],
    ]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(postW, postH, postW),
        mats.warmWood
      );
      post.position.set(px, postCenterY, pz);
      setupMesh(post);
      group.add(post);

      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(postW + 0.04, 0.08, postW + 0.04),
        mats.darkCore
      );
      shoe.position.set(px, slabTopY + 0.04, pz);
      setupMesh(shoe);
      group.add(shoe);
    }

    const girderGeomZ = new THREE.BoxGeometry(postW, 0.14, pergZ2 - pergZ1 + 0.30);
    const girder1 = new THREE.Mesh(girderGeomZ, mats.warmWood);
    girder1.position.set(pergX1, slabTopY + postH - 0.07, 0);
    setupMesh(girder1);
    group.add(girder1);

    const girder2 = new THREE.Mesh(girderGeomZ, mats.warmWood);
    girder2.position.set(pergX2, slabTopY + postH - 0.07, 0);
    setupMesh(girder2);
    group.add(girder2);

    const slatW = pergX2 - pergX1 + 0.35;
    const slatGeom = new THREE.BoxGeometry(slatW, 0.09, 0.14);
    for (let i = 0; i < 4; i++) {
      const sz = pergZ1 + (i / 3) * (pergZ2 - pergZ1);
      const slat = new THREE.Mesh(slatGeom, mats.woodSlat);
      slat.position.set((pergX1 + pergX2) / 2, slabTopY + postH + 0.04, sz);
      setupMesh(slat);
      group.add(slat);
    }

    // 4. Stepping Stone Paver Path across Open Terrace
    for (let i = 0; i < 3; i++) {
      const paver = new THREE.Mesh(
        new THREE.BoxGeometry(0.40, 0.03, 0.40),
        mats.planterStone
      );
      paver.position.set(-0.25 + i * 0.15, slabTopY + 0.015, -0.60 + i * 0.60);
      setupMesh(paver);
      group.add(paver);
    }
  }

  return { group, dimensions };
}

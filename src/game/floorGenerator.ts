import * as THREE from 'three';
import { FloorDimensions, FloorModuleStyle } from '../types';
import { GAME_CONFIG } from './constants';
import { buildBrickApartment } from './floorVisuals/brickApartment';
import { buildGlassOffice } from './floorVisuals/glassOffice';
import { buildConcreteCantilever } from './floorVisuals/concreteCantilever';
import { buildIndustrialFrame } from './floorVisuals/industrialFrame';
import { buildSkyGarden } from './floorVisuals/skyGarden';

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
    // -------------------------------------------------------------------------
    // MODERN APARTMENT V1.2 - CURATED ARCHITECTURAL PALETTES
    // -------------------------------------------------------------------------
    // PALETTE A — WARM MODERN (Warm Ivory / Limestone, Charcoal, Smoky Blue-Grey)
    aptWallA: getMaterial('aptWallA', () => new THREE.MeshStandardMaterial({
      color: 0xe2ded4, // Warm Ivory / Limestone (#DDD7CB to #E8E2D6)
      map: concreteTex,
      roughness: 0.76,
      metalness: 0.04,
    })),
    aptSecondaryA: getMaterial('aptSecA', () => new THREE.MeshStandardMaterial({
      color: 0xd5d0c7, // Warm Light Grey
      map: concreteTex,
      roughness: 0.78,
      metalness: 0.04,
    })),
    aptSlabA: getMaterial('aptSlabA', () => new THREE.MeshStandardMaterial({
      color: 0xdcd7ce, // Warm limestone slab
      map: concreteTex,
      roughness: 0.75,
      metalness: 0.04,
    })),
    aptFrameA: getMaterial('aptFrameA', () => new THREE.MeshStandardMaterial({
      color: 0x1e2631, // Deep Charcoal
      roughness: 0.42,
      metalness: 0.45,
    })),
    aptGlassA: getMaterial('aptGlassA', () => new THREE.MeshStandardMaterial({
      color: 0x6e8a9f, // Smoky Blue-Grey (architectural tint, responsive to daylight)
      roughness: 0.20,
      metalness: 0.10,
      transparent: true,
      opacity: 0.82,
    })),
    aptGlassRailA: getMaterial('aptRailA', () => new THREE.MeshStandardMaterial({
      color: 0x7692a7,
      roughness: 0.16,
      metalness: 0.10,
      transparent: true,
      opacity: 0.65,
    })),
    aptDeckA: getMaterial('aptDeckA', () => new THREE.MeshStandardMaterial({
      color: 0x5d5347, // Muted warm timber/stone
      roughness: 0.70,
      metalness: 0.05,
    })),

    // PALETTE B — URBAN GREY (Light Concrete Grey, Graphite, Steel Blue-Grey)
    aptWallB: getMaterial('aptWallB', () => new THREE.MeshStandardMaterial({
      color: 0xc6cac5, // Light Concrete Grey (#BFC2BE to #CFD0CB)
      map: concreteTex,
      roughness: 0.74,
      metalness: 0.05,
    })),
    aptSecondaryB: getMaterial('aptSecB', () => new THREE.MeshStandardMaterial({
      color: 0xb4b8b3, // Medium cool grey
      map: concreteTex,
      roughness: 0.76,
      metalness: 0.05,
    })),
    aptSlabB: getMaterial('aptSlabB', () => new THREE.MeshStandardMaterial({
      color: 0xbcbfba, // Urban concrete slab
      map: concreteTex,
      roughness: 0.75,
      metalness: 0.05,
    })),
    aptFrameB: getMaterial('aptFrameB', () => new THREE.MeshStandardMaterial({
      color: 0x272c32, // Graphite
      roughness: 0.42,
      metalness: 0.48,
    })),
    aptGlassB: getMaterial('aptGlassB', () => new THREE.MeshStandardMaterial({
      color: 0x668094, // Steel Blue-Grey
      roughness: 0.20,
      metalness: 0.10,
      transparent: true,
      opacity: 0.82,
    })),
    aptGlassRailB: getMaterial('aptRailB', () => new THREE.MeshStandardMaterial({
      color: 0x718a9e,
      roughness: 0.16,
      metalness: 0.10,
      transparent: true,
      opacity: 0.65,
    })),
    aptDeckB: getMaterial('aptDeckB', () => new THREE.MeshStandardMaterial({
      color: 0x4c5257, // Cool architectural slate
      roughness: 0.68,
      metalness: 0.06,
    })),

    // PALETTE C — SAND / BRONZE MODERN (Sandstone/Greige, Dark Bronze, Smoke Green-Grey)
    aptWallC: getMaterial('aptWallC', () => new THREE.MeshStandardMaterial({
      color: 0xd0c4b2, // Muted Sandstone / Greige (#C9BCA8 to #D7C9B5)
      map: concreteTex,
      roughness: 0.76,
      metalness: 0.04,
    })),
    aptSecondaryC: getMaterial('aptSecC', () => new THREE.MeshStandardMaterial({
      color: 0xbfb2a0, // Warm stone
      map: concreteTex,
      roughness: 0.78,
      metalness: 0.04,
    })),
    aptSlabC: getMaterial('aptSlabC', () => new THREE.MeshStandardMaterial({
      color: 0xc8bcab, // Sandstone slab
      map: concreteTex,
      roughness: 0.75,
      metalness: 0.04,
    })),
    aptFrameC: getMaterial('aptFrameC', () => new THREE.MeshStandardMaterial({
      color: 0x2e2925, // Dark bronze / charcoal-bronze
      roughness: 0.42,
      metalness: 0.52,
    })),
    aptGlassC: getMaterial('aptGlassC', () => new THREE.MeshStandardMaterial({
      color: 0x648377, // Subtle smoke green-grey
      roughness: 0.20,
      metalness: 0.10,
      transparent: true,
      opacity: 0.82,
    })),
    aptGlassRailC: getMaterial('aptRailC', () => new THREE.MeshStandardMaterial({
      color: 0x6e8e82,
      roughness: 0.16,
      metalness: 0.10,
      transparent: true,
      opacity: 0.65,
    })),
    aptDeckC: getMaterial('aptDeckC', () => new THREE.MeshStandardMaterial({
      color: 0x585044, // Warm grey stone/deck
      roughness: 0.70,
      metalness: 0.05,
    })),

    // INTERIOR BACKINGS (Deep Slate vs Soft Architectural Twilight Glow)
    aptInteriorDark: getMaterial('aptIntDark', () => new THREE.MeshStandardMaterial({
      color: 0x273240, // Deep slate shadow (not pitch black)
      roughness: 0.85,
      metalness: 0.0,
    })),
    aptInteriorWarm: getMaterial('aptIntWarm', () => new THREE.MeshStandardMaterial({
      color: 0x46392b,
      emissive: 0xd97706,
      emissiveIntensity: 0.22, // Soft architectural twilight glow
      roughness: 0.80,
      metalness: 0.0,
    })),
    aptFoliage: getMaterial('aptFoliage', () => new THREE.MeshStandardMaterial({
      color: 0x365314,
      roughness: 0.88,
      metalness: 0.0,
    })),

    // Backwards compatibility aliases
    aptConcreteWarm: getMaterial('aptWallA', () => new THREE.MeshStandardMaterial()),
    aptConcreteSlab: getMaterial('aptSlabA', () => new THREE.MeshStandardMaterial()),
    aptConcreteAccent: getMaterial('aptSecA', () => new THREE.MeshStandardMaterial()),
    aptCharcoalFrame: getMaterial('aptFrameA', () => new THREE.MeshStandardMaterial()),
    aptGlassSmoky: getMaterial('aptGlassA', () => new THREE.MeshStandardMaterial()),
    aptGlassRailing: getMaterial('aptRailA', () => new THREE.MeshStandardMaterial()),
    aptBalconyDeck: getMaterial('aptDeckA', () => new THREE.MeshStandardMaterial()),
  };
}

export const PLAYABLE_FLOOR_STYLES: FloorModuleStyle[] = [
  'MODERN_APARTMENT_V1',
  'BRICK_APARTMENT',
  'GLASS_OFFICE',
  'CONCRETE_CANTILEVER',
  'INDUSTRIAL_FRAME',
  'SKY_GARDEN',
];

export const ALL_STYLES: FloorModuleStyle[] = [
  'MODERN_APARTMENT_V1',
  'BRICK_APARTMENT',
  'GLASS_OFFICE',
  'CONCRETE_CANTILEVER',
  'INDUSTRIAL_FRAME',
  'SKY_GARDEN',
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
 * Creates an architectural window bay with outer graphite frame,
 * recessed smoky glass pane, and dark/warm interior backing plane.
 */
function createArchitecturalWindowBay(
  width: number,
  height: number,
  frameDepth: number,
  mats: ReturnType<typeof getArchMaterials>,
  hasTransom: boolean = false,
  useWarmInterior: boolean = false,
  glassMat?: THREE.Material,
  frameMat?: THREE.Material
): THREE.Group {
  const g = new THREE.Group();
  const frameThick = 0.05;

  const fMat = frameMat || mats.aptFrameA;
  const gMat = glassMat || mats.aptGlassA;

  // Outer frame box (clean architectural metal)
  const frameGeo = new THREE.BoxGeometry(width, height, frameDepth);
  const frameMesh = new THREE.Mesh(frameGeo, fMat);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  g.add(frameMesh);

  // Recessed Glass Pane (with responsive daylight tint)
  const glassW = Math.max(0.08, width - frameThick * 2);
  const glassH = Math.max(0.08, height - frameThick * 2);
  const glassGeo = new THREE.BoxGeometry(glassW, glassH, 0.02);
  const glassMesh = new THREE.Mesh(glassGeo, gMat);
  glassMesh.position.z = frameDepth * 0.15;
  g.add(glassMesh);

  // Interior Backing Plane behind glass: Deep slate shadow vs subtle warm twilight glow
  const backGeo = new THREE.PlaneGeometry(glassW, glassH);
  const backMat = useWarmInterior ? mats.aptInteriorWarm : mats.aptInteriorDark;
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.position.z = -frameDepth * 0.44;
  g.add(backMesh);

  if (hasTransom) {
    const transomGeo = new THREE.BoxGeometry(glassW, 0.04, 0.04);
    const transom = new THREE.Mesh(transomGeo, fMat);
    transom.position.set(0, height * 0.22, frameDepth * 0.2);
    transom.castShadow = true;
    g.add(transom);
  }

  return g;
}

/**
 * MODERN APARTMENT V1 ARCHETYPE (Refined)
 * Curated 3-Variant Family:
 * - Variant A: Front-right projecting balcony (0.88 outward projection), living glazing left-center, dark interior.
 * - Variant B: Mirrored front-left projecting balcony (0.88 outward projection), living glazing right-center, subtle warm interior.
 * - Variant C: Forward-projecting terrace balcony (0.88 outward projection towards camera), panoramic glazing, subtle warm interior, sleek planter.
 * All variants share:
 * - Staggered Signature Charcoal Vertical Frame (breaks vertical alignment when stacked)
 * - Smoky blue-grey architectural glass (responsive to scene light, never black hole)
 * - Strong, unmistakable asymmetric silhouette (visual-only projection, zero physics impact)
 * - Four-sided complete architectural resolution
 */
export function buildModernApartmentV1(
  floorIndex: number,
  w: number,
  d: number,
  h: number
): { group: THREE.Group; dimensions: FloorDimensions } {
  const mats = getArchMaterials();
  const group = new THREE.Group();
  const variantIndex = Math.abs(floorIndex) % 3; // 0 = Variant A, 1 = Variant B, 2 = Variant C
  const variantLetter = ['A', 'B', 'C'][variantIndex];
  group.name = `Floor_${floorIndex}_MODERN_APARTMENT_V1_${variantLetter}`;

  const dimensions: FloorDimensions = { width: w, depth: d, height: h };

  const setupMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  const slabH = 0.11;
  const wallH = h - slabH * 2;
  const railH = 0.88;

  // Deterministic ~20% warm interior glow across floors
  const isWarmFloor = Math.abs(floorIndex) % 5 === 2;

  // =========================================================================
  // VARIANT A: BALCONY WING (WARM MODERN)
  // Palette: Warm Ivory/Limestone, Charcoal Frame, Smoky Blue-Grey Glass, Teak Deck
  // Silhouette: Solid mass shifted LEFT, large open RIGHT-SIDE balcony wing
  // =========================================================================
  if (variantIndex === 0) {
    const splitX = 0.25;
    const leftW = splitX - (-w / 2); // ~2.35m
    const rightW = w / 2 - splitX;    // ~1.85m
    const zCut = -0.15;
    const rearD = zCut - (-d / 2);    // ~1.95m

    // 1. BASE SLAB (Limestone)
    const baseSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.aptSlabA);
    baseSlab.position.y = -h / 2 + slabH / 2;
    setupMesh(baseSlab);
    group.add(baseSlab);

    // 2. TOP SLAB (Limestone)
    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.aptSlabA);
    topSlab.position.y = h / 2 - slabH / 2;
    setupMesh(topSlab);
    group.add(topSlab);

    // 3. MAIN SOLID APARTMENT MASS (Shifted Left, full depth)
    const leftMassGeo = new THREE.BoxGeometry(leftW, wallH, d - 0.04);
    const leftMass = new THREE.Mesh(leftMassGeo, mats.aptWallA);
    leftMass.position.set(-w / 2 + leftW / 2, 0, 0);
    setupMesh(leftMass);
    group.add(leftMass);

    // 4. RECESSED ENCLOSED BACK SECTION (Right side rear)
    const rearMassGeo = new THREE.BoxGeometry(rightW, wallH, rearD);
    const rearMass = new THREE.Mesh(rearMassGeo, mats.aptWallA);
    rearMass.position.set(splitX + rightW / 2, 0, -d / 2 + rearD / 2);
    setupMesh(rearMass);
    group.add(rearMass);

    // 5. LARGE RIGHT-SIDE BALCONY WING (Spans 60% of floor width, extends outward)
    const balcW = rightW + 0.65; // ~2.50m wide
    const balcD = d / 2 + 0.15 - zCut; // ~2.40m deep
    const balcCenterX = splitX + balcW / 2;
    const balcCenterZ = zCut + balcD / 2;

    // Cantilever Base Slab under Balcony Wing
    const balcSlab = new THREE.Mesh(new THREE.BoxGeometry(balcW, slabH, balcD), mats.aptSlabA);
    balcSlab.position.set(balcCenterX, -h / 2 + slabH / 2, balcCenterZ);
    setupMesh(balcSlab);
    group.add(balcSlab);

    // Muted Warm Timber Deck
    const balcDeck = new THREE.Mesh(new THREE.BoxGeometry(balcW - 0.04, 0.04, balcD - 0.04), mats.aptDeckA);
    balcDeck.position.set(balcCenterX, -h / 2 + slabH + 0.02, balcCenterZ);
    setupMesh(balcDeck);
    group.add(balcDeck);

    // Recessed Full Sliding Door Bay behind Balcony Wing (Z = zCut)
    const slidingBay = createArchitecturalWindowBay(
      rightW - 0.08,
      wallH * 0.88,
      0.14,
      mats,
      true,
      isWarmFloor,
      mats.aptGlassA,
      mats.aptFrameA
    );
    slidingBay.position.set(splitX + rightW / 2, 0, zCut + 0.06);
    group.add(slidingBay);

    // Signature Charcoal Vertical Frame at transition seam (X = splitX)
    const vertFrame = new THREE.Mesh(new THREE.BoxGeometry(0.16, wallH, 0.24), mats.aptFrameA);
    vertFrame.position.set(splitX, 0, d / 2 - 0.12);
    setupMesh(vertFrame);
    group.add(vertFrame);

    // Front living room window bay on the Left Solid Wing
    const livingBay = createArchitecturalWindowBay(
      1.15,
      wallH * 0.86,
      0.14,
      mats,
      true,
      false,
      mats.aptGlassA,
      mats.aptFrameA
    );
    livingBay.position.set(-0.45, 0, d / 2 - 0.06);
    group.add(livingBay);

    // Architectural slit window on far left of front facade
    const slitBay = createArchitecturalWindowBay(
      0.32,
      wallH * 0.70,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassA,
      mats.aptFrameA
    );
    slitBay.position.set(-w / 2 + 0.55, 0.02, d / 2 - 0.06);
    group.add(slitBay);

    // Balcony Railing: 3 strong charcoal posts + top handrail + smoky blue-grey glass panels
    const postR = 0.04;
    const railY = -h / 2 + slabH + railH / 2;
    const postGeo = new THREE.BoxGeometry(postR * 2, railH, postR * 2);

    const post1 = new THREE.Mesh(postGeo, mats.aptFrameA);
    post1.position.set(splitX + balcW - 0.06, railY, balcCenterZ + balcD / 2 - 0.06);
    setupMesh(post1);
    group.add(post1);

    const post2 = new THREE.Mesh(postGeo, mats.aptFrameA);
    post2.position.set(splitX + 0.06, railY, balcCenterZ + balcD / 2 - 0.06);
    setupMesh(post2);
    group.add(post2);

    const post3 = new THREE.Mesh(postGeo, mats.aptFrameA);
    post3.position.set(splitX + balcW - 0.06, railY, zCut + 0.06);
    setupMesh(post3);
    group.add(post3);

    // Charcoal Top Handrails (Front and Side)
    const frontRailGeo = new THREE.BoxGeometry(balcW, 0.04, 0.06);
    const frontRail = new THREE.Mesh(frontRailGeo, mats.aptFrameA);
    frontRail.position.set(balcCenterX, -h / 2 + slabH + railH, balcCenterZ + balcD / 2 - 0.06);
    setupMesh(frontRail);
    group.add(frontRail);

    const sideRailGeo = new THREE.BoxGeometry(0.06, 0.04, balcD);
    const sideRail = new THREE.Mesh(sideRailGeo, mats.aptFrameA);
    sideRail.position.set(splitX + balcW - 0.06, -h / 2 + slabH + railH, balcCenterZ);
    setupMesh(sideRail);
    group.add(sideRail);

    // Large Smoky Blue-Grey Glass Railing Panels
    const glassPanelFront = new THREE.Mesh(
      new THREE.BoxGeometry(balcW - 0.16, railH - 0.12, 0.03),
      mats.aptGlassRailA
    );
    glassPanelFront.position.set(balcCenterX, railY, balcCenterZ + balcD / 2 - 0.06);
    group.add(glassPanelFront);

    const glassPanelSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, railH - 0.12, balcD - 0.16),
      mats.aptGlassRailA
    );
    glassPanelSide.position.set(splitX + balcW - 0.06, railY, balcCenterZ);
    group.add(glassPanelSide);

    // Left Facade: Two architectural window bays
    const leftBay1 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.74,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassA,
      mats.aptFrameA
    );
    leftBay1.rotation.y = -Math.PI / 2;
    leftBay1.position.set(-w / 2 + 0.06, 0, 0.85);
    group.add(leftBay1);

    const leftBay2 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.74,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassA,
      mats.aptFrameA
    );
    leftBay2.rotation.y = -Math.PI / 2;
    leftBay2.position.set(-w / 2 + 0.06, 0, -0.85);
    group.add(leftBay2);

    // Back Facade: Two architectural window bays + exactly 1 outdoor AC unit
    const backBay1 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.70,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassA,
      mats.aptFrameA
    );
    backBay1.rotation.y = Math.PI;
    backBay1.position.set(-0.75, 0.04, -d / 2 + 0.06);
    group.add(backBay1);

    const backBay2 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.70,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassA,
      mats.aptFrameA
    );
    backBay2.rotation.y = Math.PI;
    backBay2.position.set(0.85, 0.04, -d / 2 + 0.06);
    group.add(backBay2);

    const ac = createAcUnit(mats);
    ac.position.set(-w / 2 + 0.50, 0.20, -d / 2 - 0.16);
    group.add(ac);
  }

  // =========================================================================
  // VARIANT B: MIRRORED / OFFSET BALCONY (URBAN GREY)
  // Palette: Light Concrete Grey, Graphite Frame, Steel Blue-Grey Glass, Slate Deck
  // Silhouette: Solid mass shifted RIGHT, large offset LEFT-SIDE balcony wing
  // =========================================================================
  else if (variantIndex === 1) {
    const splitX = -0.35;
    const rightW = w / 2 - splitX;     // ~2.45m
    const leftW = splitX - (-w / 2);   // ~1.75m
    const zCut = 0.10;
    const rearD = zCut - (-d / 2);     // ~2.18m

    // 1. BASE SLAB (Urban Concrete)
    const baseSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.aptSlabB);
    baseSlab.position.y = -h / 2 + slabH / 2;
    setupMesh(baseSlab);
    group.add(baseSlab);

    // 2. TOP SLAB (Urban Concrete)
    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.aptSlabB);
    topSlab.position.y = h / 2 - slabH / 2;
    setupMesh(topSlab);
    group.add(topSlab);

    // 3. MAIN SOLID APARTMENT MASS (Shifted Right, full depth)
    const rightMassGeo = new THREE.BoxGeometry(rightW, wallH, d - 0.04);
    const rightMass = new THREE.Mesh(rightMassGeo, mats.aptWallB);
    rightMass.position.set(splitX + rightW / 2, 0, 0);
    setupMesh(rightMass);
    group.add(rightMass);

    // 4. RECESSED ENCLOSED BACK SECTION (Left side rear)
    const rearMassGeo = new THREE.BoxGeometry(leftW, wallH, rearD);
    const rearMass = new THREE.Mesh(rearMassGeo, mats.aptWallB);
    rearMass.position.set(-w / 2 + leftW / 2, 0, -d / 2 + rearD / 2);
    setupMesh(rearMass);
    group.add(rearMass);

    // 5. LARGE LEFT-SIDE BALCONY WING (Offset cantilever extending left & forward)
    const balcW = leftW + 0.65; // ~2.40m wide
    const balcD = d / 2 + 0.20 - zCut; // ~2.20m deep
    const balcCenterX = splitX - balcW / 2;
    const balcCenterZ = zCut + balcD / 2;

    // Cantilever Base Slab under Left Balcony Wing
    const balcSlab = new THREE.Mesh(new THREE.BoxGeometry(balcW, slabH, balcD), mats.aptSlabB);
    balcSlab.position.set(balcCenterX, -h / 2 + slabH / 2, balcCenterZ);
    setupMesh(balcSlab);
    group.add(balcSlab);

    // Cool Architectural Slate Deck
    const balcDeck = new THREE.Mesh(new THREE.BoxGeometry(balcW - 0.04, 0.04, balcD - 0.04), mats.aptDeckB);
    balcDeck.position.set(balcCenterX, -h / 2 + slabH + 0.02, balcCenterZ);
    setupMesh(balcDeck);
    group.add(balcDeck);

    // Recessed Sliding Door Bay behind Left Balcony Wing (Z = zCut)
    const slidingBay = createArchitecturalWindowBay(
      leftW - 0.08,
      wallH * 0.88,
      0.14,
      mats,
      false,
      isWarmFloor,
      mats.aptGlassB,
      mats.aptFrameB
    );
    slidingBay.position.set(-w / 2 + leftW / 2, 0, zCut + 0.06);
    group.add(slidingBay);

    // Signature Graphite Vertical Frame at transition seam (X = splitX)
    const vertFrame = new THREE.Mesh(new THREE.BoxGeometry(0.16, wallH, 0.24), mats.aptFrameB);
    vertFrame.position.set(splitX, 0, d / 2 - 0.12);
    setupMesh(vertFrame);
    group.add(vertFrame);

    // Wide Panoramic Living Room Window Bay on the Right Mass (different glass ratio)
    const livingBay = createArchitecturalWindowBay(
      1.45,
      wallH * 0.86,
      0.14,
      mats,
      true,
      isWarmFloor,
      mats.aptGlassB,
      mats.aptFrameB
    );
    livingBay.position.set(0.50, 0, d / 2 - 0.06);
    group.add(livingBay);

    // Slit window on right mass far edge
    const slitBay = createArchitecturalWindowBay(
      0.32,
      wallH * 0.70,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassB,
      mats.aptFrameB
    );
    slitBay.position.set(w / 2 - 0.50, 0.02, d / 2 - 0.06);
    group.add(slitBay);

    // Balcony Railing: 3 graphite posts + top handrail + steel blue-grey glass panels
    const postR = 0.04;
    const railY = -h / 2 + slabH + railH / 2;
    const postGeo = new THREE.BoxGeometry(postR * 2, railH, postR * 2);

    const post1 = new THREE.Mesh(postGeo, mats.aptFrameB);
    post1.position.set(splitX - balcW + 0.06, railY, balcCenterZ + balcD / 2 - 0.06);
    setupMesh(post1);
    group.add(post1);

    const post2 = new THREE.Mesh(postGeo, mats.aptFrameB);
    post2.position.set(splitX - 0.06, railY, balcCenterZ + balcD / 2 - 0.06);
    setupMesh(post2);
    group.add(post2);

    const post3 = new THREE.Mesh(postGeo, mats.aptFrameB);
    post3.position.set(splitX - balcW + 0.06, railY, zCut + 0.06);
    setupMesh(post3);
    group.add(post3);

    // Graphite Top Handrails (Front and Side)
    const frontRailGeo = new THREE.BoxGeometry(balcW, 0.04, 0.06);
    const frontRail = new THREE.Mesh(frontRailGeo, mats.aptFrameB);
    frontRail.position.set(balcCenterX, -h / 2 + slabH + railH, balcCenterZ + balcD / 2 - 0.06);
    setupMesh(frontRail);
    group.add(frontRail);

    const sideRailGeo = new THREE.BoxGeometry(0.06, 0.04, balcD);
    const sideRail = new THREE.Mesh(sideRailGeo, mats.aptFrameB);
    sideRail.position.set(splitX - balcW + 0.06, -h / 2 + slabH + railH, balcCenterZ);
    setupMesh(sideRail);
    group.add(sideRail);

    // Steel Blue-Grey Glass Railing Panels
    const glassPanelFront = new THREE.Mesh(
      new THREE.BoxGeometry(balcW - 0.16, railH - 0.12, 0.03),
      mats.aptGlassRailB
    );
    glassPanelFront.position.set(balcCenterX, railY, balcCenterZ + balcD / 2 - 0.06);
    group.add(glassPanelFront);

    const glassPanelSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, railH - 0.12, balcD - 0.16),
      mats.aptGlassRailB
    );
    glassPanelSide.position.set(splitX - balcW + 0.06, railY, balcCenterZ);
    group.add(glassPanelSide);

    // Right Facade: Two architectural window bays
    const rightBay1 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.74,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassB,
      mats.aptFrameB
    );
    rightBay1.rotation.y = Math.PI / 2;
    rightBay1.position.set(w / 2 - 0.06, 0, 0.85);
    group.add(rightBay1);

    const rightBay2 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.74,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassB,
      mats.aptFrameB
    );
    rightBay2.rotation.y = Math.PI / 2;
    rightBay2.position.set(w / 2 - 0.06, 0, -0.85);
    group.add(rightBay2);

    // Back Facade: Two architectural window bays + exactly 1 outdoor AC unit
    const backBay1 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.70,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassB,
      mats.aptFrameB
    );
    backBay1.rotation.y = Math.PI;
    backBay1.position.set(-0.85, 0.04, -d / 2 + 0.06);
    group.add(backBay1);

    const backBay2 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.70,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassB,
      mats.aptFrameB
    );
    backBay2.rotation.y = Math.PI;
    backBay2.position.set(0.75, 0.04, -d / 2 + 0.06);
    group.add(backBay2);

    const acB = createAcUnit(mats);
    acB.position.set(w / 2 - 0.50, 0.20, -d / 2 - 0.16);
    group.add(acB);
  }

  // =========================================================================
  // VARIANT C: L-SHAPED / TERRACE CUTOUT (SAND / BRONZE)
  // Palette: Warm Sand Concrete, Dark Bronze Frame, Green-Grey Smoke Glass, Composite Deck
  // Silhouette: L-shaped massing with large forward-corner terrace cutout (78-85% massing)
  // =========================================================================
  else {
    const cutW = 1.95; // Terrace cutout width on right front
    const cutD = 1.90; // Terrace cutout depth on front
    const leftW = w - cutW; // ~2.25m solid front-to-back wing
    const rearD = d - cutD; // ~2.25m rear section spanning full width

    // 1. BASE SLAB (Sand Tone)
    const baseSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.aptSlabC);
    baseSlab.position.y = -h / 2 + slabH / 2;
    setupMesh(baseSlab);
    group.add(baseSlab);

    // 2. TOP SLAB (Sand Tone)
    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.aptSlabC);
    topSlab.position.y = h / 2 - slabH / 2;
    setupMesh(topSlab);
    group.add(topSlab);

    // 3. SOLID MAIN L-VOLUME:
    // Left Wing (Full depth from front to back)
    const leftMassGeo = new THREE.BoxGeometry(leftW, wallH, d - 0.04);
    const leftMass = new THREE.Mesh(leftMassGeo, mats.aptWallC);
    leftMass.position.set(-w / 2 + leftW / 2, 0, 0);
    setupMesh(leftMass);
    group.add(leftMass);

    // Rear Wing (Spans behind terrace on the right side)
    const rearMassGeo = new THREE.BoxGeometry(cutW, wallH, rearD);
    const rearMass = new THREE.Mesh(rearMassGeo, mats.aptWallC);
    rearMass.position.set(w / 2 - cutW / 2, 0, -d / 2 + rearD / 2);
    setupMesh(rearMass);
    group.add(rearMass);

    // 4. TERRACE / BALCONY CUTOUT (Right-front quadrant):
    // Deck floor over the terrace
    const terraceDeckGeo = new THREE.BoxGeometry(cutW + 0.35, 0.04, cutD + 0.30);
    const terraceDeck = new THREE.Mesh(terraceDeckGeo, mats.aptDeckC);
    const terrCenterX = w / 2 - cutW / 2 + 0.17;
    const terrCenterZ = d / 2 - cutD / 2 + 0.15;
    terraceDeck.position.set(terrCenterX, -h / 2 + slabH + 0.02, terrCenterZ);
    setupMesh(terraceDeck);
    group.add(terraceDeck);

    // Cantilever slab extension under terrace
    const terrSlabGeo = new THREE.BoxGeometry(cutW + 0.35, slabH, cutD + 0.30);
    const terrSlab = new THREE.Mesh(terrSlabGeo, mats.aptSlabC);
    terrSlab.position.set(terrCenterX, -h / 2 + slabH / 2, terrCenterZ);
    setupMesh(terrSlab);
    group.add(terrSlab);

    // Sliding Glass Door connecting terrace to rear interior (facing +Z)
    const terraceDoor = createArchitecturalWindowBay(
      cutW - 0.15,
      wallH * 0.88,
      0.14,
      mats,
      false,
      isWarmFloor,
      mats.aptGlassC,
      mats.aptFrameC
    );
    terraceDoor.position.set(w / 2 - cutW / 2, 0, d / 2 - cutD + 0.06);
    group.add(terraceDoor);

    // Side window looking onto the terrace from the Left Wing (facing +X)
    const sideTerraceWindow = createArchitecturalWindowBay(
      cutD - 0.25,
      wallH * 0.82,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassC,
      mats.aptFrameC
    );
    sideTerraceWindow.rotation.y = Math.PI / 2;
    sideTerraceWindow.position.set(-w / 2 + leftW - 0.06, 0, terrCenterZ);
    group.add(sideTerraceWindow);

    // Bronze Vertical Accent Frame at corner of terrace
    const bronzeFrame = new THREE.Mesh(new THREE.BoxGeometry(0.18, wallH, 0.22), mats.aptFrameC);
    bronzeFrame.position.set(-w / 2 + leftW, 0, d / 2 - 0.10);
    setupMesh(bronzeFrame);
    group.add(bronzeFrame);

    // Front living room window bay on the Left Solid Wing
    const frontBayC = createArchitecturalWindowBay(
      leftW * 0.75,
      wallH * 0.86,
      0.14,
      mats,
      true,
      isWarmFloor,
      mats.aptGlassC,
      mats.aptFrameC
    );
    frontBayC.position.set(-w / 2 + leftW / 2 - 0.10, 0, d / 2 - 0.06);
    group.add(frontBayC);

    // Terrace Railing: Bronze posts + top handrail + green-grey glass panels
    const postR = 0.04;
    const railY = -h / 2 + slabH + railH / 2;
    const postGeo = new THREE.BoxGeometry(postR * 2, railH, postR * 2);

    const outerTerrX = terrCenterX + (cutW + 0.35) / 2 - 0.06;
    const outerTerrZ = terrCenterZ + (cutD + 0.30) / 2 - 0.06;

    const p1 = new THREE.Mesh(postGeo, mats.aptFrameC);
    p1.position.set(outerTerrX, railY, outerTerrZ);
    setupMesh(p1);
    group.add(p1);

    const p2 = new THREE.Mesh(postGeo, mats.aptFrameC);
    p2.position.set(-w / 2 + leftW + 0.08, railY, outerTerrZ);
    setupMesh(p2);
    group.add(p2);

    const p3 = new THREE.Mesh(postGeo, mats.aptFrameC);
    p3.position.set(outerTerrX, railY, d / 2 - cutD + 0.06);
    setupMesh(p3);
    group.add(p3);

    // Bronze Top Handrails
    const frontRailGeo = new THREE.BoxGeometry(cutW + 0.25, 0.04, 0.06);
    const frontRail = new THREE.Mesh(frontRailGeo, mats.aptFrameC);
    frontRail.position.set(terrCenterX, -h / 2 + slabH + railH, outerTerrZ);
    setupMesh(frontRail);
    group.add(frontRail);

    const sideRailGeo = new THREE.BoxGeometry(0.06, 0.04, cutD + 0.22);
    const sideRail = new THREE.Mesh(sideRailGeo, mats.aptFrameC);
    sideRail.position.set(outerTerrX, -h / 2 + slabH + railH, terrCenterZ);
    setupMesh(sideRail);
    group.add(sideRail);

    // Green-Grey Smoke Glass Railing Panels
    const glassPanelFront = new THREE.Mesh(
      new THREE.BoxGeometry(cutW + 0.15, railH - 0.12, 0.03),
      mats.aptGlassRailC
    );
    glassPanelFront.position.set(terrCenterX, railY, outerTerrZ);
    group.add(glassPanelFront);

    const glassPanelSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, railH - 0.12, cutD + 0.12),
      mats.aptGlassRailC
    );
    glassPanelSide.position.set(outerTerrX, railY, terrCenterZ);
    group.add(glassPanelSide);

    // Sleek Bronze Planter Box with 3 irregular foliage clumps
    const planterW = 0.95;
    const planterH = 0.20;
    const planterD = 0.22;
    const planter = new THREE.Mesh(
      new THREE.BoxGeometry(planterW, planterH, planterD),
      mats.aptFrameC
    );
    planter.position.set(terrCenterX - 0.15, -h / 2 + slabH + planterH / 2 + 0.03, outerTerrZ - 0.18);
    setupMesh(planter);
    group.add(planter);

    const fol1 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.20, 0.18), mats.aptFoliage);
    fol1.position.set(terrCenterX - 0.42, -h / 2 + slabH + planterH + 0.07, outerTerrZ - 0.18);
    fol1.rotation.set(0.10, 0.20, -0.05);
    setupMesh(fol1);
    group.add(fol1);

    const fol2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.26, 0.20), mats.aptFoliage);
    fol2.position.set(terrCenterX - 0.15, -h / 2 + slabH + planterH + 0.09, outerTerrZ - 0.17);
    fol2.rotation.set(-0.05, -0.15, 0.06);
    setupMesh(fol2);
    group.add(fol2);

    const fol3 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.17), mats.aptFoliage);
    fol3.position.set(terrCenterX + 0.12, -h / 2 + slabH + planterH + 0.06, outerTerrZ - 0.19);
    fol3.rotation.set(0.08, 0.18, 0.02);
    setupMesh(fol3);
    group.add(fol3);

    // Left Facade: Two vertical recessed window bays
    const leftBay1 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.74,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassC,
      mats.aptFrameC
    );
    leftBay1.rotation.y = -Math.PI / 2;
    leftBay1.position.set(-w / 2 + 0.06, 0, 0.85);
    group.add(leftBay1);

    const leftBay2 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.74,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassC,
      mats.aptFrameC
    );
    leftBay2.rotation.y = -Math.PI / 2;
    leftBay2.position.set(-w / 2 + 0.06, 0, -0.85);
    group.add(leftBay2);

    // Right Facade (Rear section): Architectural window bay
    const rightBay = createArchitecturalWindowBay(
      1.15,
      wallH * 0.74,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassC,
      mats.aptFrameC
    );
    rightBay.rotation.y = Math.PI / 2;
    rightBay.position.set(w / 2 - 0.06, 0, -d / 2 + rearD / 2);
    group.add(rightBay);

    // Back Facade: Two architectural window bays + outdoor AC unit
    const backBay1 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.70,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassC,
      mats.aptFrameC
    );
    backBay1.rotation.y = Math.PI;
    backBay1.position.set(-0.85, 0.04, -d / 2 + 0.06);
    group.add(backBay1);

    const backBay2 = createArchitecturalWindowBay(
      1.15,
      wallH * 0.70,
      0.14,
      mats,
      false,
      false,
      mats.aptGlassC,
      mats.aptFrameC
    );
    backBay2.rotation.y = Math.PI;
    backBay2.position.set(0.75, 0.04, -d / 2 + 0.06);
    group.add(backBay2);

    const acC = createAcUnit(mats);
    acC.position.set(-w / 2 + 0.50, 0.20, -d / 2 - 0.16);
    group.add(acC);
  }

  return { group, dimensions };
}

/**
 * Creates an attractive stylized 3D architectural apartment floor module.
 */
export function createFloorModule(
  style: FloorModuleStyle,
  floorIndex: number
): { group: THREE.Group; dimensions: FloorDimensions } {
  // Parametric slight variation for visual diversity
  const widthVariance = ((floorIndex * 19) % 5 - 2) * 0.06;
  const depthVariance = ((floorIndex * 29) % 5 - 2) * 0.06;
  const heightVariance = ((floorIndex * 13) % 3 - 1) * 0.04;

  const w = GAME_CONFIG.BASE_WIDTH + widthVariance;
  const d = GAME_CONFIG.BASE_DEPTH + depthVariance;
  const h = GAME_CONFIG.BASE_HEIGHT + heightVariance;

  // Modern Apartment V1 Archetype
  if (style === 'MODERN_APARTMENT_V1') {
    return buildModernApartmentV1(floorIndex, w, d, h);
  }

  // Brick Apartment Archetype
  if (style === 'BRICK_APARTMENT') {
    return buildBrickApartment(floorIndex, w, d, h);
  }

  // Glass Office Archetype
  if (style === 'GLASS_OFFICE') {
    return buildGlassOffice(floorIndex, w, d, h);
  }

  // Concrete Cantilever Archetype
  if (style === 'CONCRETE_CANTILEVER') {
    return buildConcreteCantilever(floorIndex, w, d, h);
  }

  // Industrial Frame Archetype
  if (style === 'INDUSTRIAL_FRAME') {
    return buildIndustrialFrame(floorIndex, w, d, h);
  }

  // Sky Garden Archetype
  if (style === 'SKY_GARDEN') {
    return buildSkyGarden(floorIndex, w, d, h);
  }

  const mats = getArchMaterials();
  const group = new THREE.Group();
  group.name = `Floor_${floorIndex}_${style}`;

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
 * Creates the structural concrete starting pedestal.
 * 
 * Simple, clean monolithic silhouette:
 *         ┌─────────────┐
 *         │  TOP PLATE  │  (Dark structural steel landing platform, 1.00x footprint at Y = -3.70)
 *         ├─────────────┤
 *         │  PEDESTAL   │  (Solid concrete pedestal body, 1.00x footprint, height 1.75m)
 *         ├─────────────┤
 *         │CONCRETE BASE│  (Poured concrete footing collar anchored into tarmac at Y = -6.00, height 0.35m)
 *         └─────────────┘
 * 
 * Top of foundation is exactly at Y = -3.70 (FOUNDATION_HEIGHT 2.30m above ground Y = -6.00).
 * Visual height matches exactly one normal floor module (~2.3m).
 * Visual footprint exactly matches 1 normal floor (4.2m x 4.2m, 1.00 scale).
 * Zero residential props, zero pre-built tower floors, zero decorative boxes.
 */
export function createTowerFoundation(): { group: THREE.Group } {
  const mats = getArchMaterials();
  const group = new THREE.Group();
  group.name = 'TowerFoundation';

  const fw = GAME_CONFIG.BASE_WIDTH * GAME_CONFIG.FOUNDATION_FOOTPRINT_SCALE;
  const fd = GAME_CONFIG.BASE_DEPTH * GAME_CONFIG.FOUNDATION_FOOTPRINT_SCALE;
  const groundY = -6.0;
  const totalH = GAME_CONFIG.FOUNDATION_HEIGHT; // 2.30m
  const topY = groundY + totalH; // -3.70m

  // 1. CONCRETE BASE COLLAR: Heavy footing collar anchored into ground tarmac (Y: -6.00 to -5.65)
  const collarH = 0.35;
  const collarW = fw * 1.08;
  const collarD = fd * 1.08;
  const collarMesh = new THREE.Mesh(
    new THREE.BoxGeometry(collarW, collarH, collarD),
    mats.concreteDark
  );
  collarMesh.position.set(0, groundY + collarH / 2, 0);
  collarMesh.castShadow = true;
  collarMesh.receiveShadow = true;
  group.add(collarMesh);

  // 2. MAIN MONOLITHIC CONCRETE PEDESTAL: Solid pedestal body (Y: -5.65 to -3.90)
  const topPlateH = 0.20;
  const pedestalH = totalH - collarH - topPlateH; // 2.30 - 0.35 - 0.20 = 1.75m
  const pedestalMesh = new THREE.Mesh(
    new THREE.BoxGeometry(fw, pedestalH, fd),
    mats.concreteWarm
  );
  pedestalMesh.position.set(0, groundY + collarH + pedestalH / 2, 0);
  pedestalMesh.castShadow = true;
  pedestalMesh.receiveShadow = true;
  group.add(pedestalMesh);

  // 3. TOP STEEL LANDING PLATE: Heavy structural dark steel landing platform (Y: -3.90 to -3.70)
  // Perfectly matches the physical collider boundary (fw x fd) at top surface Y = -3.70
  const topPlateMesh = new THREE.Mesh(
    new THREE.BoxGeometry(fw, topPlateH, fd),
    mats.blackMetal
  );
  topPlateMesh.position.set(0, topY - topPlateH / 2, 0);
  topPlateMesh.castShadow = true;
  topPlateMesh.receiveShadow = true;
  group.add(topPlateMesh);

  // Recessed center landing bed (clear visual target for Floor 1 placement)
  const targetBedW = fw * 0.82;
  const targetBedD = fd * 0.82;
  const targetBedMesh = new THREE.Mesh(
    new THREE.BoxGeometry(targetBedW, 0.02, targetBedD),
    mats.concreteDark
  );
  targetBedMesh.position.set(0, topY + 0.005, 0);
  targetBedMesh.receiveShadow = true;
  group.add(targetBedMesh);

  // 4 corner heavy anchor shoes / shear keys on top plate
  const shoeSize = 0.36;
  const shoeOffsetX = fw / 2 - shoeSize / 2;
  const shoeOffsetZ = fd / 2 - shoeSize / 2;
  [
    [-shoeOffsetX, -shoeOffsetZ],
    [shoeOffsetX, -shoeOffsetZ],
    [-shoeOffsetX, shoeOffsetZ],
    [shoeOffsetX, shoeOffsetZ],
  ].forEach(([sx, sz]) => {
    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(shoeSize, 0.04, shoeSize),
      mats.blackMetal
    );
    shoe.position.set(sx, topY + 0.015, sz);
    shoe.castShadow = true;
    group.add(shoe);
  });

  return { group };
}

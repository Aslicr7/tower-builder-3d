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
    // Modern Apartment V1 Materials
    aptConcreteWarm: getMaterial('aptConcWarm', () => new THREE.MeshStandardMaterial({
      color: 0xf1efe9,
      map: concreteTex,
      roughness: 0.78,
      metalness: 0.04,
    })),
    aptConcreteSlab: getMaterial('aptConcSlab', () => new THREE.MeshStandardMaterial({
      color: 0xe8e4dc,
      map: concreteTex,
      roughness: 0.75,
      metalness: 0.04,
    })),
    aptConcreteAccent: getMaterial('aptConcAccent', () => new THREE.MeshStandardMaterial({
      color: 0xe2ded4,
      map: concreteTex,
      roughness: 0.80,
      metalness: 0.04,
    })),
    aptCharcoalFrame: getMaterial('aptCharcoal', () => new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.5,
    })),
    // Problem #3: Smoky blue-grey architectural glass (not black, responsive to lighting, subtle blue-grey tint)
    aptGlassSmoky: getMaterial('aptGlassSmoky', () => new THREE.MeshStandardMaterial({
      color: 0x5b7289,
      roughness: 0.14,
      metalness: 0.28,
      transparent: true,
      opacity: 0.78,
    })),
    aptGlassRailing: getMaterial('aptGlassRail', () => new THREE.MeshStandardMaterial({
      color: 0x688299,
      roughness: 0.12,
      metalness: 0.20,
      transparent: true,
      opacity: 0.60,
    })),
    // Problem #3: Dark interior backing (deep slate shadow, not pitch black)
    aptInteriorDark: getMaterial('aptIntDark', () => new THREE.MeshStandardMaterial({
      color: 0x1e2733,
      roughness: 0.85,
      metalness: 0.0,
    })),
    // Problem #3: Subtle warm interior backing (muted architectural lighting, NOT bright orange)
    aptInteriorWarm: getMaterial('aptIntWarm', () => new THREE.MeshStandardMaterial({
      color: 0x3d3224,
      emissive: 0xd97706,
      emissiveIntensity: 0.28,
      roughness: 0.80,
      metalness: 0.0,
    })),
    aptBalconyDeck: getMaterial('aptBalconyDeck', () => new THREE.MeshStandardMaterial({
      color: 0x5a5145,
      roughness: 0.72,
      metalness: 0.05,
    })),
    aptFoliage: getMaterial('aptFoliage', () => new THREE.MeshStandardMaterial({
      color: 0x365314,
      roughness: 0.88,
      metalness: 0.0,
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
 * Creates an architectural window bay with outer graphite frame,
 * recessed smoky glass pane, and dark/warm interior backing plane.
 */
function createArchitecturalWindowBay(
  width: number,
  height: number,
  frameDepth: number,
  mats: ReturnType<typeof getArchMaterials>,
  hasTransom: boolean = false,
  useWarmInterior: boolean = false
): THREE.Group {
  const g = new THREE.Group();
  const frameThick = 0.05;

  // Outer frame box (clean charcoal graphite)
  const frameGeo = new THREE.BoxGeometry(width, height, frameDepth);
  const frameMesh = new THREE.Mesh(frameGeo, mats.aptCharcoalFrame);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  g.add(frameMesh);

  // Recessed Smoky Glass Pane
  const glassW = Math.max(0.08, width - frameThick * 2);
  const glassH = Math.max(0.08, height - frameThick * 2);
  const glassGeo = new THREE.BoxGeometry(glassW, glassH, 0.02);
  const glassMesh = new THREE.Mesh(glassGeo, mats.aptGlassSmoky);
  glassMesh.position.z = frameDepth * 0.15;
  g.add(glassMesh);

  // Interior Backing Plane behind glass: Dark slate vs subtle warm twilight glow
  const backGeo = new THREE.PlaneGeometry(glassW, glassH);
  const backMat = useWarmInterior ? mats.aptInteriorWarm : mats.aptInteriorDark;
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.position.z = -frameDepth * 0.44;
  g.add(backMesh);

  if (hasTransom) {
    const transomGeo = new THREE.BoxGeometry(glassW, 0.04, 0.04);
    const transom = new THREE.Mesh(transomGeo, mats.aptCharcoalFrame);
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

  // 1. BASE AND CEILING SLABS FOR 100% FLUSH VERTICAL STACKING
  // Reduced thickness (0.11) and precast warm grey tone to eliminate repetitive white stripes
  const slabH = 0.11;
  const wallH = h - slabH * 2; // ~2.08

  const botSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.aptConcreteSlab);
  botSlab.position.y = -h / 2 + slabH / 2;
  setupMesh(botSlab);
  group.add(botSlab);

  const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.aptConcreteSlab);
  topSlab.position.y = h / 2 - slabH / 2;
  setupMesh(topSlab);
  group.add(topSlab);

  // Balcony parameters (0.88 outward projection, 1.72 width)
  const projDist = 0.88;
  const balcWidth = 1.72;
  const railH = 0.82;
  const railY = -h / 2 + slabH + railH / 2;

  // =========================================================================
  // VARIANT A: Front-Right Balcony Projection (Outward to +X)
  // =========================================================================
  if (variantIndex === 0) {
    // Enclosed main core volume
    const core = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.04, wallH, d - 0.04),
      mats.aptConcreteWarm
    );
    setupMesh(core);
    group.add(core);

    // Cantilevered Balcony Slab (Projects OUTWARD by 0.88 beyond right wall X = w/2)
    const balcCenterZ = 1.22;
    const balcCantilever = new THREE.Mesh(
      new THREE.BoxGeometry(projDist, slabH, balcWidth),
      mats.aptConcreteSlab
    );
    balcCantilever.position.set(w / 2 + projDist / 2, -h / 2 + slabH / 2, balcCenterZ);
    setupMesh(balcCantilever);
    group.add(balcCantilever);

    // Teak Wood Balcony Deck
    const balcDeck = new THREE.Mesh(
      new THREE.BoxGeometry(projDist - 0.04, 0.04, balcWidth - 0.04),
      mats.aptBalconyDeck
    );
    balcDeck.position.set(w / 2 + projDist / 2, -h / 2 + slabH + 0.02, balcCenterZ);
    setupMesh(balcDeck);
    group.add(balcDeck);

    // Sliding Glass Door connecting interior to projecting balcony (at X = w/2)
    const door = createArchitecturalWindowBay(balcWidth - 0.08, wallH * 0.90, 0.14, mats, false, false);
    door.rotation.y = Math.PI / 2;
    door.position.set(w / 2 - 0.05, 0, balcCenterZ);
    group.add(door);

    // Sturdy dark graphite posts
    const postGeo = new THREE.BoxGeometry(0.08, railH, 0.08);
    const p1 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p1.position.set(w / 2 + projDist - 0.04, railY, balcCenterZ + balcWidth / 2 - 0.04);
    setupMesh(p1);
    group.add(p1);

    const p2 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p2.position.set(w / 2 + projDist - 0.04, railY, balcCenterZ - balcWidth / 2 + 0.04);
    setupMesh(p2);
    group.add(p2);

    const p3 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p3.position.set(w / 2, railY, balcCenterZ + balcWidth / 2 - 0.04);
    setupMesh(p3);
    group.add(p3);

    const p4 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p4.position.set(w / 2, railY, balcCenterZ - balcWidth / 2 + 0.04);
    setupMesh(p4);
    group.add(p4);

    // Top handrails (charcoal)
    const outerRailX = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, balcWidth), mats.aptCharcoalFrame);
    outerRailX.position.set(w / 2 + projDist - 0.04, railY + railH / 2, balcCenterZ);
    setupMesh(outerRailX);
    group.add(outerRailX);

    const outerRailZ1 = new THREE.Mesh(new THREE.BoxGeometry(projDist, 0.05, 0.08), mats.aptCharcoalFrame);
    outerRailZ1.position.set(w / 2 + projDist / 2, railY + railH / 2, balcCenterZ + balcWidth / 2 - 0.04);
    setupMesh(outerRailZ1);
    group.add(outerRailZ1);

    const outerRailZ2 = new THREE.Mesh(new THREE.BoxGeometry(projDist, 0.05, 0.08), mats.aptCharcoalFrame);
    outerRailZ2.position.set(w / 2 + projDist / 2, railY + railH / 2, balcCenterZ - balcWidth / 2 + 0.04);
    setupMesh(outerRailZ2);
    group.add(outerRailZ2);

    // Smoky glass railing panels
    const glassRailSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, railH - 0.12, balcWidth - 0.12),
      mats.aptGlassRailing
    );
    glassRailSide.position.set(w / 2 + projDist - 0.04, railY, balcCenterZ);
    group.add(glassRailSide);

    const glassRailFront = new THREE.Mesh(
      new THREE.BoxGeometry(projDist - 0.12, railH - 0.12, 0.03),
      mats.aptGlassRailing
    );
    glassRailFront.position.set(w / 2 + projDist / 2, railY, balcCenterZ + balcWidth / 2 - 0.04);
    group.add(glassRailFront);

    // PRIMARY SIGNATURE: The Charcoal Vertical Frame at X = +0.42
    const frameA = new THREE.Mesh(new THREE.BoxGeometry(0.16, wallH, 0.22), mats.aptCharcoalFrame);
    frameA.position.set(0.42, 0, d / 2 - 0.09);
    setupMesh(frameA);
    group.add(frameA);

    // Front Facade: Living room picture window (left of charcoal frame)
    const mainGlazeA = createArchitecturalWindowBay(1.08, wallH * 0.88, 0.16, mats, true, false);
    mainGlazeA.position.set(-0.20, 0, d / 2 - 0.06);
    group.add(mainGlazeA);

    // Front Facade: Solid wall with slit window on the far left
    const slitWindowA = createArchitecturalWindowBay(0.32, wallH * 0.70, 0.14, mats, false, false);
    slitWindowA.position.set(-w / 2 + 0.60, 0.02, d / 2 - 0.06);
    group.add(slitWindowA);

    // Right Facade: Solid rear wall with corner window bay
    const cornerBayA = createArchitecturalWindowBay(0.85, wallH * 0.80, 0.14, mats, false, false);
    cornerBayA.rotation.y = Math.PI / 2;
    cornerBayA.position.set(w / 2 - 0.06, 0.02, -0.65);
    group.add(cornerBayA);

    // Left Facade: Two vertical recessed window bays
    const leftBay1 = createArchitecturalWindowBay(0.55, wallH * 0.68, 0.14, mats, false, false);
    leftBay1.rotation.y = -Math.PI / 2;
    leftBay1.position.set(-w / 2 + 0.06, 0.04, -0.75);
    group.add(leftBay1);

    const leftBay2 = createArchitecturalWindowBay(0.55, wallH * 0.68, 0.14, mats, false, false);
    leftBay2.rotation.y = -Math.PI / 2;
    leftBay2.position.set(-w / 2 + 0.06, 0.04, 0.75);
    group.add(leftBay2);

    // Back Facade: Two large window bays + outdoor AC unit
    const backBay1 = createArchitecturalWindowBay(1.15, wallH * 0.70, 0.14, mats, false, false);
    backBay1.rotation.y = Math.PI;
    backBay1.position.set(-0.85, 0.04, -d / 2 + 0.06);
    group.add(backBay1);

    const backBay2 = createArchitecturalWindowBay(1.15, wallH * 0.70, 0.14, mats, false, false);
    backBay2.rotation.y = Math.PI;
    backBay2.position.set(0.75, 0.04, -d / 2 + 0.06);
    group.add(backBay2);

    const acA = createAcUnit(mats);
    acA.position.set(-w / 2 + 0.50, 0.20, -d / 2 - 0.16);
    group.add(acA);
  }

  // =========================================================================
  // VARIANT B: Mirrored Front-Left Balcony Projection (Outward to -X)
  // Subtle Warm Twilight Interior Backing
  // =========================================================================
  else if (variantIndex === 1) {
    const core = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.04, wallH, d - 0.04),
      mats.aptConcreteWarm
    );
    setupMesh(core);
    group.add(core);

    // Cantilevered Balcony Slab (Projects OUTWARD by 0.88 beyond left wall X = -w/2)
    const balcCenterZ = 1.22;
    const balcCantilever = new THREE.Mesh(
      new THREE.BoxGeometry(projDist, slabH, balcWidth),
      mats.aptConcreteSlab
    );
    balcCantilever.position.set(-w / 2 - projDist / 2, -h / 2 + slabH / 2, balcCenterZ);
    setupMesh(balcCantilever);
    group.add(balcCantilever);

    // Teak Wood Balcony Deck
    const balcDeck = new THREE.Mesh(
      new THREE.BoxGeometry(projDist - 0.04, 0.04, balcWidth - 0.04),
      mats.aptBalconyDeck
    );
    balcDeck.position.set(-w / 2 - projDist / 2, -h / 2 + slabH + 0.02, balcCenterZ);
    setupMesh(balcDeck);
    group.add(balcDeck);

    // Sliding Glass Door connecting interior to left projecting balcony (at X = -w/2)
    const door = createArchitecturalWindowBay(balcWidth - 0.08, wallH * 0.90, 0.14, mats, false, true);
    door.rotation.y = -Math.PI / 2;
    door.position.set(-w / 2 + 0.05, 0, balcCenterZ);
    group.add(door);

    // Sturdy dark graphite posts
    const postGeo = new THREE.BoxGeometry(0.08, railH, 0.08);
    const p1 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p1.position.set(-w / 2 - projDist + 0.04, railY, balcCenterZ + balcWidth / 2 - 0.04);
    setupMesh(p1);
    group.add(p1);

    const p2 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p2.position.set(-w / 2 - projDist + 0.04, railY, balcCenterZ - balcWidth / 2 + 0.04);
    setupMesh(p2);
    group.add(p2);

    const p3 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p3.position.set(-w / 2, railY, balcCenterZ + balcWidth / 2 - 0.04);
    setupMesh(p3);
    group.add(p3);

    const p4 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p4.position.set(-w / 2, railY, balcCenterZ - balcWidth / 2 + 0.04);
    setupMesh(p4);
    group.add(p4);

    // Top handrails (charcoal)
    const outerRailX = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, balcWidth), mats.aptCharcoalFrame);
    outerRailX.position.set(-w / 2 - projDist + 0.04, railY + railH / 2, balcCenterZ);
    setupMesh(outerRailX);
    group.add(outerRailX);

    const outerRailZ1 = new THREE.Mesh(new THREE.BoxGeometry(projDist, 0.05, 0.08), mats.aptCharcoalFrame);
    outerRailZ1.position.set(-w / 2 - projDist / 2, railY + railH / 2, balcCenterZ + balcWidth / 2 - 0.04);
    setupMesh(outerRailZ1);
    group.add(outerRailZ1);

    const outerRailZ2 = new THREE.Mesh(new THREE.BoxGeometry(projDist, 0.05, 0.08), mats.aptCharcoalFrame);
    outerRailZ2.position.set(-w / 2 - projDist / 2, railY + railH / 2, balcCenterZ - balcWidth / 2 + 0.04);
    setupMesh(outerRailZ2);
    group.add(outerRailZ2);

    // Smoky glass railing panels
    const glassRailSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, railH - 0.12, balcWidth - 0.12),
      mats.aptGlassRailing
    );
    glassRailSide.position.set(-w / 2 - projDist + 0.04, railY, balcCenterZ);
    group.add(glassRailSide);

    const glassRailFront = new THREE.Mesh(
      new THREE.BoxGeometry(projDist - 0.12, railH - 0.12, 0.03),
      mats.aptGlassRailing
    );
    glassRailFront.position.set(-w / 2 - projDist / 2, railY, balcCenterZ + balcWidth / 2 - 0.04);
    group.add(glassRailFront);

    // PRIMARY SIGNATURE: The Charcoal Vertical Frame at X = -0.42 (Mirrored!)
    const frameB = new THREE.Mesh(new THREE.BoxGeometry(0.16, wallH, 0.22), mats.aptCharcoalFrame);
    frameB.position.set(-0.42, 0, d / 2 - 0.09);
    setupMesh(frameB);
    group.add(frameB);

    // Front Facade: Living room picture window (right of charcoal frame, subtle warm twilight glow)
    const mainGlazeB = createArchitecturalWindowBay(1.08, wallH * 0.88, 0.16, mats, true, true);
    mainGlazeB.position.set(0.20, 0, d / 2 - 0.06);
    group.add(mainGlazeB);

    // Front Facade: Solid wall with slit window on the far right
    const slitWindowB = createArchitecturalWindowBay(0.32, wallH * 0.70, 0.14, mats, false, false);
    slitWindowB.position.set(w / 2 - 0.60, 0.02, d / 2 - 0.06);
    group.add(slitWindowB);

    // Left Facade: Solid rear wall with corner window bay
    const cornerBayB = createArchitecturalWindowBay(0.85, wallH * 0.80, 0.14, mats, false, false);
    cornerBayB.rotation.y = -Math.PI / 2;
    cornerBayB.position.set(-w / 2 + 0.06, 0.02, -0.65);
    group.add(cornerBayB);

    // Right Facade: Two vertical recessed window bays
    const rightBay1 = createArchitecturalWindowBay(0.55, wallH * 0.68, 0.14, mats, false, false);
    rightBay1.rotation.y = Math.PI / 2;
    rightBay1.position.set(w / 2 - 0.06, 0.04, -0.75);
    group.add(rightBay1);

    const rightBay2 = createArchitecturalWindowBay(0.55, wallH * 0.68, 0.14, mats, false, false);
    rightBay2.rotation.y = Math.PI / 2;
    rightBay2.position.set(w / 2 - 0.06, 0.04, 0.75);
    group.add(rightBay2);

    // Back Facade: Two large window bays + outdoor AC unit on opposite side
    const backBay1 = createArchitecturalWindowBay(1.15, wallH * 0.70, 0.14, mats, false, false);
    backBay1.rotation.y = Math.PI;
    backBay1.position.set(-0.75, 0.04, -d / 2 + 0.06);
    group.add(backBay1);

    const backBay2 = createArchitecturalWindowBay(1.15, wallH * 0.70, 0.14, mats, false, false);
    backBay2.rotation.y = Math.PI;
    backBay2.position.set(0.85, 0.04, -d / 2 + 0.06);
    group.add(backBay2);

    const acB = createAcUnit(mats);
    acB.position.set(w / 2 - 0.50, 0.20, -d / 2 - 0.16);
    group.add(acB);
  }

  // =========================================================================
  // VARIANT C: Forward-Projecting Balcony Terrace + Planter (Outward to +Z)
  // Wide Panoramic Glazing + Subtle Warm Interior Glow
  // =========================================================================
  else {
    const core = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.04, wallH, d - 0.04),
      mats.aptConcreteWarm
    );
    setupMesh(core);
    group.add(core);

    // Cantilevered Balcony Slab (Projects FORWARD by 0.88 beyond front wall Z = d/2)
    const balcCenterX = 1.20;
    const balcCantilever = new THREE.Mesh(
      new THREE.BoxGeometry(balcWidth, slabH, projDist),
      mats.aptConcreteSlab
    );
    balcCantilever.position.set(balcCenterX, -h / 2 + slabH / 2, d / 2 + projDist / 2);
    setupMesh(balcCantilever);
    group.add(balcCantilever);

    // Teak Wood Balcony Deck
    const balcDeck = new THREE.Mesh(
      new THREE.BoxGeometry(balcWidth - 0.04, 0.04, projDist - 0.04),
      mats.aptBalconyDeck
    );
    balcDeck.position.set(balcCenterX, -h / 2 + slabH + 0.02, d / 2 + projDist / 2);
    setupMesh(balcDeck);
    group.add(balcDeck);

    // Sliding Glass Door along front building wall (Z = d/2)
    const door = createArchitecturalWindowBay(balcWidth - 0.08, wallH * 0.90, 0.14, mats, false, true);
    door.position.set(balcCenterX, 0, d / 2 - 0.05);
    group.add(door);

    // Balcony Posts
    const postGeo = new THREE.BoxGeometry(0.08, railH, 0.08);
    const p1 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p1.position.set(balcCenterX + balcWidth / 2 - 0.04, railY, d / 2 + projDist - 0.04);
    setupMesh(p1);
    group.add(p1);

    const p2 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p2.position.set(balcCenterX - balcWidth / 2 + 0.04, railY, d / 2 + projDist - 0.04);
    setupMesh(p2);
    group.add(p2);

    const p3 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p3.position.set(balcCenterX + balcWidth / 2 - 0.04, railY, d / 2);
    setupMesh(p3);
    group.add(p3);

    const p4 = new THREE.Mesh(postGeo, mats.aptCharcoalFrame);
    p4.position.set(balcCenterX - balcWidth / 2 + 0.04, railY, d / 2);
    setupMesh(p4);
    group.add(p4);

    // Top Handrails (charcoal)
    const frontRailZ = new THREE.Mesh(new THREE.BoxGeometry(balcWidth, 0.05, 0.08), mats.aptCharcoalFrame);
    frontRailZ.position.set(balcCenterX, railY + railH / 2, d / 2 + projDist - 0.04);
    setupMesh(frontRailZ);
    group.add(frontRailZ);

    const sideRailX1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, projDist), mats.aptCharcoalFrame);
    sideRailX1.position.set(balcCenterX + balcWidth / 2 - 0.04, railY + railH / 2, d / 2 + projDist / 2);
    setupMesh(sideRailX1);
    group.add(sideRailX1);

    const sideRailX2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, projDist), mats.aptCharcoalFrame);
    sideRailX2.position.set(balcCenterX - balcWidth / 2 + 0.04, railY + railH / 2, d / 2 + projDist / 2);
    setupMesh(sideRailX2);
    group.add(sideRailX2);

    // Smoky Glass Railing Panels
    const glassFront = new THREE.Mesh(
      new THREE.BoxGeometry(balcWidth - 0.12, railH - 0.12, 0.03),
      mats.aptGlassRailing
    );
    glassFront.position.set(balcCenterX, railY, d / 2 + projDist - 0.04);
    group.add(glassFront);

    const glassSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, railH - 0.12, projDist - 0.12),
      mats.aptGlassRailing
    );
    glassSide.position.set(balcCenterX + balcWidth / 2 - 0.04, railY, d / 2 + projDist / 2);
    group.add(glassSide);

    // Balcony Planter (Section 10: 1 sleek planter with 3 irregular foliage clumps)
    const planterW = 1.12;
    const planterH = 0.20;
    const planterD = 0.22;
    const planter = new THREE.Mesh(
      new THREE.BoxGeometry(planterW, planterH, planterD),
      mats.aptCharcoalFrame
    );
    planter.position.set(balcCenterX, -h / 2 + slabH + planterH / 2 + 0.03, d / 2 + projDist - 0.20);
    setupMesh(planter);
    group.add(planter);

    // 3 irregular stylized foliage clumps
    const fol1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.20), mats.aptFoliage);
    fol1.position.set(balcCenterX - 0.32, -h / 2 + slabH + planterH + 0.08, d / 2 + projDist - 0.20);
    fol1.rotation.set(0.12, 0.25, -0.06);
    setupMesh(fol1);
    group.add(fol1);

    const fol2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.22), mats.aptFoliage);
    fol2.position.set(balcCenterX, -h / 2 + slabH + planterH + 0.10, d / 2 + projDist - 0.19);
    fol2.rotation.set(-0.06, -0.18, 0.07);
    setupMesh(fol2);
    group.add(fol2);

    const fol3 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.19, 0.18), mats.aptFoliage);
    fol3.position.set(balcCenterX + 0.30, -h / 2 + slabH + planterH + 0.07, d / 2 + projDist - 0.21);
    fol3.rotation.set(0.10, 0.20, 0.02);
    setupMesh(fol3);
    group.add(fol3);

    // PRIMARY SIGNATURE: The Charcoal Vertical Frame at X = +0.28 (Breaks alignment with A and B!)
    const frameC = new THREE.Mesh(new THREE.BoxGeometry(0.16, wallH, 0.22), mats.aptCharcoalFrame);
    frameC.position.set(0.28, 0, d / 2 - 0.09);
    setupMesh(frameC);
    group.add(frameC);

    // Front Facade: Wide panoramic living room glazing bay (with subtle warm interior glow)
    const panoGlazeC = createArchitecturalWindowBay(1.82, wallH * 0.86, 0.16, mats, true, true);
    panoGlazeC.position.set(-0.82, 0, d / 2 - 0.06);
    group.add(panoGlazeC);

    // Right Facade: Corner wrap glazing bay + shadow reveal line
    const cornerBayC = createArchitecturalWindowBay(0.95, wallH * 0.84, 0.14, mats, false, false);
    cornerBayC.rotation.y = Math.PI / 2;
    cornerBayC.position.set(w / 2 - 0.06, 0.02, 0.35);
    group.add(cornerBayC);

    const revealC = new THREE.Mesh(new THREE.BoxGeometry(0.04, wallH * 0.95, 0.04), mats.aptCharcoalFrame);
    revealC.position.set(w / 2 + 0.01, 0, -0.65);
    setupMesh(revealC);
    group.add(revealC);

    // Left Facade: Two vertical recessed window bays
    const leftBay1 = createArchitecturalWindowBay(0.55, wallH * 0.68, 0.14, mats, false, false);
    leftBay1.rotation.y = -Math.PI / 2;
    leftBay1.position.set(-w / 2 + 0.06, 0.04, -0.75);
    group.add(leftBay1);

    const leftBay2 = createArchitecturalWindowBay(0.55, wallH * 0.68, 0.14, mats, false, false);
    leftBay2.rotation.y = -Math.PI / 2;
    leftBay2.position.set(-w / 2 + 0.06, 0.04, 0.75);
    group.add(leftBay2);

    // Back Facade: Two architectural window bays + outdoor AC unit
    const backBay1 = createArchitecturalWindowBay(1.15, wallH * 0.70, 0.14, mats, false, false);
    backBay1.rotation.y = Math.PI;
    backBay1.position.set(-0.85, 0.04, -d / 2 + 0.06);
    group.add(backBay1);

    const backBay2 = createArchitecturalWindowBay(1.15, wallH * 0.70, 0.14, mats, false, false);
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

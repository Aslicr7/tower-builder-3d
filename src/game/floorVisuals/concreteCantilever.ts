/**
 * Concrete Cantilever Floor Visual Archetype
 *
 * Archetype #4: CONCRETE CANTILEVER
 * Visual identity:
 * - Heavy brutalist architectural concrete (#9A9B96, #B0AEA5, #777A77)
 * - Large readable offset masses with bold cantilevers
 * - Dramatic negative spaces (terrace cuts, open voids, deep slots)
 * - Deep shadow recesses (#3F4445) and dark architectural metal accents (#33383A)
 * - Secondary muted architectural glass (#647A80)
 * - Exactly 3 curated variants:
 *   - Concrete A: Side Cantilever (Heavy anchor mass + bold projecting side cantilever & horizontal slot)
 *   - Concrete B: Terrace Void (Large open corner terrace void framed by thick concrete walls & roof canopy)
 *   - Concrete C: Split Block (Two interlocking offset concrete masses with central dark shadow core)
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
 * Procedural Concrete Mottle Texture:
 * Clean brutalist architectural concrete with subtle mottling and formwork grain.
 * No high-frequency noise, cracks, or dirt.
 */
function createConcreteMottleCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base warm-neutral concrete tone
  ctx.fillStyle = '#9A9B96';
  ctx.fillRect(0, 0, 256, 256);

  // Soft architectural tone variation
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(176, 174, 165, 0.12)');
  grad.addColorStop(0.5, 'rgba(119, 122, 119, 0.08)');
  grad.addColorStop(1, 'rgba(100, 105, 103, 0.14)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Broad formwork panels (two large 128px horizontal bands)
  ctx.fillStyle = 'rgba(63, 68, 69, 0.06)';
  ctx.fillRect(0, 126, 256, 3);
  ctx.fillStyle = 'rgba(215, 215, 210, 0.08)';
  ctx.fillRect(0, 129, 256, 2);

  // Broad subtle mottling patches (macro scale for mobile clarity)
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 8 + Math.random() * 24;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(176, 174, 165, 0.10)' : 'rgba(119, 122, 119, 0.12)';
    ctx.fill();
  }

  return canvas;
}

/**
 * Procedural Recessed Shadow / Core Texture:
 * Deep graphite-charcoal with vertical reveal grooves.
 */
function createRecessShadowCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3F4445';
  ctx.fillRect(0, 0, 128, 128);

  // Subtle architectural vertical reveal lines
  ctx.fillStyle = '#2C3031';
  for (let x = 16; x < 128; x += 32) {
    ctx.fillRect(x, 0, 2, 128);
  }

  return canvas;
}

function getConcreteCantileverMaterials() {
  const concreteTex = getTex('cc_mottle_tex', createConcreteMottleCanvas);
  concreteTex.repeat.set(1.5, 1.5);

  const shadowTex = getTex('cc_shadow_tex', createRecessShadowCanvas);

  return {
    // Main Brutalist Architectural Concrete (#9A9B96)
    mainConcrete: getMat('cc_mat_main', () => new THREE.MeshStandardMaterial({
      color: 0x9A9B96,
      map: concreteTex,
      roughness: 0.82,
      metalness: 0.04,
    })),
    // Light Concrete for Cantilever Overhangs & Slabs (#B0AEA5)
    lightConcrete: getMat('cc_mat_light', () => new THREE.MeshStandardMaterial({
      color: 0xB0AEA5,
      map: concreteTex,
      roughness: 0.78,
      metalness: 0.04,
    })),
    // Darker Weathered / Base Concrete (#777A77)
    darkConcrete: getMat('cc_mat_dark', () => new THREE.MeshStandardMaterial({
      color: 0x777A77,
      map: concreteTex,
      roughness: 0.85,
      metalness: 0.05,
    })),
    // Deep Shadow Recess / Soffit (#3F4445)
    recessShadow: getMat('cc_mat_shadow', () => new THREE.MeshStandardMaterial({
      color: 0x3F4445,
      map: shadowTex,
      roughness: 0.90,
      metalness: 0.02,
    })),
    // Dark Architectural Metal Trim & Reveals (#33383A)
    accentMetal: getMat('cc_mat_metal', () => new THREE.MeshStandardMaterial({
      color: 0x33383A,
      roughness: 0.45,
      metalness: 0.35,
    })),
    // Muted Architectural Slot Glass (#647A80)
    slotGlass: getMat('cc_mat_glass', () => new THREE.MeshStandardMaterial({
      color: 0x647A80,
      roughness: 0.25,
      metalness: 0.08,
      emissive: 0x142024,
      emissiveIntensity: 0.14, // Subtle readability in shadow pockets
    })),
  };
}

// ============================================================================
// MAIN BUILD FUNCTION
// ============================================================================

export function buildConcreteCantilever(
  floorIndex: number,
  w: number,
  d: number,
  h: number
): { group: THREE.Group; dimensions: FloorDimensions } {
  const mats = getConcreteCantileverMaterials();
  const group = new THREE.Group();

  const variantIndex = Math.abs(floorIndex) % 3; // 0 = A, 1 = B, 2 = C
  const variantLetter = ['A', 'B', 'C'][variantIndex];
  group.name = `Floor_${floorIndex}_CONCRETE_CANTILEVER_${variantLetter}`;

  const dimensions: FloorDimensions = { width: w, depth: d, height: h };

  const setupMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  // Structural vertical parameters
  const slabH = 0.12;
  const bodyH = h - slabH * 2;
  const bottomSlabY = -h / 2 + slabH / 2;
  const topSlabY = h / 2 - slabH / 2;

  // =========================================================================
  // CONTINUOUS CONCRETE FLOOR & CEILING SLABS
  // Light concrete edges (#B0AEA5) that anchor the module and tie the tower
  // =========================================================================
  const botSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.lightConcrete);
  botSlab.position.y = bottomSlabY;
  setupMesh(botSlab);
  group.add(botSlab);

  const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.lightConcrete);
  topSlab.position.y = topSlabY;
  setupMesh(topSlab);
  group.add(topSlab);

  // =========================================================================
  // VARIANT A: SIDE CANTILEVER
  // Silhouette:
  // - Monolithic heavy concrete anchor mass on the left
  // - Large bold cantilever volume projecting +0.65m past the right edge
  // - Open undercut void beneath the cantilever
  // - Deep horizontal architectural slot in the anchor facade
  // =========================================================================
  if (variantIndex === 0) {
    // 1. Heavy Anchor Mass (Left / Center)
    const anchorW = 2.60;
    const anchorD = d - 0.30; // 3.90m
    const anchorCenterX = -w / 2 + anchorW / 2 + 0.15; // Centered around -0.65
    const anchorCenterZ = 0.05;

    const anchorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(anchorW, bodyH, anchorD),
      mats.mainConcrete
    );
    anchorMesh.position.set(anchorCenterX, 0, anchorCenterZ);
    setupMesh(anchorMesh);
    group.add(anchorMesh);

    // 2. Large Side Cantilever Volume (Upper-Right Mass)
    // Projects noticeably past the footprint (right edge reaches X = +2.65m)
    const cantiW = 2.25;
    const cantiD = 3.40;
    const cantiH = bodyH * 0.58; // Sits in the upper zone
    const cantiCenterX = w / 2 - cantiW / 2 + 0.55; // Projects out to the right
    const cantiCenterY = bodyH / 2 - cantiH / 2;
    const cantiCenterZ = 0.0;

    const cantiMesh = new THREE.Mesh(
      new THREE.BoxGeometry(cantiW, cantiH, cantiD),
      mats.lightConcrete
    );
    cantiMesh.position.set(cantiCenterX, cantiCenterY, cantiCenterZ);
    setupMesh(cantiMesh);
    group.add(cantiMesh);

    // Cantilever Underside Soffit (Deep shadow plane beneath the overhang)
    const soffitThick = 0.06;
    const soffitMesh = new THREE.Mesh(
      new THREE.BoxGeometry(cantiW + 0.02, soffitThick, cantiD + 0.02),
      mats.recessShadow
    );
    soffitMesh.position.set(cantiCenterX, cantiCenterY - cantiH / 2 - soffitThick / 2, cantiCenterZ);
    setupMesh(soffitMesh);
    group.add(soffitMesh);

    // 3. Undercut Void Core (Set deep back on the lower right)
    // Left open below the cantilever; small dark recessed core wall creates negative space
    const underW = 1.20;
    const underH = bodyH - cantiH - soffitThick;
    const underD = 2.20;
    const underCenterX = anchorCenterX + anchorW / 2 + underW / 2 - 0.10;
    const underCenterY = -bodyH / 2 + underH / 2;
    const underCenterZ = -0.45; // Pushed deep to the rear

    const underCore = new THREE.Mesh(
      new THREE.BoxGeometry(underW, underH, underD),
      mats.darkConcrete
    );
    underCore.position.set(underCenterX, underCenterY, underCenterZ);
    setupMesh(underCore);
    group.add(underCore);

    // 4. Signature Feature: Deep Horizontal Architectural Slot
    // Cut cleanly across the front face of the heavy anchor mass
    const slotW = anchorW - 0.50; // 2.10m
    const slotH = 0.32;
    const slotFrontZ = anchorCenterZ + anchorD / 2 + 0.01;
    const slotCenterY = 0.05;

    // Dark shadow backing of the slot
    const slotBacking = new THREE.Mesh(
      new THREE.BoxGeometry(slotW, slotH, 0.08),
      mats.recessShadow
    );
    slotBacking.position.set(anchorCenterX, slotCenterY, slotFrontZ - 0.04);
    setupMesh(slotBacking);
    group.add(slotBacking);

    // Smoky recessed glass strip inside the slot
    const slotGlassStrip = new THREE.Mesh(
      new THREE.BoxGeometry(slotW - 0.06, slotH - 0.06, 0.04),
      mats.slotGlass
    );
    slotGlassStrip.position.set(anchorCenterX, slotCenterY, slotFrontZ - 0.01);
    setupMesh(slotGlassStrip);
    group.add(slotGlassStrip);

    // Dark architectural metal lintel trim above the slot
    const lintelH = 0.08;
    const lintelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(slotW + 0.10, lintelH, 0.10),
      mats.accentMetal
    );
    lintelMesh.position.set(anchorCenterX, slotCenterY + slotH / 2 + lintelH / 2, slotFrontZ);
    setupMesh(lintelMesh);
    group.add(lintelMesh);

    // Dark architectural metal sill trim below the slot
    const sillMesh = new THREE.Mesh(
      new THREE.BoxGeometry(slotW + 0.10, lintelH, 0.10),
      mats.accentMetal
    );
    sillMesh.position.set(anchorCenterX, slotCenterY - slotH / 2 - lintelH / 2, slotFrontZ);
    setupMesh(sillMesh);
    group.add(sillMesh);

    // 5. Vertical Concrete Buttress Fin on left flank
    const finThick = 0.22;
    const finW = 0.28;
    const finMesh = new THREE.Mesh(
      new THREE.BoxGeometry(finW, bodyH, finThick),
      mats.darkConcrete
    );
    finMesh.position.set(-w / 2 + finW / 2 + 0.10, 0, anchorCenterZ + anchorD / 2 + 0.05);
    setupMesh(finMesh);
    group.add(finMesh);
  }

  // =========================================================================
  // VARIANT B: TERRACE VOID (MISSING CORNER / LARGE NEGATIVE SPACE)
  // Silhouette:
  // - Massive L-shaped brutalist concrete spine (left wall + rear wall)
  // - Large open corner terrace void (approx 2.1m x 2.1m x full height)
  // - Heavy projecting roof canopy cantilevering over the terrace void
  // - Deep shadow backing walls and recessed slot glass inside the void
  // =========================================================================
  else if (variantIndex === 1) {
    // 1. Left Concrete Flank Mass
    const leftWallW = 1.95;
    const leftWallD = d - 0.25; // 3.95m
    const leftWallCenterX = -w / 2 + leftWallW / 2 + 0.08;
    const leftWallCenterZ = 0.0;

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(leftWallW, bodyH, leftWallD),
      mats.mainConcrete
    );
    leftWall.position.set(leftWallCenterX, 0, leftWallCenterZ);
    setupMesh(leftWall);
    group.add(leftWall);

    // 2. Rear Concrete Spine Mass (anchoring the back of the terrace)
    const rearWallW = w - leftWallW - 0.10; // ~2.15m
    const rearWallD = 1.65;
    const rearWallCenterX = w / 2 - rearWallW / 2;
    const rearWallCenterZ = -d / 2 + rearWallD / 2 + 0.10; // Sits at the back

    const rearWall = new THREE.Mesh(
      new THREE.BoxGeometry(rearWallW, bodyH, rearWallD),
      mats.mainConcrete
    );
    rearWall.position.set(rearWallCenterX, 0, rearWallCenterZ);
    setupMesh(rearWall);
    group.add(rearWall);

    // 3. Heavy Cantilevering Roof Canopy (Extends over the terrace void!)
    // Bold, phone-readable concrete cantilever spanning the entire missing corner
    const canopyW = rearWallW + 0.40;
    const canopyD = 2.40;
    const canopyH = 0.28;
    const canopyCenterX = rearWallCenterX + 0.10;
    const canopyCenterY = bodyH / 2 - canopyH / 2;
    const canopyCenterZ = d / 2 - canopyD / 2 + 0.15; // Cantilevers forward!

    const roofCanopy = new THREE.Mesh(
      new THREE.BoxGeometry(canopyW, canopyH, canopyD),
      mats.lightConcrete
    );
    roofCanopy.position.set(canopyCenterX, canopyCenterY, canopyCenterZ);
    setupMesh(roofCanopy);
    group.add(roofCanopy);

    // Canopy Underside Soffit (Deep shadow)
    const canopySoffit = new THREE.Mesh(
      new THREE.BoxGeometry(canopyW, 0.04, canopyD),
      mats.recessShadow
    );
    canopySoffit.position.set(canopyCenterX, canopyCenterY - canopyH / 2 - 0.02, canopyCenterZ);
    setupMesh(canopySoffit);
    group.add(canopySoffit);

    // 4. The Large Open Negative Space (Front-Right Corner Void)
    // Terrace floor deck sitting inside the missing corner
    const deckW = rearWallW - 0.10;
    const deckD = d - rearWallD - 0.35; // ~2.20m
    const deckH = 0.08;
    const deckCenterX = rearWallCenterX;
    const deckCenterY = -bodyH / 2 + deckH / 2;
    const deckCenterZ = canopyCenterZ - 0.10;

    const terraceDeck = new THREE.Mesh(
      new THREE.BoxGeometry(deckW, deckH, deckD),
      mats.darkConcrete
    );
    terraceDeck.position.set(deckCenterX, deckCenterY, deckCenterZ);
    setupMesh(terraceDeck);
    group.add(terraceDeck);

    // 5. Interior Recessed Glass Wall (Set deep inside the terrace corner)
    // Sits on the inner face of the left concrete mass
    const glassW = 0.08;
    const glassH = bodyH - canopyH - deckH - 0.10;
    const glassD = 1.90;
    const glassCenterX = leftWallCenterX + leftWallW / 2 + glassW / 2;
    const glassCenterY = 0;
    const glassCenterZ = deckCenterZ - 0.15;

    const interiorGlass = new THREE.Mesh(
      new THREE.BoxGeometry(glassW, glassH, glassD),
      mats.slotGlass
    );
    interiorGlass.position.set(glassCenterX, glassCenterY, glassCenterZ);
    setupMesh(interiorGlass);
    group.add(interiorGlass);

    // Deep Shadow Wall backing behind inner opening
    const shadowBacking = new THREE.Mesh(
      new THREE.BoxGeometry(rearWallW - 0.15, bodyH - canopyH - deckH - 0.10, 0.06),
      mats.recessShadow
    );
    shadowBacking.position.set(rearWallCenterX, 0, rearWallCenterZ + rearWallD / 2 + 0.03);
    setupMesh(shadowBacking);
    group.add(shadowBacking);

    // 6. Signature Feature: Heavy Cantilevering Corner Outrigger Beam
    // Projects out past the corner of the canopy for dramatic silhouette
    const beamW = 0.30;
    const beamH = 0.38;
    const beamL = canopyD + 0.50; // Projects +0.40m past front
    const outriggerBeam = new THREE.Mesh(
      new THREE.BoxGeometry(beamW, beamH, beamL),
      mats.mainConcrete
    );
    outriggerBeam.position.set(w / 2 - beamW / 2 + 0.18, bodyH / 2 - beamH / 2, canopyCenterZ + 0.20);
    setupMesh(outriggerBeam);
    group.add(outriggerBeam);
  }

  // =========================================================================
  // VARIANT C: SPLIT BLOCK (TWO INTERLOCKING OFFSET MASSES)
  // Silhouette:
  // - Mass A (Left): Projects forward in Z (+0.60m)
  // - Mass B (Right): Cantilevers sideways in X (+0.55m) and pushes rearward
  // - Distinct gap / recessed shadow core between the two blocks
  // - Stepped, interlocking brutalist silhouette with horizontal slot ribbon
  // =========================================================================
  else {
    const splitGapW = 0.35; // Visible negative gap between blocks

    // 1. Mass A: Left Forward Block
    // Projects forward (+0.60m)
    const blockAW = 2.05;
    const blockAD = 3.30;
    const blockACenterX = -w / 2 + blockAW / 2 + 0.10;
    const blockACenterZ = 0.40; // Projects forward

    const blockAMesh = new THREE.Mesh(
      new THREE.BoxGeometry(blockAW, bodyH, blockAD),
      mats.mainConcrete
    );
    blockAMesh.position.set(blockACenterX, 0, blockACenterZ);
    setupMesh(blockAMesh);
    group.add(blockAMesh);

    // Left Block Vertical Accent Slot (carved into forward left face)
    const vertSlotW = 0.28;
    const vertSlotH = bodyH * 0.70;
    const vertSlotMesh = new THREE.Mesh(
      new THREE.BoxGeometry(vertSlotW, vertSlotH, 0.06),
      mats.recessShadow
    );
    vertSlotMesh.position.set(blockACenterX - 0.45, 0, blockACenterZ + blockAD / 2 + 0.02);
    setupMesh(vertSlotMesh);
    group.add(vertSlotMesh);

    // 2. Mass B: Right Side Cantilever Block
    // Cantilevers to the right (+0.55m) and sits set back in Z
    const blockBW = 2.25;
    const blockBD = 3.30;
    const blockBCenterX = w / 2 - blockBW / 2 + 0.45; // Cantilevers right!
    const blockBCenterZ = -0.40; // Set back to the rear

    const blockBMesh = new THREE.Mesh(
      new THREE.BoxGeometry(blockBW, bodyH, blockBD),
      mats.lightConcrete
    );
    blockBMesh.position.set(blockBCenterX, 0, blockBCenterZ);
    setupMesh(blockBMesh);
    group.add(blockBMesh);

    // Horizontal Architectural Ribbon Slot on Mass B
    const ribbonW = blockBW - 0.40;
    const ribbonH = 0.24;
    const ribbonFrontZ = blockBCenterZ + blockBD / 2 + 0.02;

    const ribbonBacking = new THREE.Mesh(
      new THREE.BoxGeometry(ribbonW, ribbonH, 0.06),
      mats.recessShadow
    );
    ribbonBacking.position.set(blockBCenterX, 0.15, ribbonFrontZ - 0.02);
    setupMesh(ribbonBacking);
    group.add(ribbonBacking);

    const ribbonGlass = new THREE.Mesh(
      new THREE.BoxGeometry(ribbonW - 0.04, ribbonH - 0.04, 0.04),
      mats.slotGlass
    );
    ribbonGlass.position.set(blockBCenterX, 0.15, ribbonFrontZ);
    setupMesh(ribbonGlass);
    group.add(ribbonGlass);

    // 3. Central Recessed Shadow Core & Tie Member
    // Sits in the gap between Block A and Block B
    const coreW = splitGapW + 0.40;
    const coreD = 2.40;
    const coreCenterX = (blockACenterX + blockAW / 2 + blockBCenterX - blockBW / 2) / 2;
    const coreCenterZ = 0.0;

    const coreMesh = new THREE.Mesh(
      new THREE.BoxGeometry(coreW, bodyH - 0.10, coreD),
      mats.recessShadow
    );
    coreMesh.position.set(coreCenterX, 0, coreCenterZ);
    setupMesh(coreMesh);
    group.add(coreMesh);

    // Heavy Dark Metal Tie Beam connecting the two offset masses
    const tieW = coreW + 0.50;
    const tieH = 0.20;
    const tieD = 0.22;
    const tieBeam = new THREE.Mesh(
      new THREE.BoxGeometry(tieW, tieH, tieD),
      mats.accentMetal
    );
    tieBeam.position.set(coreCenterX, bodyH / 2 - 0.20, 0.25);
    setupMesh(tieBeam);
    group.add(tieBeam);

    // Lower Structural Tie Beam
    const lowerTie = new THREE.Mesh(
      new THREE.BoxGeometry(tieW, 0.14, tieD),
      mats.accentMetal
    );
    lowerTie.position.set(coreCenterX, -bodyH / 2 + 0.30, 0.25);
    setupMesh(lowerTie);
    group.add(lowerTie);
  }

  return { group, dimensions };
}

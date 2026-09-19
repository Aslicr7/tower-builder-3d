/**
 * Glass Office Floor Visual Archetype
 *
 * Archetype #3: GLASS OFFICE
 * Visual identity:
 * - Dark architectural curtain-wall glass (smoky steel-blue)
 * - Large bold external structural frames (charcoal / graphite steel)
 * - Thin floor slabs (architectural concrete)
 * - Large clean geometric forms with strong asymmetry
 * - Exactly 3 curated variants:
 *   - Glass A: Frame Box (Sleek glass volume with bold external exoskeleton portal frame)
 *   - Glass B: Cantilever Office (Two distinct volumes with an offset projecting office pod)
 *   - Glass C: Recessed Core (Twin glass pavilions flanking a dark recessed service core)
 *
 * Physics:
 * - Purely visual geometry.
 * - Simple box collider matching { width: w, depth: d, height: h } is preserved.
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
 * Procedural Curtain Wall Glass Texture:
 * Clean architectural smoky steel-blue with subtle horizontal & vertical panel grid lines.
 */
function createCurtainGlassCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base deep steel-blue tone
  ctx.fillStyle = '#2F3E4D';
  ctx.fillRect(0, 0, 256, 256);

  // Soft vertical glass tint variation (sky reflection gradient)
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(64, 85, 105, 0.35)');
  grad.addColorStop(0.5, 'rgba(40, 54, 68, 0.15)');
  grad.addColorStop(1, 'rgba(25, 35, 45, 0.40)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle architectural curtain-wall panel joints
  ctx.strokeStyle = '#1E2832';
  ctx.lineWidth = 2;

  // Vertical panel seams (4 glass bays)
  for (let x = 64; x < 256; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  // Horizontal floor & spandrel seam
  ctx.beginPath();
  ctx.moveTo(0, 128);
  ctx.lineTo(256, 128);
  ctx.stroke();

  return canvas;
}

/**
 * Procedural Structural Steel Texture:
 * Matte charcoal architectural steel with micro-grain and subtle edge reflection.
 */
function createStructuralSteelCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1D2126';
  ctx.fillRect(0, 0, 128, 128);

  // Micro grain
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const v = Math.random() > 0.5 ? 'rgba(45, 52, 60, 0.25)' : 'rgba(15, 18, 22, 0.35)';
    ctx.fillStyle = v;
    ctx.fillRect(x, y, 1, 1);
  }

  return canvas;
}

/**
 * Procedural Concrete Slab Texture:
 * Medium architectural grey concrete for thin structural floor edges.
 */
function createSlabConcreteCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#444A52';
  ctx.fillRect(0, 0, 128, 128);

  // Fine concrete stipple
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(90, 98, 108, 0.18)' : 'rgba(35, 40, 45, 0.22)';
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  return canvas;
}

/**
 * Procedural Core Panel Texture:
 * Dark graphite metal panel with subtle vertical architectural reveals.
 */
function createCorePanelCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#22262C';
  ctx.fillRect(0, 0, 128, 128);

  // Vertical panel reveal ribs
  ctx.fillStyle = '#181A1F';
  for (let x = 16; x < 128; x += 32) {
    ctx.fillRect(x - 1, 0, 2, 128);
  }

  return canvas;
}

function getGlassOfficeMaterials() {
  const glassTex = getTex('go_curtain_glass', createCurtainGlassCanvas);
  glassTex.repeat.set(2, 1);

  const steelTex = getTex('go_structural_steel', createStructuralSteelCanvas);
  const slabTex = getTex('go_slab_concrete', createSlabConcreteCanvas);
  const coreTex = getTex('go_core_panel', createCorePanelCanvas);

  return {
    curtainGlass: getMat('go_mat_glass', () => new THREE.MeshStandardMaterial({
      color: 0x364858, // Smoky desaturated steel-blue
      map: glassTex,
      roughness: 0.18,
      metalness: 0.35,
    })),
    curtainGlassLit: getMat('go_mat_glass_lit', () => new THREE.MeshStandardMaterial({
      color: 0x485E72, // Soft illuminated corporate office tone
      map: glassTex,
      roughness: 0.22,
      metalness: 0.25,
    })),
    structuralSteel: getMat('go_mat_steel', () => new THREE.MeshStandardMaterial({
      color: 0x1E2227, // Dark charcoal graphite steel
      map: steelTex,
      roughness: 0.45,
      metalness: 0.65,
    })),
    slabConcrete: getMat('go_mat_slab', () => new THREE.MeshStandardMaterial({
      color: 0x484E57, // Medium-dark architectural slab edge
      map: slabTex,
      roughness: 0.65,
      metalness: 0.15,
    })),
    spandrelPanel: getMat('go_mat_spandrel', () => new THREE.MeshStandardMaterial({
      color: 0x171A1F, // Dark charcoal spandrel band
      roughness: 0.35,
      metalness: 0.50,
    })),
    corePanel: getMat('go_mat_core', () => new THREE.MeshStandardMaterial({
      color: 0x24282F, // Graphite panel for central core
      map: coreTex,
      roughness: 0.55,
      metalness: 0.40,
    })),
  };
}

// ============================================================================
// MAIN BUILD FUNCTION
// ============================================================================

export function buildGlassOffice(
  floorIndex: number,
  w: number,
  d: number,
  h: number
): { group: THREE.Group; dimensions: FloorDimensions } {
  const mats = getGlassOfficeMaterials();
  const group = new THREE.Group();

  const variantIndex = Math.abs(floorIndex) % 3; // 0 = A, 1 = B, 2 = C
  const variantLetter = ['A', 'B', 'C'][variantIndex];
  group.name = `Floor_${floorIndex}_GLASS_OFFICE_${variantLetter}`;

  const dimensions: FloorDimensions = { width: w, depth: d, height: h };

  const setupMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  // Thin architectural floor slabs (sleek 0.08m height, thinner than residential brick)
  const slabH = 0.08;
  const bodyH = h - slabH * 2;

  // Floor level datums
  const bottomSlabY = -h / 2 + slabH / 2;
  const topSlabY = h / 2 - slabH / 2;

  // =========================================================================
  // CONTINUOUS STRUCTURAL FLOOR SLABS (TOP & BOTTOM)
  // Thin, dark architectural concrete edges cleanly separating office floors
  // =========================================================================
  const botSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.slabConcrete);
  botSlab.position.y = bottomSlabY;
  setupMesh(botSlab);
  group.add(botSlab);

  const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.slabConcrete);
  topSlab.position.y = topSlabY;
  setupMesh(topSlab);
  group.add(topSlab);

  // Lived-in office illumination variation (~25% of floors have brighter interior zone)
  const isLitFloor = Math.abs(floorIndex * 11 + 5) % 4 === 0;
  const glassMat = isLitFloor ? mats.curtainGlassLit : mats.curtainGlass;

  // =========================================================================
  // VARIANT A: FRAME BOX (EXOSKELETON STRUCTURAL FRAME)
  // Silhouette: Large sleek glass mass wrapped in a bold dark charcoal steel
  // exoskeleton portal frame that extends beyond the glass facade.
  // =========================================================================
  if (variantIndex === 0) {
    const glassW = w - 0.35; // 3.85m
    const glassD = d - 0.35; // 3.85m
    const glassCenterY = 0;

    // 1. Primary Glass Curtain Wall Volume (slightly offset for asymmetry)
    const offsetX = 0.10;
    const offsetZ = -0.05;
    const glassMass = new THREE.Mesh(
      new THREE.BoxGeometry(glassW, bodyH, glassD),
      glassMat
    );
    glassMass.position.set(offsetX, glassCenterY, offsetZ);
    setupMesh(glassMass);
    group.add(glassMass);

    // 2. Horizontal Spandrel Bands (charcoal bands running across upper and lower glazing)
    const spandrelH = 0.22;
    const topSpandrel = new THREE.Mesh(
      new THREE.BoxGeometry(glassW + 0.02, spandrelH, glassD + 0.02),
      mats.spandrelPanel
    );
    topSpandrel.position.set(offsetX, bodyH / 2 - spandrelH / 2, offsetZ);
    setupMesh(topSpandrel);
    group.add(topSpandrel);

    const botSpandrel = new THREE.Mesh(
      new THREE.BoxGeometry(glassW + 0.02, spandrelH, glassD + 0.02),
      mats.spandrelPanel
    );
    botSpandrel.position.set(offsetX, -bodyH / 2 + spandrelH / 2, offsetZ);
    setupMesh(botSpandrel);
    group.add(botSpandrel);

    // 3. Signature Feature: Heavy External Steel Exoskeleton Frame
    // Bold, phone-readable structural columns and tie-beams wrapping the facade
    const colSize = 0.18;
    const frameProjZ = d / 2 + 0.06; // Projects outward past standard footprint

    // Column 1 (Left flank column, full height)
    const colLeft = new THREE.Mesh(
      new THREE.BoxGeometry(colSize, bodyH, colSize * 1.8),
      mats.structuralSteel
    );
    colLeft.position.set(-w / 2 + colSize / 2 + 0.05, 0, frameProjZ - (colSize * 1.8) / 2);
    setupMesh(colLeft);
    group.add(colLeft);

    // Column 2 (Center-right structural column)
    const colMid = new THREE.Mesh(
      new THREE.BoxGeometry(colSize, bodyH, colSize * 1.8),
      mats.structuralSteel
    );
    colMid.position.set(0.75, 0, frameProjZ - (colSize * 1.8) / 2);
    setupMesh(colMid);
    group.add(colMid);

    // Structural Top Header Beam (spanning between columns)
    const spanW = 0.75 - (-w / 2 + colSize / 2 + 0.05);
    const spanCenterX = (-w / 2 + colSize / 2 + 0.05 + 0.75) / 2;
    const headerBeam = new THREE.Mesh(
      new THREE.BoxGeometry(spanW + colSize, 0.20, colSize),
      mats.structuralSteel
    );
    headerBeam.position.set(spanCenterX, bodyH / 2 - 0.10, frameProjZ - colSize / 2);
    setupMesh(headerBeam);
    group.add(headerBeam);

    // Structural Mid-Height Tie Girder (bold horizontal structural line)
    const midTieBeam = new THREE.Mesh(
      new THREE.BoxGeometry(spanW + colSize, 0.14, colSize),
      mats.structuralSteel
    );
    midTieBeam.position.set(spanCenterX, 0.10, frameProjZ - colSize / 2);
    setupMesh(midTieBeam);
    group.add(midTieBeam);

    // Structural Return Girder on Left Elevation (wraps around corner)
    const returnL = 1.60;
    const sideTieBeam = new THREE.Mesh(
      new THREE.BoxGeometry(colSize, 0.18, returnL),
      mats.structuralSteel
    );
    sideTieBeam.position.set(-w / 2 + colSize / 2 + 0.05, 0.10, frameProjZ - returnL / 2);
    setupMesh(sideTieBeam);
    group.add(sideTieBeam);

    // 4. Rear/Right Corner Secondary Columns (anchors the high-rise frame)
    const cornerCol = new THREE.Mesh(
      new THREE.BoxGeometry(colSize, bodyH, colSize),
      mats.structuralSteel
    );
    cornerCol.position.set(w / 2 - colSize / 2 - 0.05, 0, -d / 2 + colSize / 2 + 0.05);
    setupMesh(cornerCol);
    group.add(cornerCol);
  }

  // =========================================================================
  // VARIANT B: CANTILEVER OFFICE (OFFSET PROJECTING POD)
  // Silhouette: Two distinct interlocking geometric masses where one office pod
  // noticeably cantilevers forward (+0.55m), cradled by a heavy structural frame.
  // =========================================================================
  else if (variantIndex === 1) {
    const mainW = 2.25;
    const cantiW = w - mainW + 0.15; // 2.10m
    const cantiProj = 0.55; // Visual forward projection

    // 1. Volume 1: Main Glass Office Wing (Left side, set at standard depth)
    const mainD = d - 0.30; // 3.90m
    const mainCenterX = -w / 2 + mainW / 2;
    const mainCenterZ = -0.10;

    const mainGlass = new THREE.Mesh(
      new THREE.BoxGeometry(mainW, bodyH, mainD),
      glassMat
    );
    mainGlass.position.set(mainCenterX, 0, mainCenterZ);
    setupMesh(mainGlass);
    group.add(mainGlass);

    // Left Wing Corner Structural Column
    const colSize = 0.16;
    const leftCol = new THREE.Mesh(
      new THREE.BoxGeometry(colSize, bodyH, colSize),
      mats.structuralSteel
    );
    leftCol.position.set(-w / 2 + colSize / 2, 0, mainCenterZ + mainD / 2 - colSize / 2);
    setupMesh(leftCol);
    group.add(leftCol);

    // Left Wing Spandrel
    const spandrelH = 0.22;
    const mainSpandrel = new THREE.Mesh(
      new THREE.BoxGeometry(mainW + 0.01, spandrelH, mainD + 0.01),
      mats.spandrelPanel
    );
    mainSpandrel.position.set(mainCenterX, bodyH / 2 - spandrelH / 2, mainCenterZ);
    setupMesh(mainSpandrel);
    group.add(mainSpandrel);

    // 2. Volume 2: Cantilevered Office Pod (Right side, projecting forward)
    const cantiD = d - 0.20; // 4.00m
    const cantiCenterX = w / 2 - cantiW / 2 + 0.05;
    const cantiCenterZ = cantiProj / 2;

    const cantiGlass = new THREE.Mesh(
      new THREE.BoxGeometry(cantiW, bodyH - 0.08, cantiD),
      mats.curtainGlassLit // Projecting pod highlighted with corporate interior glow
    );
    cantiGlass.position.set(cantiCenterX, 0, cantiCenterZ);
    setupMesh(cantiGlass);
    group.add(cantiGlass);

    // 3. Signature Feature: Heavy Dark Structural Cantilever Cradle
    // Heavy bottom support girder under the projecting cantilever
    const cantiFrontZ = cantiCenterZ + cantiD / 2;
    const cradleBeamH = 0.22;
    const botCradleBeam = new THREE.Mesh(
      new THREE.BoxGeometry(cantiW + 0.08, cradleBeamH, 0.22),
      mats.structuralSteel
    );
    botCradleBeam.position.set(cantiCenterX, -bodyH / 2 + cradleBeamH / 2, cantiFrontZ);
    setupMesh(botCradleBeam);
    group.add(botCradleBeam);

    // Heavy top fascia girder across the cantilever roof edge
    const topCradleBeam = new THREE.Mesh(
      new THREE.BoxGeometry(cantiW + 0.08, cradleBeamH, 0.22),
      mats.structuralSteel
    );
    topCradleBeam.position.set(cantiCenterX, bodyH / 2 - cradleBeamH / 2, cantiFrontZ);
    setupMesh(topCradleBeam);
    group.add(topCradleBeam);

    // Heavy Outer Corner Column framing the projecting pod
    const cantiCornerCol = new THREE.Mesh(
      new THREE.BoxGeometry(0.20, bodyH, 0.20),
      mats.structuralSteel
    );
    cantiCornerCol.position.set(w / 2 - 0.05, 0, cantiFrontZ - 0.10);
    setupMesh(cantiCornerCol);
    group.add(cantiCornerCol);

    // Intermediate vertical steel mullion dividing the panoramic cantilever glazing
    const midCantiMullion = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, bodyH - cradleBeamH * 2, 0.10),
      mats.structuralSteel
    );
    midCantiMullion.position.set(cantiCenterX - 0.35, 0, cantiFrontZ - 0.05);
    setupMesh(midCantiMullion);
    group.add(midCantiMullion);
  }

  // =========================================================================
  // VARIANT C: RECESSED CORE (TWIN GLASS WINGS + CENTRAL RECESSED CORE)
  // Silhouette: Twin curtain-wall glass pavilions framing a darker recessed
  // architectural service/elevator core (-0.45m deep), linked by a top bridge girder.
  // =========================================================================
  else {
    const wingW = 1.50;
    const coreW = w - wingW * 2; // 1.20m
    const wingD = d - 0.20; // 4.00m
    const coreD = d - 0.80; // 3.40m
    const coreRecessZ = -0.30; // Core sits recessed behind front glass plane

    const leftWingCenterX = -w / 2 + wingW / 2;
    const rightWingCenterX = w / 2 - wingW / 2;
    const wingCenterZ = 0.05;

    // 1. Left Curtain-Wall Glass Pavilion
    const leftGlass = new THREE.Mesh(
      new THREE.BoxGeometry(wingW, bodyH, wingD),
      glassMat
    );
    leftGlass.position.set(leftWingCenterX, 0, wingCenterZ);
    setupMesh(leftGlass);
    group.add(leftGlass);

    // 2. Right Curtain-Wall Glass Pavilion
    const rightGlass = new THREE.Mesh(
      new THREE.BoxGeometry(wingW, bodyH, wingD),
      glassMat
    );
    rightGlass.position.set(rightWingCenterX, 0, wingCenterZ);
    setupMesh(rightGlass);
    group.add(rightGlass);

    // Spandrels on Left and Right Wings
    const spandrelH = 0.22;
    const leftSpandrel = new THREE.Mesh(
      new THREE.BoxGeometry(wingW + 0.01, spandrelH, wingD + 0.01),
      mats.spandrelPanel
    );
    leftSpandrel.position.set(leftWingCenterX, bodyH / 2 - spandrelH / 2, wingCenterZ);
    setupMesh(leftSpandrel);
    group.add(leftSpandrel);

    const rightSpandrel = new THREE.Mesh(
      new THREE.BoxGeometry(wingW + 0.01, spandrelH, wingD + 0.01),
      mats.spandrelPanel
    );
    rightSpandrel.position.set(rightWingCenterX, bodyH / 2 - spandrelH / 2, wingCenterZ);
    setupMesh(rightSpandrel);
    group.add(rightSpandrel);

    // Corner Structural Columns for the Twin Pavilions
    const colSize = 0.16;
    const colFrontZ = wingCenterZ + wingD / 2 - colSize / 2;

    const leftCol = new THREE.Mesh(new THREE.BoxGeometry(colSize, bodyH, colSize), mats.structuralSteel);
    leftCol.position.set(-w / 2 + colSize / 2, 0, colFrontZ);
    setupMesh(leftCol);
    group.add(leftCol);

    const rightCol = new THREE.Mesh(new THREE.BoxGeometry(colSize, bodyH, colSize), mats.structuralSteel);
    rightCol.position.set(w / 2 - colSize / 2, 0, colFrontZ);
    setupMesh(rightCol);
    group.add(rightCol);

    // 3. Central Recessed Core (dark graphite architectural paneling / elevator zone)
    const coreMesh = new THREE.Mesh(
      new THREE.BoxGeometry(coreW, bodyH, coreD),
      mats.corePanel
    );
    coreMesh.position.set(0, 0, coreRecessZ);
    setupMesh(coreMesh);
    group.add(coreMesh);

    // Vertical Technical Reveal Slot in center of core
    const revealW = 0.12;
    const revealSlot = new THREE.Mesh(
      new THREE.BoxGeometry(revealW, bodyH - 0.10, 0.04),
      mats.structuralSteel
    );
    revealSlot.position.set(0, 0, coreRecessZ + coreD / 2 + 0.02);
    setupMesh(revealSlot);
    group.add(revealSlot);

    // 4. Signature Feature: Heavy Dark Steel Structural Bridge Girder
    // Connects the two glass pavilions across the top of the central recess
    const bridgeGirder = new THREE.Mesh(
      new THREE.BoxGeometry(coreW + 0.20, 0.24, 0.22),
      mats.structuralSteel
    );
    bridgeGirder.position.set(0, bodyH / 2 - 0.12, colFrontZ);
    setupMesh(bridgeGirder);
    group.add(bridgeGirder);

    // Lower Structural Tie Beam
    const lowerTie = new THREE.Mesh(
      new THREE.BoxGeometry(coreW + 0.20, 0.14, 0.18),
      mats.structuralSteel
    );
    lowerTie.position.set(0, -bodyH / 2 + 0.25, colFrontZ);
    setupMesh(lowerTie);
    group.add(lowerTie);
  }

  return { group, dimensions };
}

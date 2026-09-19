/**
 * Glass Office Floor Visual Archetype
 *
 * Archetype #3: GLASS OFFICE
 * Visual identity:
 * - Bright, desaturated architectural curtain-wall glass (clean blue-grey)
 * - Visible bold external structural frames (charcoal / graphite steel)
 * - Medium-grey architectural concrete floor slabs
 * - Large clean geometric forms with strong asymmetry and depth
 * - Exactly 3 curated variants:
 *   - Glass A: Frame Box (Stepped L-plan glass wing with bold external exoskeleton frame)
 *   - Glass B: Cantilever Office (Two distinct volumes with a projecting lighter steel-blue pod)
 *   - Glass C: Recessed Core (Twin blue-grey glass pavilions flanking a deep graphite core)
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
 * Clean architectural blue-grey with subtle horizontal & vertical panel grid lines.
 * Lightened so it does not multiply into near-black.
 */
function createCurtainGlassCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base clear architectural blue-grey tone
  ctx.fillStyle = '#8AA9BA';
  ctx.fillRect(0, 0, 256, 256);

  // Soft vertical glass tint variation (sky reflection gradient)
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(175, 205, 222, 0.45)');
  grad.addColorStop(0.5, 'rgba(142, 172, 190, 0.15)');
  grad.addColorStop(1, 'rgba(118, 148, 166, 0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Clean architectural curtain-wall panel joints (soft dark blue-grey, NOT black)
  ctx.strokeStyle = '#5A7788';
  ctx.lineWidth = 2;

  // Vertical panel seams (4 glass bays)
  for (let x = 64; x < 256; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  // Horizontal spandrel / floor seam
  ctx.strokeStyle = '#4F6C7D';
  ctx.beginPath();
  ctx.moveTo(0, 128);
  ctx.lineTo(256, 128);
  ctx.stroke();

  return canvas;
}

/**
 * Procedural Structural Steel Texture:
 * Matte charcoal architectural steel with micro-grain and clean edge definition.
 */
function createStructuralSteelCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#262C33';
  ctx.fillRect(0, 0, 128, 128);

  // Micro grain
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const v = Math.random() > 0.5 ? 'rgba(60, 70, 80, 0.25)' : 'rgba(20, 24, 30, 0.35)';
    ctx.fillStyle = v;
    ctx.fillRect(x, y, 1, 1);
  }

  return canvas;
}

/**
 * Procedural Concrete Slab Texture:
 * Medium architectural grey concrete (#7C858B range) for crisp structural floor edges.
 */
function createSlabConcreteCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#7C858B';
  ctx.fillRect(0, 0, 128, 128);

  // Fine concrete stipple
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(145, 155, 162, 0.22)' : 'rgba(95, 102, 108, 0.25)';
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

  ctx.fillStyle = '#2F353D';
  ctx.fillRect(0, 0, 128, 128);

  // Vertical panel reveal ribs
  ctx.fillStyle = '#20242B';
  for (let x = 16; x < 128; x += 32) {
    ctx.fillRect(x - 1, 0, 2, 128);
  }

  return canvas;
}

function getGlassOfficeMaterials() {
  const glassTex = getTex('go_curtain_glass_v2', createCurtainGlassCanvas);
  glassTex.repeat.set(2, 1);

  const steelTex = getTex('go_structural_steel_v2', createStructuralSteelCanvas);
  const slabTex = getTex('go_slab_concrete_v2', createSlabConcreteCanvas);
  const coreTex = getTex('go_core_panel_v2', createCorePanelCanvas);

  return {
    // Primary Blue-Grey Architectural Curtain Glass
    curtainGlass: getMat('go_mat_glass_v2', () => new THREE.MeshStandardMaterial({
      color: 0x6E93A7, // Clear desaturated blue-grey
      map: glassTex,
      roughness: 0.30,
      metalness: 0.08, // Low metalness prevents black collapse in shadow
      emissive: 0x182834,
      emissiveIntensity: 0.16, // Subtle shadow lift (no neon glow)
    })),
    // Lighter Steel-Blue Glass (for illuminated floors & cantilever pod)
    curtainGlassPod: getMat('go_mat_glass_pod_v2', () => new THREE.MeshStandardMaterial({
      color: 0x82A8BD, // Crisp lighter steel-blue
      map: glassTex,
      roughness: 0.26,
      metalness: 0.06,
      emissive: 0x203646,
      emissiveIntensity: 0.18,
    })),
    // Bold Charcoal / Graphite Structural Steel Frame
    structuralSteel: getMat('go_mat_steel_v2', () => new THREE.MeshStandardMaterial({
      color: 0x282E36, // Dark charcoal steel
      map: steelTex,
      roughness: 0.45,
      metalness: 0.28,
    })),
    // Medium Architectural Concrete Grey Floor Slab
    slabConcrete: getMat('go_mat_slab_v2', () => new THREE.MeshStandardMaterial({
      color: 0x808990, // Medium architectural grey (#7C858B / #808990)
      map: slabTex,
      roughness: 0.58,
      metalness: 0.05,
    })),
    // Dark Blue-Grey / Graphite Spandrel Panel
    spandrelPanel: getMat('go_mat_spandrel_v2', () => new THREE.MeshStandardMaterial({
      color: 0x36424B, // Refined dark blue-grey spandrel
      roughness: 0.42,
      metalness: 0.15,
    })),
    // Dark Graphite Architectural Core Panel
    corePanel: getMat('go_mat_core_v2', () => new THREE.MeshStandardMaterial({
      color: 0x2C323A, // Graphite panel for central core
      map: coreTex,
      roughness: 0.52,
      metalness: 0.22,
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

  // Thin architectural floor slabs (sleek 0.08m height)
  const slabH = 0.08;
  const bodyH = h - slabH * 2;

  // Floor level datums
  const bottomSlabY = -h / 2 + slabH / 2;
  const topSlabY = h / 2 - slabH / 2;

  // =========================================================================
  // CONTINUOUS STRUCTURAL FLOOR SLABS (TOP & BOTTOM)
  // Medium architectural grey concrete slabs (#808990) cleanly delineating floors
  // =========================================================================
  const botSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.slabConcrete);
  botSlab.position.y = bottomSlabY;
  setupMesh(botSlab);
  group.add(botSlab);

  const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.slabConcrete);
  topSlab.position.y = topSlabY;
  setupMesh(topSlab);
  group.add(topSlab);

  // Lived-in office illumination variation (~25% of floors have brighter pod glazing)
  const isLitFloor = Math.abs(floorIndex * 11 + 5) % 4 === 0;
  const baseGlassMat = isLitFloor ? mats.curtainGlassPod : mats.curtainGlass;

  // =========================================================================
  // VARIANT A: FRAME BOX (STEPPED L-PLAN MASS + EXOSKELETON FRAME)
  // Silhouette: Primary blue-grey glass wing on the right + recessed secondary
  // wing on the left, creating an unmistakable 1.05m front setback/indentation,
  // encased by a bold charcoal steel exoskeleton portal frame.
  // =========================================================================
  if (variantIndex === 0) {
    const mainWingW = 2.45;
    const mainWingD = d - 0.40; // 3.80m
    const mainWingCenterX = 0.55;
    const mainWingCenterZ = 0.05;

    // 1. Primary Blue-Grey Glass Wing (Right / Center)
    const mainGlass = new THREE.Mesh(
      new THREE.BoxGeometry(mainWingW, bodyH, mainWingD),
      baseGlassMat
    );
    mainGlass.position.set(mainWingCenterX, 0, mainWingCenterZ);
    setupMesh(mainGlass);
    group.add(mainGlass);

    // Spandrel Bands across Primary Glass Wing
    const spandrelH = 0.20;
    const topSpandrel = new THREE.Mesh(
      new THREE.BoxGeometry(mainWingW + 0.01, spandrelH, mainWingD + 0.01),
      mats.spandrelPanel
    );
    topSpandrel.position.set(mainWingCenterX, bodyH / 2 - spandrelH / 2, mainWingCenterZ);
    setupMesh(topSpandrel);
    group.add(topSpandrel);

    const botSpandrel = new THREE.Mesh(
      new THREE.BoxGeometry(mainWingW + 0.01, spandrelH, mainWingD + 0.01),
      mats.spandrelPanel
    );
    botSpandrel.position.set(mainWingCenterX, -bodyH / 2 + spandrelH / 2, mainWingCenterZ);
    setupMesh(botSpandrel);
    group.add(botSpandrel);

    // 2. Secondary Recessed Wing (Left)
    // Deep 1.05m setback from the front facade creates an articulated L-plan silhouette
    const secWingW = 1.35;
    const secWingD = 2.65;
    const secWingCenterX = -w / 2 + secWingW / 2 + 0.10; // -1.325
    const secWingCenterZ = -0.45; // Front edge sits at Z = +0.875, recessed 1.075m behind main wing at +1.95m!

    const secGlass = new THREE.Mesh(
      new THREE.BoxGeometry(secWingW, bodyH, secWingD),
      baseGlassMat
    );
    secGlass.position.set(secWingCenterX, 0, secWingCenterZ);
    setupMesh(secGlass);
    group.add(secGlass);

    // 3. Signature Feature: External Charcoal Steel Exoskeleton Portal Frame
    // Spans proudly across the front-left setback, creating depth and shadow
    const colSize = 0.16;
    const frameFrontZ = mainWingCenterZ + mainWingD / 2 + 0.04; // Z = +1.99m

    // Left outer structural column (full height at the outer footprint corner)
    const colLeft = new THREE.Mesh(
      new THREE.BoxGeometry(colSize, bodyH, colSize),
      mats.structuralSteel
    );
    colLeft.position.set(-w / 2 + colSize / 2 + 0.08, 0, frameFrontZ);
    setupMesh(colLeft);
    group.add(colLeft);

    // Juncture column at the intersection of the setback and primary glass wing
    const colMid = new THREE.Mesh(
      new THREE.BoxGeometry(colSize, bodyH, colSize),
      mats.structuralSteel
    );
    colMid.position.set(mainWingCenterX - mainWingW / 2 + colSize / 2, 0, frameFrontZ);
    setupMesh(colMid);
    group.add(colMid);

    // Header girder spanning between the two columns
    const frameSpanW = (mainWingCenterX - mainWingW / 2 + colSize / 2) - (-w / 2 + colSize / 2 + 0.08);
    const frameSpanCenterX = ((-w / 2 + colSize / 2 + 0.08) + (mainWingCenterX - mainWingW / 2 + colSize / 2)) / 2;

    const headerGirder = new THREE.Mesh(
      new THREE.BoxGeometry(frameSpanW + colSize, 0.20, colSize),
      mats.structuralSteel
    );
    headerGirder.position.set(frameSpanCenterX, bodyH / 2 - 0.10, frameFrontZ);
    setupMesh(headerGirder);
    group.add(headerGirder);

    // Mid-height structural tie beam
    const midTieGirder = new THREE.Mesh(
      new THREE.BoxGeometry(frameSpanW + colSize, 0.14, colSize),
      mats.structuralSteel
    );
    midTieGirder.position.set(frameSpanCenterX, 0.05, frameFrontZ);
    setupMesh(midTieGirder);
    group.add(midTieGirder);

    // Left flank return beam connecting column back to the recessed wing
    const returnL = 1.15;
    const returnBeam = new THREE.Mesh(
      new THREE.BoxGeometry(colSize, 0.16, returnL),
      mats.structuralSteel
    );
    returnBeam.position.set(-w / 2 + colSize / 2 + 0.08, 0.05, frameFrontZ - returnL / 2);
    setupMesh(returnBeam);
    group.add(returnBeam);

    // Right flank corner column anchoring the primary glass volume
    const colRight = new THREE.Mesh(
      new THREE.BoxGeometry(colSize, bodyH, colSize),
      mats.structuralSteel
    );
    colRight.position.set(w / 2 - colSize / 2 - 0.08, 0, mainWingCenterZ + mainWingD / 2 - colSize / 2);
    setupMesh(colRight);
    group.add(colRight);
  }

  // =========================================================================
  // VARIANT B: CANTILEVER OFFICE (STEPPED DUAL VOLUMES + PROJECTING POD)
  // Silhouette: Medium blue-grey main wing set back on the left, paired with an
  // unmistakable lighter steel-blue cantilever pod projecting +0.70m forward on
  // the right, supported by heavy charcoal cradle girders.
  // =========================================================================
  else if (variantIndex === 1) {
    const mainW = 2.15;
    const cantiW = w - mainW + 0.10; // 2.15m

    // 1. Volume 1: Main Glass Office Wing (Left, set at recessed depth)
    const mainD = 3.30;
    const mainCenterX = -w / 2 + mainW / 2 + 0.05;
    const mainCenterZ = -0.30; // Front sits at Z = +1.35m

    const mainGlass = new THREE.Mesh(
      new THREE.BoxGeometry(mainW, bodyH, mainD),
      mats.curtainGlass // Medium blue-grey
    );
    mainGlass.position.set(mainCenterX, 0, mainCenterZ);
    setupMesh(mainGlass);
    group.add(mainGlass);

    // Main Wing Spandrels
    const spandrelH = 0.20;
    const mainSpandrel = new THREE.Mesh(
      new THREE.BoxGeometry(mainW + 0.01, spandrelH, mainD + 0.01),
      mats.spandrelPanel
    );
    mainSpandrel.position.set(mainCenterX, bodyH / 2 - spandrelH / 2, mainCenterZ);
    setupMesh(mainSpandrel);
    group.add(mainSpandrel);

    // Left Corner Structural Column
    const colSize = 0.16;
    const leftCol = new THREE.Mesh(
      new THREE.BoxGeometry(colSize, bodyH, colSize),
      mats.structuralSteel
    );
    leftCol.position.set(-w / 2 + colSize / 2 + 0.06, 0, mainCenterZ + mainD / 2 - colSize / 2);
    setupMesh(leftCol);
    group.add(leftCol);

    // 2. Volume 2: Cantilevered Office Pod (Right, projecting +0.70m forward!)
    const cantiD = 3.85;
    const cantiCenterX = w / 2 - cantiW / 2;
    const cantiCenterZ = 0.15; // Front sits at Z = +2.075m (+0.725m forward projection!)

    const cantiGlass = new THREE.Mesh(
      new THREE.BoxGeometry(cantiW, bodyH - 0.06, cantiD),
      mats.curtainGlassPod // Lighter, crisp steel-blue creates visible material distinction
    );
    cantiGlass.position.set(cantiCenterX, 0, cantiCenterZ);
    setupMesh(cantiGlass);
    group.add(cantiGlass);

    // 3. Signature Feature: Heavy Dark Structural Cantilever Cradle
    const cantiFrontZ = cantiCenterZ + cantiD / 2;
    const cradleBeamH = 0.22;

    // Bottom support cradle girder under the projecting cantilever
    const botCradleBeam = new THREE.Mesh(
      new THREE.BoxGeometry(cantiW + 0.06, cradleBeamH, 0.20),
      mats.structuralSteel
    );
    botCradleBeam.position.set(cantiCenterX, -bodyH / 2 + cradleBeamH / 2, cantiFrontZ);
    setupMesh(botCradleBeam);
    group.add(botCradleBeam);

    // Top fascia girder across the cantilever roof edge
    const topCradleBeam = new THREE.Mesh(
      new THREE.BoxGeometry(cantiW + 0.06, cradleBeamH, 0.20),
      mats.structuralSteel
    );
    topCradleBeam.position.set(cantiCenterX, bodyH / 2 - cradleBeamH / 2, cantiFrontZ);
    setupMesh(topCradleBeam);
    group.add(topCradleBeam);

    // Heavy Outer Corner Column framing the projecting pod
    const cantiCornerCol = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, bodyH, 0.18),
      mats.structuralSteel
    );
    cantiCornerCol.position.set(w / 2 - 0.08, 0, cantiFrontZ - 0.09);
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
  // VARIANT C: RECESSED CORE (BLUE GLASS | DARK GRAPHITE RECESS | BLUE GLASS)
  // Silhouette: Twin bright blue-grey curtain-wall glass pavilions flanking a
  // deep (0.65m) central graphite elevator/service core, linked by a heavy
  // dark steel bridge girder spanning the top.
  // =========================================================================
  else {
    const wingW = 1.45;
    const coreW = w - wingW * 2; // 1.30m
    const wingD = d - 0.35; // 3.85m
    const coreD = 2.65;
    const coreRecessZ = -0.30; // Front edge of core is at Z = +1.025m (0.60m recessed behind glass wings at +1.625m!)

    const leftWingCenterX = -w / 2 + wingW / 2 + 0.05;
    const rightWingCenterX = w / 2 - wingW / 2 - 0.05;
    const wingCenterZ = 0.05; // Front at Z = +1.975m

    // 1. Left Curtain-Wall Glass Pavilion (Bright Blue-Grey)
    const leftGlass = new THREE.Mesh(
      new THREE.BoxGeometry(wingW, bodyH, wingD),
      mats.curtainGlass
    );
    leftGlass.position.set(leftWingCenterX, 0, wingCenterZ);
    setupMesh(leftGlass);
    group.add(leftGlass);

    // 2. Right Curtain-Wall Glass Pavilion (Bright Blue-Grey)
    const rightGlass = new THREE.Mesh(
      new THREE.BoxGeometry(wingW, bodyH, wingD),
      mats.curtainGlass
    );
    rightGlass.position.set(rightWingCenterX, 0, wingCenterZ);
    setupMesh(rightGlass);
    group.add(rightGlass);

    // Spandrel Headers on Left and Right Pavilions
    const spandrelH = 0.20;
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
    leftCol.position.set(-w / 2 + colSize / 2 + 0.06, 0, colFrontZ);
    setupMesh(leftCol);
    group.add(leftCol);

    const rightCol = new THREE.Mesh(new THREE.BoxGeometry(colSize, bodyH, colSize), mats.structuralSteel);
    rightCol.position.set(w / 2 - colSize / 2 - 0.06, 0, colFrontZ);
    setupMesh(rightCol);
    group.add(rightCol);

    // 3. Central Recessed Core (Deep Dark Graphite Architectural Core)
    const coreMesh = new THREE.Mesh(
      new THREE.BoxGeometry(coreW, bodyH, coreD),
      mats.corePanel
    );
    coreMesh.position.set(0, 0, coreRecessZ);
    setupMesh(coreMesh);
    group.add(coreMesh);

    // Vertical Technical Reveal Slot in Center of Core
    const revealW = 0.14;
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
      new THREE.BoxGeometry(coreW + 0.20, 0.22, 0.20),
      mats.structuralSteel
    );
    bridgeGirder.position.set(0, bodyH / 2 - 0.11, colFrontZ);
    setupMesh(bridgeGirder);
    group.add(bridgeGirder);

    // Lower Structural Tie Girder
    const lowerTie = new THREE.Mesh(
      new THREE.BoxGeometry(coreW + 0.20, 0.14, 0.16),
      mats.structuralSteel
    );
    lowerTie.position.set(0, -bodyH / 2 + 0.25, colFrontZ);
    setupMesh(lowerTie);
    group.add(lowerTie);
  }

  return { group, dimensions };
}


/**
 * Industrial Frame Floor Visual Archetype
 *
 * Archetype #5: INDUSTRIAL FRAME
 * Visual identity:
 * - SKELETAL, OPEN, STRUCTURAL, MECHANICAL, AIRY
 * - Built from heavy structural steel columns, perimeter beams, and diagonal braces
 * - Genuinely EMPTY negative space (40-60% open see-through area to the background)
 * - Industrial steel palette:
 *   - Main steel: #42484B
 *   - Dark steel: #292E31
 *   - Secondary steel: #5A6061
 *   - Industrial Accent: Muted Safety Yellow / Ochre (#C89B35 / #D0A33B) (~5-10%)
 *   - Pod / Machine metal: #2F373C
 * - Exactly 3 curated variants:
 *   - Variant A: X Frame (4 corner columns, large front X-brace, open center, rear utility box, overhead duct)
 *   - Variant B: Service Pod (Very open frame, projecting offset service pod, V-chevron braces, cylindrical tank)
 *   - Variant C: Split Platform (Visually split stepped platforms, transfer tie beams, machinery housing, hoist beam)
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
 * Procedural Industrial Steel Deck Canvas:
 * Subtle tread pattern on medium-dark steel plate.
 */
function createSteelDeckCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#363C3F';
  ctx.fillRect(0, 0, 128, 128);

  // Subtle architectural tread seams
  ctx.fillStyle = '#2A2F32';
  for (let y = 16; y < 128; y += 32) {
    ctx.fillRect(0, y, 128, 2);
  }
  for (let x = 16; x < 128; x += 32) {
    ctx.fillRect(x, 0, 2, 128);
  }

  return canvas;
}

/**
 * Procedural Safety Hazard Stripe Canvas:
 * Muted industrial yellow (#C89B35) and dark steel (#292E31) 45-degree stripes.
 */
function createHazardStripeCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#292E31';
  ctx.fillRect(0, 0, 128, 32);

  ctx.fillStyle = '#C89B35';
  ctx.beginPath();
  for (let x = -32; x < 160; x += 24) {
    ctx.moveTo(x, 32);
    ctx.lineTo(x + 16, 32);
    ctx.lineTo(x + 32, 0);
    ctx.lineTo(x + 16, 0);
    ctx.closePath();
  }
  ctx.fill();

  return canvas;
}

function getIndustrialMaterials() {
  const deckTex = getTex('ind_deck_tex', createSteelDeckCanvas);
  deckTex.repeat.set(2, 2);

  const hazardTex = getTex('ind_hazard_tex', createHazardStripeCanvas);
  hazardTex.repeat.set(2, 1);

  return {
    // Main Structural Steel (#42484B)
    mainSteel: getMat('ind_mat_main', () => new THREE.MeshStandardMaterial({
      color: 0x42484B,
      roughness: 0.65,
      metalness: 0.45,
    })),
    // Dark Structural Steel (#292E31)
    darkSteel: getMat('ind_mat_dark', () => new THREE.MeshStandardMaterial({
      color: 0x292E31,
      roughness: 0.70,
      metalness: 0.50,
    })),
    // Secondary Structural Steel (#5A6061)
    secondarySteel: getMat('ind_mat_sec', () => new THREE.MeshStandardMaterial({
      color: 0x5A6061,
      roughness: 0.60,
      metalness: 0.40,
    })),
    // Safety Yellow / Ochre Accent (#C89B35)
    safetyYellow: getMat('ind_mat_yellow', () => new THREE.MeshStandardMaterial({
      color: 0xC89B35,
      roughness: 0.52,
      metalness: 0.18,
    })),
    // Safety Hazard Stripe Material
    hazardStripe: getMat('ind_mat_hazard', () => new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      map: hazardTex,
      roughness: 0.55,
      metalness: 0.20,
    })),
    // Service Pod & Machinery Metal (#2F373C)
    podMetal: getMat('ind_mat_pod', () => new THREE.MeshStandardMaterial({
      color: 0x2F373C,
      roughness: 0.72,
      metalness: 0.28,
    })),
    // Steel Floor Platform Deck (#363C3F)
    platformDeck: getMat('ind_mat_deck', () => new THREE.MeshStandardMaterial({
      color: 0x363C3F,
      map: deckTex,
      roughness: 0.75,
      metalness: 0.40,
    })),
    // Industrial Tank / Equipment Steel (#4A5459)
    tankSteel: getMat('ind_mat_tank', () => new THREE.MeshStandardMaterial({
      color: 0x4A5459,
      roughness: 0.58,
      metalness: 0.38,
    })),
  };
}

// ============================================================================
// STRUCTURAL BEAM HELPER
// Mathematically creates a BoxGeometry beam between two 3D points
// ============================================================================

function createBeamBetweenPoints(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  thicknessX: number,
  thicknessZ: number,
  material: THREE.Material
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const geom = new THREE.BoxGeometry(thicknessX, len, thicknessZ);
  const mesh = new THREE.Mesh(geom, material);

  // Position at midpoint
  mesh.position.addVectors(p1, p2).multiplyScalar(0.5);

  // Rotate to align +Y axis with dir
  const up = new THREE.Vector3(0, 1, 0);
  const normDir = dir.clone().normalize();
  if (Math.abs(normDir.y) > 0.9999) {
    if (normDir.y < 0) {
      mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    }
  } else {
    mesh.quaternion.setFromUnitVectors(up, normDir);
  }

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ============================================================================
// MAIN BUILD FUNCTION
// ============================================================================

export function buildIndustrialFrame(
  floorIndex: number,
  w: number,
  d: number,
  h: number
): { group: THREE.Group; dimensions: FloorDimensions } {
  const mats = getIndustrialMaterials();
  const group = new THREE.Group();

  const variantIndex = Math.abs(floorIndex) % 3; // 0 = A, 1 = B, 2 = C
  const variantLetter = ['A', 'B', 'C'][variantIndex];
  group.name = `Floor_${floorIndex}_INDUSTRIAL_FRAME_${variantLetter}`;

  const dimensions: FloorDimensions = { width: w, depth: d, height: h };

  const setupMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  // Structural framing coordinates
  const colInsetX = 1.85; // Distance from center to column axis
  const colInsetZ = 1.85;
  const colW = 0.22; // Robust, phone-readable column profile
  const beamThick = 0.18; // Perimeter beam profile
  const yBottom = -h / 2 + beamThick / 2;
  const yTop = h / 2 - beamThick / 2;

  // =========================================================================
  // VARIANT A: X FRAME
  // Silhouette:
  // - 4 heavy structural corner columns
  // - Full top and bottom perimeter beams
  // - Large bold X-brace across the front face
  // - Wide open see-through center and sides
  // - Compact utility room in the rear-left corner (~22% footprint)
  // - Overhead industrial ventilation duct with safety yellow accent
  // =========================================================================
  if (variantIndex === 0) {
    // 1. Industrial Floor Platform (Grating with perimeter kickplates)
    const platH = 0.08;
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.20, platH, d - 0.20),
      mats.platformDeck
    );
    platform.position.y = -h / 2 + platH / 2;
    setupMesh(platform);
    group.add(platform);

    // 2. Four Corner Columns
    const colCoords = [
      [-colInsetX, -colInsetZ],
      [colInsetX, -colInsetZ],
      [-colInsetX, colInsetZ],
      [colInsetX, colInsetZ],
    ];
    for (const [cx, cz] of colCoords) {
      const col = new THREE.Mesh(
        new THREE.BoxGeometry(colW, h, colW),
        mats.mainSteel
      );
      col.position.set(cx, 0, cz);
      setupMesh(col);
      group.add(col);
    }

    // 3. Bottom Perimeter Beams (Heavy structural ties)
    const beamGeomX = new THREE.BoxGeometry(colInsetX * 2, beamThick, colW);
    const beamGeomZ = new THREE.BoxGeometry(colW, beamThick, colInsetZ * 2);

    const bBeamFront = new THREE.Mesh(beamGeomX, mats.darkSteel);
    bBeamFront.position.set(0, yBottom + platH / 2, colInsetZ);
    setupMesh(bBeamFront);
    group.add(bBeamFront);

    const bBeamRear = new THREE.Mesh(beamGeomX, mats.darkSteel);
    bBeamRear.position.set(0, yBottom + platH / 2, -colInsetZ);
    setupMesh(bBeamRear);
    group.add(bBeamRear);

    const bBeamLeft = new THREE.Mesh(beamGeomZ, mats.darkSteel);
    bBeamLeft.position.set(-colInsetX, yBottom + platH / 2, 0);
    setupMesh(bBeamLeft);
    group.add(bBeamLeft);

    const bBeamRight = new THREE.Mesh(beamGeomZ, mats.darkSteel);
    bBeamRight.position.set(colInsetX, yBottom + platH / 2, 0);
    setupMesh(bBeamRight);
    group.add(bBeamRight);

    // 4. Top Perimeter Beams
    const tBeamFront = new THREE.Mesh(beamGeomX, mats.mainSteel);
    tBeamFront.position.set(0, yTop, colInsetZ);
    setupMesh(tBeamFront);
    group.add(tBeamFront);

    const tBeamRear = new THREE.Mesh(beamGeomX, mats.mainSteel);
    tBeamRear.position.set(0, yTop, -colInsetZ);
    setupMesh(tBeamRear);
    group.add(tBeamRear);

    const tBeamLeft = new THREE.Mesh(beamGeomZ, mats.mainSteel);
    tBeamLeft.position.set(-colInsetX, yTop, 0);
    setupMesh(tBeamLeft);
    group.add(tBeamLeft);

    const tBeamRight = new THREE.Mesh(beamGeomZ, mats.mainSteel);
    tBeamRight.position.set(colInsetX, yTop, 0);
    setupMesh(tBeamRight);
    group.add(tBeamRight);

    // 5. Large Signature X-Brace on the Front Face
    // Clearly visible from gameplay camera with 0.02m Z-separation to avoid z-fighting at center
    const braceFrontZ = colInsetZ + colW / 2 + 0.02;
    const brace1 = createBeamBetweenPoints(
      new THREE.Vector3(-colInsetX + 0.10, yBottom + beamThick / 2, braceFrontZ - 0.01),
      new THREE.Vector3(colInsetX - 0.10, yTop - beamThick / 2, braceFrontZ - 0.01),
      0.15,
      0.14,
      mats.secondarySteel
    );
    group.add(brace1);

    const brace2 = createBeamBetweenPoints(
      new THREE.Vector3(-colInsetX + 0.10, yTop - beamThick / 2, braceFrontZ + 0.01),
      new THREE.Vector3(colInsetX - 0.10, yBottom + beamThick / 2, braceFrontZ + 0.01),
      0.15,
      0.14,
      mats.secondarySteel
    );
    group.add(brace2);

    // 6. Asymmetric Left Side Knee-Brace
    const sideBrace = createBeamBetweenPoints(
      new THREE.Vector3(-colInsetX - colW / 2 - 0.01, yBottom + beamThick / 2, -colInsetZ + 0.10),
      new THREE.Vector3(-colInsetX - colW / 2 - 0.01, yTop - beamThick / 2, 0.0),
      0.14,
      0.14,
      mats.darkSteel
    );
    group.add(sideBrace);

    // 7. Small Offset Utility Room in Rear-Left Corner (~22% of floor footprint)
    const utilW = 1.55;
    const utilD = 1.65;
    const utilH = h - beamThick * 2 - platH;
    const utilCenterX = -colInsetX + utilW / 2 - 0.05;
    const utilCenterZ = -colInsetZ + utilD / 2 - 0.05;

    const utilBox = new THREE.Mesh(
      new THREE.BoxGeometry(utilW, utilH, utilD),
      mats.podMetal
    );
    utilBox.position.set(utilCenterX, 0, utilCenterZ);
    setupMesh(utilBox);
    group.add(utilBox);

    // Safety Yellow Utility Access Door on Front of Utility Room
    const doorW = 0.65;
    const doorH = 1.45;
    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorH, 0.05),
      mats.safetyYellow
    );
    doorMesh.position.set(utilCenterX + 0.20, -0.15, utilCenterZ + utilD / 2 + 0.03);
    setupMesh(doorMesh);
    group.add(doorMesh);

    // 8. Industrial Feature: Large Overhead Ventilation Duct
    const ductW = 0.50;
    const ductH = 0.38;
    const ductL = 3.60;
    const ductMesh = new THREE.Mesh(
      new THREE.BoxGeometry(ductW, ductH, ductL),
      mats.tankSteel
    );
    ductMesh.position.set(0.65, yTop - ductH / 2 - 0.08, 0);
    setupMesh(ductMesh);
    group.add(ductMesh);

    // Yellow band around duct
    const ductBand = new THREE.Mesh(
      new THREE.BoxGeometry(ductW + 0.04, ductH + 0.04, 0.20),
      mats.safetyYellow
    );
    ductBand.position.set(0.65, yTop - ductH / 2 - 0.08, 0.50);
    setupMesh(ductBand);
    group.add(ductBand);
  }

  // =========================================================================
  // VARIANT B: SERVICE POD
  // Silhouette:
  // - Wide open structural frame on the left (see-through)
  // - Solid SERVICE POD on the right projecting +0.22m beyond frame
  // - Large V-shaped chevron braces on the open left side
  // - Large horizontal cylindrical industrial pressure tank on saddle mounts
  // - Safety hazard stripes and ochre yellow mechanical accents
  // =========================================================================
  else if (variantIndex === 1) {
    // 1. Industrial Floor Platform
    const platH = 0.08;
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.15, platH, d - 0.15),
      mats.platformDeck
    );
    platform.position.y = -h / 2 + platH / 2;
    setupMesh(platform);
    group.add(platform);

    // 2. Corner Columns
    const colCoords = [
      [-colInsetX, -colInsetZ],
      [colInsetX, -colInsetZ],
      [-colInsetX, colInsetZ],
      [colInsetX, colInsetZ],
    ];
    for (const [cx, cz] of colCoords) {
      const col = new THREE.Mesh(
        new THREE.BoxGeometry(colW, h, colW),
        mats.mainSteel
      );
      col.position.set(cx, 0, cz);
      setupMesh(col);
      group.add(col);
    }

    // 3. Perimeter Girders (Top & Bottom)
    const beamGeomX = new THREE.BoxGeometry(colInsetX * 2, beamThick, colW);
    const beamGeomZ = new THREE.BoxGeometry(colW, beamThick, colInsetZ * 2);

    const bBeamFront = new THREE.Mesh(beamGeomX, mats.darkSteel);
    bBeamFront.position.set(0, yBottom + platH / 2, colInsetZ);
    setupMesh(bBeamFront);
    group.add(bBeamFront);

    const bBeamRear = new THREE.Mesh(beamGeomX, mats.darkSteel);
    bBeamRear.position.set(0, yBottom + platH / 2, -colInsetZ);
    setupMesh(bBeamRear);
    group.add(bBeamRear);

    const tBeamFront = new THREE.Mesh(beamGeomX, mats.secondarySteel);
    tBeamFront.position.set(0, yTop, colInsetZ);
    setupMesh(tBeamFront);
    group.add(tBeamFront);

    const tBeamRear = new THREE.Mesh(beamGeomX, mats.secondarySteel);
    tBeamRear.position.set(0, yTop, -colInsetZ);
    setupMesh(tBeamRear);
    group.add(tBeamRear);

    const tBeamLeft = new THREE.Mesh(beamGeomZ, mats.secondarySteel);
    tBeamLeft.position.set(-colInsetX, yTop, 0);
    setupMesh(tBeamLeft);
    group.add(tBeamLeft);

    // 4. Signature Feature: Solid SERVICE POD Offset to Right Side
    // Projects +0.22m out to create an asymmetric silhouette
    const podW = 1.70;
    const podD = 3.20;
    const podH = h - beamThick - 0.12;
    const podCenterX = w / 2 - podW / 2 + 0.18; // Projects rightward
    const podCenterY = 0;
    const podCenterZ = 0;

    const servicePod = new THREE.Mesh(
      new THREE.BoxGeometry(podW, podH, podD),
      mats.podMetal
    );
    servicePod.position.set(podCenterX, podCenterY, podCenterZ);
    setupMesh(servicePod);
    group.add(servicePod);

    // Safety Hazard Stripe Band along lower edge of Service Pod
    const stripeH = 0.22;
    const podStripe = new THREE.Mesh(
      new THREE.BoxGeometry(podW + 0.03, stripeH, podD + 0.03),
      mats.hazardStripe
    );
    podStripe.position.set(podCenterX, podCenterY - podH / 2 + stripeH / 2 + 0.10, podCenterZ);
    setupMesh(podStripe);
    group.add(podStripe);

    // Safety Yellow Service Shutter / Louver Panel on Front of Pod
    const shutterW = podW - 0.35;
    const shutterH = 1.10;
    const shutter = new THREE.Mesh(
      new THREE.BoxGeometry(shutterW, shutterH, 0.05),
      mats.safetyYellow
    );
    shutter.position.set(podCenterX, 0.15, podCenterZ + podD / 2 + 0.02);
    setupMesh(shutter);
    group.add(shutter);

    // 5. Large V-Chevron Diagonal Braces on the Open Left Side
    // Framed on the left perimeter (X = -colInsetX), totally see-through inside
    const vBraceZ = colInsetZ - 0.15;
    const vLeftX = -colInsetX - colW / 2 - 0.02;

    const vBrace1 = createBeamBetweenPoints(
      new THREE.Vector3(vLeftX, yBottom + beamThick / 2, -vBraceZ),
      new THREE.Vector3(vLeftX, yTop - beamThick / 2, 0.0),
      0.15,
      0.14,
      mats.darkSteel
    );
    group.add(vBrace1);

    const vBrace2 = createBeamBetweenPoints(
      new THREE.Vector3(vLeftX, yBottom + beamThick / 2, vBraceZ),
      new THREE.Vector3(vLeftX, yTop - beamThick / 2, 0.0),
      0.15,
      0.14,
      mats.darkSteel
    );
    group.add(vBrace2);

    // 6. Industrial Feature: Large Horizontal Cylindrical Pressure Tank
    // Positioned in the open zone on steel saddle mounts
    const tankRadius = 0.44;
    const tankLen = 2.30;
    // 14 radial segments for crisp stylized low-poly look
    const tankGeom = new THREE.CylinderGeometry(tankRadius, tankRadius, tankLen, 14);
    const tankMesh = new THREE.Mesh(tankGeom, mats.tankSteel);
    tankMesh.rotation.x = Math.PI / 2; // Aligns along Z axis
    tankMesh.position.set(-0.65, -0.10, 0);
    setupMesh(tankMesh);
    group.add(tankMesh);

    // Tank Saddle Brackets (Left and Right Mounts)
    const saddleGeom = new THREE.BoxGeometry(0.95, 0.35, 0.20);
    const saddle1 = new THREE.Mesh(saddleGeom, mats.mainSteel);
    saddle1.position.set(-0.65, -0.48, -0.70);
    setupMesh(saddle1);
    group.add(saddle1);

    const saddle2 = new THREE.Mesh(saddleGeom, mats.mainSteel);
    saddle2.position.set(-0.65, -0.48, 0.70);
    setupMesh(saddle2);
    group.add(saddle2);
  }

  // =========================================================================
  // VARIANT C: SPLIT PLATFORM
  // Silhouette:
  // - Visually split stepped floor platform (Left forward, Right set back)
  // - Large central open gap / service void between platforms
  // - Heavy structural transfer tie beams spanning the gap
  // - Compact electrical machinery housing with safety yellow warning panel
  // - Overhead safety yellow hoist crane monorail
  // - Clear diagonal strut braces making the gap readable
  // =========================================================================
  else {
    const platH = 0.08;

    // 1. Visually Split Stepped Platforms
    // Platform A (Left): Sits forward in Z (+0.35m)
    const platAW = 1.95;
    const platAD = 3.35;
    const platACenterX = -w / 2 + platAW / 2 + 0.15;
    const platACenterZ = 0.35;

    const platformA = new THREE.Mesh(
      new THREE.BoxGeometry(platAW, platH, platAD),
      mats.platformDeck
    );
    platformA.position.set(platACenterX, -h / 2 + platH / 2, platACenterZ);
    setupMesh(platformA);
    group.add(platformA);

    // Platform B (Right): Sits rearward in Z (-0.35m)
    const platBW = 1.95;
    const platBD = 3.35;
    const platBCenterX = w / 2 - platBW / 2 - 0.15;
    const platBCenterZ = -0.35;

    const platformB = new THREE.Mesh(
      new THREE.BoxGeometry(platBW, platH, platBD),
      mats.platformDeck
    );
    platformB.position.set(platBCenterX, -h / 2 + platH / 2, platBCenterZ);
    setupMesh(platformB);
    group.add(platformB);

    // 2. Six Structural Steel Columns (4 perimeter + 2 central gap columns)
    const colCoords = [
      [-colInsetX, -colInsetZ],
      [colInsetX, -colInsetZ],
      [-colInsetX, colInsetZ],
      [colInsetX, colInsetZ],
      [0.0, -colInsetZ],
      [0.0, colInsetZ],
    ];
    for (const [cx, cz] of colCoords) {
      const col = new THREE.Mesh(
        new THREE.BoxGeometry(colW, h, colW),
        mats.mainSteel
      );
      col.position.set(cx, 0, cz);
      setupMesh(col);
      group.add(col);
    }

    // 3. Heavy Transverse Transfer Beams Bridging the Split Platforms
    const transferGeom = new THREE.BoxGeometry(w - 0.30, beamThick, 0.22);

    const bTransferFront = new THREE.Mesh(transferGeom, mats.darkSteel);
    bTransferFront.position.set(0, yBottom + platH / 2, colInsetZ);
    setupMesh(bTransferFront);
    group.add(bTransferFront);

    const bTransferRear = new THREE.Mesh(transferGeom, mats.darkSteel);
    bTransferRear.position.set(0, yBottom + platH / 2, -colInsetZ);
    setupMesh(bTransferRear);
    group.add(bTransferRear);

    const tTransferFront = new THREE.Mesh(transferGeom, mats.mainSteel);
    tTransferFront.position.set(0, yTop, colInsetZ);
    setupMesh(tTransferFront);
    group.add(tTransferFront);

    const tTransferRear = new THREE.Mesh(transferGeom, mats.mainSteel);
    tTransferRear.position.set(0, yTop, -colInsetZ);
    setupMesh(tTransferRear);
    group.add(tTransferRear);

    // 4. Overhead Industrial Yellow Hoist Monorail Beam
    // Runs right down the central ceiling axis
    const hoistBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.26, d - 0.20),
      mats.safetyYellow
    );
    hoistBeam.position.set(0, yTop - 0.12, 0);
    setupMesh(hoistBeam);
    group.add(hoistBeam);

    // 5. Diagonal Strut Braces Across Left & Right Bays
    const strut1 = createBeamBetweenPoints(
      new THREE.Vector3(-colInsetX, yBottom + beamThick, colInsetZ + colW / 2 + 0.01),
      new THREE.Vector3(0.0, yTop - beamThick, colInsetZ + colW / 2 + 0.01),
      0.14,
      0.14,
      mats.secondarySteel
    );
    group.add(strut1);

    const strut2 = createBeamBetweenPoints(
      new THREE.Vector3(colInsetX, yBottom + beamThick, -colInsetZ - colW / 2 - 0.01),
      new THREE.Vector3(0.0, yTop - beamThick, -colInsetZ - colW / 2 - 0.01),
      0.14,
      0.14,
      mats.secondarySteel
    );
    group.add(strut2);

    // 6. Compact Machinery / Generator Enclosure on Right Platform (~24% of platform)
    const machW = 1.35;
    const machH = 1.30;
    const machD = 1.45;
    const machCenterX = platBCenterX;
    const machCenterY = -h / 2 + platH + machH / 2;
    const machCenterZ = platBCenterZ;

    const machBox = new THREE.Mesh(
      new THREE.BoxGeometry(machW, machH, machD),
      mats.podMetal
    );
    machBox.position.set(machCenterX, machCenterY, machCenterZ);
    setupMesh(machBox);
    group.add(machBox);

    // Safety Yellow Control Console Panel on Front of Generator
    const consoleW = 0.55;
    const consoleH = 0.65;
    const consoleMesh = new THREE.Mesh(
      new THREE.BoxGeometry(consoleW, consoleH, 0.04),
      mats.safetyYellow
    );
    consoleMesh.position.set(machCenterX - 0.20, machCenterY + 0.10, machCenterZ + machD / 2 + 0.02);
    setupMesh(consoleMesh);
    group.add(consoleMesh);
  }

  return { group, dimensions };
}

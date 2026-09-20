import * as THREE from 'three';
import { FloorDimensions } from '../../types';

// ============================================================================
// BRICK APARTMENT ARCHETYPE
// Believable Residential Apartment Architecture
// 
// Architectural Principles:
// 1. Human-scale residential facade logic (Living room + Bedrooms + Balcony).
// 2. Real usable balconies with depth, slabs, and glazed access doors.
// 3. True residential windows with depth: brick reveal -> stone sill -> frame -> glass -> interior backing.
// 4. Uniform lintel line alignment across doors and windows.
// 5. Zero random floating strips or decorative clutter — clean masonry masses and slabs.
// 6. Restrained architectural palette: burnt clay brick, warm limestone, charcoal frames, graphite metal.
// 7. Deterministic ~15-20% warm interior lamplight for lived-in feel.
// ============================================================================

// ============================================================================
// CACHED PROCEDURAL TEXTURES
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
 * Subtle procedural brick texture:
 * Clean running bond, warm mortar, soft tone shifts across bricks.
 * At gameplay distance it reads as natural masonry without noisy procedural patterns.
 */
function createResidentialBrickCanvas(
  baseHex: string,
  shade1Hex: string,
  shade2Hex: string,
  mortarHex: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm mortar base
  ctx.fillStyle = mortarHex;
  ctx.fillRect(0, 0, 256, 256);

  const rowH = 16;
  const colW = 32;
  const mortar = 2;
  const colors = [baseHex, shade1Hex, baseHex, shade2Hex];

  for (let y = 0; y < 256; y += rowH) {
    const isOdd = Math.floor(y / rowH) % 2 === 1;
    const offsetX = isOdd ? colW / 2 : 0;

    for (let x = -colW; x < 256 + colW; x += colW) {
      const colIdx = Math.abs((x * 13 + y * 29) % colors.length);
      ctx.fillStyle = colors[colIdx];
      ctx.fillRect(
        x + offsetX + mortar,
        y + mortar,
        colW - mortar * 2,
        rowH - mortar * 2
      );

      // Subtle surface grain
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(
        x + offsetX + mortar,
        y + mortar,
        (colW - mortar * 2) * 0.5,
        rowH - mortar * 2
      );
    }
  }

  return canvas;
}

/**
 * Smooth, warm architectural limestone / concrete texture.
 */
function createLimestoneCanvas(baseHex: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Very subtle micro-speckle
  ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  for (let i = 0; i < 300; i++) {
    const rx = (i * 37) % 256;
    const ry = (i * 71) % 256;
    ctx.fillRect(rx, ry, 2, 2);
  }
  return canvas;
}

// ============================================================================
// MATERIAL DEFINITIONS
// ============================================================================

const materialCache: Record<string, THREE.Material> = {};

function getMat(key: string, creator: () => THREE.Material): THREE.Material {
  if (!materialCache[key]) {
    materialCache[key] = creator();
  }
  return materialCache[key];
}

export function getBrickMaterials() {
  // Palette A: Muted Burnt Clay (Natural earthy red-brown)
  const brickTexA = getCachedTexture('b_res_brickA', () =>
    createResidentialBrickCanvas('#9B4E3E', '#924738', '#A25342', '#524840')
  );
  brickTexA.repeat.set(3, 1.6);

  // Palette B: Darker Burnt Clay / Warm Brown-Red
  const brickTexB = getCachedTexture('b_res_brickB', () =>
    createResidentialBrickCanvas('#7E4236', '#743C31', '#88493B', '#483E38')
  );
  brickTexB.repeat.set(3, 1.6);

  // Warm Limestone / Concrete Slabs
  const stoneTex = getCachedTexture('b_res_stone', () => createLimestoneCanvas('#9A9388'));
  stoneTex.repeat.set(2, 2);

  return {
    brickWallA: getMat('b_res_matBrickA', () => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: brickTexA,
      roughness: 0.85,
      metalness: 0.02,
    })),
    brickWallB: getMat('b_res_matBrickB', () => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: brickTexB,
      roughness: 0.85,
      metalness: 0.02,
    })),
    stoneSlab: getMat('b_res_matStone', () => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: stoneTex,
      roughness: 0.78,
      metalness: 0.04,
    })),
    windowFrame: getMat('b_res_matFrame', () => new THREE.MeshStandardMaterial({
      color: 0x25272B, // Charcoal frame
      roughness: 0.45,
      metalness: 0.40,
    })),
    metalRailing: getMat('b_res_matRailing', () => new THREE.MeshStandardMaterial({
      color: 0x2A2C30, // Dark graphite
      roughness: 0.50,
      metalness: 0.60,
    })),
    windowGlass: getMat('b_res_matGlass', () => new THREE.MeshStandardMaterial({
      color: 0x3A444D, // Smoky blue-grey
      roughness: 0.22,
      metalness: 0.15,
      transparent: true,
      opacity: 0.86,
    })),
    interiorDark: getMat('b_res_interiorDark', () => new THREE.MeshBasicMaterial({
      color: 0x1C1E20, // Dark warm charcoal shadow backing
    })),
    interiorWarm: getMat('b_res_interiorWarm', () => new THREE.MeshBasicMaterial({
      color: 0xA07346, // Soft warm amber interior lamplight
    })),
    utilityCasing: getMat('b_res_utilityCasing', () => new THREE.MeshStandardMaterial({
      color: 0x8E8982,
      roughness: 0.65,
      metalness: 0.20,
    })),
    utilityGrill: getMat('b_res_utilityGrill', () => new THREE.MeshStandardMaterial({
      color: 0x2A2D32,
      roughness: 0.70,
      metalness: 0.50,
    })),
  };
}

// ============================================================================
// RESIDENTIAL ARCHITECTURAL HELPERS
// ============================================================================

type BrickMats = ReturnType<typeof getBrickMaterials>;

/**
 * Believable residential punched window:
 * - Stone sill at base with gentle overhang
 * - Clean charcoal frame recessed into brick
 * - Single glass plane with positive depth separation
 * - Central vertical mullion
 * - Dark or warm interior backing plane with positive clearance from wall
 */
function createResidentialWindow(
  width: number,
  height: number,
  mats: BrickMats,
  isLit: boolean,
  hasMullion: boolean = true
): THREE.Group {
  const g = new THREE.Group();

  const sillH = 0.05;
  const sillD = 0.08;
  const sillOverhang = 0.03;
  const frameThick = 0.04;

  // Layer 1: Interior Backing Plane (sits 8mm in front of wall face, completely covering the brick)
  const glassW = width - frameThick * 2;
  const glassH = height - frameThick * 2;
  const backGeo = new THREE.PlaneGeometry(glassW, glassH);
  const backMat = isLit ? mats.interiorWarm : mats.interiorDark;
  const back = new THREE.Mesh(backGeo, backMat);
  back.position.set(0, 0, 0.008);
  g.add(back);

  // Layer 2: Glass Pane (single plane, 18mm in front of backing plane at Z = 0.026)
  const glassGeo = new THREE.PlaneGeometry(glassW, glassH);
  const glass = new THREE.Mesh(glassGeo, mats.windowGlass);
  glass.position.set(0, 0, 0.026);
  g.add(glass);

  // Layer 3: Central Vertical Mullion (divides window into two sashes)
  if (hasMullion && width > 0.65) {
    const mullionGeo = new THREE.BoxGeometry(0.035, glassH, 0.016);
    const mullion = new THREE.Mesh(mullionGeo, mats.windowFrame);
    mullion.position.set(0, 0, 0.032);
    mullion.castShadow = true;
    g.add(mullion);
  }

  // Layer 4: Open Charcoal Perimeter Frame (leaves center clear for glass and backing)
  const topRail = new THREE.Mesh(new THREE.BoxGeometry(width, frameThick, 0.045), mats.windowFrame);
  topRail.position.set(0, height / 2 - frameThick / 2, 0.024);
  topRail.castShadow = true;
  g.add(topRail);

  const btmRail = new THREE.Mesh(new THREE.BoxGeometry(width, frameThick, 0.045), mats.windowFrame);
  btmRail.position.set(0, -height / 2 + frameThick / 2, 0.024);
  btmRail.castShadow = true;
  g.add(btmRail);

  const jambH = Math.max(0.02, height - frameThick * 2);
  const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(frameThick, jambH, 0.045), mats.windowFrame);
  leftJamb.position.set(-width / 2 + frameThick / 2, 0, 0.024);
  leftJamb.castShadow = true;
  g.add(leftJamb);

  const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(frameThick, jambH, 0.045), mats.windowFrame);
  rightJamb.position.set(width / 2 - frameThick / 2, 0, 0.024);
  rightJamb.castShadow = true;
  g.add(rightJamb);

  // Layer 5: Clean Stone Sill at base (projects outward at Z = 0.038)
  const sillGeo = new THREE.BoxGeometry(width + sillOverhang * 2, sillH, sillD);
  const sill = new THREE.Mesh(sillGeo, mats.stoneSlab);
  sill.position.set(0, -height / 2 - sillH / 2, 0.038);
  sill.castShadow = true;
  sill.receiveShadow = true;
  g.add(sill);

  return g;
}

/**
 * Believable residential glazed balcony door:
 * - Human-scale height (~1.96m)
 * - Charcoal frame with glazed panel and handle divider
 * - Distinct depth separation between door frame, glass, and backing
 */
function createBalconyDoor(
  width: number,
  height: number,
  mats: BrickMats,
  isLit: boolean
): THREE.Group {
  const g = new THREE.Group();
  const frameThick = 0.045;
  const glassW = width - frameThick * 2;
  const glassH = height - frameThick * 2;

  // Layer 1: Interior Backing Plane (8mm in front of wall face)
  const backMat = isLit ? mats.interiorWarm : mats.interiorDark;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(glassW, glassH), backMat);
  back.position.set(0, 0, 0.008);
  g.add(back);

  // Layer 2: Glass Pane (single plane, 18mm in front of backing at Z = 0.026)
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(glassW, glassH), mats.windowGlass);
  glass.position.set(0, 0, 0.026);
  g.add(glass);

  // Layer 3: Mid-rail / door handle height divider
  const midRail = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.05, 0.016), mats.windowFrame);
  midRail.position.set(0, -height * 0.12, 0.032);
  midRail.castShadow = true;
  g.add(midRail);

  // If wide (double sliding door), add vertical center stile
  if (width > 1.1) {
    const stile = new THREE.Mesh(new THREE.BoxGeometry(0.04, glassH, 0.016), mats.windowFrame);
    stile.position.set(0, 0, 0.032);
    stile.castShadow = true;
    g.add(stile);
  }

  // Layer 4: Open Perimeter Frame (top, bottom, left, right members)
  const doorTopRail = new THREE.Mesh(new THREE.BoxGeometry(width, frameThick, 0.045), mats.windowFrame);
  doorTopRail.position.set(0, height / 2 - frameThick / 2, 0.024);
  doorTopRail.castShadow = true;
  g.add(doorTopRail);

  const doorBtmRail = new THREE.Mesh(new THREE.BoxGeometry(width, frameThick, 0.045), mats.windowFrame);
  doorBtmRail.position.set(0, -height / 2 + frameThick / 2, 0.024);
  doorBtmRail.castShadow = true;
  g.add(doorBtmRail);

  const doorJambH = Math.max(0.02, height - frameThick * 2);
  const doorLeftJamb = new THREE.Mesh(new THREE.BoxGeometry(frameThick, doorJambH, 0.045), mats.windowFrame);
  doorLeftJamb.position.set(-width / 2 + frameThick / 2, 0, 0.024);
  doorLeftJamb.castShadow = true;
  g.add(doorLeftJamb);

  const doorRightJamb = new THREE.Mesh(new THREE.BoxGeometry(frameThick, doorJambH, 0.045), mats.windowFrame);
  doorRightJamb.position.set(width / 2 - frameThick / 2, 0, 0.024);
  doorRightJamb.castShadow = true;
  g.add(doorRightJamb);

  return g;
}

/**
 * Simplified, open residential metal railing:
 * - Strong top handrail at human waist/chest height (~0.85m)
 * - 2-3 vertical structural posts
 * - Single mid-rail (large open sections, NOT a cage)
 */
function createResidentialRailing(
  width: number,
  depth: number,
  height: number,
  mat: THREE.Material
): THREE.Group {
  const g = new THREE.Group();
  const postSize = 0.035;

  // Front top handrail
  const topFront = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.04), mat);
  topFront.position.set(0, height, depth / 2 - postSize / 2);
  topFront.castShadow = true;
  g.add(topFront);

  // Front mid-rail
  const midFront = new THREE.Mesh(new THREE.BoxGeometry(width - postSize * 2, 0.025, 0.025), mat);
  midFront.position.set(0, height * 0.45, depth / 2 - postSize / 2);
  g.add(midFront);

  // Front corner posts
  const postGeo = new THREE.BoxGeometry(postSize, height, postSize);
  const postL = new THREE.Mesh(postGeo, mat);
  postL.position.set(-width / 2 + postSize / 2, height / 2, depth / 2 - postSize / 2);
  postL.castShadow = true;
  g.add(postL);

  const postR = new THREE.Mesh(postGeo, mat);
  postR.position.set(width / 2 - postSize / 2, height / 2, depth / 2 - postSize / 2);
  postR.castShadow = true;
  g.add(postR);

  // Center vertical support
  if (width > 1.0) {
    const postMid = new THREE.Mesh(postGeo, mat);
    postMid.position.set(0, height / 2, depth / 2 - postSize / 2);
    postMid.castShadow = true;
    g.add(postMid);
  }

  // Side railings (if projecting balcony)
  if (depth > 0.25) {
    const sideRailW = depth - postSize;

    // Left side
    const topL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, sideRailW), mat);
    topL.position.set(-width / 2 + postSize / 2, height, 0);
    topL.castShadow = true;
    g.add(topL);

    const midL = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, sideRailW), mat);
    midL.position.set(-width / 2 + postSize / 2, height * 0.45, 0);
    g.add(midL);

    const backPostL = new THREE.Mesh(postGeo, mat);
    backPostL.position.set(-width / 2 + postSize / 2, height / 2, -depth / 2 + postSize / 2);
    backPostL.castShadow = true;
    g.add(backPostL);

    // Right side
    const topR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, sideRailW), mat);
    topR.position.set(width / 2 - postSize / 2, height, 0);
    topR.castShadow = true;
    g.add(topR);

    const midR = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, sideRailW), mat);
    midR.position.set(width / 2 - postSize / 2, height * 0.45, 0);
    g.add(midR);

    const backPostR = new THREE.Mesh(postGeo, mat);
    backPostR.position.set(width / 2 - postSize / 2, height / 2, -depth / 2 + postSize / 2);
    backPostR.castShadow = true;
    g.add(backPostR);
  }

  return g;
}

/**
 * Compact wall-mounted AC compressor unit on rear utility wall
 */
function createUtilityAcUnit(mats: BrickMats): THREE.Group {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.42, 0.30), mats.utilityCasing);
  box.castShadow = true;
  box.receiveShadow = true;
  g.add(box);

  const grill = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.30, 0.02), mats.utilityGrill);
  grill.position.set(0.05, 0, -0.16);
  g.add(grill);

  const bracketGeo = new THREE.BoxGeometry(0.04, 0.04, 0.38);
  const b1 = new THREE.Mesh(bracketGeo, mats.metalRailing);
  b1.position.set(-0.20, -0.22, 0.05);
  b1.castShadow = true;
  g.add(b1);

  const b2 = new THREE.Mesh(bracketGeo, mats.metalRailing);
  b2.position.set(0.20, -0.22, 0.05);
  b2.castShadow = true;
  g.add(b2);

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

  const variantIndex = Math.abs(floorIndex) % 3; // 0 = A, 1 = B, 2 = C
  const variantLetter = ['A', 'B', 'C'][variantIndex];
  group.name = `Floor_${floorIndex}_BRICK_APARTMENT_${variantLetter}`;

  const dimensions: FloorDimensions = { width: w, depth: d, height: h };

  const setupMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  // Structural Floor Slabs: clean, continuous, warm limestone
  const slabH = 0.12;
  const wallH = h - slabH * 2;

  // Lintel line alignment:
  // In real buildings, all window and door heads align on the same horizontal datum line.
  // floor level Y = -h/2 + slabH
  // lintel Y = floor level + 1.96m
  const floorY = -h / 2 + slabH;
  const lintelY = floorY + 1.96;

  // Standard residential heights:
  const doorH = 1.96;
  const doorCenterY = floorY + doorH / 2; // top aligns at lintelY

  const bedWinH = 1.25;
  const bedWinCenterY = lintelY - bedWinH / 2; // top aligns at lintelY, sill sits at human waist level

  const livingWinH = 1.65;
  const livingWinCenterY = lintelY - livingWinH / 2; // panoramic low-sill living room window

  // Railing height
  const railH = 0.85;

  // Deterministic lived-in lamplight (~20% of rooms)
  const isLit = (slot: number) => Math.abs(floorIndex * 7 + slot * 13 + 3) % 5 === 0;

  // =========================================================================
  // COMMON STRUCTURAL FLOOR SEPARATION: CLEAN BOTTOM & TOP SLABS
  // Replaces all arbitrary floating facade strips with two clean, restrained slab edges.
  // =========================================================================
  const botSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.stoneSlab);
  botSlab.position.y = -h / 2 + slabH / 2;
  setupMesh(botSlab);
  group.add(botSlab);

  const topSlab = new THREE.Mesh(new THREE.BoxGeometry(w, slabH, d), mats.stoneSlab);
  topSlab.position.y = h / 2 - slabH / 2;
  setupMesh(topSlab);
  group.add(topSlab);

  // =========================================================================
  // VARIANT A: LIVING ROOM + PROJECTING SIDE BALCONY
  // Facade Logic:
  // - Left side (bedroom zone): Solid brick wall with two residential bedroom windows.
  // - Right side (living room zone): Large living room with a true usable projecting balcony
  //   and a wide sliding glass door directly leading to it.
  // =========================================================================
  if (variantIndex === 0) {
    const brickMat = mats.brickWallA;
    const wallFaceZ = d / 2 - 0.02;
    const wallLeftX = -w / 2 + 0.02;
    const wallRightX = w / 2 - 0.02;
    const wallRearZ = -d / 2 + 0.02;

    // 1. Solid Brick Exterior Body
    const core = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, wallH, d - 0.04), brickMat);
    setupMesh(core);
    group.add(core);

    // 2. Bedroom Windows on Left Facade Zone (mounted directly on wall surface)
    const winBed1 = createResidentialWindow(0.85, bedWinH, mats, isLit(0), true);
    winBed1.position.set(-1.35, bedWinCenterY, wallFaceZ);
    group.add(winBed1);

    const winBed2 = createResidentialWindow(0.85, bedWinH, mats, isLit(1), true);
    winBed2.position.set(-0.35, bedWinCenterY, wallFaceZ);
    group.add(winBed2);

    // 3. Living Room Glazed Balcony Door on Right Facade Zone
    const balcCenterX = 1.20;
    const livingDoor = createBalconyDoor(1.35, doorH, mats, isLit(2));
    livingDoor.position.set(balcCenterX, doorCenterY, wallFaceZ);
    group.add(livingDoor);

    // 4. Usable Projecting Balcony
    const balcW = 1.60;
    const balcD = 1.00;
    const balcCenterZ = d / 2 + balcD / 2;

    // Balcony Slab (aligns with floor level)
    const balcSlab = new THREE.Mesh(new THREE.BoxGeometry(balcW, slabH, balcD), mats.stoneSlab);
    balcSlab.position.set(balcCenterX, floorY - slabH / 2, balcCenterZ);
    setupMesh(balcSlab);
    group.add(balcSlab);

    // Balcony Railing
    const balcRailing = createResidentialRailing(balcW, balcD, railH, mats.metalRailing);
    balcRailing.position.set(balcCenterX, floorY, balcCenterZ);
    group.add(balcRailing);

    // 5. Left Facade: 2 Bedroom Windows
    const leftWin1 = createResidentialWindow(0.85, bedWinH, mats, false, true);
    leftWin1.rotation.y = -Math.PI / 2;
    leftWin1.position.set(wallLeftX, bedWinCenterY, 0.85);
    group.add(leftWin1);

    const leftWin2 = createResidentialWindow(0.85, bedWinH, mats, isLit(3), true);
    leftWin2.rotation.y = -Math.PI / 2;
    leftWin2.position.set(wallLeftX, bedWinCenterY, -0.85);
    group.add(leftWin2);

    // 6. Right Facade: Living Room Side Window
    const rightWin = createResidentialWindow(1.05, livingWinH, mats, isLit(2), true);
    rightWin.rotation.y = Math.PI / 2;
    rightWin.position.set(wallRightX, livingWinCenterY, -0.60);
    group.add(rightWin);

    // 7. Rear Facade: Kitchen/Bedroom Windows + AC compressor
    const rearWin1 = createResidentialWindow(0.85, bedWinH, mats, false, true);
    rearWin1.rotation.y = Math.PI;
    rearWin1.position.set(-0.85, bedWinCenterY, wallRearZ);
    group.add(rearWin1);

    const rearWin2 = createResidentialWindow(0.85, bedWinH, mats, isLit(4), true);
    rearWin2.rotation.y = Math.PI;
    rearWin2.position.set(0.85, bedWinCenterY, wallRearZ);
    group.add(rearWin2);

    const ac = createUtilityAcUnit(mats);
    ac.position.set(-w / 2 + 0.55, floorY + 0.40, -d / 2 - 0.16);
    group.add(ac);
  }

  // =========================================================================
  // VARIANT B: RECESSED LOGGIA / COVERED BALCONY
  // Facade Logic:
  // - Left side: Recessed loggia carved into the building mass (usable covered outdoor room).
  //   Inside sits the balcony deck, tall balcony door, and living room window.
  //   Outer perimeter is framed by solid brick walls and a clean dark railing.
  // - Right side: Solid brick facade with two residential bedroom windows.
  // =========================================================================
  else if (variantIndex === 1) {
    const brickMat = mats.brickWallB;
    const wallFaceZ = d / 2 - 0.02;
    const wallLeftX = -w / 2 + 0.02;
    const wallRightX = w / 2 - 0.02;
    const wallRearZ = -d / 2 + 0.02;

    const loggiaW = 1.75;
    const loggiaD = 1.15;
    const solidW = w - loggiaW; // 2.45m
    const solidRearD = d - loggiaD;

    // 1. Solid Right Wing (Bedroom Zone)
    const rightMass = new THREE.Mesh(
      new THREE.BoxGeometry(solidW, wallH, d - 0.04),
      brickMat
    );
    rightMass.position.set(w / 2 - solidW / 2, 0, 0);
    setupMesh(rightMass);
    group.add(rightMass);

    // 2. Rear Mass Behind the Loggia
    const rearMass = new THREE.Mesh(
      new THREE.BoxGeometry(loggiaW, wallH, solidRearD),
      brickMat
    );
    rearMass.position.set(-w / 2 + loggiaW / 2, 0, -d / 2 + solidRearD / 2);
    setupMesh(rearMass);
    group.add(rearMass);

    // 3. Loggia Outer Brick Flank Wall (Left side of the building)
    const flankW = 0.25;
    const flankWall = new THREE.Mesh(
      new THREE.BoxGeometry(flankW, wallH, loggiaD),
      brickMat
    );
    flankWall.position.set(-w / 2 + flankW / 2, 0, d / 2 - loggiaD / 2);
    setupMesh(flankWall);
    group.add(flankWall);

    // 4. Loggia Interior: Railing across front opening
    // (Note: botSlab already provides the stone floor at floorY, eliminating redundant coplanar deck box)
    const loggiaCenterX = -w / 2 + flankW + (loggiaW - flankW) / 2;
    const openW = loggiaW - flankW;

    const loggiaRailing = createResidentialRailing(openW, 0, railH, mats.metalRailing);
    loggiaRailing.position.set(loggiaCenterX, floorY, d / 2);
    group.add(loggiaRailing);

    // 5. Back Wall of the Loggia: Glazed Balcony Door + Living Room Window
    // Mounted directly on the front face of rearMass (d / 2 - loggiaD)
    const loggiaBackWallZ = d / 2 - loggiaD;
    const loggiaDoor = createBalconyDoor(0.85, doorH, mats, isLit(0));
    loggiaDoor.position.set(loggiaCenterX - 0.25, doorCenterY, loggiaBackWallZ);
    group.add(loggiaDoor);

    const loggiaWin = createResidentialWindow(0.55, bedWinH, mats, isLit(1), false);
    loggiaWin.position.set(loggiaCenterX + 0.45, bedWinCenterY, loggiaBackWallZ);
    group.add(loggiaWin);

    // 6. Right Facade Zone: Two Bedroom Windows
    const winBed1 = createResidentialWindow(0.85, bedWinH, mats, isLit(2), true);
    winBed1.position.set(w / 2 - solidW + 0.65, bedWinCenterY, wallFaceZ);
    group.add(winBed1);

    const winBed2 = createResidentialWindow(0.85, bedWinH, mats, false, true);
    winBed2.position.set(w / 2 - 0.60, bedWinCenterY, wallFaceZ);
    group.add(winBed2);

    // 7. Right Facade: Deep Bedroom Window
    const rightWin = createResidentialWindow(1.00, bedWinH, mats, false, true);
    rightWin.rotation.y = Math.PI / 2;
    rightWin.position.set(wallRightX, bedWinCenterY, 0);
    group.add(rightWin);

    // 8. Left Facade: Solid rear bedroom window
    const leftWin = createResidentialWindow(0.90, bedWinH, mats, isLit(3), true);
    leftWin.rotation.y = -Math.PI / 2;
    leftWin.position.set(wallLeftX, bedWinCenterY, -d / 2 + solidRearD / 2);
    group.add(leftWin);

    // 9. Rear Facade: Two Windows + AC compressor
    const rearWin1 = createResidentialWindow(0.85, bedWinH, mats, false, true);
    rearWin1.rotation.y = Math.PI;
    rearWin1.position.set(-0.85, bedWinCenterY, wallRearZ);
    group.add(rearWin1);

    const rearWin2 = createResidentialWindow(0.85, bedWinH, mats, isLit(4), true);
    rearWin2.rotation.y = Math.PI;
    rearWin2.position.set(0.85, bedWinCenterY, wallRearZ);
    group.add(rearWin2);

    const acB = createUtilityAcUnit(mats);
    acB.position.set(w / 2 - 0.55, floorY + 0.40, -d / 2 - 0.16);
    group.add(acB);
  }

  // =========================================================================
  // VARIANT C: CORNER LIVING ROOM WITH BALCONY
  // Facade Logic:
  // - Left side (bedroom wing): Solid brick wall with two bedroom windows.
  // - Right side (corner living room wing): Articulated living zone with panoramic
  //   living room window, corner-oriented balcony, and glazed balcony door.
  // - Dual-aspect corner glazing brings natural light into the living space.
  // =========================================================================
  else {
    const brickMat = mats.brickWallA;
    const wallFaceZ = d / 2 - 0.02;
    const wallLeftX = -w / 2 + 0.02;
    const wallRightX = w / 2 - 0.02;
    const wallRearZ = -d / 2 + 0.02;

    // Slight architectural articulation (0.25m step) separating living wing from bedroom wing
    const bedW = 2.20;
    const livingW = w - bedW; // 2.00m

    // 1. Bedroom Wing Core
    const bedCore = new THREE.Mesh(
      new THREE.BoxGeometry(bedW, wallH, d - 0.04),
      brickMat
    );
    bedCore.position.set(-w / 2 + bedW / 2, 0, 0);
    setupMesh(bedCore);
    group.add(bedCore);

    // 2. Living Room Wing Core
    const livingCore = new THREE.Mesh(
      new THREE.BoxGeometry(livingW, wallH, d - 0.04),
      brickMat
    );
    livingCore.position.set(w / 2 - livingW / 2, 0, 0);
    setupMesh(livingCore);
    group.add(livingCore);

    // 3. Bedroom Zone: Two Clean Residential Windows
    const winBed1 = createResidentialWindow(0.85, bedWinH, mats, false, true);
    winBed1.position.set(-w / 2 + 0.60, bedWinCenterY, wallFaceZ);
    group.add(winBed1);

    const winBed2 = createResidentialWindow(0.85, bedWinH, mats, isLit(0), true);
    winBed2.position.set(-w / 2 + 1.60, bedWinCenterY, wallFaceZ);
    group.add(winBed2);

    // 4. Living Room Zone: Large Window + Glazed Balcony Door
    const winLiving = createResidentialWindow(0.90, livingWinH, mats, isLit(1), true);
    winLiving.position.set(w / 2 - livingW + 0.55, livingWinCenterY, wallFaceZ);
    group.add(winLiving);

    const livingDoor = createBalconyDoor(0.90, doorH, mats, isLit(1));
    livingDoor.position.set(w / 2 - 0.55, doorCenterY, wallFaceZ);
    group.add(livingDoor);

    // 5. Usable Corner-Adjacent Balcony
    const balcW = 1.30;
    const balcD = 0.95;
    const balcCenterX = w / 2 - 0.65;
    const balcCenterZ = d / 2 + balcD / 2;

    const balcSlab = new THREE.Mesh(new THREE.BoxGeometry(balcW, slabH, balcD), mats.stoneSlab);
    balcSlab.position.set(balcCenterX, floorY - slabH / 2, balcCenterZ);
    setupMesh(balcSlab);
    group.add(balcSlab);

    const balcRailing = createResidentialRailing(balcW, balcD, railH, mats.metalRailing);
    balcRailing.position.set(balcCenterX, floorY, balcCenterZ);
    group.add(balcRailing);

    // 6. Right Side Facade: Living Room Corner Window (dual-aspect light)
    const cornerWin = createResidentialWindow(1.20, livingWinH, mats, isLit(2), true);
    cornerWin.rotation.y = Math.PI / 2;
    cornerWin.position.set(wallRightX, livingWinCenterY, 0.60);
    group.add(cornerWin);

    // 7. Left Side Facade: Two Bedroom Windows
    const leftWin1 = createResidentialWindow(0.85, bedWinH, mats, false, true);
    leftWin1.rotation.y = -Math.PI / 2;
    leftWin1.position.set(wallLeftX, bedWinCenterY, 0.85);
    group.add(leftWin1);

    const leftWin2 = createResidentialWindow(0.85, bedWinH, mats, isLit(3), true);
    leftWin2.rotation.y = -Math.PI / 2;
    leftWin2.position.set(wallLeftX, bedWinCenterY, -0.85);
    group.add(leftWin2);

    // 8. Rear Facade: Two Windows + AC compressor
    const rearWin1 = createResidentialWindow(0.85, bedWinH, mats, false, true);
    rearWin1.rotation.y = Math.PI;
    rearWin1.position.set(-0.85, bedWinCenterY, wallRearZ);
    group.add(rearWin1);

    const rearWin2 = createResidentialWindow(0.85, bedWinH, mats, isLit(4), true);
    rearWin2.rotation.y = Math.PI;
    rearWin2.position.set(0.85, bedWinCenterY, wallRearZ);
    group.add(rearWin2);

    const acC = createUtilityAcUnit(mats);
    acC.position.set(-w / 2 + 0.55, floorY + 0.40, -d / 2 - 0.16);
    group.add(acC);
  }

  return { group, dimensions };
}

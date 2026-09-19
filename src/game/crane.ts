import * as THREE from 'three';
import { FloorDimensions } from '../types';

/**
 * Helper to update a 3D cylinder mesh between two arbitrary 3D endpoints.
 * This guarantees solid, physical 3D thickness (not 1px hairlines) that
 * catches lighting, casts shadows, and remains boldly visible on high-DPI mobile screens.
 */
const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

function orientCylinder(
  mesh: THREE.Mesh,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  radius: number
) {
  _dir.subVectors(p2, p1);
  const len = _dir.length();
  if (len < 0.001) {
    mesh.visible = false;
    return;
  }
  mesh.visible = true;
  _mid.addVectors(p1, p2).multiplyScalar(0.5);
  mesh.position.copy(_mid);
  mesh.scale.set(radius, len, radius);
  mesh.quaternion.setFromUnitVectors(_up, _dir.normalize());
}

/**
 * CraneSystem
 * Implements the authentic industrial crane suspension assembly:
 * 1. Partial Crane Boom: Orange/yellow lattice truss entering from the TOP edge of the screen.
 * 2. Two Vertical Hoist Cables: Substantial 3D steel wire ropes descending from boom to hook block.
 * 3. Pulley / Hook Block: Substantial 3D industrial housing with dual sheaves, hazard chevron striping,
 *    swivel connector, and a large forged metal hook.
 * 4. Four Lifting Slings: Distinct 3D wire ropes spreading diagonally outward from the hook to the
 *    four upper corners of the building floor module, updating dynamically with floor rotation.
 */
export class CraneSystem {
  public group: THREE.Group;

  // Boom and trolley assembly
  private boomGroup: THREE.Group;
  private trolleyMesh!: THREE.Group;

  // Pulley / Hook Block
  private hookBlock: THREE.Group;

  // 3D Cylindrical Hoist Cables (2 vertical lines)
  private hoistCables: THREE.Mesh[] = [];

  // 3D Cylindrical Rigging Slings (4 diagonal lines)
  private slings: THREE.Mesh[] = [];

  // 4 Corner lifting pad-eye lugs (rendered at the floor's top corners)
  private cornerLugs: THREE.Group;

  // Off-screen anchor point coordinates for floor deliveries
  public static readonly MAST_X = 18.0;
  public static readonly MAST_Z = -3.5;

  // Reusable vectors to prevent GC allocations in animation frame
  private hookWorldPos = new THREE.Vector3();
  private hookSaddlePos = new THREE.Vector3();
  private trolleySheave1 = new THREE.Vector3();
  private trolleySheave2 = new THREE.Vector3();
  private blockSheave1 = new THREE.Vector3();
  private blockSheave2 = new THREE.Vector3();
  private cornerLocal = new THREE.Vector3();
  private cornerWorld = new THREE.Vector3();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CraneSystem';

    // Materials
    const yellowIndustrialMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.45,
      roughness: 0.35,
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const cableWireMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
    });

    // 1. Partial Crane Boom (at top of view frustum)
    this.boomGroup = this.createPartialBoom(yellowIndustrialMat, darkSteelMat);
    this.group.add(this.boomGroup);

    // 2. Pulley / Hook Block Assembly (scaled down by 18% so focus is hook + slings + module)
    this.hookBlock = this.createPulleyHookBlock(yellowIndustrialMat, darkSteelMat);
    this.hookBlock.scale.set(0.82, 0.82, 0.82);
    this.group.add(this.hookBlock);

    // 3. Two Vertical Hoist Cables (3D Cylinders with physical steel wire diameter)
    const cableGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
    for (let i = 0; i < 2; i++) {
      const cableMesh = new THREE.Mesh(cableGeo, cableWireMat);
      cableMesh.castShadow = true;
      this.hoistCables.push(cableMesh);
      this.group.add(cableMesh);
    }

    // 4. Four Diagonal Lifting Slings (3D Cylinders with physical steel wire diameter)
    const slingGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
    for (let i = 0; i < 4; i++) {
      const slingMesh = new THREE.Mesh(slingGeo, cableWireMat);
      slingMesh.castShadow = true;
      this.slings.push(slingMesh);
      this.group.add(slingMesh);
    }

    // 5. Corner lifting pad-eye lugs (4 corners of hanging floor)
    this.cornerLugs = new THREE.Group();
    const lugMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
    });
    for (let i = 0; i < 4; i++) {
      const lug = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 8, 16), lugMat);
      lug.rotation.y = Math.PI / 4;
      this.cornerLugs.add(lug);
    }
    this.group.add(this.cornerLugs);
  }

  /**
   * Stylized yellow/orange lattice truss crane boom entering from top edge of screen.
   * Only its lower chords and trolley are visible in the top 0-12% of the screen.
   */
  private createPartialBoom(yellowMat: THREE.Material, steelMat: THREE.Material): THREE.Group {
    const boom = new THREE.Group();
    boom.name = 'CraneBoom';

    // Longitudinal chord tubes spanning horizontally across upper frame
    const chordGeo = new THREE.CylinderGeometry(0.12, 0.12, 140, 8);
    chordGeo.rotateZ(Math.PI / 2);

    // Top chord
    const topChord = new THREE.Mesh(chordGeo, yellowMat);
    topChord.position.set(0, 1.6, 0);
    boom.add(topChord);

    // Two bottom chords
    const bottomChordFront = new THREE.Mesh(chordGeo, yellowMat);
    bottomChordFront.position.set(0, 0, 0.75);
    boom.add(bottomChordFront);

    const bottomChordBack = new THREE.Mesh(chordGeo, yellowMat);
    bottomChordBack.position.set(0, 0, -0.75);
    boom.add(bottomChordBack);

    // Lattice diagonal struts along the boom
    const strutMat = yellowMat;
    const strutGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.85, 6);
    for (let x = -66; x <= 66; x += 3.0) {
      // Front face diagonals
      const strutF1 = new THREE.Mesh(strutGeo, strutMat);
      strutF1.position.set(x + 0.75, 0.8, 0.38);
      strutF1.rotation.z = Math.PI / 4;
      boom.add(strutF1);

      const strutF2 = new THREE.Mesh(strutGeo, strutMat);
      strutF2.position.set(x + 2.25, 0.8, 0.38);
      strutF2.rotation.z = -Math.PI / 4;
      boom.add(strutF2);

      // Back face diagonals
      const strutB1 = new THREE.Mesh(strutGeo, strutMat);
      strutB1.position.set(x + 0.75, 0.8, -0.38);
      strutB1.rotation.z = Math.PI / 4;
      boom.add(strutB1);

      const strutB2 = new THREE.Mesh(strutGeo, strutMat);
      strutB2.position.set(x + 2.25, 0.8, -0.38);
      strutB2.rotation.z = -Math.PI / 4;
      boom.add(strutB2);

      // Bottom cross-tie struts
      const tieGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6);
      tieGeo.rotateX(Math.PI / 2);
      const tie = new THREE.Mesh(tieGeo, strutMat);
      tie.position.set(x, 0, 0);
      boom.add(tie);
    }

    // Trolley carriage that slides along bottom chords
    this.trolleyMesh = new THREE.Group();
    const trolleyBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 1.7), steelMat);
    trolleyBody.position.y = -0.22;
    this.trolleyMesh.add(trolleyBody);

    // Trolley cable guide sheaves
    const sheaveGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 16);
    sheaveGeo.rotateX(Math.PI / 2);
    const s1 = new THREE.Mesh(sheaveGeo, steelMat);
    s1.position.set(-0.25, -0.45, 0);
    this.trolleyMesh.add(s1);

    const s2 = new THREE.Mesh(sheaveGeo, steelMat);
    s2.position.set(0.25, -0.45, 0);
    this.trolleyMesh.add(s2);

    boom.add(this.trolleyMesh);

    return boom;
  }

  /**
   * Substantial 3D Industrial Crane Hook Block
   * Features:
   * - Yellow/orange industrial chassis (1.65m wide, 1.85m tall, 0.85m deep)
   * - Dark side cheek plates
   * - Dual top grooved sheaves with axle & bolts
   * - High-contrast hazard chevron warning stripes
   * - Bottom forged steel swivel shank
   * - Heavy metal connector shackle ring
   * - LARGE curved forged crane hook with safety latch
   */
  private createPulleyHookBlock(yellowMat: THREE.Material, darkSteelMat: THREE.Material): THREE.Group {
    const block = new THREE.Group();
    block.name = 'PulleyHookBlock';

    // 1. Main housing body
    const bodyGeo = new THREE.BoxGeometry(1.5, 1.7, 0.82);
    const body = new THREE.Mesh(bodyGeo, yellowMat);
    body.castShadow = true;
    block.add(body);

    // 2. Dark heavy steel side cheek plates
    const cheekGeo = new THREE.BoxGeometry(0.12, 1.8, 0.86);
    const leftCheek = new THREE.Mesh(cheekGeo, darkSteelMat);
    leftCheek.position.x = -0.76;
    block.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, darkSteelMat);
    rightCheek.position.x = 0.76;
    block.add(rightCheek);

    // 3. Hazard Chevron Warning Plate on front & back
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f59e0b'; // Bright yellow
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#0f172a'; // Deep charcoal/black
    for (let i = -256; i < 512; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 40, 128);
      ctx.lineTo(i + 20, 128);
      ctx.lineTo(i - 20, 0);
      ctx.closePath();
      ctx.fill();
    }
    const stripeTex = new THREE.CanvasTexture(canvas);
    stripeTex.wrapS = THREE.RepeatWrapping;
    const stripeMat = new THREE.MeshBasicMaterial({ map: stripeTex });

    const stripeFront = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.62), stripeMat);
    stripeFront.position.set(0, -0.25, 0.42);
    block.add(stripeFront);

    const stripeBack = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.62), stripeMat);
    stripeBack.position.set(0, -0.25, -0.42);
    stripeBack.rotation.y = Math.PI;
    block.add(stripeBack);

    // 4. "50t" Tonnage rating badge
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.28, 0.86), badgeMat);
    badge.position.set(0, 0.45, 0);
    block.add(badge);

    // 5. Dual top wire rope sheaves (pulleys)
    const sheaveGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.16, 20);
    sheaveGeo.rotateX(Math.PI / 2);

    const sheave1 = new THREE.Mesh(sheaveGeo, darkSteelMat);
    sheave1.position.set(-0.25, 0.92, 0);
    block.add(sheave1);

    const sheave2 = new THREE.Mesh(sheaveGeo, darkSteelMat);
    sheave2.position.set(0.25, 0.92, 0);
    block.add(sheave2);

    // Sheave central axle pin & hex caps
    const axleGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 12);
    axleGeo.rotateZ(Math.PI / 2);
    const axle = new THREE.Mesh(axleGeo, darkSteelMat);
    axle.position.set(0, 0.92, 0);
    block.add(axle);

    // 6. Bottom swivel shank
    const shankGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.45, 14);
    const shank = new THREE.Mesh(shankGeo, darkSteelMat);
    shank.position.y = -1.02;
    block.add(shank);

    // 7. Metal connector ring / shackle
    const ringGeo = new THREE.TorusGeometry(0.28, 0.08, 12, 24);
    const ring = new THREE.Mesh(ringGeo, darkSteelMat);
    ring.position.y = -1.35;
    block.add(ring);

    // 8. LARGE FORGED CRANE HOOK
    // Substantial curved metal hook sweeping from the connector ring down to the saddle and up to the tip
    const hookGroup = new THREE.Group();
    hookGroup.position.y = -1.35;

    // Curved hook belly and shank
    const hookTorusGeo = new THREE.TorusGeometry(0.55, 0.14, 14, 28, Math.PI * 1.4);
    const hookBelly = new THREE.Mesh(hookTorusGeo, darkSteelMat);
    hookBelly.rotation.z = -Math.PI * 0.72;
    hookBelly.position.set(0.24, -0.42, 0);
    hookGroup.add(hookBelly);

    // Hook upper shank attachment block
    const hookTop = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.4, 12), darkSteelMat);
    hookTop.position.set(0, -0.15, 0);
    hookGroup.add(hookTop);

    // Hook tapered point / tip
    const tipGeo = new THREE.ConeGeometry(0.13, 0.42, 10);
    const tip = new THREE.Mesh(tipGeo, darkSteelMat);
    tip.position.set(0.68, -0.22, 0);
    tip.rotation.z = -Math.PI / 6;
    hookGroup.add(tip);

    // Spring-loaded safety latch pin across hook mouth
    const latchGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.52, 8);
    const latch = new THREE.Mesh(
      latchGeo,
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.2,
      })
    );
    latch.position.set(0.32, -0.16, 0);
    latch.rotation.z = -Math.PI / 3;
    hookGroup.add(latch);

    block.add(hookGroup);

    return block;
  }

  /**
   * Main update function called every animation frame.
   * Updates:
   * 1. Boom position at craneY
   * 2. Trolley position along boom (trolleyX, trolleyZ)
   * 3. Pulley Block position at (hookX, hookY, hookZ)
   * 4. TWO vertical cylindrical hoist cables from trolley down to pulley block
   * 5. FOUR slender diagonal cylindrical slings from hook saddle to the four floor lifting points
   */
  public updatePosition(
    craneY: number,
    trolleyX: number,
    trolleyZ: number,
    hookY: number,
    floorGroup: THREE.Group | null,
    floorDims?: FloorDimensions,
    _unusedShowArrows: boolean = false,
    hookX?: number,
    hookZ?: number
  ) {
    const hX = hookX !== undefined ? hookX : trolleyX;
    const hZ = hookZ !== undefined ? hookZ : trolleyZ;

    // 1. Partial Boom at craneY
    this.boomGroup.position.set(0, craneY, trolleyZ);
    this.trolleyMesh.position.set(trolleyX, 0, 0);

    // 2. Pulley / Hook Block at (hX, hookY, hZ)
    this.hookWorldPos.set(hX, hookY, hZ);
    this.hookBlock.position.copy(this.hookWorldPos);
    this.hookBlock.visible = true;

    // Hook saddle point (where slings meet at bottom of the central hook)
    // Scaled by 0.82: saddleOffsetY = 1.76m
    const saddleOffsetY = 1.76;
    this.hookSaddlePos.set(hX, hookY - saddleOffsetY, hZ);

    // 3. TWO Vertical Hoist Cables:
    // From trolley guide sheaves down to the dual top sheaves of the Pulley Block
    const boomSheaveY = craneY - 0.45;
    const blockSheaveY = hookY + 0.92 * 0.82;
    const trolleySheaveSpanX = 0.25;
    const blockSheaveSpanX = 0.25 * 0.82;

    this.trolleySheave1.set(trolleyX - trolleySheaveSpanX, boomSheaveY, trolleyZ);
    this.blockSheave1.set(hX - blockSheaveSpanX, blockSheaveY, hZ);
    orientCylinder(this.hoistCables[0], this.trolleySheave1, this.blockSheave1, 0.04);

    this.trolleySheave2.set(trolleyX + trolleySheaveSpanX, boomSheaveY, trolleyZ);
    this.blockSheave2.set(hX + blockSheaveSpanX, blockSheaveY, hZ);
    orientCylinder(this.hoistCables[1], this.trolleySheave2, this.blockSheave2, 0.04);

    // 4. FOUR Lifting Slings:
    if (floorGroup && floorDims) {
      this.cornerLugs.visible = true;

      // 4 Lifting Slings Attachment Points:
      // If the module explicitly specifies 4 top lifting points (e.g. Sky Garden, future special modules),
      // use them directly. Otherwise, fall back to the module's standard four upper corners.
      let cornerOffsets: Array<{ x: number; y: number; z: number }>;
      if (floorDims.liftingPoints && floorDims.liftingPoints.length === 4) {
        cornerOffsets = floorDims.liftingPoints;
      } else {
        const halfW = floorDims.width * 0.44;
        const halfD = floorDims.depth * 0.44;
        const topY = floorDims.height / 2 + 0.04;
        cornerOffsets = [
          { x: -halfW, y: topY, z: -halfD },
          { x: halfW, y: topY, z: -halfD },
          { x: halfW, y: topY, z: halfD },
          { x: -halfW, y: topY, z: halfD },
        ];
      }

      for (let i = 0; i < 4; i++) {
        const pt = cornerOffsets[i];
        this.cornerLocal.set(pt.x, pt.y, pt.z);
        // Transform corner from floor local space to world space:
        // This ensures the slings move, sway, and rotate naturally WITH the floor!
        this.cornerWorld.copy(this.cornerLocal).applyMatrix4(floorGroup.matrixWorld);

        // Position corner pad-eye lug
        const lug = this.cornerLugs.children[i];
        if (lug) {
          lug.position.copy(this.cornerWorld);
          lug.rotation.y = floorGroup.rotation.y + Math.PI / 4;
        }

        // Orient 3D sling cylinder from central hook saddle to corner pad-eye lug
        orientCylinder(this.slings[i], this.hookSaddlePos, this.cornerWorld, 0.036);
      }
    } else {
      // FLOOR RELEASED / DROPPED:
      // The four floor attachments release immediately!
      // The four slings hang naturally loose beneath the hook saddle.
      // They do NOT stretch down after the falling floor!
      this.cornerLugs.visible = false;

      const idleSlingLen = 1.65;
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + Math.PI / 4;
        const idleEnd = new THREE.Vector3(
          this.hookSaddlePos.x + Math.cos(ang) * 0.25,
          this.hookSaddlePos.y - idleSlingLen,
          this.hookSaddlePos.z + Math.sin(ang) * 0.25
        );
        orientCylinder(this.slings[i], this.hookSaddlePos, idleEnd, 0.034);
      }
    }
  }
}

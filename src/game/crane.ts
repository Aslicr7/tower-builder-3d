import * as THREE from 'three';

export class CraneSystem {
  public group: THREE.Group;
  private craneBody: THREE.Group;
  private mastGroup: THREE.Group;
  private jibGroup: THREE.Group;
  private trolley: THREE.Group;
  private hookBlock: THREE.Group;
  private cableLines: THREE.LineSegments;
  private cableGeo: THREE.BufferGeometry;
  private hookCables: THREE.LineSegments;
  private hookCablesGeo: THREE.BufferGeometry;
  
  // Visual indicators (motion arrows matching reference image)
  private arrowGroup: THREE.Group;

  // Crane mast anchor coordinates
  public static readonly MAST_X = 13.5;
  public static readonly MAST_Z = -2.5;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CraneSystem';

    const yellowLatticeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.55,
      roughness: 0.38,
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.28,
    });
    const cabGlassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
    });

    this.craneBody = new THREE.Group();

    // 1. VERTICAL TOWER CRANE MAST (Lattice steel structure on the right edge)
    this.mastGroup = this.createLatticeMast(yellowLatticeMat, darkMetalMat);
    this.craneBody.add(this.mastGroup);

    // 2. OPERATOR CABIN
    const cabin = this.createOperatorCabin(yellowLatticeMat, darkMetalMat, cabGlassMat);
    cabin.position.set(CraneSystem.MAST_X - 1.4, 0, CraneSystem.MAST_Z + 1.2);
    this.craneBody.add(cabin);

    // 3. HORIZONTAL JIB (Lattice boom extending across upper sky)
    this.jibGroup = this.createLatticeJib(yellowLatticeMat, darkMetalMat);
    this.craneBody.add(this.jibGroup);

    // 4. CRANE BANNER ("SKY HAS NO LIMIT")
    const banner = this.createCraneBanner();
    banner.position.set(CraneSystem.MAST_X + 0.1, -12, CraneSystem.MAST_Z + 1.55);
    this.craneBody.add(banner);

    // 5. TROLLEY (Moves horizontally along the jib)
    this.trolley = this.createTrolley(yellowLatticeMat, darkMetalMat);
    this.craneBody.add(this.trolley);

    // 6. PULLEY HOOK BLOCK with hazard stripes
    this.hookBlock = this.createHookBlock(yellowLatticeMat, darkMetalMat);
    this.group.add(this.hookBlock);

    this.group.add(this.craneBody);

    // Hoist cables (trolley down to pulley block)
    const hoistVerts = new Float32Array(4 * 3);
    this.cableGeo = new THREE.BufferGeometry();
    this.cableGeo.setAttribute('position', new THREE.BufferAttribute(hoistVerts, 3));
    this.cableLines = new THREE.LineSegments(
      this.cableGeo,
      new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 })
    );
    this.group.add(this.cableLines);

    // 4 Corner Rigging Slings (hook down to 4 corners of the floor module)
    const hookSlingVerts = new Float32Array(8 * 3);
    this.hookCablesGeo = new THREE.BufferGeometry();
    this.hookCablesGeo.setAttribute('position', new THREE.BufferAttribute(hookSlingVerts, 3));
    this.hookCables = new THREE.LineSegments(
      this.hookCablesGeo,
      new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 2 })
    );
    this.group.add(this.hookCables);

    // Motion arrows
    this.arrowGroup = this.createArrowHints();
    this.group.add(this.arrowGroup);
  }

  private createLatticeMast(yellowMat: THREE.Material, darkMat: THREE.Material): THREE.Group {
    const mast = new THREE.Group();
    const mastX = CraneSystem.MAST_X;
    const mastZ = CraneSystem.MAST_Z;
    const mastW = 2.4;
    const mastH = 120; // Reaches from far below to the slewing head

    // 4 Main corner chord columns
    const chordGeo = new THREE.BoxGeometry(0.2, mastH, 0.2);
    const halfW = mastW / 2;
    const offsets = [
      [-halfW, -halfW],
      [halfW, -halfW],
      [halfW, halfW],
      [-halfW, halfW],
    ];

    offsets.forEach(([ox, oz]) => {
      const col = new THREE.Mesh(chordGeo, yellowMat);
      col.position.set(mastX + ox, -mastH / 2 + 1, mastZ + oz);
      col.castShadow = true;
      mast.add(col);
    });

    // Cross bracings (X pattern along mast panels)
    const panelCount = 28;
    const panelH = mastH / panelCount;
    const strutMat = darkMat;

    for (let p = 0; p < panelCount; p++) {
      const py = -mastH + p * panelH + panelH / 2 + 1;
      // Horizontal ring frames
      const ringGeoX = new THREE.BoxGeometry(mastW, 0.12, 0.12);
      const ringGeoZ = new THREE.BoxGeometry(0.12, 0.12, mastW);

      const rFront = new THREE.Mesh(ringGeoX, strutMat);
      rFront.position.set(mastX, py, mastZ + halfW);
      mast.add(rFront);

      const rBack = new THREE.Mesh(ringGeoX, strutMat);
      rBack.position.set(mastX, py, mastZ - halfW);
      mast.add(rBack);

      const rLeft = new THREE.Mesh(ringGeoZ, strutMat);
      rLeft.position.set(mastX - halfW, py, mastZ);
      mast.add(rLeft);

      const rRight = new THREE.Mesh(ringGeoZ, strutMat);
      rRight.position.set(mastX + halfW, py, mastZ);
      mast.add(rRight);

      // Diagonal X cross
      const diagLen = Math.sqrt(mastW * mastW + panelH * panelH);
      const diagGeo = new THREE.BoxGeometry(0.08, diagLen, 0.08);
      const angle = Math.atan2(panelH, mastW);

      // Front face X
      const d1 = new THREE.Mesh(diagGeo, yellowMat);
      d1.position.set(mastX, py, mastZ + halfW);
      d1.rotation.z = angle - Math.PI / 2;
      mast.add(d1);

      const d2 = new THREE.Mesh(diagGeo, yellowMat);
      d2.position.set(mastX, py, mastZ + halfW);
      d2.rotation.z = Math.PI / 2 - angle;
      mast.add(d2);
    }

    return mast;
  }

  private createOperatorCabin(yellowMat: THREE.Material, darkMat: THREE.Material, glassMat: THREE.Material): THREE.Group {
    const cab = new THREE.Group();

    // Cabin body
    const bodyGeo = new THREE.BoxGeometry(1.6, 2.2, 1.8);
    const body = new THREE.Mesh(bodyGeo, yellowMat);
    body.castShadow = true;
    cab.add(body);

    // Front panoramic window
    const winGeo = new THREE.BoxGeometry(1.62, 1.2, 1.0);
    const win = new THREE.Mesh(winGeo, glassMat);
    win.position.set(0, 0.3, 0.45);
    cab.add(win);

    // Access walkway and safety rails
    const walkGeo = new THREE.BoxGeometry(2.0, 0.1, 2.2);
    const walk = new THREE.Mesh(walkGeo, darkMat);
    walk.position.y = -1.15;
    cab.add(walk);

    return cab;
  }

  private createLatticeJib(yellowMat: THREE.Material, darkMat: THREE.Material): THREE.Group {
    const jib = new THREE.Group();
    const mastX = CraneSystem.MAST_X;
    const mastZ = CraneSystem.MAST_Z;

    // Apex cathead (A-frame tower atop crane mast)
    const apexH = 7.0;
    const apexGeo = new THREE.ConeGeometry(1.5, apexH, 4);
    const apex = new THREE.Mesh(apexGeo, yellowMat);
    apex.position.set(mastX, apexH / 2, mastZ);
    apex.rotation.y = Math.PI / 4;
    jib.add(apex);

    // Main boom (horizontal triangular truss) extending left
    const boomLen = 36.0;
    const boomGeo = new THREE.BoxGeometry(boomLen, 0.9, 0.9);
    const boom = new THREE.Mesh(boomGeo, yellowMat);
    boom.castShadow = true;
    // Boom centers such that it spans from over tower (x ~ -8) to mast (x = 13.5) and counter-jib (x = 20)
    boom.position.set(mastX - boomLen * 0.38, 0, mastZ);
    jib.add(boom);

    // Lower guide rails for trolley
    const railGeo = new THREE.BoxGeometry(boomLen, 0.1, 0.6);
    const rail = new THREE.Mesh(railGeo, darkMat);
    rail.position.set(boom.position.x, -0.48, mastZ);
    jib.add(rail);

    // Counterweight blocks at rear
    const weightGeo = new THREE.BoxGeometry(4.2, 2.2, 1.8);
    const weight = new THREE.Mesh(weightGeo, darkMat);
    weight.position.set(mastX + 7.5, -0.2, mastZ);
    weight.castShadow = true;
    jib.add(weight);

    // Tension tie cables from apex top to front boom & counterweight
    const tieMat = new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 2 });
    const tieGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(mastX, apexH, mastZ),
      new THREE.Vector3(mastX - 18, 0.45, mastZ),
      new THREE.Vector3(mastX, apexH, mastZ),
      new THREE.Vector3(mastX + 8.5, 0.45, mastZ),
    ]);
    const ties = new THREE.LineSegments(tieGeo, tieMat);
    jib.add(ties);

    return jib;
  }

  private createCraneBanner(): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    // Deep blue background matching reference image
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 768);

    // Gold border line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 236, 748);

    // Stylized building icon
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(90, 80, 24, 90);
    ctx.fillRect(122, 50, 28, 120);
    ctx.fillRect(158, 100, 24, 70);

    // Typography matching reference: "SKY HAS NO LIMIT"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SKY', 128, 250);
    ctx.fillText('HAS', 128, 310);
    ctx.fillText('NO', 128, 370);
    ctx.fillText('LIMIT', 128, 430);

    // Secondary subtext
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('TOWER 3D', 128, 520);
    ctx.fillText('BUILD HIGHER', 128, 560);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.4,
      metalness: 0.1,
    });

    const bannerGeo = new THREE.PlaneGeometry(2.4, 7.2);
    const banner = new THREE.Mesh(bannerGeo, mat);
    banner.castShadow = true;
    return banner;
  }

  private createTrolley(yellowMat: THREE.Material, darkMat: THREE.Material): THREE.Group {
    const tGroup = new THREE.Group();
    // Trolley frame
    const frameGeo = new THREE.BoxGeometry(1.8, 0.4, 1.2);
    const frame = new THREE.Mesh(frameGeo, yellowMat);
    frame.castShadow = true;
    tGroup.add(frame);

    // Trolley wheels
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.15, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    [-0.6, 0.6].forEach((wx) => {
      [-0.55, 0.55].forEach((wz) => {
        const wheel = new THREE.Mesh(wheelGeo, darkMat);
        wheel.position.set(wx, 0.15, wz);
        tGroup.add(wheel);
      });
    });

    return tGroup;
  }

  private createHookBlock(yellowMat: THREE.Material, darkMat: THREE.Material): THREE.Group {
    const block = new THREE.Group();

    // Main pulley block body
    const bodyGeo = new THREE.BoxGeometry(0.9, 1.1, 0.7);
    const body = new THREE.Mesh(bodyGeo, yellowMat);
    body.castShadow = true;
    block.add(body);

    // Hazard chevron stripes texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#111827';
    for (let i = -128; i < 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 32, 128);
      ctx.lineTo(i + 16, 128);
      ctx.lineTo(i - 16, 0);
      ctx.closePath();
      ctx.fill();
    }
    const stripeTex = new THREE.CanvasTexture(canvas);
    const stripeMat = new THREE.MeshBasicMaterial({ map: stripeTex });
    const stripeBand = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.4, 0.72), stripeMat);
    block.add(stripeBand);

    // Sheaves / pulleys
    const sheaveGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 16);
    sheaveGeo.rotateX(Math.PI / 2);
    const sheave = new THREE.Mesh(sheaveGeo, darkMat);
    sheave.position.y = 0.35;
    block.add(sheave);

    // Heavy steel hook loop
    const hookTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.08, 10, 20, Math.PI * 1.5),
      darkMat
    );
    hookTorus.position.y = -0.7;
    hookTorus.rotation.z = -Math.PI / 4;
    block.add(hookTorus);

    return block;
  }

  private createArrowHints(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'CraneMotionArrows';

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 128);

    // Soft glowing white arrows matching reference UI
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 12;

    // Left arrow
    ctx.beginPath();
    ctx.moveTo(30, 64);
    ctx.lineTo(70, 34);
    ctx.lineTo(70, 52);
    ctx.lineTo(110, 52);
    ctx.lineTo(110, 76);
    ctx.lineTo(70, 76);
    ctx.lineTo(70, 94);
    ctx.closePath();
    ctx.fill();

    // Right arrow
    ctx.beginPath();
    ctx.moveTo(226, 64);
    ctx.lineTo(186, 34);
    ctx.lineTo(186, 52);
    ctx.lineTo(146, 52);
    ctx.lineTo(146, 76);
    ctx.lineTo(186, 76);
    ctx.lineTo(186, 94);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), mat);
    plane.position.set(0, 1.4, 0);
    group.add(plane);

    return group;
  }

  public updatePosition(
    craneY: number,
    trolleyX: number,
    trolleyZ: number,
    hookY: number,
    floorGroup: THREE.Group | null,
    floorDims?: { width: number; depth: number; height: number },
    isHanging: boolean = true
  ) {
    // Elevate crane body with construction height
    this.craneBody.position.set(0, craneY + 4.5, 0);
    // Trolley rides on boom rail at trolleyX, CraneSystem.MAST_Z
    this.trolley.position.set(trolleyX, -0.65, CraneSystem.MAST_Z);

    if (isHanging && floorGroup && floorDims) {
      this.hookBlock.visible = true;
      this.cableLines.visible = true;
      this.hookCables.visible = true;
      this.arrowGroup.visible = true;

      const hookPos = new THREE.Vector3(trolleyX, hookY, trolleyZ);
      this.hookBlock.position.copy(hookPos);

      // Hoist cables: trolley bottom -> hook block top
      const hoistPositions = this.cableGeo.attributes.position.array as Float32Array;
      const tY = craneY + 4.5 - 0.65;
      hoistPositions[0] = trolleyX - 0.15;
      hoistPositions[1] = tY;
      hoistPositions[2] = CraneSystem.MAST_Z;
      hoistPositions[3] = trolleyX - 0.15;
      hoistPositions[4] = hookY + 0.55;
      hoistPositions[5] = trolleyZ;

      hoistPositions[6] = trolleyX + 0.15;
      hoistPositions[7] = tY;
      hoistPositions[8] = CraneSystem.MAST_Z;
      hoistPositions[9] = trolleyX + 0.15;
      hoistPositions[10] = hookY + 0.55;
      hoistPositions[11] = trolleyZ;
      this.cableGeo.attributes.position.needsUpdate = true;

      // 4 Corner Slings: hook loop -> floor top corners
      const slingPositions = this.hookCablesGeo.attributes.position.array as Float32Array;
      const fPos = floorGroup.position;
      const fRot = floorGroup.rotation.y;
      const cosR = Math.cos(fRot);
      const sinR = Math.sin(fRot);

      const halfW = floorDims.width * 0.44;
      const halfD = floorDims.depth * 0.44;
      const topY = fPos.y + floorDims.height / 2 + 0.05;

      const corners = [
        [-halfW, halfD],
        [halfW, halfD],
        [halfW, -halfD],
        [-halfW, -halfD],
      ];

      corners.forEach(([ox, oz], i) => {
        const rx = ox * cosR - oz * sinR;
        const rz = ox * sinR + oz * cosR;
        const idx = i * 6;
        slingPositions[idx] = hookPos.x;
        slingPositions[idx + 1] = hookPos.y - 0.65;
        slingPositions[idx + 2] = hookPos.z;
        slingPositions[idx + 3] = fPos.x + rx;
        slingPositions[idx + 4] = topY;
        slingPositions[idx + 5] = fPos.z + rz;
      });
      this.hookCablesGeo.attributes.position.needsUpdate = true;

      // Position directional arrows above the block
      this.arrowGroup.position.set(fPos.x, fPos.y + floorDims.height / 2 + 1.25, fPos.z + 1.2);
    } else {
      this.hookCables.visible = false;
      this.arrowGroup.visible = false;
      this.hookBlock.position.set(trolleyX, craneY + 2.8, CraneSystem.MAST_Z);

      const hoistPositions = this.cableGeo.attributes.position.array as Float32Array;
      hoistPositions[0] = trolleyX;
      hoistPositions[1] = craneY + 3.8;
      hoistPositions[2] = CraneSystem.MAST_Z;
      hoistPositions[3] = trolleyX;
      hoistPositions[4] = craneY + 3.2;
      hoistPositions[5] = CraneSystem.MAST_Z;
      hoistPositions[6] = trolleyX;
      hoistPositions[7] = craneY + 3.8;
      hoistPositions[8] = CraneSystem.MAST_Z;
      hoistPositions[9] = trolleyX;
      hoistPositions[10] = craneY + 3.2;
      hoistPositions[11] = CraneSystem.MAST_Z;
      this.cableGeo.attributes.position.needsUpdate = true;
    }
  }
}

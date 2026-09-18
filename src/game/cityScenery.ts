import * as THREE from 'three';

export class CityScenery {
  public group: THREE.Group;
  private clouds: THREE.Group[] = [];
  private trafficMesh: THREE.InstancedMesh | null = null;
  private trafficData: { x: number; z: number; speed: number; laneY: number }[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CityScenery';

    this.createSkyAndAtmosphere();
    this.createGroundAndRiver();
    this.createMidgroundCity();
    this.createDistantSkyline();
    this.createDistantMountains();
    this.createClouds();
    this.createTraffic();
  }

  private createSkyAndAtmosphere() {
    // Beautiful sky hemisphere dome with golden afternoon horizon and bright azure zenith
    const skyGeo = new THREE.SphereGeometry(450, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x38bdf8) }, // Bright azure sky
        horizonColor: { value: new THREE.Color(0xfef08a) }, // Warm sunny golden horizon
        groundHaze: { value: new THREE.Color(0xdbeafe) },
        sunPosition: { value: new THREE.Vector3(120, 90, -180).normalize() },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 groundHaze;
        uniform vec3 sunPosition;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = dir.y;
          
          // Smooth sky blend
          vec3 sky = mix(horizonColor, topColor, max(pow(max(h, 0.0), 0.45), 0.0));
          if (h < 0.0) {
            sky = mix(horizonColor, groundHaze, min(pow(-h, 0.5), 1.0));
          }
          
          // Radiant warm sun disk & glare
          float sunDot = max(dot(dir, sunPosition), 0.0);
          vec3 sunGlow = vec3(1.0, 0.92, 0.7) * (pow(sunDot, 64.0) * 1.5 + pow(sunDot, 10.0) * 0.4);
          
          gl_FragColor = vec4(sky + sunGlow, 1.0);
        }
      `,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.group.add(skyMesh);
  }

  private createGroundAndRiver() {
    // Ground plane with warm sunny city terrain
    const groundGeo = new THREE.PlaneGeometry(600, 600, 16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Cool tarmac / city base
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -6.05;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Green city park areas around the river banks
    const parkMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e, // Fresh park greenery
      roughness: 0.85,
      metalness: 0.0,
    });
    const parkGeo = new THREE.PlaneGeometry(35, 450);
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.rotation.x = -Math.PI / 2;
    park.rotation.z = 0.28;
    park.position.set(25, -6.03, 0);
    this.group.add(park);

    // Winding sparkling river (positioned safely away from tower)
    const riverGeo = new THREE.PlaneGeometry(40, 500);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Reflective azure water
      roughness: 0.12,
      metalness: 0.88,
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.rotation.z = 0.28;
    river.position.set(55, -6.0, 0);
    this.group.add(river);

    // Suspension bridges spanning the river
    [-75, 10, 95].forEach((zPos) => {
      const bridgeGroup = new THREE.Group();
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(65, 1.0, 6),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 })
      );
      deck.position.set(55, -5.2, zPos);
      deck.rotation.y = -0.28;
      bridgeGroup.add(deck);

      // Bridge pylons
      const pylonGeo = new THREE.BoxGeometry(1.4, 18, 1.4);
      const pMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 });
      const p1 = new THREE.Mesh(pylonGeo, pMat);
      p1.position.set(45, 2.0, zPos - 3);
      bridgeGroup.add(p1);

      const p2 = new THREE.Mesh(pylonGeo, pMat);
      p2.position.set(65, 2.0, zPos + 3);
      bridgeGroup.add(p2);

      this.group.add(bridgeGroup);
    });
  }

  private createMidgroundCity() {
    // Midground city: positioned at radius 42 to 110 so it NEVER crowds or clips the camera
    const count = 90;
    const bGeo = new THREE.BoxGeometry(1, 1, 1);
    const bMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.55,
      metalness: 0.15,
    });

    const instMesh = new THREE.InstancedMesh(bGeo, bMat, count);
    instMesh.castShadow = true;
    instMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    const colors = [
      0x94a3b8, // Light modern slate
      0x38bdf8, // Glass reflection
      0xf1f5f9, // Clean white tower
      0xd4d4d8, // Concrete highrise
      0xfde047, // Golden lit windows
      0x0284c7, // Deep azure
    ];

    let idx = 0;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.15;
      // Strict radius buffer: keeps camera completely free of any building collision!
      const radius = 42 + Math.random() * 65;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const isHighrise = Math.random() > 0.55;
      const height = isHighrise ? 28 + Math.random() * 55 : 12 + Math.random() * 22;
      const width = 8 + Math.random() * 8;
      const depth = 8 + Math.random() * 8;

      dummy.position.set(x, -6.0 + height / 2, z);
      dummy.scale.set(width, height, depth);
      dummy.rotation.y = (Math.PI / 4) * (i % 4);
      dummy.updateMatrix();

      instMesh.setMatrixAt(idx, dummy.matrix);
      color.setHex(colors[i % colors.length]);
      instMesh.setColorAt(idx, color);
      idx++;
    }

    instMesh.instanceMatrix.needsUpdate = true;
    if (instMesh.instanceColor) instMesh.instanceColor.needsUpdate = true;
    this.group.add(instMesh);
  }

  private createDistantSkyline() {
    // Distant futuristic skyline with slender spires (radius 120-220)
    const count = 75;
    const bGeo = new THREE.BoxGeometry(1, 1, 1);
    const bMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd, // Soft atmospheric blue
      roughness: 0.4,
      metalness: 0.3,
    });

    const instMesh = new THREE.InstancedMesh(bGeo, bMat, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 120 + Math.random() * 100;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const height = 40 + Math.random() * 85;
      const width = 10 + Math.random() * 14;
      const depth = 10 + Math.random() * 14;

      dummy.position.set(x, -6.0 + height / 2, z);
      dummy.scale.set(width, height, depth);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();

      instMesh.setMatrixAt(i, dummy.matrix);
    }

    instMesh.instanceMatrix.needsUpdate = true;
    this.group.add(instMesh);

    // Iconic Supertall Spire in the distance (matching reference image)
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 4.5, 125, 8),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.95,
      })
    );
    spire.position.set(-85, 52, -150);
    this.group.add(spire);
  }

  private createDistantMountains() {
    // Majestic mountain ridges along the horizon (radius 260-320)
    const mCount = 14;
    const mMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Atmospheric blue-grey mountains
      roughness: 0.95,
      metalness: 0.05,
    });

    for (let i = 0; i < mCount; i++) {
      const angle = (i / mCount) * Math.PI * 1.6 - 0.9;
      const dist = 270 + Math.random() * 40;
      const mHeight = 55 + Math.random() * 70;
      const mRadius = 45 + Math.random() * 50;

      const coneGeo = new THREE.ConeGeometry(mRadius, mHeight, 7);
      const mountain = new THREE.Mesh(coneGeo, mMat);
      mountain.position.set(Math.cos(angle) * dist, -6 + mHeight / 2 - 10, Math.sin(angle) * dist);
      this.group.add(mountain);
    }
  }

  private createClouds() {
    // Soft, fluffy atmospheric clouds
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
    });

    for (let c = 0; c < 18; c++) {
      const cloudPuff = new THREE.Group();
      const puffCount = 4 + Math.floor(Math.random() * 4);

      for (let p = 0; p < puffCount; p++) {
        const rad = 4.0 + Math.random() * 6.0;
        const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(rad, 1), cloudMat);
        sphere.position.set(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 12
        );
        cloudPuff.add(sphere);
      }

      const angle = Math.random() * Math.PI * 2;
      const dist = 38 + Math.random() * 120;
      const altitude = 16 + Math.random() * 90;

      cloudPuff.position.set(Math.cos(angle) * dist, altitude, Math.sin(angle) * dist);
      this.group.add(cloudPuff);
      this.clouds.push(cloudPuff);
    }
  }

  private createTraffic() {
    // Flowing highway traffic with illuminated headlights
    const count = 50;
    const carGeo = new THREE.BoxGeometry(0.8, 0.4, 1.4);
    const carMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // warm headlights

    this.trafficMesh = new THREE.InstancedMesh(carGeo, carMat, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const lane = i % 2 === 0 ? 1 : -1;
      const x = (Math.random() - 0.5) * 200;
      const z = -20 + lane * 18 + (Math.random() - 0.5) * 6;
      const speed = (0.25 + Math.random() * 0.35) * lane;

      this.trafficData.push({ x, z, speed, laneY: -5.8 });
      dummy.position.set(x, -5.8, z);
      dummy.updateMatrix();
      this.trafficMesh.setMatrixAt(i, dummy.matrix);
    }

    this.trafficMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.trafficMesh);
  }

  public update(delta: number) {
    // Drift clouds
    this.clouds.forEach((cloud, idx) => {
      cloud.position.x += delta * (0.9 + (idx % 3) * 0.5);
      if (cloud.position.x > 220) {
        cloud.position.x = -220;
      }
    });

    // Move traffic lights along road
    if (this.trafficMesh) {
      const dummy = new THREE.Object3D();
      this.trafficData.forEach((car, i) => {
        car.x += car.speed * delta * 22;
        if (car.x > 110) car.x = -110;
        if (car.x < -110) car.x = 110;

        dummy.position.set(car.x, car.laneY, car.z);
        dummy.updateMatrix();
        this.trafficMesh!.setMatrixAt(i, dummy.matrix);
      });
      this.trafficMesh.instanceMatrix.needsUpdate = true;
    }
  }
}

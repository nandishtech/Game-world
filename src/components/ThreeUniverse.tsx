import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeUniverseProps {
  className?: string;
}

export const ThreeUniverse: React.FC<ThreeUniverseProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 22, 45);
    camera.lookAt(0, 0, 0);

    // 2. Renderer with Shadow Map support
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Array to track textures for leak-free disposal
    const texturesToDispose: THREE.Texture[] = [];

    // Helper to format hex colors
    const colorToHexStr = (color: number) => {
      return '#' + color.toString(16).padStart(6, '0');
    };

    // Helper to generate detailed procedural textures using HTML5 Canvas
    const createPlanetTexture = (planetName: string, baseHex: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const baseColor = colorToHexStr(baseHex);
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (planetName === 'Mercury') {
        // Cratered, dusty gray surface
        for (let i = 0; i < 350; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const r = 2 + Math.random() * 8;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.arc(x + 1, y + 1, r - 1, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (planetName === 'Venus') {
        // Swirling golden-orange acidic cloud cover
        for (let y = 0; y < canvas.height; y += 2) {
          const alpha = 0.1 + Math.sin(y * 0.02) * 0.15;
          ctx.fillStyle = `rgba(235, 172, 85, ${alpha})`;
          ctx.fillRect(0, y, canvas.width, 2);
        }
        for (let i = 0; i < 12; i++) {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
          grad.addColorStop(0, 'rgba(247, 218, 176, 0.05)');
          grad.addColorStop(0.5, 'rgba(212, 144, 57, 0.15)');
          grad.addColorStop(1, 'rgba(247, 218, 176, 0.05)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 40 + Math.random() * 60);
        }
      } else if (planetName === 'Earth') {
        // Earth oceans
        ctx.fillStyle = '#0b2545';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Continental masses
        ctx.fillStyle = '#1b4332';
        for (let j = 0; j < 8; j++) {
          const cx = Math.random() * canvas.width;
          const cy = 0.2 * canvas.height + Math.random() * 0.6 * canvas.height;
          const r = 90 + Math.random() * 110;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#40916c';
          for (let k = 0; k < 10; k++) {
            ctx.beginPath();
            ctx.arc(cx + (Math.random() - 0.5) * r, cy + (Math.random() - 0.5) * r, r * 0.45, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#1b4332';
        }

        // Polar ice caps
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, 50);
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
      } else if (planetName === 'Mars') {
        // Red deserts with dark volcanic valleys and polar caps
        ctx.fillStyle = '#a83200';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#5c1d00';
        for (let i = 0; i < 15; i++) {
          const rx = Math.random() * canvas.width;
          const ry = 0.2 * canvas.height + Math.random() * 0.6 * canvas.height;
          ctx.beginPath();
          ctx.arc(rx, ry, 60 + Math.random() * 80, 0, Math.PI * 2);
          ctx.fill();
        }

        // White caps
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 0, 40, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height, 40, Math.PI, 0);
        ctx.fill();
      } else if (planetName === 'Jupiter') {
        // Gas bands and Red Spot
        const bands = ['#4a2c11', '#9e6b43', '#d4b28c', '#6b3f19', '#f0e0c9', '#573314'];
        let y = 0;
        while (y < canvas.height) {
          ctx.fillStyle = bands[Math.floor(Math.random() * bands.length)];
          const h = 20 + Math.floor(Math.random() * 35);
          ctx.fillRect(0, y, canvas.width, h);
          y += h;
        }

        // Great Red Spot storm
        ctx.fillStyle = '#9e2a2b';
        ctx.beginPath();
        ctx.ellipse(0.62 * canvas.width, 0.68 * canvas.height, 60, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#571818';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0.62 * canvas.width, 0.68 * canvas.height, 63, 38, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (planetName === 'Saturn') {
        // Pastel golden stripes
        const saturnBands = ['#dfc28c', '#e7cba0', '#c89d67', '#dcb782', '#eed1a6'];
        let y = 0;
        while (y < canvas.height) {
          ctx.fillStyle = saturnBands[Math.floor(Math.random() * saturnBands.length)];
          const h = 15 + Math.floor(Math.random() * 30);
          ctx.fillRect(0, y, canvas.width, h);
          y += h;
        }
      } else if (planetName === 'Uranus') {
        // Smooth blue-green icy methane gradient
        ctx.fillStyle = '#6fa8dc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0.3 * canvas.height, canvas.width, 80);
      }

      // Realistic granularity/sand noise
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixelArr = imgData.data;
      for (let i = 0; i < pixelArr.length; i += 4) {
        const noise = (Math.random() - 0.5) * 8;
        pixelArr[i] = Math.max(0, Math.min(255, pixelArr[i] + noise));
        pixelArr[i + 1] = Math.max(0, Math.min(255, pixelArr[i + 1] + noise));
        pixelArr[i + 2] = Math.max(0, Math.min(255, pixelArr[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texturesToDispose.push(texture);
      return texture;
    };

    // Realistic Sun Flare/Plasma Texture
    const createSunTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#ff4500');
      grad.addColorStop(0.3, '#ffcc00');
      grad.addColorStop(0.5, '#fff3e0');
      grad.addColorStop(0.7, '#ffcc00');
      grad.addColorStop(1, '#ff4500');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 12 + Math.random() * 20, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texturesToDispose.push(texture);
      return texture;
    };

    // Saturn Cassini Ring texture
    const createRingTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, 'rgba(100, 90, 80, 0)');
      grad.addColorStop(0.15, 'rgba(175, 160, 145, 0.45)');
      grad.addColorStop(0.35, 'rgba(215, 200, 180, 0.7)');
      grad.addColorStop(0.44, 'rgba(90, 80, 70, 0.05)'); // Cassini Division
      grad.addColorStop(0.48, 'rgba(230, 215, 195, 0.75)');
      grad.addColorStop(0.7, 'rgba(195, 180, 165, 0.55)');
      grad.addColorStop(0.9, 'rgba(165, 150, 135, 0.25)');
      grad.addColorStop(1, 'rgba(100, 90, 80, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const texture = new THREE.CanvasTexture(canvas);
      texturesToDispose.push(texture);
      return texture;
    };

    // 3. Realistic Astro Lighting
    const spaceLight = new THREE.AmbientLight(0x0c0c1b, 0.75);
    scene.add(spaceLight);

    const sunLight = new THREE.PointLight(0xffedd5, 3.5, 180, 0.45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.bias = -0.002;
    scene.add(sunLight);

    // 4. Logarithmic Spiral Galaxy Particle System
    const starCount = 4500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const numArms = 4;
    const armFactor = (2 * Math.PI) / numArms;

    for (let i = 0; i < starCount; i++) {
      const isCore = Math.random() < 0.25;
      
      if (isCore) {
        const r = Math.pow(Math.random(), 1.5) * 4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
        starPositions[i * 3 + 2] = r * Math.cos(phi);

        starColors[i * 3] = 1.0; 
        starColors[i * 3 + 1] = 0.8 + Math.random() * 0.2; 
        starColors[i * 3 + 2] = 0.5 + Math.random() * 0.3; 
      } else {
        const armIndex = i % numArms;
        const theta = Math.pow(Math.random(), 0.8) * 12.0; 
        const distance = 3.5 + theta * 2.8; 
        
        const spreadX = (Math.random() - 0.5) * 3.5 * (1.0 - theta / 15.0);
        const spreadY = (Math.random() - 0.5) * 0.8 * (1.0 - theta / 15.0);
        const spreadZ = (Math.random() - 0.5) * 3.5 * (1.0 - theta / 15.0);
        
        const angle = theta + armIndex * armFactor;
        
        starPositions[i * 3] = Math.cos(angle) * distance + spreadX;
        starPositions[i * 3 + 1] = spreadY;
        starPositions[i * 3 + 2] = Math.sin(angle) * distance + spreadZ;

        const ratio = distance / 45.0;
        starColors[i * 3] = 0.3 + ratio * 0.5; 
        starColors[i * 3 + 1] = 0.2 + (1.0 - ratio) * 0.2; 
        starColors[i * 3 + 2] = 0.85 + ratio * 0.15; 
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const galaxy = new THREE.Points(starGeometry, starMaterial);
    scene.add(galaxy);

    // 5. High-fidelity Sun Core with realistic plasma mapping
    const sunTexture = createSunTexture();
    const sunGeo = new THREE.SphereGeometry(2.4, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture || undefined,
      color: 0xfff3e0,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Solar Corona Atmosphere
    const coronaGeo = new THREE.SphereGeometry(2.6, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(corona);

    // 6. Asteroid Belt
    const asteroidCount = 400;
    const asteroidGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const asteroidMaterial = new THREE.MeshPhongMaterial({
      color: 0x7a7268,
      shininess: 0,
    });
    const asteroidGroup = new THREE.Group();

    const asteroids: { mesh: THREE.Mesh; orbit: number; speed: number; angle: number }[] = [];

    for (let k = 0; k < asteroidCount; k++) {
      const orbitDistance = 19.5 + (Math.random() - 0.5) * 2.5;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.1;
      
      const rock = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      rock.scale.set(
        0.5 + Math.random() * 1.2,
        0.5 + Math.random() * 1.2,
        0.5 + Math.random() * 1.2
      );

      const rx = Math.cos(angle) * orbitDistance;
      const rz = Math.sin(angle) * orbitDistance;
      const ry = (Math.random() - 0.5) * 0.3; 
      
      rock.position.set(rx, ry, rz);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      asteroidGroup.add(rock);
      asteroids.push({ mesh: rock, orbit: orbitDistance, speed, angle });
    }
    scene.add(asteroidGroup);

    // 7. Orbiting Planets Configuration
    interface PlanetConfig {
      name: string;
      radius: number;
      orbitDistance: number;
      speed: number;
      color: number;
      specular: number;
      shininess: number;
      tilt: number; 
      hasRings?: boolean;
      hasAtmosphere?: boolean;
      moons?: { radius: number; orbit: number; speed: number; color: number }[];
    }

    const PLANETS_DATA: PlanetConfig[] = [
      { name: 'Mercury', radius: 0.32, orbitDistance: 6.0, speed: 1.5, color: 0x7c7c8c, specular: 0x222222, shininess: 10, tilt: 0.001 },
      { name: 'Venus', radius: 0.56, orbitDistance: 9.5, speed: 1.0, color: 0xe2c792, specular: 0x111111, shininess: 2, tilt: 0.05 },
      { 
        name: 'Earth', 
        radius: 0.62, 
        orbitDistance: 13.0, 
        speed: 0.75, 
        color: 0x1c3d5a, 
        specular: 0x555555, 
        shininess: 30, 
        tilt: 0.41, 
        hasAtmosphere: true,
        moons: [{ radius: 0.12, orbit: 1.2, speed: 2.2, color: 0x999999 }]
      },
      { 
        name: 'Mars', 
        radius: 0.48, 
        orbitDistance: 16.5, 
        speed: 0.6, 
        color: 0xc1440e, 
        specular: 0x332211, 
        shininess: 15, 
        tilt: 0.44, 
        moons: [
          { radius: 0.06, orbit: 0.8, speed: 3.5, color: 0x777777 }, 
          { radius: 0.04, orbit: 1.1, speed: 2.5, color: 0x555555 }  
        ]
      },
      { name: 'Jupiter', radius: 1.25, orbitDistance: 23.0, speed: 0.35, color: 0xb07f35, specular: 0x333333, shininess: 5, tilt: 0.05 },
      { name: 'Saturn', radius: 1.02, orbitDistance: 30.5, speed: 0.25, color: 0xe2bf7d, specular: 0x444444, shininess: 15, tilt: 0.47, hasRings: true },
      { name: 'Uranus', radius: 0.72, orbitDistance: 37.0, speed: 0.18, color: 0x82b3c9, specular: 0x223344, shininess: 20, tilt: 1.70 } 
    ];

    const planets: {
      mesh: THREE.Mesh;
      orbit: number;
      speed: number;
      angle: number;
      tilt: number;
      moons: THREE.Mesh[];
      moonAngles: number[];
      moonOrbits: number[];
      moonSpeeds: number[];
      ringMesh?: THREE.Mesh;
      atmosphere?: THREE.Mesh;
      cloudsMesh?: THREE.Mesh;
    }[] = [];

    PLANETS_DATA.forEach((data) => {
      // Orbit Line Grid
      const orbitGeo = new THREE.BufferGeometry();
      const orbitPoints: THREE.Vector3[] = [];
      for (let j = 0; j <= 96; j++) {
        const theta = (j / 96) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(theta) * data.orbitDistance, 0, Math.sin(theta) * data.orbitDistance));
      }
      orbitGeo.setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      scene.add(orbitLine);

      // Planet Container
      const planetPivot = new THREE.Group();
      scene.add(planetPivot);

      // Planet Mesh with PBR Materials & Custom Procedural Canvas Textures
      const texture = createPlanetTexture(data.name, data.color);
      const geo = new THREE.SphereGeometry(data.radius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        map: texture || undefined,
        roughness: data.name === 'Earth' || data.name === 'Venus' ? 0.35 : 0.8,
        metalness: 0.05,
        bumpMap: texture || undefined,
        bumpScale: 0.015,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.rotation.z = data.tilt; 
      planetPivot.add(mesh);

      // Earth's Clouds Layer
      let cloudsMesh: THREE.Mesh | undefined;
      if (data.name === 'Earth') {
        const cloudGeo = new THREE.SphereGeometry(data.radius * 1.025, 32, 32);
        const cloudCanvas = document.createElement('canvas');
        cloudCanvas.width = 1024;
        cloudCanvas.height = 512;
        const cloudCtx = cloudCanvas.getContext('2d');
        if (cloudCtx) {
          cloudCtx.clearRect(0, 0, 1024, 512);
          cloudCtx.fillStyle = 'rgba(255, 255, 255, 0.72)';
          for (let i = 0; i < 55; i++) {
            const cx = Math.random() * 1024;
            const cy = Math.random() * 512;
            const cr = 20 + Math.random() * 50;
            cloudCtx.beginPath();
            cloudCtx.arc(cx, cy, cr, 0, Math.PI * 2);
            cloudCtx.fill();
          }
        }
        const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
        texturesToDispose.push(cloudTexture);
        const cloudMat = new THREE.MeshPhongMaterial({
          map: cloudTexture,
          transparent: true,
          opacity: 0.55,
          blending: THREE.NormalBlending
        });
        cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
        planetPivot.add(cloudsMesh);
      }

      // Earth's Atmosphere Glow
      let atmosphereMesh: THREE.Mesh | undefined;
      if (data.hasAtmosphere) {
        const atmosGeo = new THREE.SphereGeometry(data.radius * 1.08, 32, 32);
        const atmosMat = new THREE.MeshBasicMaterial({
          color: 0x4fc3f7,
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide
        });
        atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
        planetPivot.add(atmosphereMesh);
      }

      // Saturn Cassini Rings (Texture mapped)
      let ringMesh: THREE.Mesh | undefined;
      if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.radius * 1.35, data.radius * 2.3, 64);
        const ringTexture = createRingTexture();
        const ringMat = new THREE.MeshPhongMaterial({
          map: ringTexture || undefined,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
          shininess: 40,
        });
        ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + 0.1; 
        ringMesh.rotation.y = data.tilt;
        planetPivot.add(ringMesh);
      }

      // Moons Roster
      const moonMeshes: THREE.Mesh[] = [];
      const moonAnglesList: number[] = [];
      const moonOrbitsList: number[] = [];
      const moonSpeedsList: number[] = [];

      if (data.moons) {
        data.moons.forEach((m) => {
          const mGeo = new THREE.SphereGeometry(m.radius, 16, 16);
          const mMat = new THREE.MeshPhongMaterial({
            color: m.color,
            shininess: 5
          });
          const mM = new THREE.Mesh(mGeo, mMat);
          mM.castShadow = true;
          mM.receiveShadow = true;
          planetPivot.add(mM);

          moonMeshes.push(mM);
          moonAnglesList.push(Math.random() * Math.PI * 2);
          moonOrbitsList.push(m.orbit);
          moonSpeedsList.push(m.speed);
        });
      }

      planets.push({
        mesh: planetPivot as any, 
        orbit: data.orbitDistance,
        speed: data.speed,
        angle: Math.random() * Math.PI * 2,
        tilt: data.tilt,
        moons: moonMeshes,
        moonAngles: moonAnglesList,
        moonOrbits: moonOrbitsList,
        moonSpeeds: moonSpeedsList,
        ringMesh,
        atmosphere: atmosphereMesh,
        cloudsMesh
      });
    });

    // 8. Mouse parallax interactive states
    let mouseX = 0;
    let mouseY = 0;
    const targetRotation = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Slow drift of galaxy background
      galaxy.rotation.y = elapsedTime * 0.012;
      
      // Sun slow core rotation
      sun.rotation.y = elapsedTime * 0.08;
      corona.rotation.y = -elapsedTime * 0.03;
      
      // Dynamic Corona Pulsing
      const pulseScale = 1.0 + Math.sin(elapsedTime * 1.5) * 0.04;
      corona.scale.setScalar(pulseScale);

      // Rotate Asteroid Belt
      asteroids.forEach((ast) => {
        ast.angle += ast.speed * delta * 0.35;
        const ax = Math.cos(ast.angle) * ast.orbit;
        const az = Math.sin(ast.angle) * ast.orbit;
        ast.mesh.position.set(ax, ast.mesh.position.y, az);
        
        ast.mesh.rotation.x += delta * 0.4;
        ast.mesh.rotation.y += delta * 0.6;
      });

      // Update Planet Positions and their local moons
      planets.forEach((p) => {
        p.angle += p.speed * delta * 0.25;
        const px = Math.cos(p.angle) * p.orbit;
        const pz = Math.sin(p.angle) * p.orbit;

        p.mesh.position.set(px, 0, pz);

        // Spin the core planet child inside the group
        const planetBall = p.mesh.children[0];
        if (planetBall) {
          planetBall.rotation.y += delta * 0.5;
        }

        // Spin Earth clouds slightly faster than the terrain
        if (p.cloudsMesh) {
          p.cloudsMesh.rotation.y += delta * 0.68;
        }

        // Animate child moons
        p.moons.forEach((m, mIdx) => {
          p.moonAngles[mIdx] += p.moonSpeeds[mIdx] * delta * 1.5;
          const mx = Math.cos(p.moonAngles[mIdx]) * p.moonOrbits[mIdx];
          const mz = Math.sin(p.moonAngles[mIdx]) * p.moonOrbits[mIdx];
          m.position.set(mx, 0.1, mz);
        });
      });

      // Smooth camera mouse parallax calculations
      targetRotation.y += (mouseX * 0.35 - targetRotation.y) * 0.04;
      targetRotation.x += (mouseY * 0.22 - targetRotation.x) * 0.04;

      camera.position.x = Math.sin(targetRotation.y) * 38;
      camera.position.z = Math.cos(targetRotation.y) * 38;
      camera.position.y = 18 + targetRotation.x * 16;
      camera.lookAt(0, -1, 0);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // 11. Cleanups
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose buffer binding structures
      sunGeo.dispose();
      sunMat.dispose();
      coronaGeo.dispose();
      coronaMat.dispose();
      asteroidGeometry.dispose();
      asteroidMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();

      // Dispose generated textures
      texturesToDispose.forEach((t) => t.dispose());
    };
  }, []);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
};

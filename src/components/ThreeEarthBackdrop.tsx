import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeEarthBackdrop: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Position camera closer to Earth to make it the hero backdrop
    camera.position.set(0, 4, 14);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const texturesToDispose: THREE.Texture[] = [];
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // 3. Lighting (Sunlight casting day/night shadow terminator)
    const spaceAmbient = new THREE.AmbientLight(0x0a0a14, 0.6);
    scene.add(spaceAmbient);

    // Directional Sunlight
    const sunDirLight = new THREE.DirectionalLight(0xfff3e0, 3.2);
    sunDirLight.position.set(12, 4, 8);
    sunDirLight.castShadow = true;
    sunDirLight.shadow.mapSize.width = 1024;
    sunDirLight.shadow.mapSize.height = 1024;
    sunDirLight.shadow.camera.near = 0.5;
    sunDirLight.shadow.camera.far = 40;
    scene.add(sunDirLight);

    // Secondary soft nebula glow light
    const nebulaLight = new THREE.DirectionalLight(0x4a548c, 0.85);
    nebulaLight.position.set(-10, -4, -8);
    scene.add(nebulaLight);

    // 4. Background Starfield
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    geometriesToDispose.push(starGeo);
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 40 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const colorRatio = Math.random();
      if (colorRatio < 0.2) {
        starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 1.0; // Blue-white
      } else if (colorRatio < 0.4) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 0.7; // Warm-yellow
      } else {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0; // Pure white
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    materialsToDispose.push(starMat);
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // 5. Realistic Earth Procedural Canvas Textures
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Brighter Oceans
      ctx.fillStyle = '#0f3057';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Continent masses (Lush bright green)
      ctx.fillStyle = '#2d6a4f';
      
      const drawContinent = (points: [number, number][]) => {
        if (points.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.closePath();
        ctx.fill();
      };

      // 1. North America
      drawContinent([
        [100, 120], [120, 90], [160, 80], [220, 80], [260, 60], 
        [300, 70], [330, 110], [310, 130], [360, 140], [390, 100], 
        [410, 150], [360, 180], [380, 220], [340, 230], [345, 255], 
        [325, 230], [285, 280], [275, 280], [280, 240], [240, 230], 
        [220, 190], [180, 180], [140, 200]
      ]);

      // 2. Greenland
      drawContinent([
        [380, 50], [440, 40], [460, 80], [420, 110], [390, 90]
      ]);

      // 3. South America
      drawContinent([
        [285, 280], [305, 290], [330, 310], [380, 320], [410, 340], 
        [390, 380], [360, 440], [345, 480], [335, 480], [335, 440], 
        [315, 380], [290, 330]
      ]);

      // 4. Eurasia & Africa (connected at Suez)
      drawContinent([
        [460, 160], [490, 120], [530, 80], [570, 70], [630, 60], 
        [720, 50], [800, 55], [890, 60], [940, 75], [960, 110], 
        [910, 140], [920, 180], [880, 230], [850, 260], 
        [810, 270], [795, 305], [775, 305], [770, 280], [745, 295], 
        [735, 280], [740, 250], [680, 240], [640, 270], 
        [620, 290], [590, 350], [600, 430], [580, 430], [550, 370], 
        [510, 340], [470, 320], [450, 280], [475, 240], [490, 245], 
        [510, 220], [535, 220], [560, 205], [585, 225], [570, 180]
      ]);

      // 5. Great Britain
      drawContinent([
        [445, 110], [465, 100], [470, 125], [450, 135]
      ]);

      // 6. Madagascar
      drawContinent([
        [625, 370], [640, 385], [630, 420], [615, 400]
      ]);

      // 7. India
      drawContinent([
        [740, 250], [770, 280], [785, 260]
      ]);

      // 8. Japan
      drawContinent([
        [930, 130], [945, 150], [935, 180], [920, 160]
      ]);

      // 9. Australia
      drawContinent([
        [830, 380], [860, 360], [900, 365], [930, 400], [910, 430], 
        [870, 440], [840, 420]
      ]);

      // 10. Antarctica
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 475, canvas.width, 37);

      const texture = new THREE.CanvasTexture(canvas);
      texturesToDispose.push(texture);
      return texture;
    };

    const createMoonTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#6c757d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#495057';
      for (let i = 0; i < 80; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 3 + Math.random() * 10, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 100; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 2 + Math.random() * 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texturesToDispose.push(texture);
      return texture;
    };

    // 6. Spawn Earth Globe
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const earthTexture = createEarthTexture();
    const earthGeo = new THREE.SphereGeometry(2.4, 32, 32);
    geometriesToDispose.push(earthGeo);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture || undefined,
      roughness: 0.45,
      metalness: 0.05,
      bumpMap: earthTexture || undefined,
      bumpScale: 0.015
    });
    materialsToDispose.push(earthMat);
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.castShadow = true;
    earthMesh.receiveShadow = true;
    earthMesh.rotation.z = 0.41; // Axial tilt (23.5 degrees)
    earthGroup.add(earthMesh);

    // Earth Atmospheric Glow
    const atmosGeo = new THREE.SphereGeometry(2.6, 32, 32);
    geometriesToDispose.push(atmosGeo);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x5dade2,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    materialsToDispose.push(atmosMat);
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // 7. Revolving Moon
    const moonGroup = new THREE.Group();
    scene.add(moonGroup);

    const moonTexture = createMoonTexture();
    const moonGeo = new THREE.SphereGeometry(0.55, 16, 16);
    geometriesToDispose.push(moonGeo);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTexture || undefined,
      roughness: 0.9,
      metalness: 0.05,
      bumpMap: moonTexture || undefined,
      bumpScale: 0.01
    });
    materialsToDispose.push(moonMat);
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;
    moonGroup.add(moonMesh);

    let moonAngle = Math.random() * Math.PI * 2;
    const moonOrbitRadius = 5.6;

    // 9. Orbiting Spaceships (Sleek futuristic ships with thruster light glows)
    const spaceshipGroup = new THREE.Group();
    scene.add(spaceshipGroup);

    interface ShipConfig {
      mesh: THREE.Group;
      orbitRadius: number;
      speed: number;
      angle: number;
      axis: THREE.Vector3;
      wobbleSpeed: number;
    }
    const spaceships: ShipConfig[] = [];

    const createSpaceshipMesh = (glowColor: number) => {
      const ship = new THREE.Group();

      // Hull wedge body (Cone)
      const hullGeo = new THREE.ConeGeometry(0.06, 0.25, 4);
      geometriesToDispose.push(hullGeo);
      const hullMat = new THREE.MeshStandardMaterial({ color: 0x34495e, metalness: 0.9, roughness: 0.1 });
      materialsToDispose.push(hullMat);
      const hull = new THREE.Mesh(hullGeo, hullMat);
      hull.rotation.x = Math.PI / 2; // Point forward along orbit path
      ship.add(hull);

      // Wing flaps
      const wingGeo = new THREE.BoxGeometry(0.18, 0.02, 0.1);
      geometriesToDispose.push(wingGeo);
      const wing = new THREE.Mesh(wingGeo, hullMat);
      wing.position.set(0, 0, -0.04);
      ship.add(wing);

      // Thruster Glow sphere
      const glowGeo = new THREE.SphereGeometry(0.03, 8, 8);
      geometriesToDispose.push(glowGeo);
      const glowMat = new THREE.MeshBasicMaterial({ color: glowColor });
      materialsToDispose.push(glowMat);
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(0, 0, -0.14); // Back of ship
      ship.add(glow);

      return ship;
    };

    // Instantiate 2 Spaceships swooping
    const shipAxes = [
      new THREE.Vector3(0.5, 0.8, -0.3).normalize(),
      new THREE.Vector3(-0.4, 0.75, 0.5).normalize()
    ];
    const glowColors = [0x00ffff, 0xff3300];
    for (let f = 0; f < 2; f++) {
      const shipMesh = createSpaceshipMesh(glowColors[f]);
      spaceshipGroup.add(shipMesh);
      spaceships.push({
        mesh: shipMesh,
        orbitRadius: 4.2 + f * 0.8,
        speed: 0.9 + f * 0.35,
        angle: Math.random() * Math.PI * 2,
        axis: shipAxes[f],
        wobbleSpeed: 2.5 + f * 1.5
      });
    }

    // 9b. Volumetric Glowing Shooting Stars (Majestic, slow-drifting long streaks)
    const shootingStarCount = 3;
    const shootingStarGroup = new THREE.Group();
    scene.add(shootingStarGroup);

    interface ShootingStar {
      mesh: THREE.Mesh;
      material: THREE.MeshBasicMaterial;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }
    const starsData: ShootingStar[] = [];

    // Create a tapered cylinder representing a high-exposure volumetric light beam/streak
    // Top radius: 0.005 (fading tail), Bottom radius: 0.035 (bright head), Height: 3.5, segments: 5
    const starCylinderGeo = new THREE.CylinderGeometry(0.005, 0.035, 3.5, 5, 1);
    // Rotate cylinder geometry so its height axis runs along the Z axis (makes orientation simple with lookAt)
    starCylinderGeo.rotateX(Math.PI / 2);
    geometriesToDispose.push(starCylinderGeo);

    const triggerShootingStar = (star: ShootingStar) => {
      // Pick Z plane: some pass in front of Earth (Z > 1.5), some pass behind (Z < -3.0)
      const passInFront = Math.random() < 0.5;
      const zPos = passInFront 
        ? 1.5 + Math.random() * 2.0 
        : -4.5 - Math.random() * 2.5;

      // Start way off-screen on the left
      const startX = -18;
      // Random Y height in the sky
      const startY = -2 + Math.random() * 9;

      // Move strictly from left to right, drifting slowly downwards
      // Speed of 2.0 units per second means it crosses the screen (~36 units wide) in ~18 seconds!
      const vx = 2.0 + Math.random() * 0.8;
      const vy = -0.15 - Math.random() * 0.2;
      const vz = (Math.random() - 0.5) * 0.4; // minimal Z movement

      star.mesh.position.set(startX, startY, zPos);
      star.vx = vx;
      star.vy = vy;
      star.vz = vz;
      star.life = 0;
      star.maxLife = 12.0 + Math.random() * 4.0; // long majestic life

      // Orient the tapered cylinder head-forward along its velocity vector
      const direction = new THREE.Vector3(vx, vy, vz).normalize();
      const targetPos = star.mesh.position.clone().add(direction);
      star.mesh.lookAt(targetPos);
    };

    // Shiny colors for photograph-quality shooting stars: golden-orange, cyan-blue, pure-white
    const shootingStarColors = [0xffcc00, 0x00ffff, 0xffffff];

    for (let i = 0; i < shootingStarCount; i++) {
      const starColor = shootingStarColors[i % shootingStarColors.length];
      
      const starMat = new THREE.MeshBasicMaterial({
        color: starColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      });
      materialsToDispose.push(starMat);

      const cylinderMesh = new THREE.Mesh(starCylinderGeo, starMat);
      shootingStarGroup.add(cylinderMesh);

      const star: ShootingStar = {
        mesh: cylinderMesh,
        material: starMat,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 0
      };

      triggerShootingStar(star);
      // Stagger start timers randomly so they don't spawn all at once
      star.life = Math.random() * star.maxLife;
      // Pre-simulate position based on stagger life
      star.mesh.position.x += star.vx * star.life;
      star.mesh.position.y += star.vy * star.life;
      star.mesh.position.z += star.vz * star.life;
      starsData.push(star);
    }

    // 10. Mouse depth interactive parallax
    let mouseX = 0;
    let mouseY = 0;
    const targetCamRotation = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 11. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 12. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Earth rotation
      earthMesh.rotation.y += delta * 0.08;


      // Revolving Moon angle update
      moonAngle += delta * 0.12; // slow celestial revolve
      const mx = Math.cos(moonAngle) * moonOrbitRadius;
      const mz = Math.sin(moonAngle) * moonOrbitRadius;
      // Tilt moon orbit slightly
      moonMesh.position.set(mx, mx * 0.15, mz);
      moonMesh.rotation.y += delta * 0.15; // moon axial rotation


      // Orbiting Spaceships placement (swooping wobbles)
      spaceships.forEach((ship) => {
        ship.angle += ship.speed * delta;

        // Add slight wobble swoop to fly path
        const swoopRadius = ship.orbitRadius + Math.sin(elapsed * ship.wobbleSpeed) * 0.25;
        
        const radialX = Math.cos(ship.angle) * swoopRadius;
        const radialZ = Math.sin(ship.angle) * swoopRadius;
        
        const positionVec = new THREE.Vector3(radialX, Math.sin(elapsed * ship.wobbleSpeed * 0.8) * 0.4, radialZ);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), ship.axis);
        positionVec.applyQuaternion(q);

        ship.mesh.position.copy(positionVec);

        // Align ship heading forward
        const forwardVec = new THREE.Vector3(-Math.sin(ship.angle), 0, Math.cos(ship.angle)).applyQuaternion(q);
        const targetPos = positionVec.clone().add(forwardVec);
        ship.mesh.lookAt(targetPos);
      });

      // Animate Shooting Stars
      starsData.forEach((star) => {
        star.life += delta;
        if (star.life >= star.maxLife) {
          triggerShootingStar(star);
        } else {
          star.mesh.position.x += star.vx * delta;
          star.mesh.position.y += star.vy * delta;
          star.mesh.position.z += star.vz * delta;

          const progress = star.life / star.maxLife;
          const alpha = Math.sin(progress * Math.PI);
          star.material.opacity = alpha * 0.92;
        }
      });

      // Galaxy backdrop particles slow spin
      starfield.rotation.y = elapsed * 0.005;

      // Smooth camera mouse parallax calculations
      targetCamRotation.y += (mouseX * 0.2 - targetCamRotation.y) * 0.04;
      targetCamRotation.x += (mouseY * 0.15 - targetCamRotation.x) * 0.04;

      camera.position.x = Math.sin(targetCamRotation.y) * 14;
      camera.position.z = Math.cos(targetCamRotation.y) * 14;
      camera.position.y = 4 + targetCamRotation.x * 6;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // 13. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose structural buffers
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      texturesToDispose.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" 
    />
  );
};

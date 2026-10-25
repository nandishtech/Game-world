import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeLobbyProps {
  className?: string;
}

export const ThreeLobby: React.FC<ThreeLobbyProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group
    const group = new THREE.Group();
    scene.add(group);

    // Portal Rings
    const ringGeo1 = new THREE.TorusGeometry(3, 0.05, 16, 100);
    const ringMat1 = new THREE.MeshPhongMaterial({
      color: 0x3B82F6,
      emissive: 0x3B82F6,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.8,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    group.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.3, 0.03, 16, 100);
    const ringMat2 = new THREE.MeshPhongMaterial({
      color: 0x8B5CF6,
      emissive: 0x8B5CF6,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2;
    group.add(ring2);

    // Particles (Lobby Dust)
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x06B6D4,
      transparent: true,
      opacity: 0.6,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    group.add(particlesMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x3B82F6, 2, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      ring1.rotation.y = elapsedTime * 0.4;
      ring1.rotation.x = elapsedTime * 0.2;
      
      ring2.rotation.y = -elapsedTime * 0.5;
      
      particlesMesh.rotation.y = elapsedTime * 0.05;
      particlesMesh.rotation.x = elapsedTime * 0.02;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
};

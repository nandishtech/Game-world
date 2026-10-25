import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCoreProps {
  className?: string;
}

export const ThreeCore: React.FC<ThreeCoreProps> = ({ className = '' }) => {
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

    // Core
    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x3B82F6,
      emissive: 0x3B82F6,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const core = new THREE.Mesh(geometry, material);
    group.add(core);

    // Inner Glow
    const innerGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x8B5CF6,
      transparent: true,
      opacity: 0.2,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerCore);

    // Rings
    const ringGeo = new THREE.TorusGeometry(3, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06B6D4,
      transparent: true,
      opacity: 0.4,
    });
    
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring1);

    const ring2 = ring1.clone();
    ring2.rotation.x = Math.PI / 2;
    group.add(ring2);

    // Lights
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
      
      group.rotation.y = elapsedTime * 0.15;
      group.rotation.x = elapsedTime * 0.08;
      
      const pulseScale = 1 + Math.sin(elapsedTime * 2.0) * 0.08;
      core.scale.setScalar(pulseScale);
      
      ring1.rotation.z = elapsedTime * 0.3;
      ring2.rotation.z = -elapsedTime * 0.3;

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
      geometry.dispose();
      material.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
};

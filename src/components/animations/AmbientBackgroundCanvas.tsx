'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/components/theme/ThemeProvider';

export function canCreateWebGLContext(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  try {
    const testCanvas = document.createElement('canvas');
    const gl =
      testCanvas.getContext('webgl') ||
      testCanvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

export default function AmbientBackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  const { theme } = useTheme();
  const [webglAvailable, setWebglAvailable] = useState<boolean>(() =>
    canCreateWebGLContext()
  );

  // Update particle color & opacity when theme toggles without recreating WebGL scene
  useEffect(() => {
    if (!materialRef.current) {
      return;
    }
    materialRef.current.color.setHex(theme === 'light' ? 0xc88a14 : 0xffdb70);
    materialRef.current.opacity = theme === 'light' ? 0.18 : 0.22;
    materialRef.current.needsUpdate = true;
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (!canCreateWebGLContext()) {
      setWebglAvailable(false);
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    const width = window.innerWidth || 1200;
    const height = window.innerHeight || 800;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.domElement.setAttribute('data-ambient-webgl-canvas', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 18;

    const isMobile = width < 768;
    const particleCount = isMobile ? 28 : 55;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      // Deterministic pseudo-random distribution so particles are balanced
      const seedA = Math.sin((i + 1) * 12.9898) * 43758.5453;
      const seedB = Math.cos((i + 1) * 78.233) * 24634.6345;
      const seedC = Math.sin((i + 1) * 45.164) * 19384.2941;
      const fracA = seedA - Math.floor(seedA);
      const fracB = seedB - Math.floor(seedB);
      const fracC = seedC - Math.floor(seedC);

      positions[i3] = (fracA - 0.5) * 32;
      positions[i3 + 1] = (fracB - 0.5) * 22;
      positions[i3 + 2] = (fracC - 0.5) * 12;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const initialTheme =
      document.documentElement.getAttribute('data-theme') === 'light'
        ? 'light'
        : 'dark';
    const material = new THREE.PointsMaterial({
      color: initialTheme === 'light' ? 0xc88a14 : 0xffdb70,
      size: isMobile ? 0.12 : 0.15,
      transparent: true,
      opacity: initialTheme === 'light' ? 0.18 : 0.22,
      depthWrite: false,
    });
    materialRef.current = material;

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let animationFrameId: number | null = null;
    let isPaused = document.hidden;
    let targetPointerX = 0;
    let targetPointerY = 0;

    const renderFrame = () => {
      if (isPaused || !renderer) {
        animationFrameId = null;
        return;
      }

      points.rotation.y += 0.00045;
      points.rotation.x += 0.0002;
      camera.position.x += (targetPointerX * 0.8 - camera.position.x) * 0.03;
      camera.position.y += (-targetPointerY * 0.6 - camera.position.y) * 0.03;

      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(renderFrame);
    };

    const startLoop = () => {
      if (!isPaused && animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    };

    const stopLoop = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (isPaused) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      targetPointerX = (event.clientX / w - 0.5) * 2;
      targetPointerY = (event.clientY / h - 0.5) * 2;
    };

    const handleResize = () => {
      if (!renderer) {
        return;
      }
      const nextWidth = window.innerWidth || 1200;
      const nextHeight = window.innerHeight || 800;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('resize', handleResize, { passive: true });

    startLoop();

    return () => {
      stopLoop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      materialRef.current = null;
      geometry.dispose();
      material.dispose();
      renderer?.dispose();
      if (renderer?.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!webglAvailable) {
    return (
      <div
        className="ambient-bg-fallback"
        data-ambient-fallback="webgl-unavailable"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="ambient-bg-canvas"
      data-ambient-canvas="active"
      aria-hidden="true"
    />
  );
}

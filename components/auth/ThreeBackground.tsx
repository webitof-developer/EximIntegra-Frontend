"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  theme?: "login" | "register";
}

export function ThreeBackground({ theme = "login" }: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 2000);
    camera.position.set(0, 150, 270);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // -------------------------------------------------------------
    // 2. Pure 3D Undulating Particle Wave Lattice
    // -------------------------------------------------------------
    const SEPARATION = 22;
    const AMOUNTX = 55;
    const AMOUNTY = 55;
    const numParticles = AMOUNTX * AMOUNTY;

    const wavePositions = new Float32Array(numParticles * 3);
    const waveColors = new Float32Array(numParticles * 3);

    const color1 = new THREE.Color(0x2563eb); // Royal Blue
    const color2 = new THREE.Color(0x38bdf8); // Cyan
    const color3 = new THREE.Color(0x60a5fa); // Sky Blue

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        wavePositions[i * 3] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2; // x
        wavePositions[i * 3 + 1] = 0; // y
        wavePositions[i * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2; // z

        const ratio = (ix + iy) / (AMOUNTX + AMOUNTY);
        const mixed = color1.clone().lerp(color2, ratio);
        waveColors[i * 3] = mixed.r;
        waveColors[i * 3 + 1] = mixed.g;
        waveColors[i * 3 + 2] = mixed.b;

        i++;
      }
    }

    const waveGeometry = new THREE.BufferGeometry();
    waveGeometry.setAttribute("position", new THREE.BufferAttribute(wavePositions, 3));
    waveGeometry.setAttribute("color", new THREE.BufferAttribute(waveColors, 3));

    // Custom circular soft glowing dot texture
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.35, "rgba(56, 189, 248, 0.85)");
      gradient.addColorStop(1, "rgba(37, 99, 235, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const waveMaterial = new THREE.PointsMaterial({
      size: 4.6,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      opacity: 0.8,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const wavePoints = new THREE.Points(waveGeometry, waveMaterial);
    worldGroup.add(wavePoints);

    // -------------------------------------------------------------
    // 3. Mouse Interactive Parallax
    // -------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (event: MouseEvent) => {
      const halfX = window.innerWidth / 2;
      const halfY = window.innerHeight / 2;
      mouseX = (event.clientX - halfX) * 0.0006;
      mouseY = (event.clientY - halfY) * 0.0006;
    };

    window.addEventListener("mousemove", onPointerMove);

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", onResize);

    // -------------------------------------------------------------
    // 4. Smooth Wave Animation Loop
    // -------------------------------------------------------------
    let count = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Mouse damping
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      worldGroup.rotation.y = targetX * 0.5;
      worldGroup.rotation.x = targetY * 0.35;

      // Animate wave heights using harmonic sine and cosine functions
      const posAttr = waveGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      let idx = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          posArray[idx * 3 + 1] =
            Math.sin((ix + count) * 0.26) * 16 +
            Math.sin((iy + count) * 0.42) * 16 +
            Math.cos((ix + iy + count) * 0.16) * 12;
          idx++;
        }
      }
      posAttr.needsUpdate = true;
      count += 0.035;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("resize", onResize);

      waveGeometry.dispose();
      waveMaterial.dispose();
      particleTexture.dispose();
      renderer.dispose();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// Major international trade hubs (lat, lon, label, color)
const TRADE_HUBS = [
  { name: "Mumbai (JNPT)", lat: 18.96, lon: 72.82, color: 0x38bdf8 },
  { name: "Dubai (Jebel Ali)", lat: 25.01, lon: 55.06, color: 0x3b82f6 },
  { name: "Singapore", lat: 1.29, lon: 103.85, color: 0x10b981 },
  { name: "Rotterdam", lat: 51.92, lon: 4.48, color: 0x6366f1 },
  { name: "New York", lat: 40.71, lon: -74.0, color: 0x38bdf8 },
  { name: "Tokyo", lat: 35.68, lon: 139.76, color: 0xf59e0b },
  { name: "Sydney", lat: -33.86, lon: 151.2, color: 0x06b6d4 },
  { name: "London", lat: 51.5, lon: -0.12, color: 0x818cf8 },
];

// Active trade corridor pairs
const TRADE_CORRIDORS = [
  [0, 1], // Mumbai -> Dubai
  [0, 2], // Mumbai -> Singapore
  [0, 3], // Mumbai -> Rotterdam
  [0, 4], // Mumbai -> New York
  [1, 3], // Dubai -> Rotterdam
  [2, 5], // Singapore -> Tokyo
  [2, 6], // Singapore -> Sydney
  [4, 7], // New York -> London
];

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function ThreeTradeGlobe({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 78;

    // 2. Base Sphere Dot Matrix (World Grid)
    const dotCount = 1800;
    const dotGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(dotCount * 3);
    const colors = new Float32Array(dotCount * 3);
    const baseColor = new THREE.Color(0x93c5fd);

    for (let i = 0; i < dotCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / dotCount);
      const theta = Math.sqrt(dotCount * Math.PI) * phi;
      const x = GLOBE_RADIUS * Math.cos(theta) * Math.sin(phi);
      const y = GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);
      const z = GLOBE_RADIUS * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Subtle gradient lightness
      const shade = 0.5 + Math.random() * 0.5;
      colors[i * 3] = baseColor.r * shade;
      colors[i * 3 + 1] = baseColor.g * shade;
      colors[i * 3 + 2] = baseColor.b * shade;
    }

    dotGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    dotGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const dotMaterial = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const dotSphere = new THREE.Points(dotGeometry, dotMaterial);
    globeGroup.add(dotSphere);

    // 3. Delicate Wireframe Atmosphere Layer
    const wireGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS + 0.5, 3);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xbfdbfe,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireSphere = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireSphere);

    // 4. Inner Subtle Core Glow Sphere
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 1.5, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xeff6ff,
      transparent: true,
      opacity: 0.45,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreSphere);

    // 5. Plot Trade Hub Nodes
    const hubPositions: THREE.Vector3[] = [];
    const hubPointersGroup = new THREE.Group();

    TRADE_HUBS.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, GLOBE_RADIUS);
      hubPositions.push(pos);

      // Node point
      const nodeGeo = new THREE.SphereGeometry(2.0, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: hub.color });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      hubPointersGroup.add(nodeMesh);

      // Outer ripple ring
      const ringGeo = new THREE.RingGeometry(2.6, 3.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.01));
      ringMesh.lookAt(pos.clone().multiplyScalar(2));
      hubPointersGroup.add(ringMesh);
    });
    globeGroup.add(hubPointersGroup);

    // 6. Arced Trade Corridors with Traveling Pulses
    const arcCurves: THREE.CubicBezierCurve3[] = [];
    const arcLineGroup = new THREE.Group();

    TRADE_CORRIDORS.forEach(([i, j], corridorIdx) => {
      const p1 = hubPositions[i];
      const p2 = hubPositions[j];
      const dist = p1.distanceTo(p2);

      // Calculate elevated control points for graceful 3D parabolic trajectory
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const elevation = Math.max(16, dist * 0.38);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + elevation);

      const ctrl1 = new THREE.Vector3().lerpVectors(p1, mid, 0.5).normalize().multiplyScalar(GLOBE_RADIUS + elevation * 0.85);
      const ctrl2 = new THREE.Vector3().lerpVectors(p2, mid, 0.5).normalize().multiplyScalar(GLOBE_RADIUS + elevation * 0.85);

      const curve = new THREE.CubicBezierCurve3(p1, ctrl1, ctrl2, p2);
      arcCurves.push(curve);

      // Static faint route line
      const points = curve.getPoints(45);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: corridorIdx % 2 === 0 ? 0x2563eb : 0x0ea5e9,
        transparent: true,
        opacity: 0.35,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcLineGroup.add(arcLine);
    });
    globeGroup.add(arcLineGroup);

    // 7. Dynamic Shipment Pulse Particles
    const pulseCount = arcCurves.length * 2;
    const pulseGeo = new THREE.SphereGeometry(1.4, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    const pulses: { mesh: THREE.Mesh; curveIndex: number; progress: number; speed: number }[] = [];

    for (let p = 0; p < pulseCount; p++) {
      const mesh = new THREE.Mesh(pulseGeo, pulseMat);
      const curveIndex = p % arcCurves.length;
      const progress = (p / pulseCount) + Math.random() * 0.2;
      const speed = 0.003 + Math.random() * 0.0035;
      pulses.push({ mesh, curveIndex, progress, speed });
      globeGroup.add(mesh);
    }

    // 8. Outer Orbital Rings
    const orbitRingGeo = new THREE.RingGeometry(GLOBE_RADIUS + 22, GLOBE_RADIUS + 22.8, 64);
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.rotation.x = Math.PI / 2.4;
    orbitRing.rotation.y = Math.PI / 6;
    globeGroup.add(orbitRing);

    // Initial globe orientation to highlight India / Middle East / Asia
    globeGroup.rotation.y = -0.6;
    globeGroup.rotation.x = 0.25;

    // 9. Smooth Mouse Interaction (Parallax Damping)
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.25;
    let targetRotY = -0.6;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener("pointermove", handlePointerMove);

    // 10. Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (now: number = performance.now()) => {
      animId = requestAnimationFrame(animate);

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Continuous gentle auto-rotation
      targetRotY += 0.0028;

      // Mouse-influenced targets with smooth damping
      const curTargetX = 0.25 + mouseY * 0.2;
      const curTargetY = targetRotY + mouseX * 0.35;

      globeGroup.rotation.x += (curTargetX - globeGroup.rotation.x) * 0.05;
      globeGroup.rotation.y += (curTargetY - globeGroup.rotation.y) * 0.05;

      // Gentle wobble on the orbital ring
      orbitRing.rotation.z += 0.003;

      // Animate trade shipment pulses along trajectories
      pulses.forEach((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress > 1) {
          pulse.progress = 0;
        }
        const curve = arcCurves[pulse.curveIndex];
        if (curve) {
          const pt = curve.getPoint(pulse.progress);
          pulse.mesh.position.copy(pt);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 11. Responsive Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();

      dotGeometry.dispose();
      dotMaterial.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      pulseGeo.dispose();
      pulseMat.dispose();
      orbitRingGeo.dispose();
      orbitRingMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[380px] sm:h-[480px] lg:h-[540px] select-none ${className}`}
      aria-label="Interactive 3D Global Trade Network Simulation"
    />
  );
}

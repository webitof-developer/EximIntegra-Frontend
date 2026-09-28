"use client";

import React, { useEffect, useRef } from "react";
import { Ship, ShieldCheck, Scale, Lock, Sparkles, Navigation } from "lucide-react";

interface TradePacket {
  x: number;
  y: number;
  axis: "x" | "y";
  direction: 1 | -1;
  speed: number;
  length: number;
  color: string;
  gridLine: number;
}

interface BeaconNode {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  alphaSpeed: number;
  color: string;
}

export function HeroBackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const gridSize = 56;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Track mouse over hero section for interactive spotlight
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Initialize trade packets that travel along the grid
    const colors = [
      "rgba(37, 99, 235, ", // royal blue
      "rgba(14, 165, 233, ", // sky blue
      "rgba(16, 185, 129, ", // emerald green
      "rgba(99, 102, 241, ", // indigo
    ];

    const packets: TradePacket[] = [];
    const numPackets = 14;

    for (let i = 0; i < numPackets; i++) {
      const isHorizontal = Math.random() > 0.5;
      const numLinesX = Math.floor(width / gridSize);
      const numLinesY = Math.floor(height / gridSize);

      if (isHorizontal) {
        const lineIdx = Math.floor(Math.random() * numLinesY);
        packets.push({
          x: Math.random() * width,
          y: lineIdx * gridSize,
          axis: "x",
          direction: Math.random() > 0.5 ? 1 : -1,
          speed: 1.2 + Math.random() * 1.8,
          length: 30 + Math.random() * 45,
          color: colors[Math.floor(Math.random() * colors.length)],
          gridLine: lineIdx,
        });
      } else {
        const lineIdx = Math.floor(Math.random() * numLinesX);
        packets.push({
          x: lineIdx * gridSize,
          y: Math.random() * height,
          axis: "y",
          direction: Math.random() > 0.5 ? 1 : -1,
          speed: 1.2 + Math.random() * 1.8,
          length: 30 + Math.random() * 45,
          color: colors[Math.floor(Math.random() * colors.length)],
          gridLine: lineIdx,
        });
      }
    }

    // Initialize subtle pulsing beacon nodes at intersections
    const beacons: BeaconNode[] = [];
    const numBeacons = 22;
    for (let i = 0; i < numBeacons; i++) {
      const gx = Math.floor(Math.random() * Math.floor(width / gridSize)) * gridSize;
      const gy = Math.floor(Math.random() * Math.floor(height / gridSize)) * gridSize;
      beacons.push({
        x: gx,
        y: gy,
        radius: 1.5 + Math.random() * 1.5,
        alpha: Math.random() * 0.7,
        alphaSpeed: 0.008 + Math.random() * 0.015,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Main render loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // 1. Draw subtle base grid
      ctx.lineWidth = 1;
      const numLinesX = Math.ceil(width / gridSize);
      const numLinesY = Math.ceil(height / gridSize);

      for (let i = 0; i <= numLinesX; i++) {
        const x = i * gridSize;
        let lineAlpha = 0.18;

        if (mouse.active) {
          const dist = Math.abs(mouse.x - x);
          if (dist < 200) {
            lineAlpha += (1 - dist / 200) * 0.45;
          }
        }

        ctx.strokeStyle = `rgba(148, 163, 184, ${lineAlpha})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let j = 0; j <= numLinesY; j++) {
        const y = j * gridSize;
        let lineAlpha = 0.18;

        if (mouse.active) {
          const dist = Math.abs(mouse.y - y);
          if (dist < 200) {
            lineAlpha += (1 - dist / 200) * 0.45;
          }
        }

        ctx.strokeStyle = `rgba(148, 163, 184, ${lineAlpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw coordinate crosshairs (+) at intersections
      const crossSize = 3.5;
      for (let i = 1; i < numLinesX; i += 2) {
        for (let j = 1; j < numLinesY; j += 2) {
          const cx = i * gridSize;
          const cy = j * gridSize;

          let crossAlpha = 0.25;
          if (mouse.active) {
            const dx = mouse.x - cx;
            const dy = mouse.y - cy;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 240) {
              crossAlpha += (1 - d / 240) * 0.45;
            }
          }

          ctx.strokeStyle = `rgba(100, 116, 139, ${crossAlpha})`;
          ctx.beginPath();
          ctx.moveTo(cx - crossSize, cy);
          ctx.lineTo(cx + crossSize, cy);
          ctx.moveTo(cx, cy - crossSize);
          ctx.lineTo(cx, cy + crossSize);
          ctx.stroke();
        }
      }

      // 3. Update & render pulsing beacon nodes
      for (const b of beacons) {
        b.alpha += b.alphaSpeed * delta;
        if (b.alpha > 0.9 || b.alpha < 0.2) {
          b.alphaSpeed = -b.alphaSpeed;
        }

        ctx.fillStyle = `${b.color}${b.alpha})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow halo
        ctx.fillStyle = `${b.color}${b.alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Update & render flowing trade packets
      for (const p of packets) {
        if (p.axis === "x") {
          p.x += p.speed * p.direction * delta;

          // Wrap around edges
          if (p.direction === 1 && p.x - p.length > width) {
            p.x = -p.length;
            p.y = Math.floor(Math.random() * numLinesY) * gridSize;
          } else if (p.direction === -1 && p.x + p.length < 0) {
            p.x = width + p.length;
            p.y = Math.floor(Math.random() * numLinesY) * gridSize;
          }

          // Draw packet gradient trail
          const grad = ctx.createLinearGradient(
            p.x - p.length * p.direction,
            p.y,
            p.x,
            p.y
          );
          grad.addColorStop(0, `${p.color}0)`);
          grad.addColorStop(0.6, `${p.color}0.6)`);
          grad.addColorStop(1, `${p.color}1)`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(p.x - p.length * p.direction, p.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Packet head glow
          ctx.fillStyle = `${p.color}1)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          p.y += p.speed * p.direction * delta;

          // Wrap around edges
          if (p.direction === 1 && p.y - p.length > height) {
            p.y = -p.length;
            p.x = Math.floor(Math.random() * numLinesX) * gridSize;
          } else if (p.direction === -1 && p.y + p.length < 0) {
            p.y = height + p.length;
            p.x = Math.floor(Math.random() * numLinesX) * gridSize;
          }

          // Draw packet gradient trail
          const grad = ctx.createLinearGradient(
            p.x,
            p.y - p.length * p.direction,
            p.x,
            p.y
          );
          grad.addColorStop(0, `${p.color}0)`);
          grad.addColorStop(0.6, `${p.color}0.6)`);
          grad.addColorStop(1, `${p.color}1)`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.length * p.direction);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Packet head glow
          ctx.fillStyle = `${p.color}1)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none"
      aria-hidden="true"
    >
      {/* 1. Fluid Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[500px] bg-gradient-to-tr from-blue/25 via-indigo-500/20 to-sky-400/25 rounded-full blur-[100px] animate-pulse duration-1000" />
      <div className="absolute -top-16 -left-20 w-[460px] h-[400px] bg-gradient-to-br from-blue-100/80 via-sky-100/60 to-transparent rounded-full blur-[90px]" />
      <div className="absolute top-1/3 -right-20 w-[500px] h-[420px] bg-gradient-to-bl from-indigo-100/80 via-blue-100/60 to-transparent rounded-full blur-[90px]" />

      {/* 2. Interactive Animated Trade Grid Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full opacity-100" />

      {/* 3. Subtle Floating Trade Telemetry Badges (Desktop Viewport Accents) */}
      {/* Top Left: Active Maritime Trade Corridor */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-panel/90 backdrop-blur-md border border-line shadow-xs text-[10px] font-mono text-muted absolute top-16 left-8 animate-bounce duration-[4000ms]">
        <span className="w-1.5 h-1.5 rounded-full bg-green animate-ping" />
        <Ship className="w-3 h-3 text-blue" />
        <span className="text-ink font-semibold">JNPT Mumbai</span>
        <span>&rarr;</span>
        <span className="text-ink font-semibold">Jebel Ali Port</span>
        <span className="text-green font-bold bg-green-dim px-1.5 py-0.2 rounded text-[9px]">
          CEPA 0%
        </span>
      </div>

      {/* Top Right: GIR Classification Legal Status */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-panel/90 backdrop-blur-md border border-line shadow-xs text-[10px] font-mono text-muted absolute top-14 right-8 animate-bounce duration-[4500ms]">
        <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
        <ShieldCheck className="w-3 h-3 text-blue" />
        <span className="text-ink font-semibold">Sequential GIR 1–6</span>
        <span className="text-blue font-bold bg-blue-dim px-1.5 py-0.2 rounded text-[9px]">
          Deterministic
        </span>
      </div>

      {/* Middle Left: CBIC Gazette Synchronization */}
      <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-panel/90 backdrop-blur-md border border-line shadow-xs text-[10px] font-mono text-muted absolute top-72 left-6">
        <Scale className="w-3 h-3 text-amber" />
        <span>CBIC Gazette</span>
        <span className="text-ink font-bold font-mono">v2026.03</span>
        <span className="w-1.5 h-1.5 rounded-full bg-green" />
      </div>

      {/* Middle Right: Enterprise BYOK Security */}
      <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-panel/90 backdrop-blur-md border border-line shadow-xs text-[10px] font-mono text-muted absolute top-80 right-6">
        <Lock className="w-3 h-3 text-green" />
        <span className="text-ink font-semibold">BYOK Isolated Vault</span>
        <span className="text-muted text-[9px]">AES-256</span>
      </div>
    </div>
  );
}

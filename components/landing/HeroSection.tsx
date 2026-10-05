"use client";

import React from "react";
import Link from "next/link";
import { ThreeTradeGlobe } from "./ThreeTradeGlobe";
import { HeroBackgroundAnimation } from "./HeroBackgroundAnimation";
import {
  ShieldCheck,
  ArrowRight,
  Calculator,
  Sparkles,
  CheckCircle2,
  Lock,
  Scale,
  Ship,
  Globe2,
  Compass,
  Cpu,
  Layers,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-line bg-bg/40">
      {/* High-End Modern Animated Background (Interactive Grid, Flowing Packets & Fluid Glows) */}
      <HeroBackgroundAnimation />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-dim text-blue border border-blue/20 text-xs font-mono font-semibold shadow-2xs animate-in fade-in duration-500">
          <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
          <span>CBIC ICEGATE 2.0 &bull; CUSTOMS TARIFF ACT 2026 ACTIVE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-ink tracking-tight leading-[1.22] max-w-3xl mx-auto">
          Deterministic Trade Intelligence &amp; <br className="hidden sm:inline" />
          <span className="text-blue">
            Landed Cost Engine
          </span>{" "}
          for Modern Exim
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
          Statutory customs tariffs, automated 8-digit HS classification, and multimodal landed cost modeling for international trade.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue hover:bg-blue-dark text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#interactive-demo"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-bg hover:bg-line border border-line text-ink text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calculator className="w-4 h-4 text-blue" />
            <span>Interactive Calculator</span>
          </a>

          <Link
            href="/pricing"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-muted hover:text-ink text-sm font-semibold transition-colors"
          >
            <span>View SaaS Plans</span>
          </Link>
        </div>

        {/* 3D Three.js Interactive Banner Section */}
        <div className="relative pt-4 max-w-4xl mx-auto">
          {/* Subtle Frame Container */}
          <div className="relative rounded-3xl bg-gradient-to-b from-panel/90 via-panel/60 to-bg/80 border border-line/90 shadow-xl overflow-hidden backdrop-blur-xs">
            {/* Ambient Corner Accents */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue/20 via-blue to-indigo-500/20" />
            
            {/* Top Interactive Indicator Strip */}
            <div className="px-5 py-3 border-b border-line/60 flex items-center justify-between text-xs font-mono text-muted bg-panel/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green animate-ping" />
                <span className="font-semibold text-ink">Interactive 3D Trade Engine</span>
              </div>
              <span className="hidden sm:inline text-[11px] text-muted">
                Move cursor over globe to tilt & navigate routes
              </span>
            </div>

            {/* Three.js Canvas Container */}
            <div className="relative w-full">
              <ThreeTradeGlobe className="w-full" />

              {/* Floating Stat Card 1: UAE CEPA Arbitrage (Top-Left) */}
              <div className="absolute top-4 left-4 sm:top-8 sm:left-8 p-3 rounded-xl bg-panel/95 border border-line shadow-lg backdrop-blur-md text-left hidden sm:block animate-in fade-in slide-in-from-left duration-700">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-green font-bold uppercase tracking-wider mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green" />
                  <span>CEPA Concession</span>
                </div>
                <div className="text-xs font-bold text-ink leading-tight">
                  UAE &rarr; India: 0% BCD
                </div>
              </div>

              {/* Floating Stat Card 2: ICEGATE 2.0 Active Sync (Top-Right) */}
              <div className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 rounded-xl bg-panel/95 border border-line shadow-lg backdrop-blur-md text-left hidden sm:block animate-in fade-in slide-in-from-right duration-700">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue font-bold uppercase tracking-wider mb-0.5">
                  <Cpu className="w-3 h-3 text-blue" />
                  <span>ICEGATE 2.0 Live</span>
                </div>
                <div className="text-xs font-bold text-ink leading-tight">
                  Customs Act 2026
                </div>
              </div>

              {/* Floating Stat Card 3: GIR Classification Node (Bottom-Left) */}
              <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 p-3 rounded-xl bg-panel/95 border border-line shadow-lg backdrop-blur-md text-left hidden md:block animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-600 font-bold uppercase tracking-wider mb-0.5">
                  <Layers className="w-3 h-3 text-amber-600" />
                  <span>GIR 1-6 Sequencing</span>
                </div>
                <div className="text-xs font-bold text-ink leading-tight font-mono">
                  HS 7204.49.00
                </div>
              </div>

              {/* Floating Stat Card 4: Sourcing Hubs (Bottom-Right) */}
              <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 p-3 rounded-xl bg-panel/95 border border-line shadow-lg backdrop-blur-md text-left hidden md:block animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider mb-0.5">
                  <Globe2 className="w-3 h-3 text-indigo-600" />
                  <span>Multimodal Lanes</span>
                </div>
                <div className="text-xs font-bold text-ink leading-tight">
                  8 Global Corridors
                </div>
              </div>
            </div>

            {/* Bottom Status Ticker */}
            <div className="px-4 py-2.5 bg-panel/80 border-t border-line/60 flex items-center justify-between text-[11px] font-mono text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue" />
                Live Corridors: Mumbai (JNPT) &bull; Dubai &bull; Rotterdam &bull; Singapore &bull; New York
              </span>
            </div>
          </div>
        </div>

        {/* Trust Badges Row */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue" />
            <span>Zero-Drift Audit Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber" />
            <span>Client-Side BYOK Encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-ink" />
            <span>CEPA & ECTA FTA Live Feeds</span>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Card 1: Statutory Tariffs */}
          <div className="group relative p-5 rounded-2xl bg-panel/90 border border-line shadow-2xs hover:shadow-md hover:border-blue/40 transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono">
                Statutory Tariffs
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-dim text-blue border border-blue/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-ink tracking-tight mb-1 group-hover:text-blue transition-colors">
              100% Gazette
            </div>
            <p className="text-xs text-muted leading-relaxed">
              CBIC ICEGATE & SWS 10%
            </p>
          </div>

          {/* Card 2: Classification Accuracy */}
          <div className="group relative p-5 rounded-2xl bg-panel/90 border border-line shadow-2xs hover:shadow-md hover:border-blue/40 transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono">
                Classification
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-ink tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">
              Sequential GIR 1–6
            </div>
            <p className="text-xs text-muted leading-relaxed">
              General Rules of Interpretation
            </p>
          </div>

          {/* Card 3: Arbitrage Engine */}
          <div className="group relative p-5 rounded-2xl bg-panel/90 border border-line shadow-2xs hover:shadow-md hover:border-green/40 transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono">
                Arbitrage Engine
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Globe2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-ink tracking-tight mb-1 group-hover:text-emerald-600 transition-colors">
              5 Jurisdictions
            </div>
            <p className="text-xs text-muted leading-relaxed">
              CEPA 0% vs MFN 2.5% BCD
            </p>
          </div>

          {/* Card 4: AI Copilot */}
          <div className="group relative p-5 rounded-2xl bg-panel/90 border border-line shadow-2xs hover:shadow-md hover:border-amber/40 transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono">
                AI Trade Copilot
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-ink tracking-tight mb-1 group-hover:text-amber-600 transition-colors">
              Grounded Akshara
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Auditable Tool-Call Logs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

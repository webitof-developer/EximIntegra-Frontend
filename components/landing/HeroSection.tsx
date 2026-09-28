"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Calculator,
  Sparkles,
  CheckCircle2,
  Lock,
  Scale,
  Ship,
  TrendingDown,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-line bg-gradient-to-b from-panel via-panel to-bg">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-dim/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-dim text-blue border border-blue/20 text-xs font-mono font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
          <span>CBIC ICEGATE 2.0 &bull; CUSTOMS TARIFF ACT 2026 ACTIVE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-ink tracking-tight leading-[1.15]">
          Deterministic Trade Intelligence & <br className="hidden sm:inline" />
          <span className="text-blue">Landed Cost Engine</span> for Modern Exim
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base text-muted max-w-3xl mx-auto leading-relaxed">
          Automate 8-digit HS commodity classification via sequential General Rules
          of Interpretation (GIR), calculate exact statutory customs duties with CBIC
          gazette rates, and model multimodal port logistics & smelter recovery yields.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue hover:bg-blue-dark text-white text-sm font-semibold shadow-xs hover:shadow transition-all"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#interactive-demo"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-bg hover:bg-line border border-line text-ink text-sm font-semibold transition-colors"
          >
            <Calculator className="w-4 h-4 text-blue" />
            <span>Try Interactive Calculator</span>
          </a>

          <Link
            href="/pricing"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-muted hover:text-ink text-sm font-semibold transition-colors"
          >
            <span>View SaaS Plans</span>
          </Link>
        </div>

        {/* Trust Badges Row */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted font-medium">
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
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-4 rounded-xl bg-panel border border-line shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted block font-semibold">
              Statutory Tariffs
            </span>
            <div className="text-xl font-bold font-data text-ink">
              100% Gazette
            </div>
            <span className="text-[11px] text-muted">
              CBIC ICEGATE & SWS 10%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-panel border border-line shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted block font-semibold">
              Classification Accuracy
            </span>
            <div className="text-xl font-bold font-data text-blue">
              Sequential GIR 1–6
            </div>
            <span className="text-[11px] text-muted">
              General Interpretation Rules
            </span>
          </div>

          <div className="p-4 rounded-xl bg-panel border border-line shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted block font-semibold">
              Arbitrage Engine
            </span>
            <div className="text-xl font-bold font-data text-green">
              5 Jurisdictions
            </div>
            <span className="text-[11px] text-muted">
              CEPA 0% vs MFN 2.5% BCD
            </span>
          </div>

          <div className="p-4 rounded-xl bg-panel border border-line shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted block font-semibold">
              AI Copilot
            </span>
            <div className="text-xl font-bold font-data text-ink">
              Grounded Akshara
            </div>
            <span className="text-[11px] text-muted">
              Auditable Tool-Call Logs
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

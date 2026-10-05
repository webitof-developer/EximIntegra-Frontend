"use client";

import React from "react";
import Link from "next/link";
import { StatusPill } from "@/components/ui";
import {
  Search,
  Calculator,
  Ship,
  Sparkles,
  Scale,
  Key,
  CheckCircle2,
  ArrowRight,
  Database,
  FileCheck,
  ShieldCheck,
  Layers,
} from "lucide-react";

interface FeatureCardItem {
  icon: React.ReactNode;
  iconBg: string;
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  link: string;
  linkText: string;
}

const features: FeatureCardItem[] = [
  {
    icon: <Search className="w-5 h-5 text-blue" />,
    iconBg: "bg-blue-dim text-blue",
    badge: "GIR 1 TO 6",
    title: "HS Classification Engine",
    description:
      "Statutory 6-to-8 digit tariff classification using sequential GIR 1–6 reasoning.",
    bullets: [
      "Natural language lookup with sequential GIR reasoning",
      "Bulk CSV batch manifest processor",
      "Automatic context sync across downstream engines",
    ],
    link: "/classify",
    linkText: "Classification Engine",
  },
  {
    icon: <Calculator className="w-5 h-5 text-green" />,
    iconBg: "bg-green-dim text-green",
    badge: "CBIC 2026",
    title: "Statutory Duty & Tariff Calculator",
    description:
      "Assessable CIF value, BCD, SWS, IGST, and AIDC with per-duty legal provenance.",
    bullets: [
      "Official CBIC gazette exchange rate synchronization",
      "Automatic detection of preferential FTA rates",
      "Anti-dumping duty and trade remedy flags",
    ],
    link: "/duty",
    linkText: "Customs Duties",
  },
  {
    icon: <Ship className="w-5 h-5 text-amber" />,
    iconBg: "bg-amber-dim text-amber",
    badge: "MULTIMODAL",
    title: "Landed Cost & Smelter Recovery Yield",
    description:
      "End-to-end landed economics including port handling, freight, and smelter recovery.",
    bullets: [
      "Port scale of rates (TAMP) and container handling",
      "Smelter molten metal recovery yield modeling",
      "Net cost per molten MT furnace valuation",
    ],
    link: "/landed-cost",
    linkText: "Landed Economics",
  },
  {
    icon: <Sparkles className="w-5 h-5 text-blue" />,
    iconBg: "bg-blue text-white",
    badge: "AI COPILOT",
    title: "Akshara AI — Conversational Intelligence",
    description:
      "Grounded conversational trade advisory backed by transparent statutory citations.",
    bullets: [
      "Verifiable tool-execution logs with latency metrics",
      "Context-aware shared Redux state updates",
      "Strict legal grounding in CBIC and DGFT schedules",
    ],
    link: "/akshara",
    linkText: "Consult Akshara AI",
  },
  {
    icon: <Scale className="w-5 h-5 text-ink" />,
    iconBg: "bg-panel border border-line text-ink",
    badge: "ARBITRAGE",
    title: "Country-of-Origin Sourcing Arbitrage",
    description:
      "Concurrent tariff and landed cost simulations across alternative supply jurisdictions.",
    bullets: [
      "Side-by-side landed cost & duty comparison",
      "Automatic CEPA and ECTA concession detection",
      "Instant sourcing origin transfer into active session",
    ],
    link: "/compare",
    linkText: "Country Sourcing",
  },
  {
    icon: <Key className="w-5 h-5 text-blue" />,
    iconBg: "bg-blue-dim text-blue",
    badge: "BYOK & ERP",
    title: "BYOK Integrations & Audit Trails",
    description:
      "Bring your own API keys, connect customs gateways, and sync with ERP systems.",
    bullets: [
      "AES-256 client-side BYOK encryption",
      "Private carrier freight & smelter yield overrides",
      "Deterministic calculation history with audit stamps",
    ],
    link: "/settings",
    linkText: "BYOK Integrations",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-bg border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-dim text-blue border border-blue/20 text-xs font-mono font-bold uppercase tracking-wider">
            <span>Modular Trade Intelligence Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            Six Specialized Engines in One Unified Platform
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Deterministic statutory calculations and landed cost modeling synchronized across every workflow.
          </p>
        </div>

        {/* 6-Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 bg-panel border border-line rounded-2xl shadow-xs hover:shadow-sm hover:border-line/80 transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${f.iconBg}`}
                  >
                    {f.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-bg text-muted px-2 py-0.5 rounded border border-line">
                    {f.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-ink tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {f.description}
                  </p>
                </div>

                <ul className="space-y-2 pt-2 border-t border-line text-xs text-ink/90">
                  {f.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue shrink-0 mt-0.5" />
                      <span className="leading-snug text-muted">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-line">
                <Link
                  href={f.link}
                  className="text-xs font-semibold text-blue hover:text-blue-dark inline-flex items-center gap-1 transition-colors"
                >
                  <span>{f.linkText}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
      "Determine exact 6-to-8 digit customs tariff items using sequential General Rules of Interpretation (GIR), legal explanatory notes, and candidate confidence scores.",
    bullets: [
      "Natural language commodity lookup with GIR logic trail",
      "Bulk CSV batch manifest processor with asynchronous polling",
      "Immediate candidate selection synced across all downstream engines",
    ],
    link: "/classify",
    linkText: "Try Classification Engine",
  },
  {
    icon: <Calculator className="w-5 h-5 text-green" />,
    iconBg: "bg-green-dim text-green",
    badge: "CBIC 2026",
    title: "Statutory Duty & Tariff Calculator",
    description:
      "Calculate assessable CIF value, Basic Customs Duty (BCD), Social Welfare Surcharge (SWS), IGST, and AIDC with per-duty legal provenance stamps.",
    bullets: [
      "Fortnightly CBIC official gazette exchange rate synchronization",
      "Preferential FTA rates automatically detected and applied",
      "Anti-dumping duty and trade remedy benchmark flags",
    ],
    link: "/duty",
    linkText: "Calculate Customs Duties",
  },
  {
    icon: <Ship className="w-5 h-5 text-amber" />,
    iconBg: "bg-amber-dim text-amber",
    badge: "MULTIMODAL",
    title: "Landed Cost & Smelter Recovery Yield",
    description:
      "Model total landed cost including ocean freight, Nhava Sheva (JNPT) & Mundra port CFS container charges, inland transport, and furnace metal recovery yields.",
    bullets: [
      "Container handling (THC) and port scale of rates (TAMP)",
      "Smelter molten metal recovery yield vs slag/dross loss economics",
      "Effective cost per molten MT valuation for induction & arc furnaces",
    ],
    link: "/landed-cost",
    linkText: "Model Landed Economics",
  },
  {
    icon: <Sparkles className="w-5 h-5 text-blue" />,
    iconBg: "bg-blue text-white",
    badge: "AI COPILOT",
    title: "Akshara AI — Conversational Intelligence",
    description:
      "Grounded conversational trade advisory backed by transparent tool-execution logs. Resolves complex customs inquiries with official gazette citations.",
    bullets: [
      "Transparent tool-call logs with execution latency metrics",
      "Active session context awareness: updates shared Redux state dynamically",
      "Strict grounding: flags unresolvable claims and hazardous material rules",
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
      "Run concurrent side-by-side tariff and landed cost simulations across alternative jurisdictions (USA, UAE, Australia, Vietnam, China) to optimize supply chain costs.",
    bullets: [
      "Side-by-side matrix comparing landed cost and statutory duties",
      "Automatic detection of CEPA 0% and ECTA 0% preferential concessions",
      "One-click application of winning origin into active session context",
    ],
    link: "/compare",
    linkText: "Compare Country Sourcing",
  },
  {
    icon: <Key className="w-5 h-5 text-blue" />,
    iconBg: "bg-blue-dim text-blue",
    badge: "BYOK & ERP",
    title: "BYOK Integrations & Audit Trails",
    description:
      "Bring your own API keys for LLMs (OpenAI, Claude, Gemini), connect live customs gateways (ICEGATE, DGFT), configure private carrier rates, and trigger ERP webhooks.",
    bullets: [
      "Client-side AES-256 BYOK encryption for custom LLM providers",
      "Negotiated ocean freight and smelter yield rate overrides",
      "Deterministic calculation history with permanent reproducibility stamps",
    ],
    link: "/settings",
    linkText: "Explore BYOK Integrations",
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
            Eliminate fragmented spreadsheets, manual tariff gazettes, and customs
            disputes with deterministic calculations synchronized across every workflow.
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

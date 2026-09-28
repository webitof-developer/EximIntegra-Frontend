"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProvenanceBadge, StatusPill } from "@/components/ui";
import {
  Calculator,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Ship,
  Check,
  Scale,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface PresetItem {
  id: string;
  name: string;
  hsCode: string;
  defaultValUsd: number;
  qtyMt: number;
  bcdMfn: number;
  bcdCepa: number;
  yieldPct: number;
}

const presets: PresetItem[] = [
  {
    id: "steel",
    name: "Heavy Melting Steel Scrap (HMS 1/2)",
    hsCode: "7204.49.00",
    defaultValUsd: 42000,
    qtyMt: 100,
    bcdMfn: 0.025,
    bcdCepa: 0.0,
    yieldPct: 91.5,
  },
  {
    id: "copper",
    name: "Copper Wire Scrap (Birch / Cliff)",
    hsCode: "7404.00.12",
    defaultValUsd: 85000,
    qtyMt: 10,
    bcdMfn: 0.05,
    bcdCepa: 0.0,
    yieldPct: 97.4,
  },
  {
    id: "aluminium",
    name: "Aluminium Scrap (Tense / Tabor)",
    hsCode: "7602.00.10",
    defaultValUsd: 38000,
    qtyMt: 20,
    bcdMfn: 0.025,
    bcdCepa: 0.0,
    yieldPct: 88.2,
  },
];

export function InteractiveTariffDemo() {
  const [selectedPreset, setSelectedPreset] = useState<PresetItem>(presets[0]);
  const [origin, setOrigin] = useState<"US" | "AE">("US");
  const [valueUsd, setValueUsd] = useState<number>(presets[0].defaultValUsd);

  const exchangeRate = 86.85; // Official CBIC rate
  const cifInr = valueUsd * exchangeRate;

  // Duty math
  const bcdRate = origin === "AE" ? selectedPreset.bcdCepa : selectedPreset.bcdMfn;
  const bcdAmountInr = cifInr * bcdRate;
  const swsAmountInr = bcdAmountInr * 0.1;
  const igstAmountInr = (cifInr + bcdAmountInr + swsAmountInr) * 0.18;
  const totalTaxInr = bcdAmountInr + swsAmountInr + igstAmountInr;

  // Logistics & Landed
  const oceanFreightUsd = origin === "AE" ? 680 : 1850;
  const portCfslnInr = 8200 * 5; // 5 TEUs
  const inlandTransitInr = 25000;
  const totalLandedInr =
    cifInr +
    bcdAmountInr +
    swsAmountInr +
    igstAmountInr +
    oceanFreightUsd * exchangeRate +
    portCfslnInr +
    inlandTransitInr;

  const moltenYieldMt = (selectedPreset.qtyMt * selectedPreset.yieldPct) / 100;
  const effectiveCostPerMoltenMt = totalLandedInr / moltenYieldMt;

  const handleSelectPreset = (p: PresetItem) => {
    setSelectedPreset(p);
    setValueUsd(p.defaultValUsd);
  };

  return (
    <section id="interactive-demo" className="py-16 bg-panel border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-dim text-green border border-green/20 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-green" />
            <span>LIVE INTERACTIVE PREVIEW &bull; NO SIGNUP NEEDED</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Test the Statutory Tariff & Landed Cost Engine
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Select a commodity grade below and switch origins to see instant customs
            arbitrage between MFN standard and CEPA preferential rates.
          </p>
        </div>

        {/* Interactive Calculator Card */}
        <div className="p-6 bg-bg border border-line rounded-2xl shadow-xs space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Presets */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-xs font-bold text-ink block uppercase tracking-wider font-mono">
                1. Select Commodity Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {presets.map((p) => {
                  const isSelected = selectedPreset.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-dim border-blue text-blue shadow-2xs font-semibold"
                          : "bg-panel border-line text-muted hover:text-ink hover:bg-line/40"
                      }`}
                    >
                      <span className="font-mono text-[10px] block opacity-80">
                        HS {p.hsCode}
                      </span>
                      <span className="text-xs font-bold truncate block">
                        {p.name.split("(")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sourcing Origin Selector */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-ink block uppercase tracking-wider font-mono">
                2. Country of Origin
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrigin("US")}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    origin === "US"
                      ? "bg-blue-dim border-blue text-blue font-bold shadow-2xs"
                      : "bg-panel border-line text-muted hover:text-ink"
                  }`}
                >
                  🇺🇸 USA (MFN)
                </button>

                <button
                  type="button"
                  onClick={() => setOrigin("AE")}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    origin === "AE"
                      ? "bg-green-dim border-green text-green font-bold shadow-2xs"
                      : "bg-panel border-line text-muted hover:text-ink"
                  }`}
                >
                  🇦🇪 UAE (CEPA 0%)
                </button>
              </div>
            </div>

            {/* Invoice Value Input */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-ink block uppercase tracking-wider font-mono">
                3. CIF Value (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted font-mono font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={valueUsd}
                  onChange={(e) => setValueUsd(Number(e.target.value) || 0)}
                  className="w-full py-2 pl-7 pr-3 bg-panel border border-line rounded-xl text-xs font-mono font-bold text-ink focus:outline-none focus:border-blue"
                />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {/* Assessable Value */}
            <div className="p-4 bg-panel border border-line rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase block">
                Assessable Value (CIF)
              </span>
              <div className="text-lg font-bold font-data text-ink">
                {formatCurrency(cifInr, "INR")}
              </div>
              <span className="text-[10px] font-mono text-muted block">
                @ Official ₹{exchangeRate}/USD
              </span>
            </div>

            {/* Basic Customs Duty */}
            <div className="p-4 bg-panel border border-line rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase">
                  Customs Duty (BCD)
                </span>
                <span className="text-[10px] font-mono font-bold text-green">
                  {formatPercent(bcdRate)}
                </span>
              </div>
              <div className="text-lg font-bold font-data text-ink">
                {formatCurrency(bcdAmountInr, "INR")}
              </div>
              <span className="text-[10px] font-mono text-muted block">
                {origin === "AE" ? "CEPA Tariff Exemption" : "Standard MFN Tariff"}
              </span>
            </div>

            {/* Total Tax (BCD + SWS + IGST) */}
            <div className="p-4 bg-panel border border-line rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase block">
                Total Customs Tax Outlay
              </span>
              <div className="text-lg font-bold font-data text-blue">
                {formatCurrency(totalTaxInr, "INR")}
              </div>
              <span className="text-[10px] font-mono text-muted block">
                Includes BCD, SWS & IGST
              </span>
            </div>

            {/* Smelter Effective Cost */}
            <div className="p-4 bg-navy text-white rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#93C5FD] uppercase">
                  Smelter Yield Metric
                </span>
                <span className="text-[10px] font-mono font-bold text-green">
                  {selectedPreset.yieldPct}% Yield
                </span>
              </div>
              <div className="text-lg font-bold font-data text-white">
                ₹{Math.round(effectiveCostPerMoltenMt).toLocaleString("en-IN")}/MT
              </div>
              <span className="text-[10px] font-mono text-[#8EA0C0] block">
                Effective Cost per Molten MT
              </span>
            </div>
          </div>

          {/* Arbitrage Banner if UAE */}
          {origin === "AE" ? (
            <div className="p-3.5 bg-green-dim/60 border border-green/30 rounded-xl flex items-center justify-between text-xs text-green font-semibold">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  <strong>CEPA Preference Applied:</strong> Basic Customs Duty is 0.0%
                  (Saving ₹{Math.round(cifInr * selectedPreset.bcdMfn).toLocaleString("en-IN")} vs MFN).
                </span>
              </div>
              <ProvenanceBadge type="LIVE" source="India-UAE CEPA 2026" compact />
            </div>
          ) : (
            <div className="p-3.5 bg-amber-dim/50 border border-amber/30 rounded-xl flex items-center justify-between text-xs text-amber font-semibold">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                <span>
                  <strong>MFN Standard Tariff:</strong> Switch origin to UAE to see 0% preferential duty under CEPA.
                </span>
              </div>
              <ProvenanceBadge type="LIVE" source="First Schedule 2026" compact />
            </div>
          )}

          {/* Conversion CTA Footer */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-muted font-mono">
              Ready to calculate your entire 500-item container manifest?
            </span>
            <Link
              href="/register"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white font-semibold transition-colors shadow-xs"
            >
              <span>Calculate Entire Manifest in Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LandedCostResponse } from "@/lib/types";
import { Card, ProvenanceBadge, StatusPill } from "@/components/ui";
import { formatCurrency, formatHsCode, formatPercent } from "@/lib/formatters";
import {
  Flame,
  Ship,
  TrendingDown,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sliders,
  DollarSign,
  AlertTriangle,
  Scale,
  Sparkles,
} from "lucide-react";

interface LandedCostResultsViewProps {
  result: LandedCostResponse;
  onSaveToContext: (landedCostId: string) => void;
  isSaved?: boolean;
}

export function LandedCostResultsView({
  result,
  onSaveToContext,
  isSaved = false,
}: LandedCostResultsViewProps) {
  // Interactive live yield slider state (§2.3 requirement)
  const initialYield = result.metal_recovery?.smelter_recovery_yield_percent || 91.0;
  const [liveYield, setLiveYield] = useState<number>(initialYield);

  const purity = result.metal_recovery?.assay_purity_percent || 92.5;
  const batchQty = result.batch_quantity || 100;
  const netLandedInr = result.net_landed_cost_inr;
  const exRate = result.exchange_rate;

  // Live recalculation based on slider
  const liveRecoveredMt = Number((batchQty * (purity / 100) * (liveYield / 100)).toFixed(3));
  const liveContainedCostInr = Number((netLandedInr / liveRecoveredMt).toFixed(2));
  const liveContainedCostUsd = Number((liveContainedCostInr / exRate).toFixed(2));

  return (
    <div className="space-y-6">
      {/* 4 Key Headline Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Net Landed Cost */}
        <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-muted font-semibold">
              Net Landed Outlay (excl. GST)
            </span>
            <ProvenanceBadge type="LIVE" source="Customs+Logistics" compact />
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-bold font-data text-ink">
              {formatCurrency(result.net_landed_cost_inr, "INR")}
            </div>
            <div className="text-xs text-muted font-mono">
              USD {result.net_landed_cost_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* 2. Landed Cost Per MT */}
        <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-muted font-semibold">
              Landed Cost / MT
            </span>
            <span className="text-[10px] font-mono text-blue bg-blue-dim px-1.5 py-0.5 rounded font-bold">
              PER MT
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-bold font-data text-blue">
              {formatCurrency(result.landed_cost_per_mt_inr, "INR")}
              <span className="text-xs font-normal text-muted font-sans">/MT</span>
            </div>
            <div className="text-xs text-muted font-mono">
              ${result.landed_cost_per_mt_usd}/MT @ ₹{result.exchange_rate}
            </div>
          </div>
        </div>

        {/* 3. Landed Cost Per KG */}
        <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-muted font-semibold">
              Landed Cost / KG
            </span>
            <span className="text-[10px] font-mono text-ink bg-line px-1.5 py-0.5 rounded font-bold">
              PER KG
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-bold font-data text-ink">
              ₹{result.landed_cost_per_kg_inr}
              <span className="text-xs font-normal text-muted font-sans">/kg</span>
            </div>
            <div className="text-xs text-muted font-mono">
              ${result.landed_cost_per_kg_usd}/kg effective
            </div>
          </div>
        </div>

        {/* 4. Contained / Recoverable Metal Cost */}
        <div className="p-5 bg-navy text-white border border-[#1B2A4A] rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#8EA0C0] font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber" />
              Contained Metal Cost
            </span>
            <span className="text-[10px] font-mono text-amber bg-[#2B2315] px-1.5 py-0.5 rounded border border-amber/30 font-bold">
              {result.metal_recovery?.contained_metal || "Pure Metal"}
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-bold font-data text-amber">
              {formatCurrency(liveContainedCostInr, "INR")}
              <span className="text-xs font-normal text-[#8EA0C0] font-sans">/MT</span>
            </div>
            <div className="text-xs text-[#8EA0C0] font-mono">
              ${liveContainedCostUsd}/MT pure yield ({liveYield}% yield)
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Smelter Recovery Yield Tool (§2.3 Requirement) */}
      {result.metal_recovery && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber" />
              <span className="text-sm font-bold text-ink">
                Contained Metal Valuation & Smelter Yield Assumption (§2.3)
              </span>
            </div>
          }
          subtitle={`Material: ${result.metal_recovery.contained_metal} &bull; Certified Assay: ${purity}% purity`}
          badge={
            <ProvenanceBadge
              type="ILLUSTRATIVE"
              source="Furnace Assay Standard"
              compact
            />
          }
        >
          <div className="space-y-5">
            <div className="p-4 bg-amber-dim/40 border border-amber/20 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-amber-dark">
                    Adjust Smelter Recovery Yield Rate Assumption:
                  </span>
                  <span className="text-xs font-mono font-bold text-ink ml-2">
                    {liveYield.toFixed(1)}%
                  </span>
                </div>
                <span className="text-[11px] text-amber">
                  Slide to test different induction furnace or smelting losses
                </span>
              </div>

              {/* Range Slider */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-muted">75%</span>
                <input
                  type="range"
                  min="75"
                  max="99"
                  step="0.5"
                  value={liveYield}
                  onChange={(e) => setLiveYield(Number(e.target.value))}
                  className="flex-1 h-2 bg-line rounded-lg appearance-none cursor-pointer accent-amber"
                />
                <span className="text-xs font-mono text-muted">99%</span>
              </div>

              {/* Dynamic live output metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber/20 font-mono text-xs">
                <div className="bg-panel p-2.5 rounded-lg border border-line">
                  <span className="text-[10px] text-muted uppercase block">
                    Recovered Metallic Volume
                  </span>
                  <span className="text-sm font-bold text-ink">
                    {liveRecoveredMt} MT
                  </span>
                  <span className="text-[10px] text-muted block">
                    From {batchQty} MT raw consignment
                  </span>
                </div>

                <div className="bg-panel p-2.5 rounded-lg border border-line">
                  <span className="text-[10px] text-muted uppercase block">
                    Contained Metal Cost (INR)
                  </span>
                  <span className="text-sm font-bold text-amber">
                    {formatCurrency(liveContainedCostInr, "INR")}/MT
                  </span>
                  <span className="text-[10px] text-muted block">
                    Per MT pure {result.metal_recovery.contained_metal}
                  </span>
                </div>

                <div className="bg-panel p-2.5 rounded-lg border border-line">
                  <span className="text-[10px] text-muted uppercase block">
                    Contained Metal Cost (USD)
                  </span>
                  <span className="text-sm font-bold text-blue">
                    ${liveContainedCostUsd}/MT
                  </span>
                  <span className="text-[10px] text-muted block">
                    Yield multiplier: {(batchQty / liveRecoveredMt).toFixed(3)}x
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted leading-relaxed">
              <strong>Why this matters:</strong> While the raw commodity landed cost is{" "}
              <span className="font-mono font-semibold text-ink">
                {formatCurrency(result.landed_cost_per_mt_inr, "INR")}/MT
              </span>, after accounting for {purity}% certified assay and a {liveYield}% recovery yield in melting, the true cost of usable metal is{" "}
              <span className="font-mono font-bold text-amber">
                {formatCurrency(liveContainedCostInr, "INR")}/MT
              </span>.
            </p>
          </div>
        </Card>
      )}

      {/* Cost Waterfall Breakdown Table */}
      <Card
        title="Comprehensive Landed Cost Waterfall"
        subtitle={`Port of Discharge: ${result.destination_port} &bull; Batch: ${result.batch_quantity} ${result.batch_unit}`}
      >
        <div className="border border-line rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBFD] border-b border-line text-muted uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Cost Element</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Amount (USD)</th>
                <th className="py-3 px-4">% Share</th>
                <th className="py-3 px-4">Visual Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-sans">
              {result.cost_waterfall.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-bg/50 transition-colors ${
                    item.is_recoverable_itc ? "bg-[#FAFBFD]" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-ink flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.is_recoverable_itc && (
                        <StatusPill
                          label="ITC RECOVERABLE"
                          variant="success"
                          size="xs"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] bg-bg px-1.5 py-0.5 rounded border border-line text-muted">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-data font-bold text-ink">
                    {formatCurrency(item.amount_inr, "INR")}
                  </td>
                  <td className="py-3 px-4 font-data text-muted">
                    ${item.amount_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-ink">
                    {item.percent_of_total}%
                  </td>
                  <td className="py-3 px-4 w-44">
                    <div className="w-full h-1.5 rounded-full bg-bg border border-line overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.category === "CIF"
                            ? "bg-blue"
                            : item.category === "DUTY"
                            ? "bg-green"
                            : item.category === "TAX"
                            ? "bg-muted"
                            : "bg-amber"
                        }`}
                        style={{ width: `${Math.min(100, item.percent_of_total)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Landed Cost Run Summary & Save Action */}
      <div className="p-4 bg-panel border border-line rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-dim text-green flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink">
              Landed Cost Record Computed
            </h4>
            <span className="text-[11px] font-mono text-muted">
              Record ID: {result.landed_cost_id} &bull; HS {formatHsCode(result.hs_code)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSaveToContext(result.landed_cost_id)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
            isSaved
              ? "bg-green text-white"
              : "bg-blue hover:bg-blue-dark text-white"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {isSaved ? "Saved to History" : "Save Record"}
          </span>
        </button>
      </div>
    </div>
  );
}

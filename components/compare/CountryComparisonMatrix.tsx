"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CountryComparisonResponse, CountryComparisonItem } from "@/lib/types";
import { Card, ProvenanceBadge, StatusPill } from "@/components/ui";
import { formatCurrency, formatHsCode, formatPercent } from "@/lib/formatters";
import {
  Scale,
  Award,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Ship,
  Sparkles,
  Info,
} from "lucide-react";

interface CountryComparisonMatrixProps {
  data: CountryComparisonResponse;
  onApplyCountry: (country: CountryComparisonItem) => void;
  selectedOrigin?: string;
}

export function CountryComparisonMatrix({
  data,
  onApplyCountry,
  selectedOrigin = "AE",
}: CountryComparisonMatrixProps) {
  const [activeCode, setActiveCode] = useState(selectedOrigin);

  const bestCorridor = data.comparisons.find(
    (c) => c.country_code === data.best_arbitrage_country
  );

  return (
    <div className="space-y-6">
      {/* Arbitrage Highlight Banner */}
      {bestCorridor && (
        <div className="p-6 bg-navy text-white rounded-xl shadow-xs border border-[#1B2A4A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{bestCorridor.flag}</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-green">
                RECOMMENDED SOURCING CORRIDOR
              </span>
              <StatusPill label="MAX ARBITRAGE" variant="success" size="xs" />
            </div>

            <h3 className="text-lg font-bold">
              {bestCorridor.country_name} ({bestCorridor.trade_agreement})
            </h3>

            <p className="text-xs text-[#9EB1D0] leading-relaxed max-w-2xl">
              Switching procurement from US Standard MFN to UAE CEPA yields{" "}
              <strong className="text-green font-mono">
                {formatCurrency(bestCorridor.savings_vs_mfn_inr, "INR")}
              </strong>{" "}
              in tariff and short-sea freight savings (
              <strong className="text-green font-mono">
                {bestCorridor.savings_percentage}% cost reduction
              </strong>
              ).
            </p>
          </div>

          <button
            type="button"
            onClick={() => onApplyCountry(bestCorridor)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green hover:bg-green-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply {bestCorridor.country_name} as Active Origin</span>
          </button>
        </div>
      )}

      {/* Side-by-Side Comparison Table Component */}
      <Card
        title={
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-blue" />
            <span className="text-base font-bold text-ink">
              Cross-Border Origin Comparison Matrix
            </span>
            <span className="text-xs font-mono text-muted bg-bg px-2 py-0.5 rounded border border-line">
              HS {formatHsCode(data.hs_code)} &bull; {data.quantity} {data.unit}
            </span>
          </div>
        }
        subtitle="Side-by-side evaluation of statutory duty tariffs, freight outlays, and net landed economics across sourcing jurisdictions."
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Country Headers */}
            <thead>
              <tr className="bg-[#FAFBFD] border-b border-line">
                <th className="py-4 px-5 text-muted uppercase font-mono text-[10px] w-56">
                  Metric / Cost Element
                </th>
                {data.comparisons.map((c) => (
                  <th
                    key={c.country_code}
                    className={`py-4 px-5 text-center transition-colors min-w-[200px] ${
                      c.is_recommended_arbitrage
                        ? "bg-green-dim/40 border-x-2 border-green/30"
                        : "border-r border-line"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">{c.flag}</span>
                      <span className="font-bold text-ink text-sm">
                        {c.country_name}
                      </span>
                      <span className="text-[10px] text-muted font-normal max-w-[170px] truncate">
                        {c.trade_agreement}
                      </span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <ProvenanceBadge
                          type={c.provenance.type}
                          source={c.provenance.source}
                          compact
                        />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-line font-sans">
              {/* SECTION 1: STATUTORY DUTY TARIFFS */}
              <tr className="bg-bg/40 font-mono text-[10px] uppercase text-muted font-bold">
                <td colSpan={data.comparisons.length + 1} className="py-2 px-5">
                  1. Customs Duties & Statutory Tariffs
                </td>
              </tr>

              <tr>
                <td className="py-3 px-5 font-semibold text-ink">
                  Basic Customs Duty (BCD) Rate
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-3 px-5 text-center font-data font-bold ${
                      c.bcd_rate === 0
                        ? "text-green bg-green-dim/20"
                        : "text-ink"
                    } ${c.is_recommended_arbitrage ? "border-x-2 border-green/30" : "border-r border-line"}`}
                  >
                    {formatPercent(c.bcd_rate)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-5 font-semibold text-ink">
                  Total Customs Duty (BCD+SWS)
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-3 px-5 text-center font-data font-bold ${
                      c.total_customs_duty_inr === 0
                        ? "text-green"
                        : "text-ink"
                    } ${c.is_recommended_arbitrage ? "border-x-2 border-green/30" : "border-r border-line"}`}
                  >
                    {formatCurrency(c.total_customs_duty_inr, "INR")}
                  </td>
                ))}
              </tr>

              {/* SECTION 2: LOGISTICS & PORT CHARGES */}
              <tr className="bg-bg/40 font-mono text-[10px] uppercase text-muted font-bold">
                <td colSpan={data.comparisons.length + 1} className="py-2 px-5">
                  2. Multimodal Transit & Port Logistics
                </td>
              </tr>

              <tr>
                <td className="py-3 px-5 font-semibold text-ink">
                  CIF Base Port Invoice
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-3 px-5 text-center font-data text-muted ${
                      c.is_recommended_arbitrage ? "border-x-2 border-green/30" : "border-r border-line"
                    }`}
                  >
                    {formatCurrency(c.cif_inr, "INR")}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-5 font-semibold text-ink">
                  Port THC & Inland Transit
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-3 px-5 text-center font-data text-muted ${
                      c.is_recommended_arbitrage ? "border-x-2 border-green/30" : "border-r border-line"
                    }`}
                  >
                    {formatCurrency(c.port_logistics_inr, "INR")}
                  </td>
                ))}
              </tr>

              {/* SECTION 3: BOTTOM-LINE LANDED ECONOMICS */}
              <tr className="bg-bg/40 font-mono text-[10px] uppercase text-muted font-bold">
                <td colSpan={data.comparisons.length + 1} className="py-2 px-5">
                  3. Net Landed Cost & Unit Economics
                </td>
              </tr>

              <tr className="bg-blue-dim/20">
                <td className="py-3.5 px-5 font-bold text-ink">
                  Net Landed Cost (Total INR)
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-3.5 px-5 text-center font-data font-bold text-sm ${
                      c.is_recommended_arbitrage
                        ? "text-green border-x-2 border-green/30"
                        : "text-ink border-r border-line"
                    }`}
                  >
                    {formatCurrency(c.net_landed_cost_inr, "INR")}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-5 font-semibold text-ink">
                  Landed Cost / Metric Ton
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-3 px-5 text-center font-data font-bold ${
                      c.is_recommended_arbitrage
                        ? "text-blue border-x-2 border-green/30"
                        : "text-ink border-r border-line"
                    }`}
                  >
                    {formatCurrency(c.landed_cost_per_mt_inr, "INR")}/MT
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-5 font-semibold text-ink">
                  Contained Metal Cost / MT
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-3 px-5 text-center font-data font-bold ${
                      c.is_recommended_arbitrage
                        ? "text-amber border-x-2 border-green/30"
                        : "text-ink border-r border-line"
                    }`}
                  >
                    {formatCurrency(c.contained_metal_cost_mt_inr, "INR")}/MT
                  </td>
                ))}
              </tr>

              {/* SECTION 4: ARBITRAGE SAVINGS DELTA */}
              <tr className="bg-bg/40 font-mono text-[10px] uppercase text-muted font-bold">
                <td colSpan={data.comparisons.length + 1} className="py-2 px-5">
                  4. Sourcing Arbitrage Savings (vs MFN Benchmark)
                </td>
              </tr>

              <tr className="bg-green-dim/30">
                <td className="py-3.5 px-5 font-bold text-green">
                  Arbitrage Delta (Savings)
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-3.5 px-5 text-center font-data font-bold text-xs ${
                      c.savings_vs_mfn_inr > 0
                        ? "text-green"
                        : "text-muted"
                    } ${c.is_recommended_arbitrage ? "border-x-2 border-green/30" : "border-r border-line"}`}
                  >
                    {c.savings_vs_mfn_inr > 0 ? (
                      <div>
                        <span>+{formatCurrency(c.savings_vs_mfn_inr, "INR")}</span>
                        <div className="text-[10px] opacity-80">
                          ({c.savings_percentage}% saved)
                        </div>
                      </div>
                    ) : (
                      <span>Baseline MFN</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* ACTION ROW */}
              <tr className="bg-white">
                <td className="py-4 px-5 font-semibold text-muted text-[11px]">
                  Pipeline Action
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-4 px-5 text-center ${
                      c.is_recommended_arbitrage
                        ? "border-x-2 border-green/30 bg-green-dim/10"
                        : "border-r border-line"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onApplyCountry(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        c.is_recommended_arbitrage
                          ? "bg-green text-white hover:bg-green-dark"
                          : "bg-bg text-ink border border-line hover:bg-line"
                      }`}
                    >
                      Select Origin
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

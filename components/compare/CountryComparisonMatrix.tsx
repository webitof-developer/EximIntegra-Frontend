"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CountryComparisonResponse, CountryComparisonItem } from "@/lib/types";
import {
  Card,
  ProvenanceBadge,
  StatusPill,
  Table,
  TableHeader,
  TableBody,
} from "@/components/ui";
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
  Check,
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
  const isOverallNotCovered = data.coverage === "NOT_COVERED";
  const bestCorridor = data.comparisons.find(
    (c) => c.country_code === data.best_arbitrage_country && c.coverage !== "NOT_COVERED"
  );

  return (
    <div className="space-y-6">
      {/* Overall NOT COVERED Alert */}
      {isOverallNotCovered && (
        <div className="p-5 rounded-xl bg-amber-dim border border-amber/40 shadow-xs text-amber-dark space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-amber shrink-0" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-dark">
              TARIFF COMMODITY NOT COVERED IN REFERENCE DATASET
            </h4>
            <StatusPill label="NOT COVERED" variant="neutral" size="xs" />
          </div>
          <p className="text-xs text-ink leading-relaxed">
            {data.coverage_note ||
              "Tariff item not covered in the statutory reference dataset. Absence of tariff baseline prevents multilateral landed cost arbitrage ranking. No rates or origin rankings are fabricated."}
          </p>
        </div>
      )}

      {/* Arbitrage Highlight Banner */}
      {!isOverallNotCovered && bestCorridor && (
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
              Procuring via {bestCorridor.country_name} ({bestCorridor.trade_agreement}) yields{" "}
              <strong className="text-green font-mono">
                {formatCurrency(bestCorridor.savings_vs_mfn_inr, "INR")}
              </strong>{" "}
              in statutory tariff savings (
              <strong className="text-green font-mono">
                {bestCorridor.savings_percentage}% cost reduction
              </strong>{" "}
              vs benchmark).
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
          <Table>
            {/* Country Headers */}
            <TableHeader>
              <tr className="bg-[#FAFBFD] border-b border-line">
                <th className="py-4 px-5 text-muted uppercase font-mono text-[10px] w-56 text-left">
                  Metric / Cost Element
                </th>
                {data.comparisons.map((c) => {
                  const isColNotCovered = c.coverage === "NOT_COVERED";
                  return (
                    <th
                      key={c.country_code}
                      className={`py-4 px-5 text-center transition-colors min-w-[210px] ${
                        isColNotCovered
                          ? "bg-slate-50/80 border-r border-line text-muted"
                          : c.is_recommended_arbitrage
                          ? "bg-green-dim/40 border-x-2 border-green/30"
                          : "border-r border-line"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-2xl">{c.flag}</span>
                        <span className="font-bold text-ink text-sm flex items-center gap-1">
                          {c.country_name}
                          {c.country_code === data.baseline_origin && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-dim text-blue font-semibold">
                              BASE
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-muted font-normal max-w-[180px] truncate">
                          {c.trade_agreement}
                        </span>

                        {/* Distinct NOT_COVERED badge or Provenance Badge */}
                        <div className="mt-1 flex flex-col items-center gap-1">
                          {isColNotCovered ? (
                            <StatusPill label="NOT COVERED" variant="neutral" size="xs" />
                          ) : (
                            <ProvenanceBadge
                              type={c.provenance?.type || "LIVE"}
                              source={c.provenance?.source || "CBIC"}
                              compact
                            />
                          )}

                          {/* Freshness Strip per column */}
                          <div className="flex items-center gap-1 text-[9px] font-mono text-muted/80">
                            <span>v: {c.provenance?.dataset_version || "2026.1"}</span>
                            <span>&bull;</span>
                            <span>{c.provenance?.effective_date || data.as_of || "Current"}</span>
                          </div>

                          {/* Column Warnings (e.g., FREIGHT_DEFAULTED) */}
                          {c.warnings && c.warnings.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1 mt-0.5">
                              {c.warnings.map((w, wIdx) => (
                                <span
                                  key={wIdx}
                                  className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-dim text-amber-dark border border-amber/30 rounded"
                                  title={w}
                                >
                                  {w.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </TableHeader>

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
                      c.coverage === "NOT_COVERED"
                        ? "text-muted"
                        : c.bcd_rate === 0
                        ? "text-green bg-green-dim/20"
                        : "text-ink"
                    } ${c.is_recommended_arbitrage ? "border-x-2 border-green/30" : "border-r border-line"}`}
                  >
                    {c.coverage === "NOT_COVERED" || c.bcd_rate == null ? (
                      <span className="text-xs text-muted font-normal">Not Covered</span>
                    ) : (
                      formatPercent(c.bcd_rate)
                    )}
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
                      c.coverage === "NOT_COVERED"
                        ? "text-muted"
                        : c.total_customs_duty_inr === 0
                        ? "text-green"
                        : "text-ink"
                    } ${c.is_recommended_arbitrage ? "border-x-2 border-green/30" : "border-r border-line"}`}
                  >
                    {c.coverage === "NOT_COVERED" ? (
                      <span className="text-xs text-muted font-normal">—</span>
                    ) : (
                      formatCurrency(c.total_customs_duty_inr, "INR")
                    )}
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
                    {c.coverage === "NOT_COVERED" ? (
                      <span className="text-xs text-muted font-normal">—</span>
                    ) : (
                      formatCurrency(c.cif_inr, "INR")
                    )}
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
                    {c.coverage === "NOT_COVERED" ? (
                      <span className="text-xs text-muted font-normal">—</span>
                    ) : (
                      formatCurrency(c.port_logistics_inr, "INR")
                    )}
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
                      c.coverage === "NOT_COVERED"
                        ? "text-muted"
                        : c.is_recommended_arbitrage
                        ? "text-green border-x-2 border-green/30"
                        : "text-ink border-r border-line"
                    }`}
                  >
                    {c.coverage === "NOT_COVERED" || c.net_landed_cost_inr == null ? (
                      <span className="text-xs text-muted font-normal">Not Covered</span>
                    ) : (
                      formatCurrency(c.net_landed_cost_inr, "INR")
                    )}
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
                      c.coverage === "NOT_COVERED"
                        ? "text-muted"
                        : c.is_recommended_arbitrage
                        ? "text-blue border-x-2 border-green/30"
                        : "text-ink border-r border-line"
                    }`}
                  >
                    {c.coverage === "NOT_COVERED" || c.landed_cost_per_mt_inr == null ? (
                      <span className="text-xs text-muted font-normal">—</span>
                    ) : (
                      `${formatCurrency(c.landed_cost_per_mt_inr, "INR")}/MT`
                    )}
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
                      c.coverage === "NOT_COVERED"
                        ? "text-muted"
                        : c.is_recommended_arbitrage
                        ? "text-amber border-x-2 border-green/30"
                        : "text-ink border-r border-line"
                    }`}
                  >
                    {c.coverage === "NOT_COVERED" || c.contained_metal_cost_mt_inr == null ? (
                      <span className="text-xs text-muted font-normal">—</span>
                    ) : (
                      `${formatCurrency(c.contained_metal_cost_mt_inr, "INR")}/MT`
                    )}
                  </td>
                ))}
              </tr>

              {/* SECTION 4: ARBITRAGE SAVINGS DELTA */}
              <tr className="bg-bg/40 font-mono text-[10px] uppercase text-muted font-bold">
                <td colSpan={data.comparisons.length + 1} className="py-2 px-5">
                  4. Arbitrage Economics vs Baseline ({data.baseline_origin || "MFN Benchmark"})
                </td>
              </tr>

              <tr className="bg-blue-dim/10">
                <td className="py-3.5 px-5 font-bold text-ink">
                  Delta vs Baseline ({data.baseline_origin || "Benchmark"})
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-3.5 px-5 text-center font-data font-bold text-xs ${
                      c.coverage === "NOT_COVERED"
                        ? "text-muted"
                        : c.delta_vs_baseline_inr != null && c.delta_vs_baseline_inr < 0
                        ? "text-green"
                        : c.delta_vs_baseline_inr != null && c.delta_vs_baseline_inr > 0
                        ? "text-amber-dark"
                        : "text-muted"
                    } ${c.is_recommended_arbitrage ? "border-x-2 border-green/30" : "border-r border-line"}`}
                  >
                    {c.coverage === "NOT_COVERED" ? (
                      <span className="text-xs text-muted font-normal">Not Covered</span>
                    ) : c.country_code === data.baseline_origin ? (
                      <span className="text-muted font-semibold bg-bg px-2 py-0.5 rounded border border-line">Baseline Benchmark</span>
                    ) : c.delta_vs_baseline_inr != null && c.delta_vs_baseline_inr < 0 ? (
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase font-mono font-bold text-green">ARBITRAGE SAVING</div>
                        <div className="text-green font-bold">-{formatCurrency(Math.abs(c.delta_vs_baseline_inr), "INR")}</div>
                        <div className="text-[10px] text-green font-medium">
                          ({Math.abs(c.delta_vs_baseline_pct || 0)}% cheaper vs {data.baseline_origin})
                        </div>
                      </div>
                    ) : c.delta_vs_baseline_inr != null && c.delta_vs_baseline_inr > 0 ? (
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase font-mono font-bold text-amber-dark">COST INCREASE</div>
                        <div className="text-amber-dark font-bold">+{formatCurrency(c.delta_vs_baseline_inr, "INR")}</div>
                        <div className="text-[10px] text-amber-dark font-medium">
                          (+{c.delta_vs_baseline_pct || 0}% higher vs {data.baseline_origin})
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted">Parity (₹0.00)</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-5 font-semibold text-ink">
                  Preferential FTA Savings
                </td>
                {data.comparisons.map((c) => (
                  <td
                    key={c.country_code}
                    className={`py-3 px-5 text-center font-data font-semibold text-xs ${
                      c.coverage === "NOT_COVERED"
                        ? "text-muted"
                        : c.fta_saving_inr && c.fta_saving_inr > 0
                        ? "text-green"
                        : "text-muted"
                    } ${c.is_recommended_arbitrage ? "border-x-2 border-green/30" : "border-r border-line"}`}
                  >
                    {c.coverage === "NOT_COVERED" ? (
                      <span className="text-xs text-muted font-normal">—</span>
                    ) : c.fta_saving_inr && c.fta_saving_inr > 0 ? (
                      <div>
                        <span>+{formatCurrency(c.fta_saving_inr, "INR")}</span>
                        <div className="text-[10px] opacity-80 text-green font-normal">vs own MFN</div>
                      </div>
                    ) : (
                      <span className="text-muted font-normal text-xs">Standard MFN</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* ACTION ROW */}
              <tr className="bg-white">
                <td className="py-4 px-5 font-semibold text-muted text-[11px]">
                  Pipeline Action
                </td>
                {data.comparisons.map((c) => {
                  const isSelected = c.country_code === selectedOrigin;
                  const isNotCovered = c.coverage === "NOT_COVERED";

                  return (
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
                        disabled={isNotCovered}
                        onClick={() => onApplyCountry(c)}
                        title={
                          isSelected
                            ? `${c.country_name} is currently selected as your active pipeline origin`
                            : `Set ${c.country_name} as primary origin in shared context`
                        }
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isNotCovered
                            ? "bg-bg text-muted border border-line cursor-not-allowed opacity-50"
                            : isSelected
                            ? "bg-green text-white border border-green-dark shadow-xs cursor-default ring-2 ring-green/20"
                            : "bg-panel text-ink border border-line hover:bg-line hover:border-line-dark cursor-pointer shadow-2xs"
                        }`}
                      >
                        {isNotCovered ? (
                          "Not Covered"
                        ) : isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>Active Origin</span>
                          </>
                        ) : (
                          "Select Origin"
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Statutory Legal Disclaimer & Licensing Notice (Phase 8 Operations & Rollout) */}
      <div className="p-4 bg-panel border border-line rounded-xl text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-ink text-[11px] uppercase tracking-wider font-mono">
          <Scale className="w-4 h-4 text-blue shrink-0" />
          <span>Official Gazette Statutory Disclaimer & Data Licensing Notice</span>
        </div>
        <p className="text-muted leading-relaxed text-[11px]">
          <strong>Statutory Disclaimer:</strong> Trade duty calculations, FTA preferential rates, and policy restrictions are computed against official Gazette notifications (CBIC, DGFT, DGTR) for indicative commercial planning purposes. Official customs clearance requires Bill of Entry filing and assessment under the Customs Act, 1962.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-muted pt-1 border-t border-line/60">
          <span>CBIC Notifications: 22/2022-Cus (CEPA) • 112/2022-Cus (ECTA) • 46/2011-Cus (AIFTA)</span>
          <span>External Data: UN Comtrade API & ECB / CBIC Forex</span>
          <span>Audit: Dataset versions recorded in comparison run</span>
        </div>
      </div>
    </div>
  );
}

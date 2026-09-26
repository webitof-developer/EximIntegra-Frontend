"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CalculationHistoryRecord } from "@/lib/types";
import { ProvenanceBadge } from "@/components/ui/ProvenanceBadge";
import { CalculationDetailModal } from "./CalculationDetailModal";
import {
  Clock,
  Search,
  Filter,
  Calculator,
  Ship,
  ExternalLink,
  ChevronRight,
  Download,
  Eye,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react";

interface CalculationHistoryTableProps {
  records: CalculationHistoryRecord[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function CalculationHistoryTable({
  records,
  isLoading,
  onRefresh,
}: CalculationHistoryTableProps) {
  const [filterType, setFilterType] = useState<"ALL" | "DUTY" | "LANDED_COST">("ALL");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CalculationHistoryRecord | null>(null);

  const filteredRecords = records.filter((r) => {
    if (filterType !== "ALL" && r.type !== filterType) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.hs_code.toLowerCase().includes(q) ||
      r.commodity_name.toLowerCase().includes(q) ||
      r.country_of_origin.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const dutyCount = records.filter((r) => r.type === "DUTY").length;
  const lcCount = records.filter((r) => r.type === "LANDED_COST").length;

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredRecords, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `eximintegra_calculation_history_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Type Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-bg border border-line rounded-xl">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === "ALL"
                ? "bg-panel text-ink shadow-xs border border-line"
                : "text-muted hover:text-ink"
            }`}
          >
            All Calculations ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("DUTY")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === "DUTY"
                ? "bg-blue text-white shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Duty Tariffs ({dutyCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType("LANDED_COST")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === "LANDED_COST"
                ? "bg-green text-white shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Landed Cost ({lcCount})</span>
          </button>
        </div>

        {/* Search Bar & Export Button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search HS, commodity, ID, or corridor..."
              className="pl-8.5 pr-3 py-1.5 rounded-xl border border-line bg-panel text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-hidden w-64 md:w-72 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-panel hover:bg-bg text-xs font-semibold text-ink transition-colors cursor-pointer shadow-2xs"
            title="Export filtered records as JSON audit log"
          >
            <Download className="w-3.5 h-3.5 text-blue" />
            <span className="hidden sm:inline">Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-line rounded-2xl bg-panel overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg/80 border-b border-line text-[11px] font-mono font-bold text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Calculation ID & Date</th>
                <th className="py-3 px-4">Commodity / HS Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Corridor</th>
                <th className="py-3 px-4 text-right">Financial Outlay</th>
                <th className="py-3 px-4">Key Metric</th>
                <th className="py-3 px-4">Provenance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading verified calculation history...</span>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    <Clock className="w-8 h-8 text-line mx-auto mb-2" />
                    <p className="font-semibold text-ink">No calculations match your filter</p>
                    <p className="text-[11px] mt-1">
                      Perform a duty or landed cost calculation to add records to your persistent audit log.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isDuty = r.type === "DUTY";
                  const dateStr = new Date(r.timestamp).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const timeStr = new Date(r.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-bg/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRecord(r)}
                    >
                      {/* ID & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-bold text-ink flex items-center gap-1.5">
                          <span>{r.id}</span>
                        </div>
                        <div className="text-[10px] font-mono text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>
                            {dateStr} &bull; {timeStr}
                          </span>
                        </div>
                      </td>

                      {/* Commodity / HS */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-semibold text-ink truncate">
                          {r.commodity_name}
                        </div>
                        <div className="font-mono text-[11px] text-blue font-bold">
                          HS {r.hs_code}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            isDuty
                              ? "bg-blue-dim text-blue border border-blue/20"
                              : "bg-green-dim text-green border border-green/20"
                          }`}
                        >
                          {isDuty ? (
                            <Calculator className="w-3 h-3" />
                          ) : (
                            <Ship className="w-3 h-3" />
                          )}
                          <span>{isDuty ? "Duty" : "Landed Cost"}</span>
                        </span>
                      </td>

                      {/* Corridor */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="font-bold text-ink">
                          {r.country_of_origin}
                        </span>{" "}
                        &rarr; <span className="text-muted">IN</span>
                        <div className="text-[10px] text-muted truncate max-w-[120px]">
                          {r.destination.split(",")[0]}
                        </div>
                      </td>

                      {/* Financial Outlay */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono text-xs font-bold text-ink">
                          ₹{r.total_outlay_inr.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div className="text-[10px] font-mono text-muted">
                          ${r.total_outlay_usd.toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </td>

                      {/* Key Metric */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-bold text-ink">
                          {r.key_metric_value}
                        </div>
                        <div className="text-[10px] text-muted">
                          {r.key_metric_label}
                        </div>
                      </td>

                      {/* Provenance */}
                      <td className="py-3 px-4">
                        <ProvenanceBadge type={r.provenance_type} compact />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(r)}
                            className="p-1.5 rounded-lg border border-line bg-panel hover:bg-bg text-muted hover:text-ink transition-colors cursor-pointer"
                            title="Inspect Audit Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue" />
                          </button>

                          <Link
                            href={
                              isDuty
                                ? `/duty?calculation_id=${r.id}`
                                : `/landed-cost?calculation_id=${r.id}`
                            }
                            className="p-1.5 rounded-lg border border-line bg-panel hover:bg-bg text-muted hover:text-ink transition-colors cursor-pointer"
                            title={`Re-open in ${isDuty ? "Duty" : "Landed Cost"} Engine`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics */}
        <div className="px-4 py-3 bg-bg/50 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs text-muted font-mono">
          <div className="flex items-center gap-2">
            <span>Showing {filteredRecords.length} of {records.length} audit records</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green" /> 100% Deterministic Reproducibility
            </span>
          </div>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      <CalculationDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}

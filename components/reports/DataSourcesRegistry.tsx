"use client";

import React, { useState } from "react";
import { DatasetVersion } from "@/lib/types";
import { ProvenanceBadge } from "@/components/ui/ProvenanceBadge";
import {
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Filter,
  Search,
  RefreshCw,
  Info,
  Clock,
} from "lucide-react";

interface DataSourcesRegistryProps {
  datasets: DatasetVersion[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function DataSourcesRegistry({
  datasets,
  isLoading,
  onRefresh,
}: DataSourcesRegistryProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = datasets.filter((ds) => {
    if (filterType !== "ALL" && ds.provenance.type !== filterType) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      ds.name.toLowerCase().includes(q) ||
      ds.authority.toLowerCase().includes(q) ||
      ds.reference_code.toLowerCase().includes(q) ||
      ds.version.toLowerCase().includes(q) ||
      ds.coverage_summary.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Statutory Reproducibility Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-navy text-white border border-line shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-blue flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#93C5FD]">
                Deterministic Statutory Reproducibility Standard
              </span>
              <span className="text-[10px] font-mono bg-green-dim text-green px-2 py-0.5 rounded font-bold border border-green/30">
                ACTIVE REGISTRY v2026.03
              </span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed max-w-4xl">
              Every tariff calculation, landed cost estimate, and CEPA origin comparison in EximIntegra permanently stamps the exact dataset versions active at calculation time. Even if customs tariffs change in future Union Budgets, historical calculations can be reproduced with zero drift.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Provenance Filter Pills */}
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
            All Sources ({datasets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("LIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === "LIVE"
                ? "bg-green-dim text-green border border-green/30 font-bold shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            LIVE Statutory ({datasets.filter((d) => d.provenance.type === "LIVE").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("ILLUSTRATIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === "ILLUSTRATIVE"
                ? "bg-amber-dim text-amber-dark border border-amber/30 font-bold shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            ILLUSTRATIVE Benchmarks ({datasets.filter((d) => d.provenance.type === "ILLUSTRATIVE").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("BYOK")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === "BYOK"
                ? "bg-blue-dim text-blue border border-blue/30 font-bold shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            BYOK / Contract ({datasets.filter((d) => d.provenance.type === "BYOK").length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dataset, authority, or gazette ref..."
            className="pl-8.5 pr-3 py-1.5 rounded-xl border border-line bg-panel text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-hidden w-64 md:w-80 shadow-2xs"
          />
        </div>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 py-12 text-center text-muted">
            <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading statutory dataset registry...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-muted">
            <Database className="w-8 h-8 text-line mx-auto mb-2" />
            <p className="font-semibold text-ink">No datasets match your filter</p>
          </div>
        ) : (
          filtered.map((ds) => (
            <div
              key={ds.id}
              className="p-5 rounded-2xl bg-panel border border-line hover:border-blue/30 transition-all shadow-xs space-y-3.5 flex flex-col justify-between"
            >
              {/* Top Header */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue bg-blue-dim px-2 py-0.5 rounded">
                      {ds.version}
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-green-dim text-green px-1.5 py-0.5 rounded font-bold">
                      {ds.status}
                    </span>
                  </div>
                  <ProvenanceBadge type={ds.provenance.type} compact />
                </div>

                <h3 className="text-sm font-bold text-ink leading-snug">
                  {ds.name}
                </h3>

                <p className="text-[11px] font-mono text-muted">
                  {ds.authority}
                </p>
              </div>

              {/* Reference & Coverage */}
              <div className="p-3 rounded-xl bg-bg border border-line space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted text-[11px]">Gazette Ref:</span>
                  <span className="font-mono text-[11px] font-semibold text-ink text-right truncate max-w-[240px]">
                    {ds.reference_code}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted text-[11px]">Effective Date:</span>
                  <span className="font-mono text-[11px] font-bold text-ink">
                    {ds.effective_date}
                  </span>
                </div>
                {ds.record_count && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted text-[11px]">Record Volume:</span>
                    <span className="font-mono text-[11px] text-muted">
                      {ds.record_count.toLocaleString("en-IN")} indexed records
                    </span>
                  </div>
                )}
                <div className="pt-1 border-t border-line text-[11px] text-muted leading-relaxed">
                  {ds.coverage_summary}
                </div>
              </div>

              {/* Bottom Sync & Portal Link */}
              <div className="flex items-center justify-between pt-1 border-t border-line/60 text-[10px] font-mono text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-blue" />
                  Synced {new Date(ds.last_sync).toLocaleDateString()}
                </span>

                {ds.official_portal_url ? (
                  <a
                    href={ds.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue hover:underline font-semibold"
                  >
                    <span>Statutory Gazette</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span className="text-muted italic">Internal Engine Matrix</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

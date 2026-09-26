"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppSelector } from "@/store";
import { useGetEligibilityQuery } from "@/store/eligibilityApi";
import { SchemeEligibilityView } from "@/components/eligibility/SchemeEligibilityView";
import { Card, ProvenanceBadge, StatusPill, DegradedStateAlert } from "@/components/ui";
import { formatHsCode } from "@/lib/formatters";
import { FileCheck, Search, Scale, Sparkles, AlertCircle } from "lucide-react";

export default function EligibilityPage() {
  const currentContext = useAppSelector((state) => state.context.current);
  const [searchHs, setSearchHs] = useState(
    currentContext.hsCode || "7204.49.00"
  );
  const [activeHs, setActiveHs] = useState(
    currentContext.hsCode || "7204.49.00"
  );

  const { data, isLoading, error } = useGetEligibilityQuery(activeHs);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchHs.trim()) {
      setActiveHs(searchHs.trim());
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-6 pb-16">
          {/* Tariff Item Lookup & Filter Bar */}
          <div className="p-4 bg-panel border border-line rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-dim text-blue flex items-center justify-center shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-muted uppercase text-[10px]">Tariff Item:</span>
                  <strong className="text-ink font-bold">{formatHsCode(activeHs)}</strong>
                  <StatusPill label="LIVE" variant="success" size="xs" />
                </div>
                <span className="text-muted text-[11px] truncate block max-w-sm">
                  {currentContext.materialName || "Ferrous Waste & Scrap"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  value={searchHs}
                  onChange={(e) => setSearchHs(e.target.value)}
                  placeholder="Enter HS Code (e.g. 7204.49.00)"
                  className="w-full py-2 pl-3 pr-8 text-xs bg-bg border border-line rounded-lg text-ink font-mono font-bold focus:outline-none focus:border-blue"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue hover:bg-blue-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Lookup
              </button>
            </form>
          </div>

          {/* Loading / Error / Data States */}
          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono text-muted bg-panel border border-line rounded-xl">
              Evaluating Rules of Origin & Gazette Notifications for HS {activeHs}...
            </div>
          ) : error ? (
            <DegradedStateAlert
              title="Trade Scheme & Rules of Origin Unreachable"
              endpoint={`GET /api/v1/eligibility/${activeHs}`}
              reason={`Statutory eligibility lookup failed for HS ${activeHs}. DGFT Foreign Trade Policy repository or CEPA concession gazette feed unreachable.`}
            />
          ) : data ? (
            <SchemeEligibilityView data={data} />
          ) : null}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppSelector } from "@/store";
import { useGetEligibilityQuery } from "@/store/eligibilityApi";
import { SchemeEligibilityView } from "@/components/eligibility/SchemeEligibilityView";
import { Card, ProvenanceBadge, StatusPill } from "@/components/ui";
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
          {/* Header & HS Code Search Bar */}
          <div className="p-5 bg-panel border border-line rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue" />
                <h2 className="text-base font-bold text-ink">
                  Statutory Scheme & FTA Eligibility Engine
                </h2>
                <StatusPill label="PHASE 5" variant="primary" size="xs" />
              </div>
              <p className="text-xs text-muted">
                Assess preferential tariff rates under India&apos;s active trade agreements and export benefit schemes.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
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
                className="px-3.5 py-2 bg-blue hover:bg-blue-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Lookup
              </button>
            </form>
          </div>

          {/* Active Context Banner */}
          <div className="p-3 bg-bg border border-line rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-muted">Target Tariff Item:</span>
              <strong className="text-ink font-bold">{formatHsCode(activeHs)}</strong>
              <span className="text-muted font-sans hidden sm:inline">
                &bull; {currentContext.materialName || "Ferrous Waste & Scrap"}
              </span>
            </div>
            <ProvenanceBadge type="LIVE" source="DGFT / CBIC Gazette" compact />
          </div>

          {/* Loading / Error / Data States */}
          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono text-muted bg-panel border border-line rounded-xl">
              Evaluating Rules of Origin & Gazette Notifications for HS {activeHs}...
            </div>
          ) : error ? (
            <div className="p-6 bg-red-dim border border-red/30 rounded-xl text-xs text-red flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Failed to fetch scheme eligibility details. Please retry.</span>
            </div>
          ) : data ? (
            <SchemeEligibilityView data={data} />
          ) : null}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

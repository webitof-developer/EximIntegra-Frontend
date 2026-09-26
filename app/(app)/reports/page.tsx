"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  useGetCalculationHistoryQuery,
  useGetDatasetVersionsQuery,
} from "@/store/reportsApi";
import { CalculationHistoryTable } from "@/components/reports/CalculationHistoryTable";
import { DataSourcesRegistry } from "@/components/reports/DataSourcesRegistry";
import {
  Clock,
  Database,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Calculator,
  Ship,
} from "lucide-react";

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "sources" ? "sources" : "history";
  const [activeTab, setActiveTab] = useState<"history" | "sources">(initialTab);

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useGetCalculationHistoryQuery();

  const {
    data: datasetVersions,
    isLoading: datasetsLoading,
    refetch: refetchDatasets,
  } = useGetDatasetVersionsQuery();

  const records = historyData?.records || [];
  const datasets = datasetVersions || [];

  const totalCalculations = records.length;
  const totalOutlayInr = records.reduce((sum, r) => sum + r.total_outlay_inr, 0);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16">
      {/* Top Controls & Global Summary Tiles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-3">
        {/* Main Tab Navigation */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 py-2 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "border-blue text-blue"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Calculation History ({records.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sources")}
            className={`flex items-center gap-2 py-2 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "sources"
                ? "border-blue text-blue"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Data Sources ({datasets.length})</span>
          </button>
        </div>

        {/* Compact Statistics Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-panel border border-line shadow-2xs text-right">
            <span className="text-[10px] font-mono text-muted uppercase block leading-none">
              Calculations
            </span>
            <span className="font-mono text-sm font-bold text-ink mt-0.5 block">
              {totalCalculations}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-panel border border-line shadow-2xs text-right">
            <span className="text-[10px] font-mono text-muted uppercase block leading-none">
              Outlay
            </span>
            <span className="font-mono text-sm font-bold text-blue mt-0.5 block">
              ₹{(totalOutlayInr / 100000).toFixed(1)}L
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-panel border border-line shadow-2xs text-right">
            <span className="text-[10px] font-mono text-muted uppercase block leading-none">
              Datasets
            </span>
            <span className="font-mono text-sm font-bold text-green mt-0.5 block">
              {datasets.length} Active
            </span>
          </div>
        </div>
      </div>


      {/* Tab Panels */}
      {activeTab === "history" ? (
        <CalculationHistoryTable
          records={records}
          isLoading={historyLoading}
          onRefresh={refetchHistory}
        />
      ) : (
        <DataSourcesRegistry
          datasets={datasets}
          isLoading={datasetsLoading}
          onRefresh={refetchDatasets}
        />
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <React.Suspense
          fallback={
            <div className="p-8 text-center text-muted font-mono text-xs">
              Loading audit reports...
            </div>
          }
        >
          <ReportsContent />
        </React.Suspense>
      </AppShell>
    </AuthGuard>
  );
}


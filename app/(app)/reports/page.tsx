"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue flex items-center justify-center text-white shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold font-mono text-ink tracking-tight">
              Audit History & Statutory Data Registry
            </h1>
            <span className="text-[10px] font-mono uppercase bg-green-dim text-green px-2 py-0.5 rounded font-bold border border-green/30">
              Deterministic Reproducibility
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Permanent audit trail of duty and landed cost determinations, paired with statutory gazette dataset versions.
          </p>
        </div>

        {/* Global Statistics Tiles */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-panel border border-line shadow-2xs text-right">
            <span className="text-[10px] font-mono text-muted uppercase block">
              Logged Calculations
            </span>
            <span className="font-mono text-base font-bold text-ink">
              {totalCalculations}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-panel border border-line shadow-2xs text-right">
            <span className="text-[10px] font-mono text-muted uppercase block">
              Cumulative Outlay
            </span>
            <span className="font-mono text-base font-bold text-blue">
              ₹{(totalOutlayInr / 100000).toFixed(1)}L
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-panel border border-line shadow-2xs text-right">
            <span className="text-[10px] font-mono text-muted uppercase block">
              Statutory Datasets
            </span>
            <span className="font-mono text-base font-bold text-green">
              {datasets.length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-line">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "border-blue text-blue"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Calculation Audit History ({records.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sources")}
            className={`flex items-center gap-2 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "sources"
                ? "border-blue text-blue"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Statutory Data Sources & Versions ({datasets.length})</span>
          </button>
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
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-muted font-mono text-xs">
          Loading audit reports...
        </div>
      }
    >
      <ReportsContent />
    </React.Suspense>
  );
}

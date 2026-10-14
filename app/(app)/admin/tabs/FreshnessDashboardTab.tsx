"use client";

import React, { useState } from "react";
import {
  IngestionSourceStatus,
  IngestionRunItem,
} from "@/lib/types";
import {
  useGetIngestionStatusQuery,
  useGetIngestionRunsQuery,
  useTriggerIngestionMutation,
  useApproveIngestionRunMutation,
  useRejectIngestionRunMutation,
  useRollbackSourceMutation,
  useCheckStalenessMutation,
} from "@/store/adminApi";
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  GitCommit,
  Check,
  X,
  History,
  FileCheck2,
} from "lucide-react";

interface FreshnessDashboardTabProps {
  showToast: (msg: string) => void;
}

export function FreshnessDashboardTab({ showToast }: FreshnessDashboardTabProps) {
  const {
    data: statusData,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useGetIngestionStatusQuery();

  const {
    data: runsData,
    isLoading: runsLoading,
    refetch: refetchRuns,
  } = useGetIngestionRunsQuery({ limit: 15 });

  const [triggerIngestion, { isLoading: isTriggering }] = useTriggerIngestionMutation();
  const [approveRun, { isLoading: isApproving }] = useApproveIngestionRunMutation();
  const [rejectRun, { isLoading: isRejecting }] = useRejectIngestionRunMutation();
  const [rollbackSource, { isLoading: isRollingBack }] = useRollbackSourceMutation();
  const [checkStaleness, { isLoading: isCheckingStaleness }] = useCheckStalenessMutation();

  const [activeTriggerSource, setActiveTriggerSource] = useState<string | null>(null);

  const sources = statusData?.sources || [];
  const runs = runsData?.runs || [];

  const freshCount = sources.filter((s) => !s.is_stale && s.active_version).length;
  const staleCount = sources.filter((s) => s.is_stale).length;
  const pendingStaged = sources.filter((s) => s.pending_staged_run != null);

  const handleTrigger = async (sourceName: string) => {
    setActiveTriggerSource(sourceName);
    try {
      const res = await triggerIngestion({ source: sourceName, force: true }).unwrap();
      showToast(res.message || `Ingestion triggered for ${sourceName}. Version staged.`);
      refetchStatus();
      refetchRuns();
    } catch (err: any) {
      showToast(err?.data?.message || `Failed to trigger ingestion for ${sourceName}.`);
    } finally {
      setActiveTriggerSource(null);
    }
  };

  const handleApprove = async (runId: string) => {
    try {
      const res = await approveRun(runId).unwrap();
      showToast(res.message || "Staged dataset version approved and activated LIVE.");
      refetchStatus();
      refetchRuns();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to approve staged run.");
    }
  };

  const handleReject = async (runId: string) => {
    try {
      const res = await rejectRun({ runId, reason: "Rejected by Super Admin" }).unwrap();
      showToast(res.message || "Staged run rejected.");
      refetchStatus();
      refetchRuns();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to reject run.");
    }
  };

  const handleRollback = async (sourceName: string) => {
    if (!confirm(`Are you sure you want to rollback active version for '${sourceName}' to previous version?`)) {
      return;
    }
    try {
      const res = await rollbackSource(sourceName).unwrap();
      showToast(res.message || `Source ${sourceName} successfully rolled back.`);
      refetchStatus();
      refetchRuns();
    } catch (err: any) {
      showToast(err?.data?.message || `Failed to rollback ${sourceName}.`);
    }
  };

  const handleCheckStaleness = async () => {
    try {
      const res = await checkStaleness().unwrap();
      if (res.stale_count > 0) {
        showToast(`Staleness check complete: ${res.stale_count} stale sources detected. Notifications posted.`);
      } else {
        showToast("All statutory data sources are strictly FRESH within thresholds.");
      }
      refetchStatus();
    } catch (err: any) {
      showToast(err?.data?.message || "Staleness check failed.");
    }
  };

  if (statusLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted bg-panel border border-line rounded-xl">
        Loading Statutory Dataset Freshness Matrix...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Statutory Sources</span>
            <Database className="w-4 h-4 text-blue" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">{sources.length}</div>
          <div className="text-[11px] text-muted">Authoritative Gazette Pipelines</div>
        </div>

        <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Fresh & Active</span>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <div className="text-2xl font-bold font-mono text-green">{freshCount}</div>
          <div className="text-[11px] text-muted">Within SLA staleness tolerance</div>
        </div>

        <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Stale Datasets</span>
            <AlertTriangle className={`w-4 h-4 ${staleCount > 0 ? "text-amber-500" : "text-muted"}`} />
          </div>
          <div className={`text-2xl font-bold font-mono ${staleCount > 0 ? "text-amber-500" : "text-ink"}`}>
            {staleCount}
          </div>
          <div className="text-[11px] text-muted">Exceeds configured freshness threshold</div>
        </div>

        <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600">{pendingStaged.length}</div>
          <div className="text-[11px] text-muted">Awaiting human sign-off</div>
        </div>
      </div>

      {/* Freshness Action Strip */}
      <div className="p-4 bg-panel border border-line rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-xs">
          <div className="font-bold text-ink">Authoritative Dataset Ingestion & Staleness Controller</div>
          <div className="text-muted">
            Automated monitoring across CBIC Tariff, DGFT ITC(HS), DGTR ADD, FTA Concessions, and FOREX schedules.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCheckStaleness}
            disabled={isCheckingStaleness}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg hover:bg-line text-ink border border-line text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Clock className="w-3.5 h-3.5 text-muted" />
            <span>{isCheckingStaleness ? "Checking..." : "Run Staleness Check & Alerts"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              refetchStatus();
              refetchRuns();
              showToast("Dataset freshness statuses synchronized.");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Staged Runs Awaiting Human-in-the-Loop Approval */}
      {pendingStaged.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Staged Versions Awaiting Administrator Approval (Human-in-the-Loop)</span>
          </div>

          <div className="space-y-3">
            {pendingStaged.map((s) => {
              const run = s.pending_staged_run!;
              const diff = run.diff_summary;
              return (
                <div
                  key={s.source}
                  className="p-5 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-ink">{s.display_name}</strong>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300/50">
                          STAGED VERSION
                        </span>
                      </div>
                      <div className="text-xs text-muted font-mono">
                        Run ID: {run.id} | Staged Version: {run.dataset_version_id} | Rows: {run.rows_written}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(run.id)}
                        disabled={isApproving}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-green hover:bg-green-600 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Activate LIVE</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(run.id)}
                        disabled={isRejecting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red/10 hover:bg-red/20 text-red border border-red/20 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {diff && (
                    <div className="p-3 bg-white/80 border border-amber-200/50 rounded-lg text-xs space-y-1 font-mono text-muted">
                      <div className="font-semibold text-ink">Diff Report vs Currently Active:</div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>Active Rows: <strong className="text-ink">{diff.active_count ?? 0}</strong></div>
                        <div>Staged Rows: <strong className="text-ink">{diff.staged_count ?? 0}</strong></div>
                        <div>Delta: <strong className="text-blue">{diff.count_delta ?? 0}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statutory Source Freshness Matrix */}
      <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-ink">Statutory Ingestion Pipelines & Freshness SLA</h3>
            <p className="text-xs text-muted">
              Real-time monitoring of government gazette datasets, effective dates, and rollback points.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-muted uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Statutory Source</th>
                <th className="py-2.5 px-3">Gazette Authority</th>
                <th className="py-2.5 px-3">Active Version</th>
                <th className="py-2.5 px-3">Age / Threshold</th>
                <th className="py-2.5 px-3">Freshness SLA</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sources.map((s) => {
                const isStale = s.is_stale;
                const isSyncing = activeTriggerSource === s.source;

                return (
                  <tr key={s.source} className="hover:bg-bg/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-ink">{s.display_name}</div>
                      <div className="text-[11px] text-muted font-mono">{s.target_table}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink">
                        {s.authority}
                        {s.official_portal_url && (
                          <a
                            href={s.official_portal_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      {s.active_version ? (
                        <div>
                          <span className="font-bold text-ink">{s.active_version.version}</span>
                          <div className="text-[10px] text-muted">
                            {s.active_version.record_count} items ({s.active_version.provenance_type})
                          </div>
                        </div>
                      ) : (
                        <span className="text-red font-semibold">NO ACTIVE VERSION</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div className={isStale ? "text-amber-500 font-bold" : "text-ink"}>
                        {s.age_days != null ? `${s.age_days} days` : "Unknown"}
                      </div>
                      <div className="text-[10px] text-muted">Limit: {s.staleness_threshold_days} days</div>
                    </td>

                    <td className="py-3 px-3">
                      {isStale ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          STALE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-green-dim text-green border border-green/20">
                          <CheckCircle2 className="w-3 h-3" />
                          FRESH
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleTrigger(s.source)}
                          disabled={isSyncing}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue hover:bg-blue-dark text-white text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                          <span>{isSyncing ? "Staging..." : "Sync"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRollback(s.source)}
                          disabled={isRollingBack}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg hover:bg-line text-muted hover:text-ink border border-line text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                          title="Rollback to previous superseded version"
                        >
                          <History className="w-3 h-3" />
                          <span>Rollback</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Ingestion Runs */}
      <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-ink">Recent Ingestion Executions & Audit Log</h3>
            <p className="text-xs text-muted">Immutable cryptographic record of all data ingestion events.</p>
          </div>
          <button
            type="button"
            onClick={() => refetchRuns()}
            className="flex items-center gap-1 text-xs text-blue hover:underline font-mono"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Runs</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-muted uppercase font-mono text-[10px]">
                <th className="py-2 px-3">Run ID</th>
                <th className="py-2 px-3">Source</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Written / Read</th>
                <th className="py-2 px-3">Target Version</th>
                <th className="py-2 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono text-[11px]">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-bg/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-ink">{r.id.substring(0, 16)}...</td>
                  <td className="py-2.5 px-3 text-muted">{r.source}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        r.status === "ACTIVATED"
                          ? "bg-green-dim text-green border border-green/20"
                          : r.status === "STAGED"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-red/10 text-red border border-red/20"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-ink">
                    {r.rows_written ?? 0} / {r.rows_read ?? 0}
                  </td>
                  <td className="py-2.5 px-3 text-muted">{r.dataset_version_id || "N/A"}</td>
                  <td className="py-2.5 px-3 text-right text-muted">
                    {r.started_at ? new Date(r.started_at).toLocaleString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

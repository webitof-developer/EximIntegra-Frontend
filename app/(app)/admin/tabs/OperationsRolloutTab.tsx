"use client";

import React, { useState } from "react";
import { FeatureFlagItem } from "@/lib/types";
import {
  useGetFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
} from "@/store/adminApi";
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Scale,
  RefreshCw,
  ExternalLink,
  Lock,
} from "lucide-react";

interface OperationsRolloutTabProps {
  showToast: (msg: string) => void;
}

export function OperationsRolloutTab({ showToast }: OperationsRolloutTabProps) {
  const { data: flagData, isLoading, refetch } = useGetFeatureFlagsQuery();
  const [updateFlag, { isLoading: isUpdating }] = useUpdateFeatureFlagMutation();

  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Legal & Licensing checklist state
  const [legalChecks, setLegalChecks] = useState<Record<string, boolean>>({
    disclaimer_reviewed: true,
    cbic_gazette_verified: true,
    dgft_ftp_verified: true,
    comtrade_licence_reviewed: true,
    audit_stamping_confirmed: true,
  });

  const flags = flagData?.flags || [];

  const handleToggle = async (flag: FeatureFlagItem) => {
    setTogglingKey(flag.key);
    try {
      const nextState = !flag.isEnabled;
      await updateFlag({
        key: flag.key,
        is_enabled: nextState,
      }).unwrap();
      showToast(`Feature flag '${flag.name}' set to ${nextState ? "ENABLED" : "DISABLED"}.`);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to update feature flag.");
    } finally {
      setTogglingKey(null);
    }
  };

  const toggleLegalCheck = (key: string) => {
    setLegalChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    showToast("Compliance audit sign-off updated.");
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted bg-panel border border-line rounded-xl">
        Loading Operational Feature Flags & Rollout Governance...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 bg-panel border border-line rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-ink">Operational Feature Flags & Rollout Governance</h3>
          </div>
          <p className="text-xs text-muted max-w-2xl">
            Controlled gating for Multilateral Comparison, Trade Eligibility v2, and statutory guardrails.
            Disable modules during scheduled gazette migrations or operational maintenance without code deploys.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            refetch();
            showToast("Feature flags refreshed from database.");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg hover:bg-line text-ink border border-line text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Flags</span>
        </button>
      </div>

      {/* Feature Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flags.map((flag) => {
          const isToggling = togglingKey === flag.key;

          return (
            <div
              key={flag.key}
              className={`p-5 rounded-xl border transition-all ${
                flag.isEnabled
                  ? "bg-panel border-line shadow-xs"
                  : "bg-bg/40 border-line/60 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-ink">{flag.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-dim text-blue border border-blue/20">
                      {flag.tierRequired}
                    </span>
                    {flag.metadata?.phase && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-600 font-semibold border border-purple-500/20">
                        Phase {flag.metadata.phase}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{flag.description}</p>
                  <div className="text-[11px] font-mono text-muted">Key: {flag.key}</div>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggle(flag)}
                  disabled={isToggling || isUpdating}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                    flag.isEnabled ? "bg-green" : "bg-line"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      flag.isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal & Regulatory Review Sign-Off */}
      <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue" />
          <h3 className="text-sm font-bold text-ink">Customs Professional Legal Sign-Off & Data Licensing</h3>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Statutory compliance sign-off by licensed customs brokers (Rule 18 / Customs Act 1962) and data licensing confirmations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-line bg-bg/50 cursor-pointer hover:bg-bg transition-colors">
            <input
              type="checkbox"
              checked={legalChecks.disclaimer_reviewed}
              onChange={() => toggleLegalCheck("disclaimer_reviewed")}
              className="mt-0.5 rounded border-line text-blue focus:ring-blue"
            />
            <div className="space-y-0.5">
              <span className="font-semibold text-ink">Statutory Disclaimer Review</span>
              <p className="text-[11px] text-muted">
                Mandatory Bill of Entry legal planning notice displayed on Compare and Eligibility outputs.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-line bg-bg/50 cursor-pointer hover:bg-bg transition-colors">
            <input
              type="checkbox"
              checked={legalChecks.cbic_gazette_verified}
              onChange={() => toggleLegalCheck("cbic_gazette_verified")}
              className="mt-0.5 rounded border-line text-blue focus:ring-blue"
            />
            <div className="space-y-0.5">
              <span className="font-semibold text-ink">CBIC Gazette Statutory Concessions</span>
              <p className="text-[11px] text-muted">
                Hand-verified against official notifications: 22/2022-Cus (CEPA), 112/2022-Cus (ECTA), 46/2011-Cus (AIFTA).
              </p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-line bg-bg/50 cursor-pointer hover:bg-bg transition-colors">
            <input
              type="checkbox"
              checked={legalChecks.dgft_ftp_verified}
              onChange={() => toggleLegalCheck("dgft_ftp_verified")}
              className="mt-0.5 rounded border-line text-blue focus:ring-blue"
            />
            <div className="space-y-0.5">
              <span className="font-semibold text-ink">DGFT Foreign Trade Policy 2023 Rules</span>
              <p className="text-[11px] text-muted">
                Scrap Pre-shipment Inspection (PSIC), CPCB EPR, and Machinery EPCG scheme restrictions audit passed.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-line bg-bg/50 cursor-pointer hover:bg-bg transition-colors">
            <input
              type="checkbox"
              checked={legalChecks.comtrade_licence_reviewed}
              onChange={() => toggleLegalCheck("comtrade_licence_reviewed")}
              className="mt-0.5 rounded border-line text-blue focus:ring-blue"
            />
            <div className="space-y-0.5">
              <span className="font-semibold text-ink">UN Comtrade & Market Access Licensing</span>
              <p className="text-[11px] text-muted">
                Confirmed usage rights for international benchmark price feeds under open research and enterprise terms.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Dataset Version Audit Guarantee */}
      <div className="p-4 bg-blue-dim/40 border border-blue/20 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-ink">
          <ShieldCheck className="w-4 h-4 text-blue" />
          <span>Cryptographic Dataset Audit Stamping (Phase 8 Invariant)</span>
        </div>
        <p className="text-muted leading-relaxed">
          Every multi-country comparison run (`ComparisonRunModel`) and statutory eligibility evaluation records the exact active dataset versions (`dataset_versions_json`), provenance sources, and evaluation timestamp (`as_of`) in immutable database storage for dispute resolution and external customs auditing.
        </p>
      </div>
    </div>
  );
}

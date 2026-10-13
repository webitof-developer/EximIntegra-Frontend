"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMaterialContext } from "@/store/contextSlice";
import { useCompareCountriesMutation } from "@/store/eligibilityApi";
import { CountryComparisonMatrix } from "@/components/compare/CountryComparisonMatrix";
import { Card, ProvenanceBadge, StatusPill, DegradedStateAlert } from "@/components/ui";
import { formatHsCode } from "@/lib/formatters";
import {
  CountryComparisonResponse,
  CountryComparisonItem,
} from "@/lib/types";
import { FeatureGate } from "@/components/saas/FeatureGate";
import { getApiErrorMessage } from "@/lib/utils";
import { Scale, RefreshCw, Globe, Check } from "lucide-react";

function CompareContent() {
  const searchParams = useSearchParams();
  const queryHs = searchParams.get("hs_code");

  const dispatch = useAppDispatch();
  const currentContext = useAppSelector((state) => state.context.current);

  const [activeHs, setActiveHs] = useState(queryHs || currentContext.hsCode || "7204.49.00");
  const [searchHsInput, setSearchHsInput] = useState(activeHs);

  const assessableVal = currentContext.assessableValue || 42000;
  const quantity = currentContext.quantity || 100;
  const unit = currentContext.unit || "MT";

  const [selectedCountries, setSelectedCountries] = useState<string[]>([
    "US",
    "AE",
    "AU",
    "VN",
  ]);

  const [baselineOrigin, setBaselineOrigin] = useState<string>("US");
  const [showCostInputs, setShowCostInputs] = useState<boolean>(false);

  // Per-origin FOB & Freight inputs (Contract v2)
  const [originCosts, setOriginCosts] = useState<Record<string, { fob_value: number; freight: number; insurance: number }>>({
    US: { fob_value: 43000, freight: 5200, insurance: 120 },
    AE: { fob_value: 42000, freight: 3500, insurance: 120 },
    AU: { fob_value: 42500, freight: 4500, insurance: 120 },
    VN: { fob_value: 41000, freight: 4100, insurance: 120 },
    CN: { fob_value: 41500, freight: 3800, insurance: 120 },
  });

  const [compareCountries, { isLoading }] = useCompareCountriesMutation();
  const [comparisonResult, setComparisonResult] =
    useState<CountryComparisonResponse | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const availableOptions = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "VN", name: "Vietnam", flag: "🇻🇳" },
    { code: "CN", name: "China", flag: "🇨🇳" },
  ];

  const handleRunComparison = async (
    hsToCompare = activeHs,
    countriesToCompare = selectedCountries,
    baselineToCompare = baselineOrigin
  ) => {
    try {
      setErrorState(null);
      setValidationMessage(null);

      // Construct Contract v2 origins array
      const originsPayload = countriesToCompare.map((c) => {
        const item = originCosts[c] || { fob_value: assessableVal, freight: 3500, insurance: 120 };
        return {
          country_code: c,
          fob_value: item.fob_value,
          freight: item.freight,
          insurance: item.insurance,
        };
      });

      const res = await compareCountries({
        hs_code: hsToCompare,
        currency: currentContext.currency || "USD",
        quantity,
        unit,
        baseline_origin: baselineToCompare,
        origins: originsPayload,
        // Legacy fallback fields for backward compatibility
        assessable_value: assessableVal,
        countries: countriesToCompare,
      }).unwrap();

      setComparisonResult(res);
    } catch (err: any) {
      setErrorState(
        getApiErrorMessage(
          err,
          "Failed to compute concurrent country origin comparison matrix. External tariff gateway unreachable."
        )
      );
    }
  };

  useEffect(() => {
    handleRunComparison(activeHs, selectedCountries, baselineOrigin);
  }, [activeHs, assessableVal, baselineOrigin]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchHsInput.trim()) {
      setActiveHs(searchHsInput.trim());
      handleRunComparison(searchHsInput.trim(), selectedCountries, baselineOrigin);
    }
  };

  const handleCostChange = (code: string, field: "fob_value" | "freight", value: number) => {
    setOriginCosts((prev) => ({
      ...prev,
      [code]: {
        ...(prev[code] || { fob_value: 42000, freight: 3500, insurance: 120 }),
        [field]: value,
      },
    }));
  };

  const toggleCountry = (code: string) => {
    setValidationMessage(null);
    let updated: string[];
    if (selectedCountries.includes(code)) {
      if (selectedCountries.length <= 2) {
        setValidationMessage("Please select at least 2 origins for side-by-side comparison.");
        return;
      }
      updated = selectedCountries.filter((c) => c !== code);
      if (baselineOrigin === code && updated.length > 0) {
        setBaselineOrigin(updated[0]);
      }
    } else {
      if (selectedCountries.length >= 5) {
        setValidationMessage("Maximum 5 origins can be compared simultaneously.");
        return;
      }
      updated = [...selectedCountries, code];
    }
    setSelectedCountries(updated);
    handleRunComparison(activeHs, updated, baselineOrigin);
  };

  const handleApplyCountry = (country: CountryComparisonItem) => {
    dispatch(
      setMaterialContext({
        countryOfOrigin: country.country_code,
      })
    );
    setActionFeedback(`Applied ${country.country_name} (${country.country_code}) as active origin in shared context.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* HS Lookup and Country Selection Toolbar */}
      <div className="p-4 bg-panel border border-line rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="text-xs">
              <span className="text-muted uppercase text-[10px] font-mono block">Tariff Code:</span>
              <input
                type="text"
                value={searchHsInput}
                onChange={(e) => setSearchHsInput(e.target.value)}
                placeholder="HS Code (e.g. 7204.49.00)"
                className="py-1 px-2 text-xs bg-bg border border-line rounded font-mono font-bold text-ink w-36 focus:outline-none focus:border-blue"
              />
            </div>
            <button
              type="submit"
              className="mt-3.5 px-2.5 py-1 bg-blue hover:bg-blue-dark text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Update
            </button>
          </form>

          <div className="mt-3">
            {comparisonResult?.coverage === "NOT_COVERED" ? (
              <StatusPill label="NOT COVERED" variant="neutral" size="xs" />
            ) : (
              <StatusPill
                label={comparisonResult?.comparisons?.[0]?.provenance?.type || "ILLUSTRATIVE"}
                variant={comparisonResult?.comparisons?.[0]?.provenance?.type === "LIVE" ? "success" : "warning"}
                size="xs"
                dot
              />
            )}
          </div>
        </div>

        {/* Multi-Country Toggle Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-muted uppercase">Baseline:</span>
            <select
              value={baselineOrigin}
              onChange={(e) => {
                setBaselineOrigin(e.target.value);
                handleRunComparison(activeHs, selectedCountries, e.target.value);
              }}
              className="py-1 px-2 text-xs bg-bg border border-line rounded font-mono font-semibold text-ink focus:outline-none focus:border-blue cursor-pointer"
            >
              {selectedCountries.map((c) => (
                <option key={c} value={c}>
                  {c} ({availableOptions.find((o) => o.code === c)?.name || c})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-muted uppercase">Origins:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {availableOptions.map((opt) => {
                const isSelected = selectedCountries.includes(opt.code);
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => toggleCountry(opt.code)}
                    title={opt.name}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-blue-dim text-blue border-blue/30 shadow-xs"
                        : "bg-bg text-muted border-line hover:text-ink hover:bg-line/40"
                    }`}
                  >
                    <span>{opt.flag}</span>
                    <span>{opt.code}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCostInputs(!showCostInputs)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
              showCostInputs
                ? "bg-ink text-white border-ink"
                : "bg-bg text-muted border-line hover:text-ink hover:bg-line/30"
            }`}
          >
            {showCostInputs ? "Hide Pricing & Freight" : "Adjust Pricing & Freight"}
          </button>
        </div>
      </div>

      {/* Per-Origin Pricing & Freight Customization Panel (Contract v2) */}
      {showCostInputs && (
        <div className="p-4 bg-panel border border-line rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                Per-Origin Commercial Valuation & Freight (Contract v2)
              </h4>
              <p className="text-[11px] text-muted">
                Declare specific FOB invoice valuations and forwarder ocean freight per corridor to compute realistic sourcing economics.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRunComparison(activeHs, selectedCountries, baselineOrigin)}
              className="px-3 py-1.5 bg-blue hover:bg-blue-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Recalculate Matrix
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {selectedCountries.map((code) => {
              const opt = availableOptions.find((o) => o.code === code);
              const cost = originCosts[code] || { fob_value: 42000, freight: 3500, insurance: 120 };
              return (
                <div key={code} className="p-3 bg-bg border border-line rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <span>{opt?.flag}</span>
                      <span>{code}</span>
                    </span>
                    {code === baselineOrigin && (
                      <span className="text-[10px] font-mono font-bold bg-blue-dim text-blue px-1.5 py-0.5 rounded">
                        BASELINE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-muted block">FOB Value (USD):</span>
                      <input
                        type="number"
                        value={cost.fob_value}
                        onChange={(e) => handleCostChange(code, "fob_value", parseFloat(e.target.value) || 0)}
                        className="w-full py-1 px-2 text-xs bg-panel border border-line rounded font-mono font-bold text-ink focus:outline-none focus:border-blue"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-muted block">Ocean Freight (USD):</span>
                      <input
                        type="number"
                        value={cost.freight}
                        onChange={(e) => handleCostChange(code, "freight", parseFloat(e.target.value) || 0)}
                        className="w-full py-1 px-2 text-xs bg-panel border border-line rounded font-mono font-bold text-ink focus:outline-none focus:border-blue"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Warnings Banner */}
      {comparisonResult?.warnings && comparisonResult.warnings.length > 0 && (
        <div className="p-3 bg-amber-dim/50 border border-amber/30 rounded-lg text-xs font-mono text-amber-dark flex items-center gap-2">
          <span className="font-bold">Valuation Note:</span>
          <span>{comparisonResult.warnings.join(", ")}</span>
        </div>
      )}

      {/* Validation Message */}
      {validationMessage && (
        <div className="p-3 bg-amber-dim border border-amber/30 rounded-lg text-xs font-medium text-amber-dark flex items-center justify-between">
          <span>{validationMessage}</span>
          <button
            onClick={() => setValidationMessage(null)}
            className="text-amber-dark font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Feedback */}
      {actionFeedback && (
        <div className="p-3 bg-green-dim border border-green/30 rounded-lg text-xs font-medium text-green flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-green font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error / Degraded State Alert (§3.5) */}
      {errorState && (
        <DegradedStateAlert
          reason={errorState}
          endpoint="POST /api/v1/compare"
          onRetry={() => handleRunComparison()}
        />
      )}

      {/* Comparison Matrix View */}
      {isLoading && !comparisonResult ? (
        <div className="p-12 text-center text-xs font-mono text-muted bg-panel border border-line rounded-xl">
          Computing multilateral tariffs and landed logistics across {selectedCountries.join(", ")}...
        </div>
      ) : comparisonResult ? (
        <CountryComparisonMatrix
          data={comparisonResult}
          onApplyCountry={handleApplyCountry}
          selectedOrigin={currentContext.countryOfOrigin || "AE"}
        />
      ) : null}
    </div>
  );
}

export default function ComparePage() {
  return (
    <AuthGuard>
      <AppShell>
        <FeatureGate
          requiredTier="PROFESSIONAL"
          featureName="Multilateral Origin Sourcing Arbitrage"
          description="Compare landed duty structures across multiple bilateral jurisdictions (USA MFN, UAE CEPA, Australia ECTA, ASEAN) in real-time."
        >
          <React.Suspense
            fallback={
              <div className="p-12 text-center text-xs font-mono text-muted">
                Loading Country Comparison Engine...
              </div>
            }
          >
            <CompareContent />
          </React.Suspense>
        </FeatureGate>
      </AppShell>
    </AuthGuard>
  );
}

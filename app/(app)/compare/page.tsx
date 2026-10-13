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
    countriesToCompare = selectedCountries
  ) => {
    try {
      setErrorState(null);
      setValidationMessage(null);
      const res = await compareCountries({
        hs_code: hsToCompare,
        assessable_value: assessableVal,
        currency: currentContext.currency || "USD",
        quantity,
        unit,
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
    handleRunComparison(activeHs, selectedCountries);
  }, [activeHs, assessableVal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchHsInput.trim()) {
      setActiveHs(searchHsInput.trim());
      handleRunComparison(searchHsInput.trim(), selectedCountries);
    }
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
    } else {
      if (selectedCountries.length >= 5) {
        setValidationMessage("Maximum 5 origins can be compared simultaneously.");
        return;
      }
      updated = [...selectedCountries, code];
    }
    setSelectedCountries(updated);
    handleRunComparison(activeHs, updated);
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-mono font-bold text-muted uppercase">Origins:</span>
          <div className="flex flex-wrap items-center gap-2">
            {availableOptions.map((opt) => {
              const isSelected = selectedCountries.includes(opt.code);
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => toggleCountry(opt.code)}
                  title={opt.name}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
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
      </div>

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

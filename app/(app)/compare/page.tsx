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
import { Scale, RefreshCw, Globe, Check } from "lucide-react";

function CompareContent() {
  const searchParams = useSearchParams();
  const queryHs = searchParams.get("hs_code");

  const dispatch = useAppDispatch();
  const currentContext = useAppSelector((state) => state.context.current);

  const hsCode = queryHs || currentContext.hsCode || "7204.49.00";
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

  const availableOptions = [
    { code: "US", name: "United States (MFN)", flag: "🇺🇸" },
    { code: "AE", name: "UAE (CEPA 0%)", flag: "🇦🇪" },
    { code: "AU", name: "Australia (ECTA 0%)", flag: "🇦🇺" },
    { code: "VN", name: "Vietnam (ASEAN 1%)", flag: "🇻🇳" },
    { code: "CN", name: "China (MFN)", flag: "🇨🇳" },
  ];

  const handleRunComparison = async (countriesToCompare = selectedCountries) => {
    try {
      setErrorState(null);
      const res = await compareCountries({
        hs_code: hsCode,
        assessable_value: assessableVal,
        currency: currentContext.currency || "USD",
        quantity,
        unit,
        countries: countriesToCompare,
      }).unwrap();

      setComparisonResult(res);
    } catch (err: any) {
      setErrorState(
        err?.data?.error ||
          "Failed to compute concurrent country origin comparison matrix. External tariff gateway unreachable."
      );
    }
  };

  useEffect(() => {
    handleRunComparison();
  }, [hsCode, assessableVal]);

  const toggleCountry = (code: string) => {
    let updated: string[];
    if (selectedCountries.includes(code)) {
      if (selectedCountries.length <= 2) {
        alert("Please select at least 2 countries for side-by-side comparison.");
        return;
      }
      updated = selectedCountries.filter((c) => c !== code);
    } else {
      if (selectedCountries.length >= 5) {
        alert("Maximum 5 countries can be compared simultaneously.");
        return;
      }
      updated = [...selectedCountries, code];
    }
    setSelectedCountries(updated);
    handleRunComparison(updated);
  };

  const handleApplyCountry = (country: CountryComparisonItem) => {
    dispatch(
      setMaterialContext({
        countryOfOrigin: country.country_code,
      })
    );
    alert(`Applied ${country.country_name} (${country.country_code}) as the active origin in shared context.`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Country Selection Toolbar */}
      <div className="p-4 bg-panel border border-line rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-muted uppercase">Select Origins to Compare:</span>
          <StatusPill label="LIVE" variant="success" size="xs" dot />
        </div>

        {/* Multi-Country Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {availableOptions.map((opt) => {
            const isSelected = selectedCountries.includes(opt.code);
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => toggleCountry(opt.code)}
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

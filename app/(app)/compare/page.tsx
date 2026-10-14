"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMaterialContext } from "@/store/contextSlice";
import {
  useCompareCountriesMutation,
  useGetCountriesQuery,
  useGetBenchmarkPriceQuery,
} from "@/store/eligibilityApi";
import { CountryComparisonMatrix } from "@/components/compare/CountryComparisonMatrix";
import { Card, ProvenanceBadge, StatusPill, DegradedStateAlert } from "@/components/ui";
import { formatHsCode } from "@/lib/formatters";
import {
  CountryComparisonResponse,
  CountryComparisonItem,
  CountryOption,
} from "@/lib/types";
import { FeatureGate } from "@/components/saas/FeatureGate";
import { getApiErrorMessage } from "@/lib/utils";
import {
  Scale,
  RefreshCw,
  Globe,
  Check,
  BellRing,
  Sparkles,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

const DEFAULT_COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
];

function OriginCostRow({
  code,
  country,
  cost,
  isBaseline,
  activeHs,
  quantity,
  unit,
  onChange,
}: {
  code: string;
  country?: CountryOption;
  cost: { fob_value: number; freight: number; insurance: number };
  isBaseline: boolean;
  activeHs: string;
  quantity: number;
  unit: string;
  onChange: (field: "fob_value" | "freight" | "insurance", value: number) => void;
}) {
  const { data: bench } = useGetBenchmarkPriceQuery(
    { hs_code: activeHs, origin: code },
    { skip: !activeHs }
  );

  const handleApplyBenchmark = () => {
    if (bench?.indicative_unit_value_usd) {
      const calculatedFob = Math.round(bench.indicative_unit_value_usd * quantity);
      onChange("fob_value", calculatedFob);
    }
  };

  return (
    <div className="p-3 bg-bg border border-line rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink flex items-center gap-1.5">
          <span>{country?.flag || "🌐"}</span>
          <span>{country?.name || code}</span>
          <span className="text-muted text-[10px] font-mono font-normal">({code})</span>
        </span>
        {isBaseline && (
          <span className="text-[10px] font-mono font-bold bg-blue-dim text-blue px-1.5 py-0.5 rounded border border-blue/20">
            BASELINE
          </span>
        )}
      </div>

      {/* Indicative UN Comtrade price suggestion from Phase 4 */}
      {bench && bench.indicative_unit_value_usd && (
        <div className="flex items-center justify-between p-1.5 bg-blue-dim/40 border border-blue/20 rounded text-[11px] font-mono">
          <div className="flex items-center gap-1 text-blue-dark truncate">
            <Lightbulb className="w-3.5 h-3.5 text-blue shrink-0" />
            <span className="truncate">
              Indicative: ${bench.indicative_unit_value_usd}/{bench.unit || unit}
            </span>
          </div>
          <button
            type="button"
            onClick={handleApplyBenchmark}
            className="text-[10px] font-bold text-blue hover:underline ml-1 shrink-0 cursor-pointer"
            title="Auto-fill FOB based on statistical UN Comtrade trade unit value"
          >
            Apply
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-[10px] font-mono text-muted block">FOB (USD):</span>
          <input
            type="number"
            value={cost.fob_value}
            onChange={(e) => onChange("fob_value", parseFloat(e.target.value) || 0)}
            className="w-full py-1 px-2 text-xs bg-panel border border-line rounded font-mono font-bold text-ink focus:outline-none focus:border-blue"
          />
        </div>
        <div>
          <span className="text-[10px] font-mono text-muted block">Freight (USD):</span>
          <input
            type="number"
            value={cost.freight}
            onChange={(e) => onChange("freight", parseFloat(e.target.value) || 0)}
            className="w-full py-1 px-2 text-xs bg-panel border border-line rounded font-mono font-bold text-ink focus:outline-none focus:border-blue"
          />
        </div>
        <div>
          <span className="text-[10px] font-mono text-muted block">Ins. (USD):</span>
          <input
            type="number"
            value={cost.insurance}
            onChange={(e) => onChange("insurance", parseFloat(e.target.value) || 0)}
            className="w-full py-1 px-2 text-xs bg-panel border border-line rounded font-mono font-bold text-ink focus:outline-none focus:border-blue"
          />
        </div>
      </div>
    </div>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const queryHs = searchParams.get("hs_code");

  const dispatch = useAppDispatch();
  const currentContext = useAppSelector((state) => state.context.current);

  // F13: Do NOT silently default HS, value, or quantity if user hasn't declared context
  const initialHs = queryHs || currentContext.hsCode || "";
  const [activeHs, setActiveHs] = useState<string>(initialHs);
  const [searchHsInput, setSearchHsInput] = useState<string>(initialHs);

  const [quantity, setQuantity] = useState<number>(currentContext.quantity || 100);
  const [unit, setUnit] = useState<string>(currentContext.unit || "MT");
  const [currency, setCurrency] = useState<string>(currentContext.currency || "USD");

  // Load dynamic country list from API (Phase 6.1)
  const { data: apiCountries, isLoading: isLoadingCountries } = useGetCountriesQuery();
  const countries = (apiCountries && apiCountries.length > 0) ? apiCountries : DEFAULT_COUNTRIES;

  const [selectedCountries, setSelectedCountries] = useState<string[]>([
    "US",
    "AE",
    "AU",
    "VN",
  ]);

  const [baselineOrigin, setBaselineOrigin] = useState<string>("US");
  const [showCostInputs, setShowCostInputs] = useState<boolean>(false);
  const [alertActive, setAlertActive] = useState<boolean>(false);

  // Per-origin FOB, Freight, and Insurance inputs (Contract v2)
  const [originCosts, setOriginCosts] = useState<Record<string, { fob_value: number; freight: number; insurance: number }>>({
    US: { fob_value: 43000, freight: 5200, insurance: 120 },
    AE: { fob_value: 42000, freight: 3500, insurance: 120 },
    AU: { fob_value: 42500, freight: 4500, insurance: 120 },
    VN: { fob_value: 41000, freight: 4100, insurance: 120 },
    CN: { fob_value: 41500, freight: 3800, insurance: 120 },
    SG: { fob_value: 42200, freight: 3900, insurance: 120 },
    DE: { fob_value: 44000, freight: 5000, insurance: 130 },
    GB: { fob_value: 43500, freight: 5100, insurance: 130 },
  });

  const [compareCountries, { isLoading }] = useCompareCountriesMutation();
  const [comparisonResult, setComparisonResult] = useState<CountryComparisonResponse | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Debouncing & Out-of-Order Cancellation (F12)
  const latestRequestId = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const executeComparison = async (
    hsToCompare: string,
    countriesToCompare: string[],
    baselineToCompare: string,
    costs: Record<string, { fob_value: number; freight: number; insurance: number }>
  ) => {
    if (!hsToCompare || hsToCompare.trim().length === 0) {
      return;
    }
    const reqId = ++latestRequestId.current;

    try {
      setErrorState(null);
      setValidationMessage(null);

      const originsPayload = countriesToCompare.map((c) => {
        const item = costs[c] || { fob_value: 42000, freight: 3500, insurance: 120 };
        return {
          country_code: c,
          fob_value: item.fob_value,
          freight: item.freight,
          insurance: item.insurance,
        };
      });

      const res = await compareCountries({
        hs_code: hsToCompare,
        currency,
        quantity,
        unit,
        baseline_origin: baselineToCompare,
        origins: originsPayload,
        assessable_value: costs[baselineToCompare]?.fob_value || 42000,
        countries: countriesToCompare,
      }).unwrap();

      // Ignore out-of-order responses (F12)
      if (reqId === latestRequestId.current) {
        setComparisonResult(res);
      }
    } catch (err: any) {
      if (reqId === latestRequestId.current) {
        setErrorState(
          getApiErrorMessage(
            err,
            "Failed to compute concurrent country origin comparison matrix. External tariff gateway unreachable."
          )
        );
      }
    }
  };

  const scheduleComparison = (
    hs = activeHs,
    countriesList = selectedCountries,
    baseline = baselineOrigin,
    costs = originCosts
  ) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      executeComparison(hs, countriesList, baseline, costs);
    }, 400);
  };

  useEffect(() => {
    if (activeHs) {
      scheduleComparison(activeHs, selectedCountries, baselineOrigin, originCosts);
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [activeHs, baselineOrigin]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchHsInput.trim()) {
      setActiveHs(searchHsInput.trim());
      scheduleComparison(searchHsInput.trim(), selectedCountries, baselineOrigin, originCosts);
    }
  };

  const handleCostChange = (code: string, field: "fob_value" | "freight" | "insurance", value: number) => {
    const updated = {
      ...originCosts,
      [code]: {
        ...(originCosts[code] || { fob_value: 42000, freight: 3500, insurance: 120 }),
        [field]: value,
      },
    };
    setOriginCosts(updated);
    scheduleComparison(activeHs, selectedCountries, baselineOrigin, updated);
  };

  const toggleCountry = (code: string) => {
    setValidationMessage(null);
    let updated: string[];
    if (selectedCountries.includes(code)) {
      if (selectedCountries.length <= 2) {
        setValidationMessage("Please keep at least 2 origins selected for multilateral corridor comparison.");
        return;
      }
      updated = selectedCountries.filter((c) => c !== code);
      if (baselineOrigin === code && updated.length > 0) {
        setBaselineOrigin(updated[0]);
      }
    } else {
      if (selectedCountries.length >= 6) {
        setValidationMessage("Maximum 6 origins can be compared simultaneously.");
        return;
      }
      updated = [...selectedCountries, code];
    }
    setSelectedCountries(updated);
    scheduleComparison(activeHs, updated, baselineOrigin, originCosts);
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

  const handleSaveAndAlert = () => {
    setAlertActive(true);
    setActionFeedback(
      `Arbitrage Alert Saved: We will monitor statutory tariff and freight rate differentials for HS ${formatHsCode(
        activeHs
      )} across ${selectedCountries.join(", ")}.`
    );
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // If no HS code is specified, show the explicit input form (F13)
  if (!activeHs) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <Card
          title={
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue" />
              <span>Multilateral Sourcing Arbitrage Matrix</span>
            </div>
          }
          subtitle="Select a tariff commodity code and commercial volume to evaluate statutory duty differentials across global trade agreements."
        >
          <form onSubmit={handleSearchSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-mono font-bold text-ink uppercase block mb-1">
                Tariff Item (HS Code):
              </label>
              <input
                type="text"
                value={searchHsInput}
                onChange={(e) => setSearchHsInput(e.target.value)}
                placeholder="e.g. 7204.49.00 or 8471.30.10"
                className="w-full py-2 px-3 text-sm bg-bg border border-line rounded-lg font-mono font-bold text-ink focus:outline-none focus:border-blue"
                required
              />
              <span className="text-[11px] text-muted mt-1 block">
                Enter an 8-digit statutory customs tariff code to compare bilateral FTA duty rates.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono font-bold text-ink uppercase block mb-1">
                  Batch Quantity:
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 100)}
                  className="w-full py-2 px-3 text-sm bg-bg border border-line rounded-lg font-mono font-bold text-ink focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-ink uppercase block mb-1">
                  Unit:
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full py-2 px-3 text-sm bg-bg border border-line rounded-lg font-mono font-bold text-ink focus:outline-none focus:border-blue cursor-pointer"
                >
                  <option value="MT">MT (Metric Ton)</option>
                  <option value="PCS">PCS (Pieces / Units)</option>
                  <option value="KG">KG (Kilograms)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue hover:bg-blue-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Origin Comparison Matrix</span>
            </button>
          </form>
        </Card>
      </div>
    );
  }

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
                label={comparisonResult?.comparisons?.[0]?.provenance?.type || "LIVE"}
                variant={comparisonResult?.comparisons?.[0]?.provenance?.type === "LIVE" ? "success" : "warning"}
                size="xs"
                dot
              />
            )}
          </div>
        </div>

        {/* Multi-Country Toggle Buttons & Baseline Origin */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-muted uppercase">Baseline:</span>
            <select
              value={baselineOrigin}
              onChange={(e) => {
                setBaselineOrigin(e.target.value);
                scheduleComparison(activeHs, selectedCountries, e.target.value, originCosts);
              }}
              className="py-1 px-2 text-xs bg-bg border border-line rounded font-mono font-semibold text-ink focus:outline-none focus:border-blue cursor-pointer"
            >
              {selectedCountries.map((c) => {
                const opt = countries.find((o) => o.code === c);
                return (
                  <option key={c} value={c}>
                    {opt?.flag || ""} {c} ({opt?.name || c})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-muted uppercase">Origins:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {countries.map((opt) => {
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCostInputs(!showCostInputs)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                showCostInputs
                  ? "bg-ink text-white border-ink"
                  : "bg-bg text-muted border-line hover:text-ink hover:bg-line/30"
              }`}
            >
              {showCostInputs ? "Hide Pricing" : "Adjust Pricing & Freight"}
            </button>

            {/* Save & Alert Action (Phase 6.9) */}
            <button
              type="button"
              onClick={handleSaveAndAlert}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                alertActive
                  ? "bg-green-dim text-green border-green/30"
                  : "bg-bg text-muted border-line hover:text-ink hover:bg-line/30"
              }`}
              title="Save comparison and get alerted when bilateral tariffs or freight change"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{alertActive ? "Alert Active" : "Save & Alert"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Per-Origin Pricing, Freight & Insurance Customization Panel (Phase 6.2) */}
      {showCostInputs && (
        <div className="p-4 bg-panel border border-line rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                Per-Origin Commercial Valuation & Freight Matrix (Contract v2)
              </h4>
              <p className="text-[11px] text-muted">
                Declare corridor-specific invoice FOB valuations, ocean forwarder freight, and marine cargo insurance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => executeComparison(activeHs, selectedCountries, baselineOrigin, originCosts)}
              className="px-3 py-1.5 bg-blue hover:bg-blue-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Recalculate Matrix
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {selectedCountries.map((code) => {
              const country = countries.find((o) => o.code === code);
              const cost = originCosts[code] || { fob_value: 42000, freight: 3500, insurance: 120 };
              return (
                <OriginCostRow
                  key={code}
                  code={code}
                  country={country}
                  cost={cost}
                  isBaseline={code === baselineOrigin}
                  activeHs={activeHs}
                  quantity={quantity}
                  unit={unit}
                  onChange={(field, val) => handleCostChange(code, field, val)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Valuation Warnings Banner */}
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

      {/* Error / Degraded State Alert */}
      {errorState && (
        <DegradedStateAlert
          reason={errorState}
          endpoint="POST /api/v1/compare"
          onRetry={() => executeComparison(activeHs, selectedCountries, baselineOrigin, originCosts)}
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
          selectedOrigin={currentContext.countryOfOrigin || baselineOrigin}
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

"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppSelector } from "@/store";
import {
  useGetEligibilityQuery,
  useGetCountriesQuery,
} from "@/store/eligibilityApi";
import { SchemeEligibilityView } from "@/components/eligibility/SchemeEligibilityView";
import { Card, ProvenanceBadge, StatusPill, DegradedStateAlert } from "@/components/ui";
import { formatHsCode } from "@/lib/formatters";
import {
  FileCheck,
  Search,
  Scale,
  Sparkles,
  AlertCircle,
  ArrowUpDown,
  Globe,
  Info,
} from "lucide-react";

function EligibilityContent() {
  const searchParams = useSearchParams();
  const queryHs = searchParams.get("hs_code");
  const queryOrigin = searchParams.get("origin") || "";
  const queryDirection = (searchParams.get("direction") || "import").toLowerCase() as "import" | "export";

  const currentContext = useAppSelector((state) => state.context.current);

  const [activeHs, setActiveHs] = useState<string>(
    queryHs || currentContext.hsCode || "7204.49.00"
  );
  const [searchHs, setSearchHs] = useState<string>(activeHs);
  const [direction, setDirection] = useState<"import" | "export">(queryDirection);
  const [selectedOrigin, setSelectedOrigin] = useState<string>(
    queryOrigin || currentContext.countryOfOrigin || ""
  );

  // Fetch dynamic trading partner countries
  const { data: countries } = useGetCountriesQuery();

  // Direction & origin aware eligibility query (Phase 5 & 6)
  const { data, isLoading, error } = useGetEligibilityQuery({
    hsCode: activeHs,
    direction,
    origin: selectedOrigin || undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchHs.trim()) {
      setActiveHs(searchHs.trim());
    }
  };

  const isNotCovered = data?.coverage === "NOT_COVERED" || data?.statutory_policy_status === "NOT_COVERED";

  return (
    <div className="space-y-6 pb-16">
          {/* Tariff Item Lookup & Filter Bar */}
          <div className="p-3.5 sm:p-4 bg-panel border border-line rounded-xl shadow-xs flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 min-w-0 shrink">
              <div className="w-9 h-9 rounded-lg bg-blue-dim text-blue flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 font-mono flex-nowrap">
                  <span className="text-muted uppercase text-[10px] shrink-0">Statutory Item:</span>
                  <strong className="text-ink font-bold text-sm shrink-0">{formatHsCode(activeHs)}</strong>
                  {isNotCovered ? (
                    <StatusPill label="NOT COVERED" variant="neutral" size="xs" />
                  ) : (
                    <StatusPill
                      label={data?.schemes?.[0]?.provenance?.type || "LIVE"}
                      variant={data?.schemes?.[0]?.provenance?.type === "LIVE" ? "success" : "warning"}
                      size="xs"
                      dot
                    />
                  )}
                </div>
                <span className="text-muted text-[11px] truncate block max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg">
                  {data?.hs_description || currentContext.materialName || "Tariff commodity unlisted in reference dataset"}
                </span>
              </div>
            </div>

            {/* Direction Toggle & Origin Selector & Search Input - All in One Line */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap overflow-x-auto max-w-full">
              {/* Direction Toggle */}
              <div className="flex items-center bg-bg border border-line rounded-lg p-0.5 text-xs font-mono font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setDirection("import")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs whitespace-nowrap ${
                    direction === "import"
                      ? "bg-blue text-white shadow-xs font-bold"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Import (Inward)
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("export")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs whitespace-nowrap ${
                    direction === "export"
                      ? "bg-blue text-white shadow-xs font-bold"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Export (Outward)
                </button>
              </div>

              {/* Origin Country Selector */}
              <div className="flex items-center gap-1.5 text-xs shrink-0">
                <Globe className="w-3.5 h-3.5 text-muted shrink-0" />
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="py-1.5 px-2 bg-bg border border-line rounded-lg text-ink font-semibold focus:outline-none focus:border-blue cursor-pointer text-xs max-w-[140px] sm:max-w-[170px] truncate"
                >
                  <option value="">All Partner Origins</option>
                  {countries?.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* HS Search Form */}
              <form onSubmit={handleSearch} className="flex items-center gap-1.5 shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    value={searchHs}
                    onChange={(e) => setSearchHs(e.target.value)}
                    placeholder="HS Code"
                    className="w-28 sm:w-36 py-1.5 px-2.5 text-xs bg-bg border border-line rounded-lg text-ink font-mono font-bold focus:outline-none focus:border-blue"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue hover:bg-blue-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  Lookup
                </button>
              </form>
            </div>
          </div>

          {/* Coverage Banner for NOT_COVERED HS Codes (Phase 6.2) */}
          {isNotCovered && !isLoading && (
            <div className="p-5 rounded-xl bg-amber-dim border border-amber/40 shadow-xs text-amber-dark space-y-2">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber shrink-0" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-dark">
                  TARIFF COMMODITY NOT COVERED IN STATUTORY REFERENCE SCHEDULE
                </h4>
                <StatusPill label="NOT COVERED" variant="neutral" size="xs" />
              </div>
              <p className="text-xs text-ink leading-relaxed">
                {data?.coverage_note ||
                  "This HS code is not cataloged in the active CBIC Customs Tariff dataset. In adherence with statutory verification rules, policy permissions and preferential rates are not fabricated."}
              </p>
            </div>
          )}

          {/* Loading / Error / Data States */}
          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono text-muted bg-panel border border-line rounded-xl">
              Evaluating DGFT Policy Schedule, RoO Rules, and Concessions for HS {activeHs} ({direction.toUpperCase()})...
            </div>
          ) : error ? (
            <DegradedStateAlert
              title="Trade Scheme & Policy Schedule Unreachable"
              endpoint={`GET /api/v1/eligibility/${activeHs}`}
              reason={`Statutory eligibility lookup failed for HS ${activeHs}. DGFT Foreign Trade Policy or FTA concession schedule gateway unreachable.`}
            />
          ) : data ? (
            <SchemeEligibilityView
              data={data}
              selectedOrigin={selectedOrigin}
              direction={direction}
            />
          ) : null}
        </div>
  );
}

export default function EligibilityPage() {
  return (
    <AuthGuard>
      <AppShell>
        <React.Suspense
          fallback={
            <div className="p-12 text-center text-xs font-mono text-muted bg-panel border border-line rounded-xl">
              Loading Statutory Eligibility & Policy Engine...
            </div>
          }
        >
          <EligibilityContent />
        </React.Suspense>
      </AppShell>
    </AuthGuard>
  );
}

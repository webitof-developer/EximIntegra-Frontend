"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ClassificationResponse, ClassificationCandidate } from "@/lib/types";
import { Card, ProvenanceBadge, StatusPill, IconTile } from "@/components/ui";
import { formatCurrency, formatHsCode, formatPercent } from "@/lib/formatters";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calculator,
  Sparkles,
  ShieldCheck,
  Scale,
  Check,
  ExternalLink,
} from "lucide-react";

interface ClassificationResultsViewProps {
  result: ClassificationResponse;
  onSelectContext: (candidate: ClassificationCandidate) => void;
  activeContextHsCode?: string;
}

export function ClassificationResultsView({
  result,
  onSelectContext,
  activeContextHsCode,
}: ClassificationResultsViewProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<ClassificationCandidate>(
    result.primary
  );
  const [justApplied, setJustApplied] = useState(false);

  const handleApply = (candidate: ClassificationCandidate) => {
    onSelectContext(candidate);
    setSelectedCandidate(candidate);
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 2500);
  };

  const isCurrentActive =
    activeContextHsCode === selectedCandidate.hs_code;

  return (
    <div className="space-y-6">
      {/* Primary Match Card */}
      <div className="bg-panel border-2 border-blue/30 rounded-xl shadow-xs overflow-hidden">
        {/* Top Highlight Banner */}
        <div className="px-6 py-3.5 bg-blue-dim border-b border-blue/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" />
            <span className="text-xs font-bold text-blue uppercase tracking-wider font-mono">
              Primary Statutory Recommendation
            </span>
            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded text-blue font-bold border border-blue/20">
              {(result.primary.confidence * 100).toFixed(0)}% Confidence
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ProvenanceBadge
              type={result.primary.provenance.type}
              source={result.primary.provenance.source}
              effectiveDate={result.primary.provenance.effectiveDate}
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main HS Code & Description */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-line">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold font-data text-ink tracking-tight">
                  {formatHsCode(result.primary.hs_code)}
                </span>
                {result.primary.policy_condition && (
                  <StatusPill
                    label={`Policy: ${result.primary.policy_condition}`}
                    variant={
                      result.primary.policy_condition === "Free"
                        ? "success"
                        : "warning"
                    }
                    size="sm"
                  />
                )}
              </div>
              <p className="text-sm text-ink font-medium leading-relaxed max-w-3xl">
                {result.primary.description}
              </p>
              {result.primary.chapter && (
                <div className="text-xs text-muted font-mono">
                  {result.primary.chapter} &bull; {result.primary.chapter_title}
                </div>
              )}
            </div>

            {/* Set as Active Context Action Button */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={() => handleApply(result.primary)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                  isCurrentActive || justApplied
                    ? "bg-green text-white"
                    : "bg-blue hover:bg-blue-dark text-white"
                }`}
              >
                {isCurrentActive || justApplied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Active in Shared Context</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    <span>Set as Active Material Context</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Statutory Duties & Economic Snapshot */}
          {result.primary.duty_indicative && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-bg border border-line">
                <span className="text-[10px] text-muted font-mono uppercase block">
                  Basic Customs Duty (BCD)
                </span>
                <span className="text-base font-bold font-data text-ink">
                  {formatPercent(result.primary.duty_indicative.bcd)}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  Standard Statutory
                </span>
              </div>

              <div className="p-3 rounded-lg bg-bg border border-line">
                <span className="text-[10px] text-muted font-mono uppercase block">
                  Social Welfare Surcharge (SWS)
                </span>
                <span className="text-base font-bold font-data text-ink">
                  {formatPercent(result.primary.duty_indicative.sws)}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  Calculated on BCD
                </span>
              </div>

              <div className="p-3 rounded-lg bg-bg border border-line">
                <span className="text-[10px] text-muted font-mono uppercase block">
                  Integrated GST (IGST)
                </span>
                <span className="text-base font-bold font-data text-ink">
                  {formatPercent(result.primary.duty_indicative.igst)}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  Input Tax Credit eligible
                </span>
              </div>

              <div className="p-3 rounded-lg bg-blue-dim border border-blue/20">
                <span className="text-[10px] text-blue font-mono uppercase block font-semibold">
                  Effective Customs Impact
                </span>
                <span className="text-base font-bold font-data text-blue">
                  {formatPercent(result.primary.duty_indicative.effective_rate || 21.25)}
                </span>
                <span className="text-[10px] text-blue/80 block mt-0.5">
                  Pre-clearing rate
                </span>
              </div>
            </div>
          )}

          {/* GIR Legal Interpretation Box */}
          <div className="p-4 rounded-xl bg-[#FAFBFD] border border-line space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue" />
                <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                  General Rules of Interpretation (GIR) Analysis
                </span>
              </div>
              <span className="text-xs font-mono bg-blue-dim text-blue px-2 py-0.5 rounded font-semibold">
                Applied: {result.primary.gir_applied}
              </span>
            </div>
            <p className="text-xs text-ink leading-relaxed font-sans">
              {result.primary.gir_rationale}
            </p>
          </div>

          {/* Downstream Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>Next pipeline steps with this HS code:</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/duty"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-dim text-green border border-green/20 text-xs font-semibold hover:bg-green hover:text-white transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculate Duty on Assessable Value &rarr;</span>
              </Link>
              <Link
                href="/akshara"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-dim text-blue border border-blue/20 text-xs font-semibold hover:bg-blue hover:text-white transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verify with Akshara AI &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Alternate Candidate Headings */}
      {result.alternates && result.alternates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted font-bold">
              Potential Alternate Headings Considered
            </h4>
            <span className="text-[11px] text-muted">
              Evaluated during GIR hierarchy elimination
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.alternates.map((alt) => (
              <div
                key={alt.hs_code}
                className="p-4 bg-panel border border-line rounded-xl space-y-3 hover:border-line-dark transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold font-data text-ink">
                      {formatHsCode(alt.hs_code)}
                    </span>
                    <p className="text-xs text-ink font-medium line-clamp-2">
                      {alt.description}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-xs font-mono font-semibold text-muted bg-bg px-1.5 py-0.5 rounded border border-line">
                      {(alt.confidence * 100).toFixed(0)}%
                    </span>
                    <ProvenanceBadge type={alt.provenance.type} compact />
                  </div>
                </div>

                <div className="p-2.5 rounded bg-bg text-[11px] text-muted leading-relaxed">
                  <span className="font-semibold text-ink">Why alternate:</span>{" "}
                  {alt.gir_rationale}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-line/60">
                  <span className="text-[11px] font-mono text-muted">
                    Applied: {alt.gir_applied}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApply(alt)}
                    className="text-xs text-blue hover:underline font-semibold cursor-pointer"
                  >
                    Select this code instead
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

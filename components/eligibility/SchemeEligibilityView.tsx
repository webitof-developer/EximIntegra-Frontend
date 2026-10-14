"use client";

import React from "react";
import Link from "next/link";
import { EligibilityResponse, SchemeDetail } from "@/lib/types";
import { Card, ProvenanceBadge, StatusPill } from "@/components/ui";
import { formatPercent } from "@/lib/formatters";
import {
  AlertTriangle,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Award,
  ArrowRight,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Scale,
  Sparkles,
  CheckCircle2,
  CheckSquare,
  AlertOctagon,
} from "lucide-react";

interface SchemeEligibilityViewProps {
  data: EligibilityResponse;
  selectedOrigin?: string;
  direction?: "import" | "export";
}

function ApplicabilityChip({ applicability }: { applicability?: string }) {
  if (!applicability) return null;
  const appUpper = applicability.toUpperCase();
  if (appUpper === "DIRECT") {
    return <StatusPill label="DIRECT APPLICABILITY" variant="success" size="xs" />;
  }
  if (appUpper === "CONDITIONAL") {
    return <StatusPill label="CONDITIONAL CONCESSION" variant="warning" size="xs" />;
  }
  return <StatusPill label={applicability} variant="neutral" size="xs" />;
}

export function SchemeEligibilityView({
  data,
  selectedOrigin,
  direction = "import",
}: SchemeEligibilityViewProps) {
  const isNotCovered = data.coverage === "NOT_COVERED" || data.statutory_policy_status === "NOT_COVERED";
  const ftaSchemes = data.schemes.filter((s) => s.category === "FTA");
  const nonFtaSchemes = data.schemes.filter((s) => s.category !== "FTA");

  const compareUrl = `/compare?hs_code=${data.hs_code}${selectedOrigin ? `&origin=${selectedOrigin}` : ""}`;
  const dutyUrl = `/duty?hs_code=${data.hs_code}${selectedOrigin ? `&origin=${selectedOrigin}` : ""}`;

  return (
    <div className="space-y-6">
      {/* 1. CRITICAL PROMINENT STATUTORY DISCLAIMER */}
      <div className="p-5 rounded-xl bg-amber-dim border-2 border-amber/40 shadow-xs text-amber-dark space-y-2">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber shrink-0 stroke-[2.5]" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-dark">
            STATUTORY CONCESSION & POLICY STATUS AS OF {data.effective_as_of_date || data.as_of || "DATASET BASELINE"} — VERIFY MANUALLY
          </h4>
          <span className="text-[10px] font-mono bg-white/70 px-2 py-0.5 rounded border border-amber/30 font-semibold">
            DGFT / CBIC NOTICES
          </span>
        </div>

        <p className="text-xs text-ink leading-relaxed font-medium">
          {data.prominent_disclaimer}
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber/20 text-[11px] text-amber-dark font-mono">
          <div className="flex items-center gap-2">
            <span>Last Verified Against Official Gazette:</span>
            <strong>{data.effective_as_of_date || data.as_of || "Current"}</strong>
          </div>
          <span className="text-muted text-[10px]">
            Direction: <strong className="uppercase text-ink">{data.direction || direction}</strong>
            {selectedOrigin && <> &bull; Origin Filter: <strong className="uppercase text-ink">{selectedOrigin}</strong></>}
          </span>
        </div>
      </div>

      {/* NOT COVERED State View */}
      {isNotCovered ? (
        <Card
          title={
            <div className="flex items-center gap-2 text-ink">
              <AlertCircle className="w-5 h-5 text-amber shrink-0" />
              <span>Tariff Item Not Covered in Reference Dataset</span>
            </div>
          }
          subtitle={`HS Code ${data.hs_code} is not cataloged in the active statutory dataset.`}
        >
          <div className="p-5 rounded-xl bg-bg border border-line space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-panel rounded-lg border border-line">
              <span className="text-xs font-mono text-muted font-semibold">Statutory Import Policy Condition:</span>
              <StatusPill label="NOT COVERED" variant="neutral" size="xs" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-panel rounded-lg border border-line">
              <span className="text-xs font-mono text-muted font-semibold">Standard MFN Customs Duty:</span>
              <span className="text-xs font-mono text-muted font-semibold">Not Available (Unlisted)</span>
            </div>

            <div className="p-4 bg-amber-dim/50 border border-amber/30 rounded-lg text-xs text-amber-dark space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber shrink-0" />
                <span>Statutory Reference Notice</span>
              </div>
              <p className="leading-relaxed">
                {data.coverage_note ||
                  "Tariff item not covered in the statutory reference dataset. Absence of statutory policy classification is not interpreted as Free (OGL) import permission. In compliance with statutory verification principles, policy conditions and concessional duties are not invented."}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Statutory Policy Status Banner */}
          {data.policy && (
            <div className="p-4 bg-panel border border-line rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted uppercase font-bold">
                    Statutory {direction === "export" ? "Export" : "Import"} Policy Status:
                  </span>
                  <StatusPill
                    label={data.policy.status}
                    variant={
                      data.policy.status === "FREE"
                        ? "success"
                        : data.policy.status === "RESTRICTED"
                        ? "warning"
                        : "neutral"
                    }
                    size="xs"
                    dot
                  />
                  {data.policy.notification && (
                    <span className="text-[10px] font-mono text-muted bg-bg px-2 py-0.5 rounded border border-line">
                      {data.policy.notification}
                    </span>
                  )}
                </div>
                {data.policy.conditions && data.policy.conditions.length > 0 && (
                  <p className="text-xs text-muted">
                    {data.policy.conditions.join("; ")}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                <ProvenanceBadge
                  type={data.policy.provenance?.type || "LIVE"}
                  source={data.policy.provenance?.source || "DGFT ITC(HS)"}
                  compact
                />
              </div>
            </div>
          )}

          {/* 2. Free Trade Agreements (FTAs) & Preferential Tariff Matrix */}
          {ftaSchemes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted font-mono flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue" />
                  Preferential Trade Agreements & Tariff Concessions
                </h3>
                <span className="text-xs text-muted">
                  Rules of Origin (Wholly Obtained / CTSH + Value Addition)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ftaSchemes.map((scheme) => (
                  <Card
                    key={scheme.id}
                    className="flex flex-col justify-between hover:border-blue/40 transition-all"
                    noPadding
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusPill
                            label={scheme.status}
                            variant={
                              scheme.status === "CONCESSION_AVAILABLE" || scheme.status === "ELIGIBLE"
                                ? "success"
                                : "warning"
                            }
                            size="xs"
                            dot
                          />
                          {/* Applicability Chip (Phase 6.3) */}
                          <ApplicabilityChip applicability={scheme.applicability} />
                        </div>
                        <ProvenanceBadge
                          type={scheme.provenance?.type || "LIVE"}
                          source={scheme.provenance?.source || "CBIC Gazette"}
                          compact
                        />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-ink">
                          {scheme.name}
                        </h4>
                        <div className="mt-2 p-2 rounded-lg bg-green-dim border border-green/20 text-xs font-mono font-bold text-green flex items-center justify-between">
                          <span>Preferential Duty:</span>
                          <span>{formatPercent(scheme.preferential_duty_rate)}</span>
                        </div>
                      </div>

                      {/* Rules of Origin */}
                      <div className="space-y-1 text-xs text-muted">
                        <div className="font-semibold text-ink text-[11px]">
                          Rules of Origin (RoO) Criteria:
                        </div>
                        <p className="text-[11px] leading-relaxed bg-bg p-2 rounded border border-line">
                          {scheme.rules_of_origin}
                        </p>
                      </div>

                      {/* Conditions Checklist (Phase 6.3) */}
                      {scheme.conditions && scheme.conditions.length > 0 && (
                        <div className="space-y-1.5 text-[11px] text-muted">
                          <span className="font-semibold text-ink block">
                            Mandatory Concession Conditions:
                          </span>
                          <div className="space-y-1 bg-bg p-2.5 rounded border border-line">
                            {scheme.conditions.map((cond, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-ink">
                                <CheckSquare className="w-3.5 h-3.5 text-blue shrink-0 mt-0.5" />
                                <span className="leading-tight">{cond}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Required Documentation */}
                      <div className="space-y-1 text-[11px] text-muted">
                        <span className="font-semibold text-ink block">
                          Required Trade Documentation:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                          {scheme.documentation_required?.map((doc, idx) => (
                            <li key={idx} className="truncate">
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-bg border-t border-line flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted">
                        Effective: {scheme.effective_date}
                      </span>
                      <Link
                        href={`/duty?hs_code=${data.hs_code}&origin=${
                          scheme.id.includes("uae")
                            ? "AE"
                            : scheme.id.includes("ecta")
                            ? "AU"
                            : scheme.id.includes("asean")
                            ? "VN"
                            : selectedOrigin || "AE"
                        }`}
                        className="text-xs text-blue font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Apply in Duty Calculator</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 3. Export Promotion & Domestic Manufacturing Schemes */}
          {nonFtaSchemes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted font-mono flex items-center gap-1.5">
                <Award className="w-4 h-4 text-green" />
                {direction === "export"
                  ? "Export Remission & Duty Drawback Schemes"
                  : "Manufacturing & Duty Deferral Authorisations"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {nonFtaSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="p-5 bg-panel border border-line rounded-xl space-y-3 hover:border-line-dark transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase bg-bg px-2 py-0.5 rounded text-muted font-semibold">
                          {scheme.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <StatusPill label={scheme.status} variant="success" size="xs" />
                          <ApplicabilityChip applicability={scheme.applicability} />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-ink">
                          {scheme.name}
                        </h4>
                        <p className="text-xs font-semibold text-green mt-1">
                          {scheme.headline_benefit}
                        </p>
                      </div>

                      {/* Conditions Checklist (Phase 6.3) */}
                      {scheme.conditions && scheme.conditions.length > 0 && (
                        <div className="space-y-1 text-[11px] text-muted">
                          <span className="font-semibold text-ink block">
                            Statutory Pre-Conditions:
                          </span>
                          <div className="space-y-1 bg-bg p-2 rounded border border-line">
                            {scheme.conditions.map((cond, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[10px] text-ink">
                                <CheckSquare className="w-3 h-3 text-green shrink-0 mt-0.5" />
                                <span>{cond}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-[11px] text-muted space-y-1">
                        <span className="font-semibold text-ink block">
                          Policy Provision:
                        </span>
                        <p className="leading-relaxed bg-bg p-2 rounded border border-line text-[10px]">
                          {scheme.rules_of_origin}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-line text-[10px] font-mono text-muted">
                      <span>{scheme.effective_date ? `Eff: ${scheme.effective_date}` : scheme.provenance?.source}</span>
                      <ProvenanceBadge
                        type={scheme.provenance?.type || "LIVE"}
                        source={scheme.provenance?.source || "DGFT FTP 2023"}
                        compact
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Non-Tariff Regulatory Compliance Checklist */}
          {data.regulatory_measures && data.regulatory_measures.length > 0 && (
            <Card
              title="Non-Tariff Measures & Regulatory Port Clearance Requirements"
              subtitle="Statutory compliance and pre-shipment certifications required prior to Bill of Entry clearance."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.regulatory_measures.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-4 rounded-xl bg-bg border border-line space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted uppercase font-bold">
                        {reg.agency}
                      </span>
                      <StatusPill
                        label={reg.status.replace("_", " ")}
                        variant={
                          reg.status === "COMPLIANCE_REQUIRED" ? "warning" : "success"
                        }
                        size="xs"
                      />
                    </div>

                    <h5 className="text-xs font-bold text-ink leading-snug">
                      {reg.title || reg.name}
                    </h5>

                    <p className="text-[11px] text-muted leading-relaxed">
                      {reg.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-line/60 text-[10px] font-mono text-muted">
                      <span>Mandatory: {reg.mandatory ? "Yes" : "No"}</span>
                      <ProvenanceBadge
                        type={reg.provenance?.type || "LIVE"}
                        source={reg.provenance?.source || reg.agency}
                        compact
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Bottom Pipeline Navigation */}
          <div className="p-5 bg-panel border border-line rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>Launch side-by-side landed cost comparison for this commodity:</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={dutyUrl}
                className="px-4 py-2 rounded-lg bg-bg border border-line hover:bg-line text-ink text-xs font-semibold transition-colors"
              >
                Open Duty Calculator
              </Link>
              <Link
                href={compareUrl}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Launch Origin Comparison Matrix &rarr;</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

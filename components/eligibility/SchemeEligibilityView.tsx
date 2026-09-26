"use client";

import React from "react";
import Link from "next/link";
import { EligibilityResponse } from "@/lib/types";
import { Card, ProvenanceBadge, StatusPill } from "@/components/ui";
import { formatPercent } from "@/lib/formatters";
import {
  AlertTriangle,
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
} from "lucide-react";

interface SchemeEligibilityViewProps {
  data: EligibilityResponse;
}

export function SchemeEligibilityView({ data }: SchemeEligibilityViewProps) {
  const ftaSchemes = data.schemes.filter((s) => s.category === "FTA");
  const exportSchemes = data.schemes.filter((s) => s.category !== "FTA");

  return (
    <div className="space-y-6">
      {/* 1. CRITICAL PROMINENT DISCLAIMER REQUIREMENT */}
      <div className="p-5 rounded-xl bg-amber-dim border-2 border-amber/40 shadow-xs text-amber-dark space-y-2">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber shrink-0 stroke-[2.5]" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-dark">
            STATUTORY CONCESSION STATUS AS OF {data.effective_as_of_date} — VERIFY MANUALLY
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
            <span>Last Verified Against Gazette:</span>
            <strong>{data.effective_as_of_date}</strong>
          </div>
          <span className="underline cursor-pointer hover:text-ink">
            Check Latest DGFT Public Trade Notices &rarr;
          </span>
        </div>
      </div>

      {/* 2. Free Trade Agreements (FTAs) & Preferential Tariff Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted font-mono flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-blue" />
            Preferential Trade Agreements & Tariff Concessions
          </h3>
          <span className="text-xs text-muted">
            Origin Criteria (Wholly Obtained / CTSH + RVC)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ftaSchemes.map((scheme) => (
            <Card
              key={scheme.id}
              className="flex flex-col justify-between hover:border-blue/40 transition-all"
              noPadding
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <StatusPill
                    label={scheme.status}
                    variant={
                      scheme.status === "ELIGIBLE" ? "success" : "warning"
                    }
                    size="xs"
                    dot
                  />
                  <ProvenanceBadge
                    type={scheme.provenance.type}
                    source={scheme.provenance.source}
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

                <div className="space-y-1.5 text-xs text-muted">
                  <div className="font-semibold text-ink text-[11px]">
                    Rules of Origin (RoO) Requirement:
                  </div>
                  <p className="text-[11px] leading-relaxed bg-bg p-2 rounded border border-line">
                    {scheme.rules_of_origin}
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-muted">
                  <span className="font-semibold text-ink block">
                    Required Documentation:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                    {scheme.documentation_required.map((doc, idx) => (
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
                  href={`/duty?hs_code=${data.hs_code}&trade_agreement=${
                    scheme.id.includes("uae")
                      ? "INDIA_UAE_CEPA"
                      : scheme.id.includes("ecta")
                      ? "INDIA_AUS_ECTA"
                      : "INDIA_ASEAN_AIFTA"
                  }`}
                  className="text-xs text-blue font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Apply in Calculator</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Export Promotion & Duty Deferral Schemes */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted font-mono flex items-center gap-1.5">
          <Award className="w-4 h-4 text-green" />
          Export Benefits & Customs Duty Deferral Schemes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {exportSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="p-5 bg-panel border border-line rounded-xl space-y-3 hover:border-line-dark transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-bg px-2 py-0.5 rounded text-muted font-semibold">
                  {scheme.category}
                </span>
                <StatusPill label={scheme.status} variant="success" size="xs" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-ink">
                  {scheme.name}
                </h4>
                <p className="text-xs font-semibold text-green mt-1">
                  {scheme.headline_benefit}
                </p>
              </div>

              <div className="text-[11px] text-muted space-y-1">
                <span className="font-semibold text-ink block">
                  Eligibility Criteria:
                </span>
                <p className="leading-relaxed bg-bg p-2 rounded border border-line text-[10px]">
                  {scheme.rules_of_origin}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-line text-[10px] font-mono text-muted">
                <span>{scheme.provenance.source}</span>
                <ProvenanceBadge type="LIVE" compact />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Non-Tariff Regulatory Compliance Checklist */}
      <Card
        title="Non-Tariff Measures & Statutory Compliance Checklist"
        subtitle="Mandatory regulatory clearances required prior to customs clearance at port."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.regulatory_measures.map((reg) => (
            <div
              key={reg.id}
              className="p-4 rounded-xl bg-bg border border-line space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase">
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
                {reg.title}
              </h5>

              <p className="text-[11px] text-muted leading-relaxed">
                {reg.description}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-line/60 text-[10px] font-mono text-muted">
                <span>Mandatory: {reg.mandatory ? "Yes" : "No"}</span>
                <ProvenanceBadge type="LIVE" source={reg.agency} compact />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom Pipeline Navigation */}
      <div className="p-5 bg-panel border border-line rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>Compare landed costs across these preferential FTA jurisdictions:</span>
        </div>

        <Link
          href={`/compare?hs_code=${data.hs_code}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Launch Country-of-Origin Arbitrage Matrix &rarr;</span>
        </Link>
      </div>
    </div>
  );
}

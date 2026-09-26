"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DutyCalculationResponse } from "@/lib/types";
import { Card, ProvenanceBadge, StatusPill } from "@/components/ui";
import { formatCurrency, formatHsCode, formatPercent } from "@/lib/formatters";
import {
  ShieldAlert,
  Ship,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";

interface DutyBreakdownViewProps {
  calculation: DutyCalculationResponse;
  onSaveToContext: (calculationId: string) => void;
  isSavedInContext?: boolean;
}

export function DutyBreakdownView({
  calculation,
  onSaveToContext,
  isSavedInContext = false,
}: DutyBreakdownViewProps) {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(calculation.calculation_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const { duties } = calculation;

  return (
    <div className="space-y-6">
      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Assessable Value Card */}
        <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted font-semibold">
              Assessable CIF Value
            </span>
            <ProvenanceBadge type="LIVE" source="CBIC Exchange Rate" compact />
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold font-data text-ink">
              {formatCurrency(calculation.assessable_value_inr, "INR")}
            </div>
            <div className="text-xs text-muted font-mono">
              USD {calculation.assessable_value_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })} @ ₹{calculation.exchange_rate}
            </div>
          </div>
        </div>

        {/* Total Statutory Customs Duty Card */}
        <div className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted font-semibold">
              Total Customs Duty (BCD+SWS)
            </span>
            <span className="text-xs font-mono font-bold text-green bg-green-dim px-2 py-0.5 rounded border border-green/20">
              {formatPercent(calculation.effective_duty_percentage)} on CIF
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold font-data text-green">
              {formatCurrency(calculation.total_customs_duty_inr, "INR")}
            </div>
            <div className="text-xs text-muted">
              Statutory tariff outlay before GST
            </div>
          </div>
        </div>

        {/* Total Landed at Port Card */}
        <div className="p-5 bg-navy text-white rounded-xl shadow-xs border border-[#1B2A4A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#8EA0C0] font-semibold">
              Total Customs Outlay (with IGST)
            </span>
            <span className="text-xs font-mono text-green font-bold">
              {formatPercent(calculation.total_effective_tax_percentage)} Total Tax
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold font-data text-white">
              {formatCurrency(calculation.total_landed_customs_inr, "INR")}
            </div>
            <div className="text-xs text-[#8EA0C0] font-mono">
              Includes {formatCurrency(calculation.duties.igst.amount_inr, "INR")} IGST (ITC Eligible)
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Duty Breakdown Table */}
      <Card
        title={
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-ink">
              Duty & Tax Schedule Breakdown
            </span>
            <span className="text-xs font-mono text-muted bg-bg px-2 py-0.5 rounded border border-line">
              HS {formatHsCode(calculation.hs_code)}
            </span>
          </div>
        }
        subtitle={`${calculation.trade_agreement} &bull; Origin: ${calculation.country_of_origin}`}
        action={
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted">Calculation ID:</span>
            <button
              type="button"
              onClick={handleCopyId}
              className="flex items-center gap-1 px-2 py-1 rounded bg-bg border border-line text-ink hover:bg-line transition-colors cursor-pointer"
              title="Copy Calculation ID"
            >
              <span className="font-bold">{calculation.calculation_id}</span>
              {copiedId ? (
                <Check className="w-3 h-3 text-green" />
              ) : (
                <Copy className="w-3 h-3 text-muted" />
              )}
            </button>
          </div>
        }
      >
        <div className="border border-line rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBFD] border-b border-line text-muted uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Statutory Duty Component</th>
                <th className="py-3 px-4">Statutory Rate</th>
                <th className="py-3 px-4">Rate Applied</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Data Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-sans">
              {/* 1. Basic Customs Duty */}
              <tr className="hover:bg-bg/50 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-ink">
                    {duties.bcd.name}
                  </div>
                  <div className="text-[11px] text-muted">
                    {duties.bcd.provenance.notes}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-data text-muted">
                  {formatPercent(duties.bcd.statutory_rate)}
                </td>
                <td className="py-3.5 px-4 font-data font-bold text-ink">
                  {formatPercent(duties.bcd.rate_applied)}
                </td>
                <td className="py-3.5 px-4 font-data font-bold text-ink">
                  {formatCurrency(duties.bcd.amount_inr, "INR")}
                </td>
                <td className="py-3.5 px-4">
                  <ProvenanceBadge
                    type={duties.bcd.provenance.type}
                    source={duties.bcd.provenance.source}
                    effectiveDate={duties.bcd.provenance.effectiveDate}
                  />
                </td>
              </tr>

              {/* 2. Social Welfare Surcharge */}
              <tr className="hover:bg-bg/50 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-ink">
                    {duties.sws.name}
                  </div>
                  <div className="text-[11px] text-muted">
                    {duties.sws.calculation_basis}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-data text-muted">
                  {formatPercent(duties.sws.statutory_rate)}
                </td>
                <td className="py-3.5 px-4 font-data font-bold text-ink">
                  {formatPercent(duties.sws.rate_applied)}
                </td>
                <td className="py-3.5 px-4 font-data font-bold text-ink">
                  {formatCurrency(duties.sws.amount_inr, "INR")}
                </td>
                <td className="py-3.5 px-4">
                  <ProvenanceBadge
                    type={duties.sws.provenance.type}
                    source={duties.sws.provenance.source}
                  />
                </td>
              </tr>

              {/* 3. AIDC */}
              <tr className="hover:bg-bg/50 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-ink">
                    {duties.aidc.name}
                  </div>
                  <div className="text-[11px] text-muted">
                    {duties.aidc.provenance.notes}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-data text-muted">
                  {formatPercent(duties.aidc.statutory_rate)}
                </td>
                <td className="py-3.5 px-4 font-data font-bold text-ink">
                  {formatPercent(duties.aidc.rate_applied)}
                </td>
                <td className="py-3.5 px-4 font-data font-bold text-ink">
                  {formatCurrency(duties.aidc.amount_inr, "INR")}
                </td>
                <td className="py-3.5 px-4">
                  <ProvenanceBadge
                    type={duties.aidc.provenance.type}
                    source={duties.aidc.provenance.source}
                  />
                </td>
              </tr>

              {/* 4. Anti-Dumping Duty (CRITICAL ILLUSTRATIVE ROW) */}
              <tr className="bg-amber-dim/30 hover:bg-amber-dim/50 transition-colors border-l-4 border-amber">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-dark">
                      {duties.anti_dumping.name}
                    </span>
                    <StatusPill
                      label={duties.anti_dumping.status || "INDICATIVE"}
                      variant="warning"
                      size="xs"
                    />
                  </div>
                  <div className="text-[11px] text-amber mt-0.5">
                    {duties.anti_dumping.provenance.notes}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-data text-amber font-semibold">
                  {formatPercent(duties.anti_dumping.statutory_rate)}
                </td>
                <td className="py-3.5 px-4 font-data font-bold text-amber">
                  {formatPercent(duties.anti_dumping.rate_applied)}
                </td>
                <td className="py-3.5 px-4 font-data font-bold text-amber">
                  {formatCurrency(duties.anti_dumping.amount_inr, "INR")}
                </td>
                <td className="py-3.5 px-4">
                  {/* Distinctive ILLUSTRATIVE badge */}
                  <ProvenanceBadge
                    type={duties.anti_dumping.provenance.type}
                    source={duties.anti_dumping.provenance.source}
                  />
                </td>
              </tr>

              {/* 5. Integrated GST */}
              <tr className="hover:bg-bg/50 transition-colors bg-[#FAFBFD]/60">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-ink">
                    {duties.igst.name}
                  </div>
                  <div className="text-[11px] text-muted">
                    {duties.igst.calculation_basis}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-data text-muted">
                  {formatPercent(duties.igst.statutory_rate)}
                </td>
                <td className="py-3.5 px-4 font-data font-bold text-ink">
                  {formatPercent(duties.igst.rate_applied)}
                </td>
                <td className="py-3.5 px-4 font-data font-bold text-ink">
                  {formatCurrency(duties.igst.amount_inr, "INR")}
                </td>
                <td className="py-3.5 px-4">
                  <ProvenanceBadge
                    type={duties.igst.provenance.type}
                    source={duties.igst.provenance.source}
                    effectiveDate={duties.igst.provenance.effectiveDate}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Statutory Advisory Notice */}
      <div className="p-3.5 rounded-xl bg-amber-dim/40 border border-amber/20 text-xs text-amber leading-relaxed flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold block">
            Statutory Notice
          </span>
          <p className="text-[11px] opacity-90">
            {calculation.liability_disclaimer}
          </p>
        </div>
      </div>

      {/* Pipeline Navigation & Save Context Action */}
      <div className="p-5 bg-panel border border-line rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSaveToContext(calculation.calculation_id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
              isSavedInContext
                ? "bg-green text-white"
                : "bg-blue hover:bg-blue-dark text-white"
            }`}
          >
            {isSavedInContext ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved in Shared Context & Reports</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save to Context & Reports</span>
              </>
            )}
          </button>

          <span className="text-xs text-muted font-mono">
            Calculation ID: {calculation.calculation_id}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/akshara"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg hover:bg-line border border-line text-xs font-semibold text-ink transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue" />
            <span>Consult Akshara</span>
          </Link>

          <Link
            href={`/landed-cost?duty_id=${calculation.calculation_id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Proceed to Landed Cost Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

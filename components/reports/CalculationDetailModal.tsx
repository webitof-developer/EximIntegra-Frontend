"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CalculationHistoryRecord } from "@/lib/types";
import { ProvenanceBadge } from "@/components/ui/ProvenanceBadge";
import { useAppDispatch } from "@/store";
import { setMaterialContext } from "@/store/contextSlice";
import {
  X,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calculator,
  Ship,
  FileText,
  Printer,
  CheckCircle2,
  Calendar,
  MapPin,
  Tag,
  Hash,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Building,
} from "lucide-react";

interface CalculationDetailModalProps {
  record: CalculationHistoryRecord | null;
  onClose: () => void;
}

export function CalculationDetailModal({
  record,
  onClose,
}: CalculationDetailModalProps) {
  const dispatch = useAppDispatch();
  const [contextLoaded, setContextLoaded] = useState(false);

  if (!record) return null;

  const isDuty = record.type === "DUTY";

  const handleApplyToContext = () => {
    dispatch(
      setMaterialContext({
        hsCode: record.hs_code,
        hsDescription: record.hs_description,
        materialName: record.commodity_name,
        countryOfOrigin: record.country_of_origin,
        quantity: record.quantity,
        unit: record.unit,
      })
    );
    setContextLoaded(true);
    setTimeout(() => setContextLoaded(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(record.timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(record.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-panel border border-line rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-line bg-bg/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0 ${
                isDuty
                  ? "bg-gradient-to-tr from-blue to-blue-dark"
                  : "bg-gradient-to-tr from-green to-green-dark"
              }`}
            >
              {isDuty ? (
                <Calculator className="w-5 h-5" />
              ) : (
                <Ship className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-ink bg-bg px-2 py-0.5 rounded-md border border-line">
                  {record.id}
                </span>
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isDuty
                      ? "bg-blue-dim text-blue border border-blue/20"
                      : "bg-green-dim text-green border border-green/20"
                  }`}
                >
                  {isDuty ? "Statutory Duty" : "Landed Cost"}
                </span>
                <ProvenanceBadge type={record.provenance_type} compact />
              </div>
              <h3 className="text-sm font-bold text-ink mt-0.5 line-clamp-1">
                {record.commodity_name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-line/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. HS Code */}
            <div className="p-3 rounded-2xl bg-bg/50 border border-line/80 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1">
                <Hash className="w-3 h-3 text-blue" />
                <span>HS Code</span>
              </span>
              <span className="font-mono text-xs font-bold text-blue block truncate">
                {record.hs_code}
              </span>
            </div>

            {/* 2. Corridor */}
            <div className="p-3 rounded-2xl bg-bg/50 border border-line/80 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-green" />
                <span>Trade Route</span>
              </span>
              <div className="text-xs font-bold text-ink flex items-center gap-1 truncate">
                <span>{record.country_of_origin}</span>
                <span className="text-muted font-normal">&rarr;</span>
                <span>IN</span>
              </div>
            </div>

            {/* 3. Batch / Quantity */}
            <div className="p-3 rounded-2xl bg-bg/50 border border-line/80 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber" />
                <span>Batch Volume</span>
              </span>
              <span className="text-xs font-bold text-ink block truncate">
                {record.quantity ? `${record.quantity.toLocaleString()} ${record.unit || ""}` : "Standard MT"}
              </span>
            </div>

            {/* 4. Timestamp */}
            <div className="p-3 rounded-2xl bg-bg/50 border border-line/80 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500" />
                <span>Recorded</span>
              </span>
              <span className="text-xs font-semibold text-ink block truncate">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Key Outlay Summary Banner (Fintech SaaS Style) */}
          <div className="p-5 rounded-2xl bg-navy text-white flex flex-wrap items-center justify-between gap-5 border border-[#233558] shadow-sm relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-200 font-semibold block">
                Total Financial Outlay (Statutory Basis)
              </span>
              <div className="text-2xl font-bold tracking-tight text-white font-sans">
                ₹{record.total_outlay_inr.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-blue-200/90 font-mono">
                ${record.total_outlay_usd.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}{" "}
                USD
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 relative z-10 sm:border-l sm:border-[#233558] sm:pl-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-200 font-semibold block">
                {record.key_metric_label}
              </span>
              <div className="text-xl font-bold text-emerald-400 font-sans tracking-tight">
                {record.key_metric_value}
              </div>
              <span className="text-[11px] text-blue-200/80 block">
                Verified CBIC Gazette Rate
              </span>
            </div>

            {/* Subtle background gradient glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue/15 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Detailed Statutory Breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue" />
                <span>Statutory Compliance Breakdown</span>
              </h4>
              <span className="text-[10px] font-mono text-muted">
                {formattedDate} &bull; {formattedTime}
              </span>
            </div>

            <div className="rounded-2xl border border-line bg-bg/40 divide-y divide-line/70 overflow-hidden text-xs">
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-muted font-medium">Tariff Classification</span>
                <span className="font-semibold text-ink text-left sm:text-right max-w-sm">
                  {record.hs_description}
                </span>
              </div>

              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-muted font-medium">Trade Agreement Basis</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-dim text-blue border border-blue/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{record.trade_agreement || "Standard MFN Statutory Tariff"}</span>
                </span>
              </div>

              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-muted font-medium">Delivery Destination Port</span>
                <span className="font-semibold text-ink flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted" />
                  <span>{record.destination}</span>
                </span>
              </div>

              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-muted font-medium">Audited Dataset Version</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green">
                  <Database className="w-3.5 h-3.5" />
                  <span>CBIC Tariff Gazette v2026.03.1</span>
                </span>
              </div>
            </div>

            {/* Audit Tags */}
            {record.tags && record.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted font-medium mr-1">Audit Tags:</span>
                {record.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-panel border border-line text-[11px] font-medium text-ink shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-bg/50 border-t border-line flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-panel hover:bg-bg text-xs font-semibold text-ink transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-muted" />
              <span>Print Audit Copy</span>
            </button>

            <button
              type="button"
              onClick={handleApplyToContext}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all text-xs font-semibold cursor-pointer shadow-2xs ${
                contextLoaded
                  ? "bg-green text-white border-green"
                  : "border-line bg-panel hover:bg-bg text-ink"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  contextLoaded ? "text-white" : "text-green"
                }`}
              />
              <span>
                {contextLoaded ? "Context Activated!" : "Load into Active Context"}
              </span>
            </button>
          </div>

          <Link
            href={
              isDuty
                ? `/duty?calculation_id=${record.id}`
                : `/landed-cost?calculation_id=${record.id}`
            }
            onClick={onClose}
            className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs hover:shadow-md transition-all ${
              isDuty
                ? "bg-blue hover:bg-blue-dark"
                : "bg-green hover:bg-green-dark"
            }`}
          >
            <span>Open in Full {isDuty ? "Duty Engine" : "Landed Cost Engine"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

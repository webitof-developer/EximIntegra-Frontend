"use client";

import React from "react";
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
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line bg-bg/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${
                isDuty ? "bg-blue" : "bg-green"
              }`}
            >
              {isDuty ? (
                <Calculator className="w-5 h-5" />
              ) : (
                <Ship className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-ink">
                  {record.id}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    isDuty
                      ? "bg-blue-dim text-blue border border-blue/20"
                      : "bg-green-dim text-green border border-green/20"
                  }`}
                >
                  {record.type.replace("_", " ")}
                </span>
                <ProvenanceBadge type={record.provenance_type} compact />
              </div>
              <p className="text-xs text-muted truncate max-w-md">
                {record.commodity_name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-xl bg-bg border border-line space-y-1">
              <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                <Hash className="w-3 h-3 text-blue" /> HS Code
              </span>
              <span className="font-mono text-xs font-bold text-ink block">
                {record.hs_code}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-bg border border-line space-y-1">
              <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-green" /> Origin / Dest
              </span>
              <span className="font-mono text-xs font-bold text-ink block truncate">
                {record.country_of_origin} &rarr; IN
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-bg border border-line space-y-1">
              <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber" /> Quantity
              </span>
              <span className="font-mono text-xs font-bold text-ink block">
                {record.quantity ? `${record.quantity} ${record.unit || ""}` : "Standard MT"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-bg border border-line space-y-1">
              <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-500" /> Recorded At
              </span>
              <span className="font-mono text-[11px] font-semibold text-ink block truncate">
                {new Date(record.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Key Outlay Summary Banner */}
          <div className="p-4 rounded-xl bg-navy text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#93C5FD] tracking-wider block font-semibold">
                Total Financial Outlay (Statutory Basis)
              </span>
              <div className="text-xl font-mono font-bold mt-0.5">
                ₹{record.total_outlay_inr.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </div>
              <span className="text-[11px] text-[#A5B4FC] font-mono">
                ${record.total_outlay_usd.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}{" "}
                USD equivalent @ official gazette exchange rate
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-[#93C5FD] tracking-wider block font-semibold">
                {record.key_metric_label}
              </span>
              <div className="text-lg font-mono font-bold text-green mt-0.5">
                {record.key_metric_value}
              </div>
              <span className="text-[10px] font-mono text-white/70">
                100% Reproducible
              </span>
            </div>
          </div>

          {/* Detailed Breakdown Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-ink tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue" />
              <span>Statutory Breakdown & Reproducibility Audit</span>
            </h4>

            <div className="p-3.5 rounded-xl bg-bg border border-line space-y-2">
              <div className="flex justify-between py-1 border-b border-line text-xs">
                <span className="text-muted">Tariff Classification:</span>
                <span className="font-semibold text-ink text-right">
                  {record.hs_description}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-line text-xs">
                <span className="text-muted">Trade Agreement Basis:</span>
                <span className="font-mono text-xs font-bold text-blue">
                  {record.trade_agreement || "Standard MFN Statutory Tariff"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-line text-xs">
                <span className="text-muted">Delivery Destination Port:</span>
                <span className="font-semibold text-ink">{record.destination}</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="text-muted">Audited Dataset Version:</span>
                <span className="font-mono text-xs font-bold text-green">
                  CBIC Tariff Gazette v2026.03.1
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted font-mono mr-1">Audit Tags:</span>
              {record.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-panel border border-line text-[10px] font-mono text-ink"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-bg/80 border-t border-line flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-panel hover:bg-bg text-xs font-semibold text-ink transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-muted" />
              <span>Print Audit Copy</span>
            </button>
            <button
              type="button"
              onClick={handleApplyToContext}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-panel hover:bg-bg text-xs font-semibold text-ink transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-green" />
              <span>Load into Active Context</span>
            </button>
          </div>

          <Link
            href={
              isDuty
                ? `/duty?calculation_id=${record.id}`
                : `/landed-cost?calculation_id=${record.id}`
            }
            onClick={onClose}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors ${
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

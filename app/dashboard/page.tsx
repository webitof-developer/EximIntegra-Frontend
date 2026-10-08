"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppSelector } from "@/store";
import {
  Card,
  WidgetTile,
  StatusPill,
  ProvenanceBadge,
  IconTile,
} from "@/components/ui";
import {
  Search,
  Calculator,
  Ship,
  FileCheck,
  Scale,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Layers,
} from "lucide-react";
import { formatCurrency, formatHsCode, formatPercent } from "@/lib/formatters";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const currentContext = useAppSelector((state) => state.context.current);

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-7 pb-16">
          {/* Welcome Banner */}
          <div className="p-6 bg-navy text-white rounded-xl shadow-xs border border-[#1B2A4A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue text-white uppercase tracking-wider font-semibold">
                  {user?.tier || "ENTERPRISE"} TIER
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Welcome, {user?.name || "Trade Officer"}
              </h2>
              <p className="text-xs text-[#9EB1D0] max-w-2xl leading-relaxed">
                {user?.company || "EximIntegra Enterprise"} &bull; Customs Tariff Act 2026, DGFT notifications, and duty engine online.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                href="/classify"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Classify New Material</span>
              </Link>
              <Link
                href="/akshara"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy-active hover:bg-[#23355D] text-white border border-[#2B406B] text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#93C5FD]" />
                <span>Ask Akshara</span>
              </Link>
            </div>
          </div>

          {/* Active Cross-Page Material Context Summary */}
          {currentContext.hsCode && (
            <Card
              title={
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-ink">
                    Active Commodity Context
                  </span>
                  <ProvenanceBadge type="LIVE" source="Active Session" compact />
                </div>
              }
              subtitle="Synchronized across Classification, Duty Calculator, and Landed Cost engines."
              action={
                <Link
                  href="/duty"
                  className="text-xs text-blue font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Compute Duty</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 font-mono text-xs">
                <div className="p-3 rounded-lg bg-bg border border-line">
                  <span className="text-[10px] text-muted uppercase block">
                    HS Code
                  </span>
                  <span className="text-sm font-bold text-ink">
                    {formatHsCode(currentContext.hsCode)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-bg border border-line col-span-2">
                  <span className="text-[10px] text-muted uppercase block">
                    Commodity
                  </span>
                  <span className="text-xs font-sans font-medium text-ink truncate block">
                    {currentContext.materialName}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-bg border border-line">
                  <span className="text-[10px] text-muted uppercase block">
                    Origin / Dest
                  </span>
                  <span className="text-xs font-bold text-ink">
                    {currentContext.countryOfOrigin} &rarr; {currentContext.destinationCountry}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-bg border border-line">
                  <span className="text-[10px] text-muted uppercase block">
                    Invoice Value
                  </span>
                  <span className="text-xs font-bold text-ink">
                    {formatCurrency(currentContext.assessableValue, currentContext.currency || "USD")}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-bg border border-line">
                  <span className="text-[10px] text-muted uppercase block">
                    Batch Quantity
                  </span>
                  <span className="text-xs font-bold text-ink">
                    {currentContext.quantity} {currentContext.unit}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Core Modules Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
                Trade Engine Modules
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <WidgetTile
                title="HS Classification Engine"
                description="Determine statutory 8-digit tariff items with confidence and GIR reasoning."
                glyph="HS"
                iconVariant="blue"
                metric="Single & Bulk"
                metricLabel="Classification Mode"
                badge={<StatusPill label="LIVE" variant="success" />}
                href="/classify"
              />

              <WidgetTile
                title="Statutory Duty Calculator"
                description="Assessable value, BCD, SWS, IGST, and AIDC with per-duty provenance."
                glyph="%"
                iconVariant="green"
                metric="FTA Engine"
                metricLabel="Concession Matrix"
                badge={<StatusPill label="LIVE" variant="success" />}
                href="/duty"
              />

              <WidgetTile
                title="Landed Cost & Metal Recovery"
                description="End-to-end landed cost modeling with port handling and recoverable yield."
                glyph="$"
                iconVariant="amber"
                metric="Yield Matrix"
                metricLabel="Smelter Valuation"
                badge={<StatusPill label="LIVE" variant="success" />}
                href="/landed-cost"
              />

              <WidgetTile
                title="Scheme & FTA Eligibility"
                description="Check preferential rates under CEPA, ECTA, and export benefit schemes."
                glyph="FTA"
                iconVariant="navy"
                metric="Rules of Origin"
                metricLabel="Verification"
                badge={<StatusPill label="LIVE" variant="success" />}
                href="/eligibility"
              />

              <WidgetTile
                title="Country-of-Origin Arbitrage"
                description="Multi-country tariff comparison matrix for alternative sourcing jurisdictions."
                icon={<Scale className="w-5 h-5 text-[#93C5FD]" />}
                iconVariant="navy"
                metric="Side-by-Side"
                metricLabel="Arbitrage Engine"
                badge={<StatusPill label="LIVE" variant="success" />}
                href="/compare"
              />

              <WidgetTile
                title="Akshara AI Copilot"
                description="Conversational advisory with transparent statutory citations."
                icon={<Sparkles className="w-5 h-5 text-blue" />}
                iconVariant="blue"
                metric="Grounded"
                metricLabel="Transparency Log"
                badge={<StatusPill label="AI" variant="primary" />}
                href="/akshara"
              />
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

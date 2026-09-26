"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Card,
  Tabs,
  IconTile,
  StatusPill,
  ProvenanceBadge,
  StepBadge,
  WidgetTile,
} from "@/components/ui";
import {
  Calculator,
  Ship,
  Search,
  Sparkles,
  Scale,
  ShieldCheck,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatHsCode, formatPercent } from "@/lib/formatters";

export default function ComponentsShowcasePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Intro Banner */}
        <div className="p-6 bg-navy text-white rounded-xl shadow-xs border border-[#1B2A4A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue text-white uppercase tracking-wider font-semibold">
                Phase 0 Milestone
              </span>
              <h2 className="text-lg font-bold">
                EximIntegra Design System & Component Library
              </h2>
            </div>
            <p className="text-xs text-[#9EB1D0] max-w-2xl leading-relaxed">
              Extracted faithfully from the prototype. Every component below is
              built once and reused across all subsequent phases (Classification,
              Duty, Landed Cost, Akshara, and Governance).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ProvenanceBadge type="LIVE" source="Theme Config v1.0" />
            <StatusPill label="PHASE 0 DONE" variant="success" dot />
          </div>
        </div>

        {/* Section 1: Color Tokens & Provenance Semantics */}
        <Card
          title="2.1 Color Tokens & Provenance Semantics"
          subtitle="Direct mapping from prototype CSS to Tailwind theme tokens, with legal liability posture."
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-lg bg-navy text-white border border-[#24355A]">
              <div className="w-6 h-6 rounded bg-[#0F1B33] border border-white/20 mb-2" />
              <div className="text-xs font-bold font-mono">navy</div>
              <div className="text-[10px] opacity-75 font-mono">#0F1B33</div>
              <div className="text-[10px] text-[#8EA0C0] mt-1">Sidebar background</div>
            </div>

            <div className="p-4 rounded-lg bg-bg border border-line">
              <div className="w-6 h-6 rounded bg-[#F4F6FA] border border-line mb-2" />
              <div className="text-xs font-bold font-mono text-ink">bg</div>
              <div className="text-[10px] text-muted font-mono">#F4F6FA</div>
              <div className="text-[10px] text-muted mt-1">Page canvas</div>
            </div>

            <div className="p-4 rounded-lg bg-panel border border-line shadow-xs">
              <div className="w-6 h-6 rounded bg-white border border-line mb-2" />
              <div className="text-xs font-bold font-mono text-ink">panel</div>
              <div className="text-[10px] text-muted font-mono">#FFFFFF</div>
              <div className="text-[10px] text-muted mt-1">Card / Surface</div>
            </div>

            <div className="p-4 rounded-lg bg-blue-dim text-blue border border-blue/20">
              <div className="w-6 h-6 rounded bg-blue text-white mb-2" />
              <div className="text-xs font-bold font-mono">blue / BYOK</div>
              <div className="text-[10px] opacity-80 font-mono">#2563EB</div>
              <div className="text-[10px] mt-1">Primary accent</div>
            </div>

            <div className="p-4 rounded-lg bg-green-dim text-green border border-green/20">
              <div className="w-6 h-6 rounded bg-green text-white mb-2" />
              <div className="text-xs font-bold font-mono">green / LIVE</div>
              <div className="text-[10px] opacity-80 font-mono">#16A34A</div>
              <div className="text-[10px] mt-1">Statutory official</div>
            </div>

            <div className="p-4 rounded-lg bg-amber-dim text-amber border border-amber/20">
              <div className="w-6 h-6 rounded bg-amber text-white mb-2" />
              <div className="text-xs font-bold font-mono">amber / ILLUS</div>
              <div className="text-[10px] opacity-80 font-mono">#B45309</div>
              <div className="text-[10px] mt-1">Benchmark / Indicative</div>
            </div>
          </div>
        </Card>

        {/* Section 2: Typography Distinction */}
        <Card
          title="2.2 Typography Separation"
          subtitle="Inter for clean, legible UI prose vs. IBM Plex Mono for exact numerical tariff and HS figures."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-bg border border-line space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Body UI Font (Inter)
                </span>
                <span className="text-[10px] font-mono bg-line px-1.5 py-0.5 rounded text-ink">
                  font-sans
                </span>
              </div>
              <p className="text-sm text-ink leading-relaxed font-sans">
                &ldquo;Where goods are prima facie classifiable under two or more
                headings, classification shall be effected according to General Rule
                of Interpretation 3(a): the heading which provides the most specific
                description shall be preferred.&rdquo;
              </p>
              <div className="text-xs text-muted">
                Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
              </div>
            </div>

            <div className="p-4 rounded-lg bg-bg border border-line space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Data & Figures (IBM Plex Mono)
                </span>
                <span className="text-[10px] font-mono bg-blue-dim text-blue px-1.5 py-0.5 rounded">
                  font-data
                </span>
              </div>
              <div className="space-y-1.5 font-data text-xs">
                <div className="flex justify-between py-1 border-b border-line/60">
                  <span className="text-muted">HS Code:</span>
                  <span className="font-bold text-ink">{formatHsCode("72044900")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60">
                  <span className="text-muted">BCD Rate:</span>
                  <span className="font-semibold text-green">{formatPercent(2.5)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60">
                  <span className="text-muted">Assessable Value:</span>
                  <span className="font-semibold text-ink">{formatCurrency(3524800, "INR")}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Recoverable Fe:</span>
                  <span className="font-semibold text-blue">94.20%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Provenance Badges (Critical §8 requirement) */}
        <Card
          title="2.4 / §8 Data Provenance Badges"
          subtitle="Visually distinguishing LIVE government tariffs from ILLUSTRATIVE estimates and BYOK sources."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <ProvenanceBadge
                type="LIVE"
                source="CBIC ICEGATE"
                effectiveDate="2026-03-01"
                confidenceScore={0.98}
              />
              <ProvenanceBadge
                type="ILLUSTRATIVE"
                source="Industry Benchmark"
                confidenceScore={0.78}
              />
              <ProvenanceBadge
                type="BYOK"
                source="Platts Metal API"
              />
              <ProvenanceBadge
                type="UNAVAILABLE"
                source="DGFT Notification Service"
              />
            </div>

            <div className="p-4 rounded-lg bg-amber-dim/50 border border-amber/30 text-xs text-amber leading-relaxed">
              <span className="font-bold uppercase tracking-wider block mb-1">
                Legal Notice & Liability Architecture
              </span>
              Illustrative figures render in amber with distinct badge semantics.
              Color is never used alone — screen readers receive ARIA roles and labels,
              while hover reveals source timestamps and confidence scores.
            </div>
          </div>
        </Card>

        {/* Section 4: UI Primitives (Card, Tabs, IconTile, StatusPill, StepBadge) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card & Tabs Demo */}
          <Card
            title="Tabs & Segmented Control"
            subtitle="Pill-style segmented control used in single vs bulk modes."
          >
            <div className="space-y-4">
              <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={[
                  { id: "overview", label: "Single Lookup", badge: "Live" },
                  { id: "bulk", label: "Bulk Batch CSV", badge: 42 },
                  { id: "gir", label: "GIR Reasoning" },
                  { id: "disabled", label: "Restricted", disabled: true },
                ]}
              />

              <div className="p-4 rounded-lg bg-bg border border-line text-xs text-muted">
                Active tab: <span className="font-mono font-bold text-ink">{activeTab}</span>
              </div>
            </div>
          </Card>

          {/* IconTile System */}
          <Card
            title="IconTile Glyphs & Glyphs-to-Lucide"
            subtitle="Small 36-40px colored squares holding text glyphs or icons."
          >
            <div className="flex flex-wrap items-center gap-3">
              <IconTile glyph="HS" variant="blue" />
              <IconTile glyph="%" variant="green" />
              <IconTile glyph="$" variant="amber" />
              <IconTile glyph="FTA" variant="navy" />
              <IconTile glyph="AI" variant="blue" />
              <IconTile icon={<Calculator className="w-5 h-5" />} variant="green" />
              <IconTile icon={<Ship className="w-5 h-5" />} variant="amber" />
              <IconTile icon={<Scale className="w-5 h-5" />} variant="navy" />
              <IconTile icon={<Sparkles className="w-5 h-5" />} variant="blue" />
            </div>
          </Card>

          {/* StatusPills */}
          <Card
            title="StatusPills & Badges"
            subtitle="Nav SOON indicators and workflow statuses."
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusPill label="LIVE" variant="success" dot />
              <StatusPill label="SOON" variant="muted" />
              <StatusPill label="BETA" variant="primary" />
              <StatusPill label="ATTENTION" variant="warning" dot />
              <StatusPill label="DEGRADED" variant="danger" dot />
              <StatusPill label="NEUTRAL" variant="neutral" />
            </div>
          </Card>

          {/* StepBadge Multi-step indicator */}
          <Card
            title="StepBadge Workflow Indicator"
            subtitle="Used across Classify → Duty → Landed Cost sequential pipeline."
          >
            <div className="flex items-center gap-2 overflow-x-auto py-2">
              <StepBadge
                step={1}
                label="Classify"
                description="HS 7204.49"
                state="completed"
              />
              <StepBadge
                step={2}
                label="Duty Calc"
                description="BCD 2.5%"
                state="current"
              />
              <StepBadge
                step={3}
                label="Landed Cost"
                description="Contained Fe"
                state="pending"
                isLast
              />
            </div>
          </Card>
        </div>

        {/* Section 5: WidgetTiles / SectionCard Responsive Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">
              2.4 WidgetTile & SectionCard Dashboard Grid
            </h3>
            <span className="text-xs text-muted">2-column and 3-column responsive grid</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <WidgetTile
              title="HS Classification Engine"
              description="Identify statutory 8-digit tariff items using machine learning and GIR notes."
              glyph="HS"
              iconVariant="blue"
              metric="42,910"
              metricLabel="CBIC Tariff Entries"
              badge={<StatusPill label="LIVE" variant="success" dot />}
              href="/classify"
            />

            <WidgetTile
              title="Statutory Duty Calculator"
              description="Instant compute for Assessable Value, BCD, SWS, IGST, and AIDC under FTA rules."
              glyph="%"
              iconVariant="green"
              metric="16 FTAs"
              metricLabel="Supported Agreements"
              badge={<StatusPill label="READY" variant="primary" />}
              href="/duty"
            />

            <WidgetTile
              title="Landed Cost & Metal Recovery"
              description="Full landed cost with container ocean freight, CHA, demurrage, and yield."
              glyph="$"
              iconVariant="amber"
              metric="USD & INR"
              metricLabel="Dual-Currency Output"
              badge={<ProvenanceBadge type="LIVE" compact />}
              href="/landed-cost"
            />

            <WidgetTile
              title="Akshara AI Advisory"
              description="Conversational intelligence with citations, statutory rulings, and transparent logs."
              icon={<Sparkles className="w-5 h-5 text-blue" />}
              iconVariant="blue"
              metric="Grounded"
              metricLabel="Audit Trail Logged"
              badge={<StatusPill label="BETA" variant="primary" />}
              href="/akshara"
            />

            <WidgetTile
              title="Country-of-Origin Arbitrage"
              description="Side-by-side sourcing cost comparisons across alternative export jurisdictions."
              icon={<Scale className="w-5 h-5 text-[#93C5FD]" />}
              iconVariant="navy"
              metric="Multi-Country"
              metricLabel="Comparative Matrix"
              href="/compare"
            />

            <WidgetTile
              title="Global Shipment Intelligence"
              description="Customs bill-of-lading shipment intelligence and counterparty trade records."
              icon={<TrendingUp className="w-5 h-5" />}
              iconVariant="neutral"
              disabled
              badge={<StatusPill label="SOON" variant="muted" />}
              metric="v2 Scope"
              metricLabel="Target Module"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

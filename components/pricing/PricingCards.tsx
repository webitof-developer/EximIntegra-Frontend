"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { useGetPricingPlansQuery } from "@/store/adminApi";
import { TierBadge } from "@/components/saas/TierBadge";

export type BillingCycle = "monthly" | "annual";
export type CurrencyMode = "INR" | "USD";
export type PresentationMode = "spotlight" | "grid";

interface PricingPlan {
  id: string;
  name: string;
  badge?: string | null;
  tierBadge?: string;
  isActive?: boolean;
  isPopular?: boolean;
  tagline: string;
  priceMonthlyInr: number;
  priceAnnualInr: number;
  priceMonthlyUsd: number;
  priceAnnualUsd: number;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  planType?: "subscription" | "trial";
  isDefaultTrial?: boolean;
  trialDays?: number;
}

const fallbackPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tierBadge: "STARTER",
    tagline: "For individual importers, traders & small customs agencies.",
    priceMonthlyInr: 7999,
    priceAnnualInr: 6399,
    priceMonthlyUsd: 99,
    priceAnnualUsd: 79,
    features: [
      "100 HS Classifications per month",
      "Statutory Duty Calculator (BCD, SWS, IGST)",
      "CBIC Gazette Daily Exchange Rates",
      "Single material landed cost estimates",
      "Standard email & documentation support",
      "1 User Seat included",
    ],
    ctaLabel: "Start 14-Day Free Trial",
    ctaHref: "/register?plan=starter",
  },
  {
    id: "professional",
    name: "Professional",
    tierBadge: "PROFESSIONAL",
    badge: "MOST POPULAR",
    isPopular: true,
    tagline: "For expanding exim trading houses, brokers & manufacturers.",
    priceMonthlyInr: 24999,
    priceAnnualInr: 19999,
    priceMonthlyUsd: 299,
    priceAnnualUsd: 239,
    features: [
      "Unlimited HS Classifications with GIR 1–6 trails",
      "Bulk CSV batch manifest processor (up to 500 items)",
      "Statutory Customs Duty & Preferential FTA Matrix",
      "End-to-end Landed Cost & Port CFS Logistics (JNPT / Mundra)",
      "Smelter recovery yield & molten MT valuation engine",
      "Country-of-origin sourcing arbitrage comparison",
      "Exportable calculation audit reports",
      "Priority email & chat support",
      "Up to 5 Team Workspace Seats",
    ],
    ctaLabel: "Start 14-Day Free Trial",
    ctaHref: "/register?plan=professional",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tierBadge: "ENTERPRISE",
    badge: "FULL PLATFORM",
    tagline: "For large multinational corporations, smelters & supply chains.",
    priceMonthlyInr: 74999,
    priceAnnualInr: 59999,
    priceMonthlyUsd: 899,
    priceAnnualUsd: 719,
    features: [
      "Everything in Professional tier",
      "Akshara AI Trade Copilot with verifiable tool-call logs",
      "BYOK LLM Provider Integration (Claude, OpenAI, Gemini, vLLM)",
      "Custom carrier freight contract & smelter yield rate overrides",
      "Enterprise ERP Integration & Customs Compliance",
      "Developer Platform API Keys & ERP Webhooks (SAP, NetSuite)",
      "Permanent deterministic calculation reproducibility guarantee",
      "Multi-user Role-Based Access Control (RBAC)",
      "Dedicated Customs Compliance Account Manager & 99.9% SLA",
      "Unlimited Team Workspace Seats",
    ],
    ctaLabel: "Get Enterprise Access",
    ctaHref: "/register?plan=enterprise",
  },
];

export function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [currency, setCurrency] = useState<CurrencyMode>("INR");
  const [presentationMode, setPresentationMode] =
    useState<PresentationMode>("spotlight");

  const { data: pricingData } = useGetPricingPlansQuery();
  const trialDays = pricingData?.trialDays ?? 14;
  const rawPlans =
    pricingData?.plans && pricingData.plans.length > 0
      ? pricingData.plans
      : fallbackPlans;
  const displayPlans = useMemo(
    () => rawPlans.filter((p) => p.isActive !== false && p.planType !== "trial"),
    [rawPlans]
  );

  // Default active card: prefer the popular plan or middle plan
  const defaultIndex = useMemo(() => {
    const popIdx = displayPlans.findIndex((p) => p.isPopular);
    if (popIdx >= 0) return popIdx;
    return Math.floor(displayPlans.length / 2);
  }, [displayPlans]);

  const [activeIndex, setActiveIndex] = useState<number>(defaultIndex);

  // Re-sync active index when plans list updates
  useEffect(() => {
    if (activeIndex >= displayPlans.length) {
      setActiveIndex(Math.max(0, displayPlans.length - 1));
    }
  }, [displayPlans.length, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayPlans.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < displayPlans.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (presentationMode !== "spotlight") return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presentationMode, displayPlans.length]);

  // Touch swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const isAnnual = billingCycle === "annual";
  const currencySymbol = currency === "INR" ? "₹" : "$";

  return (
    <div className="space-y-8 select-none">
      {/* Toggles & Switchers Bar */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 flex-wrap">
        {/* Billing Cycle Switcher */}
        <div className="p-1 bg-panel border border-line rounded-xl flex items-center shadow-xs">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-blue-dim text-blue shadow-2xs font-bold"
                : "text-muted hover:text-ink"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === "annual"
                ? "bg-blue-dim text-blue shadow-2xs font-bold"
                : "text-muted hover:text-ink"
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-green text-white">
              SAVE 20%
            </span>
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="p-1 bg-panel border border-line rounded-xl flex items-center shadow-xs">
          <button
            type="button"
            onClick={() => setCurrency("INR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              currency === "INR"
                ? "bg-bg text-ink shadow-2xs font-bold border border-line"
                : "text-muted hover:text-ink"
            }`}
          >
            ₹ INR (India)
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              currency === "USD"
                ? "bg-bg text-ink shadow-2xs font-bold border border-line"
                : "text-muted hover:text-ink"
            }`}
          >
            $ USD (Global)
          </button>
        </div>

        {/* Presentation Mode: 3D Spotlight Stage vs Grid Comparison */}
        <div className="p-1 bg-panel border border-line rounded-xl flex items-center shadow-xs">
          <button
            type="button"
            onClick={() => setPresentationMode("spotlight")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              presentationMode === "spotlight"
                ? "bg-blue text-white shadow-2xs font-bold"
                : "text-muted hover:text-ink"
            }`}
            title="Horizontal animated carousel focusing one plan in center"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Spotlight 3D</span>
          </button>
          <button
            type="button"
            onClick={() => setPresentationMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              presentationMode === "grid"
                ? "bg-blue text-white shadow-2xs font-bold"
                : "text-muted hover:text-ink"
            }`}
            title="View all plans side by side in a grid"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Compare Grid</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE A: 3D SPOTLIGHT STAGE (CENTER FOCUSED HORIZONTAL ANIMATION) */}
      {/* ========================================================================= */}
      {presentationMode === "spotlight" ? (
        <div className="space-y-6">
          {/* Main 3D Stage Viewport */}
          <div
            className="relative w-full max-w-6xl mx-auto min-h-[670px] sm:min-h-[710px] flex items-center justify-center overflow-hidden sm:overflow-visible py-4 px-2"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Floating Nav Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-panel/95 backdrop-blur-md border border-line text-ink hover:text-blue hover:border-blue shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center group active:scale-95"
              aria-label="Previous plan"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Right Floating Nav Button */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-panel/95 backdrop-blur-md border border-line text-ink hover:text-blue hover:border-blue shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center group active:scale-95"
              aria-label="Next plan"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Stacked Animated Cards */}
            <div className="relative w-full h-[620px] sm:h-[660px] flex items-center justify-center">
              {displayPlans.map((p, index) => {
                const offset = index - activeIndex;
                const isCenter = offset === 0;
                const isLeft = offset < 0;
                const absOffset = Math.abs(offset);

                const price =
                  currency === "INR"
                    ? isAnnual
                      ? p.priceAnnualInr
                      : p.priceMonthlyInr
                    : isAnnual
                    ? p.priceAnnualUsd
                    : p.priceMonthlyUsd;

                // Positioning & Styling based on horizontal offset
                let transformStyle = "";
                let zIndex = 10;
                let opacity = "opacity-100";
                let cursorStyle = "cursor-default";
                let scaleClass = "scale-100";
                let filterClass = "";

                if (isCenter) {
                  // Focused Card in Center
                  zIndex = 30;
                  scaleClass = "scale-100 sm:scale-105";
                  opacity = "opacity-100";
                  transformStyle = "translate-x-0 translate-y-0";
                  cursorStyle = "cursor-default pointer-events-auto";
                } else if (absOffset === 1) {
                  // Direct Flanking Cards in Background
                  zIndex = 20;
                  scaleClass = "scale-[0.88]";
                  opacity =
                    "opacity-55 hover:opacity-85 transition-opacity";
                  filterClass = "blur-[0.3px] hover:blur-none";
                  cursorStyle = "cursor-pointer pointer-events-auto";
                  transformStyle = isLeft
                    ? "-translate-x-[48%] sm:-translate-x-[62%] lg:-translate-x-[72%]"
                    : "translate-x-[48%] sm:translate-x-[62%] lg:translate-x-[72%]";
                } else if (absOffset === 2) {
                  // Second-tier Flanking Cards further back
                  zIndex = 10;
                  scaleClass = "scale-[0.76]";
                  opacity = "opacity-25 hover:opacity-50 hidden md:block";
                  cursorStyle = "cursor-pointer pointer-events-auto";
                  transformStyle = isLeft
                    ? "-translate-x-[85%] lg:-translate-x-[115%]"
                    : "translate-x-[85%] lg:translate-x-[115%]";
                } else {
                  // Out of view
                  zIndex = 0;
                  scaleClass = "scale-[0.6]";
                  opacity = "opacity-0 pointer-events-none";
                  transformStyle = isLeft
                    ? "-translate-x-[180%]"
                    : "translate-x-[180%]";
                }

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!isCenter) setActiveIndex(index);
                    }}
                    style={{
                      zIndex,
                    }}
                    className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[320px] sm:w-[370px] transition-all duration-500 ease-out ${scaleClass} ${opacity} ${filterClass} ${cursorStyle}`}
                  >
                    <div
                      className={`relative transform ${transformStyle} transition-transform duration-500 ease-out`}
                    >
                      {/* Ambient Halo behind Center Card */}
                      {isCenter && (
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue/20 via-sky-400/25 to-blue/20 rounded-3xl blur-xl -z-10 animate-pulse pointer-events-none" />
                      )}

                      {/* Card Shell */}
                      <div
                        className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between space-y-6 transition-all duration-300 relative ${
                          isCenter
                            ? "bg-panel border-blue shadow-2xl ring-2 ring-blue/25"
                            : "bg-panel/90 border-line shadow-md hover:border-line-hover"
                        }`}
                      >
                        {/* Popular / Feature Badge */}
                        {p.badge && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                            <span
                              className={`px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase shadow-md whitespace-nowrap ${
                                p.isPopular
                                  ? "bg-blue text-white ring-2 ring-white"
                                  : "bg-navy text-[#93C5FD] border border-[#2A3E66]"
                              }`}
                            >
                              {p.badge}
                            </span>
                          </div>
                        )}

                        <div className="space-y-5">
                          {/* Plan Header */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-xl font-bold text-ink truncate">
                                {p.name}
                              </h3>
                              <TierBadge
                                tier={p.tierBadge || p.id}
                                size="xs"
                              />
                            </div>
                            <p className="text-xs text-muted leading-relaxed min-h-[36px]">
                              {p.tagline}
                            </p>
                          </div>

                          {/* Price Display */}
                          <div className="space-y-1 bg-bg/60 p-3 rounded-2xl border border-line/60">
                            <div className="flex items-baseline gap-1.5 font-data">
                              <span className="text-3xl sm:text-4xl font-extrabold text-ink font-mono tracking-tight">
                                {currencySymbol}
                                {price.toLocaleString()}
                              </span>
                              <span className="text-xs text-muted font-sans font-medium">
                                / month
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-muted block">
                              {isAnnual
                                ? "Billed annually (Save 20%)"
                                : "Billed monthly"}
                            </span>
                          </div>

                          {/* CTA Button */}
                          <Link
                            href={p.ctaHref}
                            onClick={(e) => {
                              if (!isCenter) {
                                e.preventDefault();
                                setActiveIndex(index);
                              }
                            }}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                              isCenter
                                ? p.isPopular
                                  ? "bg-blue hover:bg-blue-dark text-white font-bold shadow-md shadow-blue/20"
                                  : "bg-ink hover:bg-black text-white font-bold"
                                : "bg-bg hover:bg-line border border-line text-ink"
                            }`}
                          >
                            <span>
                              {isCenter
                                ? p.ctaLabel.replace(/14[-\s]day/gi, `${trialDays}-Day`)
                                : "Select & Focus"}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          {/* Features List */}
                          <div className="space-y-2.5 pt-3 border-t border-line">
                            <span className="text-[10px] font-mono uppercase font-bold text-muted tracking-wider block">
                              Included Capabilities:
                            </span>
                            <ul className="space-y-2 text-xs text-ink/90 max-h-[175px] overflow-y-auto scrollbar-none pr-1">
                              {p.features.map((feat, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2.5"
                                >
                                  <div className="w-4 h-4 rounded-full bg-blue-dim text-blue flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                  <span className="leading-snug text-[11px] sm:text-xs">
                                    {feat}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Card Footer Guarantee */}
                        <div className="pt-2.5 border-t border-line text-center">
                          <span className="text-[11px] text-muted font-mono flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-green" />
                            <span>{trialDays}-day free trial &bull; Cancel anytime</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Interactive Plan Selector Pills */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {displayPlans.map((p, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-blue text-white border-blue shadow-xs font-bold scale-105"
                        : "bg-panel border-line text-muted hover:text-ink hover:bg-bg"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-muted"
                      }`}
                    />
                    <span>{p.name}</span>
                    {p.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-blue-dim text-blue"
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] font-mono text-muted text-center">
              Click any card or use <kbd className="px-1.5 py-0.5 bg-panel border border-line rounded text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 bg-panel border border-line rounded text-[10px]">→</kbd> arrow keys to animate through plans
            </p>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE B: ALL PLANS COMPARISON GRID */
        /* ========================================================================= */
        <div
          className={`grid gap-8 items-stretch pt-4 ${
            displayPlans.length === 1
              ? "max-w-md mx-auto grid-cols-1"
              : displayPlans.length === 2
              ? "max-w-4xl mx-auto grid-cols-1 md:grid-cols-2"
              : displayPlans.length === 4
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {displayPlans.map((p) => {
            const price =
              currency === "INR"
                ? isAnnual
                  ? p.priceAnnualInr
                  : p.priceMonthlyInr
                : isAnnual
                ? p.priceAnnualUsd
                : p.priceMonthlyUsd;

            return (
              <div
                key={p.id}
                className={`p-7 rounded-3xl border transition-all flex flex-col justify-between space-y-7 relative ${
                  p.isPopular
                    ? "bg-panel border-blue shadow-md ring-2 ring-blue/20"
                    : "bg-panel border-line shadow-xs hover:border-line/80 hover:shadow-sm"
                }`}
              >
                {/* Popular Badge */}
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span
                      className={`px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase shadow-md whitespace-nowrap ${
                        p.isPopular
                          ? "bg-blue text-white ring-2 ring-white"
                          : "bg-navy text-[#93C5FD] border border-[#2A3E66]"
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-bold text-ink">{p.name}</h3>
                      <TierBadge tier={p.tierBadge || p.id} size="xs" />
                    </div>
                    <p className="text-xs text-muted leading-relaxed min-h-[36px]">
                      {p.tagline}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5 font-data">
                      <span className="text-3xl sm:text-4xl font-extrabold text-ink font-mono">
                        {currencySymbol}
                        {price.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted font-sans font-medium">
                        / month
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-muted block">
                      {isAnnual
                        ? "Billed annually (Save 20%)"
                        : "Billed monthly"}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={p.ctaHref}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                      p.isPopular
                        ? "bg-blue hover:bg-blue-dark text-white font-bold"
                        : "bg-bg hover:bg-line border border-line text-ink"
                    }`}
                  >
                    <span>{p.ctaLabel.replace(/14[-\s]day/gi, `${trialDays}-Day`)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* Features List */}
                  <div className="space-y-3 pt-4 border-t border-line">
                    <span className="text-[10px] font-mono uppercase font-bold text-muted tracking-wider block">
                      What&apos;s Included:
                    </span>
                    <ul className="space-y-2.5 text-xs text-ink/90">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-blue-dim text-blue flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer Guarantee */}
                <div className="pt-3 border-t border-line text-center">
                  <span className="text-[11px] text-muted font-mono flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-green" />
                    <span>{trialDays}-day free trial &bull; Cancel anytime</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

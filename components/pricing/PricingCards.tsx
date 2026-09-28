"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";

export type BillingCycle = "monthly" | "annual";
export type CurrencyMode = "INR" | "USD";

interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  isPopular?: boolean;
  tagline: string;
  priceMonthlyInr: number;
  priceAnnualInr: number;
  priceMonthlyUsd: number;
  priceAnnualUsd: number;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

const plans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
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
      "CBIC ICEGATE & DGFT Digital Token Gateways",
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

  return (
    <div className="space-y-10">
      {/* Toggles Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Billing Cycle Switcher */}
        <div className="p-1 bg-panel border border-line rounded-xl flex items-center shadow-xs">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === "annual"
                ? "bg-blue-dim text-blue shadow-2xs font-bold"
                : "text-muted hover:text-ink"
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-green text-white">
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
      </div>

      {/* 3 Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((p) => {
          const isAnnual = billingCycle === "annual";
          const price =
            currency === "INR"
              ? isAnnual
                ? p.priceAnnualInr
                : p.priceMonthlyInr
              : isAnnual
              ? p.priceAnnualUsd
              : p.priceMonthlyUsd;

          const currencySymbol = currency === "INR" ? "₹" : "$";

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
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs ${
                      p.isPopular
                        ? "bg-blue text-white"
                        : "bg-navy text-[#93C5FD] border border-blue/30"
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
              )}

              <div className="space-y-6">
                {/* Plan Header */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-ink">{p.name}</h3>
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
                    {isAnnual ? "Billed annually (Save 20%)" : "Billed monthly"}
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
                  <span>{p.ctaLabel}</span>
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
                  <span>14-day free trial &bull; Cancel anytime</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

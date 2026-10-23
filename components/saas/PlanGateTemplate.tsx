"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { setUserTier } from "@/store/authSlice";
import { useGetPricingPlansQuery } from "@/store/adminApi";
import { TierBadge, TierType } from "./TierBadge";
import {
  Lock,
  Crown,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";

interface PlanGateTemplateProps {
  requiredTier: string;
  featureName: string;
  description?: string;
  category?: string;
  pagePath?: string;
  fallbackMode?: "full" | "overlay" | "banner";
  onUpgradeSuccess?: () => void;
}

const defaultTierBenefits: Record<string, string[]> = {
  STARTER: [
    "100 automated HS code classifications per month",
    "Statutory Customs Duty & SWS/IGST calculation matrix",
    "Daily CBIC Gazette foreign exchange currency rates",
    "Single material landed cost & port logistics estimates",
    "Standard email support and statutory trade documentation",
  ],
  PROFESSIONAL: [
    "Unlimited automated HS code classifications",
    "Bulk CSV batch manifest processor (up to 500 items/batch)",
    "Cross-jurisdiction origin comparison (CEPA vs MFN vs AIFTA)",
    "End-to-end landed cost & ocean freight modeling",
    "Up to 5 team workspace seats with role permissions",
    "Direct CBIC & DGFT tariff synchronization alerts",
  ],
  ENTERPRISE: [
    "Akshara AI Trade Copilot with verifiable statutory citations",
    "Smelter yield economics & scrap metal recovery simulation",
    "BYOK (Bring Your Own Key) for private LLM inference & carrier EDI",
    "Dedicated auditor role & immutable calculation audit trails",
    "Custom tariff rules overrides & private ERP webhooks",
    "24/7 Priority SLA & statutory customs compliance advisory",
  ],
};

const defaultTierPrices: Record<string, { inr: string; usd: string }> = {
  STARTER: { inr: "₹7,999", usd: "$99" },
  PROFESSIONAL: { inr: "₹24,999", usd: "$299" },
  ENTERPRISE: { inr: "₹74,999", usd: "$899" },
};

export function PlanGateTemplate({
  requiredTier,
  featureName,
  description,
  category,
  pagePath,
  fallbackMode = "full",
  onUpgradeSuccess,
}: PlanGateTemplateProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const currentTier = (user?.tier || "STARTER") as TierType;
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and close on Escape when modal is open
  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  // Fetch live pricing plans from DB to show real dynamic benefits & prices
  const { data: pricingData } = useGetPricingPlansQuery();

  const normalizedRequiredTier = (requiredTier || "STARTER").toUpperCase();
  const isEnterprise = normalizedRequiredTier === "ENTERPRISE";
  const isProfessional = normalizedRequiredTier === "PROFESSIONAL";

  // Find matching dynamic plan from backend
  const matchedPlan = pricingData?.plans?.find(
    (p) =>
      p.id.toUpperCase() === normalizedRequiredTier ||
      (p.tierBadge && p.tierBadge.toUpperCase() === normalizedRequiredTier)
  );

  const activeBenefits =
    matchedPlan?.features && matchedPlan.features.length > 0
      ? matchedPlan.features
      : defaultTierBenefits[normalizedRequiredTier] ||
        defaultTierBenefits.PROFESSIONAL;

  const displayPrice = matchedPlan
    ? `₹${matchedPlan.priceMonthlyInr.toLocaleString("en-IN")}`
    : defaultTierPrices[normalizedRequiredTier]?.inr || "₹24,999";

  const handleSimulateUpgrade = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      dispatch(setUserTier(normalizedRequiredTier as TierType));
      setIsUpgrading(false);
      setIsModalOpen(false);
      if (onUpgradeSuccess) onUpgradeSuccess();
    }, 400);
  };

  // 1. Full-screen Modal portal (mounted directly to document.body to blur Sidebar, Topbar, and entire screen)
  function renderModal() {
    if (!isModalOpen || !mounted || typeof window === "undefined") return null;

    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-gate-modal-title"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-navy/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setIsModalOpen(false)}
      >
        <div
          className="relative w-full max-w-lg bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-6 animate-in zoom-in-95 duration-200 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow Accent Bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${
              isEnterprise
                ? "bg-gradient-to-r from-amber via-blue to-purple-500"
                : "bg-gradient-to-r from-blue via-teal-400 to-blue"
            }`}
          />

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-muted hover:text-ink p-1.5 rounded-lg hover:bg-bg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TierBadge tier={normalizedRequiredTier as TierType} size="sm" />
              <span className="text-[11px] font-mono text-muted uppercase tracking-wider font-semibold">
                Feature Locked on Current Plan
              </span>
            </div>

            <h3
              id="plan-gate-modal-title"
              className="text-xl font-bold text-ink flex items-center gap-2"
            >
              {isEnterprise ? (
                <Crown className="w-5 h-5 text-amber shrink-0" />
              ) : (
                <Zap className="w-5 h-5 text-blue shrink-0" />
              )}
              <span>Unlock {featureName}</span>
            </h3>

            <p className="text-xs text-muted leading-relaxed">
              {description ||
                `The ${featureName} engine is exclusively available on the ${
                  isEnterprise ? "Enterprise" : "Professional"
                } Tier. Upgrade your corporate plan to remove usage throttles and unlock high-throughput exim automation.`}
            </p>
          </div>

          {/* Key Features Included */}
          <div className="p-4 bg-bg border border-line rounded-xl space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted font-bold flex items-center justify-between">
              <span>What's included in {normalizedRequiredTier}:</span>
              <span className="text-green text-[10px] font-semibold">
                {isEnterprise ? "ENTERPRISE SUITE" : "PRO FEATURES"}
              </span>
            </div>

            <ul className="space-y-2">
              {activeBenefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="text-xs text-ink flex items-start gap-2 leading-tight"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Snapshot */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-panel border border-line/80">
            <div>
              <span className="text-[10px] font-mono uppercase text-muted block font-semibold">
                Investment
              </span>
              <span className="text-lg font-bold text-ink">
                {displayPrice}
                <span className="text-xs font-normal text-muted">/month</span>
              </span>
            </div>

            <Link
              href="/pricing"
              onClick={() => setIsModalOpen(false)}
              className="text-xs font-semibold text-blue hover:underline flex items-center gap-1"
            >
              <span>Compare All Plans</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSimulateUpgrade}
              disabled={isUpgrading}
              className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                isEnterprise
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-blue hover:bg-blue-dark text-white"
              } disabled:opacity-60`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isUpgrading
                  ? "Upgrading Plan..."
                  : `Upgrade to ${
                      normalizedRequiredTier === "ENTERPRISE"
                        ? "Enterprise"
                        : "Professional"
                    }`}
              </span>
            </button>

            <Link
              href="/pricing"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-bg transition-colors flex items-center justify-center text-center"
            >
              <span>View Pricing Page</span>
            </Link>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // 2. BANNER MODE (compact inline bar)
  if (fallbackMode === "banner") {
    return (
      <div className="p-4 bg-blue/5 border border-blue/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue/10 text-blue flex items-center justify-center shrink-0 border border-blue/20">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-ink flex items-center gap-2">
              <span>{featureName}</span>
              <TierBadge tier={normalizedRequiredTier as TierType} size="xs" />
            </div>
            <p className="text-[11px] text-muted">
              {description ||
                `Your current plan is ${currentTier}. This feature requires ${normalizedRequiredTier} plan subscription.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSimulateUpgrade}
            disabled={isUpgrading}
            className="px-3.5 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isUpgrading ? "Unlocking..." : `Unlock with ${normalizedRequiredTier}`}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-bg transition-colors cursor-pointer"
          >
            View Benefits
          </button>
        </div>

        {/* Full-screen Portal Modal */}
        {renderModal()}
      </div>
    );
  }

  // 3. FULL / OVERLAY MODE: Clean Compact Card (Image 1) with Full-screen Portal Modal (Image 2)
  return (
    <>
      {/* Clean Compact Locked Card matching Image 1 exactly */}
      <div className="bg-panel border border-line rounded-2xl shadow-xl p-7 sm:p-8 max-w-lg w-full text-center relative mx-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Sleek Blue Squircle Icon */}
        <div className="w-13 h-13 rounded-2xl bg-blue/10 border border-blue/20 text-blue flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Lock className="w-6 h-6 text-blue" />
        </div>

        {/* Tier Badge & Plan Gate label */}
        <div className="flex items-center justify-center gap-2 mb-2.5">
          <TierBadge tier={normalizedRequiredTier as TierType} size="sm" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
            PLAN GATE
          </span>
        </div>

        {/* Feature Lock Title */}
        <h3 className="text-base sm:text-lg font-bold text-ink mb-1.5">
          {featureName} is locked
        </h3>

        {/* Feature Description */}
        <p className="text-xs text-muted max-w-md mx-auto leading-relaxed mb-6">
          {description ||
            `Compare landed duty structures across multiple bilateral jurisdictions (USA MFN, UAE CEPA, Australia ECTA, ASEAN) in real-time.`}
        </p>

        {/* Two Action Buttons side-by-side */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSimulateUpgrade}
            disabled={isUpgrading}
            className="px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isUpgrading
                ? "Unlocking..."
                : `Unlock with ${normalizedRequiredTier}`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-bg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Benefits</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted" />
          </button>
        </div>
      </div>

      {/* Render Full-screen Plan Card Modal when View Benefits is clicked (covers entire screen including Sidebar and Topbar) */}
      {renderModal()}
    </>
  );
}

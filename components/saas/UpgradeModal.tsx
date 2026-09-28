"use client";

import React from "react";
import Link from "next/link";
import { useAppDispatch } from "@/store";
import { setUserTier } from "@/store/authSlice";
import { TierBadge, TierType } from "./TierBadge";
import {
  X,
  Crown,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredTier: "PROFESSIONAL" | "ENTERPRISE";
  description?: string;
  benefits?: string[];
}

const defaultTierBenefits: Record<"PROFESSIONAL" | "ENTERPRISE", string[]> = {
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

export function UpgradeModal({
  isOpen,
  onClose,
  featureName,
  requiredTier,
  description,
  benefits,
}: UpgradeModalProps) {
  const dispatch = useAppDispatch();

  if (!isOpen) return null;

  const activeBenefits = benefits || defaultTierBenefits[requiredTier];
  const isEnterprise = requiredTier === "ENTERPRISE";

  const handleSimulatedUpgrade = () => {
    dispatch(setUserTier(requiredTier));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isEnterprise
              ? "bg-gradient-to-r from-amber via-blue to-purple-500"
              : "bg-gradient-to-r from-blue via-teal-400 to-blue"
          }`}
        />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-ink p-1.5 rounded-lg hover:bg-bg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Content */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TierBadge tier={requiredTier} size="sm" />
            <span className="text-xs font-mono text-muted uppercase">
              Feature Locked on Current Plan
            </span>
          </div>

          <h3 className="text-xl font-bold text-ink flex items-center gap-2">
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
            <span>What's included in {requiredTier}:</span>
            <span className="text-green text-[10px]">Zero Overages</span>
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
            <span className="text-[10px] font-mono uppercase text-muted block">
              Investment
            </span>
            <span className="text-lg font-bold text-ink">
              {isEnterprise ? "₹74,999" : "₹24,999"}
              <span className="text-xs font-normal text-muted">/month</span>
            </span>
          </div>

          <Link
            href="/pricing"
            onClick={onClose}
            className="text-xs font-semibold text-blue hover:underline flex items-center gap-1"
          >
            Compare All Plans
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSimulatedUpgrade}
            className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
              isEnterprise
                ? "bg-amber hover:bg-amber-dark text-navy"
                : "bg-blue hover:bg-blue-dark text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Upgrade</span>
          </button>

          <Link
            href="/pricing"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-bg transition-colors text-center"
          >
            View Pricing Page
          </Link>
        </div>
      </div>
    </div>
  );
}

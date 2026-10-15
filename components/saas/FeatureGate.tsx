"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store";
import { TierBadge, TierType } from "./TierBadge";
import { UpgradeModal } from "./UpgradeModal";
import { Lock, Sparkles, ArrowRight } from "lucide-react";

interface FeatureGateProps {
  requiredTier: "PROFESSIONAL" | "ENTERPRISE";
  featureName: string;
  description?: string;
  children: React.ReactNode;
  fallbackMode?: "overlay" | "banner";
}

const tierWeights: Record<TierType, number> = {
  STARTER: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
};

export function FeatureGate({
  requiredTier,
  featureName,
  description,
  children,
  fallbackMode = "overlay",
}: FeatureGateProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const currentTier = (user?.tier || "STARTER") as TierType;
  const currentWeight = tierWeights[currentTier] || 1;
  const requiredWeight = tierWeights[requiredTier] || 2;

  const isUnlocked = currentWeight >= requiredWeight;

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden border border-line bg-panel">
        {fallbackMode === "overlay" ? (
          <>
            {/* Blurred background preview of the actual content */}
            <div className="filter blur-sm opacity-40 pointer-events-none select-none max-h-[460px] overflow-hidden">
              {children}
            </div>

            {/* Centered Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-navy/20 backdrop-blur-xs">
              <div className="max-w-md w-full p-6 rounded-2xl bg-panel/95 border border-line shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-xl bg-blue/10 border border-blue/20 text-blue flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-center gap-2">
                    <TierBadge tier={requiredTier} size="sm" />
                    <span className="text-[11px] font-mono uppercase text-muted">
                      Plan Gate
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-ink">
                    {featureName} is locked
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {description ||
                      `Upgrade to ${
                        requiredTier === "ENTERPRISE" ? "Enterprise" : "Professional"
                      } Tier to unlock ${featureName} and enhance your trade compliance.`}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Unlock with {requiredTier}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-bg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Benefits</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 bg-blue/5 border border-blue/20 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue/10 text-blue flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-ink flex items-center gap-2">
                  <span>{featureName}</span>
                  <TierBadge tier={requiredTier} size="xs" />
                </div>
                <p className="text-[11px] text-muted">
                  Requires {requiredTier} plan subscription.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-blue text-white text-xs font-semibold hover:bg-blue-dark transition-colors shrink-0"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureName={featureName}
        requiredTier={requiredTier}
        description={description}
      />
    </>
  );
}

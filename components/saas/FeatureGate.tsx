"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store";
import { TierBadge, TierType } from "./TierBadge";
import { PlanGateTemplate } from "./PlanGateTemplate";

interface FeatureGateProps {
  requiredTier: "STARTER" | "PROFESSIONAL" | "ENTERPRISE" | string;
  featureName: string;
  description?: string;
  children: React.ReactNode;
  fallbackMode?: "overlay" | "banner" | "full";
  category?: string;
}

const tierWeights: Record<string, number> = {
  ALL: 0,
  FREE: 0,
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
  category,
}: FeatureGateProps) {
  const user = useAppSelector((state) => state.auth.user);

  const currentTier = (user?.tier || "STARTER").toUpperCase();
  const reqTier = (requiredTier || "STARTER").toUpperCase();

  const currentWeight = tierWeights[currentTier] ?? 1;
  const requiredWeight = tierWeights[reqTier] ?? 2;

  const isUnlocked = user?.role === "ADMIN" || currentWeight >= requiredWeight;

  if (isUnlocked) {
    return <>{children}</>;
  }

  if (fallbackMode === "overlay") {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-line bg-panel">
        {/* Blurred background preview of the actual content */}
        <div className="filter blur-md opacity-30 pointer-events-none select-none max-h-[500px] overflow-hidden">
          {children}
        </div>

        {/* Centered Lock Overlay rendering the PlanGateTemplate */}
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-navy/30 backdrop-blur-xs overflow-y-auto">
          <PlanGateTemplate
            requiredTier={reqTier}
            featureName={featureName}
            description={description}
            category={category}
            fallbackMode="full"
          />
        </div>
      </div>
    );
  }

  return (
    <PlanGateTemplate
      requiredTier={reqTier}
      featureName={featureName}
      description={description}
      category={category}
      fallbackMode={fallbackMode}
    />
  );
}

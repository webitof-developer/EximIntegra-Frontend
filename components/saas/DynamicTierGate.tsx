"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store";
import { useGetTierAccessGatesQuery } from "@/store/adminApi";
import { TierType } from "./TierBadge";
import { PlanGateTemplate } from "./PlanGateTemplate";

interface DynamicTierGateProps {
  pageId?: string;
  pagePath?: string;
  children: React.ReactNode;
  fallbackMode?: "full" | "overlay" | "banner";
  defaultRequiredTier?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultCategory?: string;
}

const tierWeights: Record<string, number> = {
  ALL: 0,
  FREE: 0,
  STARTER: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
};

export function DynamicTierGate({
  pageId,
  pagePath,
  children,
  fallbackMode = "full",
  defaultRequiredTier,
  defaultTitle,
  defaultDescription,
  defaultCategory,
}: DynamicTierGateProps) {
  const user = useAppSelector((state) => state.auth.user);
  const { data: gatesData } = useGetTierAccessGatesQuery();

  // Find dynamic gate configured by Admin
  const matchingGate = gatesData?.gates?.find((g) => {
    if (pageId && g.id.toLowerCase() === pageId.toLowerCase()) return true;
    if (pagePath && g.pagePath.toLowerCase() === pagePath.toLowerCase()) return true;
    return false;
  });

  const isGateActive = matchingGate ? matchingGate.isActive : true;
  const requiredTier = (
    matchingGate?.requiredTier ||
    defaultRequiredTier ||
    "STARTER"
  ).toUpperCase();

  const featureTitle =
    matchingGate?.title ||
    defaultTitle ||
    (pageId ? pageId.replace(/_/g, " ").toUpperCase() : "Platform Feature");

  const featureDescription =
    matchingGate?.description ||
    defaultDescription ||
    `Access to ${featureTitle} is locked on your current subscription plan.`;

  const category = matchingGate?.category || defaultCategory;

  // 1. Super Admin bypass: Always allow platform administrators
  if (user?.role === "ADMIN") {
    return <>{children}</>;
  }

  // 2. If Super Admin deactivated this gate, it is open to all users
  if (!isGateActive) {
    return <>{children}</>;
  }

  // 3. If tier is ALL or FREE, it is open
  if (requiredTier === "ALL" || requiredTier === "FREE") {
    return <>{children}</>;
  }

  // 4. Compare current user tier against required tier
  const currentTier = (user?.tier || "STARTER").toUpperCase();
  const currentWeight = tierWeights[currentTier] ?? 1;
  const requiredWeight = tierWeights[requiredTier] ?? 2;

  const isUnlocked = currentWeight >= requiredWeight;

  if (isUnlocked) {
    return <>{children}</>;
  }

  // 5. User's plan does not match: Render the dynamic template
  if (fallbackMode === "overlay") {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-line bg-panel">
        <div className="filter blur-[6px] opacity-60 pointer-events-none select-none max-h-[500px] overflow-hidden">
          {children}
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-navy/30 backdrop-blur-xs overflow-y-auto">
          <PlanGateTemplate
            requiredTier={requiredTier}
            featureName={featureTitle}
            description={featureDescription}
            category={category}
            pagePath={pagePath || matchingGate?.pagePath}
            fallbackMode="full"
          />
        </div>
      </div>
    );
  }

  return (
    <PlanGateTemplate
      requiredTier={requiredTier}
      featureName={featureTitle}
      description={featureDescription}
      category={category}
      pagePath={pagePath || matchingGate?.pagePath}
      fallbackMode={fallbackMode}
    />
  );
}

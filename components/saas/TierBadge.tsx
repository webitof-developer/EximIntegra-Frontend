"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Crown, Zap, Shield, Sparkles } from "lucide-react";

export type TierType = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

interface TierBadgeProps {
  tier: TierType | string;
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export function TierBadge({
  tier,
  size = "xs",
  showIcon = true,
  className,
}: TierBadgeProps) {
  const normalizedTier = tier.toUpperCase();

  const config = {
    STARTER: {
      label: "STARTER",
      icon: <Shield className="w-2.5 h-2.5 text-muted" />,
      classes: "bg-panel text-muted border-line",
    },
    PROFESSIONAL: {
      label: "PRO",
      icon: <Zap className="w-2.5 h-2.5 text-blue" />,
      classes: "bg-blue/10 text-blue border-blue/20",
    },
    ENTERPRISE: {
      label: "ENTERPRISE",
      icon: <Crown className="w-2.5 h-2.5 text-amber" />,
      classes: "bg-amber/10 text-amber border-amber/20 font-bold",
    },
  }[normalizedTier as TierType] || {
    label: normalizedTier,
    icon: <Sparkles className="w-2.5 h-2.5 text-blue" />,
    classes: "bg-blue/10 text-blue border-blue/20",
  };

  const sizeClasses = {
    xs: "text-[9px] px-1.5 py-0.5 gap-1",
    sm: "text-[10px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono uppercase tracking-wider rounded-md border shadow-xs transition-colors",
        config.classes,
        sizeClasses,
        className
      )}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}

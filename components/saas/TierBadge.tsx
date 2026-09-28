"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Crown, Zap, Shield, Sparkles } from "lucide-react";

export type TierType = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

interface TierBadgeProps {
  tier: TierType | string;
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
  compact?: boolean;
  variant?: "light" | "dark";
  className?: string;
}

export function TierBadge({
  tier,
  size = "xs",
  showIcon = true,
  compact = false,
  variant = "light",
  className,
}: TierBadgeProps) {
  const normalizedTier = tier.toUpperCase();
  const isDark = variant === "dark";

  const tierKey: TierType =
    normalizedTier === "PRO" || normalizedTier === "PROFESSIONAL"
      ? "PROFESSIONAL"
      : normalizedTier === "ENT" || normalizedTier === "ENTERPRISE"
      ? "ENTERPRISE"
      : "STARTER";

  const config = {
    STARTER: {
      label: compact ? "Start" : "Starter",
      icon: (
        <Shield
          className={cn(
            "w-2.5 h-2.5 shrink-0",
            isDark ? "text-slate-400" : "text-slate-500"
          )}
        />
      ),
      classes: isDark
        ? "bg-slate-800 text-slate-300 border-slate-700"
        : "bg-slate-100 text-slate-700 border-slate-200/80",
    },
    PROFESSIONAL: {
      label: compact ? "Pro" : "Professional",
      icon: (
        <Zap
          className={cn(
            "w-2.5 h-2.5 shrink-0",
            isDark ? "text-[#93C5FD]" : "text-blue-600"
          )}
        />
      ),
      classes: isDark
        ? "bg-blue-950/70 text-[#93C5FD] border-blue-700/50"
        : "bg-blue-50 text-blue-700 border-blue-200/80",
    },
    ENTERPRISE: {
      label: compact ? "Ent" : "Enterprise",
      icon: (
        <Crown
          className={cn(
            "w-2.5 h-2.5 shrink-0",
            isDark ? "text-amber-300" : "text-amber-600"
          )}
        />
      ),
      classes: isDark
        ? "bg-amber-500/20 text-amber-300 border-amber-400/40 font-bold"
        : "bg-gradient-to-r from-amber-50 to-orange-50/70 text-amber-800 border-amber-300/70 shadow-2xs font-semibold",
    },
  }[tierKey];

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1 rounded-md",
    sm: "text-[11px] px-2 py-0.5 gap-1.5 rounded-md",
    md: "text-xs px-2.5 py-1 gap-1.5 rounded-lg",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center font-sans tracking-normal border shadow-xs transition-colors shrink-0 select-none leading-none",
        config.classes,
        sizeClasses,
        className
      )}
    >
      {showIcon && config.icon}
      <span className="leading-tight">{config.label}</span>
    </span>
  );
}

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TierBadge, TierType } from "@/components/saas/TierBadge";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number | React.ReactNode;
  tierBadge?: TierType | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  size = "md",
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1.5 p-1 bg-[#EEF2F6] rounded-xl border border-line max-w-full overflow-x-auto",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg font-medium transition-all text-xs cursor-pointer select-none whitespace-nowrap shrink-0",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-xs",
              isActive
                ? "bg-blue-dim text-blue font-bold shadow-xs border border-blue/20"
                : "text-muted hover:text-ink hover:bg-white/60",
              tab.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
            )}
          >
            {tab.icon && (
              <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                {tab.icon}
              </span>
            )}
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.tierBadge ? (
              <TierBadge
                tier={tab.tierBadge}
                size="xs"
                compact
                showIcon={true}
                variant="light"
              />
            ) : typeof tab.badge === "string" &&
              ["ENT", "ENTERPRISE", "PRO", "PROFESSIONAL"].includes(
                tab.badge.toUpperCase()
              ) ? (
              <TierBadge
                tier={tab.badge}
                size="xs"
                compact
                showIcon={true}
                variant="light"
              />
            ) : tab.badge !== undefined ? (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none shrink-0 font-semibold",
                  isActive
                    ? "bg-blue text-white"
                    : "bg-line text-muted"
                )}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import React from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";

interface AdminNavProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  userCount?: number;
}

export function AdminNav({
  title = "Platform Administration & Dynamic Governance Control",
  description = "Centralized authority to manage corporate user profiles, subscription quotas, live B2B SaaS pricing, and RBAC permissions across all business roles.",
  onRefresh,
  isRefreshing,
}: AdminNavProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-panel border border-line rounded-2xl shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-purple-600 text-white uppercase tracking-wider font-bold inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              SUPER ADMIN COCKPIT
            </span>
            <span className="text-xs text-[#9EB1D0] font-mono">v2026.03-GOVERNANCE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {title}
          </h1>
          <p className="text-xs text-[#9EB1D0] max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {onRefresh && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-active hover:bg-[#23355D] text-white border border-[#2B406B] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Sync DB</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

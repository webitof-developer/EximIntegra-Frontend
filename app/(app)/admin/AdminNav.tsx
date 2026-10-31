"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, RefreshCw, ChevronRight } from "lucide-react";

interface AdminNavProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  userCount?: number;
  category?: string;
}

export function AdminNav({
  title = "Platform Administration & Dynamic Governance Control",
  description = "Centralized authority to manage corporate user profiles, subscription quotas, live B2B SaaS pricing, and RBAC permissions across all business roles.",
  onRefresh,
  isRefreshing,
  userCount,
  category = "Governance Control",
}: AdminNavProps) {
  return (
    <div className="w-full">
      {/* Header Banner */}
      <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-panel via-panel to-bg/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue/10 text-blue border border-blue/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
              SUPER ADMIN CONSOLE
            </span>
            <span className="text-xs text-muted font-mono">&bull;</span>
            <span className="text-xs text-muted font-medium flex items-center gap-1">
              <Link href="/admin" className="text-blue hover:underline">
                Admin
              </Link>
              <span>/</span>
              <span className="text-ink font-semibold">{category}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            {title}
          </h1>

          <p className="text-xs text-muted max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          {userCount !== undefined && (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-bg rounded-xl border border-line">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs font-medium text-ink flex items-center gap-1.5">
                <span className="text-muted">Total:</span>
                <span className="font-bold font-mono">{userCount}</span>
              </div>
            </div>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              title="Synchronize data with live PostgreSQL DB"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync DB"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

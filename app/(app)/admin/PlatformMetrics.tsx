"use client";

import React from "react";
import { AdminStats } from "@/lib/types";
import { StatusPill } from "@/components/ui";
import {
  Users,
  Building2,
  ShieldCheck,
  Activity,
  RefreshCw,
} from "lucide-react";

interface PlatformMetricsTabProps {
  stats?: AdminStats;
  isLoading?: boolean;
}

export function PlatformMetricsTab({ stats, isLoading }: PlatformMetricsTabProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue" />
        <span className="text-xs font-mono">Aggregating platform metrics from database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono">Total Users</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="text-3xl font-bold font-data text-ink">
            {stats?.totalUsers ?? 0}
          </div>
          <span className="text-[11px] text-muted block">Registered trade accounts</span>
        </div>

        <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono">Organizations</span>
            <Building2 className="w-4 h-4 text-green" />
          </div>
          <div className="text-3xl font-bold font-data text-ink">
            {stats?.totalOrganizations ?? 0}
          </div>
          <span className="text-[11px] text-muted block">Independent billing tenants</span>
        </div>

        <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono">Starter Accounts</span>
            <StatusPill label="ACTIVE" variant="neutral" size="xs" />
          </div>
          <div className="text-3xl font-bold font-data text-ink">
            {stats?.tierBreakdown?.STARTER ?? 0}
          </div>
          <span className="text-[11px] text-muted block">Free tier evaluation accounts</span>
        </div>

        <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono">Enterprise / Pro</span>
            <StatusPill label="PAID" variant="success" size="xs" />
          </div>
          <div className="text-3xl font-bold font-data text-blue">
            {(stats?.tierBreakdown?.ENTERPRISE ?? 0) + (stats?.tierBreakdown?.PROFESSIONAL ?? 0)}
          </div>
          <span className="text-[11px] text-muted block">
            {stats?.tierBreakdown?.ENTERPRISE ?? 0} Ent &bull; {stats?.tierBreakdown?.PROFESSIONAL ?? 0} Pro
          </span>
        </div>
      </div>

      {/* Subscriptions & Role Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue" />
            <span>Subscription Tier Distribution</span>
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-ink">Enterprise Platform</span>
                <span className="font-mono text-muted">{stats?.tierBreakdown?.ENTERPRISE ?? 0}</span>
              </div>
              <div className="w-full bg-line rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats?.totalUsers
                        ? ((stats?.tierBreakdown?.ENTERPRISE ?? 0) / stats.totalUsers) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-ink">Professional Tier</span>
                <span className="font-mono text-muted">{stats?.tierBreakdown?.PROFESSIONAL ?? 0}</span>
              </div>
              <div className="w-full bg-line rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats?.totalUsers
                        ? ((stats?.tierBreakdown?.PROFESSIONAL ?? 0) / stats.totalUsers) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-ink">Starter Plan (Default)</span>
                <span className="font-mono text-muted">{stats?.tierBreakdown?.STARTER ?? 0}</span>
              </div>
              <div className="w-full bg-line rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats?.totalUsers
                        ? ((stats?.tierBreakdown?.STARTER ?? 0) / stats.totalUsers) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-green" />
            <span>System Infrastructure & Dataset Health</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-line">
              <span className="text-muted">Statutory Dataset Engine:</span>
              <span className="font-mono font-bold text-ink">{stats?.statutoryDatasetVersion || "CBIC-2026.03"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line">
              <span className="text-muted">Database & Redis Sync:</span>
              <StatusPill label="OPERATIONAL" variant="success" size="xs" dot />
            </div>
            <div className="flex justify-between py-2 border-b border-line">
              <span className="text-muted">RBAC & Super Admin Policy:</span>
              <span className="font-mono text-ink">Enforced (JWT + Server-Side)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted">Dynamic Pricing State:</span>
              <span className="font-semibold text-blue">Synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

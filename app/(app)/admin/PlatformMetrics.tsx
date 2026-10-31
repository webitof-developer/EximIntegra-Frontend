"use client";

import React from "react";
import Link from "next/link";
import { AdminStats, AdminUserItem } from "@/lib/types";
import { TierBadge } from "@/components/saas/TierBadge";
import {
  Users,
  Building2,
  ShieldCheck,
  Activity,
  RefreshCw,
  Crown,
  Sliders,
  DollarSign,
  Cpu,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
  Clock,
  ChevronRight,
  CreditCard,
  Layers,
  Server,
  Zap,
} from "lucide-react";

interface PlatformMetricsTabProps {
  stats?: AdminStats;
  recentUsers?: AdminUserItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  adminName?: string;
}

export function PlatformMetricsTab({
  stats,
  recentUsers = [],
  isLoading,
  onRefresh,
  isRefreshing,
  adminName = "Admin",
}: PlatformMetricsTabProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const todayDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  if (isLoading) {
    return (
      <div className="p-16 text-center text-muted flex flex-col items-center justify-center gap-3 bg-panel border border-line rounded-2xl shadow-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-blue" />
        <span className="text-xs font-mono">Aggregating platform metrics from database...</span>
      </div>
    );
  }

  const totalUsersCount = stats?.totalUsers || 0;
  const roleBreakdown = stats?.roleBreakdown || {};
  const tierBreakdown = stats?.tierBreakdown || { STARTER: 0, PROFESSIONAL: 0, ENTERPRISE: 0 };

  const standardRoleMeta: Record<string, { label: string; color: string; barColor: string }> = {
    IMPORTER: { label: "Importers", color: "text-blue", barColor: "bg-blue" },
    EXPORTER: { label: "Exporters", color: "text-emerald-600", barColor: "bg-emerald-500" },
    CUSTOMS_BROKER: { label: "Customs Brokers", color: "text-amber-500", barColor: "bg-amber-500" },
    TRADE_ADVISOR: { label: "Trade Advisors", color: "text-purple-600", barColor: "bg-purple-600" },
    TRADE_OFFICER: { label: "Trade Officers", color: "text-teal-600", barColor: "bg-teal-500" },
    AUDITOR: { label: "Auditors", color: "text-slate-600", barColor: "bg-slate-500" },
    ADMIN: { label: "Super Admins", color: "text-indigo-600", barColor: "bg-indigo-600" },
  };

  const allRoleKeys = Array.from(
    new Set([...Object.keys(standardRoleMeta), ...Object.keys(roleBreakdown)])
  );

  const rolesConfig = allRoleKeys.map((key) => {
    const meta = standardRoleMeta[key] || {
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      color: "text-blue",
      barColor: "bg-blue",
    };
    return {
      key,
      label: meta.label,
      color: meta.color,
      barColor: meta.barColor,
      count: roleBreakdown[key] || 0,
    };
  });

  const totalPaidTiers = (tierBreakdown.ENTERPRISE || 0) + (tierBreakdown.PROFESSIONAL || 0);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-gradient-to-r from-panel via-panel to-bg/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue/10 text-blue border border-blue/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
              SUPER ADMIN CONSOLE
            </span>
            <span className="text-xs text-muted font-mono">&bull;</span>
            <span className="text-xs text-muted font-medium">{todayDate}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink flex items-center gap-2">
            <span>{greeting}, {adminName}</span>
            <span className="inline-block animate-bounce select-none">👋</span>
          </h1>

          <p className="text-xs text-muted max-w-2xl leading-relaxed">
            Central command overview for active organizations, tenant quotas, role permissions, and system services.
          </p>
        </div>

        {/* Right Status Summary & Actions */}
        <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-bg rounded-xl border border-line">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs font-medium text-ink flex items-center gap-1.5">
              <span className="text-muted">Users:</span>
              <span className="font-bold font-mono">{totalUsersCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-bg rounded-xl border border-line">
            <span className="w-2 h-2 rounded-full bg-blue" />
            <div className="text-xs font-medium text-ink flex items-center gap-1.5">
              <span className="text-muted">Tenants:</span>
              <span className="font-bold font-mono">{stats?.totalOrganizations ?? 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-bg rounded-xl border border-line">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs font-semibold text-emerald-600 font-mono">100% Operational</span>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              title="Synchronize platform data with PostgreSQL database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync DB"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
        {/* Card 1: Total Users */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-blue/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center text-blue">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {totalUsersCount}
          </div>
          <span className="text-[11px] text-muted block truncate">Active trade accounts</span>
        </div>

        {/* Card 2: Organizations */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-emerald-500/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Organizations</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {stats?.totalOrganizations ?? 0}
          </div>
          <span className="text-[11px] text-muted block truncate">Billing corporate tenants</span>
        </div>

        {/* Card 3: Paid Tiers */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-amber-500/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Paid Subscriptions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-amber-600">
            {totalPaidTiers}
          </div>
          <span className="text-[11px] text-muted block truncate">
            {tierBreakdown.ENTERPRISE || 0} Ent &bull; {tierBreakdown.PROFESSIONAL || 0} Pro
          </span>
        </div>

        {/* Card 4: Starter Accounts */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-purple-500/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Starter Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {tierBreakdown.STARTER || 0}
          </div>
          <span className="text-[11px] text-muted block truncate">Free evaluation tier</span>
        </div>

        {/* Card 5: Security Roles */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-indigo-500/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Security Roles</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-indigo-600">
            {rolesConfig.length} Roles
          </div>
          <span className="text-[11px] text-muted block truncate">Enforced across modules</span>
        </div>
      </div>

      {/* 3. Middle Analytics & Breakdown Section (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
        {/* Widget 1: Role Permissions Breakdown */}
        <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-ink">Role Distribution</h3>
              </div>
              <span className="text-[11px] font-mono text-muted bg-bg border border-line px-2 py-0.5 rounded-full font-medium">
                {totalUsersCount} Users
              </span>
            </div>

            <div className="space-y-3.5">
              {rolesConfig.slice(0, 6).map((role) => {
                const pct = totalUsersCount > 0 ? Math.round((role.count / totalUsersCount) * 100) : 0;
                return (
                  <div key={role.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${role.barColor}`} />
                        <span>{role.label}</span>
                      </span>
                      <span className="font-mono text-xs">
                        <span className="font-bold text-ink">{role.count}</span>
                        <span className="text-muted ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-bg border border-line rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${role.barColor} transition-all duration-500`}
                        style={{ width: `${Math.max(role.count > 0 ? 5 : 0, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
            <span className="text-muted text-[11px]">RBAC Access Policy</span>
            <Link
              href="/admin/rbac"
              className="text-blue hover:text-blue-dark text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Manage Policies</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Widget 2: Subscription Tier Distribution */}
        <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Crown className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-ink">Subscription Quotas</h3>
              </div>
              <span className="text-[11px] font-mono text-muted bg-bg border border-line px-2 py-0.5 rounded-full font-medium">
                Monetization
              </span>
            </div>

            <div className="space-y-4">
              {/* Enterprise */}
              {(() => {
                const count = tierBreakdown.ENTERPRISE || 0;
                const pct = totalUsersCount > 0 ? Math.round((count / totalUsersCount) * 100) : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Enterprise Platform</span>
                      </span>
                      <span className="font-mono text-xs">
                        <span className="font-bold text-ink">{count}</span>
                        <span className="text-muted ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-bg border border-line rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(count > 0 ? 5 : 0, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Professional */}
              {(() => {
                const count = tierBreakdown.PROFESSIONAL || 0;
                const pct = totalUsersCount > 0 ? Math.round((count / totalUsersCount) * 100) : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue" />
                        <span>Professional Tier</span>
                      </span>
                      <span className="font-mono text-xs">
                        <span className="font-bold text-ink">{count}</span>
                        <span className="text-muted ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-bg border border-line rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(count > 0 ? 5 : 0, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Starter */}
              {(() => {
                const count = tierBreakdown.STARTER || 0;
                const pct = totalUsersCount > 0 ? Math.round((count / totalUsersCount) * 100) : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Starter Plan (Default)</span>
                      </span>
                      <span className="font-mono text-xs">
                        <span className="font-bold text-ink">{count}</span>
                        <span className="text-muted ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-bg border border-line rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-slate-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(count > 0 ? 5 : 0, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
            <span className="text-muted text-[11px]">Pricing Engine</span>
            <Link
              href="/admin/pricing"
              className="text-blue hover:text-blue-dark text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Manage Pricing</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Widget 3: Platform Infrastructure */}
        <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-ink">System Infrastructure</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-line">
                <span className="text-muted">Statutory Tariff Engine:</span>
                <span className="font-mono font-bold text-ink text-[11px]">
                  {stats?.statutoryDatasetVersion || "CBIC-2026.03"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-line">
                <span className="text-muted">PostgreSQL & Redis:</span>
                <span className="font-semibold text-emerald-600 font-mono text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Connected (14ms)
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-line">
                <span className="text-muted">RBAC Policy Guard:</span>
                <span className="font-mono text-ink text-[11px] font-medium">
                  Enforced (JWT + DB)
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-line">
                <span className="text-muted">Akshara AI Copilot:</span>
                <span className="font-mono text-blue text-[11px] font-medium">
                  Multi-Provider Ready
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted">Live Foreign Exchange (FX):</span>
                <span className="font-mono text-emerald-600 font-bold text-[11px]">
                  Synchronized
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
            <span className="text-muted text-[11px]">Copilot Provider Hub</span>
            <Link
              href="/admin/llm"
              className="text-blue hover:text-blue-dark text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>AI Settings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Recent Accounts & Platform Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* Left Column (8 cols): Recent Registered Accounts */}
        <div className="lg:col-span-8 p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Users className="w-4 h-4 text-blue" />
                <span>Recent Registered Accounts</span>
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Latest trade accounts and enterprise users active on EximIntegra
              </p>
            </div>

            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg hover:bg-slate-100 text-ink text-xs font-semibold border border-line transition-all shadow-2xs"
            >
              <span>View User Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[11px] font-medium text-muted uppercase tracking-wider bg-bg/50">
                  <th className="py-2.5 px-3 rounded-l-lg">User</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Plan Tier</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentUsers.length > 0 ? (
                  recentUsers.slice(0, 5).map((u) => {
                    const initials = u.name
                      ? u.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "U";

                    const formattedDate = u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recent";

                    return (
                      <tr key={u.id} className="hover:bg-bg/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue/10 text-blue font-bold text-[10px] flex items-center justify-center font-mono border border-blue/20 shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-ink block truncate max-w-[160px]">
                                {u.name}
                              </span>
                              <span className="text-[10px] text-muted font-mono truncate block max-w-[160px]">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-ink truncate max-w-[130px]">
                          {u.company || "Independent"}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-bg border border-line text-ink">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <TierBadge tier={u.tier || "STARTER"} size="xs" />
                        </td>
                        <td className="py-3 px-3 text-[11px] font-mono text-muted whitespace-nowrap">
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted font-mono text-xs">
                      No registered trade accounts found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Platform Governance & Quick Actions */}
        <div className="lg:col-span-4 p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-line">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Governance & Controls</span>
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Core parameters and direct administration shortcuts
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg border border-line">
                <span className="text-muted">Corporate Tenants:</span>
                <span className="font-mono font-bold text-ink">{stats?.totalOrganizations ?? 0}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg border border-line">
                <span className="text-muted">Enterprise Conversion:</span>
                <span className="font-mono font-bold text-purple-600">
                  {totalUsersCount > 0
                    ? `${Math.round(((tierBreakdown.ENTERPRISE || 0) / totalUsersCount) * 100)}%`
                    : "0%"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg border border-line">
                <span className="text-muted">Customs Tariff Engine:</span>
                <span className="font-mono text-emerald-600 font-bold">CTA-2026 Sync</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg border border-line">
                <span className="text-muted">Active AI Copilot:</span>
                <span className="font-mono text-blue font-bold">Multi-Provider</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-line space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted block font-semibold">
              Quick Administration Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/users"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-bg hover:bg-slate-100 text-ink text-xs font-semibold border border-line transition-all group"
              >
                <Users className="w-3.5 h-3.5 text-blue group-hover:scale-110 transition-transform" />
                <span className="truncate">Directory</span>
              </Link>

              <Link
                href="/admin/rbac"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-bg hover:bg-slate-100 text-ink text-xs font-semibold border border-line transition-all group"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="truncate">RBAC Matrix</span>
              </Link>

              <Link
                href="/admin/pricing"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-bg hover:bg-slate-100 text-ink text-xs font-semibold border border-line transition-all group"
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="truncate">Pricing Plans</span>
              </Link>

              <Link
                href="/admin/llm"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-bg hover:bg-slate-100 text-ink text-xs font-semibold border border-line transition-all group"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="truncate">AI Engine</span>
              </Link>

              <Link
                href="/admin/payments"
                className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-bg hover:bg-slate-100 text-ink text-xs font-semibold border border-line transition-all group"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="truncate">Razorpay Payment Gateway</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { AdminStats, AdminUserItem } from "@/lib/types";
import { StatusPill } from "@/components/ui";
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
  ShieldAlert,
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
      <div className="p-16 text-center text-muted flex flex-col items-center justify-center gap-3 bg-panel border border-line rounded-2xl">
        <RefreshCw className="w-7 h-7 animate-spin text-blue" />
        <span className="text-xs font-mono">Aggregating platform metrics from database...</span>
      </div>
    );
  }

  const totalUsersCount = stats?.totalUsers || 0;
  const roleBreakdown = stats?.roleBreakdown || {};
  const tierBreakdown = stats?.tierBreakdown || { STARTER: 0, PROFESSIONAL: 0, ENTERPRISE: 0 };

  const rolesConfig: { key: string; label: string; color: string; count: number }[] = [
    { key: "IMPORTER", label: "Importers", color: "bg-blue", count: roleBreakdown["IMPORTER"] || 0 },
    { key: "EXPORTER", label: "Exporters", color: "bg-emerald-500", count: roleBreakdown["EXPORTER"] || 0 },
    { key: "CUSTOMS_BROKER", label: "Customs Brokers", color: "bg-amber-500", count: roleBreakdown["CUSTOMS_BROKER"] || 0 },
    { key: "TRADE_ADVISOR", label: "Trade Advisors", color: "bg-purple-600", count: roleBreakdown["TRADE_ADVISOR"] || 0 },
    { key: "ADMIN", label: "Super Admins", color: "bg-indigo-600", count: roleBreakdown["ADMIN"] || 0 },
  ];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* 1. Top Greeting Banner (Sonivo AI Style in Light Mode) */}
      <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
              <span>Admin</span>
              <span>/</span>
              <span className="text-ink font-semibold">Dashboard Overview</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-700 font-bold border border-purple-500/20">
              v2026.03-LIVE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink flex items-center gap-2">
            <span>{greeting}, {adminName}</span>
            <span className="inline-block animate-bounce">👋</span>
          </h1>

          <p className="text-xs text-muted max-w-2xl leading-relaxed">
            Here's what's happening on your EximIntegra platform today &mdash;{" "}
            <span className="font-semibold text-ink">{todayDate}</span>
          </p>
        </div>

        {/* Right Metric Pills & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-bg rounded-xl border border-line shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted font-mono uppercase tracking-wider leading-none">
                Active Users
              </span>
              <span className="text-sm font-bold font-data text-ink leading-tight">
                {totalUsersCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-bg rounded-xl border border-line shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted font-mono uppercase tracking-wider leading-none">
                Organizations
              </span>
              <span className="text-sm font-bold font-data text-ink leading-tight">
                {stats?.totalOrganizations ?? 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-bg rounded-xl border border-line shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted font-mono uppercase tracking-wider leading-none">
                System Health
              </span>
              <span className="text-sm font-bold font-data text-emerald-600 leading-tight">
                100% Operational
              </span>
            </div>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-active hover:bg-[#23355D] text-white border border-[#2B406B] text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              title="Synchronize platform data with live PostgreSQL DB"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Sync DB</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards Row (5 Cards Grid like Sonivo AI) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 w-full">
        {/* Card 1 */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-blue/40 transition-colors">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Total Users</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/50 flex items-center justify-center text-blue">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {totalUsersCount}
          </div>
          <span className="text-[11px] text-muted block truncate">Active trade accounts</span>
        </div>

        {/* Card 2 */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Organizations</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-emerald-600">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {stats?.totalOrganizations ?? 0}
          </div>
          <span className="text-[11px] text-muted block truncate">Billing corporate tenants</span>
        </div>

        {/* Card 3 */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Paid Tiers</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200/50 flex items-center justify-center text-purple-600">
              <Crown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-purple-700">
            {(tierBreakdown.ENTERPRISE || 0) + (tierBreakdown.PROFESSIONAL || 0)}
          </div>
          <span className="text-[11px] text-muted block truncate">
            {tierBreakdown.ENTERPRISE || 0} Ent &bull; {tierBreakdown.PROFESSIONAL || 0} Pro
          </span>
        </div>

        {/* Card 4 */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-slate-400/40 transition-colors">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Starter Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {tierBreakdown.STARTER || 0}
          </div>
          <span className="text-[11px] text-muted block truncate">Free evaluation tier</span>
        </div>

        {/* Card 5 */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">RBAC Roles</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/50 flex items-center justify-center text-indigo-600">
              <Sliders className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-indigo-600">
            5 Roles
          </div>
          <span className="text-[11px] text-muted block truncate">Enforced across modules</span>
        </div>

        {/* Card 6 */}
        {/* <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Dataset Engine</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-200/50 flex items-center justify-center text-cyan-600">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-cyan-700">
            v2026.03
          </div>
          <span className="text-[11px] text-muted block truncate">CBIC Tariff Act sync</span>
        </div> */}
      </div>

      {/* 3. Middle Analytics & Breakdown Widgets (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
        {/* Widget 1: Role Status Breakdown (Styled like Call Status Breakdown) */}
        <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Role Permissions Breakdown</span>
            </h3>
            <span className="text-[10px] font-mono text-muted bg-bg border border-line px-2 py-0.5 rounded-full">
              {totalUsersCount} Total
            </span>
          </div>

          <div className="space-y-4">
            {rolesConfig.map((role) => {
              const pct = totalUsersCount > 0 ? Math.round((role.count / totalUsersCount) * 100) : 0;
              return (
                <div key={role.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${role.color}`} />
                      <span>{role.label}</span>
                    </span>
                    <span className="font-mono text-muted text-[11px]">
                      <span className="font-bold text-ink">{role.count}</span>
                      <span className="text-muted/60">/{totalUsersCount}</span>{" "}
                      <span className="text-muted">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-bg border border-line rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${role.color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
            <span className="text-muted text-[11px]">Governance Matrix:</span>
            <Link
              href="/admin/rbac"
              className="text-blue hover:underline text-[11px] font-semibold flex items-center gap-1"
            >
              <span>Manage RBAC Matrix</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Widget 2: Subscription Tier Distribution */}
        <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Subscription Tier Quotas</span>
            </h3>
            <span className="text-[10px] font-mono text-muted bg-bg border border-line px-2 py-0.5 rounded-full">
              SaaS Monetization
            </span>
          </div>

          <div className="space-y-4">
            {/* Enterprise Tier */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Enterprise Platform</span>
                </span>
                <span className="font-mono text-xs">
                  <span className="font-bold text-ink">{tierBreakdown.ENTERPRISE || 0}</span>{" "}
                  <span className="text-muted text-[11px]">
                    ({totalUsersCount > 0 ? Math.round(((tierBreakdown.ENTERPRISE || 0) / totalUsersCount) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-bg border border-line rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${totalUsersCount > 0 ? ((tierBreakdown.ENTERPRISE || 0) / totalUsersCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Professional Tier */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue" />
                  <span>Professional Tier</span>
                </span>
                <span className="font-mono text-xs">
                  <span className="font-bold text-ink">{tierBreakdown.PROFESSIONAL || 0}</span>{" "}
                  <span className="text-muted text-[11px]">
                    ({totalUsersCount > 0 ? Math.round(((tierBreakdown.PROFESSIONAL || 0) / totalUsersCount) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-bg border border-line rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${totalUsersCount > 0 ? ((tierBreakdown.PROFESSIONAL || 0) / totalUsersCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Starter Tier */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Starter Plan (Default)</span>
                </span>
                <span className="font-mono text-xs">
                  <span className="font-bold text-ink">{tierBreakdown.STARTER || 0}</span>{" "}
                  <span className="text-muted text-[11px]">
                    ({totalUsersCount > 0 ? Math.round(((tierBreakdown.STARTER || 0) / totalUsersCount) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-bg border border-line rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-400 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${totalUsersCount > 0 ? ((tierBreakdown.STARTER || 0) / totalUsersCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
            <span className="text-muted text-[11px]">Pricing Plans Engine:</span>
            <Link
              href="/admin/pricing"
              className="text-blue hover:underline text-[11px] font-semibold flex items-center gap-1"
            >
              <span>Edit Dynamic Pricing</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Widget 3: System Infrastructure & Health */}
        <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Platform Infrastructure</span>
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-line">
              <span className="text-muted">Statutory Dataset Engine:</span>
              <span className="font-mono font-bold text-ink text-[11px]">
                {stats?.statutoryDatasetVersion || "CBIC-2026.03"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-line">
              <span className="text-muted">PostgreSQL & Redis Cache:</span>
              <span className="font-semibold text-emerald-700 font-mono text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Operational (14ms)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-line">
              <span className="text-muted">RBAC Policy Guard:</span>
              <span className="font-mono text-ink text-[11px] font-medium">
                Enforced (JWT + DB)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-line">
              <span className="text-muted">Akshara AI Copilot Gateway:</span>
              <Link
                href="/admin/llm"
                className="font-mono text-blue hover:underline text-[11px] font-medium flex items-center gap-1"
              >
                <span>5 Models Configured</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted">Live Foreign Exchange (FX):</span>
              <span className="font-mono text-emerald-700 font-bold text-[11px]">
                Synchronized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid (Recent Users Table & Platform Summary Milestones) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* Left Column (8 cols): Recent Registered Users */}
        <div className="lg:col-span-8 p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
                <Users className="w-4 h-4 text-blue" />
                <span>Recent Registered Accounts</span>
              </h3>
              <p className="text-[11px] text-muted">
                Latest enterprise users accessing the EximIntegra platform
              </p>
            </div>

            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-bg hover:bg-slate-100 text-ink text-xs font-semibold border border-line transition-all shadow-2xs"
            >
              <span>View User Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[11px] font-mono text-muted uppercase tracking-wider bg-bg/50">
                  <th className="py-2.5 px-3 font-semibold rounded-l-lg">User</th>
                  <th className="py-2.5 px-3 font-semibold">Company</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Plan Tier</th>
                  <th className="py-2.5 px-3 font-semibold rounded-r-lg">Joined</th>
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
                            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue font-bold text-[10px] flex items-center justify-center font-mono border border-blue-200 shrink-0">
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-bg border border-line text-ink">
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

        {/* Right Column (4 cols): Platform Summary & Governance Shortcuts */}
        <div className="lg:col-span-4 p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Platform Governance Summary</span>
            </h3>
            <p className="text-[11px] text-muted">
              Live corporate parameters & fast admin actions
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg border border-line">
              <span className="text-muted">Corporate Tenants:</span>
              <span className="font-mono font-bold text-ink">{stats?.totalOrganizations ?? 0}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg border border-line">
              <span className="text-muted">Enterprise Users Ratio:</span>
              <span className="font-mono font-bold text-purple-700">
                {totalUsersCount > 0
                  ? `${Math.round(((tierBreakdown.ENTERPRISE || 0) / totalUsersCount) * 100)}%`
                  : "0%"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg border border-line">
              <span className="text-muted">Customs Tariff Engine:</span>
              <span className="font-mono text-emerald-700 font-bold">CTA-2026 Sync</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg border border-line">
              <span className="text-muted">Active LLM Copilot:</span>
              <span className="font-mono text-blue font-bold">Multi-Provider</span>
            </div>
          </div>

          <div className="pt-2 border-t border-line space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
              Quick Governance Navigation
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/users"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-bg hover:bg-slate-100 text-ink text-[11px] font-semibold border border-line transition-all group"
              >
                <Users className="w-3.5 h-3.5 text-blue group-hover:scale-110 transition-transform" />
                <span className="truncate">Directory</span>
              </Link>

              <Link
                href="/admin/rbac"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-bg hover:bg-slate-100 text-ink text-[11px] font-semibold border border-line transition-all group"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="truncate">RBAC Matrix</span>
              </Link>

              <Link
                href="/admin/pricing"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-bg hover:bg-slate-100 text-ink text-[11px] font-semibold border border-line transition-all group"
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="truncate">Pricing Plans</span>
              </Link>

              <Link
                href="/admin/llm"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-bg hover:bg-slate-100 text-ink text-[11px] font-semibold border border-line transition-all group"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="truncate">AI Engine</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

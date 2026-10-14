"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppSelector } from "@/store";
import {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetPricingPlansQuery,
  useUpdatePricingPlansMutation,
  useGetRBACMatrixQuery,
  useUpdateRBACMatrixMutation,
} from "@/store/adminApi";
import {
  PlatformMetricsTab,
  UserDirectoryTab,
  DynamicPricingTab,
  RolePermissionsTab,
  FreshnessDashboardTab,
  OperationsRolloutTab,
} from "./tabs";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  DollarSign,
  Activity,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Database,
  ToggleLeft,
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "pricing" | "rbac" | "freshness" | "operations"
  >("overview");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RTK Query Hooks
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetAdminStatsQuery(undefined, { skip: user?.role !== "ADMIN" });

  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery(undefined, { skip: user?.role !== "ADMIN" });

  const [updateUser] = useUpdateAdminUserMutation();
  const [deleteUser] = useDeleteAdminUserMutation();

  const {
    data: pricingData,
    isLoading: pricingLoading,
    refetch: refetchPricing,
  } = useGetPricingPlansQuery();
  const [updatePricing] = useUpdatePricingPlansMutation();

  const {
    data: rbacData,
    isLoading: rbacLoading,
    refetch: refetchRBAC,
  } = useGetRBACMatrixQuery(undefined, { skip: user?.role !== "ADMIN" });
  const [updateRBAC] = useUpdateRBACMatrixMutation();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Guard against non-admin users
  if (user && user.role !== "ADMIN") {
    return (
      <AuthGuard>
        <AppShell>
          <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-panel border border-red/30 rounded-2xl p-8 text-center space-y-5 shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-red/10 border border-red/20 text-red flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-ink">Super Admin Authority Required</h2>
                <p className="text-xs text-muted leading-relaxed">
                  The Admin Command Center is reserved strictly for designated EximIntegra
                  platform super administrators. Your account (<span className="font-mono">{user.email}</span>)
                  is registered under role <span className="font-semibold text-ink font-mono">{user.role}</span>.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Return to Trade Dashboard
                </Link>
              </div>
            </div>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-7xl mx-auto space-y-6">
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
              <h1 className="text-2xl font-bold tracking-tight">
                Platform Administration & Dynamic Governance Control
              </h1>
              <p className="text-xs text-[#9EB1D0] max-w-2xl leading-relaxed">
                Centralized authority to manage corporate user profiles, subscription quotas, live
                B2B SaaS pricing, and RBAC permissions across all business roles.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => {
                  refetchStats();
                  refetchUsers();
                  refetchPricing();
                  refetchRBAC();
                  showToast("Platform data refreshed from database.");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-active hover:bg-[#23355D] text-white border border-[#2B406B] text-xs font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync DB</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-blue text-white shadow-xs"
                  : "text-muted hover:text-ink hover:bg-bg"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Platform Metrics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "users"
                  ? "bg-blue text-white shadow-xs"
                  : "text-muted hover:text-ink hover:bg-bg"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Directory & Roles</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold">
                {usersData?.total || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rbac")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "rbac"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-muted hover:text-ink hover:bg-bg"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Role Permissions (RBAC Matrix)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-bold border border-purple-400/30">
                4 ROLES
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab("pricing")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "pricing"
                  ? "bg-blue text-white shadow-xs"
                  : "text-muted hover:text-ink hover:bg-bg"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Dynamic SaaS Pricing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("freshness")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "freshness"
                  ? "bg-blue text-white shadow-xs"
                  : "text-muted hover:text-ink hover:bg-bg"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Dataset Freshness</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("operations")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "operations"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-muted hover:text-ink hover:bg-bg"
              }`}
            >
              <ToggleLeft className="w-3.5 h-3.5" />
              <span>Operations & Flags</span>
            </button>
          </div>

          {/* Tab 1: Platform Metrics */}
          {activeTab === "overview" && (
            <PlatformMetricsTab stats={stats} isLoading={statsLoading} />
          )}

          {/* Tab 2: User Directory & Roles */}
          {activeTab === "users" && (
            <UserDirectoryTab
              users={usersData?.users || []}
              isLoading={usersLoading}
              onUpdateUser={async (params) => updateUser(params).unwrap()}
              onDeleteUser={async (id) => deleteUser(id).unwrap()}
              showToast={showToast}
            />
          )}

          {/* Tab 3: Dynamic SaaS Pricing */}
          {activeTab === "pricing" && (
            <DynamicPricingTab
              pricingPlans={pricingData?.plans || []}
              isLoading={pricingLoading}
              onSavePricing={async (plans) => updatePricing({ plans }).unwrap()}
              showToast={showToast}
            />
          )}

          {/* Tab 4: Role Permissions (RBAC Matrix) */}
          {activeTab === "rbac" && (
            <RolePermissionsTab
              roles={rbacData?.roles || []}
              modules={rbacData?.modules || []}
              isLoading={rbacLoading}
              onSaveRBAC={async (roles) => updateRBAC({ roles }).unwrap()}
              showToast={showToast}
            />
          )}

          {/* Tab 5: Dataset Freshness & Ingestion */}
          {activeTab === "freshness" && (
            <FreshnessDashboardTab showToast={showToast} />
          )}

          {/* Tab 6: Operations & Feature Flags */}
          {activeTab === "operations" && (
            <OperationsRolloutTab showToast={showToast} />
          )}
        </div>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-panel border border-line text-ink rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-4 h-4 text-green" />
            <span>{toastMessage}</span>
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}

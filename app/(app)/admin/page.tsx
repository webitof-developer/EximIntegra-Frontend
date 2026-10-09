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
} from "@/store/adminApi";
import { AdminUserItem, PricingPlan } from "@/lib/types";
import { TierBadge } from "@/components/saas/TierBadge";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  StatusPill,
} from "@/components/ui";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  DollarSign,
  Activity,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sliders,
  Building2,
  Lock,
  Save,
  Check,
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "pricing">("overview");

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

  const [updateUser, { isLoading: updatingUser }] = useUpdateAdminUserMutation();
  const [deleteUser, { isLoading: deletingUser }] = useDeleteAdminUserMutation();

  const {
    data: pricingData,
    isLoading: pricingLoading,
    refetch: refetchPricing,
  } = useGetPricingPlansQuery();
  const [updatePricing, { isLoading: updatingPricing }] = useUpdatePricingPlansMutation();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");

  // User Edit Modal State
  const [editingUserItem, setEditingUserItem] = useState<AdminUserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState<AdminUserItem["role"]>("IMPORTER");
  const [editTier, setEditTier] = useState<AdminUserItem["tier"]>("STARTER");

  // User Delete Modal State
  const [deletingUserItem, setDeletingUserItem] = useState<AdminUserItem | null>(null);

  // Dynamic Pricing Local Form State
  const [editablePlans, setEditablePlans] = useState<PricingPlan[]>([]);
  const [pricingNotice, setPricingNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize local editable plans when pricingData loads
  React.useEffect(() => {
    if (pricingData?.plans && pricingData.plans.length > 0) {
      setEditablePlans(JSON.parse(JSON.stringify(pricingData.plans)));
    }
  }, [pricingData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openEditModal = (item: AdminUserItem) => {
    setEditingUserItem(item);
    setEditName(item.name);
    setEditCompany(item.company);
    setEditRole(item.role);
    setEditTier(item.tier);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserItem) return;

    try {
      await updateUser({
        id: editingUserItem.id,
        name: editName,
        company: editCompany,
        role: editRole,
        tier: editTier,
      }).unwrap();
      showToast(`User ${editName} updated successfully.`);
      setEditingUserItem(null);
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to update user profile.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUserItem) return;
    try {
      await deleteUser(deletingUserItem.id).unwrap();
      showToast(`User ${deletingUserItem.name} has been removed.`);
      setDeletingUserItem(null);
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to delete user account.");
    }
  };

  // Pricing Form Handlers
  const handlePlanFieldChange = (
    index: number,
    field: keyof PricingPlan,
    value: any
  ) => {
    const updated = [...editablePlans];
    updated[index] = { ...updated[index], [field]: value };
    setEditablePlans(updated);
  };

  const handleAddFeature = (planIndex: number) => {
    const updated = [...editablePlans];
    const plan = { ...updated[planIndex] };
    plan.features = [...plan.features, "New feature capability"];
    updated[planIndex] = plan;
    setEditablePlans(updated);
  };

  const handleRemoveFeature = (planIndex: number, featureIndex: number) => {
    const updated = [...editablePlans];
    const plan = { ...updated[planIndex] };
    plan.features = plan.features.filter((_, idx) => idx !== featureIndex);
    updated[planIndex] = plan;
    setEditablePlans(updated);
  };

  const handleFeatureTextChange = (
    planIndex: number,
    featureIndex: number,
    val: string
  ) => {
    const updated = [...editablePlans];
    const plan = { ...updated[planIndex] };
    const features = [...plan.features];
    features[featureIndex] = val;
    plan.features = features;
    updated[planIndex] = plan;
    setEditablePlans(updated);
  };

  const handleSaveAllPricing = async () => {
    try {
      await updatePricing({ plans: editablePlans }).unwrap();
      setPricingNotice("Live SaaS pricing plans updated and persisted successfully across public and settings pages!");
      setTimeout(() => setPricingNotice(null), 4000);
      showToast("SaaS pricing plans saved successfully.");
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to update SaaS pricing.");
    }
  };

  // Filtered Users
  const filteredUsers = (usersData?.users || []).filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.company.toLowerCase().includes(q);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchTier = tierFilter === "ALL" || u.tier === tierFilter;
    return matchSearch && matchRole && matchTier;
  });

  // Guard against non-admin users
  if (user && user.role !== "ADMIN") {
    return (
      <AuthGuard>
        <AppShell>
          <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-panel border border-red/30 rounded-2xl p-8 text-center space-y-5 shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-red/10 border border-red/20 text-red flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-ink">Super Admin Privileges Required</h2>
                <p className="text-xs text-muted leading-relaxed">
                  Your current account (<strong>{user.email}</strong>) has the role{" "}
                  <strong className="text-ink">{user.role}</strong>. Access to this management
                  cockpit is strictly restricted to platform Super Administrators.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-active transition-all"
              >
                Return to Trade Cockpit
              </Link>
            </div>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-7 w-full pb-16">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-4 py-3 rounded-xl shadow-xl border border-[#2B406B] flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
              <CheckCircle2 className="w-4 h-4 text-green" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Super Admin Command Banner */}
          <div className="p-6 bg-navy text-white rounded-2xl shadow-xs border border-[#1B2A4A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-purple-600 text-white uppercase tracking-wider font-bold inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  SUPER ADMIN COCKPIT
                </span>
                <span className="text-xs text-[#9EB1D0] font-mono">v2026.03-GOVERNANCE</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Platform Administration & Dynamic Pricing Control
              </h1>
              <p className="text-xs text-[#9EB1D0] max-w-2xl leading-relaxed">
                Centralized authority to manage corporate user profiles, subscription quotas, and live
                B2B SaaS pricing across public and enterprise settings pages.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => {
                  refetchStats();
                  refetchUsers();
                  refetchPricing();
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
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
              onClick={() => setActiveTab("pricing")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "pricing"
                  ? "bg-blue text-white shadow-xs"
                  : "text-muted hover:text-ink hover:bg-bg"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Dynamic SaaS Pricing</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW METRICS */}
          {/* ========================================================================= */}
          {activeTab === "overview" && (
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
                          className="bg-amber-500 h-2 rounded-full"
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
                          className="bg-blue h-2 rounded-full"
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
                          className="bg-slate-400 h-2 rounded-full"
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
                      <span className="font-mono font-bold text-ink">{stats?.statutoryDatasetVersion}</span>
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
          )}

          {/* ========================================================================= */}
          {/* TAB 2: USER DIRECTORY & MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "users" && (
            <div className="space-y-5">
              {/* Search & Filter Bar */}
              <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or company..."
                    className="w-full pl-9 pr-3.5 py-2 bg-bg border border-line rounded-xl text-xs text-ink placeholder:text-muted focus:outline-hidden focus:border-blue"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Role:</span>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-bg border border-line rounded-lg text-xs font-semibold text-ink"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="ADMIN">Super Admin</option>
                      <option value="IMPORTER">Importer</option>
                      <option value="EXPORTER">Exporter</option>
                      <option value="CUSTOMS_BROKER">Customs Broker</option>
                      <option value="TRADE_ADVISOR">Trade Advisor</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <span>Tier:</span>
                    <select
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-bg border border-line rounded-lg text-xs font-semibold text-ink"
                    >
                      <option value="ALL">All Tiers</option>
                      <option value="STARTER">Starter</option>
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <TableContainer>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>User Profile</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Current Tier</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead align="right">Actions</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" className="py-8 text-muted">
                          Loading registered user profiles...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" className="py-8 text-muted">
                          No users found matching your search criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelf = user?.id === u.id;
                        const initials = u.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();

                        return (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-navy text-[#93C5FD] font-semibold text-xs flex items-center justify-center font-mono border border-line">
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-semibold text-ink text-xs flex items-center gap-2">
                                    <span>{u.name}</span>
                                    {isSelf && (
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue/10 text-blue rounded font-bold">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-muted font-mono">{u.email}</div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-ink text-xs font-medium">
                              {u.company}
                            </TableCell>

                            <TableCell>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                                  u.role === "ADMIN"
                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                    : u.role === "CUSTOMS_BROKER"
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : u.role === "TRADE_ADVISOR"
                                    ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
                                    : "bg-blue-dim text-blue border border-blue/20"
                                }`}
                              >
                                {u.role}
                              </span>
                            </TableCell>

                            <TableCell>
                              <TierBadge tier={u.tier || "STARTER"} size="xs" />
                            </TableCell>

                            <TableCell className="text-muted text-xs font-mono">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                            </TableCell>

                            <TableCell align="right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(u)}
                                  className="p-1.5 rounded-lg hover:bg-bg text-muted hover:text-blue transition-colors cursor-pointer"
                                  title="Edit User Profile & Tier"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  disabled={isSelf}
                                  onClick={() => setDeletingUserItem(u)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    isSelf
                                      ? "opacity-30 cursor-not-allowed text-muted"
                                      : "hover:bg-red/10 text-muted hover:text-red"
                                  }`}
                                  title={isSelf ? "Cannot delete own active session" : "Delete User"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DYNAMIC SAAS PRICING MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              {/* Header Action Bar */}
              <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-ink">Live SaaS Pricing & Feature Tiers</h3>
                  <p className="text-xs text-muted">
                    Changes saved here immediately update the Public Pricing page (/pricing) and
                    Subscription Settings page (/settings).
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (pricingData?.plans) {
                        setEditablePlans(JSON.parse(JSON.stringify(pricingData.plans)));
                        showToast("Pricing form reloaded from database.");
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-bg hover:bg-line border border-line text-muted transition-colors cursor-pointer"
                  >
                    Discard Changes
                  </button>

                  <button
                    type="button"
                    disabled={updatingPricing}
                    onClick={handleSaveAllPricing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue hover:bg-blue-dark text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{updatingPricing ? "Saving..." : "Save Pricing Changes"}</span>
                  </button>
                </div>
              </div>

              {pricingNotice && (
                <div className="p-4 rounded-xl bg-green/10 border border-green/20 text-green-dark text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{pricingNotice}</span>
                </div>
              )}

              {/* Plans Editor Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {editablePlans.map((plan, planIdx) => (
                  <div
                    key={plan.id}
                    className="p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="flex items-center justify-between border-b border-line pb-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                            PLAN ID: {plan.id.toUpperCase()}
                          </span>
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) =>
                              handlePlanFieldChange(planIdx, "name", e.target.value)
                            }
                            className="text-lg font-bold text-ink bg-transparent border-b border-dashed border-line focus:border-blue focus:outline-hidden w-full"
                          />
                        </div>
                        <TierBadge tier={plan.id.toUpperCase()} size="sm" />
                      </div>

                      {/* Tagline */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted">Tagline</label>
                        <textarea
                          rows={2}
                          value={plan.tagline}
                          onChange={(e) =>
                            handlePlanFieldChange(planIdx, "tagline", e.target.value)
                          }
                          className="w-full p-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden resize-none"
                        />
                      </div>

                      {/* Badge & Popular Toggle */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted">Card Badge</label>
                          <input
                            type="text"
                            value={plan.badge || ""}
                            onChange={(e) =>
                              handlePlanFieldChange(planIdx, "badge", e.target.value || null)
                            }
                            placeholder="e.g. MOST POPULAR"
                            className="w-full p-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                          />
                        </div>

                        <div className="flex flex-col justify-end pb-1">
                          <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!plan.isPopular}
                              onChange={(e) =>
                                handlePlanFieldChange(planIdx, "isPopular", e.target.checked)
                              }
                              className="rounded border-line text-blue focus:ring-blue"
                            />
                            <span className="font-semibold text-[11px]">Popular Card</span>
                          </label>
                        </div>
                      </div>

                      {/* Pricing INR */}
                      <div className="p-3 bg-bg rounded-xl border border-line space-y-2.5">
                        <span className="text-[10px] font-bold text-ink font-mono uppercase tracking-wider block">
                          India Outlay (₹ INR)
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted block mb-0.5">Monthly (₹)</label>
                            <input
                              type="number"
                              value={plan.priceMonthlyInr}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  planIdx,
                                  "priceMonthlyInr",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full p-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted block mb-0.5">Annual / mo (₹)</label>
                            <input
                              type="number"
                              value={plan.priceAnnualInr}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  planIdx,
                                  "priceAnnualInr",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full p-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pricing USD */}
                      <div className="p-3 bg-bg rounded-xl border border-line space-y-2.5">
                        <span className="text-[10px] font-bold text-ink font-mono uppercase tracking-wider block">
                          Global Outlay ($ USD)
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted block mb-0.5">Monthly ($)</label>
                            <input
                              type="number"
                              value={plan.priceMonthlyUsd}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  planIdx,
                                  "priceMonthlyUsd",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full p-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted block mb-0.5">Annual / mo ($)</label>
                            <input
                              type="number"
                              value={plan.priceAnnualUsd}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  planIdx,
                                  "priceAnnualUsd",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full p-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Feature Bullet Points */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-muted">
                            Plan Highlights ({plan.features.length})
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddFeature(planIdx)}
                            className="text-[11px] text-blue hover:text-blue-dark font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Bullet</span>
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {plan.features.map((feat, featIdx) => (
                            <div key={featIdx} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={feat}
                                onChange={(e) =>
                                  handleFeatureTextChange(planIdx, featIdx, e.target.value)
                                }
                                className="w-full px-2.5 py-1.5 bg-bg border border-line rounded-lg text-xs text-ink focus:border-blue focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(planIdx, featIdx)}
                                className="p-1.5 text-muted hover:text-red hover:bg-red/10 rounded-lg cursor-pointer"
                                title="Remove bullet point"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* EDIT USER MODAL */}
          {/* ========================================================================= */}
          {editingUserItem && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-panel border border-line rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h3 className="text-base font-bold text-ink">Edit User Account & Role</h3>
                    <p className="text-xs text-muted font-mono">{editingUserItem.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingUserItem(null)}
                    className="p-1 rounded-lg text-muted hover:text-ink cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveUser} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Company / Organization</label>
                    <input
                      type="text"
                      required
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink">Role</label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as AdminUserItem["role"])}
                        className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink font-semibold focus:border-blue focus:outline-hidden"
                      >
                        <option value="IMPORTER">Importer</option>
                        <option value="EXPORTER">Exporter</option>
                        <option value="CUSTOMS_BROKER">Customs Broker</option>
                        <option value="TRADE_ADVISOR">Trade Advisor</option>
                        <option value="ADMIN">Super Admin</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink">Subscription Tier</label>
                      <select
                        value={editTier}
                        onChange={(e) => setEditTier(e.target.value as AdminUserItem["tier"])}
                        className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink font-semibold focus:border-blue focus:outline-hidden"
                      >
                        <option value="STARTER">Starter</option>
                        <option value="PROFESSIONAL">Professional</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-line">
                    <button
                      type="button"
                      onClick={() => setEditingUserItem(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg hover:bg-line border border-line text-muted cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingUser}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue hover:bg-blue-dark text-white shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {updatingUser ? "Saving..." : "Save User"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DELETE USER CONFIRMATION MODAL */}
          {/* ========================================================================= */}
          {deletingUserItem && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-panel border border-red/30 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 text-red">
                  <ShieldAlert className="w-6 h-6" />
                  <h3 className="text-base font-bold text-ink">Delete User Account</h3>
                </div>

                <p className="text-xs text-muted leading-relaxed">
                  Are you sure you want to permanently delete user{" "}
                  <strong className="text-ink">{deletingUserItem.name}</strong> (
                  <span className="font-mono">{deletingUserItem.email}</span>)? All calculations,
                  tokens, and workspace memberships will be purged. This action cannot be undone.
                </p>

                <div className="flex justify-end gap-2 pt-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setDeletingUserItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg hover:bg-line border border-line text-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deletingUser}
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-red hover:bg-red-dark text-white shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {deletingUser ? "Deleting..." : "Permanently Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

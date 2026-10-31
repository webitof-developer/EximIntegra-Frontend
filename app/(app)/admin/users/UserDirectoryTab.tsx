"use client";

import React, { useState, useMemo } from "react";
import { AdminUserItem } from "@/lib/types";
import { useGetAvailableRolesQuery } from "@/store/adminApi";
import { TierBadge } from "@/components/saas/TierBadge";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CustomDropdown,
} from "@/components/ui";
import {
  Search,
  Filter,
  Edit3,
  Trash2,
  X,
  ShieldAlert,
  Users,
  RefreshCw,
  Crown,
  Building2,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface UserDirectoryTabProps {
  users: AdminUserItem[];
  isLoading?: boolean;
  onUpdateUser: (params: {
    id: string;
    name?: string;
    company?: string;
    role?: AdminUserItem["role"];
    tier?: AdminUserItem["tier"];
  }) => Promise<any>;
  onDeleteUser: (userId: string) => Promise<any>;
  showToast: (msg: string) => void;
}

export function UserDirectoryTab({
  users,
  isLoading,
  onUpdateUser,
  onDeleteUser,
  showToast,
}: UserDirectoryTabProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");

  const { data: availableRoles } = useGetAvailableRolesQuery();

  const filterRoleOptions = useMemo(() => {
    const list = [
      { value: "ALL", label: "All Roles" },
      { value: "ADMIN", label: "Super Admin" },
    ];
    if (availableRoles && availableRoles.length > 0) {
      availableRoles.forEach((r) => {
        if (r.role !== "ADMIN") {
          list.push({ value: r.role, label: r.roleName });
        }
      });
    } else {
      list.push(
        { value: "IMPORTER", label: "Importer" },
        { value: "EXPORTER", label: "Exporter" },
        { value: "CUSTOMS_BROKER", label: "Customs Broker" },
        { value: "TRADE_ADVISOR", label: "Trade Advisor" },
        { value: "TRADE_OFFICER", label: "Trade Officer" },
        { value: "AUDITOR", label: "Auditor" }
      );
    }
    return list;
  }, [availableRoles]);

  const modalRoleOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    if (availableRoles && availableRoles.length > 0) {
      availableRoles.forEach((r) => {
        if (r.role !== "ADMIN") {
          list.push({ value: r.role, label: r.roleName });
        }
      });
    } else {
      list.push(
        { value: "IMPORTER", label: "Importer" },
        { value: "EXPORTER", label: "Exporter" },
        { value: "CUSTOMS_BROKER", label: "Customs Broker" },
        { value: "TRADE_ADVISOR", label: "Trade Advisor" },
        { value: "TRADE_OFFICER", label: "Trade Officer" },
        { value: "AUDITOR", label: "Auditor" }
      );
    }
    list.push({ value: "ADMIN", label: "Super Admin" });
    return list;
  }, [availableRoles]);

  // User Edit Modal State
  const [editingUserItem, setEditingUserItem] = useState<AdminUserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState<AdminUserItem["role"]>("IMPORTER");
  const [editTier, setEditTier] = useState<AdminUserItem["tier"]>("STARTER");
  const [updatingUser, setUpdatingUser] = useState(false);

  // User Delete Modal State
  const [deletingUserItem, setDeletingUserItem] = useState<AdminUserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

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

    setUpdatingUser(true);
    try {
      await onUpdateUser({
        id: editingUserItem.id,
        name: editName,
        company: editCompany,
        role: editRole,
        tier: editTier,
      });
      showToast(`User ${editName} updated successfully.`);
      setEditingUserItem(null);
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to update user profile.");
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUserItem) return;
    setDeletingUser(true);
    try {
      await onDeleteUser(deletingUserItem.id);
      showToast(`User ${deletingUserItem.name} has been removed.`);
      setDeletingUserItem(null);
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to delete user account.");
    } finally {
      setDeletingUser(false);
    }
  };

  // Metrics summary
  const totalCount = users.length;
  const paidCount = users.filter((u) => u.tier === "PROFESSIONAL" || u.tier === "ENTERPRISE").length;
  const starterCount = users.filter((u) => u.tier === "STARTER" || !u.tier || u.tier === "FREE_TRIAL").length;
  const tenantCount = new Set(users.map((u) => u.company).filter(Boolean)).size;

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.company && u.company.toLowerCase().includes(q));
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchTier = tierFilter === "ALL" || u.tier === tierFilter;
    return matchSearch && matchRole && matchTier;
  });

  const hasActiveFilters = searchQuery !== "" || roleFilter !== "ALL" || tierFilter !== "ALL";

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("ALL");
    setTierFilter("ALL");
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* 1. Top Quick Metric Cards (Matching /admin styles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Card 1: Total Users */}
        <div
          onClick={resetFilters}
          className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-blue/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Total Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center text-blue group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {totalCount}
          </div>
          <span className="text-[11px] text-muted block truncate">Registered trade profiles</span>
        </div>

        {/* Card 2: Corporate Tenants */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-emerald-500/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Corporate Tenants</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {tenantCount}
          </div>
          <span className="text-[11px] text-muted block truncate">Unique business workspaces</span>
        </div>

        {/* Card 3: Paid Subscriptions */}
        <div
          onClick={() => setTierFilter(tierFilter === "PROFESSIONAL" ? "ALL" : "PROFESSIONAL")}
          className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-amber-500/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Paid Tiers</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-amber-600">
            {paidCount}
          </div>
          <span className="text-[11px] text-muted block truncate">Enterprise & Professional</span>
        </div>

        {/* Card 4: Starter / Trials */}
        <div
          onClick={() => setTierFilter(tierFilter === "STARTER" ? "ALL" : "STARTER")}
          className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-purple-500/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Starter Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {starterCount}
          </div>
          <span className="text-[11px] text-muted block truncate">Evaluation & free tiers</span>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name, corporate email, or company..."
            className="w-full pl-9 pr-8 py-2 bg-bg border border-line rounded-xl text-xs text-ink placeholder:text-muted focus:outline-hidden focus:border-blue transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Filter className="w-3.5 h-3.5 shrink-0 text-muted" />
            <span className="shrink-0 text-xs">Role:</span>
            <div className="w-40">
              <CustomDropdown
                value={roleFilter}
                onChange={(val) => setRoleFilter(val)}
                options={filterRoleOptions}
                size="sm"
                buttonClassName="px-2.5 py-1.5 bg-bg border-line rounded-xl text-xs font-semibold text-ink"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="shrink-0 text-xs">Tier:</span>
            <div className="w-36">
              <CustomDropdown
                value={tierFilter}
                onChange={(val) => setTierFilter(val)}
                options={[
                  { value: "ALL", label: "All Tiers" },
                  { value: "STARTER", label: "Starter" },
                  { value: "PROFESSIONAL", label: "Professional" },
                  { value: "ENTERPRISE", label: "Enterprise" },
                ]}
                size="sm"
                align="right"
                buttonClassName="px-2.5 py-1.5 bg-bg border-line rounded-xl text-xs font-semibold text-ink"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-ink bg-bg hover:bg-slate-100 border border-line transition-all cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <span className="text-[11px] text-muted font-mono whitespace-nowrap hidden sm:inline-block pl-1">
            {filteredUsers.length} of {totalCount} users
          </span>
        </div>
      </div>

      {/* 3. Modern Users Table */}
      <div className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden">
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow className="bg-bg/50 border-b border-line text-[11px] font-medium text-muted uppercase tracking-wider">
                <TableHead className="py-3 px-4">User Details</TableHead>
                <TableHead className="py-3 px-4">Organization</TableHead>
                <TableHead className="py-3 px-4">Role Assignment</TableHead>
                <TableHead className="py-3 px-4">Subscription Tier</TableHead>
                <TableHead className="py-3 px-4">Registered Date</TableHead>
                <TableHead className="py-3 px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue" />
                    <span className="text-xs font-mono">Loading user directory from database...</span>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-muted" />
                    <p className="font-semibold text-ink text-sm">No users match your criteria</p>
                    <p className="text-xs text-muted mt-1">Try adjusting the search query or resetting filters.</p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold bg-bg hover:bg-slate-100 border border-line text-ink transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear Filters</span>
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((item) => {
                  const isAdmin = item.role === "ADMIN";
                  const isSuperAdminEmail = item.email.toLowerCase().includes("admin@");
                  const initials = item.name
                    ? item.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "U";

                  const formattedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recent";

                  return (
                    <TableRow key={item.id} className="hover:bg-bg/60 transition-colors">
                      {/* User Details */}
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full font-bold text-[11px] flex items-center justify-center font-mono shrink-0 shadow-2xs border ${
                              isAdmin
                                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                : "bg-blue/10 text-blue border-blue/20"
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-ink block truncate">{item.name}</span>
                              {isAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/15 text-purple-700 border border-purple-500/30">
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted font-mono block truncate">{item.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Organization */}
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-ink font-medium">
                          <Building2 className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span className="truncate max-w-[180px]">{item.company || "Independent"}</span>
                        </div>
                      </TableCell>

                      {/* Role Assignment */}
                      <TableCell className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-bg border border-line text-ink">
                          {item.role.replace(/_/g, " ")}
                        </span>
                      </TableCell>

                      {/* Subscription Tier */}
                      <TableCell className="py-3 px-4">
                        <TierBadge tier={item.tier} size="xs" />
                      </TableCell>

                      {/* Registered Date */}
                      <TableCell className="py-3 px-4 text-xs text-muted font-mono whitespace-nowrap">
                        {formattedDate}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-muted hover:text-blue hover:bg-blue/10 border border-transparent hover:border-blue/20 transition-colors cursor-pointer"
                            title={`Edit ${item.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {!isSuperAdminEmail ? (
                            <button
                              type="button"
                              onClick={() => setDeletingUserItem(item)}
                              className="p-1.5 rounded-lg text-muted hover:text-red hover:bg-red/10 border border-transparent hover:border-red/20 transition-colors cursor-pointer"
                              title={`Delete ${item.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              title="Primary Super Administrator cannot be deleted"
                              className="p-1.5 text-muted/40 cursor-not-allowed"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
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

      {/* EDIT USER MODAL */}
      {editingUserItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-panel border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue/10 text-blue border border-blue/20">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Edit User Account & Role</h3>
                  <p className="text-[11px] text-muted font-mono">{editingUserItem.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUserItem(null)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink block">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink block">Company / Organization *</label>
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
                  <label className="font-semibold text-ink block">Assigned Role</label>
                  <CustomDropdown
                    value={editRole}
                    onChange={(val) => setEditRole(val as AdminUserItem["role"])}
                    options={modalRoleOptions}
                    buttonClassName="px-3 py-2 bg-bg border-line rounded-xl text-xs text-ink font-semibold focus:border-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-ink block">Subscription Tier</label>
                  <CustomDropdown
                    value={editTier}
                    onChange={(val) => setEditTier(val as AdminUserItem["tier"])}
                    options={[
                      { value: "STARTER", label: "Starter" },
                      { value: "PROFESSIONAL", label: "Professional" },
                      { value: "ENTERPRISE", label: "Enterprise" },
                    ]}
                    buttonClassName="px-3 py-2 bg-bg border-line rounded-xl text-xs text-ink font-semibold focus:border-blue"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingUserItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg hover:bg-panel border border-line text-muted hover:text-ink cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue hover:bg-blue-dark text-white shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  {updatingUser ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {deletingUserItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-panel border border-red/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red/10 text-red border border-red/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Delete User Account</h3>
                <p className="text-[11px] text-muted">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to permanently delete user{" "}
              <strong className="text-ink">{deletingUserItem.name}</strong> (
              <span className="font-mono">{deletingUserItem.email}</span>)? All calculations,
              tokens, and workspace memberships will be purged.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setDeletingUserItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg hover:bg-panel border border-line text-muted hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingUser}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red hover:bg-red-dark text-white shadow-xs cursor-pointer disabled:opacity-50"
              >
                {deletingUser ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

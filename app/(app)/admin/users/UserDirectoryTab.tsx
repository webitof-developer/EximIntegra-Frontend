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
  StatusPill,
  CustomDropdown,
} from "@/components/ui";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  ShieldAlert,
  Users,
  RefreshCw,
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
        { value: "TRADE_ADVISOR", label: "Trade Advisor" }
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
        { value: "TRADE_ADVISOR", label: "Trade Advisor" }
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

  // Filtered Users
  const filteredUsers = users.filter((u) => {
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

  return (
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
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <span className="shrink-0">Role:</span>
            <div className="w-36">
              <CustomDropdown
                value={roleFilter}
                onChange={(val) => setRoleFilter(val)}
                options={filterRoleOptions}
                size="sm"
                buttonClassName="px-2.5 py-1.5 bg-bg border-line rounded-lg text-xs font-semibold text-ink"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="shrink-0">Tier:</span>
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
                buttonClassName="px-2.5 py-1.5 bg-bg border-line rounded-lg text-xs font-semibold text-ink"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Details</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Role Assignment</TableHead>
              <TableHead>Subscription Tier</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue" />
                  <span>Loading user directory...</span>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-ink text-sm">No users matching search filters</p>
                  <p className="text-xs">Adjust query or role/tier parameters above.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((item) => {
                const isAdmin = item.role === "ADMIN";
                const isSuperAdminEmail = item.email.toLowerCase().includes("admin@");

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink">{item.name}</span>
                          {isAdmin && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                              SUPER ADMIN
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted font-mono block">{item.email}</span>
                        <span className="text-[10px] text-muted/70 font-mono block">ID: {item.id}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-ink">{item.company}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-bg border border-line text-ink">
                        {item.role.replace("_", " ")}
                      </span>
                    </TableCell>

                    <TableCell>
                      <TierBadge tier={item.tier} size="xs" />
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted font-mono">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg border border-transparent hover:border-line transition-colors cursor-pointer"
                          title="Edit user profile & permissions"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isSuperAdminEmail && (
                          <button
                            type="button"
                            onClick={() => setDeletingUserItem(item)}
                            className="p-1.5 rounded-lg text-muted hover:text-red hover:bg-red/10 border border-transparent hover:border-red/20 transition-colors cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* EDIT USER MODAL */}
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
                <label className="text-xs font-semibold text-muted">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted">Company / Organization</label>
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
                  <label className="text-xs font-semibold text-muted">Corporate Role</label>
                  <CustomDropdown
                    value={editRole}
                    onChange={(val) => setEditRole(val as AdminUserItem["role"])}
                    options={modalRoleOptions}
                    buttonClassName="px-3 py-2 bg-bg border-line rounded-xl text-xs text-ink font-semibold focus:border-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted">Subscription Plan</label>
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

      {/* DELETE USER CONFIRMATION MODAL */}
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
  );
}

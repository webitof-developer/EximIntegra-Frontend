"use client";

import React, { useState, useEffect, useMemo } from "react";
import { RolePermissionItem, RBACModule } from "@/lib/types";
import {
  useCreateCustomRoleMutation,
  useDeleteCustomRoleMutation,
} from "@/store/adminApi";
import {
  Shield,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Save,
  Search,
  Plus,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  Sparkles,
  Lock,
  Check,
  Filter,
  Layers,
  Building2,
  HelpCircle,
} from "lucide-react";
import { CustomDropdown } from "@/components/ui";

interface RolePermissionsTabProps {
  roles: RolePermissionItem[];
  modules: RBACModule[];
  isLoading?: boolean;
  onSaveRBAC: (roles: RolePermissionItem[]) => Promise<any>;
  showToast: (msg: string) => void;
}

const CATEGORY_DISPLAY_CONFIG: Record<string, { label: string; order: number }> = {
  Main: { label: "Main Navigation", order: 1 },
  "Trade Engine": { label: "Core Trade Engines", order: 2 },
  "HS Classification": { label: "HS Classification & Manifests", order: 3 },
  "Duty Calculator": { label: "Duty & Statutory Valuation", order: 4 },
  "Landed Cost": { label: "Landed Cost & Port Logistics", order: 5 },
  "Intelligence & AI": { label: "Intelligence & AI Copilot", order: 6 },
  "Governance & Audit": { label: "Governance & Audit", order: 7 },
  "Calculation History": { label: "Calculation History & Reports", order: 8 },
  Settings: { label: "Workspace & Developer Settings", order: 9 },
};

const CORE_ROLES = new Set([
  "IMPORTER",
  "EXPORTER",
  "CUSTOMS_BROKER",
  "TRADE_ADVISOR",
  "TRADE_OFFICER",
  "AUDITOR",
]);

const ROLE_THEMES: Record<
  string,
  { bg: string; text: string; border: string; badge: string; accent: string }
> = {
  IMPORTER: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    accent: "bg-blue-500",
  },
  EXPORTER: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  CUSTOMS_BROKER: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    accent: "bg-amber-500",
  },
  TRADE_ADVISOR: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
    badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    accent: "bg-purple-500",
  },
  TRADE_OFFICER: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    border: "border-cyan-500/20",
    badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    accent: "bg-cyan-500",
  },
  AUDITOR: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-500",
    border: "border-indigo-500/20",
    badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    accent: "bg-indigo-500",
  },
};

export function RolePermissionsTab({
  roles,
  modules,
  isLoading,
  onSaveRBAC,
  showToast,
}: RolePermissionsTabProps) {
  const [editableRoles, setEditableRoles] = useState<RolePermissionItem[]>([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [roleFilterType, setRoleFilterType] = useState<"ALL" | "CORE" | "CUSTOM">("ALL");

  // Active Role in Permissions Popup Modal
  const [permissionsModalRole, setPermissionsModalRole] = useState<RolePermissionItem | null>(null);
  const [modalModuleSearch, setModalModuleSearch] = useState("");
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Modals for Create, Edit, Delete
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleCode, setNewRoleCode] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleBase, setNewRoleBase] = useState<string>("IMPORTER");
  const [createError, setCreateError] = useState<string | null>(null);

  const [roleToEdit, setRoleToEdit] = useState<RolePermissionItem | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDesc, setEditRoleDesc] = useState("");

  const [roleToDelete, setRoleToDelete] = useState<RolePermissionItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [createCustomRole, { isLoading: isCreatingRole }] = useCreateCustomRoleMutation();
  const [deleteCustomRole, { isLoading: isDeletingRole }] = useDeleteCustomRoleMutation();

  useEffect(() => {
    if (roles && roles.length > 0) {
      setEditableRoles(JSON.parse(JSON.stringify(roles)));
    }
  }, [roles]);

  // Keep modal role synchronized with editableRoles
  useEffect(() => {
    if (permissionsModalRole) {
      const updated = editableRoles.find((r) => r.role === permissionsModalRole.role);
      if (updated) {
        setPermissionsModalRole(updated);
      }
    }
  }, [editableRoles]);

  // Quick Counts
  const totalRolesCount = editableRoles.length;
  const coreRolesCount = editableRoles.filter((r) => CORE_ROLES.has(r.role)).length;
  const customRolesCount = editableRoles.filter((r) => !CORE_ROLES.has(r.role)).length;
  const totalModulesCount = modules.length;

  // Filtered Roles on main page
  const filteredRoles = useMemo(() => {
    const q = roleSearch.toLowerCase().trim();
    return editableRoles.filter((r) => {
      const isCore = CORE_ROLES.has(r.role);
      if (roleFilterType === "CORE" && !isCore) return false;
      if (roleFilterType === "CUSTOM" && isCore) return false;
      if (!q) return true;
      return (
        r.role.toLowerCase().includes(q) ||
        r.roleName.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
      );
    });
  }, [editableRoles, roleSearch, roleFilterType]);

  // Group modules by Category for Modal
  const categorizedModules = useMemo(() => {
    const q = modalModuleSearch.toLowerCase().trim();
    const map = new Map<string, RBACModule[]>();

    modules.forEach((m) => {
      if (
        q &&
        !m.name.toLowerCase().includes(q) &&
        !m.id.toLowerCase().includes(q) &&
        !m.category.toLowerCase().includes(q)
      ) {
        return;
      }
      const cat = m.category || "Main";
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(m);
    });

    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const orderA = CATEGORY_DISPLAY_CONFIG[a[0]]?.order ?? 99;
      const orderB = CATEGORY_DISPLAY_CONFIG[b[0]]?.order ?? 99;
      return orderA - orderB;
    });

    return entries;
  }, [modules, modalModuleSearch]);

  // Toggle single permission for target role in modal
  const handleToggleModalPermission = (moduleId: string) => {
    if (!permissionsModalRole) return;
    const roleKey = permissionsModalRole.role;
    const currentVal = permissionsModalRole.permissions?.[moduleId] !== false;

    setEditableRoles((prev) =>
      prev.map((r) => {
        if (r.role !== roleKey) return r;
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [moduleId]: !currentVal,
          },
        };
      })
    );
  };

  // Toggle all modules in a category for target role in modal
  const handleToggleCategoryForModal = (catModules: RBACModule[], enableAll: boolean) => {
    if (!permissionsModalRole) return;
    const roleKey = permissionsModalRole.role;

    setEditableRoles((prev) =>
      prev.map((r) => {
        if (r.role !== roleKey) return r;
        const updatedPerms = { ...r.permissions };
        catModules.forEach((m) => {
          updatedPerms[m.id] = enableAll;
        });
        return {
          ...r,
          permissions: updatedPerms,
        };
      })
    );
  };

  // Toggle all modules for target role
  const handleToggleAllForRole = (roleKey: string, enableAll: boolean) => {
    if (!modules.length) return;
    const newPerms: Record<string, boolean> = {};
    modules.forEach((m) => {
      newPerms[m.id] = enableAll;
    });

    setEditableRoles((prev) =>
      prev.map((r) => (r.role === roleKey ? { ...r, permissions: newPerms } : r))
    );

    const roleItem = editableRoles.find((r) => r.role === roleKey);
    showToast(
      `${enableAll ? "Granted all" : "Revoked all"} modules for ${
        roleItem?.roleName || roleKey
      }.`
    );
  };

  // Save Modal Permissions to Database
  const handleSaveModalPermissions = async () => {
    if (!permissionsModalRole) return;
    setIsSavingPermissions(true);
    try {
      await onSaveRBAC(editableRoles);
      showToast(`Permissions saved successfully for ${permissionsModalRole.roleName}.`);
      setPermissionsModalRole(null);
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to persist permissions.");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Submit Create Custom Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const code = newRoleCode
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/[^A-Z0-9_]/g, "");

    if (!code || code.length < 2) {
      setCreateError("Role identifier must be at least 2 alphanumeric characters.");
      return;
    }
    if (code === "ADMIN") {
      setCreateError("Role identifier cannot be 'ADMIN'.");
      return;
    }
    if (!newRoleName.trim()) {
      setCreateError("Role Display Name is required.");
      return;
    }

    try {
      await createCustomRole({
        role: code,
        roleName: newRoleName.trim(),
        description: newRoleDesc.trim(),
        baseRole: newRoleBase,
      }).unwrap();

      showToast(`Custom role '${newRoleName.trim()}' created successfully.`);
      setIsCreateOpen(false);
      setNewRoleCode("");
      setNewRoleName("");
      setNewRoleDesc("");
    } catch (err: any) {
      setCreateError(err?.data?.message || err?.message || "Failed to create custom role.");
    }
  };

  // Save Role Edit Details
  const handleSaveEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleToEdit) return;
    if (!editRoleName.trim()) {
      showToast("Role Display Name cannot be empty.");
      return;
    }

    const updatedRoles = editableRoles.map((r) => {
      if (r.role !== roleToEdit.role) return r;
      return {
        ...r,
        roleName: editRoleName.trim(),
        description: editRoleDesc.trim(),
      };
    });

    try {
      await onSaveRBAC(updatedRoles);
      setEditableRoles(updatedRoles);
      setRoleToEdit(null);
      showToast(`Updated details for ${editRoleName.trim()}.`);
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to update role details.");
    }
  };

  // Delete Custom Role
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setDeleteError(null);
    try {
      await deleteCustomRole(roleToDelete.role).unwrap();
      showToast(`Custom role '${roleToDelete.roleName}' deleted.`);
      setRoleToDelete(null);
    } catch (err: any) {
      setDeleteError(err?.data?.message || err?.message || "Failed to delete custom role.");
    }
  };

  const resetFilters = () => {
    setRoleSearch("");
    setRoleFilterType("ALL");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-panel border border-line rounded-2xl" />
          ))}
        </div>
        <div className="h-16 bg-panel border border-line rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-panel border border-line rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* 1. Top Quick Metric Cards (Matching /admin styles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Card 1: Total Roles */}
        <div
          onClick={resetFilters}
          className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-blue/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Configured Roles</span>
            <div className="w-8 h-8 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center text-blue group-hover:scale-110 transition-transform">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {totalRolesCount} Roles
          </div>
          <span className="text-[11px] text-muted block truncate">Active organizational personas</span>
        </div>

        {/* Card 2: Core Platform Roles */}
        <div
          onClick={() => setRoleFilterType(roleFilterType === "CORE" ? "ALL" : "CORE")}
          className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-emerald-500/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Core Statutory Roles</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-emerald-600">
            {coreRolesCount}
          </div>
          <span className="text-[11px] text-muted block truncate">Built-in statutory compliance roles</span>
        </div>

        {/* Card 3: Custom Workspace Roles */}
        <div
          onClick={() => setRoleFilterType(roleFilterType === "CUSTOM" ? "ALL" : "CUSTOM")}
          className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-purple-500/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Custom Workspace Roles</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {customRolesCount}
          </div>
          <span className="text-[11px] text-muted block truncate">Tenant-specific access matrices</span>
        </div>

        {/* Card 4: Governed Modules */}
        <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-amber-500/40 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Protected Modules</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {totalModulesCount} Modules
          </div>
          <span className="text-[11px] text-muted block truncate">Granular pages, features & sub-tabs</span>
        </div>
      </div>

      {/* 2. Search, Filter & Quick Creation Toolbar */}
      <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search roles by name or identifier..."
            value={roleSearch}
            onChange={(e) => setRoleSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-bg border border-line rounded-xl text-xs text-ink placeholder:text-muted focus:outline-hidden focus:border-blue transition-colors"
          />
          {roleSearch && (
            <button
              type="button"
              onClick={() => setRoleSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Create Action */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* Quick Segment Pills */}
          <div className="inline-flex p-1 bg-bg border border-line rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRoleFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                roleFilterType === "ALL"
                  ? "bg-panel text-ink shadow-2xs font-bold"
                  : "text-muted hover:text-ink"
              }`}
            >
              All ({totalRolesCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilterType("CORE")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                roleFilterType === "CORE"
                  ? "bg-panel text-ink shadow-2xs font-bold"
                  : "text-muted hover:text-ink"
              }`}
            >
              Core ({coreRolesCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilterType("CUSTOM")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                roleFilterType === "CUSTOM"
                  ? "bg-panel text-ink shadow-2xs font-bold"
                  : "text-muted hover:text-ink"
              }`}
            >
              Custom ({customRolesCount})
            </button>
          </div>

          {(roleSearch || roleFilterType !== "ALL") && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-muted hover:text-ink underline cursor-pointer px-1"
            >
              Reset
            </button>
          )}

          {/* Create Custom Role Button */}
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setNewRoleCode("");
              setNewRoleName("");
              setNewRoleDesc("");
              setNewRoleBase("IMPORTER");
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* 3. Role Cards Grid */}
      {filteredRoles.length === 0 ? (
        <div className="p-12 text-center bg-panel border border-line rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/10 border border-line text-muted flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-ink">No roles match your filters</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {roleSearch
              ? `No roles match "${roleSearch}". Try clearing the search query or changing filters.`
              : "No roles available under the selected category."}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-bg border border-line text-xs font-semibold text-ink hover:border-blue/40 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoles.map((rRecord) => {
            const isCore = CORE_ROLES.has(rRecord.role);
            const theme = ROLE_THEMES[rRecord.role] || {
              bg: "bg-purple-500/10",
              text: "text-purple-500",
              border: "border-purple-500/20",
              badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
              accent: "bg-purple-500",
            };

            const perms = rRecord.permissions || {};
            const totalModules = modules.length || 20;
            const activeCount = modules.filter((m) => perms[m.id] !== false).length;
            const pct = Math.round((activeCount / (totalModules || 1)) * 100);

            return (
              <div
                key={rRecord.role}
                className="bg-panel border border-line hover:border-blue/30 rounded-2xl p-5 shadow-xs transition-all hover:-translate-y-0.5 flex flex-col justify-between space-y-4 group"
              >
                {/* Card Top: Avatar, Title, Badges & Action Icons */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.border} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <Shield className={`w-5 h-5 ${theme.text}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-ink text-sm leading-tight flex items-center gap-1.5">
                          {rRecord.roleName}
                        </h3>
                        <span className="text-[10px] font-mono text-muted tracking-wider block mt-0.5">
                          {rRecord.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isCore ? (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-bg border border-line text-muted">
                          Core
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          Custom
                        </span>
                      )}

                      {/* Edit Role Details Icon */}
                      <button
                        type="button"
                        onClick={() => {
                          setRoleToEdit(rRecord);
                          setEditRoleName(rRecord.roleName);
                          setEditRoleDesc(rRecord.description || "");
                        }}
                        className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
                        title="Edit Role Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Custom Role Icon */}
                      {!isCore && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoleToDelete(rRecord);
                            setDeleteError(null);
                          }}
                          className="p-1.5 rounded-lg text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer"
                          title="Delete Custom Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Role Description */}
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed min-h-[34px]">
                    {rRecord.description || "Corporate user role with configured access policies."}
                  </p>

                  {/* Coverage Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-muted">Permission Coverage</span>
                      <span className="font-semibold text-ink">
                        {activeCount}/{totalModules} Active ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden border border-line/40">
                      <div
                        className={`h-full ${theme.accent} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Primary CTA Permissions Button + Quick Shortcuts */}
                <div className="pt-3 border-t border-line/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPermissionsModalRole(rRecord);
                      setModalModuleSearch("");
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-bg hover:bg-panel border border-line hover:border-blue/40 text-ink text-xs font-bold transition-all shadow-2xs group-hover:bg-blue group-hover:text-white group-hover:border-blue cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Configure Permissions</span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleAllForRole(rRecord.role, true)}
                      className="px-2 py-1 text-[11px] font-semibold text-blue hover:text-blue-dark transition-colors cursor-pointer"
                      title="Grant all modules to this role"
                    >
                      Grant All
                    </button>
                    <span className="text-line text-xs">|</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAllForRole(rRecord.role, false)}
                      className="px-2 py-1 text-[11px] font-semibold text-red/80 hover:text-red transition-colors cursor-pointer"
                      title="Revoke all modules for this role"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL: ROLE PERMISSIONS MANAGER                                     */}
      {/* ========================================================================= */}
      {permissionsModalRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150">
          <div className="bg-panel border border-line rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-line bg-panel flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue/10 border border-blue/20 text-blue flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-ink">
                      {permissionsModalRole.roleName}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-bg border border-line text-muted">
                      {permissionsModalRole.role}
                    </span>
                    {CORE_ROLES.has(permissionsModalRole.role) ? (
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-bg border border-line text-muted">
                        Core
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Configure granular module and sub-tab access rules for this role.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPermissionsModalRole(null)}
                className="p-1.5 rounded-xl text-muted hover:text-ink hover:bg-bg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar: Search & Quick Batch Actions */}
            <div className="px-6 py-3 bg-bg/60 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter modules or tabs..."
                  value={modalModuleSearch}
                  onChange={(e) => setModalModuleSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-panel border border-line rounded-xl text-ink text-xs focus:outline-hidden focus:border-blue transition-colors"
                />
                {modalModuleSearch && (
                  <button
                    type="button"
                    onClick={() => setModalModuleSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleToggleAllForRole(permissionsModalRole.role, true)}
                  className="px-3 py-1.5 rounded-xl border border-line bg-panel hover:bg-bg text-blue hover:text-blue-dark text-xs font-semibold transition-colors cursor-pointer"
                >
                  Grant All Modules
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllForRole(permissionsModalRole.role, false)}
                  className="px-3 py-1.5 rounded-xl border border-line bg-panel hover:bg-bg text-red/80 hover:text-red text-xs font-semibold transition-colors cursor-pointer"
                >
                  Revoke All Modules
                </button>
              </div>
            </div>

            {/* Modal Body: Categorized Section Cards */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {categorizedModules.map(([categoryKey, catModules]) => {
                const catConfig = CATEGORY_DISPLAY_CONFIG[categoryKey];
                const catLabel = catConfig?.label || categoryKey;

                const isCatAllEnabled = catModules.every(
                  (m) => permissionsModalRole.permissions?.[m.id] !== false
                );

                return (
                  <div
                    key={categoryKey}
                    className="bg-bg/40 border border-line rounded-xl overflow-hidden shadow-2xs"
                  >
                    {/* Category Header with Allow All Toggle */}
                    <div className="px-4 py-2.5 bg-panel border-b border-line flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink tracking-tight">
                          {catLabel}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-bg border border-line text-muted">
                          {catModules.length} {catModules.length === 1 ? "module" : "modules"}
                        </span>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-muted hover:text-ink transition-colors">
                        <input
                          type="checkbox"
                          checked={isCatAllEnabled}
                          onChange={() =>
                            handleToggleCategoryForModal(catModules, !isCatAllEnabled)
                          }
                          className="w-3.5 h-3.5 rounded border-line text-blue focus:ring-blue cursor-pointer accent-blue"
                        />
                        <span>Allow Section</span>
                      </label>
                    </div>

                    {/* Module Rows */}
                    <div className="divide-y divide-line/60">
                      {catModules.map((m) => {
                        const isAllowed =
                          permissionsModalRole.permissions?.[m.id] !== false;

                        return (
                          <div
                            key={m.id}
                            onClick={() => handleToggleModalPermission(m.id)}
                            className="px-4 py-2.5 flex items-center justify-between hover:bg-panel/70 transition-colors cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isAllowed}
                                onChange={() => handleToggleModalPermission(m.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 rounded border-line text-blue focus:ring-blue cursor-pointer accent-blue"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-ink">
                                    {m.name}
                                  </span>
                                  {m.type === "tab" ? (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-line/60 text-muted uppercase">
                                      Tab
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-blue/10 text-blue uppercase">
                                      Page
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-muted block mt-0.5">
                                  {m.id}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md ${
                                  isAllowed
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-muted/10 text-muted border border-line"
                                }`}
                              >
                                {isAllowed ? "Allowed" : "Restricted"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-line bg-panel flex items-center justify-between gap-4">
              <div className="text-xs text-muted font-mono">
                <span className="font-semibold text-ink">
                  {
                    modules.filter(
                      (m) => permissionsModalRole.permissions?.[m.id] !== false
                    ).length
                  }
                </span>{" "}
                of {modules.length} modules granted
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setPermissionsModalRole(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalPermissions}
                  disabled={isSavingPermissions}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue hover:bg-blue-dark text-white transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingPermissions ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Permissions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE CUSTOM ROLE                                                 */}
      {/* ========================================================================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRole}
            className="bg-panel border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue/10 border border-blue/20 text-blue flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Create Custom Role</h3>
                  <p className="text-[11px] text-muted">Define a custom organizational persona</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red/10 border border-red/20 text-red text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Role Identifier (Code) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LOGISTICS_COORDINATOR"
                  value={newRoleCode}
                  onChange={(e) =>
                    setNewRoleCode(
                      e.target.value
                        .toUpperCase()
                        .replace(/\s+/g, "_")
                        .replace(/[^A-Z0-9_]/g, "")
                    )
                  }
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-hidden focus:border-blue text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Role Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Logistics Coordinator"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-hidden focus:border-blue text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Role Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Coordinates port customs clearance, warehouse transfers, and manifest filings."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-hidden focus:border-blue text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Inherit Permissions From Template
                </label>
                <CustomDropdown
                  value={newRoleBase}
                  onChange={(val) => setNewRoleBase(val)}
                  options={editableRoles.map((r) => ({
                    value: r.role,
                    label: `${r.roleName} Template`,
                  }))}
                  size="sm"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingRole}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue hover:bg-blue-dark text-white transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isCreatingRole && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Role</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT ROLE DETAILS                                                  */}
      {/* ========================================================================= */}
      {roleToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditRole}
            className="bg-panel border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue/10 border border-blue/20 text-blue flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Edit Role Details</h3>
                  <span className="text-xs font-mono text-muted">{roleToEdit.role}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoleToEdit(null)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Role Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-hidden focus:border-blue text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">Description</label>
                <textarea
                  rows={3}
                  value={editRoleDesc}
                  onChange={(e) => setEditRoleDesc(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-hidden focus:border-blue text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setRoleToEdit(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue hover:bg-blue-dark text-white transition-colors cursor-pointer shadow-2xs"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CUSTOM ROLE CONFIRMATION                                    */}
      {/* ========================================================================= */}
      {roleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-panel border border-line rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red/10 border border-red/20 text-red flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-sm font-bold text-ink">
                Delete Role &quot;{roleToDelete.roleName}&quot;?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Are you sure you want to permanently delete custom role{" "}
                <span className="font-mono font-bold text-ink">
                  {roleToDelete.role}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red/10 border border-red/20 text-red text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border border-line bg-bg text-muted hover:text-ink transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
                disabled={isDeletingRole}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red hover:bg-red-dark text-white transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isDeletingRole ? "Deleting..." : "Delete Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

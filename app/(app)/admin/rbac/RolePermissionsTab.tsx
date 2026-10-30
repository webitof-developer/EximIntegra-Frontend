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
  Unlock,
  Check,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
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
  Main: { label: "Main", order: 1 },
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

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Role-Based Access Control (RBAC) Governance
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Create and manage corporate user roles, and click the{" "}
              <span className="font-semibold text-ink">Permissions</span> button on any role
              card to customize its module access rules in a focused modal.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Role</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line/60">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search roles by name or identifier..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-bg border border-line rounded-xl text-ink text-xs focus:outline-hidden focus:border-blue transition-colors"
            />
            {roleSearch && (
              <button
                type="button"
                onClick={() => setRoleSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="inline-flex p-1 bg-bg border border-line rounded-xl text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setRoleFilterType("ALL")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  roleFilterType === "ALL"
                    ? "bg-panel text-ink shadow-xs"
                    : "text-muted hover:text-ink"
                }`}
              >
                All Roles ({editableRoles.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilterType("CORE")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  roleFilterType === "CORE"
                    ? "bg-panel text-ink shadow-xs"
                    : "text-muted hover:text-ink"
                }`}
              >
                Core Roles ({editableRoles.filter((r) => CORE_ROLES.has(r.role)).length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilterType("CUSTOM")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  roleFilterType === "CUSTOM"
                    ? "bg-panel text-ink shadow-xs"
                    : "text-muted hover:text-ink"
                }`}
              >
                Custom Roles ({editableRoles.filter((r) => !CORE_ROLES.has(r.role)).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Role Cards Grid */}
      {filteredRoles.length === 0 ? (
        <div className="p-12 text-center bg-panel border border-line rounded-2xl space-y-3">
          <Shield className="w-8 h-8 text-muted mx-auto" />
          <h3 className="text-sm font-bold text-ink">No roles found</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {roleSearch
              ? `No roles match your search "${roleSearch}". Try clearing the search query.`
              : "No roles available in this filter."}
          </p>
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
                className="bg-panel border border-line hover:border-line/80 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Card Top: Avatar, Title, Badges & Action Icons */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.border} border flex items-center justify-center shrink-0`}
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
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-panel border border-line text-muted">
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
                          title="Delete Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Role Description */}
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed min-h-[32px]">
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
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-bg hover:bg-panel border border-line hover:border-blue/50 text-ink text-xs font-bold transition-all shadow-2xs group-hover:bg-blue group-hover:text-white group-hover:border-blue cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Permissions</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleAllForRole(rRecord.role, true)}
                      className="px-2 py-1 text-[11px] font-semibold text-blue hover:text-blue-dark transition-colors cursor-pointer"
                      title="Grant all modules"
                    >
                      Grant All
                    </button>
                    <span className="text-line text-xs">|</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAllForRole(rRecord.role, false)}
                      className="px-2 py-1 text-[11px] font-semibold text-red/80 hover:text-red transition-colors cursor-pointer"
                      title="Revoke all modules"
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
          <div className="bg-panel border border-line rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-line bg-panel flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center shrink-0">
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
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-sm bg-line/50 text-muted">
                        Core
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-sm bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Toggle module access rules specifically for this role.
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
                  placeholder="Filter modules or specialized tabs..."
                  value={modalModuleSearch}
                  onChange={(e) => setModalModuleSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-panel border border-line rounded-lg text-ink text-xs focus:outline-hidden focus:border-blue"
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
                  className="px-3 py-1.5 rounded-lg border border-line bg-panel hover:bg-bg text-blue hover:text-blue-dark text-xs font-semibold transition-colors cursor-pointer"
                >
                  Grant All Modules
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllForRole(permissionsModalRole.role, false)}
                  className="px-3 py-1.5 rounded-lg border border-line bg-panel hover:bg-bg text-red/80 hover:text-red text-xs font-semibold transition-colors cursor-pointer"
                >
                  Revoke All Modules
                </button>
              </div>
            </div>

            {/* Modal Body: Categorized Section Cards */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {categorizedModules.map(([categoryKey, catModules]) => {
                const catConfig = CATEGORY_DISPLAY_CONFIG[categoryKey];
                const catLabel = catConfig?.label || categoryKey;

                const isCatAllEnabled = catModules.every(
                  (m) => permissionsModalRole.permissions?.[m.id] !== false
                );

                return (
                  <div
                    key={categoryKey}
                    className="bg-bg border border-line rounded-xl overflow-hidden shadow-2xs"
                  >
                    {/* Category Header with Allow All Toggle */}
                    <div className="px-4 py-2.5 bg-panel border-b border-line flex items-center justify-between">
                      <span className="text-xs font-bold text-ink tracking-tight">
                        {catLabel}
                      </span>

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
                            className="px-4 py-2.5 flex items-center justify-between hover:bg-panel/60 transition-colors cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2.5">
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

                            <span
                              className={`text-[11px] font-semibold font-mono ${
                                isAllowed ? "text-green" : "text-muted"
                              }`}
                            >
                              {isAllowed ? "Enabled" : "Disabled"}
                            </span>
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
                {
                  modules.filter(
                    (m) => permissionsModalRole.permissions?.[m.id] !== false
                  ).length
                }{" "}
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
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue hover:bg-blue-dark text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
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
            className="bg-panel border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Create Custom Role</h3>
                <p className="text-xs text-muted">
                  Define a new corporate trade role and inherit base permissions.
                </p>
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

            <div className="space-y-3 text-xs">
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
                <span className="text-[10px] text-muted block">
                  Uppercase letters and underscores only (e.g. WAREHOUSE_OFFICER).
                </span>
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue hover:bg-blue-dark text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
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
              <div>
                <h3 className="text-base font-bold text-ink">Edit Role</h3>
                <span className="text-xs font-mono text-muted">{roleToEdit.role}</span>
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
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue hover:bg-blue-dark text-white transition-colors cursor-pointer shadow-xs"
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
            <div className="w-11 h-11 rounded-2xl bg-red/10 border border-red/20 text-red flex items-center justify-center mx-auto">
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
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red hover:bg-red-dark text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
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

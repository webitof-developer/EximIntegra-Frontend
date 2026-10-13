"use client";

import React, { useState, useEffect } from "react";
import { RolePermissionItem, RBACModule } from "@/lib/types";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui";
import {
  Sliders,
  CheckCircle2,
  RefreshCw,
  Save,
  Search,
  Filter,
  Check,
  Lock,
} from "lucide-react";

interface RolePermissionsTabProps {
  roles: RolePermissionItem[];
  modules: RBACModule[];
  isLoading?: boolean;
  onSaveRBAC: (roles: RolePermissionItem[]) => Promise<any>;
  showToast: (msg: string) => void;
}

export function RolePermissionsTab({
  roles,
  modules,
  isLoading,
  onSaveRBAC,
  showToast,
}: RolePermissionsTabProps) {
  const [editableRoles, setEditableRoles] = useState<RolePermissionItem[]>([]);
  const [isRbacDirty, setIsRbacDirty] = useState(false);
  const [rbacNotice, setRbacNotice] = useState<string | null>(null);
  const [rbacSearch, setRbacSearch] = useState("");
  const [rbacCategoryFilter, setRbacCategoryFilter] = useState("ALL");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (roles && roles.length > 0) {
      setEditableRoles(JSON.parse(JSON.stringify(roles)));
      setIsRbacDirty(false);
    }
  }, [roles]);

  const handleTogglePermission = (roleKey: string, moduleId: string) => {
    setEditableRoles((prev) =>
      prev.map((r) => {
        if (r.role !== roleKey) return r;
        const currentVal = r.permissions?.[moduleId] !== false;
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [moduleId]: !currentVal,
          },
        };
      })
    );
    setIsRbacDirty(true);
  };

  const handleToggleAllForRole = (roleKey: string, enableAll: boolean) => {
    if (!modules || modules.length === 0) return;
    setEditableRoles((prev) =>
      prev.map((r) => {
        if (r.role !== roleKey) return r;
        const newPerms: Record<string, boolean> = {};
        modules.forEach((m) => {
          newPerms[m.id] = enableAll;
        });
        return {
          ...r,
          permissions: newPerms,
        };
      })
    );
    setIsRbacDirty(true);
    showToast(`${enableAll ? "Granted" : "Revoked"} all permissions for ${roleKey.replace("_", " ")}.`);
  };

  const handleSaveRBAC = async () => {
    setIsSaving(true);
    try {
      await onSaveRBAC(editableRoles);
      setIsRbacDirty(false);
      setRbacNotice("RBAC permissions matrix successfully saved and enforced across all client sessions!");
      setTimeout(() => setRbacNotice(null), 4000);
      showToast("RBAC permissions matrix saved.");
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to update RBAC permissions matrix.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Modules
  const filteredModules = modules.filter((m) => {
    const q = rbacSearch.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q);
    const matchesCat =
      rbacCategoryFilter === "ALL" ||
      (rbacCategoryFilter === "PAGES" && m.type === "page") ||
      (rbacCategoryFilter === "TABS" && m.type === "tab") ||
      m.category === rbacCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Notices */}
      {rbacNotice && (
        <div className="p-4 rounded-xl bg-green/10 border border-green/20 text-green-dark text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green" />
          <span>{rbacNotice}</span>
        </div>
      )}

      {isRbacDirty && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
            <span>You have unsaved changes to role permissions. Click Save to persist changes to the database.</span>
          </div>
          <button
            type="button"
            onClick={handleSaveRBAC}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Changes</span>
          </button>
        </div>
      )}

      {/* Header Card & Quick Role Action Cards */}
      <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Role-Based Access Control (RBAC) Permissions Matrix
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Configure granular access across all 4 corporate user roles:{" "}
              <span className="font-semibold text-ink">Importer</span>,{" "}
              <span className="font-semibold text-ink">Exporter</span>,{" "}
              <span className="font-semibold text-ink">Customs Broker</span>, and{" "}
              <span className="font-semibold text-ink">Trade Advisor</span>.
              Toggles dynamically gate pages, sidebar items, and specialized sub-features.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (roles) {
                  setEditableRoles(JSON.parse(JSON.stringify(roles)));
                  setIsRbacDirty(false);
                  showToast("Reset local matrix to current database state.");
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-bg text-muted hover:text-ink text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </button>

            <button
              type="button"
              onClick={handleSaveRBAC}
              disabled={isSaving || !isRbacDirty}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save RBAC Matrix</span>
            </button>
          </div>
        </div>

        {/* Role Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: "IMPORTER", label: "Importer", color: "blue", desc: "Commercial entities importing goods, customs clearance & landed costs" },
            { key: "EXPORTER", label: "Exporter", color: "emerald", desc: "Exporters evaluating foreign tariffs, RoDTEP & trade agreements" },
            { key: "CUSTOMS_BROKER", label: "Customs Broker", color: "amber", desc: "Licensed agents executing bulk filings, classifications & manifests" },
            { key: "TRADE_ADVISOR", label: "Trade Advisor", color: "purple", desc: "Global trade consultants performing country arbitrage & intelligence" },
          ].map((rInfo) => {
            const roleRecord = editableRoles.find((r) => r.role === rInfo.key);
            const perms = roleRecord?.permissions || {};
            const totalModules = modules.length || 19;
            const activeCount = modules.filter((m) => perms[m.id] !== false).length;

            return (
              <div
                key={rInfo.key}
                className="p-4 bg-bg border border-line rounded-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-sm flex items-center gap-1.5">
                      {rInfo.label}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-panel border border-line text-ink">
                      {activeCount}/{totalModules} Active
                    </span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-2">
                    {rInfo.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-line/50 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleAllForRole(rInfo.key, true)}
                    className="text-[11px] font-semibold text-blue hover:text-blue-dark transition-colors cursor-pointer"
                  >
                    Grant All
                  </button>
                  <span className="text-line">|</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAllForRole(rInfo.key, false)}
                    className="text-[11px] font-semibold text-red/80 hover:text-red transition-colors cursor-pointer"
                  >
                    Revoke All
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-panel border border-line rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={rbacSearch}
            onChange={(e) => setRbacSearch(e.target.value)}
            placeholder="Search pages or tabs..."
            className="w-full pl-9 pr-3.5 py-2 bg-bg border border-line rounded-xl text-xs text-ink placeholder:text-muted focus:outline-hidden focus:border-purple-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs text-muted flex items-center gap-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {[
            { id: "ALL", label: "All Items" },
            { id: "PAGES", label: "Core Pages Only" },
            { id: "TABS", label: "Sub-Tabs Only" },
            { id: "Trade Engine", label: "Trade Engine" },
            { id: "Intelligence & AI", label: "AI Copilot" },
            { id: "Governance & Audit", label: "Audit & Settings" },
          ].map((filterOpt) => (
            <button
              key={filterOpt.id}
              type="button"
              onClick={() => setRbacCategoryFilter(filterOpt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                rbacCategoryFilter === filterOpt.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-bg text-muted hover:text-ink border border-line"
              }`}
            >
              {filterOpt.label}
            </button>
          ))}
        </div>
      </div>

      {/* RBAC Matrix Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-72">Platform Page / Capability Tab</TableHead>
              <TableHead className="w-40">Category</TableHead>
              <TableHead className="text-center w-32">
                <div className="flex flex-col items-center">
                  <span>Importer</span>
                  <span className="text-[10px] text-muted font-normal">Commercial</span>
                </div>
              </TableHead>
              <TableHead className="text-center w-32">
                <div className="flex flex-col items-center">
                  <span>Exporter</span>
                  <span className="text-[10px] text-muted font-normal">Manufacturer</span>
                </div>
              </TableHead>
              <TableHead className="text-center w-32">
                <div className="flex flex-col items-center">
                  <span>Customs Broker</span>
                  <span className="text-[10px] text-muted font-normal">Agent / CHA</span>
                </div>
              </TableHead>
              <TableHead className="text-center w-32">
                <div className="flex flex-col items-center">
                  <span>Trade Advisor</span>
                  <span className="text-[10px] text-muted font-normal">Consultant</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-400" />
                  <span>Loading RBAC permissions matrix...</span>
                </TableCell>
              </TableRow>
            ) : filteredModules.map((moduleItem) => {
              return (
                <TableRow key={moduleItem.id} className="hover:bg-bg/40 transition-colors">
                  {/* Module Name & Details */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink text-xs">
                          {moduleItem.name}
                        </span>
                        {moduleItem.type === "page" ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue/15 text-blue border border-blue/25">
                            PAGE
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            TAB
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted font-mono">
                        <span>ID: {moduleItem.id}</span>
                        {moduleItem.href && (
                          <>
                            <span>•</span>
                            <span className="text-blue/80">{moduleItem.href}</span>
                          </>
                        )}
                        {moduleItem.parent && (
                          <>
                            <span>•</span>
                            <span>Parent: {moduleItem.parent}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <span className="text-xs text-muted font-medium px-2 py-1 rounded-md bg-bg border border-line">
                      {moduleItem.category}
                    </span>
                  </TableCell>

                  {/* 4 Role Columns with Checkboxes */}
                  {["IMPORTER", "EXPORTER", "CUSTOMS_BROKER", "TRADE_ADVISOR"].map((roleKey) => {
                    const roleRecord = editableRoles.find((r) => r.role === roleKey);
                    const isAllowed = roleRecord?.permissions?.[moduleItem.id] !== false;

                    return (
                      <TableCell key={roleKey} className="text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(roleKey, moduleItem.id)}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isAllowed
                              ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 shadow-xs"
                              : "bg-red/10 hover:bg-red/20 text-red border border-red/20 opacity-70 hover:opacity-100"
                          }`}
                          title={`Click to ${isAllowed ? "deny" : "allow"} for ${roleKey}`}
                        >
                          {isAllowed ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Allowed</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Denied</span>
                            </>
                          )}
                        </button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

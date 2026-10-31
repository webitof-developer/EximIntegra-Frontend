"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TierPageAccessGate } from "@/lib/types";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { PlanGateTemplate } from "@/components/saas/PlanGateTemplate";
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
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  Filter,
  Save,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Crown,
  Layers,
  RefreshCw,
} from "lucide-react";

interface TierAccessTabProps {
  initialGates: TierPageAccessGate[];
  availableTiers?: string[];
  isLoading?: boolean;
  onSaveGates: (gates: TierPageAccessGate[]) => Promise<any>;
  onCreateGate?: (gate: TierPageAccessGate) => Promise<any>;
  onDeleteGate?: (gateId: string) => Promise<any>;
  showToast: (msg: string) => void;
}

export function TierAccessTab({
  initialGates,
  availableTiers = ["ALL", "STARTER", "PROFESSIONAL", "ENTERPRISE"],
  isLoading,
  onSaveGates,
  onCreateGate,
  onDeleteGate,
  showToast,
}: TierAccessTabProps) {
  const [gates, setGates] = useState<TierPageAccessGate[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");

  // Modal states
  const [previewGate, setPreviewGate] = useState<TierPageAccessGate | null>(null);
  const [editingGate, setEditingGate] = useState<TierPageAccessGate | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newGate, setNewGate] = useState<Partial<TierPageAccessGate>>({
    id: "",
    pagePath: "/",
    title: "",
    category: "Trade Engine",
    description: "",
    requiredTier: "PROFESSIONAL",
    isActive: true,
  });

  const [gateToDelete, setGateToDelete] = useState<TierPageAccessGate | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingGate, setIsDeletingGate] = useState(false);

  useEffect(() => {
    if (initialGates && initialGates.length > 0) {
      setGates(JSON.parse(JSON.stringify(initialGates)));
      setIsDirty(false);
    }
  }, [initialGates]);

  // Handle tier change for a gate
  const handleTierChange = (gateId: string, newTier: string) => {
    setGates((prev) =>
      prev.map((g) => (g.id === gateId ? { ...g, requiredTier: newTier } : g))
    );
    setIsDirty(true);
  };

  // Handle active/inactive toggle
  const handleToggleActive = (gateId: string) => {
    setGates((prev) =>
      prev.map((g) => (g.id === gateId ? { ...g, isActive: !g.isActive } : g))
    );
    setIsDirty(true);
  };

  // Handle edit save
  const handleSaveEdit = (updated: TierPageAccessGate) => {
    setGates((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setIsDirty(true);
    setEditingGate(null);
    showToast(`Updated copy for "${updated.title}". Click Save Access Changes to persist.`);
  };

  // Handle create new gate - persists immediately to DB
  const handleCreateGate = async () => {
    setCreateError(null);
    if (!newGate.id || !newGate.title || !newGate.pagePath) {
      setCreateError("Please fill in ID, Title, and Route Path.");
      return;
    }
    const cleanId = newGate.id.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (gates.some((g) => g.id === cleanId)) {
      setCreateError(`A gate with ID "${cleanId}" already exists.`);
      return;
    }

    const created: TierPageAccessGate = {
      id: cleanId,
      pagePath: newGate.pagePath.startsWith("/") ? newGate.pagePath : `/${newGate.pagePath}`,
      title: newGate.title,
      category: newGate.category || "Trade Engine",
      description:
        newGate.description ||
        `Access to ${newGate.title} requires ${newGate.requiredTier || "PROFESSIONAL"} plan access.`,
      requiredTier: newGate.requiredTier || "PROFESSIONAL",
      isActive: newGate.isActive !== false,
    };

    setIsSaving(true);
    try {
      if (onCreateGate) {
        await onCreateGate(created);
      } else {
        await onSaveGates([...gates, created]);
      }
      setGates((prev) => {
        if (prev.some((g) => g.id === created.id)) return prev;
        return [...prev, created];
      });
      setIsCreateOpen(false);
      setNewGate({
        id: "",
        pagePath: "/",
        title: "",
        category: "Trade Engine",
        description: "",
        requiredTier: "PROFESSIONAL",
        isActive: true,
      });
    } catch (err: any) {
      setCreateError(err?.data?.error?.message || err?.message || "Failed to create gate.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete gate - persists immediately to DB
  const handleDeleteGate = async () => {
    if (!gateToDelete) return;
    setDeleteError(null);
    setIsDeletingGate(true);
    try {
      if (onDeleteGate) {
        await onDeleteGate(gateToDelete.id);
      } else {
        await onSaveGates(gates.filter((g) => g.id !== gateToDelete.id));
      }
      setGates((prev) => prev.filter((g) => g.id !== gateToDelete.id));
      setGateToDelete(null);
    } catch (err: any) {
      setDeleteError(err?.data?.error?.message || err?.message || "Failed to delete gate.");
    } finally {
      setIsDeletingGate(false);
    }
  };

  // Save all gates to backend
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveGates(gates);
      setIsDirty(false);
    } catch (err: any) {
      showToast("Failed to save tier access rules: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setTierFilter("ALL");
  };

  // Filtered gates
  const filteredGates = useMemo(() => {
    return gates.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.pagePath.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === "ALL" || g.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesTier =
        tierFilter === "ALL" ||
        g.requiredTier.toUpperCase() === tierFilter.toUpperCase();

      return matchesSearch && matchesCategory && matchesTier;
    });
  }, [gates, searchQuery, categoryFilter, tierFilter]);

  const allCategories = useMemo(() => {
    return Array.from(new Set(gates.map((g) => g.category))).filter(Boolean);
  }, [gates]);

  // Statistics
  const totalGates = gates.length;
  const activeGates = gates.filter((g) => g.isActive && g.requiredTier !== "ALL").length;
  const enterpriseGates = gates.filter((g) => g.isActive && g.requiredTier === "ENTERPRISE").length;
  const professionalGates = gates.filter((g) => g.isActive && g.requiredTier === "PROFESSIONAL").length;
  const openGates = gates.filter((g) => !g.isActive || g.requiredTier === "ALL").length;

  const hasActiveFilters = searchQuery !== "" || categoryFilter !== "ALL" || tierFilter !== "ALL";

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-panel border border-line rounded-2xl" />
          ))}
        </div>
        <div className="h-16 bg-panel border border-line rounded-2xl" />
        <div className="h-80 bg-panel border border-line rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Quick Metric Cards (Matching /admin & /admin/users styles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Card 1: Total Managed Pages */}
        <div
          onClick={resetFilters}
          className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-blue/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Managed Pages</span>
            <div className="w-8 h-8 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center text-blue group-hover:scale-110 transition-transform">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {totalGates} Gates
          </div>
          <span className="text-[11px] text-muted block truncate font-mono">
            {activeGates} active gating rules enforced
          </span>
        </div>

        {/* Card 2: Enterprise Exclusives */}
        <div
          onClick={() => setTierFilter(tierFilter === "ENTERPRISE" ? "ALL" : "ENTERPRISE")}
          className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-purple-500/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Enterprise Gated</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-purple-600">
            {enterpriseGates}
          </div>
          <span className="text-[11px] text-muted block truncate font-mono">
            Exclusive to Enterprise tier
          </span>
        </div>

        {/* Card 3: Professional & Above */}
        <div
          onClick={() => setTierFilter(tierFilter === "PROFESSIONAL" ? "ALL" : "PROFESSIONAL")}
          className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-amber-500/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Professional & Above</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-ink">
            {professionalGates}
          </div>
          <span className="text-[11px] text-muted block truncate font-mono">
            Pro & Enterprise access
          </span>
        </div>

        {/* Card 4: Open Access */}
        <div
          onClick={() => setTierFilter(tierFilter === "ALL" && categoryFilter === "ALL" ? "STARTER" : "ALL")}
          className="p-4 bg-panel border border-line rounded-2xl shadow-xs space-y-2 hover:border-emerald-500/40 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-xs font-medium text-muted">Open Access / All</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Unlock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-data text-emerald-600">
            {openGates}
          </div>
          <span className="text-[11px] text-muted block truncate font-mono">
            Accessible on all plan tiers
          </span>
        </div>
      </div>

      {/* 2. Search, Filter & Actions Toolbar */}
      <div className="p-4 bg-panel border border-line rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search page, path, or copy..."
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

        {/* Filters and Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="shrink-0 text-xs">Category:</span>
            <div className="w-40">
              <CustomDropdown
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: "ALL", label: "All Categories" },
                  ...allCategories.map((c) => ({ value: c, label: c })),
                ]}
                size="sm"
                buttonClassName="px-2.5 py-1.5 bg-bg border-line rounded-xl text-xs font-semibold text-ink"
              />
            </div>
          </div>

          {/* Tier Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="shrink-0 text-xs">Tier:</span>
            <div className="w-40">
              <CustomDropdown
                value={tierFilter}
                onChange={setTierFilter}
                options={[
                  { value: "ALL", label: "All Tiers" },
                  { value: "ENTERPRISE", label: "Enterprise Only" },
                  { value: "PROFESSIONAL", label: "Professional & Up" },
                  { value: "STARTER", label: "Starter & Up" },
                ]}
                size="sm"
                buttonClassName="px-2.5 py-1.5 bg-bg border-line rounded-xl text-xs font-semibold text-ink"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-muted hover:text-ink underline cursor-pointer px-1"
            >
              Reset
            </button>
          )}

          {/* Add Page Gate Button */}
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg border border-line hover:border-blue/40 text-ink text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:bg-panel"
          >
            <Plus className="w-3.5 h-3.5 text-blue" />
            <span>Add Page Gate</span>
          </button>

          {/* Save All Changes Button */}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!isDirty || isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isDirty
                ? "bg-blue hover:bg-blue-dark text-white ring-2 ring-blue/20"
                : "bg-panel border border-line text-muted cursor-not-allowed opacity-50"
            }`}
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Saving..." : isDirty ? "Save Access Changes *" : "Saved"}</span>
          </button>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px]">Page / Feature</TableHead>
              <TableHead className="w-[140px]">Category</TableHead>
              <TableHead className="w-[220px]">Required Minimum Tier</TableHead>
              <TableHead className="w-[120px] text-center">Enforcement</TableHead>
              <TableHead className="w-[240px]">Locked Message / Benefit</TableHead>
              <TableHead className="w-[130px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGates.map((gate) => {
              return (
                <TableRow key={gate.id} className="hover:bg-bg/40 transition-colors">
                  {/* Name and Route */}
                  <TableCell className="align-top py-3.5">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-ink flex items-center gap-2">
                        <span>{gate.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-bg border border-line text-muted font-bold">
                          {gate.pagePath}
                        </span>
                        <span className="font-mono text-[10px] text-muted">({gate.id})</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="align-top py-3.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-panel border border-line text-muted">
                      {gate.category}
                    </span>
                  </TableCell>

                  {/* Required Tier Dropdown */}
                  <TableCell className="align-top py-3.5">
                    <div className="w-[200px]">
                      <CustomDropdown
                        value={gate.requiredTier}
                        onChange={(val) => handleTierChange(gate.id, val)}
                        options={[
                          { value: "ALL", label: "Open (All Users)" },
                          { value: "STARTER", label: "Starter & Above" },
                          { value: "PROFESSIONAL", label: "Professional & Above" },
                          { value: "ENTERPRISE", label: "Enterprise Only" },
                        ]}
                        size="sm"
                      />
                    </div>
                  </TableCell>

                  {/* Toggle Active / Enforced */}
                  <TableCell className="align-top py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(gate.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer border ${
                        gate.isActive
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                          : "bg-muted/10 border-line text-muted"
                      }`}
                      title={gate.isActive ? "Gate is active (enforced)" : "Gate is disabled (open)"}
                    >
                      {gate.isActive ? (
                        <>
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>Gated</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-muted" />
                          <span>Open</span>
                        </>
                      )}
                    </button>
                  </TableCell>

                  {/* Description preview */}
                  <TableCell className="align-top py-3.5">
                    <p className="text-xs text-muted line-clamp-2 max-w-xs leading-relaxed">
                      {gate.description || "Default plan upgrade message will be displayed."}
                    </p>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="align-top py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Preview Gate Template Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewGate(gate)}
                        title="Preview Locked Template & Plan Card"
                        className="p-1.5 rounded-lg border border-line hover:border-blue text-muted hover:text-blue hover:bg-bg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Copy Button */}
                      <button
                        type="button"
                        onClick={() => setEditingGate(gate)}
                        title="Edit Page Gate Title & Description"
                        className="p-1.5 rounded-lg border border-line hover:border-blue text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Custom Gate */}
                      <button
                        type="button"
                        onClick={() => {
                          setGateToDelete(gate);
                          setDeleteError(null);
                        }}
                        title="Delete Gate"
                        className="p-1.5 rounded-lg border border-line hover:border-red/40 text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredGates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted text-xs">
                  <div className="space-y-2">
                    <Lock className="w-6 h-6 text-muted mx-auto opacity-50" />
                    <p>No page tier gates found matching your search and filter criteria.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-3 py-1.5 rounded-lg bg-panel border border-line text-xs font-semibold text-ink hover:border-blue cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ========================================================================= */}
      {/* MODAL 1: LIVE PREVIEW TEMPLATE MODAL                                      */}
      {/* ========================================================================= */}
      {previewGate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setPreviewGate(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-4 my-8 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-muted uppercase">
                  Live Gate Template Preview
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue/10 text-blue font-bold border border-blue/20">
                  {previewGate.pagePath}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewGate(null)}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded PlanGateTemplate */}
            <PlanGateTemplate
              requiredTier={previewGate.requiredTier}
              featureName={previewGate.title}
              description={previewGate.description}
              category={previewGate.category}
              pagePath={previewGate.pagePath}
              fallbackMode="full"
              onUpgradeSuccess={() => {
                showToast("Simulated plan upgrade succeeded in preview mode!");
              }}
            />

            <div className="pt-2 text-center text-[11px] font-mono text-muted">
              Press Escape or click outside to return to Tier Governance.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT GATE COPY MODAL                                             */}
      {/* ========================================================================= */}
      {editingGate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setEditingGate(null)}
        >
          <div
            className="relative w-full max-w-lg bg-panel border border-line rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue/10 border border-blue/20 text-blue flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Edit Page Gate</h3>
                  <span className="text-xs font-mono text-muted">{editingGate.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingGate(null)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Feature / Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingGate.title}
                  onChange={(e) =>
                    setEditingGate({ ...editingGate, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink font-bold focus:outline-hidden focus:border-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Route Path (e.g. /compare, /akshara) *
                </label>
                <input
                  type="text"
                  required
                  value={editingGate.pagePath}
                  onChange={(e) =>
                    setEditingGate({ ...editingGate, pagePath: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink font-mono focus:outline-hidden focus:border-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Category
                </label>
                <input
                  type="text"
                  value={editingGate.category}
                  onChange={(e) =>
                    setEditingGate({ ...editingGate, category: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:outline-hidden focus:border-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Locked Description / Benefit Copy
                </label>
                <textarea
                  rows={3}
                  value={editingGate.description}
                  onChange={(e) =>
                    setEditingGate({ ...editingGate, description: e.target.value })
                  }
                  placeholder="Explain why this feature is locked and the key benefits of upgrading..."
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:outline-hidden focus:border-blue resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setEditingGate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdit(editingGate)}
                className="px-4 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE NEW GATE MODAL                                            */}
      {/* ========================================================================= */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-panel border border-line rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue/10 border border-blue/20 text-blue flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">
                    Create New Page Gate
                  </h3>
                  <p className="text-[11px] text-muted">Add a gated route with custom tier requirement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Unique Gate ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGate.id}
                    onChange={(e) =>
                      setNewGate({ ...newGate, id: e.target.value })
                    }
                    placeholder="e.g. smelter_advanced"
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink font-mono font-bold focus:outline-hidden focus:border-blue"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Route Path *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGate.pagePath}
                    onChange={(e) =>
                      setNewGate({ ...newGate, pagePath: e.target.value })
                    }
                    placeholder="/calculate"
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink font-mono focus:outline-hidden focus:border-blue"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Feature / Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={newGate.title}
                  onChange={(e) =>
                    setNewGate({ ...newGate, title: e.target.value })
                  }
                  placeholder="e.g. Smelter Batch Recovery Simulation"
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink font-bold focus:outline-hidden focus:border-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newGate.category}
                    onChange={(e) =>
                      setNewGate({ ...newGate, category: e.target.value })
                    }
                    placeholder="Trade Engine"
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:outline-hidden focus:border-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Minimum Required Tier
                  </label>
                  <CustomDropdown
                    value={newGate.requiredTier || "PROFESSIONAL"}
                    onChange={(val) => setNewGate({ ...newGate, requiredTier: val })}
                    options={[
                      { value: "ALL", label: "Open (All Users)" },
                      { value: "STARTER", label: "Starter & Above" },
                      { value: "PROFESSIONAL", label: "Professional & Above" },
                      { value: "ENTERPRISE", label: "Enterprise Only" },
                    ]}
                    size="sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Locked Description / Benefit Copy
                </label>
                <textarea
                  rows={3}
                  value={newGate.description}
                  onChange={(e) =>
                    setNewGate({ ...newGate, description: e.target.value })
                  }
                  placeholder="Explain why this feature is gated and how it benefits higher-tier subscribers..."
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:outline-hidden focus:border-blue resize-none"
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
                type="button"
                onClick={handleCreateGate}
                className="px-4 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Create Gate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE GATE CONFIRMATION MODAL                                   */}
      {/* ========================================================================= */}
      {gateToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-panel border border-line rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red/10 border border-red/20 text-red flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-sm font-bold text-ink">
                Delete Gate &quot;{gateToDelete.title}&quot;?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Are you sure you want to permanently delete gate{" "}
                <span className="font-mono font-bold text-ink">
                  {gateToDelete.pagePath}
                </span>{" "}
                ({gateToDelete.id}) from the database? This action cannot be undone.
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
                onClick={() => setGateToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border border-line bg-bg text-muted hover:text-ink transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGate}
                disabled={isDeletingGate}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red hover:bg-red-dark text-white transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isDeletingGate ? "Deleting..." : "Delete Gate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

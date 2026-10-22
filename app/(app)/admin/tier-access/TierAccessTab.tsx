"use client";

import React, { useState, useEffect } from "react";
import { TierPageAccessGate } from "@/lib/types";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { TierBadge, TierType } from "@/components/saas/TierBadge";
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
  const [newGate, setNewGate] = useState<Partial<TierPageAccessGate>>({
    id: "",
    pagePath: "/",
    title: "",
    category: "Trade Engine",
    description: "",
    requiredTier: "PROFESSIONAL",
    isActive: true,
  });

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
    if (!newGate.id || !newGate.title || !newGate.pagePath) {
      alert("Please fill in ID, Title, and Route Path.");
      return;
    }
    const cleanId = newGate.id.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (gates.some((g) => g.id === cleanId)) {
      alert(`A gate with ID "${cleanId}" already exists.`);
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
      alert("Failed to save new gate to database: " + (err?.data?.error?.message || err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete gate - persists immediately to DB
  const handleDeleteGate = async (gateId: string) => {
    if (confirm(`Are you sure you want to permanently remove the gate rule for "${gateId}" from the database?`)) {
      setIsSaving(true);
      try {
        if (onDeleteGate) {
          await onDeleteGate(gateId);
        } else {
          await onSaveGates(gates.filter((g) => g.id !== gateId));
        }
        setGates((prev) => prev.filter((g) => g.id !== gateId));
      } catch (err: any) {
        alert("Failed to delete gate: " + (err?.data?.error?.message || err?.message || "Unknown error"));
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Save all gates to backend
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveGates(gates);
      setIsDirty(false);
    } catch (err: any) {
      alert("Failed to save tier access rules: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered gates
  const filteredGates = gates.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.pagePath.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "ALL" || g.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesTier =
      tierFilter === "ALL" ||
      g.requiredTier.toUpperCase() === tierFilter.toUpperCase();

    return matchesSearch && matchesCategory && matchesTier;
  });

  const allCategories = Array.from(new Set(gates.map((g) => g.category))).filter(Boolean);

  // Statistics
  const totalGates = gates.length;
  const activeGates = gates.filter((g) => g.isActive && g.requiredTier !== "ALL").length;
  const enterpriseGates = gates.filter((g) => g.isActive && g.requiredTier === "ENTERPRISE").length;
  const professionalGates = gates.filter((g) => g.isActive && g.requiredTier === "PROFESSIONAL").length;
  const openGates = gates.filter((g) => !g.isActive || g.requiredTier === "ALL").length;

  return (
    <div className="w-full space-y-6">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-panel border border-line space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Total Managed Pages</span>
            <Lock className="w-3.5 h-3.5 text-blue" />
          </div>
          <div className="text-2xl font-bold text-ink">{totalGates}</div>
          <div className="text-[11px] text-muted font-mono">{activeGates} active plan gates</div>
        </div>

        <div className="p-4 rounded-2xl bg-panel border border-line space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Enterprise Gated</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-bold text-ink">{enterpriseGates}</div>
          <div className="text-[11px] text-muted font-mono">Exclusive to Enterprise</div>
        </div>

        <div className="p-4 rounded-2xl bg-panel border border-line space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Professional Gated</span>
            <span className="w-2 h-2 rounded-full bg-blue" />
          </div>
          <div className="text-2xl font-bold text-ink">{professionalGates}</div>
          <div className="text-[11px] text-muted font-mono">Pro & Enterprise access</div>
        </div>

        <div className="p-4 rounded-2xl bg-panel border border-line space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Open Access / All</span>
            <Unlock className="w-3.5 h-3.5 text-green" />
          </div>
          <div className="text-2xl font-bold text-ink">{openGates}</div>
          <div className="text-[11px] text-muted font-mono">Accessible on all tiers</div>
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-panel border border-line rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search page, route path, or copy..."
              className="w-full pl-9 pr-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink placeholder:text-muted focus:outline-hidden focus:border-blue transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="w-[180px]">
            <CustomDropdown
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "ALL", label: "All Categories" },
                ...allCategories.map((c) => ({ value: c, label: c })),
              ]}
              size="sm"
            />
          </div>

          {/* Tier Filter */}
          <div className="w-[170px]">
            <CustomDropdown
              value={tierFilter}
              onChange={setTierFilter}
              options={[
                { value: "ALL", label: "All Tiers" },
                { value: "ENTERPRISE", label: "Enterprise Only" },
                { value: "PROFESSIONAL", label: "Professional" },
                { value: "STARTER", label: "Starter" },
              ]}
              size="sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-panel border border-line hover:border-blue text-xs font-semibold text-ink transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue" />
            <span>Add Page Gate</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!isDirty || isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isDirty
                ? "bg-blue hover:bg-blue-dark text-white ring-2 ring-blue/20"
                : "bg-panel border border-line text-muted cursor-not-allowed opacity-60"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : isDirty ? "Save Access Changes *" : "Saved"}</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px]">Page / Feature</TableHead>
              <TableHead className="w-[130px]">Category</TableHead>
              <TableHead className="w-[220px]">Required Minimum Tier</TableHead>
              <TableHead className="w-[120px] text-center">Enforcement</TableHead>
              <TableHead className="w-[240px]">Locked Message / Benefit</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGates.map((gate) => {
              const isLockedForStarter =
                gate.isActive &&
                (gate.requiredTier === "PROFESSIONAL" || gate.requiredTier === "ENTERPRISE");

              return (
                <TableRow key={gate.id} className="hover:bg-bg/40 transition-colors">
                  {/* Name and Route */}
                  <TableCell className="align-top py-3.5">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-ink flex items-center gap-2">
                        <span>{gate.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg border border-line text-muted">
                          {gate.pagePath}
                        </span>
                        <span className="font-mono text-[10px] text-muted">({gate.id})</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="align-top py-3.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-panel border border-line text-muted">
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
                          ? "bg-green/10 border-green/30 text-green"
                          : "bg-muted/10 border-line text-muted"
                      }`}
                      title={gate.isActive ? "Gate is active (enforced)" : "Gate is disabled (open)"}
                    >
                      {gate.isActive ? (
                        <>
                          <Lock className="w-3 h-3 text-green" />
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
                        onClick={() => handleDeleteGate(gate.id)}
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
                  No page tier gates found matching your search and filter criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL 1: LIVE PREVIEW TEMPLATE MODAL (Matches Images 1, 2, 3!) */}
      {previewGate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setPreviewGate(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-panel border border-line rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-muted uppercase">
                  Live Gate Template Preview
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue/10 text-blue font-bold">
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

            {/* Embedded PlanGateTemplate (The exact template shown to users!) */}
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
              Press Escape or click outside to return to Admin Tier Governance.
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT GATE COPY MODAL */}
      {editingGate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setEditingGate(null)}
        >
          <div
            className="relative w-full max-w-lg bg-panel border border-line rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">
                Edit Page Gate — {editingGate.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingGate(null)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-muted block mb-1">
                  Feature / Page Title
                </label>
                <input
                  type="text"
                  value={editingGate.title}
                  onChange={(e) =>
                    setEditingGate({ ...editingGate, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:outline-hidden focus:border-blue"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-muted block mb-1">
                  Route Path (e.g. /compare, /akshara)
                </label>
                <input
                  type="text"
                  value={editingGate.pagePath}
                  onChange={(e) =>
                    setEditingGate({ ...editingGate, pagePath: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink font-mono focus:outline-hidden focus:border-blue"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-muted block mb-1">
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

              <div>
                <label className="text-[11px] font-mono text-muted block mb-1">
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setEditingGate(null)}
                className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-bg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdit(editingGate)}
                className="px-4 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE NEW GATE MODAL */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-panel border border-line rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">
                Create New Page / Feature Gate
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-muted block mb-1">
                    Unique Gate ID *
                  </label>
                  <input
                    type="text"
                    value={newGate.id}
                    onChange={(e) =>
                      setNewGate({ ...newGate, id: e.target.value })
                    }
                    placeholder="e.g. smelter_advanced"
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink font-mono focus:outline-hidden focus:border-blue"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-muted block mb-1">
                    Route Path *
                  </label>
                  <input
                    type="text"
                    value={newGate.pagePath}
                    onChange={(e) =>
                      setNewGate({ ...newGate, pagePath: e.target.value })
                    }
                    placeholder="/calculate"
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink font-mono focus:outline-hidden focus:border-blue"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-muted block mb-1">
                  Feature / Page Title *
                </label>
                <input
                  type="text"
                  value={newGate.title}
                  onChange={(e) =>
                    setNewGate({ ...newGate, title: e.target.value })
                  }
                  placeholder="e.g. Smelter Batch Recovery Simulation"
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:outline-hidden focus:border-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-muted block mb-1">
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

                <div>
                  <label className="text-[11px] font-mono text-muted block mb-1">
                    Required Minimum Tier
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

              <div>
                <label className="text-[11px] font-mono text-muted block mb-1">
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-bg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateGate}
                className="px-4 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Create Gate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

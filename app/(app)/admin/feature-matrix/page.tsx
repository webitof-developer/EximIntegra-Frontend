"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAppSelector } from "@/store";
import {
  useGetAdminFeatureMatrixQuery,
  useCreateFeatureMatrixRowMutation,
  useUpdateFeatureMatrixRowMutation,
  useToggleFeatureVisibilityMutation,
  useDeleteFeatureMatrixRowMutation,
  useSyncFeatureMatrixPlansMutation,
} from "@/store/adminApi";
import { AdminNav } from "../AdminNav";
import { FeatureMatrixItem, PricingPlan } from "@/lib/types";
import { ToastNotification, ToastVariant } from "@/components/ui";
import {
  TableProperties,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Check,
  Minus,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  Filter,
} from "lucide-react";

export default function AdminFeatureMatrixPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<ToastVariant>("success");

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<"ALL" | "VISIBLE" | "HIDDEN">("ALL");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeatureMatrixItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<FeatureMatrixItem | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState("");
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formPlanValues, setFormPlanValues] = useState<Record<string, { mode: "bool" | "text"; boolVal: boolean; textVal: string }>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: matrixData,
    isLoading,
    refetch,
    isFetching,
  } = useGetAdminFeatureMatrixQuery(undefined, {
    skip: !mounted || user?.role !== "ADMIN",
  });

  const [createFeature, { isLoading: isCreating }] = useCreateFeatureMatrixRowMutation();
  const [updateFeature, { isLoading: isUpdating }] = useUpdateFeatureMatrixRowMutation();
  const [toggleVisibility] = useToggleFeatureVisibilityMutation();
  const [deleteFeature, { isLoading: isDeleting }] = useDeleteFeatureMatrixRowMutation();
  const [syncPlans, { isLoading: isSyncing }] = useSyncFeatureMatrixPlansMutation();

  const showToast = (text: string, type: ToastVariant = "success") => {
    setToastMessage(text);
    setToastVariant(type);
  };

  const handleSyncPlans = async () => {
    try {
      const res = await syncPlans({ forceRefreshAll: true }).unwrap();
      await refetch();
      showToast(res.message || "Plan configurations auto-fetched and synced into feature matrix!");
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to auto-sync plans into feature matrix.", "error");
    }
  };

  const plans: PricingPlan[] = useMemo(() => {
    const rawPlans = matrixData?.plans || [];
    const trialPlans = rawPlans.filter(
      (p) => p.planType === "trial" || (p.tierBadge || "").toUpperCase() === "FREE_TRIAL"
    );
    const subPlans = rawPlans.filter(
      (p) => p.planType !== "trial" && (p.tierBadge || "").toUpperCase() !== "FREE_TRIAL"
    );

    const defaultTrial =
      trialPlans.find((p) => p.isDefaultTrial) || trialPlans[0];

    const result: PricingPlan[] = [];
    if (defaultTrial) {
      result.push(defaultTrial);
    }
    result.push(...subPlans);
    return result;
  }, [matrixData]);

  const items: FeatureMatrixItem[] = useMemo(() => {
    return matrixData?.items || [];
  }, [matrixData]);

  const categories: string[] = useMemo(() => {
    if (matrixData?.categories && matrixData.categories.length > 0) {
      return matrixData.categories;
    }
    const cats = new Set<string>();
    items.forEach((it) => {
      if (it.category) cats.add(it.category);
    });
    return Array.from(cats);
  }, [matrixData, items]);

  // KPIs
  const totalRows = items.length;
  const visibleRows = items.filter((it) => it.isVisible).length;
  const hiddenRows = totalRows - visibleRows;
  const totalCategories = categories.length;

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "ALL" || item.category === selectedCategory;

      const matchesVis =
        visibilityFilter === "ALL" ||
        (visibilityFilter === "VISIBLE" && item.isVisible) ||
        (visibilityFilter === "HIDDEN" && !item.isVisible);

      return matchesSearch && matchesCat && matchesVis;
    });
  }, [items, searchQuery, selectedCategory, visibilityFilter]);

  // Grouped filtered items by category
  const groupedCategories = useMemo(() => {
    const map = new Map<string, FeatureMatrixItem[]>();

    filteredItems.forEach((it) => {
      const cat = it.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(it);
    });

    return Array.from(map.entries()).map(([category, rows]) => ({
      category,
      rows: rows.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    }));
  }, [filteredItems]);

  // Open Create Modal
  const handleOpenCreateModal = (preselectedCategory?: string) => {
    setEditingItem(null);
    const targetCat = preselectedCategory || categories[0] || "1. Commodity Classification Engine";
    setFormCategory(targetCat);
    setFormCustomCategory("");
    setFormName("");
    setFormDescription("");
    setFormSortOrder(items.length + 1);
    setFormIsVisible(true);

    // Initialise plan values structure
    const initialPlanVals: Record<string, { mode: "bool" | "text"; boolVal: boolean; textVal: string }> = {};
    plans.forEach((p) => {
      initialPlanVals[p.id] = { mode: "bool", boolVal: true, textVal: "" };
    });
    setFormPlanValues(initialPlanVals);
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: FeatureMatrixItem) => {
    setEditingItem(item);
    if (categories.includes(item.category)) {
      setFormCategory(item.category);
      setFormCustomCategory("");
    } else {
      setFormCategory("__custom__");
      setFormCustomCategory(item.category);
    }
    setFormName(item.name);
    setFormDescription(item.description || "");
    setFormSortOrder(item.sortOrder ?? 1);
    setFormIsVisible(item.isVisible);

    // Build plan values form structure
    const initialPlanVals: Record<string, { mode: "bool" | "text"; boolVal: boolean; textVal: string }> = {};
    plans.forEach((p) => {
      const rawVal = getPlanValueDisplay(item, p);

      if (typeof rawVal === "boolean") {
        initialPlanVals[p.id] = { mode: "bool", boolVal: rawVal, textVal: "" };
      } else if (typeof rawVal === "string") {
        initialPlanVals[p.id] = { mode: "text", boolVal: true, textVal: rawVal };
      } else {
        initialPlanVals[p.id] = { mode: "bool", boolVal: false, textVal: "" };
      }
    });
    setFormPlanValues(initialPlanVals);
    setIsEditModalOpen(true);
  };

  // Save Create/Edit
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory =
      formCategory === "__custom__" ? formCustomCategory.trim() : formCategory.trim();

    if (!finalCategory) {
      showToast("Please provide a valid category.", "error");
      return;
    }
    if (!formName.trim()) {
      showToast("Please provide a feature name.", "error");
      return;
    }

    // Convert formPlanValues into backend planValues dict
    const finalPlanValues: Record<string, boolean | string> = {};
    Object.entries(formPlanValues).forEach(([planId, valObj]) => {
      if (valObj.mode === "text") {
        finalPlanValues[planId] = valObj.textVal.trim() || false;
      } else {
        finalPlanValues[planId] = valObj.boolVal;
      }
    });

    try {
      if (editingItem) {
        await updateFeature({
          id: editingItem.id,
          name: formName.trim(),
          category: finalCategory,
          description: formDescription.trim(),
          sortOrder: Number(formSortOrder) || 1,
          isVisible: formIsVisible,
          planValues: finalPlanValues,
        }).unwrap();
        showToast(`Feature '${formName}' updated successfully.`);
      } else {
        await createFeature({
          name: formName.trim(),
          category: finalCategory,
          description: formDescription.trim(),
          sortOrder: Number(formSortOrder) || 1,
          isVisible: formIsVisible,
          planValues: finalPlanValues,
        }).unwrap();
        showToast(`Feature '${formName}' created successfully.`);
      }
      setIsEditModalOpen(false);
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to save feature row.", "error");
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (item: FeatureMatrixItem) => {
    try {
      const res = await toggleVisibility({
        id: item.id,
        isVisible: !item.isVisible,
      }).unwrap();
      const statusText = res.item.isVisible ? "Visible" : "Hidden";
      showToast(`'${item.name}' is now ${statusText} on /pricing.`);
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to toggle visibility.", "error");
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteFeature(deletingItem.id).unwrap();
      showToast(`Feature '${deletingItem.name}' removed successfully.`);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to delete feature row.", "error");
    }
  };

  // Collapse / Expand toggle
  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Helper to extract feature value for display with intelligent auto-fetch & resolution
  const getPlanValueDisplay = (row: FeatureMatrixItem, plan: PricingPlan) => {
    const vals = row.planValues || {};
    const planId = (plan.id || "").toLowerCase();
    const tierBadge = (plan.tierBadge || "").toUpperCase();
    const isTrial =
      plan.planType === "trial" ||
      tierBadge === "FREE_TRIAL" ||
      tierBadge === "TRIAL" ||
      planId === "free-trial" ||
      planId === "trial";

    // 1. Direct match on plan ID or lowercase
    if (vals[plan.id] !== undefined && vals[plan.id] !== null && vals[plan.id] !== "") return vals[plan.id];
    if (vals[planId] !== undefined && vals[planId] !== null && vals[planId] !== "") return vals[planId];
    if (tierBadge && vals[tierBadge.toLowerCase()] !== undefined && vals[tierBadge.toLowerCase()] !== null && vals[tierBadge.toLowerCase()] !== "") {
      return vals[tierBadge.toLowerCase()];
    }

    // 2. Identify base archetype: starter | professional | enterprise | free-trial
    let baseArchetype = "starter";
    if (isTrial) {
      baseArchetype = "free-trial";
    } else if (
      tierBadge.includes("ENTERPRISE") ||
      tierBadge.includes("VIP") ||
      planId.includes("enterprise") ||
      planId.includes("vip")
    ) {
      baseArchetype = "enterprise";
    } else if (
      tierBadge.includes("PROFESSIONAL") ||
      tierBadge.includes("PRO") ||
      planId.includes("professional") ||
      planId.includes("pro")
    ) {
      baseArchetype = "professional";
    } else if (tierBadge.includes("STARTER") || planId.includes("starter")) {
      baseArchetype = "starter";
    } else {
      const price = plan.priceMonthlyInr || 0;
      if (price >= 40000) baseArchetype = "enterprise";
      else if (price >= 15000) baseArchetype = "professional";
      else baseArchetype = "starter";
    }

    // 3. Dynamic Limit & Quantitative feature resolutions from plan settings
    if (row.id === "feat_single_lookup") {
      const limit = plan.hsClassificationLimit;
      if (limit !== undefined && limit !== null) {
        if (limit === -1 || limit >= 10000) return "Unlimited";
        if (isTrial) return `${limit} / trial`;
        return `${limit} / mo`;
      }
      if (baseArchetype === "free-trial") return "50 / trial";
      if (baseArchetype === "starter") return "100 / mo";
      return "Unlimited";
    }

    if (row.id === "feat_workspace_seats") {
      const seats = plan.maxTeamMembers;
      if (seats !== undefined && seats !== null) {
        if (seats === -1 || seats >= 25) return "Unlimited Seats";
        if (seats === 1) return "1 Seat";
        return `${seats} Seats`;
      }
      if (baseArchetype === "enterprise") return "Unlimited Seats";
      if (baseArchetype === "professional") return "5 Seats";
      return "1 Seat";
    }

    if (row.id === "feat_bulk_csv_manifest") {
      if (baseArchetype === "enterprise") return "Unlimited Batch";
      if (baseArchetype === "professional") return "Up to 500 items/file";
      return false;
    }

    if (row.id === "feat_port_scale_rates") {
      if (baseArchetype === "enterprise") return "Full TAMP + Custom SOR";
      if (baseArchetype === "professional") return "Full TAMP Schedule";
      return "Standard";
    }

    if (row.id === "feat_support_sla") {
      if (baseArchetype === "enterprise") return "Dedicated Manager & 99.9% SLA";
      if (baseArchetype === "professional") return "Priority Chat & Email";
      if (baseArchetype === "starter") return "Email Support";
      return "Standard Support";
    }

    if (row.id === "feat_akshara_copilot") {
      if (baseArchetype === "enterprise") return "Unlimited Access";
      return false;
    }

    // 4. Check plan.features text list for keyword matches
    const planFeatures = plan.features || [];
    const featNameLower = (row.name || "").toLowerCase().trim();
    for (const pf of planFeatures) {
      if (typeof pf !== "string") continue;
      const pfLower = pf.toLowerCase().trim();
      if (featNameLower.includes(pfLower) || (pfLower.length > 5 && pfLower.includes(featNameLower))) {
        return true;
      }
    }

    // 5. Archetype fallback from existing row values
    if (vals[baseArchetype] !== undefined && vals[baseArchetype] !== null && vals[baseArchetype] !== "") {
      return vals[baseArchetype];
    }
    if (baseArchetype === "free-trial") {
      if (vals["free-trial"] !== undefined) return vals["free-trial"];
      if (vals["trial"] !== undefined) return vals["trial"];
      if (vals["free_trial"] !== undefined) return vals["free_trial"];
    }
    if (baseArchetype === "professional" && vals["pro"] !== undefined) return vals["pro"];

    return false;
  };

  if (!mounted) {
    return (
      <AppShell>
        <div className="p-12 text-center text-muted flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy/20 animate-pulse border border-line" />
          <span className="text-xs font-mono">Loading Feature Matrix Console...</span>
        </div>
      </AppShell>
    );
  }

  if (user && user.role !== "ADMIN") {
    return (
      <AppShell>
        <div className="p-12 text-center text-muted flex flex-col items-center justify-center gap-3">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
          <h2 className="text-lg font-bold text-ink">Restricted Super Admin Area</h2>
          <p className="text-xs text-muted max-w-md">
            You do not have administrative privileges to manage the platform feature matrix.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 px-4 py-2 bg-blue text-white rounded-lg text-xs font-semibold hover:bg-blue-dark transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full space-y-6 pb-16">
        {/* Top Navigation Banner */}
        <AdminNav
          title="Comprehensive Feature Matrix Management"
          description="Control the public /pricing feature comparison table, customize plan entitlements across all tiers, and toggle row visibility in real-time."
          category="Feature Matrix"
          onRefresh={() => {
            refetch();
            showToast("Feature matrix refreshed.");
          }}
          isRefreshing={isFetching}
          userCount={totalRows}
        />

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-panel border border-line p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-muted text-xs font-semibold mb-2">
              <span>Total Features</span>
              <TableProperties className="w-4 h-4 text-blue" />
            </div>
            <div className="text-2xl font-bold font-mono text-ink">{totalRows}</div>
            <div className="text-[11px] text-muted mt-1">Across all categories</div>
          </div>

          <div className="bg-panel border border-line p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-muted text-xs font-semibold mb-2">
              <span>Active Engines</span>
              <Layers className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-ink">{totalCategories}</div>
            <div className="text-[11px] text-muted mt-1">Category sections</div>
          </div>

          <div className="bg-panel border border-line p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-muted text-xs font-semibold mb-2">
              <span>Live on /pricing</span>
              <Eye className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 flex items-center gap-1.5">
              <span>{visibleRows}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[11px] text-muted mt-1">Publicly displayed</div>
          </div>

          <div className="bg-panel border border-line p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-muted text-xs font-semibold mb-2">
              <span>Hidden / Draft</span>
              <EyeOff className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-600">{hiddenRows}</div>
            <div className="text-[11px] text-muted mt-1">Hidden from public view</div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-panel border border-line p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search feature or engine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg border border-line pl-8 pr-3 py-1.5 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Dropdown Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-bg border border-line px-3 py-1.5 text-xs font-semibold text-ink rounded-lg focus:outline-none focus:border-blue transition-colors cursor-pointer"
            >
              <option value="ALL">All Categories ({totalCategories})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Visibility Filter Pills */}
            <div className="flex items-center bg-bg border border-line p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setVisibilityFilter("ALL")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  visibilityFilter === "ALL"
                    ? "bg-blue text-white shadow-xs"
                    : "text-muted hover:text-ink"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setVisibilityFilter("VISIBLE")}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  visibilityFilter === "VISIBLE"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted hover:text-ink"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Live</span>
              </button>
              <button
                onClick={() => setVisibilityFilter("HIDDEN")}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  visibilityFilter === "HIDDEN"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-muted hover:text-ink"
                }`}
              >
                <EyeOff className="w-3 h-3" />
                <span>Hidden</span>
              </button>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSyncPlans}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-blue-dim text-blue hover:bg-blue/20 border border-blue/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              title="Auto-fetch and synchronize limits, seats, and entitlements from saved Pricing plans"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing Plans..." : "Auto-Sync Plans"}</span>
            </button>

            <Link
              href="/pricing#matrix"
              target="_blank"
              className="px-3 py-1.5 bg-bg hover:bg-line/40 border border-line text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Preview live public pricing comparison"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted" />
              <span>Preview /pricing</span>
            </Link>

            <button
              onClick={() => handleOpenCreateModal()}
              className="px-3.5 py-1.5 bg-blue hover:bg-blue-dark text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Feature Row</span>
            </button>
          </div>
        </div>

        {/* Categories and Feature Matrix Table */}
        {isLoading ? (
          <div className="p-12 text-center text-muted flex flex-col items-center justify-center gap-3 bg-panel border border-line rounded-2xl">
            <div className="w-8 h-8 rounded-full border-2 border-blue border-t-transparent animate-spin" />
            <span className="text-xs font-mono">Loading Feature Matrix records...</span>
          </div>
        ) : groupedCategories.length === 0 ? (
          <div className="p-12 text-center text-muted bg-panel border border-line rounded-2xl space-y-3">
            <TableProperties className="w-10 h-10 text-muted/50 mx-auto" />
            <h3 className="text-sm font-bold text-ink">No Feature Rows Found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              No features match your search or filter parameters. Try clearing your filters or create a new row.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setVisibilityFilter("ALL");
              }}
              className="px-3 py-1.5 bg-line/50 hover:bg-line text-ink rounded-lg text-xs font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedCategories.map(({ category, rows }) => {
              const isCollapsed = !!collapsedCategories[category];
              return (
                <div
                  key={category}
                  className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden transition-all"
                >
                  {/* Category Header Bar */}
                  <div className="px-5 py-3.5 bg-bg/80 border-b border-line flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleCategoryCollapse(category)}
                      className="flex items-center gap-2.5 text-left group flex-1"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-muted group-hover:text-blue transition-colors" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-muted group-hover:text-blue transition-colors" />
                      )}
                      <span className="font-mono font-bold text-xs uppercase tracking-wider text-blue">
                        {category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-dim text-blue border border-blue/20 text-[10px] font-mono font-bold">
                        {rows.length} {rows.length === 1 ? "feature" : "features"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleOpenCreateModal(category)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-muted hover:text-blue hover:bg-blue-dim/40 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Category</span>
                    </button>
                  </div>

                  {/* Feature Rows Table */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-line text-muted uppercase text-[10px] font-mono tracking-wider bg-bg/40">
                            <th className="py-2.5 px-4 w-12 text-center">#</th>
                            <th className="py-2.5 px-4 min-w-[260px]">Feature & Description</th>
                            <th className="py-2.5 px-3 text-center w-28">Visibility</th>
                            {plans.map((p) => {
                              const isTrial =
                                p.planType === "trial" ||
                                (p.tierBadge || "").toUpperCase() === "FREE_TRIAL";
                              return (
                                <th
                                  key={p.id}
                                  className={`py-2.5 px-3 text-center min-w-[110px] ${
                                    p.isPopular
                                      ? "bg-blue-dim/30 border-x border-blue/20 text-blue font-bold"
                                      : isTrial
                                      ? "bg-emerald-500/10 border-x border-emerald-500/20 text-emerald-700 font-bold"
                                      : "border-x border-line/30"
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-1">
                                    <span>{p.name}</span>
                                    {isTrial && (
                                      <span className="px-1 py-0.2 rounded text-[8px] font-mono uppercase bg-emerald-500/20 text-emerald-700 font-bold border border-emerald-500/30">
                                        Trial
                                      </span>
                                    )}
                                  </div>
                                </th>
                              );
                            })}
                            <th className="py-2.5 px-4 text-right w-24">Actions</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-line">
                          {rows.map((row) => (
                            <tr
                              key={row.id}
                              className={`hover:bg-bg/40 transition-colors ${
                                !row.isVisible ? "opacity-75 bg-bg/20" : ""
                              }`}
                            >
                              {/* Sort Order */}
                              <td className="py-3 px-4 text-center font-mono text-[11px] text-muted">
                                {row.sortOrder}
                              </td>

                              {/* Feature Name & Description */}
                              <td className="py-3 px-4">
                                <div className="font-semibold text-ink flex items-center gap-1.5">
                                  <span>{row.name}</span>
                                  {!row.isVisible && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold">
                                      Hidden
                                    </span>
                                  )}
                                </div>
                                {row.description && (
                                  <div className="text-[11px] text-muted mt-0.5 line-clamp-1">
                                    {row.description}
                                  </div>
                                )}
                              </td>

                              {/* Visibility Toggle Button */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleToggleVisibility(row)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-colors ${
                                    row.isVisible
                                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                                      : "bg-muted/10 text-muted hover:bg-muted/20 border border-muted/20"
                                  }`}
                                  title={
                                    row.isVisible
                                      ? "Visible on /pricing. Click to hide."
                                      : "Hidden from /pricing. Click to show."
                                  }
                                >
                                  {row.isVisible ? (
                                    <>
                                      <Eye className="w-3 h-3" />
                                      <span>Live</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3 h-3" />
                                      <span>Hidden</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              {/* Plan Entitlements */}
                              {plans.map((p) => {
                                const val = getPlanValueDisplay(row, p);
                                const isPop = !!p.isPopular;

                                return (
                                  <td
                                    key={p.id}
                                    className={`py-3 px-3 text-center ${
                                      isPop
                                        ? "bg-blue-dim/15 border-x border-blue/15"
                                        : "border-x border-line/25"
                                    }`}
                                  >
                                    {typeof val === "boolean" ? (
                                      val ? (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-dim text-blue">
                                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center justify-center w-5 h-5 text-muted/30">
                                          <Minus className="w-3.5 h-3.5" />
                                        </span>
                                      )
                                    ) : (
                                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold text-ink bg-line/40 max-w-[120px] truncate">
                                        {val}
                                      </span>
                                    )}
                                  </td>
                                );
                              })}

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditModal(row)}
                                    className="p-1.5 hover:bg-blue-dim text-muted hover:text-blue rounded-md transition-colors"
                                    title="Edit Feature Entitlements"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeletingItem(row);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className="p-1.5 hover:bg-red-dim text-muted hover:text-red rounded-md transition-colors"
                                    title="Delete Feature Row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-panel border border-line rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-5 border-b border-line flex items-center justify-between bg-bg/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-dim text-blue flex items-center justify-center font-bold">
                    <TableProperties className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink">
                      {editingItem ? "Edit Feature Row" : "Create New Feature Row"}
                    </h3>
                    <p className="text-xs text-muted">
                      Configure row metadata and plan entitlements for public pricing.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 hover:bg-line/40 rounded-lg text-muted hover:text-ink transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveForm} className="overflow-y-auto p-5 space-y-4 flex-1">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <span>Category / Engine Section</span>
                    <span className="text-red">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">+ Enter New Category...</option>
                  </select>

                  {formCategory === "__custom__" && (
                    <input
                      type="text"
                      placeholder="e.g. 6. Advanced Custom Clearance & APIs"
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      className="w-full bg-bg border border-blue px-3 py-2 text-xs text-ink rounded-lg focus:outline-none transition-colors mt-2"
                      required
                    />
                  )}
                </div>

                {/* Feature Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <span>Feature Name</span>
                    <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sequential GIR 1 to 6 Legal Interpretation"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                    required
                  />
                </div>

                {/* Description / Tooltip */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">
                    <span>Description / Tooltip Subtitle</span>
                    <span className="text-muted font-normal text-[11px] ml-1.5">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Deterministic legal rule rationale per classification candidate"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                  />
                </div>

                {/* Row Order and Visibility */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Sort Order</label>
                    <input
                      type="number"
                      min="1"
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 1)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Public Visibility</label>
                    <div className="flex items-center gap-3 pt-1">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsVisible}
                          onChange={(e) => setFormIsVisible(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                      <span className="text-xs font-semibold text-ink">
                        {formIsVisible ? "Visible on /pricing" : "Hidden from /pricing"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Plan Entitlements Configuration */}
                <div className="space-y-3 pt-2 border-t border-line">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
                      Plan Entitlements across all tiers
                    </h4>
                    <span className="text-[11px] text-muted">
                      Set boolean checkmark or custom limit per plan
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {plans.map((p) => {
                      const currentVal = formPlanValues[p.id] || {
                        mode: "bool",
                        boolVal: false,
                        textVal: "",
                      };

                      return (
                        <div
                          key={p.id}
                          className="p-3 bg-bg border border-line rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-ink">
                                {p.name}
                              </span>
                              {p.isPopular && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-blue text-white font-bold">
                                  Popular
                                </span>
                              )}
                            </div>

                            {/* Mode Switch: Checkmark vs Custom Text */}
                            <div className="flex items-center bg-panel border border-line p-0.5 rounded-lg text-[11px] font-semibold">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormPlanValues((prev) => ({
                                    ...prev,
                                    [p.id]: {
                                      ...currentVal,
                                      mode: "bool",
                                    },
                                  }))
                                }
                                className={`px-2 py-0.5 rounded transition-colors ${
                                  currentVal.mode === "bool"
                                    ? "bg-blue text-white shadow-xs"
                                    : "text-muted hover:text-ink"
                                }`}
                              >
                                Checkmark
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormPlanValues((prev) => ({
                                    ...prev,
                                    [p.id]: {
                                      ...currentVal,
                                      mode: "text",
                                    },
                                  }))
                                }
                                className={`px-2 py-0.5 rounded transition-colors ${
                                  currentVal.mode === "text"
                                    ? "bg-blue text-white shadow-xs"
                                    : "text-muted hover:text-ink"
                                }`}
                              >
                                Custom Text
                              </button>
                            </div>
                          </div>

                          {currentVal.mode === "bool" ? (
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormPlanValues((prev) => ({
                                    ...prev,
                                    [p.id]: {
                                      ...currentVal,
                                      boolVal: !currentVal.boolVal,
                                    },
                                  }))
                                }
                                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                  currentVal.boolVal
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-muted/10 text-muted border border-muted/20"
                                }`}
                              >
                                {currentVal.boolVal ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Included (Checkmark)</span>
                                  </>
                                ) : (
                                  <>
                                    <Minus className="w-3.5 h-3.5" />
                                    <span>Not Included (Dash)</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                placeholder='e.g. "100 / mo", "Unlimited", "1 Seat", "Dedicated Manager"'
                                value={currentVal.textVal}
                                onChange={(e) =>
                                  setFormPlanValues((prev) => ({
                                    ...prev,
                                    [p.id]: {
                                      ...currentVal,
                                      textVal: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full bg-panel border border-line px-3 py-1.5 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-mono"
                              />
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-muted">Suggestions:</span>
                                {["Unlimited", "100 / mo", "Up to 500 items/file", "1 Seat", "5 Seats", "Unlimited Seats", "Standard"].map(
                                  (sug) => (
                                    <button
                                      key={sug}
                                      type="button"
                                      onClick={() =>
                                        setFormPlanValues((prev) => ({
                                          ...prev,
                                          [p.id]: {
                                            ...currentVal,
                                            textVal: sug,
                                          },
                                        }))
                                      }
                                      className="px-1.5 py-0.5 rounded bg-panel hover:bg-blue-dim hover:text-blue border border-line text-[10px] text-muted transition-colors font-mono"
                                    >
                                      {sug}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-line flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-bg hover:bg-line/40 text-ink rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-4 py-2 bg-blue hover:bg-blue-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isCreating || isUpdating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Feature Row</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && deletingItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-panel border border-line rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-10 h-10 rounded-full bg-red/10 text-red flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-ink">Delete Feature Row</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-ink font-semibold">"{deletingItem.name}"</strong>?
                  This row will be immediately removed from the live public <span className="font-mono text-blue">/pricing</span> feature comparison table.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingItem(null);
                  }}
                  className="px-4 py-2 bg-bg hover:bg-line/40 text-ink rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red hover:bg-red-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Row</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastNotification
        isOpen={!!toastMessage}
        variant={toastVariant}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </AppShell>
  );
}


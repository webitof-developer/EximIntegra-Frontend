"use client";

import React, { useState, useEffect, useRef } from "react";
import { PricingPlan } from "@/lib/types";
import { TierBadge } from "@/components/saas/TierBadge";
import { CustomDropdown } from "@/components/ui";
import {
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Sliders,
  LayoutGrid,
  Check,
  Eye,
  IndianRupee,
  DollarSign,
  ArrowRight,
  Shield,
  Zap,
  Crown,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DynamicPricingTabProps {
  pricingPlans: PricingPlan[];
  isLoading?: boolean;
  onSavePricing: (plans: PricingPlan[]) => Promise<any>;
  onDeletePlan?: (planId: string) => Promise<any>;
  showToast: (msg: string) => void;
}

const TIER_BADGE_PRESETS = [
  "STARTER",
  "PROFESSIONAL",
  "ENTERPRISE",
  "CUSTOM",
  "GROWTH",
  "SCALE",
];

export function DynamicPricingTab({
  pricingPlans,
  isLoading,
  onSavePricing,
  onDeletePlan,
  showToast,
}: DynamicPricingTabProps) {
  const [editablePlans, setEditablePlans] = useState<PricingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("professional");
  const [viewMode, setViewMode] = useState<"focused" | "grid">("grid");
  const [pricingNotice, setPricingNotice] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [previewCurrency, setPreviewCurrency] = useState<"INR" | "USD">("INR");
  const [previewAnnual, setPreviewAnnual] = useState<boolean>(false);

  // Horizontal scroll container ref
  const gridScrollRef = useRef<HTMLDivElement>(null);

  // Create Plan Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlanId, setNewPlanId] = useState("");
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanTagline, setNewPlanTagline] = useState("");
  const [newPlanBadge, setNewPlanBadge] = useState("");
  const [newPlanTierBadge, setNewPlanTierBadge] = useState("PROFESSIONAL");
  const [newPlanIsActive, setNewPlanIsActive] = useState(true);
  const [newPlanIsPopular, setNewPlanIsPopular] = useState(false);
  const [newPlanPriceMonthlyInr, setNewPlanPriceMonthlyInr] = useState(14999);
  const [newPlanPriceAnnualInr, setNewPlanPriceAnnualInr] = useState(11999);
  const [newPlanPriceMonthlyUsd, setNewPlanPriceMonthlyUsd] = useState(199);
  const [newPlanPriceAnnualUsd, setNewPlanPriceAnnualUsd] = useState(159);
  const [newPlanFeatures, setNewPlanFeatures] = useState<string[]>([
    "Custom HS classifications per month",
    "Statutory duty & tariff calculator",
    "Full Landed Cost & port Logistics",
    "Priority compliance advisor support",
  ]);
  const [newPlanNewFeatureInput, setNewPlanNewFeatureInput] = useState("");
  const [newPlanCtaLabel, setNewPlanCtaLabel] = useState("Get Started");
  const [newPlanCtaHref, setNewPlanCtaHref] = useState("/register");

  // Delete confirmation modal state
  const [planToDelete, setPlanToDelete] = useState<PricingPlan | null>(null);

  useEffect(() => {
    if (pricingPlans && pricingPlans.length > 0) {
      setEditablePlans(JSON.parse(JSON.stringify(pricingPlans)));
      if (!selectedPlanId || !pricingPlans.some((p) => p.id === selectedPlanId)) {
        setSelectedPlanId(pricingPlans[0].id);
      }
    }
  }, [pricingPlans]);

  const activePlanIndex = editablePlans.findIndex((p) => p.id === selectedPlanId);
  const activePlan = activePlanIndex >= 0 ? editablePlans[activePlanIndex] : editablePlans[0];

  const handlePlanFieldChange = (
    index: number,
    field: keyof PricingPlan,
    value: any
  ) => {
    const updated = [...editablePlans];
    updated[index] = { ...updated[index], [field]: value };
    setEditablePlans(updated);
  };

  // Toggle active / inactive status of a plan
  const handleTogglePlanActive = (planId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const idx = editablePlans.findIndex((p) => p.id === planId);
    if (idx < 0) return;
    const current = editablePlans[idx].isActive !== false;
    const nextState = !current;
    handlePlanFieldChange(idx, "isActive", nextState);
    showToast(
      `Plan "${editablePlans[idx].name}" is now ${
        nextState ? "ACTIVE (visible on Frontend)" : "INACTIVE (hidden from Frontend)"
      }. Click "Save Pricing Changes" to publish.`
    );
  };

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -360 : 360;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAddFeatureToActive = () => {
    if (!newFeatureText.trim() || activePlanIndex < 0) return;
    const updated = [...editablePlans];
    const plan = { ...updated[activePlanIndex] };
    plan.features = [...plan.features, newFeatureText.trim()];
    updated[activePlanIndex] = plan;
    setEditablePlans(updated);
    setNewFeatureText("");
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
    setIsUpdating(true);
    try {
      await onSavePricing(editablePlans);
      setPricingNotice(
        "Live SaaS pricing plans updated and persisted successfully across public and settings pages!"
      );
      setTimeout(() => setPricingNotice(null), 4000);
      showToast("SaaS pricing plans saved successfully.");
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to update SaaS pricing.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Create new plan handler
  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = (newPlanId || newPlanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");

    if (!cleanId) {
      showToast("Please enter a valid Plan Name or Identifier.");
      return;
    }

    if (editablePlans.some((p) => p.id === cleanId)) {
      showToast(`A plan with ID '${cleanId}' already exists. Please choose a different identifier.`);
      return;
    }

    const createdPlan: PricingPlan = {
      id: cleanId,
      name: newPlanName.trim() || cleanId.toUpperCase(),
      tagline: newPlanTagline.trim() || "Enterprise subscription tier.",
      badge: newPlanBadge.trim() || null,
      tierBadge: newPlanTierBadge.trim() || "PROFESSIONAL",
      isActive: newPlanIsActive,
      isPopular: newPlanIsPopular,
      priceMonthlyInr: Number(newPlanPriceMonthlyInr) || 0,
      priceAnnualInr: Number(newPlanPriceAnnualInr) || 0,
      priceMonthlyUsd: Number(newPlanPriceMonthlyUsd) || 0,
      priceAnnualUsd: Number(newPlanPriceAnnualUsd) || 0,
      features: newPlanFeatures.filter((f) => f.trim().length > 0),
      ctaLabel: newPlanCtaLabel.trim() || "Get Started",
      ctaHref: newPlanCtaHref.trim() || `/register?plan=${cleanId}`,
    };

    const nextList = [...editablePlans, createdPlan];
    setEditablePlans(nextList);
    setSelectedPlanId(cleanId);
    setIsCreateModalOpen(false);

    // Reset create modal fields
    setNewPlanId("");
    setNewPlanName("");
    setNewPlanTagline("");
    setNewPlanBadge("");
    setNewPlanTierBadge("PROFESSIONAL");
    setNewPlanIsActive(true);
    setNewPlanIsPopular(false);

    showToast(
      `New plan "${createdPlan.name}" added to editor! Click "Save Pricing Changes" to publish it live.`
    );
  };

  // Delete plan handler
  const handleConfirmDeletePlan = async () => {
    if (!planToDelete) return;
    const planId = planToDelete.id;
    const planName = planToDelete.name;
    setIsDeleting(true);
    try {
      if (onDeletePlan) {
        await onDeletePlan(planId);
      }
      const nextList = editablePlans.filter((p) => p.id !== planId);
      setEditablePlans(nextList);
      if (selectedPlanId === planId) {
        setSelectedPlanId(nextList[0]?.id || "");
      }
      showToast(`Plan "${planName}" permanently deleted from database.`);
      setPlanToDelete(null);
    } catch (err: any) {
      showToast(
        `Failed to delete plan: ${err?.data?.message || err?.message || "Unknown error"}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-muted flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue" />
        <span className="text-xs font-mono">Loading pricing configurations...</span>
      </div>
    );
  }

  // Helper icons per tier
  const getTierIcon = (tierOrId: string) => {
    const key = (tierOrId || "").toLowerCase();
    if (key.includes("enterprise") || key.includes("ent"))
      return <Crown className="w-4 h-4 text-amber-500" />;
    if (key.includes("professional") || key.includes("pro"))
      return <Zap className="w-4 h-4 text-blue" />;
    if (key.includes("starter") || key.includes("start"))
      return <Shield className="w-4 h-4 text-slate-400" />;
    return <Sparkles className="w-4 h-4 text-purple-500" />;
  };

  const activePlansCount = editablePlans.filter((p) => p.isActive !== false).length;
  const inactivePlansCount = editablePlans.length - activePlansCount;

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header Action Bar */}
      <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue/15 text-blue font-bold tracking-wider uppercase border border-blue/20">
              Commercial Engine
            </span>
            <span className="text-xs text-muted font-mono">Dynamic SaaS Pricing</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {activePlansCount} Active on Frontend
            </span>
            {inactivePlansCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                {inactivePlansCount} Inactive
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-ink mt-1">Live SaaS Pricing & Feature Tiers</h2>
          <p className="text-xs text-muted max-w-2xl mt-0.5 leading-relaxed">
            Create new subscription plans, customize Tier badges, set dual-currency fees (INR / USD), and toggle
            plans Active or Inactive. Responsive cards scroll horizontally to preserve full readability.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Create Plan Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Plan</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-bg border border-line rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-blue text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Horizontal Deck</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("focused")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "focused"
                  ? "bg-blue text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Deep Editor</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (pricingPlans) {
                setEditablePlans(JSON.parse(JSON.stringify(pricingPlans)));
                showToast("Pricing form reloaded from database.");
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-bg border border-line text-muted hover:text-ink transition-colors cursor-pointer"
          >
            Discard
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={handleSaveAllPricing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue hover:bg-blue-dark text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isUpdating ? "Saving..." : "Save Pricing Changes"}</span>
          </button>
        </div>
      </div>

      {pricingNotice && (
        <div className="p-4 rounded-xl bg-green/10 border border-green/20 text-green-dark text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green" />
          <span>{pricingNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK SELECT PLAN OVERVIEW (NO HORIZONTAL SCROLL) */}
      {/* ========================================================================= */}
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-mono text-muted text-[11px] flex items-center gap-1.5">
            <span className="font-semibold text-ink">Configured Plans ({editablePlans.length})</span>
            <span className="text-muted/60">&bull; Click any plan to select for deep editing</span>
          </span>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-line bg-panel hover:bg-bg text-emerald-700 hover:text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {editablePlans.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            const isActive = plan.isActive !== false;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden select-none ${
                  isSelected
                    ? "bg-panel border-blue shadow-md ring-2 ring-blue/20"
                    : "bg-panel/70 border-line hover:border-line-hover hover:bg-panel"
                } ${!isActive ? "opacity-75 bg-slate-50/50" : ""}`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-blue text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Featured
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-bg border border-line flex items-center justify-center shrink-0">
                      {getTierIcon(plan.tierBadge || plan.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-ink truncate">{plan.name}</div>
                      <div className="text-[10px] text-muted font-mono uppercase truncate">
                        {plan.id}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <TierBadge tier={plan.tierBadge || plan.id} size="xs" />
                  </div>
                </div>

                {/* Active / Inactive Status & Toggle Bar */}
                <div
                  className="flex items-center justify-between pt-2 border-t border-line/60"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        isActive ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  {/* Direct Toggle Button */}
                  <button
                    type="button"
                    title={isActive ? "Deactivate plan (hide from frontend)" : "Activate plan (show on frontend)"}
                    onClick={(e) => handleTogglePlanActive(plan.id, e)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-3.5 h-3.5 text-slate-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Price & Features count */}
                <div className="flex items-baseline justify-between text-xs font-mono text-muted">
                  <span className="font-bold text-ink font-data text-sm">
                    ₹{plan.priceMonthlyInr.toLocaleString()}{" "}
                    <span className="text-[10px] font-normal text-muted">/mo</span>
                  </span>
                  <span className="text-[10px]">{plan.features.length} features</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: HORIZONTAL COMPARISON DECK (RESPONSIVE HORIZONTAL SCROLLING) */}
      {/* ========================================================================= */}
      {viewMode === "grid" && (
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-mono text-muted flex items-center gap-1.5">
              <span>Horizontal Deck View</span>
              <span className="text-muted/60">&bull; Scroll sideways to inspect & edit all plans without cramming</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll(gridScrollRef, "left")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-line bg-panel hover:bg-bg text-xs font-medium text-ink transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                onClick={() => handleScroll(gridScrollRef, "right")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-line bg-panel hover:bg-bg text-xs font-medium text-ink transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontally scrolling deck */}
          <div
            ref={gridScrollRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 w-full scrollbar-thin scroll-smooth"
          >
            {editablePlans.map((plan, planIdx) => {
              const isActive = plan.isActive !== false;
              return (
                <div
                  key={plan.id}
                  className={`w-[350px] shrink-0 p-6 bg-panel border rounded-2xl shadow-xs space-y-5 flex flex-col justify-between transition-all overflow-hidden relative ${
                    plan.isPopular ? "border-blue ring-2 ring-blue/20" : "border-line"
                  } ${!isActive ? "opacity-80 bg-slate-50/50" : ""}`}
                >
                  <div className="space-y-4">
                    {/* Header with Title & Tier Badge */}
                    <div className="flex items-center justify-between border-b border-line pb-3 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-bg border border-line flex items-center justify-center shrink-0">
                          {getTierIcon(plan.tierBadge || plan.id)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-muted uppercase block truncate">
                            {plan.id}
                          </span>
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) => handlePlanFieldChange(planIdx, "name", e.target.value)}
                            className="text-base font-bold text-ink bg-transparent focus:border-b focus:border-blue focus:outline-hidden w-full truncate"
                          />
                        </div>
                      </div>

                      <div className="shrink-0">
                        <TierBadge tier={plan.tierBadge || plan.id} size="xs" />
                      </div>
                    </div>

                    {/* Active / Inactive Toggle Bar */}
                    <div className="p-2.5 rounded-xl bg-bg border border-line flex items-center justify-between">
                      <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          }`}
                        />
                        <span className={isActive ? "text-emerald-700" : "text-slate-500"}>
                          {isActive ? "ACTIVE (PUBLIC)" : "INACTIVE (HIDDEN)"}
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleTogglePlanActive(plan.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer border transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </button>
                    </div>

                    {/* Tier Badge Picker */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                          Tier Badge
                        </label>
                        <TierBadge tier={plan.tierBadge || plan.id} size="xs" />
                      </div>
                      <CustomDropdown
                        value={
                          TIER_BADGE_PRESETS.includes((plan.tierBadge || plan.id).toUpperCase())
                            ? (plan.tierBadge || plan.id).toUpperCase()
                            : "CUSTOM"
                        }
                        onChange={(val) =>
                          handlePlanFieldChange(planIdx, "tierBadge", val)
                        }
                        options={TIER_BADGE_PRESETS.map((t) => ({ value: t, label: t }))}
                        size="sm"
                      />
                    </div>

                    {/* Tagline */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                        Tagline
                      </label>
                      <textarea
                        rows={2}
                        value={plan.tagline}
                        onChange={(e) => handlePlanFieldChange(planIdx, "tagline", e.target.value)}
                        className="w-full p-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden resize-none leading-relaxed"
                      />
                    </div>

                    {/* Pricing Grid */}
                    <div className="p-3 bg-bg border border-line rounded-xl space-y-2.5">
                      <span className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider block">
                        Pricing (Monthly / Annual)
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-muted block">INR Monthly (₹)</span>
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
                            className="w-full px-2 py-1 bg-panel border border-line rounded text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block">INR Annual (₹)</span>
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
                            className="w-full px-2 py-1 bg-panel border border-line rounded text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line/50">
                        <div>
                          <span className="text-[10px] text-muted block">USD Monthly ($)</span>
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
                            className="w-full px-2 py-1 bg-panel border border-line rounded text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block">USD Annual ($)</span>
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
                            className="w-full px-2 py-1 bg-panel border border-line rounded text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        setViewMode("focused");
                      }}
                      className="text-xs font-semibold text-blue hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Edit in Deep Mode</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlanToDelete(plan)}
                      className="p-1.5 text-muted hover:text-red hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: FOCUSED PLAN DEEP EDITOR */}
      {/* ========================================================================= */}
      {viewMode === "focused" && activePlan && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Deep Configuration Form (7 Columns) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Card 1: Platform Visibility & Active Toggle */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        activePlan.isActive !== false ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                      Plan Availability & Visibility
                    </h3>
                  </div>

                  {/* Delete Plan Button */}
                  <button
                    type="button"
                    onClick={() => setPlanToDelete(activePlan)}
                    className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Plan</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors bg-bg">
                  <div>
                    <span className="text-xs font-bold text-ink block flex items-center gap-2">
                      <span>Frontend Status:</span>
                      {activePlan.isActive !== false ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ACTIVE & PUBLISHED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          INACTIVE (HIDDEN)
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-muted block mt-1 leading-relaxed">
                      {activePlan.isActive !== false
                        ? "Visible to customers on /pricing, in billing upgrades, and during account registration."
                        : "Hidden from customers on /pricing and the frontend. Kept in admin panel as draft."}
                    </span>
                  </div>

                  {/* Interactive Switch */}
                  <button
                    type="button"
                    onClick={() =>
                      handlePlanFieldChange(
                        activePlanIndex,
                        "isActive",
                        !(activePlan.isActive !== false)
                      )
                    }
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      activePlan.isActive !== false ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        activePlan.isActive !== false ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Card 2: Identity, Tier Badge & Tagline */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2 border-b border-line pb-3">
                  <Sliders className="w-3.5 h-3.5 text-blue" />
                  <span>Plan Identity & Tier Badge</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted">Plan Display Name</label>
                    <input
                      type="text"
                      value={activePlan.name}
                      onChange={(e) =>
                        handlePlanFieldChange(activePlanIndex, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs font-bold text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>

                  {/* Tier Badge Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted">Tier Badge</label>
                      <TierBadge tier={activePlan.tierBadge || activePlan.id} size="xs" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-48 shrink-0">
                        <CustomDropdown
                          value={
                            TIER_BADGE_PRESETS.includes((activePlan.tierBadge || activePlan.id).toUpperCase())
                              ? (activePlan.tierBadge || activePlan.id).toUpperCase()
                              : "CUSTOM"
                          }
                          onChange={(val) => {
                            handlePlanFieldChange(activePlanIndex, "tierBadge", val);
                          }}
                          options={TIER_BADGE_PRESETS.map((t) => ({ value: t, label: t }))}
                          size="sm"
                        />
                      </div>
                      <input
                        type="text"
                        value={activePlan.tierBadge || ""}
                        placeholder="Custom Badge label"
                        onChange={(e) =>
                          handlePlanFieldChange(activePlanIndex, "tierBadge", e.target.value.toUpperCase())
                        }
                        className="flex-1 min-w-0 px-3 py-2 bg-bg border border-line rounded-xl text-xs font-mono uppercase text-ink focus:border-blue focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted">
                      Card Ribbon Badge (Optional)
                    </label>
                    <input
                      type="text"
                      value={activePlan.badge || ""}
                      onChange={(e) =>
                        handlePlanFieldChange(activePlanIndex, "badge", e.target.value || null)
                      }
                      placeholder="e.g. MOST POPULAR, FULL PLATFORM"
                      className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted">System Plan Slug / ID</label>
                    <input
                      type="text"
                      disabled
                      value={activePlan.id}
                      className="w-full px-3 py-2 bg-bg/50 border border-line/60 rounded-xl text-xs font-mono text-muted cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Value Proposition Tagline</label>
                  <textarea
                    rows={2}
                    value={activePlan.tagline}
                    onChange={(e) =>
                      handlePlanFieldChange(activePlanIndex, "tagline", e.target.value)
                    }
                    className="w-full p-3 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden resize-none leading-relaxed"
                  />
                </div>

                {/* Popular / Featured Card Toggle */}
                <div className="flex items-center justify-between p-3 bg-bg border border-line rounded-xl">
                  <div>
                    <span className="text-xs font-semibold text-ink block">
                      Highlight as Featured / Most Popular Tier
                    </span>
                    <span className="text-[11px] text-muted block">
                      Adds an eye-catching highlight border and glow badge on the pricing page.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handlePlanFieldChange(activePlanIndex, "isPopular", !activePlan.isPopular)
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      activePlan.isPopular ? "bg-blue" : "bg-line"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        activePlan.isPopular ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Card 3: Dual-Currency Pricing Matrix Card */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2 border-b border-line pb-3">
                  <IndianRupee className="w-3.5 h-3.5 text-green" />
                  <span>Pricing Matrix (INR ₹ & USD $)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* INR Section */}
                  <div className="p-4 bg-bg border border-line rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5 text-blue" />
                        INR (Indian Rupee)
                      </span>
                      {activePlan.priceMonthlyInr > 0 && activePlan.priceAnnualInr > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-green/15 text-green-dark border border-green/20">
                          -
                          {Math.round(
                            (1 - activePlan.priceAnnualInr / activePlan.priceMonthlyInr) * 100
                          )}
                          % Annual
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted">Monthly Billed (₹)</label>
                      <input
                        type="number"
                        value={activePlan.priceMonthlyInr}
                        onChange={(e) =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "priceMonthlyInr",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted">Annual Billed /mo (₹)</label>
                      <input
                        type="number"
                        value={activePlan.priceAnnualInr}
                        onChange={(e) =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "priceAnnualInr",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* USD Section */}
                  <div className="p-4 bg-bg border border-line rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-blue" />
                        USD (Global)
                      </span>
                      {activePlan.priceMonthlyUsd > 0 && activePlan.priceAnnualUsd > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-green/15 text-green-dark border border-green/20">
                          -
                          {Math.round(
                            (1 - activePlan.priceAnnualUsd / activePlan.priceMonthlyUsd) * 100
                          )}
                          % Annual
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted">Monthly Billed ($)</label>
                      <input
                        type="number"
                        value={activePlan.priceMonthlyUsd}
                        onChange={(e) =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "priceMonthlyUsd",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted">Annual Billed /mo ($)</label>
                      <input
                        type="number"
                        value={activePlan.priceAnnualUsd}
                        onChange={(e) =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "priceAnnualUsd",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Call-to-Action (CTA) Config */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2 border-b border-line pb-3">
                  <ArrowRight className="w-3.5 h-3.5 text-blue" />
                  <span>Call To Action (CTA Button)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted">Button Label</label>
                    <input
                      type="text"
                      value={activePlan.ctaLabel}
                      onChange={(e) =>
                        handlePlanFieldChange(activePlanIndex, "ctaLabel", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-muted">Destination URL / Route</label>
                    <input
                      type="text"
                      value={activePlan.ctaHref}
                      onChange={(e) =>
                        handlePlanFieldChange(activePlanIndex, "ctaHref", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs font-mono text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Feature Checklist & Live Customer Preview (5 Columns) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Live Preview Card */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                      Live Customer Preview
                    </span>
                  </div>

                  {/* Currency & Frequency Toggle for Preview */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewCurrency(previewCurrency === "INR" ? "USD" : "INR")}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg border border-line text-ink hover:border-blue cursor-pointer"
                    >
                      {previewCurrency}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewAnnual(!previewAnnual)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                        previewAnnual
                          ? "bg-blue/15 text-blue border-blue/30"
                          : "bg-bg text-muted border-line"
                      }`}
                    >
                      {previewAnnual ? "Annual" : "Monthly"}
                    </button>
                  </div>
                </div>

                {/* Rendered Live Card */}
                <div
                  className={`p-6 rounded-2xl border transition-all ${
                    activePlan.isPopular
                      ? "bg-panel border-blue shadow-lg ring-2 ring-blue/20"
                      : "bg-panel border-line shadow-xs"
                  }`}
                >
                  {/* Status Banner */}
                  <div className="flex items-center justify-between mb-3">
                    <TierBadge tier={activePlan.tierBadge || activePlan.id} size="sm" />
                    <div className="flex items-center gap-1.5">
                      {activePlan.isActive !== false ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          LIVE ON SITE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          INACTIVE (HIDDEN)
                        </span>
                      )}
                      {activePlan.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue text-white uppercase tracking-wider">
                          {activePlan.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-ink">{activePlan.name}</h4>
                  <p className="text-xs text-muted mt-1 min-h-[32px] leading-relaxed">
                    {activePlan.tagline}
                  </p>

                  <div className="my-5 pt-4 border-t border-line flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-ink font-data">
                      {previewCurrency === "INR"
                        ? `₹${(previewAnnual ? activePlan.priceAnnualInr : activePlan.priceMonthlyInr).toLocaleString()}`
                        : `$${(previewAnnual ? activePlan.priceAnnualUsd : activePlan.priceMonthlyUsd).toLocaleString()}`}
                    </span>
                    <span className="text-xs text-muted font-normal"> / month</span>
                  </div>

                  {/* Feature preview list */}
                  <div className="space-y-2 border-t border-line pt-4 mb-5 max-h-56 overflow-y-auto">
                    {activePlan.features.slice(0, 6).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-ink">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                    {activePlan.features.length > 6 && (
                      <span className="text-[10px] text-muted font-mono block pl-5">
                        +{activePlan.features.length - 6} more features included
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue text-white shadow-xs hover:bg-blue-dark transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{activePlan.ctaLabel || "Get Started"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Feature Checklist Management */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Included Plan Features ({activePlan.features.length})</span>
                  </h3>
                  <span className="text-[10px] text-muted font-mono">Editable</span>
                </div>

                {/* Add new feature input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeatureToActive();
                      }
                    }}
                    placeholder="Type a feature bullet point and press Enter..."
                    className="flex-1 px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeatureToActive}
                    className="px-3 py-2 bg-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-dark transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* List of Features */}
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {activePlan.features.map((feat, featIdx) => (
                    <div
                      key={featIdx}
                      className="group flex items-center gap-2 p-1.5 rounded-lg bg-bg border border-line hover:border-line-hover transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) =>
                          handleFeatureTextChange(activePlanIndex, featIdx, e.target.value)
                        }
                        className="w-full bg-transparent text-xs text-ink focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(activePlanIndex, featIdx)}
                        className="p-1 text-muted hover:text-red hover:bg-red/10 rounded cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                        title="Remove feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW PRICING PLAN */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-panel border border-line rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Create New Pricing Plan</h3>
                  <p className="text-xs text-muted">
                    Configure a new dynamic subscription tier with custom badge & pricing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlanSubmit} className="space-y-5">
              {/* Basic Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={newPlanName}
                    onChange={(e) => {
                      setNewPlanName(e.target.value);
                      if (!newPlanId) {
                        setNewPlanId(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, "-")
                            .replace(/-+/g, "-")
                        );
                      }
                    }}
                    placeholder="e.g. Agency Pro, Custom SME"
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs font-bold text-ink focus:border-blue focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink">Plan Slug / ID *</label>
                  <input
                    type="text"
                    required
                    value={newPlanId}
                    onChange={(e) =>
                      setNewPlanId(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_-]/g, "-")
                          .replace(/-+/g, "-")
                      )
                    }
                    placeholder="e.g. agency-pro"
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs font-mono text-ink focus:border-blue focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Tier Badge & Ribbon Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink">Tier Badge Level *</label>
                    <TierBadge tier={newPlanTierBadge} size="xs" />
                  </div>
                  <CustomDropdown
                    value={
                      TIER_BADGE_PRESETS.includes(newPlanTierBadge.toUpperCase())
                        ? newPlanTierBadge.toUpperCase()
                        : "CUSTOM"
                    }
                    onChange={(val) => setNewPlanTierBadge(val)}
                    options={TIER_BADGE_PRESETS.map((t) => ({ value: t, label: t }))}
                    size="sm"
                    className="w-full"
                  />
                  {(!TIER_BADGE_PRESETS.includes(newPlanTierBadge.toUpperCase()) ||
                    newPlanTierBadge.toUpperCase() === "CUSTOM") && (
                    <input
                      type="text"
                      value={newPlanTierBadge === "CUSTOM" ? "" : newPlanTierBadge}
                      onChange={(e) => setNewPlanTierBadge(e.target.value.toUpperCase())}
                      placeholder="Enter custom badge name (e.g. VIP)"
                      className="w-full px-3 py-1.5 bg-bg border border-line rounded-xl text-xs font-mono uppercase text-ink focus:border-blue focus:outline-hidden mt-1.5"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink block">Card Ribbon Badge (Optional)</label>
                  <input
                    type="text"
                    value={newPlanBadge}
                    onChange={(e) => setNewPlanBadge(e.target.value)}
                    placeholder="e.g. BEST VALUE, AGENCY TIER"
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Value Proposition Tagline *</label>
                <textarea
                  rows={2}
                  required
                  value={newPlanTagline}
                  onChange={(e) => setNewPlanTagline(e.target.value)}
                  placeholder="Target audience and primary business benefit..."
                  className="w-full p-2.5 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden resize-none"
                />
              </div>

              {/* Active & Popular Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-bg border border-line rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-ink block">Active on Frontend</span>
                    <span className="text-[10px] text-muted">Visible to customers immediately</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewPlanIsActive(!newPlanIsActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      newPlanIsActive ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        newPlanIsActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3 bg-bg border border-line rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-ink block">Featured / Most Popular</span>
                    <span className="text-[10px] text-muted">Highlights with colored border</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewPlanIsPopular(!newPlanIsPopular)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      newPlanIsPopular ? "bg-blue" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        newPlanIsPopular ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Pricing Matrix */}
              <div className="p-4 bg-bg border border-line rounded-2xl space-y-3">
                <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider block">
                  Dual-Currency Pricing
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-muted font-mono block">INR Monthly (₹)</label>
                    <input
                      type="number"
                      required
                      value={newPlanPriceMonthlyInr}
                      onChange={(e) => setNewPlanPriceMonthlyInr(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted font-mono block">INR Annual /mo (₹)</label>
                    <input
                      type="number"
                      required
                      value={newPlanPriceAnnualInr}
                      onChange={(e) => setNewPlanPriceAnnualInr(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted font-mono block">USD Monthly ($)</label>
                    <input
                      type="number"
                      required
                      value={newPlanPriceMonthlyUsd}
                      onChange={(e) => setNewPlanPriceMonthlyUsd(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted font-mono block">USD Annual /mo ($)</label>
                    <input
                      type="number"
                      required
                      value={newPlanPriceAnnualUsd}
                      onChange={(e) => setNewPlanPriceAnnualUsd(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Features list */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink block">Included Features</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPlanNewFeatureInput}
                    onChange={(e) => setNewPlanNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newPlanNewFeatureInput.trim()) {
                          setNewPlanFeatures([
                            ...newPlanFeatures,
                            newPlanNewFeatureInput.trim(),
                          ]);
                          setNewPlanNewFeatureInput("");
                        }
                      }
                    }}
                    placeholder="Type feature bullet and press Enter..."
                    className="flex-1 px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPlanNewFeatureInput.trim()) {
                        setNewPlanFeatures([
                          ...newPlanFeatures,
                          newPlanNewFeatureInput.trim(),
                        ]);
                        setNewPlanNewFeatureInput("");
                      }
                    }}
                    className="px-3 py-2 bg-panel border border-line hover:bg-bg rounded-xl text-xs font-semibold text-ink transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                  {newPlanFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg border border-line text-[11px] text-ink"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setNewPlanFeatures(newPlanFeatures.filter((_, i) => i !== idx))
                        }
                        className="text-muted hover:text-red cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink border border-line bg-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-panel border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red/10 border border-red/20 text-red flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-ink">Delete Pricing Plan</h3>
              <p className="text-xs text-muted">
                Are you sure you want to delete the plan{" "}
                <span className="font-bold text-ink">"{planToDelete.name}"</span> ({planToDelete.id})?
                This action will remove it from the list.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPlanToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink border border-line bg-bg cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeletePlan}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red hover:bg-red-dark shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Yes, Delete Plan Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

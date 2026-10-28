"use client";

import React, { useState, useEffect, useRef } from "react";
import { PricingPlan } from "@/lib/types";
import { TierBadge } from "@/components/saas/TierBadge";
import { CustomDropdown, CustomDateInput } from "@/components/ui";
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
  Activity,
  LucideInfinity,
  Users,
  Gift,
  Calendar,
  Clock,
  CreditCard,
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

// Helper functions for date & days synchronization
const calculateDateFromDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + (Number(days) || 0));
  return d.toISOString().split("T")[0];
};

const calculateDaysFromDate = (dateStr: string): number => {
  if (!dateStr) return 14;
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
};

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
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "SUBSCRIPTION" | "TRIAL">("ALL");
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
  const [newPlanType, setNewPlanType] = useState<"subscription" | "trial">("subscription");
  const [newPlanIsDefaultTrial, setNewPlanIsDefaultTrial] = useState<boolean>(true);
  const [newPlanTrialDays, setNewPlanTrialDays] = useState<number>(14);
  const [newPlanTrialExpiryDate, setNewPlanTrialExpiryDate] = useState<string>(calculateDateFromDays(14));
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
  const [newPlanMaxTeamMembers, setNewPlanMaxTeamMembers] = useState(5);
  const [newPlanHsLimit, setNewPlanHsLimit] = useState(1000);
  const [newPlanLcLmit, setNewPlanLcLmit] = useState(500);
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
      const sanitized = pricingPlans.map((p) => {
        if (p.planType === "trial") {
          return { ...p, tierBadge: "FREE_TRIAL", isPopular: false };
        }
        return p;
      });
      setEditablePlans(JSON.parse(JSON.stringify(sanitized)));
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
    if (updated[index].planType === "trial") {
      updated[index].tierBadge = "FREE_TRIAL";
      updated[index].isPopular = false;
    }
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

  // Toggle default trial status (ensures only one plan is active default trial)
  const handleToggleDefaultTrial = (planIndex: number) => {
    const isCurrentlyDefault = editablePlans[planIndex].isDefaultTrial;
    const nextList = editablePlans.map((p, idx) => {
      if (idx === planIndex) {
        return { ...p, isDefaultTrial: !isCurrentlyDefault };
      }
      if (!isCurrentlyDefault) {
        return { ...p, isDefaultTrial: false };
      }
      return p;
    });
    setEditablePlans(nextList);
    showToast(
      !isCurrentlyDefault
        ? `"${editablePlans[planIndex].name}" is now the active DEFAULT TRIAL for new organizations.`
        : `Disabled default trial status for "${editablePlans[planIndex].name}".`
    );
  };

  const handleTrialDaysChange = (planIndex: number, days: number) => {
    const validDays = Math.max(1, days || 1);
    handlePlanFieldChange(planIndex, "trialDays", validDays);
  };

  const handleTrialDateChange = (planIndex: number, dateStr: string) => {
    const days = calculateDaysFromDate(dateStr);
    handlePlanFieldChange(planIndex, "trialDays", days);
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

    const isTrial = newPlanType === "trial";
    const createdPlan: PricingPlan = {
      id: cleanId,
      name: newPlanName.trim() || cleanId.toUpperCase(),
      tagline: newPlanTagline.trim() || (isTrial ? "Complimentary access for newly registered organizations." : "Enterprise subscription tier."),
      badge: isTrial ? null : (newPlanBadge.trim() || null),
      tierBadge: isTrial ? "FREE_TRIAL" : (newPlanTierBadge.trim() || "PROFESSIONAL"),
      isActive: isTrial ? true : newPlanIsActive,
      isPopular: isTrial ? false : newPlanIsPopular,
      priceMonthlyInr: isTrial ? 0 : (Number(newPlanPriceMonthlyInr) || 0),
      priceAnnualInr: isTrial ? 0 : (Number(newPlanPriceAnnualInr) || 0),
      priceMonthlyUsd: isTrial ? 0 : (Number(newPlanPriceMonthlyUsd) || 0),
      priceAnnualUsd: isTrial ? 0 : (Number(newPlanPriceAnnualUsd) || 0),
      features: newPlanFeatures.filter((f) => f.trim().length > 0),
      ctaLabel: newPlanCtaLabel.trim() || (isTrial ? "Start Free Trial" : "Get Started"),
      ctaHref: newPlanCtaHref.trim() || `/register?plan=${cleanId}`,
      maxTeamMembers: newPlanMaxTeamMembers === -1 ? -1 : (Number(newPlanMaxTeamMembers) > 0 ? Number(newPlanMaxTeamMembers) : 5),
      hsClassificationLimit: newPlanHsLimit === -1 ? -1 : (isNaN(Number(newPlanHsLimit)) ? 1000 : Number(newPlanHsLimit)),
      landedCostLimit: newPlanLcLmit === -1 ? -1 : (isNaN(Number(newPlanLcLmit)) ? 500 : Number(newPlanLcLmit)),
      planType: newPlanType,
      isDefaultTrial: isTrial ? newPlanIsDefaultTrial : false,
      trialDays: isTrial ? newPlanTrialDays : undefined,
    };

    let nextList = editablePlans.map((p) => {
      if (createdPlan.isDefaultTrial && p.planType === "trial") {
        return { ...p, isDefaultTrial: false };
      }
      return p;
    });
    nextList = [...nextList, createdPlan];
    setSelectedPlanId(cleanId);
    setEditablePlans(nextList);
    setIsCreateModalOpen(false);

    // Reset create modal fields
    setNewPlanType("subscription");
    setNewPlanIsDefaultTrial(true);
    setNewPlanTrialDays(14);
    setNewPlanTrialExpiryDate(calculateDateFromDays(14));
    setNewPlanId("");
    setNewPlanName("");
    setNewPlanTagline("");
    setNewPlanBadge("");
    setNewPlanTierBadge("PROFESSIONAL");
    setNewPlanIsActive(true);
    setNewPlanIsPopular(false);
    setNewPlanMaxTeamMembers(5);
    setNewPlanHsLimit(1000);
    setNewPlanLcLmit(500);

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


      {/* Plan Category Filter Bar */}
      {(() => {
        const subCount = editablePlans.filter((p) => p.planType !== "trial").length;
        const trialCount = editablePlans.filter((p) => p.planType === "trial").length;

        return (
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-line pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider">
                Filter View:
              </span>
              <div className="flex items-center bg-bg border border-line rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("ALL")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    categoryFilter === "ALL"
                      ? "bg-ink text-white shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  All Plans ({editablePlans.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("SUBSCRIPTION")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    categoryFilter === "SUBSCRIPTION"
                      ? "bg-blue text-white shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <CreditCard className="w-3 h-3" />
                  <span>User Subscriptions ({subCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("TRIAL")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    categoryFilter === "TRIAL"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <Gift className="w-3 h-3" />
                  <span>Free Default Trial ({trialCount})</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* QUICK SELECT PLAN OVERVIEW (NO HORIZONTAL SCROLL) */}
      {/* ========================================================================= */}
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-mono text-muted text-[11px] flex items-center gap-1.5">
            <span className="font-semibold text-ink">
              {categoryFilter === "TRIAL"
                ? "Free Trial Plans"
                : categoryFilter === "SUBSCRIPTION"
                ? "User Subscription Plans"
                : "All Plans"}{" "}
              ({
                editablePlans.filter((p) => {
                  if (categoryFilter === "SUBSCRIPTION") return p.planType !== "trial";
                  if (categoryFilter === "TRIAL") return p.planType === "trial";
                  return true;
                }).length
              })
            </span>
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
          {editablePlans
            .filter((p) => {
              if (categoryFilter === "SUBSCRIPTION") return p.planType !== "trial";
              if (categoryFilter === "TRIAL") return p.planType === "trial";
              return true;
            })
            .map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              const isActive = plan.isActive !== false;
              const isTrial = plan.planType === "trial";

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
                {plan.isDefaultTrial && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Default Trial</span>
                  </div>
                )}
                {!plan.isDefaultTrial && plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-blue text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Featured
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-bg border border-line flex items-center justify-center shrink-0">
                      {isTrial ? <Gift className="w-4 h-4 text-emerald-600" /> : getTierIcon(plan.tierBadge || plan.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-ink truncate flex items-center gap-1.5">
                        <span>{plan.name}</span>
                        {isTrial && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            TRIAL
                          </span>
                        )}
                      </div>
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
                {isTrial ? (
                  <div className="flex items-center justify-between pt-2 border-t border-line">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-mono font-semibold text-ink">
                        ONBOARDING TRIAL
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted bg-panel border border-line px-1.5 py-0.5 rounded">
                      Auto-enrolled
                    </span>
                  </div>
                ) : (
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
                )}

                {/* Price & Features count */}
                <div className="flex items-baseline justify-between text-xs font-mono text-muted">
                  {isTrial ? (
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-data text-xs flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{plan.trialDays || 14} Days Free</span>
                    </span>
                  ) : (
                    <span className="font-bold text-ink font-data text-sm">
                      ₹{plan.priceMonthlyInr.toLocaleString()}{" "}
                      <span className="text-[10px] font-normal text-muted">/mo</span>
                    </span>
                  )}
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
            {editablePlans
              .filter((p) => {
                if (categoryFilter === "SUBSCRIPTION") return p.planType !== "trial";
                if (categoryFilter === "TRIAL") return p.planType === "trial";
                return true;
              })
              .map((plan) => {
                const planIdx = editablePlans.findIndex((p) => p.id === plan.id);
                const isActive = plan.isActive !== false;
                const isTrial = plan.planType === "trial";

                return (
                  <div
                    key={plan.id}
                    className={`w-[350px] shrink-0 p-6 bg-panel border rounded-2xl shadow-xs space-y-5 flex flex-col justify-between transition-all overflow-hidden relative ${
                      isTrial
                        ? "border-emerald-500/40 ring-1 ring-emerald-500/20"
                        : plan.isPopular
                        ? "border-blue ring-2 ring-blue/20"
                        : "border-line"
                    } ${!isActive ? "opacity-80 bg-slate-50/50" : ""}`}
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 text-[10px] font-mono font-bold">
                        {isTrial ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            <span>FREE TRIAL PLAN</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue/10 text-blue flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            <span>SUBSCRIPTION</span>
                          </span>
                        )}

                        {plan.isDefaultTrial && (
                          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>DEFAULT FOR NEW SIGNUPS</span>
                          </span>
                        )}
                      </div>

                      {/* Header with Title & Tier Badge */}
                      <div className="flex items-center justify-between border-b border-line pb-3 gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-bg border border-line flex items-center justify-center shrink-0">
                            {isTrial ? <Gift className="w-4 h-4 text-emerald-600" /> : getTierIcon(plan.tierBadge || plan.id)}
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
                      {isTrial ? (
                        <div className="p-2.5 rounded-xl bg-bg border border-line flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5 text-ink">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>ONBOARDING TRIAL</span>
                          </span>
                          <span className="text-[10px] font-mono text-muted bg-panel border border-line px-2 py-0.5 rounded">
                            Auto-assigned
                          </span>
                        </div>
                      ) : (
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
                      )}

                      {/* Tier Badge */}
                      {isTrial ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                              Tier Badge
                            </label>
                            <TierBadge tier="FREE_TRIAL" size="xs" />
                          </div>
                          <div className="px-3 py-2 bg-bg border border-line rounded-xl text-xs flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-ink">Free Tier</span>
                              <span className="text-[10px] text-muted">(Signup Default)</span>
                            </div>
                            <span className="text-[10px] font-mono text-muted">Fixed</span>
                          </div>
                        </div>
                      ) : (
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
                      )}

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

                      {/* Pricing Grid OR Free Trial Configuration */}
                      {isTrial ? (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                              <Gift className="w-3 h-3 text-emerald-600" />
                              <span>Free Trial Settings</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextList = editablePlans.map((p, i) => {
                                  if (i === planIdx) return { ...p, isDefaultTrial: true, planType: "trial" as const };
                                  if (p.planType === "trial") return { ...p, isDefaultTrial: false };
                                  return p;
                                });
                                setEditablePlans(nextList);
                                showToast(`"${plan.name}" set as the default trial plan for new registrations.`);
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer border transition-colors ${
                                plan.isDefaultTrial
                                  ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                                  : "bg-panel text-muted hover:text-ink border-line"
                              }`}
                            >
                              {plan.isDefaultTrial ? "Default Active" : "Set as Default"}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-muted block flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>Duration (Days)</span>
                              </span>
                              <input
                                type="number"
                                min={1}
                                max={365}
                                value={plan.trialDays || 14}
                                onChange={(e) => {
                                  const days = Math.max(1, parseInt(e.target.value) || 1);
                                  handlePlanFieldChange(planIdx, "trialDays", days);
                                }}
                                className="w-full px-2 py-1 bg-panel border border-emerald-500/30 rounded text-xs font-mono font-bold text-ink focus:border-emerald-500 focus:outline-hidden"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] text-muted block flex items-center gap-1 mb-1">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>Expiry from Today</span>
                              </span>
                              <CustomDateInput
                                value={calculateDateFromDays(plan.trialDays || 14)}
                                min={calculateDateFromDays(1)}
                                onChange={(val) => {
                                  const days = calculateDaysFromDate(val);
                                  handlePlanFieldChange(planIdx, "trialDays", days);
                                }}
                                size="sm"
                                placeholder="Select date"
                              />
                            </div>
                          </div>
                          <span className="text-[9px] text-muted block italic">
                            Valid for {plan.trialDays || 14} days from registration (until {calculateDateFromDays(plan.trialDays || 14)} for today&apos;s signups).
                          </span>
                        </div>
                      ) : (
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
                      )}

                    {/* Quotas & Expiration Policy */}
                    <div className="p-3 bg-bg border border-line rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue" />
                          <span>Platform Quotas & Limits</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {/* Team Seats */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted block">Seats</span>
                            <button
                              type="button"
                              onClick={() =>
                                handlePlanFieldChange(
                                  planIdx,
                                  "maxTeamMembers",
                                  plan.maxTeamMembers === -1 ? 5 : -1
                                )
                              }
                              className="text-[9px] text-blue hover:underline cursor-pointer"
                            >
                              {plan.maxTeamMembers === -1 ? "Num" : "∞"}
                            </button>
                          </div>
                          {plan.maxTeamMembers === -1 ? (
                            <button
                              type="button"
                              onClick={() => handlePlanFieldChange(planIdx, "maxTeamMembers", 5)}
                              className="w-full px-1.5 py-1 rounded bg-purple-50 text-purple-700 text-[11px] font-mono font-bold border border-purple-200 text-center cursor-pointer hover:bg-purple-100"
                              title="Click to set numeric limit"
                            >
                              ∞ Unltd
                            </button>
                          ) : (
                            <input
                              type="number"
                              min={1}
                              value={plan.maxTeamMembers ?? 5}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  planIdx,
                                  "maxTeamMembers",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-full px-1.5 py-1 bg-panel border border-line rounded text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                            />
                          )}
                        </div>

                        {/* HS Classify */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted block">HS Lookups</span>
                            <button
                              type="button"
                              onClick={() =>
                                handlePlanFieldChange(
                                  planIdx,
                                  "hsClassificationLimit",
                                  plan.hsClassificationLimit === -1 ? 1000 : -1
                                )
                              }
                              className="text-[9px] text-blue hover:underline cursor-pointer"
                            >
                              {plan.hsClassificationLimit === -1 ? "Num" : "∞"}
                            </button>
                          </div>
                          {plan.hsClassificationLimit === -1 ? (
                            <button
                              type="button"
                              onClick={() => handlePlanFieldChange(planIdx, "hsClassificationLimit", 1000)}
                              className="w-full px-1.5 py-1 rounded bg-purple-50 text-purple-700 text-[11px] font-mono font-bold border border-purple-200 text-center cursor-pointer hover:bg-purple-100"
                              title="Click to set numeric limit"
                            >
                              ∞ Unltd
                            </button>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              value={plan.hsClassificationLimit ?? 1000}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  planIdx,
                                  "hsClassificationLimit",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-1.5 py-1 bg-panel border border-line rounded text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                            />
                          )}
                        </div>

                        {/* Landed Cost */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted block">Landed Cost</span>
                            <button
                              type="button"
                              onClick={() =>
                                handlePlanFieldChange(
                                  planIdx,
                                  "landedCostLimit",
                                  plan.landedCostLimit === -1 ? 500 : -1
                                )
                              }
                              className="text-[9px] text-blue hover:underline cursor-pointer"
                            >
                              {plan.landedCostLimit === -1 ? "Num" : "∞"}
                            </button>
                          </div>
                          {plan.landedCostLimit === -1 ? (
                            <button
                              type="button"
                              onClick={() => handlePlanFieldChange(planIdx, "landedCostLimit", 500)}
                              className="w-full px-1.5 py-1 rounded bg-purple-50 text-purple-700 text-[11px] font-mono font-bold border border-purple-200 text-center cursor-pointer hover:bg-purple-100"
                              title="Click to set numeric limit"
                            >
                              ∞ Unltd
                            </button>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              value={plan.landedCostLimit ?? 500}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  planIdx,
                                  "landedCostLimit",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-1.5 py-1 bg-panel border border-line rounded text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                            />
                          )}
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

                {activePlan.planType === "trial" ? (
                  <div className="p-4 rounded-xl border border-line bg-bg flex items-center justify-between gap-4 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-ink block flex items-center gap-2">
                        <span>Plan Role:</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          INTERNAL DEFAULT TRIAL
                        </span>
                      </span>
                      <span className="text-[11px] text-muted block mt-1 leading-relaxed">
                        Exclusively assigned to new organizations upon account registration. Hidden from the public pricing and checkout pages.
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-panel border border-line text-xs font-semibold text-ink">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Registration Active</span>
                    </div>
                  </div>
                ) : (
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
                )}
              </div>

              {/* Card 2: Identity, Tier Badge & Tagline */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2 border-b border-line pb-3">
                  <Sliders className="w-3.5 h-3.5 text-blue" />
                  <span>Plan Identity & Tier Badge</span>
                </h3>

                {/* Plan Category Indicator & Switch */}
                <div className="p-3 bg-bg border border-line rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-ink block flex items-center gap-1.5">
                      {activePlan.planType === "trial" ? (
                        <>
                          <Gift className="w-4 h-4 text-emerald-600" />
                          <span>Plan Category: Free Default Trial Plan</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 text-blue" />
                          <span>Plan Category: User Subscription Plan</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-muted block mt-0.5">
                      {activePlan.planType === "trial"
                        ? "Free onboarding tier for new organizations with custom duration."
                        : "Paid subscription tier with recurring monthly & annual rates."}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-panel border border-line p-1 rounded-lg text-[11px] shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        handlePlanFieldChange(activePlanIndex, "planType", "subscription");
                        handlePlanFieldChange(activePlanIndex, "isDefaultTrial", false);
                      }}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        activePlan.planType !== "trial"
                          ? "bg-blue text-white shadow-xs font-bold"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      Subscription
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handlePlanFieldChange(activePlanIndex, "planType", "trial");
                        handlePlanFieldChange(activePlanIndex, "priceMonthlyInr", 0);
                        handlePlanFieldChange(activePlanIndex, "priceAnnualInr", 0);
                        handlePlanFieldChange(activePlanIndex, "priceMonthlyUsd", 0);
                        handlePlanFieldChange(activePlanIndex, "priceAnnualUsd", 0);
                        if (!activePlan.trialDays) {
                          handlePlanFieldChange(activePlanIndex, "trialDays", 14);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        activePlan.planType === "trial"
                          ? "bg-emerald-600 text-white shadow-xs font-bold"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      Free Trial
                    </button>
                  </div>
                </div>

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
                  {activePlan.planType === "trial" ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted">Profile Tier Badge</label>
                        <TierBadge tier="FREE_TRIAL" size="xs" />
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-bg border border-line rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-bold text-ink">Free Tier</span>
                          <span className="text-[11px] text-muted">(Auto-assigned on registration)</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted uppercase">Fixed</span>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>

                <div className={`grid grid-cols-1 ${activePlan.planType === "trial" ? "" : "sm:grid-cols-2"} gap-4`}>
                  {activePlan.planType !== "trial" && (
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
                  )}

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
                {activePlan.planType !== "trial" && (
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
                )}
              </div>

              {/* Card 3: Dual-Currency Pricing Matrix (Subscription) OR Free Trial Configuration (Trial) */}
              {activePlan.planType === "trial" ? (
                <div className="p-5 bg-panel border-2 border-emerald-500/30 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-600" />
                      <span>Free Default Trial Configuration</span>
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Zero-Fee Evaluation Plan
                    </span>
                  </div>

                  {/* Logic 1: Toggle to make it default use */}
                  <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">
                          Default Trial for New Organizations
                        </span>
                        {activePlan.isDefaultTrial && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-600 text-white font-bold">
                            ACTIVE DEFAULT
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted block mt-0.5">
                        When toggled active, any new organization registering at <code>/register</code> instantly gets this plan activated with full platform access.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleDefaultTrial(activePlanIndex)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        activePlan.isDefaultTrial ? "bg-emerald-600" : "bg-line"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          activePlan.isDefaultTrial ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Logic 2: Plan's expiration date select picker with days input */}
                  <div className="p-4 bg-bg border border-line rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Plan Expiration Duration & Calendar End Date</span>
                      </span>
                      <span className="text-[10px] font-mono text-muted">
                        Two-way synchronized
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {/* Days Input */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted flex items-center justify-between">
                          <span>Trial Duration (Days)</span>
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">
                            {activePlan.trialDays || 14} Days
                          </span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={activePlan.trialDays || 14}
                          onChange={(e) =>
                            handleTrialDaysChange(
                              activePlanIndex,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                        />
                        <span className="text-[10px] text-muted block">
                          Changing days auto-advances the expiration calendar date from today.
                        </span>
                      </div>

                      {/* Expiration Date Select Picker */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-emerald-600" />
                            <span>Plan Expiration Date Picker</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">
                            {calculateDateFromDays(activePlan.trialDays || 14)}
                          </span>
                        </label>
                        <CustomDateInput
                          value={calculateDateFromDays(activePlan.trialDays || 14)}
                          min={calculateDateFromDays(1)}
                          onChange={(val) => handleTrialDateChange(activePlanIndex, val)}
                          placeholder="Select expiration date"
                          size="sm"
                        />
                        <span className="text-[10px] text-muted block">
                          Auto-selects ending date from today so this plan only works up to that date.
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Public Messaging Preview */}
                    <div className="p-3 bg-panel border border-emerald-500/20 rounded-xl space-y-1.5 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Landing Page & Public Pricing Message:</span>
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">
                          "{activePlan.trialDays || 14} days free trial"
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed">
                        Organizations registering today will be enrolled in <strong>{activePlan.name}</strong> until{" "}
                        <strong className="text-ink">{calculateDateFromDays(activePlan.trialDays || 14)}</strong>. Upon trial expiration, access will pause and an automated banner will guide them to subscribe to a paid plan.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
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
              )}

              {/* Card 4: Quotas & Workspace Usage Limits */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue" />
                    <span>Quotas & Workspace Usage Limits</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Team Member Limit */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue" />
                        <span>Team Members (Seats)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "maxTeamMembers",
                            activePlan.maxTeamMembers === -1 ? 5 : -1
                          )
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          activePlan.maxTeamMembers === -1
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-panel text-muted hover:text-ink border-line"
                        }`}
                      >
                        {activePlan.maxTeamMembers === -1 ? "Unlimited" : "Set Unlimited"}
                      </button>
                    </div>

                    {activePlan.maxTeamMembers === -1 ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-purple-50/70 border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-700">
                        <span className="flex items-center gap-1.5">
                          <span className="text-base font-bold"><LucideInfinity className="w-4 h-4"/></span>
                          <span>Unlimited</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlanFieldChange(activePlanIndex, "maxTeamMembers", 5)}
                          className="text-[10px] text-purple-600 hover:text-purple-800 underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <input
                        type="number"
                        min={1}
                        value={activePlan.maxTeamMembers ?? 5}
                        onChange={(e) =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "maxTeamMembers",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    )}
                    <p className="text-[10px] text-muted">
                      {activePlan.maxTeamMembers === -1
                        ? "Organizations on this plan can invite unlimited team members."
                        : "Max user seats allowed in an organization workspace on this plan."}
                    </p>
                  </div>

                  {/* HS Classification Usage Limit */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-500" />
                        <span>HS Classification Limit</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "hsClassificationLimit",
                            activePlan.hsClassificationLimit === -1 ? 1000 : -1
                          )
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          activePlan.hsClassificationLimit === -1
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-panel text-muted hover:text-ink border-line"
                        }`}
                      >
                        {activePlan.hsClassificationLimit === -1 ? "Unlimited" : "Set Unlimited"}
                      </button>
                    </div>

                    {activePlan.hsClassificationLimit === -1 ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-purple-50/70 border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-700">
                        <span className="flex items-center gap-1.5">
                          <span className="text-base font-bold"><LucideInfinity className="w-4 h-4"/></span>
                          <span>Unlimited</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlanFieldChange(activePlanIndex, "hsClassificationLimit", 1000)}
                          className="text-[10px] text-purple-600 hover:text-purple-800 underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        value={activePlan.hsClassificationLimit ?? 1000}
                        onChange={(e) =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "hsClassificationLimit",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    )}
                    <p className="text-[10px] text-muted">
                      {activePlan.hsClassificationLimit === -1
                        ? "Subscribed users can run unlimited HS queries without quotas."
                        : "Max HS classification queries permitted per billing period."}
                    </p>
                  </div>

                  {/* Landed Cost Usage Limit */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Landed Cost Usage Limit</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "landedCostLimit",
                            activePlan.landedCostLimit === -1 ? 500 : -1
                          )
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          activePlan.landedCostLimit === -1
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-panel text-muted hover:text-ink border-line"
                        }`}
                      >
                        {activePlan.landedCostLimit === -1 ? "Unlimited" : "Set Unlimited"}
                      </button>
                    </div>

                    {activePlan.landedCostLimit === -1 ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-purple-50/70 border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-700">
                        <span className="flex items-center gap-1.5">
                          <span className="text-base font-bold"><LucideInfinity className="w-4 h-4"/></span>
                          <span>Unlimited</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlanFieldChange(activePlanIndex, "landedCostLimit", 500)}
                          className="text-[10px] text-purple-600 hover:text-purple-800 underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        value={activePlan.landedCostLimit ?? 500}
                        onChange={(e) =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "landedCostLimit",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    )}
                    <p className="text-[10px] text-muted">
                      {activePlan.landedCostLimit === -1
                        ? "Subscribed organizations can run unlimited calculations."
                        : "Max multimodal landed cost computations permitted per period."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 5: Call-to-Action (CTA) Config */}
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
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div className="bg-panel border border-line rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header (Fixed) */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4 shrink-0 bg-panel">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-ink">Create New Pricing Plan</h3>
                  <p className="text-xs text-muted">
                    Configure a new dynamic subscription tier or free trial plan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlanSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
                {/* Step 1: Prompt - Plan Category Selection */}
              <div className="p-4 bg-bg border border-line rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink">
                    Are you creating a User Subscription Plan or Free Default Trial Plan? *
                  </label>
                  <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-panel text-muted border border-line">
                    Step 1 of 2
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: User Subscription Plan */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewPlanType("subscription");
                      if (newPlanName === "Free Trial" || newPlanName === "Default Trial") {
                        setNewPlanName("");
                        setNewPlanId("");
                        setNewPlanTagline("");
                        setNewPlanBadge("");
                        setNewPlanTierBadge("PROFESSIONAL");
                        setNewPlanCtaLabel("Get Started");
                        setNewPlanCtaHref("/register");
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      newPlanType === "subscription"
                        ? "bg-blue/10 border-blue text-ink ring-2 ring-blue/20"
                        : "bg-panel border-line hover:border-ink/20 text-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`p-2 rounded-lg ${newPlanType === "subscription" ? "bg-blue text-white" : "bg-bg text-muted"}`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink">User Subscription Plan</div>
                        <div className="text-[10px] text-muted">Dual-currency recurring billing</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Standard paid tier with INR ₹ and USD $ monthly & annual prices, seat limits, and query quotas.
                    </p>
                  </button>

                  {/* Option 2: Free Default Trial Plan */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewPlanType("trial");
                      if (!newPlanName) {
                        setNewPlanName("Free Trial");
                        setNewPlanId("free-trial");
                        setNewPlanTagline("Complimentary full-access trial for newly registered organizations.");
                        setNewPlanBadge("FREE TRIAL");
                        setNewPlanTierBadge("STARTER");
                        setNewPlanCtaLabel("Start Free Trial");
                        setNewPlanCtaHref("/register");
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      newPlanType === "trial"
                        ? "bg-emerald-500/10 border-emerald-500 text-ink ring-2 ring-emerald-500/20"
                        : "bg-panel border-line hover:border-ink/20 text-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`p-2 rounded-lg ${newPlanType === "trial" ? "bg-emerald-600 text-white" : "bg-bg text-muted"}`}>
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink">Free Default Trial Plan</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">Configurable duration & auto-expiry</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">
                      No-cost trial tier with default signup toggle, duration in days, and synchronized expiration date.
                    </p>
                  </button>
                </div>
              </div>

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
                    placeholder={newPlanType === "trial" ? "e.g. Free Trial, Pro Trial" : "e.g. Agency Pro, Custom SME"}
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
                    placeholder={newPlanType === "trial" ? "e.g. free-trial" : "e.g. agency-pro"}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs font-mono text-ink focus:border-blue focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Tier Badge & Ribbon Badge */}
              {newPlanType === "trial" ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink">Profile Tier Badge</label>
                    <TierBadge tier="FREE_TRIAL" size="xs" />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-bg border border-line rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-ink">Free Tier</span>
                      <span className="text-[11px] text-muted">(Auto-assigned on registration)</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted uppercase">Fixed</span>
                  </div>
                </div>
              ) : (
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
              )}

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
              {newPlanType !== "trial" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-bg border border-line rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-ink block">Active Status</span>
                      <span className="text-[10px] text-muted">Enable plan for platform usage</span>
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
                      <span className="text-xs font-bold text-ink block">Featured / Highlight</span>
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
              )}

              {/* Step 2: Plan-Specific Configuration (Free Trial Logics vs Paid Pricing Matrix) */}
              {newPlanType === "trial" ? (
                <div className="p-4 bg-emerald-500/5 border-2 border-emerald-500/30 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                        Free Default Trial Logics
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      ₹0 / $0 Free Tier
                    </span>
                  </div>

                  {/* Logic 1: Toggle to make it default use */}
                  <div className="flex items-center justify-between p-3.5 bg-panel border border-emerald-500/20 rounded-xl">
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">
                          Toggle to make it default use
                        </span>
                        {newPlanIsDefaultTrial && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-600 text-white font-bold">
                            DEFAULT ON SIGNUP
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted block mt-0.5">
                        If enabled, any new organization that registers at <code>/register</code> will instantly have this plan activated upon creation.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewPlanIsDefaultTrial(!newPlanIsDefaultTrial)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        newPlanIsDefaultTrial ? "bg-emerald-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          newPlanIsDefaultTrial ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Logic 2: Plan's expiration date select picker with days input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-ink flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Trial Duration (Days) *</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">
                          {newPlanTrialDays} Days
                        </span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={365}
                        value={newPlanTrialDays}
                        onChange={(e) => {
                          const days = parseInt(e.target.value) || 1;
                          setNewPlanTrialDays(days);
                          setNewPlanTrialExpiryDate(calculateDateFromDays(days));
                        }}
                        className="w-full px-3 py-2 bg-panel border border-line rounded-xl text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                      <span className="text-[10px] text-muted block">
                        Days input that auto-selects expiration dates from today.
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-ink flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Plan Expiration Date Picker *</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">
                          {newPlanTrialExpiryDate}
                        </span>
                      </label>
                      <CustomDateInput
                        value={newPlanTrialExpiryDate}
                        min={calculateDateFromDays(1)}
                        onChange={(dateVal) => {
                          setNewPlanTrialExpiryDate(dateVal);
                          setNewPlanTrialDays(calculateDaysFromDate(dateVal));
                        }}
                        placeholder="Select expiration date"
                        size="sm"
                      />
                      <span className="text-[10px] text-muted block">
                        This plan only works up to this selected ending date.
                      </span>
                    </div>
                  </div>

                  {/* Message preview */}
                  <div className="p-3 bg-panel border border-emerald-500/20 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Public Pricing & Landing Page Preview:</span>
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md font-mono">
                        "{newPlanTrialDays} days free trial"
                      </span>
                    </div>
                    <p className="text-[10px] text-muted leading-relaxed">
                      Configured to grant {newPlanTrialDays} days free trial. After {newPlanTrialDays} days (on {newPlanTrialExpiryDate}), the plan expires and users receive expiration notices to buy a subscription plan.
                    </p>
                  </div>
                </div>
              ) : (
                /* Dual-Currency Pricing Matrix for User Subscription Plan */
                <div className="p-4 bg-bg border border-line rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider block">
                    Dual-Currency Pricing Matrix (INR ₹ & USD $)
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
              )}

              {/* Plan Quotas & Workspace Usage Limits */}
              <div className="p-4 bg-bg border border-line rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue" />
                    <span>Quotas & Workspace Usage Limits</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Seats */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-ink flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue" />
                        <span>Team Seats *</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewPlanMaxTeamMembers(newPlanMaxTeamMembers === -1 ? 5 : -1)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          newPlanMaxTeamMembers === -1
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-panel text-muted hover:text-ink border-line"
                        }`}
                      >
                        {newPlanMaxTeamMembers === -1 ? "✓ Unlimited" : "Set Unlimited"}
                      </button>
                    </div>

                    {newPlanMaxTeamMembers === -1 ? (
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-purple-50/70 border border-purple-200 rounded-lg text-xs font-mono font-bold text-purple-700">
                        <span className="flex items-center gap-1">
                          <span className="text-sm">∞</span>
                          <span>Unlimited Seats</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewPlanMaxTeamMembers(5)}
                          className="text-[10px] text-purple-600 hover:text-purple-800 underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <input
                        type="number"
                        required
                        min={1}
                        value={newPlanMaxTeamMembers}
                        onChange={(e) => setNewPlanMaxTeamMembers(parseInt(e.target.value) || 1)}
                        className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    )}
                    <span className="text-[10px] text-muted block">
                      {newPlanMaxTeamMembers === -1
                        ? "Organizations can invite unlimited members."
                        : "Max user accounts permitted in organization."}
                    </span>
                  </div>

                  {/* HS Classification Usage Limit */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-ink flex items-center gap-1">
                        <Activity className="w-3 h-3 text-indigo-500" />
                        <span>HS Lookups *</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewPlanHsLimit(newPlanHsLimit === -1 ? 1000 : -1)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          newPlanHsLimit === -1
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-panel text-muted hover:text-ink border-line"
                        }`}
                      >
                        {newPlanHsLimit === -1 ? "✓ Unlimited" : "Set Unlimited"}
                      </button>
                    </div>

                    {newPlanHsLimit === -1 ? (
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-purple-50/70 border border-purple-200 rounded-lg text-xs font-mono font-bold text-purple-700">
                        <span className="flex items-center gap-1">
                          <span className="text-sm">∞</span>
                          <span>Unlimited HS</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewPlanHsLimit(1000)}
                          className="text-[10px] text-purple-600 hover:text-purple-800 underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <input
                        type="number"
                        required
                        min={0}
                        value={newPlanHsLimit}
                        onChange={(e) => setNewPlanHsLimit(parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    )}
                    <span className="text-[10px] text-muted block">
                      {newPlanHsLimit === -1
                        ? "Subscribers can run unlimited HS queries."
                        : "Allowed HS queries per billing cycle."}
                    </span>
                  </div>

                  {/* Landed Cost Usage Limit */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-ink flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        <span>Landed Cost *</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewPlanLcLmit(newPlanLcLmit === -1 ? 500 : -1)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          newPlanLcLmit === -1
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-panel text-muted hover:text-ink border-line"
                        }`}
                      >
                        {newPlanLcLmit === -1 ? "✓ Unlimited" : "Set Unlimited"}
                      </button>
                    </div>

                    {newPlanLcLmit === -1 ? (
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-purple-50/70 border border-purple-200 rounded-lg text-xs font-mono font-bold text-purple-700">
                        <span className="flex items-center gap-1">
                          <span className="text-sm">∞</span>
                          <span>Unlimited LC</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewPlanLcLmit(500)}
                          className="text-[10px] text-purple-600 hover:text-purple-800 underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <input
                        type="number"
                        required
                        min={0}
                        value={newPlanLcLmit}
                        onChange={(e) => setNewPlanLcLmit(parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    )}
                    <span className="text-[10px] text-muted block">
                      {newPlanLcLmit === -1
                        ? "Subscribers can run unlimited LC runs."
                        : "Allowed Landed Cost calculations per cycle."}
                    </span>
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

              </div>

              {/* Modal Footer Actions (Fixed at bottom) */}
              <div className="px-6 py-4 border-t border-line bg-panel/95 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0">
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

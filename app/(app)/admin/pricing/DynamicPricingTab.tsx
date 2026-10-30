"use client";

import React, { useState, useEffect } from "react";
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
  Check,
  Eye,
  IndianRupee,
  DollarSign,
  ArrowRight,
  Shield,
  Zap,
  Crown,
  AlertTriangle,
  X,
  LucideInfinity,
  Users,
  Gift,
  Calendar,
  Clock,
  CreditCard,
  Layers,
  Settings2,
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
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "SUBSCRIPTION" | "TRIAL">("ALL");
  const [pricingNotice, setPricingNotice] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [previewCurrency, setPreviewCurrency] = useState<"INR" | "USD">("INR");
  const [previewAnnual, setPreviewAnnual] = useState<boolean>(false);

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
  const [newPlanFeatureInput, setNewPlanFeatureInput] = useState("");
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

  const handleTogglePlanActive = (planId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const idx = editablePlans.findIndex((p) => p.id === planId);
    if (idx < 0) return;
    const current = editablePlans[idx].isActive !== false;
    const nextState = !current;
    handlePlanFieldChange(idx, "isActive", nextState);
    showToast(`Plan "${editablePlans[idx].name}" marked as ${nextState ? "Live" : "Hidden"}.`);
  };

  const handleToggleDefaultTrial = async (planIndex: number) => {
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

    try {
      if (onSavePricing) {
        await onSavePricing(nextList);
      }
      showToast(
        !isCurrentlyDefault
          ? `"${editablePlans[planIndex].name}" is now the active default trial.`
          : `Default trial disabled for "${editablePlans[planIndex].name}".`
      );
    } catch (err: any) {
      showToast(
        `Failed to update default trial: ${err?.data?.message || err?.message || "Unknown error"}`
      );
    }
  };

  const handleTrialDaysChange = (planIndex: number, days: number) => {
    const validDays = Math.max(1, days || 1);
    handlePlanFieldChange(planIndex, "trialDays", validDays);
  };

  const handleTrialDateChange = (planIndex: number, dateStr: string) => {
    const days = calculateDaysFromDate(dateStr);
    handlePlanFieldChange(planIndex, "trialDays", days);
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
      setPricingNotice("All pricing plans updated and published successfully.");
      setTimeout(() => setPricingNotice(null), 4000);
      showToast("Pricing plans saved successfully.");
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to update pricing.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreatePlanSubmit = async (e: React.FormEvent) => {
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
      showToast(`A plan with ID '${cleanId}' already exists.`);
      return;
    }

    const isTrial = newPlanType === "trial";
    const createdPlan: PricingPlan = {
      id: cleanId,
      name: newPlanName.trim() || cleanId.toUpperCase(),
      tagline:
        newPlanTagline.trim() ||
        (isTrial
          ? "Complimentary access for newly registered organizations."
          : "Enterprise subscription tier."),
      badge: isTrial ? null : newPlanBadge.trim() || null,
      tierBadge: isTrial ? "FREE_TRIAL" : newPlanTierBadge.trim() || "PROFESSIONAL",
      isActive: newPlanIsActive,
      isPopular: isTrial ? false : newPlanIsPopular,
      priceMonthlyInr: isTrial ? 0 : Number(newPlanPriceMonthlyInr) || 0,
      priceAnnualInr: isTrial ? 0 : Number(newPlanPriceAnnualInr) || 0,
      priceMonthlyUsd: isTrial ? 0 : Number(newPlanPriceMonthlyUsd) || 0,
      priceAnnualUsd: isTrial ? 0 : Number(newPlanPriceAnnualUsd) || 0,
      features: newPlanFeatures.filter((f) => f.trim().length > 0),
      ctaLabel: newPlanCtaLabel.trim() || (isTrial ? "Start Free Trial" : "Get Started"),
      ctaHref: newPlanCtaHref.trim() || `/register?plan=${cleanId}`,
      maxTeamMembers:
        newPlanMaxTeamMembers === -1
          ? -1
          : Number(newPlanMaxTeamMembers) > 0
          ? Number(newPlanMaxTeamMembers)
          : 5,
      hsClassificationLimit:
        newPlanHsLimit === -1 ? -1 : isNaN(Number(newPlanHsLimit)) ? 1000 : Number(newPlanHsLimit),
      landedCostLimit:
        newPlanLcLmit === -1 ? -1 : isNaN(Number(newPlanLcLmit)) ? 500 : Number(newPlanLcLmit),
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

    setIsCreating(true);
    try {
      if (onSavePricing) {
        await onSavePricing(nextList);
      }
      setIsCreateModalOpen(false);

      // Reset modal state
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
      setNewPlanFeatureInput("");

      showToast(`Plan "${createdPlan.name}" created and saved successfully.`);
    } catch (err: any) {
      showToast(
        `Failed to save plan: ${err?.data?.message || err?.message || "Unknown error"}`
      );
    } finally {
      setIsCreating(false);
    }
  };

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
      showToast(`Plan "${planName}" deleted successfully.`);
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

  const filteredPlans = editablePlans.filter((p) => {
    if (categoryFilter === "SUBSCRIPTION") return p.planType !== "trial";
    if (categoryFilter === "TRIAL") return p.planType === "trial";
    return true;
  });

  const activePlansCount = editablePlans.filter((p) => p.isActive !== false).length;
  const inactivePlansCount = editablePlans.length - activePlansCount;

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-panel border border-line rounded-2xl shadow-xs">
        {/* Left: Filter Tabs & Counts */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-bg border border-line rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                categoryFilter === "SUBSCRIPTION"
                  ? "bg-blue text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Subscriptions ({editablePlans.filter((p) => p.planType !== "trial").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("TRIAL")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                categoryFilter === "TRIAL"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Free Trial ({editablePlans.filter((p) => p.planType === "trial").length})</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-muted pl-2 border-l border-line">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {activePlansCount} Live
            </span>
            {inactivePlansCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {inactivePlansCount} Hidden
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (pricingPlans) {
                setEditablePlans(JSON.parse(JSON.stringify(pricingPlans)));
                showToast("Form reloaded from database.");
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-bg border border-line text-muted hover:text-ink hover:bg-panel transition-colors cursor-pointer"
          >
            Discard
          </button>

          <button
            type="button"
            onClick={() => {
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
              setNewPlanPriceMonthlyInr(14999);
              setNewPlanPriceAnnualInr(11999);
              setNewPlanPriceMonthlyUsd(199);
              setNewPlanPriceAnnualUsd(159);
              setNewPlanMaxTeamMembers(5);
              setNewPlanHsLimit(1000);
              setNewPlanLcLmit(500);
              setNewPlanFeatures([
                "Custom HS classifications per month",
                "Statutory duty & tariff calculator",
                "Full Landed Cost & port Logistics",
                "Priority compliance advisor support",
              ]);
              setNewPlanFeatureInput("");
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Plan</span>
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={handleSaveAllPricing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue hover:bg-blue-dark text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {pricingNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{pricingNotice}</span>
        </div>
      )}

      {/* 2. Plan Cards Grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlans.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            const isActive = plan.isActive !== false;
            const isTrial = plan.planType === "trial";

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden select-none ${
                  isSelected
                    ? "bg-panel border-blue shadow-sm ring-2 ring-blue/20"
                    : "bg-panel/80 border-line hover:border-line-hover hover:bg-panel"
                } ${!isActive ? "opacity-75" : ""}`}
              >
                {/* Ribbon Tag if Featured / Default */}
                {plan.isDefaultTrial && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Default Trial</span>
                  </div>
                )}
                {!plan.isDefaultTrial && plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-blue text-white text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Featured
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-bg border border-line flex items-center justify-center shrink-0">
                      {isTrial ? (
                        <Gift className="w-4 h-4 text-emerald-600" />
                      ) : (
                        getTierIcon(plan.tierBadge || plan.id)
                      )}
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

                {/* Price Display */}
                <div className="py-2 border-y border-line">
                  {isTrial ? (
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-sm font-bold text-emerald-600 font-data flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Free Trial</span>
                      </span>
                      <span className="text-xs text-muted font-bold font-data">
                        {plan.trialDays || 14} Days
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between font-mono">
                      <div className="text-sm font-bold text-ink font-data">
                        ₹{plan.priceMonthlyInr.toLocaleString()}{" "}
                        <span className="text-[10px] font-normal text-muted">/mo</span>
                      </div>
                      <div className="text-xs text-muted font-data font-semibold">
                        ${plan.priceMonthlyUsd}/mo
                      </div>
                    </div>
                  )}
                </div>

                {/* Resource Limits Row */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-muted text-center">
                  <div className="p-1.5 bg-bg border border-line rounded-lg">
                    <span className="block text-ink font-bold">
                      {plan.maxTeamMembers === -1 ? "∞" : plan.maxTeamMembers ?? 5}
                    </span>
                    <span className="text-[9px]">Seats</span>
                  </div>
                  <div className="p-1.5 bg-bg border border-line rounded-lg">
                    <span className="block text-ink font-bold">
                      {plan.hsClassificationLimit === -1
                        ? "∞"
                        : plan.hsClassificationLimit ?? 1000}
                    </span>
                    <span className="text-[9px]">HS Lookups</span>
                  </div>
                  <div className="p-1.5 bg-bg border border-line rounded-lg">
                    <span className="block text-ink font-bold">
                      {plan.landedCostLimit === -1 ? "∞" : plan.landedCostLimit ?? 500}
                    </span>
                    <span className="text-[9px]">Landed Cost</span>
                  </div>
                </div>

                {/* Footer Status & Actions */}
                <div className="flex items-center justify-between pt-1">
                  {isTrial ? (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-panel border border-line text-muted">
                      {plan.isDefaultTrial ? "Default Signup Plan" : "Trial Tier"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleTogglePlanActive(plan.id, e)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {isActive ? "Live" : "Hidden"}
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted font-mono">
                      {plan.features.length} feats
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlanToDelete(plan);
                      }}
                      className="p-1 text-muted hover:text-red hover:bg-red/10 rounded transition-colors cursor-pointer"
                      title="Delete plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Editor Section for Selected Plan */}
      {activePlan && (
        <div className="space-y-4 pt-2">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue/10 text-blue border border-blue/20">
                <Settings2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <span>Edit Plan:</span>
                  <span className="text-blue">{activePlan.name}</span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-mono uppercase">ID: {activePlan.id}</span>
              <TierBadge tier={activePlan.tierBadge || activePlan.id} size="sm" />
            </div>
          </div>

          {/* Form + Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Card A: Identity & Tier Badge */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2 border-b border-line pb-2.5">
                  <Sliders className="w-3.5 h-3.5 text-blue" />
                  <span>General Information</span>
                </h4>

                {/* Plan Category Switch */}
                <div className="flex items-center justify-between p-3 bg-bg border border-line rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-ink block">Plan Category</span>
                    <span className="text-[11px] text-muted">
                      {activePlan.planType === "trial"
                        ? "Free onboarding trial tier"
                        : "Paid subscription tier"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-panel border border-line p-1 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        handlePlanFieldChange(activePlanIndex, "planType", "subscription");
                        handlePlanFieldChange(activePlanIndex, "isDefaultTrial", false);
                      }}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        activePlan.planType !== "trial"
                          ? "bg-blue text-white shadow-xs"
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
                      className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        activePlan.planType === "trial"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      Free Trial
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted">Plan Name</label>
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
                        </div>
                        <span className="text-[10px] font-mono text-muted uppercase">Fixed</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted">Tier Badge Level</label>
                        <TierBadge tier={activePlan.tierBadge || activePlan.id} size="xs" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-40 shrink-0">
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
                          placeholder="Custom Badge"
                          onChange={(e) =>
                            handlePlanFieldChange(activePlanIndex, "tierBadge", e.target.value.toUpperCase())
                          }
                          className="flex-1 min-w-0 px-3 py-2 bg-bg border border-line rounded-xl text-xs font-mono uppercase text-ink focus:border-blue focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {activePlan.planType !== "trial" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted">Card Ribbon Badge (Optional)</label>
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
                      <label className="text-xs font-semibold text-muted">Plan Slug</label>
                      <input
                        type="text"
                        disabled
                        value={activePlan.id}
                        className="w-full px-3 py-2 bg-bg/50 border border-line/60 rounded-xl text-xs font-mono text-muted cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Tagline</label>
                  <textarea
                    rows={2}
                    value={activePlan.tagline}
                    onChange={(e) =>
                      handlePlanFieldChange(activePlanIndex, "tagline", e.target.value)
                    }
                    className="w-full p-3 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden resize-none leading-relaxed"
                  />
                </div>

                {/* Toggles for Paid Plans */}
                {activePlan.planType !== "trial" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center justify-between p-3 bg-bg border border-line rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-ink block">Public Status</span>
                        <span className="text-[10px] text-muted">
                          {activePlan.isActive !== false ? "Visible on /pricing" : "Hidden from site"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handlePlanFieldChange(activePlanIndex, "isActive", !(activePlan.isActive !== false))
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          activePlan.isActive !== false ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            activePlan.isActive !== false ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-bg border border-line rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-ink block">Featured Tier</span>
                        <span className="text-[10px] text-muted">Highlighted with glow border</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handlePlanFieldChange(activePlanIndex, "isPopular", !activePlan.isPopular)
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          activePlan.isPopular ? "bg-blue" : "bg-slate-300"
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
                )}
              </div>

              {/* Card B: Pricing Matrix (Subscription) OR Trial Configuration (Trial) */}
              {activePlan.planType === "trial" ? (
                <div className="p-5 bg-panel border border-emerald-500/30 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Free Trial Duration & Expiration</span>
                    </h4>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ₹0 / $0 Evaluation
                    </span>
                  </div>

                  {/* Default Trial Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-bg border border-line rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-ink block">
                        Default for New Registrations
                      </span>
                      <span className="text-[11px] text-muted">
                        Assigned automatically to new organizations on signup.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleDefaultTrial(activePlanIndex)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted flex items-center justify-between">
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
                          handleTrialDaysChange(activePlanIndex, parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted flex items-center justify-between">
                        <span>Expiration Calendar Date</span>
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2 border-b border-line pb-2.5">
                    <IndianRupee className="w-3.5 h-3.5 text-blue" />
                    <span>Pricing Matrix (INR ₹ & USD $)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* INR Section */}
                    <div className="p-3.5 bg-bg border border-line rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-blue" />
                          <span>INR (₹)</span>
                        </span>
                        {activePlan.priceMonthlyInr > 0 && activePlan.priceAnnualInr > 0 && (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Save{" "}
                            {Math.round(
                              (1 - activePlan.priceAnnualInr / activePlan.priceMonthlyInr) * 100
                            )}
                            %
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-muted">Monthly (₹)</label>
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
                        <label className="text-[11px] text-muted">Annual /mo (₹)</label>
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
                    <div className="p-3.5 bg-bg border border-line rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-blue" />
                          <span>USD ($)</span>
                        </span>
                        {activePlan.priceMonthlyUsd > 0 && activePlan.priceAnnualUsd > 0 && (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Save{" "}
                            {Math.round(
                              (1 - activePlan.priceAnnualUsd / activePlan.priceMonthlyUsd) * 100
                            )}
                            %
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-muted">Monthly ($)</label>
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
                        <label className="text-[11px] text-muted">Annual /mo ($)</label>
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

              {/* Card C: Resource Quotas & Limits */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2 border-b border-line pb-2.5">
                  <Users className="w-3.5 h-3.5 text-blue" />
                  <span>Quotas & Limits</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Seats */}
                  <div className="p-3.5 bg-bg border border-line rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted">Team Seats</label>
                      <button
                        type="button"
                        onClick={() =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "maxTeamMembers",
                            activePlan.maxTeamMembers === -1 ? 5 : -1
                          )
                        }
                        className="text-[10px] font-mono text-blue hover:underline cursor-pointer"
                      >
                        {activePlan.maxTeamMembers === -1 ? "Set Limit" : "Unlimited"}
                      </button>
                    </div>

                    {activePlan.maxTeamMembers === -1 ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-panel border border-line rounded-lg text-xs font-bold text-purple-700">
                        <span className="flex items-center gap-1.5">
                          <LucideInfinity className="w-4 h-4" />
                          <span>Unlimited</span>
                        </span>
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
                        className="w-full px-3 py-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    )}
                  </div>

                  {/* HS Lookup */}
                  <div className="p-3.5 bg-bg border border-line rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted">HS Lookups</label>
                      <button
                        type="button"
                        onClick={() =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "hsClassificationLimit",
                            activePlan.hsClassificationLimit === -1 ? 1000 : -1
                          )
                        }
                        className="text-[10px] font-mono text-blue hover:underline cursor-pointer"
                      >
                        {activePlan.hsClassificationLimit === -1 ? "Set Limit" : "Unlimited"}
                      </button>
                    </div>

                    {activePlan.hsClassificationLimit === -1 ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-panel border border-line rounded-lg text-xs font-bold text-purple-700">
                        <span className="flex items-center gap-1.5">
                          <LucideInfinity className="w-4 h-4" />
                          <span>Unlimited</span>
                        </span>
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
                        className="w-full px-3 py-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    )}
                  </div>

                  {/* Landed Cost */}
                  <div className="p-3.5 bg-bg border border-line rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted">Landed Cost</label>
                      <button
                        type="button"
                        onClick={() =>
                          handlePlanFieldChange(
                            activePlanIndex,
                            "landedCostLimit",
                            activePlan.landedCostLimit === -1 ? 500 : -1
                          )
                        }
                        className="text-[10px] font-mono text-blue hover:underline cursor-pointer"
                      >
                        {activePlan.landedCostLimit === -1 ? "Set Limit" : "Unlimited"}
                      </button>
                    </div>

                    {activePlan.landedCostLimit === -1 ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-panel border border-line rounded-lg text-xs font-bold text-purple-700">
                        <span className="flex items-center gap-1.5">
                          <LucideInfinity className="w-4 h-4" />
                          <span>Unlimited</span>
                        </span>
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
                        className="w-full px-3 py-2 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Card D: Features Checklist */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Included Features ({activePlan.features.length})</span>
                  </h4>
                </div>

                {/* Add Input */}
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
                    placeholder="Enter feature title and press Add..."
                    className="flex-1 px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeatureToActive}
                    className="px-4 py-2 bg-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-dark transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Feature list */}
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
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

            {/* Right Column: Live Customer Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-5 sticky top-20">
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-blue" />
                    <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                      Live Customer Preview
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
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

                {/* Rendered Preview Card */}
                <div
                  className={`p-6 rounded-2xl border transition-all ${
                    activePlan.isPopular
                      ? "bg-panel border-blue shadow-lg ring-2 ring-blue/20"
                      : "bg-panel border-line shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <TierBadge tier={activePlan.tierBadge || activePlan.id} size="sm" />
                    <div className="flex items-center gap-1.5">
                      {activePlan.isActive !== false ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Live
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Hidden
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

                  <div className="my-4 pt-4 border-t border-line flex items-baseline gap-1">
                    {activePlan.planType === "trial" ? (
                      <span className="text-3xl font-extrabold text-emerald-600 font-data">
                        Free Trial
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold text-ink font-data">
                          {previewCurrency === "INR"
                            ? `₹${(previewAnnual ? activePlan.priceAnnualInr : activePlan.priceMonthlyInr).toLocaleString()}`
                            : `$${(previewAnnual ? activePlan.priceAnnualUsd : activePlan.priceMonthlyUsd).toLocaleString()}`}
                        </span>
                        <span className="text-xs text-muted font-normal"> / month</span>
                      </>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-line pt-4 mb-5 max-h-52 overflow-y-auto">
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

                {/* CTA Settings Box */}
                <div className="p-3.5 bg-bg border border-line rounded-xl space-y-3">
                  <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider block">
                    Call To Action Button
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted block mb-1">Button Label</label>
                      <input
                        type="text"
                        value={activePlan.ctaLabel}
                        onChange={(e) =>
                          handlePlanFieldChange(activePlanIndex, "ctaLabel", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs text-ink focus:border-blue focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted block mb-1">Button Link</label>
                      <input
                        type="text"
                        value={activePlan.ctaHref}
                        onChange={(e) =>
                          handlePlanFieldChange(activePlanIndex, "ctaHref", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono text-ink focus:border-blue focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setPlanToDelete(activePlan)}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-red hover:bg-red/10 border border-red/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete This Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Create New Plan */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div className="bg-panel border border-line rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4 shrink-0 bg-panel">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Create New Plan</h3>
                  <p className="text-xs text-muted">Configure a subscription or trial tier.</p>
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

            <form onSubmit={handleCreatePlanSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
                {/* Plan Category Pills */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPlanType("subscription");
                      if (newPlanName === "Free Trial" || newPlanId === "free-trial") {
                        setNewPlanName("");
                        setNewPlanId("");
                        setNewPlanTagline("");
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      newPlanType === "subscription"
                        ? "bg-blue/10 border-blue text-ink ring-2 ring-blue/20"
                        : "bg-bg border border-line text-muted"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue" />
                    <div>
                      <div className="text-xs font-bold text-ink">Subscription Plan</div>
                      <div className="text-[10px] text-muted">Recurring INR & USD billing</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewPlanType("trial");
                      if (!newPlanName || newPlanName === "") {
                        setNewPlanName("Free Trial");
                        setNewPlanId("free-trial");
                        setNewPlanTagline("Complimentary full-access trial for newly registered organizations.");
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      newPlanType === "trial"
                        ? "bg-emerald-500/10 border-emerald-500 text-ink ring-2 ring-emerald-500/20"
                        : "bg-bg border border-line text-muted"
                    }`}
                  >
                    <Gift className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-ink">Free Trial Plan</div>
                      <div className="text-[10px] text-muted">Zero-fee trial duration</div>
                    </div>
                  </button>
                </div>

                {/* Plan Status & Visibility */}
                {newPlanType === "subscription" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-bg border border-line rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-ink block">Active Status</span>
                        <span className="text-[10px] text-muted">
                          {newPlanIsActive ? "Live on public pricing" : "Hidden from checkout"}
                        </span>
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

                    <div className="flex items-center justify-between p-3 bg-bg border border-line rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-ink block">Featured Tier</span>
                        <span className="text-[10px] text-muted">
                          {newPlanIsPopular ? "Highlighted with glow badge" : "Standard tier presentation"}
                        </span>
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
                ) : (
                  <div className="flex items-center justify-between p-3 bg-bg border border-line rounded-xl">
                    <div>
                      <span className="text-xs font-semibold text-ink block">Active Status</span>
                      <span className="text-[10px] text-muted">
                        {newPlanIsActive ? "Available for organization onboarding" : "Temporarily disabled"}
                      </span>
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
                )}

                {/* Name & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Plan Name *</label>
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
                      placeholder="e.g. Agency Pro"
                      className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs font-bold text-ink focus:border-blue focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Plan Slug *</label>
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

                {/* Tier Badge */}
                {newPlanType === "trial" ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-bg border border-line rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-ink">Profile Tier: Free Tier</span>
                    </div>
                    <TierBadge tier="FREE_TRIAL" size="xs" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink">Tier Badge Level</label>
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
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink">Ribbon Badge (Optional)</label>
                      <input
                        type="text"
                        value={newPlanBadge}
                        onChange={(e) => setNewPlanBadge(e.target.value)}
                        placeholder="e.g. MOST POPULAR"
                        className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Tagline */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Tagline</label>
                  <textarea
                    rows={2}
                    value={newPlanTagline}
                    onChange={(e) => setNewPlanTagline(e.target.value)}
                    placeholder="Brief description for customers..."
                    className="w-full p-2.5 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden resize-none"
                  />
                </div>

                {/* Trial Settings OR Pricing Matrix */}
                {newPlanType === "trial" ? (
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Trial Configuration</span>
                      </span>
                      <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPlanIsDefaultTrial}
                          onChange={(e) => setNewPlanIsDefaultTrial(e.target.checked)}
                          className="rounded text-emerald-600"
                        />
                        <span>Default for new signups</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-muted block mb-1">Duration (Days)</label>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={newPlanTrialDays}
                          onChange={(e) => {
                            const days = parseInt(e.target.value) || 1;
                            setNewPlanTrialDays(days);
                            setNewPlanTrialExpiryDate(calculateDateFromDays(days));
                          }}
                          className="w-full px-3 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted block mb-1">Calendar Expiration</label>
                        <CustomDateInput
                          value={newPlanTrialExpiryDate}
                          min={calculateDateFromDays(1)}
                          onChange={(dateVal) => {
                            setNewPlanTrialExpiryDate(dateVal);
                            setNewPlanTrialDays(calculateDaysFromDate(dateVal));
                          }}
                          placeholder="Select date"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-bg border border-line rounded-xl space-y-2.5">
                    <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider block">
                      Pricing (Monthly / Annual)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-muted block">INR Monthly (₹)</label>
                        <input
                          type="number"
                          value={newPlanPriceMonthlyInr}
                          onChange={(e) => setNewPlanPriceMonthlyInr(parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted block">INR Annual (₹)</label>
                        <input
                          type="number"
                          value={newPlanPriceAnnualInr}
                          onChange={(e) => setNewPlanPriceAnnualInr(parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted block">USD Monthly ($)</label>
                        <input
                          type="number"
                          value={newPlanPriceMonthlyUsd}
                          onChange={(e) => setNewPlanPriceMonthlyUsd(parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted block">USD Annual ($)</label>
                        <input
                          type="number"
                          value={newPlanPriceAnnualUsd}
                          onChange={(e) => setNewPlanPriceAnnualUsd(parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Platform Quotas & Limits */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider">
                      Platform Quotas & Limits
                    </span>
                    <span className="text-[10px] text-muted">Toggle unlimited (∞) or specify count</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Seats */}
                    <div className="p-3 bg-bg border border-line rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted">Seats</label>
                        <button
                          type="button"
                          onClick={() => setNewPlanMaxTeamMembers(newPlanMaxTeamMembers === -1 ? 5 : -1)}
                          className="text-[10px] font-mono text-blue hover:underline cursor-pointer"
                        >
                          {newPlanMaxTeamMembers === -1 ? "Set Limit" : "Unlimited"}
                        </button>
                      </div>
                      {newPlanMaxTeamMembers === -1 ? (
                        <div className="flex items-center justify-between px-3 py-1.5 bg-panel border border-line rounded-lg text-xs font-bold text-purple-700">
                          <span className="flex items-center gap-1.5">
                            <LucideInfinity className="w-3.5 h-3.5" />
                            <span>Unlimited</span>
                          </span>
                        </div>
                      ) : (
                        <input
                          type="number"
                          min={1}
                          value={newPlanMaxTeamMembers}
                          onChange={(e) => setNewPlanMaxTeamMembers(parseInt(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                        />
                      )}
                    </div>

                    {/* HS Lookups */}
                    <div className="p-3 bg-bg border border-line rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted">HS Lookups</label>
                        <button
                          type="button"
                          onClick={() => setNewPlanHsLimit(newPlanHsLimit === -1 ? 1000 : -1)}
                          className="text-[10px] font-mono text-blue hover:underline cursor-pointer"
                        >
                          {newPlanHsLimit === -1 ? "Set Limit" : "Unlimited"}
                        </button>
                      </div>
                      {newPlanHsLimit === -1 ? (
                        <div className="flex items-center justify-between px-3 py-1.5 bg-panel border border-line rounded-lg text-xs font-bold text-purple-700">
                          <span className="flex items-center gap-1.5">
                            <LucideInfinity className="w-3.5 h-3.5" />
                            <span>Unlimited</span>
                          </span>
                        </div>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          value={newPlanHsLimit}
                          onChange={(e) => setNewPlanHsLimit(parseInt(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                        />
                      )}
                    </div>

                    {/* Landed Cost */}
                    <div className="p-3 bg-bg border border-line rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted">Landed Cost</label>
                        <button
                          type="button"
                          onClick={() => setNewPlanLcLmit(newPlanLcLmit === -1 ? 500 : -1)}
                          className="text-[10px] font-mono text-blue hover:underline cursor-pointer"
                        >
                          {newPlanLcLmit === -1 ? "Set Limit" : "Unlimited"}
                        </button>
                      </div>
                      {newPlanLcLmit === -1 ? (
                        <div className="flex items-center justify-between px-3 py-1.5 bg-panel border border-line rounded-lg text-xs font-bold text-purple-700">
                          <span className="flex items-center gap-1.5">
                            <LucideInfinity className="w-3.5 h-3.5" />
                            <span>Unlimited</span>
                          </span>
                        </div>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          value={newPlanLcLmit}
                          onChange={(e) => setNewPlanLcLmit(parseInt(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-panel border border-line rounded-lg text-xs font-mono font-bold text-ink focus:border-blue focus:outline-hidden"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Included Features */}
                <div className="p-3.5 bg-bg border border-line rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Included Features ({newPlanFeatures.length})</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPlanFeatureInput}
                      onChange={(e) => setNewPlanFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newPlanFeatureInput.trim()) {
                            setNewPlanFeatures((prev) => [...prev, newPlanFeatureInput.trim()]);
                            setNewPlanFeatureInput("");
                          }
                        }
                      }}
                      placeholder="Type feature name and click Add..."
                      className="flex-1 px-3 py-1.5 bg-panel border border-line rounded-lg text-xs text-ink focus:border-blue focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPlanFeatureInput.trim()) {
                          setNewPlanFeatures((prev) => [...prev, newPlanFeatureInput.trim()]);
                          setNewPlanFeatureInput("");
                        }
                      }}
                      className="px-3 py-1.5 bg-blue text-white rounded-lg text-xs font-semibold hover:bg-blue-dark transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {newPlanFeatures.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {newPlanFeatures.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-panel border border-line text-xs text-ink"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewPlanFeatures((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-muted hover:text-red p-1 rounded-md hover:bg-red/10 cursor-pointer transition-colors shrink-0"
                            title="Remove feature"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-line bg-panel flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink border border-line bg-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCreating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{isCreating ? "Saving to Database..." : "Create Plan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Delete Confirmation */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-panel border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red/10 border border-red/20 text-red flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-ink">Delete Pricing Plan</h3>
              <p className="text-xs text-muted">
                Are you sure you want to delete{" "}
                <span className="font-bold text-ink">"{planToDelete.name}"</span> ({planToDelete.id})?
                This action cannot be undone.
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
                <span>{isDeleting ? "Deleting..." : "Delete Plan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

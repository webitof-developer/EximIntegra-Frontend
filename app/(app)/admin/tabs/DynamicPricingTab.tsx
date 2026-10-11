"use client";

import React, { useState, useEffect } from "react";
import { PricingPlan } from "@/lib/types";
import { TierBadge } from "@/components/saas/TierBadge";
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
} from "lucide-react";

interface DynamicPricingTabProps {
  pricingPlans: PricingPlan[];
  isLoading?: boolean;
  onSavePricing: (plans: PricingPlan[]) => Promise<any>;
  showToast: (msg: string) => void;
}

export function DynamicPricingTab({
  pricingPlans,
  isLoading,
  onSavePricing,
  showToast,
}: DynamicPricingTabProps) {
  const [editablePlans, setEditablePlans] = useState<PricingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("professional");
  const [viewMode, setViewMode] = useState<"focused" | "grid">("focused");
  const [pricingNotice, setPricingNotice] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [previewCurrency, setPreviewCurrency] = useState<"INR" | "USD">("INR");
  const [previewAnnual, setPreviewAnnual] = useState<boolean>(false);

  useEffect(() => {
    if (pricingPlans && pricingPlans.length > 0) {
      setEditablePlans(JSON.parse(JSON.stringify(pricingPlans)));
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
      setPricingNotice("Live SaaS pricing plans updated and persisted successfully across public and settings pages!");
      setTimeout(() => setPricingNotice(null), 4000);
      showToast("SaaS pricing plans saved successfully.");
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Failed to update SaaS pricing.");
    } finally {
      setIsUpdating(false);
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
  const getTierIcon = (id: string) => {
    if (id === "enterprise") return <Crown className="w-4 h-4 text-purple-400" />;
    if (id === "professional") return <Zap className="w-4 h-4 text-blue" />;
    return <Shield className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue/15 text-blue font-bold tracking-wider uppercase border border-blue/20">
              Commercial Engine
            </span>
            <span className="text-xs text-muted font-mono">Dynamic SaaS Pricing</span>
          </div>
          <h2 className="text-xl font-bold text-ink mt-1">Live SaaS Pricing & Feature Tiers</h2>
          <p className="text-xs text-muted max-w-2xl mt-0.5 leading-relaxed">
            Configure subscription tiers, dual-currency billing (INR / USD), plan badges, and feature checklists.
            Changes saved here update the live Public Pricing page (<span className="text-blue font-mono">/pricing</span>) and Settings (<span className="text-blue font-mono">/settings</span>).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center bg-bg border border-line rounded-xl p-1 text-xs">
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
              <span>3-Tier Grid</span>
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
      {/* MODE 1: FOCUSED PLAN EDITOR WITH LIVE PREVIEW */}
      {/* ========================================================================= */}
      {viewMode === "focused" && activePlan && (
        <div className="space-y-6">
          {/* Quick Select Plan Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {editablePlans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isSelected
                      ? "bg-panel border-blue shadow-md ring-2 ring-blue/20"
                      : "bg-panel/60 border-line hover:border-line-hover hover:bg-panel"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 right-0 bg-blue text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                      Featured
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-bg border border-line flex items-center justify-center">
                        {getTierIcon(plan.id)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-ink">{plan.name}</div>
                        <div className="text-[10px] text-muted font-mono uppercase">
                          {plan.id.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <TierBadge tier={plan.id} size="xs" />
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-line/50">
                    <div className="text-lg font-bold font-data text-ink">
                      ₹{plan.priceMonthlyInr.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted">/mo</span>
                    </div>
                    <span className="text-[11px] text-muted font-mono">
                      {plan.features.length} features
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 2-Column Split: Form Editor (Left) & Live Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Deep Configuration Form (7 Columns) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Identity & Branding Card */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2 border-b border-line pb-3">
                  <Sliders className="w-3.5 h-3.5 text-blue" />
                  <span>Plan Identity & Tagline</span>
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted">Card Ribbon Badge</label>
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
                      Adds an eye-catching highlight border and badge on the pricing page.
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

              {/* Dual-Currency Pricing Matrix Card */}
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
                        <DollarSign className="w-3.5 h-3.5 text-green" />
                        USD (Global Currency)
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

              {/* Call-to-Action (CTA) Config */}
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

            {/* RIGHT: Feature Checklist & Live Preview (5 Columns) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Live Preview Card */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
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
                      ? "bg-gradient-to-b from-[#1E293B]/70 to-[#0F172A] border-blue shadow-lg ring-1 ring-blue/30"
                      : "bg-[#0F172A]/80 border-line"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <TierBadge tier={activePlan.id} size="sm" />
                    {activePlan.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue text-white uppercase tracking-wider">
                        {activePlan.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-bold text-white">{activePlan.name}</h4>
                  <p className="text-xs text-slate-300 mt-1 min-h-[32px] leading-relaxed">
                    {activePlan.tagline}
                  </p>

                  <div className="my-5 pt-4 border-t border-slate-700/60 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-data">
                      {previewCurrency === "INR"
                        ? `₹${(previewAnnual
                            ? activePlan.priceAnnualInr
                            : activePlan.priceMonthlyInr
                          ).toLocaleString()}`
                        : `$${previewAnnual
                            ? activePlan.priceAnnualUsd
                            : activePlan.priceMonthlyUsd
                          }`}
                    </span>
                    <span className="text-xs text-slate-400">/month</span>
                  </div>

                  <div className="w-full py-2.5 rounded-xl bg-blue text-white text-xs font-bold text-center shadow-md">
                    {activePlan.ctaLabel}
                  </div>

                  <div className="mt-5 space-y-2 pt-4 border-t border-slate-700/60">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      Included Capabilities:
                    </div>
                    {activePlan.features.slice(0, 5).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                    {activePlan.features.length > 5 && (
                      <span className="text-[11px] text-slate-400 block pt-1">
                        + {activePlan.features.length - 5} more capabilities
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Features Checklist Editor */}
              <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                      Feature Checklist ({activePlan.features.length})
                    </h3>
                    <p className="text-[11px] text-muted">Bullet capabilities displayed on tier card</p>
                  </div>
                </div>

                {/* Quick Add Input */}
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
                    placeholder="Type new capability and press Enter..."
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-xs text-ink placeholder:text-muted focus:border-blue focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeatureToActive}
                    disabled={!newFeatureText.trim()}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-40"
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
                      <Check className="w-3.5 h-3.5 text-green shrink-0 ml-1" />
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
      {/* MODE 2: 3-TIER COMPARISON GRID */}
      {/* ========================================================================= */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {editablePlans.map((plan, planIdx) => (
            <div
              key={plan.id}
              className={`p-6 bg-panel border rounded-2xl shadow-xs space-y-5 flex flex-col justify-between transition-all ${
                plan.isPopular
                  ? "border-blue ring-2 ring-blue/20 bg-panel"
                  : "border-line"
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-bg border border-line flex items-center justify-center">
                      {getTierIcon(plan.id)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-muted uppercase block">
                        {plan.id}
                      </span>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) =>
                          handlePlanFieldChange(planIdx, "name", e.target.value)
                        }
                        className="text-base font-bold text-ink bg-transparent focus:border-b focus:border-blue focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <TierBadge tier={plan.id} size="xs" />
                </div>

                {/* Tagline */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                    Tagline
                  </label>
                  <textarea
                    rows={2}
                    value={plan.tagline}
                    onChange={(e) =>
                      handlePlanFieldChange(planIdx, "tagline", e.target.value)
                    }
                    className="w-full p-2 bg-bg border border-line rounded-xl text-xs text-ink focus:border-blue focus:outline-hidden resize-none"
                  />
                </div>

                {/* Pricing Grid */}
                <div className="p-3 bg-bg border border-line rounded-xl space-y-2.5">
                  <span className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider block">
                    Pricing (Monthly / Annual)
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted block">INR Monthly</span>
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
                      <span className="text-[10px] text-muted block">INR Annual</span>
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
                      <span className="text-[10px] text-muted block">USD Monthly</span>
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
                      <span className="text-[10px] text-muted block">USD Annual</span>
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

                {/* Features Count & Switch to Deep Editor */}
                <div className="flex items-center justify-between pt-2 border-t border-line">
                  <span className="text-xs text-muted font-mono">
                    {plan.features.length} capabilities
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setViewMode("focused");
                    }}
                    className="text-xs text-blue hover:text-blue-dark font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAppSelector } from "@/store";
import {
  useGetAdminContentQuery,
  useUpdateLandingContentMutation,
  useUpdatePricingContentMutation,
  useResetContentToDefaultMutation,
  useGetPricingPlansQuery,
} from "@/store/adminApi";
import { AdminNav } from "../AdminNav";
import { ToastNotification, ToastVariant } from "@/components/ui";
import { getApiErrorMessage, resolveTrialDays } from "@/lib/utils";
import {
  LandingPageContent,
  PricingPageContent,
} from "@/lib/types";
import {
  Globe,
  DollarSign,
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  Sparkles,
  Layers,
  ShieldCheck,
  FileText,
  Sliders,
  HelpCircle,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const STORAGE_KEY = "admin_content_collapsed_sections";

const ALL_COLLAPSED_INITIAL: Record<string, boolean> = {
  hero: true,
  interactiveDemo: true,
  features: true,
  governance: true,
  footer: true,
  pricingHeader: true,
  pricingMatrixHeader: true,
  pricingFaqs: true,
  pricingEnterprise: true,
};

// Module-level in-memory flag: resets to true on full browser reload (F5 / browser refresh)
// but stays false across Next.js client-side route transitions.
let isInitialBrowserPageLoad = true;

function checkIsPageReload(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navEntries && navEntries.length > 0) {
      return navEntries[0].type === "reload";
    }
    const legacyNav = (performance as unknown as { navigation?: { type?: number } })?.navigation;
    return legacyNav?.type === 1; // 1 = TYPE_RELOAD
  } catch {
    return false;
  }
}

function getInitialCollapsedSections(): Record<string, boolean> {
  if (typeof window === "undefined") {
    return ALL_COLLAPSED_INITIAL;
  }
  const isReload = isInitialBrowserPageLoad && checkIsPageReload();
  isInitialBrowserPageLoad = false;

  if (isReload) {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      }
    } catch {}
  } else {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_COLLAPSED_INITIAL));
    } catch {}
  }
  return ALL_COLLAPSED_INITIAL;
}

export default function AdminContentPage() {
  const user = useAppSelector((state) => state.auth.user);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [activeTab, setActiveTab] = useState<"landing" | "pricing">("landing");

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<ToastVariant>("success");

  // Reset Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Form State
  const [landingForm, setLandingForm] = useState<LandingPageContent | null>(null);
  const [pricingForm, setPricingForm] = useState<PricingPageContent | null>(null);

  // Accordion collapsed state for sections (defaults to ALL CLOSED when opening the page; restored on refresh)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(getInitialCollapsedSections);

  // Helper to check if a section is collapsed
  const isSectionCollapsed = (id: string): boolean => {
    return collapsedSections[id] !== undefined ? collapsedSections[id] : true;
  };

  const {
    data: contentData,
    isLoading,
    refetch,
    isFetching,
  } = useGetAdminContentQuery(undefined, {
    skip: !mounted || user?.role !== "ADMIN",
  });

  // Initialize/synchronize form state during render without useEffect
  const [prevContentData, setPrevContentData] = useState(contentData);
  if (contentData !== prevContentData) {
    setPrevContentData(contentData);
    if (contentData?.landing) {
      setLandingForm(JSON.parse(JSON.stringify(contentData.landing)));
    }
    if (contentData?.pricing) {
      setPricingForm(JSON.parse(JSON.stringify(contentData.pricing)));
    }
  }

  const { data: pricingPlansData } = useGetPricingPlansQuery(undefined, {
    skip: !mounted || user?.role !== "ADMIN",
  });
  const trialDays = resolveTrialDays(pricingPlansData);

  const [updateLanding, { isLoading: isUpdatingLanding }] = useUpdateLandingContentMutation();
  const [updatePricing, { isLoading: isUpdatingPricing }] = useUpdatePricingContentMutation();
  const [resetContent, { isLoading: isResetting }] = useResetContentToDefaultMutation();

  const showToast = (text: string, type: ToastVariant = "success") => {
    setToastMessage(text);
    setToastVariant(type);
  };

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => {
      const current = prev[id] !== undefined ? prev[id] : true;
      const next = { ...prev, [id]: !current };
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const currentTabSectionIds = activeTab === "landing"
    ? ["hero", "interactiveDemo", "features", "governance", "footer"]
    : ["pricingHeader", "pricingMatrixHeader", "pricingFaqs", "pricingEnterprise"];

  const areAllCurrentSectionsCollapsed = currentTabSectionIds.every((id) => isSectionCollapsed(id));

  const toggleAllCurrentTabSections = () => {
    setCollapsedSections((prev) => {
      const next = { ...prev };
      const targetState = !areAllCurrentSectionsCollapsed;
      currentTabSectionIds.forEach((id) => {
        next[id] = targetState;
      });
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const isSaving = isUpdatingLanding || isUpdatingPricing;

  // Save current active tab content
  const handleSave = async () => {
    try {
      if (activeTab === "landing" && landingForm) {
        const res = await updateLanding(landingForm).unwrap();
        showToast(res.message || "Landing page content successfully saved and published!");
      } else if (activeTab === "pricing" && pricingForm) {
        const res = await updatePricing(pricingForm).unwrap();
        showToast(res.message || "Pricing page content successfully saved and published!");
      }
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err, "Failed to save content configuration."), "error");
    }
  };

  // Reset to factory defaults
  const handleResetConfirm = async () => {
    try {
      const res = await resetContent(activeTab).unwrap();
      if (activeTab === "landing" && res.data) {
        setLandingForm(JSON.parse(JSON.stringify(res.data)));
      } else if (activeTab === "pricing" && res.data) {
        setPricingForm(JSON.parse(JSON.stringify(res.data)));
      }
      setIsResetModalOpen(false);
      showToast(res.message || `Reset ${activeTab} page to standard defaults.`);
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err, "Failed to reset content."), "error");
    }
  };

  // Helpers to mutate landing form
  const updateLandingHero = (field: string, val: unknown) => {
    if (!landingForm) return;
    setLandingForm({
      ...landingForm,
      hero: { ...landingForm.hero, [field]: val },
    });
  };

  const updateLandingHeroMetric = (index: number, field: string, val: string) => {
    if (!landingForm) return;
    const nextMetrics = [...landingForm.hero.metrics];
    nextMetrics[index] = { ...nextMetrics[index], [field]: val };
    setLandingForm({
      ...landingForm,
      hero: { ...landingForm.hero, metrics: nextMetrics },
    });
  };

  const updateLandingInteractiveDemo = (field: string, val: string) => {
    if (!landingForm) return;
    setLandingForm({
      ...landingForm,
      interactiveDemo: { ...landingForm.interactiveDemo, [field]: val },
    });
  };

  const updateLandingFeatures = (field: string, val: unknown) => {
    if (!landingForm) return;
    setLandingForm({
      ...landingForm,
      features: { ...landingForm.features, [field]: val },
    });
  };

  const updateLandingEngineCard = (index: number, field: string, val: string) => {
    if (!landingForm) return;
    const nextEngines = [...landingForm.features.engines];
    nextEngines[index] = { ...nextEngines[index], [field]: val };
    setLandingForm({
      ...landingForm,
      features: { ...landingForm.features, engines: nextEngines },
    });
  };

  const updateLandingGovernance = (field: string, val: unknown) => {
    if (!landingForm) return;
    setLandingForm({
      ...landingForm,
      governance: { ...landingForm.governance, [field]: val },
    });
  };

  const updateLandingGovernanceCard = (index: number, field: string, val: string) => {
    if (!landingForm) return;
    const nextCards = [...landingForm.governance.cards];
    nextCards[index] = { ...nextCards[index], [field]: val };
    setLandingForm({
      ...landingForm,
      governance: { ...landingForm.governance, cards: nextCards },
    });
  };

  const updateLandingGovernanceCta = (field: string, val: string) => {
    if (!landingForm) return;
    setLandingForm({
      ...landingForm,
      governance: {
        ...landingForm.governance,
        cta: { ...landingForm.governance.cta, [field]: val },
      },
    });
  };

  const updateLandingFooter = (field: string, val: string) => {
    if (!landingForm) return;
    setLandingForm({
      ...landingForm,
      footer: { ...landingForm.footer, [field]: val },
    });
  };

  // Helpers to mutate pricing form
  const updatePricingHeader = (field: string, val: string) => {
    if (!pricingForm) return;
    setPricingForm({
      ...pricingForm,
      header: { ...pricingForm.header, [field]: val },
    });
  };

  const updatePricingMatrixHeader = (field: string, val: string) => {
    if (!pricingForm) return;
    setPricingForm({
      ...pricingForm,
      matrixHeader: { ...pricingForm.matrixHeader, [field]: val },
    });
  };

  const updatePricingFaqsHeader = (field: string, val: string) => {
    if (!pricingForm) return;
    setPricingForm({
      ...pricingForm,
      faqs: { ...pricingForm.faqs, [field]: val },
    });
  };

  const updatePricingFaqItem = (index: number, field: "question" | "answer", val: string) => {
    if (!pricingForm) return;
    const nextItems = [...pricingForm.faqs.items];
    nextItems[index] = { ...nextItems[index], [field]: val };
    setPricingForm({
      ...pricingForm,
      faqs: { ...pricingForm.faqs, items: nextItems },
    });
  };

  const addPricingFaqItem = () => {
    if (!pricingForm) return;
    setPricingForm({
      ...pricingForm,
      faqs: {
        ...pricingForm.faqs,
        items: [
          ...pricingForm.faqs.items,
          {
            question: "New Frequently Asked Question?",
            answer: "Comprehensive answer explaining policy, features, or billing details.",
          },
        ],
      },
    });
  };

  const removePricingFaqItem = (index: number) => {
    if (!pricingForm) return;
    const nextItems = pricingForm.faqs.items.filter((_, i) => i !== index);
    setPricingForm({
      ...pricingForm,
      faqs: { ...pricingForm.faqs, items: nextItems },
    });
  };

  const updatePricingEnterpriseCta = (field: string, val: string) => {
    if (!pricingForm) return;
    setPricingForm({
      ...pricingForm,
      enterpriseCta: { ...pricingForm.enterpriseCta, [field]: val },
    });
  };

  if (!mounted || user?.role !== "ADMIN") {
    return (
      <AppShell>
        <div className="p-12 text-center text-muted font-mono text-xs">
          Authenticating Super Admin authority...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full space-y-6">
        {/* Header Banner */}
        <AdminNav
          title="Website Content Management (Landing & Pricing)"
          description="Centralized authority to customize and manage headlines, copy, value props, FAQs, and footers across the public Landing ('/') and Pricing ('/pricing') pages in real-time."
          category="CMS & Content Control"
          onRefresh={() => {
            refetch();
            showToast("Content refreshed from PostgreSQL database.");
          }}
          isRefreshing={isFetching}
        />

        {/* Tab Switcher & Sticky Action Bar */}
        <div className="bg-panel border border-line p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-30 backdrop-blur-md bg-panel/95">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("landing")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "landing"
                  ? "bg-blue text-white shadow-xs"
                  : "bg-bg text-muted hover:text-ink border border-line"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Landing Home Page (&ldquo;/&rdquo;)</span>
            </button>

            <button
              onClick={() => setActiveTab("pricing")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "pricing"
                  ? "bg-blue text-white shadow-xs"
                  : "bg-bg text-muted hover:text-ink border border-line"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Pricing Page (&ldquo;/pricing&rdquo;)</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={toggleAllCurrentTabSections}
              className="px-3.5 py-2 bg-bg hover:bg-line/40 border border-line text-ink rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={areAllCurrentSectionsCollapsed ? "Expand all sections in this tab" : "Collapse all sections in this tab"}
            >
              {areAllCurrentSectionsCollapsed ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-muted" />
                  <span>Expand All</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-muted" />
                  <span>Collapse All</span>
                </>
              )}
            </button>

            <Link
              href={activeTab === "landing" ? "/" : "/pricing"}
              target="_blank"
              className="px-3.5 py-2 bg-bg hover:bg-line/40 border border-line text-ink rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Preview live public page in new window"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted" />
              <span>Preview {activeTab === "landing" ? "/" : "/pricing"}</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              disabled={isResetting || isLoading}
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Reset this page's content back to standard default template"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-5 py-2 bg-blue hover:bg-blue-dark text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
              <span>{isSaving ? "Saving..." : "Save & Publish"}</span>
            </button>
          </div>
        </div>

        {/* Content Editor Body */}
        {isLoading ? (
          <div className="p-16 text-center text-muted flex flex-col items-center justify-center gap-3 bg-panel border border-line rounded-2xl">
            <div className="w-8 h-8 rounded-full border-2 border-blue border-t-transparent animate-spin" />
            <span className="text-xs font-mono">Loading platform content records...</span>
          </div>
        ) : activeTab === "landing" && landingForm ? (
          /* ==========================================================
             LANDING HOME PAGE EDITOR
             ========================================================== */
          <div className="space-y-6">
            {/* 1. Hero Section & Metrics */}
            <div className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection("hero")}
                className="px-5 py-4 bg-bg/70 border-b border-line flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-dim text-blue flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                      <span>Hero Section & Quick Metrics</span>
                    </h3>
                    <p className="text-[11px] text-muted">
                      Top banner, main headline, introductory value props, CTA buttons, and accuracy indicators.
                    </p>
                  </div>
                </div>
                {isSectionCollapsed("hero") ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </div>

              {!isSectionCollapsed("hero") && (
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Top Status Badge Text</label>
                      <input
                        type="text"
                        value={landingForm.hero.badge}
                        onChange={(e) => updateLandingHero("badge", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">3D Globe Canvas Badge</label>
                      <input
                        type="text"
                        value={landingForm.hero.globeBadge}
                        onChange={(e) => updateLandingHero("globeBadge", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Primary Hero Headline</label>
                    <textarea
                      rows={2}
                      value={landingForm.hero.title}
                      onChange={(e) => updateLandingHero("title", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Hero Subtitle / Description</label>
                    <textarea
                      rows={2}
                      value={landingForm.hero.subtitle}
                      onChange={(e) => updateLandingHero("subtitle", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>

                  {/* CTAs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-bg rounded-xl border border-line">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
                        Primary CTA Button
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. Start ${trialDays}-Day Free Trial (or use {trialDays})`}
                        value={landingForm.hero.primaryCtaText}
                        onChange={(e) => updateLandingHero("primaryCtaText", e.target.value)}
                        className="w-full bg-panel border border-line px-3 py-1.5 text-xs text-ink rounded-lg mb-1"
                      />
                      <p className="text-[10px] text-muted mb-1.5">
                        Active default trial: <span className="font-semibold text-ink">{trialDays} Days</span>. Any day number (e.g. 14-day, 7-day) or &#123;trialDays&#125; auto-mirrors this value.
                      </p>
                      <input
                        type="text"
                        placeholder="Link (e.g. /register)"
                        value={landingForm.hero.primaryCtaHref}
                        onChange={(e) => updateLandingHero("primaryCtaHref", e.target.value)}
                        className="w-full bg-panel border border-line px-3 py-1.5 text-xs text-muted font-mono rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
                        Secondary CTA Button
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Interactive Calculator"
                        value={landingForm.hero.secondaryCtaText}
                        onChange={(e) => updateLandingHero("secondaryCtaText", e.target.value)}
                        className="w-full bg-panel border border-line px-3 py-1.5 text-xs text-ink rounded-lg mb-1.5"
                      />
                      <input
                        type="text"
                        placeholder="Link (e.g. #interactive-demo)"
                        value={landingForm.hero.secondaryCtaHref}
                        onChange={(e) => updateLandingHero("secondaryCtaHref", e.target.value)}
                        className="w-full bg-panel border border-line px-3 py-1.5 text-xs text-muted font-mono rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
                        Tertiary CTA Button
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. View SaaS Plans"
                        value={landingForm.hero.tertiaryCtaText}
                        onChange={(e) => updateLandingHero("tertiaryCtaText", e.target.value)}
                        className="w-full bg-panel border border-line px-3 py-1.5 text-xs text-ink rounded-lg mb-1.5"
                      />
                      <input
                        type="text"
                        placeholder="Link (e.g. /pricing)"
                        value={landingForm.hero.tertiaryCtaHref}
                        onChange={(e) => updateLandingHero("tertiaryCtaHref", e.target.value)}
                        className="w-full bg-panel border border-line px-3 py-1.5 text-xs text-muted font-mono rounded-lg"
                      />
                    </div>
                  </div>

                  {/* 4 Hero Metric Cards */}
                  <div className="space-y-2 pt-2 border-t border-line">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                      Quick Metric Indicators (4 Cards)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {landingForm.hero.metrics.map((m, idx) => (
                        <div key={idx} className="p-3 bg-bg border border-line rounded-xl space-y-1.5">
                          <span className="text-[10px] font-mono font-bold text-muted uppercase">
                            Metric {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={m.label}
                            onChange={(e) => updateLandingHeroMetric(idx, "label", e.target.value)}
                            placeholder="e.g. 99.8% Accuracy"
                            className="w-full bg-panel border border-line px-2.5 py-1 text-xs font-bold text-ink rounded-lg"
                          />
                          <input
                            type="text"
                            value={m.sublabel}
                            onChange={(e) => updateLandingHeroMetric(idx, "sublabel", e.target.value)}
                            placeholder="e.g. GIR 1 to 6 rules"
                            className="w-full bg-panel border border-line px-2.5 py-1 text-[11px] text-muted rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Interactive Tariff Simulator Section */}
            <div className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection("interactiveDemo")}
                className="px-5 py-4 bg-bg/70 border-b border-line flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink">
                      Interactive Tariff Simulator Section
                    </h3>
                    <p className="text-[11px] text-muted">
                      Header, description, and disclaimer above the live interactive tariff calculator.
                    </p>
                  </div>
                </div>
                {isSectionCollapsed("interactiveDemo") ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </div>

              {!isSectionCollapsed("interactiveDemo") && (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Section Category Badge</label>
                      <input
                        type="text"
                        value={landingForm.interactiveDemo.badge}
                        onChange={(e) => updateLandingInteractiveDemo("badge", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Section Heading</label>
                      <input
                        type="text"
                        value={landingForm.interactiveDemo.title}
                        onChange={(e) => updateLandingInteractiveDemo("title", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Description Subtitle</label>
                    <textarea
                      rows={2}
                      value={landingForm.interactiveDemo.subtitle}
                      onChange={(e) => updateLandingInteractiveDemo("subtitle", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Footnote Statutory Disclaimer</label>
                    <input
                      type="text"
                      value={landingForm.interactiveDemo.note}
                      onChange={(e) => updateLandingInteractiveDemo("note", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-muted font-mono rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Six Core Trade Engines */}
            <div className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection("features")}
                className="px-5 py-4 bg-bg/70 border-b border-line flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink">
                      Six Specialized Core Trade Engines
                    </h3>
                    <p className="text-[11px] text-muted">
                      Titles, descriptions, badges, and deep-links for each of the 6 platform engines.
                    </p>
                  </div>
                </div>
                {isSectionCollapsed("features") ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </div>

              {!isSectionCollapsed("features") && (
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Section Category Badge</label>
                      <input
                        type="text"
                        value={landingForm.features.badge}
                        onChange={(e) => updateLandingFeatures("badge", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Section Heading</label>
                      <input
                        type="text"
                        value={landingForm.features.title}
                        onChange={(e) => updateLandingFeatures("title", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Section Description</label>
                    <textarea
                      rows={2}
                      value={landingForm.features.subtitle}
                      onChange={(e) => updateLandingFeatures("subtitle", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>

                  {/* 6 Engine Cards */}
                  <div className="space-y-3 pt-2 border-t border-line">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                      Engine Cards Configuration
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {landingForm.features.engines.map((eng, idx) => (
                        <div key={eng.id || idx} className="p-4 bg-bg border border-line rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-blue">
                              Engine {eng.number} ({eng.id})
                            </span>
                            <span className="text-[10px] font-mono text-muted">Card #{idx + 1}</span>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-ink">Title</label>
                            <input
                              type="text"
                              value={eng.title}
                              onChange={(e) => updateLandingEngineCard(idx, "title", e.target.value)}
                              className="w-full bg-panel border border-line px-2.5 py-1.5 text-xs font-bold text-ink rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-ink">Description</label>
                            <textarea
                              rows={2}
                              value={eng.description}
                              onChange={(e) => updateLandingEngineCard(idx, "description", e.target.value)}
                              className="w-full bg-panel border border-line px-2.5 py-1.5 text-xs text-ink rounded-lg"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-muted">Feature Badge</label>
                              <input
                                type="text"
                                value={eng.badge}
                                onChange={(e) => updateLandingEngineCard(idx, "badge", e.target.value)}
                                className="w-full bg-panel border border-line px-2 py-1 text-xs text-ink rounded-md font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-muted">Page Route</label>
                              <input
                                type="text"
                                value={eng.href}
                                onChange={(e) => updateLandingEngineCard(idx, "href", e.target.value)}
                                className="w-full bg-panel border border-line px-2 py-1 text-xs text-muted rounded-md font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Enterprise Governance, Security & Bottom CTA */}
            <div className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection("governance")}
                className="px-5 py-4 bg-bg/70 border-b border-line flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                    04
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink">
                      Enterprise Governance, Security & Conversion CTA
                    </h3>
                    <p className="text-[11px] text-muted">
                      Auditability pillars, zero-knowledge BYOK encryption details, and bottom landing banner.
                    </p>
                  </div>
                </div>
                {isSectionCollapsed("governance") ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </div>

              {!isSectionCollapsed("governance") && (
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Section Category Badge</label>
                      <input
                        type="text"
                        value={landingForm.governance.badge}
                        onChange={(e) => updateLandingGovernance("badge", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Section Heading</label>
                      <input
                        type="text"
                        value={landingForm.governance.title}
                        onChange={(e) => updateLandingGovernance("title", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Section Description</label>
                    <textarea
                      rows={2}
                      value={landingForm.governance.subtitle}
                      onChange={(e) => updateLandingGovernance("subtitle", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>

                  {/* 4 Governance Cards */}
                  <div className="space-y-2 pt-2 border-t border-line">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                      Governance & Security Pillars (4 Cards)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {landingForm.governance.cards.map((c, idx) => (
                        <div key={idx} className="p-3 bg-bg border border-line rounded-xl space-y-1.5">
                          <span className="text-[10px] font-mono font-bold text-muted uppercase">
                            Pillar {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={c.title}
                            onChange={(e) => updateLandingGovernanceCard(idx, "title", e.target.value)}
                            className="w-full bg-panel border border-line px-2.5 py-1 text-xs font-bold text-ink rounded-lg"
                          />
                          <textarea
                            rows={2}
                            value={c.description}
                            onChange={(e) => updateLandingGovernanceCard(idx, "description", e.target.value)}
                            className="w-full bg-panel border border-line px-2.5 py-1 text-xs text-muted rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Conversion CTA Strip */}
                  <div className="p-4 bg-bg border border-line rounded-xl space-y-3 pt-3">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                      Bottom Conversion CTA Strip
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink">Banner Heading</label>
                        <input
                          type="text"
                          value={landingForm.governance.cta.title}
                          onChange={(e) => updateLandingGovernanceCta("title", e.target.value)}
                          className="w-full bg-panel border border-line px-2.5 py-1.5 text-xs text-ink font-semibold rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink">Banner Subtitle</label>
                        <input
                          type="text"
                          value={landingForm.governance.cta.subtitle}
                          onChange={(e) => updateLandingGovernanceCta("subtitle", e.target.value)}
                          className="w-full bg-panel border border-line px-2.5 py-1.5 text-xs text-muted rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Primary Button Text"
                        value={landingForm.governance.cta.primaryBtnText}
                        onChange={(e) => updateLandingGovernanceCta("primaryBtnText", e.target.value)}
                        className="bg-panel border border-line px-2 py-1 text-xs text-ink rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Primary Button Link"
                        value={landingForm.governance.cta.primaryBtnHref}
                        onChange={(e) => updateLandingGovernanceCta("primaryBtnHref", e.target.value)}
                        className="bg-panel border border-line px-2 py-1 text-xs text-muted font-mono rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Secondary Button Text"
                        value={landingForm.governance.cta.secondaryBtnText}
                        onChange={(e) => updateLandingGovernanceCta("secondaryBtnText", e.target.value)}
                        className="bg-panel border border-line px-2 py-1 text-xs text-ink rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Secondary Button Link"
                        value={landingForm.governance.cta.secondaryBtnHref}
                        onChange={(e) => updateLandingGovernanceCta("secondaryBtnHref", e.target.value)}
                        className="bg-panel border border-line px-2 py-1 text-xs text-muted font-mono rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Footer Content & Disclaimers */}
            <div className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection("footer")}
                className="px-5 py-4 bg-bg/70 border-b border-line flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold text-xs">
                    05
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink">
                      Footer Content & Regulatory Disclaimers
                    </h3>
                    <p className="text-[11px] text-muted">
                      Brand description, live tariff schedule status indicator, statutory disclaimer, and copyright notice.
                    </p>
                  </div>
                </div>
                {isSectionCollapsed("footer") ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </div>

              {!isSectionCollapsed("footer") && (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Brand Summary Paragraph</label>
                      <textarea
                        rows={3}
                        value={landingForm.footer.brandDescription}
                        onChange={(e) => updateLandingFooter("brandDescription", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Statutory Tariff Schedule Status</label>
                      <input
                        type="text"
                        value={landingForm.footer.scheduleStatus}
                        onChange={(e) => updateLandingFooter("scheduleStatus", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-mono"
                      />
                      <label className="text-xs font-bold text-ink block pt-2">Copyright Line</label>
                      <input
                        type="text"
                        value={landingForm.footer.copyright}
                        onChange={(e) => updateLandingFooter("copyright", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Statutory Legal Regulatory Disclaimer</label>
                    <textarea
                      rows={3}
                      value={landingForm.footer.disclaimer}
                      onChange={(e) => updateLandingFooter("disclaimer", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-muted rounded-lg focus:outline-none focus:border-blue transition-colors leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "pricing" && pricingForm ? (
          /* ==========================================================
             PRICING PAGE EDITOR
             ========================================================== */
          <div className="space-y-6">
            {/* Note banner explaining scope */}
            <div className="p-4 rounded-xl bg-blue-dim/40 border border-blue/20 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue mt-0.5 shrink-0" />
              <div className="text-xs text-ink leading-relaxed">
                <span className="font-bold text-blue">Dynamic Content Separation: </span>
                <span>
                  The pricing tier cards (Starter, Pro, Enterprise) and the feature matrix grid rows are dynamically managed via{" "}
                </span>
                <Link href="/admin/pricing" className="text-blue underline font-semibold">
                  Dynamic Pricing Plans
                </Link>
                <span> and </span>
                <Link href="/admin/feature-matrix" className="text-blue underline font-semibold">
                  Feature Matrix
                </Link>
                <span>
                  . Below you can customize the headings, value proposition text, FAQs, and enterprise sales banner of the /pricing page.
                </span>
              </div>
            </div>

            {/* 1. Main Pricing Header (Above Plan Cards) */}
            <div className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection("pricingHeader")}
                className="px-5 py-4 bg-bg/70 border-b border-line flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-dim text-blue flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink">
                      Main Pricing Header (Above Plan Cards)
                    </h3>
                    <p className="text-[11px] text-muted">
                      Main headline, category pill badge, and pricing introductory statement.
                    </p>
                  </div>
                </div>
                {isSectionCollapsed("pricingHeader") ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </div>

              {!isSectionCollapsed("pricingHeader") && (
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Category Pill Badge Text</label>
                    <input
                      type="text"
                      value={pricingForm.header.badge}
                      onChange={(e) => updatePricingHeader("badge", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Main Page Heading</label>
                    <input
                      type="text"
                      value={pricingForm.header.title}
                      onChange={(e) => updatePricingHeader("title", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Introductory Paragraph Subtitle</label>
                    <textarea
                      rows={2}
                      value={pricingForm.header.subtitle}
                      onChange={(e) => updatePricingHeader("subtitle", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Comprehensive Feature Matrix Header (Above Comparison Table) */}
            <div className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection("pricingMatrixHeader")}
                className="px-5 py-4 bg-bg/70 border-b border-line flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink">
                      Comprehensive Feature Matrix Section Header
                    </h3>
                    <p className="text-[11px] text-muted">
                      Heading and paragraph description directly above the interactive comparison matrix table.
                    </p>
                  </div>
                </div>
                {isSectionCollapsed("pricingMatrixHeader") ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </div>

              {!isSectionCollapsed("pricingMatrixHeader") && (
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Matrix Section Heading</label>
                    <input
                      type="text"
                      value={pricingForm.matrixHeader.title}
                      onChange={(e) => updatePricingMatrixHeader("title", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Matrix Description Subtitle</label>
                    <textarea
                      rows={2}
                      value={pricingForm.matrixHeader.subtitle}
                      onChange={(e) => updatePricingMatrixHeader("subtitle", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Frequently Asked Questions (Buyer FAQs) */}
            <div className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection("pricingFaqs")}
                className="px-5 py-4 bg-bg/70 border-b border-line flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink">
                      Frequently Asked Questions (Buyer FAQs)
                    </h3>
                    <p className="text-[11px] text-muted">
                      Add, edit, or remove FAQ questions and answers displayed at the bottom of the pricing page.
                    </p>
                  </div>
                </div>
                {isSectionCollapsed("pricingFaqs") ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </div>

              {!isSectionCollapsed("pricingFaqs") && (
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">FAQ Category Badge</label>
                      <input
                        type="text"
                        value={pricingForm.faqs.badge}
                        onChange={(e) => updatePricingFaqsHeader("badge", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">FAQ Section Title</label>
                      <input
                        type="text"
                        value={pricingForm.faqs.title}
                        onChange={(e) => updatePricingFaqsHeader("title", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">FAQ Subtitle</label>
                    <input
                      type="text"
                      value={pricingForm.faqs.subtitle}
                      onChange={(e) => updatePricingFaqsHeader("subtitle", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>

                  {/* FAQ Items List */}
                  <div className="space-y-3 pt-3 border-t border-line">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
                        FAQ Items ({pricingForm.faqs.items.length})
                      </span>
                      <button
                        type="button"
                        onClick={addPricingFaqItem}
                        className="px-3 py-1 bg-blue-dim text-blue hover:bg-blue/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add FAQ Question</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {pricingForm.faqs.items.map((faq, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-bg border border-line rounded-xl space-y-2 relative group hover:border-blue/40 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-mono font-bold text-muted">
                              Question #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePricingFaqItem(idx)}
                              className="p-1 hover:bg-red-dim text-muted hover:text-red rounded transition-colors"
                              title="Delete this FAQ question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => updatePricingFaqItem(idx, "question", e.target.value)}
                              placeholder="Enter FAQ Question..."
                              className="w-full bg-panel border border-line px-3 py-1.5 text-xs font-bold text-ink rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <textarea
                              rows={3}
                              value={faq.answer}
                              onChange={(e) => updatePricingFaqItem(idx, "answer", e.target.value)}
                              placeholder="Enter detailed answer..."
                              className="w-full bg-panel border border-line px-3 py-2 text-xs text-ink rounded-lg leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Enterprise Advisory Contact Card / Custom SLAs Banner */}
            <div className="bg-panel border border-line rounded-2xl shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection("pricingEnterprise")}
                className="px-5 py-4 bg-bg/70 border-b border-line flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-navy text-white flex items-center justify-center font-bold text-xs">
                    04
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink">
                      Enterprise Advisory Contact & Custom SLAs Banner
                    </h3>
                    <p className="text-[11px] text-muted">
                      Dark contrast card displayed at the bottom of /pricing for high-volume custom deals.
                    </p>
                  </div>
                </div>
                {isSectionCollapsed("pricingEnterprise") ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </div>

              {!isSectionCollapsed("pricingEnterprise") && (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Tag Badge</label>
                      <input
                        type="text"
                        value={pricingForm.enterpriseCta.badge}
                        onChange={(e) => updatePricingEnterpriseCta("badge", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Button Label</label>
                      <input
                        type="text"
                        value={pricingForm.enterpriseCta.btnText}
                        onChange={(e) => updatePricingEnterpriseCta("btnText", e.target.value)}
                        className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Card Headline</label>
                    <input
                      type="text"
                      value={pricingForm.enterpriseCta.title}
                      onChange={(e) => updatePricingEnterpriseCta("title", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Card Paragraph Description</label>
                    <textarea
                      rows={2}
                      value={pricingForm.enterpriseCta.subtitle}
                      onChange={(e) => updatePricingEnterpriseCta("subtitle", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-ink rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Button Link Target</label>
                    <input
                      type="text"
                      value={pricingForm.enterpriseCta.btnHref}
                      onChange={(e) => updatePricingEnterpriseCta("btnHref", e.target.value)}
                      className="w-full bg-bg border border-line px-3 py-2 text-xs text-muted font-mono rounded-lg focus:outline-none focus:border-blue transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-panel border border-line rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-ink">
                Reset {activeTab === "landing" ? "Landing Page" : "Pricing Page"} Content?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                This will revert all copy, headlines, features, and disclaimers on the{" "}
                <span className="font-semibold text-ink">{activeTab === "landing" ? "/" : "/pricing"}</span>{" "}
                page back to the standard platform factory default template.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-line bg-bg hover:bg-line/40 text-xs font-semibold text-ink transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetConfirm}
                disabled={isResetting}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isResetting ? "Resetting..." : "Yes, Reset to Defaults"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      <ToastNotification
        isOpen={!!toastMessage}
        message={toastMessage || ""}
        variant={toastVariant}
        onClose={() => setToastMessage(null)}
      />
    </AppShell>
  );
}


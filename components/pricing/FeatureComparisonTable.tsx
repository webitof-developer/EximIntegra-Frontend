"use client";

import React, { useMemo } from "react";
import { Check, Minus } from "lucide-react";
import { TableContainer, Table } from "@/components/ui/Table";
import { useGetPublicFeatureMatrixQuery } from "@/store/adminApi";
import { FeatureMatrixItem, PricingPlan } from "@/lib/types";

// Static fallback data if database is initialising or offline
const fallbackPlans: Partial<PricingPlan>[] = [
  {
    id: "free-trial",
    name: "Free Trial",
    tierBadge: "FREE_TRIAL",
    planType: "trial",
    isDefaultTrial: true,
    trialDays: 14,
    priceMonthlyInr: 0,
    isPopular: false,
  },
  {
    id: "starter",
    name: "Starter",
    tierBadge: "STARTER",
    priceMonthlyInr: 7999,
    isPopular: false,
  },
  {
    id: "professional",
    name: "Professional",
    tierBadge: "PROFESSIONAL",
    priceMonthlyInr: 24999,
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tierBadge: "ENTERPRISE",
    priceMonthlyInr: 74999,
    isPopular: false,
  },
];

const fallbackTrialValues: Record<string, boolean | string> = {
  feat_gir_rules: true,
  feat_single_lookup: "50 / trial",
  feat_bulk_csv_manifest: false,
  feat_confidence_scoring: true,
  feat_statutory_duties: true,
  feat_cbic_fx_sync: true,
  feat_add_indicators: true,
  feat_fta_preferential: false,
  feat_arbitrage_matrix: false,
  feat_port_scale_rates: "Standard",
  feat_cfs_demurrage: false,
  feat_smelter_yield_economics: false,
  feat_effective_molten_mt: false,
  feat_akshara_copilot: false,
  feat_tool_call_audit_logs: false,
  feat_byok_custom_llm: false,
  feat_custom_freight_overrides: false,
  feat_api_webhooks: false,
  feat_workspace_seats: "1 Seat",
  feat_rbac_governance: false,
  feat_reproducibility_stamp: true,
  feat_support_sla: "Standard Support",
};

const fallbackItems: FeatureMatrixItem[] = [
  // 1. Commodity Classification Engine
  {
    id: "feat_gir_rules",
    category: "1. Commodity Classification Engine",
    name: "Sequential GIR 1 to 6 Legal Interpretation",
    description: "Deterministic legal rule rationale per classification candidate",
    sortOrder: 1,
    isVisible: true,
    planValues: { "free-trial": true, starter: true, professional: true, enterprise: true },
  },
  {
    id: "feat_single_lookup",
    category: "1. Commodity Classification Engine",
    name: "Single Material Lookup",
    description: "Live commodity queries per billing cycle",
    sortOrder: 2,
    isVisible: true,
    planValues: { "free-trial": "50 / trial", starter: "100 / mo", professional: "Unlimited", enterprise: "Unlimited" },
  },
  {
    id: "feat_bulk_csv_manifest",
    category: "1. Commodity Classification Engine",
    name: "Bulk CSV Batch Manifest Processor",
    description: "Multi-line commercial invoice and packing list batch classification",
    sortOrder: 3,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: "Up to 500 items/file", enterprise: "Unlimited Batch" },
  },
  {
    id: "feat_confidence_scoring",
    category: "1. Commodity Classification Engine",
    name: "Candidate Confidence Scoring & Alternate HS codes",
    description: "Confidence percentage and alternate chapter suggestions",
    sortOrder: 4,
    isVisible: true,
    planValues: { "free-trial": true, starter: true, professional: true, enterprise: true },
  },
  // 2. Customs Duties & Valuation
  {
    id: "feat_statutory_duties",
    category: "2. Customs Duties & Valuation",
    name: "Statutory BCD, SWS (10%), IGST (18%) & AIDC",
    description: "Comprehensive Indian customs tariff duty computation",
    sortOrder: 5,
    isVisible: true,
    planValues: { "free-trial": true, starter: true, professional: true, enterprise: true },
  },
  {
    id: "feat_cbic_fx_sync",
    category: "2. Customs Duties & Valuation",
    name: "CBIC Official Gazette Daily FX Synchronization",
    description: "Live gazetted notified customs exchange rates",
    sortOrder: 6,
    isVisible: true,
    planValues: { "free-trial": true, starter: true, professional: true, enterprise: true },
  },
  {
    id: "feat_add_indicators",
    category: "2. Customs Duties & Valuation",
    name: "Anti-Dumping Duty (ADD) Benchmark Indicators",
    description: "DGTR Anti-dumping and countervailing duty alerts",
    sortOrder: 7,
    isVisible: true,
    planValues: { "free-trial": true, starter: true, professional: true, enterprise: true },
  },
  {
    id: "feat_fta_preferential",
    category: "2. Customs Duties & Valuation",
    name: "Preferential FTA Rates (CEPA, ECTA, ASEAN)",
    description: "Bilateral trade agreement tariff concessions",
    sortOrder: 8,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: true, enterprise: true },
  },
  {
    id: "feat_arbitrage_matrix",
    category: "2. Customs Duties & Valuation",
    name: "Country-of-Origin Sourcing Arbitrage Matrix",
    description: "Compare net landed costs across multiple origin ports",
    sortOrder: 9,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: true, enterprise: true },
  },
  // 3. Multimodal Logistics & Smelter Yield
  {
    id: "feat_port_scale_rates",
    category: "3. Multimodal Logistics & Smelter Yield",
    name: "Port Scale of Rates (JNPT, Mundra, Chennai)",
    description: "Major port tariff schedules and stevedoring costs",
    sortOrder: 10,
    isVisible: true,
    planValues: { "free-trial": "Standard", starter: "Standard", professional: "Full TAMP Schedule", enterprise: "Full TAMP + Custom SOR" },
  },
  {
    id: "feat_cfs_demurrage",
    category: "3. Multimodal Logistics & Smelter Yield",
    name: "Container CFS & Demurrage Modeling",
    description: "Free days calculation, detention and ground rent modeling",
    sortOrder: 11,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: true, enterprise: true },
  },
  {
    id: "feat_smelter_yield_economics",
    category: "3. Multimodal Logistics & Smelter Yield",
    name: "Furnace Metal Recovery Yield Economics",
    description: "Dross, burning loss, and scrap metallic recovery calculation",
    sortOrder: 12,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: true, enterprise: true },
  },
  {
    id: "feat_effective_molten_mt",
    category: "3. Multimodal Logistics & Smelter Yield",
    name: "Effective Cost per Molten MT Calculation",
    description: "Net yield-adjusted raw material cost for foundries and smelters",
    sortOrder: 13,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: true, enterprise: true },
  },
  // 4. AI Copilot & Developer Integrations
  {
    id: "feat_akshara_copilot",
    category: "4. AI Copilot & Developer Integrations",
    name: "Akshara AI — Conversational Copilot",
    description: "B2B customs advisory intelligence copilot",
    sortOrder: 14,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: false, enterprise: "Unlimited Access" },
  },
  {
    id: "feat_tool_call_audit_logs",
    category: "4. AI Copilot & Developer Integrations",
    name: "Transparent Tool-Call Execution Audit Logs",
    description: "Full auditability of deterministic calculation steps",
    sortOrder: 15,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: false, enterprise: true },
  },
  {
    id: "feat_byok_custom_llm",
    category: "4. AI Copilot & Developer Integrations",
    name: "BYOK Custom LLM Keys (Claude, OpenAI, Gemini)",
    description: "Bring-your-own-key encryption for private enterprise models",
    sortOrder: 16,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: false, enterprise: true },
  },
  {
    id: "feat_custom_freight_overrides",
    category: "4. AI Copilot & Developer Integrations",
    name: "Custom Carrier Freight & Yield Contract Overrides",
    description: "Dedicated line item contracts and carrier override matrix",
    sortOrder: 17,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: false, enterprise: true },
  },
  {
    id: "feat_api_webhooks",
    category: "4. AI Copilot & Developer Integrations",
    name: "Developer Platform API Keys & Webhooks (SAP/ERP)",
    description: "REST APIs and webhooks for automated ERP ingestion",
    sortOrder: 18,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: false, enterprise: true },
  },
  // 5. Workspaces, Governance & Security
  {
    id: "feat_workspace_seats",
    category: "5. Workspaces, Governance & Security",
    name: "Included Team Workspace Seats",
    description: "Collaborative organizational user seats",
    sortOrder: 19,
    isVisible: true,
    planValues: { "free-trial": "1 Seat", starter: "1 Seat", professional: "5 Seats", enterprise: "Unlimited Seats" },
  },
  {
    id: "feat_rbac_governance",
    category: "5. Workspaces, Governance & Security",
    name: "Role-Based Access Control (RBAC)",
    description: "Importer, Exporter, Customs Broker & Trade Advisor permissions",
    sortOrder: 20,
    isVisible: true,
    planValues: { "free-trial": false, starter: false, professional: false, enterprise: true },
  },
  {
    id: "feat_reproducibility_stamp",
    category: "5. Workspaces, Governance & Security",
    name: "100% Deterministic Reproducibility Stamp",
    description: "Cryptographic reproducibility audit hash on all calculations",
    sortOrder: 21,
    isVisible: true,
    planValues: { "free-trial": true, starter: true, professional: true, enterprise: true },
  },
  {
    id: "feat_support_sla",
    category: "5. Workspaces, Governance & Security",
    name: "Customer Support & SLA",
    description: "Support response time and dedicated channel access",
    sortOrder: 22,
    isVisible: true,
    planValues: { "free-trial": "Standard Support", starter: "Email Support", professional: "Priority Chat & Email", enterprise: "Dedicated Manager & 99.9% SLA" },
  },
];

export function FeatureComparisonTable() {
  const { data: matrixData } = useGetPublicFeatureMatrixQuery();

  // Resolve dynamic plans: strictly keep only the single DEFAULT Free Trial plan, followed by subscription plans
  const plans = useMemo(() => {
    const rawPlans = (
      matrixData?.plans && matrixData.plans.length > 0 ? matrixData.plans : fallbackPlans
    ) as PricingPlan[];

    const trialPlans = rawPlans.filter(
      (p) => p.planType === "trial" || (p.tierBadge || "").toUpperCase() === "FREE_TRIAL"
    );
    const subPlans = rawPlans.filter(
      (p) => p.planType !== "trial" && (p.tierBadge || "").toUpperCase() !== "FREE_TRIAL"
    );

    // Pick ONLY the single default trial plan
    const defaultTrial =
      trialPlans.find((p) => p.isDefaultTrial) || trialPlans[0];

    const result: PricingPlan[] = [];
    if (defaultTrial) {
      result.push(defaultTrial);
    }
    result.push(...subPlans);
    return result;
  }, [matrixData]);

  // Resolve visible items
  const items = useMemo(() => {
    const rawItems =
      matrixData?.items && matrixData.items.length > 0 ? matrixData.items : fallbackItems;
    return rawItems.filter((it) => it.isVisible !== false);
  }, [matrixData]);

  // Group items by category preserving sequential category numbering and order
  const groupedCategories = useMemo(() => {
    // 1. Collect all distinct categories
    const rawCategories: string[] = [];
    items.forEach((item) => {
      const c = (item.category || "General Features").trim();
      if (!rawCategories.includes(c)) rawCategories.push(c);
    });

    // 2. Find max category number from existing numbered categories
    let maxNum = 0;
    rawCategories.forEach((c) => {
      const m = c.match(/^(\d+)\./);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    });

    // 3. Normalize category names (ensure sequential number prefix)
    const normMap = new Map<string, string>();
    let nextNum = maxNum;
    rawCategories.forEach((c) => {
      if (/^\d+\.\s*/.test(c)) {
        normMap.set(c, c);
      } else {
        nextNum += 1;
        normMap.set(c, `${nextNum}. ${c}`);
      }
    });

    // 4. Group items by normalized category name
    const categoryMap = new Map<string, FeatureMatrixItem[]>();
    items.forEach((item) => {
      const rawCat = (item.category || "General Features").trim();
      const normCat = normMap.get(rawCat) || rawCat;
      if (!categoryMap.has(normCat)) {
        categoryMap.set(normCat, []);
      }
      categoryMap.get(normCat)!.push(item);
    });

    return Array.from(categoryMap.entries())
      .map(([title, rows]) => ({
        title,
        rows: rows.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      }))
      .sort((a, b) => {
        const numA = parseInt(a.title.match(/^(\d+)\./)?.[1] || "9999", 10);
        const numB = parseInt(b.title.match(/^(\d+)\./)?.[1] || "9999", 10);
        if (numA !== numB) return numA - numB;
        return a.title.localeCompare(b.title);
      });
  }, [items]);

  // Helper to extract feature value for a specific plan with intelligent auto-fetch & resolution
  const getPlanValue = (row: FeatureMatrixItem, plan: PricingPlan | Partial<PricingPlan>) => {
    const vals = row.planValues || {};
    const rawId = plan.id || "";
    const planId = rawId.toLowerCase();
    const tierBadge = (plan.tierBadge || "").toUpperCase();
    const isTrial =
      plan.planType === "trial" ||
      tierBadge === "FREE_TRIAL" ||
      tierBadge === "TRIAL" ||
      planId === "free-trial" ||
      planId === "trial";

    // 1. Direct match on plan.id or lowercase
    if (rawId && vals[rawId] !== undefined && vals[rawId] !== null && vals[rawId] !== "") return vals[rawId];
    if (planId && vals[planId] !== undefined && vals[planId] !== null && vals[planId] !== "") return vals[planId];
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
      if (fallbackTrialValues[row.id] !== undefined) return fallbackTrialValues[row.id];
    }
    if (baseArchetype === "professional" && vals["pro"] !== undefined) return vals["pro"];

    return false;
  };

  const renderValue = (val: boolean | string | undefined) => {
    if (typeof val === "boolean") {
      return val ? (
        <Check className="w-4 h-4 text-blue mx-auto stroke-[2.5]" />
      ) : (
        <Minus className="w-4 h-4 text-muted/40 mx-auto" />
      );
    }
    return <span className="font-semibold text-xs text-ink">{val}</span>;
  };

  return (
    <div className="space-y-6 pt-10">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-ink tracking-tight">
          Comprehensive Feature Matrix
        </h3>
        <p className="text-xs text-muted">
          Compare engine capabilities and developer limits across all three tiers.
        </p>
      </div>

      <TableContainer>
        <Table>
          <thead>
            <tr className="border-b border-line bg-bg/60">
              <th className="py-4 px-5 text-sm font-bold text-ink w-2/5">
                Features & Capabilities
              </th>
              {plans.map((plan) => {
                const isPop = !!plan.isPopular;
                const isTrial =
                  plan.planType === "trial" ||
                  (plan.tierBadge || "").toUpperCase() === "FREE_TRIAL" ||
                  plan.id === "free-trial";

                const formattedPrice = isTrial
                  ? `₹0/mo`
                  : plan.priceMonthlyInr !== undefined
                  ? `₹${Number(plan.priceMonthlyInr).toLocaleString()}/mo`
                  : plan.priceMonthlyUsd !== undefined
                  ? `$${Number(plan.priceMonthlyUsd).toLocaleString()}/mo`
                  : "Custom";

                return (
                  <th
                    key={plan.id}
                    className={`py-4 px-4 text-center ${
                      isPop
                        ? "bg-blue-dim/40 border-x border-blue/20"
                        : ""
                    }`}
                    style={{ width: `${60 / Math.max(plans.length, 1)}%` }}
                  >
                    <span
                      className={`font-bold block text-sm ${
                        isPop ? "text-blue" : "text-ink"
                      }`}
                    >
                      {plan.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        isPop ? "text-blue font-semibold" : "text-muted"
                      }`}
                    >
                      {formattedPrice}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {groupedCategories.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                {/* Category Header */}
                <tr className="bg-bg/80 font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
                  <td
                    colSpan={plans.length + 1}
                    className="py-2.5 px-5 text-blue"
                  >
                    {cat.title}
                  </td>
                </tr>

                {/* Rows */}
                {cat.rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-bg/40 transition-colors"
                  >
                    <td className="py-3 px-5 font-medium text-ink">
                      {row.name}
                    </td>

                    {plans.map((plan) => {
                      const isPop = !!plan.isPopular;
                      const val = getPlanValue(row, plan);
                      return (
                        <td
                          key={plan.id}
                          className={`py-3 px-4 text-center ${
                            isPop
                              ? "bg-blue-dim/20 border-x border-blue/10"
                              : ""
                          }`}
                        >
                          {renderValue(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Tabs } from "@/components/ui/Tabs";
import { StatusPill, ProvenanceBadge } from "@/components/ui";
import { LlmProvidersSection } from "@/components/settings/LlmProvidersSection";
import { CustomGatewaysSection } from "@/components/settings/CustomGatewaysSection";
import { ContractRatesSection } from "@/components/settings/ContractRatesSection";
import { PlatformKeysSection } from "@/components/settings/PlatformKeysSection";
import { SubscriptionBillingSection } from "@/components/settings/SubscriptionBillingSection";
import { TeamWorkspaceSection } from "@/components/settings/TeamWorkspaceSection";
import { FeatureGate } from "@/components/saas/FeatureGate";
import {
  Sparkles,
  Globe,
  Ship,
  Key,
  CreditCard,
  Users,
  Sliders,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab")?.toLowerCase();

  const getInitialTab = () => {
    if (
      tabParam === "billing" ||
      tabParam === "subscription" ||
      tabParam === "plan" ||
      tabParam === "plans"
    ) {
      return "billing";
    }
    const validTabs = ["llm", "gateways", "contracts", "platform", "billing", "team"];
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return "llm";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  useEffect(() => {
    const currentTab = searchParams.get("tab")?.toLowerCase();
    if (
      currentTab === "billing" ||
      currentTab === "subscription" ||
      currentTab === "plan" ||
      currentTab === "plans"
    ) {
      setActiveTab("billing");
    } else if (
      currentTab &&
      ["llm", "gateways", "contracts", "platform", "billing", "team"].includes(currentTab)
    ) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const tabsConfig = [
    {
      id: "llm",
      label: "AI / LLM Providers",
      icon: <Sparkles className="w-3.5 h-3.5 text-blue" />,
      badge: "5",
    },
    {
      id: "gateways",
      label: "Trade Gateways",
      icon: <Globe className="w-3.5 h-3.5 text-green" />,
      badge: "4",
    },
    {
      id: "contracts",
      label: "Contract Rates & Yield",
      icon: <Ship className="w-3.5 h-3.5 text-amber" />,
      badge: "ENT",
    },
    {
      id: "platform",
      label: "API Keys & Webhooks",
      icon: <Key className="w-3.5 h-3.5 text-ink" />,
      badge: "ENT",
    },
    {
      id: "billing",
      label: "Subscription & Billing",
      icon: <CreditCard className="w-3.5 h-3.5 text-blue" />,
      badge: "ACTIVE",
    },
    {
      id: "team",
      label: "Team & Organization",
      icon: <Users className="w-3.5 h-3.5 text-green" />,
      badge: "4 Seats",
    },
  ];

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 bg-panel border border-line rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-muted block">
            Active AI Engine
          </span>
          <div className="text-sm font-bold text-ink mt-0.5 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue" />
            <span>Claude 3.5 Sonnet</span>
          </div>
          <span className="text-[10px] text-green font-mono block mt-0.5">
            Latency: ~42ms
          </span>
        </div>

        <div className="p-3.5 bg-panel border border-line rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-muted block">
            Customs Gateways
          </span>
          <div className="text-sm font-bold text-ink mt-0.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-green" />
            <span>3 Connected</span>
          </div>
          <span className="text-[10px] text-muted font-mono block mt-0.5">
            ICEGATE &bull; DGFT &bull; RBI
          </span>
        </div>

        <div className="p-3.5 bg-panel border border-line rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-muted block">
            Contract Overrides
          </span>
          <div className="text-sm font-bold text-ink mt-0.5 flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-amber" />
            <span>6 BYOK Rates</span>
          </div>
          <span className="text-[10px] text-muted font-mono block mt-0.5">
            Ocean Freight & Yield
          </span>
        </div>

        <div className="p-3.5 bg-panel border border-line rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-muted block">
            Enterprise Integration
          </span>
          <div className="text-sm font-bold text-ink mt-0.5 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-blue" />
            <span>2 Active Keys</span>
          </div>
          <span className="text-[10px] text-green font-mono block mt-0.5">
            Webhooks Synced
          </span>
        </div>
      </div>

      {/* Tab Navigation Switcher */}
      <div className="w-full overflow-x-auto pb-1 scrollbar-none">
        <Tabs
          tabs={tabsConfig}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          className="w-full justify-between"
        />
      </div>

      {/* Active Tab Content Panel */}
      {activeTab === "llm" && <LlmProvidersSection />}
      {activeTab === "gateways" && <CustomGatewaysSection />}
      {activeTab === "contracts" && (
        <FeatureGate
          requiredTier="ENTERPRISE"
          featureName="Contract Rates & Smelter Yield BYOK"
          description="Configure custom ocean carrier freight matrix, contracted destination terminal handling, and proprietary metallurgical recovery yields."
        >
          <ContractRatesSection />
        </FeatureGate>
      )}
      {activeTab === "platform" && (
        <FeatureGate
          requiredTier="ENTERPRISE"
          featureName="Platform API Keys & Enterprise Webhooks"
          description="Provision production API secret keys for ERP integration (SAP, Oracle) and register real-time CBIC tariff webhooks."
        >
          <PlatformKeysSection />
        </FeatureGate>
      )}
      {activeTab === "billing" && <SubscriptionBillingSection />}
      {activeTab === "team" && <TeamWorkspaceSection />}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12 text-muted text-sm">
              Loading settings...
            </div>
          }
        >
          <SettingsContent />
        </Suspense>
      </AppShell>
    </AuthGuard>
  );
}

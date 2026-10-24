"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppSelector } from "@/store";
import { Tabs } from "@/components/ui/Tabs";
import { StatusPill, ProvenanceBadge } from "@/components/ui";
import { CustomGatewaysSection } from "@/components/settings/CustomGatewaysSection";
import { ContractRatesSection } from "@/components/settings/ContractRatesSection";
import { PlatformKeysSection } from "@/components/settings/PlatformKeysSection";
import { SubscriptionBillingSection } from "@/components/settings/SubscriptionBillingSection";
import { TeamWorkspaceSection } from "@/components/settings/TeamWorkspaceSection";
import { DynamicTierGate } from "@/components/saas/DynamicTierGate";
import {
  Globe,
  Ship,
  Key,
  CreditCard,
  Users,
} from "lucide-react";

// Toggle flags to easily re-enable tabs when official integrations are ready
const SHOW_TRADE_GATEWAYS = process.env.NEXT_PUBLIC_ENABLE_TRADE_GATEWAYS === "true";
const SHOW_API_KEYS = process.env.NEXT_PUBLIC_ENABLE_API_KEYS === "true";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
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
    const validTabs = [
      ...(SHOW_TRADE_GATEWAYS ? ["gateways"] : []),
      "contracts",
      ...(SHOW_API_KEYS ? ["platform"] : []),
      "billing",
      "team",
    ];
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return SHOW_TRADE_GATEWAYS ? "gateways" : "contracts";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  useEffect(() => {
    const currentTab = searchParams.get("tab")?.toLowerCase();
    const validTabs = [
      ...(SHOW_TRADE_GATEWAYS ? ["gateways"] : []),
      "contracts",
      ...(SHOW_API_KEYS ? ["platform"] : []),
      "billing",
      "team",
    ];

    if (
      currentTab === "billing" ||
      currentTab === "subscription" ||
      currentTab === "plan" ||
      currentTab === "plans"
    ) {
      setActiveTab("billing");
    } else if (currentTab === "llm" || currentTab === "ai") {
      // AI/LLM configuration has moved to the Super Admin Cockpit
      if (user?.role === "ADMIN") {
        router.push("/admin/llm");
      } else {
        setActiveTab(SHOW_TRADE_GATEWAYS ? "gateways" : "contracts");
      }
    } else if (currentTab && validTabs.includes(currentTab)) {
      setActiveTab(currentTab);
    }
  }, [searchParams, user, router]);

  const allTabsConfig = [
    ...(SHOW_TRADE_GATEWAYS
      ? [
          {
            id: "gateways",
            label: "Trade Gateways",
            icon: <Globe className="w-3.5 h-3.5 text-green" />,
            badge: "4",
          },
        ]
      : []),
    {
      id: "contracts",
      label: "Contract Rates & Yield",
      icon: <Ship className="w-3.5 h-3.5 text-amber" />,
      badge: "ENT",
    },
    ...(SHOW_API_KEYS
      ? [
          {
            id: "platform",
            label: "API Keys & Webhooks",
            icon: <Key className="w-3.5 h-3.5 text-ink" />,
            badge: "ENT",
          },
        ]
      : []),
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SHOW_TRADE_GATEWAYS ? (
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
        ) : (
          <div className="p-3.5 bg-panel border border-line rounded-xl shadow-xs">
            <span className="text-[10px] font-mono uppercase text-muted block">
              Workspace & Organization
            </span>
            <div className="text-sm font-bold text-ink mt-0.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-green" />
              <span className="truncate">{user?.company || "Organization Workspace"}</span>
            </div>
            <span className="text-[10px] text-muted font-mono block mt-0.5">
              Tier: {user?.tier || "STARTER"} &bull; Multi-User RBAC
            </span>
          </div>
        )}

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

        {SHOW_API_KEYS ? (
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
        ) : (
          <div className="p-3.5 bg-panel border border-line rounded-xl shadow-xs">
            <span className="text-[10px] font-mono uppercase text-muted block">
              Plan & Billing
            </span>
            <div className="text-sm font-bold text-ink mt-0.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue" />
              <span>{user?.tier || "STARTER"} Tier</span>
            </div>
            <span className="text-[10px] text-green font-mono block mt-0.5">
              Subscription Active
            </span>
          </div>
        )}
      </div>

      {/* Tab Navigation Switcher */}
      <div className="w-full overflow-x-auto pb-1 scrollbar-none">
        <Tabs
          tabs={allTabsConfig}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          className="w-full justify-between"
        />
      </div>

      {/* Active Tab Content Panel */}
      {SHOW_TRADE_GATEWAYS && activeTab === "gateways" && <CustomGatewaysSection />}
      {activeTab === "contracts" && (
        <DynamicTierGate pageId="settings_byok" fallbackMode="full">
          <ContractRatesSection />
        </DynamicTierGate>
      )}
      {SHOW_API_KEYS && activeTab === "platform" && (
        <DynamicTierGate pageId="settings_byok" fallbackMode="full">
          <PlatformKeysSection />
        </DynamicTierGate>
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

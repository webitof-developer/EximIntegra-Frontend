"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAppSelector } from "@/store";
import {
  useGetPricingPlansQuery,
  useUpdatePricingPlansMutation,
} from "@/store/adminApi";
import { AdminNav } from "../AdminNav";
import { DynamicPricingTab } from "./DynamicPricingTab";
import { ToastNotification } from "@/components/ui";
import { ShieldAlert } from "lucide-react";

export default function AdminPricingPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: pricingData,
    isLoading: pricingLoading,
    refetch: refetchPricing,
    isFetching: pricingFetching,
  } = useGetPricingPlansQuery(undefined, { skip: !mounted || user?.role !== "ADMIN" });

  const [updatePricing] = useUpdatePricingPlansMutation();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // SSR Hydration guard
  if (!mounted) {
    return (
      <AppShell>
        <div className="p-12 text-center text-muted flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy/20 animate-pulse border border-line" />
          <span className="text-xs font-mono">Loading Dynamic Pricing...</span>
        </div>
      </AppShell>
    );
  }

  // Guard against non-admin users
  if (user && user.role !== "ADMIN") {
    return (
      <AppShell>
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-panel border border-red/30 rounded-2xl p-8 text-center space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-red/10 border border-red/20 text-red flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-ink">Super Admin Authority Required</h2>
              <p className="text-xs text-muted leading-relaxed">
                Dynamic Pricing Management is reserved strictly for designated EximIntegra
                platform super administrators.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Return to Trade Dashboard
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNav
          title="Dynamic B2B SaaS Tier Pricing & Feature Quotas"
          description="Centrally configure live plan limits, monthly/annual fees in INR and USD, and feature entitlements published to customer pricing tiers."
          onRefresh={refetchPricing}
          isRefreshing={pricingFetching}
        />

        <DynamicPricingTab
          pricingPlans={pricingData?.plans || []}
          isLoading={pricingLoading}
          onSavePricing={async (plans) => {
            const res = await updatePricing({ plans }).unwrap();
            showToast("B2B SaaS pricing plans updated and published.");
            return res;
          }}
          showToast={showToast}
        />
      </div>

      <ToastNotification
        isOpen={!!toastMessage}
        variant="success"
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </AppShell>
  );
}

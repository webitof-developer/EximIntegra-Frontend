"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAppSelector } from "@/store";
import {
  useGetAdminTierAccessGatesQuery,
  useUpdateTierAccessGatesMutation,
  useCreateTierAccessGateMutation,
  useDeleteTierAccessGateMutation,
} from "@/store/adminApi";
import { AdminNav } from "../AdminNav";
import { TierAccessTab } from "./TierAccessTab";
import { ToastNotification } from "@/components/ui";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function AdminTierAccessPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: gatesData,
    isLoading: gatesLoading,
    refetch: refetchGates,
    isFetching: gatesFetching,
  } = useGetAdminTierAccessGatesQuery(undefined, {
    skip: !mounted || user?.role !== "ADMIN",
  });

  const [updateGates] = useUpdateTierAccessGatesMutation();
  const [createGate] = useCreateTierAccessGateMutation();
  const [deleteGate] = useDeleteTierAccessGateMutation();

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
          <span className="text-xs font-mono">Loading Tier Access Governance...</span>
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
              <h2 className="text-xl font-bold text-ink">
                Super Admin Authority Required
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                Tier Page Access & Feature Gating governance is strictly reserved for designated
                EximIntegra platform super administrators.
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
      <div className="w-full space-y-6">
        <AdminNav
          category="Tier Access"
          title="Tier Page Access & Dynamic Gating Control"
          description="Configure which subscription tiers can access each platform page and feature. Set custom locked messages and test live plan gating templates in real time."
          onRefresh={refetchGates}
          isRefreshing={gatesFetching}
          userCount={gatesData?.gates?.length}
        />

        <TierAccessTab
          initialGates={gatesData?.gates || []}
          isLoading={gatesLoading}
          onCreateGate={async (newGateData) => {
            const res = await createGate(newGateData).unwrap();
            showToast(`Gate for "${newGateData.title}" created and saved to database.`);
            return res;
          }}
          onDeleteGate={async (gateId) => {
            const res = await deleteGate(gateId).unwrap();
            showToast(`Gate "${gateId}" permanently removed from database.`);
            return res;
          }}
          onSaveGates={async (updatedGates) => {
            const res = await updateGates({ gates: updatedGates }).unwrap();
            showToast("Tier access rules updated and applied globally.");
            return res;
          }}
          showToast={showToast}
        />

        {toastMessage && (
          <ToastNotification
            message={toastMessage}
            variant="success"
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    </AppShell>
  );
}

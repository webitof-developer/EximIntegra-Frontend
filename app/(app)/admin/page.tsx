"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAppSelector } from "@/store";
import { useGetAdminStatsQuery } from "@/store/adminApi";
import { AdminNav } from "./AdminNav";
import { PlatformMetricsTab } from "./PlatformMetrics";
import { ToastNotification } from "@/components/ui";
import { ShieldAlert } from "lucide-react";

function AdminMetricsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Backward compatibility: redirect ?tab=... to its new dedicated route
  useEffect(() => {
    const tab = searchParams.get("tab")?.toLowerCase();
    if (tab === "users") router.replace("/admin/users");
    else if (tab === "rbac") router.replace("/admin/rbac");
    else if (tab === "pricing") router.replace("/admin/pricing");
    else if (tab === "llm" || tab === "ai") router.replace("/admin/llm");
  }, [searchParams, router]);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
    isFetching: statsFetching,
  } = useGetAdminStatsQuery(undefined, { skip: !mounted || user?.role !== "ADMIN" });

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
          <span className="text-xs font-mono">Initializing Super Admin Cockpit...</span>
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
                The Admin Command Center is reserved strictly for designated EximIntegra
                platform super administrators. Your account (<span className="font-mono">{user.email}</span>)
                is registered under role <span className="font-semibold text-ink font-mono">{user.role}</span>.
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
          title="Platform Administration & Dynamic Governance Control"
          description="Centralized authority to manage corporate user profiles, subscription quotas, live B2B SaaS pricing, and RBAC permissions across all business roles."
          onRefresh={async () => {
            await refetchStats();
            showToast("Platform metrics synchronized from database.");
          }}
          isRefreshing={statsFetching}
        />

        <PlatformMetricsTab stats={stats} isLoading={statsLoading} />
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

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="p-12 text-center text-muted font-mono text-xs">
            Loading Super Admin Cockpit...
          </div>
        </AppShell>
      }
    >
      <AdminMetricsContent />
    </Suspense>
  );
}

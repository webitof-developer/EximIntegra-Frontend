"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import { useGetTierAccessGatesQuery } from "@/store/adminApi";
import { PlanGateTemplate } from "@/components/saas/PlanGateTemplate";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const tierWeights: Record<string, number> = {
  ALL: 0,
  FREE: 0,
  STARTER: 1,
  PROFESSIONAL: 2,
  PRO: 2,
  ENTERPRISE: 3,
};

export function AppShell({ children, fullWidth = false }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isFullWidth = fullWidth || pathname?.startsWith("/admin");

  // Fetch live tier page access gates
  const { data: tierGatesData } = useGetTierAccessGatesQuery();

  useEffect(() => {
    if (user?.role === "ADMIN" && pathname && !pathname.startsWith("/admin")) {
      router.replace("/admin");
    }
  }, [user?.role, pathname, router]);

  if (user?.role === "ADMIN" && pathname && !pathname.startsWith("/admin")) {
    return null;
  }

  // Check if current route has an active page-level gate for non-admin users
  const isUserView = user?.role !== "ADMIN" && !pathname?.startsWith("/admin");
  const matchingGate =
    isUserView && pathname
      ? tierGatesData?.gates?.find((g) => {
          if (!g.isActive) return false;
          // Sub-tabs like bulk manifest or BYOK keys are handled inside those specific tab views
          if (g.id === "classify_bulk" || g.id === "settings_byok") return false;
          return g.pagePath.toLowerCase() === pathname.toLowerCase();
        })
      : null;

  const currentTier = (user?.tier || "STARTER").toUpperCase();
  const requiredTier = (matchingGate?.requiredTier || "ALL").toUpperCase();

  const isPageGated =
    matchingGate &&
    requiredTier !== "ALL" &&
    (tierWeights[currentTier] ?? 1) < (tierWeights[requiredTier] ?? 2);

  return (
    <div className="flex min-h-screen bg-bg antialiased text-ink font-sans">
      {/* 250px Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Topbar />
        <main
          className={cn(
            "flex-1 py-6 w-full transition-all",
            isFullWidth
              ? "px-5 sm:px-8 max-w-none"
              : "px-6 sm:px-[34px] max-w-[1320px] mx-auto"
          )}
        >
          {isPageGated ? (
            <div className="relative min-h-[75vh] flex items-center justify-center">
              {/* Blurred background preview of the page content */}
              <div className="filter blur-md opacity-25 pointer-events-none select-none w-full max-h-[75vh] overflow-hidden">
                {children}
              </div>
              <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                <PlanGateTemplate
                  requiredTier={matchingGate.requiredTier}
                  featureName={matchingGate.title}
                  description={matchingGate.description}
                  category={matchingGate.category}
                  pagePath={matchingGate.pagePath}
                  fallbackMode="full"
                />
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

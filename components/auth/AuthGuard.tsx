"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store";
import { Lock, ShieldAlert } from "lucide-react";

export interface AuthGuardProps {
  children: React.ReactNode;
}

const GOVERNED_PAGES: Record<string, string> = {
  dashboard: "Overview Cockpit",
  classify: "HS Classification Engine",
  duty: "Statutory Duty Calculator",
  "landed-cost": "Landed Cost Engine",
  eligibility: "Scheme & FTA Eligibility",
  compare: "Country-of-Origin Comparison",
  akshara: "Akshara AI Copilot",
  reports: "Calculation History & Audit",
  settings: "Settings & Integrations",
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized) return;

    const isAuthRoute = pathname === "/login" || pathname === "/register";

    if (!isAuthenticated && !isAuthRoute) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    } else if (isAuthenticated && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-line bg-panel flex items-center justify-center animate-pulse">
            <Image
              src="/eximintegra-logo-mark.png"
              alt="EximIntegra"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="text-xs text-muted font-mono">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  // Check RBAC permission for current page if authenticated
  if (isAuthenticated && user && user.role !== "ADMIN") {
    const rootSegment = pathname.split("/")[1] || "";
    if (rootSegment && GOVERNED_PAGES[rootSegment] && user.permissions?.[rootSegment] === false) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-panel border border-amber-500/30 rounded-2xl p-8 text-center space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-ink">Access Restricted by Role Policy</h2>
              <p className="text-xs text-muted leading-relaxed">
                Your assigned role <span className="font-semibold text-ink font-mono px-1.5 py-0.5 rounded bg-bg border border-line">{user.role}</span> does not have active permission to access the <span className="font-semibold text-ink">{GOVERNED_PAGES[rootSegment]}</span> page.
              </p>
              <p className="text-[11px] text-muted">
                Contact your Super Administrator to grant permission access from the Admin Cockpit RBAC system.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Return to Overview Cockpit
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

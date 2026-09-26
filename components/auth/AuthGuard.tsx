"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store";

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

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
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white font-mono font-bold text-xs animate-pulse">
            EI
          </div>
          <span className="text-xs text-muted font-mono">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

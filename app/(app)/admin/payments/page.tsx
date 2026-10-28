"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAppSelector } from "@/store";
import { AdminNav } from "../AdminNav";
import { RazorpayGatewaySection } from "./RazorpayGatewaySection";
import { ToastNotification } from "@/components/ui";
import { ShieldAlert } from "lucide-react";

export default function AdminPaymentsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showSuccess = (msg: string) => {
    setToastType("success");
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showError = (msg: string) => {
    setToastType("error");
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // SSR Hydration guard
  if (!mounted) {
    return (
      <AppShell>
        <div className="p-12 text-center text-muted flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy/20 animate-pulse border border-line" />
          <span className="text-xs font-mono">Loading Razorpay Payment Gateway...</span>
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
                Payment Gateway Configuration is reserved strictly for designated EximIntegra
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
      <div className="w-full space-y-6">
        <AdminNav
          title="Razorpay Payment Gateway & Checkout Engine"
          description="Configure enterprise payment credentials, App Key ID, Secret Key, Webhooks, and dual-currency (INR & USD) processing for subscription plans."
          category="Commercial & Payments"
        />

        <RazorpayGatewaySection
          onSuccess={showSuccess}
          onError={showError}
        />
      </div>

      {toastMessage && (
        <ToastNotification
          isOpen={!!toastMessage}
          variant={toastType}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </AppShell>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAppSelector } from "@/store";
import { AdminNav } from "../AdminNav";
import { LlmProvidersSection } from "./LlmProvidersSection";
import { ToastNotification } from "@/components/ui";
import { ShieldAlert, Sparkles } from "lucide-react";

export default function AdminLlmPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <span className="text-xs font-mono">Loading AI & LLM Providers...</span>
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
                Enterprise AI & LLM Engine Configuration is reserved strictly for designated EximIntegra
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
          category="AI Providers"
          title="Enterprise AI & LLM Engine Configuration"
          description="Centrally configure corporate AI credentials (Anthropic Claude, OpenAI, Google Gemini, Groq, Private vLLM), manage active model dropdowns, and set the global default copilot engine for Akshara across your organization."
          userCount={5}
        />

        <div className="space-y-4">
          {/* <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-dim text-blue font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                SUPER ADMIN AI ORCHESTRATION
              </span>
            </div>
            <h2 className="text-lg font-bold text-ink">
              Live Provider Keys & Model Connectivity
            </h2>
            <p className="text-xs text-muted max-w-2xl leading-relaxed">
              Verify upstream API latency, toggle model availability, and manage fallback providers for seamless cross-border customs advisory.
            </p>
          </div> */}

          <LlmProvidersSection />
        </div>
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

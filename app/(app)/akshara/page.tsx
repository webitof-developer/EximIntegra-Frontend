"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMaterialContext } from "@/store/contextSlice";
import { useSendChatMessageMutation } from "@/store/aksharaApi";
import { AksharaMessage, ContextUpdateAction } from "@/lib/types";
import { ChatMessageItem } from "@/components/akshara/ChatMessageItem";
import { ChatInput } from "@/components/akshara/ChatInput";
import {
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Calculator,
  Ship,
  Scale,
  ArrowRight,
  Database,
  Info,
  Cpu,
} from "lucide-react";
import { FeatureGate } from "@/components/saas/FeatureGate";

interface ActiveLlmInfo {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

function getActiveLlmFromStorage(): ActiveLlmInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("eximintegra_llm_providers_config");
    if (!raw) return null;
    const providers = JSON.parse(raw);
    if (!Array.isArray(providers)) return null;

    // Check provider designated as active copilot and configured with API key
    const active = providers.find(
      (p) => p.isActiveCopilot && p.apiKey && p.apiKey.trim().length > 0
    );
    if (active) {
      return {
        id: active.id,
        name: active.name,
        apiKey: active.apiKey.trim(),
        model: active.defaultModel,
        baseUrl: active.baseUrl,
      };
    }

    // Fallback: any configured provider that has an API key
    const anyConfigured = providers.find(
      (p) => p.apiKey && p.apiKey.trim().length > 0
    );
    if (anyConfigured) {
      return {
        id: anyConfigured.id,
        name: anyConfigured.name,
        apiKey: anyConfigured.apiKey.trim(),
        model: anyConfigured.defaultModel,
        baseUrl: anyConfigured.baseUrl,
      };
    }
  } catch (e) {
    console.error("Failed to read active LLM config", e);
  }
  return null;
}

export default function AksharaPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";
  const currentContext = useAppSelector((state) => state.context.current);
  const [sendChatMessage, { isLoading }] = useSendChatMessageMutation();

  const [activeLlm, setActiveLlm] = useState<ActiveLlmInfo | null>(null);
  const [conversationId, setConversationId] = useState<string>(() => `conv_${Date.now()}`);
  const [messages, setMessages] = useState<AksharaMessage[]>([
    {
      id: "msg_welcome",
      role: "assistant",
      content:
        "### Welcome to Akshara\n\nI am your AI Trade & Customs Advisory Copilot. Ask me about HS classification, customs duties, preferential trade agreements (CEPA/FTAs), or import compliance.",
      timestamp: new Date().toISOString(),
      tool_calls_made: [],
      unresolved_subclaims: [],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setActiveLlm(getActiveLlmFromStorage());
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const currentActiveLlm = getActiveLlmFromStorage();
    if (currentActiveLlm !== activeLlm) {
      setActiveLlm(currentActiveLlm);
    }

    const userMsg: AksharaMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // If API key is not configured, inform user with a clean, normal message
    if (!currentActiveLlm || !currentActiveLlm.apiKey || !currentActiveLlm.apiKey.trim()) {
      const unconfiguredMsg: AksharaMessage = {
        id: `asst_unconfigured_${Date.now()}`,
        role: "assistant",
        content: isAdmin
          ? "### ⚠️ AI Advisory Engine Unconfigured\n\nNo active AI model credentials have been configured for the platform.\n\nAs a Super Admin, you can set up corporate API keys and select the active AI model in the Admin Cockpit:\n\n[**Configure AI in Admin Cockpit ➔**](/admin?tab=llm)"
          : "### ⚠️ Advisory Service Currently Unavailable\n\nAkshara AI trade advisory is currently unavailable because the enterprise AI copilot engine has not been configured. Please contact your platform administrator.",
        timestamp: new Date().toISOString(),
        tool_calls_made: [],
        unresolved_subclaims: [],
        is_unresolvable_warning: true,
      };
      setMessages((prev) => [...prev, unconfiguredMsg]);
      return;
    }

    try {
      const response = await sendChatMessage({
        message: text,
        conversation_id: conversationId,
        active_context: currentContext,
        llm_config: {
          provider: currentActiveLlm.id,
          api_key: currentActiveLlm.apiKey,
          model: currentActiveLlm.model,
          base_url: currentActiveLlm.baseUrl,
        },
      }).unwrap();

      const assistantMsg: AksharaMessage = {
        id: response.message_id || `asst_${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: response.timestamp || new Date().toISOString(),
        tool_calls_made: response.tool_calls_made,
        unresolved_subclaims: response.unresolved_subclaims,
        context_action: response.context_action,
        is_unresolvable_warning: response.is_unresolvable_warning,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errDetail =
        err?.data?.message || err?.message || "Unable to reach the live consultation endpoints.";
      const errorMsg: AksharaMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: isAdmin
          ? `### ⚠️ Advisory Service Temporarily Unavailable\n\nAkshara could not complete the consultation with the configured AI provider.\n\n**Details:** \`${errDetail}\`\n\nAs a Super Admin, verify your provider credentials and endpoints in the Admin Cockpit:\n\n[**Manage AI Providers in Admin Cockpit ➔**](/admin?tab=llm)`
          : "### ⚠️ Advisory Service Temporarily Unavailable\n\nAkshara Copilot is currently experiencing a temporary service interruption. Please try your inquiry again in a moment, or contact your system administrator if the issue persists.",
        timestamp: new Date().toISOString(),
        is_unresolvable_warning: true,
        tool_calls_made: [],
        unresolved_subclaims: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleApplyContext = (action: ContextUpdateAction) => {
    dispatch(setMaterialContext(action.payload));
  };

  const handleClearHistory = () => {
    setConversationId(`conv_${Date.now()}`);
    setMessages([
      {
        id: "msg_reset",
        role: "assistant",
        content:
          "Conversation history has been reset. All active context remains loaded in your session. What would you like to evaluate?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const hasByokKey = Boolean(activeLlm && activeLlm.apiKey && activeLlm.apiKey.trim().length > 0);

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-5 max-w-5xl mx-auto pb-16">
          {/* Active Shared Context & Engine Bar */}
          <div className="bg-panel border border-line rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-blue-dim text-blue flex items-center justify-center shrink-0">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-ink">
                    Active Context:
                  </span>
                  <span className="font-mono text-xs font-bold text-blue">
                    HS {currentContext.hsCode || "None"}
                  </span>
                  {currentContext.countryOfOrigin && (
                    <span className="text-[10px] font-mono bg-bg text-muted px-1.5 py-0.5 rounded border border-line">
                      Origin: {currentContext.countryOfOrigin}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted truncate max-w-md">
                  {currentContext.materialName || currentContext.hsDescription || "No commodity selected"}
                </p>
              </div>
            </div>

            {/* Active AI Engine Badge & Navigation */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Active AI Engine Indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-bg border border-line shadow-3xs">
                <Cpu className="w-3.5 h-3.5 text-blue shrink-0" />
                {hasByokKey && activeLlm ? (
                  isAdmin ? (
                    <Link
                      href="/admin?tab=llm"
                      className="flex items-center gap-1.5 hover:text-blue transition-colors group"
                      title="Super Admin: Click to manage AI in Admin Cockpit"
                    >
                      <span className="font-bold text-ink">{activeLlm.name}</span>
                      <span className="text-muted/60">&bull;</span>
                      <span className="text-blue font-bold truncate max-w-[140px]">
                        {activeLlm.model}
                      </span>
                      <span className="text-[9px] bg-green-dim text-green font-bold px-1.5 py-0.5 rounded border border-green/30 tracking-wider">
                        LIVE
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-ink">{activeLlm.name}</span>
                      <span className="text-muted/60">&bull;</span>
                      <span className="text-blue font-bold truncate max-w-[140px]">
                        {activeLlm.model}
                      </span>
                      <span className="text-[9px] bg-green-dim text-green font-bold px-1.5 py-0.5 rounded border border-green/30 tracking-wider">
                        LIVE
                      </span>
                    </div>
                  )
                ) : isAdmin ? (
                  <Link
                    href="/admin?tab=llm"
                    className="text-muted hover:text-ink transition-colors flex items-center gap-1"
                    title="Click to configure AI providers in Admin Cockpit"
                  >
                    <span>Statutory Engine</span>
                    <span className="text-blue font-sans text-[10px] font-semibold underline ml-1">
                      Configure AI (Admin)
                    </span>
                  </Link>
                ) : (
                  <span className="text-muted flex items-center gap-1">
                    <span>Statutory Engine</span>
                    <span className="text-[9px] bg-panel text-muted px-1.5 py-0.5 rounded border border-line ml-1">
                      Enterprise Governed
                    </span>
                  </span>
                )}
              </div>

              <Link
                href="/duty"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-bg hover:bg-line text-ink border border-line transition-colors"
              >
                <Calculator className="w-3 h-3 text-blue" />
                <span>Duty</span>
              </Link>
              <Link
                href="/landed-cost"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-bg hover:bg-line text-ink border border-line transition-colors"
              >
                <Ship className="w-3 h-3 text-green" />
                <span>Landed Cost</span>
              </Link>
              <button
                type="button"
                onClick={handleClearHistory}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-bg hover:bg-line text-muted hover:text-ink border border-line transition-colors cursor-pointer"
                title="Reset active chat session"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Chat Messages & Input Container */}
          <FeatureGate
            requiredTier="ENTERPRISE"
            featureName="Akshara AI Copilot"
            description="Access grounded trade intelligence with autonomous GIR classification, real-time customs gazette citations, and verified tool-call audit trails."
            allowByok={hasByokKey}
          >
            <div className="space-y-4">
              <div className="bg-bg/40 border border-line rounded-2xl p-4 min-h-[460px] max-h-[640px] overflow-y-auto space-y-4 shadow-inner">
                {messages.map((msg) => (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    onApplyContext={handleApplyContext}
                  />
                ))}

                {isLoading && (
                  <div className="flex items-center gap-3 p-4 bg-panel border border-line rounded-2xl animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-blue/10 text-blue flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 animate-spin text-blue" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 bg-line/80 rounded w-1/3"></div>
                      <div className="h-2 bg-line/50 rounded w-2/3"></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {!hasByokKey && (
                <div className="p-3 bg-blue/5 border border-blue/20 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-ink">
                    <Info className="w-4 h-4 text-blue shrink-0" />
                    <span>
                      {isAdmin ? (
                        <>
                          <strong>Super Admin Notice:</strong> Enterprise AI model credentials are not yet configured. Set up API keys in the Admin Cockpit to enable live advisory.
                        </>
                      ) : (
                        <>
                          <strong>Notice:</strong> Akshara Copilot is operating in baseline statutory mode. Enterprise AI intelligence is managed centrally by your administrator.
                        </>
                      )}
                    </span>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin?tab=llm"
                      className="px-3 py-1.5 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold transition-colors shrink-0 shadow-xs flex items-center gap-1"
                    >
                      <span>Admin Cockpit</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )}

              {/* Chat Input */}
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                activeHs={currentContext.hsCode}
              />
            </div>
          </FeatureGate>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

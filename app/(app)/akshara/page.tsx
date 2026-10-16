"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMaterialContext } from "@/store/contextSlice";
import { useSendChatMessageMutation, useGetConversationsQuery, AksharaConversationDetail } from "@/store/aksharaApi";
import { useGetActiveLlmProviderQuery } from "@/store/adminApi";
import { AksharaMessage, ContextUpdateAction } from "@/lib/types";
import { ChatMessageItem } from "@/components/akshara/ChatMessageItem";
import { ChatInput } from "@/components/akshara/ChatInput";
import { ChatHistoryDrawer } from "@/components/akshara/ChatHistoryDrawer";
import {
  Sparkles,
  ArrowRight,
  Info,
  History,
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
  const { data: dbActiveLlm } = useGetActiveLlmProviderQuery();

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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { data: dbConversations } = useGetConversationsQuery();
  const historyCount = dbConversations?.length || 0;

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

    const isClientConfigured = Boolean(
      currentActiveLlm && currentActiveLlm.apiKey && currentActiveLlm.apiKey.trim().length > 0
    );
    const isDbConfigured = Boolean(dbActiveLlm && dbActiveLlm.isConfigured);

    const userMsg: AksharaMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // If neither DB nor client storage has a configured active provider, alert user
    if (!isClientConfigured && !isDbConfigured) {
      const unconfiguredMsg: AksharaMessage = {
        id: `asst_unconfigured_${Date.now()}`,
        role: "assistant",
        content: isAdmin
          ? "### ⚠️ AI Advisory Engine Unconfigured\n\nNo active AI model credentials have been configured for the platform.\n\nAs a Super Admin, you can set up corporate API keys and select the active AI model in the Admin Cockpit to store permanently in the database:\n\n[**Configure AI in Admin Cockpit ➔**](/admin?tab=llm)"
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
      const payload: any = {
        message: text,
        conversation_id: conversationId,
        active_context: currentContext,
      };

      if (isClientConfigured && currentActiveLlm) {
        payload.llm_config = {
          provider: currentActiveLlm.id,
          api_key: currentActiveLlm.apiKey,
          model: currentActiveLlm.model,
          base_url: currentActiveLlm.baseUrl,
        };
      }

      const response = await sendChatMessage(payload).unwrap();

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

  const handleStartNewChat = () => {
    const newId = `conv_${Date.now()}`;
    setConversationId(newId);
    setMessages([
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
  };

  const handleSelectConversation = (detail: AksharaConversationDetail) => {
    setConversationId(detail.id);
    setMessages(detail.messages || []);
    if (detail.activeContext) {
      dispatch(setMaterialContext(detail.activeContext));
    }
  };

  const clientEngine =
    activeLlm && activeLlm.apiKey && activeLlm.apiKey.trim().length > 0 ? activeLlm : null;
  const dbEngine = dbActiveLlm && dbActiveLlm.isConfigured ? dbActiveLlm : null;
  const isLlmConfigured = Boolean(clientEngine || dbEngine);

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-5xl mx-auto h-[calc(100vh-116px)] flex flex-col">
          {/* Chat Messages & Input Container */}
          <FeatureGate
            requiredTier="ENTERPRISE"
            featureName="Akshara AI Copilot"
            description="Access grounded trade intelligence with autonomous GIR classification, real-time customs gazette citations, and verified tool-call audit trails."
          >
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              {/* Scrollable Messages Container */}
              <div className="flex-1 min-h-0 bg-bg/40 border border-line rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner">
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

              {/* Sticky Chat Field Attached at Screen Bottom Center */}
              <div className="sticky bottom-0 z-20 pt-1 pb-0 bg-bg/95 backdrop-blur-xs space-y-2">
                {!isLlmConfigured && (
                  <div className="p-2.5 bg-blue/5 border border-blue/20 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-200">
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
                        className="px-2.5 py-1 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold transition-colors shrink-0 shadow-xs flex items-center gap-1"
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
                  activeOrigin={currentContext.countryOfOrigin}
                  onNewChat={handleStartNewChat}
                  onOpenHistory={() => setIsHistoryOpen(true)}
                />
              </div>
            </div>
          </FeatureGate>
        </div>

        {/* Attached History Tab Button on Screen's Right Center */}
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-10 h-11 sm:w-11 sm:h-12 bg-panel border-l-2 border-y border-l-blue border-y-line rounded-l-xl shadow-xl hover:bg-bg hover:w-12 transition-all text-ink group cursor-pointer border-r-0"
          title="Consultation History"
          aria-label="Open consultation history"
        >
          <History className="w-5 h-5 text-blue group-hover:scale-110 transition-transform" />
        </button>

        {/* Slide-in Chat History Side Panel */}
        <ChatHistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          activeConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleStartNewChat}
        />
      </AppShell>
    </AuthGuard>
  );
}

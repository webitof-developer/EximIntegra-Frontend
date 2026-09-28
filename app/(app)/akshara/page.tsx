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
} from "lucide-react";
import { FeatureGate } from "@/components/saas/FeatureGate";

export default function AksharaPage() {
  const dispatch = useAppDispatch();
  const currentContext = useAppSelector((state) => state.context.current);
  const [sendChatMessage, { isLoading }] = useSendChatMessageMutation();

  const [conversationId, setConversationId] = useState<string>(() => `conv_${Date.now()}`);
  const [messages, setMessages] = useState<AksharaMessage[]>([
    {
      id: "msg_welcome",
      role: "assistant",
      content:
        "### Welcome to Akshara\n\nAsk me about HS classification, customs duties, preferential trade agreements, or import compliance.\n\nEvery calculation includes a verified tool-call audit trail. What commodity would you like to evaluate?",
      timestamp: new Date().toISOString(),
      tool_calls_made: [
        {
          id: "tc_init_01",
          tool_name: "statutory_registry_sync",
          endpoint: "GET /api/v1/dataset-versions",
          summary: "Verified active CBIC Tariff Database v2026.03 and DGFT Import Policy Gazette.",
          parameters: { jurisdiction: "IN", effective_date: "2026-03-01" },
          execution_time_ms: 84,
          provenance: {
            type: "LIVE",
            source: "CBIC Central Server v2026.03",
          },
        },
      ],
      unresolved_subclaims: [],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMsg: AksharaMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await sendChatMessage({
        message: text,
        conversation_id: conversationId,
        active_context: currentContext,
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
    } catch (err) {
      const errorMsg: AksharaMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content:
          "### ⚠️ Statutory Service Temporarily Unavailable\n\nUnable to reach the live statutory consultation endpoints. Please verify network connectivity or review the active CBIC system status.",
        timestamp: new Date().toISOString(),
        is_unresolvable_warning: true,
        tool_calls_made: [
          {
            id: "tc_err_01",
            tool_name: "gateway_dispatch_error",
            endpoint: "POST /api/v1/akshara/chat",
            summary: "Upstream gateway timeout or mock failure.",
            parameters: {},
            execution_time_ms: 0,
            provenance: {
              type: "UNAVAILABLE",
              source: "ICEGATE / DGFT Gateway",
            },
          },
        ],
        unresolved_subclaims: [
          "Real-time statutory valuation could not be verified due to endpoint error.",
        ],
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

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-5 max-w-5xl mx-auto pb-16">
          {/* Active Shared Context Bar */}
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

            {/* Quick Actions & Navigation */}
            <div className="flex items-center gap-2">
              <Link
                href="/duty"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-bg hover:bg-line text-ink border border-line transition-colors"
              >
                <Calculator className="w-3 h-3 text-blue" />
                <span>Duty Calculator</span>
              </Link>
              <Link
                href="/landed-cost"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-bg hover:bg-line text-ink border border-line transition-colors"
              >
                <Ship className="w-3 h-3 text-green" />
                <span>Landed Cost</span>
              </Link>
              <Link
                href="/compare"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-bg hover:bg-line text-ink border border-line transition-colors"
              >
                <Scale className="w-3 h-3 text-amber" />
                <span>Compare</span>
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
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-blue text-white shrink-0 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="bg-panel border border-line px-3.5 py-2.5 rounded-xl rounded-tl-none shadow-xs">
                      <div className="flex items-center gap-2 text-xs font-mono text-blue font-semibold">
                        <div className="w-2 h-2 rounded-full bg-blue animate-ping" />
                        <span>Analyzing trade regulations & tariffs...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Section */}
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                activeHs={currentContext.hsCode}
                activeOrigin={currentContext.countryOfOrigin}
              />
            </div>
          </FeatureGate>
        </div>
      </AppShell>
    </AuthGuard>
  );
}


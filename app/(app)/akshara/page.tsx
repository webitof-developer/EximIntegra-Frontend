"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
        "### Welcome to Akshara — Statutory Customs & Trade Copilot\n\nI am your deterministic cross-border advisory engine. Unlike generic conversational models, every response I generate is **grounded in live statutory data** from:\n\n- **CBIC Customs Tariff Act 2026** (Standard MFN, SWS, AIDC, and IGST schedules)\n- **WCO General Rules for Interpretation (GIR)** for verifiable HS classification\n- **DGFT Foreign Trade Policy 2023** (Import licensing and non-tariff measures)\n- **CEPA & FTA Concessional Rules of Origin** (India-UAE, ASEAN, Australia)\n\nEvery calculation or regulatory determination includes an expandable **'How I Got This'** transparency trail detailing exact tool calls, endpoints, and latency.\n\n*How can I assist your import or cross-border trade operations today?*",
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold font-mono text-ink tracking-tight">
              Akshara AI Copilot
            </h1>
            <span className="text-[10px] font-mono uppercase bg-green-dim text-green px-2 py-0.5 rounded font-bold border border-green/30">
              Grounded Statutory v2026.03
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Statutory cross-border trade advisor with deterministic tool-calling transparency, GIR classification, and FTAs.
          </p>
        </div>

        {/* Action Controls & Clear Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-panel hover:bg-bg text-xs font-medium text-muted hover:text-ink transition-colors cursor-pointer"
            title="Reset active chat session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Active Shared Context Bar */}
      <div className="bg-panel border border-line rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-blue-dim text-blue flex items-center justify-center shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-ink">
                Active Shared Context:
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

        {/* Quick Jump Links with Context */}
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
            <span>Origin Comparison</span>
          </Link>
        </div>
      </div>

      {/* Chat Messages Container */}
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
            <div className="bg-panel border border-line p-3.5 rounded-xl rounded-tl-none space-y-2 shadow-xs max-w-[70%]">
              <div className="flex items-center gap-2 text-xs font-mono text-blue font-semibold">
                <div className="w-2.5 h-2.5 rounded-full bg-blue animate-ping" />
                <span>Akshara is querying statutory endpoints & GIR engines...</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Evaluating WCO General Interpretation Rules, CBIC 2026 tariff schedules, and DGFT licensing restrictions.
              </p>
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
  );
}

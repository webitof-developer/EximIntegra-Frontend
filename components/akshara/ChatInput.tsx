"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  CornerDownLeft,
  Sparkles,
  AlertTriangle,
  ArrowRightLeft,
  Plus,
  History,
  Calculator,
  Ship,
} from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  activeHs?: string;
  activeOrigin?: string;
  onNewChat?: () => void;
  onOpenHistory?: () => void;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  activeHs,
  activeOrigin,
  onNewChat,
  onOpenHistory,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    {
      label: "Classify commodity & calculate customs tariff",
      query: "Help me classify my product under the Customs Tariff Act and calculate applicable BCD, SWS, and IGST.",
      icon: Sparkles,
      tag: "Classification & Duty",
    },
    {
      label: "Compare FTA / CEPA preferential tariff vs MFN",
      query: "Compare preferential tariff rates under CEPA/FTA trade agreements versus standard MFN customs duty for my shipment.",
      icon: ArrowRightLeft,
      tag: "Trade Agreements",
    },
    {
      label: "Check mandatory port compliance & licenses",
      query: "What mandatory licenses, non-tariff clearances (BIS, SIMS, EPR), and port certifications are required for import?",
      icon: AlertTriangle,
      tag: "Compliance & Clearance",
    },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (query: string) => {
    if (isLoading) return;
    onSendMessage(query);
  };

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  return (
    <div className="space-y-3">
      {/* Quick Prompts / Grounded Inquiries */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono font-semibold text-muted flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-blue" />
          Quick Inquiries:
        </span>
        {suggestions.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSuggestionClick(s.query)}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line bg-panel hover:bg-bg hover:border-blue/40 text-xs text-ink transition-all disabled:opacity-50 cursor-pointer text-left shadow-2xs"
            >
              <Icon className="w-3 h-3 text-blue group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate max-w-[280px] text-[11px]">
                {s.label}
              </span>
              <span className="text-[9px] font-mono bg-bg text-muted px-1 py-0.5 rounded border border-line">
                {s.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Input Form Box */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-panel rounded-xl border border-line focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/10 shadow-xs transition-all overflow-hidden"
      >
        <div className="p-3">
          <textarea
            ref={textareaRef}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              activeHs
                ? `Ask Akshara about HS ${activeHs}, tariffs, FTAs, or regulatory compliances... (Shift+Enter for newline)`
                : "Ask Akshara about HS classification, duty tariffs, CEPA arbitrage, or statutory regulations..."
            }
            className="w-full bg-transparent resize-none border-0 p-0 text-xs text-ink placeholder:text-muted focus:ring-0 focus:outline-hidden leading-relaxed min-h-[44px]"
          />
        </div>

        <div className="px-3 py-2 bg-bg/50 border-t border-line/60 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Input hints & Active Context */}
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted">
            <span className="hidden sm:inline-flex items-center gap-1">
              <CornerDownLeft className="w-2.5 h-2.5" />
              Press <kbd className="px-1 py-0.5 bg-panel border border-line rounded">Enter</kbd> to submit
            </span>
            {activeHs && (
              <span className="flex items-center gap-1 text-ink font-semibold">
                Context: <span className="text-blue">{activeHs}</span>
                {activeOrigin && <span>({activeOrigin})</span>}
              </span>
            )}
          </div>

          {/* Right: Shortcuts & Consult Button */}
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            {/* Session Actions - Icon only buttons */}
            {onNewChat && (
              <button
                type="button"
                onClick={onNewChat}
                className="p-1.5 rounded-lg border border-line bg-panel hover:bg-bg hover:border-blue/40 text-ink transition-colors cursor-pointer shadow-3xs flex items-center justify-center group"
                title="New Chat"
                aria-label="New Chat"
              >
                <Plus className="w-3.5 h-3.5 text-blue group-hover:scale-110 transition-transform" />
              </button>
            )}

            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="p-1.5 rounded-lg border border-line bg-panel hover:bg-bg hover:border-blue/40 text-ink transition-colors cursor-pointer shadow-3xs flex items-center justify-center group"
                title="Consultation History"
                aria-label="Consultation History"
              >
                <History className="w-3.5 h-3.5 text-blue group-hover:scale-110 transition-transform" />
              </button>
            )}

            <div className="h-4 w-px bg-line/80 mx-0.5 hidden sm:block" />

            {/* Quick Module Shortcuts - Icon AND Text */}
            <Link
              href="/duty"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-line bg-panel hover:bg-bg hover:border-blue/40 text-[11px] font-semibold text-ink transition-colors shadow-3xs"
              title="Duty Calculator"
            >
              <Calculator className="w-3 h-3 text-blue shrink-0" />
              <span>Duty</span>
            </Link>

            <Link
              href="/landed-cost"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-line bg-panel hover:bg-bg hover:border-green/40 text-[11px] font-semibold text-ink transition-colors shadow-3xs"
              title="Landed Cost Estimator"
            >
              <Ship className="w-3 h-3 text-green shrink-0" />
              <span>Landed Cost</span>
            </Link>

            <div className="h-4 w-px bg-line/80 mx-0.5 hidden sm:block" />

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue hover:bg-blue-dark disabled:opacity-40 disabled:hover:bg-blue text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing Tools...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Consult Akshara</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

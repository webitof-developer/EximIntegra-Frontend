"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, CornerDownLeft, Sparkles, AlertTriangle, ArrowRightLeft } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  activeHs?: string;
  activeOrigin?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  activeHs,
  activeOrigin,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    {
      label: "Classify Heavy Melting Steel Scrap & check statutory duty",
      query: "Classify Heavy Melting Steel Scrap (HMS 1/2) and compute statutory customs tariffs.",
      icon: Sparkles,
      tag: "Tariff & GIR",
    },
    {
      label: "Compare UAE vs US sourcing for HS 7204.49.00",
      query: "Compare UAE CEPA preferential tariff vs United States MFN duty for HS 7204.49.00.",
      icon: ArrowRightLeft,
      tag: "Sourcing Arbitrage",
    },
    {
      label: "Can I import hazardous e-scrap in 2029 without license?",
      query: "What will be the custom duty on hazardous electronic scrap in 2029 and can I import without an MoEFCC license?",
      icon: AlertTriangle,
      tag: "Statutory Limitation Check",
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

        <div className="px-3 py-2 bg-bg/50 border-t border-line/60 flex items-center justify-between gap-3">
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
      </form>
    </div>
  );
}

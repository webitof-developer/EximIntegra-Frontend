"use client";

import React, { useState } from "react";
import { AksharaMessage, ContextUpdateAction } from "@/lib/types";
import { ToolCallTrail } from "./ToolCallTrail";
import { UnresolvedSubclaimsAlert } from "./UnresolvedSubclaimsAlert";
import { ProvenanceBadge } from "@/components/ui/ProvenanceBadge";
import {
  Sparkles,
  User,
  Clock,
  Check,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface ChatMessageItemProps {
  message: AksharaMessage;
  onApplyContext?: (action: ContextUpdateAction) => void;
}

export function ChatMessageItem({
  message,
  onApplyContext,
}: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const [applied, setApplied] = useState(false);

  const handleAction = () => {
    if (message.context_action && onApplyContext) {
      onApplyContext(message.context_action);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    }
  };

  // Simple Markdown parsing for clean presentation of sections and bullets
  const renderFormattedContent = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith("### ")) {
            return (
              <h4 key={idx} className="text-sm font-bold text-ink mt-3 mb-1">
                {line.replace("### ", "")}
              </h4>
            );
          }
          if (line.startsWith("- ")) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-blue font-bold">&bull;</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace("- ", "")) }} />
              </div>
            );
          }
          if (line.match(/^\d+\.\s/)) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          );
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-ink">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-muted">$1</em>');
  };

  return (
    <div
      className={`flex items-start gap-3.5 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono font-bold text-xs select-none shadow-xs ${
          isUser
            ? "bg-navy text-[#93C5FD] border border-line"
            : "bg-blue text-white"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Content Container */}
      <div
        className={`max-w-[85%] rounded-xl p-4 shadow-xs transition-all ${
          isUser
            ? "bg-navy text-white rounded-tr-none"
            : message.is_unresolvable_warning
            ? "bg-[#FFFDF7] border-2 border-amber/40 text-ink rounded-tl-none"
            : "bg-panel border border-line text-ink rounded-tl-none"
        }`}
      >
        {/* Header (Role & Timestamp) */}
        <div
          className={`flex items-center justify-between gap-3 pb-2 mb-2 border-b text-[10px] font-mono ${
            isUser ? "border-white/10 text-[#8EA0C0]" : "border-line text-muted"
          }`}
        >
          <span className="font-bold">
            {isUser ? "You" : "Akshara AI — Trade Copilot"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Message Body */}
        {isUser ? (
          <p className="text-xs leading-relaxed">{message.content}</p>
        ) : (
          renderFormattedContent(message.content)
        )}

        {/* Inline Context Action Card (Phase 6 shared state integration) */}
        {!isUser && message.context_action && (
          <div className="mt-3.5 p-3 rounded-lg bg-blue-dim/70 border border-blue/20 flex flex-wrap items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-blue font-bold tracking-wider block">
                Cross-Module Action
              </span>
              <span className="text-xs font-semibold text-ink">
                {message.context_action.label}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAction}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                applied
                  ? "bg-green text-white"
                  : "bg-blue hover:bg-blue-dark text-white"
              }`}
            >
              {applied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Applied to Shared Context</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Apply Now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Expandable 'How I Got This' Tool Call Trail */}
        {!isUser && message.tool_calls_made && (
          <ToolCallTrail toolCalls={message.tool_calls_made} />
        )}

        {/* Unresolved Subclaims Alert */}
        {!isUser && message.unresolved_subclaims && (
          <UnresolvedSubclaimsAlert
            subclaims={message.unresolved_subclaims}
          />
        )}
      </div>
    </div>
  );
}

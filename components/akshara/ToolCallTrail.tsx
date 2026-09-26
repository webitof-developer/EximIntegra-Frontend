"use client";

import React, { useState } from "react";
import { AksharaToolCall } from "@/lib/types";
import { ProvenanceBadge } from "@/components/ui/ProvenanceBadge";
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface ToolCallTrailProps {
  toolCalls: AksharaToolCall[];
}

export function ToolCallTrail({ toolCalls }: ToolCallTrailProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mt-3 border border-line rounded-lg overflow-hidden bg-bg/60">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-xs text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-blue" />
          <span className="font-mono font-semibold text-ink">
            How I Got This:
          </span>
          <span className="text-[11px] font-mono bg-blue-dim text-blue px-1.5 py-0.2 rounded font-semibold">
            {toolCalls.length} tool {toolCalls.length === 1 ? "call" : "calls"} executed
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span>{isExpanded ? "Hide trail" : "Show transparency log"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Expanded Tool Call Details */}
      {isExpanded && (
        <div className="p-3 border-t border-line space-y-2.5 bg-panel">
          {toolCalls.map((call, idx) => (
            <div
              key={call.id || idx}
              className="p-2.5 rounded-lg bg-bg border border-line space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold bg-[#1B2A4A] text-white px-1.5 py-0.5 rounded">
                    {call.endpoint.split(" ")[0]}
                  </span>
                  <span className="font-mono text-xs font-bold text-ink">
                    {call.endpoint.split(" ")[1] || call.endpoint}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {call.execution_time_ms}ms
                  </span>
                  <ProvenanceBadge
                    type={call.provenance.type}
                    source={call.provenance.source}
                    compact
                  />
                </div>
              </div>

              <p className="text-xs text-ink leading-relaxed">
                {call.summary}
              </p>

              {call.parameters && Object.keys(call.parameters).length > 0 && (
                <div className="text-[10px] font-mono text-muted bg-white p-1.5 rounded border border-line/60 truncate">
                  Parameters: {JSON.stringify(call.parameters)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

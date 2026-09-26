"use client";

import React from "react";
import { AlertCircle, RefreshCw, ExternalLink, ShieldAlert } from "lucide-react";
import { ProvenanceBadge } from "./ProvenanceBadge";

export interface DegradedStateAlertProps {
  title?: string;
  endpoint?: string;
  source?: string;
  reason?: string;
  onRetry?: () => void;
  className?: string;
}

export function DegradedStateAlert({
  title = "Statutory Integration Degraded / Unavailable",
  endpoint,
  source = "ICEGATE / DGFT Statutory Feed",
  reason = "The external customs authority endpoint is experiencing elevated latency or maintenance. Calculation results could not be verified against the live gazette feed.",
  onRetry,
  className = "",
}: DegradedStateAlertProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`p-4 rounded-xl border-2 border-red/40 bg-red-dim/60 text-ink space-y-3 shadow-xs ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red shrink-0" />
          <span className="font-mono text-xs font-bold text-red uppercase tracking-wider">
            {title}
          </span>
        </div>
        <ProvenanceBadge type="UNAVAILABLE" source={source} compact />
      </div>

      <p className="text-xs text-ink/90 leading-relaxed font-sans">{reason}</p>

      {endpoint && (
        <div className="font-mono text-[10px] text-muted bg-white/70 px-2.5 py-1 rounded border border-red/20 truncate">
          Target Endpoint: <span className="font-bold text-ink">{endpoint}</span>
        </div>
      )}

      <div className="pt-2 border-t border-red/20 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-muted flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-red" />
          Reliability Rule §3.5: Failures are never silently zeroed out.
        </span>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-panel hover:bg-bg border border-line text-xs font-semibold text-ink shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-red" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    </div>
  );
}

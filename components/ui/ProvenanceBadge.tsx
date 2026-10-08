import React from "react";
import { ProvenanceType, ProvenanceMetadata } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Key, AlertCircle, Info } from "lucide-react";

export interface ProvenanceBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  type: ProvenanceType;
  source?: string;
  effectiveDate?: string;
  confidenceScore?: number;
  dataset_version?: string;
  compact?: boolean;
  showTooltip?: boolean;
}

const config: Record<
  ProvenanceType,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultDescription: string;
  }
> = {
  LIVE: {
    label: "LIVE",
    bgClass: "bg-green-dim",
    textClass: "text-green",
    borderClass: "border-green/30",
    icon: CheckCircle2,
    defaultDescription: "Direct government API (CBIC / DGFT) verified dataset.",
  },
  ILLUSTRATIVE: {
    label: "ILLUSTRATIVE",
    bgClass: "bg-amber-dim",
    textClass: "text-amber",
    borderClass: "border-amber/30",
    icon: AlertTriangle,
    defaultDescription: "Indicative industry benchmark. Requires manual verification.",
  },
  BYOK: {
    label: "BYOK",
    bgClass: "bg-blue-dim",
    textClass: "text-blue",
    borderClass: "border-blue/30",
    icon: Key,
    defaultDescription: "Custom Bring-Your-Own-Key provider integration.",
  },
  UNAVAILABLE: {
    label: "UNAVAILABLE",
    bgClass: "bg-red-dim",
    textClass: "text-red",
    borderClass: "border-red/30",
    icon: AlertCircle,
    defaultDescription: "Data source temporarily degraded or unmapped.",
  },
};

export function ProvenanceBadge({
  type,
  source,
  effectiveDate,
  confidenceScore,
  dataset_version,
  compact = false,
  showTooltip = true,
  className,
  ...props
}: ProvenanceBadgeProps) {
  const current = config[type] || config.ILLUSTRATIVE;
  const IconComponent = current.icon;

  const tooltipText = [
    `${current.label} PROVENANCE: ${current.defaultDescription}`,
    source ? `Source: ${source}` : null,
    dataset_version ? `Version: ${dataset_version}` : null,
    effectiveDate ? `Effective: ${effectiveDate}` : null,
    confidenceScore !== undefined ? `Confidence: ${(confidenceScore * 100).toFixed(0)}%` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div
      role="status"
      aria-label={`Data provenance: ${current.label}. ${tooltipText}`}
      title={showTooltip ? tooltipText : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono font-medium rounded-full border transition-all select-none",
        current.bgClass,
        current.textClass,
        current.borderClass,
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
      {...props}
    >
      <IconComponent className={compact ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
      <span className="tracking-wide font-semibold">{current.label}</span>
      {source && !compact && (
        <span className="opacity-75 text-[11px] font-sans font-normal border-l border-current/20 pl-1.5">
          {source}
        </span>
      )}
      {dataset_version && !compact && !source && (
        <span className="opacity-75 text-[10px] font-mono border-l border-current/20 pl-1.5">
          {dataset_version}
        </span>
      )}
      {confidenceScore !== undefined && !compact && (
        <span className="opacity-90 font-mono text-[10px] bg-white/40 px-1 rounded">
          {(confidenceScore * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
}

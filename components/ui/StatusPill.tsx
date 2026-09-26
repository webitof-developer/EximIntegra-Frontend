import React from "react";
import { cn } from "@/lib/utils";

export type StatusPillVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "muted";

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  variant?: StatusPillVariant;
  size?: "xs" | "sm" | "md";
  dot?: boolean;
}

const variantClasses: Record<StatusPillVariant, { pill: string; dot: string }> = {
  primary: {
    pill: "bg-blue-dim text-blue border border-blue/20",
    dot: "bg-blue",
  },
  success: {
    pill: "bg-green-dim text-green border border-green/20",
    dot: "bg-green",
  },
  warning: {
    pill: "bg-amber-dim text-amber border border-amber/20",
    dot: "bg-amber",
  },
  danger: {
    pill: "bg-red-dim text-red border border-red/20",
    dot: "bg-red",
  },
  neutral: {
    pill: "bg-[#EEF2F6] text-ink border border-line",
    dot: "bg-muted",
  },
  muted: {
    pill: "bg-line/60 text-muted border border-line",
    dot: "bg-muted",
  },
};

const sizeClasses = {
  xs: "px-1.5 py-0.5 text-[10px] tracking-wide",
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export function StatusPill({
  label,
  variant = "neutral",
  size = "xs",
  dot = false,
  className,
  ...props
}: StatusPillProps) {
  const styles = variantClasses[variant];

  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full uppercase font-mono select-none",
        styles.pill,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", styles.dot)}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
}

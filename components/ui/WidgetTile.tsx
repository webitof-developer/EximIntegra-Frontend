import React from "react";
import { cn } from "@/lib/utils";
import { IconTile, IconTileVariant } from "./IconTile";
import { ArrowUpRight } from "lucide-react";

export interface WidgetTileProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  glyph?: string;
  icon?: React.ReactNode;
  iconVariant?: IconTileVariant;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export function WidgetTile({
  title,
  description,
  metric,
  metricLabel,
  glyph,
  icon,
  iconVariant = "blue",
  badge,
  disabled = false,
  className,
  ...props
}: WidgetTileProps) {
  return (
    <a
      aria-disabled={disabled}
      className={cn(
        "group relative flex flex-col justify-between p-5 bg-panel border border-line rounded-xl transition-all duration-200 select-none",
        disabled
          ? "opacity-60 cursor-not-allowed bg-[#FAFBFD]"
          : "hover:border-blue/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        <IconTile
          glyph={glyph}
          icon={icon}
          variant={iconVariant}
          size="md"
          className="transition-transform duration-200 group-hover:scale-105"
        />
        <div className="flex items-center gap-2">
          {badge}
          {!disabled && (
            <div className="w-6 h-6 rounded-full bg-bg flex items-center justify-center text-muted group-hover:text-blue group-hover:bg-blue-dim transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-ink group-hover:text-blue transition-colors flex items-center gap-1.5">
          {title}
        </h4>
        <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {metric && (
        <div className="mt-4 pt-3 border-t border-line/60 flex items-baseline justify-between">
          <span className="text-[11px] text-muted">{metricLabel || "Total"}</span>
          <span className="font-mono text-xs font-semibold text-ink">
            {metric}
          </span>
        </div>
      )}
    </a>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export type IconTileVariant =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "navy"
  | "neutral";

export interface IconTileProps extends React.HTMLAttributes<HTMLDivElement> {
  glyph?: string;
  icon?: React.ReactNode;
  variant?: IconTileVariant;
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<IconTileVariant, string> = {
  blue: "bg-blue-dim text-blue border border-blue/20",
  green: "bg-green-dim text-green border border-green/20",
  amber: "bg-amber-dim text-amber border border-amber/20",
  red: "bg-red-dim text-red border border-red/20",
  navy: "bg-[#1E2E4E] text-[#93C5FD] border border-[#2B406B]",
  neutral: "bg-[#EEF2F6] text-ink border border-line",
};

const sizeStyles = {
  sm: "w-8 h-8 rounded-md text-xs font-semibold",
  md: "w-10 h-10 rounded-lg text-sm font-bold",
  lg: "w-12 h-12 rounded-xl text-base font-bold",
};

export function IconTile({
  glyph,
  icon,
  variant = "blue",
  size = "md",
  className,
  ...props
}: IconTileProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 select-none shadow-xs font-mono",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon ? (
        <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
          {icon}
        </span>
      ) : (
        <span>{glyph || "—"}</span>
      )}
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export function Card({
  title,
  subtitle,
  badge,
  action,
  footer,
  noPadding = false,
  className,
  children,
  ...props
}: CardProps) {
  const hasHeader = Boolean(title || subtitle || action || badge);

  return (
    <div
      className={cn(
        "bg-panel border border-line rounded-xl shadow-xs transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-start justify-between px-[26px] pt-[26px] pb-4 border-b border-line/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              {typeof title === "string" ? (
                <h3 className="text-base font-semibold text-ink leading-tight">
                  {title}
                </h3>
              ) : (
                title
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-muted leading-relaxed">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className={cn(noPadding ? "" : "p-[26px]")}>{children}</div>

      {footer && (
        <div className="px-[26px] py-4 bg-bg/50 border-t border-line rounded-b-xl flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type StepState = "pending" | "current" | "completed";

export interface StepBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  label?: string;
  description?: string;
  state?: StepState;
  isLast?: boolean;
}

export function StepBadge({
  step,
  label,
  description,
  state = "pending",
  isLast = false,
  className,
  ...props
}: StepBadgeProps) {
  const isCompleted = state === "completed";
  const isCurrent = state === "current";

  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shrink-0 select-none",
            isCompleted && "bg-green text-white shadow-xs",
            isCurrent && "bg-blue text-white ring-4 ring-blue-dim shadow-xs",
            state === "pending" && "bg-panel text-muted border border-line"
          )}
          aria-current={isCurrent ? "step" : undefined}
        >
          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step}
        </div>
        {label && (
          <div className="flex flex-col">
            <span
              className={cn(
                "text-xs font-medium leading-none",
                isCurrent ? "text-ink font-semibold" : "text-muted",
                isCompleted && "text-ink font-semibold"
              )}
            >
              {label}
            </span>
            {description && (
              <span className="text-[10px] text-muted mt-0.5 leading-none">
                {description}
              </span>
            )}
          </div>
        )}
      </div>

      {!isLast && (
        <div
          className={cn(
            "h-[1.5px] w-8 transition-colors",
            isCompleted ? "bg-green" : "bg-line"
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

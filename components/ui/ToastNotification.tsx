"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastNotificationProps {
  message: React.ReactNode;
  variant?: ToastVariant;
  isOpen?: boolean;
  onClose: () => void;
  duration?: number; // Auto close duration in ms (default: 4500, 0 to disable)
  title?: string;
  className?: string;
}

const variantConfig: Record<
  ToastVariant,
  {
    badgeGradient: string;
    badgeShadow: string;
    badgeRing: string;
    progressBar: string;
    glowBg: string;
    IconComponent: React.ComponentType<{ className?: string }>;
  }
> = {
  success: {
    badgeGradient: "from-emerald-500 to-teal-600 text-white",
    badgeShadow: "shadow-emerald-500/25",
    badgeRing: "ring-emerald-500/15",
    progressBar: "bg-emerald-500",
    glowBg: "bg-emerald-500/10",
    IconComponent: Check,
  },
  error: {
    badgeGradient: "from-rose-500 to-red-600 text-white",
    badgeShadow: "shadow-red-500/25",
    badgeRing: "ring-rose-500/15",
    progressBar: "bg-red-500",
    glowBg: "bg-red-500/10",
    IconComponent: AlertCircle,
  },
  warning: {
    badgeGradient: "from-amber-500 to-orange-500 text-white",
    badgeShadow: "shadow-amber-500/25",
    badgeRing: "ring-amber-500/15",
    progressBar: "bg-amber-500",
    glowBg: "bg-amber-500/10",
    IconComponent: AlertTriangle,
  },
  info: {
    badgeGradient: "from-blue-600 to-indigo-600 text-white",
    badgeShadow: "shadow-blue-500/25",
    badgeRing: "ring-blue-500/15",
    progressBar: "bg-blue-600",
    glowBg: "bg-blue-500/10",
    IconComponent: Info,
  },
};

export function ToastNotification({
  message,
  variant = "success",
  isOpen = true,
  onClose,
  duration = 4500,
  title,
  className = "",
}: ToastNotificationProps) {
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef<number>(duration);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer management with pause/resume support on hover
  useEffect(() => {
    if (!isOpen || duration <= 0) return;

    remainingTimeRef.current = duration;
    startTimeRef.current = Date.now();

    const startTimer = () => {
      timerRef.current = setTimeout(() => {
        onClose();
      }, remainingTimeRef.current);
    };

    startTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, duration, onClose]);

  const handleMouseEnter = () => {
    if (duration <= 0) return;
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    if (duration <= 0 || remainingTimeRef.current <= 0) return;
    setIsPaused(false);
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onClose();
    }, remainingTimeRef.current);
  };

  if (!isOpen || !message || !mounted) {
    return null;
  }

  const config = variantConfig[variant] || variantConfig.success;
  const IconComponent = config.IconComponent;

  const content = (
    <>
      <style>{`
        @keyframes toast-progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div
        role="alert"
        aria-live="assertive"
        className="fixed bottom-6 right-6 z-[9999] pointer-events-none flex flex-col items-end max-w-sm sm:max-w-md w-full px-4 sm:px-0"
      >
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`pointer-events-auto w-full relative overflow-hidden bg-panel/95 backdrop-blur-xl border border-line/80 rounded-2xl shadow-[0_20px_45px_-10px_rgba(15,27,51,0.14),0_2px_6px_rgba(15,27,51,0.04)] p-4 flex items-start gap-3.5 transition-all duration-200 ease-out animate-in fade-in slide-in-from-bottom-4 zoom-in-95 hover:border-line-dark/80 group ${className}`}
        >
          {/* Subtle atmospheric glow in top-left */}
          <div
            className={`absolute -top-10 -left-10 w-28 h-28 rounded-full blur-2xl pointer-events-none ${config.glowBg}`}
            aria-hidden="true"
          />

          {/* Micro Badge Icon */}
          <div
            className={`w-7 h-7 rounded-full bg-gradient-to-br ${config.badgeGradient} shadow-md ${config.badgeShadow} ring-4 ${config.badgeRing} flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105`}
          >
            <IconComponent className="w-3.5 h-3.5 stroke-[2.75]" />
          </div>

          {/* Text Message Content */}
          <div className="flex-1 min-w-0 pr-1 space-y-0.5">
            {title ? (
              <>
                <h4 className="font-bold text-ink text-xs leading-tight tracking-tight">
                  {title}
                </h4>
                <div className="text-muted text-xs leading-relaxed break-words font-medium">
                  {message}
                </div>
              </>
            ) : (
              <div className="text-ink text-xs leading-snug break-words font-semibold pt-0.5">
                {message}
              </div>
            )}
          </div>

          {/* Sleek Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification"
            title="Close notification"
            className="w-6 h-6 rounded-full flex items-center justify-center text-muted/70 hover:text-ink hover:bg-line/60 transition-all cursor-pointer shrink-0 -mr-1 -mt-0.5 active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Hairline Auto-Dismiss Progress Bar */}
          {duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-line/30 overflow-hidden">
              <div
                className={`h-full ${config.progressBar} opacity-85`}
                style={{
                  animation: `toast-progress-shrink ${duration}ms linear forwards`,
                  animationPlayState: isPaused ? "paused" : "running",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}

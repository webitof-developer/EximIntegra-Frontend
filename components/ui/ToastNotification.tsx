"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastNotificationProps {
  message: React.ReactNode;
  variant?: ToastVariant;
  isOpen?: boolean;
  onClose: () => void;
  duration?: number; // Auto close duration in ms (default: 4000, 0 to disable)
  title?: string;
  className?: string;
}

const variantStyles: Record<
  ToastVariant,
  {
    border: string;
    iconBg: string;
    iconColor: string;
    IconComponent: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }
> = {
  success: {
    border: "border-green/30 hover:border-green/50",
    iconBg: "bg-green-dim text-green border-green/20",
    iconColor: "text-green",
    IconComponent: CheckCircle2,
    accentColor: "bg-green",
  },
  error: {
    border: "border-red/30 hover:border-red/50",
    iconBg: "bg-red-dim text-red border-red/20",
    iconColor: "text-red",
    IconComponent: AlertCircle,
    accentColor: "bg-red",
  },
  warning: {
    border: "border-amber/30 hover:border-amber/50",
    iconBg: "bg-amber-dim text-amber-dark border-amber/20",
    iconColor: "text-amber-dark",
    IconComponent: AlertTriangle,
    accentColor: "bg-amber",
  },
  info: {
    border: "border-blue/30 hover:border-blue/50",
    iconBg: "bg-blue-dim text-blue border-blue/20",
    iconColor: "text-blue",
    IconComponent: Info,
    accentColor: "bg-blue",
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !duration || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen || !message || !mounted) {
    return null;
  }

  const { border, iconBg, IconComponent, accentColor } =
    variantStyles[variant] || variantStyles.success;

  const content = (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-[9999] pointer-events-none flex flex-col items-end max-w-sm sm:max-w-md w-full px-4 sm:px-0"
    >
      <div
        className={`pointer-events-auto w-full relative overflow-hidden bg-panel/95 backdrop-blur-md border ${border} rounded-2xl shadow-2xl shadow-navy/15 p-4 flex items-start gap-3.5 text-xs transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5 ${className}`}
      >
        {/* Subtle accent indicator bar on the left edge */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`}
          aria-hidden="true"
        />

        {/* Icon */}
        <div
          className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}
        >
          <IconComponent className="w-4 h-4" />
        </div>

        {/* Message body */}
        <div className="flex-1 min-w-0 pr-1 space-y-0.5">
          {title && (
            <h4 className="font-semibold text-ink text-xs leading-tight">
              {title}
            </h4>
          )}
          <div className="text-ink text-xs font-medium leading-relaxed break-words">
            {message}
          </div>
        </div>

        {/* Cross / Close icon button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          title="Close notification"
          className="p-1 rounded-lg text-muted hover:text-ink hover:bg-line/60 transition-colors cursor-pointer shrink-0 -mr-1 -mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

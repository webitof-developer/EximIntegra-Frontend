"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Scale,
  TrendingDown,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Sparkles,
  X,
} from "lucide-react";

export interface NotificationItem {
  id: string;
  type: "statutory" | "arbitrage" | "batch" | "security";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
  linkText?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "statutory",
    title: "CBIC Gazette Notif 22/2026 Issued",
    message:
      "Concessional BCD duty rates updated for HS 7204.49 scrap metals under India-UAE CEPA.",
    time: "10m ago",
    read: false,
    link: "/duty",
    linkText: "View Tariff Impact",
  },
  {
    id: "notif-2",
    type: "arbitrage",
    title: "Sourcing Arbitrage Alert",
    message:
      "Vietnam origin offers 2.50% landed cost savings over standard MFN corridor for Lithium Cells.",
    time: "1h ago",
    read: false,
    link: "/compare",
    linkText: "Compare Origins",
  },
  {
    id: "notif-3",
    type: "batch",
    title: "Bulk HS Classification Complete",
    message:
      "Batch job #job_9021 (45 line items) processed with 98.2% GIR sequential confidence.",
    time: "3h ago",
    read: false,
    link: "/reports",
    linkText: "Inspect Audit Log",
  },
  {
    id: "notif-4",
    type: "security",
    title: "Production API Key Expiry Warning",
    message:
      "Gateway Token 'GW_Live_Prod_902' key rotation is recommended within 7 days.",
    time: "Yesterday",
    read: true,
    link: "/settings",
    linkText: "Manage BYOK Keys",
  },
];

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "statutory":
        return <Scale className="w-4 h-4 text-blue" />;
      case "arbitrage":
        return <TrendingDown className="w-4 h-4 text-green" />;
      case "batch":
        return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
      case "security":
        return <ShieldAlert className="w-4 h-4 text-amber" />;
    }
  };

  const getIconBg = (type: NotificationItem["type"]) => {
    switch (type) {
      case "statutory":
        return "bg-blue-dim border-blue/20";
      case "arbitrage":
        return "bg-green-dim border-green/20";
      case "batch":
        return "bg-indigo-50 border-indigo-200/60";
      case "security":
        return "bg-amber-dim border-amber/20";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors relative cursor-pointer shrink-0 ${
          isOpen
            ? "bg-bg text-ink border-blue/40 ring-2 ring-blue/20"
            : "border-line text-muted hover:text-ink hover:bg-bg"
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-panel border border-line shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 px-4 bg-bg/60 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-ink tracking-tight">
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue text-white">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-bg text-muted border border-line">
                  All caught up
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-blue hover:text-blue-dark flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[380px] divide-y divide-line/60">
            {notifications.length === 0 ? (
              <div className="py-12 px-6 text-center text-muted space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-bg border border-line flex items-center justify-center mx-auto text-muted">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <div className="text-xs font-semibold text-ink">
                  No notifications
                </div>
                <p className="text-[11px] text-muted max-w-xs mx-auto">
                  You are all caught up with statutory rate gazettes and trade compliance alerts.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 px-4 flex items-start gap-3 transition-colors cursor-pointer group ${
                    n.read
                      ? "hover:bg-bg/40 opacity-80"
                      : "bg-blue-dim/20 hover:bg-blue-dim/35"
                  }`}
                >
                  {/* Icon Tile */}
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(
                      n.type
                    )}`}
                  >
                    {getIcon(n.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs tracking-tight truncate ${
                          n.read ? "font-medium text-ink" : "font-bold text-ink"
                        }`}
                      >
                        {n.title}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-muted font-mono">
                          {n.time}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue" />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
                      {n.message}
                    </p>

                    {/* Action link & delete button */}
                    <div className="flex items-center justify-between pt-1">
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue hover:text-blue-dark transition-colors"
                        >
                          <span>{n.linkText || "View Details"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <div />
                      )}

                      <button
                        type="button"
                        onClick={(e) => deleteNotification(n.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-red transition-all cursor-pointer rounded"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 px-4 bg-bg/50 border-t border-line flex items-center justify-between text-[11px]">
            <span className="text-muted font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green" />
              <span>Live Statutory Sync</span>
            </span>
            <Link
              href="/reports"
              onClick={() => setIsOpen(false)}
              className="font-medium text-blue hover:underline"
            >
              Calculation Audit Trail &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

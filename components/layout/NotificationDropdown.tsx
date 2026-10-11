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
  Calculator,
  Ship,
  Search,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { NotificationItem } from "@/lib/types";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from "@/store/notificationsApi";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // RTK Query hooks
  const { data, isLoading, isFetching } = useGetNotificationsQuery(
    { limit: 20 },
    { pollingInterval: 30000 } // Auto-poll every 30s for live alerts
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count ?? notifications.filter((n) => !n.read).length;

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

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch (e) {
      console.error("Failed to mark all notifications read", e);
    }
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      try {
        await markRead(notif.id).unwrap();
      } catch (e) {
        console.error("Failed to mark notification read", e);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotif(id).unwrap();
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  const getIcon = (item: NotificationItem) => {
    if (item.module === "duty" || item.type === "calculation") {
      return <Calculator className="w-4 h-4 text-blue" />;
    }
    if (item.module === "landed_cost") {
      return <Ship className="w-4 h-4 text-blue" />;
    }
    if (item.module === "compare" || item.type === "arbitrage") {
      return <TrendingDown className="w-4 h-4 text-green" />;
    }
    if (item.module === "bulk" || item.type === "batch") {
      return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
    }
    if (item.module === "classification") {
      return <Search className="w-4 h-4 text-sky-500" />;
    }
    if (item.module === "security" || item.module === "settings" || item.type === "security") {
      return <ShieldAlert className="w-4 h-4 text-amber" />;
    }
    if (item.module === "statutory" || item.type === "statutory") {
      return <Scale className="w-4 h-4 text-blue" />;
    }
    return <Sparkles className="w-4 h-4 text-blue" />;
  };

  const getIconBg = (item: NotificationItem) => {
    if (item.module === "compare" || item.type === "arbitrage") {
      return "bg-green-dim border-green/20";
    }
    if (item.module === "bulk" || item.type === "batch") {
      return "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/40";
    }
    if (item.module === "security" || item.module === "settings" || item.type === "security") {
      return "bg-amber-dim border-amber/20";
    }
    return "bg-blue-dim border-blue/20";
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
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4.5 h-4.5 rounded-full bg-blue text-white text-[10px] font-bold font-mono flex items-center justify-center ring-2 ring-panel shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
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
              {isFetching && (
                <RefreshCw className="w-3 h-3 text-muted animate-spin" />
              )}
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  disabled={isMarkingAll}
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-medium text-blue hover:text-blue-dark flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-semibold text-muted hover:text-blue transition-colors"
              >
                Open page
              </Link>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[380px] divide-y divide-line/60">
            {isLoading && notifications.length === 0 ? (
              <div className="py-12 px-6 text-center text-muted space-y-2">
                <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs font-semibold text-ink">
                  Syncing notifications...
                </div>
              </div>
            ) : notifications.length === 0 ? (
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
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 px-4 flex items-start gap-3 transition-colors cursor-pointer group ${
                    n.read
                      ? "hover:bg-bg/40 opacity-80"
                      : "bg-blue-dim/20 hover:bg-blue-dim/35"
                  }`}
                >
                  {/* Icon Tile */}
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(
                      n
                    )}`}
                  >
                    {getIcon(n)}
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
                          onClick={() => {
                            handleItemClick(n);
                            setIsOpen(false);
                          }}
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
                        onClick={(e) => handleDelete(n.id, e)}
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
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="font-medium text-blue hover:underline flex items-center gap-1"
            >
              <span>View All Notifications</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

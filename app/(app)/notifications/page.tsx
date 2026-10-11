"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Scale,
  TrendingDown,
  CheckCircle2,
  ShieldAlert,
  Calculator,
  Ship,
  Search,
  CheckCheck,
  Check,
  Trash2,
  ExternalLink,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { NotificationItem } from "@/lib/types";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} from "@/store/notificationsApi";

type CategoryFilter = "all" | "statutory" | "duty" | "compare" | "bulk" | "security";

function NotificationsContent() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery(
    { limit: 100 },
    { pollingInterval: 30000 }
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();
  const [clearAll, { isLoading: isClearingAll }] = useClearAllNotificationsMutation();

  const allNotifications = data?.notifications || [];
  const unreadCount = data?.unread_count ?? allNotifications.filter((n) => !n.read).length;

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((n) => {
      // Category filter
      if (activeCategory !== "all") {
        if (activeCategory === "statutory" && n.module !== "statutory" && n.type !== "statutory") return false;
        if (activeCategory === "duty" && n.module !== "duty" && n.module !== "landed_cost" && n.type !== "calculation") return false;
        if (activeCategory === "compare" && n.module !== "compare" && n.type !== "arbitrage") return false;
        if (activeCategory === "bulk" && n.module !== "bulk" && n.type !== "batch") return false;
        if (activeCategory === "security" && n.module !== "security" && n.module !== "settings" && n.type !== "security") return false;
      }

      // Unread only filter
      if (unreadOnly && n.read) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesMessage = n.message.toLowerCase().includes(q);
        const matchesModule = n.module.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMessage && !matchesModule) return false;
      }

      return true;
    });
  }, [allNotifications, activeCategory, unreadOnly, searchQuery]);

  // Metric aggregates
  const statutoryCount = allNotifications.filter((n) => n.module === "statutory" || n.type === "statutory").length;
  const arbitrageCount = allNotifications.filter((n) => n.module === "compare" || n.type === "arbitrage").length;
  const dutyCount = allNotifications.filter((n) => n.module === "duty" || n.type === "calculation").length;
  const securityCount = allNotifications.filter((n) => n.module === "security" || n.type === "security").length;

  const handleMarkAllRead = async () => {
    try {
      await markAllRead({ module: activeCategory === "all" ? undefined : activeCategory }).unwrap();
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to dismiss all notifications in this view?")) {
      try {
        await clearAll().unwrap();
      } catch (e) {
        console.error("Failed to clear notifications", e);
      }
    }
  };

  const getModuleBadge = (n: NotificationItem) => {
    if (n.module === "statutory" || n.type === "statutory") {
      return { label: "STATUTORY TARIFF", color: "bg-blue/10 text-blue border-blue/20" };
    }
    if (n.module === "compare" || n.type === "arbitrage") {
      return { label: "SOURCING ARBITRAGE", color: "bg-green/10 text-green border-green/20" };
    }
    if (n.module === "bulk" || n.type === "batch") {
      return { label: "BULK MANIFEST", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" };
    }
    if (n.module === "security" || n.type === "security") {
      return { label: "SECURITY AUDIT", color: "bg-amber/10 text-amber border-amber/20" };
    }
    if (n.module === "duty" || n.type === "calculation") {
      return { label: "DUTY CALCULATION", color: "bg-sky-500/10 text-sky-500 border-sky-500/20" };
    }
    return { label: "SYSTEM ALERT", color: "bg-panel text-muted border-line" };
  };

  const getIcon = (item: NotificationItem) => {
    if (item.module === "duty" || item.type === "calculation") {
      return <Calculator className="w-5 h-5 text-blue" />;
    }
    if (item.module === "landed_cost") {
      return <Ship className="w-5 h-5 text-blue" />;
    }
    if (item.module === "compare" || item.type === "arbitrage") {
      return <TrendingDown className="w-5 h-5 text-green" />;
    }
    if (item.module === "bulk" || item.type === "batch") {
      return <CheckCircle2 className="w-5 h-5 text-indigo-500" />;
    }
    if (item.module === "security" || item.type === "security") {
      return <ShieldAlert className="w-5 h-5 text-amber" />;
    }
    return <Scale className="w-5 h-5 text-blue" />;
  };

  const getIconBg = (item: NotificationItem) => {
    if (item.module === "compare" || item.type === "arbitrage") {
      return "bg-green-dim border-green/30 text-green";
    }
    if (item.module === "bulk" || item.type === "batch") {
      return "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-500";
    }
    if (item.module === "security" || item.type === "security") {
      return "bg-amber-dim border-amber/30 text-amber";
    }
    return "bg-blue-dim border-blue/30 text-blue";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-dim border border-blue/20 flex items-center justify-center text-blue">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Statutory Alerts & Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue text-white shadow-sm">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-muted mt-1.5 max-w-2xl">
            Live CBIC gazette rate updates, deterministic duty assessments, multi-country sourcing arbitrage opportunities, and security audit alerts.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-2 rounded-xl border border-line bg-panel hover:bg-bg text-muted hover:text-ink text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue" : ""}`} />
            <span>Sync</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              disabled={isMarkingAll}
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          )}

          {allNotifications.length > 0 && (
            <button
              type="button"
              disabled={isClearingAll}
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl border border-line bg-panel hover:bg-red-dim hover:border-red/30 hover:text-red text-muted text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Clear all alerts"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-panel border border-line shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium">Total Alerts</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">
            {allNotifications.length}
          </div>
          <p className="text-[11px] text-muted">Recorded platform events</p>
        </div>

        <div className="p-4 rounded-2xl bg-panel border border-line shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium">Unread Actionables</span>
            <Bell className="w-4 h-4 text-blue" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue">
            {unreadCount}
          </div>
          <p className="text-[11px] text-muted">Pending review</p>
        </div>

        <div className="p-4 rounded-2xl bg-panel border border-line shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium">CBIC & Tariffs</span>
            <Scale className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">
            {statutoryCount}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-green font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-green" />
            <span>Daily Sync Active</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-panel border border-line shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium">Arbitrage & Security</span>
            <TrendingDown className="w-4 h-4 text-green" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">
            {arbitrageCount + securityCount}
          </div>
          <p className="text-[11px] text-muted">{arbitrageCount} savings, {securityCount} audit</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-panel border border-line rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Alerts", count: allNotifications.length },
            { id: "statutory", label: "Statutory", count: statutoryCount },
            { id: "duty", label: "Calculations", count: dutyCount },
            { id: "compare", label: "Arbitrage", count: arbitrageCount },
            { id: "bulk", label: "Bulk Manifests", count: allNotifications.filter((n) => n.module === "bulk" || n.type === "batch").length },
            { id: "security", label: "Security & BYOK", count: securityCount },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as CategoryFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? "bg-ink text-panel shadow-sm font-semibold"
                  : "bg-bg text-muted hover:text-ink hover:bg-bg/80 border border-line"
              }`}
            >
              <span>{cat.label}</span>
              {cat.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeCategory === cat.id ? "bg-panel/20 text-panel" : "bg-panel text-muted"
                }`}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Unread Toggle */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-bg border border-line text-ink text-xs placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue"
            />
          </div>

          {/* Unread Toggle */}
          <button
            type="button"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              unreadOnly
                ? "bg-blue-dim border-blue/40 text-blue font-semibold ring-1 ring-blue/20"
                : "border-line bg-bg text-muted hover:text-ink"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${unreadOnly ? "bg-blue" : "bg-muted"}`} />
            <span>Unread Only</span>
          </button>
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {isLoading && allNotifications.length === 0 ? (
          <div className="p-16 text-center bg-panel border border-line rounded-2xl space-y-3">
            <div className="w-8 h-8 border-2 border-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-semibold text-ink">
              Loading platform notifications...
            </div>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Connecting to live database and synchronizing statutory compliance gazettes.
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center bg-panel border border-line rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-bg border border-line flex items-center justify-center mx-auto text-muted">
              <Bell className="w-6 h-6 opacity-40" />
            </div>
            <div className="text-sm font-semibold text-ink">
              No notifications found
            </div>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {searchQuery || unreadOnly || activeCategory !== "all"
                ? "No alerts match your current filter criteria. Try resetting your search or filters."
                : "All caught up! You will be notified as soon as new CBIC gazettes or calculations are processed."}
            </p>
            {(searchQuery || unreadOnly || activeCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setUnreadOnly(false);
                  setActiveCategory("all");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-bg border border-line text-xs font-medium text-ink hover:bg-panel transition-colors cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const badge = getModuleBadge(n);
            return (
              <div
                key={n.id}
                className={`p-4 md:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start gap-4 group ${
                  n.read
                    ? "bg-panel border-line opacity-90 hover:opacity-100"
                    : "bg-blue-dim/15 border-blue/30 shadow-sm"
                }`}
              >
                {/* Icon Tile */}
                <div
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${getIconBg(
                    n
                  )}`}
                >
                  {getIcon(n)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border tracking-wide ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <h3
                        className={`text-sm tracking-tight ${
                          n.read ? "font-semibold text-ink" : "font-bold text-ink"
                        }`}
                      >
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-muted text-xs font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{n.time}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted leading-relaxed max-w-3xl">
                    {n.message}
                  </p>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => {
                            if (!n.read) markRead(n.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue hover:text-blue-dark transition-colors"
                        >
                          <span>{n.linkText || "View Module"}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      <span className="text-[11px] text-muted font-mono">
                        {new Date(n.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Quick item actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          n.read
                            ? "text-muted hover:text-ink hover:bg-bg"
                            : "bg-blue/10 text-blue hover:bg-blue/20"
                        }`}
                        title={n.read ? "Already read" : "Mark as read"}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{n.read ? "Read" : "Mark read"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteNotif(n.id)}
                        className="p-1.5 text-muted hover:text-red hover:bg-red-dim rounded-lg transition-colors cursor-pointer"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <NotificationsContent />
      </AppShell>
    </AuthGuard>
  );
}


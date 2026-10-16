"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  History,
  X,
  Plus,
  Trash2,
  MessageSquare,
  Search,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  useGetConversationsQuery,
  useLazyGetConversationQuery,
  useDeleteConversationMutation,
  useClearAllConversationsMutation,
  AksharaConversationSummary,
  AksharaConversationDetail,
} from "@/store/aksharaApi";

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId: string;
  onSelectConversation: (detail: AksharaConversationDetail) => void;
  onNewChat: () => void;
}

interface DateGroupedSessions {
  label: string;
  sessions: AksharaConversationSummary[];
}

function groupConversationsByDate(sessions: AksharaConversationSummary[]): DateGroupedSessions[] {
  const now = new Date();
  const todayStr = now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todaySessions: AksharaConversationSummary[] = [];
  const yesterdaySessions: AksharaConversationSummary[] = [];
  const pastWeekSessions: AksharaConversationSummary[] = [];
  const pastMonthSessions: AksharaConversationSummary[] = [];
  const olderSessions: AksharaConversationSummary[] = [];

  sessions.forEach((s) => {
    const d = new Date(s.updatedAt || s.createdAt || Date.now());
    if (d.toDateString() === todayStr) {
      todaySessions.push(s);
    } else if (d.toDateString() === yesterdayStr) {
      yesterdaySessions.push(s);
    } else if (d > sevenDaysAgo) {
      pastWeekSessions.push(s);
    } else if (d > thirtyDaysAgo) {
      pastMonthSessions.push(s);
    } else {
      olderSessions.push(s);
    }
  });

  const result: DateGroupedSessions[] = [];
  if (todaySessions.length > 0) result.push({ label: "Today", sessions: todaySessions });
  if (yesterdaySessions.length > 0) result.push({ label: "Yesterday", sessions: yesterdaySessions });
  if (pastWeekSessions.length > 0) result.push({ label: "Previous 7 Days", sessions: pastWeekSessions });
  if (pastMonthSessions.length > 0) result.push({ label: "Previous 30 Days", sessions: pastMonthSessions });
  if (olderSessions.length > 0) result.push({ label: "Older Consultations", sessions: olderSessions });

  return result;
}

function formatSessionTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function ChatHistoryDrawer({
  isOpen,
  onClose,
  activeConversationId,
  onSelectConversation,
  onNewChat,
}: ChatHistoryDrawerProps) {
  const {
    data: dbSessions,
    isLoading,
    isFetching,
    refetch,
  } = useGetConversationsQuery(undefined, { skip: !isOpen });

  const [fetchConversationDetail, { isLoading: isLoadingDetail }] = useLazyGetConversationQuery();
  const [deleteConversation, { isLoading: isDeleting }] = useDeleteConversationMutation();
  const [clearAllConversations, { isLoading: isClearing }] = useClearAllConversationsMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset confirmation state when closing
  useEffect(() => {
    if (!isOpen) {
      setConfirmClear(false);
      setDeletingId(null);
      setLoadingSessionId(null);
    }
  }, [isOpen]);

  const sessions = useMemo(() => {
    return Array.isArray(dbSessions) ? dbSessions : [];
  }, [dbSessions]);

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) => {
      const matchTitle = (s.title || "").toLowerCase().includes(q);
      const matchContext =
        (s.activeContext?.hsCode || "").toLowerCase().includes(q) ||
        (s.activeContext?.materialName || "").toLowerCase().includes(q);
      const matchSnippet = (s.lastMessageSnippet || "").toLowerCase().includes(q);
      return matchTitle || matchContext || matchSnippet;
    });
  }, [sessions, searchQuery]);

  // Group by date
  const grouped = useMemo(() => groupConversationsByDate(filteredSessions), [filteredSessions]);

  const handleSelect = async (session: AksharaConversationSummary) => {
    try {
      setLoadingSessionId(session.id);
      const detail = await fetchConversationDetail(session.id).unwrap();
      onSelectConversation(detail);
      onClose();
    } catch (err) {
      console.error("Failed to load conversation details", err);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteConversation(id).unwrap();
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllConversations().unwrap();
      setConfirmClear(false);
      onNewChat();
    } catch (err) {
      console.error("Failed to clear conversations", err);
    }
  };

  return (
    <>
      {/* Backdrop with fade-in / fade-out animation */}
      <div
        className={`fixed inset-0 bg-navy/60 backdrop-blur-xs z-50 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer with slide-in / slide-out animation */}
      <div
        role="dialog"
        aria-label="Consultation History"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-panel border-l border-line z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-line flex items-center justify-between gap-3 bg-panel/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-dim text-blue flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-ink tracking-tight">Consultation History</h2>
                <span className="text-[10px] font-mono bg-bg text-muted px-2 py-0.5 rounded-full border border-line">
                  {sessions.length} {sessions.length === 1 ? "chat" : "chats"}
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Previous trade inquiries & statutory advisory sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => refetch()}
              className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer"
              title="Refresh history"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer"
              title="Close history (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Bar: New Chat & Search */}
        <div className="p-3.5 border-b border-line space-y-2.5 bg-bg/40">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>Start New Consultation</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search consultations by commodity or question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-panel border border-line text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-blue transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Sessions List Grouped Date-wise */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue mx-auto" />
              <p className="text-xs text-muted font-mono">Loading history...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-line/40 text-muted flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 opacity-40" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-ink">No Saved Consultations</p>
                <p className="text-[11px] text-muted max-w-xs mx-auto">
                  Your Akshara AI trade inquiries and advisory sessions will be organized here by date.
                </p>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted space-y-1">
              <p>No consultations matching &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-blue hover:underline text-[11px] cursor-pointer"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="space-y-2">
                {/* Date Group Heading */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-blue" />
                    {group.label}
                  </span>
                  <span className="text-[10px] font-mono text-muted/70">
                    {group.sessions.length}
                  </span>
                </div>

                {/* Session Cards */}
                <div className="space-y-1.5">
                  {group.sessions.map((s) => {
                    const isActive = s.id === activeConversationId;
                    const isCardLoading = loadingSessionId === s.id;
                    const previewText = s.title || "Customs Consultation";

                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelect(s)}
                        className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isActive
                            ? "bg-blue-dim/40 border-blue/40 shadow-xs"
                            : "bg-panel hover:bg-bg border-line hover:border-line/80"
                        } ${isCardLoading ? "opacity-60 pointer-events-none" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1 space-y-1">
                            {/* Title / Question */}
                            <p className="text-xs font-semibold text-ink line-clamp-2 leading-snug group-hover:text-blue transition-colors">
                              {previewText}
                            </p>

                            {/* Sub details: Context & Timestamp */}
                            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                              {s.activeContext?.hsCode && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-bg text-blue px-1.5 py-0.5 rounded border border-line">
                                  HS {s.activeContext.hsCode}
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {formatSessionTime(s.updatedAt || s.createdAt)}
                              </span>
                              <span className="text-[10px] font-mono text-muted/70">
                                &bull; {s.messageCount} {s.messageCount === 1 ? "msg" : "msgs"}
                              </span>
                            </div>
                          </div>

                          {/* Delete Action (visible on hover or when confirming) */}
                          <div className="shrink-0 flex items-center gap-1">
                            {isCardLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue" />
                            ) : deletingId === s.id ? (
                              <div
                                className="flex items-center gap-1 bg-red-dim border border-red/30 p-1 rounded-md"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(e, s.id)}
                                  disabled={isDeleting}
                                  className="text-[10px] font-bold text-red hover:underline px-1 cursor-pointer"
                                >
                                  Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(null)}
                                  className="text-[10px] text-muted hover:text-ink px-1 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingId(s.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted hover:text-red hover:bg-red/10 transition-all cursor-pointer"
                                title="Delete this consultation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {isActive && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue rounded-r-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {sessions.length > 0 && (
          <div className="p-3 border-t border-line bg-panel/90 backdrop-blur-md flex items-center justify-between text-xs">
            {confirmClear ? (
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[11px] text-red font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red" />
                  Clear all history?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isClearing}
                    className="px-2.5 py-1 rounded bg-red text-white text-[11px] font-semibold hover:bg-red/90 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isClearing ? "Clearing..." : "Confirm Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1 rounded border border-line text-muted text-[11px] hover:text-ink transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-[11px] font-mono text-muted">
                  {sessions.length} {sessions.length === 1 ? "session" : "sessions"} saved
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-[11px] font-mono text-muted hover:text-red transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

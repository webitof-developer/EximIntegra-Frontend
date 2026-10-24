"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, setUserTier } from "@/store/authSlice";
import { setMobileNavOpen, toggleSidebar } from "@/store/uiSlice";
import { TierBadge } from "@/components/saas/TierBadge";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserProfileModal } from "./UserProfileModal";
import {
  Sparkles,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Shield,
  CreditCard,
  Crown,
  Menu,
  PanelLeft,
} from "lucide-react";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/admin": {
    title: "Super Admin — Platform Metrics",
    description: "System overview, active users, tenant distribution, and database metrics.",
  },
  "/admin/users": {
    title: "Super Admin — User Directory & Roles",
    description: "Manage registered enterprise users, role assignments, and subscription tiers.",
  },
  "/admin/rbac": {
    title: "Super Admin — Role Permissions (RBAC)",
    description: "Granular access control policies, feature gating, and module permissions matrix.",
  },
  "/admin/tier-access": {
    title: "Super Admin — Tier Page Access & Gating",
    description: "Manage page-level and feature-level subscription tier access, plan gating rules, and upgrade templates.",
  },
  "/admin/pricing": {
    title: "Super Admin — Dynamic SaaS Pricing",
    description: "Configure tier definitions, feature quotas, regional currencies, and live plan limits.",
  },
  "/admin/llm": {
    title: "Super Admin — AI & LLM Providers",
    description: "Configure enterprise AI credentials, active models, and global Akshara copilot engine.",
  },
  "/admin/payments": {
    title: "Super Admin — Razorpay Gateway",
    description: "Configure Razorpay credentials, Webhooks, multi-currency (INR & USD) processing, and transactions.",
  },
  "/dashboard": {
    title: "Trade Advisory Cockpit",
    description: "Multi-jurisdiction trade compliance, tariff estimation, and AI intelligence overview.",
  },
  "/classify": {
    title: "HS Code Classification Engine",
    description: "Determine exact 6-to-8 digit HS classifications using General Rules of Interpretation (GIR).",
  },
  "/duty": {
    title: "Statutory Duty & Tariff Calculator",
    description: "Calculate assessable values, BCD, SWS, IGST, and trade agreement concessions with per-duty provenance.",
  },
  "/landed-cost": {
    title: "Landed Cost & Metal Recovery Engine",
    description: "End-to-end landed cost modeling with freight, port handling, inland transit, and recoverable metal economics.",
  },
  "/eligibility": {
    title: "Trade Scheme & FTA Eligibility",
    description: "Assess preferential duty eligibility under FTAs, Advance Authorization, RoDTEP, and EPCG.",
  },
  "/compare": {
    title: "Country-of-Origin Arbitrage",
    description: "Side-by-side comparative modeling across alternative sourcing jurisdictions.",
  },
  "/akshara": {
    title: "Akshara AI — Trade Copilot",
    description: "Grounded conversational intelligence with verifiable tool-call logs and citations.",
  },
  "/reports": {
    title: "Calculation History & Audit Trail",
    description: "Persisted reproducible calculations, dataset versions, and provenance audit reports.",
  },
  "/dev/components": {
    title: "UI Design System Showcase",
    description: "Isolated component library, design tokens, typography, and interactive state playground.",
  },
  "/settings": {
    title: "Settings & Integrations",
    description: "Configure contract rates, subscription, and team members.",
  },
  "/notifications": {
    title: "Statutory Alerts & Notifications",
    description: "Live gazette updates, calculation notifications, sourcing arbitrage opportunities, and security notices.",
  },
};

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const isAdminRoute = pathname?.startsWith("/admin");

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const matchedPath =
    Object.keys(pageMeta).find((path) => pathname === path || pathname.startsWith(path + "/")) ||
    "/dashboard";

  const meta = pageMeta[matchedPath] || {
    title: "EximIntegra Platform",
    description: "Enterprise trade compliance, HS classification, and duty calculation suite.",
  };

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    router.push("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "EI";

  return (
    <header className="sticky top-0 z-20 bg-panel/95 backdrop-blur-md border-b border-line px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Title, Menu/Sidebar Trigger & Description */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="sidebar-toggle-btn"
          type="button"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => {
            dispatch(toggleSidebar());
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              dispatch(setMobileNavOpen(true));
            }
          }}
          className="w-9 h-9 rounded-lg text-muted hover:text-ink border border-line bg-panel hover:bg-bg cursor-pointer transition-colors shadow-2xs shrink-0 flex items-center justify-center hover:border-blue/30"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4 text-ink" />
          ) : (
            <Menu className="w-4 h-4 text-ink" />
          )}
        </button>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-ink tracking-tight truncate">
              {meta.title}
            </h1>
            {/* <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-dim text-blue border border-blue/20 font-semibold shrink-0">
              ENTERPRISE v2026.03
            </span> */}
          </div>
          <p className="text-xs text-muted leading-relaxed max-w-xl truncate hidden md:block">
            {meta.description}
          </p>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Akshara Quick Launcher (Hidden on Admin Panel) */}
        {!isAdminRoute && (
          <Link
            href="/akshara"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue text-white text-xs font-semibold hover:bg-blue-dark transition-all shadow-xs shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Ask Akshara</span>
          </Link>
        )}

        {/* Notification Bell Dropdown (Hidden on Admin Panel) */}
        {!isAdminRoute && user?.role !== "ADMIN" && (
          <NotificationDropdown />
        )}

        {/* User Profile / Auth State */}
        {!mounted ? (
          <div className="w-8 h-8 rounded-full bg-navy/20 animate-pulse border border-line" />
        ) : isAuthenticated && user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 pl-2 border-l border-line hover:opacity-85 transition-opacity cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-navy text-[#93C5FD] font-semibold text-xs flex items-center justify-center font-mono border border-line shadow-xs">
                {initials}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-semibold text-ink leading-tight flex items-center gap-1.5">
                  <span>{user.name}</span>
                  {user.role === "ADMIN" ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                      ADMIN
                    </span>
                  ) : (
                    <TierBadge tier={user.tier || "STARTER"} size="xs" />
                  )}
                  <ChevronDown className="w-3 h-3 text-muted" />
                </span>
                <span className="text-[11px] text-muted leading-tight truncate max-w-[155px]">
                  {user.company}
                </span>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-panel border border-line shadow-xl p-2 z-50 space-y-1">
                <div className="p-3 border-b border-line bg-bg/50 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-ink">{user.name}</div>
                      <div className="text-[11px] text-muted truncate max-w-[155px]">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {user.role === "ADMIN" ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                          ADMIN
                        </span>
                      ) : (
                        <TierBadge tier={user.tier || "STARTER"} size="sm" />
                      )}
                      <button
                        type="button"
                        title="Update Profile Details"
                        aria-label="Update Profile Details"
                        onClick={() => {
                          setMenuOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="p-1 rounded-md text-muted hover:text-blue hover:bg-panel border border-transparent hover:border-line transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Profile Edit Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-ink hover:bg-bg rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-blue group-hover:scale-110 transition-transform" />
                    <span>My Profile</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted bg-panel border border-line px-1.5 py-0.5 rounded group-hover:text-ink">
                    Edit
                  </span>
                </button>
 
                {user.role !== "ADMIN" && (
                  <>
                    <Link
                      href="/pricing"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-ink hover:bg-bg rounded-lg transition-colors"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber" />
                      <span>Public Pricing & Plans</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-ink hover:bg-bg rounded-lg transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-muted" />
                      <span>Settings & Integrations</span>
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red hover:bg-red-dim rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-active transition-all"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>

      {/* User Profile Update Modal */}
      {isAuthenticated && user && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </header>
  );
}

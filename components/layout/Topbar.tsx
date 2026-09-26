"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/authSlice";
import {
  Sparkles,
  Bell,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Shield,
} from "lucide-react";
import { StatusPill } from "../ui/StatusPill";
import { ProvenanceBadge } from "../ui/ProvenanceBadge";

const pageMeta: Record<string, { title: string; description: string }> = {
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
    title: "Settings & BYOK Integration",
    description: "Configure custom Bring-Your-Own-Key provider credentials, company defaults, and compliance profiles.",
  },
};

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const currentContext = useAppSelector((state) => state.context.current);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-20 bg-panel/95 backdrop-blur-md border-b border-line px-8 py-3.5 flex items-center justify-between">
      {/* Title & One-line Description */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-ink tracking-tight">
            {meta.title}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-dim text-blue border border-blue/20">
            PHASE 1 ACTIVE
          </span>
        </div>
        <p className="text-xs text-muted leading-relaxed max-w-2xl">
          {meta.description}
        </p>
      </div>

      {/* Right Action & Context Bar */}
      <div className="flex items-center gap-4">
        {/* Active Material Context Pill */}
        {currentContext.hsCode && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg border border-line text-xs">
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider">
              Context:
            </span>
            <span className="font-mono font-bold text-ink">
              {currentContext.hsCode}
            </span>
            <span className="text-muted max-w-[140px] truncate text-[11px]">
              {currentContext.materialName || currentContext.hsDescription}
            </span>
            <ProvenanceBadge type="LIVE" compact />
          </div>
        )}

        {/* Akshara Quick Launcher */}
        <Link
          href="/akshara"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue text-white text-xs font-semibold hover:bg-blue-dark transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Akshara</span>
        </Link>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="View notifications"
          className="w-9 h-9 rounded-lg border border-line flex items-center justify-center text-muted hover:text-ink hover:bg-bg transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue ring-2 ring-white" />
        </button>

        {/* User Profile / Auth State */}
        {isAuthenticated && user ? (
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
                <span className="text-xs font-semibold text-ink leading-tight flex items-center gap-1">
                  {user.name}
                  <ChevronDown className="w-3 h-3 text-muted" />
                </span>
                <span className="text-[10px] text-muted font-mono leading-none truncate max-w-[130px]">
                  {user.company}
                </span>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-panel border border-line shadow-lg p-2 z-50 space-y-1">
                <div className="p-3 border-b border-line bg-bg/50 rounded-lg">
                  <div className="text-xs font-bold text-ink">{user.name}</div>
                  <div className="text-[11px] text-muted truncate">{user.email}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase bg-blue-dim text-blue px-1.5 py-0.5 rounded font-semibold">
                      {user.role}
                    </span>
                    <span className="text-[10px] font-mono text-green font-semibold">
                      {user.tier}
                    </span>
                  </div>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-ink hover:bg-bg rounded-lg transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-muted" />
                  <span>Security & BYOK Settings</span>
                </Link>

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
    </header>
  );
}

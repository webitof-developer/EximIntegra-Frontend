"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Calculator,
  Ship,
  FileCheck,
  Scale,
  Sparkles,
  TrendingUp,
  Building2,
  FileText,
  Clock,
  Settings,
  HelpCircle,
  ExternalLink,
  Layers,
  ChevronRight,
  ShieldAlert,
  X,
} from "lucide-react";
import { StatusPill } from "../ui/StatusPill";
import { TierBadge } from "@/components/saas/TierBadge";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMobileNavOpen } from "@/store/uiSlice";

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  glyph?: string;
  badge?: "SOON" | "LIVE" | "DEV" | "BETA";
  tierBadge?: "PRO" | "ENTERPRISE";
  disabled?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "TRADE ENGINE",
    items: [
      {
        id: "dashboard",
        title: "Overview",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
        glyph: "OV",
      },
      {
        id: "classify",
        title: "HS Classification",
        href: "/classify",
        icon: <Search className="w-4 h-4" />,
        glyph: "HS",
      },
      {
        id: "duty",
        title: "Duty Calculator",
        href: "/duty",
        icon: <Calculator className="w-4 h-4" />,
        glyph: "%",
      },
      {
        id: "landed-cost",
        title: "Landed Cost Engine",
        href: "/landed-cost",
        icon: <Ship className="w-4 h-4" />,
        glyph: "$",
      },
      {
        id: "eligibility",
        title: "Scheme Eligibility",
        href: "/eligibility",
        icon: <FileCheck className="w-4 h-4" />,
        glyph: "FTA",
      },
      {
        id: "compare",
        title: "Origin Comparison",
        href: "/compare",
        icon: <Scale className="w-4 h-4" />,
        glyph: "VS",
        tierBadge: "PRO",
      },
    ],
  },
  {
    title: "INTELLIGENCE & AI",
    items: [
      {
        id: "akshara",
        title: "Akshara AI Copilot",
        href: "/akshara",
        icon: <Sparkles className="w-4 h-4 text-[#93C5FD]" />,
        glyph: "AI",
        tierBadge: "ENTERPRISE",
      },
      {
        id: "market-intel",
        title: "Trade Flows (v2)",
        href: "/market-intel",
        icon: <TrendingUp className="w-4 h-4" />,
        badge: "SOON",
        disabled: true,
      },
      {
        id: "company-intel",
        title: "Counterparty Search",
        href: "/company-intel",
        icon: <Building2 className="w-4 h-4" />,
        badge: "SOON",
        disabled: true,
      },
      {
        id: "rulings",
        title: "Legal Precedents",
        href: "/rulings",
        icon: <FileText className="w-4 h-4" />,
        badge: "SOON",
        disabled: true,
      },
    ],
  },
  {
    title: "GOVERNANCE & AUDIT",
    items: [
      {
        id: "reports",
        title: "Calculation History",
        href: "/reports",
        icon: <Clock className="w-4 h-4" />,
        glyph: "HIST",
      },
      {
        id: "dev-components",
        title: "UI Design System",
        href: "/dev/components",
        icon: <Layers className="w-4 h-4 text-[#38BDF8]" />,
        glyph: "DEV",
        badge: "DEV",
      },
      {
        id: "settings",
        title: "API Keys & BYOK",
        href: "/settings",
        icon: <Settings className="w-4 h-4" />,
        glyph: "SET",
      },
    ],
  },
];

function SidebarInner({
  onClose,
  isMobile = false,
}: {
  onClose?: () => void;
  isMobile?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Brand Header */}
      <div className="flex flex-col">
        <div className="px-5 py-5 border-b border-[#1B2A4A] flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue flex items-center justify-center text-white font-mono font-bold text-sm tracking-wider shadow-sm group-hover:bg-blue-dark transition-colors">
              EI
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm tracking-tight leading-tight flex items-center gap-1.5">
                EXIMINTEGRA
              </span>
              <span className="text-[10px] text-[#8EA0C0] font-mono tracking-widest uppercase">
                Trade Advisory OS
              </span>
            </div>
          </Link>

          {isMobile && (
            <button
              type="button"
              aria-label="Close navigation drawer"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8EA0C0] hover:text-white hover:bg-navy-hover transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h5 className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#6B7E9F] font-semibold">
                {section.title}
              </h5>
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href) &&
                      item.href !== "/");

                  if (item.disabled) {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-[#52637F] cursor-not-allowed opacity-60"
                        title="Module coming in v2 scope"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[#52637F]">{item.icon}</span>
                          <span className="font-medium">{item.title}</span>
                        </div>
                        {item.badge && (
                          <StatusPill
                            label={item.badge}
                            variant="muted"
                            size="xs"
                            className="text-[9px] px-1.5 py-0 border-[#2A3955] text-[#7084A5]"
                          />
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group relative",
                        isActive
                          ? "bg-navy-active text-white font-semibold shadow-xs"
                          : "text-[#9EB1D0] hover:text-white hover:bg-navy-hover"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue rounded-r" />
                      )}

                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "transition-colors",
                            isActive
                              ? "text-blue"
                              : "text-[#7B8DAF] group-hover:text-white"
                          )}
                        >
                          {item.icon}
                        </span>
                        <span>{item.title}</span>
                      </div>

                      {item.tierBadge ? (
                        <TierBadge tier={item.tierBadge} size="xs" showIcon={false} />
                      ) : (
                        item.badge && (
                          <StatusPill
                            label={item.badge}
                            variant={
                              item.badge === "LIVE"
                                ? "success"
                                : item.badge === "DEV"
                                ? "primary"
                                : "warning"
                            }
                            size="xs"
                            className="text-[9px] px-1.5 py-0"
                          />
                        )
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pinned Bottom Panel: Verified Datasets / Reliability State */}
      <div className="p-3 border-t border-[#1B2A4A] bg-[#0B1426]">
        <div className="p-3 rounded-lg bg-[#142038] border border-[#1E2E4E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              CBIC Gateway
            </span>
            <span className="text-[9px] font-mono text-[#8EA0C0] bg-[#1C2C4C] px-1.5 py-0.5 rounded">
              v2026.3
            </span>
          </div>
          <p className="text-[10px] text-[#8EA0C0] leading-tight">
            Tariffs synchronized with Customs Tariff Act 2026 & DGFT notices.
          </p>
          <div className="pt-1 flex items-center justify-between border-t border-[#1E2E4E]/80">
            <Link
              href="/reports"
              onClick={onClose}
              className="text-[10px] text-blue hover:underline flex items-center gap-1"
            >
              Verify Provenance
              <ChevronRight className="w-2.5 h-2.5" />
            </Link>
            <span className="text-[10px] font-mono text-green">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const dispatch = useAppDispatch();
  const mobileNavOpen = useAppSelector((state) => state.ui.mobileNavOpen);

  const handleClose = () => {
    dispatch(setMobileNavOpen(false));
  };

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-[250px] shrink-0 bg-navy h-screen flex-col justify-between select-none border-r border-[#1B2A4A] z-30 sticky top-0">
        <SidebarInner />
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-navy/70 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {mobileNavOpen && (
        <aside
          role="dialog"
          aria-label="Mobile Navigation Drawer"
          className="fixed inset-y-0 left-0 w-[270px] bg-navy h-screen z-50 lg:hidden shadow-2xl border-r border-[#1B2A4A] animate-in slide-in-from-left duration-200"
        >
          <SidebarInner onClose={handleClose} isMobile />
        </aside>
      )}
    </>
  );
}


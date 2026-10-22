"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Bell,
  X,
  Activity,
  Users,
  Sliders,
  DollarSign,
  Cpu,
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
        id: "notifications",
        title: "Notifications & Alerts",
        href: "/notifications",
        icon: <Bell className="w-4 h-4" />,
        glyph: "NOTIF",
      },
      {
        id: "settings",
        title: "Settings & Integrations",
        href: "/settings",
        icon: <Settings className="w-4 h-4" />,
        glyph: "SET",
      },
    ],
  },
];

const adminNavSections: NavSection[] = [
  {
    title: "SUPER ADMIN COCKPIT",
    items: [
      {
        id: "admin-metrics",
        title: "Platform Metrics",
        href: "/admin",
        icon: <Activity className="w-4 h-4 text-blue-400" />,
        glyph: "MET",
        badge: "LIVE" as const,
      },
      {
        id: "admin-users",
        title: "User Directory & Roles",
        href: "/admin/users",
        icon: <Users className="w-4 h-4 text-emerald-400" />,
        glyph: "USR",
      },
      {
        id: "admin-rbac",
        title: "Role Permissions (RBAC)",
        href: "/admin/rbac",
        icon: <Sliders className="w-4 h-4 text-purple-400" />,
        glyph: "RBC",
      },
      {
        id: "admin-pricing",
        title: "Dynamic Pricing Plans",
        href: "/admin/pricing",
        icon: <DollarSign className="w-4 h-4 text-amber-400" />,
        glyph: "PRC",
      },
      {
        id: "admin-llm",
        title: "AI / LLM Providers",
        href: "/admin/llm",
        icon: <Cpu className="w-4 h-4 text-cyan-400" />,
        glyph: "LLM",
      },
    ],
  },
];

function SidebarInner({
  onClose,
  isMobile = false,
  isCollapsed = false,
}: {
  onClose?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminView = pathname.startsWith("/admin") || (mounted && user?.role === "ADMIN");
  const activeSections: NavSection[] = isAdminView ? adminNavSections : navSections;

  return (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Brand Header & Navigation Area */}
      <div className="flex flex-col flex-1 min-h-0">
        <div
          className={cn(
            "border-b border-[#1B2A4A] flex items-center shrink-0 transition-all",
            isCollapsed
              ? "p-3 justify-center"
              : "px-5 py-5 justify-between"
          )}
        >
          <Link
            href={isAdminView ? "/admin" : "/dashboard"}
            onClick={onClose}
            className="flex items-center gap-3 group"
            title="EXIMINTEGRA — Trade Advisory OS"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm border border-white/10 group-hover:border-blue/50 transition-colors bg-[#0D1B2A] flex items-center justify-center">
              <Image
                src="/eximintegra-logo-mark.png"
                alt="EximIntegra"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in duration-200">
                <span className="font-bold text-white text-sm tracking-tight leading-tight flex items-center gap-1.5">
                  EXIMINTEGRA
                </span>
                <span className="text-[10px] text-[#8EA0C0] font-mono tracking-widest uppercase">
                  Trade Advisory OS
                </span>
              </div>
            )}
          </Link>

          {isMobile && !isCollapsed && (
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
        <div
          className={cn(
            "overflow-y-auto flex-1 min-h-0 sidebar-scrollbar transition-all",
            isCollapsed ? "px-2 py-3 space-y-4" : "px-3 py-4 space-y-6"
          )}
        >
          {activeSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {isCollapsed ? (
                <div className="my-2 border-t border-[#1B2A4A]/60" />
              ) : (
                <h5 className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#6B7E9F] font-semibold animate-in fade-in duration-150">
                  {section.title}
                </h5>
              )}
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
                        className={cn(
                          "flex items-center rounded-md text-xs text-[#52637F] cursor-not-allowed opacity-60",
                          isCollapsed
                            ? "justify-center p-2.5"
                            : "justify-between px-3 py-2"
                        )}
                        title={`${item.title} (Coming Soon)`}
                      >
                        <span className="text-[#52637F] shrink-0">{item.icon}</span>
                        {!isCollapsed && (
                          <>
                            <span className="font-medium whitespace-nowrap truncate ml-2.5 flex-1">
                              {item.title}
                            </span>
                            {item.badge && (
                              <StatusPill
                                label={item.badge}
                                variant="muted"
                                size="xs"
                                className="text-[9px] px-1.5 py-0 border-[#2A3955] text-[#7084A5]"
                              />
                            )}
                          </>
                        )}
                      </div>
                    );
                  }

                  const isPermitted =
                    user?.role === "ADMIN" ||
                    user?.permissions?.[item.id] !== false;

                  if (!isPermitted) {
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center rounded-md text-xs text-[#52637F] cursor-not-allowed opacity-55 select-none group",
                          isCollapsed
                            ? "justify-center p-2.5"
                            : "justify-between px-3 py-2"
                        )}
                        title={`Access restricted: ${item.title}`}
                      >
                        <span className="text-[#52637F] shrink-0">{item.icon}</span>
                        {!isCollapsed && (
                          <>
                            <span className="whitespace-nowrap truncate line-through decoration-[#52637F]/60 ml-2.5 flex-1">
                              {item.title}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-mono uppercase text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              <Lock className="w-2.5 h-2.5" />
                              Restricted
                            </span>
                          </>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      title={item.title}
                      className={cn(
                        "flex items-center rounded-md text-xs font-medium transition-all group relative",
                        isCollapsed
                          ? "justify-center p-2.5 hover:bg-navy-hover"
                          : "justify-between px-3 py-2 hover:bg-navy-hover",
                        isActive
                          ? "bg-navy-active text-white font-semibold shadow-xs"
                          : "text-[#9EB1D0] hover:text-white"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue rounded-r" />
                      )}

                      <span
                        className={cn(
                          "transition-colors shrink-0",
                          isActive
                            ? "text-blue"
                            : "text-[#7B8DAF] group-hover:text-white"
                        )}
                      >
                        {item.icon}
                      </span>

                      {!isCollapsed && (
                        <>
                          <span className="whitespace-nowrap truncate ml-2.5 flex-1 text-left animate-in fade-in duration-150">
                            {item.title}
                          </span>
                          {item.tierBadge ? (
                            <TierBadge
                              tier={item.tierBadge}
                              size="xs"
                              compact
                              variant="dark"
                              showIcon={true}
                            />
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
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pinned Bottom Panel: Verified Datasets / Reliability State (Hidden in Admin Sidebar) */}
      {!isAdminView && (
        <div
          className={cn(
            "border-t border-[#1B2A4A] bg-[#0B1426] transition-all",
            isCollapsed ? "p-2 flex flex-col items-center justify-center" : "p-3"
          )}
        >
          {isCollapsed ? (
            <div
              className="p-2 rounded-lg bg-[#142038] border border-[#1E2E4E] flex flex-col items-center gap-1 cursor-pointer hover:bg-[#182644] transition-colors"
              title="CBIC Gateway v2026.3 Live Sync"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" />
              <span className="text-[9px] font-mono text-green font-bold">LIVE</span>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#142038] border border-[#1E2E4E] space-y-2 animate-in fade-in duration-200">
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
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const dispatch = useAppDispatch();
  const mobileNavOpen = useAppSelector((state) => state.ui.mobileNavOpen);
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  const handleClose = () => {
    dispatch(setMobileNavOpen(false));
  };

  return (
    <>
      {/* Desktop Fixed Sidebar (Collapsible) */}
      <aside
        className={cn(
          "hidden lg:flex shrink-0 bg-navy h-screen flex-col justify-between select-none border-r border-[#1B2A4A] z-30 sticky top-0 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-[68px]" : "w-[250px]"
        )}
      >
        <SidebarInner isCollapsed={sidebarCollapsed} />
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
          <SidebarInner onClose={handleClose} isMobile isCollapsed={false} />
        </aside>
      )}
    </>
  );
}


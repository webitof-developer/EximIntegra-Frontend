"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Activity,
  Users,
  Sliders,
  DollarSign,
  Cpu,
  RefreshCw,
} from "lucide-react";

interface AdminNavProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  userCount?: number;
}

export function AdminNav({
  title = "Platform Administration & Dynamic Governance Control",
  description = "Centralized authority to manage corporate user profiles, subscription quotas, live B2B SaaS pricing, and RBAC permissions across all business roles.",
  onRefresh,
  isRefreshing,
  userCount,
}: AdminNavProps) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/admin",
      label: "Platform Metrics",
      icon: Activity,
      isActive: pathname === "/admin",
    },
    {
      href: "/admin/users",
      label: "User Directory & Roles",
      icon: Users,
      badge: userCount !== undefined ? String(userCount) : undefined,
      isActive: pathname === "/admin/users",
    },
    {
      href: "/admin/rbac",
      label: "Role Permissions (RBAC Matrix)",
      icon: Sliders,
      isActive: pathname === "/admin/rbac",
    },
    {
      href: "/admin/pricing",
      label: "Dynamic SaaS Pricing",
      icon: DollarSign,
      isActive: pathname === "/admin/pricing",
    },
    {
      href: "/admin/llm",
      label: "AI / LLM Providers",
      icon: Cpu,
      isActive: pathname === "/admin/llm",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-panel border border-line rounded-2xl shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-purple-600 text-white uppercase tracking-wider font-bold inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              SUPER ADMIN COCKPIT
            </span>
            <span className="text-xs text-[#9EB1D0] font-mono">v2026.03-GOVERNANCE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {title}
          </h1>
          <p className="text-xs text-[#9EB1D0] max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {onRefresh && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-active hover:bg-[#23355D] text-white border border-[#2B406B] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Sync DB</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                link.isActive
                  ? "bg-blue text-white shadow-xs"
                  : "text-muted hover:text-ink hover:bg-bg"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
              {link.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

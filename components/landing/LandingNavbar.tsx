"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store";
import {
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Layers,
  Calculator,
  Lock,
} from "lucide-react";

export function LandingNavbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const getSectionHref = (hash: string) => (isHome ? hash : `/${hash}`);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-panel/90 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white shadow-xs group-hover:bg-blue transition-colors">
            <span className="font-mono font-bold text-xs tracking-tight">EI</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-ink tracking-tight">
                EximIntegra
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-dim text-blue border border-blue/20 font-bold uppercase">
                SaaS
              </span>
            </div>
            <span className="text-[10px] text-muted font-mono leading-none">
              Trade Intelligence & Landed Cost
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted">
          <Link
            href={getSectionHref("#interactive-demo")}
            className="hover:text-ink transition-colors flex items-center gap-1"
          >
            <span>Live Calculator</span>
          </Link>
          <Link
            href={getSectionHref("#features")}
            className="hover:text-ink transition-colors"
          >
            Engines & Features
          </Link>
          <Link
            href={getSectionHref("#statutory")}
            className="hover:text-ink transition-colors"
          >
            Statutory Coverage
          </Link>
          <Link
            href={getSectionHref("#security")}
            className="hover:text-ink transition-colors flex items-center gap-1"
          >
            <span>Security & BYOK</span>
          </Link>
          <Link
            href="/pricing"
            className={`transition-colors ${
              pathname === "/pricing" ? "text-blue font-bold" : "hover:text-ink"
            }`}
          >
            Pricing
          </Link>
        </nav>

        {/* Desktop CTA / Auth State */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Go to Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-ink hover:text-blue transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-muted hover:text-ink md:hidden border border-line bg-panel cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-line bg-panel px-4 py-4 space-y-3 text-xs font-semibold text-ink">
          <Link
            href={getSectionHref("#interactive-demo")}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-muted hover:text-ink"
          >
            Live Calculator
          </Link>
          <Link
            href={getSectionHref("#features")}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-muted hover:text-ink"
          >
            Engines & Features
          </Link>
          <Link
            href={getSectionHref("#statutory")}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-muted hover:text-ink"
          >
            Statutory Coverage
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-1 ${
              pathname === "/pricing" ? "text-blue font-bold" : "text-muted hover:text-ink"
            }`}
          >
            Pricing & Plans
          </Link>
          <Link
            href={getSectionHref("#security")}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-muted hover:text-ink"
          >
            Security & BYOK
          </Link>

          <div className="pt-3 border-t border-line flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="w-full py-2 text-center rounded-lg bg-blue text-white font-semibold shadow-xs"
              >
                Go to Cockpit &rarr;
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full py-2 text-center rounded-lg border border-line bg-bg text-ink font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="w-full py-2 text-center rounded-lg bg-blue text-white font-semibold shadow-xs"
                >
                  Start 14-Day Free Trial &rarr;
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

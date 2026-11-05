"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { useGetPricingPlansQuery } from "@/store/adminApi";
import { resolveTrialDays } from "@/lib/utils";

export function LandingNavbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const getSectionHref = (hash: string) => (isHome ? hash : `/${hash}`);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: pricingData } = useGetPricingPlansQuery();
  const trialDays = resolveTrialDays(pricingData);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (isHome) {
      e.preventDefault();
      e.stopPropagation();

      const targetId = hash.replace(/^#/, "");
      const elem = document.getElementById(targetId);

      if (elem) {
        if (typeof window !== "undefined" && window.__lenis) {
          window.__lenis.scrollTo(elem, {
            offset: -75,
            immediate: false,
          });
        } else {
          const y = elem.getBoundingClientRect().top + window.pageYOffset - 75;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
        window.history.pushState(null, "", hash);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-panel/90 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={(e) => {
            if (isHome) {
              e.preventDefault();
              e.stopPropagation();
              if (typeof window !== "undefined" && window.__lenis) {
                window.__lenis.scrollTo(0, { immediate: false });
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              window.history.pushState(null, "", "/");
            }
          }}
          className="flex items-center gap-2 group select-none cursor-pointer"
          title="EximIntegra — Trade Intelligence & Landed Cost"
        >
          <Image
            src="/eximintegra-logo-without-bg-name.png"
            alt="EximIntegra — Trade Intelligence & Landed Cost"
            width={180}
            height={60}
            className="h-10 w-auto object-contain group-hover:opacity-90 transition-opacity"
            priority
          />
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-dim text-blue border border-blue/20 font-bold uppercase shrink-0">
            SaaS
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted">
          <Link
            href={getSectionHref("#interactive-demo")}
            onClick={(e) => scrollToSection(e, "#interactive-demo")}
            scroll={false}
            className="hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Tariff Calculator</span>
          </Link>
          <Link
            href={getSectionHref("#features")}
            onClick={(e) => scrollToSection(e, "#features")}
            scroll={false}
            className="hover:text-ink transition-colors cursor-pointer"
          >
            Engines & Features
          </Link>
          <Link
            href={getSectionHref("#statutory")}
            onClick={(e) => scrollToSection(e, "#statutory")}
            scroll={false}
            className="hover:text-ink transition-colors cursor-pointer"
          >
            Statutory Coverage
          </Link>
          <Link
            href={getSectionHref("#security")}
            onClick={(e) => scrollToSection(e, "#security")}
            scroll={false}
            className="hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
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
              href={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>{user?.role === "ADMIN" ? "Super Admin Cockpit" : "Go to Cockpit"}</span>
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
            onClick={(e) => {
              setMobileMenuOpen(false);
              scrollToSection(e, "#interactive-demo");
            }}
            scroll={false}
            className="block py-1 text-muted hover:text-ink cursor-pointer"
          >
            Tariff Calculator
          </Link>
          <Link
            href={getSectionHref("#features")}
            onClick={(e) => {
              setMobileMenuOpen(false);
              scrollToSection(e, "#features");
            }}
            scroll={false}
            className="block py-1 text-muted hover:text-ink cursor-pointer"
          >
            Engines & Features
          </Link>
          <Link
            href={getSectionHref("#statutory")}
            onClick={(e) => {
              setMobileMenuOpen(false);
              scrollToSection(e, "#statutory");
            }}
            scroll={false}
            className="block py-1 text-muted hover:text-ink cursor-pointer"
          >
            Statutory Coverage
          </Link>
          <Link
            href={getSectionHref("#security")}
            onClick={(e) => {
              setMobileMenuOpen(false);
              scrollToSection(e, "#security");
            }}
            scroll={false}
            className="block py-1 text-muted hover:text-ink cursor-pointer"
          >
            Security & BYOK
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

          <div className="pt-3 border-t border-line flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="w-full py-2 text-center rounded-lg bg-blue text-white font-semibold shadow-xs"
              >
                {user?.role === "ADMIN" ? "Super Admin Cockpit \u2192" : "Go to Cockpit \u2192"}
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
                  Start {trialDays}-Day Free Trial &rarr;
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

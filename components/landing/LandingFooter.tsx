"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Scale, Globe, Lock } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-panel border-t border-line text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3.5">
            <Link href="/" className="flex items-center gap-2.5 select-none">
              <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white shadow-xs">
                <span className="font-mono font-bold text-xs tracking-tight">EI</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-ink tracking-tight">
                  EximIntegra
                </span>
                <span className="text-[10px] text-muted font-mono leading-none">
                  Trade Intelligence & Landed Cost
                </span>
              </div>
            </Link>

            <p className="text-muted leading-relaxed max-w-sm text-xs">
              Deterministic statutory customs duty calculation, sequential GIR HS
              classification, and multimodal landed cost modeling for Indian importers
              and customs brokers.
            </p>

            <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-muted">
              <span className="w-2 h-2 rounded-full bg-green" />
              <span>CBIC Tariff Schedule v2026.03 Active</span>
            </div>
          </div>

          {/* Engines Column */}
          <div className="space-y-3">
            <h5 className="font-bold text-ink uppercase tracking-wider text-[11px] font-mono">
              Engines
            </h5>
            <ul className="space-y-2 text-muted">
              <li>
                <Link href="/classify" className="hover:text-ink transition-colors">
                  HS Code Classifier
                </Link>
              </li>
              <li>
                <Link href="/duty" className="hover:text-ink transition-colors">
                  Customs Duty Calculator
                </Link>
              </li>
              <li>
                <Link href="/landed-cost" className="hover:text-ink transition-colors">
                  Landed Cost & Yield
                </Link>
              </li>
              <li>
                <Link href="/eligibility" className="hover:text-ink transition-colors">
                  FTA & Scheme Eligibility
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-ink transition-colors">
                  Country Sourcing Arbitrage
                </Link>
              </li>
              <li>
                <Link href="/akshara" className="hover:text-ink transition-colors">
                  Akshara AI Copilot
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Column */}
          <div className="space-y-3">
            <h5 className="font-bold text-ink uppercase tracking-wider text-[11px] font-mono">
              Platform & SaaS
            </h5>
            <ul className="space-y-2 text-muted">
              <li>
                <Link href="/pricing" className="hover:text-ink transition-colors">
                  Pricing & Plans
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-ink transition-colors">
                  API Keys & BYOK
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-ink transition-colors">
                  Audit History & Proof
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-ink transition-colors">
                  Client Cockpit Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-ink transition-colors">
                  14-Day Free Trial
                </Link>
              </li>
            </ul>
          </div>

          {/* Statutory Governance Column */}
          <div className="space-y-3">
            <h5 className="font-bold text-ink uppercase tracking-wider text-[11px] font-mono">
              Statutory Datasets
            </h5>
            <ul className="space-y-2 text-muted text-[11px]">
              <li>CBIC ICEGATE 2.0</li>
              <li>Customs Tariff Act 2026</li>
              <li>DGFT Policy 2026</li>
              <li>TAMP Major Ports (JNPT/Mundra)</li>
              <li>WCO GIR Rules 1–6</li>
              <li>India-UAE CEPA & ECTA</li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 border-t border-line flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-muted text-[11px]">
          <p className="max-w-3xl leading-relaxed">
            <strong>Statutory Disclaimer:</strong> EximIntegra computes statutory tariff
            assessments based on published gazette schedules. Final valuation, classification,
            and duty liability are determined upon official Bill of Entry examination by
            proper customs officers under the Customs Act, 1962.
          </p>

          <div className="flex items-center gap-4 shrink-0 font-mono">
            <span>&copy; 2026 EximIntegra Inc.</span>
            <span>All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

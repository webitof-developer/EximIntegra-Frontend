"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Database,
  CheckCircle2,
  FileCheck,
  Scale,
  Award,
  ArrowRight,
} from "lucide-react";

export function SocialProofAndCompliance() {
  return (
    <section id="security" className="py-20 bg-panel border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Security & Statutory Governance Grid */}
        <div id="statutory" className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
              Statutory Provenance & Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Enterprise Governance by Design
            </h3>
            <p className="text-xs sm:text-sm text-muted">
              Built for compliance officers, CFOs, and customs brokers who require auditability and zero drift.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-bg border border-line space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-green-dim text-green flex items-center justify-center shadow-2xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-ink">
                Deterministic Reproducibility
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Calculations stamp exact dataset versions at runtime for zero calculation drift across Union Budgets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg border border-line space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-dim text-blue flex items-center justify-center shadow-2xs">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-ink">
                Zero-Knowledge BYOK Encryption
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                API keys and trade tokens are encrypted via AES-256 and never logged or stored in plaintext.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg border border-line space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-dim text-amber flex items-center justify-center shadow-2xs">
                <FileCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-ink">
                Gazette Synchronized Feeds
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Direct statutory mapping against CBIC ICEGATE tariff schedules, DGFT notices, and major port tariffs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg border border-line space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-panel border border-line text-ink flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-blue" />
              </div>
              <h4 className="text-sm font-bold text-ink">
                Enterprise Multi-Tenancy
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Strict organization-level data segregation, role-based access control, and ERP webhook integrations.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Strip */}
        <div className="p-8 rounded-2xl bg-panel border border-line shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-ink">
              Ready to streamline your cross-border trade operations?
            </h4>
            <p className="text-xs text-muted">
              Start your 14-day free trial today. Full access to all six engines, no credit card needed.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/pricing"
              className="px-4 py-2.5 rounded-xl border border-line bg-bg hover:bg-line text-xs font-semibold text-ink transition-colors"
            >
              Compare Plans
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-dark text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

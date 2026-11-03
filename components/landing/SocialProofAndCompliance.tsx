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
import { useGetPricingPlansQuery, useGetPublicContentQuery } from "@/store/adminApi";

export function SocialProofAndCompliance() {
  const { data: pricingData } = useGetPricingPlansQuery();
  const { data: contentData } = useGetPublicContentQuery();
  const trialDays = pricingData?.trialDays ?? 14;

  const govContent = contentData?.landing?.governance;

  const badgeText = govContent?.badge || "Statutory Provenance & Architecture";
  const titleText = govContent?.title || "Enterprise Governance by Design";
  const subtitleText =
    govContent?.subtitle ||
    "Built for compliance officers, CFOs, and customs brokers who require auditability and zero drift.";

  const defaultCards = [
    {
      title: "Deterministic Reproducibility",
      description:
        "Calculations stamp exact dataset versions at runtime for zero calculation drift across Union Budgets.",
      icon: "check",
    },
    {
      title: "Zero-Knowledge BYOK Encryption",
      description:
        "API keys and trade tokens are encrypted via AES-256 and never logged or stored in plaintext.",
      icon: "lock",
    },
    {
      title: "Gazette Synchronized Feeds",
      description:
        "Direct statutory mapping against CBIC ICEGATE tariff schedules, DGFT notices, and major port tariffs.",
      icon: "file",
    },
    {
      title: "Enterprise Multi-Tenancy",
      description:
        "Strict organization-level data segregation, role-based access control, and ERP webhook integrations.",
      icon: "shield",
    },
  ];

  const cards = govContent?.cards && govContent.cards.length > 0 ? govContent.cards : defaultCards;

  const ctaTitle = govContent?.cta?.title || "Ready to streamline your cross-border trade operations?";
  const ctaSubtitle =
    govContent?.cta?.subtitle ||
    `Start your ${trialDays}-day free trial today. Full access to all six engines, no credit card needed.`;
  const primaryBtnText = govContent?.cta?.primaryBtnText || "Get Started Free";
  const primaryBtnHref = govContent?.cta?.primaryBtnHref || "/register";
  const secondaryBtnText = govContent?.cta?.secondaryBtnText || "Compare Plans";
  const secondaryBtnHref = govContent?.cta?.secondaryBtnHref || "/pricing";

  const getCardIcon = (index: number) => {
    switch (index % 4) {
      case 0:
        return (
          <div className="w-8 h-8 rounded-lg bg-green-dim text-green flex items-center justify-center shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 1:
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-dim text-blue flex items-center justify-center shadow-2xs">
            <Lock className="w-4 h-4" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-dim text-amber flex items-center justify-center shadow-2xs">
            <FileCheck className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-panel border border-line text-ink flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-blue" />
          </div>
        );
    }
  };

  return (
    <section id="security" className="py-20 bg-panel border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Security & Statutory Governance Grid */}
        <div id="statutory" className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
              {badgeText}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              {titleText}
            </h3>
            <p className="text-xs sm:text-sm text-muted">
              {subtitleText}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-bg border border-line space-y-2.5">
                {getCardIcon(idx)}
                <h4 className="text-sm font-bold text-ink">
                  {card.title}
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Strip */}
        <div className="p-8 rounded-2xl bg-panel border border-line shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-ink">
              {ctaTitle}
            </h4>
            <p className="text-xs text-muted">
              {ctaSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={secondaryBtnHref}
              className="px-4 py-2.5 rounded-xl border border-line bg-bg hover:bg-line text-xs font-semibold text-ink transition-colors"
            >
              {secondaryBtnText}
            </Link>
            <Link
              href={primaryBtnHref}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-dark text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <span>{primaryBtnText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

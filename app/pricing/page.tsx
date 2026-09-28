import React from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { PricingCards } from "@/components/pricing/PricingCards";
import { FeatureComparisonTable } from "@/components/pricing/FeatureComparisonTable";
import { PricingFaq } from "@/components/pricing/PricingFaq";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";
import { ShieldCheck, ArrowRight, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Pricing & SaaS Plans — EximIntegra Trade Intelligence",
  description:
    "Transparent pricing for modern importers and customs brokers. Compare Starter, Professional, and Enterprise plans with 14-day free trial.",
};

export default function PricingPage() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-blue selection:text-white">
        {/* Shared Public SaaS Navbar */}
        <LandingNavbar />

      {/* Main Pricing Content Area */}
      <main className="flex-1 py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-dim text-blue border border-blue/20 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue" />
              <span>TRANSPARENT B2B SAAS PRICING &bull; ROI-DRIVEN PLANS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">
              Predictable Pricing for Cross-Border Trade Compliance
            </h1>

            <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
              Choose the tier that matches your shipment volume and compliance needs.
              All plans include 100% deterministic CBIC gazette rates with zero calculation drift.
            </p>
          </div>

          {/* Pricing Cards with Monthly/Annual & INR/USD Switches */}
          <PricingCards />

          {/* Detailed Feature Comparison Matrix */}
          <FeatureComparisonTable />

          {/* Buyer FAQs */}
          <PricingFaq />

          {/* Enterprise Advisory Contact Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-navy text-white shadow-md border border-[#1E2E50] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase bg-blue text-white px-2.5 py-0.5 rounded font-bold tracking-wider inline-block">
                CUSTOM WORKSPACES
              </span>
              <h4 className="text-xl sm:text-2xl font-bold tracking-tight">
                Need high-volume bulk API quotas or custom SLAs?
              </h4>
              <p className="text-xs text-[#9EB1D0] max-w-xl">
                Our trade compliance engineers can assist with custom ERP connectors,
                dedicated TAMP port scale of rates, and tailored corporate billing.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/register?plan=enterprise"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Enterprise Sales</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Shared Public SaaS Footer */}
      <LandingFooter />
    </div>
    </SmoothScrollProvider>
  );
}

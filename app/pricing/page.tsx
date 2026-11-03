import React from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { PricingCards } from "@/components/pricing/PricingCards";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PricingEnterpriseCta } from "@/components/pricing/PricingEnterpriseCta";
import { FeatureComparisonTable } from "@/components/pricing/FeatureComparisonTable";
import { PricingFaq } from "@/components/pricing/PricingFaq";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";

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
            <PricingHeader />

            {/* Pricing Cards with Monthly/Annual & INR/USD Switches */}
            <PricingCards />

            {/* Detailed Feature Comparison Matrix */}
            <FeatureComparisonTable />

            {/* Buyer FAQs */}
            <PricingFaq />

            {/* Enterprise Advisory Contact Card */}
            <PricingEnterpriseCta />
          </div>
        </main>

        {/* Shared Public SaaS Footer */}
        <LandingFooter />
      </div>
    </SmoothScrollProvider>
  );
}

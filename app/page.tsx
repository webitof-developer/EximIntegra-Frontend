import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { InteractiveTariffDemo } from "@/components/landing/InteractiveTariffDemo";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SocialProofAndCompliance } from "@/components/landing/SocialProofAndCompliance";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata = {
  title: "EximIntegra — Deterministic Trade Intelligence & Landed Cost SaaS",
  description:
    "Automate 8-digit HS classification via sequential GIR legal rules, calculate exact CBIC customs duties, model multimodal port logistics & smelter recovery yields.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-blue selection:text-white">
      {/* Public SaaS Navigation Header */}
      <LandingNavbar />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* Hero Section with Value Propositions & Quick Metrics */}
        <HeroSection />

        {/* Live Interactive Tariff & Sourcing Arbitrage Calculator */}
        <InteractiveTariffDemo />

        {/* Six Specialized Core Trade Engines */}
        <FeaturesSection />

        {/* Enterprise Governance, BYOK Security & Social Proof */}
        <SocialProofAndCompliance />
      </main>

      {/* Global SaaS Footer with Statutory Disclaimers */}
      <LandingFooter />
    </div>
  );
}

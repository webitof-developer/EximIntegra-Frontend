"use client";

import React from "react";
import { useGetPublicContentQuery } from "@/store/adminApi";

export function PricingHeader() {
  const { data: contentData } = useGetPublicContentQuery();
  const headerContent = contentData?.pricing?.header;

  const badgeText =
    headerContent?.badge || "TRANSPARENT B2B SAAS PRICING • ROI-DRIVEN PLANS";
  const titleText =
    headerContent?.title ||
    "Predictable Pricing for Cross-Border Trade Compliance";
  const subtitleText =
    headerContent?.subtitle ||
    "Choose the tier that matches your shipment volume and compliance needs. All plans include 100% deterministic CBIC gazette rates with zero calculation drift.";

  return (
    <div className="text-center space-y-4 max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-dim text-blue border border-blue/20 text-xs font-mono font-semibold">
        <span className="w-2 h-2 rounded-full bg-blue" />
        <span>{badgeText}</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">
        {titleText}
      </h1>

      <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
        {subtitleText}
      </p>
    </div>
  );
}


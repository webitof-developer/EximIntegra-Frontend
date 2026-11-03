"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useGetPublicContentQuery } from "@/store/adminApi";

export function PricingEnterpriseCta() {
  const { data: contentData } = useGetPublicContentQuery();
  const ctaContent = contentData?.pricing?.enterpriseCta;

  const badgeText = ctaContent?.badge || "CUSTOM WORKSPACES";
  const titleText =
    ctaContent?.title || "Need high-volume bulk API quotas or custom SLAs?";
  const subtitleText =
    ctaContent?.subtitle ||
    "Our trade compliance engineers can assist with custom ERP connectors, dedicated TAMP port scale of rates, and tailored corporate billing.";
  const btnText = ctaContent?.btnText || "Contact Enterprise Sales";
  const btnHref = ctaContent?.btnHref || "/register?plan=enterprise";

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-navy text-white shadow-md border border-[#1E2E50] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase bg-blue text-white px-2.5 py-0.5 rounded font-bold tracking-wider inline-block">
          {badgeText}
        </span>
        <h4 className="text-xl sm:text-2xl font-bold tracking-tight">
          {titleText}
        </h4>
        <p className="text-xs text-[#9EB1D0] max-w-xl">
          {subtitleText}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href={btnHref}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{btnText}</span>
        </Link>
      </div>
    </div>
  );
}


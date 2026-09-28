"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How does the 14-day free trial work?",
    answer:
      "You receive immediate access to the Professional tier for 14 days without entering a credit card. You can classify goods, run live customs duty assessments, upload bulk manifests, and test landed cost calculations. If you choose not to subscribe, your account transitions to a read-only archive.",
  },
  {
    question: "Are CBIC, DGFT, and Port scale of rates updated automatically?",
    answer:
      "Yes. EximIntegra's ingestion pipelines continuously monitor CBIC notifications, DGFT Foreign Trade Policy gazettes, and TAMP major port published schedules. Tariff rate updates, exchange rate revisions, and export benefit notifications are reflected in calculations with runtime provenance stamps.",
  },
  {
    question: "What is BYOK (Bring Your Own Key) in the Enterprise plan?",
    answer:
      "BYOK allows your enterprise to connect your own direct API keys for LLMs (such as Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o, or private on-prem vLLM). All credentials are encrypted client-side using AES-256 and transmitted directly over authenticated TLS. Keys are never logged in plaintext or shared.",
  },
  {
    question: "Can we change plans or cancel at any time?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel your subscription directly from the Settings & Billing dashboard. Upgrades take effect immediately with pro-rated billing, while downgrades and cancellations take effect at the conclusion of your current billing cycle.",
  },
  {
    question: "Do you provide GST-compliant invoices for Indian businesses?",
    answer:
      "Yes. All INR subscriptions include formal tax invoices detailing your company's GSTIN and state code, allowing you to claim full Input Tax Credit (ITC) on software services under SAC 998314.",
  },
  {
    question: "Can EximIntegra connect to our ERP (SAP S/4HANA, NetSuite, Tally)?",
    answer:
      "Yes. Enterprise customers have access to our RESTful developer platform APIs and outgoing event webhooks. Whenever a duty calculation or landed cost assessment is finalized, an automated webhook payload can be pushed directly into your ERP warehouse or inventory accounting queue.",
  },
];

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-6 pt-12 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-ink tracking-tight">
          Frequently Asked Questions
        </h3>
        <p className="text-xs text-muted">
          Everything you need to know about our plans, statutory coverage, and billing.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="p-4 bg-panel border border-line rounded-xl shadow-2xs space-y-2 transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-ink cursor-pointer select-none"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform shrink-0 ${
                    isOpen ? "rotate-180 text-blue" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <p className="text-xs text-muted leading-relaxed pt-1 border-t border-line/60">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

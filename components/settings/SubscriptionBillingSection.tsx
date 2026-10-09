"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store";
import { useGetPricingPlansQuery } from "@/store/adminApi";
import {
  StatusPill,
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui";
import {
  CreditCard,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  Calendar,
  Clock,
  Plus,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  period: string;
  amountInr: number;
  taxInr: number;
  totalInr: number;
  status: "PAID" | "PENDING";
}

const sampleInvoices: InvoiceItem[] = [];

export function SubscriptionBillingSection() {
  const { user } = useAppSelector((state) => state.auth);
  const [currentPlan, setCurrentPlan] = useState<"ENTERPRISE" | "PROFESSIONAL" | "STARTER">(user?.tier || "STARTER");
  const [isAnnual, setIsAnnual] = useState(true);
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: pricingData } = useGetPricingPlansQuery();
  const starterPlan = pricingData?.plans?.find((p) => p.id.toLowerCase() === "starter");
  const proPlan = pricingData?.plans?.find((p) => p.id.toLowerCase() === "professional");
  const entPlan = pricingData?.plans?.find((p) => p.id.toLowerCase() === "enterprise");

  const starterPrice = isAnnual ? (starterPlan?.priceAnnualInr ?? 6399) : (starterPlan?.priceMonthlyInr ?? 7999);
  const proPrice = isAnnual ? (proPlan?.priceAnnualInr ?? 19999) : (proPlan?.priceMonthlyInr ?? 24999);
  const entPrice = isAnnual ? (entPlan?.priceAnnualInr ?? 59999) : (entPlan?.priceMonthlyInr ?? 74999);

  const displayedPrice =
    currentPlan === "ENTERPRISE"
      ? entPrice
      : currentPlan === "PROFESSIONAL"
      ? proPrice
      : starterPrice;

  // Card state
  const [cardLast4, setCardLast4] = useState("4242");
  const [cardBrand, setCardBrand] = useState("Visa Corporate");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadInvoice = (inv: InvoiceItem) => {
    showNotice(`Downloaded tax invoice ${inv.invoiceNumber} (₹${inv.totalInr.toLocaleString("en-IN")}) with GST breakdown.`);
  };

  const handleSelectPlan = (plan: "ENTERPRISE" | "PROFESSIONAL" | "STARTER") => {
    setCurrentPlan(plan);
    setIsChangePlanOpen(false);
    showNotice(`Subscription updated to ${plan} Tier. Pro-rated billing applied.`);
  };

  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber.trim()) return;
    const last4 = newCardNumber.slice(-4) || "8812";
    setCardLast4(last4);
    setCardBrand("Mastercard Corporate");
    setIsPaymentModalOpen(false);
    setNewCardNumber("");
    setNewCardExpiry("");
    showNotice(`Payment method updated to card ending in •••• ${last4}.`);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 bg-green-dim border border-green/30 text-green rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Active Plan Overview Card */}
      <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase bg-blue text-white px-2.5 py-0.5 rounded font-bold tracking-wider">
                CURRENT PLAN
              </span>
              <StatusPill label="ACTIVE SUBSCRIPTION" variant="success" size="xs" dot />
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-ink">
                {currentPlan === "ENTERPRISE"
                  ? "Enterprise Platform Plan"
                  : currentPlan === "PROFESSIONAL"
                  ? "Professional Tier Plan"
                  : "Starter Tier Plan"}
              </h3>
              <span className="text-xs text-muted font-mono">
                {isAnnual ? "(Annual Billing &bull; Save 20%)" : "(Monthly Billing)"}
              </span>
            </div>

            <p className="text-xs text-muted max-w-xl leading-relaxed">
              Full access to sequential GIR classification, customs duty statutory engine,
              landed cost modeling, Akshara AI Copilot, and BYOK gateway integrations.
            </p>
          </div>

          {/* Pricing & Plan Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-right sm:pr-2">
              <div className="text-xl font-bold font-data text-ink">
                ₹{displayedPrice.toLocaleString("en-IN")}
                <span className="text-xs text-muted font-normal"> / mo</span>
              </div>
              <span className="text-[10px] font-mono text-muted block">
                Next renewal: Oct 28, 2026
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsChangePlanOpen(true)}
              className="px-4 py-2 bg-blue hover:bg-blue-dark text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Change Plan
            </button>
          </div>
        </div>

        {/* Real-time Usage & Quota Meters */}
        <div className="pt-4 border-t border-line space-y-3">
          <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider block">
            Monthly Quota & Seat Consumption
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Meter 1: HS Classifications */}
            <div className="p-3.5 bg-bg rounded-xl border border-line space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted font-mono">HS Classifications</span>
                <span className="font-bold text-ink font-mono">
                  {currentPlan === "STARTER" ? "68 / 100" : "342 / Unlimited"}
                </span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue h-1.5 rounded-full"
                  style={{ width: currentPlan === "STARTER" ? "68%" : "100%" }}
                />
              </div>
              <span className="text-[10px] text-muted block">
                {currentPlan === "STARTER" ? "32 remaining this period" : "Uncapped batch & single lookup"}
              </span>
            </div>

            {/* Meter 2: Landed Cost Runs */}
            <div className="p-3.5 bg-bg rounded-xl border border-line space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted font-mono">Landed Cost Runs</span>
                <span className="font-bold text-green font-mono">
                  84 / Unlimited
                </span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                <div className="bg-green h-1.5 rounded-full" style={{ width: "100%" }} />
              </div>
              <span className="text-[10px] text-muted block">
                Smelter yield & port CFS calculations
              </span>
            </div>

            {/* Meter 3: Akshara AI Inquiries */}
            <div className="p-3.5 bg-bg rounded-xl border border-line space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted font-mono">Akshara AI Queries</span>
                <span className="font-bold text-ink font-mono">
                  {currentPlan === "ENTERPRISE" ? "129 / Unlimited" : "Locked (Enterprise)"}
                </span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    currentPlan === "ENTERPRISE" ? "bg-blue" : "bg-muted/40"
                  }`}
                  style={{ width: currentPlan === "ENTERPRISE" ? "100%" : "0%" }}
                />
              </div>
              <span className="text-[10px] text-muted block">
                {currentPlan === "ENTERPRISE" ? "Grounded tool-call execution" : "Requires Enterprise tier"}
              </span>
            </div>

            {/* Meter 4: Team Seats */}
            <div className="p-3.5 bg-bg rounded-xl border border-line space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted font-mono">Workspace Seats</span>
                <span className="font-bold text-ink font-mono">
                  4 / 10 Active
                </span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue h-1.5 rounded-full" style={{ width: "40%" }} />
              </div>
              <span className="text-[10px] text-muted block">
                6 available seats for customs brokers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Payment Method & Billing Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Card */}
        <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue" />
              <h4 className="text-xs font-bold text-ink font-mono uppercase tracking-wider">
                Payment Method
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="text-xs text-blue hover:underline font-semibold cursor-pointer"
            >
              Update Card
            </button>
          </div>

          <div className="p-4 bg-bg rounded-xl border border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded bg-navy text-white text-[10px] font-bold font-mono flex items-center justify-center border border-line shadow-2xs">
                VISA
              </div>
              <div>
                <span className="text-xs font-bold text-ink block">
                  {cardBrand} &bull;&bull;&bull;&bull; {cardLast4}
                </span>
                <span className="text-[10px] text-muted font-mono">
                  Expires 12 / 2028 &bull; Default corporate mandate
                </span>
              </div>
            </div>
            <StatusPill label="VERIFIED" variant="success" size="xs" />
          </div>
        </div>

        {/* GST & Corporate Billing Info */}
        <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green" />
              <h4 className="text-xs font-bold text-ink font-mono uppercase tracking-wider">
                Tax & GSTIN Invoicing
              </h4>
            </div>
          </div>

          <div className="p-4 bg-bg rounded-xl border border-line text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-muted">Entity:</span>
              <strong className="text-ink font-bold">{user?.company || "Organization Entity"}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">GSTIN:</span>
              <strong className="text-blue font-bold">Not Configured</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Billing Email:</span>
              <span className="text-ink">{user?.email || "billing@organization.com"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Invoices History Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue" />
            <h4 className="text-xs font-bold text-ink font-mono uppercase tracking-wider">
              Billing History & Tax Invoices
            </h4>
          </div>
          <span className="text-[10px] font-mono text-muted">
            SAC 998314 &bull; Input Tax Credit (ITC) Eligible
          </span>
        </div>

        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Billing Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead align="right">Taxable Outlay</TableHead>
                <TableHead align="right">Total (with GST)</TableHead>
                <TableHead align="center">Status</TableHead>
                <TableHead align="center">Receipt</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {sampleInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="py-8 text-muted">
                    No invoices generated yet. Invoices will appear here once billing cycles complete.
                  </TableCell>
                </TableRow>
              ) :
                sampleInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-bold text-ink">
                      {inv.invoiceNumber}
                    </TableCell>
                  <TableCell className="text-muted font-mono">
                    {inv.date}
                  </TableCell>
                  <TableCell className="text-ink">
                    {inv.period}
                  </TableCell>
                  <TableCell align="right" className="font-mono text-muted tabular-nums">
                    ₹{inv.amountInr.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell align="right" className="font-mono font-bold text-ink tabular-nums">
                    ₹{inv.totalInr.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell align="center">
                    <StatusPill label={inv.status} variant="success" size="xs" />
                  </TableCell>
                  <TableCell align="center">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(inv)}
                      className="p-1.5 rounded-md hover:bg-bg text-muted hover:text-blue transition-colors cursor-pointer inline-flex items-center gap-1"
                      title="Download GST Tax Invoice"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px]">PDF</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Change Plan Modal */}
      {isChangePlanOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-panel border border-line rounded-2xl p-6 max-w-2xl w-full shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">Change SaaS Subscription</h3>
                <p className="text-xs text-muted">Select a plan to immediately switch your account quotas.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePlanOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Starter */}
              <div
                onClick={() => handleSelectPlan("STARTER")}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  currentPlan === "STARTER"
                    ? "border-blue bg-blue-dim/40 ring-2 ring-blue/20"
                    : "border-line bg-bg hover:border-muted"
                }`}
              >
                <span className="font-bold text-ink block">Starter</span>
                <span className="text-xs text-muted block mt-0.5">
                  ₹{(starterPlan?.priceMonthlyInr ?? 7999).toLocaleString("en-IN")} / mo
                </span>
                <span className="text-[11px] text-muted block mt-2">100 HS lookups &bull; 1 Seat</span>
              </div>

              {/* Professional */}
              <div
                onClick={() => handleSelectPlan("PROFESSIONAL")}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  currentPlan === "PROFESSIONAL"
                    ? "border-blue bg-blue-dim/40 ring-2 ring-blue/20"
                    : "border-line bg-bg hover:border-muted"
                }`}
              >
                <span className="font-bold text-blue block">Professional</span>
                <span className="text-xs text-muted block mt-0.5">
                  ₹{(proPlan?.priceMonthlyInr ?? 24999).toLocaleString("en-IN")} / mo
                </span>
                <span className="text-[11px] text-muted block mt-2">Bulk CSV &bull; Landed Cost &bull; 5 Seats</span>
              </div>

              {/* Enterprise */}
              <div
                onClick={() => handleSelectPlan("ENTERPRISE")}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  currentPlan === "ENTERPRISE"
                    ? "border-blue bg-blue-dim/40 ring-2 ring-blue/20"
                    : "border-line bg-bg hover:border-muted"
                }`}
              >
                <span className="font-bold text-ink block">Enterprise</span>
                <span className="text-xs text-muted block mt-0.5">
                  ₹{(entPlan?.priceMonthlyInr ?? 74999).toLocaleString("en-IN")} / mo
                </span>
                <span className="text-[11px] text-muted block mt-2">Akshara AI &bull; BYOK &bull; Unlimited</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setIsChangePlanOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg hover:bg-line border border-line text-muted cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePaymentMethod}
            className="bg-panel border border-line rounded-2xl p-6 max-w-md w-full shadow-lg space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">Update Corporate Payment Card</h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8812"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl font-mono text-ink focus:outline-none focus:border-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    className="w-full py-2 px-3 bg-bg border border-line rounded-xl font-mono text-ink focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted block mb-1">
                    Security CVC
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="•••"
                    maxLength={4}
                    className="w-full py-2 px-3 bg-bg border border-line rounded-xl font-mono text-ink focus:outline-none focus:border-blue"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-bg hover:bg-line border border-line text-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue hover:bg-blue-dark text-white cursor-pointer"
              >
                Save Payment Card
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

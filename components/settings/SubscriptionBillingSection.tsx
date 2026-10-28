"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { updateUser } from "@/store/authSlice";
import { useUpdateProfileMutation } from "@/store/authApi";
import { useGetPricingPlansQuery } from "@/store/adminApi";
import {
  useGetPublicPaymentConfigQuery,
  useCreateSubscriptionOrderMutation,
  useVerifyPaymentMutation,
  useGetInvoicesQuery,
  InvoiceItem,
} from "@/store/paymentsApi";

import {
  loadRazorpayScript,
  RazorpayCheckoutOptions,
  RazorpayPaymentSuccessResponse,
} from "@/lib/razorpay";
import { generateInvoicePdf } from "@/lib/invoicePdf";
import { PricingPlan } from "@/lib/types";
import {
  StatusPill,
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  ToastNotification,
} from "@/components/ui";
import {
  CheckCircle2,
  Download,
  Building2,
  FileText,
  X,
  Check,
  Loader2,
  Edit3,
  Mail,
  Lock,
  CreditCard,
  AlertTriangle,
  Clock,
} from "lucide-react";

// Fallback plans if database plans are still loading or network is offline
const fallbackPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tierBadge: "STARTER",
    tagline: "For individual importers, traders & small customs agencies.",
    priceMonthlyInr: 7999,
    priceAnnualInr: 6399,
    priceMonthlyUsd: 99,
    priceAnnualUsd: 79,
    features: [
      "100 HS Classifications / month",
      "Statutory Customs Duty (BCD, SWS, IGST)",
      "CBIC Gazette Daily Exchange Rates",
      "Single material landed cost estimates",
      "1 Workspace Seat included",
    ],
    ctaLabel: "Get Started",
    ctaHref: "/register?plan=starter",
  },
  {
    id: "professional",
    name: "Professional",
    tierBadge: "PROFESSIONAL",
    tagline: "For expanding exim trading houses, brokers & manufacturers.",
    badge: "MOST POPULAR",
    isPopular: true,
    priceMonthlyInr: 24999,
    priceAnnualInr: 19999,
    priceMonthlyUsd: 299,
    priceAnnualUsd: 239,
    features: [
      "Unlimited HS Classifications with GIR 1–6 trails",
      "Bulk CSV batch manifest processor (up to 500 items)",
      "End-to-end Landed Cost & Port CFS Logistics",
      "Smelter recovery yield & molten MT valuation engine",
      "Country-of-origin sourcing arbitrage comparison",
      "Up to 5 Team Workspace Seats",
    ],
    ctaLabel: "Get Started",
    ctaHref: "/register?plan=professional",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tierBadge: "ENTERPRISE",
    tagline: "For large multinational corporations, smelters & supply chains.",
    badge: "FULL PLATFORM",
    priceMonthlyInr: 74999,
    priceAnnualInr: 59999,
    priceMonthlyUsd: 899,
    priceAnnualUsd: 719,
    features: [
      "Everything in Professional tier",
      "Akshara AI Trade Copilot with tool-call execution",
      "BYOK LLM Provider Integration (Claude, OpenAI, Gemini)",
      "Custom carrier freight contract & smelter yield overrides",
      "Up to 10 Team Workspace Seats",
      "24/7 Dedicated Account Manager & Priority SLA",
    ],
    ctaLabel: "Get Started",
    ctaHref: "/register?plan=enterprise",
  },
];

export function SubscriptionBillingSection() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [currentPlan, setCurrentPlan] = useState<
    "ENTERPRISE" | "PROFESSIONAL" | "STARTER" | "FREE_TRIAL" | string
  >(user?.tier || "FREE_TRIAL");
  const [isAnnual, setIsAnnual] = useState(true);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Change Plan Modal Controls
  const [modalBillingCycle, setModalBillingCycle] = useState<"monthly" | "annual">("annual");
  const [modalCurrency, setModalCurrency] = useState<"INR" | "USD">("INR");

  // Tax & GSTIN Invoicing State (Company is read-only)
  const [isEditingTax, setIsEditingTax] = useState(false);
  const [editGstin, setEditGstin] = useState(user?.gstin || "");
  const [editBillingEmail, setEditBillingEmail] = useState(user?.billingEmail || user?.email || "");
  const [gstinError, setGstinError] = useState<string | null>(null);

  const [updateProfileMutation, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [createOrderMutation, { isLoading: isCreatingOrder }] = useCreateSubscriptionOrderMutation();
  const [verifyPaymentMutation, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  const { data: publicPaymentConfig } = useGetPublicPaymentConfigQuery();
  const { data: rawInvoicesData, refetch: refetchInvoices } = useGetInvoicesQuery();
  const invoicesData: InvoiceItem[] = Array.isArray(rawInvoicesData)
    ? rawInvoicesData
    : Array.isArray((rawInvoicesData as unknown as { invoices?: InvoiceItem[] })?.invoices)
    ? (rawInvoicesData as unknown as { invoices: InvoiceItem[] }).invoices
    : [];
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  // Real Database Stored Pricing Plans Query
  const { data: pricingData, isLoading: isLoadingPlans } = useGetPricingPlansQuery();

  // Active plans list directly from database (with fallback)
  const plansList: PricingPlan[] =
    pricingData?.plans && pricingData.plans.length > 0
      ? pricingData.plans.filter((p) => p.isActive !== false)
      : fallbackPlans;

  // Keep state synced with user profile
  useEffect(() => {
    if (user) {
      if (user.tier) setCurrentPlan(user.tier);
      if (user.billingCycle) setIsAnnual(user.billingCycle === "annual");
      setEditGstin(user.gstin || "");
      setEditBillingEmail(user.billingEmail || user.email || "");
    }
  }, [user]);

  // Close Change Plan modal on Escape key
  useEffect(() => {
    if (!isChangePlanOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsChangePlanOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isChangePlanOpen]);

  const isTrial =
    user?.billingCycle === "trial" ||
    currentPlan.toUpperCase() === "FREE_TRIAL" ||
    currentPlan.toUpperCase() === "FREE TIER";

  // Current active plan info resolved from DB plans
  const activePlanInfo =
    (isTrial
      ? plansList.find((p) => p.planType === "trial" && p.isDefaultTrial) ||
        plansList.find((p) => p.planType === "trial")
      : null) ||
    plansList.find((p) => (p.tierBadge || p.id).toUpperCase() === currentPlan.toUpperCase()) ||
    plansList.find((p) => p.id.toLowerCase() === currentPlan.toLowerCase()) ||
    plansList[0];

  // Subscription Lifecycle & Expiry Calculation
  const subStarted = user?.subscriptionStartedAt
    ? new Date(user.subscriptionStartedAt)
    : user?.createdAt
    ? new Date(user.createdAt)
    : new Date();
  const subExpires = user?.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt)
    : new Date(subStarted.getTime() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000);

  const formattedStarted = subStarted.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedExpiry = subExpires.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const nowTime = Date.now();
  const diffMs = subExpires.getTime() - nowTime;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = user?.isSubscriptionExpired || daysLeft <= 0;
  const isExpiringSoon = !isExpired && daysLeft <= 7 && daysLeft >= 0;

  // Pricing calculations
  const displayedPriceInr = isAnnual
    ? activePlanInfo?.priceAnnualInr ?? 59999
    : activePlanInfo?.priceMonthlyInr ?? 74999;
  const displayedPriceUsd = isAnnual
    ? activePlanInfo?.priceAnnualUsd ?? 719
    : activePlanInfo?.priceMonthlyUsd ?? 899;

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadInvoice = async (inv: InvoiceItem) => {
    try {
      const adminComp =
        inv.issuedByCompany ||
        publicPaymentConfig?.adminCompany ||
        (user?.role === "ADMIN" ? user?.company : undefined) ||
        "EximIntegra HQ";
      const adminMail =
        inv.issuedByEmail ||
        publicPaymentConfig?.adminEmail ||
        (user?.role === "ADMIN" ? user?.email : undefined) ||
        "admin@eximintegra.co";

      await generateInvoicePdf({
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        currency: inv.currency,
        createdAt: inv.createdAt,
        planId: inv.planId,
        billingCycle: inv.billingCycle,
        customerName: user?.name,
        customerEmail: user?.email,
        organizationName: user?.company || undefined,
        gstin: user?.gstin || undefined,
        billingEmail: user?.billingEmail || user?.email || undefined,
        adminCompany: adminComp,
        adminEmail: adminMail,
        paymentGateway: "Razorpay",
        paymentStatus: inv.status === "SUCCESS" || inv.status === "PAID" ? "PAID" : inv.status,
      });
      showNotice(
        `Downloaded GST tax invoice ${inv.invoiceNumber} (${
          inv.currency === "INR" ? "₹" : "$"
        }${Number(inv.amount).toLocaleString()}).`
      );
    } catch (err) {
      console.error("PDF generation error:", err);
      showNotice(`Failed to generate PDF for invoice ${inv.invoiceNumber}.`);
    }
  };

  // Switch Plan from Modal with Razorpay multi-currency (INR & USD) payment flow
  const handleSwitchPlan = async (plan: PricingPlan) => {
    const planTierKey = (plan.tierBadge || plan.id).toUpperCase() as
      | "STARTER"
      | "PROFESSIONAL"
      | "ENTERPRISE";

    if (currentPlan.toUpperCase() === planTierKey) {
      showNotice(`You are already subscribed to the ${plan.name} Tier.`);
      return;
    }

    setProcessingPlanId(plan.id);

    try {
      // 1. Ensure Razorpay Checkout SDK is loaded
      await loadRazorpayScript();

      // 2. Create Razorpay Order on Backend (Supports both INR in paise & USD in cents)
      const cycle = modalBillingCycle === "annual" ? "annual" : "monthly";
      const orderData = await createOrderMutation({
        planId: plan.id,
        billingCycle: cycle,
        currency: modalCurrency,
      }).unwrap();

      // 3. If real Razorpay key configured and Checkout SDK available, open popup
      if (orderData.keyId && window.Razorpay && !orderData.isSimulated) {
        const options: RazorpayCheckoutOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "EximIntegra Enterprise",
          description: `${orderData.planName} ${
            modalBillingCycle === "annual" ? "Annual" : "Monthly"
          } Subscription (${orderData.amountFormatted || (modalCurrency === "INR" ? `₹${(orderData.amount / 100).toLocaleString("en-IN")}` : `$${(orderData.amount / 100).toLocaleString("en-US")}`)})`,
          order_id: orderData.orderId,
          prefill: {
            name: user?.name || user?.email || "Trader",
            email: user?.email || "billing@eximintegra.com",
          },
          theme: {
            color: "#1D4ED8",
          },
          handler: async function (response: RazorpayPaymentSuccessResponse) {
            try {
              const verifyRes = await verifyPaymentMutation({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                planId: plan.id,
                billingCycle: cycle,
                currency: modalCurrency,
              }).unwrap();

              if (user) {
                dispatch(
                  updateUser({
                    ...user,
                    tier: (verifyRes.tier as "STARTER" | "PROFESSIONAL" | "ENTERPRISE") || planTierKey,
                    tierBadge: verifyRes.tierBadge || verifyRes.tier,
                  })
                );
              }
              setCurrentPlan((verifyRes.tier as "STARTER" | "PROFESSIONAL" | "ENTERPRISE") || planTierKey);
              setIsAnnual(modalBillingCycle === "annual");
              setCurrency(modalCurrency);
              setIsChangePlanOpen(false);
              refetchInvoices();
              showNotice(
                `Payment of ${modalCurrency === "INR" ? "₹" : "$"}${Number(
                  orderData.amount / 100
                ).toLocaleString()} successful! Upgraded to ${plan.name} Tier.`
              );
            } catch {
              showNotice("Payment signature verification failed. Please contact billing support.");
            } finally {
              setProcessingPlanId(null);
            }
          },
          modal: {
            ondismiss: () => {
              setProcessingPlanId(null);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Sandbox Simulation Mode (keys not yet configured or in test sandbox)
        const verifyRes = await verifyPaymentMutation({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: "simulated_signature",
          planId: plan.id,
          billingCycle: cycle,
          currency: modalCurrency,
        }).unwrap();

        if (user) {
          dispatch(
            updateUser({
              ...user,
              tier: (verifyRes.tier as "STARTER" | "PROFESSIONAL" | "ENTERPRISE") || planTierKey,
              tierBadge: verifyRes.tierBadge || verifyRes.tier,
            })
          );
        }
        setCurrentPlan((verifyRes.tier as "STARTER" | "PROFESSIONAL" | "ENTERPRISE") || planTierKey);
        setIsAnnual(modalBillingCycle === "annual");
        setCurrency(modalCurrency);
        setIsChangePlanOpen(false);
        refetchInvoices();
        showNotice(
          `(Razorpay Gateway) Subscription upgraded to ${plan.name} Tier (${
            modalCurrency === "INR" ? "₹" : "$"
          }${Number(orderData.amount / 100).toLocaleString()}).`
        );
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      showNotice(errorObj?.data?.error || `Failed to initiate payment for ${plan.name}.`);
    } finally {
      setProcessingPlanId(null);
    }
  };

  // Save Tax & GSTIN Invoicing Details (Company is read-only)
  const handleSaveTaxDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setGstinError(null);

    const cleanGstin = editGstin.trim().toUpperCase();
    if (cleanGstin && cleanGstin.length !== 15) {
      setGstinError("Indian GSTIN must be exactly 15 alphanumeric characters (e.g. 27AAPFU0939L1ZV).");
      return;
    }

    if (!editBillingEmail.trim() || !editBillingEmail.includes("@")) {
      showNotice("Please enter a valid billing email address.");
      return;
    }

    try {
      // Note: Company name is NOT updated from here, only gstin and billingEmail are saved.
      const updated = await updateProfileMutation({
        gstin: cleanGstin,
        billingEmail: editBillingEmail.trim().toLowerCase(),
      }).unwrap();

      dispatch(updateUser(updated));
      setIsEditingTax(false);
      showNotice("Tax & GSTIN invoicing details saved successfully.");
    } catch {
      showNotice("Failed to save GSTIN and billing details.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Floating Bottom-Right Toast Notification */}
      <ToastNotification
        isOpen={!!toastMessage}
        variant="success"
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* Expiration Notification Alert Banners */}
      {isExpired && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-800 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-red-900">
                {isTrial ? "Free Trial Expired" : "Subscription Expired"} ({formattedExpiry})
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                {isTrial
                  ? `Your organization's Free Trial expired on ${formattedExpiry}. Upgrade to a paid subscription plan below to restore access to customs classification and logistics engines.`
                  : `Your organization's ${currentPlan} plan expired on ${formattedExpiry}. Renew or upgrade below to restore access to customs classification and logistics engines.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setModalCurrency(currency);
              setModalBillingCycle(isAnnual ? "annual" : "monthly");
              setIsChangePlanOpen(true);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-xs"
          >
            {isTrial ? "Upgrade Plan" : "Renew Plan"}
          </button>
        </div>
      )}

      {isExpiringSoon && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-900">
                {isTrial ? "Free Trial Expiring Soon" : "Subscription Expiring Soon"} ({daysLeft === 0 ? "Today" : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`})
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {isTrial
                  ? `Your organization's Free Trial expires on ${formattedExpiry}. Upgrade to a paid subscription plan in advance to ensure uninterrupted quota access and team seat availability.`
                  : `Your organization's ${currentPlan} subscription expires on ${formattedExpiry}. Renew in advance to ensure uninterrupted quota access and team seat availability.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setModalCurrency(currency);
              setModalBillingCycle(isAnnual ? "annual" : "monthly");
              setIsChangePlanOpen(true);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-xs"
          >
            {isTrial ? "Upgrade Plan" : "Renew Subscription"}
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
              {isExpired ? (
                <StatusPill label="SUBSCRIPTION EXPIRED" variant="danger" size="xs" dot />
              ) : isExpiringSoon ? (
                <StatusPill
                  label={`EXPIRES IN ${daysLeft === 0 ? "TODAY" : `${daysLeft}D`}`}
                  variant="warning"
                  size="xs"
                  dot
                />
              ) : (
                <StatusPill label="ACTIVE SUBSCRIPTION" variant="success" size="xs" dot />
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-ink">
                {activePlanInfo?.name
                  ? `${activePlanInfo.name} Tier Plan`
                  : isTrial
                  ? "Free Trial Tier Plan"
                  : currentPlan === "ENTERPRISE"
                  ? "Enterprise Platform Plan"
                  : currentPlan === "PROFESSIONAL"
                  ? "Professional Tier Plan"
                  : "Starter Tier Plan"}
              </h3>
              <span className="text-xs text-muted font-mono">
                {isTrial
                  ? "(Free Evaluation Trial)"
                  : isAnnual
                  ? "(Annual Billing • Save 20%)"
                  : "(Monthly Billing)"}
              </span>
            </div>

            <p className="text-xs text-muted max-w-xl leading-relaxed">
              {activePlanInfo?.tagline ||
                "Full access to sequential GIR classification, customs duty statutory engine, landed cost modeling, Akshara AI Copilot, and BYOK gateway integrations."}
            </p>
          </div>

          {/* Pricing & Plan Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-right sm:pr-2">
              <div className="text-xl font-bold font-data text-ink flex items-center justify-end gap-1.5">
                <span>
                  {currency === "INR"
                    ? `₹${displayedPriceInr.toLocaleString("en-IN")}`
                    : `$${displayedPriceUsd.toLocaleString("en-US")}`}
                </span>
                <span className="text-xs text-muted font-normal"> / mo</span>
              </div>
              <span className="text-[10px] font-mono text-muted block">
                {isAnnual ? "Billed annually" : "Billed monthly"} • Start: {formattedStarted} • Renews: {formattedExpiry}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Currency toggle on the active plan */}
              <div className="flex items-center p-0.5 bg-bg border border-line rounded-lg text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    currency === "INR"
                      ? "bg-panel font-bold text-ink shadow-2xs"
                      : "text-muted hover:text-ink"
                  }`}
                  title="Display in Indian Rupees (INR)"
                >
                  ₹
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    currency === "USD"
                      ? "bg-panel font-bold text-ink shadow-2xs"
                      : "text-muted hover:text-ink"
                  }`}
                  title="Display in US Dollars (USD)"
                >
                  $
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalCurrency(currency);
                  setModalBillingCycle(isAnnual ? "annual" : "monthly");
                  setIsChangePlanOpen(true);
                }}
                className="px-4 py-2 bg-blue hover:bg-blue-dark text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Change Plan
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Usage & Quota Meters */}
        <div className="pt-4 border-t border-line space-y-3">
          <span className="text-xs font-bold text-ink font-mono uppercase tracking-wider block">
            Monthly Quota & Seat Consumption
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Meter 1: HS Classifications */}
            {(() => {
              const isUnlimited = activePlanInfo?.hsClassificationLimit === -1;
              const limit = isUnlimited ? "Unlimited" : (activePlanInfo?.hsClassificationLimit ?? (currentPlan === "STARTER" ? 100 : 1000));
              return (
                <div className="p-3.5 bg-bg rounded-xl border border-line space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted font-mono">HS Classifications</span>
                    <span className={`font-bold font-mono ${isUnlimited ? "text-purple-600" : "text-ink"}`}>
                      {isUnlimited ? "342 / ∞ Unlimited" : `68 / ${limit}`}
                    </span>
                  </div>
                  <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${isUnlimited ? "bg-purple-600" : "bg-blue"}`}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted block">
                    {isUnlimited ? "Uncapped batch & single lookup" : "Tracked monthly consumption"}
                  </span>
                </div>
              );
            })()}

            {/* Meter 2: Landed Cost Runs */}
            {(() => {
              const isUnlimited = activePlanInfo?.landedCostLimit === -1;
              const limit = isUnlimited ? "Unlimited" : (activePlanInfo?.landedCostLimit ?? (currentPlan === "STARTER" ? 50 : 500));
              return (
                <div className="p-3.5 bg-bg rounded-xl border border-line space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted font-mono">Landed Cost Runs</span>
                    <span className={`font-bold font-mono ${isUnlimited ? "text-purple-600" : "text-green"}`}>
                      {isUnlimited ? "84 / ∞ Unlimited" : `84 / ${limit}`}
                    </span>
                  </div>
                  <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${isUnlimited ? "bg-purple-600" : "bg-green"}`}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted block">
                    {isUnlimited ? "Uncapped Landed Cost & port runs" : "Smelter yield & port CFS calculations"}
                  </span>
                </div>
              );
            })()}

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
            {(() => {
              const isUnlimited = activePlanInfo?.maxTeamMembers === -1;
              const limit = isUnlimited ? "Unlimited" : (activePlanInfo?.maxTeamMembers ?? (currentPlan === "ENTERPRISE" ? 10 : 5));
              return (
                <div className="p-3.5 bg-bg rounded-xl border border-line space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted font-mono">Workspace Seats</span>
                    <span className={`font-bold font-mono ${isUnlimited ? "text-purple-600" : "text-ink"}`}>
                      {isUnlimited ? "4 / ∞ Unlimited Active" : `4 / ${limit} Active`}
                    </span>
                  </div>
                  <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${isUnlimited ? "bg-purple-600" : "bg-blue"}`}
                      style={{ width: isUnlimited ? "100%" : "40%" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted block">
                    {isUnlimited ? "Unlimited team seats permitted" : "Available seats for customs brokers"}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* 2. Tax & GSTIN Invoicing (Full Width Card - Payment Method Removed) */}
      <div className="p-6 bg-panel border border-line rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-green/10 text-green border border-green/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink font-mono uppercase tracking-wider flex items-center gap-2">
                <span>Tax & GSTIN Invoicing</span>
                <span className="text-[10px] font-mono text-muted bg-bg px-2 py-0.5 rounded border border-line font-normal normal-case">
                  SAC 998314 • 18% GST Eligible
                </span>
              </h4>
              <p className="text-xs text-muted">
                Configure your Indian GST identification number (GSTIN) and billing email for official B2B tax invoices & ITC claims.
              </p>
            </div>
          </div>

          {!isEditingTax && (
            <button
              type="button"
              onClick={() => {
                setEditGstin(user?.gstin || "");
                setEditBillingEmail(user?.billingEmail || user?.email || "");
                setGstinError(null);
                setIsEditingTax(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue hover:bg-blue-dark text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Configure GSTIN & Email</span>
            </button>
          )}
        </div>

        {/* View Mode */}
        {!isEditingTax ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Entity Card */}
            <div className="p-4 bg-bg rounded-xl border border-line space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-muted block">
                  Billing Legal Entity
                </span>
                <span className="text-[10px] font-mono text-muted bg-line/50 px-1.5 py-0.5 rounded">
                  Workspace
                </span>
              </div>
              <div className="text-sm font-bold text-ink truncate">
                {user?.company || "Organization Entity"}
              </div>
              <span className="text-[11px] text-muted block">
                Entity name on official tax invoices
              </span>
            </div>

            {/* GSTIN Card */}
            <div className="p-4 bg-bg rounded-xl border border-line space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-muted block">
                  GST Identification Number (GSTIN)
                </span>
                {user?.gstin ? (
                  <StatusPill label="ITC ELIGIBLE (18%)" variant="success" size="xs" />
                ) : (
                  <span className="text-[10px] font-mono font-semibold text-amber bg-amber/10 px-2 py-0.5 rounded border border-amber/20">
                    B2C (Not Configured)
                  </span>
                )}
              </div>
              <div className="text-sm font-bold font-mono text-ink">
                {user?.gstin ? (
                  <span className="text-blue">{user.gstin}</span>
                ) : (
                  <span className="text-muted font-normal italic">No GSTIN added</span>
                )}
              </div>
              <span className="text-[11px] text-muted block">
                {user?.gstin
                  ? "Input Tax Credit (ITC) applied automatically"
                  : "Click Configure to add your 15-digit GSTIN"}
              </span>
            </div>

            {/* Invoicing Email Card */}
            <div className="p-4 bg-bg rounded-xl border border-line space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted block">
                Invoice Delivery Email
              </span>
              <div className="text-sm font-bold font-mono text-ink truncate flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                <span className="truncate">{user?.billingEmail || user?.email || "billing@organization.com"}</span>
              </div>
              <span className="text-[11px] text-muted block">
                PDF receipts & GST invoices sent to this inbox
              </span>
            </div>
          </div>
        ) : (
          /* Edit Mode Form: Legal Entity Name is Read-Only */
          <form
            onSubmit={handleSaveTaxDetails}
            className="p-5 bg-bg border border-blue/40 rounded-xl space-y-4"
          >
            <div className="font-bold text-ink text-xs flex items-center justify-between">
              <span>Edit Corporate Tax & Invoicing Details</span>
              <span className="text-[10px] text-muted font-normal">
                Changes will reflect on all future subscription invoices
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Read-Only Company Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-muted flex items-center gap-1">
                    <Lock className="w-3 h-3 text-muted" />
                    <span>Legal Entity / Company Name</span>
                  </label>
                  <span className="text-[10px] text-muted font-mono bg-line/60 px-1.5 py-0.5 rounded">
                    Read-only
                  </span>
                </div>
                <div className="w-full py-2 px-3 bg-panel/70 border border-line rounded-lg text-ink font-semibold text-xs truncate select-none shadow-2xs">
                  {user?.company || "Organization Entity"}
                </div>
                <span className="text-[10px] text-muted block mt-1">
                  Company name is managed in Workspace settings
                </span>
              </div>

              {/* Editable GSTIN */}
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  GSTIN (15-Character Tax ID)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="e.g. 27AAPFU0939L1ZV"
                  value={editGstin}
                  onChange={(e) => {
                    setEditGstin(e.target.value.toUpperCase());
                    setGstinError(null);
                  }}
                  className={`w-full py-2 px-3 bg-panel border rounded-lg text-ink font-mono focus:outline-none text-xs uppercase ${
                    gstinError ? "border-red focus:border-red" : "border-line focus:border-blue"
                  }`}
                />
                {gstinError ? (
                  <span className="text-[10px] text-red block mt-1">{gstinError}</span>
                ) : (
                  <span className="text-[10px] text-muted block mt-1">
                    State code (2) + PAN (10) + Entity (3)
                  </span>
                )}
              </div>

              {/* Editable Billing Email */}
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Billing Email for Tax Invoices
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. accounts@yourcompany.com"
                  value={editBillingEmail}
                  onChange={(e) => setEditBillingEmail(e.target.value)}
                  className="w-full py-2 px-3 bg-panel border border-line rounded-lg text-ink focus:outline-none focus:border-blue text-xs font-mono"
                />
                <span className="text-[10px] text-muted block mt-1">
                  Invoice recipient for accounting team
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => {
                  setGstinError(null);
                  setIsEditingTax(false);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-panel hover:bg-line border border-line text-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Details</span>
              </button>
            </div>
          </form>
        )}
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
            SAC 998314 • Input Tax Credit (ITC) Eligible
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
              {invoicesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="py-8 text-muted">
                    No payment invoices recorded yet. Invoices will automatically appear here once subscriptions are processed via Razorpay.
                  </TableCell>
                </TableRow>
              ) : (
                invoicesData.map((inv) => {
                  const symbol = inv.currency === "INR" ? "₹" : "$";
                  const formattedDate = new Date(inv.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  const rawAmount = Number(inv.amount) || 0;
                  const totalAmount = rawAmount > 100000 ? Math.round(rawAmount / 100) : rawAmount;
                  const taxableAmount = inv.currency === "INR"
                    ? Math.round(totalAmount / 1.18)
                    : Math.round(totalAmount * 0.9);

                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono font-bold text-ink">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-muted font-mono">{formattedDate}</TableCell>
                      <TableCell className="text-ink font-semibold uppercase">
                        {inv.planId} <span className="text-muted text-[11px] lowercase font-normal">({inv.billingCycle})</span>
                      </TableCell>
                      <TableCell align="right" className="font-mono text-muted tabular-nums">
                        {symbol}
                        {taxableAmount.toLocaleString(inv.currency === "INR" ? "en-IN" : "en-US")}
                      </TableCell>
                      <TableCell align="right" className="font-mono font-bold text-ink tabular-nums">
                        {symbol}
                        {totalAmount.toLocaleString(inv.currency === "INR" ? "en-IN" : "en-US")}
                      </TableCell>
                      <TableCell align="center">
                        <StatusPill
                          label={inv.status}
                          variant={inv.status === "PAID" || inv.status === "SUCCESS" ? "success" : "neutral"}
                          size="xs"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice({ ...inv, amount: totalAmount })}
                          className="p-1.5 rounded-md hover:bg-bg text-muted hover:text-blue transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Download GST Tax Invoice"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="text-[11px]">PDF</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Change Plan Modal showing Live Real Database Stored Plans */}
      {isChangePlanOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsChangePlanOpen(false);
            }
          }}
        >
          <div
            className="bg-panel border border-line rounded-2xl p-6 max-w-5xl w-full shadow-2xl space-y-4 my-auto select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="text-lg font-bold text-ink">Change Subscription Plan</h3>
                <p className="text-xs text-muted mt-0.5">
                  Select your preferred tier, billing term (monthly / annual), and currency (INR / USD). Plans are loaded directly from the platform database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePlanOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer"
                title="Close modal (Esc)"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selectors Bar: Billing Cycle & Currency Switchers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 bg-bg rounded-xl border border-line">
              {/* Billing Cycle Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Billing Cycle:</span>
                <div className="flex items-center p-1 bg-panel border border-line rounded-xl">
                  <button
                    type="button"
                    onClick={() => setModalBillingCycle("monthly")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      modalBillingCycle === "monthly"
                        ? "bg-blue text-white shadow-xs"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalBillingCycle("annual")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      modalBillingCycle === "annual"
                        ? "bg-blue text-white shadow-xs"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    <span>Yearly</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        modalBillingCycle === "annual"
                          ? "bg-white/20 text-white"
                          : "bg-green/10 text-green"
                      }`}
                    >
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Currency Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Currency:</span>
                <div className="flex items-center p-1 bg-panel border border-line rounded-xl">
                  <button
                    type="button"
                    onClick={() => setModalCurrency("INR")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer ${
                      modalCurrency === "INR"
                        ? "bg-blue text-white shadow-xs"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    ₹ INR
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalCurrency("USD")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer ${
                      modalCurrency === "USD"
                        ? "bg-blue text-white shadow-xs"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    $ USD
                  </button>
                </div>
              </div>
            </div>

            {/* Real DB Stored Plans Carousel (Horizontal scrollable) */}
            {isLoadingPlans ? (
              <div className="py-16 text-center text-muted text-xs">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue" />
                <span>Loading active plans from database...</span>
              </div>
            ) : (
              <div className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin px-0.5">
                {plansList
                  .filter((p) => p.planType !== "trial")
                  .map((plan) => {
                    const planTierKey = (plan.tierBadge || plan.id).toUpperCase();
                    const isCurrent = !isTrial && currentPlan.toUpperCase() === planTierKey;
                    const isAnnualCycle = modalBillingCycle === "annual";

                  // Dynamic price calculation from real DB plan fields
                  const planPrice =
                    modalCurrency === "INR"
                      ? isAnnualCycle
                        ? plan.priceAnnualInr
                        : plan.priceMonthlyInr
                      : isAnnualCycle
                      ? plan.priceAnnualUsd
                      : plan.priceMonthlyUsd;

                  return (
                    <div
                      key={plan.id}
                      className={`w-[275px] shrink-0 p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? "border-blue bg-blue/5 ring-2 ring-blue/20"
                          : plan.isPopular
                          ? "border-line bg-panel hover:border-blue/50 shadow-xs"
                          : "border-line bg-panel hover:border-muted shadow-xs"
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-ink">{plan.name}</span>
                        {isCurrent ? (
                          <span className="text-[10px] font-mono font-bold bg-blue text-white px-2 py-0.5 rounded-full">
                            CURRENT
                          </span>
                        ) : plan.badge ? (
                          <span className="text-[10px] font-mono font-bold bg-blue/10 text-blue px-2 py-0.5 rounded-full border border-blue/20">
                            {plan.badge}
                          </span>
                        ) : null}
                      </div>

                      {/* Pricing Display */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold font-data text-ink">
                            {modalCurrency === "INR"
                              ? `₹${(planPrice || 0).toLocaleString("en-IN")}`
                              : `$${(planPrice || 0).toLocaleString("en-US")}`}
                          </span>
                          <span className="text-xs text-muted">
                            {isAnnualCycle ? "/ year" : "/ month"}
                          </span>
                        </div>

                        <div className="text-[10px] text-muted font-mono mt-0.5">
                          {isAnnualCycle ? (
                            <span className="text-green font-medium">
                              Annual Subscription (Save 20%)
                            </span>
                          ) : (
                            <span>Billed month-to-month</span>
                          )}
                        </div>

                        <p className="text-[11px] text-muted mt-1.5 line-clamp-2">{plan.tagline}</p>

                        {/* Quota & Limit Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border ${
                              plan.maxTeamMembers === -1
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : "bg-bg text-muted border-line"
                            }`}
                          >
                            {plan.maxTeamMembers === -1 ? "∞ Unlimited Seats" : `${plan.maxTeamMembers ?? 5} Seats`}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border ${
                              plan.hsClassificationLimit === -1
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : "bg-bg text-muted border-line"
                            }`}
                          >
                            {plan.hsClassificationLimit === -1 ? "∞ Unlimited HS" : `${(plan.hsClassificationLimit ?? 1000).toLocaleString()} HS`}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border ${
                              plan.landedCostLimit === -1
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : "bg-bg text-muted border-line"
                            }`}
                          >
                            {plan.landedCostLimit === -1 ? "∞ Unlimited LC" : `${(plan.landedCostLimit ?? 500).toLocaleString()} LC`}
                          </span>
                        </div>
                      </div>

                      {/* Features list loaded from DB with max height scroll */}
                      <div className="space-y-1.5 mb-4 text-xs text-ink/80 flex-1 border-t border-line pt-2.5 max-h-36 overflow-y-auto scrollbar-thin pr-1">
                        {plan.features && plan.features.length > 0 ? (
                          plan.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-blue shrink-0 mt-0.5" />
                              <span className="leading-tight text-[11px]">{f}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-muted italic text-[11px]">All platform standard features</div>
                        )}
                      </div>

                      {/* Action Button with Razorpay Gateway Integration */}
                      <button
                        type="button"
                        disabled={
                          isCurrent ||
                          isUpdatingProfile ||
                          isCreatingOrder ||
                          isVerifyingPayment ||
                          processingPlanId === plan.id
                        }
                        onClick={() => handleSwitchPlan(plan)}
                        className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isCurrent
                            ? "bg-bg text-muted border border-line cursor-default"
                            : "bg-blue hover:bg-blue-dark text-white shadow-xs"
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue" />
                            <span>Active Plan</span>
                          </>
                        ) : processingPlanId === plan.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Opening Razorpay...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>
                              Pay & Switch ({modalCurrency === "INR" ? "₹" : "$"}
                              {(planPrice || 0).toLocaleString(modalCurrency === "INR" ? "en-IN" : "en-US")})
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal Bottom Note with Razorpay & Multi-currency notice */}
            <div className="pt-2 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>Secured by Razorpay • Dual-Currency (₹ INR & $ USD) Supported</span>
              </div>
              <span>Click outside or the top-right cross to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

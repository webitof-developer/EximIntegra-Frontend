"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  ExternalLink,
  Layers,
  Zap,
  Globe2,
  Lock,
} from "lucide-react";
import {
  useGetAdminPaymentConfigQuery,
  useUpdateAdminPaymentConfigMutation,
  useGetAdminTransactionsQuery,
  AdminTransactionItem,
} from "@/store/paymentsApi";

interface RazorpayGatewaySectionProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function RazorpayGatewaySection({
  onSuccess,
  onError,
}: RazorpayGatewaySectionProps) {
  const {
    data: config,
    isLoading: isLoadingConfig,
    refetch: refetchConfig,
  } = useGetAdminPaymentConfigQuery();

  const {
    data: rawTransactions,
    isLoading: isLoadingTx,
    refetch: refetchTx,
  } = useGetAdminTransactionsQuery();

  const transactions: AdminTransactionItem[] = Array.isArray(rawTransactions)
    ? rawTransactions
    : Array.isArray((rawTransactions as unknown as { transactions?: AdminTransactionItem[] })?.transactions)
    ? (rawTransactions as unknown as { transactions: AdminTransactionItem[] }).transactions
    : [];

  const [updateConfig, { isLoading: isSaving }] =
    useUpdateAdminPaymentConfigMutation();

  // Form states
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isTestMode, setIsTestMode] = useState(true);
  const [currencyInrEnabled, setCurrencyInrEnabled] = useState(true);
  const [currencyUsdEnabled, setCurrencyUsdEnabled] = useState(true);
  const [autoCapture, setAutoCapture] = useState(true);

  // Visibility toggles
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Sync state when config loads from backend
  useEffect(() => {
    if (config) {
      setKeyId(config.keyId || "");
      setKeySecret(config.keySecret || "");
      setWebhookSecret(config.webhookSecret || "");
      setIsActive(config.isActive ?? true);
      setIsTestMode(config.isTestMode ?? true);
      setCurrencyInrEnabled(config.currencyInrEnabled ?? true);
      setCurrencyUsdEnabled(config.currencyUsdEnabled ?? true);
      setAutoCapture(config.autoCapture ?? true);
    }
  }, [config]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyId.trim()) {
      onError("Please enter a valid Razorpay Key ID (e.g. rzp_test_... or rzp_live_...)");
      return;
    }

    try {
      await updateConfig({
        keyId: keyId.trim(),
        keySecret: keySecret.trim() ? keySecret.trim() : undefined,
        webhookSecret: webhookSecret.trim() ? webhookSecret.trim() : undefined,
        isActive,
        isTestMode,
        currencyInrEnabled,
        currencyUsdEnabled,
        autoCapture,
      }).unwrap();

      onSuccess("Razorpay Gateway settings saved successfully to PostgreSQL database!");
      refetchConfig();
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      onError(errorObj?.data?.error || "Failed to update Razorpay configuration.");
    }
  };

  const handleRefreshAll = () => {
    refetchConfig();
    refetchTx();
    onSuccess("Payment gateway settings and transaction logs refreshed.");
  };

  if (isLoadingConfig) {
    return (
      <div className="p-12 text-center text-muted flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue" />
        <span className="text-xs font-mono">Loading Razorpay Gateway Configuration...</span>
      </div>
    );
  }

  const isConfigured = Boolean(config?.keyId);

  return (
    <div className="space-y-8">
      {/* Top Status & Currency Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gateway Status */}
        <div className="bg-panel border border-line rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
              Gateway State
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isActive ? "bg-emerald-500 animate-pulse" : "bg-muted"
                }`}
              />
              <span className="text-sm font-bold text-ink">
                {isActive ? "Active & Accepting" : "Gateway Disabled"}
              </span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted/10 text-muted"
            }`}
          >
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Operating Mode */}
        <div className="bg-panel border border-line rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
              Operating Mode
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink">
                {isTestMode ? "Sandbox / Test Mode" : "Production / Live"}
              </span>
            </div>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                isTestMode
                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              }`}
            >
              {isTestMode ? "rzp_test keys" : "rzp_live keys"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue/10 text-blue flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* INR Currency Support */}
        <div className="bg-panel border border-line rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
              Domestic (INR)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-ink">₹ INR Currency</span>
              {currencyInrEnabled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-muted" />
              )}
            </div>
            <span className="text-[11px] text-muted">Paise multiplier (x100)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-base">
            ₹
          </div>
        </div>

        {/* USD Currency Support */}
        <div className="bg-panel border border-line rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
              International (USD)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-ink">$ USD Currency</span>
              {currencyUsdEnabled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-muted" />
              )}
            </div>
            <span className="text-[11px] text-muted">Cents multiplier (x100)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-base">
            $
          </div>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-panel border border-line rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue" />
              <h2 className="text-lg font-bold text-ink">Razorpay Credentials & Setup</h2>
            </div>
            <p className="text-xs text-muted mt-1">
              Store your Razorpay API credentials securely in the PostgreSQL database.
              Keys are encrypted and never exposed to public frontend clients.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshAll}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-panel hover:bg-line/20 text-ink border border-line text-xs font-semibold shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <a
              href="https://dashboard.razorpay.com/#/access/api-keys"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue/10 hover:bg-blue/20 text-blue border border-blue/20 text-xs font-semibold transition-colors"
            >
              <span>Razorpay Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Toggles Row: Active, Mode, Multi-currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-line/10 rounded-xl border border-line">
            {/* Active Toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue focus:ring-blue border-line"
              />
              <div className="text-xs">
                <span className="font-semibold text-ink block">Enable Gateway</span>
                <span className="text-[11px] text-muted">Allow subscription checkouts</span>
              </div>
            </label>

            {/* Test Mode Toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isTestMode}
                onChange={(e) => setIsTestMode(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-line"
              />
              <div className="text-xs">
                <span className="font-semibold text-ink block">Sandbox / Test Mode</span>
                <span className="text-[11px] text-muted">Test without real cards</span>
              </div>
            </label>

            {/* INR Support */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={currencyInrEnabled}
                onChange={(e) => setCurrencyInrEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600 border-line"
              />
              <div className="text-xs">
                <span className="font-semibold text-ink block">Enable INR (₹)</span>
                <span className="text-[11px] text-muted">UPI, NetBanking, RuPay</span>
              </div>
            </label>

            {/* USD Support */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={currencyUsdEnabled}
                onChange={(e) => setCurrencyUsdEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-line"
              />
              <div className="text-xs">
                <span className="font-semibold text-ink block">Enable USD ($)</span>
                <span className="text-[11px] text-muted">International Cards & SWIFT</span>
              </div>
            </label>
          </div>

          {/* Key ID & Secret Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key ID */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink flex items-center justify-between">
                <span>Razorpay Key ID (Key) *</span>
                <span className="text-[10px] font-mono text-muted">
                  {isTestMode ? "rzp_test_..." : "rzp_live_..."}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keyId}
                  onChange={(e) => setKeyId(e.target.value)}
                  placeholder={isTestMode ? "rzp_test_your_key_id" : "rzp_live_your_key_id"}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-panel border border-line text-ink text-xs font-mono focus:outline-hidden focus:border-blue"
                  required
                />
              </div>
              <p className="text-[11px] text-muted">
                Public identification token required for Razorpay Checkout JS modal.
              </p>
            </div>

            {/* Key Secret */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink flex items-center justify-between">
                <span>Razorpay Key Secret *</span>
                {Boolean(config?.keySecret || config?.hasKeySecret) && (
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Saved in DB
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={keySecret}
                  onChange={(e) => setKeySecret(e.target.value)}
                  placeholder="Enter Razorpay Secret Key"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-panel border border-line text-ink text-xs font-mono focus:outline-hidden focus:border-blue"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors cursor-pointer"
                  title={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted">
                Used strictly on the backend for HMAC-SHA256 signature verification.
              </p>
            </div>
          </div>

          {/* Webhook Secret & Auto-Capture Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Webhook Secret */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink flex items-center justify-between">
                <span>Webhook Secret (Optional)</span>
                {Boolean(config?.webhookSecret || config?.hasWebhookSecret) && (
                  <span className="text-[10px] font-mono text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Saved in DB
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showWebhookSecret ? "text" : "password"}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Optional Webhook Secret from Razorpay Dashboard"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-panel border border-line text-ink text-xs font-mono focus:outline-hidden focus:border-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors cursor-pointer"
                  title={showWebhookSecret ? "Hide webhook secret" : "Show webhook secret"}
                >
                  {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted">
                Endpoint: <code className="text-ink font-mono">/api/v1/payments/webhook</code> (validates asynchronous order payment webhooks).
              </p>
            </div>

            {/* Auto Capture */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink block">
                Payment Capture Mode
              </label>
              <div className="p-3 bg-panel border border-line rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-ink">Auto-Capture Payments</span>
                  <p className="text-[11px] text-muted">
                    Automatically settles funds upon successful card/UPI authorization.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoCapture}
                  onChange={(e) => setAutoCapture(e.target.checked)}
                  className="w-4 h-4 rounded text-blue focus:ring-blue border-line"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-line">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>
                {isConfigured
                  ? "Configured in PostgreSQL. Ready for live transactions."
                  : "Not configured yet. Simulation fallback enabled until keys are saved."}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to DB...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Razorpay Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Currency & Conversion Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-panel border border-line rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-ink font-bold text-sm">
            <Globe2 className="w-4 h-4 text-purple-600" />
            <span>Dual-Currency Processing (INR & USD)</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            EximIntegra seamlessly accepts both Indian Rupees (₹) and US Dollars ($).
            When a user selects an INR subscription plan, the backend calculates the amount in
            <strong className="text-ink"> Paise (₹1 = 100 paise)</strong>. When a global user selects a USD plan,
            Razorpay charges in <strong className="text-ink"> Cents ($1 = 100 cents)</strong>.
          </p>
          <div className="p-3 bg-line/10 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted">Domestic (INR):</span>
              <span className="font-mono font-medium text-ink">UPI, NetBanking, RuPay & Domestic Cards</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">International (USD):</span>
              <span className="font-mono font-medium text-ink">Global Cards (Visa, Mastercard, Amex)</span>
            </div>
          </div>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-ink font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Cryptographic Verification & Tier Upgrade</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Every transaction undergoes HMAC-SHA256 signature verification comparing
            <code className="text-ink font-mono text-[11px]"> razorpay_order_id + "|" + razorpay_payment_id</code> against the stored secret key. Once verified, the user&apos;s organization subscription tier is atomically upgraded in PostgreSQL.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Zero payment tampering risk with server-side validation.</span>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-panel border border-line rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-line">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue" />
              <h3 className="text-base font-bold text-ink">Recent Razorpay Transactions</h3>
            </div>
            <p className="text-xs text-muted">
              Live subscription transactions and order settlement records from the database.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchTx()}
            disabled={isLoadingTx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-line/20 hover:bg-line/30 text-ink text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTx ? "animate-spin" : ""}`} />
            <span>Refresh Transactions</span>
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-muted border border-dashed border-line rounded-xl space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-muted/50" />
            <p className="text-xs font-medium">No payment transactions recorded yet.</p>
            <p className="text-[11px] text-muted">
              When users upgrade their subscription plans via Razorpay, transaction receipts will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-line text-muted uppercase text-[10px] font-mono tracking-wider">
                  <th className="py-2.5 px-3">Order ID / Payment ID</th>
                  <th className="py-2.5 px-3">User & Organization</th>
                  <th className="py-2.5 px-3">Plan / Cycle</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-line/10 transition-colors font-mono">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-ink">{tx.orderId}</div>
                      {tx.paymentId && (
                        <div className="text-[10px] text-muted">{tx.paymentId}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-medium text-ink">{tx.userName || tx.userEmail || "—"}</div>
                      <div className="text-[11px] text-muted">{tx.organizationName || "—"}</div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="font-bold text-ink uppercase">{tx.planId}</span>
                      <span className="text-muted text-[11px] ml-1.5 capitalize">({tx.billingCycle})</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-ink">
                        {tx.currency === "INR" ? "₹" : "$"}
                        {Number(tx.amount).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted ml-1 uppercase">{tx.currency}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : tx.status === "FAILED"
                            ? "bg-red/10 text-red border border-red/20"
                            : "bg-blue/10 text-blue border border-blue/20"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

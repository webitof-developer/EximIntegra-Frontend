"use client";

import React, { useState, useEffect } from "react";
import { DutyCalculationRequest } from "@/lib/types";
import { ProvenanceBadge } from "@/components/ui/ProvenanceBadge";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  Calculator,
  Globe,
  FileCheck,
  DollarSign,
  HelpCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface DutyCalculationFormProps {
  initialHsCode?: string;
  initialDescription?: string;
  initialOrigin?: string;
  initialValue?: number;
  initialCurrency?: string;
  initialQuantity?: number;
  initialUnit?: string;
  onSubmit: (request: DutyCalculationRequest) => void;
  isLoading: boolean;
}

export function DutyCalculationForm({
  initialHsCode = "",
  initialDescription = "",
  initialOrigin = "US",
  initialValue = 0,
  initialCurrency = "USD",
  initialQuantity = 1,
  initialUnit = "MT",
  onSubmit,
  isLoading,
}: DutyCalculationFormProps) {
  const [hsCode, setHsCode] = useState(initialHsCode);
  const [assessableValue, setAssessableValue] = useState<number>(initialValue);
  const [currency, setCurrency] = useState(initialCurrency);
  const [exchangeRate, setExchangeRate] = useState<number>(86.5);
  const [countryOfOrigin, setCountryOfOrigin] = useState(initialOrigin);
  const [tradeAgreement, setTradeAgreement] = useState("STANDARD_MFN");
  const [freightAmount, setFreightAmount] = useState<number>(0);
  const [insuranceAmount, setInsuranceAmount] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [unit, setUnit] = useState(initialUnit);

  // Sync if initial props change via Redux contextSlice
  useEffect(() => {
    if (initialHsCode) setHsCode(initialHsCode);
    if (initialOrigin) setCountryOfOrigin(initialOrigin);
    if (initialValue) setAssessableValue(initialValue);
    if (initialCurrency) setCurrency(initialCurrency);
  }, [initialHsCode, initialOrigin, initialValue, initialCurrency]);

  // Adjust CBIC default exchange rate on currency change
  const handleCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    if (newCurr === "USD") setExchangeRate(86.5);
    else if (newCurr === "EUR") setExchangeRate(93.2);
    else if (newCurr === "AED") setExchangeRate(23.55);
    else if (newCurr === "INR") setExchangeRate(1.0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      hs_code: hsCode,
      assessable_value: assessableValue,
      currency,
      exchange_rate: exchangeRate,
      country_of_origin: countryOfOrigin,
      trade_agreement: tradeAgreement,
      freight_amount: freightAmount,
      insurance_amount: insuranceAmount,
      quantity,
      unit,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Active Commodity Context Banner */}
      {initialHsCode && (
        <div className="p-2.5 bg-blue-dim/60 border border-blue/20 rounded-lg flex items-center justify-between gap-3 text-xs text-blue">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue" />
            <span>
              Active Commodity:{" "}
              <strong className="font-mono font-bold text-ink">
                {initialHsCode}
              </strong>{" "}
              {initialDescription && `• ${initialDescription}`}
            </span>
          </div>
        </div>
      )}

      {/* HS Code & Country Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Tariff Item (HS Code) <span className="text-red">*</span>
          </label>
          <input
            type="text"
            required
            value={hsCode}
            onChange={(e) => setHsCode(e.target.value)}
            placeholder="e.g. 7204.49.00"
            className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono font-bold focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
          />
          <span className="text-[10px] text-muted mt-1 block">
            6 or 8 digits under Customs Tariff Act 2026
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Country of Origin <span className="text-red">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <select
              value={countryOfOrigin}
              onChange={(e) => setCountryOfOrigin(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue cursor-pointer"
            >
              <option value="US">United States (US)</option>
              <option value="AE">United Arab Emirates (AE)</option>
              <option value="AU">Australia (AU)</option>
              <option value="CN">China (CN)</option>
              <option value="DE">Germany (DE / EU)</option>
              <option value="JP">Japan (JP)</option>
              <option value="VN">Vietnam (VN)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Trade Agreement / FTA
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <select
              value={tradeAgreement}
              onChange={(e) => setTradeAgreement(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue cursor-pointer"
            >
              <option value="STANDARD_MFN">Standard MFN Statutory Tariff</option>
              <option value="INDIA_UAE_CEPA">
                India-UAE CEPA (Preferential 0% / Reduced)
              </option>
              <option value="INDIA_AUS_ECTA">
                India-Australia ECTA (Concessional)
              </option>
              <option value="INDIA_ASEAN_AIFTA">
                ASEAN-India AIFTA (Reduced Tariff)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Valuation & Exchange Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Invoice FOB / Ex-Works Value
          </label>
          <div className="flex items-center gap-1.5">
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-20 py-2 px-2 text-xs bg-bg border border-line rounded-lg text-ink font-mono font-bold focus:outline-none focus:border-blue cursor-pointer"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="AED">AED</option>
              <option value="INR">INR</option>
            </select>
            <input
              type="number"
              required
              value={assessableValue}
              onChange={(e) => setAssessableValue(Number(e.target.value))}
              className="flex-1 py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono font-semibold focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            CBIC Gazette Exchange Rate
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
            />
            <span className="text-xs font-mono text-muted">INR</span>
          </div>
          <span className="text-[10px] text-muted mt-1 block">
            CBIC Notification 18/2026
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Ocean / Air Freight ({currency})
          </label>
          <input
            type="number"
            value={freightAmount}
            onChange={(e) => setFreightAmount(Number(e.target.value))}
            className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
          />
          <span className="text-[10px] text-muted mt-1 block">
            Actual or 20% FOB standard cap
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Marine Transit Insurance ({currency})
          </label>
          <input
            type="number"
            value={insuranceAmount}
            onChange={(e) => setInsuranceAmount(Number(e.target.value))}
            className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
          />
          <span className="text-[10px] text-muted mt-1 block">
            Actual or 1.125% FOB standard
          </span>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-2 flex items-center justify-between border-t border-line">
        <div className="flex items-center gap-2 text-[11px] text-muted font-mono">
          <span>CBIC Tariff Gateway:</span>
          <ProvenanceBadge type="LIVE" source="Customs First Schedule" compact />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green hover:bg-green-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Calculator className="w-4 h-4" />
          <span>
            {isLoading
              ? "Computing Statutory Duties..."
              : "Calculate Customs Duties & Taxes"}
          </span>
        </button>
      </div>
    </form>
  );
}

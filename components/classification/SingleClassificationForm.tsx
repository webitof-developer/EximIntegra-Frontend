"use client";

import React, { useState } from "react";
import { ClassificationRequest } from "@/lib/types";
import {
  Search,
  Sparkles,
  ArrowRight,
  Globe,
  Tag,
  DollarSign,
  Package,
} from "lucide-react";

interface SingleClassificationFormProps {
  onSubmit: (request: ClassificationRequest & { assessableValue?: number; currency?: string; quantity?: number; unit?: string }) => void;
  isLoading: boolean;
}

const presets = [
  {
    label: "Heavy Melting Steel Scrap (HMS 1/2)",
    description: "Prepared heavy melting steel scrap for induction furnace melting, clean cut fragments",
    category: "Metals & Scrap",
    origin: "US",
    value: 42000,
    currency: "USD",
  },
  {
    label: "Lithium-Ion Cylindrical Battery Cells",
    description: "Cylindrical 21700 lithium-ion rechargeable battery cells for EV battery packs",
    category: "Electrical Equipment",
    origin: "CN",
    value: 125000,
    currency: "USD",
  },
  {
    label: "Monocrystalline Solar PV Modules",
    description: "Monocrystalline silicon photovoltaic solar modules assembled with bypass diodes, 550W rating",
    category: "Electrical Equipment",
    origin: "VN",
    value: 88000,
    currency: "USD",
  },
  {
    label: "Copper Wire Scrap (ISRI Berry)",
    description: "No. 1 bare bright unalloyed copper wire scrap, ISRI grade Berry, 99.9% Cu content",
    category: "Metals & Scrap",
    origin: "AE",
    value: 65000,
    currency: "USD",
  },
];

export function SingleClassificationForm({
  onSubmit,
  isLoading,
}: SingleClassificationFormProps) {
  const [description, setDescription] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("US");
  const [assessableValue, setAssessableValue] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState("MT");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit({
      description,
      material_type: materialType,
      country_of_origin: countryOfOrigin,
      assessableValue,
      currency,
      quantity,
      unit,
    });
  };

  const applyPreset = (preset: (typeof presets)[0]) => {
    setDescription(preset.description);
    setMaterialType(preset.category);
    setCountryOfOrigin(preset.origin);
    setAssessableValue(preset.value);
    setCurrency(preset.currency);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Quick Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue" />
            Quick Sourcing Presets
          </label>
          <span className="text-[11px] text-muted">Click to populate</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-bg hover:bg-blue-dim hover:text-blue hover:border-blue/30 border border-line text-ink transition-colors cursor-pointer select-none font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material Description Input */}
      <div>
        <label
          htmlFor="material-description"
          className="block text-xs font-semibold text-ink mb-1.5"
        >
          Detailed Commercial Description of Goods{" "}
          <span className="text-red">*</span>
        </label>
        <textarea
          id="material-description"
          rows={3}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="E.g., Heavy melting steel scrap HMS 1/2 prepared according to ISRI 200-202 specifications..."
          className="w-full p-3 text-xs bg-bg border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors leading-relaxed"
        />
        <p className="text-[11px] text-muted mt-1">
          Include material composition, grade, form (cut, ingot, powder), and intended end-use for highest GIR confidence.
        </p>
      </div>

      {/* Sourcing & Commercial Context Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Commodity Class
          </label>
          <select
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue cursor-pointer"
          >
            <option value="Metals & Scrap">Metals & Ferrous Scrap (Ch. 72-83)</option>
            <option value="Electrical Equipment">Electrical Machinery (Ch. 85)</option>
            <option value="Chemicals">Organic & Inorganic Chemicals (Ch. 28-38)</option>
            <option value="Textiles">Textiles & Articles (Ch. 50-63)</option>
            <option value="Minerals">Mineral Fuels & Ores (Ch. 25-27)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Country of Origin
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
              <option value="CN">China (CN)</option>
              <option value="AE">United Arab Emirates (AE - CEPA)</option>
              <option value="AU">Australia (AU - ECTA)</option>
              <option value="DE">Germany / EU (DE)</option>
              <option value="VN">Vietnam (VN - ASEAN)</option>
              <option value="JP">Japan (JP - CEPA)</option>
              <option value="KR">South Korea (KR - CEPA)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Consignment Valuation
          </label>
          <div className="flex items-center gap-1.5">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-20 py-2 px-2 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue cursor-pointer"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="AED">AED</option>
              <option value="INR">INR</option>
            </select>
            <input
              type="number"
              value={assessableValue}
              onChange={(e) => setAssessableValue(Number(e.target.value))}
              placeholder="Value"
              className="flex-1 py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Batch Quantity
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="flex-1 py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-16 py-2 px-2 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue cursor-pointer"
            >
              <option value="MT">MT</option>
              <option value="KG">KG</option>
              <option value="PCS">PCS</option>
              <option value="L">L</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Action Button */}
      <div className="pt-2 flex items-center justify-between border-t border-line">
        <span className="text-[11px] text-muted font-mono">
          Engine: Customs Tariff Act 2026 + WCO GIR Rules 1-6
        </span>
        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="font-mono">Evaluating GIR Rules...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Determine HS Classification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

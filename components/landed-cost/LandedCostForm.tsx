"use client";

import React, { useState, useEffect } from "react";
import { LandedCostRequest } from "@/lib/types";
import { ProvenanceBadge } from "@/components/ui/ProvenanceBadge";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  Ship,
  Anchor,
  Truck,
  FileCheck2,
  Percent,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Flame,
} from "lucide-react";

interface LandedCostFormProps {
  initialDutyId?: string;
  initialHsCode?: string;
  initialQuantity?: number;
  initialUnit?: string;
  onSubmit: (request: LandedCostRequest) => void;
  isLoading: boolean;
}

export function LandedCostForm({
  initialDutyId = "calc_062751",
  initialHsCode = "7204.49.00",
  initialQuantity = 100,
  initialUnit = "MT",
  onSubmit,
  isLoading,
}: LandedCostFormProps) {
  const [dutyId, setDutyId] = useState(initialDutyId);
  const [hsCode, setHsCode] = useState(initialHsCode);
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [unit, setUnit] = useState(initialUnit);
  const [port, setPort] = useState("Nhava Sheva (JNPT), Mumbai");

  // Port and Logistics Incurred Costs (INR)
  const [thcAmount, setThcAmount] = useState<number>(85000);
  const [chaAmount, setChaAmount] = useState<number>(22500);
  const [inlandAmount, setInlandAmount] = useState<number>(120000);
  const [financeAmount, setFinanceAmount] = useState<number>(48000);

  // Metal Composition and Recovery Inputs (§2.3)
  const [containedMetal, setContainedMetal] = useState("Iron (Fe)");
  const [assayPurity, setAssayPurity] = useState<number>(92.5);
  const [recoveryYield, setRecoveryYield] = useState<number>(91.0);

  useEffect(() => {
    if (initialDutyId) setDutyId(initialDutyId);
    if (initialHsCode) setHsCode(initialHsCode);
    if (initialQuantity) setQuantity(initialQuantity);
  }, [initialDutyId, initialHsCode, initialQuantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      duty_calculation_id: dutyId,
      hs_code: hsCode,
      quantity,
      unit,
      port_of_discharge: port,
      thc_cfs_handling_inr: thcAmount,
      cha_agency_inr: chaAmount,
      inland_transit_inr: inlandAmount,
      finance_insurance_inr: financeAmount,
      contained_metal: containedMetal,
      assay_purity_percent: assayPurity,
      smelter_recovery_yield_percent: recoveryYield,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prior Duty Calculation Reference Banner */}
      <div className="p-3 bg-blue-dim/60 border border-blue/20 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-blue">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5" />
          <span>
            Linked to Prior Duty Calculation:{" "}
            <strong className="font-mono font-bold text-ink">
              {dutyId || "calc_latest"}
            </strong>{" "}
            &bull; Tariff Item:{" "}
            <strong className="font-mono text-ink">{hsCode}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill label="PHASE 3 INHERITED" variant="primary" size="xs" />
          <ProvenanceBadge type="LIVE" source="Statutory Duty Model" compact />
        </div>
      </div>

      {/* Port & Logistics Configuration */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono uppercase tracking-wider text-muted font-bold flex items-center gap-1.5">
          <Anchor className="w-3.5 h-3.5 text-blue" />
          1. Port of Discharge & Clearing Parameters
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Port of Discharge
            </label>
            <select
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue cursor-pointer"
            >
              <option value="Nhava Sheva (JNPT), Mumbai">
                Nhava Sheva (JNPT), Mumbai [INNSA1]
              </option>
              <option value="Mundra Port, Gujarat">Mundra Port, Gujarat [INMUN1]</option>
              <option value="Chennai Port, Tamil Nadu">Chennai Port [INMAA1]</option>
              <option value="Kolkata Port, West Bengal">Kolkata Port [INCCU1]</option>
              <option value="Hazira Port, Surat">Hazira Port, Surat [INHZA1]</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Batch Consignment Volume
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="flex-1 py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono font-bold focus:outline-none focus:border-blue"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-18 py-2 px-2 text-xs bg-bg border border-line rounded-lg text-ink font-mono cursor-pointer"
              >
                <option value="MT">MT</option>
                <option value="KG">KG</option>
                <option value="PCS">PCS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Port THC & CFS Handling (INR)
            </label>
            <input
              type="number"
              value={thcAmount}
              onChange={(e) => setThcAmount(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
            />
            <span className="text-[10px] text-muted mt-1 block">
              Terminal handling & CFS de-stuffing
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Customs Clearing (CHA) Fees (INR)
            </label>
            <input
              type="number"
              value={chaAmount}
              onChange={(e) => setChaAmount(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
            />
            <span className="text-[10px] text-muted mt-1 block">
              Bill of Entry filing & inspection
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Inland Multimodal Transit to Plant (INR)
            </label>
            <input
              type="number"
              value={inlandAmount}
              onChange={(e) => setInlandAmount(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
            />
            <span className="text-[10px] text-muted mt-1 block">
              Container trailer freight to plant gate
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Finance & Detention Buffer (INR)
            </label>
            <input
              type="number"
              value={financeAmount}
              onChange={(e) => setFinanceAmount(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
            />
            <span className="text-[10px] text-muted mt-1 block">
              LC commission & free-time risk allowance
            </span>
          </div>
        </div>
      </div>

      {/* Composition & Metal Recovery Yield Parameters (§2.3) */}
      <div className="p-4 bg-[#FAFBFD] border border-line rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber" />
            2. Smelter Metallurgy & Contained Metal Recovery (§2.3)
          </h4>
          <ProvenanceBadge
            type="ILLUSTRATIVE"
            source="Smelter Assay Standard"
            compact
          />
        </div>

        <p className="text-xs text-muted leading-relaxed">
          For metals and scrap commodities, the true economic cost is measured per
          ton of pure recoverable metallic yield at the induction furnace.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Primary Contained Element
            </label>
            <select
              value={containedMetal}
              onChange={(e) => setContainedMetal(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue cursor-pointer"
            >
              <option value="Iron (Fe)">Iron (Fe) — Ferrous Scrap</option>
              <option value="Copper (Cu)">Copper (Cu) — Non-Ferrous</option>
              <option value="Aluminium (Al)">Aluminium (Al) — Foundry Scrap</option>
              <option value="Nickel (Ni)">Nickel (Ni) — Superalloys</option>
              <option value="Zinc (Zn)">Zinc (Zn) — Die-cast</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Assay Purity Specification (%)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.1"
                min="50"
                max="100"
                value={assayPurity}
                onChange={(e) => setAssayPurity(Number(e.target.value))}
                className="flex-1 py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono font-bold focus:outline-none focus:border-blue"
              />
              <span className="text-xs font-mono text-muted">%</span>
            </div>
            <span className="text-[10px] text-muted mt-1 block">
              Certified spectrometer assay test
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Furnace Smelter Recovery Yield (%)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.1"
                min="50"
                max="100"
                value={recoveryYield}
                onChange={(e) => setRecoveryYield(Number(e.target.value))}
                className="flex-1 py-2 px-3 text-xs bg-bg border border-line rounded-lg text-ink font-mono font-bold text-amber focus:outline-none focus:border-blue"
              />
              <span className="text-xs font-mono text-muted">%</span>
            </div>
            <span className="text-[10px] text-muted mt-1 block">
              Net yield after oxidation/dross loss
            </span>
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-2 flex items-center justify-between border-t border-line">
        <span className="text-[11px] text-muted font-mono">
          Engine: Multimodal CIF + Customs Duty + Port Clearance + Metallurgy
        </span>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber hover:bg-amber-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Ship className="w-4 h-4" />
          <span>
            {isLoading
              ? "Modeling Landed Economics..."
              : "Compute Complete Landed Cost & Yield"}
          </span>
        </button>
      </div>
    </form>
  );
}

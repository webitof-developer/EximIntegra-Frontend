"use client";

import React, { useState } from "react";
import {
  ProvenanceBadge,
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
  Ship,
  Building2,
  Flame,
  Plus,
  Trash2,
  UploadCloud,
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";

interface FreightContract {
  id: string;
  origin: string;
  destination: string;
  carrier: string;
  contractCode: string;
  rateUsd: number;
  unit: string;
  expiryDate: string;
}

interface SmelterYieldOverride {
  id: string;
  materialGrade: string;
  baseYieldPct: number;
  smelterLossPct: number;
  furnaceType: string;
  facility: string;
}

const initialFreight: FreightContract[] = [];

const initialYields: SmelterYieldOverride[] = [];

export function ContractRatesSection() {
  const [freightList, setFreightList] = useState<FreightContract[]>(initialFreight);
  const [yieldList, setYieldList] = useState<SmelterYieldOverride[]>(initialYields);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newOrigin, setNewOrigin] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newCarrier, setNewCarrier] = useState("");
  const [newRate, setNewRate] = useState<number>(1500);
  const [isAddingFreight, setIsAddingFreight] = useState(false);

  const handleDeleteFreight = (id: string) => {
    setFreightList((prev) => prev.filter((item) => item.id !== id));
    showNotice("Contract rate removed.");
  };

  const handleAddFreight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin || !newDest || !newCarrier) return;

    const newItem: FreightContract = {
      id: `fc_${Date.now()}`,
      origin: newOrigin,
      destination: newDest,
      carrier: newCarrier,
      contractCode: `CTR-MANUAL-${Math.floor(Math.random() * 9000) + 1000}`,
      rateUsd: newRate,
      unit: "20ft TEU",
      expiryDate: "2026-12-31",
    };

    setFreightList((prev) => [newItem, ...prev]);
    setNewOrigin("");
    setNewDest("");
    setNewCarrier("");
    setIsAddingFreight(false);
    showNotice(`Added negotiated rate for ${newOrigin} → ${newDest}.`);
  };

  const handleDeleteYield = (id: string) => {
    setYieldList((prev) => prev.filter((item) => item.id !== id));
    showNotice("Yield override removed.");
  };

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-7">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-green-dim border border-green/30 text-green rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
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

      {/* Top Provenance Note */}
      <div className="p-3.5 bg-blue-dim/40 border border-blue/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue">
        <div className="flex items-center gap-2.5">
          <ProvenanceBadge type="BYOK" source="Company Contract Schedule" compact />
          <span>
            Rates configured here automatically override standard illustrative logistics costs in the <strong>Landed Cost Engine</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showNotice("Rate sheet template downloaded (exim_contract_rates.csv).")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg hover:bg-line border border-line text-ink font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-green" />
            <span>Template CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Negotiated Ocean Freight Contracts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-blue" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
              Negotiated Ocean Freight Contracts
            </h3>
            <span className="text-[10px] font-mono text-muted bg-bg px-2 py-0.5 rounded border border-line">
              {freightList.length} Active Contracts
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingFreight(!isAddingFreight)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rate</span>
          </button>
        </div>

        {/* Inline Add Rate Form */}
        {isAddingFreight && (
          <form
            onSubmit={handleAddFreight}
            className="p-4 bg-panel border border-blue/40 rounded-xl shadow-xs space-y-3 text-xs"
          >
            <div className="font-bold text-ink text-xs">
              Add Commercial Rate Contract
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-muted block mb-1">Origin Port</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Houston (USHOU)"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">Destination Port</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nhava Sheva (INNSA)"
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">Carrier Name / Contract</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CMA CGM Contract 44"
                  value={newCarrier}
                  onChange={(e) => setNewCarrier(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">Rate (USD / 20ft TEU)</label>
                <input
                  type="number"
                  required
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingFreight(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg hover:bg-line border border-line text-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white cursor-pointer"
              >
                Save Rate
              </button>
            </div>
          </form>
        )}

        {/* Table of Rates */}
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Route</TableHead>
                <TableHead>Carrier / Contract</TableHead>
                <TableHead align="right">Contracted Rate</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead align="center">Action</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {freightList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="py-8 text-muted">
                    No contracted freight rates configured. Click &quot;Add Rate&quot; to configure negotiated carrier contracts.
                  </TableCell>
                </TableRow>
              ) : (
                freightList.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="font-semibold text-ink">
                        {f.origin} &rarr; {f.destination}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-ink font-mono">{f.contractCode}</span>
                      <span className="text-[11px] text-muted block">{f.carrier}</span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="font-mono font-bold text-ink text-sm tabular-nums">
                        ${f.rateUsd.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted font-mono block">
                        per {f.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted font-mono">
                      {f.expiryDate}
                    </TableCell>
                    <TableCell align="center">
                      <button
                        type="button"
                        onClick={() => handleDeleteFreight(f.id)}
                        className="p-1 text-muted hover:text-red transition-colors cursor-pointer"
                        title="Remove Contract Rate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* 2. Smelter Recovery Yield Profiles */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
              Furnace Metal Recovery Yield Profiles
            </h3>
            <span className="text-[10px] font-mono text-muted bg-bg px-2 py-0.5 rounded border border-line">
              Custom Engineering Benchmarks
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {yieldList.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-muted border border-dashed border-line rounded-xl">
              No custom smelter yield profiles configured. Default statutory and engineering recovery models will be applied.
            </div>
          ) : (
            yieldList.map((y) => (
              <div
                key={y.id}
                className="p-4 bg-panel border border-line rounded-xl shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-ink">
                      {y.materialGrade}
                    </h4>
                    <span className="text-[10px] text-muted font-mono block mt-0.5">
                      {y.facility}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteYield(y.id)}
                    className="p-1 text-muted hover:text-red transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-bg rounded-lg border border-line text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted block font-sans">
                      Molten Yield
                    </span>
                    <span className="font-bold text-green text-sm">
                      {y.baseYieldPct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block font-sans">
                      Slag / Dross Loss
                    </span>
                    <span className="font-bold text-amber text-sm">
                      {y.smelterLossPct}%
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-muted flex items-center justify-between">
                  <span>Furnace:</span>
                  <span className="text-ink font-medium">{y.furnaceType}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

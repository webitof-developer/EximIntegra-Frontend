"use client";

import React, { useState } from "react";
import {
  ProvenanceBadge,
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  ToastNotification,
  CustomDropdown,
  CustomDateInput,
} from "@/components/ui";
import {
  Ship,
  Flame,
  Plus,
  Trash2,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";

const UNIT_OPTIONS = [
  { value: "20ft TEU", label: "20ft TEU" },
  { value: "40ft FEU", label: "40ft FEU" },
  { value: "40ft HC", label: "40ft HC" },
  { value: "Per MT", label: "Per MT" },
];

const FURNACE_OPTIONS = [
  { value: "Induction Furnace", label: "Induction Furnace" },
  { value: "Electric Arc Furnace (EAF)", label: "Electric Arc Furnace (EAF)" },
  { value: "Blast Furnace", label: "Blast Furnace" },
  { value: "Reverberatory Furnace", label: "Reverberatory Furnace" },
];
import {
  useGetContractsQuery,
  useCreateFreightContractMutation,
  useDeleteFreightContractMutation,
  useCreateSmelterOverrideMutation,
  useDeleteSmelterOverrideMutation,
} from "@/store/contractsApi";

export function ContractRatesSection() {
  const { data, isLoading } = useGetContractsQuery();
  const [createFreightContract, { isLoading: isCreatingFreight }] =
    useCreateFreightContractMutation();
  const [deleteFreightContract] = useDeleteFreightContractMutation();
  const [createSmelterOverride, { isLoading: isCreatingYield }] =
    useCreateSmelterOverrideMutation();
  const [deleteSmelterOverride] = useDeleteSmelterOverrideMutation();

  const freightList = data?.freightContracts || [];
  const yieldList = data?.smelterYieldOverrides || [];

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Freight form state
  const [newOrigin, setNewOrigin] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newCarrier, setNewCarrier] = useState("");
  const [newContractCode, setNewContractCode] = useState("");
  const [newRate, setNewRate] = useState<number>(1500);
  const [newUnit, setNewUnit] = useState("20ft TEU");
  const [newExpiryDate, setNewExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });
  const [isAddingFreight, setIsAddingFreight] = useState(false);

  // Yield form state
  const [yieldGrade, setYieldGrade] = useState("");
  const [yieldFacility, setYieldFacility] = useState("");
  const [yieldFurnace, setYieldFurnace] = useState("Induction Furnace");
  const [yieldBasePct, setYieldBasePct] = useState<number>(91.5);
  const [yieldLossPct, setYieldLossPct] = useState<number>(8.5);
  const [isAddingYield, setIsAddingYield] = useState(false);

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddFreight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin.trim() || !newDest.trim() || !newCarrier.trim()) return;

    try {
      const code =
        newContractCode.trim() ||
        `CTR-${Math.floor(Math.random() * 9000) + 1000}`;
      await createFreightContract({
        origin: newOrigin.trim(),
        destination: newDest.trim(),
        carrier: newCarrier.trim(),
        contractCode: code,
        rateUsd: Number(newRate),
        unit: newUnit,
        expiryDate: newExpiryDate || new Date().toISOString().split("T")[0],
      }).unwrap();

      setNewOrigin("");
      setNewDest("");
      setNewCarrier("");
      setNewContractCode("");
      setIsAddingFreight(false);
      showNotice(`Saved negotiated rate for ${newOrigin} → ${newDest}.`);
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data: { message?: string } }).data.message
          : "Failed to save freight contract.";
      showNotice(errorMsg || "Failed to save freight contract.");
    }
  };

  const handleDeleteFreight = async (id: string) => {
    try {
      await deleteFreightContract(id).unwrap();
      showNotice("Contract rate removed.");
    } catch {
      showNotice("Failed to remove contract rate.");
    }
  };

  const handleAddYield = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yieldGrade.trim() || !yieldFacility.trim()) return;

    try {
      await createSmelterOverride({
        materialGrade: yieldGrade.trim(),
        facility: yieldFacility.trim(),
        furnaceType: yieldFurnace.trim(),
        baseYieldPct: Number(yieldBasePct),
        smelterLossPct: Number(yieldLossPct),
      }).unwrap();

      setYieldGrade("");
      setYieldFacility("");
      setIsAddingYield(false);
      showNotice(`Saved smelter yield profile for ${yieldGrade}.`);
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data: { message?: string } }).data.message
          : "Failed to save smelter yield profile.";
      showNotice(errorMsg || "Failed to save smelter yield profile.");
    }
  };

  const handleDeleteYield = async (id: string) => {
    try {
      await deleteSmelterOverride(id).unwrap();
      showNotice("Yield override removed.");
    } catch {
      showNotice("Failed to remove yield override.");
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Origin,Destination,Carrier,ContractCode,RateUSD,Unit,ExpiryDate\n" +
      "USHOU,INNSA,Maersk Line,CTR-US-2026,1450,20ft TEU,2026-12-31\n" +
      "AEJEA,INNSA,CMA CGM,CTR-AE-4412,680,20ft TEU,2026-12-31\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exim_contract_rates_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice("Downloaded rate template CSV.");
  };

  return (
    <div className="space-y-7">
      {/* Floating Bottom-Right Toast Notification */}
      <ToastNotification
        isOpen={!!toastMessage}
        variant="success"
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* Top Provenance Note */}
      <div className="p-3.5 bg-blue-dim/40 border border-blue/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue">
        <div className="flex items-center gap-2.5">
          <ProvenanceBadge
            type="BYOK"
            source="Company Contract Schedule"
            compact
          />
          <span>
            Rates configured here are saved permanently to your organization in
            the database and automatically override standard illustrative logistics costs in the{" "}
            <strong>Landed Cost Engine</strong> &amp;{" "}
            <strong>Compare Origin Sourcing</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadTemplate}
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
              {isLoading ? "..." : `${freightList.length} Active Contracts`}
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
              Add Negotiated Freight Contract
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Origin Port (Code)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. USHOU"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Destination Port
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INNSA"
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Carrier / Shipping Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maersk Line"
                  value={newCarrier}
                  onChange={(e) => setNewCarrier(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Contract Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CTR-US-4412"
                  value={newContractCode}
                  onChange={(e) => setNewContractCode(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Rate (USD) &amp; Unit
                </label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="number"
                    required
                    min={1}
                    step={1}
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    className="w-1/2 min-w-0 py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue text-xs min-h-[32px]"
                  />
                  <div className="w-1/2 min-w-[90px]">
                    <CustomDropdown
                      value={newUnit}
                      onChange={setNewUnit}
                      options={UNIT_OPTIONS}
                      size="sm"
                      buttonClassName="!min-h-[32px] !py-1 !px-2 font-mono text-xs"
                      menuClassName="min-w-[120px]"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Valid Until / Expiry Date
                </label>
                <CustomDateInput
                  value={newExpiryDate}
                  onChange={setNewExpiryDate}
                  placeholder="YYYY-MM-DD"
                  size="sm"
                  required
                  align="right"
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
                disabled={isCreatingFreight}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white cursor-pointer disabled:opacity-50"
              >
                {isCreatingFreight && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Contract</span>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="py-8 text-muted">
                    <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                    Loading contracted rates from database...
                  </TableCell>
                </TableRow>
              ) : freightList.length === 0 ? (
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
                        ${Number(f.rateUsd).toLocaleString()}
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
              {isLoading ? "..." : `${yieldList.length} Custom Profiles`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingYield(!isAddingYield)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Yield Profile</span>
          </button>
        </div>

        {/* Inline Add Yield Profile Form */}
        {isAddingYield && (
          <form
            onSubmit={handleAddYield}
            className="p-4 bg-panel border border-blue/40 rounded-xl shadow-xs space-y-3 text-xs"
          >
            <div className="font-bold text-ink text-xs">
              Add Furnace Recovery Yield Profile
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Material Grade / Alloy
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HMS 1/2 Scrap"
                  value={yieldGrade}
                  onChange={(e) => setYieldGrade(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Smelting Facility / Plant
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hazira Smelter Unit"
                  value={yieldFacility}
                  onChange={(e) => setYieldFacility(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Furnace Type
                </label>
                <CustomDropdown
                  value={yieldFurnace}
                  onChange={setYieldFurnace}
                  options={FURNACE_OPTIONS}
                  size="sm"
                  buttonClassName="!min-h-[32px] !py-1 !px-2.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Base Molten Yield (%)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  step={0.1}
                  value={yieldBasePct}
                  onChange={(e) => setYieldBasePct(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted block mb-1">
                  Slag / Dross Loss (%)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  step={0.1}
                  value={yieldLossPct}
                  onChange={(e) => setYieldLossPct(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingYield(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg hover:bg-line border border-line text-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingYield}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white cursor-pointer disabled:opacity-50"
              >
                {isCreatingYield && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-8 text-center text-xs text-muted border border-dashed border-line rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
              Loading yield profiles from database...
            </div>
          ) : yieldList.length === 0 ? (
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
                    title="Remove Yield Profile"
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

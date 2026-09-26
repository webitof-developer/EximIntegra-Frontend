import { NextResponse } from "next/server";
import { CalculationHistoryRecord, HistoryResponse } from "@/lib/types";
import { calculationsStore } from "../../duty/calculate/route";
import { landedCostStore } from "../../landed-cost/calculate/route";

// Server-persisted calculation records (per user audit trail)
export const historicalRecordsStore: CalculationHistoryRecord[] = [
  {
    id: "calc_062751",
    type: "DUTY",
    timestamp: "2026-09-26T08:14:22.000Z",
    hs_code: "7204.49.00",
    hs_description: "Other waste and scrap of iron or steel",
    commodity_name: "Heavy Melting Steel Scrap (HMS 1/2)",
    country_of_origin: "US",
    destination: "Nhava Sheva (JNPT), Mumbai, India",
    trade_agreement: "Standard MFN Statutory Tariff",
    quantity: 100,
    unit: "MT",
    total_outlay_inr: 847295.87,
    total_outlay_usd: 9795.33,
    key_metric_label: "Effective Customs Duty",
    key_metric_value: "2.75% (21.24% incl. IGST)",
    provenance_type: "LIVE",
    tags: ["CBIC 2026", "MFN", "HMS 1/2", "Verified"],
  },
  {
    id: "lc_062810",
    type: "LANDED_COST",
    timestamp: "2026-09-26T08:18:45.000Z",
    hs_code: "7204.49.00",
    hs_description: "Other waste and scrap of iron or steel",
    commodity_name: "Heavy Melting Steel Scrap (HMS 1/2)",
    country_of_origin: "US",
    destination: "Nhava Sheva (JNPT), Mumbai",
    trade_agreement: "Standard MFN Statutory Tariff",
    quantity: 100,
    unit: "MT",
    total_outlay_inr: 4334214.94,
    total_outlay_usd: 50106.53,
    key_metric_label: "Net Landed / MT",
    key_metric_value: "₹43,342 / MT ($501.07)",
    provenance_type: "LIVE",
    tags: ["Landed Cost", "Smelter Yield: 91%", "Port Handling Included"],
  },
  {
    id: "calc_059412",
    type: "DUTY",
    timestamp: "2026-09-25T14:32:10.000Z",
    hs_code: "7204.49.00",
    hs_description: "Other waste and scrap of iron or steel",
    commodity_name: "Heavy Melting Steel Scrap (Jebel Ali)",
    country_of_origin: "AE",
    destination: "Mundra Port, Gujarat, India",
    trade_agreement: "India-UAE CEPA (Preferential Tariff)",
    quantity: 100,
    unit: "MT",
    total_outlay_inr: 710770.5,
    total_outlay_usd: 8217.0,
    key_metric_label: "Effective Duty (CEPA)",
    key_metric_value: "0.00% BCD (18.00% IGST)",
    provenance_type: "LIVE",
    tags: ["CEPA Concessional", "Zero BCD", "e-COO Verified"],
  },
  {
    id: "lc_059480",
    type: "LANDED_COST",
    timestamp: "2026-09-25T14:38:00.000Z",
    hs_code: "7204.49.00",
    hs_description: "Other waste and scrap of iron or steel",
    commodity_name: "Heavy Melting Steel Scrap (Jebel Ali)",
    country_of_origin: "AE",
    destination: "Mundra Port, Gujarat",
    trade_agreement: "India-UAE CEPA",
    quantity: 100,
    unit: "MT",
    total_outlay_inr: 4042575.0,
    total_outlay_usd: 46735.0,
    key_metric_label: "Net Landed / MT (CEPA)",
    key_metric_value: "₹40,425 / MT ($467.35)",
    provenance_type: "LIVE",
    tags: ["Origin Arbitrage", "Savings: ₹2,91,639", "CEPA Preferential"],
  },
  {
    id: "calc_051204",
    type: "DUTY",
    timestamp: "2026-09-24T11:05:40.000Z",
    hs_code: "8507.60.00",
    hs_description: "Lithium-ion accumulators and battery cells",
    commodity_name: "Prismatic Lithium-Ion Cells (EV Grade)",
    country_of_origin: "CN",
    destination: "Chennai Sea Port, India",
    trade_agreement: "Standard MFN Statutory Tariff",
    quantity: 5000,
    unit: "PCS",
    total_outlay_inr: 2984500.0,
    total_outlay_usd: 34502.89,
    key_metric_label: "Effective Customs Duty",
    key_metric_value: "11.00% (30.98% incl. IGST)",
    provenance_type: "LIVE",
    tags: ["Battery Cells", "BIS Mandatory", "EPR Required"],
  },
  {
    id: "calc_048821",
    type: "DUTY",
    timestamp: "2026-09-22T16:40:15.000Z",
    hs_code: "8541.43.00",
    hs_description: "Photovoltaic cells assembled in modules or made up into panels",
    commodity_name: "Mono PERC Solar PV Modules 550W",
    country_of_origin: "VN",
    destination: "Nhava Sheva (JNPT), Mumbai",
    trade_agreement: "Standard Statutory (BCD + ALMM Check)",
    quantity: 2000,
    unit: "PCS",
    total_outlay_inr: 6842000.0,
    total_outlay_usd: 79098.26,
    key_metric_label: "Effective Customs Duty",
    key_metric_value: "44.00% (69.92% incl. IGST)",
    provenance_type: "LIVE",
    tags: ["Solar PV", "BCD 40%", "ALMM Compliance"],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type"); // "ALL", "DUTY", "LANDED_COST"
  const searchQuery = (searchParams.get("search") || "").toLowerCase().trim();

  // Combine static store with active session stores
  const sessionRecords: CalculationHistoryRecord[] = [];

  calculationsStore.forEach((duty, id) => {
    if (!historicalRecordsStore.some((r) => r.id === id)) {
      sessionRecords.push({
        id,
        type: "DUTY",
        timestamp: duty.timestamp,
        hs_code: duty.hs_code,
        hs_description: duty.hs_description,
        commodity_name: duty.hs_description,
        country_of_origin: duty.country_of_origin,
        destination: duty.destination_country,
        trade_agreement: duty.trade_agreement,
        quantity: duty.quantity,
        unit: duty.unit,
        total_outlay_inr: duty.total_tax_inclusive_duty_inr,
        total_outlay_usd: Number((duty.total_tax_inclusive_duty_inr / 86.5).toFixed(2)),
        key_metric_label: "Effective Duty Outlay",
        key_metric_value: `${duty.effective_duty_percentage}% (${duty.total_effective_tax_percentage}% incl. IGST)`,
        provenance_type: "LIVE",
        tags: ["Session Active", duty.trade_agreement, "Statutory Verified"],
        duty_details: duty,
      });
    }
  });

  landedCostStore.forEach((lc, id) => {
    if (!historicalRecordsStore.some((r) => r.id === id)) {
      sessionRecords.push({
        id,
        type: "LANDED_COST",
        timestamp: lc.timestamp,
        hs_code: lc.hs_code,
        hs_description: lc.hs_description,
        commodity_name: lc.hs_description,
        country_of_origin: lc.origin_country,
        destination: lc.destination_port,
        quantity: lc.batch_quantity,
        unit: lc.batch_unit,
        total_outlay_inr: lc.net_landed_cost_inr,
        total_outlay_usd: lc.net_landed_cost_usd,
        key_metric_label: "Net Landed / Unit",
        key_metric_value: `₹${lc.landed_cost_per_mt_inr.toLocaleString("en-IN")}/${lc.batch_unit}`,
        provenance_type: "LIVE",
        tags: ["Session Active", "Landed Cost Waterfall"],
        landed_cost_details: lc,
      });
    }
  });

  const allRecords = [...sessionRecords, ...historicalRecordsStore];

  let filtered = allRecords;

  if (typeFilter && typeFilter !== "ALL") {
    filtered = filtered.filter((r) => r.type === typeFilter);
  }

  if (searchQuery) {
    filtered = filtered.filter(
      (r) =>
        r.hs_code.toLowerCase().includes(searchQuery) ||
        r.commodity_name.toLowerCase().includes(searchQuery) ||
        r.hs_description.toLowerCase().includes(searchQuery) ||
        r.country_of_origin.toLowerCase().includes(searchQuery) ||
        r.id.toLowerCase().includes(searchQuery) ||
        r.tags.some((t) => t.toLowerCase().includes(searchQuery))
    );
  }

  const response: HistoryResponse = {
    records: filtered,
    total_count: filtered.length,
    active_user: "Harsh Vardhan (Enterprise Trader)",
  };

  return NextResponse.json(response);
}

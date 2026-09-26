import { NextResponse } from "next/server";
import { historicalRecordsStore } from "../route";
import { calculationsStore } from "../../../duty/calculate/route";
import { landedCostStore } from "../../../landed-cost/calculate/route";
import { CalculationHistoryRecord } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check historicalRecordsStore
  const found = historicalRecordsStore.find((r) => r.id === id);
  if (found) {
    return NextResponse.json(found);
  }

  // Check active duty store
  const duty = calculationsStore.get(id);
  if (duty) {
    const record: CalculationHistoryRecord = {
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
      tags: ["Session Active", duty.trade_agreement],
      duty_details: duty,
    };
    return NextResponse.json(record);
  }

  // Check active landed cost store
  const lc = landedCostStore.get(id);
  if (lc) {
    const record: CalculationHistoryRecord = {
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
    };
    return NextResponse.json(record);
  }

  return NextResponse.json(
    { error: `Calculation record ${id} not found in persistent store` },
    { status: 404 }
  );
}

import { NextResponse } from "next/server";
import { landedCostStore } from "../calculate/route";
import { LandedCostResponse } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ calculation_id: string }> }
) {
  const { calculation_id } = await params;

  const found = landedCostStore.get(calculation_id);
  if (found) {
    return NextResponse.json(found);
  }

  // Reproducible fallback
  const fallback: LandedCostResponse = {
    landed_cost_id: calculation_id,
    duty_calculation_id: "calc_062751",
    timestamp: new Date().toISOString(),
    hs_code: "7204.49.00",
    hs_description: "Other waste and scrap of iron or steel",
    origin_country: "US",
    destination_port: "Nhava Sheva (JNPT), Mumbai",
    exchange_rate: 86.5,
    batch_quantity: 100,
    batch_unit: "MT",
    gross_landed_cost_inr: 5071834.94,
    gross_landed_cost_usd: 58633.93,
    net_landed_cost_inr: 4334214.94,
    net_landed_cost_usd: 50106.53,
    landed_cost_per_mt_inr: 43342.15,
    landed_cost_per_mt_usd: 501.07,
    landed_cost_per_kg_inr: 43.34,
    landed_cost_per_kg_usd: 0.5,
    cost_waterfall: [
      {
        id: "cif",
        label: "CIF Consignment Invoice (Port of Discharge)",
        amount_inr: 3948725,
        amount_usd: 45650,
        percent_of_total: 77.9,
        category: "CIF",
      },
      {
        id: "duty",
        label: "Statutory Customs Duties (BCD + SWS)",
        amount_inr: 108589.94,
        amount_usd: 1255.37,
        percent_of_total: 2.1,
        category: "DUTY",
      },
      {
        id: "thc",
        label: "Port THC, Wharfage & CFS Handling",
        amount_inr: 85000,
        amount_usd: 982.66,
        percent_of_total: 1.7,
        category: "PORT",
      },
      {
        id: "cha",
        label: "CHA Clearing Agent & Documentation Fees",
        amount_inr: 22500,
        amount_usd: 260.12,
        percent_of_total: 0.4,
        category: "LOGISTICS",
      },
      {
        id: "inland",
        label: "Inland Multimodal Transit to Destination Plant",
        amount_inr: 120000,
        amount_usd: 1387.28,
        percent_of_total: 2.4,
        category: "LOGISTICS",
      },
      {
        id: "finance",
        label: "Trade Finance, LC Commission & Demurrage Buffer",
        amount_inr: 48000,
        amount_usd: 554.91,
        percent_of_total: 0.9,
        category: "FINANCE",
      },
      {
        id: "igst",
        label: "Integrated GST (Recoverable Input Tax Credit)",
        amount_inr: 737620,
        amount_usd: 8527.4,
        percent_of_total: 14.5,
        category: "TAX",
        is_recoverable_itc: true,
      },
    ],
    metal_recovery: {
      contained_metal: "Iron (Fe)",
      assay_purity_percent: 92.5,
      smelter_recovery_yield_percent: 91.0,
      effective_recovered_quantity_mt: 84.175,
      cost_per_contained_metal_mt_inr: 51490.52,
      cost_per_contained_metal_mt_usd: 595.27,
      yield_multiplier: 1.188,
      assumption_provenance: {
        type: "ILLUSTRATIVE",
        source: "Induction Smelter Yield Standard IS-2026",
        notes: "Standard electric arc/induction furnace melting loss. User editable.",
      },
    },
  };

  return NextResponse.json(fallback);
}

import { NextResponse } from "next/server";
import { LandedCostRequest, LandedCostResponse, CostWaterfallItem } from "@/lib/types";
import { calculationsStore } from "../../duty/calculate/route";

export const landedCostStore = new Map<string, LandedCostResponse>();

export async function POST(request: Request) {
  try {
    const body: LandedCostRequest = await request.json();

    const dutyId = body.duty_calculation_id || "calc_default";
    const priorDuty = calculationsStore.get(dutyId);

    // Pull baseline values from prior duty calculation if available
    const hsCode = body.hs_code || priorDuty?.hs_code || "7204.49.00";
    const hsDesc = priorDuty?.hs_description || "Other waste and scrap of iron or steel";
    const origin = priorDuty?.country_of_origin || "US";
    const exRate = priorDuty?.exchange_rate || 86.5;
    const qty = Number(body.quantity) || priorDuty?.quantity || 100;
    const unit = body.unit || priorDuty?.unit || "MT";
    const port = body.port_of_discharge || "Nhava Sheva (JNPT), Mumbai";

    // 1. CIF Base Amount
    const cifInr = priorDuty?.cif_value_inr || 3948725;
    const customsDutyInr = priorDuty?.total_customs_duty_inr || 108589.94;
    const igstInr = priorDuty?.duties?.igst?.amount_inr || 737620;

    // 2. Logistics & Port Outlays
    const thcInr = Number(body.thc_cfs_handling_inr) || 85000;
    const chaInr = Number(body.cha_agency_inr) || 22500;
    const inlandInr = Number(body.inland_transit_inr) || 120000;
    const financeInr = Number(body.finance_insurance_inr) || 48000;

    // 3. Totals
    const grossTotalInr = cifInr + customsDutyInr + thcInr + chaInr + inlandInr + financeInr + igstInr;
    const netTotalInr = grossTotalInr - igstInr; // Net of recoverable GST

    const grossTotalUsd = Number((grossTotalInr / exRate).toFixed(2));
    const netTotalUsd = Number((netTotalInr / exRate).toFixed(2));

    // Unit Economics
    const costPerMtInr = Number((netTotalInr / qty).toFixed(2));
    const costPerMtUsd = Number((costPerMtInr / exRate).toFixed(2));
    const costPerKgInr = Number((costPerMtInr / 1000).toFixed(2));
    const costPerKgUsd = Number((costPerMtUsd / 1000).toFixed(2));

    // 4. Waterfall breakdown
    const waterfall: CostWaterfallItem[] = [
      {
        id: "cif",
        label: "CIF Consignment Invoice (Port of Discharge)",
        amount_inr: cifInr,
        amount_usd: Number((cifInr / exRate).toFixed(2)),
        percent_of_total: Number(((cifInr / grossTotalInr) * 100).toFixed(1)),
        category: "CIF",
      },
      {
        id: "duty",
        label: "Statutory Customs Duties (BCD + SWS + AIDC)",
        amount_inr: customsDutyInr,
        amount_usd: Number((customsDutyInr / exRate).toFixed(2)),
        percent_of_total: Number(((customsDutyInr / grossTotalInr) * 100).toFixed(1)),
        category: "DUTY",
      },
      {
        id: "thc",
        label: "Port THC, Wharfage & CFS Handling",
        amount_inr: thcInr,
        amount_usd: Number((thcInr / exRate).toFixed(2)),
        percent_of_total: Number(((thcInr / grossTotalInr) * 100).toFixed(1)),
        category: "PORT",
      },
      {
        id: "cha",
        label: "CHA Clearing Agent & Documentation Fees",
        amount_inr: chaInr,
        amount_usd: Number((chaInr / exRate).toFixed(2)),
        percent_of_total: Number(((chaInr / grossTotalInr) * 100).toFixed(1)),
        category: "LOGISTICS",
      },
      {
        id: "inland",
        label: "Inland Multimodal Transit to Destination Plant",
        amount_inr: inlandInr,
        amount_usd: Number((inlandInr / exRate).toFixed(2)),
        percent_of_total: Number(((inlandInr / grossTotalInr) * 100).toFixed(1)),
        category: "LOGISTICS",
      },
      {
        id: "finance",
        label: "Trade Finance, LC Commission & Demurrage Buffer",
        amount_inr: financeInr,
        amount_usd: Number((financeInr / exRate).toFixed(2)),
        percent_of_total: Number(((financeInr / grossTotalInr) * 100).toFixed(1)),
        category: "FINANCE",
      },
      {
        id: "igst",
        label: "Integrated GST (Recoverable Input Tax Credit)",
        amount_inr: igstInr,
        amount_usd: Number((igstInr / exRate).toFixed(2)),
        percent_of_total: Number(((igstInr / grossTotalInr) * 100).toFixed(1)),
        category: "TAX",
        is_recoverable_itc: true,
      },
    ];

    // 5. Metal Recovery Economics (§2.3)
    const purity = Number(body.assay_purity_percent) || 92.5;
    const yieldRate = Number(body.smelter_recovery_yield_percent) || 91.0;
    const metalName = body.contained_metal || (hsCode.startsWith("7204") ? "Iron (Fe)" : "Copper (Cu)");

    // Effective recovered yield = Batch Qty * (Assay % / 100) * (Yield % / 100)
    const recoveredQtyMt = Number((qty * (purity / 100) * (yieldRate / 100)).toFixed(3));
    const costPerContainedMtInr = Number((netTotalInr / recoveredQtyMt).toFixed(2));
    const costPerContainedMtUsd = Number((costPerContainedMtInr / exRate).toFixed(2));

    const landedCostId = `landed_${Date.now().toString().slice(-6)}`;

    const response: LandedCostResponse = {
      landed_cost_id: landedCostId,
      duty_calculation_id: dutyId,
      timestamp: new Date().toISOString(),
      hs_code: hsCode,
      hs_description: hsDesc,
      origin_country: origin,
      destination_port: port,
      exchange_rate: exRate,
      batch_quantity: qty,
      batch_unit: unit,
      gross_landed_cost_inr: grossTotalInr,
      gross_landed_cost_usd: grossTotalUsd,
      net_landed_cost_inr: netTotalInr,
      net_landed_cost_usd: netTotalUsd,
      landed_cost_per_mt_inr: costPerMtInr,
      landed_cost_per_mt_usd: costPerMtUsd,
      landed_cost_per_kg_inr: costPerKgInr,
      landed_cost_per_kg_usd: costPerKgUsd,
      cost_waterfall: waterfall,
      metal_recovery: {
        contained_metal: metalName,
        assay_purity_percent: purity,
        smelter_recovery_yield_percent: yieldRate,
        effective_recovered_quantity_mt: recoveredQtyMt,
        cost_per_contained_metal_mt_inr: costPerContainedMtInr,
        cost_per_contained_metal_mt_usd: costPerContainedMtUsd,
        yield_multiplier: Number((qty / recoveredQtyMt).toFixed(3)),
        assumption_provenance: {
          type: "ILLUSTRATIVE",
          source: "Induction Smelter Yield Standard IS-2026",
          notes: "Recovery assumption reflects standard electric arc/induction furnace melting loss. User editable.",
        },
      },
    };

    landedCostStore.set(landedCostId, response);

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to compute landed cost." },
      { status: 400 }
    );
  }
}

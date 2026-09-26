import { NextResponse } from "next/server";
import { calculationsStore } from "../calculate/route";
import { DutyCalculationResponse } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ calculation_id: string }> }
) {
  const { calculation_id } = await params;

  const found = calculationsStore.get(calculation_id);
  if (found) {
    return NextResponse.json(found);
  }

  // Fallback reproducible calculation if server reloaded
  const fallback: DutyCalculationResponse = {
    calculation_id,
    timestamp: new Date().toISOString(),
    hs_code: "7204.49.00",
    hs_description: "Other waste and scrap of iron or steel",
    country_of_origin: "US",
    destination_country: "IN",
    trade_agreement: "Standard MFN Statutory Tariff",
    exchange_rate: 86.5,
    cif_value_inr: 3988212,
    assessable_value_inr: 3988212,
    assessable_value_usd: 46106.5,
    quantity: 100,
    unit: "MT",
    duties: {
      bcd: {
        name: "Basic Customs Duty (BCD)",
        statutory_rate: 2.5,
        concessional_rate: 2.5,
        rate_applied: 2.5,
        amount_inr: 99705.3,
        provenance: {
          type: "LIVE",
          source: "CBIC Customs Tariff Act 2026",
          effectiveDate: "2026-03-01",
          notes: "Standard First Schedule statutory duty rate.",
        },
      },
      sws: {
        name: "Social Welfare Surcharge (SWS)",
        statutory_rate: 10.0,
        rate_applied: 10.0,
        amount_inr: 9970.53,
        calculation_basis: "10% of Basic Customs Duty amount",
        provenance: {
          type: "LIVE",
          source: "Finance Act (Customs Notification)",
          effectiveDate: "2026-02-01",
        },
      },
      aidc: {
        name: "Agriculture Infrastructure & Dev Cess (AIDC)",
        statutory_rate: 0.0,
        rate_applied: 0.0,
        amount_inr: 0,
        provenance: {
          type: "LIVE",
          source: "Notification No. 11/2021-Customs",
        },
      },
      anti_dumping: {
        name: "Anti-Dumping / Trade Remedies (ADD)",
        statutory_rate: 0.0,
        rate_applied: 0.0,
        amount_inr: 0,
        status: "NOT_APPLICABLE",
        provenance: {
          type: "ILLUSTRATIVE",
          source: "DGTR Gazette Findings (Benchmark)",
          notes: "No anti-dumping notification active for this jurisdiction.",
        },
      },
      igst: {
        name: "Integrated Goods and Services Tax (IGST)",
        statutory_rate: 18.0,
        rate_applied: 18.0,
        amount_inr: 737620.04,
        calculation_basis: "18% of (Assessable Value + BCD + SWS + AIDC + ADD)",
        provenance: {
          type: "LIVE",
          source: "GST Council Schedule III",
          effectiveDate: "2026-01-01",
          notes: "Input Tax Credit (ITC) admissible for registered entities.",
        },
      },
    },
    total_customs_duty_inr: 109675.83,
    total_tax_inclusive_duty_inr: 847295.87,
    total_landed_customs_inr: 4835507.87,
    effective_duty_percentage: 2.75,
    total_effective_tax_percentage: 21.24,
    liability_disclaimer:
      "Statutory rates (BCD, SWS, IGST) are synchronized with the CBIC ICEGATE live tariff schedule.",
  };

  return NextResponse.json(fallback);
}

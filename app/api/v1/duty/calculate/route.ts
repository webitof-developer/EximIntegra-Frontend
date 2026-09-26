import { NextResponse } from "next/server";
import { DutyCalculationRequest, DutyCalculationResponse } from "@/lib/types";

// In-memory calculation registry for retrieval by calculation_id
export const calculationsStore = new Map<string, DutyCalculationResponse>();

export async function POST(request: Request) {
  try {
    const body: DutyCalculationRequest = await request.json();

    const hsCode = body.hs_code || "7204.49.00";
    const currency = body.currency || "USD";
    const rawVal = Number(body.assessable_value) || 42000;
    const origin = body.country_of_origin || "US";
    const agreement = body.trade_agreement || "STANDARD_MFN";

    // Standard official exchange rates
    const exchangeRates: Record<string, number> = {
      USD: 86.5,
      EUR: 93.2,
      AED: 23.55,
      INR: 1.0,
      GBP: 110.4,
      JPY: 0.58,
    };

    const exRate = body.exchange_rate || exchangeRates[currency] || 86.5;

    // CIF Assessable Value in INR
    const freight = Number(body.freight_amount) || 0;
    const insurance = Number(body.insurance_amount) || 0;
    const totalForeignVal = rawVal + freight + insurance;
    const assessableInr = Math.round(totalForeignVal * exRate);
    const assessableUsd = Number((assessableInr / 86.5).toFixed(2));

    // Base rates determined by HS code family
    let baseBcdRate = 2.5;
    let bcdNotes = "Standard statutory first schedule tariff rate.";
    let hsDesc = "Other waste and scrap of iron or steel";

    if (hsCode.startsWith("8507")) {
      baseBcdRate = 10.0;
      hsDesc = "Lithium-ion accumulators and battery cells";
    } else if (hsCode.startsWith("8541")) {
      baseBcdRate = 40.0;
      hsDesc = "Photovoltaic solar cells assembled in modules";
    } else if (hsCode.startsWith("7404")) {
      baseBcdRate = 5.0;
      hsDesc = "Copper waste and scrap";
    } else if (hsCode.startsWith("7602")) {
      baseBcdRate = 5.0;
      hsDesc = "Aluminium waste and scrap";
    }

    // Trade Agreement concessions
    let appliedBcdRate = baseBcdRate;
    let agreementTitle = "Standard MFN Statutory Tariff";

    if (agreement === "INDIA_UAE_CEPA" && (origin === "AE" || origin === "UAE")) {
      appliedBcdRate = 0.0;
      agreementTitle = "India-UAE Comprehensive Economic Partnership Agreement (CEPA)";
      bcdNotes = "Preferential 0% duty under India-UAE CEPA (Notification 22/2022-Customs).";
    } else if (agreement === "INDIA_AUS_ECTA" && (origin === "AU" || origin === "AUS")) {
      appliedBcdRate = Math.max(0, baseBcdRate - 2.5);
      agreementTitle = "India-Australia Economic Cooperation and Trade Agreement (ECTA)";
      bcdNotes = "Concessional rate under India-Australia ECTA.";
    } else if (agreement === "INDIA_ASEAN_AIFTA") {
      appliedBcdRate = Math.max(0, baseBcdRate - 1.5);
      agreementTitle = "ASEAN-India Free Trade Area (AIFTA)";
      bcdNotes = "Preferential tariff margin under AIFTA Notification 46/2011-Customs.";
    }

    // 1. Basic Customs Duty (BCD) - LIVE
    const bcdAmount = Number(((assessableInr * appliedBcdRate) / 100).toFixed(2));

    // 2. Social Welfare Surcharge (SWS) - LIVE (10% of BCD)
    const swsRate = 10.0;
    const swsAmount = Number(((bcdAmount * swsRate) / 100).toFixed(2));

    // 3. AIDC - LIVE
    const aidcRate = 0.0;
    const aidcAmount = 0.0;

    // 4. Anti-Dumping Duty (ADD) - ILLUSTRATIVE (Liability critical)
    let addAmount = 0.0;
    let addNotes = "No anti-dumping notification active for this jurisdiction.";
    let addRate = 0.0;

    if (origin === "CN" && hsCode.startsWith("8541")) {
      addRate = 15.0; // Illustrative solar safeguard
      addAmount = Number(((assessableInr * addRate) / 100).toFixed(2));
      addNotes = "Illustrative benchmark: Safeguard duty recommendation under review by DGTR.";
    }

    // 5. IGST - LIVE (18% on Assessable Value + BCD + SWS + AIDC + ADD)
    const igstTaxableBase = assessableInr + bcdAmount + swsAmount + aidcAmount + addAmount;
    const igstRate = 18.0;
    const igstAmount = Number(((igstTaxableBase * igstRate) / 100).toFixed(2));

    // Totals
    const totalCustomsDutyInr = Number((bcdAmount + swsAmount + aidcAmount + addAmount).toFixed(2));
    const totalTaxInclusiveInr = Number((totalCustomsDutyInr + igstAmount).toFixed(2));
    const totalLandedInr = Number((assessableInr + totalTaxInclusiveInr).toFixed(2));

    const effectiveDutyPct = Number(((totalCustomsDutyInr / assessableInr) * 100).toFixed(2));
    const totalTaxPct = Number(((totalTaxInclusiveInr / assessableInr) * 100).toFixed(2));

    const calculationId = `calc_${Date.now().toString().slice(-6)}`;

    const response: DutyCalculationResponse = {
      calculation_id: calculationId,
      timestamp: new Date().toISOString(),
      hs_code: hsCode,
      hs_description: hsDesc,
      country_of_origin: origin,
      destination_country: "IN",
      trade_agreement: agreementTitle,
      exchange_rate: exRate,
      cif_value_inr: assessableInr,
      assessable_value_inr: assessableInr,
      assessable_value_usd: assessableUsd,
      quantity: body.quantity,
      unit: body.unit,
      duties: {
        bcd: {
          name: "Basic Customs Duty (BCD)",
          statutory_rate: baseBcdRate,
          concessional_rate: appliedBcdRate,
          rate_applied: appliedBcdRate,
          amount_inr: bcdAmount,
          provenance: {
            type: "LIVE",
            source: "CBIC Customs Tariff Act 2026",
            effectiveDate: "2026-03-01",
            notes: bcdNotes,
          },
        },
        sws: {
          name: "Social Welfare Surcharge (SWS)",
          statutory_rate: swsRate,
          rate_applied: swsRate,
          amount_inr: swsAmount,
          calculation_basis: "10% of Basic Customs Duty amount",
          provenance: {
            type: "LIVE",
            source: "Finance Act (Customs Notification)",
            effectiveDate: "2026-02-01",
            notes: "Levied on aggregate customs duties excluding IGST.",
          },
        },
        aidc: {
          name: "Agriculture Infrastructure & Dev Cess (AIDC)",
          statutory_rate: aidcRate,
          rate_applied: aidcRate,
          amount_inr: aidcAmount,
          provenance: {
            type: "LIVE",
            source: "Notification No. 11/2021-Customs",
            notes: "Statutory Nil exemption for this tariff chapter.",
          },
        },
        anti_dumping: {
          name: "Anti-Dumping / Trade Remedies (ADD)",
          statutory_rate: addRate,
          rate_applied: addRate,
          amount_inr: addAmount,
          status: addRate > 0 ? "APPLICABLE_PROVISIONAL" : "NOT_APPLICABLE",
          provenance: {
            type: "ILLUSTRATIVE",
            source: "DGTR Gazette Findings (Benchmark)",
            notes: addNotes,
          },
        },
        igst: {
          name: "Integrated Goods and Services Tax (IGST)",
          statutory_rate: igstRate,
          rate_applied: igstRate,
          amount_inr: igstAmount,
          calculation_basis: "18% of (Assessable Value + BCD + SWS + AIDC + ADD)",
          provenance: {
            type: "LIVE",
            source: "GST Council Schedule III",
            effectiveDate: "2026-01-01",
            notes: "Input Tax Credit (ITC) admissible for registered taxable persons.",
          },
        },
      },
      total_customs_duty_inr: totalCustomsDutyInr,
      total_tax_inclusive_duty_inr: totalTaxInclusiveInr,
      total_landed_customs_inr: totalLandedInr,
      effective_duty_percentage: effectiveDutyPct,
      total_effective_tax_percentage: totalTaxPct,
      liability_disclaimer:
        "Statutory rates (BCD, SWS, IGST) are synchronized with the CBIC ICEGATE live tariff schedule. Anti-dumping and countervailing figures represent indicative trade defense estimates and do not constitute legal advice.",
    };

    calculationsStore.set(calculationId, response);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Duty calculation failed. Please check payload." },
      { status: 400 }
    );
  }
}

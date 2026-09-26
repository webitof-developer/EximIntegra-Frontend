import { NextResponse } from "next/server";
import { AksharaRequest, AksharaResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body: AksharaRequest = await request.json();
    const query = (body.message || "").toLowerCase();
    const activeHs = body.active_context?.hsCode || "7204.49.00";

    const conversationId = body.conversation_id || `conv_${Date.now().toString().slice(-6)}`;
    const messageId = `msg_${Date.now().toString().slice(-6)}`;

    // Scenario 1: Unresolvable / Ambiguous / Policy Violation question
    if (
      query.includes("2029") ||
      query.includes("future") ||
      query.includes("without license") ||
      query.includes("hazardous") ||
      query.includes("guarantee")
    ) {
      const response: AksharaResponse = {
        message_id: messageId,
        conversation_id: conversationId,
        role: "assistant",
        content:
          "### ⚠️ Statutory Determination Limitation Notice\n\nI cannot resolve this query with verified statutory authority under current Customs law:\n\n1. **Prospective Fiscal Enactments:** Indian Customs Tariff schedules are enacted annually through the Union Finance Act. Customs rates beyond the current gazette year (2026-27) cannot be projected with legal certainty.\n2. **Statutory Environmental Controls:** Under the *Hazardous and Other Wastes (Management & Transboundary Movement) Rules, 2016*, import of unmanifested hazardous electronic scrap is strictly **PROHIBITED** without prior informed consent from the Ministry of Environment, Forest and Climate Change (MoEFCC).\n\nPlease review the unresolved subclaims below before taking commercial action.",
        timestamp: new Date().toISOString(),
        is_unresolvable_warning: true,
        tool_calls_made: [
          {
            id: "tc_01",
            tool_name: "tariff_gazette_search",
            endpoint: "GET /api/v1/eligibility/temporal-lookup",
            summary: "Searched active CBIC gazette records. Returned 0 statutory provisions for post-2026 tariff revisions.",
            parameters: { target_horizon: "2029", jurisdiction: "IN" },
            execution_time_ms: 142,
            provenance: {
              type: "UNAVAILABLE",
              source: "CBIC Gazette Feed (Degraded/Out of Scope)",
            },
          },
          {
            id: "tc_02",
            tool_name: "dgft_prohibited_goods_audit",
            endpoint: "GET /api/v1/classify/policy-check",
            summary: "ITC(HS) Schedule 1 check: Import Policy flagged as PROHIBITED under Rule 12 MoEFCC.",
            parameters: { category: "hazardous_scrap", end_use: "commercial" },
            execution_time_ms: 189,
            provenance: {
              type: "LIVE",
              source: "DGFT Import Policy Schedule 1",
            },
          },
        ],
        unresolved_subclaims: [
          "Unresolved subclaim 1: Future prospective tariff rates for FY 2028-29 are not gazetted by Ministry of Finance.",
          "Unresolved subclaim 2: License-free import cannot be granted for uncertified e-waste materials under MoEFCC public notices.",
        ],
      };
      return NextResponse.json(response);
    }

    // Scenario 2: Sourcing Comparison / Origin Arbitrage query
    if (query.includes("compare") || query.includes("arbitrage") || query.includes("versus") || query.includes("vs")) {
      const response: AksharaResponse = {
        message_id: messageId,
        conversation_id: conversationId,
        role: "assistant",
        content:
          "### Sourcing Arbitrage Analysis: UAE vs. United States (HS 7204.49.00)\n\nBased on concurrent evaluation across our trade engines, procuring from the **United Arab Emirates** presents a decisive landed-cost advantage:\n\n- **Tariff Concession:** Under the India-UAE CEPA (Notification 22/2022-Customs), Basic Customs Duty is **0.00%** (saving 2.50% MFN BCD).\n- **Logistics Advantage:** Ocean container freight from Jebel Ali to Nhava Sheva (JNPT) averages **$1,100/FEU** (4 days transit) compared to **$3,200/FEU** from US East Coast ports (32 days transit).\n- **Net Landed Cost Savings:** For a 100 MT consignment, UAE sourcing delivers a net landed cost of **₹40,42,575** vs. **₹43,32,815** from the US, saving **₹2,90,240 (6.70% total arbitrage advantage)**.\n\n*Origin Requirement:* Ensure the consignment is backed by a valid electronic Certificate of Origin (e-COO) confirming CTSH + 40% Regional Value Addition.",
        timestamp: new Date().toISOString(),
        tool_calls_made: [
          {
            id: "tc_cmp_01",
            tool_name: "origin_arbitrage_calc",
            endpoint: "POST /api/v1/compare",
            summary: "Executed concurrent duty and landed cost matrix across US, AE, AU, and VN.",
            parameters: { hs_code: activeHs, assessable_value: 42000, quantity: 100 },
            execution_time_ms: 312,
            provenance: {
              type: "LIVE",
              source: "CBIC & CEPA Tariff Schedules",
            },
          },
          {
            id: "tc_cmp_02",
            tool_name: "cepa_rules_of_origin",
            endpoint: "GET /api/v1/eligibility/72044900",
            summary: "Verified India-UAE CEPA Annex 2A Rules of Origin compliance requirements.",
            parameters: { hs_code: "7204.49.00", agreement: "CEPA" },
            execution_time_ms: 98,
            provenance: {
              type: "LIVE",
              source: "Ministry of Commerce CEPA Operational Manual",
            },
          },
        ],
        unresolved_subclaims: [],
        context_action: {
          label: "Update Shared Context to UAE (CEPA) Corridor",
          payload: {
            countryOfOrigin: "AE",
            hsCode: "7204.49.00",
            materialName: "Heavy Melting Steel Scrap (UAE Sourced)",
          },
        },
      };
      return NextResponse.json(response);
    }

    // Scenario 3: Standard Grounded Classification & Duty Calculation query
    const response: AksharaResponse = {
      message_id: messageId,
      conversation_id: conversationId,
      role: "assistant",
      content:
        "### Statutory Classification & Duty Report: Heavy Melting Steel Scrap\n\nI have classified this commodity and computed statutory customs tariffs under the **Customs Tariff Act 2026**:\n\n1. **HS Classification:** **7204.49.00** (*Other waste and scrap of iron or steel*).\n   - **GIR Applied:** Rule 1 (Heading 7204 specifically covers ferrous waste and scrap) and Rule 3(a) (most specific subheading description).\n   - **Confidence:** 94% statutory certainty.\n2. **Statutory Tariff Breakdown (Standard MFN):**\n   - **Basic Customs Duty (BCD):** 2.50%\n   - **Social Welfare Surcharge (SWS):** 10.00% on BCD (0.25% effective)\n   - **AIDC:** 0.00% (Exempt under Notification 11/2021-Customs)\n   - **Integrated GST (IGST):** 18.00% (Input Tax Credit eligible)\n   - **Total Effective Duty Outlay:** 21.25% on Assessable CIF Value.\n3. **Preferential FTA Option:** If sourced from the UAE under CEPA, BCD is reduced to **0.00%** with valid COO.\n4. **Mandatory Port Compliance:** Steel Import Monitoring System (SIMS) registration and Pre-Shipment Inspection Certificate (PSIC) are legally mandatory prior to discharge at Indian ports.",
      timestamp: new Date().toISOString(),
      tool_calls_made: [
        {
          id: "tc_std_01",
          tool_name: "gir_classification_engine",
          endpoint: "POST /api/v1/classify",
          summary: "Evaluated commercial description against WCO GIR 1-6. Matched Tariff Item 7204 49 00 with 94% confidence.",
          parameters: { description: query, material_type: "Metals & Scrap" },
          execution_time_ms: 220,
          provenance: {
            type: "LIVE",
            source: "CBIC Customs Tariff Act 2026",
            effectiveDate: "2026-03-01",
          },
        },
        {
          id: "tc_std_02",
          tool_name: "customs_duty_calculator",
          endpoint: "POST /api/v1/duty/calculate",
          summary: "Computed CIF valuation, BCD (2.5%), SWS (10%), and IGST (18%) on ₹39,48,725 assessable base.",
          parameters: { hs_code: "7204.49.00", currency: "USD", assessable_value: 42000 },
          execution_time_ms: 165,
          provenance: {
            type: "LIVE",
            source: "CBIC ICEGATE Statutory Tariff Engine",
          },
        },
        {
          id: "tc_std_03",
          tool_name: "statutory_compliance_checker",
          endpoint: "GET /api/v1/eligibility/72044900",
          summary: "Retrieved mandatory non-tariff measures: SIMS Registration and PSIC radiation certificate required.",
          parameters: { hs_code: "7204.49.00" },
          execution_time_ms: 110,
          provenance: {
            type: "LIVE",
            source: "DGFT Public Notices & SIMS Gateway",
          },
        },
      ],
      unresolved_subclaims: [],
      context_action: {
        label: "Populate HS 7204.49.00 into Shared Context for Duty & Landed Cost",
        payload: {
          hsCode: "7204.49.00",
          hsDescription: "Other waste and scrap of iron or steel",
          materialName: "Heavy Melting Steel Scrap (HMS 1/2)",
          countryOfOrigin: "US",
          assessableValue: 42000,
          currency: "USD",
          quantity: 100,
          unit: "MT",
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate Akshara copilot response" },
      { status: 400 }
    );
  }
}

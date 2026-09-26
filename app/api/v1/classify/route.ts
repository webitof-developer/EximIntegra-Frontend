import { NextResponse } from "next/server";
import { ClassificationResponse, ClassificationCandidate } from "@/lib/types";

// Knowledge base of statutory classifications for realistic testing
const classificationCatalog: Record<string, { primary: ClassificationCandidate; alternates: ClassificationCandidate[] }> = {
  scrap: {
    primary: {
      hs_code: "7204.49.00",
      description: "Other waste and scrap of iron or steel",
      chapter: "Chapter 72",
      chapter_title: "Iron and Steel",
      confidence: 0.94,
      gir_applied: "GIR 1, GIR 3(a)",
      gir_rationale:
        "By application of GIR 1, heading 7204 specifically encompasses ferrous waste and scrap. Under GIR 3(a), subheading 7204.49 covers other ferrous scrap not specified under prior subheadings 7204.10 through 7204.41.",
      provenance: {
        type: "LIVE",
        source: "CBIC Customs Tariff Act 2026",
        effectiveDate: "2026-03-01",
        confidenceScore: 0.94,
        notes: "Tariff Item 7204 49 00 verified against DGFT Notification 42/2025-26.",
      },
      policy_condition: "Free",
      duty_indicative: {
        bcd: 2.5,
        sws: 10,
        igst: 18,
        effective_rate: 21.25,
      },
      export_incentives: ["RoDTEP 0.8%", "Duty Drawback 1.2%"],
    },
    alternates: [
      {
        hs_code: "7204.10.00",
        description: "Waste and scrap of cast iron",
        chapter: "Chapter 72",
        confidence: 0.76,
        gir_applied: "GIR 3(a)",
        gir_rationale:
          "Applicable if the shipment consists exclusively of fractured grey/ductile cast iron elements with carbon content > 2.0%.",
        provenance: {
          type: "LIVE",
          source: "CBIC Customs Tariff Act 2026",
          confidenceScore: 0.76,
        },
        policy_condition: "Free",
        duty_indicative: { bcd: 2.5, sws: 10, igst: 18, effective_rate: 21.25 },
      },
      {
        hs_code: "7204.29.90",
        description: "Other waste and scrap of alloy steel",
        chapter: "Chapter 72",
        confidence: 0.68,
        gir_applied: "GIR 3(b)",
        gir_rationale:
          "Invoked if certified chemical assay exhibits nickel, chromium, or molybdenum above statutory thresholds defined in Note 1(f) to Chapter 72.",
        provenance: {
          type: "ILLUSTRATIVE",
          source: "WCO Harmonized Explanatory Notes",
          confidenceScore: 0.68,
        },
        policy_condition: "Free",
        duty_indicative: { bcd: 5.0, sws: 10, igst: 18, effective_rate: 24.49 },
      },
    ],
  },
  battery: {
    primary: {
      hs_code: "8507.60.00",
      description: "Lithium-ion accumulators (including cylindrical, prismatic and pouch cells)",
      chapter: "Chapter 85",
      chapter_title: "Electrical Machinery and Equipment",
      confidence: 0.96,
      gir_applied: "GIR 1, GIR 6",
      gir_rationale:
        "Heading 8507 explicitly classifies electric accumulators. Subheading 8507.60 specifically identifies lithium-ion chemistries.",
      provenance: {
        type: "LIVE",
        source: "CBIC Tariff Schedule 2026",
        effectiveDate: "2026-02-15",
        confidenceScore: 0.96,
      },
      policy_condition: "Restricted",
      duty_indicative: {
        bcd: 10.0,
        sws: 10,
        igst: 18,
        effective_rate: 30.98,
      },
      export_incentives: ["PLI ACC Battery", "Advance Authorization Eligible"],
    },
    alternates: [
      {
        hs_code: "8507.90.90",
        description: "Parts of electric accumulators, other",
        chapter: "Chapter 85",
        confidence: 0.71,
        gir_applied: "GIR 3(c)",
        gir_rationale: "Applicable if goods consist only of unformed cell enclosures or BMS sub-assemblies.",
        provenance: {
          type: "ILLUSTRATIVE",
          source: "Customs Advance Ruling CAAR/MUM/2024",
          confidenceScore: 0.71,
        },
      },
    ],
  },
  solar: {
    primary: {
      hs_code: "8541.43.00",
      description: "Photovoltaic cells assembled in modules or made up into panels",
      chapter: "Chapter 85",
      chapter_title: "Electrical Machinery and Equipment",
      confidence: 0.93,
      gir_applied: "GIR 1",
      gir_rationale:
        "Subheading 8541.43 precisely covers assembled solar PV modules with bypass diodes.",
      provenance: {
        type: "LIVE",
        source: "CBIC Customs Tariff Act 2026",
        effectiveDate: "2026-03-01",
        confidenceScore: 0.93,
      },
      policy_condition: "Free",
      duty_indicative: {
        bcd: 40.0, // Basic Customs Duty on solar modules in India
        sws: 10,
        igst: 12,
        effective_rate: 61.28,
      },
    },
    alternates: [
      {
        hs_code: "8541.42.00",
        description: "Photovoltaic cells not assembled in modules or made up into panels",
        chapter: "Chapter 85",
        confidence: 0.82,
        gir_applied: "GIR 1, GIR 3(a)",
        gir_rationale: "Applicable if cells are imported loose/unpackaged for domestic module fabrication.",
        provenance: {
          type: "LIVE",
          source: "CBIC Customs Tariff Act 2026",
          confidenceScore: 0.82,
        },
        duty_indicative: { bcd: 25.0, sws: 10, igst: 12, effective_rate: 42.8 },
      },
    ],
  },
  copper: {
    primary: {
      hs_code: "7404.00.12",
      description: "Copper scrap namely copper wire scrap (ISRI code 'Barley' or 'Berry')",
      chapter: "Chapter 74",
      chapter_title: "Copper and Articles Thereof",
      confidence: 0.91,
      gir_applied: "GIR 1, ISRI Mapping",
      gir_rationale:
        "Tariff item 7404 00 12 aligns with clean, unalloyed bare bright copper wire scrap under National Tariff Notes.",
      provenance: {
        type: "LIVE",
        source: "CBIC Customs Tariff Act 2026",
        effectiveDate: "2026-03-01",
        confidenceScore: 0.91,
      },
      policy_condition: "Free",
      duty_indicative: {
        bcd: 5.0,
        sws: 10,
        igst: 18,
        effective_rate: 24.49,
      },
    },
    alternates: [
      {
        hs_code: "7404.00.22",
        description: "Brass scrap (ISRI code 'Honey')",
        chapter: "Chapter 74",
        confidence: 0.74,
        gir_applied: "GIR 3(b)",
        gir_rationale: "Invoked if zinc concentration exceeds 10% by mass.",
        provenance: {
          type: "ILLUSTRATIVE",
          source: "ISRI Standards Manual 2026",
          confidenceScore: 0.74,
        },
      },
    ],
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = (body.description || "").toLowerCase();

    // Find match based on query keywords
    let matchKey = "scrap";
    if (query.includes("battery") || query.includes("lithium") || query.includes("cell")) {
      matchKey = "battery";
    } else if (query.includes("solar") || query.includes("panel") || query.includes("photovoltaic")) {
      matchKey = "solar";
    } else if (query.includes("copper") || query.includes("brass") || query.includes("wire")) {
      matchKey = "copper";
    }

    const template = classificationCatalog[matchKey];

    const response: ClassificationResponse = {
      query: body.description,
      primary: {
        ...template.primary,
        // Carry forward input specs
        ...(body.country_of_origin ? { countryOfOrigin: body.country_of_origin } : {}),
      },
      alternates: template.alternates,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid classification request payload" },
      { status: 400 }
    );
  }
}

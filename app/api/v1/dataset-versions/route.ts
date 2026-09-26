import { NextResponse } from "next/server";
import { DatasetVersion } from "@/lib/types";

export const statutoryDatasets: DatasetVersion[] = [
  {
    id: "ds_cbic_tariff_2026",
    name: "CBIC Customs Tariff Act 2026 (First & Second Schedules)",
    authority: "Central Board of Indirect Taxes and Customs (CBIC), Ministry of Finance",
    reference_code: "Customs Tariff Act 1975, Updated via Finance Act 2026",
    version: "v2026.03.1-RELEASE",
    effective_date: "2026-03-01",
    last_sync: "2026-09-26T06:00:00.000Z",
    status: "ACTIVE",
    record_count: 12480,
    official_portal_url: "https://www.cbic.gov.in/customs-tariff",
    provenance: {
      type: "LIVE",
      source: "CBIC Official Gazette Feed",
      effectiveDate: "2026-03-01",
      notes: "Contains complete 8-digit tariff items, Standard MFN rates, and SWS mandates.",
    },
    coverage_summary:
      "All 98 Chapters covering agricultural produce, minerals, metals, chemicals, electronics, and capital goods.",
  },
  {
    id: "ds_icegate_forex",
    name: "CBIC ICEGATE Daily Statutory Exchange Rates",
    authority: "Central Board of Indirect Taxes and Customs",
    reference_code: "Customs Notification (Non-Tariff) Series 2026",
    version: "v2026.09.26-D",
    effective_date: "2026-09-26",
    last_sync: "2026-09-26T12:30:00.000Z",
    status: "ACTIVE",
    record_count: 24,
    official_portal_url: "https://www.icegate.gov.in/exchange-rates",
    provenance: {
      type: "LIVE",
      source: "ICEGATE Gazette EDI Server",
      effectiveDate: "2026-09-26",
      notes: "Statutory conversion rates applied for Assessable CIF valuation.",
    },
    coverage_summary:
      "Official notification exchange rates for USD, EUR, GBP, AED, JPY, CNY, AUD, and major trading currencies.",
  },
  {
    id: "ds_dgft_ftp_2023",
    name: "DGFT Foreign Trade Policy & ITC(HS) Import Schedule 1",
    authority: "Directorate General of Foreign Trade (DGFT), Ministry of Commerce & Industry",
    reference_code: "Foreign Trade Policy 2023, Public Notice No. 52/2025-26",
    version: "v2026.02-REVISED",
    effective_date: "2026-02-15",
    last_sync: "2026-09-25T18:00:00.000Z",
    status: "ACTIVE",
    record_count: 12480,
    official_portal_url: "https://www.dgft.gov.in/itc-hs",
    provenance: {
      type: "LIVE",
      source: "DGFT Digital Portal",
      effectiveDate: "2026-02-15",
      notes: "Determines Free, Restricted, State Trading (STE), or Prohibited import policy conditions.",
    },
    coverage_summary:
      "Statutory policy classifications, import licensing requirements, and non-tariff notification compliances.",
  },
  {
    id: "ds_fta_cepa_registry",
    name: "India Preferential Trade Agreements & Rules of Origin Registry",
    authority: "Department of Commerce / CBIC International Customs Division",
    reference_code: "Notification No. 22/2022-Customs (UAE CEPA) & Notification 112/2022-Customs (Australia ECTA)",
    version: "v2026.01.4",
    effective_date: "2026-01-01",
    last_sync: "2026-09-24T14:15:00.000Z",
    status: "ACTIVE",
    record_count: 38200,
    official_portal_url: "https://commerce.gov.in/trade-agreements",
    provenance: {
      type: "LIVE",
      source: "Ministry of Commerce Preferential Tariff Repository",
      effectiveDate: "2026-01-01",
      notes: "Concessional tariff rates and CTSH / RVA percentage qualification rules.",
    },
    coverage_summary:
      "Includes India-UAE CEPA, India-Australia ECTA, ASEAN-India FTA (AIFTA), SAFTA, and Mercosur PTA.",
  },
  {
    id: "ds_gst_council_igst",
    name: "GST Council Schedule III Classification Rates",
    authority: "Goods and Services Tax Network (GSTN) / GST Council",
    reference_code: "IGST Act Notification No. 01/2017-Integrated Tax (Rate) as amended 2026",
    version: "v2026.01.2",
    effective_date: "2026-01-01",
    last_sync: "2026-09-22T08:00:00.000Z",
    status: "ACTIVE",
    record_count: 9840,
    official_portal_url: "https://cbic-gst.gov.in",
    provenance: {
      type: "LIVE",
      source: "GSTN Statutory Data Gateway",
      effectiveDate: "2026-01-01",
      notes: "Integrated Goods and Services Tax (IGST) levied on imported assessable value + customs duties.",
    },
    coverage_summary:
      "Rates across 0%, 5%, 12%, 18%, and 28% slabs including ITC eligibility status for commercial importers.",
  },
  {
    id: "ds_dgtr_trade_remedies",
    name: "DGTR Anti-Dumping & Countervailing Duty Registry",
    authority: "Directorate General of Trade Remedies (DGTR), Department of Commerce",
    reference_code: "Customs Tariff (Identification, Assessment & Collection of Anti-Dumping Duty) Rules",
    version: "v2026.03-ILLUSTRATIVE",
    effective_date: "2026-03-01",
    last_sync: "2026-09-26T04:00:00.000Z",
    status: "ACTIVE",
    record_count: 450,
    official_portal_url: "https://www.dgtr.gov.in",
    provenance: {
      type: "ILLUSTRATIVE",
      source: "DGTR Gazette Findings (Benchmark)",
      effectiveDate: "2026-03-01",
      notes:
        "Anti-dumping duties are exporter- and country-specific benchmark estimations. Must be validated against specific producer gazette notifications.",
    },
    coverage_summary:
      "Trade remedy benchmark calculations for steel products, solar modules, chemicals, and synthetic yarn.",
  },
  {
    id: "ds_smelter_yield_standards",
    name: "Smelter Metallurgy & Induction Assay Yield Matrix",
    authority: "Bureau of Indian Standards (BIS) / Industrial Metallurgical Standards",
    reference_code: "IS Standard 2026-Smelter Recovery Guidelines",
    version: "v2026.01",
    effective_date: "2026-01-01",
    last_sync: "2026-09-20T10:00:00.000Z",
    status: "ACTIVE",
    record_count: 85,
    provenance: {
      type: "ILLUSTRATIVE",
      source: "Industrial Furnace Smelter Engineering Norms",
      notes:
        "Yield multipliers and melting recovery rates are operational engineering benchmarks. Fully customizable by user.",
    },
    coverage_summary:
      "Scrap grades HMS 1/2, Shredded 211, Copper Birch/Cliff, Aluminium Tense/Tabor, and Brass Honey.",
  },
  {
    id: "ds_port_tariffs_scales",
    name: "Major Indian Ports Scale of Rates (SOR) & CFS Tariffs",
    authority: "Tariff Authority for Major Ports (TAMP) / Port Trust Registries",
    reference_code: "SOR Nhava Sheva (JNPT), Mundra (APSEZ), Chennai Port 2025-26",
    version: "v2025-26.H2",
    effective_date: "2025-10-01",
    last_sync: "2026-09-18T16:00:00.000Z",
    status: "ACTIVE",
    record_count: 620,
    provenance: {
      type: "BYOK",
      source: "Port Terminal Published Scales of Rates",
      notes: "Commercial handling rates for 20ft/40ft containers, wharfage, and demurrages.",
    },
    coverage_summary:
      "Container Handling Charges (THC), Container Freight Station (CFS) movement, and inland dry port transits.",
  },
];

export async function GET() {
  return NextResponse.json(statutoryDatasets);
}

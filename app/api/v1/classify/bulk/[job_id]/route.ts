import { NextResponse } from "next/server";
import { BulkJobStatus, BulkClassificationItem } from "@/lib/types";

// In-memory poll tracking for mock demonstration
const jobPollMap = new Map<string, number>();

const mockClassifiedRows: BulkClassificationItem[] = [
  {
    id: "item_01",
    input_description: "Heavy Melting Steel Scrap HMS 1/2 for furnace melt",
    matched_hs_code: "7204.49.00",
    matched_description: "Other waste and scrap of iron or steel",
    confidence: 0.95,
    gir_rule: "GIR 1, 3(a)",
    indicative_bcd: 2.5,
    provenance_type: "LIVE",
  },
  {
    id: "item_02",
    input_description: "Bare bright copper wire scrap Berry 99.9% purity",
    matched_hs_code: "7404.00.12",
    matched_description: "Copper scrap namely copper wire scrap (ISRI 'Barley')",
    confidence: 0.92,
    gir_rule: "GIR 1",
    indicative_bcd: 5.0,
    provenance_type: "LIVE",
  },
  {
    id: "item_03",
    input_description: "Cylindrical 21700 NMC lithium battery cells",
    matched_hs_code: "8507.60.00",
    matched_description: "Lithium-ion accumulators",
    confidence: 0.97,
    gir_rule: "GIR 1, 6",
    indicative_bcd: 10.0,
    provenance_type: "LIVE",
  },
  {
    id: "item_04",
    input_description: "Monocrystalline silicon solar photovoltaic modules",
    matched_hs_code: "8541.43.00",
    matched_description: "Photovoltaic cells assembled in modules",
    confidence: 0.94,
    gir_rule: "GIR 1",
    indicative_bcd: 40.0,
    provenance_type: "LIVE",
  },
  {
    id: "item_05",
    input_description: "Aluminum extrusion scrap 6063 clean profiles",
    matched_hs_code: "7602.00.10",
    matched_description: "Aluminium scrap namely clean aluminium casting",
    confidence: 0.89,
    gir_rule: "GIR 1, 3(a)",
    indicative_bcd: 5.0,
    provenance_type: "LIVE",
  },
  {
    id: "item_06",
    input_description: "Lead-acid starter batteries 12V 70Ah automotive",
    matched_hs_code: "8507.10.00",
    matched_description: "Lead-acid accumulators of a kind used for starting engines",
    confidence: 0.98,
    gir_rule: "GIR 1",
    indicative_bcd: 10.0,
    provenance_type: "LIVE",
  },
  {
    id: "item_07",
    input_description: "Industrial nickel-chromium alloy scrap Hastelloy C276",
    matched_hs_code: "7503.00.10",
    matched_description: "Nickel waste and scrap",
    confidence: 0.86,
    gir_rule: "GIR 3(b)",
    indicative_bcd: 2.5,
    provenance_type: "ILLUSTRATIVE",
  },
  {
    id: "item_08",
    input_description: "Crude unrefined palm oil for edible refining",
    matched_hs_code: "1511.10.00",
    matched_description: "Crude palm oil and its fractions",
    confidence: 0.91,
    gir_rule: "GIR 1",
    indicative_bcd: 7.5,
    provenance_type: "LIVE",
  },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params;
  const currentPoll = (jobPollMap.get(job_id) || 0) + 1;
  jobPollMap.set(job_id, currentPoll);

  const total = mockClassifiedRows.length;

  if (currentPoll === 1) {
    const status: BulkJobStatus = {
      job_id,
      status: "PROCESSING",
      total_rows: total,
      processed_rows: 4,
      progress_percent: 50,
      created_at: new Date(Date.now() - 3000).toISOString(),
      results: mockClassifiedRows.slice(0, 4),
    };
    return NextResponse.json(status);
  }

  // Poll 2 onwards: Job Complete
  const status: BulkJobStatus = {
    job_id,
    status: "COMPLETED",
    total_rows: total,
    processed_rows: total,
    progress_percent: 100,
    created_at: new Date(Date.now() - 6000).toISOString(),
    completed_at: new Date().toISOString(),
    download_url: `/api/v1/classify/bulk/${job_id}/download`,
    results: mockClassifiedRows,
  };

  return NextResponse.json(status);
}

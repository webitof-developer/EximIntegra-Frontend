"use client";

import React, { useState, useEffect } from "react";
import {
  useClassifyBulkMutation,
  useGetBulkJobStatusQuery,
} from "@/store/classificationApi";
import {
  Card,
  ProvenanceBadge,
  StatusPill,
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui";
import { formatHsCode, formatPercent } from "@/lib/formatters";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  RefreshCw,
  FileText,
  ArrowRight,
} from "lucide-react";

export function BulkClassificationUploader() {
  const [classifyBulk, { isLoading: isUploading }] = useClassifyBulkMutation();
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Poll against current job ID every 1500ms while active
  const { data: jobStatus, refetch } = useGetBulkJobStatusQuery(
    currentJobId as string,
    {
      skip: !currentJobId,
      pollingInterval: 1500,
    }
  );

  const handleSimulateUpload = async (presetName?: string) => {
    try {
      setFileName(presetName || "import_manifest_raw_materials_q1.csv");
      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test,csv,data"], { type: "text/csv" }),
        presetName || "import_manifest.csv"
      );

      const res = await classifyBulk(formData).unwrap();
      setCurrentJobId(res.job_id);
    } catch (err) {
      alert("Failed to submit bulk classification job.");
    }
  };

  const handleDownloadSample = () => {
    const csvContent =
      "Item No,Commercial Description of Goods,Material Category,Country of Origin,Quantity,Unit\n" +
      '1,"Heavy Melting Steel Scrap HMS 1/2 prepared",Metals,US,100,MT\n' +
      '2,"Bare bright copper wire scrap Berry 99.9%",Metals,AE,25,MT\n' +
      '3,"Lithium-ion cylindrical battery cells 21700",Electronics,CN,5000,PCS\n' +
      '4,"Solar photovoltaic modules monocrystalline 550W",Electronics,VN,400,PCS\n' +
      '5,"Clean 6063 aluminum extrusion scrap",Metals,DE,45,MT\n' +
      '6,"Lead acid starter batteries 12V 70Ah",Electronics,JP,200,PCS\n' +
      '7,"Hastelloy C276 nickel alloy scrap",Metals,US,15,MT\n' +
      '8,"Crude unrefined palm oil for refining",Chemicals,MY,500,MT\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "EximIntegra_Bulk_Classification_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadResults = () => {
    if (!jobStatus?.results) return;
    const headers =
      "Item ID,Input Description,Matched HS Code,Statutory Description,Confidence,GIR Rule,Indicative BCD,Provenance\n";
    const rows = jobStatus.results
      .map(
        (r) =>
          `"${r.id}","${r.input_description}","${r.matched_hs_code}","${r.matched_description}",${(
            r.confidence * 100
          ).toFixed(0)}%,"${r.gir_rule}",${r.indicative_bcd}%,"${r.provenance_type}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `EximIntegra_Classified_${jobStatus.job_id}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isCompleted = jobStatus?.status === "COMPLETED";
  const isProcessing = Boolean(
    currentJobId && (jobStatus?.status === "PROCESSING" || isUploading)
  );

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-panel border-2 border-dashed border-line hover:border-blue/50 rounded-xl p-8 text-center transition-colors">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-dim text-blue flex items-center justify-center mx-auto shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink">
              Upload Batch Manifest for Bulk HS Classification
            </h4>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Upload a CSV containing shipment line items. The engine applies
              statutory GIR Rules 1–6 concurrently and outputs 8-digit tariff items.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSimulateUpload()}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {isProcessing
                  ? "Processing Batch..."
                  : "Upload & Classify Sample Manifest"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSample}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg hover:bg-line border border-line text-xs font-semibold text-ink transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-muted" />
              <span>Download CSV Template</span>
            </button>
          </div>

          <div className="text-[11px] text-muted font-mono">
            Supported columns: Description, Category, Origin, Value, Quantity
          </div>
        </div>
      </div>

      {/* Progress / Status Panel */}
      {currentJobId && (
        <Card
          title={
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-ink">
                Job ID: {currentJobId}
              </span>
              <StatusPill
                label={jobStatus?.status || "PROCESSING"}
                variant={isCompleted ? "success" : "primary"}
                dot={!isCompleted}
              />
            </div>
          }
          subtitle={`Uploaded file: ${fileName || "manifest.csv"} — ${
            jobStatus?.total_rows || 8
          } total lines`}
          action={
            isCompleted && (
              <button
                type="button"
                onClick={handleDownloadResults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green text-white text-xs font-semibold hover:bg-green-dark transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Classified CSV</span>
              </button>
            )
          }
        >
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted">
                  {isCompleted
                    ? "Classification Pipeline Complete"
                    : "Applying GIR Rules 1-6 across records..."}
                </span>
                <span className="font-bold text-ink">
                  {jobStatus?.progress_percent || (isCompleted ? 100 : 50)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-bg border border-line overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isCompleted ? "bg-green" : "bg-blue"
                  }`}
                  style={{
                    width: `${jobStatus?.progress_percent || (isCompleted ? 100 : 50)}%`,
                  }}
                />
              </div>
            </div>

            {/* Results Table */}
            {jobStatus?.results && jobStatus.results.length > 0 && (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Item</TableHead>
                      <TableHead>Commercial Description</TableHead>
                      <TableHead>Matched HS Code</TableHead>
                      <TableHead>Statutory Description</TableHead>
                      <TableHead>Conf.</TableHead>
                      <TableHead>GIR Rule</TableHead>
                      <TableHead>BCD</TableHead>
                      <TableHead>Provenance</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {jobStatus.results.map((row) => (
                      <tr key={row.id} className="hover:bg-bg/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-muted text-[11px]">
                          {row.id}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-ink max-w-[200px] truncate">
                          {row.input_description}
                        </td>
                        <td className="py-2.5 px-3 font-data font-bold text-ink whitespace-nowrap">
                          {formatHsCode(row.matched_hs_code)}
                        </td>
                        <td className="py-2.5 px-3 text-muted max-w-[220px] truncate text-[11px]">
                          {row.matched_description}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-ink">
                          {(row.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-blue">
                          {row.gir_rule}
                        </td>
                        <td className="py-2.5 px-3 font-data font-semibold text-ink">
                          {formatPercent(row.indicative_bcd)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <ProvenanceBadge type={row.provenance_type} compact />
                        </td>
                      </tr>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

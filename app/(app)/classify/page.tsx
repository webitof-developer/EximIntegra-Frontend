"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMaterialContext } from "@/store/contextSlice";
import { useClassifyMutation } from "@/store/classificationApi";
import {
  Card,
  Tabs,
  StepBadge,
  StatusPill,
  ProvenanceBadge,
  DegradedStateAlert,
} from "@/components/ui";
import { SingleClassificationForm } from "@/components/classification/SingleClassificationForm";
import { ClassificationResultsView } from "@/components/classification/ClassificationResultsView";
import { BulkClassificationUploader } from "@/components/classification/BulkClassificationUploader";
import {
  ClassificationRequest,
  ClassificationResponse,
  ClassificationCandidate,
} from "@/lib/types";
import { Search, FileSpreadsheet, ShieldAlert, Sparkles } from "lucide-react";

export default function ClassifyPage() {
  const dispatch = useAppDispatch();
  const currentContext = useAppSelector((state) => state.context.current);

  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [classify, { isLoading }] = useClassifyMutation();
  const [result, setResult] = useState<ClassificationResponse | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Store last entered commercial details to enrich contextSlice
  const [lastCommercialParams, setLastCommercialParams] = useState<{
    assessableValue?: number;
    currency?: string;
    quantity?: number;
    unit?: string;
  }>({});

  const handleSingleClassify = async (
    req: ClassificationRequest & {
      assessableValue?: number;
      currency?: string;
      quantity?: number;
      unit?: string;
    }
  ) => {
    try {
      setErrorState(null);
      setLastCommercialParams({
        assessableValue: req.assessableValue,
        currency: req.currency,
        quantity: req.quantity,
        unit: req.unit,
      });

      const res = await classify({
        description: req.description,
        material_type: req.material_type,
        country_of_origin: req.country_of_origin,
      }).unwrap();

      setResult(res);

      // Auto-set initial context upon classification if empty
      if (!currentContext.hsCode && res.primary) {
        dispatch(
          setMaterialContext({
            hsCode: res.primary.hs_code,
            hsDescription: res.primary.description,
            materialName: req.description,
            countryOfOrigin: req.country_of_origin || "US",
            destinationCountry: "IN",
            assessableValue: req.assessableValue || 42000,
            currency: req.currency || "USD",
            quantity: req.quantity || 100,
            unit: req.unit || "MT",
          })
        );
      }
    } catch (err: any) {
      setErrorState(
        err?.data?.error ||
          "Statutory GIR classification endpoint unreachable or returned an unmapped tariff item. Verification degraded."
      );
    }
  };

  const handleSelectContext = (candidate: ClassificationCandidate) => {
    dispatch(
      setMaterialContext({
        hsCode: candidate.hs_code,
        hsDescription: candidate.description,
        materialName: result?.query || candidate.description,
        countryOfOrigin: "US",
        destinationCountry: "IN",
        assessableValue: lastCommercialParams.assessableValue || 42000,
        currency: lastCommercialParams.currency || "USD",
        quantity: lastCommercialParams.quantity || 100,
        unit: lastCommercialParams.unit || "MT",
      })
    );
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-6 pb-16">
          {/* Multi-Step Pipeline Header */}
          <div className="p-4 bg-panel border border-line rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <StepBadge
                step={1}
                label="HS Classification"
                description="Determine 8-digit tariff"
                state="current"
              />
              <StepBadge
                step={2}
                label="Duty Calculator"
                description="Statutory BCD/SWS/IGST"
                state="pending"
              />
              <StepBadge
                step={3}
                label="Landed Cost"
                description="Freight & Yield Modeling"
                state="pending"
                isLast
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <span>Standard:</span>
              <ProvenanceBadge type="LIVE" source="CBIC 2026" compact />
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between">
            <Tabs
              activeTab={activeTab}
              onChange={(tab) => setActiveTab(tab as "single" | "bulk")}
              tabs={[
                {
                  id: "single",
                  label: "Single Material Lookup",
                  icon: <Search className="w-3.5 h-3.5" />,
                },
                {
                  id: "bulk",
                  label: "Bulk Batch Manifest (CSV)",
                  icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
                  badge: "CSV",
                },
              ]}
            />

            <span className="text-xs text-muted hidden sm:inline-block">
              {activeTab === "single"
                ? "GIR 1 to 6 Sequential Legal Evaluation"
                : "Batch Asynchronous Processor with Polling"}
            </span>
          </div>

          {/* Error / Degraded State Alert (§3.5) */}
          {errorState && (
            <DegradedStateAlert
              reason={errorState}
              endpoint="POST /api/v1/classify"
              onRetry={() => setErrorState(null)}
            />
          )}

          {/* Tab Content */}
          {activeTab === "single" ? (
            <div className="space-y-6">
              <Card
                title="Single Commodity Classification"
                subtitle="Enter description of goods or select a preset to evaluate General Rules of Interpretation."
              >
                <SingleClassificationForm
                  onSubmit={handleSingleClassify}
                  isLoading={isLoading}
                />
              </Card>

              {/* Classification Results */}
              {result && (
                <ClassificationResultsView
                  result={result}
                  onSelectContext={handleSelectContext}
                  activeContextHsCode={currentContext.hsCode}
                />
              )}
            </div>
          ) : (
            <BulkClassificationUploader />
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

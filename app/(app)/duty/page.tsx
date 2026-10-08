"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMaterialContext } from "@/store/contextSlice";
import {
  useCalculateDutyMutation,
  useGetDutyCalculationQuery,
} from "@/store/dutyApi";
import {
  Card,
  StepBadge,
  StatusPill,
  ProvenanceBadge,
  DegradedStateAlert,
} from "@/components/ui";
import { DutyCalculationForm } from "@/components/duty/DutyCalculationForm";
import { DutyBreakdownView } from "@/components/duty/DutyBreakdownView";
import { DutyCalculationRequest, DutyCalculationResponse } from "@/lib/types";
import { getApiErrorMessage } from "@/lib/utils";
import { Calculator, Search, History, ArrowRight } from "lucide-react";

function DutyCalculatorContent() {
  const searchParams = useSearchParams();
  const paramCalcId = searchParams.get("calculation_id");

  const dispatch = useAppDispatch();
  const currentContext = useAppSelector((state) => state.context.current);

  const [calculateDuty, { isLoading: isCalculating }] =
    useCalculateDutyMutation();

  const [calculationResult, setCalculationResult] =
    useState<DutyCalculationResponse | null>(null);
  const [lookupId, setLookupId] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // If calculation_id passed in URL query, fetch it
  const { data: fetchedCalc, isLoading: isFetching } =
    useGetDutyCalculationQuery(paramCalcId as string, {
      skip: !paramCalcId,
    });

  useEffect(() => {
    if (fetchedCalc) {
      setCalculationResult(fetchedCalc);
    }
  }, [fetchedCalc]);

  const handleCalculate = async (req: DutyCalculationRequest) => {
    try {
      setErrorState(null);
      const res = await calculateDuty(req).unwrap();
      setCalculationResult(res);
      setIsSaved(false);

      // Auto update context with calculated figures
      dispatch(
        setMaterialContext({
          hsCode: res.hs_code,
          countryOfOrigin: res.country_of_origin,
          assessableValue: req.assessable_value,
          currency: req.currency,
          quantity: req.quantity,
          unit: req.unit,
          dutyCalculationId: res.calculation_id,
        })
      );
    } catch (err: any) {
      setErrorState(
        getApiErrorMessage(
          err,
          "Failed to compute statutory duties from CBIC ICEGATE live engine. Valuation parameters may be invalid or tariff gazette endpoint degraded."
        )
      );
    }
  };

  const handleSaveToContext = (calculationId: string) => {
    if (calculationResult) {
      dispatch(
        setMaterialContext({
          hsCode: calculationResult.hs_code,
          hsDescription: calculationResult.hs_description,
          countryOfOrigin: calculationResult.country_of_origin,
          dutyCalculationId: calculationId,
        })
      );
      setIsSaved(true);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 3-Step Pipeline Banner */}
      <div className="p-4 bg-panel border border-line rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <StepBadge
            step={1}
            label="HS Classification"
            description={currentContext.hsCode || "Pending Selection"}
            state={currentContext.hsCode ? "completed" : "pending"}
          />
          <StepBadge
            step={2}
            label="Duty Calculator"
            description="BCD, SWS, IGST & ADD"
            state="current"
          />
          <StepBadge
            step={3}
            label="Landed Cost"
            description="Logistics & Smelter Yield"
            state="pending"
            isLast
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-mono">Gateway:</span>
          <ProvenanceBadge type="LIVE" source="Customs First Schedule" compact />
        </div>
      </div>

      {/* Error / Degraded State Alert (§3.5) */}
      {errorState && (
        <DegradedStateAlert
          reason={errorState}
          endpoint="POST /api/v1/duty/calculate"
          onRetry={() => setErrorState(null)}
        />
      )}

      {/* Main Form Card */}
      <Card
        title="Customs Duty & Statutory Tariff Calculation"
        subtitle="Computes Assessable CIF Value, BCD, SWS, IGST, AIDC, and Trade Agreement preferential rates."
      >
        <DutyCalculationForm
          initialHsCode={currentContext.hsCode || "7204.49.00"}
          initialDescription={currentContext.hsDescription || "Other waste and scrap of iron or steel"}
          initialOrigin={currentContext.countryOfOrigin || "US"}
          initialValue={currentContext.assessableValue || 42000}
          initialCurrency={currentContext.currency || "USD"}
          initialQuantity={currentContext.quantity || 100}
          initialUnit={currentContext.unit || "MT"}
          onSubmit={handleCalculate}
          isLoading={isCalculating || isFetching}
        />
      </Card>

      {/* Calculation Results View */}
      {calculationResult && (
        <DutyBreakdownView
          calculation={calculationResult}
          onSaveToContext={handleSaveToContext}
          isSavedInContext={
            isSaved ||
            currentContext.dutyCalculationId === calculationResult.calculation_id
          }
        />
      )}
    </div>
  );
}

export default function DutyPage() {
  return (
    <AuthGuard>
      <AppShell>
        <React.Suspense
          fallback={
            <div className="p-12 text-center text-xs font-mono text-muted">
              Loading Statutory Duty Calculator...
            </div>
          }
        >
          <DutyCalculatorContent />
        </React.Suspense>
      </AppShell>
    </AuthGuard>
  );
}

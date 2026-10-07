"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMaterialContext } from "@/store/contextSlice";
import {
  useCalculateLandedCostMutation,
  useGetLandedCostCalculationQuery,
} from "@/store/landedCostApi";
import {
  Card,
  StepBadge,
  StatusPill,
  ProvenanceBadge,
  DegradedStateAlert,
} from "@/components/ui";
import { LandedCostForm } from "@/components/landed-cost/LandedCostForm";
import { LandedCostResultsView } from "@/components/landed-cost/LandedCostResultsView";
import { LandedCostRequest, LandedCostResponse } from "@/lib/types";
import { getApiErrorMessage } from "@/lib/utils";
import { Ship, Anchor, ArrowRight, Sparkles } from "lucide-react";

function LandedCostContent() {
  const searchParams = useSearchParams();
  const queryDutyId = searchParams.get("duty_id");

  const dispatch = useAppDispatch();
  const currentContext = useAppSelector((state) => state.context.current);

  const [calculateLandedCost, { isLoading: isCalculating }] =
    useCalculateLandedCostMutation();

  const [landedResult, setLandedResult] = useState<LandedCostResponse | null>(
    null
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Active duty ID: preferentially from URL query, else contextSlice
  const activeDutyId =
    queryDutyId || currentContext.dutyCalculationId || "calc_062751";

  const handleCalculate = async (req: LandedCostRequest) => {
    try {
      setErrorState(null);
      const res = await calculateLandedCost(req).unwrap();
      setLandedResult(res);
      setIsSaved(false);

      dispatch(
        setMaterialContext({
          hsCode: res.hs_code,
          countryOfOrigin: res.origin_country,
          quantity: req.quantity,
          unit: req.unit,
          dutyCalculationId: res.duty_calculation_id,
          landedCostCalculationId: res.landed_cost_id,
        })
      );
    } catch (err: any) {
      setErrorState(
        getApiErrorMessage(
          err,
          "Failed to compute landed cost. Port handling or freight schedule integration unreachable."
        )
      );
    }
  };

  const handleSaveToContext = (landedCostId: string) => {
    if (landedResult) {
      dispatch(
        setMaterialContext({
          hsCode: landedResult.hs_code,
          countryOfOrigin: landedResult.origin_country,
          dutyCalculationId: landedResult.duty_calculation_id,
          landedCostCalculationId: landedCostId,
        })
      );
      setIsSaved(true);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 3-Step Pipeline Banner (Phase 4 Milestone) */}
      <div className="p-4 bg-panel border border-line rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <StepBadge
            step={1}
            label="HS Classification"
            description={currentContext.hsCode || "7204.49"}
            state="completed"
          />
          <StepBadge
            step={2}
            label="Duty Calculator"
            description={activeDutyId}
            state="completed"
          />
          <StepBadge
            step={3}
            label="Landed Cost"
            description="Unit Cost & Recovery Yield"
            state={landedResult ? "completed" : "current"}
            isLast
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-mono">Pipeline:</span>
          <StatusPill
            label={landedResult ? "FLOW COMPLETED" : "STEP 3 ACTIVE"}
            variant="success"
            dot
          />
        </div>
      </div>

      {/* Error / Degraded State Alert (§3.5) */}
      {errorState && (
        <DegradedStateAlert
          reason={errorState}
          endpoint="POST /api/v1/landed-cost/calculate"
          onRetry={() => setErrorState(null)}
        />
      )}

      {/* Input Parameters Form Card */}
      <Card
        title="Landed Cost & Smelter Yield Engine"
        subtitle="Incorporates prior statutory customs duty, multimodal port handling, inland transit, and metal recovery economics."
      >
        <LandedCostForm
          initialDutyId={activeDutyId}
          initialHsCode={currentContext.hsCode || "7204.49.00"}
          initialQuantity={currentContext.quantity || 100}
          initialUnit={currentContext.unit || "MT"}
          onSubmit={handleCalculate}
          isLoading={isCalculating}
        />
      </Card>

      {/* Results View */}
      {landedResult && (
        <LandedCostResultsView
          result={landedResult}
          onSaveToContext={handleSaveToContext}
          isSaved={
            isSaved ||
            currentContext.landedCostCalculationId ===
              landedResult.landed_cost_id
          }
        />
      )}
    </div>
  );
}

export default function LandedCostPage() {
  return (
    <AuthGuard>
      <AppShell>
        <React.Suspense
          fallback={
            <div className="p-12 text-center text-xs font-mono text-muted">
              Loading Landed Cost Engine...
            </div>
          }
        >
          <LandedCostContent />
        </React.Suspense>
      </AppShell>
    </AuthGuard>
  );
}

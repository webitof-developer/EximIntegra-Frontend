import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extracts a user-facing string error message from any error object,
 * including RTK Query error envelopes, Flask { error: { code, message, details } } payloads,
 * Axios/fetch errors, or standard Error instances.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback: string = "An unexpected error occurred. Please try again."
): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  if (typeof err === "object" && err !== null) {
    const objErr = err as Record<string, unknown>;

    // Check err.data (RTK Query API response)
    if (objErr.data) {
      if (typeof objErr.data === "string") return objErr.data;

      // Flask standard error envelope: { error: { code, message, details }, message: "..." }
      if (typeof objErr.data === "object" && objErr.data !== null) {
        const dataObj = objErr.data as Record<string, unknown>;
        if (typeof dataObj.message === "string" && dataObj.message) {
          return dataObj.message;
        }
        if (dataObj.error) {
          if (typeof dataObj.error === "string") return dataObj.error;
          if (typeof dataObj.error === "object" && dataObj.error !== null) {
            const errField = dataObj.error as Record<string, unknown>;
            if (typeof errField.message === "string") return errField.message;
          }
        }
      }
    }

    // Check top-level error / message properties
    if (typeof objErr.message === "string" && objErr.message) return objErr.message;
    if (typeof objErr.error === "string" && objErr.error) return objErr.error;
  }

  return fallback;
}

/**
 * Resolves the active trial period (in days) dynamically from the pricing data response.
 * Checks defaultTrialPlan, active trial plans, and fallback default values.
 */
export interface TrialResolvablePlan {
  id?: string;
  planType?: string;
  tierBadge?: string;
  trialDays?: number;
  isDefaultTrial?: boolean;
  isActive?: boolean;
}

export interface TrialResolvableData {
  plans?: TrialResolvablePlan[];
  defaultTrialPlan?: TrialResolvablePlan | null;
  trialDays?: number;
}

/**
 * Resolves the active trial period (in days) dynamically from the pricing data response.
 * Checks defaultTrialPlan, active trial plans, and fallback default values.
 */
export function resolveTrialDays(pricingData?: TrialResolvableData | null): number {
  if (pricingData?.defaultTrialPlan?.trialDays && pricingData.defaultTrialPlan.trialDays > 0) {
    return pricingData.defaultTrialPlan.trialDays;
  }

  if (pricingData?.plans && Array.isArray(pricingData.plans)) {
    // 1. Look for explicit isDefaultTrial
    const defaultTrial = pricingData.plans.find(
      (p: TrialResolvablePlan) =>
        p.isDefaultTrial &&
        (p.planType === "trial" ||
          (p.tierBadge || "").toUpperCase() === "FREE_TRIAL" ||
          (p.id || "").toLowerCase().includes("trial"))
    );
    if (defaultTrial?.trialDays && defaultTrial.trialDays > 0) {
      return defaultTrial.trialDays;
    }

    // 2. Look for any default trial flagged
    const anyDefault = pricingData.plans.find((p: TrialResolvablePlan) => p.isDefaultTrial);
    if (anyDefault?.trialDays && anyDefault.trialDays > 0) {
      return anyDefault.trialDays;
    }

    // 3. Look for any active trial plan
    const anyTrial = pricingData.plans.find(
      (p: TrialResolvablePlan) =>
        p.isActive !== false &&
        (p.planType === "trial" ||
          (p.tierBadge || "").toUpperCase() === "FREE_TRIAL" ||
          (p.id || "").toLowerCase().includes("trial"))
    );
    if (anyTrial?.trialDays && anyTrial.trialDays > 0) {
      return anyTrial.trialDays;
    }
  }

  if (typeof pricingData?.trialDays === "number" && pricingData.trialDays > 0) {
    return pricingData.trialDays;
  }

  return 14;
}

/**
 * Dynamically formats a trial CTA label by replacing any hardcoded day numbers (e.g. 14-day, 7-day, 2-day)
 * or template variable {trialDays} with the active default trial plan's day count.
 */
export function formatTrialCtaLabel(
  label: string | undefined | null,
  trialDays: number
): string {
  if (!label || !label.trim()) {
    return `Start ${trialDays}-Day Free Trial`;
  }

  let text = label.trim();

  // 1. Replace explicit template variable {trialDays}
  text = text.replace(/\{trialDays\}/gi, String(trialDays));

  // 2. Replace any numeric day patterns: e.g. "14-day", "14 Day", "7-Day", "2-day"
  if (/\b\d+[-\s]day\b/i.test(text)) {
    text = text.replace(/\b\d+[-\s]day\b/gi, `${trialDays}-Day`);
  }
  // 3. If it says "Start Free Trial" or "Free Trial", format with trial days
  else if (/^start\s+free\s+trial$/i.test(text)) {
    text = `Start ${trialDays}-Day Free Trial`;
  } else if (/^free\s+trial$/i.test(text)) {
    text = `${trialDays}-Day Free Trial`;
  }

  return text;
}

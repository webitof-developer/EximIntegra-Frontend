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

  const anyErr = err as Record<string, any>;

  // Check err.data (RTK Query API response)
  if (anyErr.data) {
    if (typeof anyErr.data === "string") return anyErr.data;

    // Flask standard error envelope: { error: { code, message, details }, message: "..." }
    if (typeof anyErr.data.message === "string" && anyErr.data.message) {
      return anyErr.data.message;
    }
    if (anyErr.data.error) {
      if (typeof anyErr.data.error === "string") return anyErr.data.error;
      if (typeof anyErr.data.error.message === "string") return anyErr.data.error.message;
    }
  }

  // Check top-level error / message properties
  if (typeof anyErr.message === "string" && anyErr.message) return anyErr.message;
  if (typeof anyErr.error === "string" && anyErr.error) return anyErr.error;

  return fallback;
}

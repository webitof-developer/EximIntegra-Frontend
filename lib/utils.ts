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

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Base RTK Query API slice for EximIntegra
 * Individual feature endpoints (classification, duty, landedCost, etc.)
 * inject their endpoints dynamically using api.injectEndpoints().
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
    prepareHeaders: (headers) => {
      // Prepared for JWT token injection in Phase 1
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("exim_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: [
    "Classification",
    "Duty",
    "LandedCost",
    "Eligibility",
    "Akshara",
    "Auth",
    "Reports",
  ],
  endpoints: () => ({}),
});

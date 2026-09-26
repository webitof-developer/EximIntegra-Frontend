import { api } from "./api";
import { LandedCostRequest, LandedCostResponse } from "@/lib/types";

export const landedCostApi = api.injectEndpoints({
  endpoints: (builder) => ({
    calculateLandedCost: builder.mutation<
      LandedCostResponse,
      LandedCostRequest
    >({
      query: (body) => ({
        url: "/landed-cost/calculate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LandedCost"],
    }),
    getLandedCostCalculation: builder.query<LandedCostResponse, string>({
      query: (calculationId) => `/landed-cost/${calculationId}`,
      providesTags: (result, error, calculationId) => [
        { type: "LandedCost", id: calculationId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCalculateLandedCostMutation,
  useGetLandedCostCalculationQuery,
} = landedCostApi;

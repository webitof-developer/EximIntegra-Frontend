import { api } from "./api";
import { DutyCalculationRequest, DutyCalculationResponse } from "@/lib/types";

export const dutyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    calculateDuty: builder.mutation<
      DutyCalculationResponse,
      DutyCalculationRequest
    >({
      query: (body) => ({
        url: "/duty/calculate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Duty"],
    }),
    getDutyCalculation: builder.query<DutyCalculationResponse, string>({
      query: (calculationId) => `/duty/${calculationId}`,
      providesTags: (result, error, calculationId) => [
        { type: "Duty", id: calculationId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useCalculateDutyMutation, useGetDutyCalculationQuery } = dutyApi;

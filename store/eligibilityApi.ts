import { api } from "./api";
import {
  EligibilityResponse,
  CountryComparisonRequest,
  CountryComparisonResponse,
} from "@/lib/types";

export const eligibilityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEligibility: builder.query<EligibilityResponse, string>({
      query: (hsCode) => `/eligibility/${hsCode}`,
      providesTags: (result, error, hsCode) => [
        { type: "Eligibility", id: hsCode },
      ],
    }),
    compareCountries: builder.mutation<
      CountryComparisonResponse,
      CountryComparisonRequest
    >({
      query: (body) => ({
        url: "/compare",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Eligibility"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetEligibilityQuery, useCompareCountriesMutation } =
  eligibilityApi;

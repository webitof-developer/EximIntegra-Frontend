import { api } from "./api";
import {
  EligibilityResponse,
  CountryComparisonRequest,
  CountryComparisonResponse,
  CountryOption,
  BenchmarkPriceResponse,
} from "@/lib/types";

export interface EligibilityQueryParams {
  hsCode: string;
  direction?: "import" | "export";
  origin?: string;
  as_of?: string;
}

export const eligibilityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEligibility: builder.query<
      EligibilityResponse,
      string | EligibilityQueryParams
    >({
      query: (arg) => {
        if (typeof arg === "string") {
          return `/eligibility/${arg}`;
        }
        const params = new URLSearchParams();
        if (arg.direction) params.set("direction", arg.direction);
        if (arg.origin) params.set("origin", arg.origin);
        if (arg.as_of) params.set("as_of", arg.as_of);
        const qs = params.toString();
        return `/eligibility/${arg.hsCode}${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result, error, arg) => [
        { type: "Eligibility", id: typeof arg === "string" ? arg : arg.hsCode },
      ],
    }),
    getCountries: builder.query<CountryOption[], void>({
      query: () => "/countries",
    }),
    getBenchmarkPrice: builder.query<
      BenchmarkPriceResponse,
      { hs_code: string; origin?: string; as_of?: string }
    >({
      query: ({ hs_code, origin, as_of }) => {
        const params = new URLSearchParams({ hs_code });
        if (origin) params.set("origin", origin);
        if (as_of) params.set("as_of", as_of);
        return `/benchmarks/price?${params.toString()}`;
      },
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
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEligibilityQuery,
  useGetCountriesQuery,
  useGetBenchmarkPriceQuery,
  useCompareCountriesMutation,
} = eligibilityApi;


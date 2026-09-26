import { api } from "./api";
import {
  DatasetVersion,
  CalculationHistoryRecord,
  HistoryResponse,
} from "@/lib/types";

export const reportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCalculationHistory: builder.query<
      HistoryResponse,
      { type?: string; search?: string } | void
    >({
      query: (params) => ({
        url: "/reports/history",
        params: params ? { type: params.type, search: params.search } : undefined,
      }),
      providesTags: ["Reports"],
    }),

    getHistoricalCalculation: builder.query<CalculationHistoryRecord, string>({
      query: (id) => `/reports/history/${id}`,
      providesTags: (result, error, id) => [{ type: "Reports", id }],
    }),

    getDatasetVersions: builder.query<DatasetVersion[], void>({
      query: () => "/dataset-versions",
      providesTags: ["Reports"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCalculationHistoryQuery,
  useGetHistoricalCalculationQuery,
  useGetDatasetVersionsQuery,
} = reportsApi;

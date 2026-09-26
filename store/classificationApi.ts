import { api } from "./api";
import {
  ClassificationRequest,
  ClassificationResponse,
  BulkJobStatus,
} from "@/lib/types";

export const classificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    classify: builder.mutation<ClassificationResponse, ClassificationRequest>({
      query: (body) => ({
        url: "/classify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Classification"],
    }),
    classifyBulk: builder.mutation<
      { job_id: string; total_rows: number; status: string },
      FormData
    >({
      query: (formData) => ({
        url: "/classify/bulk",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Classification"],
    }),
    getBulkJobStatus: builder.query<BulkJobStatus, string>({
      query: (jobId) => `/classify/bulk/${jobId}`,
      providesTags: (result, error, jobId) => [
        { type: "Classification", id: jobId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useClassifyMutation,
  useClassifyBulkMutation,
  useGetBulkJobStatusQuery,
} = classificationApi;

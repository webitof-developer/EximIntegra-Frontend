import { api } from "./api";
import {
  AdminStats,
  AdminUserItem,
  PricingPlan,
  RBACMatrixResponse,
  RolePermissionItem,
  FeatureFlagItem,
  IngestionSourceStatus,
  IngestionRunItem,
} from "@/lib/types";

export interface UpdateAdminUserRequest {
  id: string;
  name?: string;
  company?: string;
  role?: AdminUserItem["role"];
  tier?: AdminUserItem["tier"];
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, void>({
      query: () => "/admin/stats",
      providesTags: ["Admin"],
    }),
    getAdminUsers: builder.query<{ users: AdminUserItem[]; total: number }, void>({
      query: () => "/admin/users",
      providesTags: ["AdminUsers"],
    }),
    updateAdminUser: builder.mutation<
      { user: AdminUserItem; message: string },
      UpdateAdminUserRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminUsers", "Admin", "Auth"],
    }),
    deleteAdminUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers", "Admin"],
    }),
    getPricingPlans: builder.query<{ plans: PricingPlan[] }, void>({
      query: () => "/pricing",
      providesTags: ["Pricing"],
    }),
    updatePricingPlans: builder.mutation<
      { plans: PricingPlan[]; message: string },
      { plans: PricingPlan[] }
    >({
      query: (body) => ({
        url: "/admin/pricing",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Pricing"],
    }),
    getRBACMatrix: builder.query<RBACMatrixResponse, void>({
      query: () => "/admin/rbac",
      providesTags: ["RBAC"],
    }),
    updateRBACMatrix: builder.mutation<
      { matrix: RBACMatrixResponse; message: string },
      { roles: RolePermissionItem[] }
    >({
      query: (body) => ({
        url: "/admin/rbac",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["RBAC", "Auth"],
    }),
    getIngestionStatus: builder.query<{ sources: IngestionSourceStatus[]; total: number }, void>({
      query: () => "/admin/ingestion/status",
      providesTags: ["AdminIngestion"],
    }),
    getIngestionRuns: builder.query<{ runs: IngestionRunItem[]; total: number }, { source?: string; status?: string; limit?: number } | void>({
      query: (params) => ({
        url: "/admin/ingestion/runs",
        params: params || undefined,
      }),
      providesTags: ["AdminIngestion"],
    }),
    triggerIngestion: builder.mutation<
      { success: boolean; message: string; run_id?: string; staged_version_id?: string },
      { source: string; force?: boolean; allow_shrink?: boolean }
    >({
      query: ({ source, ...body }) => ({
        url: `/admin/ingestion/trigger/${source}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminIngestion", "Reports"],
    }),
    approveIngestionRun: builder.mutation<
      { success: boolean; message: string; activated_version_id?: string },
      string
    >({
      query: (runId) => ({
        url: `/admin/ingestion/runs/${runId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["AdminIngestion", "Reports"],
    }),
    rejectIngestionRun: builder.mutation<
      { success: boolean; message: string },
      { runId: string; reason?: string }
    >({
      query: ({ runId, reason }) => ({
        url: `/admin/ingestion/runs/${runId}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["AdminIngestion"],
    }),
    rollbackSource: builder.mutation<
      { success: boolean; message: string; restored_version_id?: string },
      string
    >({
      query: (source) => ({
        url: `/admin/ingestion/rollback/${source}`,
        method: "POST",
      }),
      invalidatesTags: ["AdminIngestion", "Reports"],
    }),
    checkStaleness: builder.mutation<
      { stale_count: number; stale_sources: string[] },
      void
    >({
      query: () => ({
        url: "/admin/ingestion/check-staleness",
        method: "POST",
      }),
      invalidatesTags: ["AdminIngestion", "Notification"],
    }),
    getFeatureFlags: builder.query<{ flags: FeatureFlagItem[]; total: number }, void>({
      query: () => "/admin/feature-flags",
      providesTags: ["FeatureFlags"],
    }),
    updateFeatureFlag: builder.mutation<
      { flag: FeatureFlagItem; message: string },
      { key: string; is_enabled?: boolean; tier_required?: string; metadata?: Record<string, any> }
    >({
      query: ({ key, ...body }) => ({
        url: `/admin/feature-flags/${key}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["FeatureFlags"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetPricingPlansQuery,
  useUpdatePricingPlansMutation,
  useGetRBACMatrixQuery,
  useUpdateRBACMatrixMutation,
  useGetIngestionStatusQuery,
  useGetIngestionRunsQuery,
  useTriggerIngestionMutation,
  useApproveIngestionRunMutation,
  useRejectIngestionRunMutation,
  useRollbackSourceMutation,
  useCheckStalenessMutation,
  useGetFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
} = adminApi;


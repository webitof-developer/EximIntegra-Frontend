import { api } from "./api";
import {
  AdminStats,
  AdminUserItem,
  PricingPlan,
  RBACMatrixResponse,
  RolePermissionItem,
  TierPageAccessGate,
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
    getPricingPlans: builder.query<
      { plans: PricingPlan[]; defaultTrialPlan?: PricingPlan; trialDays?: number },
      void
    >({
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
    deletePricingPlan: builder.mutation<
      { plans: PricingPlan[]; message: string },
      string
    >({
      query: (planId) => ({
        url: `/admin/pricing/${planId}`,
        method: "DELETE",
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
    getLlmProviders: builder.query<LlmProviderConfigItem[], void>({
      query: () => "/settings/llm-providers",
      providesTags: ["LlmProviders"],
    }),
    getActiveLlmProvider: builder.query<{
      id?: string;
      name?: string;
      model?: string;
      baseUrl?: string;
      isConfigured?: boolean;
      isActiveCopilot?: boolean;
    }, void>({
      query: () => "/settings/llm-providers/active",
      providesTags: ["LlmProviders"],
    }),
    updateLlmProvider: builder.mutation<
      LlmProviderConfigItem,
      UpdateLlmProviderPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/settings/llm-providers/${id}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["LlmProviders"],
    }),
    bulkUpdateLlmProviders: builder.mutation<
      LlmProviderConfigItem[],
      { providers: UpdateLlmProviderPayload[] }
    >({
      query: (body) => ({
        url: "/settings/llm-providers",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["LlmProviders"],
    }),
    testLlmProvider: builder.mutation<
      { status: string; latencyMs: number; message: string },
      string
    >({
      query: (providerId) => ({
        url: `/settings/llm-providers/${providerId}/test`,
        method: "POST",
      }),
    }),
    getTierAccessGates: builder.query<{ gates: TierPageAccessGate[] }, void>({
      query: () => "/tier-access",
      providesTags: ["TierAccess"],
    }),
    getAdminTierAccessGates: builder.query<{ gates: TierPageAccessGate[] }, void>({
      query: () => "/admin/tier-access",
      providesTags: ["TierAccess"],
    }),
    updateTierAccessGates: builder.mutation<
      { gates: TierPageAccessGate[]; message: string },
      { gates: TierPageAccessGate[] }
    >({
      query: (body) => ({
        url: "/admin/tier-access",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["TierAccess"],
    }),
    createTierAccessGate: builder.mutation<
      { gate: TierPageAccessGate; gates: TierPageAccessGate[]; message: string },
      TierPageAccessGate
    >({
      query: (body) => ({
        url: "/admin/tier-access",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TierAccess"],
    }),
    deleteTierAccessGate: builder.mutation<
      { gates: TierPageAccessGate[]; message: string },
      string
    >({
      query: (gateId) => ({
        url: `/admin/tier-access/${gateId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TierAccess"],
    }),
  }),
  overrideExisting: false,
});

export interface LlmProviderConfigItem {
  id: string;
  name: string;
  badge?: string;
  defaultModel: string;
  models: string[];
  keyPrefix: string;
  apiKey: string;
  baseUrl: string;
  isConfigured: boolean;
  isActiveCopilot: boolean;
}

export interface UpdateLlmProviderPayload {
  id: string;
  name?: string;
  apiKey?: string;
  defaultModel?: string;
  models?: string[];
  baseUrl?: string;
  isActiveCopilot?: boolean;
}

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetPricingPlansQuery,
  useUpdatePricingPlansMutation,
  useDeletePricingPlanMutation,
  useGetRBACMatrixQuery,
  useUpdateRBACMatrixMutation,
  useGetLlmProvidersQuery,
  useGetActiveLlmProviderQuery,
  useUpdateLlmProviderMutation,
  useBulkUpdateLlmProvidersMutation,
  useTestLlmProviderMutation,
  useGetTierAccessGatesQuery,
  useGetAdminTierAccessGatesQuery,
  useCreateTierAccessGateMutation,
  useUpdateTierAccessGatesMutation,
  useDeleteTierAccessGateMutation,
} = adminApi;


import { api } from "./api";
import { AdminStats, AdminUserItem, PricingPlan } from "@/lib/types";

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
} = adminApi;

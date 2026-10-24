import { api } from "./api";
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "@/lib/types";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    getProfile: builder.query<UserProfile, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    updateProfile: builder.mutation<
      UserProfile,
      {
        name?: string;
        company?: string;
        email?: string;
        gstin?: string;
        billingEmail?: string;
        tier?: "ENTERPRISE" | "PROFESSIONAL" | "STARTER";
      }
    >({
      query: (data) => ({
        url: "/auth/me",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;

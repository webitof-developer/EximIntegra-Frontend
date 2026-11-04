import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {
  getStoredToken,
  setStoredToken,
  getStoredRefreshToken,
  clearStoredAuth,
} from "@/lib/auth";
import type { UserProfile } from "@/lib/types";
import { setCredentials, logout } from "./authSlice";

/**
 * Base HTTP query with credentials (cookies) and Bearer token injection
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Reauth wrapper: intercepts 401 Unauthorized, automatically calls
 * /auth/refresh with the httpOnly cookie, and retries the original request once.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiInstance, extraOptions) => {
  let result = await rawBaseQuery(args, apiInstance, extraOptions);

  // If 401 encountered and not already trying to refresh/login/register
  const url = typeof args === "string" ? args : args.url;
  const isAuthRoute =
    url.includes("/auth/refresh") ||
    url.includes("/auth/login") ||
    url.includes("/auth/register");

  if (result.error && result.error.status === 401 && !isAuthRoute) {
    const storedRefresh = getStoredRefreshToken();
    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: storedRefresh ? { refresh_token: storedRefresh } : undefined,
      },
      apiInstance,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as {
        access_token: string;
        refresh_token?: string;
        user?: UserProfile;
      };
      if (data.access_token) {
        setStoredToken(data.access_token);
        if (data.user) {
          apiInstance.dispatch(
            setCredentials({
              token: data.access_token,
              user: data.user,
              refreshToken: data.refresh_token || storedRefresh || undefined,
            })
          );
        }
      }
      // Retry original request with newly acquired token
      result = await rawBaseQuery(args, apiInstance, extraOptions);
    } else {
      clearStoredAuth();
      apiInstance.dispatch(logout());
    }
  }

  return result;
};

/**
 * Base RTK Query API slice for EximIntegra
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Classification",
    "Duty",
    "LandedCost",
    "Eligibility",
    "Akshara",
    "Auth",
    "Reports",
    "Admin",
    "AdminUsers",
    "Pricing",
    "RBAC",
    "Notification",
    "LlmProviders",
    "TierAccess",
    "Contracts",
    "Payments",
    "Team",
    "FeatureMatrix",
    "Content",
  ],
  endpoints: () => ({}),
});

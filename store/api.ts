import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { getStoredToken, setStoredToken, clearStoredAuth } from "@/lib/auth";

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
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      apiInstance,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { access_token: string };
      if (data.access_token) {
        setStoredToken(data.access_token);
      }
      // Retry original request with newly acquired token
      result = await rawBaseQuery(args, apiInstance, extraOptions);
    } else {
      clearStoredAuth();
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
  ],
  endpoints: () => ({}),
});

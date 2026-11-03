"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { initializeAuth, setCredentials, updateUser, logout } from "@/store/authSlice";
import { useGetProfileQuery, useRefreshTokenMutation } from "@/store/authApi";
import { setStoredToken } from "@/lib/auth";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const [refreshToken] = useRefreshTokenMutation();
  const refreshAttempted = useRef(false);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // When loaded with empty in-memory token, attempt silent restore via httpOnly refresh cookie
  useEffect(() => {
    if (isInitialized && !token && !refreshAttempted.current) {
      refreshAttempted.current = true;
      refreshToken()
        .unwrap()
        .then((res) => {
          if (res?.access_token) {
            setStoredToken(res.access_token);
            if (res.user) {
              dispatch(setCredentials({ token: res.access_token, user: res.user }));
            }
          }
        })
        .catch(() => {
          // No active session or expired refresh cookie
        });
    }
  }, [isInitialized, token, refreshToken, dispatch]);

  // Synchronize and validate session with backend when token is present
  const { data: profile, error } = useGetProfileQuery(undefined, {
    skip: !isInitialized || !token,
  });

  useEffect(() => {
    if (profile) {
      dispatch(updateUser(profile));
    }
  }, [profile, dispatch]);

  useEffect(() => {
    if (error && typeof error === "object" && "status" in error && error.status === 401) {
      dispatch(logout());
    }
  }, [error, dispatch]);

  return <>{children}</>;
}


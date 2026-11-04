"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { initializeAuth, setCredentials, updateUser, logout } from "@/store/authSlice";
import { useGetProfileQuery, useRefreshTokenMutation } from "@/store/authApi";
import {
  getStoredUser,
  getStoredRefreshToken,
  clearStoredAuth,
  setStoredToken,
} from "@/lib/auth";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const [refreshToken] = useRefreshTokenMutation();
  const refreshAttempted = useRef(false);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // When loaded without an active token in memory/storage, attempt silent restore
  useEffect(() => {
    if (!token && !refreshAttempted.current) {
      refreshAttempted.current = true;

      const storedUser = getStoredUser();
      const storedRefreshToken = getStoredRefreshToken();

      // If neither user profile nor fallback refresh token exists, no session to restore
      if (!storedUser && !storedRefreshToken) {
        if (!isInitialized) {
          dispatch(logout());
        }
        return;
      }

      // Fallback timeout to prevent permanent spinner if backend is unreachable
      const timeoutId = setTimeout(() => {
        clearStoredAuth();
        dispatch(logout());
      }, 8000);

      refreshToken(storedRefreshToken ? { refresh_token: storedRefreshToken } : undefined)
        .unwrap()
        .then((res) => {
          clearTimeout(timeoutId);
          if (res?.access_token) {
            setStoredToken(res.access_token);
            const userToSet = res.user || storedUser;
            if (userToSet) {
              dispatch(
                setCredentials({
                  token: res.access_token,
                  user: userToSet,
                  refreshToken: res.refresh_token || storedRefreshToken || undefined,
                })
              );
            }
          } else {
            clearStoredAuth();
            dispatch(logout());
          }
        })
        .catch(() => {
          clearTimeout(timeoutId);
          clearStoredAuth();
          dispatch(logout());
        });
    }
  }, [token, isInitialized, refreshToken, dispatch]);

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


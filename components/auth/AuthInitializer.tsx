"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { initializeAuth, updateUser, logout } from "@/store/authSlice";
import { useGetProfileQuery } from "@/store/authApi";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

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


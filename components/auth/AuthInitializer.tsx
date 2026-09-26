"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { initializeAuth } from "@/store/authSlice";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
}

import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}


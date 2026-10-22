"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppSelector } from "@/store";
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} from "@/store/adminApi";
import { AdminNav } from "../AdminNav";
import { UserDirectoryTab } from "./UserDirectoryTab";
import { ToastNotification } from "@/components/ui";
import { ShieldAlert } from "lucide-react";

export default function AdminUsersPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
    isFetching: usersFetching,
  } = useGetAdminUsersQuery(undefined, { skip: !mounted || user?.role !== "ADMIN" });

  const [updateUser] = useUpdateAdminUserMutation();
  const [deleteUser] = useDeleteAdminUserMutation();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // SSR Hydration guard
  if (!mounted) {
    return (
      <AppShell>
        <div className="p-12 text-center text-muted flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy/20 animate-pulse border border-line" />
          <span className="text-xs font-mono">Loading User Directory...</span>
        </div>
      </AppShell>
    );
  }

  // Guard against non-admin users
  if (user && user.role !== "ADMIN") {
    return (
      <AppShell>
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-panel border border-red/30 rounded-2xl p-8 text-center space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-red/10 border border-red/20 text-red flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-ink">Super Admin Authority Required</h2>
              <p className="text-xs text-muted leading-relaxed">
                The User Directory is reserved strictly for designated EximIntegra
                platform super administrators.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Return to Trade Dashboard
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <AdminNav
          title="Enterprise User Directory & Access Roles"
          description="Manage registered organization users, role assignments, subscription tiers, and corporate account access."
          category="User Directory"
          onRefresh={refetchUsers}
          isRefreshing={usersFetching}
          userCount={usersData?.total}
        />

        <UserDirectoryTab
          users={usersData?.users || []}
          isLoading={usersLoading}
          onUpdateUser={async (params) => {
            const res = await updateUser(params).unwrap();
            showToast("User profile successfully updated.");
            return res;
          }}
          onDeleteUser={async (userId: string) => {
            const res = await deleteUser(userId).unwrap();
            showToast("User account successfully removed.");
            return res;
          }}
          showToast={showToast}
        />
      </div>

      <ToastNotification
        isOpen={!!toastMessage}
        variant="success"
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </AppShell>
  );
}

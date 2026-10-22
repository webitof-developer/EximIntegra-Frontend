"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAppSelector } from "@/store";
import {
  useGetRBACMatrixQuery,
  useUpdateRBACMatrixMutation,
} from "@/store/adminApi";
import { AdminNav } from "../AdminNav";
import { RolePermissionsTab } from "./RolePermissionsTab";
import { ToastNotification } from "@/components/ui";
import { ShieldAlert } from "lucide-react";

export default function AdminRBACPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    data: rbacData,
    isLoading: rbacLoading,
    refetch: refetchRBAC,
    isFetching: rbacFetching,
  } = useGetRBACMatrixQuery();

  const [updateRBAC] = useUpdateRBACMatrixMutation();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
                Role Permissions Governance is reserved strictly for designated EximIntegra
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
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNav
          title="Role Permissions (RBAC Matrix) Governance"
          description="Configure granular module permissions and access-control policies across all organizational user roles."
          onRefresh={refetchRBAC}
          isRefreshing={rbacFetching}
        />

        <RolePermissionsTab
          roles={rbacData?.roles || []}
          modules={rbacData?.modules || []}
          isLoading={rbacLoading}
          onSaveRBAC={async (roles) => {
            const res = await updateRBAC({ roles }).unwrap();
            showToast("RBAC matrix permissions updated and applied globally.");
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

"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  User,
  Building2,
  Mail,
  Shield,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  Scale,
  Ship,
  Sparkles,
  CreditCard,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateUser } from "@/store/authSlice";
import { useUpdateProfileMutation } from "@/store/authApi";
import { TierBadge } from "@/components/saas/TierBadge";
import { getApiErrorMessage } from "@/lib/utils";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [updateProfileMutation, { isLoading }] = useUpdateProfileMutation();

  const handleChangePlan = () => {
    onClose();
    router.push("/settings?tab=billing");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Populate initial values when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setCompany(user.company || "");
      setEmail(user.email || "");
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [user, isOpen]);

  // Lock body scroll and handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user || !mounted) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "EI";

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "IMPORTER":
        return "bg-blue-dim text-blue border-blue/30";
      case "EXPORTER":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "CUSTOMS_BROKER":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "TRADE_ADVISOR":
        return "bg-cyan-50 text-cyan-800 border-cyan-300";
      default:
        return "bg-bg text-ink border-line";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-3.5 h-3.5" />;
      case "IMPORTER":
      case "EXPORTER":
        return <Ship className="w-3.5 h-3.5" />;
      case "CUSTOMS_BROKER":
        return <Scale className="w-3.5 h-3.5" />;
      case "TRADE_ADVISOR":
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <Briefcase className="w-3.5 h-3.5" />;
    }
  };

  const hasChanges =
    name.trim() !== (user.name || "").trim() ||
    company.trim() !== (user.company || "").trim() ||
    email.trim().toLowerCase() !== (user.email || "").trim().toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }
    if (!company.trim()) {
      setErrorMsg("Company/Organization is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("A valid work email address is required.");
      return;
    }

    try {
      const updated = await updateProfileMutation({
        name: name.trim(),
        company: company.trim(),
        email: email.trim().toLowerCase(),
      }).unwrap();

      // Synchronize in Redux store
      dispatch(updateUser(updated));
      setSuccessMsg("Profile details updated successfully!");

      // Auto close after brief display
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(
        getApiErrorMessage(err, "Failed to update profile. Please verify your details and retry.")
      );
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-navy/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click to dismiss */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-line bg-bg/40 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-navy text-[#93C5FD] font-mono font-bold text-sm flex items-center justify-center border border-line shadow-xs shrink-0">
              {initials}
            </div>
            <div>
              <h2
                id="profile-modal-title"
                className="text-base font-bold text-ink tracking-tight flex items-center gap-2"
              >
                <span>Enterprise Profile</span>
                {user.role === "ADMIN" ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                    SUPER ADMIN
                  </span>
                ) : (
                  <TierBadge tier={user.tier || "STARTER"} size="xs" />
                )}
              </h2>
              <p className="text-xs text-muted">
                Update your verified identity and organization details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-bg border border-transparent hover:border-line flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-dim border border-red/30 rounded-xl flex items-start gap-2.5 text-xs text-red animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="profile-name-input"
              className="text-xs font-semibold text-ink flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-muted" />
              <span>Full Name</span>
              <span className="text-red">*</span>
            </label>
            <input
              id="profile-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              disabled={isLoading}
              className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all disabled:opacity-60"
            />
          </div>

          {/* Company / Organization */}
          <div className="space-y-1.5">
            <label
              htmlFor="profile-company-input"
              className="text-xs font-semibold text-ink flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-muted" />
              <span>Company / Organization</span>
              <span className="text-red">*</span>
            </label>
            <input
              id="profile-company-input"
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Apex Global Logistics Pvt Ltd"
              disabled={isLoading}
              className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all disabled:opacity-60"
            />
          </div>

          {/* Work Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="profile-email-input"
              className="text-xs font-semibold text-ink flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-muted" />
              <span>Work Email Address</span>
              <span className="text-red">*</span>
            </label>
            <input
              id="profile-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rajesh@apexglobal.in"
              disabled={isLoading}
              className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all disabled:opacity-60 font-mono"
            />
            <p className="text-[11px] text-muted">
              Used for single-sign-on workspace authentication and statutory gazette alerts.
            </p>
          </div>

          {/* Trade Role (Read-only as required) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-muted" />
                <span>Trade Role</span>
              </label>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-muted" />
                <span>Read-Only</span>
              </span>
            </div>

            <div className="p-3 bg-bg border border-line/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-panel border border-line flex items-center justify-center text-ink shrink-0">
                  {getRoleIcon(user.role)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${getRoleBadgeStyle(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted block mt-0.5">
                    Assigned access level & statutory engine governance.
                  </span>
                </div>
              </div>

              <div
                title="Trade role permissions are administered via Super Admin RBAC console"
                className="p-1.5 rounded-lg text-muted bg-panel border border-line shrink-0 cursor-help"
              >
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <p className="text-[10px] text-muted leading-relaxed">
              Trade Role permissions are governed by the platform RBAC matrix. Contact your organization administrator to request a role change.
            </p>
          </div>

          {/* Subscription Tier & Change Plan (Only for regular users) */}
          {user.role !== "ADMIN" && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue" />
                  <span>Subscription Plan</span>
                </label>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                  Billing & Quotas
                </span>
              </div>

              <div className="p-3 bg-panel border border-blue/20 bg-blue/5 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue/10 border border-blue/20 flex items-center justify-center text-blue shrink-0">
                    <Zap className="w-4 h-4 text-blue" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <TierBadge tier={user.tier || "STARTER"} size="sm" />
                      <span className="text-[11px] font-semibold text-ink">Active Plan</span>
                    </div>
                    <span className="text-[11px] text-muted block mt-0.5">
                      Manage billing cycles, statutory quotas, and tier upgrades.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleChangePlan}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue bg-panel hover:bg-blue hover:text-white border border-blue/30 hover:border-blue transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer group"
                >
                  <span>Change Plan</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
            {user.role !== "ADMIN" ? (
              <button
                type="button"
                onClick={handleChangePlan}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue hover:text-blue-dark border border-blue/20 hover:border-blue/40 bg-blue/5 hover:bg-blue/10 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Change Plan</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink border border-line bg-bg hover:bg-panel transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !hasChanges}
                className={`px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  isLoading || !hasChanges
                    ? "bg-blue/50 opacity-60 cursor-not-allowed"
                    : "bg-blue hover:bg-blue-dark active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

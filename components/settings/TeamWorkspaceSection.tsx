"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  StatusPill,
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CustomDropdown,
  ToastNotification,
} from "@/components/ui";
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Mail,
  Shield,
  Building2,
  Check,
  X,
  Lock,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Crown,
} from "lucide-react";
import {
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useRemoveTeamMemberMutation,
  RoleType,
  TeamMember,
} from "@/store/teamApi";

const roleDetails: Record<
  RoleType,
  { label: string; badgeVariant: "primary" | "success" | "warning" | "muted"; description: string }
> = {
  ADMIN: {
    label: "Admin",
    badgeVariant: "primary",
    description: "Full access across all engines, subscription billing, API keys, and member management.",
  },
  TRADE_OFFICER: {
    label: "Trade Officer",
    badgeVariant: "success",
    description: "Can classify goods, compute duties, model landed costs, and consult Akshara AI.",
  },
  CUSTOMS_BROKER: {
    label: "Customs Broker",
    badgeVariant: "warning",
    description: "External agent: access to Classification & Duty; restricted from viewing smelter yield margins.",
  },
  AUDITOR: {
    label: "Auditor",
    badgeVariant: "muted",
    description: "Read-only access to calculation history, reports, and dataset provenance registries.",
  },
};

export function TeamWorkspaceSection() {
  const { data: teamData, isLoading, isFetching, refetch } = useGetTeamMembersQuery();
  const [inviteMember, { isLoading: isInviting }] = useInviteTeamMemberMutation();
  const [updateMember, { isLoading: isUpdatingRole }] = useUpdateTeamMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveTeamMemberMutation();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");

  // Invite Form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDept, setInviteDept] = useState("Customs Compliance & Operations");
  const [inviteRole, setInviteRole] = useState<RoleType>("TRADE_OFFICER");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const members = teamData?.members || [];
  const seatLimit = teamData?.seatLimit ?? 5;
  const usedSeats = teamData?.usedSeats ?? members.length;
  const remainingSeats = teamData?.remainingSeats ?? Math.max(0, seatLimit - usedSeats);
  const isUnlimited = teamData?.isUnlimited ?? (seatLimit <= 0 || seatLimit === -1);
  const planName = teamData?.planName || "Workspace Plan";
  const canInviteMore = isUnlimited || remainingSeats > 0;

  const usagePercent = isUnlimited
    ? 25
    : Math.min(100, Math.round((usedSeats / Math.max(1, seatLimit)) * 100));

  const showToast = (msg: string, variant: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastVariant(variant);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError("Name and Corporate Email are required.");
      return;
    }

    if (!canInviteMore) {
      setInviteError(
        `Seat limit of ${seatLimit} reached for your ${planName} tier. Please upgrade your plan in Subscription & Billing.`
      );
      return;
    }

    try {
      const created = await inviteMember({
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        department: inviteDept.trim() || "Customs Compliance & Operations",
        role: inviteRole,
      }).unwrap();

      showToast(
        `Invitation sent to ${created.email}. Added to ${created.department} as ${roleDetails[inviteRole]?.label || inviteRole}.`,
        "success"
      );

      setInviteName("");
      setInviteEmail("");
      setIsInviteOpen(false);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.detail ||
        err?.message ||
        "Failed to invite team member. Please verify the email and try again.";
      setInviteError(msg);
      showToast(msg, "error");
    }
  };

  const handleRoleChange = async (member: TeamMember, newRole: RoleType) => {
    if (member.role === newRole) return;
    try {
      await updateMember({
        userId: member.id,
        role: newRole,
      }).unwrap();
      showToast(
        `Updated ${member.name}'s role to ${roleDetails[newRole]?.label || newRole}.`,
        "success"
      );
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update member role.";
      showToast(msg, "error");
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToDelete) return;
    try {
      await removeMember(memberToDelete.id).unwrap();
      showToast(`Removed ${memberToDelete.name} from the workspace.`, "success");
      setMemberToDelete(null);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to remove member.";
      showToast(msg, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Floating Bottom-Right Toast Notification */}
      <ToastNotification
        isOpen={!!toastMessage}
        variant={toastVariant}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* 1. Plan Seat Quota & Capacity Status Card */}
      <div className="p-5 bg-panel border border-line rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue" />
                <span>Team Seat Allocation & Plan Limits</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue/10 text-blue border border-blue/20">
                {planName}
              </span>
            </div>
            <p className="text-xs text-muted">
              Team seats are provisioned according to your organization&apos;s active subscription tier.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-xl border border-line bg-bg hover:bg-panel text-muted hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh team list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                setInviteError(null);
                setIsInviteOpen(true);
              }}
              disabled={!canInviteMore}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0 ${
                canInviteMore
                  ? "bg-blue hover:bg-blue-dark text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-muted cursor-not-allowed opacity-60"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{canInviteMore ? "Invite Member" : "Seat Limit Reached"}</span>
            </button>
          </div>
        </div>

        {/* Seat Usage Metrics & Visual Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-bg border border-line rounded-xl">
            <span className="text-[10px] font-mono text-muted uppercase block">Active Seats</span>
            <div className="text-lg font-bold text-ink font-mono mt-0.5 flex items-baseline gap-1">
              <span>{usedSeats}</span>
              <span className="text-xs font-normal text-muted">
                / {isUnlimited ? "∞" : seatLimit}
              </span>
            </div>
            <span className="text-[11px] text-muted">
              {usedSeats === 1 ? "1 active user" : `${usedSeats} active users`} in org
            </span>
          </div>

          <div className="p-3 bg-bg border border-line rounded-xl">
            <span className="text-[10px] font-mono text-muted uppercase block">Remaining Seats</span>
            <div className="text-lg font-bold text-ink font-mono mt-0.5">
              {isUnlimited ? (
                <span className="text-purple-600 dark:text-purple-400">Unlimited (∞)</span>
              ) : remainingSeats > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">{remainingSeats}</span>
              ) : (
                <span className="text-red">0 Available</span>
              )}
            </div>
            <span className="text-[11px] text-muted">
              {isUnlimited
                ? "No restriction on team members"
                : remainingSeats > 0
                ? `${remainingSeats} more can be invited`
                : "Plan capacity full"}
            </span>
          </div>

          <div className="p-3 bg-bg border border-line rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase block">Tier Capacity</span>
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-ink mt-0.5">
                <span>Usage</span>
                <span>{isUnlimited ? "Unlimited" : `${usagePercent}%`}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-line rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isUnlimited
                    ? "bg-purple-500 w-1/4"
                    : usagePercent >= 100
                    ? "bg-red"
                    : usagePercent >= 80
                    ? "bg-amber-500"
                    : "bg-blue"
                }`}
                style={{ width: isUnlimited ? "25%" : `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Warning Banner if Quota is Reached */}
        {!canInviteMore && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-2.5 text-xs text-ink">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Your organization has utilized all <strong className="font-mono">{seatLimit}</strong> seats
                allocated for the <strong className="font-mono">{planName}</strong> tier. Upgrade your subscription plan to invite additional colleagues.
              </span>
            </div>
            <Link
              href="/settings?tab=billing"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shrink-0 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Upgrade Plan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. Team Members Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-ink font-mono uppercase tracking-wider">
              Enrolled Workspace Members ({members.length})
            </h4>
          </div>
          <span className="text-[10px] font-mono text-muted">
            Saved permanently in Organization Directory
          </span>
        </div>

        <TableContainer className="min-h-[140px]">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Member</TableHead>
                <TableHead>Department</TableHead>
                <TableHead align="center">Role / Access</TableHead>
                <TableHead align="center">2FA Security</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead align="center">Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-12 text-muted">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue" />
                      <span className="text-xs font-mono">Loading organization members...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-10 text-muted">
                    No team members found in database. Click &quot;Invite Member&quot; to invite colleagues.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => {
                  const initials = m.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const role = roleDetails[m.role as RoleType] || {
                    label: m.role,
                    badgeVariant: "primary",
                    description: "Workspace member",
                  };

                  return (
                    <TableRow key={m.id}>
                      {/* Name & Avatar */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${m.avatarColor || "bg-blue text-white"} font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-ink">{m.name}</span>
                              {m.role === "ADMIN" && (
                                <span title="Organization Administrator">
                                  <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted font-mono block">
                              {m.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Department */}
                      <TableCell className="text-muted text-xs">
                        {m.department || "Customs Compliance & Operations"}
                      </TableCell>

                      {/* Role Dropdown / Pill */}
                      <TableCell align="center">
                        {m.role === "ADMIN" ? (
                          <StatusPill
                            label={role.label}
                            variant={role.badgeVariant}
                            size="xs"
                          />
                        ) : (
                          <div className="w-36 inline-block text-left">
                            <CustomDropdown
                              value={m.role}
                              onChange={(val) => handleRoleChange(m, val as RoleType)}
                              options={[
                                { value: "TRADE_OFFICER", label: "Trade Officer" },
                                { value: "CUSTOMS_BROKER", label: "Customs Broker" },
                                { value: "AUDITOR", label: "Auditor" },
                                { value: "ADMIN", label: "Admin" },
                              ]}
                              size="sm"
                              usePortal={true}
                              className="w-full"
                            />
                          </div>
                        )}
                      </TableCell>

                      {/* 2FA Status */}
                      <TableCell align="center">
                        {m.twoFactorEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>2FA Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted px-2 py-0.5 rounded-full bg-bg border border-line">
                            <Lock className="w-3 h-3 text-muted/70" />
                            <span>2FA Off</span>
                          </span>
                        )}
                      </TableCell>

                      {/* Last Active */}
                      <TableCell className="font-mono text-muted text-[11px]">
                        {m.lastActive || "Recently Active"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <button
                          type="button"
                          onClick={() => setMemberToDelete(m)}
                          className="p-1.5 text-muted hover:text-red hover:bg-red/10 rounded-lg transition-colors cursor-pointer"
                          title={`Remove ${m.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* 3. Role-Based Access Control (RBAC) Matrix */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue" />
            <h4 className="text-xs font-bold text-ink font-mono uppercase tracking-wider">
              Workspace Role Permissions Matrix
            </h4>
          </div>
          <span className="text-[10px] font-mono text-muted">
            Enforced by Enterprise AuthGuard &bull; RBAC Level 3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(roleDetails) as RoleType[]).map((rKey) => {
            const r = roleDetails[rKey];

            return (
              <div
                key={rKey}
                className="p-4 bg-panel border border-line rounded-xl shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink text-xs font-mono">{r.label}</span>
                  <StatusPill label={rKey} variant={r.badgeVariant} size="xs" />
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Modal: Invite Member */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSendInvite}
            className="bg-panel border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Invite Team Member</h3>
                <p className="text-xs text-muted">
                  Add a colleague to your <span className="font-semibold text-ink">{planName}</span> workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quota reminder pill */}
            <div className="flex items-center justify-between p-2.5 px-3 bg-bg border border-line rounded-xl text-xs">
              <span className="text-muted">Seats Allocated</span>
              <span className="font-mono font-bold text-ink">
                {usedSeats} / {isUnlimited ? "∞ Unlimited" : `${seatLimit} Seats`}
              </span>
            </div>

            {inviteError && (
              <div className="p-3 rounded-xl bg-red/10 border border-red/20 text-red text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{inviteError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Nair"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-hidden focus:border-blue text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@partner-customs.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-hidden focus:border-blue text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mundra Port Clearance Desk"
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-hidden focus:border-blue text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink block">
                  Designated Role & Access Level
                </label>
                <CustomDropdown
                  value={inviteRole}
                  onChange={(val) => setInviteRole(val as RoleType)}
                  options={[
                    { value: "TRADE_OFFICER", label: "Trade Officer (Classify, Duty & Landed Cost)" },
                    { value: "CUSTOMS_BROKER", label: "Customs Broker (External Clearance Desk)" },
                    { value: "AUDITOR", label: "Auditor (Read-Only Calculation History)" },
                    { value: "ADMIN", label: "Organization Admin (Full Access)" },
                  ]}
                  size="sm"
                  className="w-full"
                />
                <span className="text-[10px] text-muted block mt-1">
                  {roleDetails[inviteRole]?.description}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg hover:bg-panel border border-line text-muted hover:text-ink cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isInviting || !canInviteMore}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue hover:bg-blue-dark text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isInviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isInviting ? "Saving to Database..." : "Send Workspace Invite"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Modal: Remove Member Confirmation */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-panel border border-line rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-red/10 border border-red/20 text-red flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-ink">Remove Team Member</h3>
              <p className="text-xs text-muted">
                Are you sure you want to remove <strong className="text-ink">{memberToDelete.name}</strong> ({memberToDelete.email}) from your workspace? They will lose access to organization calculations.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg hover:bg-panel border border-line text-muted hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRemoving}
                onClick={handleConfirmRemove}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red hover:bg-red-dark shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRemoving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isRemoving ? "Removing..." : "Remove Member"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

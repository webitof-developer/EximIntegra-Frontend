"use client";

import React, { useState } from "react";
import {
  StatusPill,
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui";
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit2,
  Mail,
  Shield,
  Building2,
  Check,
  X,
  Lock,
} from "lucide-react";

export type RoleType = "ADMIN" | "TRADE_OFFICER" | "CUSTOMS_BROKER" | "AUDITOR";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  department: string;
  role: RoleType;
  twoFactorEnabled: boolean;
  lastActive: string;
  avatarColor: string;
}

const initialMembers: TeamMember[] = [
  {
    id: "mem_1",
    name: "Arjun Verma",
    email: "arjun.verma@integra-metals.com",
    department: "Executive & Global Trade",
    role: "ADMIN",
    twoFactorEnabled: true,
    lastActive: "Active Now",
    avatarColor: "bg-navy text-[#93C5FD]",
  },
  {
    id: "mem_2",
    name: "Pooja Sharma",
    email: "pooja.sharma@integra-metals.com",
    department: "Customs Compliance & DGFT",
    role: "TRADE_OFFICER",
    twoFactorEnabled: true,
    lastActive: "25 minutes ago",
    avatarColor: "bg-blue text-white",
  },
  {
    id: "mem_3",
    name: "Vikas Kulkarni",
    email: "vikas.kulkarni@mumbaicustoms-partner.in",
    department: "External Customs Broker (CHA)",
    role: "CUSTOMS_BROKER",
    twoFactorEnabled: false,
    lastActive: "Yesterday",
    avatarColor: "bg-amber text-white",
  },
  {
    id: "mem_4",
    name: "Sunita Deshmukh",
    email: "sunita.d@integra-metals.com",
    department: "Internal Audit & Finance",
    role: "AUDITOR",
    twoFactorEnabled: true,
    lastActive: "3 days ago",
    avatarColor: "bg-green text-white",
  },
];

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
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Invite Form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDept, setInviteDept] = useState("Supply Chain Operations");
  const [inviteRole, setInviteRole] = useState<RoleType>("TRADE_OFFICER");

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRemoveMember = (id: string, name: string) => {
    if (members.length <= 1) {
      alert("At least one organization admin is required.");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showNotice(`Removed ${name} from organization workspace.`);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: `mem_${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      department: inviteDept,
      role: inviteRole,
      twoFactorEnabled: false,
      lastActive: "Invited (Pending)",
      avatarColor: "bg-blue text-white",
    };

    setMembers((prev) => [...prev, newMember]);
    setInviteName("");
    setInviteEmail("");
    setIsInviteOpen(false);
    showNotice(`Invitation email sent to ${newMember.email}. Assigned role: ${roleDetails[inviteRole].label}.`);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 bg-green-dim border border-green/30 text-green rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Users className="w-4 h-4 text-blue" />
            <span>Organization Members & Team Workspace</span>
          </h3>
          <p className="text-xs text-muted">
            Manage your company workspace seats, customs broker permissions, and role-based access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* 2. Team Members Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Member</TableHead>
              <TableHead>Department</TableHead>
              <TableHead align="center">Role / Access</TableHead>
              <TableHead align="center">Security (2FA)</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead align="center">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {members.map((m) => {
              const initials = m.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const role = roleDetails[m.role];

              return (
                <TableRow key={m.id}>
                  {/* Name & Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${m.avatarColor} font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {initials}
                      </div>
                      <div>
                        <span className="font-bold text-ink block">{m.name}</span>
                        <span className="text-[11px] text-muted font-mono block">
                          {m.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Department */}
                  <TableCell className="text-muted">
                    {m.department}
                  </TableCell>

                  {/* Role Pill */}
                  <TableCell align="center">
                    <StatusPill
                      label={role.label}
                      variant={role.badgeVariant}
                      size="xs"
                    />
                  </TableCell>

                  {/* 2FA Status */}
                  <TableCell align="center">
                    {m.twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-green font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Enabled</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-muted">
                        Not Enabled
                      </span>
                    )}
                  </TableCell>

                  {/* Last Active */}
                  <TableCell className="font-mono text-muted text-[11px]">
                    {m.lastActive}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    {m.role !== "ADMIN" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id, m.name)}
                        className="p-1 text-muted hover:text-red transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSendInvite}
            className="bg-panel border border-line rounded-2xl p-6 max-w-md w-full shadow-lg space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink">Invite Team Member</h3>
                <p className="text-xs text-muted">
                  Send an email invitation to join your company workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Nair"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-none focus:border-blue"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@partner-customs.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-none focus:border-blue"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mundra Port Clearance Desk"
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink focus:outline-none focus:border-blue"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  Designated Role & Access Level
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as RoleType)}
                  className="w-full py-2 px-3 bg-bg border border-line rounded-xl text-ink font-mono focus:outline-none focus:border-blue cursor-pointer"
                >
                  <option value="TRADE_OFFICER">Trade Officer (Classify, Duty & Landed Cost)</option>
                  <option value="CUSTOMS_BROKER">Customs Broker (Restricted Smelter Margin View)</option>
                  <option value="AUDITOR">Auditor (Read-Only History & Provenance)</option>
                  <option value="ADMIN">Organization Admin (Full Access)</option>
                </select>
                <span className="text-[10px] text-muted block mt-1">
                  {roleDetails[inviteRole].description}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-bg hover:bg-line border border-line text-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue hover:bg-blue-dark text-white cursor-pointer"
              >
                Send Workspace Invite
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

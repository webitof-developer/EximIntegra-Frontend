"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/store/authApi";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/authSlice";
import { ProvenanceBadge } from "@/components/ui/ProvenanceBadge";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { UserProfile } from "@/lib/types";
import { getApiErrorMessage } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState("Vikram Sengupta");
  const [company, setCompany] = useState("Sengupta Global Logistics & Trade Ltd");
  const [email, setEmail] = useState("vikram.s@sengupta-logistics.com");
  const [password, setPassword] = useState("SecurePass2026!");
  const [role, setRole] = useState<UserProfile["role"]>("CUSTOMS_BROKER");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const response = await register({
        name,
        company,
        email,
        password,
        role,
      }).unwrap();

      dispatch(
        setCredentials({
          token: response.access_token,
          user: response.user,
        })
      );
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(
        getApiErrorMessage(err, "Registration failed. Please check inputs and retry.")
      );
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-navy text-white shadow-xs hover:bg-[#142342] hover:scale-[1.02] active:scale-[0.98] transition-all group cursor-pointer"
            title="Return to EximIntegra Homepage"
          >
            <div className="w-6 h-6 rounded bg-blue group-hover:bg-blue-dark transition-colors flex items-center justify-center font-mono font-bold text-xs text-white">
              EI
            </div>
            <span className="font-bold tracking-tight text-sm">
              EXIMINTEGRA
            </span>
            <span className="text-[10px] font-mono text-[#8EA0C0] uppercase tracking-wider pl-1 border-l border-white/20">
              Registration
            </span>
          </Link>

          <h2 className="text-2xl font-bold text-ink tracking-tight mt-3">
            Register Trade Enterprise
          </h2>
          <p className="text-xs text-muted">
            Provision access for trade compliance, landed cost modeling, and Akshara AI.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-panel border border-line rounded-xl shadow-xs p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-dim border border-red/30 rounded-lg flex items-start gap-2.5 text-xs text-red">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Company / Organization
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Trade Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue cursor-pointer"
                  >
                    <option value="IMPORTER">Importer (Finished / Raw)</option>
                    <option value="EXPORTER">Exporter (Global Outbound)</option>
                    <option value="CUSTOMS_BROKER">Customs Broker / CHA</option>
                    <option value="TRADE_ADVISOR">Trade Advisory / Counsel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="font-mono">Provisioning Account...</span>
              ) : (
                <>
                  <span>Create Enterprise Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-line">
            <span className="text-xs text-muted">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-blue font-semibold hover:underline"
              >
                Sign In to Workspace
              </Link>
            </span>
          </div>
        </div>

        {/* Provenance Footer */}
        <div className="flex items-center justify-center gap-4 text-muted text-[11px]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green" />
            <span>Encrypted Credentials</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ProvenanceBadge type="LIVE" compact />
            <span>Multi-Tenant Enterprise Isolation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

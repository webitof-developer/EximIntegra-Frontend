"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/store/authApi";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/authSlice";
import { getApiErrorMessage } from "@/lib/utils";
import { ThreeBackground } from "@/components/auth/ThreeBackground";
import { CustomDropdown } from "@/components/ui";
import {
  Lock,
  Mail,
  User,
  Building,
  Briefcase,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { UserProfile } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserProfile["role"]>("IMPORTER");
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
        tier: "FREE_TRIAL",
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#F2F7FF] via-[#E9F2FE] to-[#DCEBFC] font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white py-10 sm:py-14 px-4 sm:px-6">
      {/* Three.js Live Interactive Background (Undulating 3D Wave & Trade Constellation) */}
      <ThreeBackground theme="register" />

      {/* Main Centered Container holding Card + Badges directly below */}
      <div className="relative z-10 w-full max-w-[560px] flex flex-col items-center">
        {/* Floating White Card Container with ALL elements INSIDE */}
        <div className="w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_-10px_rgba(29,78,216,0.12)] p-7 sm:p-9 space-y-6">
          {/* Logo & Header INSIDE the Card */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center group transition-transform hover:scale-[1.01]"
              title="Return to EximIntegra Homepage"
            >
              <Image
                src="/eximintegra-logo-without-bg-name.png"
                alt="EximIntegra"
                width={220}
                height={58}
                className="h-16 w-auto object-contain"
                priority
              />
            </Link>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Register Trade Enterprise
              </h1>
              <p className="text-xs leading-relaxed max-w-md">
                Provision access for trade compliance, landed cost modeling, and Akshara AI.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Full Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-[#1E293B]"
                >
                  Full Name
                </label>
                <div className="relative rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#1D68F2]/20 focus-within:border-[#1D68F2]">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#CBD5E1]/70 rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="company"
                  className="block text-xs font-semibold text-[#1E293B]"
                >
                  Company / Organization
                </label>
                <div className="relative rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#1D68F2]/20 focus-within:border-[#1D68F2]">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="company"
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Enter company name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#CBD5E1]/70 rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Work Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#1E293B]"
              >
                Work Email Address
              </label>
              <div className="relative rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#1D68F2]/20 focus-within:border-[#1D68F2]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#CBD5E1]/70 rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Row 3: Trade Role & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label
                  htmlFor="role"
                  className="block text-xs font-semibold text-[#1E293B]"
                >
                  Trade Role
                </label>
                <CustomDropdown
                  id="role"
                  value={role}
                  onChange={(val) => setRole(val as any)}
                  options={[
                    { value: "IMPORTER", label: "Importer (Finished / Raw)" },
                    { value: "EXPORTER", label: "Exporter (Global Outbound)" },
                    { value: "CUSTOMS_BROKER", label: "Customs Broker / CHA" },
                    { value: "TRADE_ADVISOR", label: "Trade Advisory / Counsel" },
                  ]}
                  icon={<Briefcase className="w-4 h-4" />}
                  buttonClassName="py-2.5 text-xs bg-[#F8FAFC] border-[#CBD5E1]/70 rounded-xl text-[#0F172A]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#1E293B]"
                >
                  Password
                </label>
                <div className="relative rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#1D68F2]/20 focus-within:border-[#1D68F2]">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#CBD5E1]/70 rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#475569] cursor-pointer focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-5 rounded-xl bg-[#1D68F2] hover:bg-[#1557D6] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2 font-mono">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Provisioning Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher INSIDE the Card */}
          <div className="text-center border-t border-slate-100">
            <span className="text-xs text-[#64748B]">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-bold text-[#1D68F2] hover:underline"
              >
                Sign In to Workspace
              </Link>
            </span>
          </div>
        </div>

        {/* Security & Provenance Footer directly below form container */}
        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-4 sm:gap-6 text-xs text-[#475569]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#E7F7ED] flex items-center justify-center text-[#16A34A]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-[#334155]">Encrypted Credentials</span>
          </div>

          <span className="text-[#94A3B8]">•</span>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E7F7ED] border border-[#BBF7D0] text-[#16A34A] text-[11px] font-bold font-mono">
              <CheckCircle2 className="w-3 h-3" />
              LIVE
            </span>
            <span className="font-medium text-[#334155]">Multi-Tenant Enterprise Isolation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

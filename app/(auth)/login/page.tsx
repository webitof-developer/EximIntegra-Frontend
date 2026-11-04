"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation } from "@/store/authApi";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/authSlice";
import { getApiErrorMessage } from "@/lib/utils";
import { ThreeBackground } from "@/components/auth/ThreeBackground";
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const response = await login({ email, password }).unwrap();
      dispatch(
        setCredentials({
          token: response.access_token,
          user: response.user,
          refreshToken: response.refresh_token,
        })
      );

      const isAdmin = response.user?.role === "ADMIN";
      let destination = isAdmin ? "/admin" : "/dashboard";

      if (isAdmin) {
        // Admin only goes to /admin or an /admin subpage
        if (returnUrl && returnUrl.startsWith("/admin")) {
          destination = returnUrl;
        } else {
          destination = "/admin";
        }
      } else {
        // Non-admin users are never routed to /admin pages
        if (
          returnUrl &&
          returnUrl !== "/" &&
          returnUrl !== "/dashboard" &&
          returnUrl !== "/login" &&
          returnUrl !== "/register" &&
          !returnUrl.startsWith("/admin")
        ) {
          destination = returnUrl;
        }
      }

      router.push(destination);
    } catch (err: unknown) {
      setErrorMsg(
        getApiErrorMessage(err, "Invalid credentials. Please verify your email and password.")
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#F2F7FF] via-[#E9F2FE] to-[#DCEBFC] font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white py-10 sm:py-14 px-4 sm:px-6">
      {/* Three.js Live Interactive Background (Undulating 3D Wave & Trade Constellation) */}
      <ThreeBackground theme="login" />

      {/* Ambient Refraction Glow Orbs for Glassmorphism */}
      <div className="absolute top-1/4 left-1/2 -translate-x-[75%] -translate-y-1/2 w-[440px] h-[440px] bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-[25%] -translate-y-1/3 w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[340px] bg-indigo-500/12 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Centered Container holding Card + Badges directly below */}
      <div className="relative z-10 w-full max-w-[480px] flex flex-col items-center">
        {/* Floating Glassmorphic Card Container */}
        <div className="w-full relative bg-white/40 backdrop-blur-2xl backdrop-saturate-150 rounded-3xl border border-white/70 shadow-[0_20px_60px_-15px_rgba(29,78,216,0.18),0_1px_1px_rgba(255,255,255,0.8)_inset,0_-1px_1px_rgba(255,255,255,0.3)_inset] p-7 sm:p-9 space-y-6">
          {/* Subtle top glass shine reflection */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/35 to-transparent pointer-events-none rounded-t-3xl" />

          {/* Logo & Header INSIDE the Card */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
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
                className="h-16 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]"
                priority
              />
            </Link>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                Sign in to Trade Advisory OS
              </h1>
              <p className="text-xs leading-relaxed max-w-sm text-[#475569]">
                Enterprise customs compliance, tariff calculation, and intelligence suite.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="relative z-10 p-3.5 bg-red-500/10 backdrop-blur-md border border-red-300/60 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            {/* Work Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#0F172A] tracking-tight"
              >
                Work Email Address
              </label>
              <div className="relative rounded-2xl transition-all focus-within:ring-4 focus-within:ring-[#1D68F2]/15 focus-within:border-[#1D68F2]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475569]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl text-[#0F172A] placeholder:text-[#64748B] hover:bg-white/60 focus:bg-white/75 focus:outline-none transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)_inset]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#0F172A] tracking-tight"
              >
                Password
              </label>
              <div className="relative rounded-2xl transition-all focus-within:ring-4 focus-within:ring-[#1D68F2]/15 focus-within:border-[#1D68F2]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475569]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl text-[#0F172A] placeholder:text-[#64748B] hover:bg-white/60 focus:bg-white/75 focus:outline-none transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)_inset]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#0F172A] cursor-pointer focus:outline-none transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Forgot Password Link Below Input on Right Side */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    alert("Contact your enterprise system administrator to reset credentials.")
                  }
                  className="text-xs font-medium text-[#1D68F2] hover:text-[#1557D6] hover:underline cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#1D68F2] to-[#2563EB] hover:from-[#1557D6] hover:to-[#1D4ED8] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2 font-mono">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher INSIDE the Card */}
          <div className="relative z-10 text-center pt-3 border-t border-white/60">
            <span className="text-xs text-[#475569]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-[#1D68F2] hover:text-[#1557D6] hover:underline transition-colors"
              >
                Register Organization
              </Link>
            </span>
          </div>
        </div>

        {/* Security Footer directly below form container */}
        <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6 py-2 px-5 rounded-full bg-white/40 backdrop-blur-md border border-white/70 shadow-sm text-xs text-[#334155]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#E7F7ED] flex items-center justify-center text-[#16A34A] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-[#1E293B]">256-Bit TLS Protected</span>
          </div>

          <span className="text-slate-300">•</span>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#EEF2F6] flex items-center justify-center text-[#475569] shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-[#1E293B]">Statutory Trade Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F0F5FF] flex flex-col items-center justify-center gap-3 font-mono text-xs text-[#64748B]">
          <div className="w-6 h-6 border-2 border-[#1D68F2] border-t-transparent rounded-full animate-spin" />
          <span>Loading secure authentication...</span>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}

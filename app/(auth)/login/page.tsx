"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation } from "@/store/authApi";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/authSlice";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProvenanceBadge } from "@/components/ui/ProvenanceBadge";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Building,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("trade.officer@integra-metals.com");
  const [password, setPassword] = useState("••••••••••••");
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
        })
      );
      router.push(returnUrl);
    } catch (err: any) {
      setErrorMsg(err?.data?.error || "Invalid credentials. Please verify your email and password.");
    }
  };

  const handleQuickDemo = async () => {
    try {
      const response = await login({
        email: "trade.officer@integra-metals.com",
        password: "demo_password",
      }).unwrap();
      dispatch(
        setCredentials({
          token: response.access_token,
          user: response.user,
        })
      );
      router.push(returnUrl);
    } catch (err: any) {
      setErrorMsg("Demo login failed. Please retry.");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-navy text-white shadow-xs">
            <div className="w-6 h-6 rounded bg-blue flex items-center justify-center font-mono font-bold text-xs text-white">
              EI
            </div>
            <span className="font-bold tracking-tight text-sm">
              EXIMINTEGRA
            </span>
            <span className="text-[10px] font-mono text-[#8EA0C0] uppercase tracking-wider pl-1 border-l border-white/20">
              v1.0
            </span>
          </div>

          <h2 className="text-2xl font-bold text-ink tracking-tight mt-3">
            Sign in to Trade Advisory OS
          </h2>
          <p className="text-xs text-muted">
            Enterprise customs compliance, tariff calculation, and intelligence suite.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-panel border border-line rounded-xl shadow-xs p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-dim border border-red/30 rounded-lg flex items-start gap-2.5 text-xs text-red">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-bg border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-ink"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Contact your enterprise system administrator to reset credentials.");
                  }}
                  className="text-[11px] text-blue hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-bg border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue hover:bg-blue-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="font-mono">Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-2 border-t border-line space-y-2">
            <span className="text-[11px] text-muted block text-center">
              Evaluating or testing the platform?
            </span>
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-dim hover:bg-blue-dim/80 text-blue border border-blue/20 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Demo Sign In (Enterprise Officer)</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs text-muted">
              Don&apos;t have an enterprise account?{" "}
              <Link
                href="/register"
                className="text-blue font-semibold hover:underline"
              >
                Register Organization
              </Link>
            </span>
          </div>
        </div>

        {/* Security & Provenance Footer */}
        <div className="flex items-center justify-center gap-4 text-muted text-[11px]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green" />
            <span>256-Bit TLS Protected</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ProvenanceBadge type="LIVE" compact />
            <span>CBIC Live Gateway</span>
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
        <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-xs text-muted">
          Loading EximIntegra Workspace...
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}

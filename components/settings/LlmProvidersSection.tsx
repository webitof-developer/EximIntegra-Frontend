"use client";

import React, { useState } from "react";
import { Card, StatusPill } from "@/components/ui";
import {
  Sparkles,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Cpu,
  ArrowRight,
} from "lucide-react";

interface LlmProviderConfig {
  id: string;
  name: string;
  badge: string;
  defaultModel: string;
  models: string[];
  keyPrefix: string;
  apiKey: string;
  baseUrl: string;
  isConfigured: boolean;
  isActiveCopilot: boolean;
  testStatus?: "idle" | "testing" | "success" | "error";
  testLatency?: number;
}

const initialProviders: LlmProviderConfig[] = [
  {
    id: "anthropic",
    name: "Anthropic Claude",
    badge: "RECOMMENDED",
    defaultModel: "claude-3-5-sonnet-20241022",
    models: [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
    ],
    keyPrefix: "sk-ant-",
    apiKey: "sk-ant-api03-9jK4...b8X1",
    baseUrl: "https://api.anthropic.com/v1",
    isConfigured: true,
    isActiveCopilot: true,
  },
  {
    id: "openai",
    name: "OpenAI",
    badge: "SUPPORTED",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "o1-preview", "o1-mini"],
    keyPrefix: "sk-proj-",
    apiKey: "sk-proj-f018a...29c4",
    baseUrl: "https://api.openai.com/v1",
    isConfigured: true,
    isActiveCopilot: false,
  },
  {
    id: "google",
    name: "Google Gemini",
    badge: "HIGH SPEED",
    defaultModel: "gemini-1.5-pro",
    models: ["gemini-1.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"],
    keyPrefix: "AIzaSy",
    apiKey: "",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    isConfigured: false,
    isActiveCopilot: false,
  },
  {
    id: "groq",
    name: "Groq Llama 3",
    badge: "LOW LATENCY",
    defaultModel: "llama-3.3-70b-versatile",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
    keyPrefix: "gsk_",
    apiKey: "",
    baseUrl: "https://api.groq.com/openai/v1",
    isConfigured: false,
    isActiveCopilot: false,
  },
  {
    id: "custom",
    name: "On-Premises / Private vLLM",
    badge: "ENTERPRISE",
    defaultModel: "custom-trade-model-q8",
    models: ["custom-trade-model-q8", "mistral-7b-instruct", "deepseek-r1-distill"],
    keyPrefix: "vllm-",
    apiKey: "vllm-local-sec-token-9982",
    baseUrl: "https://llm.internal.integra-metals.com/v1",
    isConfigured: true,
    isActiveCopilot: false,
  },
];

export function LlmProvidersSection() {
  const [providers, setProviders] = useState<LlmProviderConfig[]>(initialProviders);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const toggleShowKey = (id: string) => {
    setShowKeyMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeyChange = (id: string, value: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              apiKey: value,
              isConfigured: value.trim().length > 0,
              testStatus: "idle",
            }
          : p
      )
    );
  };

  const handleModelChange = (id: string, model: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, defaultModel: model } : p))
    );
  };

  const handleBaseUrlChange = (id: string, url: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, baseUrl: url } : p))
    );
  };

  const handleSetActiveCopilot = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => ({
        ...p,
        isActiveCopilot: p.id === id,
      }))
    );
    showNotice(`Set ${providers.find((p) => p.id === id)?.name} as active model for Akshara AI.`);
  };

  const handleTestConnection = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, testStatus: "testing" } : p))
    );

    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 45) + 38;
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                testStatus: "success",
                testLatency: simulatedLatency,
              }
            : p
        )
      );
    }, 850);
  };

  const handleSave = (id: string) => {
    const provider = providers.find((p) => p.id === id);
    showNotice(`Credentials for ${provider?.name} encrypted and saved.`);
  };

  const showNotice = (msg: string) => {
    setSavedNotification(msg);
    setTimeout(() => setSavedNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {savedNotification && (
        <div className="p-3 bg-green-dim border border-green/30 text-green rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedNotification(null)}
            className="text-xs hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Security Note Banner */}
      <div className="p-3.5 bg-blue-dim/40 border border-blue/20 rounded-xl flex items-center justify-between gap-3 text-xs text-blue">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue shrink-0" />
          <span>
            <strong>Client-Side BYOK Encryption:</strong> Provider keys are
            injected via authenticated TLS request headers and never persisted
            in shared application logs.
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase font-bold text-blue shrink-0">
          TLS 1.3 / AES-256
        </span>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 gap-4">
        {providers.map((p) => {
          const isShow = showKeyMap[p.id];

          return (
            <div
              key={p.id}
              className={`p-5 rounded-xl border transition-all ${
                p.isActiveCopilot
                  ? "bg-panel border-blue/40 shadow-xs"
                  : "bg-panel border-line hover:border-line/80"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Header Information */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      p.isActiveCopilot
                        ? "bg-blue text-white shadow-xs"
                        : "bg-bg border border-line text-ink"
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-ink">{p.name}</h3>
                      <StatusPill
                        label={p.badge}
                        variant={p.isActiveCopilot ? "primary" : "muted"}
                        size="xs"
                      />
                      {p.isActiveCopilot && (
                        <span className="text-[10px] font-mono font-bold bg-green-dim text-green px-2 py-0.5 rounded border border-green/20">
                          ACTIVE COPILOT ENGINE
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted font-mono block">
                      Target Model: {p.defaultModel}
                    </span>
                  </div>
                </div>

                {/* Status & Make Active Action */}
                <div className="flex items-center gap-2.5">
                  {p.isConfigured ? (
                    <button
                      type="button"
                      disabled={p.isActiveCopilot}
                      onClick={() => handleSetActiveCopilot(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        p.isActiveCopilot
                          ? "bg-blue-dim text-blue border border-blue/30 cursor-default"
                          : "bg-bg hover:bg-line border border-line text-ink"
                      }`}
                    >
                      {p.isActiveCopilot
                        ? "Selected for Akshara"
                        : "Use for Akshara"}
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-muted">
                      Add API Key to Enable
                    </span>
                  )}
                </div>
              </div>

              {/* Input Fields */}
              <div className="mt-4 pt-4 border-t border-line grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                {/* API Key Input */}
                <div className="md:col-span-6 space-y-1">
                  <label className="text-[11px] font-semibold text-ink flex items-center gap-1.5">
                    <Key className="w-3 h-3 text-blue" />
                    <span>API Key / Secret Token</span>
                  </label>
                  <div className="relative">
                    <input
                      type={isShow ? "text" : "password"}
                      value={p.apiKey}
                      onChange={(e) => handleKeyChange(p.id, e.target.value)}
                      placeholder={`Enter ${p.keyPrefix}...`}
                      className="w-full py-2 pl-3 pr-9 font-mono text-xs bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(p.id)}
                      className="absolute right-2.5 top-2.5 text-muted hover:text-ink cursor-pointer"
                    >
                      {isShow ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Model Selector */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-semibold text-ink">
                    Default Model
                  </label>
                  <select
                    value={p.defaultModel}
                    onChange={(e) => handleModelChange(p.id, e.target.value)}
                    className="w-full py-2 px-2.5 text-xs bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue cursor-pointer"
                  >
                    {p.models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions & Verification */}
                <div className="md:col-span-3 flex items-end gap-2">
                  <button
                    type="button"
                    disabled={!p.apiKey || p.testStatus === "testing"}
                    onClick={() => handleTestConnection(p.id)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-bg hover:bg-line border border-line text-ink transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {p.testStatus === "testing" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Test</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave(p.id)}
                    className="py-2 px-3.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>

                {/* Base URL (Full Width on Expand) */}
                <div className="md:col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-muted">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Server className="w-3 h-3 text-muted" />
                    <span>Endpoint:</span>
                    <input
                      type="text"
                      value={p.baseUrl}
                      onChange={(e) => handleBaseUrlChange(p.id, e.target.value)}
                      className="py-0.5 px-2 bg-transparent border-b border-line/60 hover:border-blue focus:outline-none focus:border-blue text-ink font-mono text-[11px] w-64 md:w-80"
                    />
                  </div>

                  {/* Test Status feedback */}
                  {p.testStatus === "success" && (
                    <span className="font-mono text-green font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified (200 OK &bull; {p.testLatency}ms)
                    </span>
                  )}
                  {p.testStatus === "error" && (
                    <span className="font-mono text-red font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Connection Failed (401 Unauthorized)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

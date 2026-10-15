"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { StatusPill, CustomDropdown } from "@/components/ui";
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Cpu,
  Plus,
  Edit2,
  Trash2,
  Settings2,
  Check,
  X,
  AlertCircle,
  Sparkles,
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

const STORAGE_KEY = "eximintegra_llm_providers_config";

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
    apiKey: "",
    baseUrl: "https://api.anthropic.com/v1",
    isConfigured: false,
    isActiveCopilot: true,
  },
  {
    id: "openai",
    name: "OpenAI",
    badge: "SUPPORTED",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "o1-preview", "o1-mini"],
    keyPrefix: "sk-proj-",
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    isConfigured: false,
    isActiveCopilot: false,
  },
  {
    id: "google",
    name: "Google Gemini",
    badge: "HIGH SPEED",
    defaultModel: "gemini-3.5-flash",
    models: ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-3.8-flash", "gemini-3.1-pro-preview"],
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
  const [savedNotification, setSavedNotification] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Direct input field per provider for adding/editing models
  const [modelInputs, setModelInputs] = useState<Record<string, string>>({});
  const [editingModelFor, setEditingModelFor] = useState<{
    providerId: string;
    oldModel: string;
  } | null>(null);

  // Manage Models Modal state
  const [manageModalProviderId, setManageModalProviderId] = useState<string | null>(null);
  const [modalNewModelInput, setModalNewModelInput] = useState("");
  const [modalEditingModel, setModalEditingModel] = useState<{
    oldModel: string;
    value: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProviders((prev) =>
            prev.map((initP) => {
              const savedP = parsed.find((p: any) => p.id === initP.id);
              if (savedP) {
                return {
                  ...initP,
                  apiKey: savedP.apiKey !== undefined ? savedP.apiKey : initP.apiKey,
                  baseUrl: savedP.baseUrl || initP.baseUrl,
                  defaultModel: savedP.defaultModel || initP.defaultModel,
                  models:
                    Array.isArray(savedP.models) && savedP.models.length > 0
                      ? Array.from(new Set([...savedP.models, ...initP.models]))
                      : initP.models,
                  isConfigured:
                    savedP.isConfigured !== undefined
                      ? savedP.isConfigured
                      : initP.isConfigured,
                  isActiveCopilot:
                    savedP.isActiveCopilot !== undefined
                      ? savedP.isActiveCopilot
                      : initP.isActiveCopilot,
                };
              }
              return initP;
            })
          );
        }
      }
    } catch (e) {
      console.error("Failed to load saved LLM providers from localStorage", e);
    }
  }, []);

  const saveToStorage = (updated: LlmProviderConfig[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to persist LLM configs to localStorage", e);
    }
  };

  const showNotice = (msg: string, type: "success" | "error" = "success") => {
    setSavedNotification({ msg, type });
    setTimeout(() => setSavedNotification(null), 3500);
  };

  const toggleShowKey = (id: string) => {
    setShowKeyMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeyChange = (id: string, value: string) => {
    const updated = providers.map((p) =>
      p.id === id
        ? {
            ...p,
            apiKey: value,
            isConfigured: value.trim().length > 0,
            testStatus: "idle" as const,
          }
        : p
    );
    setProviders(updated);
    saveToStorage(updated);
  };

  const handleModelChange = (id: string, model: string) => {
    const updated = providers.map((p) =>
      p.id === id ? { ...p, defaultModel: model } : p
    );
    setProviders(updated);
    saveToStorage(updated);
    const provider = providers.find((p) => p.id === id);
    showNotice(`Active model for ${provider?.name || id} switched to "${model}".`);
  };

  const handleBaseUrlChange = (id: string, url: string) => {
    const updated = providers.map((p) =>
      p.id === id ? { ...p, baseUrl: url } : p
    );
    setProviders(updated);
    saveToStorage(updated);
  };

  const handleSetActiveCopilot = (id: string) => {
    const updated = providers.map((p) => ({
      ...p,
      isActiveCopilot: p.id === id,
    }));
    setProviders(updated);
    saveToStorage(updated);
    showNotice(
      `Set ${providers.find((p) => p.id === id)?.name} as active model for Akshara AI.`
    );
  };

  const handleTestConnection = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, testStatus: "testing" } : p))
    );

    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 45) + 38;
      setProviders((prev) => {
        const updated = prev.map((p) =>
          p.id === id
            ? {
                ...p,
                testStatus: "success" as const,
                testLatency: simulatedLatency,
              }
            : p
        );
        saveToStorage(updated);
        return updated;
      });
    }, 850);
  };

  const handleSave = (id: string) => {
    const provider = providers.find((p) => p.id === id);
    saveToStorage(providers);
    showNotice(`Credentials and model configuration for ${provider?.name} saved.`);
  };

  // --- Save / Add from Input Field ---
  const handleSaveModelInput = (providerId: string) => {
    const raw = (modelInputs[providerId] || "").trim();
    if (!raw) {
      showNotice("Please enter a model name to save.", "error");
      return;
    }

    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return;

    // If editing existing model
    if (editingModelFor?.providerId === providerId) {
      const oldModel = editingModelFor.oldModel;
      const updatedModels = provider.models.map((m) =>
        m === oldModel ? raw : m
      );

      const updated = providers.map((p) =>
        p.id === providerId
          ? {
              ...p,
              models: updatedModels,
              defaultModel: p.defaultModel === oldModel ? raw : p.defaultModel,
            }
          : p
      );

      setProviders(updated);
      saveToStorage(updated);
      setEditingModelFor(null);
      setModelInputs((prev) => ({ ...prev, [providerId]: "" }));
      showNotice(`Model renamed to "${raw}" and updated in dropdown.`);
      return;
    }

    // Check if already in list (case-insensitive)
    const existing = provider.models.find(
      (m) => m.toLowerCase() === raw.toLowerCase()
    );

    if (existing) {
      handleModelChange(providerId, existing);
      setModelInputs((prev) => ({ ...prev, [providerId]: "" }));
      showNotice(`Model "${existing}" already exists and is now selected.`);
      return;
    }

    // Add new model
    const updatedModels = [...provider.models, raw];
    const updated = providers.map((p) =>
      p.id === providerId
        ? {
            ...p,
            models: updatedModels,
            defaultModel: raw,
          }
        : p
    );

    setProviders(updated);
    saveToStorage(updated);
    setModelInputs((prev) => ({ ...prev, [providerId]: "" }));
    showNotice(`Model "${raw}" saved and selected in dropdown!`);
  };

  const handleStartEdit = (providerId: string, modelName: string) => {
    setEditingModelFor({ providerId, oldModel: modelName });
    setModelInputs((prev) => ({ ...prev, [providerId]: modelName }));
  };

  const handleCancelEdit = (providerId: string) => {
    setEditingModelFor(null);
    setModelInputs((prev) => ({ ...prev, [providerId]: "" }));
  };

  // --- Delete Model ---
  const handleDeleteModel = (providerId: string, modelToDelete: string) => {
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return;

    if (provider.models.length <= 1) {
      showNotice(
        "At least one model must remain configured in dropdown.",
        "error"
      );
      return;
    }

    const remaining = provider.models.filter((m) => m !== modelToDelete);
    const newDefault =
      provider.defaultModel === modelToDelete ? remaining[0] : provider.defaultModel;

    const updated = providers.map((p) =>
      p.id === providerId
        ? {
            ...p,
            models: remaining,
            defaultModel: newDefault,
          }
        : p
    );

    setProviders(updated);
    saveToStorage(updated);

    if (editingModelFor?.oldModel === modelToDelete) {
      setEditingModelFor(null);
      setModelInputs((prev) => ({ ...prev, [providerId]: "" }));
    }

    showNotice(`Model "${modelToDelete}" removed from dropdown.`);
  };

  // --- Modal Management Operations ---
  const handleModalAddModel = () => {
    if (!manageModalProviderId) return;
    const trimmed = modalNewModelInput.trim();
    if (!trimmed) {
      showNotice("Please enter a model name to add.", "error");
      return;
    }

    const provider = providers.find((p) => p.id === manageModalProviderId);
    if (!provider) return;

    if (
      provider.models.some((m) => m.toLowerCase() === trimmed.toLowerCase())
    ) {
      showNotice(`Model "${trimmed}" is already in the list.`, "error");
      return;
    }

    const updatedModels = [...provider.models, trimmed];
    const updated = providers.map((p) =>
      p.id === manageModalProviderId
        ? {
            ...p,
            models: updatedModels,
            defaultModel: trimmed,
          }
        : p
    );

    setProviders(updated);
    saveToStorage(updated);
    setModalNewModelInput("");
    showNotice(`Model "${trimmed}" added and selected as default.`);
  };

  const handleModalSaveEdit = () => {
    if (!manageModalProviderId || !modalEditingModel) return;
    const { oldModel, value } = modalEditingModel;
    const trimmed = value.trim();

    if (!trimmed) {
      showNotice("Model name cannot be empty.", "error");
      return;
    }

    const provider = providers.find((p) => p.id === manageModalProviderId);
    if (!provider) return;

    const updatedModels = provider.models.map((m) =>
      m === oldModel ? trimmed : m
    );

    const updated = providers.map((p) =>
      p.id === manageModalProviderId
        ? {
            ...p,
            models: updatedModels,
            defaultModel: p.defaultModel === oldModel ? trimmed : p.defaultModel,
          }
        : p
    );

    setProviders(updated);
    saveToStorage(updated);
    setModalEditingModel(null);
    showNotice(`Model updated to "${trimmed}".`);
  };

  const modalProvider = providers.find((p) => p.id === manageModalProviderId);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {savedNotification && (
        <div
          className={`p-3 border rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-150 ${
            savedNotification.type === "error"
              ? "bg-red-dim border-red/30 text-red"
              : "bg-green-dim border-green/30 text-green"
          }`}
        >
          <div className="flex items-center gap-2">
            {savedNotification.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{savedNotification.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedNotification(null)}
            className="text-xs hover:underline cursor-pointer ml-3"
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
            <strong>Client-Side BYOK Encryption:</strong> Provider keys and model
            identifiers are authenticated securely via TLS headers and stored in your browser workspace.
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
          const isEditing = editingModelFor?.providerId === p.id;

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
                    <div className="flex items-center gap-2 text-xs text-muted font-mono">
                      <span>Target Model:</span>
                      <span className="text-ink font-semibold bg-bg px-1.5 py-0.5 rounded border border-line">
                        {p.defaultModel}
                      </span>
                      <span className="text-muted/60">&bull;</span>
                      <span className="text-[11px] text-muted">
                        {p.models.length} saved in dropdown
                      </span>
                    </div>
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
              <div className="mt-4 pt-4 border-t border-line grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
                {/* API Key Input (4 cols) */}
                <div className="md:col-span-4 space-y-1">
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

                {/* Model Selector, Input Field, Edit & Delete (5 cols) */}
                <div className="md:col-span-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-ink flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue" />
                      <span>AI Model (Select or Input)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setManageModalProviderId(p.id);
                        setModalNewModelInput("");
                        setModalEditingModel(null);
                      }}
                      className="text-[10px] text-muted hover:text-ink font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      title="View, edit, or delete all models for this provider"
                    >
                      <Settings2 className="w-3 h-3" />
                      <span>Manage All ({p.models.length})</span>
                    </button>
                  </div>

                  {/* 1. Select from previous models dropdown + Edit + Delete */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 min-w-0" title="Select previously saved model from dropdown">
                      <CustomDropdown
                        value={p.defaultModel}
                        onChange={(val) => handleModelChange(p.id, val)}
                        options={p.models}
                        size="sm"
                        buttonClassName="py-1.5 px-2.5 text-xs bg-bg border-line rounded-lg text-ink font-mono focus:border-blue w-full truncate"
                      />
                    </div>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(p.id, p.defaultModel)}
                      title={`Edit / Rename "${p.defaultModel}"`}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        isEditing && editingModelFor?.oldModel === p.defaultModel
                          ? "bg-amber-100 dark:bg-amber-950/40 border-amber text-amber"
                          : "bg-bg border-line hover:border-blue text-muted hover:text-blue"
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteModel(p.id, p.defaultModel)}
                      disabled={p.models.length <= 1}
                      title={
                        p.models.length <= 1
                          ? "Cannot delete the only configured model"
                          : `Delete "${p.defaultModel}" from dropdown`
                      }
                      className="p-1.5 rounded-lg bg-bg border border-line hover:border-red text-muted hover:text-red transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 2. Direct Input Field to Add New Model or Update Edited Model */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={modelInputs[p.id] || ""}
                        onChange={(e) =>
                          setModelInputs({
                            ...modelInputs,
                            [p.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveModelInput(p.id);
                          } else if (e.key === "Escape" && isEditing) {
                            handleCancelEdit(p.id);
                          }
                        }}
                        placeholder={
                          isEditing
                            ? `Rename "${editingModelFor.oldModel}"...`
                            : "Input new model name & save..."
                        }
                        className={`w-full py-1.5 px-2.5 font-mono text-xs bg-bg border rounded-lg text-ink placeholder:text-muted/60 focus:outline-none transition-all ${
                          isEditing
                            ? "border-amber focus:border-amber ring-1 ring-amber/40"
                            : "border-line focus:border-blue"
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveModelInput(p.id)}
                      className={`px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1 ${
                        isEditing
                          ? "bg-amber hover:bg-amber-600"
                          : "bg-blue hover:bg-blue-dark"
                      }`}
                      title={
                        isEditing
                          ? "Update model identifier"
                          : "Save model into dropdown and set as default"
                      }
                    >
                      {isEditing ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Update</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Save Model</span>
                        </>
                      )}
                    </button>

                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleCancelEdit(p.id)}
                        className="px-2 py-1.5 text-xs text-muted hover:text-ink bg-bg border border-line rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Cancel edit"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions & Verification (3 cols) */}
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
                    className="py-2 px-3.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white transition-colors cursor-pointer shadow-xs"
                  >
                    Save All
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

      {/* Manage Models Modal */}
      {manageModalProviderId && modalProvider && mounted &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-models-modal-title"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-navy/60 backdrop-blur-xs animate-in fade-in duration-200"
          >
            {/* Backdrop click to dismiss */}
            <div
              className="fixed inset-0"
              onClick={() => setManageModalProviderId(null)}
              aria-hidden="true"
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-lg bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-5 border-b border-line bg-bg/50 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue/10 border border-blue/20 text-blue flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2
                      id="manage-models-modal-title"
                      className="text-base font-bold text-ink tracking-tight flex items-center gap-2"
                    >
                      <span>Manage Models</span>
                      <span className="text-xs px-2 py-0.5 rounded font-normal bg-bg border border-line text-muted">
                        {modalProvider.name}
                      </span>
                    </h2>
                    <p className="text-xs text-muted">
                      Add, edit, or remove models configured for this AI provider.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setManageModalProviderId(null)}
                  className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-bg border border-transparent hover:border-line flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Add New Model Form */}
                <div className="space-y-1.5 p-3.5 bg-bg border border-line rounded-xl">
                  <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue" />
                    <span>Add New Model Identifier</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={modalNewModelInput}
                      onChange={(e) => setModalNewModelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleModalAddModel();
                        }
                      }}
                      placeholder="e.g. claude-3-7-sonnet or gpt-4o-2024-11-20"
                      className="flex-1 py-2 px-3 font-mono text-xs bg-panel border border-line rounded-lg text-ink focus:outline-none focus:border-blue placeholder:text-muted/60"
                    />
                    <button
                      type="button"
                      onClick={handleModalAddModel}
                      className="px-4 py-2 text-xs font-semibold bg-blue hover:bg-blue-dark text-white rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Add & Select
                    </button>
                  </div>
                  <span className="text-[11px] text-muted block">
                    Once added, this model will be available in the dropdown and set as default.
                  </span>
                </div>

                {/* Models List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink px-1">
                    <span>Configured Models ({modalProvider.models.length})</span>
                    <span className="text-[11px] font-normal text-muted">
                      Click check to make default
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {modalProvider.models.map((modelName) => {
                      const isDefault = modalProvider.defaultModel === modelName;
                      const isRowEditing =
                        modalEditingModel?.oldModel === modelName;

                      return (
                        <div
                          key={modelName}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                            isDefault
                              ? "bg-blue/5 border-blue/30"
                              : "bg-bg border-line hover:border-line/80"
                          }`}
                        >
                          {isRowEditing ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                autoFocus
                                value={modalEditingModel.value}
                                onChange={(e) =>
                                  setModalEditingModel({
                                    ...modalEditingModel,
                                    value: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleModalSaveEdit();
                                  } else if (e.key === "Escape") {
                                    setModalEditingModel(null);
                                  }
                                }}
                                className="flex-1 py-1 px-2.5 text-xs font-mono bg-panel border border-blue rounded-lg text-ink focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleModalSaveEdit}
                                className="p-1.5 rounded-lg bg-blue text-white hover:bg-blue-dark transition-colors cursor-pointer shrink-0"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setModalEditingModel(null)}
                                className="p-1.5 rounded-lg bg-panel border border-line text-muted hover:text-ink transition-colors cursor-pointer shrink-0"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="font-mono text-xs text-ink font-medium truncate">
                                  {modelName}
                                </span>
                                {isDefault && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-dim text-green border border-green/30 shrink-0 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    DEFAULT
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {!isDefault && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleModelChange(
                                        modalProvider.id,
                                        modelName
                                      )
                                    }
                                    className="px-2.5 py-1 text-[11px] font-semibold text-muted hover:text-ink bg-panel border border-line hover:border-line/80 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Set Default
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setModalEditingModel({
                                      oldModel: modelName,
                                      value: modelName,
                                    })
                                  }
                                  title={`Rename ${modelName}`}
                                  className="p-1.5 rounded-lg text-muted hover:text-blue hover:bg-panel border border-transparent hover:border-line transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteModel(
                                      modalProvider.id,
                                      modelName
                                    )
                                  }
                                  disabled={modalProvider.models.length <= 1}
                                  title={
                                    modalProvider.models.length <= 1
                                      ? "Cannot delete the only configured model"
                                      : `Delete ${modelName}`
                                  }
                                  className="p-1.5 rounded-lg text-muted hover:text-red hover:bg-panel border border-transparent hover:border-line transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-line bg-bg/50 flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setManageModalProviderId(null)}
                  className="px-5 py-2 text-xs font-semibold bg-blue hover:bg-blue-dark text-white rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { StatusPill } from "@/components/ui";
import {
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  Webhook,
  Send,
  CheckCircle2,
  Lock,
  Code2,
  Shield,
} from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  fullKey: string;
  createdAt: string;
  lastUsed: string;
  scopes: string[];
  status: "ACTIVE" | "REVOKED";
}

interface WebhookEndpoint {
  id: string;
  url: string;
  description: string;
  secret: string;
  events: string[];
  status: "ACTIVE" | "PAUSED";
  lastDelivery: string;
  isTesting?: boolean;
  testResult?: string;
}

const initialKeys: ApiKeyItem[] = [
  {
    id: "key_1",
    name: "SAP S/4HANA ERP Connector",
    prefix: "exim_live_8f92a...",
    fullKey: "exim_live_8f92a019b8834ac88e9102934",
    createdAt: "2026-08-15",
    lastUsed: "12 minutes ago",
    scopes: ["classify:read", "duty:calculate", "landed_cost:read"],
    status: "ACTIVE",
  },
  {
    id: "key_2",
    name: "Internal BI Dashboard Syncer",
    prefix: "exim_live_1c44e...",
    fullKey: "exim_live_1c44e09881ab7742de8810239",
    createdAt: "2026-09-02",
    lastUsed: "2 hours ago",
    scopes: ["reports:read", "tariffs:read"],
    status: "ACTIVE",
  },
];

const initialWebhooks: WebhookEndpoint[] = [
  {
    id: "wh_1",
    url: "https://erp.integra-metals.com/api/v1/exim/duty-notifications",
    description: "Informs ERP warehouse inventory upon customs calculation completion",
    secret: "whsec_994af801...2b8c",
    events: ["duty.calculated", "landed_cost.completed"],
    status: "ACTIVE",
    lastDelivery: "2026-09-28 11:20 IST (200 OK)",
  },
];

export function PlatformKeysSection() {
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(initialWebhooks);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("all");

  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [newWhUrl, setNewWhUrl] = useState("");
  const [newWhDesc, setNewWhDesc] = useState("");

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotice("Key copied to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevokeKey = (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "REVOKED" } : k))
    );
    showNotice("API Key revoked.");
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      prefix: `exim_live_${randomSuffix.substring(0, 5)}...`,
      fullKey: `exim_live_${randomSuffix}${Math.random().toString(36).substring(2, 12)}`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      scopes:
        newKeyScope === "all"
          ? ["classify:*", "duty:*", "landed_cost:*", "reports:*"]
          : ["duty:calculate", "reports:read"],
      status: "ACTIVE",
    };

    setKeys((prev) => [newKey, ...prev]);
    setNewKeyName("");
    setIsCreatingKey(false);
    showNotice(`Generated new secret key "${newKey.name}".`);
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhUrl.trim()) return;

    const newWh: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      url: newWhUrl,
      description: newWhDesc || "Custom webhook endpoint",
      secret: `whsec_${Math.random().toString(36).substring(2, 10)}...`,
      events: ["duty.calculated", "landed_cost.completed"],
      status: "ACTIVE",
      lastDelivery: "Pending initial test",
    };

    setWebhooks((prev) => [newWh, ...prev]);
    setNewWhUrl("");
    setNewWhDesc("");
    setIsCreatingWebhook(false);
    showNotice("Added new webhook endpoint.");
  };

  const handleTestWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isTesting: true, testResult: undefined } : w
      )
    );

    setTimeout(() => {
      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                isTesting: false,
                testResult: "Delivered (HTTP 200 OK • 52ms)",
                lastDelivery: "Just now (200 OK)",
              }
            : w
        )
      );
      showNotice("Test payload delivered successfully.");
    }, 850);
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    showNotice("Webhook removed.");
  };

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-7">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-green-dim border border-green/30 text-green rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
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

      {/* 1. Developer Platform Secret Keys */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
              EximIntegra Secret API Keys
            </h3>
            <span className="text-[10px] font-mono text-muted bg-bg px-2 py-0.5 rounded border border-line">
              For ERP & External Automation
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingKey(!isCreatingKey)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Secret Key</span>
          </button>
        </div>

        {/* Inline Create Key Form */}
        {isCreatingKey && (
          <form
            onSubmit={handleCreateKey}
            className="p-4 bg-panel border border-blue/40 rounded-xl shadow-xs space-y-3 text-xs"
          >
            <div className="font-bold text-ink">Generate New Platform API Key</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted block mb-1">Key Description / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Warehouse Oracle NetSuite"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted block mb-1">Access Scope</label>
                <select
                  value={newKeyScope}
                  onChange={(e) => setNewKeyScope(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue cursor-pointer"
                >
                  <option value="all">Full Access (Classify, Duty, Landed Cost, Reports)</option>
                  <option value="read">Read Only & Duty Calculation</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingKey(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg hover:bg-line border border-line text-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white cursor-pointer"
              >
                Generate Key
              </button>
            </div>
          </form>
        )}

        {/* Keys Table */}
        <div className="overflow-x-auto bg-panel border border-line rounded-xl shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-bg/60 border-b border-line text-[11px] font-mono text-muted uppercase">
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Key Token</th>
                <th className="py-2.5 px-4">Created / Last Active</th>
                <th className="py-2.5 px-4">Scopes</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-bg/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-ink">
                    {k.name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-ink bg-bg px-2 py-0.5 rounded border border-line">
                        {k.prefix}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(k.id, k.fullKey)}
                        className="text-muted hover:text-blue cursor-pointer"
                        title="Copy full key"
                      >
                        {copiedId === k.id ? (
                          <Check className="w-3.5 h-3.5 text-green" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted font-mono text-[11px]">
                    <div>{k.createdAt}</div>
                    <div className="text-[10px] text-muted">{k.lastUsed}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-bg text-muted border border-line"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusPill
                      label={k.status}
                      variant={k.status === "ACTIVE" ? "success" : "muted"}
                      size="xs"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    {k.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => handleRevokeKey(k.id)}
                        className="text-[11px] text-red hover:underline font-semibold cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Outgoing Event Webhooks */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="w-4 h-4 text-green" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
              Event Webhooks & ERP Notifications
            </h3>
            <span className="text-[10px] font-mono text-muted bg-bg px-2 py-0.5 rounded border border-line">
              Real-time HTTP POST Triggers
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingWebhook(!isCreatingWebhook)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg hover:bg-line border border-line text-ink transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Webhook</span>
          </button>
        </div>

        {/* Inline Add Webhook Form */}
        {isCreatingWebhook && (
          <form
            onSubmit={handleCreateWebhook}
            className="p-4 bg-panel border border-line rounded-xl shadow-xs space-y-3 text-xs"
          >
            <div className="font-bold text-ink">Register Webhook Endpoint</div>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-muted block mb-1">Payload URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.your-company.com/exim-webhook"
                  value={newWhUrl}
                  onChange={(e) => setNewWhUrl(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink font-mono focus:outline-none focus:border-blue"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Sync landed cost to central SAP warehouse queue"
                  value={newWhDesc}
                  onChange={(e) => setNewWhDesc(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-bg border border-line rounded-lg text-ink focus:outline-none focus:border-blue"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingWebhook(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg hover:bg-line border border-line text-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue hover:bg-blue-dark text-white cursor-pointer"
              >
                Register Webhook
              </button>
            </div>
          </form>
        )}

        {/* Webhook Cards List */}
        <div className="space-y-3">
          {webhooks.map((w) => (
            <div
              key={w.id}
              className="p-4 bg-panel border border-line rounded-xl shadow-xs space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-ink truncate max-w-md">
                    {w.url}
                  </span>
                  <StatusPill label={w.status} variant="success" size="xs" dot />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={w.isTesting}
                    onClick={() => handleTestWebhook(w.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-bg hover:bg-line border border-line text-ink font-semibold transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-blue" />
                    <span>{w.isTesting ? "Sending..." : "Test Ping"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteWebhook(w.id)}
                    className="p-1 text-muted hover:text-red transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-muted">
                {w.description}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line text-[11px] font-mono text-muted">
                <div className="flex items-center gap-2">
                  <span>Secret:</span>
                  <span className="text-ink font-bold">{w.secret}</span>
                </div>

                <div>
                  {w.testResult ? (
                    <span className="text-green font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {w.testResult}
                    </span>
                  ) : (
                    <span>Last delivery: {w.lastDelivery}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

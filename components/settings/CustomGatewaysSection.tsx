"use client";

import React, { useState } from "react";
import { StatusPill, ProvenanceBadge } from "@/components/ui";
import {
  Globe,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Landmark,
  Ship,
  FileCheck,
  Key,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

interface GatewayConfig {
  id: string;
  name: string;
  authority: string;
  identifierLabel: string;
  identifierValue: string;
  credentialLabel: string;
  credentialValue: string;
  status: "CONNECTED" | "UNLINKED" | "CONFIGURED";
  lastVerified: string;
  isLiveSync: boolean;
  syncFrequency: string;
  badge: "LIVE" | "BYOK";
}

const initialGateways: GatewayConfig[] = [
  {
    id: "icegate",
    name: "CBIC ICEGATE 2.0 Electronic Gateway",
    authority: "Central Board of Indirect Taxes & Customs (CBIC)",
    identifierLabel: "ICEGATE Org User ID",
    identifierValue: "INT_METALS_MUM_01",
    credentialLabel: "Digital Signature Token / DSC Serial",
    credentialValue: "DSC-8849-CBIC-2026-X99",
    status: "CONNECTED",
    lastVerified: "2026-09-28 09:15 IST",
    isLiveSync: true,
    syncFrequency: "Real-Time / On Inquiry",
    badge: "LIVE",
  },
  {
    id: "dgft",
    name: "DGFT Foreign Trade Policy Portal",
    authority: "Directorate General of Foreign Trade (Ministry of Commerce)",
    identifierLabel: "Importer-Exporter Code (IEC)",
    identifierValue: "0319082214",
    credentialLabel: "DGFT Digital Token Key",
    credentialValue: "dgft-token-enc-829140",
    status: "CONNECTED",
    lastVerified: "2026-09-28 08:30 IST",
    isLiveSync: true,
    syncFrequency: "Daily 00:00 IST",
    badge: "LIVE",
  },
  {
    id: "port_edi",
    name: "Major Ports CFS & Terminal Handling Gateway",
    authority: "TAMP / Nhava Sheva (JNPT) & Mundra EDI",
    identifierLabel: "Port Terminal Customer Code",
    identifierValue: "JNPT-CFS-MET-441",
    credentialLabel: "Carrier & Port EDI API Key",
    credentialValue: "edi_live_sec_77392_port",
    status: "CONFIGURED",
    lastVerified: "2026-09-27 18:45 IST",
    isLiveSync: false,
    syncFrequency: "Manual / Contract Basis",
    badge: "BYOK",
  },
  {
    id: "rbi_forex",
    name: "Statutory Customs Exchange Rate Gateway",
    authority: "CBIC Gazette & Reserve Bank of India",
    identifierLabel: "Gazette Notification Feed ID",
    identifierValue: "CBIC-NOTIF-FX-2026",
    credentialLabel: "Public Feed API Secret",
    credentialValue: "public-cbic-statutory-feed",
    status: "CONNECTED",
    lastVerified: "2026-09-28 06:00 IST",
    isLiveSync: true,
    syncFrequency: "Fortnightly CBIC Gazette",
    badge: "LIVE",
  },
];

export function CustomGatewaysSection() {
  const [gateways, setGateways] = useState<GatewayConfig[]>(initialGateways);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleShow = (id: string) => {
    setShowKeyMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleSync = (id: string) => {
    setGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isLiveSync: !g.isLiveSync } : g))
    );
  };

  const handleVerify = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      setVerifyingId(null);
      setGateways((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                status: "CONNECTED",
                lastVerified: "Just now",
              }
            : g
        )
      );
      const gw = gateways.find((g) => g.id === id);
      showNotice(`${gw?.name} handshake verified successfully.`);
    }, 900);
  };

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
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

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 gap-4">
        {gateways.map((g) => {
          const isShow = showKeyMap[g.id];
          const isVerifying = verifyingId === g.id;

          return (
            <div
              key={g.id}
              className="p-5 bg-panel border border-line rounded-xl shadow-xs space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-dim text-blue flex items-center justify-center shrink-0">
                    {g.id === "icegate" && <Landmark className="w-4 h-4" />}
                    {g.id === "dgft" && <FileCheck className="w-4 h-4" />}
                    {g.id === "port_edi" && <Ship className="w-4 h-4" />}
                    {g.id === "rbi_forex" && <Globe className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-ink">{g.name}</h3>
                      <StatusPill
                        label={g.status}
                        variant={g.status === "CONNECTED" ? "success" : "muted"}
                        size="xs"
                        dot
                      />
                      <ProvenanceBadge type={g.badge} source={g.authority} compact />
                    </div>
                    <span className="text-xs text-muted block">
                      Authority: {g.authority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => handleVerify(g.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg hover:bg-line border border-line text-ink transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isVerifying ? "animate-spin text-blue" : ""
                      }`}
                    />
                    <span>{isVerifying ? "Verifying..." : "Verify Token"}</span>
                  </button>
                </div>
              </div>

              {/* Credential & Config Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 bg-bg rounded-lg border border-line text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted uppercase block font-sans">
                    {g.identifierLabel}
                  </span>
                  <span className="font-bold text-ink truncate block mt-0.5">
                    {g.identifierValue}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-muted uppercase block font-sans">
                    {g.credentialLabel}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-ink font-semibold truncate block">
                      {isShow ? g.credentialValue : "••••••••••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleShow(g.id)}
                      className="text-muted hover:text-ink cursor-pointer"
                    >
                      {isShow ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted uppercase block font-sans">
                    Sync Schedule
                  </span>
                  <span className="text-muted block mt-0.5">
                    {g.syncFrequency}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-muted uppercase block font-sans">
                    Last Handshake
                  </span>
                  <span className="text-green font-bold block mt-0.5">
                    {g.lastVerified}
                  </span>
                </div>
              </div>

              {/* Bottom Sync Toggle */}
              <div className="flex items-center justify-between text-xs text-muted pt-1">
                <span>
                  Automatic background synchronization for tariff schedules and gazette rates.
                </span>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={g.isLiveSync}
                    onChange={() => handleToggleSync(g.id)}
                    className="w-4 h-4 rounded border-line text-blue focus:ring-0 cursor-pointer"
                  />
                  <span className="text-ink font-medium">Enable Live Sync</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

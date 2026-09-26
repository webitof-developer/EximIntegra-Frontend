"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card, ProvenanceBadge, StatusPill } from "@/components/ui";
import { Layers, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Static Content Area Shell matching Phase 0 requirements */}
        <div className="border-2 border-dashed border-line rounded-xl p-12 text-center bg-panel/60">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-dim text-blue flex items-center justify-center mx-auto shadow-xs">
              <Layers className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-lg font-bold text-ink">
                  EximIntegra Application Shell
                </h2>
                <StatusPill label="PHASE 0" variant="success" dot />
              </div>
              <p className="text-xs text-muted leading-relaxed">
                The static layout shell is loaded with the fixed 250px navy sidebar,
                responsive topbar, Redux store, and design tokens matching the prototype.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/dev/components"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue text-white text-xs font-semibold hover:bg-blue-dark transition-all shadow-xs"
              >
                <span>Explore /dev/components Showcase</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* System Architecture and State Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card
            title="Design System (§2)"
            subtitle="Tailwind theme tokens & Google Fonts loaded"
          >
            <div className="text-xs text-muted space-y-2">
              <p>
                Colors: <span className="font-mono text-ink">navy, bg, panel, blue, green, amber, red</span>
              </p>
              <p>
                Fonts: <span className="font-mono text-ink">Inter</span> (UI) &{" "}
                <span className="font-mono text-ink">IBM Plex Mono</span> (Tariffs)
              </p>
            </div>
          </Card>

          <Card
            title="UI Library (§2.4)"
            subtitle="Core primitives built in isolation"
          >
            <div className="text-xs text-muted space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <StatusPill label="Card" variant="neutral" />
                <StatusPill label="Tabs" variant="neutral" />
                <StatusPill label="IconTile" variant="neutral" />
                <StatusPill label="StatusPill" variant="neutral" />
                <StatusPill label="StepBadge" variant="neutral" />
                <StatusPill label="WidgetTile" variant="neutral" />
              </div>
              <p className="pt-1 text-[11px]">
                Accessible <span className="font-semibold text-ink">ProvenanceBadge</span> with LIVE/ILLUSTRATIVE/BYOK semantics.
              </p>
            </div>
          </Card>

          <Card
            title="Redux Slices (§3)"
            subtitle="Cross-page client state initialized"
          >
            <div className="text-xs text-muted space-y-2">
              <p>
                <code className="font-mono text-blue bg-blue-dim px-1.5 py-0.5 rounded">contextSlice</code>: Material & HS code state.
              </p>
              <p>
                <code className="font-mono text-ink bg-line px-1.5 py-0.5 rounded">uiSlice</code>: Active navigation & shell states.
              </p>
              <p>
                <code className="font-mono text-muted bg-line px-1.5 py-0.5 rounded">api.ts</code>: RTK Query base empty API ready for endpoints.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

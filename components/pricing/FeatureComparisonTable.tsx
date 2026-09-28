"use client";

import React, { useState } from "react";
import { Check, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { TableContainer, Table } from "@/components/ui/Table";

interface FeatureRow {
  name: string;
  starter: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

interface FeatureCategory {
  title: string;
  rows: FeatureRow[];
}

const comparisonData: FeatureCategory[] = [
  {
    title: "1. Commodity Classification Engine",
    rows: [
      {
        name: "Sequential GIR 1 to 6 Legal Interpretation",
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Single Material Lookup",
        starter: "100 / mo",
        pro: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Bulk CSV Batch Manifest Processor",
        starter: false,
        pro: "Up to 500 items/file",
        enterprise: "Unlimited Batch",
      },
      {
        name: "Candidate Confidence Scoring & Alternate HS codes",
        starter: true,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    title: "2. Customs Duties & Valuation",
    rows: [
      {
        name: "Statutory BCD, SWS (10%), IGST (18%) & AIDC",
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "CBIC Official Gazette Daily FX Synchronization",
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Anti-Dumping Duty (ADD) Benchmark Indicators",
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Preferential FTA Rates (CEPA, ECTA, ASEAN)",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Country-of-Origin Sourcing Arbitrage Matrix",
        starter: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    title: "3. Multimodal Logistics & Smelter Yield",
    rows: [
      {
        name: "Port Scale of Rates (JNPT, Mundra, Chennai)",
        starter: "Standard",
        pro: "Full TAMP Schedule",
        enterprise: "Full TAMP + Custom SOR",
      },
      {
        name: "Container CFS & Demurrage Modeling",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Furnace Metal Recovery Yield Economics",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Effective Cost per Molten MT Calculation",
        starter: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    title: "4. AI Copilot & Developer Integrations",
    rows: [
      {
        name: "Akshara AI — Conversational Copilot",
        starter: false,
        pro: false,
        enterprise: "Unlimited Access",
      },
      {
        name: "Transparent Tool-Call Execution Audit Logs",
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "BYOK Custom LLM Keys (Claude, OpenAI, Gemini)",
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "Custom Carrier Freight & Yield Contract Overrides",
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "Developer Platform API Keys & Webhooks (SAP/ERP)",
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    title: "5. Workspaces, Governance & Security",
    rows: [
      {
        name: "Included Team Workspace Seats",
        starter: "1 Seat",
        pro: "5 Seats",
        enterprise: "Unlimited Seats",
      },
      {
        name: "Role-Based Access Control (RBAC)",
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "100% Deterministic Reproducibility Stamp",
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Customer Support & SLA",
        starter: "Email Support",
        pro: "Priority Chat & Email",
        enterprise: "Dedicated Manager & 99.9% SLA",
      },
    ],
  },
];

export function FeatureComparisonTable() {
  const [isExpanded, setIsExpanded] = useState(true);

  const renderValue = (val: boolean | string) => {
    if (typeof val === "boolean") {
      return val ? (
        <Check className="w-4 h-4 text-blue mx-auto stroke-[2.5]" />
      ) : (
        <Minus className="w-4 h-4 text-muted/40 mx-auto" />
      );
    }
    return <span className="font-semibold text-xs text-ink">{val}</span>;
  };

  return (
    <div className="space-y-6 pt-10">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-ink tracking-tight">
          Comprehensive Feature Matrix
        </h3>
        <p className="text-xs text-muted">
          Compare engine capabilities and developer limits across all three tiers.
        </p>
      </div>

      <TableContainer>
        <Table>
          <thead>
            <tr className="border-b border-line bg-bg/60">
              <th className="py-4 px-5 text-sm font-bold text-ink w-2/5">
                Features & Capabilities
              </th>
              <th className="py-4 px-4 text-center w-1/5">
                <span className="font-bold text-ink block text-sm">Starter</span>
                <span className="text-[10px] font-mono text-muted">₹7,999/mo</span>
              </th>
              <th className="py-4 px-4 text-center w-1/5 bg-blue-dim/40 border-x border-blue/20">
                <span className="font-bold text-blue block text-sm">
                  Professional
                </span>
                <span className="text-[10px] font-mono text-blue font-semibold">
                  ₹24,999/mo
                </span>
              </th>
              <th className="py-4 px-4 text-center w-1/5">
                <span className="font-bold text-ink block text-sm">
                  Enterprise
                </span>
                <span className="text-[10px] font-mono text-muted">₹74,999/mo</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {comparisonData.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                {/* Category Header */}
                <tr className="bg-bg/80 font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
                  <td colSpan={4} className="py-2.5 px-5 text-blue">
                    {cat.title}
                  </td>
                </tr>

                {/* Rows */}
                {cat.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-bg/40 transition-colors">
                    <td className="py-3 px-5 font-medium text-ink">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {renderValue(row.starter)}
                    </td>
                    <td className="py-3 px-4 text-center bg-blue-dim/20 border-x border-blue/10">
                      {renderValue(row.pro)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {renderValue(row.enterprise)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
}

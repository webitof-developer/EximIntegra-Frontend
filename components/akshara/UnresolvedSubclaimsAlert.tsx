import React from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface UnresolvedSubclaimsAlertProps {
  subclaims: string[];
}

export function UnresolvedSubclaimsAlert({
  subclaims,
}: UnresolvedSubclaimsAlertProps) {
  if (!subclaims || subclaims.length === 0) return null;

  return (
    <div className="mt-3 p-3.5 bg-amber-dim/70 border-2 border-amber/50 rounded-xl space-y-2 text-xs text-amber-dark">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber shrink-0 stroke-[2.5]" />
        <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-amber-dark">
          Unresolved Subclaims & Statutory Disclaimers
        </span>
      </div>

      <p className="text-[11px] text-ink leading-relaxed">
        The following claims could not be resolved against live statutory
        databases and require mandatory independent verification:
      </p>

      <ul className="space-y-1 list-disc list-inside text-[11px] font-medium text-amber-dark pl-1">
        {subclaims.map((claim, idx) => (
          <li key={idx} className="leading-relaxed">
            {claim}
          </li>
        ))}
      </ul>
    </div>
  );
}

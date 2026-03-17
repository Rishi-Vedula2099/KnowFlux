"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface ReasoningStep {
  label: string;
  detail: string;
}

interface ReasoningTraceProps {
  steps: ReasoningStep[];
  defaultOpen?: boolean;
}

export default function ReasoningTrace({ steps, defaultOpen = true }: ReasoningTraceProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-2" style={{ marginBottom: open ? 0 : "0.25rem" }}>
      <div 
        className="ol-reason-toggle inline-flex items-center gap-[0.5rem] mb-[0.6rem] cursor-pointer text-[var(--t3)] text-[0.68rem] font-[var(--mono)] tracking-[0.07em] transition-colors duration-200 hover:text-[var(--gold-d)] select-none" 
        onClick={() => setOpen((p) => !p)}
      >
        <div className="ol-pulse-dot w-[5px] h-[5px] bg-[var(--gold)] shadow-[0_0_5px_rgba(212,168,67,0.6)] animate-[ol-pdot_1.8s_ease-in-out_infinite]" />
        <span className="ml-[2px]">Intelligence Trace</span>
        <span className={cn(
          "ol-chevron text-[0.6rem] transition-transform duration-200 text-[var(--t4)]",
          open && "rotate-180"
        )}>▼</span>
      </div>
      {open && (
        <div className="ol-trace-body p-[0.75rem_0.875rem] bg-[rgba(212,168,67,0.03)] border border-[rgba(212,168,67,0.15)] flex flex-col animate-[ol-fade-up_0.2s_ease] mb-[0.75rem]">
          {steps.map((s, i) => (
            <div key={i} className="ol-trace-step flex items-start gap-[0.625rem] relative group pb-[0.75rem] last:pb-0">
              {i !== steps.length - 1 && (
                <div className="absolute left-[6px] top-[14px] w-[1px] h-full bg-[linear-gradient(to_bottom,rgba(212,168,67,0.3),transparent)]" />
              )}
              <div className="ol-trace-node w-[13px] h-[13px] flex-shrink-0 mt-[2px] border border-[var(--gold)] bg-[rgba(212,168,67,0.1)] shadow-[0_0_5px_rgba(212,168,67,0.2)]" />
              <div>
                <div className="ol-trace-label text-[0.68rem] font-medium font-[var(--mono)] text-[var(--gold)] tracking-[0.06em]">{s.label}</div>
                <div className="ol-trace-detail text-[0.63rem] text-[var(--t4)] mt-[1px] font-[var(--mono)] tracking-[0.04em]">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

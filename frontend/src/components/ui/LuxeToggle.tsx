"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface LuxeToggleProps {
  label: string;
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
}

export default function LuxeToggle({ label, defaultOn = false, onChange }: LuxeToggleProps) {
  const [on, setOn] = useState(defaultOn);

  const handleToggle = () => {
    const newState = !on;
    setOn(newState);
    if (onChange) onChange(newState);
  };

  return (
    <div className="ol-toggle-wrap flex items-center gap-[0.55rem]">
      <div
        className="ol-neon-toggle relative w-[38px] h-[20px] cursor-pointer flex-shrink-0"
        onClick={handleToggle}
        role="switch"
        aria-checked={on}
      >
        <div className={cn(
          "ol-neon-track absolute inset-0 transition-all duration-[0.28s] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.55),inset_-1px_-1px_2px_rgba(212,168,67,0.02)] border border-[rgba(212,168,67,0.1)] bg-[var(--surface2)]",
          on && "bg-[linear-gradient(135deg,#7a5a18,var(--gold))] border-[var(--gold)] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.25),0_0_10px_rgba(212,168,67,0.28)]"
        )}>
          <div className={cn(
            "ol-neon-thumb absolute top-[3px] left-[3px] w-[14px] h-[14px] bg-white transition-transform duration-[0.26s] cubic-bezier(0.4,0,0.2,1) shadow-[0_1px_4px_rgba(0,0,0,0.5)]",
            on && "translate-x-[18px]"
          )} />
        </div>
      </div>
      <span className="ol-neon-label text-[0.68rem] text-[var(--t3)] font-[var(--mono)] tracking-[0.06em]">{label}</span>
    </div>
  );
}

"use client";

import React, { useState, MouseEvent as RME } from "react";
import { cn } from "@/lib/utils";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface LuxeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function LuxeButton({ children, onClick, className, ...props }: LuxeButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: RME<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((p) => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 700);
    if (onClick) onClick(e);
  };

  return (
    <div className="ol-ask-wrapper relative p-[2px] flex-shrink-0 bg-[linear-gradient(135deg,var(--gold-d),var(--gold),var(--gold-l),var(--gold),var(--gold-d))] animate-[ol-glow_3s_ease-in-out_infinite] shadow-[0_0_14px_rgba(212,168,67,0.2),0_4px_12px_rgba(0,0,0,0.5)]">
      <button 
        className={cn(
          "ol-ask-btn relative p-[0.6rem_1.25rem] bg-[#12100c] border-none cursor-pointer text-[var(--gold)] font-[var(--ui)] text-[0.78rem] font-medium tracking-[0.18em] uppercase flex items-center gap-[0.5rem] whitespace-nowrap overflow-hidden transition-all duration-200 active:translate-y-[1px] shadow-[inset_2px_2px_6px_rgba(255,255,255,0.03),inset_-2px_-2px_6px_rgba(0,0,0,0.55)] hover:bg-[#1a150a]",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ol-ripple absolute rounded-full bg-[rgba(212,168,67,0.22)] pointer-events-none scale-0 animate-[ol-rip_0.6s_linear_forwards]"
            style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }}
          />
        ))}
        {children}
      </button>
    </div>
  );
}

"use client";

import React from "react";

export default function FluxRing() {
  return (
    <div className="ol-flux-wrap flex items-center gap-[0.6rem] p-[0.5rem_0.875rem] bg-[var(--gold-f)] border border-[var(--edge2)] self-start">
      <div className="ol-flux-ring relative w-[22px] h-[22px] flex-shrink-0">
        <div className="ol-fr-layer ol-fr-1 absolute inset-0 rounded-full border-[1.5px] border-t-[var(--gold)] border-r-transparent border-b-transparent border-l-transparent animate-[ol-fr-cw_1.4s_linear_infinite]" />
        <div className="ol-fr-layer ol-fr-2 absolute inset-[4px] rounded-full border-[1.5px] border-r-[var(--crimson)] border-t-transparent border-b-transparent border-l-transparent animate-[ol-fr-ccw_1s_linear_infinite] opacity-80" />
        <div className="ol-fr-layer ol-fr-3 absolute inset-[8px] rounded-full border-[1.5px] border-b-[var(--gold-l)] border-t-transparent border-r-transparent border-l-transparent animate-[ol-fr-cw_0.65s_linear_infinite] opacity-60" />
      </div>
      <span className="ol-flux-label text-[0.7rem] color-[var(--t3)] font-[var(--mono)] tracking-[0.06em] animate-[ol-flux-blink_1.5s_ease-in-out_infinite]">
        Consulting the archives…
      </span>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Upload, 
  BarChart3, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard 
} from "lucide-react";
import LuxeToggle from "@/components/ui/LuxeToggle";

const NAV_ITEMS = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    icon: (props: any) => <LayoutDashboard {...props} />,
  },
  {
    id: "chat",
    href: "/chat",
    label: "Oracle Chat",
    icon: (props: any) => <MessageSquare {...props} />,
  },
  {
    id: "upload",
    href: "/upload",
    label: "Sources",
    icon: (props: any) => <Upload {...props} />,
  },
  {
    id: "analytics",
    href: "/analytics",
    label: "Analytics",
    icon: (props: any) => <BarChart3 {...props} />,
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <nav className={cn(
      "ol-sidebar z-20 flex flex-shrink-0 flex-col items-center gap-[0.2rem] bg-[rgba(8,8,10,0.96)] border-r border-[var(--edge2)] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] py-[1.1rem]",
      expanded ? "w-[240px]" : "w-[64px]"
    )}>
      <div className="ol-logo flex-shrink-0 w-[38px] h-[38px] border border-[var(--gold)] flex items-center justify-center font-[var(--serif)] italic font-medium text-[20px] text-[var(--gold)] mb-[1rem] shadow-[0_0_18px_rgba(212,168,67,0.16),inset_0_0_12px_rgba(212,168,67,0.04)]">
        Ω
      </div>

      <div className="ol-nav flex-1 flex flex-col w-full gap-[0.1rem] px-[0.5rem]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "ol-nav-item flex items-center gap-[0.7rem] p-[0.65rem] cursor-pointer transition-all duration-200 relative whitespace-nowrap overflow-hidden border border-transparent",
                isActive ? "act bg-[var(--gold-f2)] text-[var(--gold)] border-[var(--edge2)]" : "text-[var(--t4)] hover:bg-[var(--gold-f)] hover:text-[var(--t3)] hover:border-[var(--edge)]"
              )}
              title={!expanded ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-[18%] bottom-[18%] w-[2px] bg-[linear-gradient(to_bottom,var(--gold),var(--gold-l))] shadow-[0_0_8px_rgba(212,168,67,0.45)]" />
              )}
              <span className="ol-nav-icon w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              </span>
              <span className={cn(
                "ol-nav-label text-[0.78rem] font-normal tracking-[0.08em] uppercase transition-opacity duration-150 delay-70",
                expanded ? "opacity-100" : "opacity-0"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="ol-divider w-[calc(100%-1rem)] h-[1px] bg-[var(--edge)] m-[0.4rem_0.5rem] flex-shrink-0" />

      {/* Neon toggles stacked */}
      <div className="ol-sb-toggles flex flex-col items-center gap-[0.75rem] py-[0.5rem] w-full">
        <div className="ol-sb-tog-item flex flex-col items-center gap-[3px]">
          <LuxeToggle label="" defaultOn />
          <span className="ol-neon-label text-[0.68rem] text-[var(--t3)] font-[var(--mono)] tracking-[0.06em]">RAG</span>
        </div>
        {expanded && (
          <>
            <div className="ol-sb-tog-item flex flex-col items-center gap-[3px]">
              <LuxeToggle label="" defaultOn />
              <span className="ol-neon-label text-[0.68rem] text-[var(--t3)] font-[var(--mono)] tracking-[0.06em]">Rank</span>
            </div>
            <div className="ol-sb-tog-item flex flex-col items-center gap-[3px]">
              <LuxeToggle label="" />
              <span className="ol-neon-label text-[0.68rem] text-[var(--t3)] font-[var(--mono)] tracking-[0.06em]">Stream</span>
            </div>
          </>
        )}
      </div>

      <div className="ol-divider w-[calc(100%-1rem)] h-[1px] bg-[var(--edge)] m-[0.4rem_0.5rem] flex-shrink-0" />

      <div className="px-[0.5rem] w-full">
        <Link
          href="/settings"
          className={cn(
            "ol-nav-item flex items-center gap-[0.7rem] p-[0.65rem] cursor-pointer transition-all duration-200 relative whitespace-nowrap overflow-hidden border border-transparent text-[var(--t4)] hover:bg-[var(--gold-f)] hover:text-[var(--t3)] hover:border-[var(--edge)]",
            pathname === "/settings" && "act bg-[var(--gold-f2)] text-[var(--gold)] border-[var(--edge2)]"
          )}
          title={!expanded ? "Settings" : undefined}
        >
          <span className="ol-nav-icon w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
            <Settings size={18} strokeWidth={pathname === "/settings" ? 2 : 1.5} />
          </span>
          <span className={cn(
            "ol-nav-label text-[0.78rem] font-normal tracking-[0.08em] uppercase transition-opacity duration-150 delay-70",
            expanded ? "opacity-100" : "opacity-0"
          )}>
            Settings
          </span>
        </Link>
      </div>

      <div
        className="ol-collapse-btn mt-[0.5rem] w-[30px] h-[30px] bg-[rgba(255,255,255,0.02)] border border-[var(--edge)] flex items-center justify-center cursor-pointer text-[var(--t4)] transition-all duration-200 flex-shrink-0 hover:text-[var(--gold-d)] hover:border-[var(--edge2)]"
        onClick={() => setExpanded((p) => !p)}
        title={expanded ? "Collapse" : "Expand"}
      >
        {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </div>
    </nav>
  );
}

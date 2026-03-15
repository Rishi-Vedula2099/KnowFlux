"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MessageSquare, Upload, BarChart3, Settings, BrainCircuit } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const routes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/chat", label: "Ask KnowFlux", icon: MessageSquare },
    { href: "/upload", label: "Knowledge Base", icon: Upload },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="w-64 border-r border-border/40 bg-card/50 backdrop-blur-xl flex flex-col h-full hidden md:flex">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 group-hover:border-primary/50 transition-colors">
            <BrainCircuit className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors" />
          </div>
          <span className="font-bold text-xl tracking-tight text-glow">KnowFlux</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-4 space-y-2 relative">
        <div className="absolute top-0 right-4 w-1/2 h-1/2 bg-primary/5 blur-[80px] pointer-events-none" />
        {routes.map((route) => {
          const isActive = pathname === route.href;
          const Icon = route.icon;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
              )}
              <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span>{route.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/40">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full text-left">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}

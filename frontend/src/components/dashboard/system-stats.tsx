"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileText, Activity, Zap } from "lucide-react";

interface StatsProps {
  stats: {
    total_documents: number;
    total_chunks: number;
    total_queries: number;
    avg_confidence: number;
    avg_retrieval_latency_ms: number;
  };
}

export function SystemStats({ stats }: StatsProps) {
  const items = [
    {
      title: "Documents",
      value: stats.total_documents,
      icon: FileText,
      description: `${stats.total_chunks} indexed chunks`,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Queries",
      value: stats.total_queries,
      icon: Activity,
      description: "Processed through RAG",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Avg Confidence",
      value: `${(stats.avg_confidence * 100).toFixed(1)}%`,
      icon: Database,
      description: "Answer grounding score",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Retrieval Latency",
      value: `${stats.avg_retrieval_latency_ms.toFixed(0)}ms`,
      icon: Zap,
      description: "Average system response",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <Card key={i} className="glass-panel overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground/90">
              {item.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

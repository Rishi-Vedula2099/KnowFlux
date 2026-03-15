"use client";

import { useEffect, useState } from "react";
import { KnowFluxAPI } from "@/services/api";
import { SystemStats } from "@/components/dashboard/system-stats";
import { QueryTypesChart } from "@/components/dashboard/query-types-chart";
import { BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await KnowFluxAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Knowledge Base Overview</h1>
            <p className="text-muted-foreground text-lg">
              Manage your Enterprise Knowledge Intelligence Platform.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats}
            disabled={loading}
            className="glass-panel"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading && !stats ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-muted-foreground">Gathering intelligence...</p>
            </div>
          </div>
        ) : stats ? (
          <>
            <SystemStats stats={stats as any} />
            
            <div className="grid md:grid-cols-2 gap-4">
              <QueryTypesChart distribution={(stats.query_distribution as Record<string, number>) || {}} />
              
              <div className="glass-panel rounded-xl p-6 border border-border/40">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Recent Intel Requests
                </h3>
                
                <div className="space-y-4">
                  {Array.isArray(stats.recent_queries) && stats.recent_queries.length > 0 ? (
                    stats.recent_queries.slice(0, 5).map((q: any, i: number) => (
                      <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/50 border border-white/5">
                        <p className="text-sm font-medium line-clamp-1">{q.query}</p>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span className="capitalize px-2 py-0.5 rounded-full bg-background border border-border">
                            {String(q.type).replace('_', ' ')}
                          </span>
                          <span>{Number(q.confidence * 100).toFixed(0)}% confidence</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      No queries have been processed yet. Ask KnowFlux a question!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-red-400 glass-panel rounded-xl">
            Failed to load system statistics. Is the backend running?
          </div>
        )}
      </div>
    </div>
  );
}

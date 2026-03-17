"use client";

import { useEffect, useState } from "react";
import { KnowFluxAPI } from "@/services/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { RefreshCw, Activity, Zap, CheckCircle2, TrendingUp, Info } from "lucide-react";
import LuxeButton from "@/components/ui/LuxeButton";

export default function AnalyticsPage() {
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

  const generateMockTimeSeries = () => {
    const data = [];
    const baseLatency = stats?.avg_retrieval_latency_ms || 800;
    const baseConf = stats?.avg_confidence || 0.85;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        latency: Math.max(200, baseLatency + (Math.random() * 400 - 200)),
        confidence: Math.min(100, Math.max(50, (baseConf * 100) + (Math.random() * 10 - 5))),
        queries: Math.floor(Math.random() * 50) + 10,
      });
    }
    return data;
  };

  const chartData = stats ? generateMockTimeSeries() : [];

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 gap-4 relative overflow-hidden">
      
      {/* Header */}
      <div className="ol-chat-header flex items-center gap-3 shrink-0">
        <span className="ol-chat-title font-[var(--serif)] italic font-light text-2xl tracking-wide text-[var(--gold-l)]">
          System Analytics
        </span>
        <span className="ol-chat-badge text-[0.65rem] p-[0.18rem_0.7rem] border border-[var(--edge3)] text-[var(--gold)] bg-[var(--gold-f)] font-[var(--mono)] tracking-[0.07em]">
          Pipeline Insight
        </span>
        <div className="ml-auto flex items-center gap-[0.75rem]">
          <LuxeButton onClick={fetchStats} disabled={loading} className="gap-2">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Rescan Stats
          </LuxeButton>
        </div>
      </div>

      {/* Ornamental separator */}
      <div className="ol-ornament flex items-center gap-2 shrink-0">
        <div className="ol-orn-line flex-1 h-[1px] bg-[linear-gradient(to_right,transparent,var(--edge2))]" />
        <div className="ol-orn-diamond w-[5px] h-[5px] bg-[var(--gold)] rotate-45 shrink-0 shadow-[0_0_4px_rgba(212,168,67,0.5)]" />
        <div className="ol-orn-line-rev flex-1 h-[1px] bg-[linear-gradient(to_left,transparent,var(--edge2))]" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
        <div className="max-w-7xl mx-auto space-y-6 pb-8">
          
          {loading && !stats ? (
            <div className="h-64 flex flex-col items-center justify-center opacity-40">
               <span className="text-4xl text-[var(--gold)] animate-pulse mb-4">Ω</span>
               <p className="text-[0.65rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-[0.2em]">Consulting the archives…</p>
            </div>
          ) : stats ? (
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Summary Metrics */}
              <div className="ol-stats-card p-5 bg-[rgba(15,14,10,0.8)] border border-[rgba(212,168,67,0.15)] shadow-[inset_2px_2px_10px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--gold-f)] rounded-bl-full flex items-start justify-end p-3 opacity-20 transition-opacity group-hover:opacity-40">
                    <CheckCircle2 className="text-[var(--gold)]" size={18} />
                 </div>
                 <p className="text-[0.6rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-[0.15em] mb-1">Hallucination Defense</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-[var(--serif)] text-[var(--gold-l)]">{((stats.avg_confidence || 0) * 100).toFixed(1)}%</span>
                    <TrendingUp size={12} className="text-[var(--gold)] opacity-60" />
                 </div>
                 <p className="text-[0.65rem] text-[var(--t4)] font-[var(--ui)] italic mt-2">Grounding score across {stats.total_queries} enquiries</p>
              </div>

              <div className="ol-stats-card p-5 bg-[rgba(15,14,10,0.8)] border border-[rgba(212,168,67,0.15)] shadow-[inset_2px_2px_10px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-[rgba(212,168,67,0.05)] rounded-bl-full flex items-start justify-end p-3 opacity-20 transition-opacity group-hover:opacity-40">
                    <Zap className="text-[var(--gold)]" size={18} />
                 </div>
                 <p className="text-[0.6rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-[0.15em] mb-1">Retrieval Latency</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-[var(--serif)] text-[var(--gold-l)]">{(stats.avg_retrieval_latency_ms || 0).toFixed(0)}<em className="text-lg not-italic opacity-40">ms</em></span>
                 </div>
                 <p className="text-[0.65rem] text-[var(--t4)] font-[var(--ui)] italic mt-2">Average End-to-End response time</p>
              </div>

              <div className="ol-stats-card p-5 bg-[rgba(15,14,10,0.8)] border border-[rgba(212,168,67,0.15)] shadow-[inset_2px_2px_10px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-[rgba(212,168,67,0.05)] rounded-bl-full flex items-start justify-end p-3 opacity-20 transition-opacity group-hover:opacity-40">
                    <Activity className="text-[var(--gold)]" size={18} />
                 </div>
                 <p className="text-[0.6rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-[0.15em] mb-1">Knowledge Throughput</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-[var(--serif)] text-[var(--gold-l)]">{stats.total_queries || 0}</span>
                    <span className="text-[0.65rem] text-[var(--t4)] font-[var(--mono)] uppercase opacity-60">Queries</span>
                 </div>
                 <p className="text-[0.65rem] text-[var(--t4)] font-[var(--ui)] italic mt-2">Processed by the Adaptive Engine</p>
              </div>

              {/* Latency Chart */}
              <div className="ol-glass lg:col-span-2 p-6 flex flex-col gap-6 shadow-[0_0_40px_rgba(0,0,0,0.4)] border-[var(--edge2)]">
                <div className="flex items-center justify-between border-b border-[var(--edge)] pb-4">
                  <div>
                    <h3 className="text-[var(--gold-l)] font-[var(--serif)] text-lg italic tracking-wide">Retrieval Latency Cycle</h3>
                    <p className="text-[0.62rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-widest mt-1">Rolling 7-Day Performance Insight</p>
                  </div>
                  <Info size={14} className="text-[var(--t4)] opacity-30" />
                </div>
                <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,67,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="var(--t4)" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      />
                      <YAxis 
                        stroke="var(--t4)" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}ms`}
                        style={{ fontFamily: 'var(--mono)' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: "rgba(18, 16, 12, 0.95)",
                          borderColor: "var(--edge3)",
                          borderRadius: "0",
                          color: "var(--t1)",
                          fontFamily: "var(--ui)",
                          boxShadow: "0 0 20px rgba(0,0,0,0.5)"
                        }}
                        itemStyle={{ color: "var(--gold)" }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="latency" 
                        stroke="var(--gold)" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorLatency)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Confidence Chart */}
              <div className="ol-glass lg:col-span-1 p-6 flex flex-col gap-6 shadow-[0_0_40px_rgba(0,0,0,0.4)] border-[var(--edge2)]">
                <div className="flex items-center justify-between border-b border-[var(--edge)] pb-4">
                  <div>
                    <h3 className="text-[var(--gold-l)] font-[var(--serif)] text-lg italic tracking-wide">Truth Alignment</h3>
                    <p className="text-[0.62rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-widest mt-1">Grounding Confidence</p>
                  </div>
                </div>
                <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="var(--t4)" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase' }}
                      />
                      <YAxis 
                        stroke="var(--t4)" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        style={{ fontFamily: 'var(--mono)' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: "rgba(18, 16, 12, 0.95)",
                          borderColor: "var(--edge3)",
                          borderRadius: "0",
                          boxShadow: "0 0 20px rgba(0,0,0,0.5)"
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="confidence" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorConf)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

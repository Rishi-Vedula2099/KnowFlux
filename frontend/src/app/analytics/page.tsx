"use client";

import { useEffect, useState } from "react";
import { KnowFluxAPI } from "@/services/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Activity, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Mock time-series data based on current stats for demonstration
  // In a full production system, this would come from the backend time-series DB
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
    <div className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              System Analytics
            </h1>
            <p className="text-muted-foreground text-lg">
              Monitor RAG pipeline performance and hallucination rates.
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
            Refresh Data
          </Button>
        </div>

        {loading && !stats ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          </div>
        ) : stats ? (
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Top Cards */}
            <div className="lg:col-span-2 grid sm:grid-cols-3 gap-6">
              <Card className="glass-panel border-green-500/20 bg-green-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Hallucination Defense
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {((stats.avg_confidence || 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average answer grounding score across {stats.total_queries} queries
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-panel border-amber-500/20 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-amber-500 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    System Latency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {(stats.avg_retrieval_latency_ms || 0).toFixed(0)}ms
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average End-to-End Response Time
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-panel border-blue-500/20 bg-blue-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-500 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Query Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.total_queries || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Processed by Adaptive Router
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Card className="glass-panel lg:col-span-2 border-white/5">
              <CardHeader>
                <CardTitle>Retrieval Latency Trend (7 Days)</CardTitle>
                <CardDescription>Vector search and generation latency in milliseconds</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}ms`}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="latency" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLatency)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="glass-panel lg:col-span-2 border-white/5">
              <CardHeader>
                <CardTitle>Confidence Score Trend (7 Days)</CardTitle>
                <CardDescription>System confidence in generated responses based on vector grounding</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorConf)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        ) : null}
      </div>
    </div>
  );
}

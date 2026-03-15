"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartProps {
  distribution: Record<string, number>;
}

const COLORS = {
  simple: "#3b82f6",      // Blue
  retrieval: "#10b981",   // Green
  multi_hop: "#8b5cf6",   // Purple
  web_search: "#f59e0b",  // Amber
};

const LABELS = {
  simple: "Direct LLM",
  retrieval: "Vector Search",
  multi_hop: "Multi-Hop Reasoning",
  web_search: "Web Search",
};

export function QueryTypesChart({ distribution }: ChartProps) {
  const data = Object.entries(distribution)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: LABELS[key as keyof typeof LABELS] || key,
      value,
      color: COLORS[key as keyof typeof COLORS] || "#64748b",
    }));

  if (data.length === 0) {
    return (
      <Card className="glass-panel h-full flex flex-col justify-center items-center py-12">
        <p className="text-muted-foreground">No query data available yet</p>
      </Card>
    );
  }

  return (
    <Card className="glass-panel h-full">
      <CardHeader>
        <CardTitle>Query Routing Distribution</CardTitle>
        <CardDescription>How the adaptive system handles requests</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: "8px",
                backdropFilter: "blur(10px)",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

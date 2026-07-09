import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface AttackDistributionProps {
  data: { type: string; count: number }[];
  isLoading?: boolean;
}

const CHART_COLORS: Record<string, string> = {
  "Brute Force Attack": "#ef4444",
  "Password Spraying Attack": "#f97316",
  "Privilege Escalation": "#eab308",
  "Data Exfiltration": "#3b82f6",
};

const FALLBACK_COLORS = ["#8b5cf6", "#ec4899", "#14b8a6", "#84cc16"];

export function AttackDistribution({ data, isLoading }: AttackDistributionProps) {
  const total = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);

  const enriched = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        color: CHART_COLORS[d.type] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      })),
    [data],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Attack Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Skeleton className="h-40 w-40 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Attack Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Attack Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="h-44 w-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enriched}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  strokeWidth={0}
                  animationBegin={0}
                  animationDuration={600}
                >
                  {enriched.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222 47% 10%)",
                    border: "1px solid hsl(217 33% 18%)",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                  itemStyle={{ color: "hsl(210 40% 98%)" }}
                  formatter={(value, name) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-2.5 self-center sm:self-start">
            {enriched.map((entry) => {
              const pct = total > 0 ? ((entry.count / total) * 100).toFixed(1) : "0";
              return (
                <div key={entry.type} className="flex items-center gap-3 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground min-w-0 flex-1 truncate">
                    {entry.type}
                  </span>
                  <span className="font-medium tabular-nums">{entry.count}</span>
                  <span className="text-xs text-muted-foreground/60 w-10 text-right tabular-nums">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

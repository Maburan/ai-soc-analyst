import { useMemo } from "react";
import { FileText, Calendar, Clock, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { SeverityBadge } from "../SeverityBadge";
import { Skeleton } from "../ui/skeleton";
import { highestSeverity } from "../../lib/aggregation";
import { cn } from "../../lib/utils";
import type { AnalysisHistoryItem } from "../../types/api";

interface RecentAnalysesProps {
  items: AnalysisHistoryItem[];
  isLoading?: boolean;
  onSelect: (id: string) => void;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentAnalyses({
  items,
  isLoading,
  onSelect,
}: RecentAnalysesProps) {
  const enriched = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        findingCount: item.analysisResult.findings.length,
        topSeverity: highestSeverity(item.analysisResult.findings),
        attackTypes: [
          ...new Set(
            item.analysisResult.findings.map((f) => f.finding_type),
          ),
        ],
      })),
    [items],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          Recent Analyses
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {enriched.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex w-full items-center gap-4 px-6 py-3.5 text-left transition-all duration-200 hover:bg-muted/50",
                "animate-in fade-in slide-in-from-bottom-1",
                index < 3 && "duration-300",
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {item.filename}
                  </span>
                  <SeverityBadge severity={item.topSeverity} />
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatTime(item.analyzedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {item.findingCount} finding{item.findingCount !== 1 ? "s" : ""}
                  </span>
                </div>
                {item.attackTypes.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.attackTypes.map((type) => (
                      <span
                        key={type}
                        className="rounded bg-muted-foreground/10 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

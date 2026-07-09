import { useMemo } from "react";
import { FileText, Calendar, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { SeverityBadge } from "../SeverityBadge";
import { Skeleton } from "../ui/skeleton";
import { enrichHistoryItems, type InvestigationRow } from "../../lib/aggregation";
import { cn } from "../../lib/utils";
import type { AnalysisHistoryItem } from "../../types/api";

interface RecentInvestigationsProps {
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

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  investigated: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export function RecentInvestigations({
  items,
  isLoading,
  onSelect,
}: RecentInvestigationsProps) {
  const rows: InvestigationRow[] = useMemo(
    () => enrichHistoryItems(items),
    [items],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Investigations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
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
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          Recent Investigations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>File</Th>
                <Th>Time</Th>
                <Th className="text-center">Findings</Th>
                <Th>Severity</Th>
                <Th>Types</Th>
                <Th>Status</Th>
                <Th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => onSelect(row.id)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    "animate-in fade-in slide-in-from-bottom-1",
                  )}
                  style={{
                    animationDelay: `${index * 30}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="font-medium truncate max-w-[160px]">
                        {row.filename}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      {formatTime(row.analyzedAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="tabular-nums font-medium">
                      {row.findingCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={row.topSeverity} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.attackTypes.slice(0, 2).map((type) => (
                        <span
                          key={type}
                          className="rounded bg-muted-foreground/10 px-1.5 py-0.5 text-[10px] text-muted-foreground whitespace-nowrap"
                        >
                          {type}
                        </span>
                      ))}
                      {row.attackTypes.length > 2 && (
                        <span className="text-[10px] text-muted-foreground/50">
                          +{row.attackTypes.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                        STATUS_STYLES[row.status],
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60",
        className,
      )}
    >
      {children}
    </th>
  );
}

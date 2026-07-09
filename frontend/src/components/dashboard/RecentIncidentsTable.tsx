import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { SeverityBadge } from "../SeverityBadge";
import { Skeleton } from "../ui/skeleton";
import type { SecurityFinding } from "../../types/api";

interface RecentIncidentsTableProps {
  findings: SecurityFinding[];
  isLoading?: boolean;
}

export function RecentIncidentsTable({ findings, isLoading }: RecentIncidentsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No incidents detected yet.</p>
            <p className="text-xs text-muted-foreground/60">
              Upload a log file to begin analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Incidents</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {findings.slice(0, 10).map((finding, index) => (
            <div
              key={`${finding.finding_type}-${finding.affected_user}-${index}`}
              className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/50"
            >
              <SeverityBadge severity={finding.severity} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">
                  {finding.finding_type}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {finding.affected_user} &middot; {finding.source_ip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

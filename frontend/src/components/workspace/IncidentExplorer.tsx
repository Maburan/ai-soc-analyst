import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { SeverityBadge } from "../SeverityBadge";
import { cn } from "../../lib/utils";
import type { SecurityFinding } from "../../types/api";

interface IncidentExplorerProps {
  findings: SecurityFinding[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function IncidentExplorer({
  findings,
  selectedIndex,
  onSelect,
}: IncidentExplorerProps) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !f.finding_type.toLowerCase().includes(q) &&
          !f.affected_user.toLowerCase().includes(q) &&
          !f.source_ip.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (severityFilter && f.severity !== severityFilter) return false;
      return true;
    });
  }, [findings, search, severityFilter]);

  const hasActiveFilter = severityFilter || search;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Incident Explorer</CardTitle>
          <span className="text-xs text-muted-foreground">
            {filtered.length} / {findings.length}
          </span>
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <button
            onClick={() => setSeverityFilter(null)}
            className={cn(
              "rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors",
              !severityFilter
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            All
          </button>
          {["CRITICAL", "HIGH"].map((sev) => (
            <button
              key={sev}
              onClick={() =>
                setSeverityFilter(severityFilter === sev ? null : sev)
              }
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors",
                severityFilter === sev
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {sev}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center px-4">
            <Filter className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              {hasActiveFilter
                ? "No incidents match your filters."
                : "No incidents detected."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((finding, i) => {
              const realIndex = findings.indexOf(finding);
              const isSelected = realIndex === selectedIndex;
              return (
                <button
                  key={`${finding.finding_type}-${finding.affected_user}-${i}`}
                  onClick={() => onSelect(realIndex)}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors duration-150 hover:bg-muted/50",
                    isSelected && "bg-muted border-l-2 border-l-primary",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <SeverityBadge severity={finding.severity} />
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {finding.source_ip}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium truncate">
                    {finding.finding_type}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground truncate">
                    {finding.affected_user}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

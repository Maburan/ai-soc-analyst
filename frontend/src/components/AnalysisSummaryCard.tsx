import {
  FileText,
  BarChart3,
  GitCompare,
  Search,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import type { AnalysisMetadata } from "../types/api";

const FORMAT_LABELS: Record<string, string> = {
  csv: "CSV",
  linux_auth_log: "Linux Auth Log",
  windows_security_log: "Windows Security Log",
};

function formatLabel(format: string): string {
  return FORMAT_LABELS[format] ?? format.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDuration(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)} s`;
  }
  return `${ms} ms`;
}

interface MetadataItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function MetadataItem({ icon: Icon, label, value }: MetadataItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

interface AnalysisSummaryCardProps {
  metadata: AnalysisMetadata;
}

export function AnalysisSummaryCard({ metadata }: AnalysisSummaryCardProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">
            Analysis Summary
          </h2>
          {metadata.findings_generated === 0 && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-500">
              No Detections
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetadataItem
            icon={FileText}
            label="Log Format"
            value={formatLabel(metadata.detected_log_format)}
          />
          <MetadataItem
            icon={BarChart3}
            label="Events Parsed"
            value={metadata.events_parsed.toLocaleString()}
          />
          <MetadataItem
            icon={GitCompare}
            label="Events Correlated"
            value={metadata.events_correlated.toLocaleString()}
          />
          <MetadataItem
            icon={Search}
            label="Detection Rules Executed"
            value={metadata.rules_executed.toLocaleString()}
          />
          <MetadataItem
            icon={AlertTriangle}
            label="Findings Generated"
            value={metadata.findings_generated.toLocaleString()}
          />
          <MetadataItem
            icon={Clock}
            label="Analysis Duration"
            value={formatDuration(metadata.analysis_duration_ms)}
          />
        </div>

        {metadata.findings_generated === 0 && (
          <p className="mt-4 rounded-lg border border-border/40 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            No supported attack patterns were detected in the analyzed dataset.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

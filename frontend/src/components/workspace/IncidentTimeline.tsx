import { useState } from "react";
import { ChevronRight, ChevronDown, AlertCircle, FileText, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import type { SecurityFinding, InvestigationReport } from "../../types/api";

interface TimelineStep {
  label: string;
  detail: string;
  kind: "detection" | "evidence" | "disclaimer";
}

function buildTimelineSteps(
  finding: SecurityFinding,
  report: InvestigationReport,
): TimelineStep[] {
  const steps: TimelineStep[] = [];

  steps.push({
    label: `Detection: ${finding.finding_type}`,
    detail: finding.description,
    kind: "detection",
  });

  if (report.evidence.length > 0) {
    for (const item of report.evidence) {
      steps.push({
        label: "Evidence Item",
        detail: item,
        kind: "evidence",
      });
    }
  }

  return steps;
}

interface IncidentTimelineProps {
  finding: SecurityFinding;
  report: InvestigationReport;
}

export function IncidentTimeline({ finding, report }: IncidentTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const steps = buildTimelineSteps(finding, report);

  if (steps.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">
          Timeline data is not available for this incident. The backend currently
          does not return raw event timestamps required for chronological reconstruction.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {}
      <div className="mb-4 rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
          <p className="text-[10px] leading-relaxed text-amber-300/80">
            The backend does not return raw event logs or timestamps.
            This timeline is ordered by detection logic, not chronological sequence.
          </p>
        </div>
      </div>

      {steps.map((step, index) => {
        const isExpanded = expandedStep === index;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative flex gap-4 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 bg-card transition-colors",
                  step.kind === "detection"
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-muted-foreground/20",
                )}
              >
                {step.kind === "detection" ? (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              {!isLast && (
                <div className="mt-1 w-px flex-1 bg-gradient-to-b from-border to-transparent" />
              )}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <button
                onClick={() =>
                  setExpandedStep(isExpanded ? null : index)
                }
                className="flex w-full items-start justify-between gap-2 text-left"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium flex items-center gap-2">
                    {step.label}
                    {step.kind === "detection" && (
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-red-400 uppercase">
                        Detection
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                    {step.detail}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedStep(isExpanded ? null : index);
                  }}
                  className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              </button>

              {isExpanded && (
                <div className="mt-2 rounded-md border border-border bg-muted/30 p-3 animate-in slide-in-from-top-1 duration-150">
                  <p className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {step.detail}
                  </p>
                  {step.kind === "detection" && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/60">
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-red-400 font-medium">
                        Rule: {finding.finding_type}
                      </span>
                      <span>Severity: {finding.severity}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

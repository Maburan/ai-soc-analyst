import { FileText, Lightbulb, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SeverityBadge } from "../SeverityBadge";
import { IncidentTimeline } from "./IncidentTimeline";
import { MitreCard } from "./MitreCard";
import { EvidenceCard } from "./EvidenceCard";
import { RecommendationCard } from "./RecommendationCard";
import type { SecurityFinding, InvestigationReport } from "../../types/api";

interface IncidentDetailProps {
  finding: SecurityFinding;
  report: InvestigationReport;
  index: number;
}

export function IncidentDetail({ finding, report, index }: IncidentDetailProps) {
  return (
    <div className="space-y-4">
      {}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Incident #{index + 1}
                </span>
                <SeverityBadge severity={finding.severity} />
              </div>
              <CardTitle className="mt-1 text-base">
                {report.incident_title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Summary</p>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  {report.summary}
                </p>
              </div>
            </div>
          </div>

          {}
          {finding.description && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">Detection Reasoning</p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    {finding.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Incident Timeline</CardTitle>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Events and evidence collected by the detection engine.
            Ordered by detection logic — the backend does not provide raw event timestamps.
          </p>
        </CardHeader>
        <CardContent>
          <IncidentTimeline finding={finding} report={report} />
        </CardContent>
      </Card>

      {}
      <div className="grid gap-4 md:grid-cols-2">
        <MitreCard finding={finding} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Incident Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DetailRow label="Attack Type" value={finding.finding_type} />
            <DetailRow label="Affected User" value={finding.affected_user} />
            <DetailRow label="Source IP" value={finding.source_ip} />
            <DetailRow label="Severity" value={finding.severity} />
            <DetailRow
              label="Evidence Items"
              value={`${report.evidence.length} items`}
            />
            <DetailRow
              label="Recommendations"
              value={`${report.recommendations.length} actions`}
            />
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EvidenceCard evidence={report.evidence} />
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecommendationCard recommendations={report.recommendations} />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right ml-4 truncate">
        {value}
      </span>
    </div>
  );
}

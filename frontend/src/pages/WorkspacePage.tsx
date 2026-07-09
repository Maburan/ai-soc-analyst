import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { IncidentExplorer } from "../components/workspace/IncidentExplorer";
import { IncidentDetail } from "../components/workspace/IncidentDetail";
import { CopilotPlaceholder } from "../components/workspace/CopilotPlaceholder";
import { useAnalysis } from "../context/AnalysisContext";

export function WorkspacePage() {
  const { analysisResult, uploadedFileName } = useAnalysis();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!analysisResult) {
    return <Navigate to="/" replace />;
  }

  const { findings, investigation_reports } = analysisResult;
  const safeIndex = Math.min(selectedIndex, findings.length - 1);
  const currentFinding = findings[safeIndex];
  const currentReport = investigation_reports[safeIndex];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4">
      {}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Investigation Workspace
            </h1>
            <p className="text-xs text-muted-foreground">
              {uploadedFileName ?? "Analysis results"}
              <span className="mx-1.5">&middot;</span>
              {findings.length} incident{findings.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/analyze">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            New Analysis
          </Link>
        </Button>
      </div>

      {}
      <div className="flex-1 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_280px] min-h-0">
        {}
        <div className="overflow-hidden rounded-lg">
          <IncidentExplorer
            findings={findings}
            selectedIndex={safeIndex}
            onSelect={setSelectedIndex}
          />
        </div>

        {}
        <div className="overflow-y-auto rounded-lg">
          {currentFinding && currentReport ? (
            <IncidentDetail
              finding={currentFinding}
              report={currentReport}
              index={safeIndex}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Select an incident from the explorer to view details.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {}
        <div className="overflow-hidden rounded-lg">
          <CopilotPlaceholder />
        </div>
      </div>
    </div>
  );
}

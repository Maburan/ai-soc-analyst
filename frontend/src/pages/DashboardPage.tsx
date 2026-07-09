import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ShieldAlert,
  Bug,
  FileText,
  Upload,
  Shield,
  Clock,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { useAnalysisHistory } from "../hooks/useAnalysisHistory";
import { aggregateMetrics } from "../lib/aggregation";
import { StatCard } from "../components/dashboard/StatCard";
import { TopSourceIPs } from "../components/dashboard/TopSourceIPs";
import { AttackDistribution } from "../components/dashboard/AttackDistribution";
import { RecentAnalyses } from "../components/dashboard/RecentAnalyses";
import { QuickActions } from "../components/dashboard/QuickActions";
import { SystemStatus } from "../components/dashboard/SystemStatus";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export function DashboardPage() {
  const { loadFromHistory } = useAnalysis();
  const { history } = useAnalysisHistory();
  const navigate = useNavigate();

  const metrics = useMemo(() => aggregateMetrics(history), [history]);
  const hasHistory = history.length > 0;

  const handleOpenAnalysis = useCallback(
    (id: string) => {
      const loaded = loadFromHistory(id);
      if (loaded) {
        navigate("/workspace");
      }
    },
    [loadFromHistory, navigate],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SOC Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {hasHistory
              ? "Aggregated across all analyzed log files"
              : "Upload a log file to begin your security investigation."}
          </p>
        </div>
        {hasHistory && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {history.length} file{history.length !== 1 ? "s" : ""} analyzed
            </span>
          </div>
        )}
      </div>

      <SystemStatus
        hasAnalysis={hasHistory}
        detectionRuleCount={metrics.detectionRulesTriggered}
      />

      {!hasHistory ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">Welcome to AI SOC Analyst</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Upload your security logs to detect brute force attacks, password spraying,
                privilege escalation, and data exfiltration using AI-powered correlation.
                All analyses are saved locally for review.
              </p>
            </div>
            <Button
              size="lg"
              className="mt-2 gap-2"
              onClick={() => navigate("/analyze")}
            >
              <Upload className="h-4 w-4" />
              Upload Logs for Analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Files Analyzed"
              value={metrics.filesAnalyzed}
              icon={FileText}
              iconClassName="text-emerald-500 bg-emerald-500/10"
            />
            <StatCard
              title="Total Findings"
              value={metrics.totalFindings}
              icon={Bug}
              iconClassName="text-blue-500 bg-blue-500/10"
            />
            <StatCard
              title="Critical Incidents"
              value={metrics.criticalFindings}
              icon={AlertTriangle}
              iconClassName="text-red-500 bg-red-500/10"
            />
            <StatCard
              title="High Severity Alerts"
              value={metrics.highFindings}
              icon={ShieldAlert}
              iconClassName="text-orange-500 bg-orange-500/10"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <AttackDistribution data={metrics.attackDistribution} />
            </div>
            <div className="lg:col-span-2">
              <TopSourceIPs data={metrics.topIps} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <RecentAnalyses
                items={history}
                onSelect={handleOpenAnalysis}
              />
            </div>
            <div className="lg:col-span-2">
              <QuickActions hasAnalysis={hasHistory} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

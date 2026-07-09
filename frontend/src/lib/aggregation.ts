import type {
  AnalysisHistoryItem,
  SecurityFinding,
} from "../types/api";

const SEVERITY_RANK: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

export function highestSeverity(findings: SecurityFinding[]): string {
  let max = "LOW";
  for (const f of findings) {
    if ((SEVERITY_RANK[f.severity] ?? -1) > (SEVERITY_RANK[max] ?? -1)) {
      max = f.severity;
    }
  }
  return max;
}

export interface DashboardMetrics {
  filesAnalyzed: number;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  attackDistribution: { type: string; count: number }[];
  topIps: { ip: string; count: number }[];
  mostCommonAttackType: string | null;
  detectionRulesTriggered: number;
}

function allFindings(items: AnalysisHistoryItem[]): SecurityFinding[] {
  return items.flatMap((item) => item.analysisResult.findings);
}

function aggregateTopIps(
  findings: SecurityFinding[],
): { ip: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const f of findings) {
    counts.set(f.source_ip, (counts.get(f.source_ip) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count);
}

function aggregateAttackTypes(
  findings: SecurityFinding[],
): { type: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const f of findings) {
    counts.set(f.finding_type, (counts.get(f.finding_type) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

function countRulesTriggered(findings: SecurityFinding[]): number {
  return new Set(findings.map((f) => f.finding_type)).size;
}

export function aggregateMetrics(
  items: AnalysisHistoryItem[],
): DashboardMetrics {
  const findings = allFindings(items);
  const criticalFindings = findings.filter(
    (f) => f.severity === "CRITICAL",
  ).length;
  const highFindings = findings.filter((f) => f.severity === "HIGH").length;
  const distributions = aggregateAttackTypes(findings);
  const ips = aggregateTopIps(findings);
  const mostCommon = distributions.length > 0 ? distributions[0].type : null;

  return {
    filesAnalyzed: items.length,
    totalFindings: findings.length,
    criticalFindings,
    highFindings,
    attackDistribution: distributions,
    topIps: ips.slice(0, 5),
    mostCommonAttackType: mostCommon,
    detectionRulesTriggered: countRulesTriggered(findings),
  };
}

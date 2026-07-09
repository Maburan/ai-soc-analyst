import type { AnalysisHistoryItem, SecurityFinding } from "../types/api";

const SEVERITY_RANK: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

const WEIGHT: Record<string, number> = {
  LOW: 1,
  MEDIUM: 4,
  HIGH: 7,
  CRITICAL: 10,
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
  mediumFindings: number;
  lowFindings: number;
  attackDistribution: { type: string; count: number }[];
  topIps: { ip: string; count: number }[];
  mostCommonAttackType: string | null;
  detectionRulesTriggered: number;
  threatScore: number;
  attackTrends: { date: string; count: number }[];
  topUsers: { user: string; count: number }[];
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

function computeThreatScore(findings: SecurityFinding[]): number {
  if (findings.length === 0) return 0;
  let weightedSum = 0;
  for (const f of findings) {
    weightedSum += WEIGHT[f.severity] ?? 1;
  }
  const normalized = (weightedSum / (findings.length * 10)) * 100;
  const uniqueTypes = new Set(findings.map((f) => f.finding_type)).size;
  const diversityBonus = Math.min((uniqueTypes - 1) * 5, 15);
  return Math.round(Math.min(normalized + diversityBonus, 100));
}

function computeAttackTrends(
  items: AnalysisHistoryItem[],
): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const dateKey = item.analyzedAt.slice(0, 10);
    const existing = counts.get(dateKey) ?? 0;
    counts.set(dateKey, existing + item.analysisResult.findings.length);
  }
  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateTopUsers(
  findings: SecurityFinding[],
): { user: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const f of findings) {
    counts.set(f.affected_user, (counts.get(f.affected_user) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([user, count]) => ({ user, count }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateMetrics(
  items: AnalysisHistoryItem[],
): DashboardMetrics {
  const findings = allFindings(items);
  const criticalFindings = findings.filter(
    (f) => f.severity === "CRITICAL",
  ).length;
  const highFindings = findings.filter((f) => f.severity === "HIGH").length;
  const mediumFindings = findings.filter(
    (f) => f.severity === "MEDIUM",
  ).length;
  const lowFindings = findings.filter((f) => f.severity === "LOW").length;
  const distributions = aggregateAttackTypes(findings);
  const ips = aggregateTopIps(findings);
  const users = aggregateTopUsers(findings);
  const mostCommon = distributions.length > 0 ? distributions[0].type : null;

  return {
    filesAnalyzed: items.length,
    totalFindings: findings.length,
    criticalFindings,
    highFindings,
    mediumFindings,
    lowFindings,
    attackDistribution: distributions,
    topIps: ips.slice(0, 5),
    mostCommonAttackType: mostCommon,
    detectionRulesTriggered: countRulesTriggered(findings),
    threatScore: computeThreatScore(findings),
    attackTrends: computeAttackTrends(items),
    topUsers: users.slice(0, 5),
  };
}

export interface InvestigationRow {
  id: string;
  filename: string;
  analyzedAt: string;
  findingCount: number;
  topSeverity: string;
  attackTypes: string[];
  status: "open" | "investigated" | "resolved";
}

export function enrichHistoryItems(
  items: AnalysisHistoryItem[],
): InvestigationRow[] {
  return items.map((item) => ({
    id: item.id,
    filename: item.filename,
    analyzedAt: item.analyzedAt,
    findingCount: item.analysisResult.findings.length,
    topSeverity: highestSeverity(item.analysisResult.findings),
    attackTypes: [
      ...new Set(item.analysisResult.findings.map((f) => f.finding_type)),
    ],
    status: "open" as const,
  }));
}

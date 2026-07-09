export interface SecurityFinding {
  finding_type: string;
  severity: string;
  description: string;
  affected_user: string;
  source_ip: string;
}

export interface InvestigationReport {
  incident_title: string;
  severity: string;
  summary: string;
  evidence: string[];
  recommendations: string[];
}

export interface AnalyzeResponse {
  findings: SecurityFinding[];
  investigation_reports: InvestigationReport[];
}

export interface AnalysisHistoryItem {
  id: string;
  filename: string;
  analyzedAt: string;
  analysisResult: AnalyzeResponse;
}

export interface ApiError {
  detail: string | { msg: string }[];
}

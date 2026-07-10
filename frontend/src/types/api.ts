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

export interface AnalysisMetadata {
  detected_log_format: string;
  events_parsed: number;
  events_correlated: number;
  rules_executed: number;
  findings_generated: number;
  analysis_duration_ms: number;
}

export interface AnalyzeResponse {
  findings: SecurityFinding[];
  investigation_reports: InvestigationReport[];
  metadata: AnalysisMetadata;
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

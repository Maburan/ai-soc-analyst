from pydantic import BaseModel, Field

from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_finding import SecurityFinding


class AnalysisMetadata(BaseModel):
    """Execution metadata for a single analysis run."""

    detected_log_format: str = Field(
        min_length=1,
        description="Auto-detected log format (csv, linux_auth_log, windows_security_log).",
    )
    events_parsed: int = Field(
        ge=0,
        description="Number of security events extracted by the log parser.",
    )
    events_correlated: int = Field(
        ge=0,
        description="Number of events passed to the correlation engine.",
    )
    rules_executed: int = Field(
        ge=0,
        description="Number of detection rules evaluated against events.",
    )
    findings_generated: int = Field(
        ge=0,
        description="Number of security findings produced by detection rules.",
    )
    analysis_duration_ms: int = Field(
        ge=0,
        description="Total workflow execution time in milliseconds.",
    )


class AnalyzeResponse(BaseModel):
    """Response returned after analyzing an uploaded log file."""

    findings: list[SecurityFinding]
    investigation_reports: list[InvestigationReport]
    metadata: AnalysisMetadata


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(min_length=1)

from typing import TypedDict

from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_event import SecurityEvent
from app.schemas.security_finding import SecurityFinding


class SOCWorkflowState(TypedDict, total=False):
    """Shared state passed between LangGraph workflow nodes."""

    log_file_path: str
    security_events: list[SecurityEvent]
    security_findings: list[SecurityFinding]
    investigation_reports: list[InvestigationReport]

    # Execution metadata (populated by nodes during the workflow)
    detected_log_format: str
    events_parsed: int
    events_correlated: int
    rules_executed: int
    findings_generated: int
    analysis_duration_ms: int
    analysis_start_time: float

from pydantic import BaseModel, Field

from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_finding import SecurityFinding


class AnalyzeResponse(BaseModel):
    """Response returned after analyzing an uploaded CSV log file."""

    findings: list[SecurityFinding]
    investigation_reports: list[InvestigationReport]


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(min_length=1)

from pydantic import BaseModel, Field


class InvestigationReport(BaseModel):
    """An incident investigation report generated from a security finding."""

    incident_title: str = Field(min_length=1)
    severity: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    evidence: list[str] = Field(min_length=1)
    recommendations: list[str] = Field(min_length=1)

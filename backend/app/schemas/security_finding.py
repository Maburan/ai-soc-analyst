from pydantic import BaseModel, Field


class SecurityFinding(BaseModel):
    """A security finding produced by correlating multiple events."""

    finding_type: str = Field(min_length=1)
    severity: str = Field(min_length=1)
    description: str = Field(min_length=1)
    affected_user: str = Field(min_length=1)
    source_ip: str = Field(min_length=1)

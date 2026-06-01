from datetime import datetime

from pydantic import BaseModel, Field


class SecurityEvent(BaseModel):
    """A single security log event parsed from CSV."""

    timestamp: datetime
    event_type: str = Field(min_length=1)
    user: str = Field(min_length=1)
    ip: str = Field(min_length=1)

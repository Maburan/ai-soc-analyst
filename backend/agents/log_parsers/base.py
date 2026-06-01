from abc import ABC, abstractmethod
from pathlib import Path

from app.schemas.security_event import SecurityEvent


class LogParser(ABC):
    """Base class for log file parsers."""

    @abstractmethod
    def parse(self, file_path: str | Path) -> list[SecurityEvent]:
        """Parse a log file and return structured security events."""

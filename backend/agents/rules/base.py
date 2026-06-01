from abc import ABC, abstractmethod

from app.schemas.security_event import SecurityEvent
from app.schemas.security_finding import SecurityFinding


class DetectionRule(ABC):
    """Base class for correlation rules. Subclass to add new detections."""

    @abstractmethod
    def detect(self, events: list[SecurityEvent]) -> list[SecurityFinding]:
        """Analyze events and return any findings matched by this rule."""


def sort_events(events: list[SecurityEvent]) -> list[SecurityEvent]:
    return sorted(events, key=lambda event: event.timestamp)

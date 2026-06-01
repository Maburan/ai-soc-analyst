from app.schemas.security_event import SecurityEvent
from app.schemas.security_finding import SecurityFinding

from agents.rules import DEFAULT_RULES
from agents.rules.base import DetectionRule, sort_events


class CorrelationAgent:
    """Analyzes security events and detects suspicious activity using rules."""

    def __init__(self, rules: list[DetectionRule] | None = None) -> None:
        self.rules = rules if rules is not None else list(DEFAULT_RULES)

    def analyze(self, events: list[SecurityEvent]) -> list[SecurityFinding]:
        sorted_events = sort_events(events)
        findings: list[SecurityFinding] = []

        for rule in self.rules:
            findings.extend(rule.detect(sorted_events))

        return findings

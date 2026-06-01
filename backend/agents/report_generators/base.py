from abc import ABC, abstractmethod

from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_finding import SecurityFinding


class ReportGenerator(ABC):
    """Generates investigation reports from security findings.

    Implement this interface to swap template-based reports for LLM-based
    reports (for example, Gemini) without changing InvestigationAgent.
    """

    @abstractmethod
    def generate(self, finding: SecurityFinding) -> InvestigationReport:
        """Build an investigation report for a single finding."""

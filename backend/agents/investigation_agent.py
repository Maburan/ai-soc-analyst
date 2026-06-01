from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_finding import SecurityFinding

from agents.report_generators import ReportGenerator, TemplateReportGenerator


class InvestigationAgent:
    """Converts security findings into incident investigation reports."""

    def __init__(self, report_generator: ReportGenerator | None = None) -> None:
        self.report_generator = report_generator or TemplateReportGenerator()

    def investigate(self, findings: list[SecurityFinding]) -> list[InvestigationReport]:
        return [self.report_generator.generate(finding) for finding in findings]

    def investigate_one(self, finding: SecurityFinding) -> InvestigationReport:
        return self.report_generator.generate(finding)

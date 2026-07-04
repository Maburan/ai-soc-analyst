import os

from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_finding import SecurityFinding

from agents.report_generators import ReportGenerator, TemplateReportGenerator


class InvestigationAgent:
    """Converts security findings into incident investigation reports.

    Automatically selects the report generator based on the environment:
    - If GEMINI_API_KEY is set → GeminiReportGenerator (with template fallback).
    - Otherwise → TemplateReportGenerator.
    An explicit *report_generator* argument always takes precedence.
    """

    def __init__(self, report_generator: ReportGenerator | None = None) -> None:
        if report_generator is not None:
            self.report_generator = report_generator
        elif os.getenv("GEMINI_API_KEY"):
            from agents.report_generators import GeminiReportGenerator

            self.report_generator = GeminiReportGenerator()
        else:
            self.report_generator = TemplateReportGenerator()

    def investigate(self, findings: list[SecurityFinding]) -> list[InvestigationReport]:
        return [self.report_generator.generate(finding) for finding in findings]

    def investigate_one(self, finding: SecurityFinding) -> InvestigationReport:
        return self.report_generator.generate(finding)

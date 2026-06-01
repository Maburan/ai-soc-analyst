from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_finding import SecurityFinding

from agents.report_generators.base import ReportGenerator
from agents.report_generators.templates import REPORT_BUILDERS


class TemplateReportGenerator(ReportGenerator):
    """Rule-based report generator using predefined templates per finding type."""

    def generate(self, finding: SecurityFinding) -> InvestigationReport:
        builder = REPORT_BUILDERS.get(finding.finding_type)

        if builder is None:
            raise ValueError(
                f"No report template available for finding type: {finding.finding_type}"
            )

        return builder(finding)

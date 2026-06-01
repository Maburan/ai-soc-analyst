import logging

from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_finding import SecurityFinding

from agents.report_generators.base import ReportGenerator
from agents.report_generators.gemini_client import GeminiApiClient, GeminiContentClient
from agents.report_generators.template_report_generator import TemplateReportGenerator
from agents.report_generators.templates import get_incident_severity, get_incident_title

logger = logging.getLogger(__name__)


class GeminiReportGenerator(ReportGenerator):
    """Generates investigation reports using Gemini with template fallback."""

    def __init__(
        self,
        fallback_generator: ReportGenerator | None = None,
        gemini_client: GeminiContentClient | None = None,
        model_name: str = "gemini-2.0-flash",
    ) -> None:
        self.fallback_generator = fallback_generator or TemplateReportGenerator()
        self._gemini_client = gemini_client
        self.model_name = model_name

    def _get_client(self) -> GeminiContentClient:
        if self._gemini_client is not None:
            return self._gemini_client

        return GeminiApiClient(model_name=self.model_name)

    def generate(self, finding: SecurityFinding) -> InvestigationReport:
        try:
            return self._generate_with_gemini(finding)
        except Exception as error:
            logger.warning(
                "Gemini report generation failed; falling back to templates: %s",
                error,
            )
            return self.fallback_generator.generate(finding)

    def _generate_with_gemini(self, finding: SecurityFinding) -> InvestigationReport:
        content = self._get_client().generate_report_content(finding)

        return InvestigationReport(
            incident_title=get_incident_title(finding),
            severity=get_incident_severity(finding),
            summary=content.summary,
            evidence=content.evidence,
            recommendations=content.recommendations,
        )

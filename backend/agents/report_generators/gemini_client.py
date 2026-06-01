import json
import os
from typing import Protocol

from pydantic import BaseModel, Field

from app.schemas.security_finding import SecurityFinding


class GeminiReportContent(BaseModel):
    """Structured report sections returned by Gemini."""

    summary: str = Field(min_length=1)
    evidence: list[str] = Field(min_length=1)
    recommendations: list[str] = Field(min_length=1)


class GeminiContentClient(Protocol):
    """Protocol for generating Gemini report content (real API or test double)."""

    def generate_report_content(self, finding: SecurityFinding) -> GeminiReportContent:
        """Generate AI-written report sections for a security finding."""


def build_gemini_prompt(finding: SecurityFinding) -> str:
    return (
        "You are a SOC analyst writing an incident investigation report.\n\n"
        "Given this security finding:\n"
        f"- Finding type: {finding.finding_type}\n"
        f"- Severity: {finding.severity}\n"
        f"- Description: {finding.description}\n"
        f"- Affected user: {finding.affected_user}\n"
        f"- Source IP: {finding.source_ip}\n\n"
        "Return JSON with exactly these keys:\n"
        '- "summary": a 2-4 sentence analyst-facing incident summary\n'
        '- "evidence": an array of strings explaining supporting evidence\n'
        '- "recommendations": an array of concrete remediation steps\n\n'
        "Return only valid JSON with no markdown fences."
    )


class GeminiApiClient:
    """Calls the Gemini API using GEMINI_API_KEY from the environment."""

    def __init__(
        self,
        api_key: str | None = None,
        model_name: str = "gemini-2.0-flash",
    ) -> None:
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name

        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")

    def generate_report_content(self, finding: SecurityFinding) -> GeminiReportContent:
        import google.generativeai as genai

        genai.configure(api_key=self.api_key)
        model = genai.GenerativeModel(self.model_name)
        response = model.generate_content(
            build_gemini_prompt(finding),
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            ),
        )

        raw_text = response.text
        if not raw_text:
            raise ValueError("Gemini returned an empty response")

        payload = json.loads(raw_text)
        return GeminiReportContent.model_validate(payload)

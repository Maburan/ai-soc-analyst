import pytest

from agents.investigation_agent import InvestigationAgent
from agents.report_generators.gemini_client import GeminiReportContent
from agents.report_generators.gemini_report_generator import GeminiReportGenerator
from agents.report_generators.template_report_generator import TemplateReportGenerator
from agents.report_generators.templates import BRUTE_FORCE_ATTACK, PRIVILEGE_ESCALATION
from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_finding import SecurityFinding


def make_finding(
    finding_type: str = BRUTE_FORCE_ATTACK,
    severity: str = "HIGH",
    description: str = "5 failed login attempts followed by a successful login.",
    affected_user: str = "admin",
    source_ip: str = "1.2.3.4",
) -> SecurityFinding:
    return SecurityFinding(
        finding_type=finding_type,
        severity=severity,
        description=description,
        affected_user=affected_user,
        source_ip=source_ip,
    )


class FakeGeminiClient:
    def __init__(
        self,
        content: GeminiReportContent | None = None,
        error: Exception | None = None,
    ) -> None:
        self.content = content
        self.error = error
        self.calls: list[SecurityFinding] = []

    def generate_report_content(self, finding: SecurityFinding) -> GeminiReportContent:
        self.calls.append(finding)

        if self.error is not None:
            raise self.error

        assert self.content is not None
        return self.content


def test_gemini_generator_uses_local_title_and_severity_with_ai_content():
    finding = make_finding()
    fake_client = FakeGeminiClient(
        content=GeminiReportContent(
            summary="Gemini detected repeated authentication failures before success.",
            evidence=[
                "Multiple FAILED_LOGIN events originated from the same IP.",
                "A LOGIN_SUCCESS event followed the failed attempts.",
            ],
            recommendations=[
                "Reset credentials for the affected account.",
                "Enable MFA and monitor the source IP.",
            ],
        )
    )

    report = GeminiReportGenerator(gemini_client=fake_client).generate(finding)

    assert report.incident_title == "Brute Force Attack Targeting admin"
    assert report.severity == "HIGH"
    assert report.summary.startswith("Gemini detected")
    assert len(report.evidence) == 2
    assert len(report.recommendations) == 2
    assert fake_client.calls == [finding]


def test_gemini_generator_falls_back_when_client_raises_error():
    finding = make_finding()
    generator = GeminiReportGenerator(
        gemini_client=FakeGeminiClient(error=RuntimeError("Gemini unavailable"))
    )

    report = generator.generate(finding)

    assert report.incident_title == "Brute Force Attack Targeting admin"
    assert "brute force attack" in report.summary.lower()
    assert "Reset the affected user's password immediately." in report.recommendations


def test_gemini_generator_falls_back_when_api_key_is_missing(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    finding = make_finding()

    report = GeminiReportGenerator().generate(finding)

    assert report.incident_title == "Brute Force Attack Targeting admin"
    assert finding.description in report.evidence


def test_gemini_generator_falls_back_on_invalid_gemini_payload():
    class InvalidPayloadClient:
        def generate_report_content(self, finding: SecurityFinding) -> GeminiReportContent:
            return GeminiReportContent(
                summary="Valid summary.",
                evidence=[],
                recommendations=["One step."],
            )

    finding = make_finding()
    report = GeminiReportGenerator(gemini_client=InvalidPayloadClient()).generate(finding)

    assert "brute force attack" in report.summary.lower()
    assert "Reset the affected user's password immediately." in report.recommendations


def test_gemini_generator_plugs_into_investigation_agent_without_changes():
    finding = make_finding(
        finding_type=PRIVILEGE_ESCALATION,
        severity="CRITICAL",
        affected_user="alice",
    )
    fake_client = FakeGeminiClient(
        content=GeminiReportContent(
            summary="Gemini summary for privilege escalation.",
            evidence=["Login was followed by privilege grant."],
            recommendations=["Review admin role assignments."],
        )
    )

    report = InvestigationAgent(
        report_generator=GeminiReportGenerator(gemini_client=fake_client)
    ).investigate_one(finding)

    assert isinstance(report, InvestigationReport)
    assert report.incident_title == "Privilege Escalation by alice"
    assert report.severity == "CRITICAL"
    assert report.summary == "Gemini summary for privilege escalation."


def test_gemini_api_client_requires_api_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    from agents.report_generators.gemini_client import GeminiApiClient

    with pytest.raises(ValueError, match="GEMINI_API_KEY"):
        GeminiApiClient()


def test_gemini_api_client_reads_api_key_from_environment(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    from agents.report_generators.gemini_client import GeminiApiClient

    client = GeminiApiClient()
    assert client.api_key == "test-key"


def test_build_gemini_prompt_includes_finding_details():
    from agents.report_generators.gemini_client import build_gemini_prompt

    finding = make_finding(
        description="Suspicious login pattern detected.",
        affected_user="jsmith",
        source_ip="192.168.1.10",
    )
    prompt = build_gemini_prompt(finding)

    assert "Brute Force Attack" in prompt
    assert "Suspicious login pattern detected." in prompt
    assert "jsmith" in prompt
    assert "192.168.1.10" in prompt
    assert '"summary"' in prompt
    assert '"evidence"' in prompt
    assert '"recommendations"' in prompt


def test_gemini_generator_uses_injected_fallback_generator():
    class RecordingFallback(TemplateReportGenerator):
        def __init__(self) -> None:
            self.called = False

        def generate(self, finding: SecurityFinding) -> InvestigationReport:
            self.called = True
            return super().generate(finding)

    fallback = RecordingFallback()
    finding = make_finding()
    generator = GeminiReportGenerator(
        fallback_generator=fallback,
        gemini_client=FakeGeminiClient(error=RuntimeError("down")),
    )

    generator.generate(finding)

    assert fallback.called is True

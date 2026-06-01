from datetime import datetime, timedelta

import pytest

from agents.correlation_agent import CorrelationAgent
from agents.rules.base import DetectionRule
from agents.rules.brute_force import BruteForceRule
from agents.rules.data_exfiltration import DataExfiltrationRule
from agents.rules.privilege_escalation import PrivilegeEscalationRule
from app.schemas.security_event import SecurityEvent
from app.schemas.security_finding import SecurityFinding

BASE_TIME = datetime(2026, 6, 1, 10, 0, 0)


def make_event(
    offset_minutes: int,
    event_type: str,
    user: str = "admin",
    ip: str = "1.2.3.4",
) -> SecurityEvent:
    return SecurityEvent(
        timestamp=BASE_TIME + timedelta(minutes=offset_minutes),
        event_type=event_type,
        user=user,
        ip=ip,
    )


def test_analyze_empty_events_returns_empty_list():
    agent = CorrelationAgent()
    assert agent.analyze([]) == []


def test_brute_force_detects_five_failed_logins_followed_by_success():
    events = [
        make_event(minute, "FAILED_LOGIN")
        for minute in range(1, 6)
    ] + [make_event(6, "LOGIN_SUCCESS")]

    findings = CorrelationAgent().analyze(events)

    assert len(findings) == 1
    assert findings[0].finding_type == "Brute Force Attack"
    assert findings[0].severity == "HIGH"
    assert findings[0].affected_user == "admin"
    assert findings[0].source_ip == "1.2.3.4"
    assert "5 failed login attempts" in findings[0].description


def test_brute_force_does_not_trigger_with_only_four_failed_logins():
    events = [
        make_event(minute, "FAILED_LOGIN")
        for minute in range(1, 5)
    ] + [make_event(5, "LOGIN_SUCCESS")]

    findings = BruteForceRule().detect(events)

    assert findings == []


def test_brute_force_requires_same_user_and_ip():
    events = [
        make_event(1, "FAILED_LOGIN", user="admin", ip="1.2.3.4"),
        make_event(2, "FAILED_LOGIN", user="admin", ip="5.6.7.8"),
        make_event(3, "FAILED_LOGIN", user="admin", ip="1.2.3.4"),
        make_event(4, "FAILED_LOGIN", user="admin", ip="1.2.3.4"),
        make_event(5, "FAILED_LOGIN", user="admin", ip="1.2.3.4"),
        make_event(6, "LOGIN_SUCCESS", user="admin", ip="1.2.3.4"),
    ]

    findings = BruteForceRule().detect(events)

    assert findings == []


def test_brute_force_does_not_trigger_without_login_success():
    events = [make_event(minute, "FAILED_LOGIN") for minute in range(1, 7)]

    findings = BruteForceRule().detect(events)

    assert findings == []


def test_brute_force_resets_after_successful_login():
    events = [
        make_event(minute, "FAILED_LOGIN")
        for minute in range(1, 6)
    ] + [
        make_event(6, "LOGIN_SUCCESS"),
        make_event(7, "FAILED_LOGIN"),
        make_event(8, "LOGIN_SUCCESS"),
    ]

    findings = BruteForceRule().detect(events)

    assert len(findings) == 1


def test_privilege_escalation_detects_login_followed_by_privilege_grant():
    events = [
        make_event(1, "LOGIN_SUCCESS", user="alice"),
        make_event(2, "PRIVILEGE_GRANTED", user="alice"),
    ]

    findings = PrivilegeEscalationRule().detect(events)

    assert len(findings) == 1
    assert findings[0].finding_type == "Privilege Escalation"
    assert findings[0].severity == "CRITICAL"
    assert findings[0].affected_user == "alice"
    assert findings[0].source_ip == "1.2.3.4"


def test_privilege_escalation_does_not_trigger_without_login_success():
    events = [make_event(1, "PRIVILEGE_GRANTED", user="alice")]

    findings = PrivilegeEscalationRule().detect(events)

    assert findings == []


def test_privilege_escalation_ignores_other_users_login():
    events = [
        make_event(1, "LOGIN_SUCCESS", user="bob"),
        make_event(2, "PRIVILEGE_GRANTED", user="alice"),
    ]

    findings = PrivilegeEscalationRule().detect(events)

    assert findings == []


def test_data_exfiltration_detects_login_file_access_and_large_download():
    events = [
        make_event(1, "LOGIN_SUCCESS", user="carol"),
        make_event(2, "FILE_ACCESS", user="carol"),
        make_event(3, "FILE_ACCESS", user="carol"),
        make_event(4, "LARGE_DOWNLOAD", user="carol"),
    ]

    findings = DataExfiltrationRule().detect(events)

    assert len(findings) == 1
    assert findings[0].finding_type == "Data Exfiltration"
    assert findings[0].severity == "HIGH"
    assert findings[0].affected_user == "carol"
    assert "accessed 2 files" in findings[0].description


def test_data_exfiltration_requires_multiple_file_access_events():
    events = [
        make_event(1, "LOGIN_SUCCESS", user="carol"),
        make_event(2, "FILE_ACCESS", user="carol"),
        make_event(3, "LARGE_DOWNLOAD", user="carol"),
    ]

    findings = DataExfiltrationRule().detect(events)

    assert findings == []


def test_data_exfiltration_requires_large_download_after_file_access():
    events = [
        make_event(1, "LOGIN_SUCCESS", user="carol"),
        make_event(2, "FILE_ACCESS", user="carol"),
        make_event(3, "FILE_ACCESS", user="carol"),
    ]

    findings = DataExfiltrationRule().detect(events)

    assert findings == []


def test_data_exfiltration_allows_other_events_between_pattern_steps():
    events = [
        make_event(1, "LOGIN_SUCCESS", user="carol"),
        make_event(2, "FILE_ACCESS", user="carol"),
        make_event(3, "FAILED_LOGIN", user="other"),
        make_event(4, "FILE_ACCESS", user="carol"),
        make_event(5, "LARGE_DOWNLOAD", user="carol"),
    ]

    findings = DataExfiltrationRule().detect(events)

    assert len(findings) == 1


def test_correlation_agent_runs_all_rules_and_returns_multiple_findings():
    events = [
        make_event(1, "FAILED_LOGIN", user="admin", ip="1.2.3.4"),
        make_event(2, "FAILED_LOGIN", user="admin", ip="1.2.3.4"),
        make_event(3, "FAILED_LOGIN", user="admin", ip="1.2.3.4"),
        make_event(4, "FAILED_LOGIN", user="admin", ip="1.2.3.4"),
        make_event(5, "FAILED_LOGIN", user="admin", ip="1.2.3.4"),
        make_event(6, "LOGIN_SUCCESS", user="admin", ip="1.2.3.4"),
        make_event(7, "PRIVILEGE_GRANTED", user="admin", ip="1.2.3.4"),
        make_event(8, "LOGIN_SUCCESS", user="carol", ip="10.0.0.5"),
        make_event(9, "FILE_ACCESS", user="carol", ip="10.0.0.5"),
        make_event(10, "FILE_ACCESS", user="carol", ip="10.0.0.5"),
        make_event(11, "LARGE_DOWNLOAD", user="carol", ip="10.0.0.5"),
    ]

    findings = CorrelationAgent().analyze(events)
    finding_types = {finding.finding_type for finding in findings}

    assert finding_types == {
        "Brute Force Attack",
        "Privilege Escalation",
        "Data Exfiltration",
    }


def test_correlation_agent_sorts_unordered_events_before_analysis():
    events = [
        make_event(4, "LARGE_DOWNLOAD", user="carol"),
        make_event(1, "LOGIN_SUCCESS", user="carol"),
        make_event(3, "FILE_ACCESS", user="carol"),
        make_event(2, "FILE_ACCESS", user="carol"),
    ]

    findings = CorrelationAgent().analyze(events)

    assert len(findings) == 1
    assert findings[0].finding_type == "Data Exfiltration"


def test_correlation_agent_accepts_custom_rules():
    class AlwaysAlertRule(DetectionRule):
        def detect(self, events: list[SecurityEvent]) -> list[SecurityFinding]:
            if not events:
                return []
            return [
                SecurityFinding(
                    finding_type="Custom Rule",
                    severity="LOW",
                    description="Always alert for testing.",
                    affected_user=events[0].user,
                    source_ip=events[0].ip,
                )
            ]

    events = [make_event(1, "LOGIN_SUCCESS", user="tester")]
    findings = CorrelationAgent(rules=[AlwaysAlertRule()]).analyze(events)

    assert len(findings) == 1
    assert findings[0].finding_type == "Custom Rule"


def test_brute_force_rule_can_be_used_independently():
    events = [
        make_event(minute, "FAILED_LOGIN")
        for minute in range(1, 6)
    ] + [make_event(6, "LOGIN_SUCCESS")]

    findings = BruteForceRule().detect(events)

    assert len(findings) == 1


def test_security_finding_model_requires_all_fields():
    with pytest.raises(Exception):
        SecurityFinding(
            finding_type="Test",
            severity="LOW",
            description="Missing fields",
            affected_user="admin",
        )

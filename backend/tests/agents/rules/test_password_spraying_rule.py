import pytest
from datetime import datetime

from app.schemas.security_event import SecurityEvent
from app.schemas.security_finding import SecurityFinding
from agents.rules.password_spraying import PasswordSprayingRule


@pytest.fixture
def password_spraying_rule():
    return PasswordSprayingRule(
        unique_users_threshold=3, time_window_minutes=5
    )  # Lower threshold for easier testing


def create_event(
    timestamp: datetime,
    event_type: str,
    user: str,
    ip: str,
) -> SecurityEvent:
    return SecurityEvent(
        timestamp=timestamp,
        event_type=event_type,
        user=user,
        ip=ip,
    )


def test_password_spraying_successful_detection(password_spraying_rule):
    events = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 1, 0), "FAILED_LOGIN", "user2", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 2, 0), "FAILED_LOGIN", "user3", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 3, 0), "LOGIN_SUCCESS", "user4", "1.1.1.1"),  # Not a failed login
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "userA", "2.2.2.2"), # Different IP
    ]

    findings = password_spraying_rule.detect(events)

    assert len(findings) == 1
    finding = findings[0]
    assert finding.finding_type == "Password Spraying Attack"
    assert finding.severity == "HIGH"
    assert finding.affected_user == "Multiple Users"
    assert finding.source_ip == "1.1.1.1"
    assert "3 unique users (user1, user2, user3)" in finding.description
    assert "3 failed login attempts" in finding.description
    assert "MITRE ATT&CK: T1110.003 - Password Spraying" in finding.description


def test_password_spraying_below_threshold(password_spraying_rule):
    events = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 1, 0), "FAILED_LOGIN", "user2", "1.1.1.1"),
    ]

    findings = password_spraying_rule.detect(events)
    assert len(findings) == 0


def test_password_spraying_events_outside_time_window(password_spraying_rule):
    events = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 1, 0), "FAILED_LOGIN", "user2", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 7, 0), "FAILED_LOGIN", "user3", "1.1.1.1"),  # Outside 5 min window
    ]

    findings = password_spraying_rule.detect(events)
    assert len(findings) == 0  # Should not detect a single campaign spanning too long

    # Test with a separate detection after the window
    events_separated = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 1, 0), "FAILED_LOGIN", "user2", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 10, 0), "FAILED_LOGIN", "userA", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 11, 0), "FAILED_LOGIN", "userB", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 12, 0), "FAILED_LOGIN", "userC", "1.1.1.1"),
    ]
    findings_separated = password_spraying_rule.detect(events_separated)
    assert len(findings_separated) == 1
    finding = findings_separated[0]
    assert finding.source_ip == "1.1.1.1"
    assert "userA, userB, userC" in finding.description # Sorted alphabetically


def test_password_spraying_multiple_ip_addresses(password_spraying_rule):
    events = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 1, 0), "FAILED_LOGIN", "user2", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 2, 0), "FAILED_LOGIN", "user3", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "userA", "2.2.2.2"),
        create_event(datetime(2026, 1, 1, 10, 1, 0), "FAILED_LOGIN", "userB", "2.2.2.2"),
        create_event(datetime(2026, 1, 1, 10, 2, 0), "FAILED_LOGIN", "userC", "2.2.2.2"),
    ]

    findings = password_spraying_rule.detect(events)
    assert len(findings) == 2

    # Check findings for each IP
    ip1_findings = [f for f in findings if f.source_ip == "1.1.1.1"]
    assert len(ip1_findings) == 1
    assert "user1, user2, user3" in ip1_findings[0].description

    ip2_findings = [f for f in findings if f.source_ip == "2.2.2.2"]
    assert len(ip2_findings) == 1
    assert "userA, userB, userC" in ip2_findings[0].description


def test_password_spraying_duplicate_overlapping_windows(password_spraying_rule):
    # Events that could trigger multiple overlapping detections if not handled correctly
    events = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 1, 0), "FAILED_LOGIN", "user2", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 2, 0), "FAILED_LOGIN", "user3", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 3, 0), "FAILED_LOGIN", "user4", "1.1.1.1"), # This event could start a new window
        create_event(datetime(2026, 1, 1, 10, 4, 0), "FAILED_LOGIN", "user5", "1.1.1.1"), # and this
    ]

    findings = password_spraying_rule.detect(events)
    assert len(findings) == 1  # Should only detect one campaign, not multiple overlapping ones
    finding = findings[0]
    assert finding.source_ip == "1.1.1.1"
    # All 5 events fall within the first window (10:00 + 5 min = 10:05).
    # The algorithm collects all events in the window and detects all 5 unique users.
    assert "5 unique users (user1, user2, user3, user4, user5)" in finding.description


    # Test a scenario where a second, distinct campaign occurs after the first one is fully processed.
    events_distinct_campaigns = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 1, 0), "FAILED_LOGIN", "user2", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 2, 0), "FAILED_LOGIN", "user3", "1.1.1.1"), # Campaign 1 detected here (users 1,2,3)
        create_event(datetime(2026, 1, 1, 10, 10, 0), "FAILED_LOGIN", "userA", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 11, 0), "FAILED_LOGIN", "userB", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 12, 0), "FAILED_LOGIN", "userC", "1.1.1.1"), # Campaign 2 detected here (users A,B,C)
    ]
    findings_distinct_campaigns = password_spraying_rule.detect(events_distinct_campaigns)
    assert len(findings_distinct_campaigns) == 2
    finding1 = findings_distinct_campaigns[0]
    finding2 = findings_distinct_campaigns[1]

    assert "user1, user2, user3" in finding1.description
    assert "userA, userB, userC" in finding2.description


def test_password_spraying_configurable_threshold_and_time_window():
    # Test with custom threshold and time window
    rule = PasswordSprayingRule(unique_users_threshold=2, time_window_minutes=1)
    events = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 0, 30), "FAILED_LOGIN", "user2", "1.1.1.1"),
    ]

    findings = rule.detect(events)
    assert len(findings) == 1
    finding = findings[0]
    assert "2 unique users (user1, user2)" in finding.description
    assert "1-minute window" in finding.description


    # Test with custom threshold not met
    rule_high_threshold = PasswordSprayingRule(unique_users_threshold=3, time_window_minutes=1)
    findings_high_threshold = rule_high_threshold.detect(events)
    assert len(findings_high_threshold) == 0

    # Test with custom time window not met
    rule_short_window = PasswordSprayingRule(unique_users_threshold=2, time_window_minutes=0.1)
    events_short_window = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 0, 10), "FAILED_LOGIN", "user2", "1.1.1.1"), # 10 seconds apart, 0.1 min = 6 seconds
    ]
    findings_short_window = rule_short_window.detect(events_short_window)
    assert len(findings_short_window) == 0


def test_password_spraying_empty_event_list(password_spraying_rule):
    events = []
    findings = password_spraying_rule.detect(events)
    assert len(findings) == 0


def test_password_spraying_mixed_event_types(password_spraying_rule):
    events = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "LOGIN_SUCCESS", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 1, 0), "FAILED_LOGIN", "user2", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 2, 0), "AUTHENTICATION_ATTEMPT", "user3", "1.1.1.1"),
    ]

    findings = password_spraying_rule.detect(events)
    assert len(findings) == 0  # Only FAILED_LOGIN should be considered


def test_password_spraying_with_default_thresholds():
    # Test the default configuration: 5 unique users, 5 minute window
    rule = PasswordSprayingRule()
    events = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 0, 30), "FAILED_LOGIN", "user2", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 1, 0), "FAILED_LOGIN", "user3", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 1, 30), "FAILED_LOGIN", "user4", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 2, 0), "FAILED_LOGIN", "user5", "1.1.1.1"), # 5 unique users
    ]
    findings = rule.detect(events)
    assert len(findings) == 1
    finding = findings[0]
    assert "5 unique users (user1, user2, user3, user4, user5)" in finding.description
    assert "5-minute window" in finding.description


def test_password_spraying_edge_case_time_window_exact_boundary():
    rule = PasswordSprayingRule(unique_users_threshold=3, time_window_minutes=5)
    events = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 2, 0), "FAILED_LOGIN", "user2", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 5, 0), "FAILED_LOGIN", "user3", "1.1.1.1"),  # Exactly at window end (10:00 + 5 min)
    ]
    findings = rule.detect(events)
    assert len(findings) == 1
    finding = findings[0]
    assert "3 unique users (user1, user2, user3)" in finding.description


def test_password_spraying_edge_case_time_window_just_outside():
    rule = PasswordSprayingRule(unique_users_threshold=3, time_window_minutes=5)
    events = [
        create_event(datetime(2026, 1, 1, 10, 0, 0), "FAILED_LOGIN", "user1", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 2, 0), "FAILED_LOGIN", "user2", "1.1.1.1"),
        create_event(datetime(2026, 1, 1, 10, 5, 1), "FAILED_LOGIN", "user3", "1.1.1.1"),  # Just outside 5 min window
    ]
    findings = rule.detect(events)
    assert len(findings) == 0


def test_password_spraying_validation_errors():
    with pytest.raises(ValueError, match="unique_users_threshold must be at least 1"):
        PasswordSprayingRule(unique_users_threshold=0)
    with pytest.raises(ValueError, match="time_window_minutes must be a positive number"):
        PasswordSprayingRule(time_window_minutes=0)
    with pytest.raises(ValueError, match="time_window_minutes must be a positive number"):
        PasswordSprayingRule(time_window_minutes=-5)

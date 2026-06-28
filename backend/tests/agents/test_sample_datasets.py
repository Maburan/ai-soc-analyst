"""Verify that every sample dataset triggers exactly the expected findings."""

from pathlib import Path

from agents.correlation_agent import CorrelationAgent
from agents.log_parser_agent import LogParserAgent

SAMPLES_DIR = Path("data/samples")
PARSER = LogParserAgent()
CORRELATOR = CorrelationAgent()


def _run_analysis(relative_path: str) -> tuple:
    """Parse and correlate a sample file. Returns (findings, reports)."""
    path = SAMPLES_DIR / relative_path
    events = PARSER.parse_file(str(path))
    findings = CORRELATOR.analyze(events)
    return events, findings


# ── Linux auth.log samples ──────────────────────────────────────────────

def test_linux_brute_force():
    events, findings = _run_analysis("linux/brute_force.log")
    assert len(events) == 9
    types = [f.finding_type for f in findings]
    assert types == ["Brute Force Attack"]
    assert "svc_app" in findings[0].affected_user
    assert findings[0].source_ip == "203.0.113.50"


def test_linux_password_spraying():
    events, findings = _run_analysis("linux/password_spraying.log")
    assert len(events) == 8
    types = [f.finding_type for f in findings]
    assert types == ["Password Spraying Attack"]
    assert findings[0].source_ip == "198.51.100.20"
    assert "6 unique users" in findings[0].description
    assert findings[0].affected_user == "Multiple Users"


# ── Windows Security log samples ────────────────────────────────────────

def test_windows_brute_force():
    events, findings = _run_analysis("windows/brute_force.log")
    assert len(events) == 8
    types = [f.finding_type for f in findings]
    assert types == ["Brute Force Attack"]
    assert "svc_app" in findings[0].affected_user
    assert findings[0].source_ip == "203.0.113.50"


def test_windows_password_spraying():
    events, findings = _run_analysis("windows/password_spraying.log")
    assert len(events) == 8
    types = [f.finding_type for f in findings]
    assert types == ["Password Spraying Attack"]
    assert findings[0].source_ip == "198.51.100.20"
    assert "6 unique users" in findings[0].description
    assert findings[0].affected_user == "Multiple Users"


def test_windows_privilege_escalation():
    events, findings = _run_analysis("windows/privilege_escalation.log")
    assert len(events) == 4
    types = [f.finding_type for f in findings]
    assert types == ["Privilege Escalation"]
    assert "john" in findings[0].affected_user


def test_windows_post_bruteforce_escalation():
    events, findings = _run_analysis("windows/post_bruteforce_escalation.log")
    assert len(events) == 9
    types = [f.finding_type for f in findings]
    assert "Brute Force Attack" in types
    assert "Privilege Escalation" in types
    assert len(findings) == 2
    # Brute force finding
    bf = [f for f in findings if f.finding_type == "Brute Force Attack"][0]
    assert bf.source_ip == "203.0.113.50"
    assert "svc_app" in bf.affected_user
    # Privilege escalation finding
    pe = [f for f in findings if f.finding_type == "Privilege Escalation"][0]
    assert pe.source_ip == "203.0.113.50"
    assert "svc_app" in pe.affected_user


# ── CSV samples ─────────────────────────────────────────────────────────

def test_csv_brute_force():
    events, findings = _run_analysis("csv/brute_force.csv")
    assert len(events) == 8
    types = [f.finding_type for f in findings]
    assert types == ["Brute Force Attack"]
    assert "svc_app" in findings[0].affected_user
    assert findings[0].source_ip == "203.0.113.50"


def test_csv_password_spraying():
    events, findings = _run_analysis("csv/password_spraying.csv")
    assert len(events) == 8
    types = [f.finding_type for f in findings]
    assert types == ["Password Spraying Attack"]
    assert findings[0].source_ip == "198.51.100.20"
    assert "6 unique users" in findings[0].description
    assert findings[0].affected_user == "Multiple Users"


def test_csv_privilege_escalation():
    events, findings = _run_analysis("csv/privilege_escalation.csv")
    assert len(events) == 4
    types = [f.finding_type for f in findings]
    assert types == ["Privilege Escalation"]
    assert "john" in findings[0].affected_user


def test_csv_data_exfiltration():
    events, findings = _run_analysis("csv/data_exfiltration.csv")
    assert len(events) == 7
    types = [f.finding_type for f in findings]
    assert types == ["Data Exfiltration"]
    assert "bob" in findings[0].affected_user


def test_csv_mixed_attack():
    events, findings = _run_analysis("csv/mixed_attack.csv")
    assert len(events) == 19
    types = [f.finding_type for f in findings]
    # Expect all four detection rules to fire
    assert "Password Spraying Attack" in types
    assert "Brute Force Attack" in types
    assert "Privilege Escalation" in types
    assert "Data Exfiltration" in types
    assert len(findings) == 4
    # Each finding should reference the attacker IP
    for f in findings:
        assert f.source_ip == "203.0.113.50"

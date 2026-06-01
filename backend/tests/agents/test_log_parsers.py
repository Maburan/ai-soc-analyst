from datetime import datetime
from pathlib import Path

import pytest

from agents.log_parser_agent import LogParserAgent
from agents.log_parsers import (
    CsvLogParser,
    LinuxAuthLogParser,
    WindowsSecurityLogParser,
    detect_log_format,
    get_log_parser,
)
from agents.log_parsers.factory import (
    CSV_FORMAT,
    LINUX_AUTH_FORMAT,
    WINDOWS_SECURITY_FORMAT,
)
from app.schemas.security_event import SecurityEvent

PROJECT_ROOT = Path(__file__).resolve().parents[3]
SAMPLE_CSV_FILE = PROJECT_ROOT / "data" / "sample_security_logs.csv"
SAMPLE_AUTH_LOG_FILE = PROJECT_ROOT / "data" / "sample_auth.log"
SAMPLE_WINDOWS_LOG_FILE = PROJECT_ROOT / "data" / "sample_windows_security.log"


def test_detect_log_format_identifies_csv():
    assert detect_log_format(SAMPLE_CSV_FILE) == CSV_FORMAT


def test_detect_log_format_identifies_linux_auth_log():
    assert detect_log_format(SAMPLE_AUTH_LOG_FILE) == LINUX_AUTH_FORMAT


def test_detect_log_format_identifies_windows_security_log():
    assert detect_log_format(SAMPLE_WINDOWS_LOG_FILE) == WINDOWS_SECURITY_FORMAT


def test_detect_log_format_uses_windows_content_over_log_extension(tmp_path):
    windows_content = "2026-06-01 10:01:00 | Event ID: 4625 | Account: admin | IP: 1.2.3.4\n"
    misleading_file = tmp_path / "auth.log"
    misleading_file.write_text(windows_content, encoding="utf-8")

    assert detect_log_format(misleading_file) == WINDOWS_SECURITY_FORMAT


def test_get_log_parser_returns_windows_security_parser():
    parser = get_log_parser(SAMPLE_WINDOWS_LOG_FILE)
    assert isinstance(parser, WindowsSecurityLogParser)


def test_windows_security_log_parser_maps_event_ids():
    parser = WindowsSecurityLogParser()

    failed = parser._build_event("4625", "admin", "1.2.3.4", "2026-06-01 10:01:00", 1)
    success = parser._build_event("4624", "admin", "1.2.3.4", "2026-06-01 10:01:50", 2)
    privilege = parser._build_event("4672", "admin", "1.2.3.4", "2026-06-01 10:02:00", 3)

    assert failed is not None and failed.event_type == "FAILED_LOGIN"
    assert success is not None and success.event_type == "LOGIN_SUCCESS"
    assert privilege is not None and privilege.event_type == "PRIVILEGE_GRANTED"


def test_windows_security_log_parser_parses_compact_lines():
    parser = WindowsSecurityLogParser()
    events = parser.parse(SAMPLE_WINDOWS_LOG_FILE)

    assert len(events) == 9
    assert sum(event.event_type == "FAILED_LOGIN" for event in events) == 6
    assert sum(event.event_type == "LOGIN_SUCCESS" for event in events) == 2
    assert sum(event.event_type == "PRIVILEGE_GRANTED" for event in events) == 1


def test_windows_security_log_parser_parses_event_viewer_block():
    parser = WindowsSecurityLogParser()
    block = """
Log Name: Security
Source: Microsoft-Windows-Security-Auditing
Date: 6/1/2026 10:05:00 AM
Event ID: 4672
Account Name: alice
Source Network Address: 192.168.0.20
""".strip()

    event = parser._parse_block(block, 1)

    assert event is not None
    assert event.event_type == "PRIVILEGE_GRANTED"
    assert event.user == "alice"
    assert event.ip == "192.168.0.20"
    assert event.timestamp == datetime(2026, 6, 1, 10, 5, 0)


def test_windows_security_log_parser_uses_fallback_timestamp_when_missing():
    parser = WindowsSecurityLogParser(default_timestamp=datetime(2026, 1, 1, 0, 0, 0))
    block = "Event ID: 4625\nAccount Name: admin\nSource Network Address: 1.2.3.4"

    event = parser._parse_block(block, 3)

    assert event is not None
    assert event.timestamp.second == 3


def test_log_parser_agent_auto_detects_windows_security_log():
    events = LogParserAgent().parse_file(SAMPLE_WINDOWS_LOG_FILE)

    assert len(events) == 9
    assert any(event.event_type == "PRIVILEGE_GRANTED" for event in events)


def test_detect_log_format_uses_content_over_extension(tmp_path):
    csv_content = (
        "Jun  1 10:01:23 server sshd[1234]: "
        "Failed password for admin from 1.2.3.4 port 45678 ssh2\n"
    )
    misleading_file = tmp_path / "logs.csv"
    misleading_file.write_text(csv_content, encoding="utf-8")

    assert detect_log_format(misleading_file) == LINUX_AUTH_FORMAT


def test_get_log_parser_returns_csv_parser_for_csv_file():
    parser = get_log_parser(SAMPLE_CSV_FILE)
    assert isinstance(parser, CsvLogParser)


def test_get_log_parser_returns_linux_auth_parser_for_auth_log():
    parser = get_log_parser(SAMPLE_AUTH_LOG_FILE)
    assert isinstance(parser, LinuxAuthLogParser)


def test_linux_auth_log_parser_parses_failed_login():
    parser = LinuxAuthLogParser(default_year=2026)
    line = (
        "Jun  1 10:01:23 server sshd[1234]: "
        "Failed password for admin from 1.2.3.4 port 45678 ssh2"
    )

    event = parser._parse_line(line)

    assert event is not None
    assert event.event_type == "FAILED_LOGIN"
    assert event.user == "admin"
    assert event.ip == "1.2.3.4"
    assert event.timestamp == datetime(2026, 6, 1, 10, 1, 23)


def test_linux_auth_log_parser_parses_login_success():
    parser = LinuxAuthLogParser(default_year=2026)
    line = (
        "Jun  1 10:01:45 server sshd[1236]: "
        "Accepted password for admin from 1.2.3.4 port 45680 ssh2"
    )

    event = parser._parse_line(line)

    assert event is not None
    assert event.event_type == "LOGIN_SUCCESS"
    assert event.user == "admin"
    assert event.ip == "1.2.3.4"
    assert event.timestamp == datetime(2026, 6, 1, 10, 1, 45)


def test_linux_auth_log_parser_skips_unrecognized_lines():
    parser = LinuxAuthLogParser(default_year=2026)

    assert parser._parse_line("Jun  1 10:03:00 server systemd[1]: Started Session 42.") is None


def test_linux_auth_log_parser_parses_sample_file():
    parser = LinuxAuthLogParser(default_year=2026)
    events = parser.parse(SAMPLE_AUTH_LOG_FILE)

    assert len(events) == 7
    assert sum(event.event_type == "FAILED_LOGIN" for event in events) == 6
    assert sum(event.event_type == "LOGIN_SUCCESS" for event in events) == 1


def test_csv_log_parser_still_parses_sample_csv():
    events = CsvLogParser().parse(SAMPLE_CSV_FILE)

    assert len(events) == 6
    assert all(isinstance(event, SecurityEvent) for event in events)


def test_log_parser_agent_auto_detects_csv():
    events = LogParserAgent().parse_file(SAMPLE_CSV_FILE)

    assert len(events) == 6
    assert events[0].event_type == "FAILED_LOGIN"


def test_log_parser_agent_auto_detects_auth_log():
    events = LogParserAgent().parse_file(SAMPLE_AUTH_LOG_FILE)

    assert len(events) == 7
    assert any(event.event_type == "LOGIN_SUCCESS" and event.user == "admin" for event in events)
    assert events[0].event_type == "FAILED_LOGIN"
    assert events[0].user == "admin"


def test_detect_log_format_raises_for_unknown_file(tmp_path):
    unknown_file = tmp_path / "notes.txt"
    unknown_file.write_text("plain text only\n", encoding="utf-8")

    with pytest.raises(ValueError, match="Unable to detect log format"):
        detect_log_format(unknown_file)


def test_linux_auth_log_parser_raises_for_missing_file():
    parser = LinuxAuthLogParser()

    with pytest.raises(FileNotFoundError, match="Log file not found"):
        parser.parse("missing-auth.log")

from datetime import datetime
from pathlib import Path

import pytest

from agents.log_parser_agent import LogParserAgent
from agents.log_parsers import (
    CsvLogParser,
    LinuxAuthLogParser,
    detect_log_format,
    get_log_parser,
)
from agents.log_parsers.factory import CSV_FORMAT, LINUX_AUTH_FORMAT
from app.schemas.security_event import SecurityEvent

PROJECT_ROOT = Path(__file__).resolve().parents[3]
SAMPLE_CSV_FILE = PROJECT_ROOT / "data" / "sample_security_logs.csv"
SAMPLE_AUTH_LOG_FILE = PROJECT_ROOT / "data" / "sample_auth.log"


def test_detect_log_format_identifies_csv():
    assert detect_log_format(SAMPLE_CSV_FILE) == CSV_FORMAT


def test_detect_log_format_identifies_linux_auth_log():
    assert detect_log_format(SAMPLE_AUTH_LOG_FILE) == LINUX_AUTH_FORMAT


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

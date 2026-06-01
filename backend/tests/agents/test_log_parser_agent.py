from datetime import datetime
from pathlib import Path

import pytest

from agents.log_parser_agent import LogParserAgent
from app.schemas.security_event import SecurityEvent

PROJECT_ROOT = Path(__file__).resolve().parents[3]
SAMPLE_LOG_FILE = PROJECT_ROOT / "data" / "sample_security_logs.csv"


def test_parse_sample_file_returns_security_events():
    parser = LogParserAgent()
    events = parser.parse_file(SAMPLE_LOG_FILE)

    assert len(events) == 6
    assert all(isinstance(event, SecurityEvent) for event in events)


def test_parse_sample_file_event_types():
    parser = LogParserAgent()
    events = parser.parse_file(SAMPLE_LOG_FILE)
    event_types = [event.event_type for event in events]

    assert event_types.count("FAILED_LOGIN") == 3
    assert event_types.count("LOGIN_SUCCESS") == 1
    assert event_types.count("FILE_ACCESS") == 2


def test_parse_sample_file_parses_timestamp_and_fields():
    parser = LogParserAgent()
    events = parser.parse_file(SAMPLE_LOG_FILE)
    first_event = events[0]

    assert first_event.timestamp == datetime(2026, 6, 1, 10, 1, 0)
    assert first_event.event_type == "FAILED_LOGIN"
    assert first_event.user == "admin"
    assert first_event.ip == "1.2.3.4"


def test_parse_file_missing_file_raises_error():
    parser = LogParserAgent()

    with pytest.raises(FileNotFoundError, match="Log file not found"):
        parser.parse_file("missing.csv")


def test_parse_file_missing_columns_raises_error(tmp_path):
    bad_csv = tmp_path / "bad.csv"
    bad_csv.write_text("timestamp,user\n2026-06-01 10:01:00,admin\n", encoding="utf-8")

    parser = LogParserAgent()

    with pytest.raises(ValueError, match="Missing required columns"):
        parser.parse_file(bad_csv)


def test_parse_file_invalid_timestamp_raises_error(tmp_path):
    bad_csv = tmp_path / "bad.csv"
    bad_csv.write_text(
        "timestamp,event_type,user,ip\n"
        "not-a-date,FAILED_LOGIN,admin,1.2.3.4\n",
        encoding="utf-8",
    )

    parser = LogParserAgent()

    with pytest.raises(ValueError, match="Invalid data on line 2"):
        parser.parse_file(bad_csv)


def test_parse_file_skips_empty_rows(tmp_path):
    csv_file = tmp_path / "with_blank_row.csv"
    csv_file.write_text(
        "timestamp,event_type,user,ip\n"
        "2026-06-01 10:01:00,FAILED_LOGIN,admin,1.2.3.4\n"
        ",,,\n"
        "2026-06-01 10:02:00,LOGIN_SUCCESS,admin,1.2.3.4\n",
        encoding="utf-8",
    )

    parser = LogParserAgent()
    events = parser.parse_file(csv_file)

    assert len(events) == 2

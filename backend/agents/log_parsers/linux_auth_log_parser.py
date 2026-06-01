import re
from datetime import datetime
from pathlib import Path

from agents.log_parsers.base import LogParser
from app.schemas.security_event import SecurityEvent

FAILED_PASSWORD_PATTERN = re.compile(
    r"^(?P<timestamp>\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+\S+\s+sshd\[\d+\]:\s+"
    r"Failed password for (?P<user>\S+) from (?P<ip>[\d.]+) port \d+"
)

ACCEPTED_PASSWORD_PATTERN = re.compile(
    r"^(?P<timestamp>\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+\S+\s+sshd\[\d+\]:\s+"
    r"Accepted password for (?P<user>\S+) from (?P<ip>[\d.]+) port \d+"
)

TIMESTAMP_FORMAT = "%b %d %H:%M:%S"


class LinuxAuthLogParser(LogParser):
    """Parses Linux auth.log SSH authentication events."""

    def __init__(self, default_year: int | None = None) -> None:
        self.default_year = default_year or datetime.now().year

    def parse(self, file_path: str | Path) -> list[SecurityEvent]:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"Log file not found: {path}")

        events: list[SecurityEvent] = []

        with path.open(encoding="utf-8") as log_file:
            for line_number, line in enumerate(log_file, start=1):
                stripped_line = line.strip()
                if not stripped_line:
                    continue

                parsed_event = self._parse_line(stripped_line)
                if parsed_event is None:
                    continue

                try:
                    events.append(parsed_event)
                except Exception as error:
                    raise ValueError(
                        f"Invalid data on line {line_number}: {error}"
                    ) from error

        return events

    def _parse_line(self, line: str) -> SecurityEvent | None:
        failed_match = FAILED_PASSWORD_PATTERN.match(line)
        if failed_match:
            return SecurityEvent(
                timestamp=self._parse_timestamp(failed_match.group("timestamp")),
                event_type="FAILED_LOGIN",
                user=failed_match.group("user"),
                ip=failed_match.group("ip"),
            )

        accepted_match = ACCEPTED_PASSWORD_PATTERN.match(line)
        if accepted_match:
            return SecurityEvent(
                timestamp=self._parse_timestamp(accepted_match.group("timestamp")),
                event_type="LOGIN_SUCCESS",
                user=accepted_match.group("user"),
                ip=accepted_match.group("ip"),
            )

        return None

    def _parse_timestamp(self, timestamp_text: str) -> datetime:
        normalized = " ".join(timestamp_text.split())
        return datetime.strptime(
            f"{normalized} {self.default_year}",
            f"{TIMESTAMP_FORMAT} %Y",
        )

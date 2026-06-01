import re
from datetime import datetime
from pathlib import Path

from agents.log_parsers.base import LogParser
from app.schemas.security_event import SecurityEvent

EVENT_ID_TO_TYPE = {
    "4625": "FAILED_LOGIN",
    "4624": "LOGIN_SUCCESS",
    "4672": "PRIVILEGE_GRANTED",
}

SUPPORTED_EVENT_IDS = set(EVENT_ID_TO_TYPE.keys())

EVENT_ID_PATTERN = re.compile(r"Event\s*ID[:\s]+(?P<event_id>\d+)", re.IGNORECASE)

TIMESTAMP_PATTERNS = [
    re.compile(
        r"(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})",
        re.IGNORECASE,
    ),
    re.compile(
        r"Time Generated[:\s]+(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})",
        re.IGNORECASE,
    ),
    re.compile(
        r"Date[:\s]+(?P<timestamp>\d{1,2}/\d{1,2}/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s*[AP]M)",
        re.IGNORECASE,
    ),
]

USER_PATTERNS = [
    re.compile(r"Target User Name[:\s]+(?P<user>[^\s,|]+)", re.IGNORECASE),
    re.compile(r"Account Name[:\s]+(?P<user>[^\s,|]+)", re.IGNORECASE),
    re.compile(r"Account[:\s]+(?P<user>[^\s,|]+)", re.IGNORECASE),
]

IP_PATTERNS = [
    re.compile(r"Source Network Address[:\s]+(?P<ip>[\d.]+)", re.IGNORECASE),
    re.compile(r"IpAddress[:\s]+(?P<ip>[\d.]+)", re.IGNORECASE),
    re.compile(r"\bIP[:\s]+(?P<ip>[\d.]+)", re.IGNORECASE),
]

COMPACT_LINE_PATTERN = re.compile(
    r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}).*?"
    r"Event\s*ID[:\s]+(?P<event_id>\d+).*?"
    r"(?:Account|Target User Name)[:\s]+(?P<user>[^\s,|]+).*?"
    r"(?:IP|Source Network Address)[:\s]+(?P<ip>[\d.]+)",
    re.IGNORECASE,
)

ISO_TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S"
US_TIMESTAMP_FORMAT = "%m/%d/%Y %I:%M:%S %p"


class WindowsSecurityLogParser(LogParser):
    """Parses text-based exported Windows Security event logs."""

    def __init__(self, default_timestamp: datetime | None = None) -> None:
        self.default_timestamp = default_timestamp or datetime(2000, 1, 1, 0, 0, 0)

    def parse(self, file_path: str | Path) -> list[SecurityEvent]:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"Log file not found: {path}")

        lines = path.read_text(encoding="utf-8").splitlines()
        events: list[SecurityEvent] = []
        line_number = 0
        index = 0

        while index < len(lines):
            stripped = lines[index].strip()
            if not stripped:
                index += 1
                continue

            if stripped.startswith("Log Name:"):
                block_lines: list[str] = []
                while index < len(lines) and lines[index].strip():
                    block_lines.append(lines[index].strip())
                    index += 1

                line_number += 1
                parsed_event = self._parse_block("\n".join(block_lines), line_number)
                if parsed_event is not None:
                    events.append(parsed_event)
                continue

            line_number += 1
            parsed_event = self._parse_block(stripped, line_number)
            if parsed_event is not None:
                events.append(parsed_event)
            index += 1

        return events

    def _parse_block(self, block: str, line_number: int) -> SecurityEvent | None:
        compact_match = COMPACT_LINE_PATTERN.match(block)
        if compact_match:
            return self._build_event(
                event_id=compact_match.group("event_id"),
                user=compact_match.group("user"),
                ip=compact_match.group("ip"),
                timestamp_text=compact_match.group("timestamp"),
                line_number=line_number,
            )

        fields = self._extract_fields(block)
        event_id = fields.get("event_id")

        if event_id is None:
            return None

        return self._build_event(
            event_id=event_id,
            user=fields.get("user", "unknown"),
            ip=fields.get("ip", "0.0.0.0"),
            timestamp_text=fields.get("timestamp"),
            line_number=line_number,
        )

    def _extract_fields(self, text: str) -> dict[str, str]:
        fields: dict[str, str] = {}

        event_match = EVENT_ID_PATTERN.search(text)
        if event_match:
            fields["event_id"] = event_match.group("event_id")

        for pattern in TIMESTAMP_PATTERNS:
            match = pattern.search(text)
            if match:
                fields["timestamp"] = match.group("timestamp").replace("T", " ")
                break

        for pattern in USER_PATTERNS:
            match = pattern.search(text)
            if match:
                user = match.group("user")
                if user.upper() not in {"N/A", "-"}:
                    fields["user"] = user
                    break

        for pattern in IP_PATTERNS:
            match = pattern.search(text)
            if match:
                ip = match.group("ip")
                if ip != "-":
                    fields["ip"] = ip
                    break

        return fields

    def _build_event(
        self,
        event_id: str,
        user: str,
        ip: str,
        timestamp_text: str | None,
        line_number: int,
    ) -> SecurityEvent | None:
        if event_id not in SUPPORTED_EVENT_IDS:
            return None

        event_type = EVENT_ID_TO_TYPE[event_id]
        timestamp = self._parse_timestamp(timestamp_text, line_number)

        return SecurityEvent(
            timestamp=timestamp,
            event_type=event_type,
            user=user,
            ip=ip,
        )

    def _parse_timestamp(self, timestamp_text: str | None, line_number: int) -> datetime:
        if not timestamp_text:
            return self.default_timestamp.replace(
                second=min(line_number % 60, 59),
                microsecond=0,
            )

        normalized = timestamp_text.strip().replace("T", " ")

        for fmt in (ISO_TIMESTAMP_FORMAT, US_TIMESTAMP_FORMAT):
            try:
                return datetime.strptime(normalized, fmt)
            except ValueError:
                continue

        raise ValueError(f"Unsupported timestamp format: {timestamp_text}")

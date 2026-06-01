from pathlib import Path

from agents.log_parsers.factory import get_log_parser
from app.schemas.security_event import SecurityEvent


class LogParserAgent:
    """Reads security log files and converts entries into SecurityEvent objects."""

    def parse_file(self, file_path: str | Path) -> list[SecurityEvent]:
        parser = get_log_parser(file_path)
        return parser.parse(file_path)

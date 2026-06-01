from pathlib import Path

from agents.log_parsers.base import LogParser
from agents.log_parsers.csv_log_parser import CsvLogParser
from agents.log_parsers.linux_auth_log_parser import LinuxAuthLogParser

CSV_FORMAT = "csv"
LINUX_AUTH_FORMAT = "linux_auth"


def read_sample_lines(file_path: Path, max_lines: int = 10) -> list[str]:
    lines: list[str] = []

    with file_path.open(encoding="utf-8") as log_file:
        for line in log_file:
            stripped = line.strip()
            if stripped:
                lines.append(stripped)
            if len(lines) >= max_lines:
                break

    return lines


def looks_like_csv(lines: list[str]) -> bool:
    if not lines:
        return False

    header = lines[0].lower()
    required_tokens = ("timestamp", "event_type", "user", "ip")
    return "," in lines[0] and all(token in header for token in required_tokens)


def looks_like_linux_auth(lines: list[str]) -> bool:
    for line in lines:
        if "sshd[" not in line:
            continue
        if "Failed password for" in line or "Accepted password for" in line:
            return True
    return False


def detect_log_format(file_path: str | Path) -> str:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Log file not found: {path}")

    sample_lines = read_sample_lines(path)
    suffix = path.suffix.lower()
    filename = path.name.lower()

    if looks_like_csv(sample_lines):
        return CSV_FORMAT

    if looks_like_linux_auth(sample_lines):
        return LINUX_AUTH_FORMAT

    if suffix == ".csv":
        return CSV_FORMAT

    if suffix == ".log" or filename in {"auth.log", "secure"}:
        return LINUX_AUTH_FORMAT

    raise ValueError(
        f"Unable to detect log format for '{path.name}'. "
        "Supported formats: CSV security logs and Linux auth.log."
    )


def get_log_parser(file_path: str | Path) -> LogParser:
    log_format = detect_log_format(file_path)

    if log_format == CSV_FORMAT:
        return CsvLogParser()

    if log_format == LINUX_AUTH_FORMAT:
        return LinuxAuthLogParser()

    raise ValueError(f"Unsupported log format: {log_format}")

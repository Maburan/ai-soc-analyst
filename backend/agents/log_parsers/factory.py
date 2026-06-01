import re
from pathlib import Path

from agents.log_parsers.base import LogParser
from agents.log_parsers.csv_log_parser import CsvLogParser
from agents.log_parsers.linux_auth_log_parser import LinuxAuthLogParser
from agents.log_parsers.windows_security_log_parser import WindowsSecurityLogParser

CSV_FORMAT = "csv"
LINUX_AUTH_FORMAT = "linux_auth"
WINDOWS_SECURITY_FORMAT = "windows_security"


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


def looks_like_windows_security(lines: list[str]) -> bool:
    for line in lines:
        if "Microsoft-Windows-Security-Auditing" in line:
            return True
        if re.search(r"Event\s*ID[:\s]*(4624|4625|4672)\b", line, re.IGNORECASE):
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

    if looks_like_windows_security(sample_lines):
        return WINDOWS_SECURITY_FORMAT

    if looks_like_linux_auth(sample_lines):
        return LINUX_AUTH_FORMAT

    if suffix == ".csv":
        return CSV_FORMAT

    if filename in {"sample_windows_security.log", "security.evtx.txt"}:
        return WINDOWS_SECURITY_FORMAT

    if suffix == ".log" or filename in {"auth.log", "secure"}:
        if looks_like_windows_security(read_sample_lines(path, max_lines=50)):
            return WINDOWS_SECURITY_FORMAT
        return LINUX_AUTH_FORMAT

    raise ValueError(
        f"Unable to detect log format for '{path.name}'. "
        "Supported formats: CSV, Linux auth.log, and Windows Security logs."
    )


def get_log_parser(file_path: str | Path) -> LogParser:
    log_format = detect_log_format(file_path)

    if log_format == CSV_FORMAT:
        return CsvLogParser()

    if log_format == LINUX_AUTH_FORMAT:
        return LinuxAuthLogParser()

    if log_format == WINDOWS_SECURITY_FORMAT:
        return WindowsSecurityLogParser()

    raise ValueError(f"Unsupported log format: {log_format}")

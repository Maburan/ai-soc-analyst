import csv
from pathlib import Path

from app.schemas.security_event import SecurityEvent


class LogParserAgent:
    """Reads CSV security logs and converts each row into a SecurityEvent."""

    REQUIRED_COLUMNS = {"timestamp", "event_type", "user", "ip"}

    def parse_file(self, file_path: str | Path) -> list[SecurityEvent]:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"Log file not found: {path}")

        events: list[SecurityEvent] = []

        with path.open(newline="", encoding="utf-8") as csv_file:
            reader = csv.DictReader(csv_file)

            if reader.fieldnames is None:
                raise ValueError("CSV file is empty or missing a header row")

            missing_columns = self.REQUIRED_COLUMNS - set(reader.fieldnames)
            if missing_columns:
                raise ValueError(
                    f"Missing required columns: {', '.join(sorted(missing_columns))}"
                )

            for line_number, row in enumerate(reader, start=2):
                if not any(value and value.strip() for value in row.values()):
                    continue

                try:
                    events.append(
                        SecurityEvent(
                            timestamp=row["timestamp"].strip(),
                            event_type=row["event_type"].strip(),
                            user=row["user"].strip(),
                            ip=row["ip"].strip(),
                        )
                    )
                except Exception as error:
                    raise ValueError(
                        f"Invalid data on line {line_number}: {error}"
                    ) from error

        return events

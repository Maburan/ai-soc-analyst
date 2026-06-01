from app.schemas.security_event import SecurityEvent
from app.schemas.security_finding import SecurityFinding

from agents.rules.base import DetectionRule

MIN_FILE_ACCESS_EVENTS = 2


class DataExfiltrationRule(DetectionRule):
    """Detects possible data exfiltration after login and file access."""

    def detect(self, events: list[SecurityEvent]) -> list[SecurityFinding]:
        findings: list[SecurityFinding] = []
        users = {event.user for event in events}

        for user in users:
            user_events = [event for event in events if event.user == user]

            for index, event in enumerate(user_events):
                if event.event_type != "LOGIN_SUCCESS":
                    continue

                file_access_count = 0
                for follow_up in user_events[index + 1 :]:
                    if follow_up.event_type == "FILE_ACCESS":
                        file_access_count += 1
                        continue

                    if follow_up.event_type != "LARGE_DOWNLOAD":
                        continue

                    if file_access_count >= MIN_FILE_ACCESS_EVENTS:
                        findings.append(
                            SecurityFinding(
                                finding_type="Data Exfiltration",
                                severity="HIGH",
                                description=(
                                    f"User '{user}' logged in, accessed "
                                    f"{file_access_count} files, then performed a "
                                    "large download."
                                ),
                                affected_user=user,
                                source_ip=event.ip,
                            )
                        )
                    break

        return findings

from datetime import datetime, timedelta
from collections import defaultdict
from typing import ClassVar

from app.schemas.security_event import SecurityEvent
from app.schemas.security_finding import SecurityFinding
from agents.rules.base import DetectionRule, sort_events


class PasswordSprayingRule(DetectionRule):
    """
    Detects password spraying attacks: multiple failed logins from the same IP
    against different user accounts within a configurable time window.
    """

    finding_type: ClassVar[str] = "Password Spraying Attack"
    severity: ClassVar[str] = "HIGH"
    mitre_attack_technique: ClassVar[str] = "T1110.003 - Password Spraying"

    def __init__(
        self,
        unique_users_threshold: int = 5,
        time_window_minutes: int = 5,
    ) -> None:
        if unique_users_threshold < 1:
            raise ValueError("unique_users_threshold must be at least 1")
        if time_window_minutes <= 0:
            raise ValueError("time_window_minutes must be a positive number")

        self.unique_users_threshold = unique_users_threshold
        self.time_window = timedelta(minutes=time_window_minutes)

    def detect(self, events: list[SecurityEvent]) -> list[SecurityFinding]:
        findings: list[SecurityFinding] = []
        failed_login_events = [
            event for event in events if event.event_type == "FAILED_LOGIN"
        ]

        if not failed_login_events:
            return []

        # Group events by source IP
        events_by_ip = defaultdict(list)
        for event in failed_login_events:
            if event.ip:
                events_by_ip[event.ip].append(event)

        for ip, ip_events in events_by_ip.items():
            # Sort events for each IP by timestamp to facilitate sliding window
            sorted_ip_events = sort_events(ip_events)

            i = 0
            while i < len(sorted_ip_events):
                current_event = sorted_ip_events[i]
                window_start_time = current_event.timestamp
                window_end_time = window_start_time + self.time_window

                candidate_events_in_window = []
                unique_users_in_window = set()
                failed_attempts_count = 0
                max_event_time_in_window = current_event.timestamp

                j = i
                # Collect all relevant events for the current potential window
                while j < len(sorted_ip_events) and sorted_ip_events[j].timestamp <= window_end_time:
                    event_in_window = sorted_ip_events[j]
                    candidate_events_in_window.append(event_in_window)
                    unique_users_in_window.add(event_in_window.user)
                    failed_attempts_count += 1
                    max_event_time_in_window = max(max_event_time_in_window, event_in_window.timestamp)
                    j += 1

                if len(unique_users_in_window) >= self.unique_users_threshold:
                    # A password spraying campaign is detected
                    targeted_users_list = sorted(list(unique_users_in_window))
                    description = (
                        f"A password spraying attack was detected from IP {ip}. "
                        f"{failed_attempts_count} failed login attempts targeted "
                        f"{len(unique_users_in_window)} unique users "
                        f"({', '.join(targeted_users_list)}) "
                        f"within a {self.time_window.total_seconds() / 60:.0f}-minute window. "
                        f"MITRE ATT&CK: {self.mitre_attack_technique}."
                    )
                    findings.append(
                        SecurityFinding(
                            finding_type=self.finding_type,
                            severity=self.severity,
                            description=description,
                            affected_user="Multiple Users",
                            source_ip=ip,
                        )
                    )
                    # Advance 'i' past the end of this detected window to avoid duplicate findings
                    # This ensures that events contributing to *this* finding are not re-evaluated for a new, overlapping finding.
                    # It jumps 'i' to the first event *after* the current detection window.
                    while i < len(sorted_ip_events) and sorted_ip_events[i].timestamp <= max_event_time_in_window:
                        i += 1
                else:
                    # No detection in this window, move to the next event to start a new potential window
                    i += 1
        return findings

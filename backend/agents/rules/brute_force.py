from app.schemas.security_event import SecurityEvent
from app.schemas.security_finding import SecurityFinding

from agents.rules.base import DetectionRule

MIN_FAILED_LOGINS = 5


class BruteForceRule(DetectionRule):
    """Detects brute force when failed logins are followed by a successful login."""

    def detect(self, events: list[SecurityEvent]) -> list[SecurityFinding]:
        findings: list[SecurityFinding] = []
        user_ip_pairs = {(event.user, event.ip) for event in events}

        for user, ip in user_ip_pairs:
            pair_events = [
                event for event in events if event.user == user and event.ip == ip
            ]

            failed_login_count = 0
            for event in pair_events:
                if event.event_type == "FAILED_LOGIN":
                    failed_login_count += 1
                    continue

                if event.event_type != "LOGIN_SUCCESS":
                    continue

                if failed_login_count >= MIN_FAILED_LOGINS:
                    findings.append(
                        SecurityFinding(
                            finding_type="Brute Force Attack",
                            severity="HIGH",
                            description=(
                                f"{failed_login_count} failed login attempts followed by "
                                f"a successful login for user '{user}' from IP {ip}."
                            ),
                            affected_user=user,
                            source_ip=ip,
                        )
                    )

                failed_login_count = 0

        return findings

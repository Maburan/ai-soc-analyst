from app.schemas.security_event import SecurityEvent
from app.schemas.security_finding import SecurityFinding

from agents.rules.base import DetectionRule


class PrivilegeEscalationRule(DetectionRule):
    """Detects privilege escalation after a successful login."""

    def detect(self, events: list[SecurityEvent]) -> list[SecurityFinding]:
        findings: list[SecurityFinding] = []
        users = {event.user for event in events}

        for user in users:
            user_events = [event for event in events if event.user == user]
            has_login_success = False
            login_ip = ""

            for event in user_events:
                if event.event_type == "LOGIN_SUCCESS":
                    has_login_success = True
                    login_ip = event.ip
                    continue

                if event.event_type != "PRIVILEGE_GRANTED":
                    continue

                if has_login_success:
                    findings.append(
                        SecurityFinding(
                            finding_type="Privilege Escalation",
                            severity="CRITICAL",
                            description=(
                                f"User '{user}' logged in successfully and was granted "
                                "elevated privileges."
                            ),
                            affected_user=user,
                            source_ip=login_ip or event.ip,
                        )
                    )

                has_login_success = False
                login_ip = ""

        return findings

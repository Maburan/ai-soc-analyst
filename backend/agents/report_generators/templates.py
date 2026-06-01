from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_finding import SecurityFinding

BRUTE_FORCE_ATTACK = "Brute Force Attack"
PRIVILEGE_ESCALATION = "Privilege Escalation"
DATA_EXFILTRATION = "Data Exfiltration"


def build_brute_force_report(finding: SecurityFinding) -> InvestigationReport:
    return InvestigationReport(
        incident_title=get_incident_title(finding),
        severity=get_incident_severity(finding),
        summary=(
            f"A brute force attack was detected against user "
            f"'{finding.affected_user}' from IP address {finding.source_ip}. "
            f"Multiple failed login attempts were followed by a successful login, "
            f"indicating a possible credential compromise."
        ),
        evidence=[
            finding.description,
            f"Affected user: {finding.affected_user}",
            f"Source IP: {finding.source_ip}",
            f"Finding severity: {finding.severity}",
        ],
        recommendations=[
            "Reset the affected user's password immediately.",
            "Force logout of all active sessions for the account.",
            "Block or rate-limit the source IP at the firewall or WAF.",
            "Review authentication logs for additional failed login attempts.",
            "Enable or verify multi-factor authentication for the account.",
        ],
    )


def build_privilege_escalation_report(finding: SecurityFinding) -> InvestigationReport:
    return InvestigationReport(
        incident_title=get_incident_title(finding),
        severity=get_incident_severity(finding),
        summary=(
            f"User '{finding.affected_user}' successfully authenticated and was "
            f"subsequently granted elevated privileges from IP {finding.source_ip}. "
            f"This pattern may indicate unauthorized access or abuse of admin rights."
        ),
        evidence=[
            finding.description,
            f"Affected user: {finding.affected_user}",
            f"Source IP: {finding.source_ip}",
            f"Finding severity: {finding.severity}",
        ],
        recommendations=[
            "Verify whether the privilege grant was authorized and expected.",
            "Review recent role and permission changes for the account.",
            "Temporarily suspend elevated privileges pending investigation.",
            "Audit actions performed by the account after privilege escalation.",
            "Confirm the source IP belongs to a trusted location or VPN endpoint.",
        ],
    )


def build_data_exfiltration_report(finding: SecurityFinding) -> InvestigationReport:
    return InvestigationReport(
        incident_title=get_incident_title(finding),
        severity=get_incident_severity(finding),
        summary=(
            f"User '{finding.affected_user}' logged in from IP {finding.source_ip}, "
            f"accessed multiple files, and then performed a large download. "
            f"This sequence is consistent with potential data exfiltration activity."
        ),
        evidence=[
            finding.description,
            f"Affected user: {finding.affected_user}",
            f"Source IP: {finding.source_ip}",
            f"Finding severity: {finding.severity}",
        ],
        recommendations=[
            "Identify which files were accessed and downloaded.",
            "Quarantine or disable the affected account if exfiltration is confirmed.",
            "Inspect outbound network traffic from the source IP during the incident window.",
            "Notify the data owner and incident response team.",
            "Preserve logs and file access records for forensic analysis.",
        ],
    )


REPORT_BUILDERS = {
    BRUTE_FORCE_ATTACK: build_brute_force_report,
    PRIVILEGE_ESCALATION: build_privilege_escalation_report,
    DATA_EXFILTRATION: build_data_exfiltration_report,
}

INCIDENT_TITLE_BUILDERS = {
    BRUTE_FORCE_ATTACK: lambda finding: (
        f"Brute Force Attack Targeting {finding.affected_user}"
    ),
    PRIVILEGE_ESCALATION: lambda finding: (
        f"Privilege Escalation by {finding.affected_user}"
    ),
    DATA_EXFILTRATION: lambda finding: (
        f"Possible Data Exfiltration by {finding.affected_user}"
    ),
}


def get_incident_title(finding: SecurityFinding) -> str:
    builder = INCIDENT_TITLE_BUILDERS.get(finding.finding_type)

    if builder is None:
        raise ValueError(
            f"No report template available for finding type: {finding.finding_type}"
        )

    return builder(finding)


def get_incident_severity(finding: SecurityFinding) -> str:
    return finding.severity

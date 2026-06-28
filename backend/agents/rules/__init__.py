from agents.rules.base import DetectionRule
from agents.rules.brute_force import BruteForceRule
from agents.rules.data_exfiltration import DataExfiltrationRule
from agents.rules.privilege_escalation import PrivilegeEscalationRule
from agents.rules.password_spraying import PasswordSprayingRule

DEFAULT_RULES: list[DetectionRule] = [
    BruteForceRule(),
    PrivilegeEscalationRule(),
    DataExfiltrationRule(),
    PasswordSprayingRule(),
]

__all__ = [
    "BruteForceRule",
    "DataExfiltrationRule",
    "DEFAULT_RULES",
    "DetectionRule",
    "PrivilegeEscalationRule",
    "PasswordSprayingRule",
]

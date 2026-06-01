from agents.rules.base import DetectionRule
from agents.rules.brute_force import BruteForceRule
from agents.rules.data_exfiltration import DataExfiltrationRule
from agents.rules.privilege_escalation import PrivilegeEscalationRule

DEFAULT_RULES: list[DetectionRule] = [
    BruteForceRule(),
    PrivilegeEscalationRule(),
    DataExfiltrationRule(),
]

__all__ = [
    "BruteForceRule",
    "DataExfiltrationRule",
    "DEFAULT_RULES",
    "DetectionRule",
    "PrivilegeEscalationRule",
]

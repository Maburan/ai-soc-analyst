export interface MitreTechnique {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const MITRE_MAPPING: Record<string, MitreTechnique> = {
  "Brute Force Attack": {
    id: "T1110",
    name: "Brute Force",
    category: "Credential Access",
    description:
      "Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained.",
  },
  "Password Spraying Attack": {
    id: "T1110.003",
    name: "Password Spraying",
    category: "Credential Access",
    description:
      "Adversaries may use a single or small list of commonly used passwords against many different accounts to attempt credential access.",
  },
  "Privilege Escalation": {
    id: "T1068",
    name: "Exploitation for Privilege Escalation",
    category: "Privilege Escalation",
    description:
      "Adversaries may exploit software vulnerabilities to gain elevated permissions on a system or account.",
  },
  "Data Exfiltration": {
    id: "T1048",
    name: "Exfiltration Over Alternative Protocol",
    category: "Exfiltration",
    description:
      "Adversaries may steal data by exfiltrating it over a different protocol than that of the existing command and control channel.",
  },
};

export function getMitreTechnique(findingType: string): MitreTechnique | null {
  return MITRE_MAPPING[findingType] ?? null;
}

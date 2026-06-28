# Sample Attack Datasets

Each file in this directory demonstrates a realistic security attack scenario designed
to exercise specific `DetectionRule` implementations in the AI SOC Analyst pipeline.

---

## Limitations by Format

The native log parsers (`LinuxAuthLogParser`, `WindowsSecurityLogParser`) only
support a subset of the event types that the CSV parser supports. This restricts
which attack scenarios can be demonstrated in each format.

| Event Type | CSV   | Linux auth.log | Windows Security |
|------------|-------|----------------|------------------|
| `FAILED_LOGIN` | ✓ | ✓ (sshd) | ✓ (4625) |
| `LOGIN_SUCCESS` | ✓ | ✓ (sshd) | ✓ (4624) |
| `PRIVILEGE_GRANTED` | ✓ | ✗ | ✓ (4672) |
| `FILE_ACCESS` | ✓ | ✗ | ✗ |
| `LARGE_DOWNLOAD` | ✓ | ✗ | ✗ |

---

## Linux Samples (`linux/`)

### `brute_force.log`

- **Attack:** An external attacker (203.0.113.50) repeatedly attempts SSH passwords
  against the `svc_app` account and eventually succeeds.
- **Detection rule(s):** `BruteForceRule`
- **Expected findings:** 1 finding — `Brute Force Attack` (HIGH) for user `svc_app`
- **Timeline:**
  - 08:30 — Normal login: `devops` from internal IP
  - 08:32 — Normal login: `jenkins` from internal IP
  - **08:45:00–08:45:12** — 5× FAILED_LOGIN for `svc_app` from 203.0.113.50
  - **08:45:15** — LOGIN_SUCCESS for `svc_app` from 203.0.113.50 (threshold met)
  - 08:50 — Normal login: `admin` from internal IP

### `password_spraying.log`

- **Attack:** An attacker (198.51.100.20) tries the same weak password against many
  different user accounts (`alice`, `bob`, `carol`, `dave`, `eve`, `frank`) via SSH.
- **Detection rule(s):** `PasswordSprayingRule`
- **Expected findings:** 1 finding — `Password Spraying Attack` (HIGH) from IP
  198.51.100.20, targeting 6 unique users
- **Timeline:**
  - 08:55 — Normal login: `admin` from internal IP
  - **09:00:00–09:00:25** — 6× FAILED_LOGIN for 6 different users from 198.51.100.20
  - 09:02 — Normal login: `admin` from internal IP

---

## Windows Samples (`windows/`)

### `brute_force.log`

- **Attack:** An external attacker (203.0.113.50) repeatedly attempts RDP/logon
  against `svc_app` and eventually succeeds.
- **Detection rule(s):** `BruteForceRule`
- **Expected findings:** 1 finding — `Brute Force Attack` (HIGH) for user `svc_app`
- **Timeline:**
  - 08:30 — Normal logon: `admin` from internal IP
  - **08:45:00–08:45:12** — 5× Event ID 4625 for `svc_app` from 203.0.113.50
  - **08:45:15** — Event ID 4624 for `svc_app` from 203.0.113.50 (threshold met)
  - 08:50 — Normal logon: `backup` from internal IP

### `password_spraying.log`

- **Attack:** An attacker (198.51.100.20) attempts logon against 6 different accounts.
- **Detection rule(s):** `PasswordSprayingRule`
- **Expected findings:** 1 finding — `Password Spraying Attack` (HIGH) from IP
  198.51.100.20, targeting 6 unique users
- **Timeline:**
  - 08:55 — Normal logon: `admin` from internal IP
  - **09:00:00–09:00:25** — 6× Event ID 4625 for 6 different users from 198.51.100.20
  - 09:02 — Normal logon: `admin` from internal IP

### `privilege_escalation.log`

- **Attack:** After a legitimate logon, user `john` is granted administrative
  privileges (Event ID 4672).
- **Detection rule(s):** `PrivilegeEscalationRule`
- **Expected findings:** 1 finding — `Privilege Escalation` (MEDIUM) for user `john`
- **Timeline:**
  - 09:59 — Normal logon: `admin` from internal IP
  - **10:00** — LOGIN_SUCCESS for `john` from 10.0.0.50
  - **10:01** — PRIVILEGE_GRANTED for `john` from 10.0.0.50
  - 10:05 — Normal logon: `admin` from internal IP

### `post_bruteforce_escalation.log`

- **Attack:** An attacker (203.0.113.50) brute-forces the `svc_app` account,
  successfully logs in, then escalates privileges. This is a common two-step
  attack chain.
- **Detection rule(s):** `BruteForceRule`, `PrivilegeEscalationRule`
- **Expected findings:** 2 findings
  1. `Brute Force Attack` (HIGH) for user `svc_app` from 203.0.113.50
  2. `Privilege Escalation` (MEDIUM) for user `svc_app` from 203.0.113.50
- **Timeline:**
  - 10:55 — Normal logon: `admin` from internal IP
  - **11:00:00–11:00:12** — 5× Event ID 4625 for `svc_app` from 203.0.113.50
  - **11:00:15** — Event ID 4624 for `svc_app` from 203.0.113.50 (brute force threshold met)
  - **11:01** — Event ID 4672 for `svc_app` from 203.0.113.50 (privilege escalation)
  - 11:05 — Normal logon: `admin` from internal IP

---

## CSV Samples (`csv/`)

CSV samples use the standard `timestamp,event_type,user,ip` schema and can express
the full range of event types. These are the best choice for demonstrations.

### `brute_force.csv`

- **Attack:** 5× FAILED_LOGIN + LOGIN_SUCCESS for `svc_app` from 203.0.113.50.
- **Detection rule(s):** `BruteForceRule`
- **Expected findings:** 1 — `Brute Force Attack` (HIGH), user `svc_app`

### `password_spraying.csv`

- **Attack:** 6× FAILED_LOGIN targeting 6 different users from 198.51.100.20.
- **Detection rule(s):** `PasswordSprayingRule`
- **Expected findings:** 1 — `Password Spraying Attack` (HIGH), 6 unique users

### `privilege_escalation.csv`

- **Attack:** LOGIN_SUCCESS + PRIVILEGE_GRANTED for user `john` from 10.0.0.50.
- **Detection rule(s):** `PrivilegeEscalationRule`
- **Expected findings:** 1 — `Privilege Escalation` (MEDIUM), user `john`

### `data_exfiltration.csv`

- **Attack:** User `bob` logs in, accesses multiple files, then performs a large
  download — classic data exfiltration pattern.
- **Detection rule(s):** `DataExfiltrationRule`
- **Expected findings:** 1 — `Data Exfiltration` (HIGH), user `bob`

### `mixed_attack.csv`

- **Attack:** A full multi-stage attack from a single external IP (203.0.113.50):
  1. Password spraying against 5+ accounts
  2. Brute force on `svc_app` until successful login
  3. Privilege escalation via `svc_app`
  4. File access and large download (data exfiltration)
- **Detection rule(s):** `PasswordSprayingRule`, `BruteForceRule`,
  `PrivilegeEscalationRule`, `DataExfiltrationRule`
- **Expected findings:** 4 findings (one from each rule)
  1. `Password Spraying Attack` (HIGH) — 203.0.113.50 against 5 users
  2. `Brute Force Attack` (HIGH) — `svc_app` from 203.0.113.50
  3. `Privilege Escalation` (MEDIUM) — `svc_app` from 203.0.113.50
  4. `Data Exfiltration` (HIGH) — `svc_app` from 203.0.113.50
- **Timeline:**
  - 08:00–08:30 — Normal activity: admin, alice logins from internal IPs
  - **09:00:00–09:00:20** — FAILED_LOGIN for alice, bob, carol, dave, eve
    from 203.0.113.50 (password spraying)
  - **09:05:00–09:05:12** — 5× FAILED_LOGIN for `svc_app` from 203.0.113.50
  - **09:05:15** — LOGIN_SUCCESS for `svc_app` (brute force)
  - **09:06:00** — PRIVILEGE_GRANTED for `svc_app` (privilege escalation)
  - **09:10:00–09:12:00** — 3× FILE_ACCESS by `svc_app`
  - **09:13:00** — LARGE_DOWNLOAD by `svc_app` (data exfiltration)
  - 10:00 — Normal activity: admin login from internal IP

---

## How to Use

Upload any `.csv` or `.log` file through the web interface at
`http://localhost:5173` and click **Analyze**. The system will auto-detect the
format, parse the events, and display the resulting findings and investigation
reports.

To analyse programmatically:

```python
from agents.log_parser_agent import LogParserAgent
from agents.correlation_agent import CorrelationAgent

parser = LogParserAgent()
correlator = CorrelationAgent()

events = parser.parse_file("data/samples/csv/mixed_attack.csv")
findings = correlator.analyze(events)

for finding in findings:
    print(f"{finding.severity} — {finding.finding_type}: {finding.description}")
```

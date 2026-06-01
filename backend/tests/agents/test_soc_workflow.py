from datetime import datetime, timedelta
from pathlib import Path

import pytest

from agents.correlation_agent import CorrelationAgent
from agents.graphs.nodes import (
    correlate_events,
    generate_reports,
    investigate_findings,
    parse_logs,
)
from agents.graphs.runner import SOCWorkflowRunner
from agents.graphs.workflow import build_soc_workflow_graph
from agents.investigation_agent import InvestigationAgent
from agents.log_parser_agent import LogParserAgent
from app.schemas.investigation_report import InvestigationReport
from app.schemas.security_event import SecurityEvent
from app.schemas.security_finding import SecurityFinding

PROJECT_ROOT = Path(__file__).resolve().parents[3]
SAMPLE_LOG_FILE = PROJECT_ROOT / "data" / "sample_security_logs.csv"
BASE_TIME = datetime(2026, 6, 1, 10, 0, 0)


def make_brute_force_csv(tmp_path: Path) -> Path:
    csv_path = tmp_path / "brute_force.csv"
    csv_path.write_text(
        "timestamp,event_type,user,ip\n"
        "2026-06-01 10:01:00,FAILED_LOGIN,admin,1.2.3.4\n"
        "2026-06-01 10:02:00,FAILED_LOGIN,admin,1.2.3.4\n"
        "2026-06-01 10:03:00,FAILED_LOGIN,admin,1.2.3.4\n"
        "2026-06-01 10:04:00,FAILED_LOGIN,admin,1.2.3.4\n"
        "2026-06-01 10:05:00,FAILED_LOGIN,admin,1.2.3.4\n"
        "2026-06-01 10:06:00,LOGIN_SUCCESS,admin,1.2.3.4\n",
        encoding="utf-8",
    )
    return csv_path


def test_parse_logs_node_populates_security_events():
    state = {"log_file_path": str(SAMPLE_LOG_FILE)}
    result = parse_logs(state, LogParserAgent())

    assert len(result["security_events"]) == 6
    assert all(isinstance(event, SecurityEvent) for event in result["security_events"])


def test_correlate_events_node_populates_findings():
    events = [
        SecurityEvent(
            timestamp=BASE_TIME + timedelta(minutes=minute),
            event_type="FAILED_LOGIN",
            user="admin",
            ip="1.2.3.4",
        )
        for minute in range(1, 6)
    ] + [
        SecurityEvent(
            timestamp=BASE_TIME + timedelta(minutes=6),
            event_type="LOGIN_SUCCESS",
            user="admin",
            ip="1.2.3.4",
        )
    ]

    result = correlate_events({"security_events": events}, CorrelationAgent())

    assert len(result["security_findings"]) == 1
    assert result["security_findings"][0].finding_type == "Brute Force Attack"


def test_investigate_findings_node_populates_reports():
    findings = [
        SecurityFinding(
            finding_type="Brute Force Attack",
            severity="HIGH",
            description="5 failed login attempts followed by a successful login.",
            affected_user="admin",
            source_ip="1.2.3.4",
        )
    ]

    result = investigate_findings(
        {"security_findings": findings},
        InvestigationAgent(),
    )

    assert len(result["investigation_reports"]) == 1
    assert isinstance(result["investigation_reports"][0], InvestigationReport)


def test_generate_reports_node_validates_report_count():
    findings = [
        SecurityFinding(
            finding_type="Brute Force Attack",
            severity="HIGH",
            description="Test finding.",
            affected_user="admin",
            source_ip="1.2.3.4",
        )
    ]
    reports = InvestigationAgent().investigate(findings)

    result = generate_reports(
        {
            "security_findings": findings,
            "investigation_reports": reports,
        }
    )

    assert result["investigation_reports"] == reports


def test_generate_reports_node_raises_when_counts_mismatch():
    findings = [
        SecurityFinding(
            finding_type="Brute Force Attack",
            severity="HIGH",
            description="Test finding.",
            affected_user="admin",
            source_ip="1.2.3.4",
        )
    ]

    with pytest.raises(ValueError, match="Report count does not match finding count"):
        generate_reports(
            {
                "security_findings": findings,
                "investigation_reports": [],
            }
        )


def test_workflow_graph_runs_all_nodes_in_order(tmp_path):
    csv_path = make_brute_force_csv(tmp_path)
    graph = build_soc_workflow_graph()
    result = graph.invoke({"log_file_path": str(csv_path)})

    assert len(result["security_events"]) == 6
    assert len(result["security_findings"]) == 1
    assert len(result["investigation_reports"]) == 1
    assert "Brute Force Attack" in result["investigation_reports"][0].incident_title
    assert result["investigation_reports"][0].severity == "HIGH"


def test_workflow_runner_runs_end_to_end(tmp_path):
    csv_path = make_brute_force_csv(tmp_path)
    result = SOCWorkflowRunner().run(csv_path)

    assert result["log_file_path"] == str(csv_path)
    assert len(result["security_events"]) == 6
    assert len(result["security_findings"]) >= 1
    assert len(result["investigation_reports"]) == len(result["security_findings"])


def test_workflow_runner_returns_empty_findings_for_benign_logs():
    result = SOCWorkflowRunner().run(SAMPLE_LOG_FILE)

    assert len(result["security_events"]) == 6
    assert result["security_findings"] == []
    assert result["investigation_reports"] == []


def test_workflow_runner_raises_for_missing_log_file():
    with pytest.raises(FileNotFoundError, match="Log file not found"):
        SOCWorkflowRunner().run("missing-log-file.csv")


def test_workflow_runner_accepts_injected_agents(tmp_path):
    csv_path = make_brute_force_csv(tmp_path)

    class RecordingParser(LogParserAgent):
        def __init__(self) -> None:
            self.called_with = None

        def parse_file(self, file_path):
            self.called_with = file_path
            return super().parse_file(file_path)

    parser = RecordingParser()
    SOCWorkflowRunner(log_parser=parser).run(csv_path)

    assert parser.called_with == str(csv_path)

from agents.correlation_agent import CorrelationAgent
from agents.graphs.state import SOCWorkflowState
from agents.investigation_agent import InvestigationAgent
from agents.log_parser_agent import LogParserAgent


def parse_logs(
    state: SOCWorkflowState,
    log_parser: LogParserAgent,
) -> SOCWorkflowState:
    events = log_parser.parse_file(state["log_file_path"])
    return {"security_events": events}


def correlate_events(
    state: SOCWorkflowState,
    correlation_agent: CorrelationAgent,
) -> SOCWorkflowState:
    events = state.get("security_events", [])
    findings = correlation_agent.analyze(events)
    return {"security_findings": findings}


def investigate_findings(
    state: SOCWorkflowState,
    investigation_agent: InvestigationAgent,
) -> SOCWorkflowState:
    findings = state.get("security_findings", [])
    reports = investigation_agent.investigate(findings)
    return {"investigation_reports": reports}


def generate_reports(state: SOCWorkflowState) -> SOCWorkflowState:
    findings = state.get("security_findings", [])
    reports = state.get("investigation_reports", [])

    if findings and len(reports) != len(findings):
        raise ValueError(
            "Report count does not match finding count: "
            f"{len(reports)} reports for {len(findings)} findings."
        )

    for report in reports:
        if not report.incident_title or not report.summary:
            raise ValueError("Generated report is missing required content.")

    return {"investigation_reports": reports}

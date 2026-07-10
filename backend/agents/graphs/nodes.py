import time

from agents.correlation_agent import CorrelationAgent
from agents.graphs.state import SOCWorkflowState
from agents.investigation_agent import InvestigationAgent
from agents.log_parser_agent import LogParserAgent
from agents.log_parsers.factory import detect_log_format


def parse_logs(
    state: SOCWorkflowState,
    log_parser: LogParserAgent,
) -> SOCWorkflowState:
    start_time = time.perf_counter()
    events = log_parser.parse_file(state["log_file_path"])
    detected_format = detect_log_format(state["log_file_path"])
    return {
        "security_events": events,
        "detected_log_format": detected_format,
        "events_parsed": len(events),
        "analysis_start_time": start_time,
    }


def correlate_events(
    state: SOCWorkflowState,
    correlation_agent: CorrelationAgent,
) -> SOCWorkflowState:
    events = state.get("security_events", [])
    findings = correlation_agent.analyze(events)
    return {
        "security_findings": findings,
        "events_correlated": len(events),
        "rules_executed": len(correlation_agent.rules),
        "findings_generated": len(findings),
    }


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

    start_time = state.get("analysis_start_time")
    if start_time is not None:
        duration_ms = int((time.perf_counter() - start_time) * 1000)
    else:
        duration_ms = 0

    return {
        "investigation_reports": reports,
        "analysis_duration_ms": duration_ms,
    }

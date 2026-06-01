from langgraph.graph import END, START, StateGraph

from agents.correlation_agent import CorrelationAgent
from agents.graphs.nodes import (
    correlate_events,
    generate_reports,
    investigate_findings,
    parse_logs,
)
from agents.graphs.state import SOCWorkflowState
from agents.investigation_agent import InvestigationAgent
from agents.log_parser_agent import LogParserAgent


def build_soc_workflow_graph(
    log_parser: LogParserAgent | None = None,
    correlation_agent: CorrelationAgent | None = None,
    investigation_agent: InvestigationAgent | None = None,
):
    parser = log_parser or LogParserAgent()
    correlator = correlation_agent or CorrelationAgent()
    investigator = investigation_agent or InvestigationAgent()

    graph = StateGraph(SOCWorkflowState)

    graph.add_node(
        "parse_logs",
        lambda state: parse_logs(state, parser),
    )
    graph.add_node(
        "correlate_events",
        lambda state: correlate_events(state, correlator),
    )
    graph.add_node(
        "investigate_findings",
        lambda state: investigate_findings(state, investigator),
    )
    graph.add_node("generate_reports", generate_reports)

    graph.add_edge(START, "parse_logs")
    graph.add_edge("parse_logs", "correlate_events")
    graph.add_edge("correlate_events", "investigate_findings")
    graph.add_edge("investigate_findings", "generate_reports")
    graph.add_edge("generate_reports", END)

    return graph.compile()

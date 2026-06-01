from pathlib import Path

from agents.correlation_agent import CorrelationAgent
from agents.graphs.state import SOCWorkflowState
from agents.graphs.workflow import build_soc_workflow_graph
from agents.investigation_agent import InvestigationAgent
from agents.log_parser_agent import LogParserAgent


class SOCWorkflowRunner:
    """Runs the SOC analyst LangGraph workflow end to end."""

    def __init__(
        self,
        log_parser: LogParserAgent | None = None,
        correlation_agent: CorrelationAgent | None = None,
        investigation_agent: InvestigationAgent | None = None,
    ) -> None:
        self.graph = build_soc_workflow_graph(
            log_parser=log_parser,
            correlation_agent=correlation_agent,
            investigation_agent=investigation_agent,
        )

    def run(self, log_file_path: str | Path) -> SOCWorkflowState:
        initial_state: SOCWorkflowState = {
            "log_file_path": str(log_file_path),
            "security_events": [],
            "security_findings": [],
            "investigation_reports": [],
        }
        return self.graph.invoke(initial_state)

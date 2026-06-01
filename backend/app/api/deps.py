from fastapi import Depends

from agents.graphs.runner import SOCWorkflowRunner
from app.services.analysis_service import AnalysisService


def get_workflow_runner() -> SOCWorkflowRunner:
    return SOCWorkflowRunner()


def get_analysis_service(
    runner: SOCWorkflowRunner = Depends(get_workflow_runner),
) -> AnalysisService:
    return AnalysisService(runner=runner)

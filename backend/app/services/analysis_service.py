from pathlib import Path
from tempfile import NamedTemporaryFile

from agents.graphs.runner import SOCWorkflowRunner
from app.schemas.analyze import AnalysisMetadata, AnalyzeResponse


class AnalysisValidationError(ValueError):
    """Raised when an uploaded file fails API validation."""


class AnalysisService:
    """Runs the SOC workflow against uploaded security log files."""

    SUPPORTED_EXTENSIONS = {".csv", ".log"}

    def __init__(self, runner: SOCWorkflowRunner) -> None:
        self.runner = runner

    def analyze_upload(self, filename: str, file_content: bytes) -> AnalyzeResponse:
        self._validate_upload(filename, file_content)

        temp_path = self._write_temp_log_file(filename, file_content)
        try:
            result = self.runner.run(temp_path)
        finally:
            Path(temp_path).unlink(missing_ok=True)

        metadata = AnalysisMetadata(
            detected_log_format=result.get("detected_log_format", "unknown"),
            events_parsed=result.get("events_parsed", 0),
            events_correlated=result.get("events_correlated", 0),
            rules_executed=result.get("rules_executed", 0),
            findings_generated=result.get("findings_generated", 0),
            analysis_duration_ms=result.get("analysis_duration_ms", 0),
        )

        return AnalyzeResponse(
            findings=result.get("security_findings", []),
            investigation_reports=result.get("investigation_reports", []),
            metadata=metadata,
        )

    def _validate_upload(self, filename: str, file_content: bytes) -> None:
        extension = Path(filename).suffix.lower()
        if extension not in self.SUPPORTED_EXTENSIONS:
            raise AnalysisValidationError(
                "Uploaded file must be a CSV (.csv) or log file (.log) "
                "(CSV, Linux auth.log, or Windows Security log)."
            )

        if not file_content.strip():
            raise AnalysisValidationError("Uploaded log file is empty.")

    def _write_temp_log_file(self, filename: str, file_content: bytes) -> str:
        extension = Path(filename).suffix.lower() or ".log"
        with NamedTemporaryFile(mode="wb", suffix=extension, delete=False) as temp_file:
            temp_file.write(file_content)
            return temp_file.name

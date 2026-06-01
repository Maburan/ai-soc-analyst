from pathlib import Path
from tempfile import NamedTemporaryFile

from agents.graphs.runner import SOCWorkflowRunner
from app.schemas.analyze import AnalyzeResponse


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

        return AnalyzeResponse(
            findings=result.get("security_findings", []),
            investigation_reports=result.get("investigation_reports", []),
        )

    def _validate_upload(self, filename: str, file_content: bytes) -> None:
        extension = Path(filename).suffix.lower()
        if extension not in self.SUPPORTED_EXTENSIONS:
            raise AnalysisValidationError(
                "Uploaded file must be a CSV (.csv) or Linux auth log (.log)."
            )

        if not file_content.strip():
            raise AnalysisValidationError("Uploaded log file is empty.")

    def _write_temp_log_file(self, filename: str, file_content: bytes) -> str:
        extension = Path(filename).suffix.lower() or ".log"
        with NamedTemporaryFile(mode="wb", suffix=extension, delete=False) as temp_file:
            temp_file.write(file_content)
            return temp_file.name

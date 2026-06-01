from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import get_analysis_service
from app.schemas.analyze import AnalyzeResponse, HealthResponse
from app.services.analysis_service import AnalysisService, AnalysisValidationError

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_logs(
    file: UploadFile = File(..., description="CSV or Linux auth.log file to analyze."),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> AnalyzeResponse:
    if file.content_type not in {
        None,
        "application/octet-stream",
        "text/csv",
        "text/plain",
        "application/vnd.ms-excel",
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content type. Upload a CSV or auth.log file.",
        )

    filename = file.filename or ""
    file_content = await file.read()

    try:
        return analysis_service.analyze_upload(filename, file_content)
    except AnalysisValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while analyzing the log file.",
        ) from error

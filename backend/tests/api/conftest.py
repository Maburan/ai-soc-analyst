import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_analysis_service
from app.main import create_app
from app.services.analysis_service import AnalysisService


@pytest.fixture
def client():
    app = create_app()
    app.dependency_overrides.clear()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def brute_force_csv_content() -> bytes:
    return (
        b"timestamp,event_type,user,ip\n"
        b"2026-06-01 10:01:00,FAILED_LOGIN,admin,1.2.3.4\n"
        b"2026-06-01 10:02:00,FAILED_LOGIN,admin,1.2.3.4\n"
        b"2026-06-01 10:03:00,FAILED_LOGIN,admin,1.2.3.4\n"
        b"2026-06-01 10:04:00,FAILED_LOGIN,admin,1.2.3.4\n"
        b"2026-06-01 10:05:00,FAILED_LOGIN,admin,1.2.3.4\n"
        b"2026-06-01 10:06:00,LOGIN_SUCCESS,admin,1.2.3.4\n"
    )


@pytest.fixture
def override_analysis_service(client):
    def _override(service: AnalysisService):
        client.app.dependency_overrides[get_analysis_service] = lambda: service

    return _override

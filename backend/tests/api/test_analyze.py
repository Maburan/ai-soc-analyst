from io import BytesIO

import pytest

from agents.graphs.runner import SOCWorkflowRunner
from app.services.analysis_service import AnalysisService, AnalysisValidationError


def test_analyze_returns_findings_and_reports(client, brute_force_csv_content):
    response = client.post(
        "/analyze",
        files={"file": ("attack.csv", BytesIO(brute_force_csv_content), "text/csv")},
    )

    assert response.status_code == 200
    payload = response.json()

    assert len(payload["findings"]) == 1
    assert payload["findings"][0]["finding_type"] == "Brute Force Attack"
    assert len(payload["investigation_reports"]) == 1
    assert "Brute Force Attack" in payload["investigation_reports"][0]["incident_title"]


def test_analyze_returns_empty_results_for_benign_logs(client):
    benign_csv = (
        b"timestamp,event_type,user,ip\n"
        b"2026-06-01 10:01:00,FAILED_LOGIN,admin,1.2.3.4\n"
        b"2026-06-01 10:02:00,LOGIN_SUCCESS,admin,1.2.3.4\n"
    )

    response = client.post(
        "/analyze",
        files={"file": ("benign.csv", BytesIO(benign_csv), "text/csv")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["findings"] == []
    assert payload["investigation_reports"] == []


def test_analyze_rejects_non_csv_extension(client):
    response = client.post(
        "/analyze",
        files={"file": ("notes.txt", BytesIO(b"hello"), "text/plain")},
    )

    assert response.status_code == 400
    assert "CSV" in response.json()["detail"] or "auth log" in response.json()["detail"]


def test_analyze_rejects_empty_file(client):
    response = client.post(
        "/analyze",
        files={"file": ("empty.csv", BytesIO(b"   \n"), "text/csv")},
    )

    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_analyze_rejects_missing_file(client):
    response = client.post("/analyze")

    assert response.status_code == 422


def test_analyze_returns_422_for_invalid_csv_content(client):
    invalid_csv = b"timestamp,user\n2026-06-01 10:01:00,admin\n"

    response = client.post(
        "/analyze",
        files={"file": ("invalid.csv", BytesIO(invalid_csv), "text/csv")},
    )

    assert response.status_code == 422
    assert "Missing required columns" in response.json()["detail"]


def test_analyze_uses_dependency_injected_service(client, override_analysis_service):
    class FakeRunner:
        def run(self, log_file_path):
            return {
                "security_findings": [
                    {
                        "finding_type": "Injected Finding",
                        "severity": "LOW",
                        "description": "Injected by test double.",
                        "affected_user": "tester",
                        "source_ip": "127.0.0.1",
                    }
                ],
                "investigation_reports": [],
            }

    override_analysis_service(AnalysisService(runner=FakeRunner()))

    csv_content = (
        b"timestamp,event_type,user,ip\n"
        b"2026-06-01 10:01:00,LOGIN_SUCCESS,tester,127.0.0.1\n"
    )
    response = client.post(
        "/analyze",
        files={"file": ("test.csv", BytesIO(csv_content), "text/csv")},
    )

    assert response.status_code == 200
    assert response.json()["findings"][0]["finding_type"] == "Injected Finding"


def test_analysis_service_validation_error():
    service = AnalysisService(runner=SOCWorkflowRunner())

    with pytest.raises(AnalysisValidationError, match="CSV"):
        service.analyze_upload("report.txt", b"data")

from io import BytesIO
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[3]
SAMPLE_AUTH_LOG_FILE = PROJECT_ROOT / "data" / "sample_auth.log"


def test_analyze_accepts_auth_log_file(client):
    auth_log_content = SAMPLE_AUTH_LOG_FILE.read_bytes()

    response = client.post(
        "/analyze",
        files={"file": ("auth.log", BytesIO(auth_log_content), "text/plain")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["findings"]) >= 1
    assert payload["findings"][0]["finding_type"] == "Brute Force Attack"

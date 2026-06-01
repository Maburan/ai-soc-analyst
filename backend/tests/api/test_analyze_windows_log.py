from io import BytesIO
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]
SAMPLE_WINDOWS_LOG_FILE = PROJECT_ROOT / "data" / "sample_windows_security.log"


def test_analyze_accepts_windows_security_log(client):
    log_content = SAMPLE_WINDOWS_LOG_FILE.read_bytes()

    response = client.post(
        "/analyze",
        files={"file": ("security.log", BytesIO(log_content), "text/plain")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["findings"]) >= 1
    assert payload["findings"][0]["finding_type"] == "Brute Force Attack"

from fastapi.testclient import TestClient
from posthog.api.batch_exports import router
from posthog.main import app
app.include_router(router)

client = TestClient(app)

def test_backfill_batch_export_response_format():
    response = client.post("/projects/1/batch_exports/1/backfill", json={"start_at": "2023-01-01T00:00:00Z", "end_at": "2023-01-02T00:00:00Z"})
    assert response.status_code == 200
    data = response.json()
    assert "workflow_id" in data
    assert isinstance(data["workflow_id"], str)

def test_backfill_batch_export_invalid_request():
    response = client.post("/projects/1/batch_exports/1/backfill", json={"start_at": "invalid-date", "end_at": "2023-01-02T00:00:00Z"})
    assert response.status_code == 422
from unittest.mock import MagicMock

import uuid
from fastapi.testclient import TestClient

from api.deps import get_user_service
from main import app
from services.user_service import UserService

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "cyberedu-api"


def test_user_not_found() -> None:
    mock_svc = MagicMock(spec=UserService)
    mock_svc.get_user.return_value = None

    app.dependency_overrides[get_user_service] = lambda: mock_svc
    try:
        rid = uuid.uuid4()
        response = client.get(f"/api/v1/users/{rid}")
        assert response.status_code == 404
    finally:
        app.dependency_overrides.clear()

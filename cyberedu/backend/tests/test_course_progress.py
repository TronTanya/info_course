from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from api.deps import get_course_progress_service
from main import app
from models.course_progress import CourseProgress
from services.course_progress_service import CourseProgressService

client = TestClient(app)


def test_course_progress_list_mocked() -> None:
    from datetime import datetime, timezone

    row = CourseProgress(
        id=1,
        user_id=None,
        full_name="Тестов Тест Тестович",
        group_name="КИ-25",
        college="Якутский гуманитарный колледж",
        course="Основы информационной безопасности",
        year=2,
        completed_at=datetime(2026, 5, 1, 12, 0, tzinfo=timezone.utc),
        errors='["Ошибка 1"]',
    )
    mock_svc = MagicMock(spec=CourseProgressService)
    mock_svc.list_filtered.return_value = [row]

    app.dependency_overrides[get_course_progress_service] = lambda: mock_svc
    try:
        r = client.get("/api/v1/course-progress?group_name=КИ-25&limit=10")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 1
        assert data[0]["full_name"] == "Тестов Тест Тестович"
        assert data[0]["user_id"] is None
        mock_svc.list_filtered.assert_called_once()
    finally:
        app.dependency_overrides.clear()

from schemas.health import HealthResponse


class HealthService:
    def get_status(self) -> HealthResponse:
        return HealthResponse(status="ok", service="cyberedu-api")

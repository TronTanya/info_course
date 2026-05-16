from fastapi import APIRouter, Depends

from api.deps import get_health_service
from schemas.health import HealthResponse
from services.health_service import HealthService

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health(service: HealthService = Depends(get_health_service)) -> HealthResponse:
    return service.get_status()

from fastapi import APIRouter

from api.routes.v1 import course_progress, health, users

api_v1_router = APIRouter()
api_v1_router.include_router(health.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(course_progress.router)

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from api.deps import get_user_service
from schemas.user import UserRead
from services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: UUID, service: UserService = Depends(get_user_service)) -> UserRead:
    user = service.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return user

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_async_session
from src.auth.schemas import (
    LoginForm,
    AdminRead,
)
from src.auth.models import Admin
from src.auth.utils.passwords import verify_password
from src.dependencies import (
    RefreshDep,
    AuthDep,
    DBSessionDep,
    auth,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", status_code=status.HTTP_204_NO_CONTENT, summary="Вход (login)")
async def login(
    data: LoginForm,
    response: Response,
    db: AsyncSession = Depends(get_async_session),
):
    user = await db.scalar(select(Admin).where(Admin.email == data.email))
    if not user or not await verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )
    access = auth.create_access_token(uid=str(user.id), fresh=True)
    refresh = auth.create_refresh_token(uid=str(user.id))
    auth.set_access_cookies(access, response)
    auth.set_refresh_cookies(refresh, response)
    return


@router.post(
    "/refresh", status_code=status.HTTP_204_NO_CONTENT, summary="Обновить access‑токен"
)
async def refresh_token(
    response: Response,
    payload: RefreshDep,
):
    new_access = auth.create_access_token(uid=payload.sub, fresh=True)
    refresh = auth.create_refresh_token(uid=str(payload.sub))
    auth.set_access_cookies(new_access, response)
    auth.set_refresh_cookies(refresh, response)
    return


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    """ """
    auth.unset_access_cookies(response)
    auth.unset_refresh_cookies(response)


@router.get("/users", response_model=AdminRead, summary="Текущий пользователь")
async def get_user(
    db_session: DBSessionDep,
    payload: AuthDep,
) -> AdminRead:
    user_id = UUID(payload.sub)

    user: Admin | None = await db_session.scalar(
        select(Admin).where(Admin.id == user_id)
    )
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    return AdminRead.model_validate(user, from_attributes=True)

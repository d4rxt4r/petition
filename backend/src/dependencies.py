"""
Глобальные зависимости проекта.
"""

from typing import Annotated

from authx import AuthX, TokenPayload

from src.config import authx_config
from src.auth.models import Admin
from src.auth.repository import WorkspaceRepository

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from src.auth.models import Workspace
from src.database import get_async_session


auth = AuthX(
    config=authx_config,
    model=Admin,
)


DBSessionDep = Annotated[AsyncSession, Depends(get_async_session)]
AuthDep = Annotated[TokenPayload, Depends(auth.access_token_required)]
RefreshDep = Annotated[TokenPayload, Depends(auth.refresh_token_required)]


def get_account_repository(
    db_session: DBSessionDep, payload: AuthDep
) -> WorkspaceRepository:
    return WorkspaceRepository(db_session, payload.sub)


WorkspaceRepoDep = Annotated[WorkspaceRepository, Depends(get_account_repository)]


async def get_workspace_by_user(
    payload: AuthDep,
    db_session: DBSessionDep,
) -> Workspace:
    """
    Получить workspace, к которому пользователь имеет доступ (owner или member).
    Использует user_id из payload.sub.
    """
    user_id = UUID(payload.sub)

    # Можно выбрать только первый доступный воркспейс (или список, если нужно все)
    stmt = (
        select(Workspace)
        .options(selectinload(Workspace.members))
        .where((Workspace.owner_id == user_id) | (Workspace.members.any(id=user_id)))
        .limit(1)  # убери если нужен список
    )
    result = await db_session.execute(stmt)
    workspace = result.scalars().first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or not accessible for current user",
        )
    return workspace


WorkspaceDep = Annotated[Workspace, Depends(get_workspace_by_user)]

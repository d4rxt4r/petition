from typing import Any, Sequence
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.orm import selectinload
from src.auth.mappers import user_to_read
from src.database import get_async_session
from src.auth.schemas import WorkspaceCreate, WorkspaceRead, RegisterForm, LoginForm, UserRead
from src.auth.models import User, Role, Workspace
from src.auth.utils.passwords import hash_password, verify_password
from src.dependencies import RefreshDep, WorkspaceDep, WorkspaceRepoDep, AuthDep, DBSessionDep, auth



router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Регистрация нового пользователя"
)
async def register(
    data: RegisterForm,
    response: Response,
    db: AsyncSession = Depends(get_async_session),
):
    # 1) проверяем, что email ещё не занят
    exists = await db.scalar(select(User).where(User.email == data.email))
    if exists:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует",
        )

    # 2) создаём запись в БД
    user = User(
        email=data.email,
        first_name=data.first_name,
        last_name=data.last_name,
        username=data.username,
        hashed_password=hash_password(data.password),
        is_active=True,
        role=Role.GUEST,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # 3) сразу логиним и отдаем токены
    access = auth.create_access_token(uid=str(user.id), fresh=True)
    refresh = auth.create_refresh_token(uid=str(user.id))
    auth.set_access_cookies(access, response)
    auth.set_refresh_cookies(refresh, response)

    return {"msg": "Регистрация успешна", "user_id": user.id}

@router.post(
    "/login",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Вход (login)"
)
async def login(
    data: LoginForm,
    response: Response,
    db: AsyncSession = Depends(get_async_session),
):
    user = await db.scalar(select(User).where(User.email == data.email))
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
    "/refresh",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Обновить access‑токен"
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
    """

    """
    auth.unset_access_cookies(response)
    auth.unset_refresh_cookies(response)


@router.get("/users", response_model=UserRead)
async def get_user(db_session: DBSessionDep, payload: AuthDep) -> UserRead:
    """
    ## Получить текущего пользователя по токену.

    ### Args:
    - `db_session`: AsyncSession - Сессия базы данных.

    - `payload`: TokenPayload - Распакованный JWT-пейлоад пользователя.
    
    ### Returns:
    - `UserRead`: Данные пользователя.

    ### Raise:
    - `HTTPException`: 401 Unauthorized - Если пользователь
                       не найден или не авторизован.
    """
    user_id = UUID(payload.sub)
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.workspaces_member).options(
                selectinload(Workspace.owner),
                selectinload(Workspace.stores)
            ),
            selectinload(User.workspaces_owned).options(
                selectinload(Workspace.stores)
            )
        )


    )

    user: User | None = (await db_session.execute(stmt)).scalars().first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    return user_to_read(user)
    
# --------------------------------- Workspace ---------------------------------

@router.post("/workspaces/create")
async def create_workspace(
    data: WorkspaceCreate,
    repo: WorkspaceRepoDep
) -> dict[str, int]:
    workspace_id = await repo.create(data=data)
    return {"id": workspace_id}


@router.get("/workspaces", response_model=list[WorkspaceRead])
async def get_workspaces(repo: WorkspaceRepoDep) -> Sequence[Workspace]:
    return await repo.get_all()


@router.delete("/workspaces/{workspace_id}")
async def delete_account(workspace_id: int, repo: WorkspaceRepoDep) -> None:
    is_deleted = await repo.delete(workspace_id)
    if not is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found or already deleted"
        )

@router.post("/workspaces/add_user")
async def add_user_to_workspace(
    workspace_repo: WorkspaceRepoDep,
    workspace: WorkspaceDep,
    user_id: str,
):
    try:
        await workspace_repo.add_user_to_worksapce(user_id, workspace.id)
        return {"detail": "Пользователь добавлен"}
    except Exception as exc:
        return HTTPException(detail=exc, status_code=status.HTTP_400_BAD_REQUEST)


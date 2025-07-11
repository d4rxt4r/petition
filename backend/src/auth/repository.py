"""
Workspace repository implementation for CRUD operations using SQLAlchemy.

This module provides a concrete repository for the `Workspace` model,
supporting asynchronous Create, Read, Update, and Delete (CRUD) operations.
The repository leverages SQLAlchemy Core statements for all database interactions.
"""
from typing import Optional, Sequence 
from fastapi import HTTPException, status
from sqlalchemy import or_, select, update, delete, insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.elements import ColumnElement
from src.auth.models import Workspace, WorkspaceUser
from src.auth.schemas import WorkspaceCreate, WorkspaceUpdate
from src.core.generic_crud_repo import GenericCRUDRepository


class WorkspaceRepository:
    """
    Repository for performing CRUD operations on the Workspace model.

    This class implements asynchronous methods for creating, retrieving,
    updating, and deleting Workspace records in the database. It expects
    an active SQLAlchemy AsyncSession to be provided at instantiation.
    """
    def __init__(self, db_session: AsyncSession, user_id: str):
        """
        Initialize the repository with an active database session.

        Args:
            - db_session (AsyncSession): The asynchronous SQLAlchemy session.
        """
        self.db_session = db_session
        self.user_id = user_id

    @property
    def workspace_access_filter(self) -> ColumnElement[bool]:
        """
        SQLAlchemy condition: current user is owner or member of the workspace.
        """
        return or_(
            Workspace.owner_id == self.user_id,
            Workspace.members.any(id=self.user_id)
        )


    async def create(self, data: WorkspaceCreate) -> int:
        """
        Create a new Workspace record in the database.

        Args:
            - data (WorkspaceCreate): The data required to create a new account.

        Returns:
            - int: The primary key (ID) of the newly created account.
        """
        stmt = (
            insert(Workspace)
            .values(
                **data.model_dump(),
                owner_id=self.user_id
            )
            .returning(Workspace.id)
        )
        result = await self.db_session.execute(stmt)
        await self.db_session.commit()
        return result.scalar_one()

    async def get_by_id(self, obj_id: int) -> Optional[Workspace]:
        """
        Retrieve a single Workspace by its unique identifier.

        Args:
            - obj_id (int): The primary key (ID) of the account to fetch.

        Returns:
            - Optional[Workspace]: The Workspace instance if found, otherwise None.
        """
        stmt = (
            select(Workspace)
            .options(selectinload(Workspace.members), selectinload(Workspace.owner))
            .where(
                Workspace.id == obj_id,
                self.workspace_access_filter
            )
        )
        result = await self.db_session.execute(stmt)
        return result.scalars().first()

    async def get_by_id_or_404(self, obj_id: int) -> Workspace:
        account = await self.get_by_id(obj_id)
        if account is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found or access denied"
            )
        return account

    async def get_list(self, limit: int = 100, offset: int = 0) -> Sequence[Workspace]:
        """
        Retrieve a list of Workspace records, with optional pagination.

        Args:
            - limit (int, optional): Maximum number of records to return. Defaults to 100.
            - offset (int, optional): Number of records to skip. Defaults to 0.

        Returns:
            Sequence[Workspace]: A list of Workspace instances.
        """
        stmt = select(Workspace).limit(limit).offset(offset).where(self.workspace_access_filter)
        result = await self.db_session.execute(stmt)
        return result.scalars().all()

    async def get_all(self) -> Sequence[Workspace]:
        stmt = (
            select(Workspace)
            .where(self.workspace_access_filter)
        )
        result = await self.db_session.execute(stmt)
        return result.scalars().all()

    async def update(self, obj_id: int, data: WorkspaceUpdate) -> Optional[Workspace]:
        """
        Update fields of an existing Workspace record.

        Only the fields explicitly set in the provided `WorkspaceUpdate` schema will be updated.
        Unset fields will retain their current values.

        Args:
            obj_id (int): The primary key (ID) of the account to update.
            data (WorkspaceUpdate): The fields to update.

        Returns:
            Optional[Workspace]: The updated Workspace instance if the update was successful, otherwise None.
        """
        stmt = (
            update(Workspace)
            .where(Workspace.id == obj_id, self.workspace_access_filter)
            .values(**data.model_dump(exclude_unset=True))
            .returning(Workspace)
        )
        result = await self.db_session.execute(stmt)
        await self.db_session.commit()
        updated = result.fetchone()
        if updated:
            return await self.get_by_id(obj_id)
        return None

    async def delete(self, obj_id: int) -> bool:
        """
        Delete an Workspace record from the database.

        Args:
            obj_id (int): The primary key (ID) of the account to delete.

        Returns:
            bool: True if a record was deleted, False otherwise.
        """
        stmt = delete(Workspace).where(Workspace.id == obj_id, self.workspace_access_filter)
        result = await self.db_session.execute(stmt)
        await self.db_session.commit()
        return result.rowcount > 0

    async def add_user_to_worksapce(self, add_user_id: str, workspace_id: int):
        stmt = (
            insert(WorkspaceUser)
            .values(workspace_id=workspace_id, user_id=add_user_id)
        )
        await self.db_session.execute(stmt)
        await self.db_session.commit()




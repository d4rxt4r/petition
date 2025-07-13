from abc import ABC, abstractmethod
from typing import Any, TypeAlias, TypeVar, Generic, Optional, Sequence
from uuid import UUID

from sqlalchemy import ColumnElement

from src.core.schemas import BulkCreateResult

T = TypeVar("T")
CreateT = TypeVar("CreateT")
UpdateT = TypeVar("UpdateT")
OrderByFields: TypeAlias = Optional[Sequence[ColumnElement[Any]]]


class BaseCRUDRepository(Generic[T, CreateT, UpdateT], ABC):
    @abstractmethod
    async def create(
        self,
        data: CreateT,
        exclude_fields: list[str],
    ) -> T | int: ...

    @abstractmethod
    async def bulk_create(
        self,
        *,
        items: Sequence[CreateT],
        unique_by: tuple[str, ...],
        returning: Optional[tuple[str, ...]],
        exclude_fields: list[str],
    ) -> BulkCreateResult: ...

    @abstractmethod
    async def get_or_create(
        self,
        *,
        lookup: dict[str, Any],
        defaults: Optional[dict[str, Any]],
    ) -> tuple[T, bool]: ...

    @abstractmethod
    async def get(self, obj_id: UUID) -> Optional[T]: ...

    @abstractmethod
    async def get_list(
        self,
        *,
        limit: int,
        offset: int,
        obj_ids: Optional[Sequence[UUID]],
        order_by_fields: OrderByFields,
    ) -> Sequence[T]: ...

    @abstractmethod
    async def update(self, obj_id: UUID, data: UpdateT) -> Optional[T]: ...

    @abstractmethod
    async def delete(self, obj_id: UUID) -> bool: ...

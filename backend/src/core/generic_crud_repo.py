"""
core/abstract_repo.py
---------------------

Contains AbstractCRUDRepository — a base generic class for
CRUD operations

All INSERT queries use `sqlalchemy.dialects.postgresql.insert`
(as pg_insert) to support ON CONFLICT and bulk-insert functionality.

Subclasses must define:
  - model         — the SQLAlchemy model class
  - create_schema — the Pydantic schema for creation
  - update_schema — the Pydantic schema for update
"""

from collections.abc import Sequence
from itertools import batched
from typing import Any, Mapping, Optional, Protocol, Type, TypeVar, runtime_checkable
from uuid import UUID

from fastapi import HTTPException, status
from rich.progress import BarColumn, Progress, TextColumn, TimeElapsedColumn
from sqlalchemy import Select, bindparam, delete, func, select, update
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Mapped
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from loguru import logger

from src.core.abstract_repo import BaseCRUDRepository, OrderByFields
from src.core.schemas import BulkCreateResult, BulkUpdateResult
from src.vote.models import uuid_pk


@runtime_checkable
class HasId(Protocol):
    """
    Protocol that enforces the presence of `id` and attributes.

    Any ORM model or data class implementing this protocol must define:
        - `id`: The primary key identifier (typically an uuid)
    """

    id: Mapped[UUID] = uuid_pk()


ORMModelT = TypeVar("ORMModelT", bound=HasId)
CreateSchemaT = TypeVar("CreateSchemaT", bound=BaseModel)
UpdateSchemaT = TypeVar("UpdateSchemaT", bound=BaseModel)
PydanticT = TypeVar("PydanticT", bound=BaseModel)

_MAX_QUERY_PARAMS = 20_000


class GenericCRUDRepository(
    BaseCRUDRepository[ORMModelT, CreateSchemaT, UpdateSchemaT]
):
    """
    Generic CRUD repository for SQLAlchemy models scoped by workspace.

    This abstract base class provides common Create, Read, Update, Delete
    operations and helpers (exists, count) for any ORM model that has at least
    `id` attributes. Subclasses must set:

    NOTE:
        All create/upsert methods (`create`, `bulk_create`, `get_or_create`,
        `create_or_update`) use the PostgreSQL‐specific
        `sqlalchemy.dialects.postgresql.insert as pg_insert` to enable
        `ON CONFLICT` and bulk‐insert behavior. Generic
        `sqlalchemy.insert` is `_not_` used here.

    Subclasses must set:
        model            - The SQLAlchemy declarative model class.
        `create_schema`  - The Pydantic schema for create operations.
        `update_schema`  - The Pydantic schema for update operations.
    """

    model: type[ORMModelT]
    create_schema: type[CreateSchemaT]
    update_schema: type[UpdateSchemaT]

    def __init__(self, db_session: AsyncSession) -> None:
        self.db_session = db_session

    # ============================== Create ==============================
    async def create(
        self, data: CreateSchemaT, exclude_fields: Optional[list[str]] = None
    ) -> ORMModelT:
        """
        Insert a new record into the database.

        Args:
            data: Pydantic schema instance containing the fields to insert.

        Returns:
            The primary key (`id`) of the newly created record.

        Raises:
            SQLAlchemyError: If the INSERT fails for reasons other than conflict.
        """
        values = data.model_dump(exclude=set(exclude_fields or []))
        logger.debug(f"INSERT {self.model.__name__}: {values!r}")

        stmt = pg_insert(self.model).values(**values).returning(self.model)
        try:
            result = await self.db_session.execute(stmt)
            await self.db_session.commit()
            obj = result.scalar_one()
            logger.info(f"{self.model.__name__} created: {obj!r}")
            return obj

        except IntegrityError as exc:
            await self.db_session.rollback()
            logger.warning(
                "IntegrityError on INSERT %s – %s",
                self.model.__name__,
                exc.orig,
                exc_info=True,
            )
            raise HTTPException(
                status_code=400,
                detail=f"{self.model.__name__} with these unique fields already exists",
            ) from exc

        except SQLAlchemyError as exc:
            await self.db_session.rollback()
            logger.exception("SQLAlchemyError on INSERT", exc_info=True)
            raise

    async def bulk_create(
        self,
        *,
        items: Sequence[CreateSchemaT],
        unique_by: Optional[tuple[str, ...]] = None,
        returning: Optional[tuple[str, ...]] = None,
        exclude_fields: Optional[list[str]] = None,
    ) -> BulkCreateResult:
        """
        Inserts a batch of records with a single query.

        Args:
            items: schemas to insert
            unique_by: fields to check for ON CONFLICT
            returning: field names for RETURNING.
                Defaults to: ('id',) + unique_by

        Returns:
            BulkResult with fields created (list[dict]) and errors (list[dict]).
        """
        if not items:
            return BulkCreateResult(created=[], errors=[])

        if returning is None:
            returning = ("id",) + (unique_by or ())

        cols_to_return = [getattr(self.model, name) for name in returning]

        payload: list[dict[str, Any]] = []
        idx_map: dict[tuple[Any], int] = {}
        for idx, item in enumerate(items):
            row = item.model_dump(exclude=set(exclude_fields or []))
            payload.append(row)
            if unique_by:
                idx_map[tuple(row[f] for f in unique_by)] = idx

        if not payload:
            return BulkCreateResult(created=[], errors=[])

        num_columns = len(payload[0])
        max_row_per_batch = _MAX_QUERY_PARAMS // num_columns or 1

        created: list[dict[str, Any]] = []
        errors: list[dict[str, Any]] = []
        for batch in batched(payload, max_row_per_batch):
            batch = list(batch)

            stmt = (
                pg_insert(self.model)
                .values(batch)
                .on_conflict_do_nothing(index_elements=unique_by)
                .returning(*cols_to_return)
            )

            result = await self.db_session.execute(stmt)

            inserted = list(result.mappings())

            if unique_by:
                inserted_keys = {
                    tuple(r[n] for n in unique_by): r["id"] for r in inserted
                }
                for row in batch:
                    key = tuple(row[f] for f in unique_by)
                    orig_idx = idx_map[key]
                    if key in inserted_keys:
                        created.append({**row, "id": inserted_keys[key]})
                    else:
                        lookup = {f: row[f] for f in unique_by}
                        errors.append(
                            {"index": orig_idx, **lookup, "reason": "duplicate"}
                        )
            else:
                for i, ins in enumerate(inserted):
                    data = batch[i].copy()
                    data["id"] = ins["id"]
                    created.append(data)

        await self.db_session.commit()
        return BulkCreateResult(created=created, errors=errors)

    async def update_one(
        self,
        *,
        obj_id: UUID,
        data: UpdateSchemaT,
        exclude_unset: bool = True,
    ) -> int:
        """
        Обновляет один объект по его id.

        Args:
            obj_id: PK записи.
            data: Pydantic‐схема обновления.
            exclude_unset: если True, то в payload попадут только поля, которые были установлены.

        Returns:
            Количество затронутых строк (должно быть 1, если запись существует).
        """
        payload = data.model_dump(exclude_unset=exclude_unset)
        if not payload:
            return 0

        stmt = (
            update(self.model)
            .where(
                self.model.id == obj_id,
            )
            .values(**payload, updated_at=func.now())
        )
        result = await self.db_session.execute(stmt)
        await self.db_session.commit()
        return result.rowcount

    # --------------------------------- Update Many ---------------------------------
    async def update_many(
        self,
        *,
        items: Sequence[tuple[UUID, UpdateSchemaT]],
    ) -> BulkUpdateResult:
        """
        Обходит список (id, update_schema) и вызывает update_one для каждого.

        Args:
            items: Sequence of (obj_id, Pydantic‐schema) tuples.

        Returns:
            Суммарное количество обновлённых строк.
        """
        total = 0

        errors = []
        updated = []

        # Настраиваем Progress
        progress = Progress(
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            "[progress.percentage]{task.percentage:>3.0f}%",
            TimeElapsedColumn(),
        )
        progress.start()
        task_id = progress.add_task("Updating records...", total=len(items))

        for obj_id, schema in items:
            try:
                total += await self.update_one(obj_id=obj_id, data=schema)
            except Exception as exc:
                errors.append({"obj_id": obj_id, "error": exc})
                progress.update(task_id, advance=1)
                continue

            updated.append({"obj_id": obj_id, "updated_data": schema})
            progress.update(task_id, advance=1)

        progress.stop()
        return BulkUpdateResult(updated=updated, errors=errors)

    async def __bulk_update(
        self,
        *,
        items: Sequence[UpdateSchemaT],
        unique_by: Optional[tuple[str, ...]] = None,
        update_fields: Optional[tuple[str, ...]] = None,
        returning: Optional[tuple[str, ...]] = None,
        exclude_fields: Optional[list[str]] = None,
    ) -> BulkUpdateResult:
        """
        WARNING: THIS METHOD DOUES NOT WORKING!
        Bulk-update (upsert) a batch of records in a single query, splitting into sub-batches to
        respect parameter limits.

        Args:
            items: schemas to update (or upsert)
            unique_by: fields to identify conflicts (defaults to primary keys)
            update_fields: fields to update on conflict (defaults to all non-key, non-workspace fields)
            returning: field names for RETURNING; defaults to 'id', unique_by
            exclude_fields: fields to drop from the payload before insert/update

        Returns:
            BulkResult with lists of updated (or inserted) rows and errors for missing keys.
        """
        if not items:
            return BulkUpdateResult(updated=[], errors=[])

        conflict_idx = unique_by or ("id",)

        if returning is None:
            returning = ("id",) + conflict_idx
        cols_to_return = [getattr(self.model, name) for name in returning]

        payload: list[dict[str, Any]] = []
        idx_map: dict[tuple[Any, ...], int] = {}
        for idx, item in enumerate(items):
            row = item.model_dump(exclude=set(exclude_fields or []))
            payload.append(row)
            key = tuple(row[f] for f in conflict_idx)
            idx_map[key] = idx

        if update_fields is None:
            update_fields = tuple(
                f for f in payload[0].keys() if f not in set(conflict_idx)
            )

        # Determine batch size
        num_cols = len(payload[0])
        max_per_batch = _MAX_QUERY_PARAMS // num_cols or 1

        updated: list[dict[str, Any]] = []
        errors: list[dict[str, Any]] = []

        for batch in batched(payload, max_per_batch):
            batch = list(batch)
            stmt = (
                update(self.model)
                .where(
                    self.model.id == bindparam("id"),
                )
                .values(
                    {field: bindparam(field) for field in update_fields},
                )
                .execution_options(synchronize_session=False)
                .returning(*cols_to_return)
            )

            result = await self.db_session.execute(stmt, batch)
            rows = result.mappings().all()

            # Collect results
            seen_keys = {tuple(r[n] for n in conflict_idx): r["id"] for r in rows}
            for row in batch:
                key = tuple(row[f] for f in conflict_idx)
                orig_idx = idx_map[key]
                if key in seen_keys:
                    updated.append({**row, "id": seen_keys[key]})
                else:
                    lookup = {f: row[f] for f in conflict_idx}
                    errors.append({"index": orig_idx, **lookup, "reason": "missing"})

        await self.db_session.commit()
        self.db_session.expire_all()
        return BulkUpdateResult(updated=updated, errors=errors)

    async def get_or_create(
        self, *, lookup: dict[str, Any], defaults: dict[str, Any] | None = None
    ) -> tuple[ORMModelT, bool]:
        """
        Get an existing record matching `lookup` or create a new one.

        Args:
            lookup: A dict of column-value pairs used to search for an existing row.
            defaults: Optional dict of additional column-value pairs used only
                when creating a new row if none is found.

        Returns:
            A tuple `(instance, created)` where:
            - `instance` is the ORM object found or newly created.
            - `created` is `True` if a new row was inserted, `False` otherwise.
        """
        stmt = select(self.model).filter_by(**lookup)
        result = await self.db_session.execute(stmt)
        instance = result.scalar_one_or_none()
        if instance:
            return instance, False
        data = {
            **lookup,
            **(defaults or {}),
        }

        stmt = pg_insert(self.model).values(**data).returning(self.model)
        result = await self.db_session.execute(stmt)
        await self.db_session.commit()
        new = result.scalar_one()

        return new, True

    async def create_or_update(
        self,
        *,
        data: CreateSchemaT,
        conflict_fields: list[str],
    ) -> ORMModelT:
        """
        Insert a new record or update on conflict (upsert).

        Uses PostgreSQL `ON CONFLICT ... DO UPDATE` to perform an atomic upsert.

        Args:
            data: Pydantic schema instance containing fields for insert/update.
            conflict_fields: List of column names to detect conflicts on; if a
                conflict occurs on these, an update is performed.

        Returns:
            The ORM instance that was inserted or updated.
        """
        payload = data.model_dump()
        stmt = (
            pg_insert(self.model)
            .values(**payload)
            .on_conflict_do_update(
                index_elements=conflict_fields,
                set_={
                    key: payload[key] for key in payload if key not in conflict_fields
                },
            )
            .returning(self.model)
        )
        result = await self.db_session.execute(stmt)
        await self.db_session.commit()
        return result.scalar_one()

    # =============================== Read ===============================
    async def get(self, obj_id: UUID) -> Optional[ORMModelT]:
        """
        Retrieve a single record by its primary key.

        Args:
            obj_id: The primary key (`id`) of the record to fetch.

        Returns:
            The ORM instance if found, or `None` otherwise.
        """
        stmt = select(self.model).where(
            self.model.id == obj_id,
        )
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_or_404(self, obj_id: UUID) -> ORMModelT:
        """
        Same as get(), but raises HTTPException(404) if the object is not found.

        Args:
            obj_id: PK of the record to retrieve.
        Returns:
            ORM model (not None).
        Raises:
            HTTPException(status_code=404) if the record is not found.
        """
        instance = await self.get(obj_id=obj_id)
        if instance is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{self.model.__name__} with id={obj_id} not found",
            )
        return instance

    async def get_list(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
        obj_ids: Optional[Sequence[UUID]],
        order_by_fields: OrderByFields,
    ) -> Sequence[ORMModelT]:
        """
        Retrieve multiple records by their primary keys.

        Args:
            obj_ids: A sequence of primary key values to fetch.

        Returns:
            A sequence of ORM instances matching the given IDs.
        """
        stmt = select(self.model)

        if obj_ids:
            stmt = stmt.where(self.model.id.in_(obj_ids))

        if order_by_fields:
            stmt = stmt.order_by(*order_by_fields)

        stmt = stmt.limit(limit).offset(offset)
        result = await self.db_session.execute(stmt)

        return result.scalars().all()

    async def get_all(
        self, response_model: Optional[Type[PydanticT]] = None
    ) -> Sequence[ORMModelT] | list[PydanticT]:
        """
        Retrieve all records with optional field filtering via Pydantic model.
        """
        if response_model:
            model_fields = response_model.model_fields.keys()
            columns = []

            for field_name in model_fields:
                if hasattr(self.model, field_name):
                    columns.append(getattr(self.model, field_name))

            stmt = select(*columns)
            result = await self.db_session.execute(stmt)

            rows = result.mappings().all()
            return [response_model.model_validate(row) for row in rows]
        else:
            stmt = select(self.model)
            result = await self.db_session.execute(stmt)
            return result.scalars().all()

    # ------------------------------ Update ------------------------------
    async def update(
        self,
        obj_id: UUID,
        data: UpdateSchemaT,
    ) -> Optional[ORMModelT]:
        """
        Update a single record’s fields.

        Only the fields that are set on the Pydantic schema (`exclude_unset=True`)
        will be applied.

        Args:
            `obj_id`: The primary key of the record to update.
            data: The Pydantic schema instance with fields to change.

        Returns:
            True if exactly one row was updated; False if no rows were matched
            or no fields were provided.
        """
        stmt = (
            update(self.model)
            .where(
                self.model.id == obj_id,
            )
            .values(**data.model_dump())
            .returning(self.model)
        )
        result = await self.db_session.execute(stmt)
        await self.db_session.commit()
        return result.scalar_one()

    async def update_list(
        self,
        *,
        obj_ids: list[UUID],
        data: UpdateSchemaT,
    ) -> int:
        """
        Update multiple records at once.

        Args:
            `obj_ids`: List of primary key values to update.
            data: The Pydantic schema instance with fields to change.

        Returns:
            The number of rows that were updated.
        """
        if not obj_ids:
            return 0

        payload = data.model_dump(exclude_unset=True)
        if not payload:
            return 0

        stmt = (
            update(self.model)
            .where(
                self.model.id.in_(obj_ids),
            )
            .values(**payload)
        )

        result = await self.db_session.execute(stmt)
        await self.db_session.commit()
        return result.rowcount

    # ============================== Delete ==============================
    async def delete(
        self,
        obj_id: UUID,
    ) -> bool:
        """
        Delete a single record by primary key.

        Args:
            `obj_id`: The primary key of the record to delete.

        Returns:
            True if exactly one row was deleted; False otherwise.
        """
        stmt = delete(self.model).where(
            self.model.id == obj_id,
        )

        result = await self.db_session.execute(stmt)
        await self.db_session.commit()
        return result.rowcount == 1

    # ============================== Utils ==============================
    async def exists(
        self,
        *,
        obj_id: UUID,
    ) -> bool:
        """
        Check if a record exists.

        Args:
            `obj_id`: The primary key to check for existence.

        Returns:
            True if a record with the given ID and workspace exists; False otherwise.
        """
        stmt = select(self.model.id).where(
            self.model.id == obj_id,
        )
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def count(self) -> int:
        """
        Count how many records exist for this workspace.

        Returns:
            The total number of rows for the given
        """
        stmt = select(func.count()).select_from(self.model)
        result = await self.db_session.execute(stmt)
        return result.scalar_one()

    async def _apply_filters(
        self, stmt: Select[tuple[ORMModelT]], filters: Optional[Mapping[str, Any]]
    ) -> Select[tuple[ORMModelT]]:
        """
        Attach simple equality filters to a SELECT statement.

        Given a base ``Select`` object, this method adds one ``WHERE <column>=<value>``
        clause for every key–value pair in *filters* via ``stmt.filter_by(**filters)``.
        If *filters* is ``None`` or empty, the original statement is returned
        unchanged.

        Subclasses may override this method to implement more advanced
        filtering logic (range queries, ``LIKE`` patterns, joins to related
        tables, etc.) while keeping the common call-site in :pymeth:`get_list`.

        Returns:
            The modified (or original) ``Select`` with the additional
            ``WHERE`` conditions.
        """
        if filters:
            return stmt.filter_by(**filters)
        return stmt

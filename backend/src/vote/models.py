import enum
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import (
    VARCHAR,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import CITEXT, ENUM, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


def uuid_pk() -> Mapped[UUID]:
    """UUID первичный ключ, генерируется на стороне PostgreSQL."""
    return mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )


def tz_now() -> datetime:
    """UTC-timestamp для Python-side defaults (не обязателен, но удобен в тестах)."""
    return datetime.now(timezone.utc)


class User(Base):
    """Пользователь, фиксируем телефон как уникальный."""

    id: Mapped[UUID] = uuid_pk()

    full_name: Mapped[Optional[str]] = mapped_column(VARCHAR(255))

    email: Mapped[Optional[str]] = mapped_column(
        CITEXT(),
        nullable=True,
    )

    phone_number: Mapped[str] = mapped_column(
        VARCHAR(20),
        nullable=False,
    )

    valid_vote: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    __table_args__ = (UniqueConstraint("phone_number", name="uq_user_phone"),)

    sms_verifications: Mapped[List["SmsVerification"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<User {self.id} {self.phone_number}>"


class SmsVerification(Base):
    """Одноразовый код подтверждения, может быть несколько записей на одного User."""

    id: Mapped[UUID] = uuid_pk()

    phone_number: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    code: Mapped[str] = mapped_column(VARCHAR(6), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=tz_now, nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # связь с пользователем (FK в БД создаст Alembic)
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user: Mapped["User"] = relationship(back_populates="sms_verifications")

    def __repr__(self) -> str:
        return f"<SMS {self.phone_number} verified={self.is_verified}>"


class VoteStatus(str, enum.Enum):
    collecting = "Сбор подписей"
    reviewing = "На проверке"
    accepted = "Принято"
    rejected = "Не принято"


class Voting(Base):
    """Кампания сбора подписей / голосования."""

    id: Mapped[UUID] = uuid_pk()

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    real_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    fake_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    show_real: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    status: Mapped[VoteStatus] = mapped_column(
        ENUM(VoteStatus, name="vote_status", create_type=True),
        nullable=False,
        default=VoteStatus.collecting,
    )

    def __repr__(self) -> str:
        return f"<Voting {self.id} {self.status}>"

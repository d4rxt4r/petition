import enum
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.dialects.postgresql import ENUM as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base, int_pk, uuid_pk

if TYPE_CHECKING:
    from src.ozon.models import Store


class Role(enum.Enum):
    ADMIN = "admin"
    WAREHOUSE = "warehouse"
    ANALYTIC = "analytic"
    CONTENT = "content"
    GUEST = "guest"


class User(Base):
    __table_args__ = {"schema": "auth"}
    id: Mapped[uuid_pk]
    email: Mapped[str] = mapped_column(String(128), nullable=False)
    first_name: Mapped[str] = mapped_column(String(48), nullable=False)
    last_name: Mapped[str] = mapped_column(String(48), nullable=False)
    username: Mapped[str] = mapped_column(String(48), nullable=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean(), default=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=False)
    hashed_password: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
        comment="Password hash (bcrypt/argon2)",
    )
    role: Mapped[Role] = mapped_column(
        SAEnum(Role, name="user_roles", schema="auth", create_type=False),
        default=Role.GUEST,
        nullable=False,
    )
    workspace_id: Mapped[int] =mapped_column(
        ForeignKey("auth.workspace.id", ondelete="CASCADE"),
        comment="Ссылка на Компанию",
        nullable=True,
    )
    workspaces_owned: Mapped[list["Workspace"]] = relationship(
        "Workspace",
        foreign_keys="[Workspace.owner_id]",
        back_populates="owner",
        lazy="selectin",
        cascade="none",
        passive_deletes=True,
    )
    workspaces_member: Mapped[list["Workspace"]] = relationship(
        "Workspace",
        secondary="auth.workspace_user",
        back_populates="members",
        lazy="selectin",
    )


class Workspace(Base):
    __table_args__ = {"schema": "auth"}
    id: Mapped[int_pk]
    title: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[str] = mapped_column(String(512), nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("auth.user.id", ondelete="SET NULL"),
        nullable=False,
        comment="Владелец аккаунта",
    )
    owner: Mapped[User] = relationship(
        User,
        foreign_keys=[owner_id],
        back_populates="workspaces_owned",
        lazy="selectin",
        cascade="none",
        passive_deletes=True,
    )
    members: Mapped[list[User]] = relationship(
        User,
        back_populates="workspaces_member",
        secondary="auth.workspace_user",
        lazy="selectin",
    )
    stores: Mapped[list["Store"]] = relationship(
        "Store",
        back_populates="workspace",
        lazy="select",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

class WorkspaceUser(Base):
    __table_args__ = {"schema": "auth"}
    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("auth.workspace.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("auth.user.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[str] = mapped_column(String(32), default="member")

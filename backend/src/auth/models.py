from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base, uuid_pk


class Admin(Base):
    id: Mapped[uuid_pk]
    email: Mapped[str] = mapped_column(String(128), nullable=False)
    hashed_password: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
        comment="Password hash (bcrypt/argon2)",
    )

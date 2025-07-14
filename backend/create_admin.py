#!/usr/bin/env python3
"""Seed‑script для создания/обновления учётки администратора.

Запускать внутри контейнера *backend*:

    docker compose exec backend python seed_admin.py \
        --email admin@example.com \
        --password SuperSecret123

По умолчанию берёт параметры из переменных окружения
`ADMIN_EMAIL` и `ADMIN_PASSWORD`, иначе – CLI‑аргументы.

Скрипт:
* Хеширует пароль `pwdlib` (argon2id, recommended).
* Идёмпотентен: если админ существует – пароль обновляется;
  если нет – создаётся новая запись.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path
from typing import Any

import sqlalchemy as sa
from pwdlib import PasswordHash

from src.database import async_session_maker
from src.auth.models import Admin

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))


pwd_hasher = PasswordHash.recommended()


async def upsert_admin(email: str, plaintext: str) -> None:
    """Создаёт или обновляет учётку администратора."""
    hash_: str = pwd_hasher.hash(plaintext)
    async with async_session_maker() as session:
        existing = await session.scalar(sa.select(Admin).where(Admin.email == email))
        if existing:
            existing.hashed_password = hash_
            action = "updated"
        else:
            session.add(Admin(email=email, hashed_password=hash_))  # type: ignore[arg-type]
            action = "created"
        await session.commit()
    print(f"Admin '{email}' {action} successfully ✔")


def parse_args() -> Any:
    parser = argparse.ArgumentParser(description="Seed admin user")
    parser.add_argument(
        "--email", default=os.getenv("ADMIN_EMAIL"), help="Admin e‑mail"
    )
    parser.add_argument(
        "--password",
        default=os.getenv("ADMIN_PASSWORD"),
        help="Admin plaintext password",
    )
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    if not args.email or not args.password:
        raise SystemExit("--email/--password (или переменные окружения) обязательны")
    await upsert_admin(args.email, args.password)


if __name__ == "__main__":
    asyncio.run(main())

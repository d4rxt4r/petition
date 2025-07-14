#!/usr/bin/env python3
"""Seed‑script: создаёт/обновляет админа и единственную кампанию Voting, не дублируя."""

from __future__ import annotations
import argparse
import asyncio
import os
import sys
from pathlib import Path
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
import sqlalchemy as sa
from pwdlib import PasswordHash

from src.database import async_session_maker
from src.auth.models import Admin
from src.vote.models import Voting, VoteStatus

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

pwd_hasher = PasswordHash.recommended()


async def upsert_admin(email: str, plaintext: str) -> None:
    hash_ = pwd_hasher.hash(plaintext)
    async with async_session_maker() as session:
        existing = await session.scalar(sa.select(Admin))
        if existing:
            existing = await session.scalar(
                sa.select(Admin).where(Admin.email == email)
            )
            if existing:
                existing.hashed_password = hash_
                print("Admin password updated")
            else:
                print("Admin exists with different email; skipping creation")
        else:
            session.add(Admin(email=email, hashed_password=hash_))  # type: ignore
            print("Admin created")
        await session.commit()


async def upsert_voting() -> None:
    now = datetime.now(timezone.utc)
    start = now
    end = now + relativedelta(months=+1)

    async with async_session_maker() as session:
        existing = await session.scalar(sa.select(Voting))
        if existing:
            print("Voting exists; skipping creation")
        else:
            session.add(
                Voting(
                    start_date=start,
                    end_date=end,
                    real_quantity=0,
                    fake_quantity=0,
                    show_real=True,
                    status=VoteStatus.collecting,
                )
            )
            print("Voting campaign created")
        await session.commit()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed admin user & voting")
    parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL"))
    parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD"))
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    if not args.email or not args.password:
        raise SystemExit("Provide --email and --password (or env variables)")
    await upsert_admin(args.email, args.password)
    await upsert_voting()


if __name__ == "__main__":
    asyncio.run(main())

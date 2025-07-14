from secrets import randbelow
from datetime import datetime, timedelta, timezone
from typing import Sequence
from uuid import UUID

from sqlalchemy import select, true, update

from src.core.generic_crud_repo import GenericCRUDRepository

from src.vote.models import SmsVerification, User, Voting
from src.vote.schemas import (
    SmsVerificationCreate,
    SmsVerificationUpdate,
    UserCreate,
    UserUpdate,
    VotingCreate,
    VotingUpdate,
)

from loguru import logger


class UserRepo(GenericCRUDRepository[User, UserCreate, UserUpdate]):
    model = User
    create_schema = UserCreate
    update_schema = UserUpdate

    async def get_all_valid(self) -> Sequence[User]:
        stmt = select(self.model).where(User.valid_vote.is_(true()))
        result = await self.db_session.execute(stmt)
        return result.scalars().all()


class VotingRepo(GenericCRUDRepository[Voting, VotingCreate, VotingUpdate]):
    model = Voting
    create_schema = VotingCreate
    update_schema = VotingUpdate


class SmsVerificationRepo(
    GenericCRUDRepository[SmsVerification, SmsVerificationCreate, SmsVerificationUpdate]
):
    model = SmsVerification
    create_schema = SmsVerificationCreate
    update_schema = SmsVerificationUpdate

    CODE_TTL = timedelta(minutes=5)
    MAX_ATTEMPTS = 10

    def _gen_code(self) -> str:
        return f"{randbelow(1_000_000):06d}"

    async def create_or_resend(self, phone: str, user_id: UUID) -> str | None:
        now = datetime.now(timezone.utc)
        logger.info(f"create_or_resend start: phone={phone}, user_id={user_id}")
        try:
            logger.debug("Selecting existing verification")
            verif = await self.db_session.scalar(
                select(SmsVerification).where(SmsVerification.phone_number == phone)
            )
            logger.debug(f"Selected verif: {verif!r}")

            if verif and verif.is_verified:
                logger.info("Already verified, returning None")
                return None

            code = self._gen_code()
            expires = now + self.CODE_TTL
            logger.debug(f"Generated code={code}, expires={expires}")

            if verif:
                logger.debug("Updating existing SmsVerification")
                res = await self.db_session.execute(
                    update(SmsVerification)
                    .where(SmsVerification.id == verif.id)
                    .values(
                        code=code, expires_at=expires, attempts=0, is_verified=False
                    )
                )
                logger.debug(f"Update result: {res.rowcount} rows")
            else:
                logger.debug("Creating new SmsVerification")
                sms = SmsVerification(
                    phone_number=phone,
                    code=code,
                    expires_at=expires,
                    user_id=user_id,
                )
                self.db_session.add(sms)
                logger.debug(f"Added new entity: {sms!r}")

            logger.info("create_or_resend complete")
            return code

        except Exception as exc:
            logger.error(f"Error in create_or_resend: {exc!r}", exc_info=True)
            raise

    async def verify_code(self, phone: str, code: str) -> bool:
        """
        Возвращает True — код принят;
                   False — неверный / истёк / превышен лимит.
        """
        now = datetime.now(timezone.utc)

        async with self.db_session.begin():
            verif = await self.db_session.scalar(
                select(SmsVerification).where(SmsVerification.phone_number == phone)
            )
            if not verif:
                return False

            if verif.is_verified or verif.expires_at < now:
                return False

            if verif.attempts >= self.MAX_ATTEMPTS:
                return False

            if verif.code != code:
                verif.attempts += 1
                return False

            verif.is_verified = True
            verif.attempts += 1
            return True

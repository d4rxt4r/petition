from secrets import randbelow
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select, update

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


class UserRepo(GenericCRUDRepository[User, UserCreate, UserUpdate]):
    model = User
    create_schema = UserCreate
    update_schema = UserUpdate


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
    MAX_ATTEMPTS = 3

    def _gen_code(self) -> str:
        return f"{randbelow(1_000_000):06d}"

    async def create_or_resend(self, phone: str, user_id: UUID) -> str | None:
        """
        • None — уже верифицировано, код не шлём.
        • str   — новый/обновлённый код для отправки.
        """
        now = datetime.now(timezone.utc)

        async with self.db_session.begin():  # единая транзакция
            verif = await self.db_session.scalar(
                select(SmsVerification).where(SmsVerification.phone_number == phone)
            )

            if verif and verif.is_verified:
                return None

            code = self._gen_code()
            expires = now + self.CODE_TTL

            if verif:
                await self.db_session.execute(
                    update(SmsVerification)
                    .where(SmsVerification.id == verif.id)
                    .values(
                        code=code,
                        expires_at=expires,
                        attempts=0,
                        is_verified=False,
                    )
                )
            else:
                self.db_session.add(
                    SmsVerification(
                        phone_number=phone,
                        code=code,
                        expires_at=expires,
                        user_id=user_id,
                    )
                )

        return code

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

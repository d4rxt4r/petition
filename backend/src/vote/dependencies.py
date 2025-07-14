from typing import Annotated

from fastapi import Depends
from src.dependencies import DBSessionDep
from src.vote.reposiotory import SmsVerificationRepo, UserRepo


def get_sms_repo(
    db_session: DBSessionDep,
) -> SmsVerificationRepo:
    return SmsVerificationRepo(db_session=db_session)


def get_user_repo(
    db_session: DBSessionDep,
) -> UserRepo:
    return UserRepo(db_session=db_session)


SmsRepoDep = Annotated[SmsVerificationRepo, Depends(get_sms_repo)]
UserRepoDep = Annotated[UserRepo, Depends(get_user_repo)]

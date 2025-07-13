from src.core.generic_crud_repo import GenericCRUDRepository
from vote.models import SmsVerification, User, Voting
from vote.schemas import (
    SmsVerificationCreate,
    SmsVerificationUpdate,
    UserCreate,
    UserUpdate,
    VotingCreate,
    VotingUpdate,
)


class UserRepo(GenericCRUDRepository[User, UserCreate, UserUpdate]):
    pass


class VotingRepo(GenericCRUDRepository[Voting, VotingCreate, VotingUpdate]):
    pass


class SmsVerificationRepo(
    GenericCRUDRepository[SmsVerification, SmsVerificationCreate, SmsVerificationUpdate]
):
    pass

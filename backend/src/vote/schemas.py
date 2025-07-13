from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_serializer

from vote.models import VoteStatus


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    patronymuic: str
    email: str
    valid_vote: bool = True

    model_config = ConfigDict(populate_by_name=True)


class UserUpdate(UserCreate):
    id: UUID


class UserRead(UserUpdate):
    pass


class VotingCreate(BaseModel):
    start_date: datetime
    end_date: datetime
    real_quantity: int
    fake_quantity: int
    show_real: bool
    status: VoteStatus

    model_config = ConfigDict(populate_by_name=True)


class VotingUpdate(VotingCreate):
    id: UUID


class VotingRead(VotingUpdate):
    pass


class SmsVerificationCreate(BaseModel):
    phone_number: str
    code: str
    created_at: datetime
    expires_at: datetime
    attemps: int
    is_verified: bool
    user_id: UUID


class SmsVerificationUpdate(SmsVerificationCreate):
    id: UUID


class SmsVerificationRead(SmsVerificationUpdate):
    pass


class ValidateVote(UserCreate):
    token: str


class CaptchaValidateResp(BaseModel):
    status: str
    message: str
    host: Optional[str]

    model_config = ConfigDict(populate_by_name=True)

    @field_serializer("message", "host")
    def none_to_empty(self, value: Optional[str], info) -> str:
        return value or ""

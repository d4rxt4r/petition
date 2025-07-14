from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, constr, field_serializer

from src.vote.models import VoteStatus


class UserCreate(BaseModel):
    phone_number: str
    full_name: str
    email: str

    model_config = ConfigDict(populate_by_name=True)


class ValidateVote(UserCreate):
    token: str


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


class VotingRead(BaseModel):
    start_date: datetime
    end_date: datetime
    quantity: int
    status: VoteStatus

    model_config = ConfigDict(populate_by_name=True)


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


class CaptchaValidateResp(BaseModel):
    status: str
    message: Optional[str]
    host: Optional[str]

    model_config = ConfigDict(populate_by_name=True)

    @field_serializer("message", "host")
    def none_to_empty(self, value: Optional[str], info) -> str:
        return value or ""


Phone = Annotated[
    str,
    Field(
        pattern=r"^(?:\+7\d{10}|\+373\d{8})$",
        description="Только +7xxxxxxxxxx или +373xxxxxxxx",
    ),
]
Code6 = Annotated[
    str,
    Field(
        pattern=r"^\d{6}$",
        description="Шестизначный цифровой код",
    ),
]


class SmsVerifyBody(BaseModel):
    phone: Phone
    code: Code6

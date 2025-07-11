from uuid import UUID
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.auth.models import Role


class WorkspaceBase(BaseModel):
    title: str
    description: str

    model_config = ConfigDict(from_attributes=True)

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[UUID] = None
    members_ids: Optional[list[UUID]] = None


class UserShort(BaseModel):
    """Легкая модель пользователя без вложенностей."""
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    username: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StoreRead(BaseModel):
    id: int
    title: str 
    seller_id: int

    model_config = ConfigDict(from_attributes=True)

class WorkspaceRead(WorkspaceBase):
    id: int
    owner: UserShort
    stores: Optional[list[StoreRead]]

    model_config = ConfigDict(from_attributes=True)

class RegisterForm(BaseModel):
    email: EmailStr
    password: str
    first_name: str         = Field(..., alias="firstName")
    last_name: str          = Field(..., alias="lastName")
    username: Optional[str] = None


class LoginForm(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    username: Optional[str]
    role: Role
    workspaces_member: Optional[list[WorkspaceRead]]
    workspaces_owned: Optional[list[WorkspaceRead]]

    model_config = ConfigDict(from_attributes=True)

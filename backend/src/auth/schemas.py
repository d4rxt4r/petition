from pydantic import BaseModel, ConfigDict, EmailStr


class LoginForm(BaseModel):
    email: EmailStr
    password: str


class AdminRead(BaseModel):
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


class RegisterForm(BaseModel):
    email: EmailStr
    password: str

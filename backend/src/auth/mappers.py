from src.auth.models import Admin
from src.auth.schemas import UserRead


def user_to_read(user: Admin) -> UserRead:
    return UserRead.model_validate(user)

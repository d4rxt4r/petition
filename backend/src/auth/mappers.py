from src.auth.models import Admin
from src.auth.schemas import AdminRead


def admin_to_read(user: Admin) -> AdminRead:
    return AdminRead.model_validate(user)

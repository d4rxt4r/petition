from fastapi import APIRouter, HTTPException, Request
import requests
from sqlalchemy import select
from starlette.responses import JSONResponse

from src.config import settings
from src.dependencies import AuthDep, DBSessionDep
from src.vote.dependencies import SmsRepoDep, UserRepoDep
from src.vote.models import SmsVerification, User
from src.vote.schemas import (
    CaptchaValidateResp,
    SmsVerifyBody,
    UserCreate,
    ValidateVote,
)

from src.core.sms_aero import send_code


router = APIRouter(prefix="/vote", tags=["vote"])


@router.post("/validate")
async def validate_vote(
    form_data: ValidateVote,
    request: Request,
    user_repo: UserRepoDep,
    sms_repo: SmsRepoDep,
    db: DBSessionDep,
):
    # 1. Проверка наличия токена ------------------------------------------------
    if not form_data.token:
        raise HTTPException(status_code=400, detail="Missing token")

    # 2. Валидация капчи --------------------------------------------------------
    forwarded_for = request.headers.get("x-forwarded-for")
    client_ip = (
        forwarded_for.split(",")[0].strip()
        if forwarded_for
        else (request.client.host if request.client else None)
    )

    body = {
        "secret": settings.YCAPTCHA_SERVER_KEY,
        "token": form_data.token,
        **({"ip": client_ip} if client_ip else {}),
    }

    resp = requests.post(
        "https://smartcaptcha.yandexcloud.net/validate", data=body, timeout=2
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Captcha service error")

    result = CaptchaValidateResp.model_validate(resp.json())
    if result.status != "ok":
        return JSONResponse(
            status_code=400,
            content={"status": "failed", "message": result.message},
        )

    # 3. Пользователь + SMS в одной транзакции ---------------------------------
    phone = form_data.phone_number  # pydantic гарантирует +7 / +373 формат

    try:
        async with db.begin():
            # 3.1 Ищем пользователя через SmsVerification → User
            stmt = (
                select(User)
                .join(SmsVerification, SmsVerification.user_id == User.id)
                .where(SmsVerification.phone_number == phone)
            )
            user: User | None = await db.scalar(stmt)

            # 3.2 Если не найден — создаём
            if user is None:
                user = await user_repo.create(
                    UserCreate(full_name=form_data.full_name, email=form_data.email)
                )

            # 3.3 Создаём/переотправляем код
            code = await sms_repo.create_or_resend(phone, user.id)

            # 3.4 Если уже было подтверждено — прерываемся без отправки SMS
            if code is None:
                return {"status": "already_verified", "host": result.host}

            # 3.5 Пытаемся отправить SMS (может выбросить исключение)
            await send_code(
                phone, code
            )  # Twilio пример :contentReference[oaicite:3]{index=3}

        # 4. Транзакция успешно завершена
        return {"status": "sms_sent", "host": result.host}

    except Exception:
        # Любая ошибка ⇒ rollback (контекст `begin()` сделает это) + 500
        # Логи пишем отдельно, детали клиенту не раскрываем
        raise HTTPException(status_code=500, detail="Server error")


@router.post("/verify_sms")
async def verify_sms(body: SmsVerifyBody, repo: SmsRepoDep):
    ok = await repo.verify_code(body.phone, body.code)
    if not ok:
        raise HTTPException(400, "Код неверен, истёк или превышено число попыток")
    return {"status": "ok"}

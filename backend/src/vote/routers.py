from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from sqlalchemy.exc import SQLAlchemyError, DBAPIError, PendingRollbackError
import requests
from sqlalchemy import select
from starlette.responses import JSONResponse

from src.config import settings
from src.dependencies import AuthDep, DBSessionDep
from src.vote.dependencies import SmsRepoDep, UserRepoDep, VotingRepoDep
from src.vote.models import SmsVerification, User
from src.vote.schemas import (
    CaptchaValidateResp,
    SmsVerifyBody,
    UserCreate,
    UserRead,
    UserUpdate,
    ValidateVote,
    VotingRead,
)

from src.core.sms_aero import send_code

from loguru import logger

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

    logger.info(resp.json())

    result = CaptchaValidateResp.model_validate(resp.json())

    if result.status != "ok":
        return JSONResponse(
            status_code=400,
            content={"status": "failed", "message": result.message},
        )

    # 3. Пользователь + SMS в одной транзакции ---------------------------------
    phone = form_data.phone_number  # pydantic гарантирует +7 / +373 формат

    try:
        logger.info("Начало записи в базу")
        async with db.begin():
            logger.info("Ищем пользователя в базе")
            stmt = select(User).where(User.phone_number == phone)
            try:
                user: User | None = await db.scalar(stmt)
            except PendingRollbackError:
                await db.rollback()
                logger.error("Session in FAILED state, rolled back")
                raise HTTPException(500, "DB rollback needed")
            except DBAPIError as exc:
                logger.exception("Low-level DB error")
                raise HTTPException(502, "Database unavailable")
            except SQLAlchemyError as exc:
                logger.exception("ORM error")
                raise HTTPException(500, "Query error")

            logger.info("Поиск пользователя завершен успешно")
            if user is None:
                user = await user_repo.create(
                    UserCreate(
                        phone_number=form_data.phone_number,
                        full_name=form_data.full_name,
                        email=form_data.email,
                    )
                )

            logger.info("Создаем смс верификацию")
            code = await sms_repo.create_or_resend(phone, user.id)

            logger.info("Смс верификацию создана")

            if code is None:
                raise HTTPException(
                    status_code=400,
                    detail={"status": "already_verified", "host": result.host},
                )

            logger.info("Отправляем смс")
            try:
                send_code(phone, code)
            except Exception as exc:
                logger.exception("SMS sending failed")
                raise HTTPException(502, "SMS provider error")

        return {"status": "sms_sent", "host": result.host}

    except Exception:
        raise HTTPException(status_code=500, detail="Server error")


@router.post("/verify_sms")
async def verify_sms(body: SmsVerifyBody, repo: SmsRepoDep):
    ok = await repo.verify_code(body.phone, body.code)
    if not ok:
        raise HTTPException(400, "Код неверен, истёк или превышено число попыток")
    return {"status": "ok"}


@router.get("/vote_info")
async def vote_counts(
    voting_repo: VotingRepoDep,
    user_repo: UserRepoDep,
) -> VotingRead:
    votings = await voting_repo.get_all()
    if not votings:
        raise HTTPException(status_code=404, detail="No voting campaigns found")

    voting = votings[0]
    users = await user_repo.get_all()
    real_quantity = len(users)
    quantity = real_quantity if voting.show_real else voting.fake_quantity

    return VotingRead(
        start_date=voting.start_date,
        end_date=voting.end_date,
        quantity=quantity,
        status=voting.status,
    )


@router.get("/all_user")
async def get_all_user(user_repo: UserRepoDep) -> list[UserRead]:
    return [UserRead.model_validate(obj) for obj in await user_repo.get_all()]


@router.post("/update_user")
async def get_update_user(
    user_repo: UserRepoDep, form_data: UserUpdate
) -> Optional[UserUpdate]:
    updated_obj = await user_repo.update(obj_id=form_data.id, data=form_data)
    if updated_obj:
        return UserRead.model_validate(updated_obj)

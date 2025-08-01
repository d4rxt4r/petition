from typing import IO, Optional
from io import BytesIO
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
import requests
from sqlalchemy import select, update
from starlette.responses import JSONResponse
import pandas as pd

from src.config import settings
from src.dependencies import AuthDep, DBSessionDep
from src.vote.dependencies import SmsRepoDep, UserRepoDep, VotingRepoDep
from src.vote.models import User, Voting
from src.vote.schemas import (
    CaptchaValidateResp,
    SmsVerifyBody,
    UserCreate,
    UserRead,
    UserUpdate,
    ValidateVote,
    VotingRead,
    VotingUpdate,
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

    phone = form_data.phone_number

    try:
        logger.info("Перед поиском пользователя")
        stmt = select(User).where(User.phone_number == phone)
        user: User | None = await db.scalar(stmt)

        logger.info("После поиска пользователя")
        if user is None:
            user = await user_repo.create(
                UserCreate(
                    phone_number=form_data.phone_number,
                    full_name=form_data.full_name,
                    email=form_data.email,
                )
            )

        logger.info("Перед отправкой смс")
        code = await sms_repo.create_or_resend(phone, user.id)
        logger.info("После отправки смс")

        if code is None:
            raise HTTPException(
                status_code=400,
                detail={"status": "already_verified", "host": result.host},
            )

        try:
            send_code(phone, code)
        except Exception as exc:
            logger.exception("SMS sending failed")
            raise HTTPException(502, "SMS provider error")

        await db.commit()
        return {"status": "sms_sent", "host": result.host}

    except Exception:
        raise HTTPException(status_code=500, detail="Server error")


@router.post("/verify_sms")
async def verify_sms(
    body: SmsVerifyBody,
    repo: SmsRepoDep,
    voting_repo: VotingRepoDep,
):
    ok = await repo.verify_code(body.phone, body.code)
    if not ok:
        raise HTTPException(400, "Код неверен, истёк или превышено число попыток")

    try:
        voting = (await voting_repo.get_all())[0]
        await voting_repo.db_session.execute(
            update(Voting)
            .where(Voting.id == voting.id)
            .values(fake_quantity=Voting.fake_quantity + 1)
        )
        await voting_repo.db_session.commit()

    except Exception as exc:
        logger.error(f"Не удалось сделать инкримент {exc}")
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
    users = await user_repo.get_all_valid()
    real_quantity = len(users)
    quantity = real_quantity if voting.show_real else voting.fake_quantity

    return VotingRead(
        start_date=voting.start_date,
        end_date=voting.end_date,
        quantity=quantity,
        status=voting.status,
    )


@router.get("/dash_vote_info")
async def vote_info(
    pyload: AuthDep,
    voting_repo: VotingRepoDep,
    user_repo: UserRepoDep,
) -> VotingUpdate:
    votings = await voting_repo.get_all()
    if not votings:
        raise HTTPException(status_code=404, detail="No voting campaigns found")

    voting = votings[0]
    users = await user_repo.get_all()
    real_quantity = len(users)

    return VotingUpdate(
        id=voting.id,
        start_date=voting.start_date,
        end_date=voting.end_date,
        real_quantity=real_quantity,
        fake_quantity=voting.fake_quantity,
        show_real=voting.show_real,
        status=voting.status,
    )


@router.get("/all_user")
async def get_all_user(
    pyload: AuthDep,
    user_repo: UserRepoDep,
) -> list[UserRead]:
    return [UserRead.model_validate(obj) for obj in await user_repo.get_all()]


@router.post("/update_user")
async def get_update_user(
    pyload: AuthDep,
    user_repo: UserRepoDep,
    form_data: UserUpdate,
) -> Optional[UserUpdate]:
    upd_obj = await user_repo.update(obj_id=form_data.id, data=form_data)
    if upd_obj:
        return UserUpdate.model_validate(upd_obj)


@router.post("/update_vote")
async def update_vote(
    pyload: AuthDep,
    voting_repo: VotingRepoDep,
    form_data: VotingUpdate,
) -> Optional[VotingUpdate]:
    upd_obj = await voting_repo.update(obj_id=form_data.id, data=form_data)
    if upd_obj:
        return VotingUpdate.model_validate(upd_obj)


@router.get("/export_users_excel", response_class=StreamingResponse)
async def export_users_excel(
    pyload: AuthDep,
    user_repo: UserRepoDep,
) -> StreamingResponse:
    users = await user_repo.get_all()
    data = [
        {
            "ID": str(u.id),
            "Full Name": u.full_name or "",
            "Email": u.email or "",
            "Phone Number": u.phone_number,
            "Valid Vote": "Да" if u.valid_vote else "Нет",
        }
        for u in users
    ]

    # 2. DataFrame -> Excel в память
    df = pd.DataFrame(data)
    buffer: IO[bytes] = BytesIO()  # достаточно IO[bytes] для Pyright
    with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:  # pyright: ignore
        df.to_excel(writer, index=False)
    buffer.seek(0)

    # 3. Отдаём файл
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="users.xlsx"'},
    )

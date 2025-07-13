from fastapi import APIRouter, HTTPException, Request
import requests

from src.config import settings
from dependencies import AuthDep, DBSessionDep
from vote.schemas import CaptchaValidateResp, ValidateVote


router = APIRouter(prefix="/vote", tags=["vote"])


@router.post("/validate_vote")
async def validate_vote(
    db_session: DBSessionDep,
    payload: AuthDep,
    form_data: ValidateVote,
    request: Request,
):
    if not form_data.token:
        raise HTTPException(status_code=400, detail="Missing token")

    forwarded_for = request.headers.get("x-forwarded-for")
    client_ip = (
        forwarded_for.split(",")[0].strip()
        if forwarded_for
        else (request.client.host if request.client else None)
    )

    body = {
        "secret": settings.YCAPTCHA_SERVER_KEY,
        "token": form_data.token,
    }
    if client_ip:
        body["ip"] = client_ip

    resp = requests.post(
        "https://smartcaptcha.yandexcloud.net/validate", data=body, timeout=2
    )

    if resp.status_code != 200:
        raise HTTPException(status_code=200, detail="Captcha service error")

    result = CaptchaValidateResp.model_validate(resp.json())

    if result.status == "ok":
        return {"status": "ok", "host": result.host}
    else:
        return {"status": "failed", "message": result.message}

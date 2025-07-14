from urllib.parse import quote_plus
import requests
import httpx

from src.config import settings
from loguru import logger


# async def send_code(phone: str, code: str) -> None:
#     """Отправить 6-значный код через SMS Aero."""
#     text = quote_plus(f"Код подтверждения: {code}")
#     url = (
#         f"https://{settings.SMS_EMAIL}:{settings.SMS_API_KEY}@gate.smsaero.ru/v2/sms/send"
#         f"?number={phone.lstrip('+')}&sign={settings.SMS_SIGN}&text={text}"
#     )
#     async with httpx.AsyncClient(timeout=5.0) as client:
#         r = await client.get(url)
#     r.raise_for_status()


def send_code(phone: str, code: str) -> None:
    """Отправить 6-значный код через SMS Aero (синхронно)."""
    text = quote_plus(f"Код подтверждения: {code}")
    clean_phone = phone.lstrip("+")
    url = f"https://{settings.SMS_EMAIL}:{settings.SMS_API_KEY}@gate.smsaero.ru/v2/sms/send?number={clean_phone}&text={text}&sign={settings.SMS_SIGN}"

    logger.info(f"send_code -> GET {url}")
    try:
        response = requests.get(url, timeout=5.0)
        logger.info(f"send_code -> status: {response.status_code}")
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.error(f"send_code: HTTP error {exc!r}")
        raise

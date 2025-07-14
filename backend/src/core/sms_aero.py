from urllib.parse import quote_plus
import httpx

from src.config import settings


async def send_code(phone: str, code: str) -> None:
    """Отправить 6-значный код через SMS Aero."""
    text = quote_plus(f"Код подтверждения: {code}")
    url = (
        f"https://{settings.SMS_EMAIL}:{settings.SMS_API_KEY}@gate.smsaero.ru/v2/sms/send"
        f"?number={phone.lstrip('+')}&sign={settings.SMS_SIGN}&text={text}"
    )
    async with httpx.AsyncClient(timeout=5.0) as client:
        r = await client.get(url)
    r.raise_for_status()

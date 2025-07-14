from typing import Final
from urllib.parse import quote_plus
import httpx
import os


async def send_code(phone: str, code: str) -> None:
    """Отправить 6-значный код через SMS Aero."""
    text = quote_plus(f"Код подтверждения: {code}")
    url = (
        f"https://{EMAIL}:{API_KEY}@gate.smsaero.ru/v2/sms/send"
        f"?number={phone.lstrip('+')}&sign={SIGN}&channel={CHANNEL}&text={text}"
    )
    async with httpx.AsyncClient(timeout=5.0) as client:
        r = await client.get(url)
    r.raise_for_status()  # 200 ⇒ JSON {"success":true,…} :contentReference[oaicite:4]{index=4}

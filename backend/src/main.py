from authx import AuthX
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from authx.exceptions import MissingTokenError, AuthXException
from loguru import logger

from src.auth.models import Admin
from src.config import authx_config
from src.auth import auth_router


app = FastAPI()

app.include_router(auth_router)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # либо ["*"] — но только без cookies
    allow_credentials=True,  # нужен, если фронт шлёт cookies / auth-header
    allow_methods=["GET", "POST"],  # ["GET", "POST", ...] — сузите в проде
    allow_headers=["*"],  # какие заголовки разрешаем
)


@app.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok"}


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Блокировка CONNECT запросов
    if request.method == "CONNECT":
        raise HTTPException(status_code=405, detail="Method not allowed")

    # Блокировка прокси запросов
    if str(request.url.path).startswith("http"):
        raise HTTPException(status_code=400, detail="Bad request")

    # Блокировка подозрительных User-Agent
    user_agent = request.headers.get("user-agent", "").lower()
    blocked_agents = ["wget", "python", "scanner", "bot"]
    if any(agent in user_agent for agent in blocked_agents):
        raise HTTPException(status_code=403, detail="Forbidden")

    response = await call_next(request)
    return response


# Безопасные заголовки
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


auth = AuthX(config=authx_config, model=Admin)
auth.handle_errors(app)


@app.exception_handler(MissingTokenError)
async def handle_missing_token(_: Request, exc: MissingTokenError):
    return JSONResponse(
        {"detail": "Missing or invalid access token"},
        status_code=status.HTTP_401_UNAUTHORIZED,
    )


@app.exception_handler(AuthXException)
async def handle_authx(_: Request, exc: AuthXException):
    return JSONResponse({"detail": str(exc)}, status_code=status.HTTP_401_UNAUTHORIZED)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    try:
        client_host = request.client.host if request.client else "unknown"
        logger.info(f"Request: {request.method} {request.url} from {client_host}")
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Request failed: {e}")
        raise

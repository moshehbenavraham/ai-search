from fastapi import APIRouter

from app.api.routes import (
    gemini,
    items,
    login,
    perplexity,
    private,
    tavily,
    users,
    utils,
    youcom,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(tavily.router)
api_router.include_router(perplexity.router)
api_router.include_router(gemini.router)
api_router.include_router(youcom.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)

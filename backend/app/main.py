import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.core.exceptions import TavilyAPIError
from app.schemas.tavily import ErrorResponse


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.exception_handler(TavilyAPIError)
async def tavily_exception_handler(
    _request: Request,
    exc: TavilyAPIError,
) -> JSONResponse:
    """Handle TavilyAPIError exceptions.

    Converts TavilyAPIError to a structured JSON error response with
    appropriate HTTP status code.

    Args:
        _request: The incoming request that caused the exception (unused).
        exc: The TavilyAPIError that was raised.

    Returns:
        JSONResponse with ErrorResponse body and appropriate status code.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
        ).model_dump(),
    )


app.include_router(api_router, prefix=settings.API_V1_STR)

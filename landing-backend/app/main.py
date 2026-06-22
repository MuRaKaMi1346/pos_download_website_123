"""FastAPI application factory for the SmartBrew landing backend."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api import health
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.middleware import configure_middleware
from app.core.rate_limit import limiter
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="SmartBrew Landing API",
        version="1.0.0",
        debug=settings.debug,
        lifespan=lifespan,
    )

    app.state.limiter = limiter
    # slowapi types its handler with the narrow RateLimitExceeded exception, which
    # is stricter than Starlette's generic Exception handler signature.
    rate_limit_handler = _rate_limit_exceeded_handler
    app.add_exception_handler(RateLimitExceeded, rate_limit_handler)  # type: ignore[arg-type]

    configure_middleware(app, settings)

    app.include_router(health.router)
    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()

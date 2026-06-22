"""Newsletter subscription endpoint (rate-limited write)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response, status
from sqlmodel import Session

from app.core.config import Settings, get_settings
from app.core.rate_limit import limiter
from app.db.session import get_session
from app.schemas.newsletter import NewsletterCreate, NewsletterResponse
from app.services.newsletter_service import subscribe

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/", response_model=NewsletterResponse)
@limiter.limit("3/minute")
def subscribe_newsletter(
    request: Request,
    response: Response,
    payload: NewsletterCreate,
    session: Annotated[Session, Depends(get_session)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> NewsletterResponse:
    subscriber, created = subscribe(
        session,
        str(payload.email),
        double_opt_in=settings.newsletter_double_opt_in,
    )
    response.status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
    return NewsletterResponse(email=subscriber.email, confirmed=subscriber.confirmed)

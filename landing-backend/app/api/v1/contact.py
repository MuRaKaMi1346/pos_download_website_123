"""Contact form endpoint (rate-limited write)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from slowapi.util import get_remote_address
from sqlmodel import Session

from app.core.config import Settings, get_settings
from app.core.rate_limit import limiter
from app.db.session import get_session
from app.schemas.contact import ContactCreate, ContactResponse
from app.services.contact_service import create_contact

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def submit_contact(
    request: Request,
    payload: ContactCreate,
    session: Annotated[Session, Depends(get_session)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> ContactResponse:
    message = create_contact(
        session,
        payload,
        client_ip=get_remote_address(request),
        settings=settings,
    )
    assert message.id is not None  # set after commit/refresh
    return ContactResponse(
        id=message.id,
        created_at=message.created_at,
        handled=message.handled,
    )

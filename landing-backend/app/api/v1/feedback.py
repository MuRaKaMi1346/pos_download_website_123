"""Customer feedback endpoint — multipart text + optional image (rate-limited)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from slowapi.util import get_remote_address
from sqlmodel import Session

from app.core.config import Settings, get_settings
from app.core.rate_limit import limiter
from app.db.session import get_session
from app.schemas.feedback import FeedbackResponse
from app.services.feedback_service import (
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGE_BYTES,
    create_feedback,
)

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def submit_feedback(
    request: Request,
    session: Annotated[Session, Depends(get_session)],
    settings: Annotated[Settings, Depends(get_settings)],
    message: Annotated[str, Form(min_length=1, max_length=5000)],
    rating: Annotated[int | None, Form(ge=1, le=5)] = None,
    email: Annotated[str | None, Form(max_length=254)] = None,
    image: Annotated[UploadFile | None, File()] = None,
) -> FeedbackResponse:
    image_data: bytes | None = None
    image_content_type: str | None = None
    image_filename: str | None = None

    if image is not None and image.filename:
        data = await image.read()
        if len(data) > MAX_IMAGE_BYTES:
            raise HTTPException(
                status.HTTP_413_CONTENT_TOO_LARGE,
                detail="Image too large (max 5 MB).",
            )
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Unsupported image type. Use PNG, JPEG, WebP, or GIF.",
            )
        if data:  # ignore a zero-byte upload
            image_data = data
            image_content_type = image.content_type
            image_filename = image.filename

    cleaned_email = email.strip() if email else None
    feedback = create_feedback(
        session,
        message=message.strip(),
        rating=rating,
        email=cleaned_email or None,
        image_data=image_data,
        image_content_type=image_content_type,
        image_filename=image_filename,
        client_ip=get_remote_address(request),
        settings=settings,
    )
    assert feedback.id is not None  # set after commit/refresh
    return FeedbackResponse(
        id=feedback.id,
        created_at=feedback.created_at,
        handled=feedback.handled,
    )

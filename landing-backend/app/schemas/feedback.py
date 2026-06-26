"""Feedback endpoint request/response schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class FeedbackResponse(BaseModel):
    id: int
    created_at: datetime
    handled: bool


class FeedbackAdminItem(BaseModel):
    """Listing row for the admin view — image bytes are served separately."""

    id: int
    message: str
    rating: int | None
    email: str | None
    has_image: bool
    image_content_type: str | None
    created_at: datetime
    handled: bool

"""Customer feedback submission model (optionally with a screenshot)."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class Feedback(SQLModel, table=True):
    __tablename__ = "feedback"

    id: int | None = Field(default=None, primary_key=True)
    message: str
    rating: int | None = Field(default=None)
    email: str | None = Field(default=None)
    # The attached image is stored inline (LargeBinary). Kept optional and size-
    # capped by the service, so a row stays small when no screenshot is sent.
    image_data: bytes | None = Field(default=None)
    image_content_type: str | None = Field(default=None)
    image_filename: str | None = Field(default=None)
    ip_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    handled: bool = Field(default=False)

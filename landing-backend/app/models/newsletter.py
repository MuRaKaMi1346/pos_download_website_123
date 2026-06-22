"""Newsletter subscriber model."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class NewsletterSubscriber(SQLModel, table=True):
    __tablename__ = "newsletter_subscribers"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    confirmed: bool = Field(default=False)
    confirm_token: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    confirmed_at: datetime | None = Field(default=None)

"""Contact form submission model."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class ContactMessage(SQLModel, table=True):
    __tablename__ = "contact_messages"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str
    subject: str
    message: str
    ip_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    handled: bool = Field(default=False)

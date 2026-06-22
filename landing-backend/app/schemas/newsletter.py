"""Newsletter endpoint request/response schemas."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr


class NewsletterCreate(BaseModel):
    email: EmailStr


class NewsletterResponse(BaseModel):
    email: str
    confirmed: bool

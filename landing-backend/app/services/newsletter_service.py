"""Newsletter subscription business logic."""

from __future__ import annotations

import secrets
from datetime import UTC, datetime

from sqlmodel import Session

from app.models.newsletter import NewsletterSubscriber
from app.repositories import newsletter_repository


def subscribe(
    session: Session,
    email: str,
    *,
    double_opt_in: bool,
) -> tuple[NewsletterSubscriber, bool]:
    """Subscribe an email. Returns (subscriber, created). Idempotent on email."""
    existing = newsletter_repository.get_by_email(session, email)
    if existing is not None:
        return existing, False

    subscriber = NewsletterSubscriber(
        email=email,
        confirmed=not double_opt_in,
        confirm_token=secrets.token_urlsafe(32) if double_opt_in else None,
        confirmed_at=None if double_opt_in else datetime.now(UTC),
    )
    subscriber = newsletter_repository.add(session, subscriber)
    return subscriber, True

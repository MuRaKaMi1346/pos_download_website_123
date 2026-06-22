"""Contact submission business logic."""

from __future__ import annotations

from sqlmodel import Session

from app.core.config import Settings
from app.models.contact import ContactMessage
from app.repositories import contact_repository
from app.schemas.contact import ContactCreate
from app.utils.email import maybe_send_contact_email
from app.utils.security import hash_ip


def create_contact(
    session: Session,
    payload: ContactCreate,
    *,
    client_ip: str,
    settings: Settings,
) -> ContactMessage:
    message = ContactMessage(
        name=payload.name,
        email=str(payload.email),
        subject=payload.subject,
        message=payload.message,
        ip_hash=hash_ip(client_ip, settings.secret),
    )
    message = contact_repository.add(session, message)
    maybe_send_contact_email(settings, message)
    return message

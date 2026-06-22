"""Persistence for contact messages."""

from __future__ import annotations

from sqlmodel import Session

from app.models.contact import ContactMessage


def add(session: Session, message: ContactMessage) -> ContactMessage:
    session.add(message)
    session.commit()
    session.refresh(message)
    return message

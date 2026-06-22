"""Persistence for newsletter subscribers."""

from __future__ import annotations

from sqlmodel import Session, select

from app.models.newsletter import NewsletterSubscriber


def get_by_email(session: Session, email: str) -> NewsletterSubscriber | None:
    statement = select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
    return session.exec(statement).first()


def add(session: Session, subscriber: NewsletterSubscriber) -> NewsletterSubscriber:
    session.add(subscriber)
    session.commit()
    session.refresh(subscriber)
    return subscriber

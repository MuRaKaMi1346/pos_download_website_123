"""Persistence for customer feedback."""

from __future__ import annotations

from sqlmodel import Session, select

from app.models.feedback import Feedback


def add(session: Session, feedback: Feedback) -> Feedback:
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return feedback


def list_recent(session: Session, limit: int = 200) -> list[Feedback]:
    statement = select(Feedback).order_by(Feedback.created_at.desc()).limit(limit)  # type: ignore[attr-defined]
    return list(session.exec(statement).all())


def get(session: Session, feedback_id: int) -> Feedback | None:
    return session.get(Feedback, feedback_id)

"""Customer feedback business logic + upload constraints."""

from __future__ import annotations

from sqlmodel import Session

from app.core.config import Settings
from app.models.feedback import Feedback
from app.repositories import feedback_repository
from app.utils.security import hash_ip

# Image upload limits, shared with the endpoint so the rules live in one place.
ALLOWED_IMAGE_TYPES: frozenset[str] = frozenset(
    {"image/png", "image/jpeg", "image/webp", "image/gif"}
)
MAX_IMAGE_BYTES: int = 5 * 1024 * 1024  # 5 MB


def create_feedback(
    session: Session,
    *,
    message: str,
    rating: int | None,
    email: str | None,
    image_data: bytes | None,
    image_content_type: str | None,
    image_filename: str | None,
    client_ip: str,
    settings: Settings,
) -> Feedback:
    feedback = Feedback(
        message=message,
        rating=rating,
        email=email,
        image_data=image_data,
        image_content_type=image_content_type,
        image_filename=image_filename,
        ip_hash=hash_ip(client_ip, settings.secret),
    )
    return feedback_repository.add(session, feedback)

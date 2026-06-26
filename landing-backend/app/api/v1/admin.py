"""Admin-only operations gated by a shared secret header."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from fastapi.responses import HTMLResponse
from sqlmodel import Session

from app.api.deps import get_release_service
from app.api.v1._dashboard import FEEDBACK_DASHBOARD_HTML
from app.core.config import Settings, get_settings
from app.db.session import get_session
from app.repositories import feedback_repository
from app.schemas.feedback import FeedbackAdminItem
from app.services.release_service import ReleaseService

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_admin(token: str | None, settings: Settings) -> None:
    if not token or token != settings.admin_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid admin token")


@router.post("/releases/reload")
def reload_releases(
    settings: Annotated[Settings, Depends(get_settings)],
    service: Annotated[ReleaseService, Depends(get_release_service)],
    x_admin_token: Annotated[str | None, Header()] = None,
) -> dict[str, int]:
    """Re-read release manifests from disk without restarting the service."""
    _require_admin(x_admin_token, settings)
    return {"reloaded": service.reload()}


@router.get("/feedback/view", response_class=HTMLResponse, include_in_schema=False)
def feedback_dashboard() -> HTMLResponse:
    """In-browser dashboard to read feedback. The admin token is entered in the
    page (kept in sessionStorage), so this HTML itself needs no auth."""
    return HTMLResponse(FEEDBACK_DASHBOARD_HTML)


@router.get("/feedback", response_model=list[FeedbackAdminItem])
def list_feedback(
    settings: Annotated[Settings, Depends(get_settings)],
    session: Annotated[Session, Depends(get_session)],
    x_admin_token: Annotated[str | None, Header()] = None,
) -> list[FeedbackAdminItem]:
    """Most-recent customer feedback. Image bytes are fetched separately."""
    _require_admin(x_admin_token, settings)
    return [
        FeedbackAdminItem(
            id=row.id if row.id is not None else 0,
            message=row.message,
            rating=row.rating,
            email=row.email,
            has_image=row.image_data is not None,
            image_content_type=row.image_content_type,
            created_at=row.created_at,
            handled=row.handled,
        )
        for row in feedback_repository.list_recent(session)
    ]


@router.get("/feedback/{feedback_id}/image")
def get_feedback_image(
    feedback_id: int,
    settings: Annotated[Settings, Depends(get_settings)],
    session: Annotated[Session, Depends(get_session)],
    x_admin_token: Annotated[str | None, Header()] = None,
) -> Response:
    """Serve the screenshot attached to a feedback row."""
    _require_admin(x_admin_token, settings)
    row = feedback_repository.get(session, feedback_id)
    if row is None or row.image_data is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No image for that feedback")
    return Response(
        content=row.image_data,
        media_type=row.image_content_type or "application/octet-stream",
    )

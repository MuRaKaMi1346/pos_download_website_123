"""Admin-only operations gated by a shared secret header."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.api.deps import get_release_service
from app.core.config import Settings, get_settings
from app.services.release_service import ReleaseService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/releases/reload")
def reload_releases(
    settings: Annotated[Settings, Depends(get_settings)],
    service: Annotated[ReleaseService, Depends(get_release_service)],
    x_admin_token: Annotated[str | None, Header()] = None,
) -> dict[str, int]:
    """Re-read release manifests from disk without restarting the service."""
    if not x_admin_token or x_admin_token != settings.admin_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid admin token")
    return {"reloaded": service.reload()}

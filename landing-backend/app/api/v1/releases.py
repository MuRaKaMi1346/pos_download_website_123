"""Public, cacheable release manifest endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.deps import get_release_service
from app.schemas.release import Release
from app.services.release_service import ReleaseService

router = APIRouter(prefix="/releases", tags=["releases"])

_CACHE_CONTROL = "public, max-age=300"


@router.get("/latest", response_model=Release)
def get_latest_release(
    response: Response,
    service: Annotated[ReleaseService, Depends(get_release_service)],
) -> Release:
    latest = service.latest()
    if latest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No releases available")
    response.headers["Cache-Control"] = _CACHE_CONTROL
    return latest


@router.get("/", response_model=list[Release])
def list_releases(
    response: Response,
    service: Annotated[ReleaseService, Depends(get_release_service)],
) -> list[Release]:
    response.headers["Cache-Control"] = _CACHE_CONTROL
    return service.all()

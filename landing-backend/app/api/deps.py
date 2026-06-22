"""Shared FastAPI dependencies."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends

from app.core.config import Settings, get_settings
from app.services.release_service import ReleaseService


@lru_cache
def _build_release_service(releases_dir: str, debug: bool) -> ReleaseService:
    """Cache one ReleaseService per (dir, debug) so its in-memory cache persists."""
    return ReleaseService(Path(releases_dir), debug=debug)


def get_release_service(
    settings: Annotated[Settings, Depends(get_settings)],
) -> ReleaseService:
    return _build_release_service(str(settings.releases_dir), settings.debug)

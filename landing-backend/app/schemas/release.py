"""Public response schemas for the release manifest endpoints."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ReleaseChannel(BaseModel):
    """A single downloadable artifact for one OS."""

    url: str
    size_bytes: int = Field(ge=0)
    sha256: str


class Release(BaseModel):
    """One published version across all OS channels."""

    version: str
    released_at: datetime
    channels: dict[str, ReleaseChannel]
    notes_url: str

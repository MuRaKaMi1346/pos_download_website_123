"""Loads release manifests from YAML files and serves them sorted by version.

``releases/*.yaml`` is the source of truth — one file per published version.
Results are cached in memory unless ``debug`` is set, in which case the
directory is re-read on every access (handy in development).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml
from packaging.version import InvalidVersion, Version

from app.schemas.release import Release


class ReleaseService:
    def __init__(self, releases_dir: Path, *, debug: bool = False) -> None:
        self._dir = releases_dir
        self._debug = debug
        self._cache: list[Release] | None = None

    def _parse_file(self, path: Path) -> Release:
        data: dict[str, Any] = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        # Derive a changelog anchor from the version when not explicitly set.
        if "notes_url" not in data and "version" in data:
            slug = str(data["version"]).replace(".", "-")
            data["notes_url"] = f"/changelog#{slug}"
        return Release.model_validate(data)

    def _load(self) -> list[Release]:
        if not self._dir.is_dir():
            return []
        releases = [self._parse_file(path) for path in sorted(self._dir.glob("*.yaml"))]

        def sort_key(release: Release) -> Version:
            try:
                return Version(release.version)
            except InvalidVersion:
                return Version("0")

        releases.sort(key=sort_key, reverse=True)
        return releases

    def all(self) -> list[Release]:
        """All releases, newest first. Cached unless in debug mode."""
        if self._debug or self._cache is None:
            self._cache = self._load()
        return self._cache

    def latest(self) -> Release | None:
        """The highest semantic version, or ``None`` if there are no releases."""
        releases = self.all()
        return releases[0] if releases else None

    def reload(self) -> int:
        """Force a re-read from disk. Returns the number of releases loaded."""
        self._cache = self._load()
        return len(self._cache)

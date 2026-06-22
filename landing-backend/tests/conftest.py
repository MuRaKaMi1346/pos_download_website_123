"""Shared pytest fixtures: in-memory DB, TestClient, and a temp releases dir."""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.api.deps import get_release_service
from app.core.rate_limit import limiter
from app.db.session import get_session
from app.main import app
from app.services.release_service import ReleaseService


def release_yaml(version: str, released_at: str = "2026-06-08T00:00:00Z") -> str:
    """Minimal valid release manifest text for a given version."""
    digest = "0" * 64
    return (
        f'version: "{version}"\n'
        f'released_at: "{released_at}"\n'
        "channels:\n"
        "  windows:\n"
        f'    url: "https://cdn.smartbrew.app/releases/{version}/win.exe"\n'
        "    size_bytes: 100000000\n"
        f'    sha256: "{digest}"\n'
        "  macos:\n"
        f'    url: "https://cdn.smartbrew.app/releases/{version}/mac.dmg"\n'
        "    size_bytes: 100000000\n"
        f'    sha256: "{digest}"\n'
    )


@pytest.fixture(autouse=True)
def _reset_rate_limiter() -> Iterator[None]:
    # slowapi storage is process-global; reset between tests for isolation.
    limiter.reset()
    yield


@pytest.fixture(name="engine")
def engine_fixture() -> Iterator[Engine]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture(name="session")
def session_fixture(engine: Engine) -> Iterator[Session]:
    with Session(engine) as session:
        yield session


@pytest.fixture(name="releases_dir")
def releases_dir_fixture(tmp_path: Path) -> Path:
    directory = tmp_path / "releases"
    directory.mkdir()
    # 1.4.10 is included to prove semantic (not lexical) ordering.
    for version in ("1.4.1", "1.4.2", "1.4.10"):
        (directory / f"{version}.yaml").write_text(release_yaml(version), encoding="utf-8")
    return directory


@pytest.fixture(name="client")
def client_fixture(engine: Engine, releases_dir: Path) -> Iterator[TestClient]:
    def get_session_override() -> Iterator[Session]:
        with Session(engine) as session:
            yield session

    service = ReleaseService(releases_dir, debug=True)
    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_release_service] = lambda: service
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()

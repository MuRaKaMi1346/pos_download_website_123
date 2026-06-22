"""Tests for the release manifest loader and endpoints."""

from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from app.services.release_service import ReleaseService


def test_latest_returns_highest_semver(client: TestClient) -> None:
    response = client.get("/api/v1/releases/latest")
    assert response.status_code == 200
    body = response.json()
    assert body["version"] == "1.4.10"
    assert set(body["channels"]) >= {"windows", "macos"}
    assert response.headers["cache-control"] == "public, max-age=300"


def test_list_returns_all_newest_first(client: TestClient) -> None:
    response = client.get("/api/v1/releases/")
    assert response.status_code == 200
    versions = [entry["version"] for entry in response.json()]
    assert versions == ["1.4.10", "1.4.2", "1.4.1"]
    assert response.headers["cache-control"] == "public, max-age=300"


def test_notes_url_is_derived_when_absent(client: TestClient) -> None:
    response = client.get("/api/v1/releases/latest")
    assert response.json()["notes_url"] == "/changelog#1-4-10"


def test_service_sorts_semantically_not_lexically(releases_dir: Path) -> None:
    service = ReleaseService(releases_dir, debug=False)
    assert [r.version for r in service.all()] == ["1.4.10", "1.4.2", "1.4.1"]


def test_service_caches_until_reload(releases_dir: Path) -> None:
    service = ReleaseService(releases_dir, debug=False)
    baseline = [r.version for r in service.all()]
    (releases_dir / "1.4.1.yaml").unlink()
    # Still cached — the deletion is not visible until reload().
    assert [r.version for r in service.all()] == baseline
    assert service.reload() == 2
    assert [r.version for r in service.all()] == ["1.4.10", "1.4.2"]


def test_debug_mode_reloads_every_call(releases_dir: Path) -> None:
    service = ReleaseService(releases_dir, debug=True)
    assert len(service.all()) == 3
    (releases_dir / "1.4.1.yaml").unlink()
    assert len(service.all()) == 2


def test_latest_is_none_for_empty_dir(tmp_path: Path) -> None:
    assert ReleaseService(tmp_path, debug=True).latest() is None


def test_admin_reload_rejects_missing_or_bad_token(client: TestClient) -> None:
    assert client.post("/api/v1/admin/releases/reload").status_code == 401
    bad = client.post("/api/v1/admin/releases/reload", headers={"X-Admin-Token": "wrong"})
    assert bad.status_code == 401


def test_admin_reload_accepts_valid_token(client: TestClient) -> None:
    response = client.post(
        "/api/v1/admin/releases/reload",
        headers={"X-Admin-Token": "dev-admin-token-change-me"},
    )
    assert response.status_code == 200
    assert response.json() == {"reloaded": 3}

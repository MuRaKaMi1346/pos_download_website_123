"""App-level tests: health probe, security headers, CORS allowlist."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_healthz(client: TestClient) -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_security_headers_present(client: TestClient) -> None:
    headers = client.get("/healthz").headers
    assert headers["x-content-type-options"] == "nosniff"
    assert headers["x-frame-options"] == "DENY"
    assert "strict-transport-security" in headers
    assert "referrer-policy" in headers


def test_cors_allows_configured_origin(client: TestClient) -> None:
    response = client.get("/healthz", headers={"Origin": "http://localhost:4321"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:4321"


def test_cors_omits_unknown_origin(client: TestClient) -> None:
    response = client.get("/healthz", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in response.headers

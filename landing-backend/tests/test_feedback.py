"""Tests for the feedback endpoint (multipart text + optional image)."""

from __future__ import annotations

import base64

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import get_settings
from app.models.feedback import Feedback

# 1x1 transparent PNG.
PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk"
    "+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
)


def test_feedback_text_only(client: TestClient, session: Session) -> None:
    response = client.post(
        "/api/v1/feedback/",
        data={"message": "หน้าขายลื่นมาก ชอบเลย", "rating": "5"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["handled"] is False
    assert isinstance(body["id"], int)

    row = session.exec(select(Feedback)).one()
    assert row.rating == 5
    assert row.image_data is None
    assert row.message.startswith("หน้าขาย")


def test_feedback_with_image(client: TestClient, session: Session) -> None:
    response = client.post(
        "/api/v1/feedback/",
        data={"message": "เจอบั๊กตรงนี้"},
        files={"image": ("bug.png", PNG_BYTES, "image/png")},
    )
    assert response.status_code == 201

    row = session.exec(select(Feedback)).one()
    assert row.image_data == PNG_BYTES
    assert row.image_content_type == "image/png"
    assert row.image_filename == "bug.png"


def test_feedback_stores_hashed_ip_not_raw(client: TestClient, session: Session) -> None:
    client.post("/api/v1/feedback/", data={"message": "hi"})
    row = session.exec(select(Feedback)).one()
    assert row.ip_hash not in ("", "testclient")
    assert len(row.ip_hash) == 64  # sha256 hex digest


def test_feedback_requires_message(client: TestClient) -> None:
    assert client.post("/api/v1/feedback/", data={"message": ""}).status_code == 422
    assert client.post("/api/v1/feedback/", data={}).status_code == 422


def test_feedback_rejects_out_of_range_rating(client: TestClient) -> None:
    response = client.post("/api/v1/feedback/", data={"message": "ok", "rating": "9"})
    assert response.status_code == 422


def test_feedback_rejects_unsupported_image_type(client: TestClient) -> None:
    response = client.post(
        "/api/v1/feedback/",
        data={"message": "see attached"},
        files={"image": ("notes.pdf", b"%PDF-1.4 fake", "application/pdf")},
    )
    assert response.status_code == 415


def test_feedback_rejects_oversized_image(client: TestClient) -> None:
    big = b"\x89PNG\r\n\x1a\n" + b"0" * (5 * 1024 * 1024 + 1)
    response = client.post(
        "/api/v1/feedback/",
        data={"message": "huge shot"},
        files={"image": ("huge.png", big, "image/png")},
    )
    assert response.status_code == 413


def test_feedback_is_rate_limited(client: TestClient) -> None:
    for _ in range(10):
        assert client.post("/api/v1/feedback/", data={"message": "spam"}).status_code == 201
    assert client.post("/api/v1/feedback/", data={"message": "spam"}).status_code == 429


def test_admin_feedback_requires_token(client: TestClient) -> None:
    assert client.get("/api/v1/admin/feedback").status_code == 401


def test_admin_lists_feedback_and_serves_image(client: TestClient) -> None:
    token = get_settings().admin_token
    create = client.post(
        "/api/v1/feedback/",
        data={"message": "with shot", "email": "me@example.com"},
        files={"image": ("s.png", PNG_BYTES, "image/png")},
    )
    feedback_id = create.json()["id"]

    listing = client.get("/api/v1/admin/feedback", headers={"X-Admin-Token": token})
    assert listing.status_code == 200
    items = listing.json()
    assert len(items) == 1
    assert items[0]["has_image"] is True
    assert items[0]["email"] == "me@example.com"

    image = client.get(
        f"/api/v1/admin/feedback/{feedback_id}/image",
        headers={"X-Admin-Token": token},
    )
    assert image.status_code == 200
    assert image.headers["content-type"] == "image/png"
    assert image.content == PNG_BYTES

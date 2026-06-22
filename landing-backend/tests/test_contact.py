"""Tests for the contact endpoint."""

from __future__ import annotations

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.models.contact import ContactMessage

CONTACT = {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "subject": "Loving the beta",
    "message": "When is the Linux build landing?",
}


def test_contact_happy_path(client: TestClient, session: Session) -> None:
    response = client.post("/api/v1/contact/", json=CONTACT)
    assert response.status_code == 201
    body = response.json()
    assert body["handled"] is False
    assert isinstance(body["id"], int)
    rows = session.exec(select(ContactMessage)).all()
    assert len(rows) == 1
    assert rows[0].email == "ada@example.com"


def test_contact_stores_hashed_ip_not_raw(client: TestClient, session: Session) -> None:
    client.post("/api/v1/contact/", json=CONTACT)
    row = session.exec(select(ContactMessage)).one()
    assert row.ip_hash not in ("", "testclient")
    assert len(row.ip_hash) == 64  # sha256 hex digest


def test_contact_rejects_invalid_email(client: TestClient) -> None:
    response = client.post("/api/v1/contact/", json={**CONTACT, "email": "nope"})
    assert response.status_code == 422


def test_contact_is_rate_limited(client: TestClient) -> None:
    for _ in range(5):
        assert client.post("/api/v1/contact/", json=CONTACT).status_code == 201
    assert client.post("/api/v1/contact/", json=CONTACT).status_code == 429

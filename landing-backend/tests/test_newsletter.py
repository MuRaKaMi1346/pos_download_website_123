"""Tests for the newsletter endpoint and subscription service."""

from __future__ import annotations

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.models.newsletter import NewsletterSubscriber
from app.services.newsletter_service import subscribe


def test_newsletter_happy_path(client: TestClient, session: Session) -> None:
    response = client.post("/api/v1/newsletter/", json={"email": "fan@example.com"})
    assert response.status_code == 201
    assert response.json()["confirmed"] is True
    assert len(session.exec(select(NewsletterSubscriber)).all()) == 1


def test_newsletter_dedupes_email(client: TestClient, session: Session) -> None:
    first = client.post("/api/v1/newsletter/", json={"email": "dup@example.com"})
    second = client.post("/api/v1/newsletter/", json={"email": "dup@example.com"})
    assert first.status_code == 201
    assert second.status_code == 200
    assert len(session.exec(select(NewsletterSubscriber)).all()) == 1


def test_newsletter_is_rate_limited(client: TestClient) -> None:
    for i in range(3):
        response = client.post("/api/v1/newsletter/", json={"email": f"u{i}@example.com"})
        assert response.status_code in (200, 201)
    blocked = client.post("/api/v1/newsletter/", json={"email": "u3@example.com"})
    assert blocked.status_code == 429


def test_newsletter_double_opt_in_generates_token(session: Session) -> None:
    subscriber, created = subscribe(session, "optin@example.com", double_opt_in=True)
    assert created is True
    assert subscriber.confirmed is False
    assert subscriber.confirm_token is not None
    assert subscriber.confirmed_at is None

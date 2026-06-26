"""Aggregate router for API v1."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import admin, contact, feedback, newsletter, releases

api_router = APIRouter()
api_router.include_router(releases.router)
api_router.include_router(contact.router)
api_router.include_router(feedback.router)
api_router.include_router(newsletter.router)
api_router.include_router(admin.router)

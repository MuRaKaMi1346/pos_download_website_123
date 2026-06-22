"""Security helpers."""

from __future__ import annotations

import hashlib


def hash_ip(ip: str, secret: str) -> str:
    """Return a salted SHA-256 of an IP address. Raw IPs are never stored."""
    return hashlib.sha256(f"{ip}{secret}".encode()).hexdigest()

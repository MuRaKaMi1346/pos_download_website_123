"""Optional SMTP delivery for contact messages.

If ``SMTP_HOST`` is unset, this is a no-op and messages are only stored.
"""

from __future__ import annotations

import smtplib
from email.message import EmailMessage

from app.core.config import Settings
from app.models.contact import ContactMessage


def maybe_send_contact_email(settings: Settings, message: ContactMessage) -> bool:
    if not settings.smtp_host:
        return False

    email = EmailMessage()
    email["Subject"] = f"[SmartBrew contact] {message.subject}"
    email["From"] = settings.smtp_from
    email["To"] = settings.contact_to
    email["Reply-To"] = message.email
    email.set_content(f"From: {message.name} <{message.email}>\n\n{message.message}")

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(email)
    return True

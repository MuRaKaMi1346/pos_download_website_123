"""Single import surface for SQLModel metadata.

Import every table model here so ``SQLModel.metadata`` is fully populated for
``create_all`` and Alembic autogenerate.
"""

from sqlmodel import SQLModel as SQLModel  # re-exported

from app.models.contact import ContactMessage as ContactMessage
from app.models.feedback import Feedback as Feedback
from app.models.newsletter import NewsletterSubscriber as NewsletterSubscriber

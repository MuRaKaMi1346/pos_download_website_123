# SmartBrew Landing Backend

FastAPI service for the SmartBrew POS landing site. Serves the release
manifest and accepts contact + newsletter submissions. No auth, no business
logic beyond that. Separate codebase / venv / Alembic history from the main POS.

## Stack

FastAPI · SQLModel · Alembic · Pydantic v2 · slowapi · uv

## Setup

```bash
cd landing-backend
uv sync                 # creates .venv and installs deps + dev tools
cp .env.example .env    # then edit secrets
```

## Run

```bash
uv run uvicorn app.main:app --reload --port 8000
# docs at http://localhost:8000/docs
```

## Database migrations (Alembic)

```bash
uv run alembic upgrade head                              # apply migrations
uv run alembic revision --autogenerate -m "describe it"  # create a new one
```

Models live in `app/models/` and are registered via `app/db/base.py`, which
Alembic's `env.py` imports as the autogenerate target. History is independent
from the main POS.

## Quality gate (run before every commit)

```bash
uv run ruff check && uv run ruff format --check && uv run mypy app && uv run pytest -q
```

## Endpoints (`/api/v1`)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/releases/latest` | Highest semver. `Cache-Control: public, max-age=300`. |
| GET | `/releases/` | All releases, newest first. |
| POST | `/contact/` | Rate-limited 5/min/IP. |
| POST | `/newsletter/` | Rate-limited 3/min/IP. |
| POST | `/admin/releases/reload` | Requires `X-Admin-Token` header. |
| GET | `/healthz` | Liveness probe (mounted at root). |

## Releases

`releases/*.yaml` is the source of truth — commit one file per version.
The loader sorts by semantic version and caches in memory (re-read per
request when `DEBUG=true`, or via the admin reload endpoint in production).

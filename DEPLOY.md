# Deploying SmartBrew POS landing

Two independent projects in one repo:

- `landing/` — Astro static site (the marketing + download page).
- `landing-backend/` — FastAPI service (release manifest, contact, newsletter).

They deploy separately. Suggested topology:

| Host | Serves | Domain |
| --- | --- | --- |
| Static host (Vercel / Netlify / Cloudflare Pages / any CDN) | `landing/dist` | `smartbrew.app` |
| App host (Fly / Render / a VM) | `landing-backend` (uvicorn) | `api.smartbrew.app` |

The CDN-hosted installers live on a separate origin (`cdn.smartbrew.app`),
referenced by the release YAML — the backend only serves the manifest.

---

## Frontend (`landing/`)

Static build; no server runtime.

```bash
cd landing
pnpm install
PUBLIC_API_BASE=https://api.smartbrew.app/api/v1 pnpm build   # outputs dist/
```

- `PUBLIC_API_BASE` is read at **build time** (Astro inlines `PUBLIC_*`). Set it
  in the host's build env or `landing/.env`. See `landing/.env.example`.
- Deploy the `dist/` folder to any static host. `site` in `astro.config.mjs`
  must match the production origin (`https://smartbrew.app`) for canonical URLs,
  hreflang, sitemap, and OG tags.
- Before deploy, run the hero-video ffmpeg recipe (see `landing/README.md`) and
  drop `public/video/hero.*`; optionally add `public/audio/ambient.*`.

Quality gate:

```bash
pnpm lint && pnpm astro check && pnpm test && pnpm build
```

## Backend (`landing-backend/`)

```bash
cd landing-backend
uv sync
cp .env.example .env            # then set real secrets
uv run alembic upgrade head     # create tables
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

For production use a process manager / multiple workers, e.g.:

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Required env (see `landing-backend/.env.example`):

- `SECRET` — salts the contact IP hash. **Change it.**
- `ADMIN_TOKEN` — guards `POST /api/v1/admin/releases/reload`. **Change it.**
- `CORS_ORIGINS` — comma-separated allowlist; **must include the production
  frontend origin** (`https://smartbrew.app`).
- `DATABASE_URL` — SQLite by default; use Postgres in production.
- `SMTP_*` (optional) — enable contact emails.
- `NEWSLETTER_DOUBLE_OPT_IN` — set `true` to issue confirm tokens.

Release manifests: commit one `releases/<version>.yaml` per version, then
`POST /api/v1/admin/releases/reload` with `X-Admin-Token`, or restart.

Quality gate:

```bash
uv run ruff check && uv run ruff format --check && uv run mypy app && uv run pytest -q
```

## DNS

| Record | Name | Value |
| --- | --- | --- |
| A / CNAME | `smartbrew.app` | static host |
| CNAME | `www` | `smartbrew.app` |
| A / CNAME | `api` | backend host |
| CNAME | `cdn` | object storage / CDN for installers |

Serve everything over HTTPS (the backend already sends HSTS). After the first
deploy, validate OG tags on the Twitter/X and Facebook card validators for both
`/` and `/en/`.

## Pre-deploy checklist

- [ ] Both quality gates pass (lint + type + test [+ build]).
- [ ] `PUBLIC_API_BASE` points at the production API.
- [ ] `CORS_ORIGINS` includes the production frontend origin only (+ localhost for dev).
- [ ] `SECRET` and `ADMIN_TOKEN` are strong and unique.
- [ ] Hero video encoded + placed; OG images present for `/` and `/en/`.
- [ ] `alembic upgrade head` run against the production DB.

# SmartBrew POS — landing site

A cinematic marketing + download site for SmartBrew POS (a point of sale built
for cafes). Two independent projects in one repo:

| Project | Stack | What it is |
| --- | --- | --- |
| [`landing/`](landing/README.md) | Astro 4 · React islands · Tailwind · Framer Motion · Three.js | The public five-act cinematic page (Thai + English) |
| [`landing-backend/`](landing-backend/README.md) | FastAPI · SQLModel · Alembic · slowapi · uv | Release manifest, contact, newsletter |

The page: a loading curtain → hero video → a Three.js product reveal → a
six-slide capability story (built from the real POS screens) → a quiet frame →
how-it-works, pricing, FAQ, and a download/newsletter close. Bilingual,
accessible, with a designed reduced-motion path for every effect.

## Quick start

```bash
# Frontend
cd landing && pnpm install &&             # http://localhost:4321

# Backend
cd landing-backend && uv sync && uv run uvicorn app.main:app --reload --port 8000
```

## Docs

- [`landing/README.md`](landing/README.md) — frontend: scripts, theme tokens, hero-video ffmpeg recipe, reduced-motion matrix, e2e/Lighthouse.
- [`landing-backend/README.md`](landing-backend/README.md) — backend: endpoints, migrations, quality gate.
- [`DEPLOY.md`](DEPLOY.md) — deployment, DNS, production env.
- `docs/prompt.md` — the original brief; `docs/prompts/` — design/motion/3D source briefs.

## Quality gates

```bash
cd landing-backend && uv run ruff check && uv run ruff format --check && uv run mypy app && uv run pytest -q

cd landing && pnpm lint && pnpm astro check && pnpm test && pnpm build
```

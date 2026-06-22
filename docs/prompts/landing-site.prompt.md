# SmartBrew POS — Download Landing Site (Claude Code Prompt)

> Paste this into Claude Code. It is a self-contained brief to build the
> public marketing + download website for SmartBrew POS. Read every
> section before starting. Backend and frontend are two separate
> projects under the same repo.

---

## 0. Mission & Scope

Build a public-facing **cinematic landing + download** website for
SmartBrew POS. This is **not** the POS app itself. It is a high-end
marketing experience that uses film-grade motion, scroll-driven
storytelling, and 3D set pieces to introduce the product — closer to
an Apple product page than a SaaS template. It must feel **deliberate,
slow, and premium**.

The site still has practical jobs to do: surface the latest installer
per OS via a FastAPI service, capture newsletter sign-ups, and answer
basic questions. But every section must earn its place in a sequence —
no card grids dropped in for filler.

Visual references (do not copy — match the **register**):
- Apple's iPad Pro / Vision Pro product pages
- igloo.inc, rauno.me, lusion.co, monogram.io
- Linear "Method" page, Vercel's product launches

**Out of scope**: payment processing, user accounts, in-app demo of the
POS. The "Try the demo" link points to a separately deployed demo
instance — just a hyperlink here.

**Theme**: must visually match the SmartBrew POS UI tokens (warm
espresso / caramel / cream). Read
`docs/prompts/pos-ui-motion.prompt.md` Section 2.1 — those CSS variables
are the source of truth for color. Re-declare them in
`landing/src/styles/global.css` verbatim. Do not invent a different
palette.

---

## 1. Hard Constraints

- **No emoji anywhere**. Run a grep audit at the end (see Section 13).
- **Bilingual**: Thai (default) + English. Astro built-in i18n.
- **Lighthouse targets** (revised for cinematic):
  - Performance: **90+ desktop, 85+ mobile** (the 3D + video make a
    perfect 95+ unrealistic; we trade some perf for craft).
  - SEO / Best Practices / Accessibility: **95+** on both viewports —
    these are not negotiable.
- **LCP < 2.8s** on Fast 4G simulation, **FCP < 1.5s**. The hero text
  and poster image must render before any heavy asset.
- **Total JS shipped on the home route: under 250 KB gzipped**
  (Astro keeps the rest of the site closer to 0 KB).
- **First meaningful frame in under 1.5s** even when the WebGL scene
  is still warming up — show the poster first, swap when ready.
- **Reduced motion** must still feel intentional, not "broken
  cinematic". Provide a designed reduced-motion alternative for every
  effect (Section 5.4).
- **TypeScript strict** everywhere; no `any` without comment.
- **Tests ship with the feature**.
- **Two separate projects** in the same repo:

```
landing/             # Astro 4 site (frontend)
landing-backend/     # FastAPI service (backend)
```

Do not put them in one project. Do not share `node_modules` or Python
envs.

---

## 1.5 Cinematic Design Language (read before any visual code)

### 1.5.1 Pacing

The page is a **five-act sequence**, not a brochure. Each act takes the
full viewport, holds for a beat, then transitions deliberately into
the next. Default scroll is **inertial / momentum-based** (Lenis) so
every motion feels weighted. No abrupt cuts.

### 1.5.2 Color grade

Treat the whole page like a graded film:
- Base palette: SmartBrew tokens (espresso / caramel / cream).
- Add a global **film LUT-style overlay**: a `mix-blend-mode: soft-light`
  layer at 6% with a subtle warm orange-to-teal split toning gradient.
- Subtle **vignette** on hero acts: radial gradient from transparent
  center to `oklch(0 0 0 / 0.35)` at corners.
- **Film grain** overlay: a tiling noise SVG at 3% opacity over the
  entire page. Do not animate it (causes repaints) — let it sit static.
- **Chromatic aberration** on hero text: −0.5px red, +0.5px blue using
  CSS `text-shadow` stack. Only on display headings.

### 1.5.3 Typography

- **Display font**: a high-contrast serif for headlines —
  *Fraunces*, *Tenor Sans*, or *Cormorant Garamond* (variable, weight
  300–700). Hero headlines at clamp(48px, 8vw, 120px), tight leading
  (0.92), letter-spacing −0.02em.
- **Body font**: Inter (already in the system) for everything else.
- **Thai display**: pair the serif with *IBM Plex Sans Thai* or
  *Noto Serif Thai* — match the optical size at each breakpoint.
- Headlines support **per-word reveal**: split into spans, stagger 40ms
  with a `y: 24 → 0` + `opacity: 0 → 1` spring on enter.
- Letter-by-letter reveal only on the single hero headline. Anywhere
  else is too much.

### 1.5.4 Motion vocabulary

Lock to these three patterns site-wide:

1. **Cinematic cross-dissolve** — section to section. 800ms,
   `ease.inOut`. Outgoing scales to 1.03 while fading; incoming starts
   at 0.97 scale and 0.6 opacity. Feels like a film cut.
2. **Sticky pin + scrub** — for product story acts (Act 2 and 3 below).
   The section pins to the viewport, then content advances driven by
   scroll progress. Use Framer Motion `useScroll` + `useTransform`
   (no GSAP needed for our scope; GSAP allowed only if a specific
   effect cannot be expressed in FM — get approval first).
3. **3D parallax depth** — Three.js cup spins slowly while scroll
   nudges camera Z and tilts the cup ±6°. No user-controlled orbit —
   the camera move is part of the choreography.

### 1.5.5 Loading curtain

First paint = a full-bleed espresso-colored panel with the SmartBrew
wordmark centered. The wordmark fades in (400ms), holds (300ms), then
the panel **wipes upward** revealing the hero scene (700ms,
`ease.out`). No spinner. No percentage. If assets aren't ready, the
hero poster shows under the curtain so the wipe always feels timed.

Total curtain time: 1.4s max. After that the user can interact.

### 1.5.6 Custom cursor (desktop only)

Replace the native cursor with a 14px ring that lags the pointer with
a spring (`stiffness: 220, damping: 28`). On hoverable surfaces it
expands to 56px and inverts color. On touch devices the cursor is
disabled entirely and native interaction takes over. Implement in
`src/components/Cursor.tsx` as a React island, mounted once at the
layout level.

### 1.5.7 Sound (optional, opt-in, off by default)

A **subtle ambient track** (slow drone + faint barista room tone,
−24 LUFS) auto-loops on the hero. **Default state: muted**. Provide a
small `Sound` toggle in the top-right corner (lucide `Volume2` /
`VolumeX` icons). Persist choice in `localStorage`. Respect
`prefers-reduced-motion` — if set, never autoplay even when toggled
on previously.

Source the track from a royalty-free library; do not generate music.
Place at `public/audio/ambient.opus` + `.mp3` fallback. Each under
600 KB.

### 1.5.8 Post-processing pass

On the 3D scene, add a postprocessing chain (drei
`EffectComposer`):
- `Bloom` at 0.4 intensity, threshold 0.85.
- `Noise` at 0.04.
- `Vignette` at 0.35.
- `ChromaticAberration` at `[0.0006, 0.0006]`.

These give the WebGL act the same grade as the rest of the page.
Disable the chain on `prefers-reduced-motion`.

---

## 2. Frontend — Stack & Why

**Astro 4 + React islands + Tailwind + Framer Motion**.

Why Astro over Vite-only or Next:
- Static-first, near-zero JS on content-only pages — needed for the 95+
  Lighthouse target.
- React islands give us interactivity for the bits that need it
  (download selector, language toggle, FAQ accordion) without shipping
  React to every page.
- Native image / video optimization helpers.
- Content Collections handle changelog + FAQ as Markdown.

Dependencies (lock these — do not add others without justifying):

```
astro@^4
@astrojs/react @astrojs/tailwind @astrojs/sitemap @astrojs/check
tailwindcss@^3 autoprefixer postcss
framer-motion@^11
lenis@^1                          # inertial smooth scroll
three@^0.160
@react-three/fiber@^8
@react-three/drei@^9
@react-three/postprocessing@^2    # bloom + grain + vignette + CA
lucide-react
zod
@fontsource-variable/fraunces     # display serif (open license)
@fontsource-variable/inter
@fontsource/ibm-plex-sans-thai
```

GSAP / ScrollTrigger / Lottie / particles libraries: **disallowed by
default**. If you believe a specific shot truly needs GSAP, open a
discussion before installing.

The WebGL act ships as a **separate Astro island chunk**, lazy-loaded
when the user is within 1.5 viewports of it. The home route's
critical bundle stays under 250 KB gzipped.

---

## 3. Frontend Folder Layout

```
landing/
├── astro.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── video/
│   │   ├── hero.webm           # VP9, ~3–6 MB target
│   │   ├── hero.mp4            # H.264, ~4–8 MB target
│   │   ├── hero-mobile.mp4     # smaller, square or 9:16
│   │   └── hero-poster.webp    # first frame, ~80 KB
│   ├── models/                 # GLBs from docs/prompts/tripo-3d-models.prompts.md
│   ├── images/
│   └── og/                     # social share images per locale
├── src/
│   ├── content/
│   │   ├── config.ts
│   │   ├── features/           # one .md per feature
│   │   ├── faq/                # one .md per Q
│   │   └── releases/           # one .md per version (changelog)
│   ├── components/
│   │   ├── HeroVideo.astro
│   │   ├── HeroHeadline.tsx          # island
│   │   ├── DownloadButton.tsx        # island, calls /api/releases/latest
│   │   ├── LanguageToggle.tsx        # island
│   │   ├── FeatureGrid.astro
│   │   ├── FeatureCard.astro
│   │   ├── HowItWorks.astro
│   │   ├── LocalFirstSection.astro
│   │   ├── PricingTable.astro
│   │   ├── FaqAccordion.tsx          # island
│   │   ├── FinalCta.astro
│   │   ├── SiteHeader.astro
│   │   └── SiteFooter.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── DocLayout.astro
│   ├── lib/
│   │   ├── i18n.ts
│   │   └── motion.ts
│   ├── pages/
│   │   ├── index.astro              # /th  (default)
│   │   ├── en/index.astro           # /en
│   │   ├── changelog.astro
│   │   ├── pricing.astro
│   │   ├── privacy.astro
│   │   └── terms.astro
│   └── styles/global.css
└── package.json
```

---

## 4. Theme Tokens (`landing/src/styles/global.css`)

Copy the `@theme` block from `pos-ui-motion.prompt.md` Section 2.1 in
full. Add one extra for the landing only:

```css
--color-hero-overlay: oklch(0.18 0.02 260 / 0.55);
--color-hero-tint:    oklch(0.30 0.04 35 / 0.35);
```

`tailwind.config.ts` reads these via `theme.extend.colors` using CSS
variables (`bg: 'var(--color-bg)'`, etc.). Stop using raw `slate-*`
classes.

---

## 5. Hero Video — Seamless Loop (the important bit)

The user will hand off a raw video. Pre-process it before placing it in
`public/video/`. The goal: zero visible seam at the loop point.

### 5.1 Encoding recipe (document in `landing/README.md`)

Step A — make first frame visually match the last via a half-second
crossfade. Assume the raw clip is `hero-raw.mov`, duration `T`,
crossfade window `X = 0.5s`:

```bash
ffmpeg -i hero-raw.mov -filter_complex \
"[0:v]split=2[a][b]; \
 [a]trim=0:${X},setpts=PTS-STARTPTS[head]; \
 [a]trim=${X},setpts=PTS-STARTPTS[body]; \
 [b]trim=$(echo \"$T - $X\" | bc):$T,setpts=PTS-STARTPTS[tail]; \
 [tail][head]xfade=transition=fade:duration=${X}:offset=0[joined]; \
 [body][joined]concat=n=2:v=1:a=0[out]" \
 -map "[out]" -an hero-loop.mov
```

Step B — encode the two web variants:

```bash
# WebM (VP9), preferred
ffmpeg -i hero-loop.mov -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 \
  -pix_fmt yuv420p -an public/video/hero.webm

# MP4 (H.264) fallback
ffmpeg -i hero-loop.mov -c:v libx264 -preset slow -crf 24 \
  -pix_fmt yuv420p -movflags +faststart -an public/video/hero.mp4

# Smaller portrait variant for mobile
ffmpeg -i hero-loop.mov -vf "scale=720:-2" -c:v libx264 -preset slow \
  -crf 26 -pix_fmt yuv420p -movflags +faststart -an \
  public/video/hero-mobile.mp4

# Poster (first frame)
ffmpeg -i hero-loop.mov -vframes 1 -q:v 2 public/video/hero-poster.webp
```

Target sizes: `hero.webm` ≤ 6 MB, `hero.mp4` ≤ 8 MB, mobile ≤ 3 MB.

### 5.2 `HeroVideo.astro` rules

- `<video autoplay muted loop playsinline preload="auto" poster="...">`
  with `<source>` order: WebM first, MP4 fallback.
- Mobile (`max-width: 640px`): bypass video, render poster + warm CSS
  gradient instead. Saves data.
- Wrap in `aria-hidden="true"` — it's decorative.
- Two overlay layers above the video:
  1. Warm tint `var(--color-hero-tint)`.
  2. Dark overlay `var(--color-hero-overlay)` for text contrast.
- Below the overlays, position the headline + dual CTA from
  `HeroHeadline.tsx`.
- Respect `prefers-reduced-motion: reduce`: pause the video and show
  the poster.

```astro
---
// HeroVideo.astro — sketch, refine in implementation
---
<section class="relative h-[100svh] w-full overflow-hidden">
  <video
    class="absolute inset-0 hidden h-full w-full object-cover md:block"
    autoplay muted loop playsinline preload="auto"
    poster="/video/hero-poster.webp"
    aria-hidden="true"
  >
    <source src="/video/hero.webm" type="video/webm" />
    <source src="/video/hero.mp4" type="video/mp4" />
  </video>
  <img
    class="absolute inset-0 h-full w-full object-cover md:hidden"
    src="/video/hero-poster.webp" alt=""
  />
  <div class="absolute inset-0 bg-[var(--color-hero-tint)]" aria-hidden="true"></div>
  <div class="absolute inset-0 bg-[var(--color-hero-overlay)]" aria-hidden="true"></div>
  <div class="relative z-10 flex h-full items-center px-6">
    <slot />
  </div>
</section>
```

---

## 6. Page as a Five-Act Sequence (home)

The home page is not a stack of sections — it is a **scroll story**.
Each act takes one full viewport (or pins for longer) and resolves
before the next begins. Sound design (if enabled) ducks subtly between
acts.

### Act I — Arrival (0–100vh)

- Loading curtain wipes upward (Section 1.5.5).
- `HeroVideo` plays seamlessly behind a slow fade-in of the display
  headline (per-word reveal, Section 1.5.3).
- Sub-line and dual CTA fade in 800ms after the headline.
- A small "scroll" indicator (a slow vertical line drawing downward)
  appears after 3s of inactivity.
- Background music toggle sits top-right; cursor ring is active.

### Act II — Product Reveal (100vh–300vh, sticky-pin)

- Section pins to the viewport for **2 viewport heights** of scroll.
- A Three.js scene takes center stage: the Tripo-generated coffee cup
  GLB rotates slowly, the SmartBrew tablet model rises into frame on
  scroll, the camera dollies in. Postprocessing (Section 1.5.8) is
  on.
- Labels appear in sync with scroll progress: "Built for one barista",
  "Designed for a thousand baristas", "Works without the internet".
  Each label cross-dissolves into the next (Section 1.5.4 pattern 1).
- At progress 1.0 the section unpins and Act III begins.

### Act III — Capability Story (300vh–500vh, sticky-pin)

- Pin again. Inside the pinned frame, a **horizontal scroll** advances
  through six capability slides — POS speed, multi-payment, inventory
  intelligence, AI forecasting, local-first, multi-store.
- Each slide is a half-screen of typography (left) + a half-screen of
  motion (right): subtle particle drift, a chart drawing in, a stock
  level dialing down. Use Framer Motion only; no canvas particle libs.
- Slide transitions are **soft fades**, not slides — keep the cinematic
  register.

### Act IV — Quiet Frame (single viewport)

- Black-on-cream type-only section. One sentence:
  > *"Designed quietly. So the work can be loud."*
- Long hold, slow ambient bloom on the background. This is the
  page's breath. Do not put a CTA here.

### Act V — Practical Close (multi-viewport, normal scroll)

- `HowItWorks` — three-step with a long horizontal line that draws
  itself as you scroll, the steps appearing along it.
- `PricingTable` — three tiers, neutral surface to give the eyes a
  rest from the cinematic grade.
- `FaqAccordion` — React island, content from `src/content/faq/`.
- `FinalCta` — restated download button + email-capture form posting
  to `POST /api/newsletter`. Above the CTA, a final wide shot: the
  Three.js cup at distance, slowly steaming.
- `SiteFooter` — links, language toggle, version line ("Built with
  SmartBrew v1.4.2"). Sound toggle persists here.

Reuse motion tokens from `pos-ui-motion.prompt.md` Section 2.2.
Per-act enter uses `useInView` from Framer Motion. Reduced motion =
the same five-act structure but each transition becomes a 200ms
opacity-only fade and the WebGL scene is replaced by a high-quality
still rendered from the same scene at build time.

---

## 7. Routing & i18n

- Default locale Thai at `/`, English at `/en/`.
- `astro.config.mjs`: `i18n: { defaultLocale: 'th', locales: ['th','en'], routing: { prefixDefaultLocale: false } }`.
- One translation file per locale at `src/lib/i18n/{th,en}.json`.
- `LanguageToggle.tsx` swaps locales preserving the path.
- All metadata (title, description, OG) translated per page per locale.

---

## 8. Backend — Stack & Why

**FastAPI + SQLModel + Alembic + Pydantic v2 + slowapi + uv**, same as
the main POS so the team is on familiar ground. Separate codebase,
separate venv, separate Alembic history.

Purpose: serve the release manifest, accept contact-form + newsletter
submissions, and nothing else. No auth. Public read endpoints +
rate-limited write endpoints.

---

## 9. Backend Folder Layout

```
landing-backend/
├── pyproject.toml          # uv-managed
├── alembic.ini
├── alembic/versions/
├── releases/               # YAML manifest files committed to git
│   ├── 1.4.2.yaml
│   └── 1.4.1.yaml
├── app/
│   ├── main.py
│   ├── api/v1/
│   │   ├── releases.py
│   │   ├── contact.py
│   │   ├── newsletter.py
│   │   └── router.py
│   ├── core/
│   │   ├── config.py        # pydantic-settings
│   │   ├── middleware.py    # CORS + security headers
│   │   └── rate_limit.py    # slowapi
│   ├── db/{session,base}.py
│   ├── models/
│   │   ├── contact.py
│   │   └── newsletter.py
│   ├── schemas/
│   ├── services/
│   │   ├── release_service.py
│   │   ├── contact_service.py
│   │   └── newsletter_service.py
│   ├── repositories/
│   └── utils/
├── tests/
│   ├── conftest.py
│   ├── test_releases.py
│   ├── test_contact.py
│   └── test_newsletter.py
└── .env.example
```

---

## 10. Backend Endpoints

All under `/api/v1/`.

### `GET /releases/latest`

Returns the highest version in `releases/`. Shape:

```json
{
  "version": "1.4.2",
  "released_at": "2026-06-08T00:00:00Z",
  "channels": {
    "windows": {"url": "https://cdn.smartbrew.app/.../SmartBrew-1.4.2-x64.exe", "size_bytes": 124583920, "sha256": "..."},
    "macos":   {"url": "...", "size_bytes": 119223412, "sha256": "..."},
    "linux":   {"url": "...", "size_bytes": 142001112, "sha256": "..."}
  },
  "notes_url": "/changelog#1-4-2"
}
```

Cache-Control: `public, max-age=300`.

### `GET /releases/`

Returns all releases, newest first. Same shape as `latest` per entry.

### `POST /contact/`

Body: `{name, email, subject, message}`. Validates with Pydantic.
Rate-limited (`5/minute/IP` via slowapi). Stores in SQLite. Optionally
emails the team via SMTP if `SMTP_HOST` is set.

### `POST /newsletter/`

Body: `{email}`. Rate-limited (`3/minute/IP`). Stores in SQLite with
double-opt-in token if `NEWSLETTER_DOUBLE_OPT_IN=true`.

### `GET /healthz`

Returns `{"status": "ok"}` for the load balancer.

### Release manifest loader rules

- `releases/*.yaml` is the source of truth — admins commit a new file
  per release.
- On startup, `release_service` loads them all into memory, sorted by
  semantic version.
- Reload on each request if `DEBUG=true`; cache otherwise. Provide
  `POST /admin/releases/reload` gated by a shared-secret header
  (`X-Admin-Token`) for production reload without restart.

---

## 11. Backend Models

```
contact_messages: id, name, email, subject, message, ip_hash, created_at, handled
newsletter_subscribers: id, email (unique), confirmed, confirm_token, created_at, confirmed_at
```

No PII beyond email. Hash IP with `sha256(ip + SECRET)` — don't store
raw IPs.

---

## 12. Tests

- **Backend**: pytest with in-memory SQLite, mirroring the main POS's
  `conftest.py` style. Cover release loader (with a tmp `releases/`
  dir), contact happy path + rate limit, newsletter happy path + dupe
  email.
- **Frontend**: `@astrojs/check` for type-check. Component tests for
  React islands (vitest + Testing Library). Playwright smoke test at
  the end (open `/`, see hero, click download, see modal/redirect).

Run before every commit:

```
# backend
cd landing-backend && uv run ruff check && uv run ruff format --check \
  && uv run mypy app && uv run pytest -q

# frontend
cd landing && pnpm lint && pnpm astro check && pnpm test
```

---

## 13. Acceptance Checklist

- [ ] `grep -RInP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' landing/src landing-backend/app` returns nothing.
- [ ] Lighthouse: Performance 90+ desktop / 85+ mobile; SEO + Best Practices + A11y 95+ on both.
- [ ] LCP < 2.8s on Fast 4G simulation; first meaningful frame < 1.5s.
- [ ] Loading curtain wipes off cleanly within 1.4s, even on a cold load.
- [ ] Hero video plays seamlessly — record a 30s screen capture and confirm no flash at loop points.
- [ ] Mobile shows poster + gradient, never streams the video.
- [ ] WebGL scene maintains 60fps on a 2020 iPad and a mid-range Android.
- [ ] `prefers-reduced-motion: reduce` switches to a designed alternative path (Section 5.4 + Section 1.5) — not a broken cinematic.
- [ ] Custom cursor disabled on touch devices; native cursor visible on desktop only when hovering iframes/inputs.
- [ ] Sound toggle persists across reloads; default is muted on first visit.
- [ ] All forms validate client + server with Zod / Pydantic.
- [ ] `GET /api/releases/latest` cached for 5 minutes.
- [ ] CORS allowlist limited to the production landing origin + localhost.
- [ ] Security headers (HSTS, X-Content-Type-Options, X-Frame-Options) set on the FastAPI middleware.
- [ ] Sitemap.xml + robots.txt generated.
- [ ] OG images render for `/` and `/en/` (manual verification on twittercard validator).
- [ ] Both projects pass their full lint + type + test trio.

---

## 14. Milestone Plan (one commit per milestone)

Cinematic-first ordering: prove the feel before the scaffolding grows.

1. `feat(landing-backend): bootstrap + releases manifest + tests`
2. `feat(landing-backend): contact + newsletter endpoints + rate limit`
3. `feat(landing-backend): CORS + security headers + healthz + Alembic`
4. `feat(landing): Astro bootstrap + theme tokens + display fonts + Lenis`
5. `feat(landing): loading curtain + custom cursor + film grain + LUT overlay`
6. `feat(landing): Act I — HeroVideo + per-word headline reveal + ffmpeg recipe`
7. `feat(landing): Act II — Three.js cup + tablet sticky-pin scene + postprocessing`
8. `feat(landing): Act III — horizontal capability story + sticky-pin scrub`
9. `feat(landing): Act IV — quiet frame + ambient bloom`
10. `feat(landing): Act V — HowItWorks + PricingTable + FaqAccordion + FinalCta + Footer`
11. `feat(landing): DownloadButton island wired to /api/releases/latest`
12. `feat(landing): sound toggle + ambient track + persistence`
13. `feat(landing): reduced-motion designed alternative path`
14. `feat(landing): i18n + LanguageToggle + Thai + English content`
15. `feat(landing): SEO meta + sitemap + robots + OG images`
16. `test(landing): vitest + Playwright smoke + Lighthouse CI`
17. `chore(landing): emoji audit + perf budget tuning + Lighthouse pass`
18. `chore: deploy notes + DNS + production env`

Do not merge multiple milestones into one commit. Conventional Commits
style throughout.

---

## 15. First Action

1. List the 18 commits you intend to make (titles only) and confirm.
2. Bootstrap `landing-backend/` per Section 9, run tests green, commit.
3. Bootstrap `landing/` per Section 3 and 4, with theme tokens + display
   fonts + Lenis configured, commit.
4. **Milestones 5 + 6 ship together as a "feel demo"**: loading
   curtain → cursor → film grain → hero video → headline reveal.
   Post a 10-second screen capture in chat before proceeding. If the
   feel isn't right, fix the tokens (color, type scale, motion
   timings) — not individual components. This early checkpoint exists
   to prevent half a website built on a bad register.
5. Then Acts II → V in order. One commit per act.

Stop and ask before:
- Adding any dependency not listed in Section 2 or Section 8.
- Changing color, motion, or type tokens — they cascade everywhere.
- Replacing any locked motion vocabulary with a different library.
- Adding a sixth act or restructuring the five-act sequence.

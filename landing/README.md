# SmartBrew Landing (frontend)

Cinematic marketing + download site for SmartBrew POS. **Astro 4 + React
islands + Tailwind + Framer Motion + Lenis.** Static-first: JavaScript ships
only on the islands that need it, keeping the home route's critical bundle
under 250 KB gzipped.

## Setup

```bash
cd landing
pnpm install
```

> pnpm 11 gates native build scripts. `esbuild` and `sharp` are approved in
> `pnpm-workspace.yaml` (`allowBuilds`).

## Scripts

```bash
pnpm dev        # local dev server (http://localhost:4321)
pnpm build      # production build to dist/
pnpm preview    # preview the production build
pnpm astro check  # type-check (.astro + .ts/.tsx)
pnpm test       # vitest (React island + unit tests)
```

## Quality gate (run before every commit)

```bash
pnpm lint && pnpm astro check && pnpm test && pnpm build
```

## Theme

The `:root` tokens in `src/styles/global.css` are copied **verbatim** from
`docs/prompts/pos-ui-motion.prompt.md` §2.1 — the source of truth for color.
The source uses Tailwind v4 `@theme`; this site is on Tailwind v3, so the same
tokens live in `:root` and are mapped to utilities in `tailwind.config.ts`
(`bg-bg`, `text-text`, `bg-surface-ink`, `text-primary`, …). Motion tokens in
`src/lib/motion.ts` mirror §2.2. Do not hardcode raw colors or magic numbers.

## Hero video (ffmpeg recipe)

The Act I hero plays a **4K studio clip once, then freezes on its last frame**;
the headline reveals only after the video ends. Source:
`docs/video/pos_4k_right.mp4` (3840×2160, 24fps, ~5.9s).

> **Outputs `hero.webm`, `hero.mp4`, `hero-mobile.mp4` are gitignored** —
> regenerate locally. `hero-poster.webp` (first frame) and `hero-end.webp`
> (last frame) are committed: the poster is the LCP image / desktop pre-roll,
> the end frame is the resting still (mobile + reduced motion + the frozen end).

Encode the web variants + stills (no loop — the clip plays once):

```bash
SRC=docs/video/pos_4k_right.mp4

ffmpeg -y -i "$SRC" -c:v libvpx-vp9 -b:v 0 -crf 31 -row-mt 1 -deadline good \
  -cpu-used 2 -pix_fmt yuv420p -an public/video/hero.webm
ffmpeg -y -i "$SRC" -c:v libx264 -preset slow -crf 22 \
  -pix_fmt yuv420p -movflags +faststart -an public/video/hero.mp4
ffmpeg -y -i "$SRC" -vf "scale=1280:-2" -c:v libx264 -preset slow \
  -crf 24 -pix_fmt yuv420p -movflags +faststart -an public/video/hero-mobile.mp4

# first frame (poster) + last frame (resting still)
ffmpeg -y -i "$SRC" -frames:v 1 -vf "scale=2560:-2" -c:v libwebp -quality 82 \
  public/video/hero-poster.webp
ffmpeg -y -sseof -0.12 -i "$SRC" -frames:v 1 -vf "scale=2560:-2" -c:v libwebp \
  -quality 82 public/video/hero-end.webp
```

Typical output: `hero.webm` ≈ 0.6 MB, `hero.mp4` ≈ 1.2 MB (4K). Mobile never
streams the video — `HeroVideo.astro` gates the `<source>` tags with
`media="(min-width: 768px)"` and shows the end-frame still. The bright scene
uses dark headline text + a light scrim; the headline settles in (scale + fade)
once the video ends, in sympathy with the dolly-in.

## End-to-end + Lighthouse

Unit/component tests (`pnpm test`, vitest) run in the standard gate. The
Playwright smoke test and Lighthouse CI need a one-time setup (browsers aren't
bundled):

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
pnpm test:e2e          # builds, previews, runs e2e/smoke.spec.ts

pnpm dlx @lhci/cli autorun   # uses lighthouserc.json against ./dist
```

Lighthouse budgets (`lighthouserc.json`): Performance ≥ 0.90 (warn),
Accessibility / SEO / Best-Practices ≥ 0.95 (error).

## Reduced motion

Every effect has a designed `prefers-reduced-motion` alternative (brief §1.5 / §6),
handled per-component — there is no blanket "disable everything" rule.

| Act / effect | Full motion | Reduced motion |
| --- | --- | --- |
| Loading curtain | wipe up | quick opacity fade |
| Smooth scroll (Lenis) | inertial | native scroll |
| Custom cursor | spring-lag follow | instant follow |
| Hero video | autoplay loop | paused on the poster |
| Hero headline | per-word spring reveal | opacity-only fade |
| Act II (3D) | WebGL cup + tablet scrub | static POS still |
| Act III | scroll cross-fade slides | vertical stack |
| Act IV bloom · scroll hint | looping | static |
| How-it-works line | draws on scroll | drawn |
| Sound | opt-in | never autoplays |

The reduced-motion still for Act II uses a real POS screenshot in place of a
build-time render of the 3D scene.

## Structure

```
src/
  layouts/BaseLayout.astro   # html shell, fonts, global.css, smooth scroll
  components/                # .astro sections + .tsx React islands
  lib/motion.ts              # duration / ease / spring / variants / cinematic
  styles/global.css          # token :root + base layer
  pages/                     # routes (th default at /, en at /en/)
```

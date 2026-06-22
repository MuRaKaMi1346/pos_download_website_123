# SmartBrew POS — UI Redesign with 3D Motion (Claude Code Prompt)

> Paste this entire file into Claude Code. It is a self-contained brief for a
> single PR: rebuild the POS UI with a professional look, **zero emoji**, and
> tasteful **3D motion**. Tested, performant, accessible.

---

## 0. Role & Boundaries

You are working in the **SmartBrew POS** monorepo. Read these first and treat
them as binding:

1. `CLAUDE.md` — coding rules and stack.
2. `docs/architecture-spec.md` Section 3 (frontend layout) — feature-based
   folders under `src/features/<feature>/`.
3. `docs/prompts/pro-pos-upgrade.prompt.md` Section 5 (UX redesign) — the
   three-column POS layout, modifier dialog, payment dialog, etc. This
   prompt **refines the visual layer** of that plan; do not change the
   component breakdown.

**Scope of this PR**: visual + motion only. No new backend endpoints. No new
business logic. If a behavior change is needed, stop and ask.

**One commit per component**, conventional commits style
(`feat(pos-ui): …`, `style(pos-ui): …`, `chore(pos-ui): …`).

---

## 1. Hard Constraints (read twice)

### 1.1 No emoji. Anywhere. Ever.

The current `ProductCard.tsx` renders `☕` as an image fallback. Remove it.
Audit the entire `frontend/src/` tree and replace **every** emoji usage with
one of the approved fallbacks below. This includes empty-state screens,
toasts, buttons, labels, comments visible in UI, and headings.

Approved replacements:

| Used for | Replace with |
| --- | --- |
| Product image fallback | `<ProductFallback name={product.name} />` (new component, Section 4.1) |
| Category icon | `lucide-react` icon mapped from `Category.icon: string` (e.g. `"coffee"` → `<Coffee />`); default to `<Boxes />` |
| Empty-state illustration | A custom inline SVG component under `src/components/illustrations/` (no third-party clipart) |
| Action button affordance | `lucide-react` icon only |
| Toast / status | `lucide-react` icon only |

Hard rule: if you find yourself typing a Unicode character in the range
`U+1F300`–`U+1FAFF`, `U+2600`–`U+27BF`, or `U+1F000`–`U+1F02F`, stop and use
an SVG or `lucide-react` instead. Examples of **forbidden** code:

```tsx
// FORBIDDEN
<span className="text-4xl">☕</span>
<h2>เมนู 🍵</h2>
toast.success("สั่งสำเร็จ ✅")

// REQUIRED
<ProductFallback name={product.name} />
<h2>เมนู</h2>
toast.success("สั่งสำเร็จ", { icon: <CheckCircle2 className="h-4 w-4" /> })
```

### 1.2 Locked library choices

Do not introduce other animation libraries. Use only these:

- **`framer-motion` v11** — primary animation engine. Import via
  `LazyMotion` + `domAnimation` everywhere to keep bundle small:

  ```tsx
  import { LazyMotion, domAnimation, m } from 'framer-motion'
  // Use <m.div> instead of <motion.div>
  ```

  Wrap the app once in `AppShell.tsx`:
  `<LazyMotion features={domAnimation} strict>...</LazyMotion>`.

- **CSS 3D transforms** (`perspective`, `transform-style: preserve-3d`,
  `rotateX/Y/Z`, `translateZ`) for card press / tilt — these run on the
  compositor and stay 60fps on tablets.

- **`@react-three/fiber` + `@react-three/drei`** — allowed for **one**
  optional scene: the login / shift-open hero (Section 4.7). Do not use
  R3F inside the POS product grid, cart, or any per-tile context — too
  expensive at scale.

- **`lucide-react`** for icons (already installed). No new icon packs.

- **`sonner`** for toasts (already installed).

Do not add: GSAP, anime.js, react-spring, lottie, three.js direct
(without R3F), tsParticles, etc. If you think one is necessary, stop and
ask.

### 1.3 Performance budget

Target hardware: an iPad-class tablet (roughly 2020 iPad) on Safari, and a
mid-range Android tablet on Chrome. Acceptance:

- 60fps during product grid scroll with 60+ items.
- No layout thrash when opening dialogs (use `position: fixed` overlays).
- All animations done by `transform` + `opacity` only — never animate
  `width` / `height` / `top` / `left`.
- Cart total updates do not relayout the grid.
- Bundle increase from this PR: under **+45 KB gzipped** total.
- First contentful paint on POS route: under 1.0s on the target tablet.

Measure with the existing Vite build output and Chrome devtools
performance panel. Note results in the PR description.

### 1.4 Accessibility

- Respect `prefers-reduced-motion: reduce`. Provide a hook
  `useReducedMotion()` (Framer Motion has one) and gate every non-essential
  animation through it — fall back to opacity-only or instant.
- All interactive elements remain keyboard-focusable; visible focus ring
  must survive the 3D transform (use `box-shadow` for the ring, not
  `outline` — outline gets clipped under `transform-style: preserve-3d`).
- Color contrast WCAG AA on all surfaces, including the new dark sub-bar.
- Touch targets ≥ 44 × 44 px on POS surfaces.

### 1.5 TypeScript & test discipline

- TypeScript strict, no `any` without a `// eslint-disable + reason`.
- One vitest + Testing Library test per new component (render +
  primary interaction). For motion components, assert the **end state**,
  not the in-progress frames.
- Snapshot the `ProductFallback` SVG output.
- `pnpm lint && pnpm typecheck && pnpm test` clean before each commit.

---

## 2. Design Tokens (set up first, before any component)

Create `frontend/src/lib/motion.ts` and `frontend/src/lib/design-tokens.ts`.
These are the only places motion/color values are defined.

### 2.1 Color + surface tokens (extend `src/index.css`)

```css
@theme {
  --color-bg:           oklch(0.985 0 0);
  --color-surface:      oklch(1    0 0);
  --color-surface-2:    oklch(0.97 0 0);
  --color-surface-ink:  oklch(0.18 0.02 260);    /* dark sub-bar */
  --color-border:       oklch(0.92 0 0);
  --color-text:         oklch(0.18 0.02 260);
  --color-text-muted:   oklch(0.55 0.02 260);
  --color-primary:      oklch(0.55 0.18 35);     /* warm espresso */
  --color-primary-fg:   oklch(0.99 0 0);
  --color-success:      oklch(0.65 0.16 150);
  --color-warning:      oklch(0.78 0.16 80);
  --color-danger:       oklch(0.60 0.22 27);
  --shadow-card:        0 1px 2px oklch(0 0 0 / 0.04),
                        0 6px 18px oklch(0 0 0 / 0.06);
  --shadow-card-hover:  0 2px 6px oklch(0 0 0 / 0.08),
                        0 18px 40px oklch(0 0 0 / 0.12);
  --shadow-press:       0 1px 1px oklch(0 0 0 / 0.10) inset;
  --radius-card:        14px;
}
```

Stop using raw `slate-*` utility classes anywhere in `features/pos/`. Use
the semantic tokens (e.g. `bg-surface text-text border-border`).

### 2.2 Motion tokens (`src/lib/motion.ts`)

```ts
import type { Transition } from 'framer-motion'

export const duration = {
  micro:  0.08,
  short:  0.18,
  base:   0.26,
  long:   0.42,
} as const

// Cubic-bezier curves — copy these exactly, they're tuned for POS feel.
export const ease = {
  out:     [0.16, 1, 0.3, 1] as const,   // "expo out" — primary
  inOut:   [0.65, 0, 0.35, 1] as const,
  spring:  [0.34, 1.56, 0.64, 1] as const, // overshoots slightly
}

export const spring = {
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } satisfies Transition,
  soft:   { type: 'spring', stiffness: 180, damping: 24, mass: 1   } satisfies Transition,
  bouncy: { type: 'spring', stiffness: 300, damping: 18, mass: 0.9 } satisfies Transition,
}

// Standard variants used across the codebase.
export const variants = {
  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.short, ease: ease.out } },
  },
  riseIn: {
    hidden:  { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  },
  popIn: {
    hidden:  { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: spring.snappy },
  },
  stagger: {
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
  },
} as const
```

Always import from `@/lib/motion` — never inline magic numbers.

---

## 3. The Three "Hero" Motion Patterns

Every animated component in this PR uses one of these three patterns. No
freestyling.

### 3.1 Card tilt (pseudo-3D on hover/press)

Used by: `ProductCard`, `CategoryRailItem`, `HeldTicketCard`, payment
method tiles.

Mechanic: the card sits on a parent that owns `perspective: 1200px`. The
card itself rotates a few degrees on X/Y based on pointer position, lifts
on hover (`translateZ`), and presses down on tap. Reduced motion = no
tilt, just a subtle shadow on hover.

### 3.2 Layout choreography (list reorder + add/remove)

Used by: the cart line list, held tickets list, kitchen tickets, payment
tenders.

Mechanic: wrap the list in Framer Motion `<AnimatePresence mode="popLayout">`
and give each item a stable `layout` prop and a `riseIn`/`exit` variant.
Reorders animate via FLIP automatically.

### 3.3 Sheet / dialog choreography

Used by: `ModifierDialog`, `PaymentDialog`, `HeldTicketsDrawer`, line-edit
`Sheet`.

Mechanic: backdrop `fadeIn` (180ms), panel `riseIn` from y=24 with
`spring.snappy`. On close, reverse order (panel exits first, then
backdrop). Focus trap via shadcn primitives. Esc closes.

---

## 4. Components to Build / Rebuild (in this order)

Each section lists: file path, purpose, motion pattern used, and the
acceptance bullets that must be true at the end.

### 4.1 `src/components/ui/ProductFallback.tsx`

Replaces the emoji fallback. A deterministic SVG tile per product.

- Pure SVG, no images, no canvas. ViewBox 100×100.
- Background: linear-gradient computed from a hash of `name` so the same
  product always gets the same color pair within a warm palette
  (espresso → caramel → cream — keep saturation low).
- Foreground: a soft low-poly coffee-cup silhouette (3–4 polygons,
  inline). Underneath, monogram = up to 2 letters from `getInitials(name)`.
- Props: `name: string`, `className?: string`.
- No motion of its own — it's a static asset that the parent `ProductCard`
  may transform.
- Tests: snapshot for two different names; assert no `<text>` contains an
  emoji codepoint.

### 4.2 `src/lib/initials.ts` + `src/lib/color-hash.ts`

Small pure helpers used by `ProductFallback` and the customer chip.

- `getInitials(name: string): string` — 1–2 chars, Thai or Latin.
  For Thai input, take the first character; for ASCII, take first letter
  of first two words.
- `gradientFromName(name: string): { from: string; to: string }` — stable
  hash → pick from a fixed 8-pair palette.
- Tests for both helpers.

### 4.3 Rebuild `features/pos/components/ProductCard.tsx`

The flagship interaction. Motion pattern: **3.1 card tilt**.

- Replace the emoji fallback with `<ProductFallback>`.
- Wrap the card in a parent `<m.div>` with `perspective: 1200px` and
  `transformStyle: 'preserve-3d'`.
- Track pointer on the card using `useMotionValue` for X/Y; map them to
  `rotateX` (range −6° to +6°, inverted Y) and `rotateY` (−10° to +10°)
  via `useTransform`. Apply with a tiny `useSpring` (`stiffness: 220,
  damping: 22`) to smooth jitter.
- On hover: card lifts via `translateZ: 14px` and shadow swaps to
  `--shadow-card-hover`. On `pointerleave`: rotations spring back to 0.
- On press (`whileTap`): `scale: 0.97`, shadow swaps to `--shadow-press`.
- Render a subtle gloss highlight: a second absolutely-positioned layer
  inside the card that moves opposite to pointer for a parallax feel.
  Opacity 0.06. Skip when `useReducedMotion()` is true.
- "ADD" affordance: a small floating chip in the bottom-right corner
  that scales from 0 to 1 (`spring.bouncy`) on hover/focus. On click,
  emit `onAdd` then trigger a 1-shot flying-token animation toward the
  cart (see Section 4.5).
- Out-of-stock state: desaturate (CSS filter) + disable pointer.
- A11y: the whole card is a `button` with proper aria-label
  `"Add {name} to cart"`. Keyboard `Enter`/`Space` triggers `onAdd`.
- Tests: render with mocked product; click adds; reduced-motion mode
  renders without inline transforms.

### 4.4 `features/pos/components/MenuGrid.tsx`

Motion pattern: **3.2 layout choreography** for filter changes.

- `<m.div>` parent with `variants.stagger` on `visible`.
- Each `ProductCard` is wrapped in `<m.div variants={variants.riseIn}
  layout />`.
- On category / search change, items reflow with FLIP. Limit stagger to
  the first 16 items to stay snappy.
- Empty state and error state: use custom SVG illustration from
  `src/components/illustrations/`, not emoji.
- Skeleton state: 8 shimmer tiles using `m.div` with an `opacity` keyframe
  loop (1s, ease.inOut). Skip the loop under reduced motion.

### 4.5 Cart "fly to cart" effect

A one-shot animation when the user taps a product. Implementation:

- `useFlyToCart()` hook in `features/pos/hooks/useFlyToCart.ts`.
- On `onAdd`, compute the source rect (the product card) and the
  destination rect (a target ref attached to the cart icon in the sub-bar).
- Render a `m.div` portal at the source position with the
  `<ProductFallback>` mini and animate it to the destination with
  `spring.snappy`, scaling from 1 → 0.4 and fading opacity from 1 → 0 in
  the last 30% of the path. Remove from DOM on `onAnimationComplete`.
- Concurrent calls are queued; never more than 3 tokens visible at once.
- Cart badge briefly scales 1 → 1.15 → 1 when a token lands.
- No effect under reduced motion — just the badge count update.

### 4.6 Cart panel (`features/pos/components/Cart.tsx`) + line sheet

Motion pattern: **3.2 layout choreography** for line list.

- Replace the static `<div>` line list with `<AnimatePresence mode="popLayout">`.
- Each `CartItem` is `m.div` with `layout`, `variants.riseIn`, and an
  `exit` of `{ opacity: 0, x: 24 }` (slides out to the right).
- Quantity changes: the qty number uses Framer Motion's `<m.span key={qty}>`
  with `variants.popIn` so the digit pops when it changes.
- Footer totals: each line uses `<AnimatedNumber>` (Section 4.10) to
  count up/down to the new total.
- Tapping a line opens a shadcn `Sheet` from the right with the line
  editor — qty, modifiers, note, discount. Sheet uses motion pattern 3.3.

### 4.7 `features/auth/LoginPage.tsx` — the optional 3D hero

This is the **only** place R3F is allowed.

- Add a single canvas (left half on desktop, top on tablet portrait)
  showing a slowly-rotating low-poly coffee cup made of primitive
  geometries (`CylinderGeometry` base, `TorusGeometry` rim,
  `CylinderGeometry` handle — do **not** use `CapsuleGeometry`, it's not
  in our pinned three.js r128 build). Soft warm lighting (one
  `directionalLight`, one ambient).
- Auto-rotate at 0.3 rad/s. Pause on tab blur. Disabled under reduced
  motion (replace with a static SVG version of the cup).
- The form on the right uses motion pattern 3.3 (riseIn on mount).
- Lazy-load the R3F bundle with `React.lazy` so the rest of the app is
  unaffected:

  ```tsx
  const LoginHero3D = lazy(() => import('./components/LoginHero3D'))
  ```

- Acceptance: this scene must add < 35 KB gzipped (R3F + drei
  tree-shaken). If it's larger, drop drei and use bare R3F.

### 4.8 POS sub-bar + global header polish

- New `features/pos/components/PosSubBar.tsx` — dark surface
  (`bg-surface-ink`), houses: order number, channel toggle
  (`ToggleGroup`), table input (conditional), customer chip, held-tickets
  button. Slides down on POS route enter (riseIn, y=−12).
- Channel toggle has a moving "pill" background using Framer Motion
  `layoutId` so the highlighted segment glides between options.

### 4.9 Page transitions

- Add a `PageTransition` wrapper in `AppShell.tsx` that uses
  `AnimatePresence mode="wait"` keyed on `location.pathname`. Each route
  enters with `variants.riseIn` and exits with `{ opacity: 0, y: −8 }`.
- Duration: `duration.short`. No 3D rotation — keep it subtle.

### 4.10 `src/components/ui/AnimatedNumber.tsx`

- Tween a numeric prop with `useMotionValue` + `useSpring` and render
  using `useTransform` so React doesn't re-render every frame.
- Format via `formatCurrency` (already in `lib/utils.ts`). Make sure the
  text uses `font-variant-numeric: tabular-nums` to prevent width jitter.
- Acceptance: total stays right-aligned without horizontal wobble while
  counting.

### 4.11 Toasts

- Configure `sonner` once in `AppShell.tsx` with `position="top-center"`,
  `richColors`, and default icons mapped from lucide
  (`CheckCircle2`, `AlertCircle`, `XCircle`, `Info`).
- Remove every emoji from existing `toast.*` calls.

---

## 5. One Fully-Coded Reference (use this style for all the rest)

This is the reference for tone, indentation, comments, and motion usage.
Match it.

```tsx
// frontend/src/features/pos/components/ProductCard.tsx
import { Plus } from 'lucide-react'
import {
  m,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useRef } from 'react'

import { ProductFallback } from '@/components/ui/ProductFallback'
import { duration, ease, spring } from '@/lib/motion'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types/product'

const ROTATE_X_RANGE = 6
const ROTATE_Y_RANGE = 10
const LIFT_Z = 14

interface Props {
  product: Product
  onAdd: (p: Product) => void
  disabled?: boolean
}

export function ProductCard({ product, onAdd, disabled = false }: Props) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLButtonElement>(null)

  // Raw pointer-derived values (-0.5 .. 0.5 within the card).
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  // Smoothed via spring.
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [ROTATE_X_RANGE, -ROTATE_X_RANGE]), {
    stiffness: 220,
    damping: 22,
  })
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-ROTATE_Y_RANGE, ROTATE_Y_RANGE]), {
    stiffness: 220,
    damping: 22,
  })
  const glossX = useTransform(px, [-0.5, 0.5], ['30%', '70%'])
  const glossY = useTransform(py, [-0.5, 0.5], ['30%', '70%'])
  const glossBg = useMotionTemplate`radial-gradient(circle at ${glossX} ${glossY}, rgba(255,255,255,0.18), transparent 60%)`

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width - 0.5)
    py.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handlePointerLeave() {
    px.set(0)
    py.set(0)
  }

  return (
    <div style={{ perspective: 1200 }} className="contents">
      <m.button
        ref={ref}
        type="button"
        aria-label={`Add ${product.name} to cart`}
        disabled={disabled}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={() => { onAdd(product) }}
        style={
          reduced
            ? undefined
            : { rotateX, rotateY, transformStyle: 'preserve-3d' as const }
        }
        whileHover={reduced ? undefined : { translateZ: LIFT_Z }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: duration.short, ease: ease.out }}
        className="group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-card)]
                   bg-surface text-left shadow-[var(--shadow-card)] outline-none
                   transition-shadow hover:shadow-[var(--shadow-card-hover)]
                   focus-visible:shadow-[0_0_0_3px_var(--color-primary)]
                   disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="relative aspect-square w-full">
          {product.image ? (
            <img src={product.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <ProductFallback name={product.name} className="h-full w-full" />
          )}
          {!reduced && (
            <m.div
              aria-hidden
              style={{ background: glossBg }}
              className="pointer-events-none absolute inset-0"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <span className="line-clamp-2 text-sm font-medium text-text">{product.name}</span>
          <span className="text-base font-semibold text-text tabular-nums">
            {formatCurrency(product.price)}
          </span>
        </div>
        <m.span
          aria-hidden
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          transition={spring.bouncy}
          className="absolute bottom-2 right-2 inline-flex h-9 w-9 items-center
                     justify-center rounded-full bg-primary text-primary-fg shadow-md"
        >
          <Plus className="h-4 w-4" />
        </m.span>
      </m.button>
    </div>
  )
}
```

Use this file's structure (constants on top, motion values, handlers,
JSX) as the template for the other components.

---

## 6. How to be Efficient with this Prompt (read before starting)

This is the most effective way I've found to ship UI work with Claude:

1. **Do Section 2 first**, in its own commit (`chore(pos-ui): design + motion
   tokens`). Every subsequent component depends on it.
2. **Then 4.1, 4.2** (the building blocks) in one commit
   (`feat(ui): ProductFallback + initials helpers`).
3. **Then 4.3** (`feat(pos-ui): 3D-tilt ProductCard`). This is the model
   for all other surfaces — get the feel right here before moving on.
   Open a PR-style screenshot in the chat for a sanity check before
   proceeding.
4. **Then 4.4 → 4.11** in order. One commit per item.
5. **Final commit**: `chore(pos-ui): emoji audit` — run `grep` for the
   emoji unicode ranges in `frontend/src/` and report zero matches in the
   commit body.
6. After every commit, run the full lint + typecheck + test trio.
7. If a motion choice doesn't feel right, **adjust the token**, not the
   component — that's the whole point of Section 2.

---

## 7. Acceptance Checklist (self-verify before marking the PR ready)

- [ ] `grep -RInP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' frontend/src` returns nothing.
- [ ] No new dependency added other than `framer-motion`, `@react-three/fiber`, `@react-three/drei`.
- [ ] `pnpm typecheck` and `pnpm lint` clean.
- [ ] Every new component has a vitest test.
- [ ] `useReducedMotion()` path verified for `ProductCard`, `MenuGrid` stagger, `Cart` line transitions, `LoginHero3D`.
- [ ] POS product grid scrolling at 60fps with 60+ items on the target tablet (Chrome devtools recording attached to PR).
- [ ] Bundle delta < +45 KB gzipped; R3F scene < +35 KB gzipped (in its own chunk).
- [ ] All animated transforms use only `transform` / `opacity`.
- [ ] All focus rings remain visible on tilted cards.
- [ ] Zero usage of `outline:` for focus on transformed components — only `box-shadow`.
- [ ] PR description lists the bundle delta numbers and a short Loom-style summary.

---

## 8. First Action

1. Confirm by listing the commits you intend to make (no code yet).
2. Then implement Section 2 (tokens) and post the diff in chat.
3. Wait for review, then continue from 4.1 in order.

Do not skip ahead. Do not add features outside this brief. If something is
ambiguous, ask — don't guess.

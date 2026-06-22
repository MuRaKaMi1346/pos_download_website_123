# Leonardo.ai Prompts — SmartBrew POS Landing (Compact)

## 0. Locked Style (paste into every render)

**Model**: Leonardo Phoenix 1.0 or Flux Dev. **Preset**: 3D Render.
**Style strength**: 0.55. **Guidance**: 5–7 (Phoenix) / 3.5 (Flux).
**Aspect**: 16:9 hero, 1:1 tile, 4:5 device.

**Style suffix** — append to every prompt:

> cinematic 3D product render, soft global illumination, subtle
> subsurface scattering, premium octane render quality, shallow depth of
> field, warm color grade, minimal composition, generous negative space,
> photoreal materials with stylized geometry

**Color palette** — lock in every prompt:

> palette strictly limited to deep espresso #2A1810, warm caramel
> #B07A4A, soft cream #F4E8D8, latte beige #E8D9C2, muted copper #C68642,
> ember orange #D86B3C; slate ink #1C1F24 only as background; no greens,
> no blues, no purples, no neon

**Negative prompt** — paste every time:

> text, watermark, logo, letters, numbers, readable ui, hands, people,
> faces, clutter, harsh shadows, blown highlights, oversaturated, neon,
> cyan, magenta, cold tones, low quality, blurry, deformed, plastic toy
> look, cartoonish, voxel, pixelated, jpeg artifacts

**Lighting**: warm 3200K key from upper-left, cooler 4500K fill at 25%
from lower-right. Subject floats above a matte cream pedestal disc.

---

## 1. Hero — Floating Espresso Cup (16:9)

A single elegant low-poly stylized espresso cup floating above a soft
cream pedestal disc, warm steam rising as soft volumetric mist, a faint
caramel ambient ring at the base, matte ceramic with subtle ridges
catching warm rim light, two thin rings and one small rounded tablet
silhouette orbiting calmly at varied distances, bokeh background gradient
from deep espresso corners to cream center, faint dust particles in the
light, [STYLE], [PALETTE]

## 2. Hero — POS Tablet, 3/4 Angle (4:5)

A floating modern tablet at 15° tilt, screen glows softly with abstract
warm-toned cards and sidebar — no readable text, only soft rounded
rectangles in caramel and cream, a small espresso cup on the pedestal in
front, matte dark espresso aluminum body with a thin caramel accent line
on the edge, subtle radial glow behind, calm premium mood, [STYLE],
[PALETTE]

Add to negative: *readable interface, sharp text, app icons, real logos,
iPad mockup*

## 3. Feature Tile — POS / Cart (1:1)

A small isometric 3D scene of a stylized rounded payment terminal, no
realistic mechanical detail, a tiny floating credit card hovers above the
slot, two caramel coins beside it on the cream pedestal, single warm key
from upper-left, minimal centered composition, faint radial vignette
toward espresso corners, [STYLE], [PALETTE]

## 4. Feature Tile — Inventory (1:1)

Three stylized ingredient containers grouped on a cream pedestal — a jar
of coffee beans, a small milk bottle, a sugar canister — simplified
rounded geometry, matte ceramic and warm caramel glass, a few stray beans
on the pedestal, faint dashed orbit line above suggesting tracking,
[STYLE], [PALETTE]

## 5. Feature Tile — AI Forecasting (1:1)

A small abstract 3D data viz floating above a cream pedestal: four soft
cylindrical bars of varied heights in caramel, cream and ember; an
elegant rising glowing tube curving over the bars; a small sphere on the
latest point; gentle warm bloom; no text or numbers anywhere, [STYLE],
[PALETTE]

## 6. Background Plate — Ambient (16:9, style strength 0.35)

Soft abstract 3D background of slowly drifting rounded organic blobs in
cream and caramel, smooth gradients, faint warm fog catching ambient
light, no focal subject, designed as a calm backdrop for text on top,
plenty of low-detail space, [STYLE], [PALETTE]

## 7. CTA — Download Cube (1:1)

A floating soft-edged rounded cube in warm caramel with a thin cream
ribbon wrapping diagonally, a single espresso coffee bean on top as a
playful accent, gentle warm glow underneath, hovering on a cream
pedestal with soft circular shadow, [STYLE], [PALETTE]

## 8. Brand Mark / Favicon (1:1, style strength 0.6)

A single iconic stylized espresso cup viewed front-on, centered,
symmetrical, simplified rounded geometry for icon use, matte caramel
ceramic with a thin cream rim band, one wisp of warm steam straight up,
espresso background with a soft circular glow behind the cup, ultra clean
iconic, [STYLE], [PALETTE]

---

## Workflow

1. Render Hero #1 first; lock palette and lighting feel.
2. Then one feature tile (#3). Verify it sits next to the hero.
3. Batch the other feature tiles in one session for consistency.
4. Background plate (#6) last with lower style strength.
5. Variations: change ONE element only (angle, pedestal shape). Never
   edit the master tokens per render.
6. Upscale: Alchemy or Universal Upscaler v2 at 2x. Avoid Creative
   Upscale on hero shots.
7. Export WebP q80 for web; keep PNG source in `assets/leonardo-source/`.

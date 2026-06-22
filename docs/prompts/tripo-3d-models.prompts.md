# Tripo AI Prompts — SmartBrew POS 3D Model Pack

> One prompt = one model. Each block below is **under 500 chars** so it
> fits Tripo's 800-char limit with room to spare. Copy ONE block at a
> time into the Prompt box. Set the rules below in the Tripo side panel,
> not in the prompt text.

---

## Tripo panel settings (set once, keep for the whole pack)

- Style preset: **Original** (or **Clay** for softer feel)
- Quality: **Detailed** for hero models, **Standard** for icons
- Symmetry: **ON** for symmetric objects (cup, cube, star, drawer)
- PBR materials: **ON**
- Auto-retopo: **Quad**, target ~10k tris
- Export: **GLB** with embedded textures

Do NOT type any of these inside the prompt: camera, lens, angle, depth
of field, bokeh, lighting, color grade, background, brand name, readable
text. Tripo ignores them or breaks on them.

---

## 1. Espresso cup (hero)

```
A simple stylized espresso coffee cup, rounded matte ceramic body with a small curved handle, short cylindrical shape, smooth rounded geometry, empty, thin rim, clean silhouette, premium stylized clay look
```

## 2. Coffee bean

```
A single coffee bean, oval shape with a clear groove down the center, matte dark surface, simple rounded geometry, smooth silhouette, stylized clay look
```

## 3. Tablet POS device

```
A modern thin tablet computer, rounded corners, simple slab geometry, thin uniform bezel around a flat blank screen, matte aluminum back, no buttons, no ports, no logos, clean stylized form
```

## 4. Cash drawer / till

```
A stylized cash register drawer, rounded rectangular box with a single horizontal slot on the front face, smooth simple geometry, no mechanical detail, no screen, clean stylized form
```

## 5. Ingredient jar

```
A cylindrical glass storage jar with a round screw-top lid, smooth rounded body, short neck, filled with coffee beans inside, matte glass material, simple smooth geometry, stylized clay look
```

## 6. Milk bottle

```
A stylized milk bottle, classic rounded shoulder shape, short narrow neck, smooth ceramic body, no label, simple stylized geometry, clean silhouette
```

## 7. Payment card

```
A flat thin rectangular card with rounded corners, simple slab geometry, smooth uniform blank face, no text, no chip, no stripe, clean stylized form
```

## 8. Download cube

```
A rounded soft-edged cube with a thin ribbon band wrapping diagonally across one corner, smooth stylized geometry, gentle bevels on every edge, clean silhouette
```

## 9. Chart bars

```
Three soft cylindrical bars of different heights standing on a flat round base disc, smooth rounded tops, simple stylized geometry, clean composition
```

## 10. Coin stack

```
A small stack of three coins, simple cylindrical geometry, smooth rounded edges, slightly offset from each other, stylized clay look
```

## 11. Loyalty star

```
A simple rounded five-point star, smooth bevels on every edge, slight thickness, clean stylized geometry suitable for an icon
```

## 12. Take-away cup

```
A stylized take-away coffee cup with a domed lid and small drink hole on top, rounded cylindrical body that tapers slightly toward the bottom, smooth stylized geometry, no sleeve, no text
```

---

## If text-to-3D silhouette is wrong

After 3 retries on the same prompt, switch to **Image-to-3D** and feed
Tripo the matching Leonardo render from `leonardo-landing-3d.prompts.md`.
Crop to subject only (drop pedestal + background) before upload.

## Pipeline into the project

Place exports at `frontend/public/models/<name>.glb`. Load with
`useGLTF('/models/<name>.glb')` in the LoginHero3D scene only (per
`pos-ui-motion.prompt.md` Section 4.7). Override Tripo's baked colors
in the Three.js shader using the SmartBrew palette — don't rely on
Tripo's color output. Budget per model: **< 80 KB gzipped, ≤ 12k tris**.
Run through `gltf-transform dedup && weld && simplify` before commit.

## Order of operations

1. Cup → bean → tablet (hero trio) first.
2. Verify the cup loads in R3F at 60fps on a 2020 iPad.
3. Then props 5–12 in one batch session for visual consistency.
4. Optimize each, then commit as `chore(assets): add tripo 3D model pack`
   with file sizes in the commit body.

// Generates the per-locale Open Graph images (1200x630) into public/og/.
// Run: node scripts/make-og.mjs  (requires the installed `sharp`).
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const outDir = fileURLToPath(new URL('../public/og/', import.meta.url))
mkdirSync(outDir, { recursive: true })

function svg(tagline, taglineFont) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2a160c"/>
        <stop offset="1" stop-color="#150c06"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.72" cy="0.28" r="0.65">
        <stop offset="0" stop-color="#7a5836" stop-opacity="0.40"/>
        <stop offset="1" stop-color="#7a5836" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <g transform="translate(100,250) scale(2.4)" fill="none" stroke="#f3e6d6" stroke-width="3" stroke-linejoin="round">
      <path d="M0 0h44v22a22 22 0 0 1-22 22h0A22 22 0 0 1 0 22z"/>
      <path d="M44 5h10a10 10 0 0 1 0 20H44"/>
    </g>
    <text x="100" y="205" font-family="Georgia, 'Times New Roman', serif" font-size="94" font-weight="700" fill="#f6efe4">SmartBrew POS</text>
    <text x="100" y="500" font-family="${taglineFont}" font-size="42" fill="#e9d9c6">${tagline}</text>
  </svg>`
}

const variants = [
  { lang: 'th', tagline: 'ขายไว จัดการคล่อง เพื่อคาเฟ่', font: "Tahoma, 'Leelawadee UI', sans-serif" },
  { lang: 'en', tagline: 'Fast at the counter, smart behind it', font: "Georgia, 'Times New Roman', serif" },
]

for (const v of variants) {
  const out = fileURLToPath(new URL(`../public/og/og-${v.lang}.png`, import.meta.url))
  await sharp(Buffer.from(svg(v.tagline, v.font))).png().toFile(out)
  console.log(`wrote og-${v.lang}.png`)
}

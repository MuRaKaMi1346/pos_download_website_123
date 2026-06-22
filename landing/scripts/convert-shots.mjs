// One-off: optimize the real POS screenshots (docs/images/*.png) into
// web-served WebP (landing/public/images/*.webp) for the landing sections.
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const SRC = join(here, '..', '..', 'docs', 'images')
const OUT = join(here, '..', 'public', 'images')

// docs/images PNG  ->  public/images WebP (clean name)
const MAP = {
  '04-shift.png': 'shift.webp',
  '08-admin-products.png': 'products.webp',
  '09-add-product.png': 'add-product.webp',
  '10-admin-orders.png': 'orders.webp',
  '11-admin-ingredients.png': 'ingredients.webp',
  '12-admin-recipes.png': 'recipes.webp',
  '14-admin-modifiers.png': 'modifiers.webp',
  '15-admin-discounts.png': 'discounts.webp',
  '16-admin-cash-drawer.png': 'cash-drawer.webp',
  '17-admin-settings.png': 'settings.webp',
}

for (const [src, out] of Object.entries(MAP)) {
  const info = await sharp(join(SRC, src))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(join(OUT, out))
  console.log(`${src} -> ${out}  (${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB)`)
}

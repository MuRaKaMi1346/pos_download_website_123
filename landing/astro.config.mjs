import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://smartbrew.app',
  integrations: [
    react(),
    // We ship our own base layer in src/styles/global.css.
    tailwind({ applyBaseStyles: false }),
    // @astrojs/sitemap 3.7.3 crashes on astro:build:done with Astro 4.16 + i18n
    // (_routes is undefined). We emit the sitemap from src/pages/sitemap.xml.ts.
  ],
  i18n: {
    defaultLocale: 'th',
    locales: ['th', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    // The Act II WebGL scene is an intentional lazy chunk (~235 KB gz), loaded
    // only when the user nears it — not part of the critical home bundle.
    build: { chunkSizeWarningLimit: 1000 },
    ssr: {
      // three / R3F are ESM-only; keep them out of the SSR externalization path.
      noExternal: ['three', '@react-three/fiber', '@react-three/drei'],
    },
  },
})

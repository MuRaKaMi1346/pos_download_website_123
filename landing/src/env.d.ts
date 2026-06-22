/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_BASE?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  /** Set by HeroVideo once the intro video ends (or is skipped). */
  __heroRevealed?: boolean
}

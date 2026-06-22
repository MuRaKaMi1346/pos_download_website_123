import en from './i18n/en.json'
import th from './i18n/th.json'

export type Locale = 'th' | 'en'
export const LOCALES: readonly Locale[] = ['th', 'en']
export const DEFAULT_LOCALE: Locale = 'th'

export interface Strings {
  meta: { title: string; description: string }
  hero: { eyebrow: string; headline: string; subline: string; primary: string; secondary: string }
  act2: { alt: string; labels: string[] }
  capabilities: { title: string; desc: string }[]
  quiet: { line1: string; line2: string }
  how: { heading: string; steps: { title: string; desc: string }[] }
  pricing: {
    heading: string
    sub: string
    recommended: string
    tiers: {
      name: string
      price: string
      period: string
      blurb: string
      cta: string
      features: string[]
    }[]
  }
  faq: { heading: string; items: { q: string; a: string }[] }
  cta: { heading: string; sub: string; orNewsletter: string }
  newsletter: {
    label: string
    placeholder: string
    submit: string
    sending: string
    success: string
    invalid: string
    error: string
  }
  download: { for: string; version: string; or: string; demo: string; errorNote: string }
  footer: {
    tagline: string
    product: string
    download: string
    capabilities: string
    faq: string
    tryIt: string
    demo: string
    built: string
  }
}

const DICT: Record<Locale, Strings> = { th: th as Strings, en: en as Strings }

export function getStrings(locale: Locale): Strings {
  return DICT[locale]
}

export function getLocaleFromUrl(url: URL): Locale {
  return url.pathname.split('/')[1] === 'en' ? 'en' : 'th'
}

/** Map a default-locale (th) path to its localized equivalent. */
export function localizedPath(locale: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === 'th') return clean
  return clean === '/' ? '/en/' : `/en${clean}`
}

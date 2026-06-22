import { useEffect, useState } from 'react'

import type { Locale } from '../lib/i18n'

/**
 * Language toggle (landing brief §7). Preserves the current path when switching
 * locales (th at /, en at /en/). Computed on the client from window.location.
 */
export default function LanguageToggle({ locale }: { locale: Locale }) {
  const [thPath, setThPath] = useState('/')
  const [enPath, setEnPath] = useState('/en/')

  useEffect(() => {
    const path = window.location.pathname
    const base = path.replace(/^\/en(?=\/|$)/, '') || '/'
    setThPath(base)
    setEnPath(base === '/' ? '/en/' : `/en${base}`)
  }, [])

  const linkClass = (active: boolean) =>
    active ? 'font-medium text-text' : 'text-text-muted transition-colors hover:text-text'

  return (
    <div className="flex items-center gap-3" aria-label="Language">
      <a href={thPath} aria-current={locale === 'th' ? 'page' : undefined} className={linkClass(locale === 'th')}>
        ไทย
      </a>
      <span aria-hidden="true">·</span>
      <a href={enPath} aria-current={locale === 'en' ? 'page' : undefined} className={linkClass(locale === 'en')}>
        EN
      </a>
    </div>
  )
}

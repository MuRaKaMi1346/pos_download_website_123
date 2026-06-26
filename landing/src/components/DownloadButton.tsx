import { useEffect, useState } from 'react'

import type { Strings } from '../lib/i18n'

type OS = 'windows' | 'macos' | 'linux' | 'unknown'
type Channel = { url: string; size_bytes: number; sha256: string }
interface Release {
  version: string
  released_at: string
  channels: Partial<Record<Exclude<OS, 'unknown'>, Channel>>
  notes_url: string
}

const API_BASE =
  (import.meta.env.PUBLIC_API_BASE as string | undefined) ?? 'http://localhost:8000/api/v1'

// Windows demo build, hosted as a GitHub Release asset. The `/releases/latest/`
// path always resolves to the newest release's asset, so updating the demo only
// means publishing a new release with a SmartBrewPOS-Setup.exe asset — no code change.
const WINDOWS_DEMO_URL =
  'https://github.com/MuRaKaMi1346/pos_download_website_123/releases/latest/download/SmartBrewPOS-Setup.exe'

// Used when the release API isn't reachable (e.g. the static site without the
// backend): still offer the Windows demo instead of only the online demo link.
const FALLBACK_RELEASE: Release = {
  version: 'Demo',
  released_at: '',
  channels: { windows: { url: WINDOWS_DEMO_URL, size_bytes: 109_880_865, sha256: '' } },
  notes_url: '',
}

function hasChannels(release: Release | null): release is Release {
  return !!release && Object.keys(release.channels).length > 0
}

const OS_LABELS: Record<Exclude<OS, 'unknown'>, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
}

const DEFAULT_COPY: Strings['download'] = {
  for: 'ดาวน์โหลดสำหรับ',
  version: 'เวอร์ชัน',
  or: 'หรือสำหรับ',
  demo: 'ทดลองใช้เดโมออนไลน์',
  errorNote: 'ขณะนี้ยังโหลดข้อมูลรุ่นล่าสุดไม่ได้ กรุณาลองใหม่ภายหลัง',
}

function detectOS(): OS {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('mac')) return 'macos'
  if (ua.includes('linux') || ua.includes('x11')) return 'linux'
  return 'unknown'
}

function formatSize(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(0)} MB`
}

/**
 * OS-aware download CTA (landing brief §6 / §10). Fetches the latest release
 * manifest and offers the detected platform first, with the others as links.
 * Falls back to the demo if the manifest can't be loaded.
 */
export default function DownloadButton({ copy = DEFAULT_COPY }: { copy?: Strings['download'] }) {
  const [os, setOs] = useState<OS>('unknown')
  const [release, setRelease] = useState<Release | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    setOs(detectOS())
    const controller = new AbortController()
    fetch(`${API_BASE}/releases/latest`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json() as Promise<Release>
      })
      .then((data) => {
        setRelease(hasChannels(data) ? data : FALLBACK_RELEASE)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        // API down: still offer the Windows demo build.
        setRelease(FALLBACK_RELEASE)
        setStatus('ready')
      })
    return () => controller.abort()
  }, [])

  if (status === 'loading') {
    return (
      <div className="mx-auto h-16 w-64 animate-pulse rounded-2xl bg-cream/10" aria-hidden="true" />
    )
  }

  if (status === 'error' || !release) {
    return (
      <div className="text-center">
        <a
          href="https://demo.smartbrew.app"
          className="inline-flex items-center justify-center rounded-full bg-cream px-8 py-4 text-sm font-medium text-espresso shadow-card"
        >
          {copy.demo}
        </a>
        <p className="mt-3 text-sm text-cream">{copy.errorNote}</p>
      </div>
    )
  }

  const keys = Object.keys(release.channels) as Exclude<OS, 'unknown'>[]
  const primaryOs: Exclude<OS, 'unknown'> =
    os !== 'unknown' && release.channels[os] ? os : (keys[0] ?? 'windows')
  const primary = release.channels[primaryOs]
  const others = keys.filter((key) => key !== primaryOs)

  return (
    <div className="text-center">
      {primary && (
        <a
          href={primary.url}
          className="inline-flex flex-col items-center rounded-2xl bg-cream px-8 py-4 text-espresso shadow-card transition-transform hover:-translate-y-0.5"
        >
          <span className="text-base font-medium">
            {copy.for} {OS_LABELS[primaryOs]}
          </span>
          <span className="text-xs text-espresso/60">
            {copy.version} {release.version} · {formatSize(primary.size_bytes)}
          </span>
        </a>
      )}
      {others.length > 0 && (
        <p className="mt-4 text-sm text-cream">
          {copy.or}{' '}
          {others.map((key, index) => (
            <span key={key}>
              {index > 0 && ' · '}
              <a
                href={release.channels[key]?.url}
                className="underline underline-offset-4 transition-colors hover:text-cream"
              >
                {OS_LABELS[key]}
              </a>
            </span>
          ))}
        </p>
      )}
    </div>
  )
}

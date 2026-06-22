import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import DownloadButton from '../src/components/DownloadButton'

const RELEASE = {
  version: '1.4.2',
  released_at: '2026-06-08T00:00:00Z',
  notes_url: '/changelog#1-4-2',
  channels: {
    windows: { url: 'https://cdn.smartbrew.app/win.exe', size_bytes: 124583920, sha256: 'a' },
    macos: { url: 'https://cdn.smartbrew.app/mac.dmg', size_bytes: 119223412, sha256: 'b' },
    linux: { url: 'https://cdn.smartbrew.app/app.AppImage', size_bytes: 142001112, sha256: 'c' },
  },
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DownloadButton', () => {
  it('shows the latest version and a real download link', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => RELEASE,
    } as Response)

    render(<DownloadButton />)
    await waitFor(() => expect(screen.getByText(/1\.4\.2/)).toBeInTheDocument())

    const hasInstaller = screen
      .getAllByRole('link')
      .some((a) => /\.(exe|dmg|AppImage)$/.test(a.getAttribute('href') ?? ''))
    expect(hasInstaller).toBe(true)
  })

  it('falls back to the demo when the manifest fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 500 } as Response)
    render(<DownloadButton />)
    await waitFor(() =>
      expect(screen.getByText(/ยังโหลดข้อมูลรุ่นล่าสุดไม่ได้/)).toBeInTheDocument(),
    )
  })
})

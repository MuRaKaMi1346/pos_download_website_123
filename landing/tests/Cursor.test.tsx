import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Cursor from '../src/components/Cursor'

function mockFinePointer(fine: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('pointer: fine') ? fine : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

afterEach(() => {
  document.documentElement.classList.remove('has-custom-cursor')
})

describe('Cursor', () => {
  it('renders nothing on touch devices (no fine pointer)', () => {
    mockFinePointer(false)
    const { container } = render(<Cursor />)
    expect(container.firstChild).toBeNull()
    expect(document.documentElement.classList.contains('has-custom-cursor')).toBe(false)
  })

  it('renders the ring and hides the native cursor on a fine pointer', () => {
    mockFinePointer(true)
    const { container } = render(<Cursor />)
    expect(container.querySelector('.cursor-ring')).not.toBeNull()
    expect(document.documentElement.classList.contains('has-custom-cursor')).toBe(true)
  })
})

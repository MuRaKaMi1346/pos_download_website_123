import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { initCurtain } from '../src/scripts/curtain'

function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia
}

function mountCurtain(): HTMLElement {
  document.body.innerHTML =
    '<div id="loading-curtain"><span class="curtain__mark">SmartBrew</span></div>'
  return document.getElementById('loading-curtain') as HTMLElement
}

describe('initCurtain', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    document.documentElement.className = ''
    mockReducedMotion(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ignores the wordmark animation but dismisses on the curtain wipe', () => {
    const curtain = mountCurtain()
    initCurtain()

    const mark = curtain.querySelector('.curtain__mark')!
    mark.dispatchEvent(new Event('animationend', { bubbles: true }))
    expect(document.getElementById('loading-curtain')).not.toBeNull()

    curtain.dispatchEvent(new Event('animationend'))
    expect(document.getElementById('loading-curtain')).toBeNull()
    expect(document.documentElement.classList.contains('curtain-done')).toBe(true)
  })

  it('adds a designed reduced-motion variant', () => {
    mockReducedMotion(true)
    const curtain = mountCurtain()
    initCurtain()
    expect(curtain.classList.contains('curtain--reduced')).toBe(true)
  })

  it('falls back to a timeout within the 1.5s safety budget', () => {
    mountCurtain()
    initCurtain()
    vi.advanceTimersByTime(1500)
    expect(document.getElementById('loading-curtain')).toBeNull()
  })
})

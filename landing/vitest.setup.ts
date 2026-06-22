import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom lacks these; framer-motion's whileInView / useScroll need them.
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver
}
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = MockObserver as unknown as typeof ResizeObserver
}

// jsdom does not implement matchMedia; provide a default stub. Tests that care
// about specific queries override window.matchMedia themselves.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

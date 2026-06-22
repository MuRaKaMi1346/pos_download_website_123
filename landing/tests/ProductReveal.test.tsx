import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ProductReveal from '../src/components/ProductReveal'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ProductReveal', () => {
  it('renders nothing under reduced motion (the static still stands in)', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia

    const { container } = render(<ProductReveal />)
    expect(container.firstChild).toBeNull()
  })
})

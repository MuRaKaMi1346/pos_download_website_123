import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ActCapabilities from '../src/components/ActCapabilities'

describe('ActCapabilities', () => {
  it('renders all six capability headings', () => {
    render(<ActCapabilities />)
    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings).toHaveLength(6)
    expect(screen.getByText('พยากรณ์ยอดขายด้วย AI')).toBeInTheDocument()
    expect(screen.getByText('ทำงานต่อได้แม้เน็ตหลุด')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import HowItWorks from '../src/components/HowItWorks'

describe('HowItWorks', () => {
  it('renders three steps', () => {
    render(<HowItWorks />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})

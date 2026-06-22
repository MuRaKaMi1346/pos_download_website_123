import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import FaqAccordion from '../src/components/FaqAccordion'

describe('FaqAccordion', () => {
  it('opens the first item by default and toggles on click', () => {
    render(<FaqAccordion />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(buttons[1])
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true')
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false')
  })
})

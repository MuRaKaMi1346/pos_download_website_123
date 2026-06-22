import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import SoundToggle from '../src/components/SoundToggle'

describe('SoundToggle', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('defaults to muted, then toggles and persists the choice', () => {
    render(<SoundToggle />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('smartbrew-sound')).toBe('on')

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem('smartbrew-sound')).toBe('off')
  })
})

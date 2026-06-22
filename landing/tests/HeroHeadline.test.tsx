import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import HeroHeadline from '../src/components/HeroHeadline'

describe('HeroHeadline', () => {
  it('renders every headline word and both CTAs (end state)', () => {
    render(
      <HeroHeadline
        eyebrow="SmartBrew POS"
        headline={'Brew smoothly\nSell quietly'}
        subline="A point of sale built for cafes."
        primary={{ label: 'Download', href: '#download' }}
        secondary={{ label: 'Try the demo', href: 'https://demo.smartbrew.app' }}
      />,
    )

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Brew')
    expect(heading.textContent).toContain('quietly')

    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '#download')
    expect(screen.getByRole('link', { name: 'Try the demo' })).toHaveAttribute(
      'href',
      'https://demo.smartbrew.app',
    )
  })
})

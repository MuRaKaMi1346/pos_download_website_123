import { describe, expect, it } from 'vitest'

import { cinematic, duration, ease, spring } from '../src/lib/motion'

describe('motion tokens', () => {
  it('exposes the POS duration scale', () => {
    expect(duration.short).toBe(0.18)
    expect(duration.base).toBe(0.26)
  })

  it('uses the tuned expo-out curve', () => {
    expect(ease.out).toEqual([0.16, 1, 0.3, 1])
  })

  it('defines spring presets', () => {
    expect(spring.snappy.type).toBe('spring')
  })

  it('keeps the loading curtain within the 1.4s budget (brief §1.5.5)', () => {
    const total = cinematic.curtainWordIn + cinematic.curtainHold + cinematic.curtainWipe
    expect(total).toBeLessThanOrEqual(1.4)
  })
})

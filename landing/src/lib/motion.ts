import type { Transition, Variants } from 'framer-motion'

/**
 * Motion tokens. The duration / ease / spring / variants below are reused
 * verbatim from docs/prompts/pos-ui-motion.prompt.md §2.2 so the landing
 * shares the POS feel. `cinematic` + `cursorSpring` are landing-only additions
 * (landing brief §1.5). Never inline magic numbers — import from here.
 */

export const duration = {
  micro: 0.08,
  short: 0.18,
  base: 0.26,
  long: 0.42,
}

// Cubic-bezier curves — tuned for the POS feel.
export const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number], // "expo out" — primary
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number], // overshoots slightly
}

export const spring = {
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } satisfies Transition,
  soft: { type: 'spring', stiffness: 180, damping: 24, mass: 1 } satisfies Transition,
  bouncy: { type: 'spring', stiffness: 300, damping: 18, mass: 0.9 } satisfies Transition,
}

export const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.short, ease: ease.out } },
  },
  riseIn: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  },
  popIn: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: spring.snappy },
  },
  stagger: {
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
  },
} satisfies Record<string, Variants>

/** Landing-only cinematic timings, in seconds (landing brief §1.5). */
export const cinematic = {
  curtainWordIn: 0.4,
  curtainHold: 0.3,
  curtainWipe: 0.7,
  crossDissolve: 0.8,
  headlineWordStagger: 0.04, // 40ms per word
  heroRevealDelay: 1.2, // begin as the loading curtain lifts
  subContentDelay: 0.8, // sub-line + CTA, after the headline
  scrollHintDelay: 3,
}

/** Custom cursor follow spring — snappy, near-zero lag (brief §1.5.6, tightened per request). */
export const cursorSpring = { stiffness: 900, damping: 50, mass: 0.3 }

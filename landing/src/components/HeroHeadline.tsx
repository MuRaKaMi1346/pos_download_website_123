import { type Variants, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { ease } from '../lib/motion'

interface Cta {
  label: string
  href: string
}

interface Props {
  eyebrow: string
  /** Display headline. Use "\n" to split into lines. */
  headline: string
  subline: string
  primary: Cta
  secondary: Cta
}

/**
 * Act I headline island (landing brief §1.5.3 / §6). Reveals only after the hero
 * video ends (`hero:reveal`, or the `__heroRevealed` flag). The whole block
 * settles in like a cinematic cross-dissolve — scale 0.97 -> 1 + fade, easing to
 * rest in sympathy with the video's dolly-in (§1.5.4) — while the headline words
 * rise in a gentle stagger. Reduced motion = a quick opacity-only fade.
 */
export default function HeroHeadline({ eyebrow, headline, subline, primary, secondary }: Props) {
  const reduced = useReducedMotion()
  const [revealed, setRevealed] = useState(false)
  const lines = headline.split('\n')

  useEffect(() => {
    if (window.__heroRevealed) {
      setRevealed(true)
      return
    }
    const onReveal = () => setRevealed(true)
    window.addEventListener('hero:reveal', onReveal, { once: true })
    const safety = window.setTimeout(() => setRevealed(true), 13000)
    return () => {
      window.removeEventListener('hero:reveal', onReveal)
      window.clearTimeout(safety)
    }
  }, [])

  const container: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: 0.12, staggerChildren: reduced ? 0 : 0.05 } },
  }
  // Words only translate; opacity comes from the settling block (no double-fade).
  const word: Variants = reduced
    ? { hidden: {}, visible: {} }
    : { hidden: { y: 18 }, visible: { y: 0, transition: { duration: 0.7, ease: ease.out } } }

  return (
    <motion.div
      className="w-full px-6 md:px-12 lg:px-20"
      style={{ transformOrigin: 'left center' }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
      transition={{ duration: reduced ? 0.3 : 0.9, ease: ease.inOut }}
    >
      <p className="mb-5 font-sans text-xs uppercase tracking-[0.35em] text-primary">{eyebrow}</p>

      <motion.h1
        initial="hidden"
        animate={revealed ? 'visible' : 'hidden'}
        variants={container}
        className="max-w-[15ch] font-display font-light leading-display tracking-tightest text-text"
        style={{ fontSize: 'clamp(40px, 6.5vw, 96px)' }}
      >
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className="block">
            {line.split(' ').map((token, wordIndex) => (
              <motion.span
                key={`${lineIndex}-${wordIndex}`}
                variants={word}
                className="inline-block whitespace-pre"
              >
                {token}{' '}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.h1>

      <div className="mt-8 max-w-xl">
        <p className="max-w-md text-pretty text-lg text-text-muted">{subline}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={primary.href}
            className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-fg shadow-card transition-transform duration-200 hover:-translate-y-0.5"
          >
            {primary.label}
          </a>
          <a
            href={secondary.href}
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface/80 px-7 py-3.5 text-sm font-medium text-text shadow-card backdrop-blur transition-colors duration-200 hover:bg-surface"
          >
            {secondary.label}
          </a>
        </div>
      </div>
    </motion.div>
  )
}

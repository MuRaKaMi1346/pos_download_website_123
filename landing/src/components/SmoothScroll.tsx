import Lenis from 'lenis'
import { useEffect } from 'react'

/**
 * Mounts Lenis inertial smooth scrolling once at the layout level
 * (landing brief §1.5.1). Renders nothing. Disabled entirely under
 * prefers-reduced-motion so native scrolling takes over.
 */
export default function SmoothScroll(): null {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return null
}

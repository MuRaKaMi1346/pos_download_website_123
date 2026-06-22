import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

import { cursorSpring } from '../lib/motion'

const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]'

/**
 * Custom desktop cursor (landing brief §1.5.6): a 14px ring that lags the
 * pointer with a spring and expands to 56px on hoverable surfaces. Disabled
 * entirely on touch devices (no fine pointer) so native interaction takes over.
 * Mounted once at the layout level.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [reduced, setReduced] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, cursorSpring)
  const springY = useSpring(y, cursorSpring)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setEnabled(true)
    const root = document.documentElement
    root.classList.add('has-custom-cursor')

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
    }
    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null
      setHovering(Boolean(target?.closest(HOVER_SELECTOR)))
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      root.classList.remove('has-custom-cursor')
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9990]"
      style={{ x: reduced ? x : springX, y: reduced ? y : springY }}
    >
      <motion.span
        className="cursor-ring block"
        style={{ translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: hovering ? 56 : 14,
          height: hovering ? 56 : 14,
          backgroundColor: hovering ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      />
    </motion.div>
  )
}

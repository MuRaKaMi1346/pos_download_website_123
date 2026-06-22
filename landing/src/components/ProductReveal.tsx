import type { MotionValue } from 'framer-motion'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Component, type ReactNode, Suspense, lazy, useEffect, useRef, useState } from 'react'

const ProductScene = lazy(() => import('./three/ProductScene'))

const DEFAULT_LABELS = [
  'สร้างมาเพื่อบาริสต้าคนเดียว', // Built for one barista
  'ออกแบบมาเพื่อบาริสต้านับพัน', // Designed for a thousand baristas
  'ทำงานต่อได้แม้ไม่มีอินเทอร์เน็ต', // Works without the internet
]

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Falls back to the real POS still if the WebGL scene fails to render. */
class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function StillFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <img
        src="/images/pos.webp"
        alt=""
        className="w-[min(90vw,940px)] rounded-2xl border border-white/10 shadow-2xl"
      />
    </div>
  )
}

function Label({
  index,
  total,
  progress,
  text,
}: {
  index: number
  total: number
  progress: MotionValue<number>
  text: string
}) {
  const seg = 1 / total
  const start = index * seg
  const end = start + seg
  const opacity = useTransform(
    progress,
    [start, start + seg * 0.25, end - seg * 0.25, end],
    [0, 1, 1, 0],
  )
  const y = useTransform(progress, [start, end], [24, -24])
  return (
    <motion.p
      style={{ opacity, y }}
      className="absolute max-w-[12ch] text-center font-display text-3xl leading-tight text-cream text-chromatic md:max-w-[16ch] md:text-5xl"
    >
      {text}
    </motion.p>
  )
}

/**
 * Act II island (landing brief §6). Computes scroll progress through the
 * 300vh sticky-pin section, lazy-loads the WebGL scene when within ~1.5
 * viewports, and cross-dissolves the capability labels. Reduced motion =
 * render nothing (the Astro static still stands in).
 */
export default function ProductReveal({ labels = DEFAULT_LABELS }: { labels?: string[] }) {
  const [enabled, setEnabled] = useState(false)
  const [near, setNear] = useState(false)
  const progress = useMotionValue(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setEnabled(true)

    const section = ref.current?.closest('[data-act2]')
    if (!(section instanceof HTMLElement)) return
    section.classList.add('act2-live')

    const update = () => {
      const total = section.offsetHeight - window.innerHeight
      const scrolled = -section.getBoundingClientRect().top
      progress.set(total > 0 ? clamp(scrolled / total, 0, 1) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '150% 0px' },
    )
    observer.observe(section)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      observer.disconnect()
      section.classList.remove('act2-live')
    }
  }, [progress])

  if (!enabled) return null

  return (
    <div ref={ref} className="absolute inset-0 z-10">
      {near && (
        <SceneBoundary fallback={<StillFallback />}>
          <Suspense fallback={null}>
            <ProductScene progress={progress} />
          </Suspense>
        </SceneBoundary>
      )}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center md:justify-start md:pl-[10vw]">
        {labels.map((label, index) => (
          <Label key={label} index={index} total={labels.length} progress={progress} text={label} />
        ))}
      </div>
    </div>
  )
}

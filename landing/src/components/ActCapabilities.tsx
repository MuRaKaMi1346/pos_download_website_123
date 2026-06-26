import type { MotionValue } from 'framer-motion'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface Copy {
  title: string
  desc: string
}
interface Capability extends Copy {
  image: string
  alt: string
}

// Locale-independent imagery (the real POS screens), zipped with localized copy.
const IMAGES: { image: string; alt: string }[] = [
  { image: '/images/pos.webp', alt: 'หน้าจอขายของ SmartBrew POS' },
  { image: '/images/pos-cart.webp', alt: 'ตะกร้าและการชำระเงิน' },
  { image: '/images/inventory.webp', alt: 'หน้าจัดการคลังวัตถุดิบ' },
  { image: '/images/ai-insights.webp', alt: 'หน้า AI Insights พยากรณ์ยอดขาย' },
  { image: '/images/kds.webp', alt: 'จอครัว (KDS) ของ SmartBrew POS' },
  { image: '/images/dashboard.webp', alt: 'แดชบอร์ดวิเคราะห์ยอดขาย' },
]

const DEFAULT_COPY: Copy[] = [
  { title: 'ขายไวทันทุกออเดอร์', desc: 'หน้าจอขายที่ออกแบบให้กดน้อยที่สุด เพิ่มสินค้า คิดเงิน ปิดบิล ได้ในไม่กี่วินาที' },
  { title: 'รับเงินได้ทุกช่องทาง', desc: 'เงินสด โอน บัตร และพร้อมเพย์ รวมในบิลเดียว แยกชำระได้ตามต้องการ' },
  { title: 'คุมสต๊อกอย่างแม่นยำ', desc: 'ตัดวัตถุดิบตามสูตรโดยอัตโนมัติ และเห็นของใกล้หมดก่อนจะขาดสต๊อก' },
  { title: 'พยากรณ์ยอดขายด้วย AI', desc: 'คาดการณ์ยอดขายและแนะนำการสั่งวัตถุดิบล่วงหน้า ด้วยโมเดลภาษาไทย' },
  { title: 'ทำงานต่อได้แม้เน็ตหลุด', desc: 'ขายและบันทึกออเดอร์ได้แม้ออฟไลน์ แล้วซิงก์ข้อมูลให้อัตโนมัติเมื่อกลับมาออนไลน์' },
  { title: 'ดูแลได้ทุกสาขา', desc: 'รวมยอดขายและสต๊อกของทุกสาขาไว้ในแดชบอร์ดเดียว เปรียบเทียบได้ทันที' },
]

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function Slide({
  index,
  total,
  progress,
  cap,
}: {
  index: number
  total: number
  progress: MotionValue<number>
  cap: Capability
}) {
  const seg = 1 / total
  const start = index * seg
  const end = start + seg
  const opacity = useTransform(
    progress,
    [start - seg * 0.25, start + seg * 0.15, end - seg * 0.15, end + seg * 0.25].map((v) =>
      clamp(v, 0, 1),
    ),
    [0, 1, 1, 0],
  )
  const imageY = useTransform(progress, [start, end], [40, -40])

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex items-center justify-center px-6">
      <div className="flex w-full max-w-6xl flex-col items-center gap-10 md:flex-row md:gap-16">
        <div className="flex-1">
          <p className="mb-4 font-sans text-sm tabular-nums tracking-[0.3em] text-primary">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
          <h2 className="font-display text-4xl font-light leading-tight tracking-tightest text-text md:text-6xl">
            {cap.title}
          </h2>
          <p className="mt-6 max-w-md text-pretty text-lg text-text-muted">{cap.desc}</p>
        </div>
        <motion.div style={{ y: imageY }} className="flex-1">
          <img
            src={cap.image}
            alt={cap.alt}
            className="w-full rounded-2xl border border-border shadow-card-hover"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

/**
 * Act III — Capability Story (landing brief §6). Sticky-pin whose scroll
 * progress cross-dissolves six capability slides. Reduced motion = vertical
 * stack. `copy` is locale text; imagery stays the same across locales.
 */
export default function ActCapabilities({ copy = DEFAULT_COPY }: { copy?: Copy[] }) {
  const reducedPref = useReducedMotion()
  const [stacked, setStacked] = useState(false)
  const [active, setActive] = useState(0)
  const progress = useMotionValue(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  const caps: Capability[] = IMAGES.map((img, index) => ({
    ...img,
    title: copy[index]?.title ?? DEFAULT_COPY[index].title,
    desc: copy[index]?.desc ?? DEFAULT_COPY[index].desc,
  }))

  // Phones get the same scroll-pinned cross-dissolve as desktop. Only reduced
  // motion falls back to a plain vertical stack (accessibility).
  useEffect(() => {
    setStacked(Boolean(reducedPref))
  }, [reducedPref])

  useEffect(() => {
    if (stacked) return
    const section = sectionRef.current
    if (!section) return

    const update = () => {
      const total = section.offsetHeight - window.innerHeight
      const scrolled = -section.getBoundingClientRect().top
      const p = total > 0 ? clamp(scrolled / total, 0, 1) : 0
      progress.set(p)
      setActive(clamp(Math.floor(p * caps.length), 0, caps.length - 1))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [stacked, progress, caps.length])

  if (stacked) {
    return (
      <section className="bg-bg">
        {caps.map((cap, index) => (
          <div
            key={cap.title}
            className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-12 md:flex-row md:gap-16 md:py-16"
          >
            <div className="flex-1">
              <p className="mb-4 font-sans text-sm tabular-nums tracking-[0.3em] text-primary">
                {String(index + 1).padStart(2, '0')} / {String(caps.length).padStart(2, '0')}
              </p>
              <h2 className="font-display text-4xl font-light leading-tight tracking-tightest text-text">
                {cap.title}
              </h2>
              <p className="mt-6 max-w-md text-pretty text-lg text-text-muted">{cap.desc}</p>
            </div>
            <div className="flex-1">
              <img
                src={cap.image}
                alt={cap.alt}
                className="w-full rounded-2xl border border-border shadow-card"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        ))}
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="relative bg-bg" style={{ height: `${caps.length * 100}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {caps.map((cap, index) => (
          <Slide key={cap.title} index={index} total={caps.length} progress={progress} cap={cap} />
        ))}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden="true">
          {caps.map((cap, index) => (
            <span
              key={cap.title}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === active ? 'w-8 bg-primary' : 'w-1.5 bg-text-muted/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

import type { Strings } from '../lib/i18n'

const DEFAULT_HEADING = 'เริ่มใช้งานใน 3 ขั้นตอน'
const DEFAULT_STEPS: Strings['how']['steps'] = [
  { title: 'ดาวน์โหลดและติดตั้ง', desc: 'รองรับ Windows, macOS และ Linux ติดตั้งเสร็จในไม่กี่นาที' },
  { title: 'ตั้งค่าเมนูและสาขา', desc: 'เพิ่มเมนู สูตร และผู้ใช้งาน แล้วพร้อมเปิดขายได้ทันที' },
  { title: 'เปิดร้านแล้วลุย', desc: 'ขายหน้าร้าน ดูยอดเรียลไทม์ และให้ AI ช่วยวางแผนสต๊อก' },
]

function Step({
  title,
  desc,
  index,
  reduce,
}: {
  title: string
  desc: string
  index: number
  reduce: boolean
}) {
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative"
    >
      <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface font-display text-lg text-primary shadow-card">
        {String(index + 1).padStart(2, '0')}
      </div>
      <h3 className="mb-2 font-display text-2xl text-text">{title}</h3>
      <p className="text-text-muted">{desc}</p>
    </motion.li>
  )
}

/** Act V — How it works (landing brief §6). Steps along a line that draws on scroll. */
export default function HowItWorks({
  heading = DEFAULT_HEADING,
  steps = DEFAULT_STEPS,
}: {
  heading?: string
  steps?: Strings['how']['steps']
}) {
  const reduce = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'center center'] })
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section ref={ref} className="bg-bg px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-16 text-center font-display text-4xl font-light tracking-tightest text-text md:text-5xl">
          {heading}
        </h2>
        <div className="relative">
          <div className="absolute inset-x-7 top-7 hidden md:block" aria-hidden="true">
            <div className="h-px w-full bg-border" />
            <motion.div
              className="absolute inset-0 h-px origin-left bg-primary"
              style={{ scaleX: reduce ? 1 : scaleX }}
            />
          </div>
          <ol className="grid gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
              <Step key={step.title} title={step.title} desc={step.desc} index={index} reduce={reduce} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

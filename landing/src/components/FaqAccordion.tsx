import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'

import { ease } from '../lib/motion'

export interface Faq {
  q: string
  a: string
}

const DEFAULT_FAQS: Faq[] = [
  {
    q: 'ใช้งานแบบออฟไลน์ได้จริงไหม',
    a: 'ได้ SmartBrew POS ทำงานแบบ local-first ขายและบันทึกออเดอร์ได้แม้เน็ตหลุด แล้วซิงก์ข้อมูลอัตโนมัติเมื่อกลับมาออนไลน์',
  },
  {
    q: 'รองรับอุปกรณ์อะไรบ้าง',
    a: 'รองรับ Windows, macOS และ Linux รวมถึงแท็บเล็ตจอสัมผัส ออกแบบให้กดง่ายเหมาะกับการใช้งานหน้าร้าน',
  },
  {
    q: 'ข้อมูลของร้านปลอดภัยแค่ไหน',
    a: 'ข้อมูลถูกเก็บในเครื่องของคุณเป็นหลัก และเข้ารหัสระหว่างการซิงก์ เราเก็บข้อมูลส่วนบุคคลให้น้อยที่สุดเท่าที่จำเป็น',
  },
  {
    q: 'มีค่าใช้จ่ายแอบแฝงหรือไม่',
    a: 'จ่ายครั้งเดียวจบ เป็นเจ้าของถาวร ไม่มีค่ารายเดือนหรือค่าธรรมเนียมแอบแฝง',
  },
]

function FaqItem({
  item,
  isOpen,
  onToggle,
  reduce,
}: {
  item: Faq
  isOpen: boolean
  onToggle: () => void
  reduce: boolean
}) {
  const id = useId()
  return (
    <li>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-lg text-text md:text-xl">{item.q}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 text-text-muted transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <motion.div
        id={id}
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.26, ease: ease.out }}
        className="overflow-hidden"
      >
        <p className="pb-5 pr-9 text-pretty text-text-muted">{item.a}</p>
      </motion.div>
    </li>
  )
}

/** Act V — FAQ (landing brief §6). Accessible disclosure list, one open at a time. */
export default function FaqAccordion({ items = DEFAULT_FAQS }: { items?: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const reduce = useReducedMotion() ?? false
  return (
    <ul className="mx-auto max-w-3xl divide-y divide-border">
      {items.map((item, index) => (
        <FaqItem
          key={item.q}
          item={item}
          isOpen={open === index}
          onToggle={() => setOpen(open === index ? null : index)}
          reduce={reduce}
        />
      ))}
    </ul>
  )
}

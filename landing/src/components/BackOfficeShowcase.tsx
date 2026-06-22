import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import type { Locale } from '../lib/i18n'
import { ease } from '../lib/motion'

interface TabCopy {
  label: string
  title: string
  desc: string
}
interface Tab {
  key: string
  img: string
  th: TabCopy
  en: TabCopy
}

const TABS: Tab[] = [
  {
    key: 'products',
    img: '/images/products.webp',
    th: { label: 'สินค้า / เมนู', title: 'จัดการเมนูพร้อมรูป', desc: 'เพิ่ม–แก้ ราคา ต้นทุน หมวด บาร์โค้ด และอัปโหลดรูปจากเครื่องได้ในคลิกเดียว' },
    en: { label: 'Products', title: 'Manage your menu with photos', desc: 'Add or edit price, cost, category and barcode — and upload images straight from your computer.' },
  },
  {
    key: 'orders',
    img: '/images/orders.webp',
    th: { label: 'บิล / ออเดอร์', title: 'ดูบิลทุกใบในที่เดียว', desc: 'กรองตามสถานะ ชำระแล้ว / พักไว้ / ยกเลิก เปิดดูรายละเอียดและจัดการวงจรบิลได้ครบ' },
    en: { label: 'Orders', title: 'Every bill in one place', desc: 'Filter by paid / parked / void, open details, and manage the full bill lifecycle.' },
  },
  {
    key: 'recipes',
    img: '/images/recipes.webp',
    th: { label: 'สูตร (BOM)', title: 'ผูกสูตรให้ตัดสต๊อกเอง', desc: 'กำหนดว่าหนึ่งแก้วใช้วัตถุดิบอะไรเท่าไร แล้วระบบตัดสต๊อกให้อัตโนมัติทุกครั้งที่ขาย' },
    en: { label: 'Recipes (BOM)', title: 'Recipes that deplete stock for you', desc: 'Define what each item uses; stock is deducted automatically on every sale.' },
  },
  {
    key: 'inventory',
    img: '/images/inventory.webp',
    th: { label: 'คลังสต๊อก', title: 'คุมของไม่ให้ขาดมือ', desc: 'ดูคงเหลือ รับของเข้า และตั้งจุดสั่งซื้อซ้ำ (reorder point) ให้เตือนก่อนของจะหมด' },
    en: { label: 'Inventory', title: 'Never run out', desc: 'See stock on hand, receive deliveries, and set reorder points that warn you early.' },
  },
  {
    key: 'modifiers',
    img: '/images/modifiers.webp',
    th: { label: 'กลุ่มตัวเลือก', title: 'ตัวเลือกเสริมที่ยืดหยุ่น', desc: 'หวานน้อย เพิ่มช็อต ชนิดนม — กำหนดได้ว่าเลือกได้กี่อย่าง และบังคับเลือกหรือไม่' },
    en: { label: 'Modifiers', title: 'Flexible add-ons', desc: 'Sweetness, extra shots, milk type — set how many can be picked and what is required.' },
  },
  {
    key: 'discounts',
    img: '/images/discounts.webp',
    th: { label: 'ส่วนลด', title: 'ส่วนลดที่ควบคุมได้', desc: 'สร้างส่วนลดแบบบาทหรือเปอร์เซ็นต์ และกำหนดว่าต้องให้แอดมินอนุมัติหรือไม่' },
    en: { label: 'Discounts', title: 'Discounts you control', desc: 'Create fixed or percentage discounts, and require admin approval where you need it.' },
  },
  {
    key: 'cash',
    img: '/images/cash-drawer.webp',
    th: { label: 'ลิ้นชักเงินสด', title: 'เงินเข้า–ออก ครบทุกบาท', desc: 'บันทึกเติมเงินทอน/เบิกจ่ายนอกการขาย ปิดกะแล้วนับเงินจริงเทียบกับยอดที่ควรมี' },
    en: { label: 'Cash drawer', title: 'Account for every baht', desc: 'Log paid-in / paid-out outside sales; at close, count cash against the expected total.' },
  },
  {
    key: 'settings',
    img: '/images/settings.webp',
    th: { label: 'ตั้งค่า', title: 'ปรับให้เข้ากับร้านคุณ', desc: 'ภาษี (VAT) ค่าบริการ การปัดเศษ แต้มสะสม และข้อมูลร้าน ตั้งค่าได้ครบในที่เดียว' },
    en: { label: 'Settings', title: 'Tune it to your shop', desc: 'VAT, service charge, rounding, loyalty points and shop details — all in one place.' },
  },
]

const HEAD = {
  th: { heading: 'หลังร้านครบ ทั้งระบบ', sub: 'ไม่ใช่แค่เครื่องคิดเงิน — SmartBrew คือระบบจัดการร้านเต็มรูปแบบ คลิกดูทีละหน้าได้เลย' },
  en: { heading: 'A complete back office', sub: 'Not just a cash register — SmartBrew is a full shop-management system. Click through each screen.' },
}

const ROTATE_MS = 4500

export default function BackOfficeShowcase({ lang = 'th' }: { lang?: Locale }) {
  const reduce = useReducedMotion() ?? false
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const head = HEAD[lang]
  const tab = TABS[active]
  const copy = tab[lang]
  const tablistRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduce || paused) return
    const id = window.setTimeout(() => setActive((i) => (i + 1) % TABS.length), ROTATE_MS)
    return () => window.clearTimeout(id)
  }, [active, paused, reduce])

  return (
    <section id="backoffice" className="scroll-mt-24 bg-bg px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl font-display text-4xl font-light leading-tight tracking-tightest text-text md:text-5xl">
          {head.heading}
        </h2>
        <p className="mt-4 max-w-xl text-lg text-text-muted">{head.sub}</p>

        <div
          className="mt-12 grid gap-8 md:grid-cols-[260px_1fr]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Tab list — vertical on desktop, horizontal scroll on mobile */}
          <div
            ref={tablistRef}
            role="tablist"
            aria-label={head.heading}
            className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0"
          >
            {TABS.map((item, index) => {
              const selected = index === active
              return (
                <button
                  key={item.key}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => setActive(index)}
                  className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl border px-4 py-3 text-left text-sm transition-colors duration-200 md:w-full ${
                    selected
                      ? 'border-primary bg-surface font-medium text-text shadow-card'
                      : 'border-transparent text-text-muted hover:bg-surface-2 hover:text-text'
                  }`}
                >
                  <span className="font-display text-xs tabular-nums text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item[lang].label}
                </button>
              )
            })}
          </div>

          {/* Preview window */}
          <div role="tabpanel" className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card-hover">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-danger" />
                <span className="h-3 w-3 rounded-full bg-warning" />
                <span className="h-3 w-3 rounded-full bg-success" />
                <span className="ml-3 truncate text-xs text-text-muted">SmartBrew POS · {copy.label}</span>
              </div>
              <div className="relative aspect-[16/10] bg-surface-2">
                <AnimatePresence initial={false}>
                  <motion.img
                    key={tab.key}
                    src={tab.img}
                    alt={copy.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-top"
                    initial={reduce ? false : { opacity: 0, scale: 1.01 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.995 }}
                    transition={{ duration: 0.45, ease: ease.out }}
                  />
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab.key}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: ease.out }}
                className="mt-6"
              >
                <h3 className="font-display text-2xl text-text">{copy.title}</h3>
                <p className="mt-2 max-w-2xl text-text-muted">{copy.desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

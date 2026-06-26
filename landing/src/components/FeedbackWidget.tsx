import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'

import type { Strings } from '../lib/i18n'

const API_BASE =
  (import.meta.env.PUBLIC_API_BASE as string | undefined) ?? 'http://localhost:8000/api/v1'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const DEFAULT_COPY: Strings['feedback'] = {
  button: 'ส่งความเห็น',
  title: 'บอกความเห็นของคุณ',
  subtitle: 'เจอบั๊ก มีไอเดีย หรืออยากติชม บอกเราได้เลย แนบรูปได้ด้วย',
  ratingLabel: 'ให้คะแนน (ถ้ามี)',
  star: 'ดาว',
  messageLabel: 'ความคิดเห็น',
  messagePlaceholder: 'อยากบอกอะไรกับเรา…',
  emailLabel: 'อีเมล (ถ้าต้องการให้ติดต่อกลับ)',
  emailPlaceholder: 'you@cafe.com',
  imageLabel: 'แนบรูป (ถ้ามี)',
  imageAdd: 'เลือกรูป',
  imageRemove: 'ลบรูป',
  imageHint: 'PNG, JPG, WebP หรือ GIF · ไม่เกิน 5MB',
  submit: 'ส่งความเห็น',
  sending: 'กำลังส่ง…',
  success: 'ขอบคุณสำหรับความเห็น!',
  successNote: 'เราอ่านทุกข้อความจริง ๆ',
  errorRequired: 'กรุณากรอกความคิดเห็นก่อนส่ง',
  errorImageType: 'รองรับเฉพาะไฟล์ภาพ (PNG, JPG, WebP, GIF)',
  errorImageSize: 'ไฟล์ใหญ่เกินไป (ไม่เกิน 5MB)',
  error: 'ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
  close: 'ปิด',
}

type Status = 'idle' | 'loading' | 'success' | 'error'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Floating feedback button + accessible modal form (landing brief §10). Lets a
 * visitor leave a rating, a message and an optional screenshot; posts multipart
 * to the FastAPI backend. Focus-trapped, ESC-dismissable, scroll-locked, and
 * reduced-motion aware.
 */
export default function FeedbackWidget({ copy = DEFAULT_COPY }: { copy?: Strings['feedback'] }) {
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const panelRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const successTimerRef = useRef<number | undefined>(undefined)
  const titleId = useId()
  const descId = useId()
  const errorId = useId()
  const messageId = useId()

  // Object-URL lifecycle for the preview thumbnail.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Modal a11y: scroll lock, focus management, ESC + focus trap.
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>('[data-autofocus]')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus?.()
    }
  }, [open])

  function reset() {
    setRating(0)
    setMessage('')
    setEmail('')
    setFile(null)
    setError('')
    setStatus('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function close() {
    window.clearTimeout(successTimerRef.current)
    setOpen(false)
    // Clear any error/success state for the next open, but keep the draft.
    if (status === 'success') reset()
    else setStatus('idle')
  }

  // Clear the success auto-close timer if the widget unmounts.
  useEffect(() => () => window.clearTimeout(successTimerRef.current), [])

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0]
    if (!picked) return
    if (!ALLOWED_TYPES.includes(picked.type)) {
      setError(copy.errorImageType)
      event.target.value = ''
      return
    }
    if (picked.size > MAX_IMAGE_BYTES) {
      setError(copy.errorImageSize)
      event.target.value = ''
      return
    }
    setError('')
    setFile(picked)
  }

  function removeFile() {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (message.trim().length === 0) {
      setStatus('error')
      setError(copy.errorRequired)
      return
    }

    setStatus('loading')
    setError('')
    const form = new FormData()
    form.append('message', message.trim())
    if (rating > 0) form.append('rating', String(rating))
    if (email.trim()) form.append('email', email.trim())
    if (file) form.append('image', file, file.name)

    try {
      const response = await fetch(`${API_BASE}/feedback/`, { method: 'POST', body: form })
      if (!response.ok) throw new Error(String(response.status))
      setStatus('success')
      successTimerRef.current = window.setTimeout(() => close(), 2400)
    } catch {
      setStatus('error')
      setError(copy.error)
    }
  }

  const overlayMotion = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 24, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 12, scale: 0.98 },
      }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full border border-cream/15 bg-primary px-4 py-3 text-sm font-medium text-primary-fg shadow-card-hover transition-transform duration-200 hover:-translate-y-0.5"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        aria-haspopup="dialog"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        {copy.button}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9500] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            {...overlayMotion}
            transition={{ duration: reduced ? 0.15 : 0.2 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close()
            }}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-card-hover"
              {...panelMotion}
              transition={{ duration: reduced ? 0.15 : 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={close}
                aria-label={copy.close}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>

              {status === 'success' ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <p className="mt-5 font-display text-2xl text-text">{copy.success}</p>
                  <p className="mt-2 text-sm text-text-muted">{copy.successNote}</p>
                </div>
              ) : (
                <>
                  <h2 id={titleId} className="pr-8 font-display text-2xl font-light tracking-tightest text-text">
                    {copy.title}
                  </h2>
                  <p id={descId} className="mt-2 text-sm text-text-muted">
                    {copy.subtitle}
                  </p>

                  <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-text">{copy.ratingLabel}</legend>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            data-autofocus={value === 1 ? '' : undefined}
                            onClick={() => setRating((current) => (current === value ? 0 : value))}
                            aria-pressed={rating >= value}
                            aria-label={`${value} ${copy.star}`}
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-2xl transition-colors hover:bg-surface-2"
                          >
                            <svg
                              className={`h-7 w-7 ${rating >= value ? 'text-warning' : 'text-border'}`}
                              viewBox="0 0 24 24"
                              fill={rating >= value ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 21l-5.8 3 1.1-6.5L2.6 9.3l6.5-.9z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div>
                      <label htmlFor={messageId} className="mb-2 block text-sm font-medium text-text">
                        {copy.messageLabel} <span className="text-danger">*</span>
                      </label>
                      <textarea
                        id={messageId}
                        required
                        rows={4}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder={copy.messagePlaceholder}
                        maxLength={5000}
                        aria-describedby={error ? errorId : undefined}
                        className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted focus:border-primary"
                      />
                    </div>

                    <div>
                      <span className="mb-2 block text-sm font-medium text-text">{copy.imageLabel}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={onPickFile}
                        className="sr-only"
                        id={`${messageId}-file`}
                      />
                      {previewUrl && file ? (
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
                          <img
                            src={previewUrl}
                            alt={file.name}
                            className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-text">{file.name}</p>
                            <p className="text-xs text-text-muted">{formatSize(file.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="shrink-0 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                          >
                            {copy.imageRemove}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
                          >
                            <svg className="h-5 w-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                            </svg>
                            {copy.imageAdd}
                          </button>
                          <p className="mt-2 text-xs text-text-muted">{copy.imageHint}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`${messageId}-email`} className="mb-2 block text-sm font-medium text-text">
                        {copy.emailLabel}
                      </label>
                      <input
                        id={`${messageId}-email`}
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder={copy.emailPlaceholder}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted focus:border-primary"
                      />
                    </div>

                    {error && (
                      <p id={errorId} role="alert" className="text-sm text-danger">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-fg shadow-card transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {status === 'loading' ? copy.sending : copy.submit}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

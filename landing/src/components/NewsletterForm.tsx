import { useState } from 'react'
import { z } from 'zod'

import type { Strings } from '../lib/i18n'

const schema = z.object({ email: z.email() })

const API_BASE =
  (import.meta.env.PUBLIC_API_BASE as string | undefined) ?? 'http://localhost:8000/api/v1'

const DEFAULT_COPY: Strings['newsletter'] = {
  label: 'อีเมลของคุณ',
  placeholder: 'you@cafe.com',
  submit: 'รับข่าวสาร',
  sending: 'กำลังส่ง…',
  success: 'ขอบคุณ! เราจะส่งข่าวสารและฟีเจอร์ใหม่ถึงคุณ',
  invalid: 'กรุณากรอกอีเมลให้ถูกต้อง',
  error: 'ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
}

type Status = 'idle' | 'loading' | 'success' | 'error'

/**
 * Newsletter capture (landing brief §6 / §10). Client-validates with Zod and
 * posts to the FastAPI backend; the server validates + rate-limits again.
 */
export default function NewsletterForm({ copy = DEFAULT_COPY }: { copy?: Strings['newsletter'] }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!schema.safeParse({ email }).success) {
      setStatus('error')
      setMessage(copy.invalid)
      return
    }

    setStatus('loading')
    setMessage('')
    try {
      const response = await fetch(`${API_BASE}/newsletter/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error(String(response.status))
      setStatus('success')
      setMessage(copy.success)
      setEmail('')
    } catch {
      setStatus('error')
      setMessage(copy.error)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-md">
      <label htmlFor="newsletter-email" className="sr-only">
        {copy.label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder={copy.placeholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby="newsletter-message"
          className="w-full rounded-full border border-cream/30 bg-white/5 px-5 py-3.5 text-cream placeholder:text-cream/55 focus:border-cream/60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 rounded-full bg-cream px-6 py-3.5 text-sm font-medium text-espresso transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === 'loading' ? copy.sending : copy.submit}
        </button>
      </div>
      <p
        id="newsletter-message"
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-[1.25rem] text-sm ${
          status === 'error' ? 'text-warning' : 'text-cream/80'
        }`}
      >
        {message}
      </p>
    </form>
  )
}

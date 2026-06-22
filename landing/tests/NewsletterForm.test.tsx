import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import NewsletterForm from '../src/components/NewsletterForm'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('NewsletterForm', () => {
  it('rejects an invalid email without calling the API', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    render(<NewsletterForm />)
    fireEvent.change(screen.getByLabelText('อีเมลของคุณ'), { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button'))
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(screen.getByText('กรุณากรอกอีเมลให้ถูกต้อง')).toBeInTheDocument()
  })

  it('posts a valid email and shows success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as Response)
    render(<NewsletterForm />)
    fireEvent.change(screen.getByLabelText('อีเมลของคุณ'), { target: { value: 'fan@cafe.com' } })
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(screen.getByText(/ขอบคุณ/)).toBeInTheDocument())
  })
})

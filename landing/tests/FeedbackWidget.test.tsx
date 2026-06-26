import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import FeedbackWidget from '../src/components/FeedbackWidget'

beforeEach(() => {
  // jsdom doesn't implement object URLs used by the image preview.
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview')
  globalThis.URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function open() {
  fireEvent.click(screen.getByRole('button', { name: /ส่งความเห็น/ }))
  return screen.getByRole('dialog')
}

describe('FeedbackWidget', () => {
  it('opens the dialog from the floating button', () => {
    render(<FeedbackWidget />)
    const dialog = open()
    expect(within(dialog).getByText('บอกความเห็นของคุณ')).toBeInTheDocument()
  })

  it('requires a message before submitting', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    render(<FeedbackWidget />)
    const dialog = open()
    fireEvent.click(within(dialog).getByRole('button', { name: 'ส่งความเห็น' }))
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(within(dialog).getByRole('alert')).toHaveTextContent('กรุณากรอกความคิดเห็นก่อนส่ง')
  })

  it('submits the message and shows a thank-you', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as Response)
    render(<FeedbackWidget />)
    const dialog = open()
    fireEvent.change(within(dialog).getByLabelText(/ความคิดเห็น/), { target: { value: 'ใช้ดีมาก' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'ส่งความเห็น' }))

    await waitFor(() => expect(screen.getByText('ขอบคุณสำหรับความเห็น!')).toBeInTheDocument())
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const body = fetchSpy.mock.calls[0][1]?.body as FormData
    expect(body.get('message')).toBe('ใช้ดีมาก')
  })

  it('rejects a non-image file', () => {
    const { container } = render(<FeedbackWidget />)
    open()
    const input = container.querySelector('input[type=file]') as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [new File(['x'], 'notes.pdf', { type: 'application/pdf' })] },
    })
    expect(screen.getByRole('alert')).toHaveTextContent('รองรับเฉพาะไฟล์ภาพ')
  })

  it('previews a chosen image and can remove it', async () => {
    const { container } = render(<FeedbackWidget />)
    open()
    const input = container.querySelector('input[type=file]') as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [new File(['imgdata'], 'shot.png', { type: 'image/png' })] },
    })
    expect(await screen.findByText('shot.png')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'ลบรูป' }))
    await waitFor(() => expect(screen.queryByText('shot.png')).not.toBeInTheDocument())
  })

  it('closes on the close button', async () => {
    render(<FeedbackWidget />)
    const dialog = open()
    fireEvent.click(within(dialog).getByRole('button', { name: 'ปิด' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})

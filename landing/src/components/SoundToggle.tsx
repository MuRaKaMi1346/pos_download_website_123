import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'smartbrew-sound'

/**
 * Ambient sound toggle (landing brief §1.5.7). Default muted; choice persists in
 * localStorage. Never autoplays under prefers-reduced-motion, even if previously
 * enabled. Degrades gracefully if the audio track is absent or autoplay is blocked.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce && localStorage.getItem(STORAGE_KEY) === 'on') setOn(true)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (on) {
        audio.volume = 0.45
        const played = audio.play()
        if (played && typeof played.catch === 'function') played.catch(() => {})
      } else {
        audio.pause()
      }
    } catch {
      /* media unavailable (missing file, autoplay blocked, or test env) */
    }
  }, [on])

  function toggle() {
    setOn((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
      } catch {
        /* storage unavailable */
      }
      return next
    })
  }

  return (
    <>
      <audio ref={audioRef} loop preload="none" aria-hidden="true">
        <source src="/audio/ambient.opus" type="audio/ogg; codecs=opus" />
        <source src="/audio/ambient.mp3" type="audio/mpeg" />
      </audio>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? 'ปิดเสียงบรรยากาศ' : 'เปิดเสียงบรรยากาศ'}
        className="fixed right-4 top-4 z-[9000] hidden h-11 w-11 items-center justify-center rounded-full border border-cream/25 bg-espresso/75 text-cream backdrop-blur transition-colors hover:bg-espresso/90 md:flex"
      >
        {on ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
      </button>
    </>
  )
}

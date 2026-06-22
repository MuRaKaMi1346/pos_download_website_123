/**
 * Drives the loading curtain (landing brief §1.5.5). The wipe/fade animation
 * itself is CSS (so it runs at first paint, before hydration); this only
 * removes the element when it finishes and flags reduced motion.
 */

const SAFETY_MS = 1500

export function initCurtain(): void {
  const curtain = document.getElementById('loading-curtain')
  if (!curtain) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) curtain.classList.add('curtain--reduced')

  const dismiss = (): void => {
    if (!curtain.isConnected) return
    curtain.remove()
    document.documentElement.classList.add('curtain-done')
  }

  // The wipe (or reduced fade) animation lives on the curtain element itself;
  // the wordmark intro is on a child, so filter by event target.
  curtain.addEventListener('animationend', (event) => {
    if (event.target === curtain) dismiss()
  })

  // Safety net if animationend never fires (e.g. the tab was backgrounded).
  window.setTimeout(dismiss, SAFETY_MS)
}

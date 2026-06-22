/**
 * Lightweight scroll-reveal. Any element with `data-reveal` fades + rises into
 * view once. Stagger children with inline `style="transition-delay:..."`.
 * Reduced motion is handled in CSS (elements simply start visible).
 */
export function initReveal(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
  if (els.length === 0) return

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'))
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
  )
  els.forEach((el) => io.observe(el))
}

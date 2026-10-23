import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

export default function PageReveal({ children }) {
  const scopeRef = useRef(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(scopeRef)
      const timeline = gsap.timeline({ defaults: { duration: 0.42, ease: 'power3.out', clearProps: 'transform,opacity,visibility' } })
      const cards = select('.metric-card')
      const panels = select('.setup-panel, .preparation-aside > *, .question-panel, .assessment-aside > *, .performance-panel, .submission-panel, .workspace-status-panel')

      timeline.from(select('.page-heading'), { autoAlpha: 0, y: 9 })
      if (cards.length) timeline.from(cards, { autoAlpha: 0, y: 12, stagger: 0.045 }, 0.04)
      if (panels.length) timeline.from(panels, { autoAlpha: 0, y: 14, stagger: 0.055 }, 0.09)
      const startBar = select('.start-bar')
      if (startBar.length) timeline.from(startBar, { autoAlpha: 0, y: 8 }, 0.16)
    }, scopeRef)

    return () => media.revert()
  }, [])

  return <div ref={scopeRef} className="page-content">{children}</div>
}

import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import gsap from 'gsap'

export default function SegmentedProgress({ value, segments = 24, label = 'Progress' }) {
  const scopeRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const clampedValue = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
  const activeCount = Math.round(clampedValue / 100 * segments)

  useLayoutEffect(() => {
    if (reducedMotion || activeCount === 0) return undefined
    const context = gsap.context(() => {
      gsap.fromTo('[data-active="true"]', { scaleY: 0.4, opacity: 0.4 }, { scaleY: 1, opacity: 1, duration: 0.35, stagger: 0.012, ease: 'power2.out', clearProps: 'transform,opacity' })
    }, scopeRef)
    return () => context.revert()
  }, [activeCount, reducedMotion])

  return (
    <div ref={scopeRef} className="segmented-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={clampedValue} aria-valuetext={`${Math.round(clampedValue)}% complete`}>
      {Array.from({ length: segments }, (_, index) => <span key={index} data-active={index < activeCount} />)}
    </div>
  )
}

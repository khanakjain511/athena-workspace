import { useEffect, useRef, useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import Icon from '../Icon'
import MotionButton from '../MotionButton'
import { layoutSpring } from '../../animation/transitions'

function HookRail({ y }) {
  const reducedMotion = useReducedMotion()
  const travel = reducedMotion ? { duration: 0 } : layoutSpring

  return (
    <motion.span className="hook-rail" aria-hidden="true" initial={false} animate={{ opacity: y === null ? 0 : 1 }} transition={{ duration: reducedMotion ? 0 : 0.16 }}>
      <motion.span className="hook-rail-line" initial={false} animate={{ height: Math.max(0, (y ?? 0) - 6) }} transition={travel} />
      <motion.svg className="hook-rail-curve" initial={false} animate={{ top: (y ?? 0) - 6 }} transition={travel} width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M0.5 0a6 6 0 0 0 6 6H12" stroke="currentColor" /></motion.svg>
    </motion.span>
  )
}

export default function HookSidebar({ items, value, onChange, disabled = false, label = 'Workspace navigation' }) {
  const listRef = useRef(null)
  const itemRefs = useRef([])
  const [centers, setCenters] = useState([])
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const list = listRef.current
    if (!list) return undefined
    const observer = new ResizeObserver(() => {
      setCenters(itemRefs.current.map((item) => item ? item.offsetTop + item.offsetHeight / 2 : 0))
    })
    observer.observe(list)
    return () => observer.disconnect()
  }, [items.length])

  return (
    <nav aria-label={label} data-slot="hook-sidebar">
      <LayoutGroup id="assessment-navigation">
        <div className="hook-list">
          <HookRail y={centers[value] ?? null} />
          <ol ref={listRef} className="stage-list">
          {items.map((item, index) => (
            <li ref={(node) => { itemRefs.current[index] = node }} key={item.id} className={`stage ${index === value ? 'active' : ''}`}>
              {index === value && <motion.span className="stage-highlight" layoutId="active-stage" transition={reducedMotion ? { duration: 0 } : layoutSpring} aria-hidden="true" />}
              <MotionButton className="stage-content stage-button" aria-current={index === value ? 'page' : undefined} disabled={disabled} onClick={() => onChange(index)}><Icon name={item.icon} size={19} /><strong>{item.label}</strong></MotionButton>
            </li>
          ))}
          </ol>
        </div>
      </LayoutGroup>
    </nav>
  )
}

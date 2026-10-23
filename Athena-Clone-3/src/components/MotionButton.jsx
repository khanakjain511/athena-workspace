import { motion, useReducedMotion } from 'framer-motion'
import { controlSpring } from '../animation/transitions'

export default function MotionButton({ disabled, children, pressDepth = 0, ...props }) {
  const reducedMotion = useReducedMotion()
  const interactive = !disabled && !reducedMotion

  return (
    <motion.button
      type="button"
      {...props}
      disabled={disabled}
      whileHover={interactive ? { y: -1 } : undefined}
      whileTap={interactive ? { y: pressDepth, scale: 0.975 } : undefined}
      transition={controlSpring}
    >
      {children}
    </motion.button>
  )
}

import MotionButton from '../MotionButton'

export default function CandyButton({ children, className = '', variant = 'azure', leftIcon, rightIcon, ...props }) {
  return (
    <MotionButton {...props} className={`candy-button candy-${variant} ${className}`} pressDepth={2}>
      <span className="candy-content">
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </MotionButton>
  )
}

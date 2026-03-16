import { useScrollReveal } from '../hooks/useScrollReveal'

type Direction = 'up' | 'left' | 'right' | 'scale'

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: Direction
  delay?: number
  className?: string
  style?: React.CSSProperties
  threshold?: number
}

const directionClass: Record<Direction, string> = {
  up: 'reveal-up',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
  style,
  threshold = 0.15,
}: ScrollRevealProps) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>(threshold)

  return (
    <div
      ref={ref}
      className={`${inView ? directionClass[direction] : ''} ${className}`}
      style={{
        opacity: inView ? undefined : 0,
        animationDelay: `${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

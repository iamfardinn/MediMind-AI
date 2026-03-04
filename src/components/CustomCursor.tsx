import { useEffect, useRef } from 'react'

/*
 * CursorGlow — A soft blue glow that follows the mouse on the background.
 * Uses simple divs with CSS radial-gradient.
 * No WebGL, no canvas, no black background issues.
 * Native cursor is untouched — background only.
 * Hidden on touch / mobile devices.
 */
export default function CustomCursor() {
  const glowRef = useRef<HTMLDivElement>(null)
  const glow2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return

    const glow = glowRef.current
    const glow2 = glow2Ref.current
    if (!glow || !glow2) return

    const pos = { x: -500, y: -500 }
    const pos2 = { x: -500, y: -500 }
    const target = { x: -500, y: -500 }
    let raf = 0

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    const animate = () => {
      // Primary glow — smooth follow
      pos.x += (target.x - pos.x) * 0.08
      pos.y += (target.y - pos.y) * 0.08
      glow.style.transform = `translate(${pos.x - 300}px, ${pos.y - 300}px)`

      // Secondary glow — slower follow for depth
      pos2.x += (target.x - pos2.x) * 0.04
      pos2.y += (target.y - pos2.y) * 0.04
      glow2.style.transform = `translate(${pos2.x - 200}px, ${pos2.y - 200}px)`

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null
  }

  return (
    <>
      {/* Primary blue glow */}
      <div
        ref={glowRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(99,102,241,0.08) 35%, rgba(139,92,246,0.03) 60%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 1,
          willChange: 'transform',
        }}
      />
      {/* Secondary deeper glow — trails behind */}
      <div
        ref={glow2Ref}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(99,102,241,0.05) 45%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 1,
          willChange: 'transform',
        }}
      />
    </>
  )
}

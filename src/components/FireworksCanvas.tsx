import { useEffect, useRef, type FC } from 'react'
import { sound } from '../utils/sound'

interface FireworksCanvasProps {
  interactive?: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  alpha: number
  decay: number
  size: number
}

const FESTIVE_COLORS = [
  '#ffbe0b',
  '#fb5607',
  '#ff006e',
  '#8338ec',
  '#3a86ff',
  '#06d6a0',
  '#ffd166',
  '#ef476f',
]

export const FireworksCanvas: FC<FireworksCanvasProps> = ({ interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number | null>(null)

  const spawnBurst = (x: number, y: number, count = 35) => {
    sound.playFirework()
    const color = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)]
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const speed = Math.random() * 4 + 2
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        size: Math.random() * 3 + 2,
      })
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Auto fireworks every 1.5 seconds
    const interval = setInterval(() => {
      const rx = Math.random() * (width * 0.8) + width * 0.1
      const ry = Math.random() * (height * 0.4) + height * 0.1
      spawnBurst(rx, ry, 30)
    }, 1400)

    // Initial burst
    spawnBurst(width / 2, height * 0.25, 45)

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.06 // gravity
        p.vx *= 0.98 // air friction
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      clearInterval(interval)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spawnBurst(x, y, 40)
  }

  return (
    <canvas
      ref={canvasRef}
      className="fireworks-canvas"
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 1,
      }}
    />
  )
}

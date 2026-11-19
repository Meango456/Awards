import React, { useEffect, useRef } from 'react'

/** Poussière d'or flottante, en canvas. Désactivée si l'utilisateur préfère moins d'animations. */
export default function Particles() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let raf
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const count = w < 640 ? 38 : 70
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vy: -(Math.random() * 0.28 + 0.06),
      vx: (Math.random() - 0.5) * 0.12,
      a: Math.random() * 0.6 + 0.2,
      p: Math.random() * Math.PI * 2,
    }))

    const tick = (t) => {
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        d.x += d.vx
        d.y += d.vy
        if (d.y < -10) {
          d.y = h + 10
          d.x = Math.random() * w
        }
        const tw = 0.5 + 0.5 * Math.sin(t / 900 + d.p)
        const alpha = d.a * tw
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 5)
        g.addColorStop(0, `rgba(240,208,128,${alpha})`)
        g.addColorStop(1, 'rgba(240,208,128,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r * 5, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="particles" aria-hidden="true" />
}
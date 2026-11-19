import React from 'react'
import { motion } from 'framer-motion'
import { EVENT } from '../lib/categories.js'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="beam beam-l" aria-hidden="true" />
      <div className="beam beam-r" aria-hidden="true" />

      <motion.img
        {...fade(0.1)}
        src="/logo.jpeg"
        alt="Bloom Centre Yotsar · Vases d'Honneur"
        className="hero-logo"
      />

      <motion.p {...fade(0.35)} className="eyebrow">
        <span>✦</span> Dîner de gala <span>✦</span>
      </motion.p>

      <motion.h1 {...fade(0.5)} className="hero-title">
        Splendeur <em>Awards</em>
      </motion.h1>

      <motion.div {...fade(0.7)} className="ornament" aria-hidden="true">
        <i /> <b>◆</b> <i />
      </motion.div>

      <motion.p {...fade(0.85)} className="hero-sub">
        Nommez les personnalités qui illuminent <strong>Bloom</strong>.
        <br />
        Cinq distinctions, une seule soirée d'exception.
      </motion.p>

      <motion.div {...fade(1)} className="hero-meta">
        <span>{EVENT.date}</span>
        <span className="dot" />
        <span>{EVENT.place}</span>
      </motion.div>

      <motion.a {...fade(1.15)} href="#nominer" className="btn btn-gold">
        Faire mes nominations
      </motion.a>

      <div className="scroll-cue" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}

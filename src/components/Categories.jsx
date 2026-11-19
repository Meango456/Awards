import React from 'react'
import { motion } from 'framer-motion'
import { CATEGORIES } from '../lib/categories.js'
import Icon from './icon.jsx'

export default function Categories() {
  return (
    <section className="section" id="distinctions">
      <motion.div
        className="section-head"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8 }}
      >
        <p className="eyebrow">
          <span>✦</span> Les distinctions <span>✦</span>
        </p>
        <h2>Cinq prix, cinq manières de rayonner</h2>
      </motion.div>

      <div className="cat-grid">
        {CATEGORIES.map((c, i) => (
          <motion.article
            key={c.key}
            className="cat-card"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
          >
            <span className="cat-num">0{i + 1}</span>
            <span className="cat-icon">
              <Icon name={c.icon} size={30} />
            </span>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

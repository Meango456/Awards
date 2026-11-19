import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Particles from './components/particles.jsx'
import Hero from './components/hero.jsx'
import Categories from './components/categories.jsx'
import NominationForm from './components/nominationform.jsx'
import Admin from './components/admin.jsx'
import { EVENT } from './lib/categories.js'

function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const isAdmin = hash.startsWith('#/admin')

  return (
    <>
      <div className="bg-glow" aria-hidden="true" />
      <Particles />
      {isAdmin ? (
        <Admin />
      ) : (
        <main>
          <Hero />
          <Categories />
          <NominationForm />
          <footer className="footer">
            <img src="/logo.jpeg" alt="Bloom Centre Yotsar · Vases d'Honneur" className="footer-logo" />
            <p>
              {EVENT.name} {EVENT.year} · {EVENT.place}
            </p>
            <a className="admin-link" href="#/admin">
              
            </a>
          </footer>
        </main>
      )}
    </>
  )
}
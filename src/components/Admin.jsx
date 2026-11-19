import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { isConfigured, supabase } from '../lib/supabase.js'
import { tally } from '../lib/tally.js'
import { buildWorkbook, exportFileName } from '../lib/exportexcel.js'
import Icon from './Icon.jsx'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isConfigured) {
      setReady(true)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!ready) return <div className="admin-wrap" />

  if (!isConfigured) {
    return (
      <div className="admin-wrap">
        <div className="card narrow">
          <h3 className="step-title">Supabase non configuré</h3>
          <p className="step-sub">
            Copiez <code>.env.example</code> en <code>.env</code>, renseignez vos clés Supabase puis relancez le site.
          </p>
          <a className="btn btn-ghost" href="#/">
            <Icon name="back" size={18} /> Retour au site
          </a>
        </div>
      </div>
    )
  }

  return session ? <Dashboard /> : <Login />
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Identifiants incorrects.')
    setBusy(false)
  }

  return (
    <div className="admin-wrap">
      <motion.form
        onSubmit={submit}
        className="card narrow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img src="/logo.png" alt="" className="admin-logo" />
        <h3 className="step-title">Espace organisateur</h3>
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        </label>
        <label className="field">
          <span className="field-label">Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error banner">{error}</p>}
        <div className="actions">
          <a className="btn btn-ghost" href="#/">
            <Icon name="back" size={18} /> Site
          </a>
          <button className="btn btn-gold" disabled={busy}>
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

function Dashboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('nominations').select('*').order('created_at', { ascending: false })
    if (error) setError('Impossible de charger les données. Vérifiez les règles RLS (supabase/schema.sql).')
    else {
      setError('')
      setRows(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('nominations-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nominations' }, load)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  const results = useMemo(() => tally(rows), [rows])

  const exportExcel = async () => {
    const XLSX = await import('xlsx')
    XLSX.writeFile(buildWorkbook(XLSX, rows), exportFileName())
  }

  return (
    <div className="admin-wrap wide">
      <header className="admin-head">
        <div>
          <p className="eyebrow">
            <span>✦</span> Espace organisateur
          </p>
          <h2>Résultats en direct</h2>
          <p className="step-sub">
            {rows.length} participant{rows.length > 1 ? 's' : ''} ont déjà voté.
          </p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-ghost" onClick={load} disabled={loading}>
            {loading ? 'Actualisation…' : 'Actualiser'}
          </button>
          <button className="btn btn-gold" onClick={exportExcel} disabled={!rows.length}>
            <Icon name="download" size={18} /> Exporter en Excel
          </button>
          <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>
            Déconnexion
          </button>
        </div>
      </header>

      {error && <p className="error banner">{error}</p>}

      <div className="result-grid">
        {results.map((c) => {
          const max = c.list[0]?.votes || 1
          return (
            <section key={c.key} className="card result-card">
              <h3 className="result-title">
                <Icon name={c.icon} size={22} /> {c.title}
              </h3>
              {c.list.length === 0 && <p className="hint">Aucune nomination pour le moment.</p>}
              <ol className="rank">
                {c.list.slice(0, 8).map((n, i) => (
                  <li key={n.name}>
                    <div className="rank-line">
                      <span className="rank-pos">{i + 1}</span>
                      <span className="rank-name">{n.name}</span>
                      <span className="rank-votes">{n.votes}</span>
                    </div>
                    <div className="bar">
                      <motion.i
                        initial={{ width: 0 }}
                        animate={{ width: `${(n.votes / max) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
              {c.list.length > 8 && <p className="hint">+ {c.list.length - 8} autres dans l'export Excel</p>}
            </section>
          )
        })}
      </div>

      <a className="admin-link" href="#/">
        ← Retour au site
      </a>
    </div>
  )
}

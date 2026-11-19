import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES } from '../lib/categories.js'
import { isConfigured, supabase } from '../lib/supabase.js'
import Icon from './Icon.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TOTAL_STEPS = CATEGORIES.length + 2 // identité + catégories + récap

const empty = {
  first_name: '',
  last_name: '',
  email: '',
  ...Object.fromEntries(CATEGORIES.map((c) => [c.key, ''])),
}

export default function NominationForm() {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState(empty)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('')

  const set = (k, v) => {
    setData((d) => ({ ...d, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const filledCount = useMemo(() => CATEGORIES.filter((c) => data[c.key].trim()).length, [data])

  const validateIdentity = () => {
    const e = {}
    if (data.first_name.trim().length < 2) e.first_name = 'Entrez votre prénom'
    if (data.last_name.trim().length < 2) e.last_name = 'Entrez votre nom'
    if (!EMAIL_RE.test(data.email.trim())) e.email = 'Entrez une adresse email valide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const go = (n) => {
    setDir(n > step ? 1 : -1)
    setStep(n)
    document.getElementById('nominer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const next = () => {
    if (step === 0 && !validateIdentity()) return
    go(Math.min(step + 1, TOTAL_STEPS - 1))
  }

  const submit = async () => {
    if (filledCount === 0) {
      setServerError('Nommez au moins une personne avant de valider.')
      return
    }
    setSending(true)
    setServerError('')
    const payload = {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim().toLowerCase(),
      ...Object.fromEntries(CATEGORIES.map((c) => [c.key, data[c.key].trim() || null])),
    }
    try {
      if (!isConfigured) {
        await new Promise((r) => setTimeout(r, 900))
        console.warn('Supabase non configuré : envoi simulé (mode démo).', payload)
      } else {
        const { error } = await supabase.from('nominations').insert(payload)
        if (error) {
          if (error.code === '23505') {
            setServerError('Cette adresse email a déjà été utilisée pour voter. Un seul envoi par personne.')
          } else {
            setServerError("Une erreur est survenue. Merci de réessayer dans un instant.")
          }
          setSending(false)
          return
        }
      }
      setDone(true)
      document.getElementById('nominer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      setServerError('Connexion impossible. Vérifiez votre réseau et réessayez.')
    }
    setSending(false)
  }

  const cat = step >= 1 && step <= CATEGORIES.length ? CATEGORIES[step - 1] : null
  const progress = done ? 100 : (step / (TOTAL_STEPS - 1)) * 100

  return (
    <section className="section form-section" id="nominer">
      <div className="section-head">
        <p className="eyebrow">
          <span>✦</span> Votre voix compte <span>✦</span>
        </p>
        <h2>Faites vos nominations</h2>
      </div>

      <div className="card">
        {!done && (
          <div className="progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <motion.div className="progress-bar" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
          </div>
        )}

        <AnimatePresence mode="wait" custom={dir}>
          {done ? (
            <motion.div
              key="done"
              className="success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <motion.span
                className="seal"
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.2 }}
              >
                <Icon name="check" size={38} stroke={2} />
              </motion.span>
              <h3>Merci {data.first_name.trim()} !</h3>
              <p>
                Vos nominations ont bien été enregistrées.
                <br />
                Rendez-vous le <strong>24 décembre</strong> pour la grande soirée.
              </p>
              <div className="confetti" aria-hidden="true">
                {Array.from({ length: 24 }).map((_, i) => (
                  <i key={i} style={{ '--i': i }} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -50 }}
              transition={{ duration: 0.35 }}
              className="step"
            >
              {step === 0 && (
                <>
                  <h3 className="step-title">Faisons connaissance</h3>
                  <p className="step-sub">Vos informations nous servent uniquement à garantir un vote par personne.</p>
                  <div className="grid-2">
                    <Field label="Prénom" error={errors.first_name}>
                      <input
                        value={data.first_name}
                        onChange={(e) => set('first_name', e.target.value)}
                        autoComplete="given-name"
                        placeholder="Ex. Awa"
                      />
                    </Field>
                    <Field label="Nom" error={errors.last_name}>
                      <input
                        value={data.last_name}
                        onChange={(e) => set('last_name', e.target.value)}
                        autoComplete="family-name"
                        placeholder="Ex. Koné"
                      />
                    </Field>
                  </div>
                  <Field label="Adresse email" error={errors.email}>
                    <input
                      type="email"
                      inputMode="email"
                      value={data.email}
                      onChange={(e) => set('email', e.target.value)}
                      autoComplete="email"
                      placeholder="vous@exemple.com"
                    />
                  </Field>
                </>
              )}

              {cat && (
                <>
                  <div className="cat-head">
                    <span className="cat-icon big">
                      <Icon name={cat.icon} size={34} />
                    </span>
                    <p className="count">
                      Distinction {step} / {CATEGORIES.length}
                    </p>
                    <h3 className="step-title">{cat.title}</h3>
                    <p className="step-sub">{cat.desc}</p>
                  </div>
                  <Field label="Nom de votre nominé(e)">
                    <input
                      autoFocus
                      value={data[cat.key]}
                      onChange={(e) => set(cat.key, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && next()}
                      placeholder="Prénom et nom"
                      maxLength={120}
                    />
                  </Field>
                  <p className="hint">Vous pouvez passer cette distinction si vous le souhaitez.</p>
                </>
              )}

              {step === TOTAL_STEPS - 1 && (
                <>
                  <h3 className="step-title">Votre sélection</h3>
                  <p className="step-sub">Vérifiez vos choix avant de valider. Ils ne pourront plus être modifiés.</p>
                  <ul className="recap">
                    {CATEGORIES.map((c, i) => (
                      <li key={c.key}>
                        <button type="button" onClick={() => go(i + 1)} className="recap-row">
                          <span className="recap-cat">{c.title}</span>
                          <span className={data[c.key].trim() ? 'recap-name' : 'recap-name empty'}>
                            {data[c.key].trim() || 'Non renseigné'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {serverError && <p className="error banner">{serverError}</p>}
                </>
              )}

              <div className="actions">
                {step > 0 ? (
                  <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}>
                    <Icon name="back" size={18} /> Retour
                  </button>
                ) : (
                  <span />
                )}
                {step < TOTAL_STEPS - 1 ? (
                  <button type="button" className="btn btn-gold" onClick={next}>
                    {cat && !data[cat.key].trim() ? 'Passer' : 'Continuer'} <Icon name="arrow" size={18} />
                  </button>
                ) : (
                  <button type="button" className="btn btn-gold" onClick={submit} disabled={sending}>
                    {sending ? 'Envoi en cours…' : 'Valider mes nominations'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function Field({ label, error, children }) {
  return (
    <label className={'field' + (error ? ' has-error' : '')}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="error">{error}</span>}
    </label>
  )
}
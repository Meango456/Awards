import { CATEGORIES } from './categories.js'

const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const pretty = (s) =>
  s
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase())

/** Compte les voix par catégorie en regroupant les orthographes proches (accents, casse, espaces). */
export function tally(rows) {
  return CATEGORIES.map((cat) => {
    const map = new Map()
    for (const r of rows) {
      const raw = r[cat.key]
      if (!raw || !raw.trim()) continue
      const k = norm(raw)
      if (!k) continue
      const entry = map.get(k) || { name: pretty(raw), votes: 0 }
      entry.votes += 1
      map.set(k, entry)
    }
    const list = [...map.values()].sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name))
    return { ...cat, list, total: list.reduce((n, x) => n + x.votes, 0) }
  })
}
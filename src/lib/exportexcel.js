import { CATEGORIES } from './categories.js'
import { tally } from './tally.js'

/**
 * Construit le classeur Excel des résultats.
 * - Feuille « Résultats » : nombre de voix par nominé, catégorie par catégorie
 * - Feuille « Nominations » : une ligne par votant (qui a voté pour qui)
 * `XLSX` est passé en paramètre pour pouvoir charger la librairie à la demande.
 */
export function buildWorkbook(XLSX, rows) {
  const results = tally(rows)
  const wb = XLSX.utils.book_new()

  const res = []
  for (const c of results) {
    if (!c.list.length) res.push({ Catégorie: c.title, Nominé: '—', Voix: 0 })
    c.list.forEach((n, i) => res.push({ Catégorie: i === 0 ? c.title : '', Nominé: n.name, Voix: n.votes }))
  }
  const wsRes = XLSX.utils.json_to_sheet(res)
  wsRes['!cols'] = [{ wch: 28 }, { wch: 32 }, { wch: 8 }]
  XLSX.utils.book_append_sheet(wb, wsRes, 'Résultats')

  const all = rows.map((r) => ({
    Date: new Date(r.created_at).toLocaleString('fr-FR'),
    Prénom: r.first_name,
    Nom: r.last_name,
    Email: r.email,
    ...Object.fromEntries(CATEGORIES.map((c) => [c.title, r[c.key] || ''])),
  }))
  const wsAll = XLSX.utils.json_to_sheet(all)
  wsAll['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 28 }, ...CATEGORIES.map(() => ({ wch: 24 }))]
  XLSX.utils.book_append_sheet(wb, wsAll, 'Nominations')

  return wb
}

export const exportFileName = () => `Splendeur-Awards-resultats-${new Date().toISOString().slice(0, 10)}.xlsx`
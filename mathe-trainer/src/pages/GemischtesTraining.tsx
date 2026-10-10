import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { AREAS, type AreaId } from '../data/areas'
import { drawTraining, trainingPool, type TrainingItem } from '../data/training'

// Gemischtes Training: 10 Übungen aus allen (oder ausgewählten) Bereichen, jedes Mal neu gemischt.
// Die Zusammenstellung und die Haken gelten nur für diese Sitzung (sessionStorage), es wird kein Fortschritt gespeichert.

const COUNT = 10
const KEY = 'bk-training'

interface Plan {
  areas: AreaId[]
  paths: string[]
  done: string[]
}

const ALL = AREAS.map((a) => a.id)

function load(): Plan | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Plan) : null
  } catch {
    return null
  }
}

function save(plan: Plan) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(plan))
  } catch {
    /* ohne Speicher geht es auch – dann eben ohne Merken beim Zurückkehren */
  }
}

function fresh(areas: AreaId[]): Plan {
  return { areas, paths: drawTraining(COUNT, areas).map((t) => t.path), done: [] }
}

export default function GemischtesTraining() {
  const [plan, setPlan] = useState<Plan>(() => {
    const p = load() ?? fresh(ALL)
    save(p)
    return p
  })

  const lookup = new Map<string, TrainingItem>()
  Object.values(trainingPool()).flat().forEach((t) => lookup.set(t.path, t))
  const items = plan.paths.map((p) => lookup.get(p)).filter(Boolean) as TrainingItem[]

  const update = (next: Plan) => {
    save(next)
    setPlan(next)
  }
  const reshuffle = () => update(fresh(plan.areas))
  const toggleArea = (id: AreaId) => {
    const on = plan.areas.includes(id)
    const areas = on ? plan.areas.filter((a) => a !== id) : [...plan.areas, id]
    if (areas.length === 0) return
    update(fresh(areas))
  }
  const markDone = (path: string) => {
    if (!plan.done.includes(path)) update({ ...plan, done: [...plan.done, path] })
  }
  const toggleDone = (path: string) =>
    update({ ...plan, done: plan.done.includes(path) ? plan.done.filter((p) => p !== path) : [...plan.done, path] })

  const doneCount = items.filter((t) => plan.done.includes(t.path)).length

  return (
    <div className="bk-page bk-task bk-w-wide">
      <header className="bk-task-head" style={{ ['--area' as string]: 'var(--area-linear)' } as CSSProperties}>
        <div className="bk-task-titles">
          <span className="bk-task-area">
            <span className="bk-task-glyph" aria-hidden="true"><i className="fa-solid fa-shuffle" /></span>
            Gemischtes Training
          </span>
          <h1>{COUNT} Übungen aus allen Bereichen</h1>
          <p className="bk-task-sub">Jedes Mal neu gemischt. Öffne eine Übung, löse ein paar Aufgaben und komm hierher zurück.</p>
        </div>
        <div className="bk-task-actions">
          <span className="bk-chip !text-base !py-2.5 !px-4">{doneCount} / {items.length} erledigt</span>
          <button type="button" className="bk-btn" onClick={reshuffle}>
            <i className="fa-solid fa-dice" aria-hidden="true" /> Neu mischen
          </button>
        </div>
      </header>

      <div className="bk-task-body bk-stack">
        <section className="bk-panel">
          <h2 className="bk-label !mb-3 text-left">Bereiche</h2>
          <div className="bk-seg">
            {AREAS.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed={plan.areas.includes(a.id)}
                className={`bk-seg-btn ${plan.areas.includes(a.id) ? 'bk-seg-btn-on' : ''}`}
                onClick={() => toggleArea(a.id)}
              >
                {a.title}
              </button>
            ))}
          </div>
        </section>

        <ol className="grid gap-3 sm:grid-cols-2">
          {items.map((t, i) => {
            const done = plan.done.includes(t.path)
            return (
              <li key={t.path} className={`bk-panel !p-4 flex items-center gap-4 ${done ? 'opacity-60' : ''}`}>
                <span className="bk-glyph" style={{ ['--area' as string]: `var(--area-${t.area.id})` } as CSSProperties} aria-hidden="true">
                  {i + 1}
                </span>
                <Link to={t.path} onClick={() => markDone(t.path)} className="flex-1 min-w-0 text-left text-ink no-underline">
                  <span className="block text-xs font-bold uppercase tracking-wide text-muted">{t.area.title}</span>
                  <strong className="block font-display text-lg leading-tight">{t.title}</strong>
                  {t.desc && <span className="block text-sm text-muted line-clamp-2">{t.desc}</span>}
                </Link>
                <button
                  type="button"
                  className="bk-icon-btn"
                  aria-label={done ? 'Als offen markieren' : 'Als erledigt markieren'}
                  title={done ? 'Als offen markieren' : 'Als erledigt markieren'}
                  onClick={() => toggleDone(t.path)}
                >
                  <i className={done ? 'fa-solid fa-check' : 'fa-regular fa-circle'} aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

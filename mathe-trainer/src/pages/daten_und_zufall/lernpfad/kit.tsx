import { createContext, useContext, useId, useState, type ChangeEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BlockMath, InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import TaskShell from '../../../components/layout/TaskShell'
import { fieldCheckClass } from '../../../utils/fieldCheck'
import { LESSONS, lessonPath } from './lessons'
import './lernpfad.css'

// Bausteine für den Lernpfad „Daten und Zufall“: Rahmen eines Lernschritts mit Erklärung,
// Beispiel zum Aufdecken und Übungskarten mit Zufallsaufgaben, automatischer Prüfung und Lösungsweg.

/* ── Mathe-Satz ─────────────────────────────────────────────────────────── */

export const M = ({ children }: { children: string }) => <InlineMath math={children} />
export const MB = ({ children }: { children: string }) => <BlockMath math={children} />

/* ── Zahlen ──────────────────────────────────────────────────────────────── */

export const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
export const shuffle = <T,>(arr: readonly T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
export const sum = (a: number[]) => a.reduce((s, v) => s + v, 0)
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))
export const round = (x: number, d = 2) => Math.round((x + Number.EPSILON) * 10 ** d) / 10 ** d

/** Deutsche Schreibweise: 1234,5 → „1.234,5“; mit fix = feste Nachkommastellen */
export function fmt(x: number, d = 2, fix = false) {
  return round(x, d).toLocaleString('de-DE', { minimumFractionDigits: fix ? d : 0, maximumFractionDigits: d })
}
/** Dasselbe für KaTeX (Komma ohne Abstand) */
export const tex = (x: number, d = 2, fix = false) => fmt(x, d, fix).replace(/,/g, '{,}')
/** Prozentangabe für KaTeX, z. B. 0,1667 → „16{,}67\,\%“ */
export const texPct = (p: number, d = 2) => `${tex(p * 100, d)}\\,\\%`
export const pctText = (p: number, d = 2) => `${fmt(p * 100, d)} %`

/** Bruch für KaTeX, auf Wunsch gekürzt */
export function frac(a: number, b: number, reduce = true) {
  const g = reduce ? gcd(a, b) : 1
  const z = a / g
  const n = b / g
  if (n === 1) return `${z}`
  return `\\tfrac{${z}}{${n}}`
}
/** Gekürzt als Text, z. B. „3/20“ */
export const fracText = (a: number, b: number) => {
  const g = gcd(a, b)
  return b / g === 1 ? `${a / g}` : `${a / g}/${b / g}`
}

/** Liest Schülereingaben: Komma oder Punkt, Bruch „a/b“, Prozent, Einheiten werden ignoriert. */
export function parseInput(raw: string): { value: number; decimals: number; percent: boolean; fraction: boolean } | null {
  let s = raw.trim().replace(/[−–—‐]/g, '-').replace(/\s+/g, '').replace(/[€°]|cm|kg|km|m$|s$/gi, '')
  const percent = s.includes('%')
  s = s.replace('%', '')
  if (!s) return null
  if (s.includes('/')) {
    const [a, b] = s.split('/')
    const za = parseInput(a)
    const nb = parseInput(b)
    if (!za || !nb || nb.value === 0) return null
    return { value: za.value / nb.value / (percent ? 100 : 1), decimals: 10, percent, fraction: true }
  }
  // Punkt als Tausendertrenner nur, wenn auch ein Komma vorkommt oder genau Dreiergruppen folgen
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '')
  // Vorzeichen „+“ ist erlaubt (Lücken, in denen das Vorzeichen selbst eingetragen wird)
  s = s.replace(/^\+(?=[\d.])/, '')
  if (!/^-?\d*\.?\d+$/.test(s)) return null
  const value = parseFloat(s)
  const decimals = s.includes('.') ? s.split('.')[1].length : 0
  return { value, decimals, percent, fraction: false }
}

/** Zahlvergleich: Abweichung bis tol erlaubt (Standard: Rundung auf zwei Nachkommastellen). */
export function checkNumber(raw: string, expected: number, tol = 0.0051): boolean | undefined {
  const p = parseInput(raw)
  if (!p) return raw.trim() ? false : undefined
  const v = p.percent ? p.value / 100 : p.value
  return Math.abs(v - expected) <= tol + 1e-9
}

/**
 * Wahrscheinlichkeiten und relative Häufigkeiten: als Bruch (auch ungekürzt), Dezimalzahl oder Prozent.
 * Gerundete Angaben zählen, wenn sie korrekt gerundet sind und höchstens 3 % (relativ) abweichen.
 */
export function checkProb(raw: string, expected: number): boolean | undefined {
  const p = parseInput(raw)
  if (!p) return raw.trim() ? false : undefined
  let v = p.value
  let decimals = p.decimals
  if (p.percent || (!p.fraction && v > 1 && v <= 100)) {
    v /= 100
    decimals += 2
  }
  const diff = Math.abs(v - expected)
  if (diff < 1e-9) return true
  if (p.fraction) return false
  const rel = expected === 0 ? diff : diff / Math.abs(expected)
  return diff <= 0.5 * 10 ** -decimals + 1e-9 && rel <= 0.03
}

/* ── Seitenzähler (nur für diese Sitzung, nichts wird gespeichert) ────────── */

const ScoreCtx = createContext<{ solved: number; add: () => void } | null>(null)

/* ── Rahmen eines Lernschritts ───────────────────────────────────────────── */

const PART_LABEL = { daten: 'Teil 1 · Daten auswerten', zufall: 'Teil 2 · Zufall und Wahrscheinlichkeit', test: 'Teste dich' }

export function Lesson({ goal, children }: { goal: ReactNode; children: ReactNode }) {
  const { pathname } = useLocation()
  const index = LESSONS.findIndex((l) => pathname.replace(/\/ueben$/, '').endsWith(`/${l.slug}`))
  const lesson = LESSONS[index]
  const prev = LESSONS[index - 1]
  const next = LESSONS[index + 1]
  const [solved, setSolved] = useState(0)

  return (
    <ScoreCtx.Provider value={{ solved, add: () => setSolved((n) => n + 1) }}>
      <TaskShell
        title={lesson?.title ?? ''}
        width="wide"
        subtitle={
          <>
            Schritt {index + 1} von {LESSONS.length} · {lesson ? PART_LABEL[lesson.part] : ''}
          </>
        }
        actions={
          <span className="bk-streak" title="Wird nicht gespeichert">
            <i className="fa-solid fa-check" aria-hidden="true" /> {solved} gelöst
          </span>
        }
      >
        <div className="lp">
          <ol className="lp-steps" aria-label="Lernpfad">
            {LESSONS.map((l, i) => (
              <li key={l.slug} className={i === index ? 'lp-step-on' : i < index ? 'lp-step-done' : ''}>
                <Link to={lessonPath(l.slug)} title={l.title} aria-current={i === index ? 'step' : undefined}>
                  {i + 1}
                </Link>
              </li>
            ))}
          </ol>
          <div className="lp-goal">
            <i className="fa-solid fa-bullseye" aria-hidden="true" />
            <div>
              <strong>Das lernst du hier:</strong> {goal}
            </div>
          </div>
          {children}
          <nav className="lp-nav" aria-label="Lernschritte">
            {prev ? (
              <Link className="bk-btn" to={lessonPath(prev.slug)}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Schritt {index}: {short(prev.title)}
              </Link>
            ) : (
              <Link className="bk-btn" to="/daten-und-zufall">
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zur Übersicht
              </Link>
            )}
            {next ? (
              <Link className="bk-btn bk-btn-primary" to={lessonPath(next.slug)}>
                Weiter zu Schritt {index + 2}: {short(next.title)} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
            ) : (
              <Link className="bk-btn bk-btn-primary" to="/daten-und-zufall/anwendungsaufgaben">
                Weiter zu den Anwendungsaufgaben <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
            )}
          </nav>
        </div>
      </TaskShell>
    </ScoreCtx.Provider>
  )
}

const short = (t: string) => t.split(/[:(]/)[0].trim()

/** Abschnitt mit Nummer, z. B. „1 Das musst du wissen“ */
export function Section({ no, title, children }: { no: number | string; title: string; children: ReactNode }) {
  return (
    <section className="lp-section">
      <h2 className="lp-h2">
        <span className="lp-h2-no">{no}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Merkkasten (Inhalte der Merkhilfe) */
export function Merke({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="lp-merke">
      <div className="lp-merke-title">
        <i className="fa-solid fa-thumbtack" aria-hidden="true" /> {title}
      </div>
      <div className="lp-merke-body">{children}</div>
    </div>
  )
}

/** Hinweis „So gehst du vor“ als nummerierte Liste */
export function Vorgehen({ title = 'So gehst du vor', steps }: { title?: string; steps: ReactNode[] }) {
  return (
    <div className="lp-howto">
      <div className="lp-howto-title">
        <i className="fa-solid fa-shoe-prints" aria-hidden="true" /> {title}
      </div>
      <ol>
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  )
}

/** Typische Fehler */
export function Achtung({ items }: { items: ReactNode[] }) {
  return (
    <div className="lp-warn">
      <div className="lp-warn-title">
        <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Typische Fehler
      </div>
      <ul>
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  )
}

/** Musterbeispiel: Aufgabe sichtbar, Lösungsschritte nacheinander aufdecken */
/** Ausgearbeitetes Beispiel; offen = alle Schritte gleich sichtbar statt Schritt für Schritt aufdecken; ab = Nummer des ersten Schritts */
export function Beispiel({
  title,
  aufgabe,
  steps,
  offen = false,
  ab = 1,
}: {
  title: ReactNode
  aufgabe: ReactNode
  steps: { title: ReactNode; body: ReactNode }[]
  offen?: boolean
  /** Nummer des ersten Schritts, wenn ein Beispiel auf mehrere Seiten verteilt ist */
  ab?: number
}) {
  const [shown, setShown] = useState(offen ? steps.length : 0)
  return (
    <div className="lp-example">
      <div className="lp-example-title">
        <i className="fa-solid fa-lightbulb" aria-hidden="true" /> Beispiel: {title}
      </div>
      <div className="lp-example-task">{aufgabe}</div>
      <ol className="lp-example-steps">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i}>
            <div className="lp-example-step-title">
              Schritt {i + ab}: {s.title}
            </div>
            <div className="lp-example-step-body">{s.body}</div>
          </li>
        ))}
      </ol>
      {!offen && (
      <div className="bk-actions">
        {shown < steps.length ? (
          <>
            <button type="button" className="bk-btn bk-btn-sm" onClick={() => setShown(shown + 1)}>
              <i className="fa-solid fa-eye" aria-hidden="true" /> {shown === 0 ? 'Ersten Schritt zeigen' : 'Nächster Schritt'}
            </button>
            <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setShown(steps.length)}>
              Alle Schritte zeigen
            </button>
          </>
        ) : (
          <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setShown(0)}>
            Beispiel zuklappen
          </button>
        )}
      </div>
      )}
    </div>
  )
}

/* ── Übungen ─────────────────────────────────────────────────────────────── */

/** inline: Feld wird im Aufgabentext selbst platziert (z. B. in einem Baumdiagramm) */
export type Field = FieldBase & { inline?: boolean }
type FieldBase =
  | { kind: 'num'; key: string; label?: ReactNode; expected: number; tol?: number; unit?: string; size?: 'sm' | 'md' | 'lg'; placeholder?: string }
  | { kind: 'prob'; key: string; label?: ReactNode; expected: number; size?: 'sm' | 'md' | 'lg'; placeholder?: string }
  | { kind: 'choice'; key: string; label?: ReactNode; options: ReactNode[]; expected: number; display?: 'select' | 'buttons'; optionText?: string[] }
  | { kind: 'set'; key: string; label?: ReactNode; options: string[]; expected: string[] }

export interface Task {
  /** Aufgabentext. Als Funktion kann er Eingabefelder selbst platzieren (z. B. in Tabellen oder Baumdiagrammen). */
  prompt: ReactNode | ((F: (key: string) => ReactNode) => ReactNode)
  fields: Field[]
  /** Lösungsweg */
  solution: ReactNode
  /** Kurzer Hinweis unter den Feldern, z. B. zur Rundung */
  hint?: ReactNode
}

export interface ExerciseDef {
  id: string
  title: string
  /** Kennzeichnung für den Schwierigkeitsgrad (1–3 Sterne) */
  level?: 1 | 2 | 3
  gen: () => Task
}

const PRAISE = [
  'Super, alles richtig! 🎉',
  'Klasse – genau so wird es gemacht!',
  'Stark, richtig gelöst! 💪',
  'Perfekt! Du hast es verstanden.',
  'Richtig! Weiter so!',
  'Sehr gut – alles stimmt!',
]

type Mark = boolean | undefined

function checkField(f: Field, value: string | string[] | undefined): Mark {
  if (f.kind === 'set') {
    const chosen = (value as string[] | undefined) ?? []
    if (chosen.length === 0) return undefined
    return chosen.length === f.expected.length && f.expected.every((e) => chosen.includes(e))
  }
  const v = (value as string | undefined) ?? ''
  if (f.kind === 'choice') return v === '' ? undefined : Number(v) === f.expected
  if (f.kind === 'prob') return checkProb(v, f.expected)
  return checkNumber(v, f.expected, f.tol)
}

export function Exercise({ def, no }: { def: ExerciseDef; no?: number | string }) {
  const [task, setTask] = useState<Task>(() => def.gen())
  const [values, setValues] = useState<Record<string, string | string[]>>({})
  const [marks, setMarks] = useState<Record<string, Mark>>({})
  const [status, setStatus] = useState<'idle' | 'ok' | 'no' | 'empty'>('idle')
  const [praise, setPraise] = useState(PRAISE[0])
  const [counted, setCounted] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const score = useContext(ScoreCtx)
  const uid = useId()

  const setValue = (key: string, v: string | string[]) => {
    setValues((prev) => ({ ...prev, [key]: v }))
    setMarks((prev) => ({ ...prev, [key]: undefined }))
    setStatus('idle')
  }

  /** Auswahl umschalten – mit dem aktuellen Zustand, damit schnelle Klicke sich nicht überschreiben */
  const toggle = (key: string, o: string) => {
    setValues((prev) => {
      const cur = (prev[key] as string[] | undefined) ?? []
      return { ...prev, [key]: cur.includes(o) ? cur.filter((c) => c !== o) : [...cur, o] }
    })
    setMarks((prev) => ({ ...prev, [key]: undefined }))
    setStatus('idle')
  }

  const check = () => {
    const m: Record<string, Mark> = {}
    for (const f of task.fields) m[f.key] = checkField(f, values[f.key])
    setMarks(m)
    if (task.fields.some((f) => m[f.key] === undefined)) {
      setStatus('empty')
      return
    }
    const ok = task.fields.every((f) => m[f.key] === true)
    setStatus(ok ? 'ok' : 'no')
    if (ok) {
      setPraise(pick(PRAISE))
      if (!counted) {
        score?.add()
        setCounted(true)
      }
    }
  }

  const newTask = () => {
    setTask(def.gen())
    setValues({})
    setMarks({})
    setStatus('idle')
    setCounted(false)
    setShowSolution(false)
  }

  const renderField = (key: string): ReactNode => {
    const f = task.fields.find((x) => x.key === key)
    if (!f) return null
    const mark = marks[key]
    const id = `${uid}-${key}`
    if (f.kind === 'set') {
      const chosen = (values[key] as string[] | undefined) ?? []
      return (
        <div className={`lp-chips ${fieldCheckClass(mark)}`} role="group" aria-label={typeof f.label === 'string' ? f.label : undefined}>
          {f.options.map((o) => {
            const on = chosen.includes(o)
            return (
              <button
                key={o}
                type="button"
                aria-pressed={on}
                className={`lp-chip ${on ? 'lp-chip-on' : ''}`}
                onClick={() => toggle(key, o)}
              >
                {o}
              </button>
            )
          })}
        </div>
      )
    }
    if (f.kind === 'choice') {
      const v = (values[key] as string | undefined) ?? ''
      if (f.display === 'buttons') {
        return (
          <div className="lp-options" role="radiogroup">
            {f.options.map((o, i) => (
              <label key={i} className={`bk-choice lp-option ${v === String(i) ? fieldCheckClass(mark) : ''}`}>
                <input type="radio" name={id} value={i} checked={v === String(i)} onChange={() => setValue(key, String(i))} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        )
      }
      return (
        <select id={id} className={`bk-input lp-select ${fieldCheckClass(mark)}`} value={v} onChange={(e: ChangeEvent<HTMLSelectElement>) => setValue(key, e.target.value)}>
          <option value="">–</option>
          {f.options.map((o, i) => (
            <option key={i} value={i}>
              {f.optionText?.[i] ?? (typeof o === 'string' ? o : String(i + 1))}
            </option>
          ))}
        </select>
      )
    }
    const v = (values[key] as string | undefined) ?? ''
    return (
      <span className="lp-num">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`bk-input lp-input lp-input-${f.size ?? 'md'} ${fieldCheckClass(mark)}`}
          value={v}
          placeholder={f.placeholder ?? (f.kind === 'prob' ? 'z. B. 3/8' : '?')}
          aria-label={typeof f.label === 'string' ? f.label : key}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(key, e.target.value)}
        />
        {f.kind === 'num' && f.unit && <span className="lp-unit">{f.unit}</span>}
      </span>
    )
  }

  // Felder, die der Aufgabentext nicht selbst platziert, kommen in den Standardbereich
  const placed = new Set<string>()
  const prompt =
    typeof task.prompt === 'function'
      ? task.prompt((key) => {
          placed.add(key)
          return renderField(key)
        })
      : task.prompt
  const rest = task.fields.filter((f) => !placed.has(f.key) && !f.inline)

  return (
    <div className="lp-ex bk-panel">
      <div className="lp-ex-head">
        <h3 className="lp-ex-title">
          {no !== undefined && <span className="lp-ex-no">{no}</span>}
          {def.title}
        </h3>
        {def.level && (
          <span className="lp-level" aria-label={`Schwierigkeit ${def.level} von 3`}>
            {'★'.repeat(def.level)}
            <span className="lp-level-off">{'★'.repeat(3 - def.level)}</span>
          </span>
        )}
      </div>
      <div className="lp-ex-prompt">{prompt}</div>
      {rest.length > 0 && (
        <div className="lp-fields">
          {rest.map((f) => (
            <div key={f.key} className={`lp-field ${f.kind === 'choice' && f.display === 'buttons' ? 'lp-field-wide' : ''} ${f.kind === 'set' ? 'lp-field-wide' : ''}`}>
              {f.label && (
                <label className="lp-label" htmlFor={`${uid}-${f.key}`}>
                  {f.label}
                </label>
              )}
              {renderField(f.key)}
            </div>
          ))}
        </div>
      )}
      {task.hint && <p className="lp-hint">{task.hint}</p>}
      <div className="bk-actions lp-ex-actions">
        <button type="button" className="bk-btn bk-btn-primary" onClick={check}>
          Prüfen
        </button>
        <button type="button" className="bk-btn" onClick={() => setShowSolution((s) => !s)}>
          <i className="fa-solid fa-route" aria-hidden="true" /> {showSolution ? 'Lösungsweg ausblenden' : 'Lösungsweg zeigen'}
        </button>
        <button type="button" className="bk-btn bk-btn-ghost" onClick={newTask}>
          <i className="fa-solid fa-rotate" aria-hidden="true" /> Neue Aufgabe
        </button>
      </div>
      {status === 'ok' && (
        <div className="bk-feedback bk-feedback-ok lp-feedback" role="status">
          <i className="fa-solid fa-circle-check" aria-hidden="true" /> {praise}
        </div>
      )}
      {status === 'no' && (
        <div className="bk-feedback bk-feedback-no lp-feedback" role="status">
          <i className="fa-solid fa-circle-xmark" aria-hidden="true" /> Leider noch nicht ganz richtig. Die roten Felder stimmen noch nicht – rechne sie
          noch einmal nach oder sieh dir den Lösungsweg an.
        </div>
      )}
      {status === 'empty' && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> Bitte trage zuerst in alle Felder etwas ein.
        </div>
      )}
      {showSolution && (
        <div className="bk-solution lp-solution">
          <div className="bk-solution-title">Lösungsweg</div>
          {task.solution}
        </div>
      )}
    </div>
  )
}

/** Liste von Übungen mit fortlaufender Nummer */
export function Uebungen({ defs }: { defs: ExerciseDef[] }) {
  return (
    <div className="lp-exlist">
      {defs.map((d, i) => (
        <Exercise key={d.id} def={d} no={i + 1} />
      ))}
    </div>
  )
}

/* ── Kleine Darstellungshelfer ───────────────────────────────────────────── */

/** Zahlenreihe als Kästchen (Urliste / Rangliste) */
export function Reihe({ values, d = 2, highlight = [] }: { values: number[]; d?: number; highlight?: number[] }) {
  return (
    <div className="lp-row" role="list">
      {values.map((v, i) => (
        <span key={i} role="listitem" className={`lp-cell ${highlight.includes(i) ? 'lp-cell-on' : ''}`}>
          {fmt(v, d)}
        </span>
      ))}
    </div>
  )
}

/** Tabelle, die nie umbricht und bei Bedarf seitlich scrollt */
export function Tabelle({ head, rows, firstColHead = true }: { head: ReactNode[]; rows: ReactNode[][]; firstColHead?: boolean }) {
  return (
    <div className="lp-table-wrap">
      <table className="lp-table">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (firstColHead && j === 0 ? <th key={j}>{c}</th> : <td key={j}>{c}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Tabelle mit Merkmalen als Spalten (quer), z. B. Häufigkeitstabelle */
export function QuerTabelle({ rows }: { rows: { head: ReactNode; cells: ReactNode[] }[] }) {
  return (
    <div className="lp-table-wrap">
      <table className="lp-table lp-table-quer">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <th>{r.head}</th>
              {r.cells.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

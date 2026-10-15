import { useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { useTaskTracking } from '../../../hooks/useTaskTracking'
import { fieldCheckClass } from '../../../utils/fieldCheck'
import CoordSystem, { X_COL, Y_COL, originPath } from '../../../components/CoordSystem'
import type { Pt, SysPoint } from '../../../components/CoordSystem'

// Gemeinsame Bausteine der Seite "Punktkoordinaten verstehen":
// Hilfsfunktionen, KaTeX-Helfer und die drei Aufgabentypen (Eingabe, Auswahl, Anklicken).

export type Level = 'q1' | 'all'
export const R = 5
export const LETTERS = ['A', 'B', 'C', 'D', 'E']
export const NAMES = ['A', 'B', 'C', 'D', 'P', 'Q', 'S', 'T']
const PRAISE = ['Super!', 'Richtig!', 'Genau!', 'Sehr gut!', 'Stark!', 'Prima!', 'Top!']

export const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
export const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const fmtN = (n: number) => String(n).replace('-', '−')
export const plain = (p: Pt) => `(${fmtN(p.x)} | ${fmtN(p.y)})`
export const M = ({ t }: { t: string }) => <InlineMath math={t} />
export const coordTex = (p: Pt) => `(${p.x}\\,|\\,${p.y})`
export const named = (n: string, p: Pt) => `${n}${coordTex(p)}`

const unit = (n: number) => (Math.abs(n) === 1 ? 'Einheit' : 'Einheiten')
export const stepsX = (x: number) => (x === 0 ? 'keine Einheit nach rechts oder links' : `${Math.abs(x)} ${unit(x)} nach ${x > 0 ? 'rechts' : 'links'}`)
export const stepsY = (y: number) => (y === 0 ? 'keine Einheit nach oben oder unten' : `${Math.abs(y)} ${unit(y)} nach ${y > 0 ? 'oben' : 'unten'}`)

/** Zufälliger Punkt mit x ≠ y (damit Vertauschen sichtbar wird), nicht auf den Achsen. */
export function randPoint(level: Level, avoid: Pt[] = []): Pt {
  for (;;) {
    const x = level === 'q1' ? rnd(1, R) : rnd(-R, R)
    const y = level === 'q1' ? rnd(1, R) : rnd(-R, R)
    if (x === 0 || y === 0 || x === y) continue
    if (avoid.some((p) => p.x === x && p.y === y)) continue
    return { x, y }
  }
}

export function parseNum(s: string): number {
  const t = s.replace(/[−–—‐]/g, '-').replace(',', '.').trim()
  return /^[+-]?\d+$/.test(t) ? Number(t) : NaN
}

/** Lösungsweg: vom Ursprung erst x (waagrecht), dann y (senkrecht). */
export function Way({ p, name = 'P' }: { p: Pt; name?: string }) {
  return (
    <ol className="list-decimal pl-5 space-y-1">
      <li>
        Starte im Ursprung <M t="O(0\,|\,0)" />.
      </li>
      <li>
        <b style={{ color: X_COL }}>x-Wert (waagrecht):</b> Gehe {stepsX(p.x)}. Also <M t={`x = ${p.x}`} />.
      </li>
      <li>
        <b style={{ color: Y_COL }}>y-Wert (senkrecht):</b> Gehe {stepsY(p.y)}. Also <M t={`y = ${p.y}`} />.
      </li>
      <li>
        Schreibe zuerst x, dann y: <M t={named(name, p)} />.
      </li>
    </ol>
  )
}

export interface Result {
  firstTry: boolean
  swapped: boolean
}

export interface TaskProps {
  topic: string
  exam?: boolean
  onDone?: (r: Result) => void
  onNext?: () => void
  nextLabel?: string
}

// ---------------------------------------------------------------------------------------------
// Eingabeaufgabe: ein oder zwei Zahlenfelder, jedes wird einzeln grün/rot markiert.
// ---------------------------------------------------------------------------------------------

export interface FieldCfg {
  key: string
  label: string
  color: string
  answer: number
  sign?: string
}

export interface InputCfg {
  question: ReactNode
  visual?: (reveal: boolean) => ReactNode
  fields: FieldCfg[]
  solution: ReactNode
  answerTex?: string
}

export function InputTask({ cfg, topic, exam, onDone, onNext, nextLabel = 'Nächste Aufgabe' }: TaskProps & { cfg: InputCfg }) {
  const tracking = useTaskTracking(topic)
  const [vals, setVals] = useState<string[]>(() => cfg.fields.map(() => ''))
  const [states, setStates] = useState<(boolean | null)[]>(() => cfg.fields.map(() => null))
  const [msg, setMsg] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const [shown, setShown] = useState(false)
  const [praise] = useState(() => pick(PRAISE))
  const attempts = useRef(0)
  const swaps = useRef(0)

  const setVal = (i: number, v: string) => {
    setVals((old) => old.map((o, j) => (j === i ? v : o)))
    setStates((old) => old.map(() => null))
    setMsg(null)
    tracking.onInput()
  }

  const flipSign = (i: number) => {
    const v = vals[i].trim()
    if (v === '') setVal(i, '−')
    else if (/^[-−–]/.test(v)) setVal(i, v.slice(1))
    else setVal(i, `−${v}`)
  }

  const check = () => {
    if (solved) return
    if (vals.some((v) => v.trim() === '')) {
      setMsg('Fülle zuerst alle Felder aus.')
      return
    }
    const nums = vals.map(parseNum)
    const ok = cfg.fields.map((f, i) => nums[i] === f.answer)
    if (ok.every(Boolean)) {
      setStates(ok)
      setMsg(null)
      setSolved(true)
      tracking.onCheck(true)
      onDone?.({ firstTry: attempts.current === 0, swapped: swaps.current > 0 })
      return
    }
    attempts.current += 1
    tracking.onCheck(false)
    const f = cfg.fields
    const swapped = f.length === 2 && f[0].answer !== f[1].answer && nums[0] === f[1].answer && nums[1] === f[0].answer
    if (swapped) {
      swaps.current += 1
      setStates(ok.map(() => false))
      setMsg('Leider falsch: Du hast x und y vertauscht! Erst waagrecht (x), dann senkrecht (y).')
      return
    }
    setStates(ok)
    const tips = f.flatMap((field, i) => {
      if (ok[i]) return []
      if (Number.isNaN(nums[i])) return [`${field.label}: Bitte eine ganze Zahl eingeben.`]
      if (Math.abs(nums[i]) === Math.abs(field.answer)) return [field.sign ?? `${field.label}: Prüfe das Vorzeichen.`]
      return [`${field.label} stimmt noch nicht – zähle noch einmal nach.`]
    })
    setMsg(`Noch nicht ganz. ${tips.join(' ')}`)
  }

  const showSolution = () => {
    if (!shown) {
      setShown(true)
      tracking.onHintShown()
    }
  }

  const reveal = solved || shown
  const visual = cfg.visual?.(reveal)

  return (
    <div className="bk-panel">
      <div className={visual ? 'grid md:grid-cols-2 gap-6 items-start' : ''}>
        {visual && <div>{visual}</div>}
        <div className="bk-stack">
          <div className="bk-taskbox">{cfg.question}</div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {cfg.fields.map((f, i) => (
              <div key={f.key} className="inline-flex items-center gap-2">
                <span className="font-bold text-xl" style={{ color: f.color }}>
                  {f.label} =
                </span>
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={vals[i]}
                  disabled={solved}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setVal(i, e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') check()
                  }}
                  className={`bk-input w-24 text-center ${fieldCheckClass(states[i])}`}
                  placeholder="?"
                  aria-label={`${f.label}-Wert`}
                />
                <button type="button" className="bk-seg-btn" style={{ minHeight: 40, padding: '0 12px' }} disabled={solved} onClick={() => flipSign(i)} aria-label="Vorzeichen wechseln">
                  ±
                </button>
              </div>
            ))}
          </div>

          <div className="bk-actions">
            {!solved && (
              <button type="button" onClick={check} className="bk-btn bk-btn-primary">
                Prüfen
              </button>
            )}
            {!solved && !exam && (
              <button type="button" onClick={showSolution} className="bk-btn">
                Lösungsweg zeigen
              </button>
            )}
            {solved && onNext && (
              <button type="button" onClick={onNext} className="bk-btn bk-btn-primary">
                {nextLabel}
              </button>
            )}
          </div>

          {msg && (
            <div className="bk-feedback bk-feedback-no" role="status">
              {msg}
            </div>
          )}
          {solved && (
            <div className="bk-feedback bk-feedback-ok" role="status">
              <span>
                {praise} {cfg.answerTex && (
                  <>
                    Das Ergebnis ist <M t={cfg.answerTex} />.
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {reveal && !exam && (
        <div className="bk-solution">
          <p className="bk-solution-title">Lösungsweg</p>
          {cfg.solution}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Auswahlaufgabe: Antwort antippen, wird sofort grün/rot.
// ---------------------------------------------------------------------------------------------

export interface McOption {
  key: string
  content: ReactNode
  correct?: boolean
  swap?: boolean
  why?: string
}

export interface McCfg {
  question: ReactNode
  visual?: ReactNode
  options: McOption[]
  explain: ReactNode
  layout?: 'list' | 'systems'
}

export function McTask({ cfg, topic, onDone, onNext, nextLabel = 'Nächste Aufgabe' }: TaskProps & { cfg: McCfg }) {
  const tracking = useTaskTracking(topic)
  const [picked, setPicked] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [praise] = useState(() => pick(PRAISE))
  const attempts = useRef(0)
  const swaps = useRef(0)

  const choose = (i: number) => {
    if (solved || picked.includes(i)) return
    const o = cfg.options[i]
    setPicked((p) => [...p, i])
    tracking.onInput()
    if (o.correct) {
      setSolved(true)
      tracking.onCheck(true)
      onDone?.({ firstTry: attempts.current === 0, swapped: swaps.current > 0 })
    } else {
      attempts.current += 1
      if (o.swap) swaps.current += 1
      tracking.onCheck(false)
    }
  }

  const last = picked.length > 0 ? cfg.options[picked[picked.length - 1]] : null
  const systems = cfg.layout === 'systems'

  return (
    <div className="bk-panel">
      <div className="bk-stack">
        <div className="bk-taskbox">{cfg.question}</div>
        {cfg.visual}
        <div className={systems ? 'grid gap-3 sm:grid-cols-2' : 'bk-ka-options'}>
          {cfg.options.map((o, i) => {
            const state = picked.includes(i) ? (o.correct ? 'bk-field-ok' : 'bk-field-no') : ''
            return (
              <button key={o.key} type="button" onClick={() => choose(i)} className={`bk-choice ${systems ? '' : 'bk-ka-option'} ${state}`} style={systems ? { flexDirection: 'column', padding: 8 } : undefined}>
                {systems ? <span className="font-bold">{LETTERS[i]}</span> : <b>{LETTERS[i]}</b>}
                {o.content}
              </button>
            )
          })}
        </div>

        {!solved && last && !last.correct && last.why && (
          <div className="bk-feedback bk-feedback-no" role="status">
            {last.why}
          </div>
        )}
        {solved && (
          <>
            <div className="bk-feedback bk-feedback-ok" role="status">
              <span>{praise}</span>
            </div>
            <div className="bk-solution" style={{ marginTop: 0 }}>
              {cfg.explain}
            </div>
            {onNext && (
              <div className="bk-actions">
                <button type="button" onClick={onNext} className="bk-btn bk-btn-primary">
                  {nextLabel}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Einzeichnen: Punkt im Koordinatensystem antippen.
// ---------------------------------------------------------------------------------------------

function diagnose(t: Pt, g: Pt): { text: string; swapped: boolean } {
  const where = `Du hast ${plain(g)} gesetzt.`
  if (g.x === t.y && g.y === t.x) {
    return { swapped: true, text: `${where} Das sind x und y vertauscht! Erst ${stepsX(t.x)} (x), dann ${stepsY(t.y)} (y).` }
  }
  if (g.x === -t.x && g.y === t.y) return { swapped: false, text: `${where} Der x-Wert liegt auf der falschen Seite der y-Achse: ${t.x < 0 ? 'negatives x heißt nach links' : 'positives x heißt nach rechts'}.` }
  if (g.y === -t.y && g.x === t.x) return { swapped: false, text: `${where} Der y-Wert liegt auf der falschen Seite der x-Achse: ${t.y < 0 ? 'negatives y heißt nach unten' : 'positives y heißt nach oben'}.` }
  if (g.x === -t.x && g.y === -t.y) return { swapped: false, text: `${where} Beide Vorzeichen sind falsch: Gehe ${stepsX(t.x)} und ${stepsY(t.y)}.` }
  if (g.x === t.x) return { swapped: false, text: `${where} Der x-Wert passt, beim y-Wert musst du ${stepsY(t.y)} gehen.` }
  if (g.y === t.y) return { swapped: false, text: `${where} Der y-Wert passt, beim x-Wert musst du ${stepsX(t.x)} gehen.` }
  return { swapped: false, text: `${where} Gehe vom Ursprung zuerst ${stepsX(t.x)} und dann ${stepsY(t.y)}.` }
}

export function PlotTask({
  name,
  target,
  placed = [],
  counter,
  note,
  topic,
  exam,
  onDone,
  onNext,
  nextLabel = 'Nächste Aufgabe',
}: TaskProps & { name: string; target: Pt; placed?: SysPoint[]; counter?: string; note?: ReactNode }) {
  const tracking = useTaskTracking(topic)
  const [guess, setGuess] = useState<Pt | null>(null)
  const [solved, setSolved] = useState(false)
  const [shown, setShown] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [praise] = useState(() => pick(PRAISE))
  const attempts = useRef(0)
  const swaps = useRef(0)

  const onPick = (p: Pt) => {
    if (solved) return
    tracking.onInput()
    setGuess(p)
    if (p.x === target.x && p.y === target.y) {
      setSolved(true)
      setMsg(null)
      tracking.onCheck(true)
      onDone?.({ firstTry: attempts.current === 0, swapped: swaps.current > 0 })
      return
    }
    attempts.current += 1
    tracking.onCheck(false)
    const d = diagnose(target, p)
    if (d.swapped) swaps.current += 1
    setMsg(`Leider falsch. ${d.text}`)
  }

  const showSolution = () => {
    if (!shown) {
      setShown(true)
      tracking.onHintShown()
    }
  }

  const points: SysPoint[] = [...placed]
  let segments = originPath({ x: 0, y: 0 })
  if (solved) {
    points.push({ ...target, label: name, color: '#16a34a' })
    segments = originPath(target)
  } else {
    if (guess) points.push({ ...guess, label: '?', color: '#dc2626' })
    if (shown) {
      points.push({ ...target, label: name, color: '#f59e0b', ring: true })
      segments = originPath(target)
    }
  }

  return (
    <div className="bk-panel">
      <div className="bk-stack">
        <div className="bk-taskbox">
          {counter && <span style={{ color: 'var(--ink-muted)', fontSize: 14 }}>{counter}</span>}
          <div>
            Zeichne den Punkt <M t={named(name, target)} /> ein. Tippe dazu auf die passende Stelle im Koordinatensystem.
          </div>
        </div>
        <CoordSystem points={points} segments={segments} onPick={solved ? undefined : onPick} />
        <div className="bk-actions">
          {!solved && !exam && (
            <button type="button" onClick={showSolution} className="bk-btn">
              Lösungsweg zeigen
            </button>
          )}
          {solved && onNext && (
            <button type="button" onClick={onNext} className="bk-btn bk-btn-primary">
              {nextLabel}
            </button>
          )}
        </div>
        {msg && (
          <div className="bk-feedback bk-feedback-no" role="status">
            {msg}
          </div>
        )}
        {solved && (
          <div className="bk-feedback bk-feedback-ok" role="status">
            <span>
              {praise} Der Punkt <M t={named(name, target)} /> liegt genau dort.
              {note && <> {note}</>}
            </span>
          </div>
        )}
      </div>
      {(shown || solved) && !exam && (
        <div className="bk-solution">
          <p className="bk-solution-title">Lösungsweg</p>
          <Way p={target} name={name} />
        </div>
      )}
    </div>
  )
}

export { CoordSystem }

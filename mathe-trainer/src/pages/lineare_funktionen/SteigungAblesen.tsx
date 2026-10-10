import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GeoGebraGraph from '../../components/GeoGebraGraph'
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import TaskShell from '../../components/layout/TaskShell'

const TOTAL_TASKS = 6

// Einfach: nur Ursprungsgeraden y = m·x, Fortgeschritten: Geraden y = m·x + t
type Level = 'einfach' | 'fortgeschritten'
const LEVEL_LABEL: Record<Level, string> = { einfach: 'Einfach', fortgeschritten: 'Fortgeschritten' }

const btnPrimary = 'bk-btn bk-btn-primary'
const btnSecondary = 'bk-btn'
const panel = 'bk-panel text-center'

// Sichtbarer Bereich im Graphen (quadratisch, damit die Kästchen quadratisch sind)
const VIEW: [number, number, number, number] = [-6.5, 6.5, -6.5, 6.5]

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Steigung als Bruch m = p / q (Δy / Δx), so dass das Steigungsdreieck auf Gitterpunkten liegt
type Line = { p: number; q: number; t: number }

const INT_SLOPES: Array<[number, number]> = [[1, 1], [2, 1], [3, 1], [4, 1]]
const FRACTION_SLOPES: Array<[number, number]> = [[1, 2], [3, 2], [5, 2], [1, 3], [2, 3], [4, 3], [1, 4], [3, 4]]

function makeLine(level: Level, [absP, q]: [number, number]): Line {
  const p = Math.random() < 0.5 ? absP : -absP
  if (level === 'einfach') return { p, q, t: 0 }
  // Schnittpunkt mit der y-Achse und der zweite Gitterpunkt (q | t + p) liegen im sichtbaren Bereich
  let t = 0
  while (t === 0 || Math.abs(t + p) > 5) t = randInt(-4, 4)
  return { p, q, t }
}

/** Startaufgaben einer Runde: zwei ganzzahlige Steigungen, dann vier Brüche, jeweils ohne Wiederholung. */
function makeRound(level: Level): Line[] {
  const ints = shuffle(INT_SLOPES).slice(0, 2)
  const fracs = shuffle(FRACTION_SLOPES).slice(0, TOTAL_TASKS - 2)
  return [...ints, ...fracs].map((s) => makeLine(level, s))
}

function randomLine(level: Level, notSlope?: number): Line {
  const pool = [...INT_SLOPES, ...FRACTION_SLOPES]
  let line: Line
  do line = makeLine(level, pool[Math.floor(Math.random() * pool.length)])
  while (notSlope !== undefined && line.p / line.q === notSlope)
  return line
}

const fmt = (n: number) => String(Math.round(n * 1000) / 1000).replace('.', ',').replace('-', '−')

/** Eingabe als Dezimalzahl ("1,5", "-0.75") oder als Bruch ("2/3", "-3/4", "−3 / −4"). */
function parseSlope(raw: string): number {
  const s = raw.trim().replace(/[:÷]/g, '/')
  if (s.includes('/')) {
    const parts = s.split('/')
    if (parts.length !== 2) return NaN
    const num = parseFlexibleNumber(parts[0])
    const den = parseFlexibleNumber(parts[1])
    if (Number.isNaN(num) || Number.isNaN(den) || den === 0) return NaN
    return num / den
  }
  return parseFlexibleNumber(s)
}

type Status = 'idle' | 'right' | 'wrong'

function slopeStatus(raw: string, m: number): Status {
  const s = raw.trim()
  if (s === '' || /^[+\-−–—‐,./]$/.test(s) || /\/\s*[+\-−–—‐]?$/.test(s)) return 'idle'
  const v = parseSlope(s)
  if (Number.isNaN(v)) return 'wrong'
  // Gerundete Dezimalzahlen wie 0,67 für 2/3 werden akzeptiert
  return Math.abs(v - m) < 0.011 ? 'right' : 'wrong'
}

function wrongHint(raw: string, m: number): string {
  const v = parseSlope(raw)
  if (Number.isNaN(v)) return 'Gib eine Zahl oder einen Bruch ein, z. B. 2/3 oder −1,5.'
  if (Math.abs(v + m) < 0.011) return 'Das Vorzeichen stimmt nicht. Steigt oder fällt die Gerade?'
  if (v !== 0 && Math.abs(1 / v - m) < 0.011) return 'Hast du Δx und Δy vertauscht? Es gilt m = Δy : Δx.'
  return 'Noch nicht richtig. Zeichne dir ein Steigungsdreieck ein.'
}

// Bruch in HTML
function Frac({ num, den }: { num: React.ReactNode; den: React.ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle mx-1">
      <span className="px-1 leading-tight">{num}</span>
      <span className="px-1 leading-tight border-t-2 border-slate-700">{den}</span>
    </span>
  )
}

/** m = p/q als gekürzter Bruch bzw. ganze Zahl, bei abbrechenden Dezimalzahlen zusätzlich als Dezimalzahl. */
function SlopeValue({ p, q }: { p: number; q: number }) {
  if (q === 1) return <strong>{fmt(p)}</strong>
  const decimal = q === 2 || q === 4 ? <> = <strong>{fmt(p / q)}</strong></> : <> ≈ {fmt(Math.round((p / q) * 100) / 100)}</>
  return (
    <>
      {p < 0 && '−'}
      <Frac num={<strong>{Math.abs(p)}</strong>} den={<strong>{q}</strong>} />
      {decimal}
    </>
  )
}

// ---------- Eine Aufgabe ----------

interface CardProps {
  number: number
  initial: Line
  level: Level
  onSolvedChange: (solved: boolean) => void
  onResult: (correct: boolean) => void
  onHelp: () => void
}

function TaskCard({ number, initial, level, onSolvedChange, onResult, onHelp }: CardProps) {
  const tracking = useTaskTracking(`Steigung ablesen (${LEVEL_LABEL[level]})`)
  const [line, setLine] = useState<Line>(initial)
  const [input, setInput] = useState('')
  const [solved, setSolved] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const { p, q, t } = line
  const m = p / q
  const status = slopeStatus(input, m)

  // Graph-Größe folgt der verfügbaren Breite (in 40-px-Schritten, damit der Graph nicht bei jedem Pixel neu lädt)
  const boxRef = useRef<HTMLDivElement>(null)
  const [graphSize, setGraphSize] = useState(400)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth - 24
      setGraphSize(Math.max(240, Math.min(480, Math.floor(w / 40) * 40)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (solved) return
    if (status === 'right') {
      setSolved(true)
      tracking.onCheck(true)
      onResult(true)
      onSolvedChange(true)
      return
    }
    if (status === 'wrong') {
      // Ein falscher Versuch zählt erst, wenn die Eingabe kurz stehen bleibt
      const timer = setTimeout(() => {
        tracking.onCheck(false)
        onResult(false)
      }, 900)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, solved])

  function newTask() {
    tracking.onTaskStart()
    onSolvedChange(false)
    setSolved(false)
    setShowSolution(false)
    setInput('')
    setLine(randomLine(level, m))
  }

  function onShowAnswer() {
    setShowSolution(true)
    onHelp()
    tracking.onHintShown()
  }

  // Steigungsdreieck ab dem Schnittpunkt mit der y-Achse, so weit nach rechts wie der Nenner
  const triangle = showSolution || solved ? { x1: 0, dx: q } : null
  const start = `(0|${fmt(t)})`
  const end = `(${q}|${fmt(t + p)})`

  const border = status === 'right' ? 'border-green-500 bg-green-50' : status === 'wrong' ? 'border-red-500 bg-red-50' : 'border-slate-300'

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}: Steigung ablesen</h2>
      <p className="text-slate-700 mb-4">
        Lies die Steigung m der Geraden mit einem Steigungsdreieck ab. Du kannst sie als Bruch (z. B. 2/3) oder als Dezimalzahl eingeben.
      </p>

      <div ref={boxRef} className="flex justify-center mb-4 w-full overflow-hidden">
        <div key={graphSize}>
          <GeoGebraGraph m={m} t={t} width={graphSize} height={graphSize} grid view={VIEW} triangle={triangle} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="font-semibold text-slate-800">m =</span>
        <input
          value={input}
          readOnly={solved}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInput(e.target.value)
            tracking.onInput()
          }}
          className={`w-40 text-center border-2 rounded px-3 py-2 focus:outline-none ${border}`}
          placeholder="z. B. 2/3"
        />
      </div>
      {status === 'right' && <p className="text-center font-bold mt-3 text-green-600">Richtig! Super gemacht!</p>}
      {status === 'wrong' && <p className="text-center font-bold mt-3 text-red-600">{wrongHint(input, m)}</p>}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={newTask} className={btnSecondary}>Neue Aufgabe</button>
        <button onClick={onShowAnswer} className={btnSecondary}>Lösung anzeigen</button>
      </div>

      {showSolution && (
        <div className="mt-6 bk-taskbox text-left">
          <h3 className="text-base font-bold text-slate-800 text-center mb-2">Lösungsweg</h3>
          <ol className="list-decimal pl-5 space-y-1 text-slate-700">
            <li>
              {t === 0 ? (
                <>Die Ursprungsgerade geht durch den Punkt <strong>O(0|0)</strong>. Dort startest du.</>
              ) : (
                <>Die Gerade schneidet die y-Achse im Punkt <strong>{start}</strong>. Dort startest du.</>
              )}
            </li>
            <li>
              Gehe <span className="text-green-700 font-semibold">{q} Kästchen nach rechts</span>:{' '}
              <span className="text-green-700 font-semibold">Δx = {q}</span>.
            </li>
            <li>
              Gehe dann <span className="text-red-700 font-semibold">{Math.abs(p)} Kästchen nach {p > 0 ? 'oben' : 'unten'}</span>, bis du
              wieder genau auf der Geraden bist (Punkt <strong>{end}</strong>):{' '}
              <span className="text-red-700 font-semibold">Δy = {fmt(p)}</span>.
            </li>
          </ol>
          <p className="text-center text-lg font-serif my-3">
            <i>m</i> =
            <Frac num={<span className="text-red-700">Δ<i>y</i></span>} den={<span className="text-green-700">Δ<i>x</i></span>} />=
            <Frac num={<span className="text-red-700">{fmt(p)}</span>} den={<span className="text-green-700">{q}</span>} />= <SlopeValue p={p} q={q} />
          </p>
          <p className="text-sm text-slate-600 text-center">Das Steigungsdreieck ist jetzt im Graphen eingezeichnet.</p>
        </div>
      )}
    </div>
  )
}

// ---------- Erklärung ----------

const SX = 36 // Pixel pro Einheit
const X_MIN = -1, X_MAX = 5, Y_MIN = -3, Y_MAX = 5
const toPx = (x: number, y: number) => ({ px: (x - X_MIN) * SX, py: (Y_MAX - y) * SX })

/** Beispielgraph mit Steigungsdreieck ab (0|t): Δx = q nach rechts, Δy = p nach oben bzw. unten. */
function ExampleGraph({ p, q, t, label }: { p: number; q: number; t: number; label: string }) {
  const w = (X_MAX - X_MIN) * SX
  const h = (Y_MAX - Y_MIN) * SX
  const m = p / q
  const o = toPx(0, 0)
  const a = toPx(0, t)
  const c = toPx(q, t)
  const b = toPx(q, t + p)
  // Gerade bis zum Rand des Bereichs zeichnen
  const xAt = (y: number) => (y - t) / m
  const xl = Math.max(X_MIN, Math.min(xAt(Y_MIN), xAt(Y_MAX)))
  const xr = Math.min(X_MAX, Math.max(xAt(Y_MIN), xAt(Y_MAX)))
  const lineStart = toPx(xl, m * xl + t)
  const lineEnd = toPx(xr, m * xr + t)
  const xs = Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => X_MIN + i)
  const ys = Array.from({ length: Y_MAX - Y_MIN + 1 }, (_, i) => Y_MIN + i)
  const rising = p > 0
  return (
    <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} className="w-full max-w-[16rem] mx-auto" role="img" aria-label={`Gerade ${label} mit Steigungsdreieck`}>
      {xs.map((x) => (
        <line key={`gx${x}`} x1={toPx(x, 0).px} y1={0} x2={toPx(x, 0).px} y2={h} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {ys.map((y) => (
        <line key={`gy${y}`} x1={0} y1={toPx(0, y).py} x2={w} y2={toPx(0, y).py} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      <line x1={0} y1={o.py} x2={w} y2={o.py} stroke="#334155" strokeWidth={1.5} />
      <line x1={o.px} y1={h} x2={o.px} y2={0} stroke="#334155" strokeWidth={1.5} />
      <text x={w - 4} y={o.py - 6} fontSize={13} textAnchor="end" fill="#334155">x</text>
      <text x={o.px + 6} y={12} fontSize={13} fill="#334155">y</text>
      {xs.filter((x) => x !== 0).map((x) => (
        <text key={`lx${x}`} x={toPx(x, 0).px} y={o.py + 14} fontSize={10} textAnchor="middle" fill="#64748b">{x}</text>
      ))}
      {ys.filter((y) => y !== 0).map((y) => (
        <text key={`ly${y}`} x={o.px - 5} y={toPx(0, y).py + 3} fontSize={10} textAnchor="end" fill="#64748b">{y}</text>
      ))}
      <line x1={lineStart.px} y1={lineStart.py} x2={lineEnd.px} y2={lineEnd.py} stroke="#2563eb" strokeWidth={2.5} />
      <line x1={a.px} y1={a.py} x2={c.px} y2={c.py} stroke="#16a34a" strokeWidth={3} />
      <line x1={c.px} y1={c.py} x2={b.px} y2={b.py} stroke="#dc2626" strokeWidth={3} />
      <text x={(a.px + c.px) / 2} y={rising ? a.py + 16 : a.py - 7} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#16a34a">Δx = {q}</text>
      <text x={c.px + 5} y={(c.py + b.py) / 2 + 4} fontSize={12} fontWeight="bold" fill="#dc2626">Δy = {fmt(p)}</text>
      <circle cx={a.px} cy={a.py} r={4} fill="#1e293b" />
      <circle cx={b.px} cy={b.py} r={4} fill="#1e293b" />
      <text x={w / 2} y={h + 8} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#2563eb">{label}</text>
    </svg>
  )
}

function Erklaerung({ level }: { level: Level }) {
  const easy = level === 'einfach'
  // Beispiele passend zum Schwierigkeitsgrad: eine steigende und eine fallende Gerade
  const ex1 = easy ? { p: 2, q: 3, t: 0, label: 'y = ⅔x' } : { p: 1, q: 2, t: 1, label: 'y = ½x + 1' }
  const ex2 = easy ? { p: -2, q: 1, t: 0, label: 'y = −2x' } : { p: -3, q: 2, t: 3, label: 'y = −1,5x + 3' }
  return (
    <div className="bk-panel">
      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">So liest du die Steigung ab</h2>
      <p className="text-slate-700 mb-3">
        Die Steigung m gibt an, um wie viel sich y ändert, wenn du auf der Geraden nach rechts gehst. Aus einem Graphen liest du sie mit
        einem <strong>Steigungsdreieck</strong> ab:
      </p>
      <ol className="list-decimal pl-5 space-y-1 text-slate-700 mb-3">
        <li>
          Suche einen Punkt, der <strong>genau auf einer Gitterkreuzung</strong> liegt.{' '}
          {easy ? 'Bei einer Ursprungsgeraden ist das immer O(0|0).' : 'Oft eignet sich der Schnittpunkt mit der y-Achse (0|t).'}
        </li>
        <li>
          Gehe von dort waagrecht <span className="text-green-700 font-semibold">nach rechts</span>, bis du unter bzw. über dem nächsten Punkt
          bist, der wieder genau auf einer Gitterkreuzung liegt. Das ist <span className="text-green-700 font-semibold">Δx</span>.
        </li>
        <li>
          Gehe dann senkrecht bis zur Geraden: <span className="text-red-700 font-semibold">nach oben ist Δy positiv</span>,{' '}
          <span className="text-red-700 font-semibold">nach unten ist Δy negativ</span>.
        </li>
        <li>Teile: m = Δy : Δx. Fertig ist die Steigung.</li>
      </ol>
      <p className="text-center text-lg font-serif my-3">
        <i>m</i> =
        <Frac num={<span className="text-red-700">Δ<i>y</i></span>} den={<span className="text-green-700">Δ<i>x</i></span>} />
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {[ex1, ex2].map((ex) => (
          <div key={ex.label} className="border border-slate-200 rounded-lg p-3">
            <ExampleGraph {...ex} />
            <p className="text-center text-lg font-serif mt-2">
              <i>m</i> =
              <Frac num={<span className="text-red-700">{fmt(ex.p)}</span>} den={<span className="text-green-700">{ex.q}</span>} />={' '}
              <SlopeValue p={ex.p} q={ex.q} />
            </p>
            <p className="text-sm text-slate-600 text-center">
              {ex.q} nach rechts, {Math.abs(ex.p)} nach {ex.p > 0 ? 'oben: Die Gerade steigt.' : 'unten: Die Gerade fällt.'}
            </p>
          </div>
        ))}
      </div>
      <ul className="list-disc pl-5 mt-4 text-slate-700 space-y-1 text-sm">
        <li>Gehe immer nach <strong>rechts</strong>. Dann zeigt dir die Richtung nach oben oder unten das Vorzeichen von m.</li>
        <li>Tipp: Gehst du genau 1 Kästchen nach rechts, kannst du m direkt als Δy ablesen. Bei Brüchen brauchst du aber meist mehr Kästchen.</li>
        <li>Du kannst das Ergebnis als Bruch (z. B. 2/3 oder −3/4) oder als Dezimalzahl eingeben.</li>
      </ul>
    </div>
  )
}

// ---------- Seite: sechs Aufgaben auf einmal ----------

export default function SteigungAblesen() {
  const navigate = useNavigate()
  const [level, setLevel] = useState<Level | null>(null)
  const [round, setRound] = useState(0)
  const [lines, setLines] = useState<Line[]>([])
  const [solved, setSolved] = useState<Record<number, boolean>>({})
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)

  const solvedCount = Object.values(solved).filter(Boolean).length
  const allSolved = solvedCount === TOTAL_TASKS

  const completionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved])

  const startNewRound = (lvl: Level | null = level) => {
    setRound((r) => r + 1)
    setSolved({})
    setFinished(false)
    if (lvl) setLines(makeRound(lvl))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chooseLevel = (next: Level | null) => {
    setLevel(next)
    startNewRound(next)
    setStreak(0)
  }

  const header = (
    <div>
      <p className="text-center text-slate-600">Bestimme die Steigung m einer Geraden mit einem Steigungsdreieck.</p>
    </div>
  )

  if (!level) {
    return (
      <TaskShell title="Die Steigung m ablesen" width="narrow">
        <div className="flex flex-col gap-6">
          {header}
          <div className={panel}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Wähle deinen Schwierigkeitsgrad</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => chooseLevel('einfach')}
                className="rounded-2xl bg-green-600 hover:bg-green-700 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-lg font-bold mb-1 text-white">1. Einfach</p>
                <p className="text-xl font-serif italic mb-2 text-white">y = m · x</p>
                <p className="text-sm text-white/90">Nur Ursprungsgeraden: Alle Geraden gehen durch den Punkt O(0|0).</p>
              </button>
              <button
                onClick={() => chooseLevel('fortgeschritten')}
                className="rounded-2xl bg-red-600 hover:bg-red-700 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-lg font-bold mb-1 text-white">2. Fortgeschritten</p>
                <p className="text-xl font-serif italic mb-2 text-white">y = m · x + t</p>
                <p className="text-sm text-white/90">Geraden, die die y-Achse an einer anderen Stelle schneiden.</p>
              </button>
            </div>
          </div>
        </div>
      </TaskShell>
    )
  }

  return (
    <TaskShell title="Die Steigung m ablesen" width="narrow">
        <div className="flex flex-col gap-6">
        {header}
        <Erklaerung level={level} />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
            Schwierigkeitsgrad: {LEVEL_LABEL[level]} ({level === 'einfach' ? 'y = m · x' : 'y = m · x + t'})
          </span>
          <button onClick={() => chooseLevel(null)} className="text-blue-600 hover:underline text-sm font-semibold">
            Schwierigkeitsgrad wechseln
          </button>
        </div>

        {lines.map((line, i) => (
          // Die Karten bleiben nach einem Neustart per key getrennt (frischer Zustand, eigenes Tracking)
          <TaskCard
            key={`${level}-${round}-${i}`}
            number={i + 1}
            initial={line}
            level={level}
            onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
            onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
            onHelp={() => setStreak(0)}
          />
        ))}

        <div className="flex justify-center gap-3 flex-wrap">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
            Gelöst: {solvedCount} / {TOTAL_TASKS}
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">Richtig in Folge: {streak}</div>
        </div>

        {allSolved && (
          <div ref={completionRef} className="bg-green-50 border-2 border-green-400 rounded-xl p-6 text-center">
            {finished ? (
              <>
                <p className="text-green-800 font-semibold mb-4">Alles klar – bis zum nächsten Mal!</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => startNewRound()} className={btnPrimary}>Doch noch neue Aufgaben</button>
                  <button onClick={() => navigate('/lineare_funktionen/steigung/berechnen')} className={btnSecondary}>
                    Weiter: Steigung berechnen
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-green-800 text-lg font-semibold mb-1">Super, toll gemacht!</p>
                <p className="text-green-800 mb-4">Du hast alle {TOTAL_TASKS} Aufgaben richtig gelöst.</p>
                <p className="text-slate-700 mb-4">Möchtest du neue Aufgaben üben oder hörst du hier auf?</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => startNewRound()} className={btnPrimary}>Neue Aufgaben</button>
                  <button onClick={() => setFinished(true)} className={btnSecondary}>Fertig für heute</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </TaskShell>
  )
}

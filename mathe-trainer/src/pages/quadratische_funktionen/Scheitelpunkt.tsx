import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Sieben Aufgaben gleichzeitig auf der Seite
const TOTAL_TASKS = 7

const VIDEO_ID = 'Im1FRd6_o-w'

// Einfach: a = 1 oder a = −1, ganzzahliger Scheitelpunkt
// Fortgeschritten: andere Streckfaktoren, Scheitelpunkt auch mit Kommazahlen
type Level = 'einfach' | 'fortgeschritten'

const LEVEL_LABEL: Record<Level, string> = { einfach: 'Einfach', fortgeschritten: 'Fortgeschritten' }

const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors'
const btnSecondary = 'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors'
const panel = 'text-center bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200'

const PRAISE = [
  'Richtig! Super gemacht!',
  'Klasse, das stimmt!',
  'Perfekt gelöst!',
  'Sehr gut, weiter so!',
  'Stark! Genau richtig!',
  'Prima, du hast es drauf!',
]

function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

const round2 = (n: number) => Math.round(n * 100) / 100

// Zahl mit deutschem Dezimalkomma und echtem Minuszeichen
const fmt = (n: number) => {
  const r = round2(n)
  return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',')
}

// Zahl in Klammern, wenn negativ (für Einsetzen)
const fmtP = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n))

/** f(x) = ax² + bx + c als Text, z. B. "f(x) = −2x² + 4x − 1" */
function formatGeneral(a: number, b: number, c: number) {
  let s = a === 1 ? 'x²' : a === -1 ? '−x²' : `${fmt(a)}x²`
  if (b !== 0) s += ` ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : fmt(Math.abs(b))}x`
  if (c !== 0) s += ` ${c < 0 ? '−' : '+'} ${fmt(Math.abs(c))}`
  return `f(x) = ${s}`
}

interface Task {
  a: number
  b: number
  c: number
  xs: number
  ys: number
}

function newTask(level: Level): Task {
  let a: number, xs: number
  if (level === 'einfach') {
    a = pick([1, -1])
    do xs = randomInt(5, -5)
    while (xs === 0)
  } else {
    a = pick([2, -2, 3, -3, 0.5, -0.5, 1, -1])
    // x_s so wählen, dass b = −2a·x_s ganzzahlig ist (bei a = ±1, ±2, ±3 auch halbe x-Werte)
    const candidates = Array.from({ length: 17 }, (_, i) => (i - 8) / 2).filter(
      (x) => x !== 0 && Number.isInteger(-2 * a * x) && Math.abs(-2 * a * x) <= 18,
    )
    // bei a = ±1 bevorzugt halbe x-Werte, sonst wäre die Aufgabe wie in "Einfach"
    const halves = candidates.filter((x) => !Number.isInteger(x))
    xs = Math.abs(a) === 1 && halves.length ? pick(halves) : pick(candidates)
  }
  const b = -2 * a * xs
  let c: number
  do c = randomInt(9, -9)
  while (c === 0)
  const ys = round2(a * xs * xs + b * xs + c)
  return { a, b, c, xs, ys }
}

// ---------- Live-Auswertung einer Eingabe ----------

const parseAnswer = (raw: string) => parseFloat(raw.replace(',', '.').replace(/[−–—‐]/g, '-'))

type AnswerStatus = 'idle' | 'right' | 'wrong'

function getStatus(input: string, correct: number): AnswerStatus {
  const trimmed = input.trim()
  if (trimmed === '' || trimmed === '-' || trimmed === '−' || trimmed === ',' || trimmed === '.') return 'idle'
  const parsed = parseAnswer(input)
  if (Number.isNaN(parsed)) return 'idle'
  return Math.abs(parsed - correct) < 0.01 ? 'right' : 'wrong'
}

function CoordInput({
  value,
  status,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string
  status: AnswerStatus
  onChange: (v: string) => void
  placeholder: string
  readOnly: boolean
}) {
  const border =
    status === 'right' ? 'border-green-500 bg-green-50 text-green-800' : status === 'wrong' ? 'border-red-500 bg-red-50 text-red-800' : 'border-slate-300'
  return (
    <input
      value={value}
      readOnly={readOnly}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className={`w-24 text-center border-2 rounded px-2 py-2 text-lg focus:outline-none transition-colors ${border}`}
      placeholder={placeholder}
      inputMode="decimal"
      aria-label={`${placeholder}-Koordinate des Scheitelpunkts`}
    />
  )
}

// ---------- Lösungsweg ----------

function SolutionSteps({ task }: { task: Task }) {
  const { a, b, c, xs, ys } = task
  const t1 = round2(a * xs * xs)
  const t2 = round2(b * xs)
  return (
    <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50 text-left text-slate-700 space-y-3">
      <h3 className="text-base font-bold text-slate-800 text-center">Lösungsweg</h3>
      <p>
        Ablesen: a = {fmt(a)}, b = {fmt(b)}, c = {fmt(c)}
      </p>
      <div>
        <p className="font-semibold text-slate-800">Schritt 1: x-Koordinate berechnen</p>
        <p className="font-serif text-lg">
          x<sub>S</sub> = −b / (2 · a) = −{fmtP(b)} / (2 · {fmtP(a)}) = {fmt(-b)} / {fmt(2 * a)} = <strong>{fmt(xs)}</strong>
        </p>
      </div>
      <div>
        <p className="font-semibold text-slate-800">Schritt 2: x<sub>S</sub> in f(x) einsetzen</p>
        <p className="font-serif text-lg">
          y<sub>S</sub> = f({fmt(xs)}) = {fmt(a)} · {fmtP(xs)}² {b < 0 ? '−' : '+'} {fmt(Math.abs(b))} · {fmtP(xs)} {c < 0 ? '−' : '+'} {fmt(Math.abs(c))}
        </p>
        <p className="font-serif text-lg">
          y<sub>S</sub> = {fmt(t1)} {t2 < 0 ? '−' : '+'} {fmt(Math.abs(t2))} {c < 0 ? '−' : '+'} {fmt(Math.abs(c))} = <strong>{fmt(ys)}</strong>
        </p>
      </div>
      <p className="font-bold text-slate-800 text-center text-lg">
        S({fmt(xs)} | {fmt(ys)})
      </p>
    </div>
  )
}

// ---------- Aufgabenkarte ----------

interface CardProps {
  number: number
  level: Level
  onSolvedChange: (solved: boolean) => void
  onResult: (correct: boolean) => void
  onHelp: () => void
}

function TaskCard({ number, level, onSolvedChange, onResult, onHelp }: CardProps) {
  const [task, setTask] = useState(() => newTask(level))
  const [xIn, setXIn] = useState('')
  const [yIn, setYIn] = useState('')
  const [solved, setSolved] = useState(false)
  const [praise, setPraise] = useState(PRAISE[0])
  const [showSolution, setShowSolution] = useState(false)

  const xStatus = getStatus(xIn, task.xs)
  const yStatus = getStatus(yIn, task.ys)
  const bothRight = xStatus === 'right' && yStatus === 'right'
  const anyWrong = xStatus === 'wrong' || yStatus === 'wrong'

  useEffect(() => {
    if (solved) return
    if (bothRight) {
      setSolved(true)
      setPraise(pick(PRAISE))
      setShowSolution(false)
      onSolvedChange(true)
      onResult(true)
      return
    }
    // Falscher Versuch zählt erst, wenn die Eingabe kurz stehen bleibt
    if (anyWrong && xStatus !== 'idle' && yStatus !== 'idle') {
      const timer = setTimeout(() => onResult(false), 900)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xIn, yIn, solved])

  function generateNewTask() {
    setTask(newTask(level))
    setXIn('')
    setYIn('')
    setSolved(false)
    setShowSolution(false)
    onSolvedChange(false)
  }

  function onShowSolution() {
    setShowSolution(true)
    onHelp()
  }

  let message: React.ReactNode = null
  if (solved) {
    message = <p className="text-center font-bold mt-3 text-green-600">{praise}</p>
  } else if (xStatus === 'right' && yStatus !== 'right') {
    message = (
      <p className={`text-center font-bold mt-3 ${yStatus === 'wrong' ? 'text-red-600' : 'text-green-600'}`}>
        {yStatus === 'wrong' ? 'x stimmt, aber y ist noch nicht richtig. Setze x' : 'Gut, x stimmt! Jetzt noch y: Setze x'}
        <sub>S</sub> in f(x) ein.
      </p>
    )
  } else if (xStatus === 'wrong') {
    message = (
      <p className="text-center font-bold mt-3 text-red-600">
        x ist noch nicht richtig. Tipp: x<sub>S</sub> = −b / (2a)
      </p>
    )
  } else if (yStatus === 'wrong') {
    message = <p className="text-center font-bold mt-3 text-red-600">y ist noch nicht richtig.</p>
  }

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}</h2>
      <p className="text-slate-700 mb-1">
        Berechne den Scheitelpunkt S der Parabel.
        {level === 'fortgeschritten' && ' Runde, falls nötig, auf zwei Nachkommastellen.'}
      </p>
      <p className="text-center text-2xl font-serif text-slate-800 my-4">{formatGeneral(task.a, task.b, task.c)}</p>

      <div className="flex items-center justify-center gap-2 text-2xl text-slate-800">
        <span className="font-serif">S(</span>
        <CoordInput value={xIn} status={xStatus} onChange={setXIn} placeholder="x" readOnly={solved} />
        <span>|</span>
        <CoordInput value={yIn} status={yStatus} onChange={setYIn} placeholder="y" readOnly={solved} />
        <span className="font-serif">)</span>
      </div>

      {message}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={generateNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button onClick={onShowSolution} className={btnSecondary}>Lösung anzeigen</button>
      </div>

      {showSolution && <SolutionSteps task={task} />}
    </div>
  )
}

// ---------- Erklärung mit Beispiel (Graph + Rechnung) und Erklärvideo ----------

// Beispiel: f(x) = x² − 4x + 1  →  S(2 | −3)
const SX = 32 // Pixel pro Einheit
const X_MIN = -2, X_MAX = 6, Y_MIN = -4, Y_MAX = 6
const toPx = (x: number, y: number) => ({ px: (x - X_MIN) * SX, py: (Y_MAX - y) * SX })
const exampleF = (x: number) => x * x - 4 * x + 1

function ExampleGraph() {
  const w = (X_MAX - X_MIN) * SX
  const h = (Y_MAX - Y_MIN) * SX
  const o = toPx(0, 0)
  const s = toPx(2, -3)
  const xs = Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => X_MIN + i)
  const ys = Array.from({ length: Y_MAX - Y_MIN + 1 }, (_, i) => Y_MIN + i)
  // Parabel nur im sichtbaren Bereich zeichnen
  const pts: string[] = []
  for (let x = -0.4; x <= 4.4; x += 0.05) {
    const p = toPx(x, exampleF(x))
    pts.push(`${p.px.toFixed(1)},${p.py.toFixed(1)}`)
  }
  return (
    <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} className="w-full max-w-xs mx-auto" role="img" aria-label="Parabel f(x) = x² − 4x + 1 mit Scheitelpunkt S(2|−3)">
      {xs.map((x) => (
        <line key={`gx${x}`} x1={toPx(x, 0).px} y1={0} x2={toPx(x, 0).px} y2={h} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {ys.map((y) => (
        <line key={`gy${y}`} x1={0} y1={toPx(0, y).py} x2={w} y2={toPx(0, y).py} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {/* Achsen */}
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
      {/* Symmetrieachse x = 2 */}
      <line x1={s.px} y1={0} x2={s.px} y2={h} stroke="#16a34a" strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={s.px + 5} y={14} fontSize={11} fontWeight="bold" fill="#16a34a">x = 2</text>
      {/* Parabel */}
      <polyline points={pts.join(' ')} fill="none" stroke="#2563eb" strokeWidth={2.5} />
      {/* Scheitelpunkt */}
      <circle cx={s.px} cy={s.py} r={5} fill="#dc2626" />
      <text x={s.px + 8} y={s.py + 4} fontSize={12} fontWeight="bold" fill="#dc2626">S(2|−3)</text>
    </svg>
  )
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

function Erklaerung() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">So berechnest du den Scheitelpunkt</h2>
      <p className="text-slate-700 mb-3">
        Der <strong>Scheitelpunkt S</strong> ist der höchste oder tiefste Punkt einer Parabel. Ist die Funktion in der{' '}
        <strong>allgemeinen Form</strong> f(x) = ax² + bx + c gegeben, berechnest du ihn in zwei Schritten:
      </p>
      <ol className="list-decimal pl-5 text-slate-700 space-y-2 mb-3 text-left">
        <li>
          <span className="text-green-700 font-semibold">x-Koordinate</span> mit der Formel berechnen:
          <span className="block text-center text-lg font-serif my-2">
            <i>x</i><sub>S</sub> = <Frac num={<>−<i>b</i></>} den={<>2 · <i>a</i></>} />
          </span>
        </li>
        <li>
          <span className="text-red-700 font-semibold">y-Koordinate</span>: x<sub>S</sub> in die Funktionsgleichung einsetzen:{' '}
          <span className="font-serif">y<sub>S</sub> = f(x<sub>S</sub>)</span>
        </li>
      </ol>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-3">
        <ExampleGraph />
        <div className="text-left">
          <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
          <p className="text-slate-700 mb-2 font-serif text-lg">f(x) = x² − 4x + 1</p>
          <p className="text-slate-700 mb-2">a = 1, b = −4, c = 1</p>
          <p className="text-slate-700 font-serif">
            <span className="text-green-700 font-semibold">x<sub>S</sub></span> =
            <Frac num="−(−4)" den="2 · 1" />= <Frac num="4" den="2" />= <strong className="text-green-700">2</strong>
          </p>
          <p className="text-slate-700 font-serif mt-2">
            <span className="text-red-700 font-semibold">y<sub>S</sub></span> = f(2) = 2² − 4 · 2 + 1 = 4 − 8 + 1 ={' '}
            <strong className="text-red-700">−3</strong>
          </p>
          <p className="text-slate-800 font-bold mt-3">Der Scheitelpunkt ist S(2 | −3).</p>
        </div>
      </div>
      <ul className="list-disc pl-5 mt-3 text-slate-700 space-y-1 text-sm text-left">
        <li>a &gt; 0: Die Parabel ist nach oben geöffnet, S ist der tiefste Punkt. a &lt; 0: nach unten geöffnet, S ist der höchste Punkt.</li>
        <li>Achte auf Vorzeichen: Ist b negativ, wird −b positiv, z. B. −(−4) = 4.</li>
        <li>Beim Einsetzen negative Zahlen in Klammern setzen: (−3)² = 9, aber −3² = −9.</li>
      </ul>
      <h3 className="text-base font-bold text-slate-800 mt-5 mb-2 text-center">Erklärvideo</h3>
      <div className="max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden border border-slate-200">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${VIDEO_ID}`}
          title="Erklärvideo: Scheitelpunkt berechnen"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

// ---------- Seite: sieben Aufgaben auf einmal ----------

export default function Scheitelpunkt() {
  const navigate = useNavigate()
  const [level, setLevel] = useState<Level | null>(null)
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState<Record<number, boolean>>({})
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)

  const solvedCount = Object.values(solved).filter(Boolean).length
  const allSolved = solvedCount === TOTAL_TASKS

  const completionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved])

  const startNewRound = () => {
    setRound((r) => r + 1)
    setSolved({})
    setFinished(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chooseLevel = (next: Level | null) => {
    setLevel(next)
    startNewRound()
    setStreak(0)
  }

  const header = (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Scheitelpunkt berechnen</h1>
      <p className="text-center text-slate-600">Berechne den Scheitelpunkt einer Parabel aus der allgemeinen Form f(x) = ax² + bx + c.</p>
    </div>
  )

  if (!level) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="mx-auto px-4 py-8 max-w-3xl w-full flex flex-col gap-6">
          {header}
          <div className={panel}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Wähle deinen Schwierigkeitsgrad</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => chooseLevel('einfach')}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white p-5 shadow-sm transition-colors"
              >
                <p className="text-lg font-bold mb-1 text-white">Einfach</p>
                <p className="text-xl font-serif italic mb-2 text-white">f(x) = ±x² + bx + c</p>
                <p className="text-sm text-white/90">Ohne Streckfaktor (a = 1 oder a = −1), der Scheitelpunkt hat ganzzahlige Koordinaten.</p>
              </button>
              <button
                onClick={() => chooseLevel('fortgeschritten')}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white p-5 shadow-sm transition-colors"
              >
                <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                <p className="text-xl font-serif italic mb-2 text-white">f(x) = ax² + bx + c</p>
                <p className="text-sm text-white/90">Mit Streckfaktor a, der Scheitelpunkt kann auch Kommazahlen enthalten.</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-8 max-w-3xl w-full flex flex-col gap-6">
        {header}
        <Erklaerung />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
            Schwierigkeitsgrad: {LEVEL_LABEL[level]}
          </span>
          <button onClick={() => chooseLevel(null)} className="text-blue-600 hover:underline text-sm font-semibold">
            Schwierigkeitsgrad wechseln
          </button>
        </div>

        {Array.from({ length: TOTAL_TASKS }, (_, i) => (
          // Nach einem Neustart per key getrennt (frischer Zustand)
          <React.Fragment key={`${level}-${round}-${i}`}>
            <TaskCard
              number={i + 1}
              level={level}
              onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
              onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
              onHelp={() => setStreak(0)}
            />
          </React.Fragment>
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
                  <button onClick={startNewRound} className={btnPrimary}>Doch noch neue Aufgaben</button>
                  <button onClick={() => navigate('/quadratische_funktionen')} className={btnSecondary}>Zur Übersicht</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-green-800 text-lg font-semibold mb-1">Super, toll gemacht!</p>
                <p className="text-green-800 mb-4">Du hast alle {TOTAL_TASKS} Aufgaben richtig gelöst.</p>
                <p className="text-slate-700 mb-4">Möchtest du neue Aufgaben üben oder hörst du hier auf?</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={startNewRound} className={btnPrimary}>Neue Aufgaben</button>
                  <button onClick={() => setFinished(true)} className={btnSecondary}>Fertig für heute</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

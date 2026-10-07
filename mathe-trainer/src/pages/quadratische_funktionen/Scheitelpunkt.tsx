import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { type Q, q, add, mul, neg, val, isInt, tq, tqp, sgq, polyTex, parseAnswer, isIncomplete } from './quadratischShared'

// Sieben Aufgaben gleichzeitig auf der Seite
const TOTAL_TASKS = 7

const VIDEO_ID = 'Im1FRd6_o-w'

// Einfach: a = 1 oder a = −1, ganzzahliger Scheitelpunkt
// Fortgeschritten: Brüche in der Funktionsgleichung (Streckfaktor, b und/oder c), Scheitelpunkt oft als Bruch
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

// Zahl als LaTeX mit deutschem Dezimalkomma ({,} verhindert den Abstand nach dem Komma)
const tn = (n: number) => {
  const r = round2(n)
  return (r < 0 ? '-' : '') + String(Math.abs(r)).replace('.', '{,}')
}

const GREEN = '#15803d'
const RED = '#b91c1c'

/** KaTeX-Formel; display = abgesetzt (bei Platzmangel horizontal scrollbar) */
function Tex({ tex, display = false, className = '' }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false, displayMode: display }), [tex, display])
  return display ? (
    <div className={`overflow-x-auto overflow-y-hidden ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

interface Task {
  a: Q
  b: Q
  c: Q
  xs: Q
  ys: Q
}

const taskFrom = (a: Q, xs: Q, c: Q): Task => {
  const b = mul(q(-2), mul(a, xs))
  return { a, b, c, xs, ys: add(mul(b, xs), add(mul(a, mul(xs, xs)), c)) }
}

// Fortgeschritten: Streckfaktoren (meist Brüche) und mögliche Werte für x_S und c
const A_FORTGESCHRITTEN = [[1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [1, 4], [-1, 4], [3, 4], [-3, 4], [3, 2], [-3, 2], [2, 1], [-2, 1]] as const
const XS_FORTGESCHRITTEN = Array.from({ length: 17 }, (_, i) => q(i - 8, 2)).filter((x) => x.n !== 0)
const C_FORTGESCHRITTEN = [
  ...Array.from({ length: 13 }, (_, i) => q(i - 6)),
  ...[-5, -3, -1, 1, 3, 5].map((n) => q(n, 2)),
  ...[-3, -1, 1, 3].map((n) => q(n, 4)),
  ...[-2, -1, 1, 2].map((n) => q(n, 3)),
].filter((c) => c.n !== 0)

function newTask(level: Level): Task {
  if (level === 'einfach') {
    let xs: number
    do xs = randomInt(5, -5)
    while (xs === 0)
    let c: number
    do c = randomInt(9, -9)
    while (c === 0)
    return taskFrom(q(pick([1, -1])), q(xs), q(c))
  }
  for (;;) {
    const [an, ad] = pick(A_FORTGESCHRITTEN)
    const t = taskFrom(q(an, ad), pick(XS_FORTGESCHRITTEN), pick(C_FORTGESCHRITTEN))
    // Mindestens ein Bruch in der Gleichung, überschaubare Nenner und Beträge
    const mitBruch = !isInt(t.a) || !isInt(t.b) || !isInt(t.c)
    if (mitBruch && t.b.n !== 0 && t.b.d <= 4 && Math.abs(val(t.b)) <= 12 && t.ys.d <= 6 && Math.abs(val(t.ys)) <= 12) return t
  }
}

/** Bruch als gerundete Dezimalzahl in LaTeX, z. B. "2{,}33" */
const dezimalWert = (x: Q) => tn(val(x))
/** "= 2{,}5" bzw. "\\approx 2{,}33" */
const dezimal = (x: Q) => `${Math.abs(val(x) - round2(val(x))) < 1e-9 ? '=' : '\\approx'} ${dezimalWert(x)}`

// ---------- Live-Auswertung einer Eingabe ----------

type AnswerStatus = 'idle' | 'right' | 'wrong'

// Brüche (z. B. 7/3) werden exakt verglichen, Dezimalzahlen müssen auf zwei Nachkommastellen stimmen.
function getStatus(input: string, correct: Q): AnswerStatus {
  if (isIncomplete(input)) return 'idle'
  const parsed = parseAnswer(input)
  if (Number.isNaN(parsed)) return 'idle'
  return Math.abs(parsed - val(correct)) < 0.0051 ? 'right' : 'wrong'
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
  const t1 = mul(a, mul(xs, xs))
  const t2 = mul(b, xs)
  const bb = mul(b, b)
  const vierA = mul(q(4), a)
  const quot = q(bb.n * vierA.d, bb.d * vierA.n)
  const naeherung = isInt(ys) ? '' : ` ${dezimal(ys)}`
  return (
    <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50 text-left text-slate-700 space-y-3">
      <h3 className="text-base font-bold text-slate-800 text-center">Lösungsweg</h3>
      <p>
        Ablesen: <Tex tex={`a = ${tq(a)},\\quad b = ${tq(b)},\\quad c = ${tq(c)}`} />
      </p>
      <div>
        <p className="font-semibold text-slate-800">Schritt 1: x-Koordinate berechnen</p>
        <Tex display tex={`x_S = -\\frac{b}{2 \\cdot a} = -\\frac{${tq(b)}}{2 \\cdot ${tqp(a)}} = \\frac{${tq(neg(b))}}{${tq(mul(q(2), a))}} = \\mathbf{${tq(xs)}}`} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">
          Schritt 2: <Tex tex="x_S" /> in <Tex tex="f(x)" /> einsetzen
        </p>
        <Tex display tex={`\\begin{aligned} y_S &= f\\left(${tq(xs)}\\right) = ${tq(a)} \\cdot ${tqp(xs)}^2 ${b.n < 0 ? '-' : '+'} ${tq(q(Math.abs(b.n), b.d))} \\cdot ${tqp(xs)} ${sgq(c)} \\\\ &= ${tq(t1)} ${sgq(t2)} ${sgq(c)} = \\mathbf{${tq(ys)}}${naeherung} \\end{aligned}`} />
        <p className="mt-2">
          oder mit der Formel <Tex tex="y_S = c - \frac{b^2}{4 \cdot a}" />:
        </p>
        <Tex display tex={`\\begin{aligned} y_S &= ${tq(c)} - \\frac{${tqp(b)}^2}{4 \\cdot ${tqp(a)}} = ${tq(c)} - \\frac{${tq(bb)}}{${tq(vierA)}} \\\\ &= ${tq(c)} ${sgq(neg(quot))} = \\mathbf{${tq(ys)}}${naeherung} \\end{aligned}`} />
      </div>
      <div className="font-bold text-slate-800 text-center text-lg">
        <Tex display tex={`S\\left({${tq(xs)}} \\;\\middle|\\; {${tq(ys)}}\\right)${isInt(xs) && isInt(ys) ? '' : ` \\approx S\\left({${dezimalWert(xs)}} \\;\\middle|\\; {${dezimalWert(ys)}}\\right)`}`} />
      </div>
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
  // Lösung erst nach einem eigenen, falschen Versuch (bleibt danach für die Aufgabe freigeschaltet)
  const [triedWrong, setTriedWrong] = useState(false)

  const xStatus = getStatus(xIn, task.xs)
  const yStatus = getStatus(yIn, task.ys)
  const bothRight = xStatus === 'right' && yStatus === 'right'
  const anyWrong = xStatus === 'wrong' || yStatus === 'wrong'

  useEffect(() => {
    if (anyWrong) setTriedWrong(true)
  }, [anyWrong])

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
    setTriedWrong(false)
    onSolvedChange(false)
  }

  function onShowSolution() {
    if (!triedWrong) return
    setShowSolution(true)
    onHelp()
  }

  let message: React.ReactNode = null
  if (solved) {
    message = <p className="text-center font-bold mt-3 text-green-600">{praise}</p>
  } else if (xStatus === 'right' && yStatus !== 'right') {
    message = (
      <p className={`text-center font-bold mt-3 ${yStatus === 'wrong' ? 'text-red-600' : 'text-green-600'}`}>
        {yStatus === 'wrong' ? 'x stimmt, aber y ist noch nicht richtig. Setze ' : 'Gut, x stimmt! Jetzt noch y: Setze '}
        <Tex tex="x_S" /> in <Tex tex="f(x)" /> ein oder nutze <Tex tex="y_S = c - \frac{b^2}{4a}" />.
      </p>
    )
  } else if (xStatus === 'wrong') {
    message = (
      <p className="text-center font-bold mt-3 text-red-600">
        x ist noch nicht richtig. Tipp: <Tex tex="x_S = -\frac{b}{2a}" />
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
        {level === 'fortgeschritten' && ' Gib Brüche mit Schrägstrich ein (z. B. 7/3) oder als Dezimalzahl, auf zwei Nachkommastellen gerundet.'}
      </p>
      <div className="text-center text-2xl text-slate-800 my-4">
        <Tex tex={`f(x) = ${polyTex(task.a, task.b, task.c)}`} />
      </div>

      <div className="flex items-center justify-center gap-2 text-2xl text-slate-800">
        <Tex tex="S\Big(" />
        <CoordInput value={xIn} status={xStatus} onChange={setXIn} placeholder="x" readOnly={solved} />
        <Tex tex="\Big|" />
        <CoordInput value={yIn} status={yStatus} onChange={setYIn} placeholder="y" readOnly={solved} />
        <Tex tex="\Big)" />
      </div>

      {message}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={generateNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button
          onClick={onShowSolution}
          disabled={!triedWrong}
          title={triedWrong ? undefined : 'Versuche die Aufgabe zuerst selbst.'}
          className={`${btnSecondary} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white`}
        >
          Lösung anzeigen
        </button>
      </div>
      {!triedWrong && !solved && (
        <p className="mt-2 text-sm text-slate-500">Die Lösung kannst du dir anzeigen lassen, sobald du die Aufgabe selbst versucht hast.</p>
      )}

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

function Erklaerung() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">So berechnest du den Scheitelpunkt</h2>
      <p className="text-slate-700 mb-3">
        Der <strong>Scheitelpunkt S</strong> ist der höchste oder tiefste Punkt einer Parabel. Ist die Funktion in der{' '}
        <strong>allgemeinen Form</strong> <Tex tex="f(x) = ax^2 + bx + c" /> gegeben, berechnest du ihn in zwei Schritten:
      </p>
      <ol className="list-decimal pl-5 text-slate-700 space-y-2 mb-3 text-left">
        <li>
          <span className="text-green-700 font-semibold">x-Koordinate</span> mit der Formel berechnen:
          <Tex display tex={`\\textcolor{${GREEN}}{x_S} = -\\frac{b}{2 \\cdot a}`} />
        </li>
        <li>
          <span className="text-red-700 font-semibold">y-Koordinate</span>: <Tex tex="x_S" /> in die Funktionsgleichung einsetzen:{' '}
          <Tex tex="y_S = f(x_S)" />
          <span className="block mt-1">
            <strong>Oder</strong> du nutzt direkt die passende Formel für <Tex tex="y_S" />:
          </span>
          <Tex display tex={`\\textcolor{${RED}}{y_S} = c - \\frac{b^2}{4 \\cdot a}`} />
        </li>
      </ol>
      <div className="border-2 border-green-500 bg-green-50 rounded-xl px-4 py-3 mb-3 text-center">
        <p className="font-semibold text-slate-800 mb-1">Scheitelpunktkoordinaten auf einen Blick</p>
        <Tex
          display
          className="text-lg"
          tex={`S(x_S \\mid y_S) = S\\left(\\textcolor{${GREEN}}{-\\frac{b}{2 \\cdot a}} \\;\\middle|\\; \\textcolor{${RED}}{c - \\frac{b^2}{4 \\cdot a}}\\right)`}
        />
        <p className="text-sm text-slate-600 mt-1">
          Beide Wege für <Tex tex="y_S" /> führen zum selben Ergebnis – nimm den, der dir leichter fällt.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-3">
        <ExampleGraph />
        <div className="text-left text-slate-700">
          <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
          <Tex display tex="f(x) = x^2 - 4x + 1" />
          <p className="mb-2">
            <Tex tex="a = 1,\quad b = -4,\quad c = 1" />
          </p>
          <Tex display tex={`\\textcolor{${GREEN}}{x_S} = -\\frac{-4}{2 \\cdot 1} = \\frac{4}{2} = \\textcolor{${GREEN}}{\\mathbf{2}}`} />
          <Tex display tex={`\\begin{aligned} \\textcolor{${RED}}{y_S} &= f(2) = 2^2 - 4 \\cdot 2 + 1 \\\\ &= 4 - 8 + 1 = \\textcolor{${RED}}{\\mathbf{-3}} \\end{aligned}`} />
          <p className="text-sm">oder mit der Formel:</p>
          <Tex display tex={`\\begin{aligned} \\textcolor{${RED}}{y_S} &= 1 - \\frac{(-4)^2}{4 \\cdot 1} = 1 - \\frac{16}{4} \\\\ &= 1 - 4 = \\textcolor{${RED}}{\\mathbf{-3}} \\end{aligned}`} />
          <p className="text-slate-800 font-bold mt-3">
            Der Scheitelpunkt ist <Tex tex="S(2 \mid -3)" />.
          </p>
        </div>
      </div>
      <ul className="list-disc pl-5 mt-3 text-slate-700 space-y-1 text-sm text-left">
        <li>
          <Tex tex="a > 0" />: Die Parabel ist nach oben geöffnet, S ist der tiefste Punkt. <Tex tex="a < 0" />: nach unten geöffnet, S ist der höchste Punkt.
        </li>
        <li>
          Achte auf Vorzeichen: Ist b negativ, wird <Tex tex="-b" /> positiv, z. B. <Tex tex="-(-4) = 4" />.
        </li>
        <li>
          Beim Einsetzen negative Zahlen in Klammern setzen: <Tex tex="(-3)^2 = 9" />, aber <Tex tex="-3^2 = -9" />.
        </li>
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
      <p className="text-center text-slate-600">Berechne den Scheitelpunkt einer Parabel aus der allgemeinen Form <Tex tex="f(x) = ax^2 + bx + c" />.</p>
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
                <Tex display className="text-xl mb-2 text-white" tex="f(x) = \pm x^2 + bx + c" />
                <p className="text-sm text-white/90">Ohne Streckfaktor (a = 1 oder a = −1), der Scheitelpunkt hat ganzzahlige Koordinaten.</p>
              </button>
              <button
                onClick={() => chooseLevel('fortgeschritten')}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white p-5 shadow-sm transition-colors"
              >
                <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                <Tex display className="text-xl mb-2 text-white" tex="f(x) = \frac{1}{2}x^2 - 3x + \frac{5}{2}" />
                <p className="text-sm text-white/90">Mit Brüchen in der Funktionsgleichung – rechne mit Bruchrechnung.</p>
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

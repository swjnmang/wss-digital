import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GeoGebraGraph from '../../components/GeoGebraGraph'
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'

// Sechs Aufgaben im Wechsel: Punkte, Graph, Punkte, Graph, Punkte, Graph
const TOTAL_TASKS = 6

const VIDEO_ID = 'IwNoiR-yfJ0'

// MathJax-Komponente
const MathDisplay = ({ latex }: { latex: string }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && (window as any).MathJax) {
      (window as any).MathJax.contentDocument = document
      ;(window as any).MathJax.typesetPromise?.([ref.current]).catch((err: any) => console.log(err))
    }
  }, [latex])

  return <div ref={ref} className="text-center text-base my-1 leading-relaxed overflow-x-auto">{latex}</div>
}

function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Erlaubte Steigungswerte für Graph-Aufgaben
// (m = 0 kommt bewusst nicht vor)
const allowedSlopes = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3] as const

function getRandomSlope() {
  return allowedSlopes[Math.floor(Math.random() * allowedSlopes.length)]
}

// Einfach: nur Ursprungsgeraden y = m·x, Fortgeschritten: Geraden y = m·x + t
type Level = 'einfach' | 'fortgeschritten'

const LEVEL_LABEL: Record<Level, string> = { einfach: 'Einfach', fortgeschritten: 'Fortgeschritten' }

const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors'
const btnSecondary = 'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors'
const inputCls = 'w-40 text-center border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
const coordCls = 'w-20 text-center border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500'
const panel = 'text-center bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200'

const parseAnswer = (raw: string) => parseFloat(raw.replace(',', '.').replace(/[−–—‐]/g, '-'))

type AnswerStatus = 'idle' | 'right' | 'wrong'

/**
 * Live-Auswertung der Eingabe: richtig -> sofort grün (ohne Klick auf "Prüfen"), falsch -> sofort rot.
 * Für Tracking und "Richtig in Folge" zählt ein falscher Versuch erst, wenn die Eingabe kurz stehen bleibt,
 * nicht bei jedem Tastendruck.
 */
function useLiveAnswer(
  correct: number | null,
  handlers: { onCorrect: () => void; onWrong: () => void },
) {
  const [input, setInput] = useState('')
  const [solved, setSolved] = useState(false)
  const parsed = parseAnswer(input)
  const trimmed = input.trim()
  const incomplete = trimmed === '' || trimmed === '-' || trimmed === '−' || trimmed === ',' || trimmed === '.'
  const status: AnswerStatus =
    correct === null || incomplete || Number.isNaN(parsed)
      ? 'idle'
      : Math.abs(parsed - correct) < 0.01
        ? 'right'
        : 'wrong'

  useEffect(() => {
    if (solved) return
    if (status === 'right') {
      setSolved(true)
      handlers.onCorrect()
      return
    }
    if (status === 'wrong') {
      const timer = setTimeout(handlers.onWrong, 900)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, correct, solved])

  const reset = () => {
    setInput('')
    setSolved(false)
  }

  const hint =
    status === 'wrong' && correct !== null && correct !== 0 && Math.sign(parsed) !== 0 && Math.sign(parsed) !== Math.sign(correct)
      ? 'Das Vorzeichen stimmt nicht.'
      : 'Noch nicht richtig.'

  return { input, setInput, status, solved, reset, hint }
}

function AnswerField({
  live,
  disabled,
  placeholder = 'Deine Lösung',
}: {
  live: ReturnType<typeof useLiveAnswer>
  disabled?: boolean
  placeholder?: string
}) {
  const { input, setInput, status, solved, hint } = live
  const border =
    status === 'right' ? 'border-green-500 bg-green-50' : status === 'wrong' ? 'border-red-500 bg-red-50' : 'border-slate-300'
  return (
    <div>
      <div className="flex items-center justify-center gap-2">
        <span className="font-semibold text-slate-800">m =</span>
        <input
          value={input}
          disabled={disabled}
          readOnly={solved}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          className={`w-40 text-center border-2 rounded px-3 py-2 focus:outline-none disabled:bg-slate-100 ${border}`}
          placeholder={placeholder}
          inputMode="decimal"
        />
      </div>
      {status === 'right' && <p className="text-center font-bold mt-3 text-green-600">Richtig! Super gemacht!</p>}
      {status === 'wrong' && <p className="text-center font-bold mt-3 text-red-600">{hint}</p>}
    </div>
  )
}

const feedbackEl = (text: string) =>
  text ? (
    <p className={`text-center font-bold mt-3 ${text.includes('Richtig') ? 'text-green-600' : 'text-red-600'}`}>{text}</p>
  ) : null

function solutionEl(
  pa: { x: number; y: number },
  pb: { x: number; y: number },
  dy: number,
  dx: number,
  slope: number,
) {
  const value = Math.round(slope * 100) / 100
  return (
    <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
      <h3 className="text-base font-bold text-slate-800 text-center mb-2">Lösungsweg</h3>
      <MathDisplay latex={`$$P_1(${pa.x}|${pa.y}) \\quad P_2(${pb.x}|${pb.y})$$`} />
      <MathDisplay latex={`$$m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${pb.y} - (${pa.y})}{${pb.x} - (${pa.x})} = \\dfrac{${dy}}{${dx}} = ${value}$$`} />
      <div className="font-bold text-slate-800 mt-2">
        <MathDisplay latex={`$$m = ${value}$$`} />
      </div>
    </div>
  )
}

interface CardProps {
  number: number
  /** Meldet, ob die Aufgabe aktuell richtig gelöst ist (false, wenn eine neue Aufgabe geladen wird). */
  onSolvedChange: (solved: boolean) => void
  /** Meldet jedes Prüfergebnis für die Serie "Richtig in Folge". */
  onResult: (correct: boolean) => void
  onHelp: () => void
  level: Level
}

// Steigungen für Ursprungsgeraden (Stufe Einfach)
const originSlopes = [-4, -3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3, 4] as const

function newOriginPoints() {
  // Beide Punkte liegen auf y = m·x, mit ganzzahligen Koordinaten; manchmal ist einer davon O(0|0)
  const m = originSlopes[Math.floor(Math.random() * originSlopes.length)]
  const xs = Array.from({ length: 21 }, (_, i) => i - 10).filter((x) => Number.isInteger(m * x) && Math.abs(m * x) <= 12)
  const withOrigin = Math.random() < 0.3
  let x1: number, x2: number
  do {
    x1 = withOrigin ? 0 : xs[Math.floor(Math.random() * xs.length)]
    x2 = xs[Math.floor(Math.random() * xs.length)]
  } while (x1 === x2 || (!withOrigin && (x1 === 0 || x2 === 0)))
  const p1 = { x: x1, y: m * x1 }
  const p2 = { x: x2, y: m * x2 }
  return Math.random() < 0.5 ? { p1, p2 } : { p1: p2, p2: p1 }
}

function newTextPoints(level: Level) {
  if (level === 'einfach') return newOriginPoints()
  // x-Werte verschieden (keine senkrechte Gerade) und y-Werte verschieden (Steigung nie 0)
  let x1, x2, y1, y2
  do {
    x1 = randomInt(10, -10)
    x2 = randomInt(10, -10)
  } while (x1 === x2)
  do {
    y1 = randomInt(10, -10)
    y2 = randomInt(10, -10)
  } while (y1 === y2)
  return { p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } }
}

// ---------- Textaufgabe: Steigung aus zwei Punkten ----------

function TextTaskCard({ number, onSolvedChange, onResult, onHelp, level }: CardProps) {
  const tracking = useTaskTracking(`Steigung aus zwei Punkten (${LEVEL_LABEL[level]})`)
  const [{ p1, p2 }, setPoints] = useState(() => newTextPoints(level))
  const [showSolution, setShowSolution] = useState(false)
  const correctSlope = (p2.y - p1.y) / (p2.x - p1.x)

  const live = useLiveAnswer(correctSlope, {
    onCorrect: () => {
      tracking.onCheck(true)
      onResult(true)
      onSolvedChange(true)
      setShowSolution(false)
    },
    onWrong: () => {
      tracking.onCheck(false)
      onResult(false)
    },
  })

  function generateNewTask() {
    tracking.onTaskStart()
    onSolvedChange(false)
    live.reset()
    setShowSolution(false)
    setPoints(newTextPoints(level))
  }

  function onShowAnswer() {
    setShowSolution(true)
    onHelp()
    tracking.onHintShown()
  }

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}: Steigung aus zwei Punkten</h2>
      <p className="text-slate-700 mb-1">
        {level === 'einfach'
          ? 'Die Ursprungsgerade y = m · x geht durch die beiden Punkte. Berechne ihre Steigung m.'
          : 'Berechne die Steigung m der Geraden durch die beiden Punkte. Runde auf zwei Nachkommastellen.'}
      </p>
      <p className="text-center text-lg font-semibold text-slate-800 my-4">
        P<sub>1</sub>({p1.x}|{p1.y}) und P<sub>2</sub>({p2.x}|{p2.y})
      </p>

      <AnswerField live={live} />

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={generateNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button onClick={onShowAnswer} className={btnSecondary}>Lösung anzeigen</button>
      </div>

      {showSolution && solutionEl(p1, p2, p2.y - p1.y, p2.x - p1.x, correctSlope)}
    </div>
  )
}

// ---------- Graphaufgabe: Steigung aus dem Graphen ----------

const GRAPH_HINT = 'Gib die Koordinaten von zwei Punkten ein, die auf der Geraden liegen.'

function newGraphLine(level: Level) {
  if (level === 'einfach') return { m: getRandomSlope(), t: 0 }
  // Fortgeschritten: Gerade schneidet die y-Achse nicht im Ursprung
  let t = 0
  while (t === 0) t = randomInt(4, -4)
  return { m: getRandomSlope(), t }
}

function GraphTaskCard({ number, onSolvedChange, onResult, onHelp, level }: CardProps) {
  const tracking = useTaskTracking(`Steigung aus Graph (${LEVEL_LABEL[level]})`)
  const [{ m: graphM, t: graphT }, setLine] = useState(() => newGraphLine(level))
  const [feedback, setFeedback] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [selectedPoints, setSelectedPoints] = useState<Array<{ x: number; y: number }>>([])
  const [selectionMode, setSelectionMode] = useState(true)
  const [instruction, setInstruction] = useState(GRAPH_HINT)
  const [point1Input, setPoint1Input] = useState({ x: '', y: '' })
  const [point2Input, setPoint2Input] = useState({ x: '', y: '' })

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

  const correctSlope =
    selectedPoints.length === 2
      ? (selectedPoints[1].y - selectedPoints[0].y) / (selectedPoints[1].x - selectedPoints[0].x)
      : 0
  const deltaY = selectedPoints.length === 2 ? selectedPoints[1].y - selectedPoints[0].y : 0
  const deltaX = selectedPoints.length === 2 ? selectedPoints[1].x - selectedPoints[0].x : 0

  const live = useLiveAnswer(selectedPoints.length === 2 ? correctSlope : null, {
    onCorrect: () => {
      tracking.onCheck(true)
      onResult(true)
      onSolvedChange(true)
      setShowSolution(false)
    },
    onWrong: () => {
      tracking.onCheck(false)
      onResult(false)
    },
  })

  function generateNewTask() {
    tracking.onTaskStart()
    onSolvedChange(false)
    setFeedback('')
    live.reset()
    setShowSolution(false)
    setSelectedPoints([])
    setSelectionMode(true)
    setInstruction(GRAPH_HINT)
    setPoint1Input({ x: '', y: '' })
    setPoint2Input({ x: '', y: '' })
    setLine(newGraphLine(level))
  }

  function addPoint(index: 1 | 2) {
    const raw = index === 1 ? point1Input : point2Input
    if (!raw.x || !raw.y) {
      setFeedback(`Bitte gib beide Koordinaten für Punkt ${index} ein.`)
      return
    }
    const x = parseFlexibleNumber(raw.x)
    const y = parseFlexibleNumber(raw.y)
    if (isNaN(x) || isNaN(y)) {
      setFeedback(`Ungültige Koordinaten für Punkt ${index}.`)
      return
    }

    const expectedY = graphM * x + graphT
    if (Math.abs(y - expectedY) > 0.15) {
      setFeedback(`Punkt ${index} liegt nicht auf der Geraden! Für x=${x} sollte y=${Math.round(expectedY * 100) / 100} sein.`)
      return
    }

    if (index === 1) {
      setSelectedPoints([{ x, y }])
      setInstruction(`Punkt 1 akzeptiert: (${x}|${y}) - Gib nun Punkt 2 ein.`)
    } else {
      if (selectedPoints[0].x === x && selectedPoints[0].y === y) {
        setFeedback('Punkt 2 muss unterschiedlich von Punkt 1 sein!')
        return
      }
      setSelectedPoints([...selectedPoints, { x, y }])
      setSelectionMode(false)
      setInstruction('Berechne jetzt die Steigung!')
    }
    setFeedback('')
  }

  function onShowAnswer() {
    setShowSolution(true)
    onHelp()
    // Lösungsweg wird nur sichtbar, wenn beide Punkte gewählt sind
    if (selectedPoints.length === 2) tracking.onHintShown()
  }

  const pointInput = selectedPoints.length === 0 ? point1Input : point2Input
  const setPointInput = selectedPoints.length === 0 ? setPoint1Input : setPoint2Input

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}: Steigung aus dem Graphen</h2>
      <p className="text-slate-700 mb-4">{instruction}</p>

      <div ref={boxRef} className="flex justify-center mb-4 w-full overflow-hidden">
        <div key={graphSize}>
          <GeoGebraGraph m={graphM} t={graphT} width={graphSize} height={graphSize} />
        </div>
      </div>

      {selectionMode && selectedPoints.length < 2 && (
        <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700 mb-2">Punkt {selectedPoints.length + 1}: (x | y)</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <input type="number" step="0.1" value={pointInput.x} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPointInput({ ...pointInput, x: e.target.value })} className={coordCls} placeholder="x" />
            <span className="text-slate-500">|</span>
            <input type="number" step="0.1" value={pointInput.y} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPointInput({ ...pointInput, y: e.target.value })} className={coordCls} placeholder="y" />
            <button onClick={() => addPoint(selectedPoints.length === 0 ? 1 : 2)} className={btnPrimary}>
              Punkt {selectedPoints.length + 1} annehmen
            </button>
          </div>
        </div>
      )}

      {selectedPoints.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4 text-sm font-semibold text-slate-700">
          {selectedPoints.map((point, idx) => (
            <span key={idx}>Punkt {idx + 1}: ({point.x}|{point.y})</span>
          ))}
          <button onClick={generateNewTask} className="text-blue-600 hover:underline font-semibold">
            Punkte neu eingeben
          </button>
        </div>
      )}

      <AnswerField live={live} disabled={selectedPoints.length !== 2} placeholder={selectedPoints.length === 2 ? 'Deine Lösung' : 'Erst zwei Punkte'} />

      {feedbackEl(feedback)}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={generateNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button onClick={onShowAnswer} className={btnSecondary}>Lösung anzeigen</button>
      </div>

      {showSolution && selectedPoints.length === 2 &&
        solutionEl(selectedPoints[0], selectedPoints[1], deltaY, deltaX, correctSlope)}
    </div>
  )
}

// ---------- Erklärung mit Beispiel (Graph + Rechnung) und Erklärvideo ----------

// Beispiel: Gerade y = 2x − 1 durch P1(1|1) und P2(3|5)
const EX = { p1: { x: 1, y: 1 }, p2: { x: 3, y: 5 } }
const SX = 40 // Pixel pro Einheit
const X_MIN = -1, X_MAX = 6, Y_MIN = -2, Y_MAX = 7
const toPx = (x: number, y: number) => ({ px: (x - X_MIN) * SX, py: (Y_MAX - y) * SX })

function ExampleGraph() {
  const w = (X_MAX - X_MIN) * SX
  const h = (Y_MAX - Y_MIN) * SX
  const o = toPx(0, 0)
  const a = toPx(EX.p1.x, EX.p1.y)
  const b = toPx(EX.p2.x, EX.p2.y)
  const c = toPx(EX.p2.x, EX.p1.y) // Ecke des Steigungsdreiecks
  const lineStart = toPx(-0.5, -2)
  const lineEnd = toPx(4, 7)
  const xs = Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => X_MIN + i)
  const ys = Array.from({ length: Y_MAX - Y_MIN + 1 }, (_, i) => Y_MIN + i)
  return (
    <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} className="w-full max-w-xs mx-auto" role="img" aria-label="Gerade y = 2x − 1 mit Steigungsdreieck zwischen P1(1|1) und P2(3|5)">
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
      {/* Gerade */}
      <line x1={lineStart.px} y1={lineStart.py} x2={lineEnd.px} y2={lineEnd.py} stroke="#2563eb" strokeWidth={2.5} />
      {/* Steigungsdreieck */}
      <line x1={a.px} y1={a.py} x2={c.px} y2={c.py} stroke="#16a34a" strokeWidth={2.5} />
      <line x1={c.px} y1={c.py} x2={b.px} y2={b.py} stroke="#dc2626" strokeWidth={2.5} />
      <text x={(a.px + c.px) / 2} y={a.py + 16} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#16a34a">Δx = 2</text>
      <text x={c.px + 6} y={(c.py + b.py) / 2 + 4} fontSize={13} fontWeight="bold" fill="#dc2626">Δy = 4</text>
      {/* Punkte */}
      <circle cx={a.px} cy={a.py} r={4.5} fill="#1e293b" />
      <circle cx={b.px} cy={b.py} r={4.5} fill="#1e293b" />
      <text x={a.px + 6} y={a.py - 8} fontSize={12} fontWeight="bold" fill="#1e293b">P₁(1|1)</text>
      <text x={b.px - 8} y={b.py - 4} fontSize={12} fontWeight="bold" textAnchor="end" fill="#1e293b">P₂(3|5)</text>
    </svg>
  )
}

// Bruch in HTML (unabhängig davon, ob MathJax schon geladen ist)
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
      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">So berechnest du die Steigung</h2>
      <p className="text-slate-700 mb-3">
        Die Steigung m gibt an, wie stark eine Gerade steigt oder fällt: Um wie viel ändert sich y, wenn x um 1 größer wird?
        Du brauchst dafür <strong>zwei Punkte</strong> auf der Geraden. Zeichnest du zwischen ihnen ein{' '}
        <strong>Steigungsdreieck</strong>, kannst du die Änderung in x-Richtung (<span className="text-green-700 font-semibold">Δx</span>)
        und in y-Richtung (<span className="text-red-700 font-semibold">Δy</span>) ablesen.
      </p>
      <p className="text-center text-lg font-serif my-3">
        <i>m</i> =
        <Frac num={<span className="text-red-700">Δ<i>y</i></span>} den={<span className="text-green-700">Δ<i>x</i></span>} />=
        <Frac num={<><i>y</i><sub>2</sub> − <i>y</i><sub>1</sub></>} den={<><i>x</i><sub>2</sub> − <i>x</i><sub>1</sub></>} />
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-3">
        <ExampleGraph />
        <div>
          <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
          <p className="text-slate-700 mb-2">
            Die Gerade geht durch P<sub>1</sub>(1|1) und P<sub>2</sub>(3|5).
          </p>
          <p className="text-center text-lg font-serif my-2">
            <i>m</i> =
            <Frac num="5 − 1" den="3 − 1" />=
            <Frac num={<span className="text-red-700">4</span>} den={<span className="text-green-700">2</span>} />= <strong>2</strong>
          </p>
          <p className="text-slate-700 mt-2">
            Gehst du 2 Einheiten nach rechts, geht es 4 Einheiten nach oben. Pro Einheit nach rechts steigt die Gerade also um 2.
          </p>
        </div>
      </div>
      <ul className="list-disc pl-5 mt-3 text-slate-700 space-y-1 text-sm">
        <li>m &gt; 0: Die Gerade steigt. m &lt; 0: Die Gerade fällt.</li>
        <li>Achte auf Vorzeichen: Bei negativen Koordinaten Klammern setzen, z. B. 3 − (−2) = 5.</li>
        <li>Die Reihenfolge der Punkte ist egal, solange oben und unten derselbe Punkt zuerst steht.</li>
      </ul>
      <h3 className="text-base font-bold text-slate-800 mt-5 mb-2 text-center">Erklärvideo</h3>
      <div className="max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden border border-slate-200">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${VIDEO_ID}`}
          title="Erklärvideo: Steigung berechnen"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

// ---------- Seite: sechs Aufgaben auf einmal ----------

export default function SteigungBerechnen() {
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState<Record<number, boolean>>({})
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)

  const solvedCount = Object.values(solved).filter(Boolean).length
  const allSolved = solvedCount === TOTAL_TASKS

  useEffect(() => {
    // MathJax Script laden
    const script = document.createElement('script')
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6'
    script.async = true
    document.body.appendChild(script)

    const script2 = document.createElement('script')
    script2.id = 'MathJax-script'
    script2.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
    script2.async = true
    document.body.appendChild(script2)
  }, [])

  const completionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved])

  const [level, setLevel] = useState<Level | null>(null)

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

  const cards = level
    ? Array.from({ length: TOTAL_TASKS }, (_, i) => {
        const props: CardProps = {
          number: i + 1,
          onSolvedChange: (value) => setSolved((s) => ({ ...s, [i]: value })),
          onResult: (correct) => setStreak((s) => (correct ? s + 1 : 0)),
          onHelp: () => setStreak(0),
          level,
        }
        // Die Karten bleiben nach einem Neustart per key getrennt (frischer Zustand, eigenes Tracking)
        return (
          <React.Fragment key={`${level}-${round}-${i}`}>
            {i % 2 === 0 ? <TextTaskCard {...props} /> : <GraphTaskCard {...props} />}
          </React.Fragment>
        )
      })
    : null

  const header = (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Steigung berechnen</h1>
      <p className="text-center text-slate-600">Berechne die Steigung m einer Geraden aus zwei Punkten.</p>
    </div>
  )

  const explanation = <Erklaerung />

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
                <p className="text-xl font-serif italic mb-2 text-white">y = m · x</p>
                <p className="text-sm text-white/90">Nur Ursprungsgeraden: Alle Geraden gehen durch den Punkt O(0|0).</p>
              </button>
              <button
                onClick={() => chooseLevel('fortgeschritten')}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white p-5 shadow-sm transition-colors"
              >
                <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                <p className="text-xl font-serif italic mb-2 text-white">y = m · x + t</p>
                <p className="text-sm text-white/90">Beliebige Geraden, die die y-Achse an einer anderen Stelle schneiden.</p>
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
        {explanation}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
            Schwierigkeitsgrad: {LEVEL_LABEL[level]} ({level === 'einfach' ? 'y = m · x' : 'y = m · x + t'})
          </span>
          <button onClick={() => chooseLevel(null)} className="text-blue-600 hover:underline text-sm font-semibold">
            Schwierigkeitsgrad wechseln
          </button>
        </div>

        {cards}

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
                  <button onClick={() => navigate('/lineare_funktionen')} className={btnSecondary}>Zur Übersicht</button>
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

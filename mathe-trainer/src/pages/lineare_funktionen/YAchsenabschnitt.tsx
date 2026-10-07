import React, { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTaskTracking } from '../../hooks/useTaskTracking'

// Sechs Aufgaben, jede mit einem eigenen Aufgabentyp
const TOTAL_TASKS = 6

// Erklärvideo zum y-Achsenabschnitt (YouTube)
const VIDEO_ID = 'IgUrqycTKPQ'

function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Steigungen, die sich im Koordinatensystem gut ablesen lassen (m = 0 kommt bewusst nicht vor)
const graphSlopes = [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2] as const
const textSlopes = [-4, -3, -2.5, -2, -1.5, -1, -0.5, -0.25, 0.25, 0.5, 1, 1.5, 2, 3, 4] as const

const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors'
const btnSecondary = 'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors'
const panel = 'bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200'

// ---------- Formatierung ----------

/** Zahl im deutschen Format mit echtem Minuszeichen */
function fmt(n: number) {
  const r = Math.round(n * 100) / 100
  return String(r).replace('.', ',').replace('-', '−')
}

/** Term m·x, z. B. "2x", "−x", "0,5x" */
function termMx(m: number) {
  if (m === 1) return 'x'
  if (m === -1) return '−x'
  return `${fmt(m)}x`
}

/** Funktionsgleichung; reversed: t steht vorne (y = 3 − 2x) */
function eq(m: number, t: number, reversed = false) {
  if (m === 0) return `y = ${fmt(t)}`
  if (t === 0) return `y = ${termMx(m)}`
  if (reversed) return `y = ${fmt(t)} ${m > 0 ? '+' : '−'} ${termMx(Math.abs(m))}`
  return `y = ${termMx(m)} ${t > 0 ? '+' : '−'} ${fmt(Math.abs(t))}`
}

const Eq = ({ children }: { children: React.ReactNode }) => (
  <span className="font-serif italic whitespace-nowrap">{children}</span>
)

// ---------- Koordinatensystem (SVG) ----------

type GraphLine = { m: number; t: number; color: string; dashed?: boolean }
type GraphPoint = { x: number; y: number; color: string; label?: string }
type GraphArrow = { x: number; y1: number; y2: number; color: string }

const BLUE = '#2563eb'
const GREY = '#94a3b8'
const RED = '#dc2626'
const GREEN = '#16a34a'

function Koordinatensystem({
  lines,
  points = [],
  arrows = [],
  range = 6,
  tickLabels = true,
  className = 'w-full max-w-[420px]',
}: {
  lines: GraphLine[]
  points?: GraphPoint[]
  arrows?: GraphArrow[]
  range?: number
  tickLabels?: boolean
  className?: string
}) {
  const clipId = useId()
  const S = 30
  const pad = 16
  const size = 2 * range * S + 2 * pad
  const X = (x: number) => pad + (x + range) * S
  const Y = (y: number) => pad + (range - y) * S
  const ticks = Array.from({ length: 2 * range + 1 }, (_, i) => i - range)
  const lim = range + 0.6

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={`${className} h-auto mx-auto block select-none`} role="img" aria-label="Koordinatensystem">
      <defs>
        <clipPath id={clipId}>
          <rect x={X(-range)} y={Y(range)} width={2 * range * S} height={2 * range * S} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={size} height={size} fill="#ffffff" />

      {/* Gitter */}
      {ticks.map((v) => (
        <g key={`g${v}`} stroke="#e2e8f0" strokeWidth={1}>
          <line x1={X(v)} y1={Y(range)} x2={X(v)} y2={Y(-range)} />
          <line x1={X(-range)} y1={Y(v)} x2={X(range)} y2={Y(v)} />
        </g>
      ))}

      {/* Achsen */}
      <g stroke="#334155" strokeWidth={1.5}>
        <line x1={X(-lim)} y1={Y(0)} x2={X(lim)} y2={Y(0)} />
        <line x1={X(0)} y1={Y(-lim)} x2={X(0)} y2={Y(lim)} />
      </g>
      <polygon points={`${X(lim)},${Y(0)} ${X(lim) - 8},${Y(0) - 4} ${X(lim) - 8},${Y(0) + 4}`} fill="#334155" />
      <polygon points={`${X(0)},${Y(lim)} ${X(0) - 4},${Y(lim) + 8} ${X(0) + 4},${Y(lim) + 8}`} fill="#334155" />
      <text x={X(lim) - 4} y={Y(0) + 16} fontSize={12} fontStyle="italic" fill="#334155" textAnchor="end">x</text>
      <text x={X(0) + 8} y={Y(lim) + 10} fontSize={12} fontStyle="italic" fill="#334155">y</text>

      {/* Achsenbeschriftung */}
      {tickLabels &&
        ticks
          .filter((v) => v !== 0 && Math.abs(v) < range)
          .map((v) => (
            <g key={`l${v}`} fontSize={9} fill="#64748b">
              <text x={X(v)} y={Y(0) + 12} textAnchor="middle">{fmt(v)}</text>
              <text x={X(0) - 4} y={Y(v) + 3} textAnchor="end">{fmt(v)}</text>
            </g>
          ))}

      {/* Geraden */}
      <g clipPath={`url(#${clipId})`}>
        {lines.map((l, i) => (
          <line
            key={i}
            x1={X(-range)}
            y1={Y(l.m * -range + l.t)}
            x2={X(range)}
            y2={Y(l.m * range + l.t)}
            stroke={l.color}
            strokeWidth={2.5}
            strokeDasharray={l.dashed ? '7 5' : undefined}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Verschiebungspfeile */}
      {arrows
        .filter((a) => Math.abs(a.y2 - a.y1) > 0.3)
        .map((a, i) => {
          const dir = a.y2 > a.y1 ? 1 : -1
          const tipY = Y(a.y2)
          return (
            <g key={i} stroke={a.color} fill={a.color}>
              <line x1={X(a.x)} y1={Y(a.y1)} x2={X(a.x)} y2={tipY + dir * 6} strokeWidth={2} />
              <polygon
                points={`${X(a.x)},${tipY} ${X(a.x) - 5},${tipY + dir * 9} ${X(a.x) + 5},${tipY + dir * 9}`}
                stroke="none"
              />
            </g>
          )
        })}

      {/* Punkte */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={5} fill={p.color} stroke="#ffffff" strokeWidth={1.5} />
          {p.label && (
            <text
              x={X(p.x) + 8}
              y={Y(p.y) - 8}
              fontSize={12}
              fontWeight="bold"
              fill={p.color}
              stroke="#ffffff"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

// ---------- Erklärung ----------

const demoSlopes = [-2, -1, -0.5, 0.5, 1, 2] as const

function Erklaerung() {
  const [m, setM] = useState<number>(1)
  const [t, setT] = useState(2)

  const arrowXs = [-3, 0, 3].filter((x) => Math.abs(m * x) <= 6 && Math.abs(m * x + t) <= 6)

  return (
    <div className={`${panel} space-y-5 text-slate-700 text-left`}>
      <h2 className="text-xl font-bold text-slate-800">Erklärung: Der y-Achsenabschnitt t</h2>

      <div className="space-y-2">
        <h3 className="font-bold text-slate-800">Was du schon kannst</h3>
        <p>
          Bei Funktionen der Form <Eq>y = m · x</Eq> kennst du bereits die <b>Steigung m</b>. Ihre Graphen sind
          Geraden, die alle durch den Ursprung <b>O(0|0)</b> gehen – man nennt sie deshalb <b>Ursprungsgeraden</b>.
        </p>
        <p>
          Jetzt kommt eine Zahl dazu: Bei <Eq>y = m · x + t</Eq> wird zu jedem y-Wert noch <b>t</b> addiert. Dadurch
          wird die ganze Gerade <b>entlang der y-Achse verschoben</b>, ohne dass sich ihre Steigung ändert. Das nennt
          man eine <b>Parallelverschiebung</b>.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      {/* Interaktive Darstellung */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 sm:p-4">
        <p className="font-semibold text-slate-800 text-center mb-3">Probiere es aus: Verändere t und beobachte die Gerade.</p>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <span className="text-sm font-semibold">Steigung m:</span>
          {demoSlopes.map((s) => (
            <button
              key={s}
              onClick={() => setM(s)}
              className={`px-3 py-1 rounded border text-sm font-semibold transition-colors ${
                m === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {fmt(s)}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <label htmlFor="t-slider" className="text-sm font-semibold whitespace-nowrap">
            y-Achsenabschnitt t = {fmt(t)}
          </label>
          <input
            id="t-slider"
            type="range"
            min={-4}
            max={4}
            step={1}
            value={t}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setT(Number(e.target.value))}
            className="w-48 accent-blue-600"
          />
        </div>
        <Koordinatensystem
          lines={[
            { m, t: 0, color: GREY, dashed: true },
            { m, t, color: BLUE },
          ]}
          arrows={arrowXs.map((x) => ({ x, y1: m * x, y2: m * x + t, color: RED }))}
          points={[{ x: 0, y: t, color: RED, label: `S(0|${fmt(t)})` }]}
        />
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-3 text-sm">
          <span>
            <span className="inline-block w-6 border-t-2 border-dashed border-slate-400 align-middle mr-2" />
            <Eq>{eq(m, 0)}</Eq> (Ursprungsgerade)
          </span>
          <span>
            <span className="inline-block w-6 border-t-2 border-blue-600 align-middle mr-2" />
            <Eq>{eq(m, t)}</Eq>
          </span>
        </div>
        <p className="text-center text-sm mt-2">
          {t > 0 && <>Die Gerade wird um <b>{fmt(t)}</b> nach <b>oben</b> verschoben.</>}
          {t < 0 && <>Die Gerade wird um <b>{fmt(-t)}</b> nach <b>unten</b> verschoben.</>}
          {t === 0 && <>Für t = 0 erhältst du wieder die Ursprungsgerade.</>}
        </p>
      </div>

      {/* Merksatz */}
      <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4 space-y-2">
        <h3 className="font-bold text-slate-800">Merke</h3>
        <p className="text-center text-lg">
          <Eq>y = m · x + t</Eq>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><b>m</b> ist die <b>Steigung</b>: Sie gibt an, wie steil die Gerade ist.</li>
          <li>
            <b>t</b> ist der <b>y-Achsenabschnitt</b>: Hier schneidet die Gerade die y-Achse, im Punkt <b>S<sub>y</sub>(0|t)</b>.
          </li>
          <li>t &gt; 0: Die Ursprungsgerade wird um t nach <b>oben</b> verschoben.</li>
          <li>t &lt; 0: Die Ursprungsgerade wird nach <b>unten</b> verschoben.</li>
          <li>t = 0: Es ist eine Ursprungsgerade.</li>
          <li>Geraden mit gleicher Steigung m und verschiedenem t sind <b>parallel</b>.</li>
        </ul>
        <p className="text-sm">
          <b>Warum?</b> Auf der y-Achse ist x = 0. Setzt du x = 0 ein, erhältst du y = m · 0 + t = t.
        </p>
      </div>
      </div>

      {/* Beispiel */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800">Beispiel: <Eq>y = 2x − 3</Eq></h3>
        <div className="grid gap-4 lg:grid-cols-2 lg:items-center">
        <div className="space-y-3">
        <p>
          Vergleiche die Wertetabellen von <Eq>y = 2x</Eq> und <Eq>y = 2x − 3</Eq>:
        </p>
        <div className="overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <tbody>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-3 py-1">x</th>
                {[-1, 0, 1, 2, 3].map((x) => (
                  <td key={x} className={`border border-slate-300 px-3 py-1 ${x === 0 ? 'font-bold' : ''}`}>{fmt(x)}</td>
                ))}
              </tr>
              <tr>
                <th className="border border-slate-300 px-3 py-1 whitespace-nowrap">y = 2x</th>
                {[-1, 0, 1, 2, 3].map((x) => (
                  <td key={x} className="border border-slate-300 px-3 py-1">{fmt(2 * x)}</td>
                ))}
              </tr>
              <tr>
                <th className="border border-slate-300 px-3 py-1 whitespace-nowrap">y = 2x − 3</th>
                {[-1, 0, 1, 2, 3].map((x) => (
                  <td key={x} className={`border border-slate-300 px-3 py-1 text-blue-700 ${x === 0 ? 'font-bold bg-red-50' : ''}`}>
                    {fmt(2 * x - 3)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Jeder y-Wert ist um <b>3 kleiner</b>. Die Gerade <Eq>y = 2x − 3</Eq> ist also die um 3 Einheiten nach{' '}
          <b>unten</b> verschobene Ursprungsgerade <Eq>y = 2x</Eq>. Beide Geraden sind parallel.
        </p>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="font-semibold text-slate-800 mb-1">Ergebnis:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Steigung: m = 2</li>
            <li>y-Achsenabschnitt: t = −3 (das Minuszeichen gehört zu t!)</li>
            <li>Schnittpunkt mit der y-Achse: S<sub>y</sub>(0|−3)</li>
          </ul>
        </div>
        </div>
        <Koordinatensystem
          lines={[
            { m: 2, t: 0, color: GREY, dashed: true },
            { m: 2, t: -3, color: BLUE },
          ]}
          arrows={[-1, 1, 2].map((x) => ({ x, y1: 2 * x, y2: 2 * x - 3, color: RED }))}
          points={[{ x: 0, y: -3, color: RED, label: 'S(0|−3)' }]}
          className="w-full max-w-[400px]"
        />
        </div>
      </div>

      {/* Stolperfallen */}
      <div className="space-y-2">
        <h3 className="font-bold text-slate-800">Achtung, Stolperfallen</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <Eq>y = 4 − 0,5x</Eq>: Die Reihenfolge ist egal. Die Zahl <b>ohne x</b> ist t, also t = 4 und m = −0,5.
          </li>
          <li>
            <Eq>y = −3x</Eq>: Es steht keine Zahl ohne x da, also ist t = 0 (Ursprungsgerade).
          </li>
          <li>
            <Eq>y = x + 5</Eq>: Vor dem x steht unsichtbar eine 1, also m = 1 und t = 5.
          </li>
        </ul>
        <p>
          <b>Tipp zum Zeichnen:</b> Beginne beim Punkt S(0|t) auf der y-Achse und zeichne von dort aus das
          Steigungsdreieck mit m.
        </p>
      </div>

      {/* Erklärvideo */}
      <div className="space-y-2">
        <h3 className="font-bold text-slate-800 text-center">Erklärvideo</h3>
        <div className="max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden border border-slate-200">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${VIDEO_ID}`}
            title="Erklärvideo: y-Achsenabschnitt"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

// ---------- Live-Auswertung mehrerer Eingabefelder ----------

const parseAnswer = (raw: string) => parseFloat(raw.replace(',', '.').replace(/[−–—‐]/g, '-'))

type AnswerStatus = 'idle' | 'right' | 'wrong'

function fieldStatus(input: string, correct: number): AnswerStatus {
  const trimmed = input.trim()
  if (trimmed === '' || ['-', '−', ',', '.'].includes(trimmed)) return 'idle'
  const parsed = parseAnswer(trimmed)
  if (Number.isNaN(parsed)) return 'idle'
  return Math.abs(parsed - correct) < 0.01 ? 'right' : 'wrong'
}

/**
 * Richtig -> sofort grün (ohne Klick auf "Prüfen"), falsch -> sofort rot.
 * Ein falscher Versuch zählt für Tracking und Serie erst, wenn die Eingabe kurz stehen bleibt.
 */
function useLiveFields(corrects: number[], handlers: { onCorrect: () => void; onWrong: () => void; onInput: () => void }) {
  const [inputs, setInputs] = useState<string[]>(() => corrects.map(() => ''))
  const [solved, setSolved] = useState(false)
  const statuses = corrects.map((c, i) => fieldStatus(inputs[i] ?? '', c))
  const allRight = statuses.every((s) => s === 'right')
  const anyWrong = statuses.some((s) => s === 'wrong')

  useEffect(() => {
    if (solved) return
    if (allRight) {
      setSolved(true)
      handlers.onCorrect()
      return
    }
    if (anyWrong) {
      const timer = setTimeout(handlers.onWrong, 900)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.join('|'), corrects.join('|'), solved])

  const setInput = (i: number, value: string) => {
    handlers.onInput()
    setInputs((prev) => prev.map((v, j) => (j === i ? value : v)))
  }

  const reset = () => {
    setInputs(corrects.map(() => ''))
    setSolved(false)
  }

  return { inputs, setInput, statuses, solved, allRight, anyWrong, reset, corrects }
}

function AnswerFields({
  live,
  labels,
}: {
  live: ReturnType<typeof useLiveFields>
  labels: string[]
}) {
  const { inputs, setInput, statuses, solved, allRight, anyWrong, corrects } = live
  const signWrong = statuses.some((s, i) => {
    if (s !== 'wrong' || corrects[i] === 0) return false
    const p = parseAnswer(inputs[i])
    return p !== 0 && Math.sign(p) !== Math.sign(corrects[i]) && Math.abs(Math.abs(p) - Math.abs(corrects[i])) < 0.01
  })
  const wrongLabels = labels.filter((_, i) => statuses[i] === 'wrong').map((l) => l.replace(/\s*=\s*$/, ''))

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {labels.map((label, i) => {
          const s = statuses[i]
          const border = s === 'right' ? 'border-green-500 bg-green-50' : s === 'wrong' ? 'border-red-500 bg-red-50' : 'border-slate-300'
          return (
            <label key={i} className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 font-serif italic">{label}</span>
              <input
                value={inputs[i]}
                readOnly={solved}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(i, e.target.value)}
                className={`w-28 text-center border-2 rounded px-3 py-2 focus:outline-none ${border}`}
                placeholder="?"
                inputMode="decimal"
              />
            </label>
          )
        })}
      </div>
      {allRight && <p className="text-center font-bold mt-3 text-green-600">Richtig! Super gemacht!</p>}
      {!allRight && anyWrong && (
        <p className="text-center font-bold mt-3 text-red-600">
          {signWrong
            ? 'Achte auf das Vorzeichen!'
            : `${wrongLabels.join(' und ')} ${wrongLabels.length > 1 ? 'stimmen' : 'stimmt'} noch nicht.`}
        </p>
      )}
    </div>
  )
}

// ---------- Gemeinsamer Aufgabenrahmen ----------

interface CardProps {
  number: number
  /** Meldet, ob die Aufgabe aktuell richtig gelöst ist (false, wenn eine neue Aufgabe geladen wird). */
  onSolvedChange: (solved: boolean) => void
  /** Meldet jedes Prüfergebnis für die Serie "Richtig in Folge". */
  onResult: (correct: boolean) => void
  onHelp: () => void
}

function TaskShell({
  number,
  title,
  children,
  onNew,
  onShowSolution,
  solution,
}: {
  number: number
  title: string
  children: React.ReactNode
  onNew: () => void
  onShowSolution: () => void
  solution: React.ReactNode | null
}) {
  return (
    <div className={`${panel} text-center`}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">
        Aufgabe {number}: {title}
      </h2>
      {children}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={onNew} className={btnSecondary}>Neue Aufgabe</button>
        <button onClick={onShowSolution} className={btnSecondary}>Lösung anzeigen</button>
      </div>
      {solution && (
        <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50 text-left text-slate-700 space-y-1">
          <h3 className="text-base font-bold text-slate-800 text-center mb-2">Lösungsweg</h3>
          {solution}
        </div>
      )}
    </div>
  )
}

/**
 * Gemeinsame Logik aller Eingabe-Aufgaben: Tracking, Live-Auswertung, neue Aufgabe, Lösung anzeigen.
 */
function useInputTask<T>(
  topic: string,
  create: () => T,
  answers: (task: T) => number[],
  { onSolvedChange, onResult, onHelp }: CardProps,
) {
  const tracking = useTaskTracking(topic)
  const [task, setTask] = useState<T>(create)
  const [showSolution, setShowSolution] = useState(false)

  const live = useLiveFields(answers(task), {
    onCorrect: () => {
      tracking.onCheck(true)
      onResult(true)
      onSolvedChange(true)
    },
    onWrong: () => {
      tracking.onCheck(false)
      onResult(false)
    },
    onInput: () => tracking.onInput(),
  })

  const newTask = () => {
    tracking.onTaskStart()
    onSolvedChange(false)
    live.reset()
    setShowSolution(false)
    setTask(create())
  }

  const showSol = () => {
    setShowSolution(true)
    onHelp()
    tracking.onHintShown()
  }

  return { task, live, showSolution, newTask, showSol }
}

// ---------- Aufgabe 1: m und t aus der Gleichung ablesen ----------

function newEquationTask() {
  const m = pick(textSlopes)
  // t = 0 gelegentlich, damit auch Ursprungsgeraden vorkommen
  const t = Math.random() < 0.15 ? 0 : pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, -1.5, 2.5])
  const reversed = t !== 0 && Math.random() < 0.35
  return { m, t, reversed }
}

function EquationTaskCard(props: CardProps) {
  const { task, live, showSolution, newTask, showSol } = useInputTask(
    'y-Achsenabschnitt aus Gleichung',
    newEquationTask,
    (k) => [k.m, k.t],
    props,
  )
  const { m, t, reversed } = task

  return (
    <TaskShell
      number={props.number}
      title="Steigung und y-Achsenabschnitt ablesen"
      onNew={newTask}
      onShowSolution={showSol}
      solution={
        showSolution && (
          <>
            <p>
              Gleichung: <Eq>{eq(m, t, reversed)}</Eq>
            </p>
            <p>Die Zahl vor dem x (mit Vorzeichen) ist die Steigung: <b>m = {fmt(m)}</b></p>
            <p>
              Die Zahl ohne x (mit Vorzeichen) ist der y-Achsenabschnitt: <b>t = {fmt(t)}</b>
              {t === 0 && ' (es steht keine Zahl ohne x da)'}
            </p>
            <p>
              Die Gerade schneidet die y-Achse im Punkt S<sub>y</sub>(0|{fmt(t)}).
            </p>
          </>
        )
      }
    >
      <p className="text-slate-700 mb-1">Gib die Steigung m und den y-Achsenabschnitt t der Geraden an.</p>
      <p className="text-center text-xl text-slate-800 my-4">
        <Eq>{eq(m, t, reversed)}</Eq>
      </p>
      <AnswerFields live={live} labels={['m =', 't =']} />
    </TaskShell>
  )
}

// ---------- Aufgabe 2: t im Graphen ablesen ----------

function newGraphInterceptTask() {
  return { m: pick(graphSlopes), t: randomInt(5, -5) }
}

function GraphInterceptTaskCard(props: CardProps) {
  const { task, live, showSolution, newTask, showSol } = useInputTask(
    'y-Achsenabschnitt aus Graph',
    newGraphInterceptTask,
    (k) => [k.t],
    props,
  )
  const { m, t } = task

  return (
    <TaskShell
      number={props.number}
      title="y-Achsenabschnitt im Graphen ablesen"
      onNew={newTask}
      onShowSolution={showSol}
      solution={
        showSolution && (
          <>
            <p>Suche die Stelle, an der die Gerade die y-Achse schneidet (dort ist x = 0).</p>
            <p>
              Der Schnittpunkt ist S<sub>y</sub>(0|{fmt(t)}), also ist <b>t = {fmt(t)}</b>.
            </p>
            <p>
              Die vollständige Gleichung lautet <Eq>{eq(m, t)}</Eq>.
            </p>
          </>
        )
      }
    >
      <p className="text-slate-700 mb-4">Lies den y-Achsenabschnitt t der Geraden ab.</p>
      <Koordinatensystem
        lines={[{ m, t, color: BLUE }]}
        points={showSolution ? [{ x: 0, y: t, color: RED, label: `S(0|${fmt(t)})` }] : []}
        className="w-full max-w-[380px] mb-4"
      />
      <AnswerFields live={live} labels={['t =']} />
    </TaskShell>
  )
}

// ---------- Aufgabe 3: Parallelverschiebung im Graphen ----------

function newShiftGraphTask() {
  let t = 0
  while (t === 0) t = randomInt(5, -5)
  return { m: pick(graphSlopes), t }
}

function ShiftGraphTaskCard(props: CardProps) {
  const { task, live, showSolution, newTask, showSol } = useInputTask(
    'Parallelverschiebung im Graphen',
    newShiftGraphTask,
    (k) => [k.t],
    props,
  )
  const { m, t } = task
  const arrowXs = [-3, 0, 3].filter((x) => Math.abs(m * x) <= 6 && Math.abs(m * x + t) <= 6)

  return (
    <TaskShell
      number={props.number}
      title="Parallelverschiebung erkennen"
      onNew={newTask}
      onShowSolution={showSol}
      solution={
        showSolution && (
          <>
            <p>
              Die gestrichelte Ursprungsgerade geht durch O(0|0), die blaue Gerade schneidet die y-Achse bei{' '}
              {fmt(t)}.
            </p>
            <p>
              Die Gerade wurde also um {fmt(Math.abs(t))} nach {t > 0 ? 'oben' : 'unten'} verschoben:{' '}
              <b>t = {fmt(t)}</b>.
            </p>
            <p>
              Gleichung der blauen Geraden: <Eq>{eq(m, t)}</Eq>
            </p>
          </>
        )
      }
    >
      <p className="text-slate-700 mb-4">
        Die gestrichelte Ursprungsgerade <Eq>{eq(m, 0)}</Eq> wurde parallel verschoben (blaue Gerade). Gib den
        y-Achsenabschnitt t der blauen Geraden an.
      </p>
      <Koordinatensystem
        lines={[
          { m, t: 0, color: GREY, dashed: true },
          { m, t, color: BLUE },
        ]}
        arrows={showSolution ? arrowXs.map((x) => ({ x, y1: m * x, y2: m * x + t, color: RED })) : []}
        className="w-full max-w-[380px] mb-4"
      />
      <AnswerFields live={live} labels={['t =']} />
    </TaskShell>
  )
}

// ---------- Aufgabe 4: Verschiebung rechnerisch ----------

function newShiftTextTask() {
  const m = pick(textSlopes)
  const t0 = Math.random() < 0.3 ? 0 : randomInt(6, -6)
  let k = 0
  while (k === 0 || t0 + k === 0) k = randomInt(6, -6)
  return { m, t0, k }
}

function ShiftTextTaskCard(props: CardProps) {
  const { task, live, showSolution, newTask, showSol } = useInputTask(
    'Parallelverschiebung berechnen',
    newShiftTextTask,
    (k) => [k.m, k.t0 + k.k],
    props,
  )
  const { m, t0, k } = task
  const t = t0 + k

  return (
    <TaskShell
      number={props.number}
      title="Gerade verschieben"
      onNew={newTask}
      onShowSolution={showSol}
      solution={
        showSolution && (
          <>
            <p>Bei einer Verschiebung entlang der y-Achse bleibt die Steigung gleich: <b>m = {fmt(m)}</b>.</p>
            <p>
              Der y-Achsenabschnitt ändert sich um {k > 0 ? '+' : '−'}
              {fmt(Math.abs(k))} ({k > 0 ? 'nach oben' : 'nach unten'}):
            </p>
            <p className="text-center">
              t = {fmt(t0)} {k > 0 ? '+' : '−'} {fmt(Math.abs(k))} = <b>{fmt(t)}</b>
            </p>
            <p>
              Neue Gleichung: <Eq>{eq(m, t)}</Eq>
            </p>
          </>
        )
      }
    >
      <p className="text-slate-700 mb-4">
        Die Gerade <Eq>{eq(m, t0)}</Eq> wird um <b>{fmt(Math.abs(k))}</b>{' '}
        {Math.abs(k) === 1 ? 'Einheit' : 'Einheiten'} nach <b>{k > 0 ? 'oben' : 'unten'}</b> verschoben. Gib m und t
        der verschobenen Geraden an.
      </p>
      <AnswerFields live={live} labels={['m =', 't =']} />
    </TaskShell>
  )
}

// ---------- Aufgabe 5: passenden Graphen zuordnen ----------

function newMatchTask() {
  const m = pick(graphSlopes)
  const t = randomInt(4, -4)
  const candidates = new Set<number>([t])
  if (t !== 0) candidates.add(-t)
  while (candidates.size < 3) candidates.add(randomInt(4, -4))
  return { m, t, options: shuffle([...candidates]) }
}

function MatchTaskCard({ number, onSolvedChange, onResult, onHelp }: CardProps) {
  const tracking = useTaskTracking('Graph zuordnen (y-Achsenabschnitt)')
  const [task, setTask] = useState(newMatchTask)
  const [wrong, setWrong] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const { m, t, options } = task

  const choose = (opt: number) => {
    if (solved || wrong.includes(opt)) return
    if (opt === t) {
      setSolved(true)
      tracking.onCheck(true)
      onResult(true)
      onSolvedChange(true)
    } else {
      setWrong((w) => [...w, opt])
      tracking.onCheck(false)
      onResult(false)
    }
  }

  const newTask = () => {
    tracking.onTaskStart()
    onSolvedChange(false)
    setWrong([])
    setSolved(false)
    setShowSolution(false)
    setTask(newMatchTask())
  }

  const showSol = () => {
    setShowSolution(true)
    onHelp()
    tracking.onHintShown()
  }

  return (
    <TaskShell
      number={number}
      title="Passenden Graphen finden"
      onNew={newTask}
      onShowSolution={showSol}
      solution={
        showSolution && (
          <>
            <p>
              Alle drei Geraden haben dieselbe Steigung m = {fmt(m)}. Sie sind parallel und unterscheiden sich nur im
              y-Achsenabschnitt.
            </p>
            <p>
              Bei <Eq>{eq(m, t)}</Eq> ist t = {fmt(t)}. Gesucht ist also die Gerade, die die y-Achse im Punkt S
              <sub>y</sub>(0|{fmt(t)}) schneidet: <b>Graph {String.fromCharCode(65 + options.indexOf(t))}</b>.
            </p>
          </>
        )
      }
    >
      <p className="text-slate-700 mb-4">
        Welcher Graph gehört zur Gleichung <Eq>{eq(m, t)}</Eq>? Klicke ihn an.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt, i) => {
          const isRight = solved && opt === t
          const isWrong = wrong.includes(opt)
          const border = isRight ? 'border-green-500 bg-green-50' : isWrong ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-400'
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={`rounded-lg border-2 p-2 transition-colors ${border}`}
              aria-label={`Graph ${String.fromCharCode(65 + i)}`}
            >
              <p className="font-bold text-slate-700 mb-1">Graph {String.fromCharCode(65 + i)}</p>
              <Koordinatensystem lines={[{ m, t: opt, color: BLUE }]} range={5} className="w-full max-w-[220px]" />
            </button>
          )
        })}
      </div>
      {solved && <p className="text-center font-bold mt-3 text-green-600">Richtig! Super gemacht!</p>}
      {!solved && wrong.length > 0 && (
        <p className="text-center font-bold mt-3 text-red-600">
          Noch nicht richtig. Wo schneidet die Gerade die y-Achse?
        </p>
      )}
    </TaskShell>
  )
}

// ---------- Aufgabe 6: Gleichung aus dem Graphen ----------

function newFullGraphTask() {
  return { m: pick(graphSlopes), t: randomInt(4, -4) }
}

function FullGraphTaskCard(props: CardProps) {
  const { task, live, showSolution, newTask, showSol } = useInputTask(
    'Gleichung aus Graph (m und t)',
    newFullGraphTask,
    (k) => [k.m, k.t],
    props,
  )
  const { m, t } = task
  // Steigungsdreieck ab S(0|t): bei halben Steigungen 2 nach rechts, sonst 1
  const run = Number.isInteger(m) ? 1 : 2
  const rise = m * run

  return (
    <TaskShell
      number={props.number}
      title="Funktionsgleichung aus dem Graphen"
      onNew={newTask}
      onShowSolution={showSol}
      solution={
        showSolution && (
          <>
            <p>
              <b>1. y-Achsenabschnitt:</b> Die Gerade schneidet die y-Achse in S<sub>y</sub>(0|{fmt(t)}), also{' '}
              <b>t = {fmt(t)}</b>.
            </p>
            <p>
              <b>2. Steigung:</b> Von S<sub>y</sub> aus {run} nach rechts und {fmt(Math.abs(rise))} nach{' '}
              {rise > 0 ? 'oben' : 'unten'}: m = {fmt(rise)} : {run} = <b>{fmt(m)}</b>.
            </p>
            <p>
              <b>3. Gleichung:</b> <Eq>{eq(m, t)}</Eq>
            </p>
          </>
        )
      }
    >
      <p className="text-slate-700 mb-4">
        Bestimme die Steigung m und den y-Achsenabschnitt t und damit die Gleichung <Eq>y = m · x + t</Eq>.
      </p>
      <Koordinatensystem
        lines={[{ m, t, color: BLUE }]}
        points={
          showSolution
            ? [
                { x: 0, y: t, color: RED, label: `S(0|${fmt(t)})` },
                { x: run, y: t + rise, color: GREEN },
              ]
            : []
        }
        className="w-full max-w-[380px] mb-4"
      />
      <AnswerFields live={live} labels={['m =', 't =']} />
    </TaskShell>
  )
}

// ---------- Seite ----------

const cardTypes = [
  EquationTaskCard,
  GraphInterceptTaskCard,
  ShiftGraphTaskCard,
  ShiftTextTaskCard,
  MatchTaskCard,
  FullGraphTaskCard,
]

export default function YAchsenabschnitt() {
  const navigate = useNavigate()
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

  const exercisesRef = useRef<HTMLHeadingElement>(null)

  const startNewRound = () => {
    setRound((r) => r + 1)
    setSolved({})
    setFinished(false)
    exercisesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cards = cardTypes.map((Card, i) => (
    // Die Karten bleiben nach einem Neustart per key getrennt (frischer Zustand, eigenes Tracking)
    <React.Fragment key={`${round}-${i}`}>
      <Card
        number={i + 1}
        onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
        onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
        onHelp={() => setStreak(0)}
      />
    </React.Fragment>
  ))

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-8 max-w-6xl w-full flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">y-Achsenabschnitt</h1>
          <p className="text-center text-slate-600">
            Lerne Funktionen der Form <Eq>y = m · x + t</Eq> kennen: Was bedeutet t und wie verschiebt es die Gerade?
          </p>
        </div>

        <Erklaerung />

        <h2 ref={exercisesRef} className="text-xl font-bold text-slate-800 text-center mt-2 scroll-mt-4">
          Übungsaufgaben
        </h2>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">{cards}</div>

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

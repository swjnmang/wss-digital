import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BLUE,
  HALVES,
  MitternachtsFullSteps,
  MitternachtsSteps,
  PRAISE,
  type AnswerStatus,
  type Q,
  RED,
  Steps,
  Tex,
  Video,
  add,
  btnPrimary,
  btnSecondary,
  coeff,
  discriminant,
  eqQ,
  eqSign,
  isIncomplete,
  isInt,
  lineTex,
  mul,
  neg,
  panel,
  parseAnswer,
  pick,
  polyTex,
  q,
  randomInt,
  sgq,
  shuffle,
  solveQuadratic,
  sqrtQ,
  statusBorder,
  sub,
  tn,
  tq,
  val,
  vertexTex,
  vertexToGeneralLines,
} from './quadratischShared'
import TaskShell from '../../components/layout/TaskShell'
import SkateEinstieg from './schnittpunkte_einstieg/SkateEinstieg'

// Sechs Aufgaben gleichzeitig auf der Seite
const TOTAL_TASKS = 6

const VIDEO_ID = 'l_TwKs9TWoA'

// Einfach: Parabel y = ax² + bx + c und Gerade y = mx + t mit ganzen Zahlen
// Fortgeschritten: Brüche und Parabeln in Scheitelform y = a(x − x_S)² + y_S
type Level = 'einfach' | 'fortgeschritten'
type Form = 'allgemein' | 'scheitel'
type Count = 0 | 1 | 2

const LEVEL_LABEL: Record<Level, string> = { einfach: 'Einfach', fortgeschritten: 'Fortgeschritten' }

// ---------- Aufgaben erzeugen ----------

interface Task {
  form: Form
  /** Parabel y = ax² + bx + c (bei Scheitelform zusätzlich x_S, y_S) */
  a: Q
  b: Q
  c: Q
  xs: number
  ys: Q
  /** Gerade y = mx + t */
  m: Q
  t: Q
  /** Gleichung nach dem Umstellen: A x² + B x + C = 0 */
  A: Q
  B: Q
  C: Q
  /** Schnittpunkte in der Reihenfolge des Lösungswegs (x₁ mit +, x₂ mit −) */
  points: { x: number; y: number }[]
  parabolaTex: string
  key: string
}

interface Spec {
  form: Form
  count: Count
}

/** Koeffizienten B, C von A·x² + B·x + C = 0 mit vorgegebener Anzahl Lösungen */
function quadFor(A: Q, count: Count, values: readonly Q[], allowIrrational: boolean): { B: Q; C: Q } | null {
  if (count === 2 && allowIrrational && Math.random() < 0.3) {
    // Schnittstellen sind keine "glatten" Zahlen: Ergebnis runden
    const B = pick(values)
    const C = pick(values)
    const D = discriminant(A, B, C)
    return D.n > 0 && !sqrtQ(D) ? { B, C } : null
  }
  if (count === 2) {
    const x1 = pick(values)
    const x2 = pick(values)
    if (eqQ(x1, x2)) return null
    return { B: neg(mul(A, add(x1, x2))), C: mul(A, mul(x1, x2)) }
  }
  const xv = pick(values)
  if (count === 1) return { B: neg(mul(q(2), mul(A, xv))), C: mul(A, mul(xv, xv)) }
  // keine Lösung: Scheitel von A·x² + B·x + C liegt auf der "falschen" Seite der x-Achse
  const yv = mul(q(Math.sign(A.n)), pick(values.filter((v) => v.n > 0)))
  return { B: neg(mul(q(2), mul(A, xv))), C: add(mul(A, mul(xv, xv)), yv) }
}

function makeTask(form: Form, a: Q, b: Q, c: Q, m: Q, t: Q, xs = 0, ys = q(0)): Task {
  const A = a
  const B = sub(b, m)
  const C = sub(c, t)
  const points = solveQuadratic(A, B, C).map((x) => ({ x, y: val(m) * x + val(t) }))
  const parabolaTex = form === 'scheitel' ? vertexTex(a, xs, ys) : polyTex(a, b, c)
  return { form, a, b, c, xs, ys, m, t, A, B, C, points, parabolaTex, key: `${parabolaTex}|${lineTex(m, t)}` }
}

const INTS = Array.from({ length: 11 }, (_, i) => q(i - 5)) // −5 … 5

function newEasyTask(count: Count): Task {
  for (;;) {
    const a = q(pick([1, 1, 1, -1, -1, 2, -2]))
    const quad = quadFor(a, count, INTS, false)
    if (!quad) continue
    const m = q(pick([-3, -2, -1, 1, 2, 3]))
    const t = q(randomInt(6, -6))
    const b = add(quad.B, m)
    const c = add(quad.C, t)
    if (Math.abs(val(b)) > 10 || Math.abs(val(c)) > 15) continue
    const task = makeTask('allgemein', a, b, c, m, t)
    // a, b und c sollen eindeutig sein: keine Gleichungen wie x² = 0, x² − 4 = 0 oder x² + 3x = 0
    if (task.B.n === 0 || task.C.n === 0) continue
    if (task.points.some((p) => Math.abs(p.y) > 25)) continue
    return task
  }
}

const FRAC_A = [q(1, 2), q(-1, 2), q(1, 4), q(-1, 4), q(3, 2), q(-3, 2), q(2), q(-2), q(1), q(-1)]
const FRAC_M = [q(1, 2), q(-1, 2), q(3, 2), q(-3, 2), q(1), q(-1), q(2), q(-2), q(3), q(-3)]

function newFractionTask(count: Count): Task {
  for (;;) {
    const a = pick(FRAC_A)
    const quad = quadFor(a, count, HALVES.filter((h) => Math.abs(val(h)) <= 5), true)
    if (!quad) continue
    const m = pick(FRAC_M)
    const t = pick(HALVES)
    const b = add(quad.B, m)
    const c = add(quad.C, t)
    // Mindestens ein Bruch soll vorkommen, die Zahlen bleiben überschaubar
    if ([a, b, c, m, t].every(isInt)) continue
    if (Math.abs(val(b)) > 10 || Math.abs(val(c)) > 15 || b.d > 4 || c.d > 8) continue
    const task = makeTask('allgemein', a, b, c, m, t)
    if (task.points.some((p) => Math.abs(p.y) > 25)) continue
    return task
  }
}

const VERTEX_A = [q(1), q(-1), q(2), q(-2), q(1, 2), q(-1, 2)]

function newVertexTask(count: Count): Task {
  for (;;) {
    const a = pick(VERTEX_A)
    const xs = randomInt(4, -4)
    const ys = q(randomInt(6, -6))
    if (xs === 0) continue
    // Parabel ausmultipliziert
    const b = neg(mul(q(2 * xs), a))
    const c = add(mul(a, q(xs * xs)), ys)
    const quad = quadFor(a, count, INTS, true)
    if (!quad) continue
    // Gerade so wählen, dass b − m = B und c − t = C
    const m = sub(b, quad.B)
    const t = sub(c, quad.C)
    if (m.n === 0 || Math.abs(val(m)) > 4 || Math.abs(val(t)) > 10 || m.d > 2 || t.d > 4) continue
    const task = makeTask('scheitel', a, b, c, m, t, xs, ys)
    if (task.points.some((p) => Math.abs(p.y) > 25)) continue
    return task
  }
}

function newTask(level: Level, spec: Spec): Task {
  if (level === 'einfach') return newEasyTask(spec.count)
  return spec.form === 'scheitel' ? newVertexTask(spec.count) : newFractionTask(spec.count)
}

/** Aufbau einer Seite: meist zwei Schnittpunkte, je einmal einer bzw. keiner; Fortgeschritten im Wechsel mit Scheitelform */
function pageSpecs(level: Level): Spec[] {
  const counts = shuffle<Count>([2, 2, 2, 2, 1, 0])
  return counts.map((count, i) => ({ count, form: level === 'fortgeschritten' && i % 2 === 1 ? 'scheitel' : 'allgemein' }))
}

/** Sechs paarweise verschiedene Aufgaben */
function pageTasks(level: Level): { spec: Spec; task: Task }[] {
  const seen = new Set<string>()
  return pageSpecs(level).map((spec) => {
    let task: Task
    do task = newTask(level, spec)
    while (seen.has(task.key))
    seen.add(task.key)
    return { spec, task }
  })
}

// ---------- Live-Auswertung ----------

const X_TOL = 0.01
// y wird aus dem (evtl. gerundeten) x berechnet, daher etwas großzügiger
const Y_TOL = 0.05

interface PointInput {
  x: string
  y: string
}

const parsed = (s: string) => (isIncomplete(s) ? NaN : parseAnswer(s))

/** Auswertung der eingegebenen Punkte; die Reihenfolge der Punkte ist egal */
function evaluatePoints(inputs: PointInput[], points: { x: number; y: number }[]) {
  const used: number[] = []
  return inputs.map((inp) => {
    const x = parsed(inp.x)
    const y = parsed(inp.y)
    const idx = Number.isNaN(x) ? -1 : points.findIndex((p, i) => !used.includes(i) && Math.abs(p.x - x) < X_TOL)
    const dup = idx === -1 && !Number.isNaN(x) && points.some((p) => Math.abs(p.x - x) < X_TOL)
    let xs: AnswerStatus = isIncomplete(inp.x) ? 'idle' : idx >= 0 ? 'right' : 'wrong'
    let ys: AnswerStatus = 'idle'
    if (!isIncomplete(inp.y)) {
      if (idx >= 0) ys = Math.abs(points[idx].y - y) < Y_TOL ? 'right' : 'wrong'
      else ys = points.some((p) => Math.abs(p.y - y) < Y_TOL) ? 'right' : 'wrong'
    }
    if (idx >= 0) used.push(idx)
    if (dup) xs = 'wrong'
    return { xs, ys, dup }
  })
}

function CoordInput({
  value,
  status,
  onChange,
  placeholder,
  readOnly,
  label,
}: {
  value: string
  status: AnswerStatus
  onChange: (v: string) => void
  placeholder: string
  readOnly: boolean
  label: string
}) {
  return (
    <input
      value={value}
      readOnly={readOnly}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className={`w-20 sm:w-24 text-center border-2 rounded px-2 py-2 text-lg focus:outline-none transition-colors ${statusBorder(status)}`}
      placeholder={placeholder}
      inputMode="decimal"
      aria-label={label}
    />
  )
}

// ---------- Lösungsweg ----------

/** Rechenoperation zum Wegbringen von v·x bzw. v */
const opX = (v: Q) => (v.n > 0 ? `- ${coeff(v)}x` : `+ ${coeff(neg(v))}x`)
const opC = (v: Q) => (v.n > 0 ? `- ${tq(v)}` : `+ ${tq(neg(v))}`)

const pointTex = (i: number | null, p: { x: number; y: number }) => `S${i === null ? '' : `_${i}`}(${tn(p.x)} \\mid ${tn(p.y)})`

function pointsText(points: { x: number; y: number }[]) {
  if (points.length === 1) return pointTex(null, points[0])
  return points.map((p, i) => pointTex(i + 1, p)).join('\\quad ')
}

function SolutionSteps({ task, level }: { task: Task; level: Level }) {
  const { a, b, c, m, t, xs, ys, A, B, C, points } = task
  const poly = polyTex(a, b, c)
  const line = lineTex(m, t)

  // Schritt 2: alles auf eine Seite
  const lines: { tex: string; op?: string }[] = [{ tex: `${poly} = ${line}` }]
  if (m.n !== 0) {
    lines[lines.length - 1].op = opX(m)
    lines.push({ tex: `${polyTex(a, sub(b, m), c)} = ${tq(t)}` })
  }
  if (t.n !== 0) {
    lines[lines.length - 1].op = opC(t)
    lines.push({ tex: `${polyTex(A, B, C)} = 0` })
  }

  const n = points.length
  return (
    <div className="mt-6 bk-taskbox text-left text-slate-700 space-y-3">
      <h3 className="text-base font-bold text-slate-800 text-center">Lösungsweg</h3>
      {task.form === 'scheitel' && (
        <div>
          <p className="font-semibold text-slate-800">Vorab: Scheitelform in die allgemeine Form umformen</p>
          <Steps lines={vertexToGeneralLines(a, xs, ys).map((tex) => ({ tex }))} />
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-800">Schritt 1: Funktionsterme gleichsetzen</p>
        <Tex display tex={`${poly} = ${line}`} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">Schritt 2: Alles auf eine Seite bringen</p>
        <Steps lines={lines} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">Schritt 3: Mitternachtsformel</p>
        {level === 'einfach' ? (
          <MitternachtsFullSteps a={A} b={B} c={C} noun="Schnittpunkt" />
        ) : (
          <MitternachtsSteps a={A} b={B} c={C} noun="Schnittpunkt" />
        )}
      </div>
      {n > 0 && (
        <div>
          <p className="font-semibold text-slate-800">Schritt 4: y-Koordinate berechnen (in die Gerade einsetzen)</p>
          {points.map((p, i) => (
            <div key={i}>
              <Tex
                display
                tex={`y = ${tq(m)} \\cdot (${tn(p.x)})${t.n !== 0 ? ` ${sgq(t)}` : ''} ${eqSign(p.x) === '=' ? eqSign(p.y) : '\\approx'} ${tn(p.y)} \\;\\Rightarrow\\; ${pointTex(n === 1 ? null : i + 1, p)}`}
              />
            </div>
          ))}
        </div>
      )}
      <div className="font-bold text-slate-800 text-center text-lg">
        {n === 0 ? <p>Kein Schnittpunkt</p> : <Tex display tex={pointsText(points)} />}
      </div>
      <SolutionGraph task={task} />
    </div>
  )
}

// ---------- Grafische Lösung ----------

const P_COLOR = '#2563eb'
const G_COLOR = '#ea580c'
const fmt = (n: number) => {
  const r = Math.round(n * 100) / 100
  return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',')
}
const niceStep = (span: number) => [1, 2, 5, 10].find((s) => span / s <= 20) ?? 20

/** Koordinatensystem mit Parabel, Gerade und den Schnittpunkten der Aufgabe */
function SolutionGraph({ task }: { task: Task }) {
  const { a, b, c, m, t, A, B, points } = task
  const p = (x: number) => val(a) * x * x + val(b) * x + val(c)
  const g = (x: number) => val(m) * x + val(t)

  // Sichtbarer Bereich: Schnittpunkte, Scheitel und die Stelle, an der sich Parabel und Gerade am nächsten kommen
  const xv = -val(b) / (2 * val(a))
  const xd = -val(B) / (2 * val(A))
  const relX = [0, xv, xd, ...points.map((pt) => pt.x)]
  let xMin = Math.floor(Math.min(...relX) - 2)
  let xMax = Math.ceil(Math.max(...relX) + 2)
  while (xMax - xMin < 8) {
    xMin--
    xMax++
  }
  const relY = [0, p(xv), p(xd), g(xd), ...points.map((pt) => pt.y)]
  const yMin = Math.floor(Math.min(...relY) - 2)
  const yMax = Math.ceil(Math.max(...relY) + 2)

  const W = 340
  const ux = W / (xMax - xMin)
  const H = Math.min(440, Math.max(260, (yMax - yMin) * ux))
  const uy = H / (yMax - yMin)
  const px = (x: number) => (x - xMin) * ux
  const py = (y: number) => (yMax - y) * uy
  const yStep = niceStep(yMax - yMin)
  const xStep = niceStep(xMax - xMin)

  const gridX = Array.from({ length: Math.floor(xMax / xStep) - Math.ceil(xMin / xStep) + 1 }, (_, i) => (Math.ceil(xMin / xStep) + i) * xStep)
  const gridY = Array.from({ length: Math.floor(yMax / yStep) - Math.ceil(yMin / yStep) + 1 }, (_, i) => (Math.ceil(yMin / yStep) + i) * yStep)

  const curve: string[] = []
  for (let x = xMin; x <= xMax + 1e-9; x += (xMax - xMin) / 300) curve.push(`${px(x).toFixed(1)},${py(p(x)).toFixed(1)}`)

  const id = `clip-${task.key.replace(/[^a-z0-9]/gi, '')}`
  const n = points.length
  const label = (i: number) => (n === 1 ? 'S' : `S${i === 0 ? '₁' : '₂'}`)
  const caption =
    n === 0
      ? 'Parabel und Gerade haben keinen gemeinsamen Punkt.'
      : n === 1
        ? 'Die Gerade berührt die Parabel in genau einem Punkt.'
        : 'Parabel und Gerade schneiden sich in den beiden berechneten Punkten.'

  return (
    <div>
      <p className="font-semibold text-slate-800">Grafische Lösung</p>
      <svg viewBox={`-12 -12 ${W + 24} ${H + 24}`} className="w-full max-w-sm mx-auto block" role="img" aria-label={`Parabel p und Gerade g. ${caption}`}>
        <defs>
          <clipPath id={id}>
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        {gridX.map((x) => (
          <line key={`gx${x}`} x1={px(x)} y1={0} x2={px(x)} y2={H} stroke="#e2e8f0" strokeWidth={1} />
        ))}
        {gridY.map((y) => (
          <line key={`gy${y}`} x1={0} y1={py(y)} x2={W} y2={py(y)} stroke="#e2e8f0" strokeWidth={1} />
        ))}
        <line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke="#334155" strokeWidth={1.5} />
        <line x1={px(0)} y1={H} x2={px(0)} y2={0} stroke="#334155" strokeWidth={1.5} />
        <text x={W - 4} y={py(0) - 6} fontSize={12} textAnchor="end" fill="#334155">x</text>
        <text x={px(0) + 6} y={12} fontSize={12} fill="#334155">y</text>
        {gridX.filter((x) => x !== 0 && x % (2 * xStep) === 0).map((x) => (
          <text key={`lx${x}`} x={px(x)} y={py(0) + 13} fontSize={9} textAnchor="middle" fill="#64748b">{fmt(x)}</text>
        ))}
        {gridY.filter((y) => y !== 0 && y % (2 * yStep) === 0).map((y) => (
          <text key={`ly${y}`} x={px(0) - 4} y={py(y) + 3} fontSize={9} textAnchor="end" fill="#64748b">{fmt(y)}</text>
        ))}
        <g clipPath={`url(#${id})`}>
          <polyline points={curve.join(' ')} fill="none" stroke={P_COLOR} strokeWidth={2.5} />
          <line x1={px(xMin)} y1={py(g(xMin))} x2={px(xMax)} y2={py(g(xMax))} stroke={G_COLOR} strokeWidth={2.5} />
        </g>
        {points.map((pt, i) => {
          const right = px(pt.x) < W - 90
          return (
            <g key={i}>
              <circle cx={px(pt.x)} cy={py(pt.y)} r={5} fill={RED} />
              <text x={px(pt.x) + (right ? 8 : -8)} y={py(pt.y) + (i === 0 ? -6 : 14)} fontSize={12} fontWeight="bold" textAnchor={right ? 'start' : 'end'} fill={RED}>
                {label(i)}({fmt(pt.x)}|{fmt(pt.y)})
              </text>
            </g>
          )
        })}
      </svg>
      <p className="text-sm text-slate-600 text-center mt-1">
        <span style={{ color: P_COLOR }} className="font-bold">p</span> Parabel, <span style={{ color: G_COLOR }} className="font-bold">g</span> Gerade. {caption}
      </p>
    </div>
  )
}

// ---------- Aufgabenkarte ----------

interface CardProps {
  number: number
  level: Level
  task: Task
  onSolvedChange: (solved: boolean) => void
  onResult: (correct: boolean) => void
  onHelp: () => void
}

const COUNT_LABEL: Record<Count, string> = { 2: 'Zwei Schnittpunkte', 1: 'Ein Schnittpunkt', 0: 'Kein Schnittpunkt' }

const emptyInputs = (): PointInput[] => [
  { x: '', y: '' },
  { x: '', y: '' },
]

function TaskCard({ number, level, task, onSolvedChange, onResult, onHelp }: CardProps) {
  const [count, setCount] = useState<Count | null>(null)
  const [inputs, setInputs] = useState<PointInput[]>(emptyInputs)
  const [solved, setSolved] = useState(false)
  const [praise, setPraise] = useState(PRAISE[0])
  const [showSolution, setShowSolution] = useState(false)

  const points = task.points
  const n = points.length
  const countRight = count === n
  const active = inputs.slice(0, n)
  const results = evaluatePoints(active, points)

  const allRight = countRight && results.every((r) => r.xs === 'right' && r.ys === 'right')
  const allFilled = active.every((p) => !isIncomplete(p.x) && !isIncomplete(p.y))
  const anyWrong = results.some((r) => r.xs === 'wrong' || r.ys === 'wrong')
  const dup = results.some((r) => r.dup)

  useEffect(() => {
    if (solved || !countRight) return
    if (allRight) {
      setSolved(true)
      setPraise(pick(PRAISE))
      setShowSolution(false)
      onSolvedChange(true)
      onResult(true)
      return
    }
    // Falscher Versuch zählt erst, wenn die Eingabe kurz stehen bleibt
    if (anyWrong && allFilled) {
      const timer = setTimeout(() => onResult(false), 900)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, count, solved])

  function chooseCount(next: Count) {
    if (solved) return
    setCount(next)
    if (next !== n) onResult(false)
  }

  function setInput(i: number, field: 'x' | 'y', value: string) {
    setInputs((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))
  }

  function onShowSolution() {
    setShowSolution(true)
    onHelp()
  }

  let message: React.ReactNode = null
  if (solved) {
    message = (
      <p className="text-center font-bold mt-4 text-green-600">
        {praise} {n === 0 ? 'Parabel und Gerade schneiden sich nicht.' : <Tex tex={pointsText(points)} />}
      </p>
    )
  } else if (count !== null && !countRight) {
    message = (
      <p className="text-center font-bold mt-4 text-red-600">
        Die Anzahl stimmt noch nicht. Tipp: Setze gleich, bringe alles auf eine Seite und{' '}
        {level === 'einfach' ? (
          <>wende die Mitternachtsformel an. Zeigt der Taschenrechner „Math ERROR“, gibt es keine Lösung.</>
        ) : (
          <>berechne die Diskriminante <Tex tex="D = b^2 - 4ac" />.</>
        )}
      </p>
    )
  } else if (dup) {
    message = <p className="text-center font-bold mt-4 text-red-600">Beide Punkte haben dieselbe x-Koordinate. Gesucht ist auch der zweite Schnittpunkt.</p>
  } else if (results.some((r) => r.xs === 'right' && r.ys === 'wrong')) {
    message = <p className="text-center font-bold mt-4 text-red-600">x stimmt, aber y noch nicht. Setze x in die Geradengleichung ein.</p>
  } else if (anyWrong) {
    message = <p className="text-center font-bold mt-4 text-red-600">Noch nicht richtig.</p>
  } else if (countRight && n === 2 && results.some((r) => r.xs === 'right' && r.ys === 'right')) {
    message = <p className="text-center font-bold mt-4 text-green-600">Ein Schnittpunkt stimmt schon! Jetzt noch der zweite.</p>
  }

  const countBtn = (c: Count) => {
    const isActive = count === c
    const cls = isActive
      ? c === n
        ? 'border-green-500 bg-green-50 text-green-800'
        : 'border-red-500 bg-red-50 text-red-800'
      : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
    return (
      <button key={c} type="button" onClick={() => chooseCount(c)} disabled={solved && !isActive} className={`py-2 px-4 rounded border-2 font-semibold transition-colors disabled:opacity-50 ${cls}`}>
        {COUNT_LABEL[c]}
      </button>
    )
  }

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}</h2>
      <p className="text-slate-700 mb-1">
        Berechne die Schnittpunkte der Parabel p mit der Geraden g.
        {level === 'fortgeschritten' && ' Runde, falls nötig, auf zwei Nachkommastellen.'}
      </p>
      <div className="text-center text-xl sm:text-2xl text-slate-800 my-4">
        <Tex display tex={`p\\colon\\; y = ${task.parabolaTex}`} />
        <Tex display tex={`g\\colon\\; y = ${lineTex(task.m, task.t)}`} />
      </div>

      <p className="text-slate-700 font-semibold mb-2">Wie viele Schnittpunkte gibt es?</p>
      <div className="flex flex-wrap justify-center gap-2">{([2, 1, 0] as Count[]).map(countBtn)}</div>

      {countRight && n > 0 && (
        <div className="flex flex-col items-center gap-3 mt-4">
          {active.map((p, i) => (
            <div key={i} className="flex items-center gap-1 sm:gap-2 text-xl text-slate-800">
              <Tex tex={n === 1 ? 'S\\Big(' : `S_${i + 1}\\Big(`} />
              <CoordInput value={p.x} status={results[i].xs} onChange={(v) => setInput(i, 'x', v)} placeholder="x" readOnly={solved} label={`x-Koordinate Schnittpunkt ${i + 1}`} />
              <Tex tex="\Big|" />
              <CoordInput value={p.y} status={results[i].ys} onChange={(v) => setInput(i, 'y', v)} placeholder="y" readOnly={solved} label={`y-Koordinate Schnittpunkt ${i + 1}`} />
              <Tex tex="\Big)" />
            </div>
          ))}
        </div>
      )}

      {message}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={onShowSolution} className={btnSecondary}>Lösung anzeigen</button>
      </div>

      {showSolution && <SolutionSteps task={task} level={level} />}
    </div>
  )
}

// ---------- Erklärung als Slides (Beispiel mit mitwachsendem Graph) und Erklärvideo ----------

// Beispiel: p: y = x² + 2x − 4 und g: y = 3x + 2  →  S₁(3|11), S₂(−2|−4)
const SX = 22 // Pixel pro Einheit
const X_MIN = -6, X_MAX = 5, Y_MIN = -6, Y_MAX = 13
const toPx = (x: number, y: number) => ({ px: (x - X_MIN) * SX, py: (Y_MAX - y) * SX })
const exP = (x: number) => x * x + 2 * x - 4
const exG = (x: number) => 3 * x + 2

/**
 * Graph zum Beispiel, der mit den Slides mitwächst:
 * problem = Schnittpunkte nur als „?“, x = die berechneten x-Werte als gestrichelte Linien, points = fertige Schnittpunkte
 */
type GraphStage = 'problem' | 'x' | 'points'

function ExampleGraph({ stage }: { stage: GraphStage }) {
  const w = (X_MAX - X_MIN) * SX
  const h = (Y_MAX - Y_MIN) * SX
  const o = toPx(0, 0)
  const s1 = toPx(3, 11)
  const s2 = toPx(-2, -4)
  const xs = Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => X_MIN + i)
  const ys = Array.from({ length: Y_MAX - Y_MIN + 1 }, (_, i) => Y_MIN + i)
  const pts: string[] = []
  for (let x = -5.2; x <= 3.2; x += 0.05) {
    const p = toPx(x, exP(x))
    pts.push(`${p.px.toFixed(1)},${p.py.toFixed(1)}`)
  }
  const g1 = toPx(-8 / 3, exG(-8 / 3))
  const g2 = toPx(11 / 3, exG(11 / 3))
  const label =
    stage === 'points'
      ? 'Parabel y = x² + 2x − 4 und Gerade y = 3x + 2 mit den Schnittpunkten S1(3|11) und S2(−2|−4)'
      : 'Parabel y = x² + 2x − 4 und Gerade y = 3x + 2, die Schnittpunkte sind noch unbekannt'
  return (
    <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} className="w-full max-w-[16rem] mx-auto" role="img" aria-label={label}>
      {xs.map((x) => (
        <line key={`gx${x}`} x1={toPx(x, 0).px} y1={0} x2={toPx(x, 0).px} y2={h} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {ys.map((y) => (
        <line key={`gy${y}`} x1={0} y1={toPx(0, y).py} x2={w} y2={toPx(0, y).py} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      <line x1={0} y1={o.py} x2={w} y2={o.py} stroke="#334155" strokeWidth={1.5} />
      <line x1={o.px} y1={h} x2={o.px} y2={0} stroke="#334155" strokeWidth={1.5} />
      <text x={w - 4} y={o.py - 6} fontSize={12} textAnchor="end" fill="#334155">x</text>
      <text x={o.px + 6} y={12} fontSize={12} fill="#334155">y</text>
      {xs.filter((x) => x !== 0 && x % 2 === 0).map((x) => (
        <text key={`lx${x}`} x={toPx(x, 0).px} y={o.py + 13} fontSize={9} textAnchor="middle" fill="#64748b">{x}</text>
      ))}
      {ys.filter((y) => y !== 0 && y % 2 === 0).map((y) => (
        <text key={`ly${y}`} x={o.px - 4} y={toPx(0, y).py + 3} fontSize={9} textAnchor="end" fill="#64748b">{y}</text>
      ))}
      <polyline points={pts.join(' ')} fill="none" stroke={P_COLOR} strokeWidth={2.5} />
      <line x1={g1.px} y1={g1.py} x2={g2.px} y2={g2.py} stroke={G_COLOR} strokeWidth={2.5} />
      <text x={toPx(-4.6, 6).px} y={toPx(-4.6, 6).py} fontSize={12} fontWeight="bold" fill={P_COLOR}>p</text>
      <text x={toPx(-2.2, -6).px} y={toPx(-2.2, -5.4).py} fontSize={12} fontWeight="bold" fill={G_COLOR}>g</text>
      {stage === 'problem' &&
        [s1, s2].map((s, i) => (
          <g key={i}>
            <circle cx={s.px} cy={s.py} r={9} fill="#fff" stroke="#334155" strokeWidth={2} />
            <text x={s.px} y={s.py + 4.5} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#334155">?</text>
          </g>
        ))}
      {stage === 'x' && (
        <>
          <line x1={s1.px} y1={0} x2={s1.px} y2={h} stroke={RED} strokeWidth={1.5} strokeDasharray="5 4" />
          <line x1={s2.px} y1={0} x2={s2.px} y2={h} stroke={BLUE} strokeWidth={1.5} strokeDasharray="5 4" />
          <text x={s1.px - 4} y={12} fontSize={12} fontWeight="bold" textAnchor="end" fill={RED}>x₁ = 3</text>
          <text x={s2.px - 4} y={12} fontSize={12} textAnchor="end" fontWeight="bold" fill={BLUE}>x₂ = −2</text>
        </>
      )}
      {stage === 'points' && (
        <>
          <circle cx={s1.px} cy={s1.py} r={5} fill={RED} />
          <circle cx={s2.px} cy={s2.py} r={5} fill={BLUE} />
          <text x={s1.px - 8} y={s1.py - 6} fontSize={12} fontWeight="bold" textAnchor="end" fill={RED}>S₁(3|11)</text>
          <text x={s2.px - 8} y={s2.py + 4} fontSize={12} fontWeight="bold" textAnchor="end" fill={BLUE}>S₂(−2|−4)</text>
        </>
      )}
    </svg>
  )
}

interface Slide {
  title: string
  body: React.ReactNode
  /** Ohne Graph nimmt der Text die ganze Breite ein */
  graph?: GraphStage
}

const P_TEX = `\\textcolor{${P_COLOR}}{x^2 + 2x - 4}`
const G_TEX = `\\textcolor{${G_COLOR}}{3x + 2}`

function exampleSlides(level: Level): Slide[] {
  const slides: Slide[] = [
    {
      title: 'Das Problem',
      graph: 'problem',
      body: (
        <>
          <p>Gegeben sind eine Parabel und eine Gerade:</p>
          <Tex display tex={`p\\colon\\; y = ${P_TEX}`} />
          <Tex display tex={`g\\colon\\; y = ${G_TEX}`} />
          <p>
            Im Graph siehst du: Die beiden schneiden sich in <strong>zwei Punkten</strong>. Aber wo genau? Ablesen ist ungenau – deshalb
            berechnen wir die Schnittpunkte.
          </p>
        </>
      ),
    },
    {
      title: 'Die Idee',
      graph: 'problem',
      body: (
        <>
          <p>
            In einem Schnittpunkt liegen Parabel und Gerade <strong>an derselben Stelle</strong>: Für dasselbe x haben beide denselben
            y-Wert.
          </p>
          <p>Also muss gelten: y-Wert der Parabel = y-Wert der Geraden.</p>
          <p className="font-semibold">Schritt 1: Funktionsterme gleichsetzen</p>
          <Tex display tex={`${P_TEX} = ${G_TEX}`} />
        </>
      ),
    },
    {
      title: 'Alles auf eine Seite',
      graph: 'problem',
      body: (
        <>
          <p>
            <span className="font-semibold">Schritt 2:</span> Bringe alles auf die linke Seite, sodass rechts die Zahl 0 steht. Beim
            Wegbringen wechselt das Rechenzeichen: Aus <Tex tex="+3x" /> wird <Tex tex="-3x" />.
          </p>
          <Steps
            lines={[
              { tex: 'x^2 + 2x - 4 = 3x + 2', op: '-3x' },
              { tex: 'x^2 - x - 4 = 2', op: '-2' },
              { tex: 'x^2 - x - 6 = 0' },
            ]}
          />
          <p>Jetzt steht da eine quadratische Gleichung, die wir lösen können.</p>
        </>
      ),
    },
    {
      title: 'a, b und c ablesen',
      graph: 'problem',
      body: (
        <>
          <p>
            <span className="font-semibold">Schritt 3:</span> Lies die Zahlen vor <Tex tex="x^2" />, vor <Tex tex="x" /> und ohne x ab. Das
            Vorzeichen gehört immer dazu!
          </p>
          <Tex display tex={`\\textcolor{${RED}}{1}x^2 \\textcolor{${BLUE}}{- 1}x \\textcolor{#15803d}{- 6} = 0`} />
          <Tex display tex={`\\textcolor{${RED}}{a = 1},\\quad \\textcolor{${BLUE}}{b = -1},\\quad \\textcolor{#15803d}{c = -6}`} />
          <p className="text-sm text-slate-600">
            Steht vor <Tex tex="x^2" /> oder <Tex tex="x" /> keine Zahl, ist es die 1: <Tex tex="-x" /> bedeutet <Tex tex="-1x" />.
          </p>
        </>
      ),
    },
    {
      title: 'Mitternachtsformel',
      graph: 'x',
      body: (
        <>
          <p>
            <span className="font-semibold">Schritt 4:</span> Setze a, b und c in die Mitternachtsformel ein. Negative Zahlen schreibst du
            in Klammern!
          </p>
          <Tex display tex="x_{1,2} = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />
          <Tex display tex="x_{1,2} = \frac{-(-1) \pm \sqrt{(-1)^2 - 4 \cdot 1 \cdot (-6)}}{2 \cdot 1}" />
          <Tex display tex="x_{1,2} = \frac{1 \pm \sqrt{25}}{2} = \frac{1 \pm 5}{2}" />
          <div className="flex flex-wrap justify-center gap-x-8">
            <Tex display tex={`x_1 = \\frac{1 + 5}{2} = \\textcolor{${RED}}{3}`} />
            <Tex display tex={`x_2 = \\frac{1 - 5}{2} = \\textcolor{${BLUE}}{-2}`} />
          </div>
          <p>Das sind die x-Werte der Schnittpunkte – im Graph als gestrichelte Linien.</p>
        </>
      ),
    },
    {
      title: 'y-Koordinaten berechnen',
      graph: 'points',
      body: (
        <>
          <p>
            <span className="font-semibold">Schritt 5:</span> Setze <Tex tex="x_1" /> und <Tex tex="x_2" /> in eine der beiden
            Funktionsgleichungen ein. Die Gerade <Tex tex="y = 3x + 2" /> ist meist einfacher.
          </p>
          <Tex display tex={`y = 3 \\cdot \\textcolor{${RED}}{3} + 2 = 11 \\;\\Rightarrow\\; S_1(3 \\mid 11)`} />
          <Tex display tex={`y = 3 \\cdot (\\textcolor{${BLUE}}{-2}) + 2 = -4 \\;\\Rightarrow\\; S_2(-2 \\mid -4)`} />
          <p>
            Fertig! Die Reihenfolge der Schnittpunkte ist egal. In der Parabel eingesetzt kommt übrigens dasselbe heraus – probier es aus.
          </p>
        </>
      ),
    },
  ]
  if (level === 'fortgeschritten') {
    slides.push(
      {
        title: 'Parabel in Scheitelform',
        body: (
          <>
            <p>
              Ist die Parabel in der Scheitelform <Tex tex="y = a(x - x_S)^2 + y_S" /> gegeben, multiplizierst du sie zuerst aus. Danach geht es
              wie im Beispiel weiter:
            </p>
            <Tex display tex="y = (x + 1)^2 - 5 = x^2 + 2x + 1 - 5 = x^2 + 2x - 4" />
            <p className="text-sm text-slate-600">
              Aus <Tex tex="(x + 1)^2" /> wird mit der binomischen Formel <Tex tex="x^2 + 2x + 1" />. Steht ein Faktor a vor der Klammer,
              multiplizierst du ihn danach mit jedem Summanden in der Klammer.
            </p>
          </>
        ),
      },
      {
        title: 'Brüche',
        body: (
          <>
            <p>
              Mit Brüchen rechnest du genauso. Nach Schritt 2 kannst du die Gleichung auch mit dem Hauptnenner multiplizieren, z. B.:
            </p>
            <Tex display tex="\tfrac{1}{2}x^2 - \tfrac{1}{2}x - 3 = 0 \;\; | \cdot 2 \quad\Rightarrow\quad x^2 - x - 6 = 0" />
            <p>Die Lösungen bleiben gleich. Sind die Ergebnisse keine glatten Zahlen, rundest du auf zwei Nachkommastellen.</p>
          </>
        ),
      },
    )
  }
  return slides
}

function Erklaerung({ level }: { level: Level }) {
  const slides = useMemo(() => exampleSlides(level), [level])
  const [index, setIndex] = useState(0)
  const touchX = useRef<number | null>(null)
  const last = slides.length - 1
  const go = (i: number) => setIndex(Math.max(0, Math.min(last, i)))
  const slide = slides[Math.min(index, last)]

  return (
    <div
      className="bk-panel text-left"
      tabIndex={0}
      aria-roledescription="Präsentation"
      aria-label="Erklärung: Schnittpunkte von Parabel und Gerade"
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
    >
      <h2 className="text-lg font-bold text-slate-800 mb-1 text-center">So berechnest du die Schnittpunkte von Parabel und Gerade</h2>
      <p className="text-sm text-slate-500 text-center mb-3">
        Folie {index + 1} von {slides.length}
      </p>

      <div
        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
        onTouchStart={(e: React.TouchEvent) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e: React.TouchEvent) => {
          if (touchX.current === null) return
          const dx = e.changedTouches[0].clientX - touchX.current
          touchX.current = null
          if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
        }}
      >
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3">{slide.title}</h3>
        <div className={`grid gap-4 items-center ${slide.graph ? 'md:grid-cols-[3fr_2fr]' : ''} md:min-h-[20rem]`}>
          <div className="text-slate-700 space-y-2 min-w-0" aria-live="polite">{slide.body}</div>
          {slide.graph && (
            <div>
              <ExampleGraph stage={slide.graph} />
              <p className="text-xs text-slate-500 text-center mt-1">
                <span style={{ color: P_COLOR }} className="font-bold">p</span> Parabel,{' '}
                <span style={{ color: G_COLOR }} className="font-bold">g</span> Gerade
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-4">
        <button onClick={() => go(index - 1)} disabled={index === 0} className={`${btnSecondary} whitespace-nowrap disabled:opacity-40`}>
          ← Zurück
        </button>
        <div className="flex gap-1.5 flex-wrap justify-center">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Folie ${i + 1}: ${s.title}`}
              aria-current={i === index ? 'step' : undefined}
              className={`w-3 h-3 rounded-full transition-colors ${i === index ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'}`}
            />
          ))}
        </div>
        <button onClick={() => go(index + 1)} disabled={index === last} className={`${btnPrimary} whitespace-nowrap disabled:opacity-40`}>
          Weiter →
        </button>
      </div>

      <Video id={VIDEO_ID} title="Erklärvideo: Schnittpunkte von Parabel und Gerade" />
    </div>
  )
}

// ---------- Seite: sechs Aufgaben auf einmal ----------

export default function SchnittpunkteGerade() {
  const navigate = useNavigate()
  const [level, setLevel] = useState<Level | null>(null)
  const [round, setRound] = useState(0)
  // Einstiegs-Lernsituation „Löst der Sprung die Lichtschranke aus?“ als eigener Modus neben den Schwierigkeitsgraden
  const [lernsituation, setLernsituation] = useState(false)
  const [solved, setSolved] = useState<Record<number, boolean>>({})
  const [streak, setStreak] = useState(0)

  const solvedCount = Object.values(solved).filter(Boolean).length
  const allSolved = solvedCount === TOTAL_TASKS

  // Pro Durchgang sechs verschiedene Aufgaben
  const tasks = useMemo(() => (level ? pageTasks(level) : []), [level, round])

  const finalPraise = useMemo(() => pick(['Super, toll gemacht!', 'Klasse, alles richtig!', 'Hervorragend!']), [round])

  const completionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved])

  const startNewRound = () => {
    setRound((r) => r + 1)
    setSolved({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chooseLevel = (next: Level | null) => {
    setLevel(next)
    startNewRound()
    setStreak(0)
  }

  const header = (
    <div>
      <p className="text-center text-slate-600">Berechne, wo sich eine Parabel und eine Gerade schneiden.</p>
    </div>
  )

  if (lernsituation) {
    return (
      <SkateEinstieg
        erklaerung={<Erklaerung level="einfach" />}
        onBack={() => {
          setLernsituation(false)
          window.scrollTo({ top: 0 })
        }}
        onPractice={() => {
          setLernsituation(false)
          chooseLevel('einfach')
        }}
      />
    )
  }

  if (!level) {
    return (
      <TaskShell title="Schnittpunkte von Parabel und Gerade" width="narrow">
        <div className="flex flex-col gap-6">
          {header}
          <div className={`${panel} flex flex-col`}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
            <button
              onClick={() => {
                setLernsituation(true)
                window.scrollTo({ top: 0 })
              }}
              style={{ background: 'var(--primary)' }}
              className="rounded-2xl text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
            >
              <p className="text-lg font-bold mb-1 text-white">Löst der Sprung die Lichtschranke aus?</p>
              <p className="text-xl mb-2 text-white">
                <i className="fa-solid fa-person-skating" aria-hidden="true" />
              </p>
              <p className="text-sm text-white/90">
                Neu beim Thema? Finde im Skatepark-Labor heraus, wie oft sich eine Parabel und eine Gerade schneiden können, und lerne dabei, die Schnittpunkte zu berechnen.
              </p>
            </button>
          </div>
          <div className={panel}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Übungsaufgaben</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => chooseLevel('einfach')}
                className="rounded-2xl bg-green-600 hover:bg-green-700 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-lg font-bold mb-1 text-white">Einfach</p>
                <Tex display className="text-lg mb-1 text-white" tex="p\colon\; y = ax^2 + bx + c" />
                <Tex display className="text-lg mb-2 text-white" tex="g\colon\; y = mx + t" />
                <p className="text-sm text-white/90">Ganzzahlige Koeffizienten ohne Brüche, die Schnittpunkte haben ganzzahlige Koordinaten.</p>
              </button>
              <button
                onClick={() => chooseLevel('fortgeschritten')}
                className="rounded-2xl bg-red-600 hover:bg-red-700 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                <Tex display className="text-lg mb-1 text-white" tex="p\colon\; y = ax^2 + bx + c" />
                <Tex display className="text-lg mb-2 text-white" tex="p\colon\; y = a(x - x_S)^2 + y_S" />
                <p className="text-sm text-white/90">Mit Brüchen und Parabeln in Scheitelform, Ergebnisse teils gerundet.</p>
              </button>
            </div>
          </div>
        </div>
      </TaskShell>
    )
  }

  return (
    <TaskShell title="Schnittpunkte von Parabel und Gerade" width="narrow">
        <div className="flex flex-col gap-6">
        {header}
        <Erklaerung level={level} />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
            Schwierigkeitsgrad: {LEVEL_LABEL[level]}
          </span>
          <button onClick={() => chooseLevel(null)} className="text-blue-600 hover:underline text-sm font-semibold">
            Schwierigkeitsgrad wechseln
          </button>
        </div>

        {tasks.map(({ task }, i) => (
          // Nach einem Neustart per key getrennt (frischer Zustand)
          <React.Fragment key={`${level}-${round}-${i}`}>
            <TaskCard
              number={i + 1}
              level={level}
              task={task}
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
            <p className="text-green-800 text-2xl font-bold mb-1">{finalPraise} 🎉</p>
            <p className="text-green-800 mb-4">Du hast alle {TOTAL_TASKS} Aufgaben richtig gelöst.</p>
            <p className="text-slate-700 mb-4">
              {level === 'einfach'
                ? 'Möchtest du 6 neue Aufgaben üben oder zum Schwierigkeitsgrad „Fortgeschritten“ wechseln?'
                : 'Möchtest du 6 neue Aufgaben üben oder zurück zur Übersicht?'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={startNewRound} className={btnSecondary}>6 neue Aufgaben</button>
              {level === 'einfach' ? (
                <button onClick={() => chooseLevel('fortgeschritten')} className={btnPrimary}>Weiter zu „Fortgeschritten“</button>
              ) : (
                <button onClick={() => navigate('/quadratische_funktionen')} className={btnPrimary}>Zur Übersicht</button>
              )}
            </div>
          </div>
        )}
      </div>
    </TaskShell>
  )
}

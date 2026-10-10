import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BLUE,
  HALVES,
  MitternachtsSteps,
  PRAISE,
  type AnswerStatus,
  type Q,
  RED,
  StepTable,
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

function SolutionSteps({ task }: { task: Task }) {
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
        <MitternachtsSteps a={A} b={B} c={C} noun="Schnittpunkt" />
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
    </div>
  )
}

// ---------- Aufgabenkarte ----------

interface CardProps {
  number: number
  level: Level
  spec: Spec
  initialTask: Task
  onSolvedChange: (solved: boolean) => void
  onResult: (correct: boolean) => void
  onHelp: () => void
}

const COUNT_LABEL: Record<Count, string> = { 2: 'Zwei Schnittpunkte', 1: 'Ein Schnittpunkt', 0: 'Kein Schnittpunkt' }

const emptyInputs = (): PointInput[] => [
  { x: '', y: '' },
  { x: '', y: '' },
]

function TaskCard({ number, level, spec, initialTask, onSolvedChange, onResult, onHelp }: CardProps) {
  const [task, setTask] = useState(initialTask)
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

  function generateNewTask() {
    setTask(newTask(level, spec))
    setCount(null)
    setInputs(emptyInputs())
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
    message = (
      <p className="text-center font-bold mt-4 text-green-600">
        {praise} {n === 0 ? 'Parabel und Gerade schneiden sich nicht.' : <Tex tex={pointsText(points)} />}
      </p>
    )
  } else if (count !== null && !countRight) {
    message = (
      <p className="text-center font-bold mt-4 text-red-600">
        Die Anzahl stimmt noch nicht. Tipp: Setze gleich, bringe alles auf eine Seite und berechne die Diskriminante{' '}
        <Tex tex="D = b^2 - 4ac" />.
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
        <button onClick={generateNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button onClick={onShowSolution} className={btnSecondary}>Lösung anzeigen</button>
      </div>

      {showSolution && <SolutionSteps task={task} />}
    </div>
  )
}

// ---------- Erklärung mit Beispiel (Graph + Rechnung) und Erklärvideo ----------

// Beispiel: p: y = x² + 2x − 4 und g: y = 3x + 2  →  S₁(3|11), S₂(−2|−4)
const SX = 22 // Pixel pro Einheit
const X_MIN = -6, X_MAX = 5, Y_MIN = -6, Y_MAX = 13
const toPx = (x: number, y: number) => ({ px: (x - X_MIN) * SX, py: (Y_MAX - y) * SX })
const exP = (x: number) => x * x + 2 * x - 4
const exG = (x: number) => 3 * x + 2

function ExampleGraph() {
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
  return (
    <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} className="w-full max-w-xs mx-auto" role="img" aria-label="Parabel y = x² + 2x − 4 und Gerade y = 3x + 2 mit den Schnittpunkten S1(3|11) und S2(−2|−4)">
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
      <polyline points={pts.join(' ')} fill="none" stroke="#2563eb" strokeWidth={2.5} />
      <line x1={g1.px} y1={g1.py} x2={g2.px} y2={g2.py} stroke="#ea580c" strokeWidth={2.5} />
      <text x={toPx(-4.6, 6).px} y={toPx(-4.6, 6).py} fontSize={12} fontWeight="bold" fill="#2563eb">p</text>
      <text x={toPx(-2.2, -6).px} y={toPx(-2.2, -5.4).py} fontSize={12} fontWeight="bold" fill="#ea580c">g</text>
      <circle cx={s1.px} cy={s1.py} r={5} fill={RED} />
      <circle cx={s2.px} cy={s2.py} r={5} fill={BLUE} />
      <text x={s1.px - 8} y={s1.py - 6} fontSize={12} fontWeight="bold" textAnchor="end" fill={RED}>S₁(3|11)</text>
      <text x={s2.px - 8} y={s2.py + 4} fontSize={12} fontWeight="bold" textAnchor="end" fill={BLUE}>S₂(−2|−4)</text>
    </svg>
  )
}

function Erklaerung({ level }: { level: Level }) {
  return (
    <div className="bk-panel text-left">
      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">So berechnest du die Schnittpunkte von Parabel und Gerade</h2>
      <p className="text-slate-700 mb-3">
        <strong>Beispiel:</strong> Bestimme die Schnittpunkte der Parabel <Tex tex="p\colon\; y = x^2 + 2x - 4" /> und der Geraden{' '}
        <Tex tex="g\colon\; y = 3x + 2" />.
      </p>
      <StepTable
        rows={[
          {
            step: (
              <>
                <strong>1.</strong> Setze die Funktionsterme gleich (Gleichsetzungsverfahren).
              </>
            ),
            example: <Tex display tex="x^2 + 2x - 4 = 3x + 2" />,
          },
          {
            step: (
              <>
                <strong>2.</strong> Bringe alles auf eine Seite, sodass links oder rechts die Zahl „0“ steht.
              </>
            ),
            example: (
              <Steps
                lines={[
                  { tex: 'x^2 + 2x - 4 = 3x + 2', op: '-3x' },
                  { tex: 'x^2 - x - 4 = 2', op: '-2' },
                  { tex: 'x^2 - x - 6 = 0' },
                ]}
              />
            ),
          },
          {
            step: (
              <>
                <strong>3.</strong> Löse die Gleichung mit Hilfe der <strong>Mitternachtsformel</strong>. Achte beim Einsetzen von a, b und c
                darauf, dass negative Zahlen in Klammern geschrieben werden!
                <span className="block text-sm text-slate-600 mt-2">
                  Die Diskriminante <Tex tex="D = b^2 - 4ac" /> verrät die Anzahl: <Tex tex="D > 0" /> zwei Schnittpunkte,{' '}
                  <Tex tex="D = 0" /> ein Berührpunkt, <Tex tex="D < 0" /> kein Schnittpunkt.
                </span>
              </>
            ),
            example: (
              <>
                <Tex display tex="x_{1,2} = \frac{-b \pm \sqrt{b^2 - 4 \cdot a \cdot c}}{2 \cdot a}" />
                <Tex display tex="x_{1,2} = \frac{-(-1) \pm \sqrt{(-1)^2 - 4 \cdot 1 \cdot (-6)}}{2 \cdot 1}" />
                <Tex display tex={`x_1 = \\textcolor{${RED}}{3} \\;\\text{ bzw. }\\; x_2 = \\textcolor{${BLUE}}{-2}`} />
              </>
            ),
          },
          {
            step: (
              <>
                <strong>4.</strong> Bestimme die y-Koordinate, indem du <Tex tex="x_1" /> und <Tex tex="x_2" /> in eine der beiden
                Funktionsgleichungen (Parabel oder Gerade) einsetzt. Hier: in die Geradengleichung <Tex tex="y = 3x + 2" /> eingesetzt.
              </>
            ),
            example: (
              <>
                <Tex display tex={`y = 3 \\cdot (\\textcolor{${RED}}{3}) + 2 = 11`} />
                <p className="text-center">→ Schnittpunkt <Tex tex="S_1(3 \\mid 11)" /></p>
                <Tex display tex={`y = 3 \\cdot (\\textcolor{${BLUE}}{-2}) + 2 = -4`} />
                <p className="text-center">→ Schnittpunkt <Tex tex="S_2(-2 \\mid -4)" /></p>
              </>
            ),
          },
        ]}
      />
      <div className="mt-4">
        <ExampleGraph />
        <p className="text-sm text-slate-600 text-center mt-1">Parabel p und Gerade g schneiden sich in den beiden berechneten Punkten.</p>
      </div>

      {level === 'fortgeschritten' && (
        <>
          <h3 className="text-base font-bold text-slate-800 mt-5 mb-2">Parabel in Scheitelform</h3>
          <p className="text-slate-700 mb-2">
            Ist die Parabel in der Scheitelform <Tex tex="y = a(x - x_S)^2 + y_S" /> gegeben, multiplizierst du sie zuerst aus. Danach geht es
            wie oben weiter:
          </p>
          <Tex display tex="y = (x + 1)^2 - 5 = x^2 + 2x + 1 - 5 = x^2 + 2x - 4" />
          <p className="text-sm text-slate-600">
            Tipp: Aus <Tex tex="(x + 1)^2" /> wird mit der binomischen Formel <Tex tex="x^2 + 2x + 1" />. Steht ein Faktor a vor der Klammer,
            multiplizierst du ihn danach mit jedem Summanden in der Klammer.
          </p>
          <h3 className="text-base font-bold text-slate-800 mt-5 mb-2">Brüche</h3>
          <p className="text-slate-700">
            Mit Brüchen rechnest du genauso. Nach Schritt 2 kannst du die Gleichung auch mit dem Hauptnenner multiplizieren, z. B.{' '}
            <Tex tex="\tfrac{1}{2}x^2 - \tfrac{1}{2}x - 3 = 0 \;\; | \cdot 2" /> ergibt <Tex tex="x^2 - x - 6 = 0" />. Die Lösungen bleiben
            gleich. Sind die Ergebnisse keine glatten Zahlen, rundest du auf zwei Nachkommastellen.
          </p>
        </>
      )}

      <ul className="list-disc pl-5 mt-4 text-slate-700 space-y-1 text-sm">
        <li>Beim Wegbringen änderst du das Rechenzeichen: Aus <Tex tex="+3x" /> auf der einen Seite wird <Tex tex="-3x" /> auf beiden Seiten.</li>
        <li>Zum Berechnen der y-Koordinate ist die Gerade meist einfacher als die Parabel – beide liefern dasselbe Ergebnis.</li>
        <li>Die Reihenfolge der Schnittpunkte ist egal.</li>
      </ul>
      <Video id={VIDEO_ID} title="Erklärvideo: Schnittpunkte von Parabel und Gerade" />
    </div>
  )
}

// ---------- Seite: sechs Aufgaben auf einmal ----------

export default function SchnittpunkteGerade() {
  const navigate = useNavigate()
  const [level, setLevel] = useState<Level | null>(null)
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState<Record<number, boolean>>({})
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)

  const solvedCount = Object.values(solved).filter(Boolean).length
  const allSolved = solvedCount === TOTAL_TASKS

  // Pro Durchgang sechs verschiedene Aufgaben
  const tasks = useMemo(() => (level ? pageTasks(level) : []), [level, round])

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
      <p className="text-center text-slate-600">Berechne, wo sich eine Parabel und eine Gerade schneiden.</p>
    </div>
  )

  if (!level) {
    return (
      <TaskShell title="Schnittpunkte von Parabel und Gerade" width="narrow">
        <div className="flex flex-col gap-6">
          {header}
          <div className={panel}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Wähle deinen Schwierigkeitsgrad</h2>
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

        {tasks.map(({ spec, task }, i) => (
          // Nach einem Neustart per key getrennt (frischer Zustand)
          <React.Fragment key={`${level}-${round}-${i}`}>
            <TaskCard
              number={i + 1}
              level={level}
              spec={spec}
              initialTask={task}
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
    </TaskShell>
  )
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BLUE,
  GREEN,
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
  isIncomplete,
  isInt,
  mul,
  neg,
  panel,
  parseAnswer,
  pick,
  polyTex,
  q,
  randomInt,
  shuffle,
  solveQuadratic,
  sqrtQ,
  sqrtTex,
  statusBorder,
  tn,
  tq,
  tqp,
  val,
  vertexTex,
} from './quadratischShared'

// Sechs Aufgaben gleichzeitig auf der Seite
const TOTAL_TASKS = 6

const VIDEO_ID = 'ldoXVAEAyLQ'

// Einfach: y = ax² + bx + c mit ganzzahligen Koeffizienten (ohne Brüche)
// Fortgeschritten: y = ax² + bx + c mit Brüchen und Scheitelform y = a(x − x_S)² + y_S
type Level = 'einfach' | 'fortgeschritten'
type Form = 'allgemein' | 'scheitel'
type Count = 0 | 1 | 2

const LEVEL_LABEL: Record<Level, string> = { einfach: 'Einfach', fortgeschritten: 'Fortgeschritten' }

// ---------- Aufgaben erzeugen ----------

interface Task {
  form: Form
  a: Q
  b: Q
  c: Q
  /** nur bei Scheitelform */
  xs: number
  ys: Q
  /** Nullstellen in der Reihenfolge des Lösungswegs (x₁, x₂) */
  roots: number[]
  tex: string
}

interface Spec {
  form: Form
  count: Count
}

function fromRoots(a: Q, x1: Q, x2: Q) {
  // y = a(x − x1)(x − x2) = ax² − a(x1 + x2)x + a·x1·x2
  return { b: neg(mul(a, add(x1, x2))), c: mul(a, mul(x1, x2)) }
}

const small = (x: Q, max: number) => Math.abs(val(x)) <= max && x.d <= 12

function generalTask(a: Q, b: Q, c: Q): Task {
  return { form: 'allgemein', a, b, c, xs: 0, ys: q(0), roots: solveQuadratic(a, b, c), tex: `y = ${polyTex(a, b, c)}` }
}

function newEasyTask(count: Count): Task {
  for (;;) {
    const a = q(pick([1, 1, -1, -1, 2, -2, 3, -3]))
    let b: Q, c: Q
    if (count === 2) {
      const x1 = randomInt(6, -6)
      const x2 = randomInt(6, -6)
      if (x1 === x2) continue
      ;({ b, c } = fromRoots(a, q(x1), q(x2)))
    } else if (count === 1) {
      const x0 = randomInt(5, -5)
      if (x0 === 0) continue
      ;({ b, c } = fromRoots(a, q(x0), q(x0)))
    } else {
      const xv = randomInt(4, -4)
      const yv = q(Math.sign(a.n) * randomInt(8, 1))
      b = q(-2 * a.n * xv)
      c = add(q(a.n * xv * xv), yv)
    }
    if (Math.abs(val(b)) > 24 || Math.abs(val(c)) > 40) continue
    return generalTask(a, b, c)
  }
}

const FRAC_A = [q(1, 2), q(-1, 2), q(1, 4), q(-1, 4), q(1, 3), q(-1, 3), q(3, 2), q(-3, 2), q(2, 3), q(-2, 3), q(2), q(-2), q(1), q(-1)]

function newFractionTask(count: Count): Task {
  for (;;) {
    const a = pick(FRAC_A)
    let b: Q, c: Q
    if (count === 2 && Math.random() < 0.3) {
      // Nullstellen sind keine "glatten" Zahlen: Ergebnis runden
      b = pick(HALVES)
      c = pick(HALVES)
      const D = discriminant(a, b, c)
      if (D.n <= 0 || sqrtQ(D)) continue
    } else if (count === 2) {
      const x1 = pick(HALVES)
      const x2 = pick(HALVES)
      if (eqQ(x1, x2)) continue
      ;({ b, c } = fromRoots(a, x1, x2))
    } else if (count === 1) {
      const x0 = pick(HALVES)
      if (x0.n === 0) continue
      ;({ b, c } = fromRoots(a, x0, x0))
    } else {
      const xv = pick(HALVES)
      const yv = mul(q(Math.sign(a.n)), pick(HALVES.filter((h) => h.n > 0)))
      b = neg(mul(q(2), mul(a, xv)))
      c = add(mul(a, mul(xv, xv)), yv)
    }
    // Mindestens ein Bruch soll vorkommen, die Zahlen bleiben überschaubar
    if (isInt(a) && isInt(b) && isInt(c)) continue
    if (!small(b, 12) || !small(c, 20) || b.d > 6 || c.d > 8) continue
    return generalTask(a, b, c)
  }
}

const VERTEX_A = [q(1), q(-1), q(2), q(-2), q(3), q(-3), q(1, 2), q(-1, 2)]

function newVertexTask(count: Count): Task {
  for (;;) {
    const a = pick(VERTEX_A)
    const xs = randomInt(5, -5)
    if (xs === 0) continue
    let ys: Q
    if (count === 2) {
      // (x − x_S)² = r mit r > 0: r als Quadratzahl (glatte Lösung) oder ab und zu ohne glatte Wurzel
      const r = Math.random() < 0.3 ? pick([2, 3, 5, 6, 7, 8, 10]) : pick([1, 4, 9, 16])
      ys = mul(neg(a), q(r))
    } else if (count === 1) {
      ys = q(0)
    } else {
      ys = mul(q(Math.sign(a.n)), q(randomInt(8, 1)))
    }
    const b = neg(mul(q(2 * xs), a))
    const c = add(mul(a, q(xs * xs)), ys)
    // Reihenfolge wie im Lösungsweg: x₁ = x_S + √r, x₂ = x_S − √r
    const r = val(ys) === 0 ? 0 : -val(ys) / val(a)
    const roots = r < 0 ? [] : r === 0 ? [xs] : [xs + Math.sqrt(r), xs - Math.sqrt(r)]
    return { form: 'scheitel', a, b, c, xs, ys, roots, tex: `y = ${vertexTex(a, xs, ys)}` }
  }
}

function newTask(level: Level, spec: Spec): Task {
  if (level === 'einfach') return newEasyTask(spec.count)
  return spec.form === 'scheitel' ? newVertexTask(spec.count) : newFractionTask(spec.count)
}

/** Aufbau einer Seite: meist zwei Nullstellen, je einmal eine bzw. keine; Fortgeschritten im Wechsel mit Scheitelform */
function pageSpecs(level: Level): Spec[] {
  const counts = shuffle<Count>([2, 2, 2, 2, 1, 0])
  return counts.map((count, i) => ({ count, form: level === 'fortgeschritten' && i % 2 === 1 ? 'scheitel' : 'allgemein' }))
}

/** Sechs paarweise verschiedene Aufgaben */
function pageTasks(level: Level): { spec: Spec; task: Task }[] {
  const specs = pageSpecs(level)
  const seen = new Set<string>()
  return specs.map((spec) => {
    let task: Task
    do task = newTask(level, spec)
    while (seen.has(task.tex))
    seen.add(task.tex)
    return { spec, task }
  })
}

// ---------- Live-Auswertung einer Eingabe ----------

/** Index der passenden Nullstelle oder −1 */
function matchRoot(input: string, roots: number[]): number {
  const v = parseAnswer(input)
  if (Number.isNaN(v)) return -1
  return roots.findIndex((r) => Math.abs(v - r) < 0.01)
}

function RootInput({
  label,
  value,
  status,
  onChange,
  readOnly,
}: {
  label: string
  value: string
  status: AnswerStatus
  onChange: (v: string) => void
  readOnly: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-xl text-slate-800">
      <Tex tex={`${label} =`} />
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className={`w-24 text-center border-2 rounded px-2 py-2 text-lg focus:outline-none transition-colors ${statusBorder(status)}`}
        inputMode="decimal"
        aria-label={`Nullstelle ${label}`}
      />
    </label>
  )
}

// ---------- Lösungsweg ----------

function VertexSolution({ task }: { task: Task }) {
  const { a, xs, ys, roots } = task
  const rhs = neg(ys)
  const r = mul(rhs, q(a.d, a.n)) // −y_S : a
  const k = sqrtQ(r)
  const xm = `x ${xs < 0 ? '+' : '-'} ${Math.abs(xs)}`
  const isOne = a.n === a.d
  // Umformung Zeile für Zeile, die Rechenoperation steht rechts neben der Zeile, auf die sie angewendet wird
  const divide = isOne ? undefined : `: ${tqp(a)}`
  const root = r.n > 0 ? '\\sqrt{\\phantom{x}}' : undefined
  const lines: { tex: string; op?: string }[] = [{ tex: `0 = ${vertexTex(a, xs, ys)}` }]
  if (ys.n !== 0) {
    lines[0].op = `${ys.n < 0 ? '+' : '-'} ${tq(ys.n < 0 ? rhs : ys)}`
    lines.push({ tex: `${coeff(a)}(${xm})^2 = ${tq(rhs)}`, op: isOne ? root : divide })
  } else {
    lines[0].op = divide
  }
  if (!isOne) lines.push({ tex: `(${xm})^2 = ${tq(r)}`, op: root })
  if (r.n > 0) lines.push({ tex: `${xm} = \\pm ${sqrtTex(r)}` })
  return (
    <>
      <p>
        Setze <Tex tex="y = 0" /> und löse nach x auf:
      </p>
      <Steps lines={lines} />
      {r.n < 0 && (
        <p>
          Ein Quadrat kann nie negativ sein. Die Gleichung hat keine Lösung, es gibt <strong>keine Nullstelle</strong>.
        </p>
      )}
      {r.n === 0 && (
        <>
          <Tex display tex={`${xm} = 0 \\quad \\Rightarrow \\quad x = \\mathbf{${xs}}`} />
          <p>
            Es gibt <strong>genau eine Nullstelle</strong> – sie ist gleichzeitig der Scheitelpunkt.
          </p>
        </>
      )}
      {r.n > 0 && (
        <Tex
          display
          tex={`x_1 = ${xs} + ${sqrtTex(r)} ${k ? '=' : '\\approx'} \\mathbf{${tn(roots[0])}} \\qquad x_2 = ${xs} - ${sqrtTex(r)} ${k ? '=' : '\\approx'} \\mathbf{${tn(roots[1])}}`}
        />
      )}
    </>
  )
}

/** Nullstellen als Punkte, z. B. "N_1(3 | 0) \quad N_2(−1 | 0)" */
function pointsText(roots: number[]) {
  if (roots.length === 1) return `N(${tn(roots[0])} \\mid 0)`
  return roots.map((r, i) => `N_${i + 1}(${tn(r)} \\mid 0)`).join('\\quad ')
}

function SolutionSteps({ task }: { task: Task }) {
  return (
    <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50 text-left text-slate-700 space-y-3">
      <h3 className="text-base font-bold text-slate-800 text-center">Lösungsweg</h3>
      {task.form === 'scheitel' ? (
        <VertexSolution task={task} />
      ) : (
        <>
          <p>
            Setze <Tex tex="y = 0" />: <Tex tex={`${polyTex(task.a, task.b, task.c)} = 0`} />
          </p>
          <MitternachtsSteps a={task.a} b={task.b} c={task.c} noun="Nullstelle" />
        </>
      )}
      <div className="font-bold text-slate-800 text-center text-lg">
        {task.roots.length === 0 ? <p>Keine Nullstelle</p> : <Tex display tex={pointsText(task.roots)} />}
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

const COUNT_LABEL: Record<Count, string> = { 2: 'Zwei Nullstellen', 1: 'Eine Nullstelle', 0: 'Keine Nullstelle' }

function TaskCard({ number, level, spec, initialTask, onSolvedChange, onResult, onHelp }: CardProps) {
  const [task, setTask] = useState(initialTask)
  const [count, setCount] = useState<Count | null>(null)
  const [x1In, setX1In] = useState('')
  const [x2In, setX2In] = useState('')
  const [solved, setSolved] = useState(false)
  const [praise, setPraise] = useState(PRAISE[0])
  const [showSolution, setShowSolution] = useState(false)

  const roots = task.roots
  const countRight = count === roots.length

  // Reihenfolge der beiden Nullstellen ist egal, sie müssen nur verschieden sein
  const m1 = matchRoot(x1In, roots)
  const m2 = matchRoot(x2In, roots)
  const s1: AnswerStatus = isIncomplete(x1In) ? 'idle' : m1 >= 0 ? 'right' : 'wrong'
  const s2: AnswerStatus =
    roots.length < 2 || isIncomplete(x2In) ? 'idle' : m2 >= 0 && !(s1 === 'right' && m1 === m2) ? 'right' : 'wrong'
  const sameRoot = s1 === 'right' && m2 >= 0 && m1 === m2 && !isIncomplete(x2In)

  const allRight = countRight && (roots.length === 0 || (s1 === 'right' && (roots.length === 1 || s2 === 'right')))
  const allFilled = roots.length === 0 || (!isIncomplete(x1In) && (roots.length === 1 || !isIncomplete(x2In)))
  const anyWrong = s1 === 'wrong' || s2 === 'wrong'

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
  }, [x1In, x2In, count, solved])

  function chooseCount(next: Count) {
    if (solved) return
    setCount(next)
    if (next !== roots.length) onResult(false)
  }

  function generateNewTask() {
    setTask(newTask(level, spec))
    setCount(null)
    setX1In('')
    setX2In('')
    setSolved(false)
    setShowSolution(false)
    onSolvedChange(false)
  }

  function onShowSolution() {
    setShowSolution(true)
    onHelp()
  }

  const countHint =
    task.form === 'scheitel' ? (
      <>Tipp: Setze y = 0 und stelle nach <Tex tex="(x - x_S)^2" /> um. Ist die rechte Seite negativ, null oder positiv?</>
    ) : (
      <>Tipp: Berechne zuerst die Diskriminante <Tex tex="D = b^2 - 4ac" />.</>
    )

  let message: React.ReactNode = null
  if (solved) {
    message = (
      <p className="text-center font-bold mt-4 text-green-600">
        {praise} {roots.length === 0 ? 'Die Parabel schneidet die x-Achse nicht.' : <Tex tex={pointsText(roots)} />}
      </p>
    )
  } else if (count !== null && !countRight) {
    message = <p className="text-center font-bold mt-4 text-red-600">Die Anzahl stimmt noch nicht. {countHint}</p>
  } else if (sameRoot) {
    message = <p className="text-center font-bold mt-4 text-red-600">Beide Felder enthalten dieselbe Nullstelle. Gesucht ist auch die zweite.</p>
  } else if (anyWrong) {
    message = <p className="text-center font-bold mt-4 text-red-600">Noch nicht richtig.</p>
  } else if (countRight && roots.length > 0 && (s1 === 'right' || s2 === 'right')) {
    message = <p className="text-center font-bold mt-4 text-green-600">Eine Nullstelle stimmt schon! Jetzt noch die zweite.</p>
  }

  const countBtn = (c: Count) => {
    const active = count === c
    const cls = active
      ? c === roots.length
        ? 'border-green-500 bg-green-50 text-green-800'
        : 'border-red-500 bg-red-50 text-red-800'
      : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
    return (
      <button key={c} type="button" onClick={() => chooseCount(c)} disabled={solved && !active} className={`py-2 px-4 rounded border-2 font-semibold transition-colors disabled:opacity-50 ${cls}`}>
        {COUNT_LABEL[c]}
      </button>
    )
  }

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}</h2>
      <p className="text-slate-700 mb-1">
        Berechne die Nullstellen der Funktion.
        {level === 'fortgeschritten' && ' Runde, falls nötig, auf zwei Nachkommastellen.'}
      </p>
      <div className="text-center text-2xl text-slate-800 my-4">
        <Tex display tex={task.tex} />
      </div>

      <p className="text-slate-700 font-semibold mb-2">Wie viele Nullstellen hat die Funktion?</p>
      <div className="flex flex-wrap justify-center gap-2">{([2, 1, 0] as Count[]).map(countBtn)}</div>

      {countRight && roots.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <RootInput label={roots.length === 1 ? 'x' : 'x_1'} value={x1In} status={s1} onChange={setX1In} readOnly={solved} />
          {roots.length === 2 && <RootInput label="x_2" value={x2In} status={s2} onChange={setX2In} readOnly={solved} />}
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

// Beispiel: y = x² − 2x − 3  →  Nullstellen 3 und −1
const SX = 30 // Pixel pro Einheit
const X_MIN = -3, X_MAX = 5, Y_MIN = -5, Y_MAX = 5
const toPx = (x: number, y: number) => ({ px: (x - X_MIN) * SX, py: (Y_MAX - y) * SX })
const exampleF = (x: number) => x * x - 2 * x - 3

function ExampleGraph() {
  const w = (X_MAX - X_MIN) * SX
  const h = (Y_MAX - Y_MIN) * SX
  const o = toPx(0, 0)
  const n1 = toPx(3, 0)
  const n2 = toPx(-1, 0)
  const xs = Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => X_MIN + i)
  const ys = Array.from({ length: Y_MAX - Y_MIN + 1 }, (_, i) => Y_MIN + i)
  const pts: string[] = []
  for (let x = -1.8; x <= 3.8; x += 0.05) {
    const p = toPx(x, exampleF(x))
    pts.push(`${p.px.toFixed(1)},${p.py.toFixed(1)}`)
  }
  return (
    <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} className="w-full max-w-xs mx-auto" role="img" aria-label="Parabel y = x² − 2x − 3 mit den Nullstellen 3 und −1">
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
      <polyline points={pts.join(' ')} fill="none" stroke="#2563eb" strokeWidth={2.5} />
      <circle cx={n1.px} cy={n1.py} r={5} fill={RED} />
      <circle cx={n2.px} cy={n2.py} r={5} fill={BLUE} />
      <text x={n1.px + 6} y={n1.py - 8} fontSize={12} fontWeight="bold" fill={RED}>N₁(3|0)</text>
      <text x={n2.px - 6} y={n2.py - 8} fontSize={12} fontWeight="bold" textAnchor="end" fill={BLUE}>N₂(−1|0)</text>
    </svg>
  )
}

function Erklaerung({ level }: { level: Level }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200 text-left">
      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">So berechnest du die Nullstellen</h2>
      <p className="text-slate-700 mb-3">
        Um die <strong>Nullstellen</strong>, also die Schnittpunkte einer Funktion mit der x-Achse, zu berechnen, gehst du wie folgt vor:
      </p>
      <StepTable
        rows={[
          {
            step: (
              <>
                <strong>1.</strong> Setze die Funktionsgleichung <Tex tex="y = 0" />.
                <span className="block text-sm text-slate-600">(Das ist die Voraussetzung für die folgenden Schritte.)</span>
              </>
            ),
            example: <Tex display tex="x^2 - 2x - 3 = 0" />,
          },
          {
            step: (
              <>
                <strong>2.</strong> Notiere dir die Koeffizienten a, b und c der Funktionsgleichung. <strong>Achtung:</strong> Vorzeichen mitnehmen!
              </>
            ),
            example: <Tex display tex="a = 1, \quad b = -2, \quad c = -3" />,
          },
          {
            step: (
              <>
                <strong>3.</strong> Löse die Gleichung mit der <strong>Mitternachtsformel</strong> (Formelsammlung: Lösungsformel). Setze negative
                Zahlen in Klammern.
                <span className="block text-sm text-slate-600 mt-2">
                  Das Zeichen ± (gesprochen: plus-minus) bedeutet, dass du den Wert der Wurzel einmal addierst und einmal subtrahierst.
                  Dieses Zeichen gibt es auf dem Taschenrechner nicht – du musst also zwei Rechnungen durchführen (siehe Schritt 4).
                </span>
                <span className="block text-sm text-slate-600 mt-2">
                  Der Wert unter der Wurzel heißt <strong>Diskriminante D</strong>. Ist <Tex tex="D < 0" />, gibt es keine Nullstelle; ist{' '}
                  <Tex tex="D = 0" />, gibt es genau eine.
                </span>
              </>
            ),
            example: (
              <>
                <Tex display tex="x_{1,2} = \frac{-b \pm \sqrt{b^2 - 4 \cdot a \cdot c}}{2 \cdot a}" />
                <Tex display tex="x_{1,2} = \frac{-(-2) \pm \sqrt{(-2)^2 - 4 \cdot 1 \cdot (-3)}}{2 \cdot 1}" />
              </>
            ),
          },
          {
            step: (
              <>
                <strong>4.</strong> Du erhältst zwei Werte für x – je nachdem, ob du den Wert der Wurzel <strong>addierst</strong> oder{' '}
                <strong>subtrahierst</strong>.
              </>
            ),
            example: (
              <>
                <Tex display tex={`x_1 = \\frac{2 + \\sqrt{16}}{2} = \\frac{2 + 4}{2} = \\textcolor{${RED}}{3}`} />
                <p className="text-center">und</p>
                <Tex display tex={`x_2 = \\frac{2 - \\sqrt{16}}{2} = \\frac{2 - 4}{2} = \\textcolor{${BLUE}}{-1}`} />
              </>
            ),
          },
          {
            step: (
              <>
                <strong>5.</strong> Gib die vollständigen Koordinaten an.
              </>
            ),
            example: <Tex display tex={`N_1(\\textcolor{${RED}}{3} \\mid 0) \\;\\text{ und }\\; N_2(\\textcolor{${BLUE}}{-1} \\mid 0)`} />,
          },
        ]}
      />
      <div className="mt-4">
        <ExampleGraph />
        <p className="text-sm text-slate-600 text-center mt-1">Die Parabel schneidet die x-Achse genau bei den berechneten Nullstellen.</p>
      </div>

      {level === 'fortgeschritten' && (
        <>
          <h3 className="text-base font-bold text-slate-800 mt-5 mb-2">Brüche als Koeffizienten</h3>
          <p className="text-slate-700 mb-2">
            Auch mit Brüchen setzt du a, b und c ganz normal in die Mitternachtsformel ein. Achte auf Klammern und rechne die
            Diskriminante sorgfältig aus.
          </p>
          <Tex display tex="y = \tfrac{1}{2}x^2 - x - \tfrac{3}{2} \qquad a = \tfrac{1}{2},\; b = -1,\; c = -\tfrac{3}{2}" />
          <Tex display tex="D = (-1)^2 - 4 \cdot \tfrac{1}{2} \cdot \left(-\tfrac{3}{2}\right) = 1 + 3 = 4" />
          <Tex display tex={`x_{1,2} = \\frac{1 \\pm \\sqrt{4}}{2 \\cdot \\frac{1}{2}} = \\frac{1 \\pm 2}{1} \\quad\\Rightarrow\\quad x_1 = \\textcolor{${GREEN}}{\\mathbf{3}},\\; x_2 = \\textcolor{${GREEN}}{\\mathbf{-1}}`} />
          <p className="text-sm text-slate-600 mt-1">
            Tipp: Du kannst die Gleichung <Tex tex="0 = \tfrac{1}{2}x^2 - x - \tfrac{3}{2}" /> auch zuerst mit dem Hauptnenner (hier 2)
            multiplizieren: <Tex tex="0 = x^2 - 2x - 3" />. Die Nullstellen bleiben gleich.
          </p>

          <h3 className="text-base font-bold text-slate-800 mt-5 mb-2">Scheitelform</h3>
          <p className="text-slate-700 mb-2">
            Ist die Funktion in der Scheitelform <Tex tex="y = a(x - x_S)^2 + y_S" /> gegeben, brauchst du keine Mitternachtsformel.
            Setze <Tex tex="y = 0" />, bringe <Tex tex="y_S" /> auf die andere Seite, teile durch a und ziehe die Wurzel:
          </p>
          <Steps
            lines={[
              { tex: '0 = 2(x - 1)^2 - 8', op: '+8' },
              { tex: '8 = 2(x - 1)^2', op: ': 2' },
              { tex: '(x - 1)^2 = 4', op: '\\sqrt{\\phantom{x}}' },
              { tex: 'x - 1 = \\pm 2' },
            ]}
          />
          <Tex display tex={`x_1 = 1 + 2 = \\textcolor{${GREEN}}{\\mathbf{3}},\\quad x_2 = 1 - 2 = \\textcolor{${GREEN}}{\\mathbf{-1}}`} />
          <p className="text-sm text-slate-600 mt-1">
            Steht rechts eine negative Zahl, gibt es keine Nullstelle (ein Quadrat ist nie negativ). Steht rechts 0, gibt es genau eine
            Nullstelle: <Tex tex="x = x_S" />. Ist die Wurzel keine glatte Zahl, rundest du auf zwei Nachkommastellen.
          </p>
        </>
      )}

      <ul className="list-disc pl-5 mt-4 text-slate-700 space-y-1 text-sm">
        <li>
          Achte auf Vorzeichen: Ist b negativ, wird <Tex tex="-b" /> positiv, z. B. <Tex tex="-(-2) = 2" />.
        </li>
        <li>
          Negative Zahlen beim Einsetzen in Klammern setzen: <Tex tex="(-2)^2 = 4" />, aber <Tex tex="-2^2 = -4" />.
        </li>
        <li>Die Reihenfolge von <Tex tex="x_1" /> und <Tex tex="x_2" /> ist egal.</li>
      </ul>
      <Video id={VIDEO_ID} title="Erklärvideo: Nullstellen berechnen" />
    </div>
  )
}

// ---------- Seite: sechs Aufgaben auf einmal ----------

export default function Nullstellen() {
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
      <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Nullstellen berechnen</h1>
      <p className="text-center text-slate-600">Berechne, wo die Parabel die x-Achse schneidet.</p>
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
                <Tex display className="text-xl mb-2 text-white" tex="y = ax^2 + bx + c" />
                <p className="text-sm text-white/90">Ganzzahlige Koeffizienten ohne Brüche, die Nullstellen sind ganze Zahlen.</p>
              </button>
              <button
                onClick={() => chooseLevel('fortgeschritten')}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white p-5 shadow-sm transition-colors"
              >
                <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                <Tex display className="text-xl mb-1 text-white" tex="y = ax^2 + bx + c" />
                <Tex display className="text-xl mb-2 text-white" tex="y = a(x - x_S)^2 + y_S" />
                <p className="text-sm text-white/90">Koeffizienten mit Brüchen und Funktionen in Scheitelform, Ergebnisse teils gerundet.</p>
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
    </div>
  )
}

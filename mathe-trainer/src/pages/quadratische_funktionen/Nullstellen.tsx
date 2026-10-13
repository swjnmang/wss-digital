import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BLUE,
  GREEN,
  HALVES,
  PRAISE,
  type AnswerStatus,
  type Q,
  RED,
  StepTable,
  eqSign,
  sgq,
  sqrtTex,
  sub,
  tq,
  tqp,
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
  statusBorder,
  tn,
  val,
  vertexTex,
  vertexToGeneralLines,
} from './quadratischShared'
import TaskShell from '../../components/layout/TaskShell'

// Sechs Aufgaben gleichzeitig auf der Seite
const TOTAL_TASKS = 6

const VIDEO_ID = 'ldoXVAEAyLQ'

// Einfach: y = ax² + bx + c mit ganzzahligen Koeffizienten (ohne Brüche)
// Mittel (Diskriminante): Anzahl der Nullstellen über die Diskriminante D = b² − 4ac bestimmen
// Fortgeschritten: y = ax² + bx + c mit Brüchen und Scheitelform y = a(x − x_S)² + y_S
type Level = 'einfach' | 'diskriminante' | 'fortgeschritten'
type Form = 'allgemein' | 'scheitel'
type Count = 0 | 1 | 2
/** Sonderfälle: y = ax² + c (b = 0) bzw. y = ax² + bx (c = 0) */
type Special = 'b0' | 'c0' | null

const LEVEL_LABEL: Record<Level, string> = {
  einfach: 'Einfach',
  diskriminante: 'Mittel – Die Diskriminante verstehen',
  fortgeschritten: 'Fortgeschritten',
}

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
  special: Special
}

function fromRoots(a: Q, x1: Q, x2: Q) {
  // y = a(x − x1)(x − x2) = ax² − a(x1 + x2)x + a·x1·x2
  return { b: neg(mul(a, add(x1, x2))), c: mul(a, mul(x1, x2)) }
}

const small = (x: Q, max: number) => Math.abs(val(x)) <= max && x.d <= 12

function generalTask(a: Q, b: Q, c: Q): Task {
  return { form: 'allgemein', a, b, c, xs: 0, ys: q(0), roots: solveQuadratic(a, b, c), tex: `y = ${polyTex(a, b, c)}` }
}

function newEasyTask(count: Count, special: Special): Task {
  for (;;) {
    const a = q(pick([1, 1, -1, -1, 2, -2, 3, -3]))
    let b: Q, c: Q
    if (special === 'c0') {
      // y = ax² + bx: eine Nullstelle liegt bei 0
      const x2 = randomInt(6, -6)
      if (x2 === 0) continue
      ;({ b, c } = fromRoots(a, q(0), q(x2)))
    } else if (special === 'b0' && count === 2) {
      // y = ax² + c mit Nullstellen ±r
      const r = randomInt(6, 1)
      ;({ b, c } = fromRoots(a, q(r), q(-r)))
    } else if (special === 'b0') {
      // y = ax² + c ohne Nullstelle (a und c mit gleichem Vorzeichen)
      b = q(0)
      c = q(Math.sign(a.n) * randomInt(9, 1))
    } else if (count === 2) {
      const x1 = randomInt(6, -6)
      const x2 = randomInt(6, -6)
      if (x1 === x2) continue
      if (x1 === 0 || x2 === 0 || x1 === -x2) continue
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

function newFractionTask(count: Count, special: Special): Task {
  for (;;) {
    const a = pick(FRAC_A)
    let b: Q, c: Q
    if (special === 'c0') {
      const x2 = pick(HALVES)
      if (x2.n === 0) continue
      ;({ b, c } = fromRoots(a, q(0), x2))
    } else if (special === 'b0' && count === 2) {
      const r = pick(HALVES.filter((h) => h.n > 0))
      ;({ b, c } = fromRoots(a, r, neg(r)))
    } else if (special === 'b0') {
      b = q(0)
      c = mul(q(Math.sign(a.n)), pick(HALVES.filter((h) => h.n > 0)))
    } else if (count === 2 && Math.random() < 0.3) {
      // Nullstellen sind keine "glatten" Zahlen: Ergebnis runden
      b = pick(HALVES)
      c = pick(HALVES)
      const D = discriminant(a, b, c)
      if (D.n <= 0 || sqrtQ(D)) continue
    } else if (count === 2) {
      const x1 = pick(HALVES)
      const x2 = pick(HALVES)
      if (eqQ(x1, x2) || x1.n === 0 || x2.n === 0 || eqQ(x1, neg(x2))) continue
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
    return { form: 'scheitel', a, b, c, xs, ys, roots: solveQuadratic(a, b, c), tex: `y = ${vertexTex(a, xs, ys)}` }
  }
}

function newTask(level: Level, spec: Spec): Task {
  if (level !== 'fortgeschritten') return newEasyTask(spec.count, spec.special)
  return spec.form === 'scheitel' ? newVertexTask(spec.count) : newFractionTask(spec.count, spec.special)
}

/**
 * Aufbau einer Seite: meist zwei Nullstellen, je einmal eine bzw. keine (Diskriminante: je zweimal);
 * Fortgeschritten im Wechsel mit Scheitelform.
 * Auf jeder Seite kommt einmal y = ax² + bx (c = 0) und einmal y = ax² + c (b = 0) vor.
 */
function pageSpecs(level: Level): Spec[] {
  // Bei der Diskriminante kommen alle drei Fälle gleich oft vor
  const counts = shuffle<Count>(level === 'diskriminante' ? [2, 2, 1, 1, 0, 0] : [2, 2, 2, 2, 1, 0])
  const specs: Spec[] = counts.map((count, i) => ({
    count,
    form: level === 'fortgeschritten' && i % 2 === 1 ? 'scheitel' : 'allgemein',
    special: null,
  }))
  const general = specs.filter((s) => s.form === 'allgemein')
  const c0 = general.find((s) => s.count === 2)
  if (c0) c0.special = 'c0'
  const b0 = general.find((s) => s.special === null && (s.count === 2 || s.count === 0))
  if (b0) b0.special = 'b0'
  return specs
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

/** Nullstellen als Punkte, z. B. "N_1(3 | 0) \quad N_2(−1 | 0)" */
function pointsText(roots: number[]) {
  if (roots.length === 1) return `N(${tn(roots[0])} \\mid 0)`
  return roots.map((r, i) => `N_${i + 1}(${tn(r)} \\mid 0)`).join('\\quad ')
}

/** Fehlende Summanden mit 0 ausgeschrieben, z. B. "x^2 + 0 \cdot x - 9" */
function fullPolyTex(a: Q, b: Q, c: Q) {
  const bPart = b.n === 0 ? '+ 0 \\cdot x' : `${b.n < 0 ? '-' : '+'} ${coeff(q(Math.abs(b.n), b.d))}x`
  const cPart = c.n === 0 ? '+ 0' : sgq(c)
  return `${coeff(a)}x^2 ${bPart} ${cPart}`
}

/** Erklärt, warum b bzw. c gleich 0 ist (Summand fehlt in der Funktionsgleichung) */
function ZeroCoefficientNote({ a, b, c }: { a: Q; b: Q; c: Q }) {
  if (b.n !== 0 && c.n !== 0) return null
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm space-y-2">
      {b.n === 0 && (
        <p>
          <strong>Warum ist b = 0?</strong> In der Gleichung kommt <strong>kein Summand mit x</strong> vor (nur <Tex tex="x^2" /> und eine
          Zahl). Ein fehlender Summand bedeutet: Es wird <Tex tex="0 \cdot x" /> addiert – und das ist 0. Der Koeffizient vor x ist also{' '}
          <Tex tex="b = 0" />.
        </p>
      )}
      {c.n === 0 && (
        <p>
          <strong>Warum ist c = 0?</strong> In der Gleichung steht <strong>keine Zahl ohne x</strong> (kein absolutes Glied). Ein fehlender
          Summand bedeutet: Es wird 0 addiert. Also ist <Tex tex="c = 0" />.
        </p>
      )}
      <p>So sieht die Gleichung mit allen drei Summanden aus:</p>
      <Tex display tex={`${polyTex(a, b, c)} = 0 \\quad\\Longleftrightarrow\\quad ${fullPolyTex(a, b, c)} = 0`} />
      <p>Mit diesen Werten rechnest du ganz normal weiter.</p>
    </div>
  )
}

/** Vollständiger Rechenweg mit der Mitternachtsformel: einsetzen, Wurzel ausrechnen, x₁ und x₂ bestimmen */
function MitternachtsWeg({ a, b, c }: { a: Q; b: Q; c: Q }) {
  const b2 = mul(b, b)
  const ac4 = mul(q(4), mul(a, c))
  const rad = sub(b2, ac4)
  const twoA = mul(q(2), a)
  const r = sqrtQ(rad)
  const mb = tq(neg(b))
  const ac4Tex = ac4.n === 0 ? '- 0' : sgq(neg(ac4))
  const lines = [
    `x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4 \\cdot a \\cdot c}}{2 \\cdot a}`,
    `x_{1,2} = \\frac{-${tqp(b)} \\pm \\sqrt{${tqp(b)}^2 - 4 \\cdot ${tqp(a)} \\cdot ${tqp(c)}}}{2 \\cdot ${tqp(a)}}`,
    `x_{1,2} = \\frac{${mb} \\pm \\sqrt{${tq(b2)} ${ac4Tex}}}{${tq(twoA)}}`,
    `x_{1,2} = \\frac{${mb} \\pm \\sqrt{${tq(rad)}}}{${tq(twoA)}}`,
  ]
  if (r) lines.push(`x_{1,2} = \\frac{${mb} \\pm ${tq(r)}}{${tq(twoA)}}`)
  return (
    <>
      <p>
        Koeffizienten ablesen: <Tex tex={`a = ${tq(a)},\\quad b = ${tq(b)},\\quad c = ${tq(c)}`} />
      </p>
      <ZeroCoefficientNote a={a} b={b} c={c} />
      <p>In die Mitternachtsformel einsetzen (negative Zahlen in Klammern) und ausrechnen:</p>
      <Steps lines={lines.map((tex) => ({ tex }))} />
      {rad.n < 0 && (
        <p>
          Unter der Wurzel steht die negative Zahl <Tex tex={tq(rad)} />. Aus einer negativen Zahl kann man keine Wurzel ziehen. Die
          Gleichung hat deshalb <strong>keine Lösung</strong> – die Parabel hat <strong>keine Nullstelle</strong>.
        </p>
      )}
      {rad.n === 0 && (
        <>
          <p>
            Die Wurzel aus 0 ist 0. Ob du 0 addierst oder subtrahierst, macht keinen Unterschied: Es gibt <strong>genau eine Nullstelle</strong>.
          </p>
          <Tex display tex={`x = \\frac{${mb}}{${tq(twoA)}} = \\mathbf{${tn(-val(b) / val(twoA))}}`} />
        </>
      )}
      {rad.n > 0 && (
        <>
          <p>Einmal mit + und einmal mit − rechnen:</p>
          {(['+', '-'] as const).map((op, i) => {
            const x = (val(neg(b)) + (op === '-' ? -1 : 1) * Math.sqrt(val(rad))) / val(twoA)
            const num = r ? add(neg(b), op === '-' ? neg(r) : r) : null
            return (
              <div key={op}>
                <Tex
                  display
                  tex={`x_${i + 1} = \\frac{${mb} ${op} ${sqrtTex(rad)}}{${tq(twoA)}} ${num ? `= \\frac{${tq(num)}}{${tq(twoA)}} ${eqSign(x)}` : '\\approx'} \\mathbf{${tn(x)}}`}
                />
              </div>
            )
          })}
        </>
      )}
    </>
  )
}

function SolutionSteps({ task }: { task: Task }) {
  return (
    <div className="mt-6 bk-taskbox text-left text-slate-700 space-y-3">
      <h3 className="text-base font-bold text-slate-800 text-center">Lösungsweg</h3>
      {task.form === 'scheitel' && (
        <div>
          <p className="font-semibold text-slate-800">Schritt 1: Scheitelform in die allgemeine Form umformen</p>
          <Steps lines={vertexToGeneralLines(task.a, task.xs, task.ys).map((tex) => ({ tex }))} />
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-800">{task.form === 'scheitel' ? 'Schritt 2: ' : ''}Setze y = 0</p>
        <Tex display tex={`${polyTex(task.a, task.b, task.c)} = 0`} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{task.form === 'scheitel' ? 'Schritt 3: ' : ''}Mitternachtsformel</p>
        <MitternachtsWeg a={task.a} b={task.b} c={task.c} />
      </div>
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
      <>Tipp: Forme die Scheitelform zuerst in die allgemeine Form um, setze dann a, b und c in die Mitternachtsformel ein und rechne den Wert unter der Wurzel aus.</>
    ) : (
      <>Tipp: Setze a, b und c in die Mitternachtsformel ein und rechne den Wert unter der Wurzel aus.</>
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

// ---------- Mittel: Anzahl der Nullstellen mit der Diskriminante ----------

const ORANGE = '#c2410c'

/** D = b² − 4ac Schritt für Schritt (negative Zahlen in Klammern) */
function discriminantLines(a: Q, b: Q, c: Q): string[] {
  const ac4 = mul(q(4), mul(a, c))
  const ac4Tex = ac4.n === 0 ? '- 0' : sgq(neg(ac4))
  return [
    'D = b^2 - 4 \\cdot a \\cdot c',
    `D = ${tqp(b)}^2 - 4 \\cdot ${tqp(a)} \\cdot ${tqp(c)}`,
    `D = ${tq(mul(b, b))} ${ac4Tex}`,
    `D = \\mathbf{${tq(discriminant(a, b, c))}}`,
  ]
}

/** Was das Vorzeichen von D über die Anzahl der Nullstellen sagt, mit Begründung über die Wurzel */
function DiscriminantDecision({ D }: { D: Q }) {
  if (D.n > 0)
    return (
      <p>
        Da <Tex tex={`D = ${tq(D)} > 0`} /> ist, gibt es <strong>zwei Nullstellen</strong>. Begründung: In der Mitternachtsformel steht{' '}
        <Tex tex={`\\pm\\sqrt{${tq(D)}}${sqrtQ(D) ? ` = \\pm ${sqrtTex(D)}` : ''}`} />. Ob du die Wurzel addierst oder subtrahierst, ergibt zwei verschiedene Ergebnisse.
      </p>
    )
  if (D.n === 0)
    return (
      <p>
        Da <Tex tex="D = 0" /> ist, gibt es <strong>genau eine Nullstelle</strong>. Begründung: <Tex tex="\sqrt{0} = 0" />. Ob du 0 addierst
        oder subtrahierst, ergibt dasselbe Ergebnis. Die Parabel berührt die x-Achse nur mit ihrem Scheitelpunkt.
      </p>
    )
  return (
    <p>
      Da <Tex tex={`D = ${tq(D)} < 0`} /> ist, gibt es <strong>keine Nullstelle</strong>. Begründung: Aus einer negativen Zahl kann man keine
      Wurzel ziehen, die Mitternachtsformel liefert also keine Lösung. Die Parabel schneidet die x-Achse nicht.
    </p>
  )
}

function DiscriminantSolution({ task }: { task: Task }) {
  const { a, b, c } = task
  return (
    <div className="mt-6 bk-taskbox text-left text-slate-700 space-y-3">
      <h3 className="text-base font-bold text-slate-800 text-center">Lösungsweg</h3>
      <div>
        <p className="font-semibold text-slate-800">Schritt 1: Setze y = 0 und lies a, b und c ab</p>
        <Tex display tex={`${polyTex(a, b, c)} = 0`} />
        <Tex display tex={`a = ${tq(a)},\\quad b = ${tq(b)},\\quad c = ${tq(c)}`} />
        <ZeroCoefficientNote a={a} b={b} c={c} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">Schritt 2: Berechne die Diskriminante</p>
        <Steps lines={discriminantLines(a, b, c).map((tex) => ({ tex }))} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">Schritt 3: Entscheide anhand des Vorzeichens von D</p>
        <DiscriminantDecision D={discriminant(a, b, c)} />
      </div>
    </div>
  )
}

function DiscriminantCard({ number, spec, initialTask, onSolvedChange, onResult, onHelp }: Omit<CardProps, 'level'>) {
  const [task, setTask] = useState(initialTask)
  const [dIn, setDIn] = useState('')
  const [count, setCount] = useState<Count | null>(null)
  const [solved, setSolved] = useState(false)
  const [praise, setPraise] = useState(PRAISE[0])
  const [showSolution, setShowSolution] = useState(false)

  const D = discriminant(task.a, task.b, task.c)
  const roots = task.roots
  const dValue = parseAnswer(dIn)
  const dStatus: AnswerStatus = isIncomplete(dIn) ? 'idle' : Math.abs(dValue - val(D)) < 1e-9 ? 'right' : 'wrong'
  const dRight = dStatus === 'right'
  const countRight = count === roots.length

  useEffect(() => {
    if (solved) return
    if (dRight && countRight) {
      setSolved(true)
      setPraise(pick(PRAISE))
      setShowSolution(false)
      onSolvedChange(true)
      onResult(true)
      return
    }
    // Falscher Versuch zählt erst, wenn die Eingabe kurz stehen bleibt
    if (dStatus === 'wrong') {
      const timer = setTimeout(() => onResult(false), 900)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dIn, count, solved])

  function changeD(v: string) {
    if (solved) return
    setDIn(v)
    setCount(null)
  }

  function chooseCount(next: Count) {
    if (solved) return
    setCount(next)
    if (next !== roots.length) onResult(false)
  }

  function generateNewTask() {
    setTask(newTask('diskriminante', spec))
    setDIn('')
    setCount(null)
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
        {praise} <Tex tex={`D = ${tq(D)}`} /> – {COUNT_LABEL[roots.length as Count]}.
      </p>
    )
  } else if (dStatus === 'wrong') {
    message = (
      <p className="text-center font-bold mt-4 text-red-600">
        Noch nicht richtig. Tipp: <Tex tex="D = b^2 - 4 \cdot a \cdot c" /> – setze negative Zahlen in Klammern.
      </p>
    )
  } else if (dRight && count !== null && !countRight) {
    message = (
      <p className="text-center font-bold mt-4 text-red-600">
        Die Anzahl stimmt noch nicht. Achte auf das Vorzeichen von D: Ist D positiv, null oder negativ?
      </p>
    )
  } else if (dRight) {
    message = <p className="text-center font-bold mt-4 text-green-600">D stimmt! Was sagt dir D über die Anzahl der Nullstellen?</p>
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
      <p className="text-slate-700 mb-1">Bestimme mithilfe der Diskriminante, wie viele Nullstellen die Funktion hat.</p>
      <div className="text-center text-2xl text-slate-800 my-4">
        <Tex display tex={task.tex} />
      </div>

      <p className="text-slate-700 font-semibold mb-2">1. Berechne die Diskriminante.</p>
      <label className="flex items-center justify-center gap-2 text-xl text-slate-800">
        <Tex tex="D =" />
        <input
          value={dIn}
          readOnly={solved}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeD(e.target.value)}
          className={`w-24 text-center border-2 rounded px-2 py-2 text-lg focus:outline-none transition-colors ${statusBorder(dStatus)}`}
          inputMode="decimal"
          aria-label="Diskriminante D"
        />
      </label>

      {dRight && (
        <>
          <p className="text-slate-700 font-semibold mt-5 mb-2">2. Wie viele Nullstellen hat die Funktion?</p>
          <div className="flex flex-wrap justify-center gap-2">{([2, 1, 0] as Count[]).map(countBtn)}</div>
        </>
      )}

      {message}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={generateNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button onClick={onShowSolution} className={btnSecondary}>Lösung anzeigen</button>
      </div>

      {showSolution && <DiscriminantSolution task={task} />}
    </div>
  )
}

// ---------- Erklärung mit Beispiel (Graph + Rechnung) und Erklärvideo ----------

const SX = 30 // Pixel pro Einheit
const X_MIN = -3, X_MAX = 5, Y_MIN = -5, Y_MAX = 5
const toPx = (x: number, y: number) => ({ px: (x - X_MIN) * SX, py: (Y_MAX - y) * SX })

interface GraphMark {
  x: number
  color: string
  label: string
  /** Beschriftung links vom Punkt */
  left?: boolean
}

/** Parabel im Koordinatensystem (x: −3 … 5, y: −5 … 5) mit markierten Nullstellen */
function ParabolaGraph({ f, marks, ariaLabel, className = 'max-w-xs' }: { f: (x: number) => number; marks: GraphMark[]; ariaLabel: string; className?: string }) {
  const w = (X_MAX - X_MIN) * SX
  const h = (Y_MAX - Y_MIN) * SX
  const o = toPx(0, 0)
  const xs = Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => X_MIN + i)
  const ys = Array.from({ length: Y_MAX - Y_MIN + 1 }, (_, i) => Y_MIN + i)
  const pts: string[] = []
  for (let x = X_MIN; x <= X_MAX + 1e-9; x += 0.05) {
    const y = f(x)
    if (y < Y_MIN - 0.3 || y > Y_MAX + 0.3) continue
    const p = toPx(x, y)
    pts.push(`${p.px.toFixed(1)},${p.py.toFixed(1)}`)
  }
  return (
    <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} className={`w-full mx-auto ${className}`} role="img" aria-label={ariaLabel}>
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
      {marks.map((m) => {
        const n = toPx(m.x, 0)
        return (
          <g key={m.label}>
            <circle cx={n.px} cy={n.py} r={5} fill={m.color} />
            <text x={n.px + (m.left ? -6 : 6)} y={n.py - 8} fontSize={12} fontWeight="bold" textAnchor={m.left ? 'end' : 'start'} fill={m.color}>
              {m.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Beispiel: y = x² − 2x − 3  →  Nullstellen 3 und −1
function ExampleGraph() {
  return (
    <ParabolaGraph
      f={(x) => x * x - 2 * x - 3}
      marks={[
        { x: 3, color: RED, label: 'N₁(3|0)' },
        { x: -1, color: BLUE, label: 'N₂(−1|0)', left: true },
      ]}
      ariaLabel="Parabel y = x² − 2x − 3 mit den Nullstellen 3 und −1"
    />
  )
}

function Erklaerung({ level }: { level: Level }) {
  return (
    <div className="bk-panel text-left">
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
                  Steht unter der Wurzel eine negative Zahl, kannst du keine Wurzel ziehen – dann gibt es keine Nullstelle. Steht unter der
                  Wurzel 0, ist es egal, ob du 0 addierst oder subtrahierst – dann gibt es genau eine Nullstelle.
                </span>
              </>
            ),
            example: (
              <>
                <Tex display tex="x_{1,2} = \frac{-b \pm \sqrt{b^2 - 4 \cdot a \cdot c}}{2 \cdot a}" />
                <Tex display tex="x_{1,2} = \frac{-(-2) \pm \sqrt{(-2)^2 - 4 \cdot 1 \cdot (-3)}}{2 \cdot 1}" />
                <Tex display tex="x_{1,2} = \frac{2 \pm \sqrt{4 + 12}}{2} = \frac{2 \pm \sqrt{16}}{2}" />
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
            Auch mit Brüchen setzt du a, b und c ganz normal in die Mitternachtsformel ein. Achte auf Klammern und rechne den Wert
            unter der Wurzel sorgfältig aus.
          </p>
          <Tex display tex="y = \tfrac{1}{2}x^2 - x - \tfrac{3}{2} \qquad a = \tfrac{1}{2},\; b = -1,\; c = -\tfrac{3}{2}" />
          <Steps
            lines={[
              { tex: 'x_{1,2} = \\frac{-(-1) \\pm \\sqrt{(-1)^2 - 4 \\cdot \\frac{1}{2} \\cdot \\left(-\\frac{3}{2}\\right)}}{2 \\cdot \\frac{1}{2}}' },
              { tex: 'x_{1,2} = \\frac{1 \\pm \\sqrt{1 + 3}}{1} = \\frac{1 \\pm \\sqrt{4}}{1} = \\frac{1 \\pm 2}{1}' },
            ]}
          />
          <Tex display tex={`x_1 = \\frac{1 + 2}{1} = \\textcolor{${GREEN}}{\\mathbf{3}},\\qquad x_2 = \\frac{1 - 2}{1} = \\textcolor{${GREEN}}{\\mathbf{-1}}`} />
          <p className="text-sm text-slate-600 mt-1">
            Tipp: Du kannst die Gleichung <Tex tex="0 = \tfrac{1}{2}x^2 - x - \tfrac{3}{2}" /> auch zuerst mit dem Hauptnenner (hier 2)
            multiplizieren: <Tex tex="0 = x^2 - 2x - 3" />. Die Nullstellen bleiben gleich.
          </p>

          <h3 className="text-base font-bold text-slate-800 mt-5 mb-2">Scheitelform</h3>
          <p className="text-slate-700 mb-2">
            Ist die Funktion in der Scheitelform <Tex tex="y = a(x - x_S)^2 + y_S" /> gegeben, formst du sie <strong>zuerst in die allgemeine
            Form</strong> <Tex tex="y = ax^2 + bx + c" /> um. Dazu löst du die Klammer mit der binomischen Formel auf und multiplizierst den
            Faktor a aus. Anschließend rechnest du wie oben mit der Mitternachtsformel weiter.
          </p>
          <Steps
            lines={[
              { tex: 'y = 2(x - 1)^2 - 8' },
              { tex: 'y = 2\\left(x^2 - 2x + 1\\right) - 8' },
              { tex: 'y = 2x^2 - 4x + 2 - 8' },
              { tex: 'y = 2x^2 - 4x - 6' },
            ]}
          />
          <Tex display tex="a = 2,\quad b = -4,\quad c = -6" />
          <Steps
            lines={[
              { tex: 'x_{1,2} = \\frac{-(-4) \\pm \\sqrt{(-4)^2 - 4 \\cdot 2 \\cdot (-6)}}{2 \\cdot 2}' },
              { tex: 'x_{1,2} = \\frac{4 \\pm \\sqrt{16 + 48}}{4} = \\frac{4 \\pm \\sqrt{64}}{4} = \\frac{4 \\pm 8}{4}' },
            ]}
          />
          <Tex display tex={`x_1 = \\frac{4 + 8}{4} = \\textcolor{${GREEN}}{\\mathbf{3}},\\qquad x_2 = \\frac{4 - 8}{4} = \\textcolor{${GREEN}}{\\mathbf{-1}}`} />
          <p className="text-sm text-slate-600 mt-1">
            Binomische Formeln: <Tex tex="(x - d)^2 = x^2 - 2dx + d^2" /> und <Tex tex="(x + d)^2 = x^2 + 2dx + d^2" />. Ist die Wurzel keine
            glatte Zahl, rundest du auf zwei Nachkommastellen.
          </p>
        </>
      )}

      <h3 className="text-base font-bold text-slate-800 mt-5 mb-2">Sonderfälle: Es fehlt ein Summand</h3>
      <p className="text-slate-700 mb-2">
        Auch bei Funktionen wie <Tex tex="y = ax^2 + bx" /> oder <Tex tex="y = ax^2 + c" /> rechnest du mit der Mitternachtsformel. Fehlt in
        der Gleichung ein Summand, wird dort <strong>0 addiert</strong> – der zugehörige Koeffizient ist also <strong>0</strong>.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bk-taskbox">
          <p className="font-semibold text-slate-800 mb-1">Kein Summand mit x → b = 0</p>
          <Tex display tex="x^2 - 9 = 0" />
          <Tex display tex="x^2 + 0 \cdot x - 9 = 0" />
          <Tex display tex="a = 1,\quad b = 0,\quad c = -9" />
          <Steps
            lines={[
              { tex: 'x_{1,2} = \\frac{-0 \\pm \\sqrt{0^2 - 4 \\cdot 1 \\cdot (-9)}}{2 \\cdot 1}' },
              { tex: 'x_{1,2} = \\frac{0 \\pm \\sqrt{0 + 36}}{2} = \\frac{0 \\pm 6}{2}' },
            ]}
          />
          <Tex display tex={`x_1 = \\frac{0 + 6}{2} = \\textcolor{${RED}}{3},\\qquad x_2 = \\frac{0 - 6}{2} = \\textcolor{${BLUE}}{-3}`} />
        </div>
        <div className="bk-taskbox">
          <p className="font-semibold text-slate-800 mb-1">Keine Zahl ohne x → c = 0</p>
          <Tex display tex="x^2 - 4x = 0" />
          <Tex display tex="x^2 - 4x + 0 = 0" />
          <Tex display tex="a = 1,\quad b = -4,\quad c = 0" />
          <Steps
            lines={[
              { tex: 'x_{1,2} = \\frac{-(-4) \\pm \\sqrt{(-4)^2 - 4 \\cdot 1 \\cdot 0}}{2 \\cdot 1}' },
              { tex: 'x_{1,2} = \\frac{4 \\pm \\sqrt{16 - 0}}{2} = \\frac{4 \\pm 4}{2}' },
            ]}
          />
          <Tex display tex={`x_1 = \\frac{4 + 4}{2} = \\textcolor{${RED}}{4},\\qquad x_2 = \\frac{4 - 4}{2} = \\textcolor{${BLUE}}{0}`} />
        </div>
      </div>

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

// ---------- Erklärung Diskriminante ----------

interface DCase {
  title: string
  tex: string
  lines: string[]
  why: React.ReactNode
  result: string
  graph: React.ReactNode
}

const D_CASES: DCase[] = [
  {
    title: 'D > 0',
    tex: 'y = x^2 - 2x - 3',
    lines: ['D = (-2)^2 - 4 \\cdot 1 \\cdot (-3)', 'D = 4 + 12 = 16'],
    why: <><Tex tex="\pm\sqrt{16} = \pm 4" />: Plus und Minus ergeben zwei verschiedene Werte.</>,
    result: 'Zwei Nullstellen',
    graph: (
      <ParabolaGraph
        f={(x) => x * x - 2 * x - 3}
        marks={[
          { x: 3, color: RED, label: 'N₁' },
          { x: -1, color: BLUE, label: 'N₂', left: true },
        ]}
        ariaLabel="Parabel y = x² − 2x − 3 schneidet die x-Achse zweimal"
        className="max-w-[220px]"
      />
    ),
  },
  {
    title: 'D = 0',
    tex: 'y = x^2 - 4x + 4',
    lines: ['D = (-4)^2 - 4 \\cdot 1 \\cdot 4', 'D = 16 - 16 = 0'],
    why: <><Tex tex="\pm\sqrt{0} = \pm 0" />: Plus und Minus ergeben denselben Wert.</>,
    result: 'Eine Nullstelle',
    graph: (
      <ParabolaGraph
        f={(x) => x * x - 4 * x + 4}
        marks={[{ x: 2, color: RED, label: 'N' }]}
        ariaLabel="Parabel y = x² − 4x + 4 berührt die x-Achse in einem Punkt"
        className="max-w-[220px]"
      />
    ),
  },
  {
    title: 'D < 0',
    tex: 'y = x^2 - 2x + 2',
    lines: ['D = (-2)^2 - 4 \\cdot 1 \\cdot 2', 'D = 4 - 8 = -4'],
    why: <><Tex tex="\sqrt{-4}" /> gibt es nicht: Aus einer negativen Zahl kann man keine Wurzel ziehen.</>,
    result: 'Keine Nullstelle',
    graph: (
      <ParabolaGraph
        f={(x) => x * x - 2 * x + 2}
        marks={[]}
        ariaLabel="Parabel y = x² − 2x + 2 schneidet die x-Achse nicht"
        className="max-w-[220px]"
      />
    ),
  },
]

function DiskriminanteErklaerung() {
  return (
    <div className="bk-panel text-left">
      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">Die Diskriminante verstehen</h2>
      <p className="text-slate-700 mb-2">
        Eine Parabel kann die x-Achse <strong>zweimal</strong>, <strong>einmal</strong> oder <strong>gar nicht</strong> treffen. Wie viele
        Nullstellen es gibt, kannst du schon vorher ausrechnen – ohne die Nullstellen selbst zu bestimmen. Schau dir dazu die
        Mitternachtsformel genau an:
      </p>
      <Tex display tex={`x_{1,2} = \\frac{-b \\pm \\sqrt{\\textcolor{${ORANGE}}{b^2 - 4ac}}}{2a}`} />
      <p className="text-slate-700 mb-2">
        Den Term unter der Wurzel nennt man <strong>Diskriminante D</strong> (lateinisch <em>discriminare</em> = unterscheiden). Sie
        unterscheidet die drei Fälle:
      </p>
      <Tex display tex={`\\textcolor{${ORANGE}}{D = b^2 - 4ac}`} />

      <StepTable
        rows={[
          {
            step: (
              <>
                <strong>1.</strong> Setze <Tex tex="y = 0" /> und lies a, b und c ab. <strong>Achtung:</strong> Vorzeichen mitnehmen!
              </>
            ),
            example: (
              <>
                <Tex display tex="2x^2 + 3x - 2 = 0" />
                <Tex display tex="a = 2,\quad b = 3,\quad c = -2" />
              </>
            ),
          },
          {
            step: (
              <>
                <strong>2.</strong> Setze a, b und c in <Tex tex="D = b^2 - 4 \cdot a \cdot c" /> ein und rechne D aus. Negative Zahlen in
                Klammern setzen.
              </>
            ),
            example: <Steps lines={['D = 3^2 - 4 \\cdot 2 \\cdot (-2)', 'D = 9 + 16 = 25'].map((tex) => ({ tex }))} />,
          },
          {
            step: (
              <>
                <strong>3.</strong> Entscheide anhand des <strong>Vorzeichens</strong> von D, wie viele Nullstellen es gibt.
              </>
            ),
            example: (
              <p className="text-center">
                <Tex tex="D = 25 > 0" /> → <strong>zwei Nullstellen</strong>
              </p>
            ),
          },
        ]}
      />

      <h3 className="text-base font-bold text-slate-800 mt-5 mb-2">Die drei Fälle</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {D_CASES.map((d) => (
          <div key={d.title} className="bk-taskbox text-sm text-slate-700 space-y-1">
            <p className="font-bold text-slate-800 text-center text-base">
              <Tex tex={d.title} />
            </p>
            <Tex display tex={d.tex} />
            <Steps lines={d.lines.map((tex) => ({ tex }))} />
            {d.graph}
            <p className="font-bold text-slate-800 text-center">{d.result}</p>
            <p>{d.why}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-3 text-slate-700">
        <p className="font-bold text-slate-800 mb-1">Merke</p>
        <ul className="space-y-1">
          <li>
            <Tex tex="D > 0" />: zwei Nullstellen (die Parabel schneidet die x-Achse zweimal)
          </li>
          <li>
            <Tex tex="D = 0" />: genau eine Nullstelle (die Parabel berührt die x-Achse mit dem Scheitelpunkt)
          </li>
          <li>
            <Tex tex="D < 0" />: keine Nullstelle (die Parabel schneidet die x-Achse nicht)
          </li>
        </ul>
      </div>

      <ul className="list-disc pl-5 mt-4 text-slate-700 space-y-1 text-sm">
        <li>
          Negative Zahlen in Klammern setzen: <Tex tex="(-2)^2 = 4" />, aber <Tex tex="-2^2 = -4" />. Deshalb ist <Tex tex="b^2" /> nie negativ.
        </li>
        <li>
          Fehlt ein Summand, ist der Koeffizient 0: Bei <Tex tex="y = x^2 - 9" /> ist <Tex tex="b = 0" />, bei <Tex tex="y = x^2 - 4x" /> ist{' '}
          <Tex tex="c = 0" />.
        </li>
        <li>
          Haben a und c <strong>verschiedene Vorzeichen</strong>, ist <Tex tex="-4ac" /> positiv – dann ist D immer größer als 0 und es gibt
          zwei Nullstellen.
        </li>
      </ul>
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
      <p className="text-center text-slate-600">Berechne, wo die Parabel die x-Achse schneidet.</p>
    </div>
  )

  if (!level) {
    return (
      <TaskShell title="Nullstellen berechnen" width="narrow">
        <div className="flex flex-col gap-6">
          {header}
          <div className={panel}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Wähle deinen Schwierigkeitsgrad</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => chooseLevel('einfach')}
                className="rounded-2xl bg-green-600 hover:bg-green-700 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-lg font-bold mb-1 text-white">Einfach</p>
                <Tex display className="text-lg mb-2 text-white" tex="y = ax^2 + bx + c" />
                <p className="text-sm text-white/90">Ganzzahlige Koeffizienten ohne Brüche, die Nullstellen sind ganze Zahlen.</p>
              </button>
              <button
                onClick={() => chooseLevel('diskriminante')}
                className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-lg font-bold mb-1 text-white">Mittel</p>
                <p className="font-semibold text-white mb-1">Die Diskriminante verstehen</p>
                <Tex display className="text-lg mb-2 text-white" tex="D = b^2 - 4ac" />
                <p className="text-sm text-white/90">Bestimme mit der Diskriminante, wie viele Nullstellen eine Parabel hat.</p>
              </button>
              <button
                onClick={() => chooseLevel('fortgeschritten')}
                className="rounded-2xl bg-red-600 hover:bg-red-700 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                <Tex display className="text-lg mb-1 text-white" tex="y = ax^2 + bx + c" />
                <Tex display className="text-lg mb-2 text-white" tex="y = a(x - x_S)^2 + y_S" />
                <p className="text-sm text-white/90">Koeffizienten mit Brüchen und Funktionen in Scheitelform, Ergebnisse teils gerundet.</p>
              </button>
            </div>
          </div>
        </div>
      </TaskShell>
    )
  }

  return (
    <TaskShell title="Nullstellen berechnen" width="narrow">
        <div className="flex flex-col gap-6">
        {header}
        {level === 'diskriminante' ? <DiskriminanteErklaerung /> : <Erklaerung level={level} />}

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
            {level === 'diskriminante' ? (
              <DiscriminantCard
                number={i + 1}
                spec={spec}
                initialTask={task}
                onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
                onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
                onHelp={() => setStreak(0)}
              />
            ) : (
              <TaskCard
                number={i + 1}
                level={level}
                spec={spec}
                initialTask={task}
                onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
                onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
                onHelp={() => setStreak(0)}
              />
            )}
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

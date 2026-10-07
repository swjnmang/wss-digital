import React, { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'

const TOTAL_TASKS = 6

const VIDEO_ID = 'zbc5WmfLDiY'

// Einfach: ganze Zahlen, immer genau ein Schnittpunkt
// Fortgeschritten: Brüche in den Gleichungen, manchmal parallele Geraden (kein Schnittpunkt)
type Level = 'einfach' | 'fortgeschritten'

const LEVEL_LABEL: Record<Level, string> = { einfach: 'Einfach', fortgeschritten: 'Fortgeschritten' }

const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors'
const btnSecondary = 'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors'
const panel = 'text-center bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200'

function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ---------- Bruchrechnung (exakt, damit der Lösungsweg mit Brüchen stimmt) ----------

type Q = { n: number; d: number }

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}
function q(n: number, d = 1): Q {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}
const add = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d)
const sub = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d)
const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d)
const div = (a: Q, b: Q) => q(a.n * b.d, a.d * b.n)
const val = (a: Q) => a.n / a.d
const isOne = (a: Q) => a.n === 1 && a.d === 1
const eq = (a: Q, b: Q) => a.n === b.n && a.d === b.d

// ---------- Darstellung von Zahlen, Termen und Gleichungen ----------

function Frac({ num, den }: { num: React.ReactNode; den: React.ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle mx-0.5 text-[0.85em]">
      <span className="px-0.5 leading-tight">{num}</span>
      <span className="px-0.5 leading-tight border-t-2 border-current">{den}</span>
    </span>
  )
}

/** Zahl (ganz oder als Bruch) mit Vorzeichen. */
function Num({ v }: { v: Q }) {
  const sign = v.n < 0 ? '−' : ''
  const abs = Math.abs(v.n)
  if (v.d === 1) return <>{sign}{abs}</>
  return <>{sign}<Frac num={abs} den={v.d} /></>
}

/** Negative Zahlen in Klammern, z. B. 2 · (−3). */
function Paren({ v }: { v: Q }) {
  return v.n < 0 ? <>(<Num v={v} />)</> : <Num v={v} />
}

const X = () => <i>x</i>

/** x-Term am Anfang: x, −x, 3x, ½x ... */
function XTerm({ m }: { m: Q }) {
  if (isOne(m)) return <X />
  if (m.n === -1 && m.d === 1) return <>−<X /></>
  return <><Num v={m} /><X /></>
}

/** Konstante mit Rechenzeichen davor: " + 3", " − ½" (nichts bei 0). */
function SignedConst({ t }: { t: Q }) {
  if (t.n === 0) return null
  return <>{t.n > 0 ? ' + ' : ' − '}<Num v={q(Math.abs(t.n), t.d)} /></>
}

/** Funktionsterm m·x + t */
function Lin({ m, t }: { m: Q; t: Q }) {
  return <><XTerm m={m} /><SignedConst t={t} /></>
}

/** Umformungsschritt für einen x-Term: | − 2x bzw. | + ½x */
function OpX({ m }: { m: Q }) {
  return <>| {m.n > 0 ? '−' : '+'} <XTerm m={q(Math.abs(m.n), m.d)} /></>
}
function OpConst({ t }: { t: Q }) {
  return <>| {t.n > 0 ? '−' : '+'} <Num v={q(Math.abs(t.n), t.d)} /></>
}

type Row = { lhs: React.ReactNode; rhs: React.ReactNode; op?: React.ReactNode; note?: React.ReactNode }

/** Gleichungsumformung, am Gleichheitszeichen ausgerichtet. */
function EquationRows({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto text-lg font-serif border-separate border-spacing-y-1">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="text-right whitespace-nowrap pr-2">{r.lhs}</td>
              <td className="px-1">=</td>
              <td className="text-left whitespace-nowrap pl-2">{r.rhs}</td>
              <td className="text-left whitespace-nowrap pl-5 text-slate-500 text-base font-sans">{r.op}{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------- Aufgaben ----------

type Task = { m1: Q; t1: Q; m2: Q; t2: Q; s: { x: number; y: number } | null }

/** Schnittpunkt per Gleichsetzen; null bei parallelen Geraden. */
function intersection(m1: Q, t1: Q, m2: Q, t2: Q) {
  if (eq(m1, m2)) return null
  const x = div(sub(t2, t1), sub(m1, m2))
  return { x, y: add(mul(m1, x), t1) }
}

function makeTask(m1: Q, t1: Q, m2: Q, t2: Q): Task {
  const s = intersection(m1, t1, m2, t2)
  return { m1, t1, m2, t2, s: s ? { x: val(s.x), y: val(s.y) } : null }
}

const EASY_SLOPES = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5] as const

function newEasyTask(): Task {
  // Schnittpunkt ganzzahlig vorgeben und die y-Achsenabschnitte daraus berechnen
  for (;;) {
    const m1 = randomChoice(EASY_SLOPES)
    const m2 = randomChoice(EASY_SLOPES)
    if (m1 === m2) continue
    const xs = randomInt(6, -6)
    const ys = randomInt(8, -8)
    if (xs === 0) continue
    const t1 = ys - m1 * xs
    const t2 = ys - m2 * xs
    if (Math.abs(t1) > 12 || Math.abs(t2) > 12) continue
    if (t1 === 0 && t2 === 0) continue
    return makeTask(q(m1), q(t1), q(m2), q(t2))
  }
}

// Steigungen für Fortgeschritten: Brüche und ganze Zahlen
const FRACTION_SLOPES: Q[] = [
  [1, 2], [3, 2], [5, 2], [1, 3], [2, 3], [4, 3], [1, 4], [3, 4], [5, 4],
].flatMap(([n, d]) => [q(n, d), q(-n, d)])
const INT_SLOPES: Q[] = [1, 2, 3, -1, -2, -3].map((n) => q(n))

function newAdvancedTask(parallel: boolean): Task {
  if (parallel) {
    const m = randomChoice(FRACTION_SLOPES)
    const t1 = randomInt(8, -8)
    let t2 = t1
    while (t2 === t1) t2 = randomInt(8, -8)
    return makeTask(m, q(t1), m, q(t2))
  }
  for (;;) {
    // Mindestens eine Steigung ist ein Bruch
    const m1 = randomChoice(FRACTION_SLOPES)
    const m2 = Math.random() < 0.5 ? randomChoice(FRACTION_SLOPES) : randomChoice(INT_SLOPES)
    if (eq(m1, m2)) continue
    // x-Wert des Schnittpunkts ist ein Vielfaches beider Nenner -> ganzzahlige y-Achsenabschnitte
    const l = (m1.d * m2.d) / gcd(m1.d, m2.d)
    if (l > 6) continue
    const ks = Array.from({ length: 17 }, (_, i) => i - 8).filter((x) => x !== 0 && x % l === 0)
    const xs = randomChoice(ks)
    const ys = randomInt(6, -6)
    const t1 = sub(q(ys), mul(m1, q(xs)))
    const t2 = sub(q(ys), mul(m2, q(xs)))
    if (Math.abs(val(t1)) > 12 || Math.abs(val(t2)) > 12) continue
    if (t1.n === 0 && t2.n === 0) continue
    const task = makeTask(m1, t1, m2, t2)
    // Reihenfolge der Geraden zufällig, damit nicht immer g₁ den Bruch hat
    return Math.random() < 0.5 ? task : makeTask(m2, t2, m1, t1)
  }
}

const newTask = (level: Level, parallel: boolean) =>
  level === 'einfach' ? newEasyTask() : newAdvancedTask(parallel)

// ---------- Lösungsweg ----------

function solutionRows(m1: Q, t1: Q, m2: Q, t2: Q): Row[] {
  const rows: Row[] = [{ lhs: <Lin m={m1} t={t1} />, rhs: <Lin m={m2} t={t2} />, op: <OpX m={m2} /> }]
  if (eq(m1, m2)) {
    rows.push({
      lhs: <Num v={t1} />,
      rhs: <Num v={t2} />,
      note: <span className="text-red-600 font-semibold">falsche Aussage</span>,
    })
    return rows
  }
  const d = sub(m1, m2)
  rows.push({ lhs: <Lin m={d} t={t1} />, rhs: <Num v={t2} /> })
  if (t1.n !== 0) {
    rows[rows.length - 1].op = <OpConst t={t1} />
    rows.push({ lhs: <XTerm m={d} />, rhs: <Num v={sub(t2, t1)} /> })
  }
  if (!isOne(d)) {
    // Bei einem Bruch mit dem Kehrwert multiplizieren, sonst dividieren
    rows[rows.length - 1].op =
      d.d === 1 ? <>| : <Paren v={d} /></> : <>| · <Paren v={div(q(1), d)} /></>
    rows.push({ lhs: <X />, rhs: <Num v={div(sub(t2, t1), d)} /> })
  }
  return rows
}

/** y-Wert durch Einsetzen von x in g₁ */
function InsertY({ m, t, x }: { m: Q; t: Q; x: Q }) {
  const prod = mul(m, x)
  return (
    <p className="text-lg font-serif my-1">
      <i>y</i> = <Num v={m} /> · <Paren v={x} />
      <SignedConst t={t} />
      {t.n !== 0 && <> = <Num v={prod} /><SignedConst t={t} /></>}
      {' '}= <Num v={add(prod, t)} />
    </p>
  )
}

function SolutionWay({ task }: { task: Task }) {
  const { m1, t1, m2, t2 } = task
  const s = intersection(m1, t1, m2, t2)
  return (
    <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50 text-slate-800">
      <h3 className="text-base font-bold text-center mb-2">Lösungsweg</h3>
      <p className="font-semibold text-left">1. Funktionsterme gleichsetzen und nach x auflösen</p>
      <EquationRows rows={solutionRows(m1, t1, m2, t2)} />
      {s ? (
        <>
          <p className="font-semibold text-left mt-3">2. x in g₁ einsetzen</p>
          <InsertY m={m1} t={t1} x={s.x} />
          <p className="font-bold text-lg mt-3">
            S(<Num v={s.x} /> | <Num v={s.y} />)
          </p>
        </>
      ) : (
        <p className="mt-3 text-left">
          Die Gleichung ist nie erfüllt. Beide Geraden haben dieselbe Steigung m = <Num v={m1} />, aber verschiedene
          y-Achsenabschnitte. Sie verlaufen <strong>parallel</strong> – es gibt <strong>keinen Schnittpunkt</strong>.
        </p>
      )}
      <div className="mt-4">
        <LinesGraph task={task} />
      </div>
    </div>
  )
}

// ---------- Graph mit beiden Geraden ----------

const LINE_COLORS = ['#2563eb', '#dc2626']

function LinesGraph({ task }: { task: Task }) {
  const clipId = useId()
  const lines = [
    { m: val(task.m1), t: val(task.t1), label: 'g₁' },
    { m: val(task.m2), t: val(task.t2), label: 'g₂' },
  ]
  const s = task.s
  let xMin: number, xMax: number, yMin: number, yMax: number
  if (s) {
    xMin = Math.min(-2, Math.floor(s.x) - 4)
    xMax = Math.max(2, Math.ceil(s.x) + 4)
    yMin = Math.min(-2, Math.floor(s.y) - 4)
    yMax = Math.max(2, Math.ceil(s.y) + 4)
  } else {
    xMin = -6
    xMax = 6
    yMin = Math.min(-2, Math.floor(Math.min(lines[0].t, lines[1].t)) - 4)
    yMax = Math.max(2, Math.ceil(Math.max(lines[0].t, lines[1].t)) + 4)
  }
  const S = 26
  const w = (xMax - xMin) * S
  const h = (yMax - yMin) * S
  const px = (x: number) => (x - xMin) * S
  const py = (y: number) => (yMax - y) * S
  const step = Math.max(xMax - xMin, yMax - yMin) > 14 ? 2 : 1
  const xs = Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i)
  const ys = Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i)

  // Beschriftung: g₁ am rechten, g₂ am linken Rand – jeweils dort, wo die Gerade im Bild ist
  const labelPos = (m: number, t: number, fromRight: boolean) => {
    for (let k = 0; k <= (xMax - xMin) * 4; k++) {
      const x = fromRight ? xMax - 0.6 - k / 4 : xMin + 0.6 + k / 4
      const y = m * x + t
      if (y > yMin + 0.6 && y < yMax - 0.6) return { x, y }
    }
    return { x: (xMin + xMax) / 2, y: m * ((xMin + xMax) / 2) + t }
  }

  return (
    <svg
      viewBox={`-10 -10 ${w + 20} ${h + 20}`}
      className="w-full max-w-sm mx-auto"
      role="img"
      aria-label={s ? `Die beiden Geraden schneiden sich im Punkt S(${s.x}|${s.y})` : 'Die beiden Geraden verlaufen parallel'}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={w} height={h} />
        </clipPath>
      </defs>
      {xs.map((x) => (
        <line key={`gx${x}`} x1={px(x)} y1={0} x2={px(x)} y2={h} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {ys.map((y) => (
        <line key={`gy${y}`} x1={0} y1={py(y)} x2={w} y2={py(y)} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      <line x1={0} y1={py(0)} x2={w} y2={py(0)} stroke="#334155" strokeWidth={1.5} />
      <line x1={px(0)} y1={h} x2={px(0)} y2={0} stroke="#334155" strokeWidth={1.5} />
      <text x={w - 4} y={py(0) - 6} fontSize={13} textAnchor="end" fill="#334155">x</text>
      <text x={px(0) + 6} y={12} fontSize={13} fill="#334155">y</text>
      {xs.filter((x) => x !== 0 && x % step === 0).map((x) => (
        <text key={`lx${x}`} x={px(x)} y={py(0) + 14} fontSize={10} textAnchor="middle" fill="#64748b">{x}</text>
      ))}
      {ys.filter((y) => y !== 0 && y % step === 0).map((y) => (
        <text key={`ly${y}`} x={px(0) - 5} y={py(y) + 3} fontSize={10} textAnchor="end" fill="#64748b">{y}</text>
      ))}
      <g clipPath={`url(#${clipId})`}>
        {lines.map((l, i) => (
          <line
            key={i}
            x1={px(xMin)}
            y1={py(l.m * xMin + l.t)}
            x2={px(xMax)}
            y2={py(l.m * xMax + l.t)}
            stroke={LINE_COLORS[i]}
            strokeWidth={2.5}
          />
        ))}
      </g>
      {lines.map((l, i) => {
        const p = labelPos(l.m, l.t, i === 0)
        return (
          <text key={`l${i}`} x={px(p.x)} y={py(p.y) - 8} fontSize={14} fontWeight="bold" textAnchor="middle" fill={LINE_COLORS[i]}>
            {l.label}
          </text>
        )
      })}
      {s && (
        <>
          <circle cx={px(s.x)} cy={py(s.y)} r={5} fill="#1e293b" />
          <text x={px(s.x) + 8} y={py(s.y) + 18} fontSize={13} fontWeight="bold" fill="#1e293b">
            S({String(s.x).replace('-', '−')}|{String(s.y).replace('-', '−')})
          </text>
        </>
      )}
    </svg>
  )
}

// ---------- Live-Auswertung der Eingabe ----------

type AnswerStatus = 'idle' | 'right' | 'wrong'

const isIncomplete = (raw: string) => ['', '-', '−', ',', '.'].includes(raw.trim())

/** Status eines einzelnen Koordinatenfelds: grün, sobald der Wert stimmt, sonst rot. */
function fieldStatus(raw: string, correct: number | undefined): AnswerStatus {
  const v = parseFlexibleNumber(raw)
  if (isIncomplete(raw) || Number.isNaN(v)) return 'idle'
  return correct !== undefined && Math.abs(v - correct) < 0.01 ? 'right' : 'wrong'
}

/**
 * Jedes Feld färbt sich beim Tippen sofort grün (richtig) oder rot (falsch).
 * Für Tracking, "Richtig in Folge" und das Freischalten der Musterlösung zählt ein falscher Versuch erst,
 * wenn die Eingabe kurz stehen bleibt, nicht bei jedem Tastendruck.
 */
function useLiveIntersection(
  task: Task,
  handlers: { onCorrect: () => void; onWrong: () => void },
) {
  const [xIn, setXIn] = useState('')
  const [yIn, setYIn] = useState('')
  const [none, setNone] = useState(false)
  const [solved, setSolved] = useState(false)
  const [hadWrong, setHadWrong] = useState(false)

  const xStatus = fieldStatus(xIn, task.s?.x)
  const yStatus = fieldStatus(yIn, task.s?.y)
  let status: AnswerStatus
  if (none) status = task.s === null ? 'right' : 'wrong'
  else if (xStatus === 'right' && yStatus === 'right') status = 'right'
  else if (xStatus === 'wrong' || yStatus === 'wrong') status = 'wrong'
  else status = 'idle'

  useEffect(() => {
    if (solved) return
    if (status === 'right') {
      setSolved(true)
      handlers.onCorrect()
      return
    }
    if (status === 'wrong') {
      const timer = setTimeout(() => {
        setHadWrong(true)
        handlers.onWrong()
      }, 900)
      return () => clearTimeout(timer)
    }
  }, [xIn, yIn, none, task, solved])

  const reset = () => {
    setXIn('')
    setYIn('')
    setNone(false)
    setSolved(false)
    setHadWrong(false)
  }

  const hint = none
    ? 'Die Geraden haben doch einen Schnittpunkt.'
    : xStatus === 'right' && yStatus === 'wrong'
      ? 'x stimmt, aber y noch nicht.'
      : xStatus === 'wrong' && yStatus === 'right'
        ? 'y stimmt, aber x noch nicht.'
        : 'Noch nicht richtig.'

  return { xIn, setXIn, yIn, setYIn, none, setNone, xStatus, yStatus, status, solved, hadWrong, reset, hint }
}

const statusBorder = (s: AnswerStatus) =>
  s === 'right' ? 'border-green-500 bg-green-50' : s === 'wrong' ? 'border-red-500 bg-red-50' : 'border-slate-300'

function AnswerField({ live, allowNone }: { live: ReturnType<typeof useLiveIntersection>; allowNone: boolean }) {
  const { xIn, setXIn, yIn, setYIn, none, setNone, xStatus, yStatus, status, solved, hint } = live
  const inputCls = 'w-24 text-center border-2 rounded px-2 py-2 focus:outline-none disabled:bg-slate-100 disabled:border-slate-200'
  return (
    <div>
      <div className="flex items-center justify-center gap-1 text-lg font-semibold text-slate-800">
        <span>S(</span>
        <input
          value={xIn}
          disabled={none}
          readOnly={solved}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXIn(e.target.value)}
          className={`${inputCls} ${none ? '' : statusBorder(xStatus)}`}
          placeholder="x"
          aria-label="x-Koordinate des Schnittpunkts"
        />
        <span>|</span>
        <input
          value={yIn}
          disabled={none}
          readOnly={solved}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYIn(e.target.value)}
          className={`${inputCls} ${none ? '' : statusBorder(yStatus)}`}
          placeholder="y"
          aria-label="y-Koordinate des Schnittpunkts"
        />
        <span>)</span>
      </div>
      {allowNone && (
        <label
          className={`inline-flex items-center justify-center gap-2 mt-3 px-3 py-1.5 rounded border-2 cursor-pointer text-slate-700 ${
            none ? statusBorder(status) : 'border-transparent'
          }`}
        >
          <input
            type="checkbox"
            checked={none}
            disabled={solved}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNone(e.target.checked)}
            className="w-4 h-4"
          />
          Es gibt keinen Schnittpunkt (die Geraden sind parallel).
        </label>
      )}
      {status === 'right' && <p className="text-center font-bold mt-3 text-green-600">Richtig! Super gemacht!</p>}
      {status === 'wrong' && <p className="text-center font-bold mt-3 text-red-600">{hint}</p>}
    </div>
  )
}

// ---------- Tipps (schrittweise) ----------

const hasFraction = (task: Task) => task.m1.d !== 1 || task.m2.d !== 1 || task.t1.d !== 1 || task.t2.d !== 1

function tipsFor(task: Task): React.ReactNode[] {
  const { m1, t1, m2, t2 } = task
  const tips: React.ReactNode[] = [
    <>
      Setze die beiden Funktionsterme gleich:
      <EquationRows rows={[{ lhs: <Lin m={m1} t={t1} />, rhs: <Lin m={m2} t={t2} /> }]} />
    </>,
  ]
  const fractionNote = hasFraction(task) && (
    <p className="text-sm mt-1">
      Brüche mit gleichem Nenner kannst du direkt verrechnen, sonst bringst du sie zuerst auf einen gemeinsamen Nenner.
    </p>
  )

  if (eq(m1, m2)) {
    tips.push(
      <>
        Bringe die x-Terme auf eine Seite. Rechne dazu <span className="font-serif whitespace-nowrap"><OpX m={m2} /></span>.
        Was passiert dabei mit x?
      </>,
      <>
        Vergleiche die Steigungen der beiden Geraden: m₁ = <span className="font-serif"><Num v={m1} /></span> und
        m₂ = <span className="font-serif"><Num v={m2} /></span>.
      </>,
      <>
        Fällt x weg und bleibt eine <strong>falsche Aussage</strong> übrig (z. B. 1 = −3), sind die Geraden parallel.
        Dann gibt es keinen Schnittpunkt – setze den Haken.
      </>,
    )
    return tips
  }

  const d = sub(m1, m2)
  tips.push(
    <>
      Bringe die x-Terme auf eine Seite. Rechne dazu <span className="font-serif whitespace-nowrap"><OpX m={m2} /></span>:
      <EquationRows rows={[{ lhs: <Lin m={d} t={t1} />, rhs: <Num v={t2} /> }]} />
      {fractionNote}
    </>,
  )
  const dOp = d.d === 1 ? <>: <Paren v={d} /></> : <>· <Paren v={div(q(1), d)} /></>
  tips.push(
    t1.n !== 0 ? (
      <>
        Bringe die Zahl auf die andere Seite (<span className="font-serif whitespace-nowrap"><OpConst t={t1} /></span>):
        <EquationRows rows={[{ lhs: <XTerm m={d} />, rhs: <Num v={sub(t2, t1)} /> }]} />
        {!isOne(d) && <>Rechne dann <span className="font-serif whitespace-nowrap">| {dOp}</span>, damit x allein steht.</>}
      </>
    ) : isOne(d) ? (
      <>Jetzt steht x schon allein – du hast den x-Wert des Schnittpunkts.</>
    ) : (
      <>
        Damit x allein steht, rechne <span className="font-serif whitespace-nowrap">| {dOp}</span>.
      </>
    ),
  )
  tips.push(
    <>
      Setze dein Ergebnis für x in g₁ ein:{' '}
      <span className="font-serif whitespace-nowrap">
        <i>y</i> = <Lin m={m1} t={t1} />
      </span>
      . Den Schnittpunkt schreibst du dann als S(x | y).
    </>,
  )
  return tips
}

function TipBox({ tips, shown }: { tips: React.ReactNode[]; shown: number }) {
  if (shown === 0) return null
  return (
    <div className="mt-4 border-l-4 border-amber-400 bg-amber-50 rounded p-3 text-left text-slate-700">
      <ol className="space-y-2">
        {tips.slice(0, shown).map((tip, i) => (
          <li key={i}>
            <span className="font-semibold text-slate-800">Tipp {i + 1}: </span>
            {tip}
          </li>
        ))}
      </ol>
    </div>
  )
}

// ---------- Aufgabenkarte ----------

interface CardProps {
  number: number
  /** Meldet, ob die Aufgabe aktuell richtig gelöst ist (false, wenn eine neue Aufgabe geladen wird). */
  onSolvedChange: (solved: boolean) => void
  /** Meldet jedes Prüfergebnis für die Serie "Richtig in Folge". */
  onResult: (correct: boolean) => void
  onHelp: () => void
  level: Level
  /** Fortgeschritten: Startaufgabe mit parallelen Geraden */
  initialParallel: boolean
}

function TaskCard({ number, onSolvedChange, onResult, onHelp, level, initialParallel }: CardProps) {
  const tracking = useTaskTracking(`Schnittpunkt berechnen (${LEVEL_LABEL[level]})`)
  const [task, setTask] = useState(() => newTask(level, initialParallel))
  const [showSolution, setShowSolution] = useState(false)
  const [tipsShown, setTipsShown] = useState(0)
  const tips = tipsFor(task)

  const live = useLiveIntersection(task, {
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

  useEffect(() => {
    if (live.xIn || live.yIn || live.none) tracking.onInput()
  }, [live.xIn, live.yIn, live.none])

  function generateNewTask() {
    tracking.onTaskStart()
    onSolvedChange(false)
    live.reset()
    setShowSolution(false)
    setTipsShown(0)
    setTask(newTask(level, level === 'fortgeschritten' && Math.random() < 0.25))
  }

  function onShowTip() {
    setTipsShown((n) => Math.min(n + 1, tips.length))
    onHelp()
    tracking.onHintShown()
  }

  function onShowAnswer() {
    setShowSolution(true)
    onHelp()
    tracking.onHintShown()
  }

  const solutionLocked = !live.hadWrong
  const tipsLeft = tipsShown < tips.length

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}</h2>
      <p className="text-slate-700 mb-1">
        {level === 'einfach'
          ? 'Berechne den Schnittpunkt S der beiden Geraden.'
          : 'Berechne den Schnittpunkt S der beiden Geraden. Gibt es keinen, setze den Haken.'}
      </p>
      <div className="my-4 text-xl font-serif text-slate-800 space-y-2">
        <p>g₁: <i>y</i> = <Lin m={task.m1} t={task.t1} /></p>
        <p>g₂: <i>y</i> = <Lin m={task.m2} t={task.t2} /></p>
      </div>

      <AnswerField live={live} allowNone={level === 'fortgeschritten'} />

      <TipBox tips={tips} shown={tipsShown} />

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={generateNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button
          onClick={onShowTip}
          disabled={!tipsLeft || live.solved}
          className={`${btnSecondary} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white`}
        >
          {tipsShown === 0 ? 'Tipp' : tipsLeft ? 'Nächster Tipp' : 'Keine weiteren Tipps'} ({tipsShown}/{tips.length})
        </button>
        <button
          onClick={onShowAnswer}
          disabled={solutionLocked}
          title={solutionLocked ? 'Die Lösung kannst du anzeigen, nachdem du einmal eine Antwort eingegeben hast.' : undefined}
          className={`${btnSecondary} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white`}
        >
          Lösung anzeigen
        </button>
      </div>
      {solutionLocked && !live.solved && (
        <p className="text-xs text-slate-500 mt-2">Die Lösung kannst du erst nach einem falschen Versuch anzeigen.</p>
      )}

      {showSolution && <SolutionWay task={task} />}
    </div>
  )
}

// ---------- Erklärung mit Beispiel und Erklärvideo ----------

// Beispiel: g₁: y = 2x − 1, g₂: y = −x + 5 -> S(2|3)
const EXAMPLE = makeTask(q(2), q(-1), q(-1), q(5))
const PARALLEL_EXAMPLE = { m: q(2), t1: q(1), t2: q(-3) }

function Erklaerung() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200 text-slate-700">
      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">So berechnest du den Schnittpunkt</h2>
      <p className="mb-3">
        Im Schnittpunkt S haben beide Geraden <strong>denselben x-Wert und denselben y-Wert</strong>. Deshalb kannst du
        die beiden Funktionsterme gleichsetzen (<strong>Gleichsetzungsverfahren</strong>):
      </p>
      <ol className="list-decimal pl-5 space-y-1 mb-4">
        <li>Die beiden Funktionsterme <strong>gleichsetzen</strong>.</li>
        <li>Die Gleichung <strong>nach x auflösen</strong>.</li>
        <li>x in eine der beiden Geradengleichungen <strong>einsetzen</strong> und y ausrechnen.</li>
        <li>Den Schnittpunkt <strong>S(x | y)</strong> angeben.</li>
      </ol>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div>
          <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
          <p className="font-serif text-lg">g₁: <i>y</i> = 2<i>x</i> − 1</p>
          <p className="font-serif text-lg mb-2">g₂: <i>y</i> = −<i>x</i> + 5</p>
          <EquationRows rows={solutionRows(EXAMPLE.m1, EXAMPLE.t1, EXAMPLE.m2, EXAMPLE.t2)} />
          <p className="text-sm mt-2">x = 2 in g₁ einsetzen:</p>
          <InsertY m={EXAMPLE.m1} t={EXAMPLE.t1} x={q(2)} />
          <p className="font-bold text-lg text-slate-800 mt-2">S(2 | 3)</p>
        </div>
        <LinesGraph task={EXAMPLE} />
      </div>
      <div className="mt-4 border-l-4 border-amber-400 bg-amber-50 rounded p-3 text-sm">
        <p className="font-semibold text-slate-800 mb-1">Sonderfall: parallele Geraden</p>
        <p className="mb-1">
          Haben beide Geraden dieselbe Steigung, aber verschiedene y-Achsenabschnitte, fällt x beim Auflösen weg und es
          bleibt eine <strong>falsche Aussage</strong> übrig. Dann gibt es <strong>keinen Schnittpunkt</strong>.
        </p>
        <EquationRows
          rows={solutionRows(PARALLEL_EXAMPLE.m, PARALLEL_EXAMPLE.t1, PARALLEL_EXAMPLE.m, PARALLEL_EXAMPLE.t2)}
        />
      </div>
      <h3 className="text-base font-bold text-slate-800 mt-5 mb-2 text-center">Erklärvideo</h3>
      <div className="max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden border border-slate-200">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${VIDEO_ID}`}
          title="Erklärvideo: Schnittpunkt zweier Geraden"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

// ---------- Seite: sechs Aufgaben auf einmal ----------

/** Fortgeschritten: 1–2 der Aufgaben 2–6 haben parallele Geraden. */
function pickParallelTasks(): Set<number> {
  const count = randomInt(2, 1)
  const candidates = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5)
  return new Set(candidates.slice(0, count))
}

export default function Schnittpunkt() {
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState<Record<number, boolean>>({})
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)
  const [parallelTasks, setParallelTasks] = useState<Set<number>>(() => pickParallelTasks())

  const solvedCount = Object.values(solved).filter(Boolean).length
  const allSolved = solvedCount === TOTAL_TASKS

  const completionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved])

  const [level, setLevel] = useState<Level | null>(null)

  const startNewRound = () => {
    setRound((r) => r + 1)
    setSolved({})
    setFinished(false)
    setParallelTasks(pickParallelTasks())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chooseLevel = (next: Level | null) => {
    setLevel(next)
    startNewRound()
    setStreak(0)
  }

  const cards = level
    ? Array.from({ length: TOTAL_TASKS }, (_, i) => (
        // Die Karten bleiben nach einem Neustart per key getrennt (frischer Zustand, eigenes Tracking)
        <div key={`${level}-${round}-${i}`}>
          <TaskCard
            number={i + 1}
            onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
            onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
            onHelp={() => setStreak(0)}
            level={level}
            initialParallel={level === 'fortgeschritten' && parallelTasks.has(i)}
          />
        </div>
      ))
    : null

  const header = (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Schnittpunkt zweier Geraden</h1>
      <p className="text-center text-slate-600">Berechne den Schnittpunkt zweier Geraden mit dem Gleichsetzungsverfahren.</p>
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
                <p className="text-xl font-serif italic mb-2 text-white">y = 2x − 1</p>
                <p className="text-sm text-white/90">Ganze Zahlen in den Gleichungen. Es gibt immer genau einen Schnittpunkt.</p>
              </button>
              <button
                onClick={() => chooseLevel('fortgeschritten')}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white p-5 shadow-sm transition-colors"
              >
                <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                <p className="text-xl font-serif italic mb-2 text-white">
                  y = <Frac num={1} den={2} />x + 3
                </p>
                <p className="text-sm text-white/90">Brüche in den Gleichungen – und manchmal gibt es keinen Schnittpunkt, weil die Geraden parallel sind.</p>
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

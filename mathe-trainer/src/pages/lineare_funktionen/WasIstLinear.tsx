import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import TaskShell from '../../components/layout/TaskShell'

interface Fn {
  id: string
  m: number
  t: number
  text: string
}

const FUNCTIONS: Fn[] = [
  { id: '2x', m: 2, t: 0, text: 'Jeder y-Wert ist doppelt so hoch wie der dazugehörige x-Wert.' },
  { id: '3x', m: 3, t: 0, text: 'Jeder y-Wert ist dreimal so hoch wie der dazugehörige x-Wert.' },
  { id: '0.5x', m: 0.5, t: 0, text: 'Jeder y-Wert ist halb so hoch wie der dazugehörige x-Wert.' },
  { id: '-x', m: -1, t: 0, text: 'Jeder y-Wert ist das Gegenteil des dazugehörigen x-Werts.' },
  { id: '-2x', m: -2, t: 0, text: 'Jeder y-Wert ist doppelt so hoch wie der x-Wert, hat aber das umgekehrte Vorzeichen.' },
  { id: 'x', m: 1, t: 0, text: 'Jeder y-Wert ist genauso groß wie der dazugehörige x-Wert.' },
  { id: '4x', m: 4, t: 0, text: 'Jeder y-Wert ist viermal so hoch wie der dazugehörige x-Wert.' },
  { id: '-0.5x', m: -0.5, t: 0, text: 'Jeder y-Wert ist halb so groß wie der x-Wert, hat aber das umgekehrte Vorzeichen.' },
  { id: 'x+3', m: 1, t: 3, text: 'Jeder y-Wert ist um 3 größer als der dazugehörige x-Wert.' },
  { id: 'x-2', m: 1, t: -2, text: 'Jeder y-Wert ist um 2 kleiner als der dazugehörige x-Wert.' },
  { id: '2x+1', m: 2, t: 1, text: 'Jeder y-Wert ist doppelt so hoch wie der x-Wert, zusätzlich kommt 1 dazu.' },
  { id: '-x+2', m: -1, t: 2, text: 'Jeder y-Wert ergibt sich, wenn man den x-Wert von 2 abzieht.' },
  { id: 'x+1', m: 1, t: 1, text: 'Jeder y-Wert ist um 1 größer als der dazugehörige x-Wert.' },
]

const XS = [-4, -2, 0, 2, 4]

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(n).replace('.', ',')).replace('-', '−')

function equation(f: Fn): string {
  let s = 'y = '
  const mPart = f.m === 1 ? 'x' : f.m === -1 ? '−x' : `${fmt(f.m)}x`
  s += mPart
  if (f.t > 0) s += ` + ${fmt(f.t)}`
  if (f.t < 0) s += ` − ${fmt(-f.t)}`
  return s
}

const yOf = (f: Fn, x: number) => f.m * x + f.t

function ValueTable({ f, highlight }: { f: Fn; highlight?: number }) {
  return (
    <table className="mx-auto border-collapse text-sm">
      <tbody>
        <tr>
          <th className="border border-slate-300 bg-slate-100 px-3 py-1">x</th>
          {XS.map((x) => (
            <td key={x} className={`border border-slate-300 px-3 py-1 text-center ${highlight === x ? 'bg-amber-100 font-bold' : ''}`}>{fmt(x)}</td>
          ))}
        </tr>
        <tr>
          <th className="border border-slate-300 bg-slate-100 px-3 py-1">y</th>
          {XS.map((x) => (
            <td key={x} className={`border border-slate-300 px-3 py-1 text-center ${highlight === x ? 'bg-amber-100 font-bold' : ''}`}>{fmt(yOf(f, x))}</td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

function Graph({ f, highlight, size = 240 }: { f: Fn; highlight?: number; size?: number }) {
  const R = 5 // Achsenbereich -R..R, Schrittweite 1
  const pad = 20
  const inner = size - 2 * pad
  const sx = (x: number) => pad + ((x + R) / (2 * R)) * inner
  const sy = (y: number) => pad + ((R - y) / (2 * R)) * inner
  const clip = `clip-${f.id}-${size}-${highlight ?? 'n'}`
  const ticks = Array.from({ length: 2 * R + 1 }, (_, i) => i - R)
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full" style={{ maxWidth: size }} role="img" aria-label={`Graph von ${equation(f)}`}>
      <defs>
        <clipPath id={clip}>
          <rect x={pad} y={pad} width={inner} height={inner} />
        </clipPath>
      </defs>
      <rect x={pad} y={pad} width={inner} height={inner} fill="#fff" stroke="#e2e8f0" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} y1={pad} x2={sx(t)} y2={pad + inner} stroke="#f1f5f9" />
          <line x1={pad} y1={sy(t)} x2={pad + inner} y2={sy(t)} stroke="#f1f5f9" />
        </g>
      ))}
      <line x1={pad} y1={sy(0)} x2={pad + inner} y2={sy(0)} stroke="#475569" strokeWidth={1.2} />
      <line x1={sx(0)} y1={pad} x2={sx(0)} y2={pad + inner} stroke="#475569" strokeWidth={1.2} />
      <polygon points={`${pad + inner + 4},${sy(0)} ${pad + inner - 3},${sy(0) - 3} ${pad + inner - 3},${sy(0) + 3}`} fill="#475569" />
      <polygon points={`${sx(0)},${pad - 4} ${sx(0) - 3},${pad + 3} ${sx(0) + 3},${pad + 3}`} fill="#475569" />
      {ticks.filter((t) => t !== 0).map((t) => (
        <g key={t} fontSize={size < 250 ? 8 : 10} fill="#64748b">
          <line x1={sx(t)} y1={sy(0) - 2} x2={sx(t)} y2={sy(0) + 2} stroke="#475569" />
          <line x1={sx(0) - 2} y1={sy(t)} x2={sx(0) + 2} y2={sy(t)} stroke="#475569" />
          <text x={sx(t)} y={sy(0) + (size < 250 ? 10 : 12)} textAnchor="middle">{fmt(t)}</text>
          <text x={sx(0) - 4} y={sy(t) + 3} textAnchor="end">{fmt(t)}</text>
        </g>
      ))}
      <text x={pad + inner + 2} y={sy(0) - 6} fontSize={size < 250 ? 11 : 13} fontStyle="italic" fontWeight={700} fill="#0f172a" textAnchor="end">x</text>
      <text x={sx(0) + 7} y={pad + 3} fontSize={size < 250 ? 11 : 13} fontStyle="italic" fontWeight={700} fill="#0f172a">y</text>
      <g clipPath={`url(#${clip})`}>
        <line x1={sx(-R)} y1={sy(yOf(f, -R))} x2={sx(R)} y2={sy(yOf(f, R))} stroke="#2563eb" strokeWidth={2.2} />
      </g>
      {XS.map((x) => {
        const y = yOf(f, x)
        if (Math.abs(y) > R) return null
        return <circle key={x} cx={sx(x)} cy={sy(y)} r={highlight === x ? 5.5 : 3} fill={highlight === x ? '#f59e0b' : '#2563eb'} stroke="#fff" strokeWidth={1} />
      })}
    </svg>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const LETTERS = ['A', 'B', 'C', 'D']

interface Card {
  kind: 'table' | 'graph' | 'equation'
  fnIdx: number // Index der richtigen Funktion (= richtiger Text)
}

function newRound(withT: boolean) {
  const pool = FUNCTIONS.filter((f) => withT || f.t === 0)
  const fns = shuffle(pool).slice(0, 4)
  const cards: Card[] = []
  ;(['table', 'graph', 'equation'] as const).forEach((kind) => {
    shuffle([0, 1, 2, 3]).forEach((fnIdx) => cards.push({ kind, fnIdx }))
  })
  return { fns, cards }
}

export default function WasIstLinear() {
  const tracking = useTaskTracking('Was ist eine lineare Funktion?')
  const [demoX, setDemoX] = useState(2)
  const [round, setRound] = useState(() => newRound(false))
  const [withT, setWithT] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [scored, setScored] = useState(false)

  const demo = FUNCTIONS[0]
  const { fns, cards } = round

  const results = useMemo(
    () => cards.map((c, i) => answers[i] === LETTERS[c.fnIdx]),
    [cards, answers],
  )
  const allAnswered = cards.every((_, i) => answers[i])
  const allCorrect = results.every(Boolean)

  const check = () => {
    setChecked(true)
    tracking.onCheck(allCorrect)
    if (allCorrect && !scored) {
      setScore((s) => s + 1)
      setScored(true)
    }
  }
  // Sind alle vier Zuordnungen richtig, kommt nach kurzer Pause automatisch eine neue Aufgabe.
  useEffect(() => {
    if (!checked || !allCorrect) return
    const timer = setTimeout(() => {
      tracking.onTaskStart()
      setRound(newRound(withT))
      setAnswers({})
      setChecked(false)
      setScored(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [checked, allCorrect, withT])

  const switchLevel = (v: boolean) => {
    tracking.onTaskStart()
    setWithT(v)
    setRound(newRound(v))
    setAnswers({})
    setChecked(false)
    setScored(false)
  }
  const next = () => {
    tracking.onTaskStart()
    setRound(newRound(withT))
    setAnswers({})
    setChecked(false)
    setScored(false)
  }

  return (
    <TaskShell title="Was ist eine lineare Funktion?" width="wide">
        <div className="">
        <Link to="/lineare_funktionen" className="bk-btn bk-btn-ghost" style={{ marginLeft: -12 }}><i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Übersicht</Link>
        <p className="text-center text-slate-600 mb-6">Wertetabelle, Graph, Gleichung und Text – vier Darstellungen derselben Funktion.</p>

        {/* Erklärung */}
        <div className="bk-panel mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Ein Beispiel</h2>
          <p className="text-slate-700 mb-4">
            Wir betrachten die Vorschrift: <strong>„{demo.text}“</strong> Das lässt sich auf vier Arten darstellen.
            Wähle einen x-Wert und sieh, wie er in allen Darstellungen wiederkommt:
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {XS.map((x) => (
              <button
                key={x}
                onClick={() => setDemoX(x)}
                className={`bk-seg-btn ${demoX === x ? 'bk-seg-btn-on' : ''}`}
              >
                x = {fmt(x)}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">1. Wertetabelle</h3>
                <div className="overflow-x-auto"><ValueTable f={demo} highlight={demoX} /></div>
                <p className="text-sm text-slate-600 mt-2">Zu jedem x-Wert gehört genau ein y-Wert. Für x = {fmt(demoX)} ist y = 2 · {fmt(demoX)} = <strong>{fmt(yOf(demo, demoX))}</strong>.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">2. Funktionsgleichung</h3>
                <p className="text-center text-2xl font-bold text-blue-700">{equation(demo)}</p>
                <p className="text-sm text-slate-600 mt-2">Die Gleichung ist die Rechenvorschrift in Kurzform: Multipliziere x mit 2, dann erhältst du y.</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">3. Funktionsgraph</h3>
              <Graph f={demo} highlight={demoX} size={300} />
              <p className="text-sm text-slate-600 mt-2">Jedes Wertepaar (x | y) aus der Tabelle ist ein Punkt. Der Punkt ({fmt(demoX)} | {fmt(yOf(demo, demoX))}) ist orange markiert. Alle Punkte liegen auf einer <strong>Geraden</strong>.</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-slate-700">
            <p className="font-semibold text-blue-900 mb-1">Merke</p>
            <p>
              Eine <strong>Funktion</strong> ordnet jedem x-Wert genau einen y-Wert zu. Text, Wertetabelle, Funktionsgleichung und Funktionsgraph
              beschreiben dieselbe Funktion – sie gehören zusammen. Hier ist der Graph eine <strong>Gerade durch den Ursprung</strong>, die Gleichung hat die Form
              <strong> y = m · x</strong>. Das ist eine (proportionale) <strong>lineare Funktion</strong>. In Stufe 2 der Übung kommen Geraden hinzu, die nicht durch den Ursprung gehen (y = m · x + t, mit dem y-Achsenabschnitt t).
            </p>
          </div>
        </div>

        {/* Übung */}
        <div className="bk-panel">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Übung: Was gehört zusammen?</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <button onClick={() => switchLevel(false)} className={`bk-seg-btn ${!withT ? 'bk-seg-btn-on' : ''}`}>
              Stufe 1: Ursprungsgeraden (y = m · x)
            </button>
            <button onClick={() => switchLevel(true)} className={`bk-seg-btn ${withT ? 'bk-seg-btn-on' : ''}`}>
              Stufe 2: auch y = m · x + t
            </button>
          </div>
          <p className="text-slate-700 mb-4">Unten stehen vier Texte (A–D). Ordne jeder Wertetabelle, jedem Graphen und jeder Gleichung den passenden Text zu.</p>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {fns.map((f, i) => (
              <div key={f.id} className="flex gap-3 items-start border border-slate-200 rounded-lg p-3 bg-slate-50">
                <span className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">{LETTERS[i]}</span>
                <span className="text-slate-800">{f.text}</span>
              </div>
            ))}
          </div>

          {(['table', 'graph', 'equation'] as const).map((kind) => (
            <div key={kind} className="mb-6">
              <h3 className="font-semibold text-slate-800 mb-2">
                {kind === 'table' ? 'Wertetabellen' : kind === 'graph' ? 'Funktionsgraphen' : 'Funktionsgleichungen'}
              </h3>
              <div className={`grid gap-3 ${kind === 'graph' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : kind === 'table' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
                {cards.map((c, i) => {
                  if (c.kind !== kind) return null
                  const f = fns[c.fnIdx]
                  const state = checked && answers[i] ? (results[i] ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-slate-200'
                  return (
                    <div key={i} className={`border-2 rounded-lg p-3 flex flex-col gap-2 ${state}`}>
                      <div className="flex-1 flex items-center justify-center overflow-x-auto">
                        {kind === 'table' && <ValueTable f={f} />}
                        {kind === 'graph' && <Graph f={f} size={200} />}
                        {kind === 'equation' && <span className="text-xl font-bold text-blue-700 py-3">{equation(f)}</span>}
                      </div>
                      <label className="text-sm text-slate-600 flex items-center justify-center gap-2">
                        passt zu Text
                        <select
                          value={answers[i] || ''}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setAnswers({ ...answers, [i]: e.target.value })
                            setChecked(false)
                          }}
                          className="border border-slate-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="">–</option>
                          {LETTERS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap justify-center gap-4 items-center">
            <button
              onClick={check}
              disabled={!allAnswered}
              className="bk-btn bk-btn-primary"
            >
              Prüfen
            </button>
            <button onClick={next} className="bk-btn">
              Neue Aufgabe
            </button>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">Punkte: {score}</div>
          </div>

          {checked && (
            <p className={`text-center font-bold mt-4 ${allCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {allCorrect
                ? 'Super! Alles richtig zugeordnet. Gleich kommen vier neue Aufgaben …'
                : `${results.filter(Boolean).length} von ${cards.length} richtig. Die rot markierten Karten passen noch nicht – probiere es nochmal!`}
            </p>
          )}
        </div>
      </div>
    </TaskShell>
  )
}

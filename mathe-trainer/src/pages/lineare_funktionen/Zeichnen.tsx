import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import ResponsiveGeoGebraGraph from '../../components/ResponsiveGeoGebraGraph'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import TaskShell from '../../components/layout/TaskShell'

const TOTAL_TASKS = 5

type Level = 'easy' | 'medium' | 'hard'
const LEVELS: { id: Level; label: string }[] = [
  { id: 'easy', label: 'Leicht' },
  { id: 'medium', label: 'Mittel' },
  { id: 'hard', label: 'Schwer' },
]

const btnPrimary = 'bk-btn bk-btn-primary'
const btnSecondary = 'bk-btn'
const panel = 'bk-panel text-center'

// ---------- Zahlen und Formeln ----------

// Kleinster Nenner, mit dem sich die Zahl als Bruch darstellen lässt.
function getDenominator(value: number): number {
  for (let d = 1; d <= 60; d++) {
    if (Math.abs(value * d - Math.round(value * d)) < 1e-9) return d
  }
  return 1
}

// decimal: Dezimalzahl mit Komma (z. B. 0,5) statt Bruch – wird im Schwierigkeitsgrad "Leicht" verwendet
function valueToLatex(value: number, decimal = false): string {
  if (decimal) return String(Math.round(value * 100) / 100).replace('.', '{,}')
  const d = getDenominator(value)
  const n = Math.round(value * d)
  if (d === 1) return String(n)
  return `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`
}

// Negative Zahlen beim Einsetzen in Klammern schreiben.
function withParens(value: number, decimal = false): string {
  return value < 0 ? `(${valueToLatex(value, decimal)})` : valueToLatex(value, decimal)
}

function generateEquationLatex(m: number, t: number, decimal = false): string {
  let mStr: string
  if (m === 1) mStr = 'x'
  else if (m === -1) mStr = '-x'
  else mStr = `${valueToLatex(m, decimal)}x`

  let tStr = ''
  if (t > 0) tStr = ` + ${valueToLatex(t, decimal)}`
  else if (t < 0) tStr = ` - ${valueToLatex(Math.abs(t), decimal)}`

  return `y = ${mStr}${tStr}`
}

function buildTipps(m: number, t: number, decimal = false) {
  const denominator = getDenominator(m)
  const xValues = denominator === 1 ? [-2, -1, 0, 1, 2] : [-denominator, 0, denominator]
  const tTerm = t === 0 ? '' : t > 0 ? ` + ${valueToLatex(t, decimal)}` : ` - ${valueToLatex(Math.abs(t), decimal)}`

  const rows = xValues.map((x) => {
    const product = m * x
    const y = product + t
    const mTerm = m === 1 ? withParens(x, decimal) : `${valueToLatex(m, decimal)} \\cdot ${withParens(x, decimal)}`
    let calculation = `y = ${mTerm}${tTerm}`
    if (t !== 0) calculation += ` = ${valueToLatex(product, decimal)}${tTerm}`
    calculation += ` = ${valueToLatex(y, decimal)}`
    return {
      x,
      xLatex: valueToLatex(x, decimal),
      calculation,
      yLatex: valueToLatex(y, decimal),
      point: `(${valueToLatex(x, decimal)} \\mid ${valueToLatex(y, decimal)})`,
    }
  })

  const rise = Math.round(Math.abs(m) * denominator)
  const direction = m > 0 ? 'nach oben' : 'nach unten'
  const right = denominator === 1 ? '1 Einheit' : `${denominator} Einheiten`
  const slopeText =
    `Gehst du von einem deiner Punkte ${right} nach rechts, musst du ${rise} ${rise === 1 ? 'Einheit' : 'Einheiten'} ${direction} gehen, ` +
    `um den nächsten Punkt auf der Geraden zu erreichen. Die Gerade verläuft deshalb von ` +
    `${m > 0 ? 'links unten nach rechts oben' : 'links oben nach rechts unten'}.`

  return { denominator, rows, mLatex: valueToLatex(m, decimal), slopeText }
}

// ---------- Aufgaben erzeugen ----------

interface DrawTask {
  id: number
  m: number
  t: number
}

const randomInt = (max: number, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min
const randomChoice = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

function rawTask(level: Level): { m: number; t: number } {
  let m: number
  let t: number
  switch (level) {
    case 'medium':
      m = randomChoice<number>([randomInt(2, -2), 0.5, -0.5, 1.5, -1.5, 2.5, -2.5])
      if (m === 0) m = 1.5
      m = Math.max(-3, Math.min(3, m))
      t = randomChoice<number>([randomInt(4, -4), randomInt(8, -8) / 2])
      t = Math.max(-4, Math.min(4, t))
      break
    case 'hard': {
      const numerators = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      const denominators = [3, 4, 5]
      m = randomChoice(numerators) / randomChoice(denominators)
      m = Math.max(-3, Math.min(3, m))
      if (Math.abs(m) < 0.1) m = 2 / 3
      t = randomChoice(numerators.slice(4, -4)) / randomChoice(denominators)
      t = Math.round(t * 4) / 4
      t = Math.max(-4, Math.min(4, t))
      break
    }
    case 'easy':
    default:
      // m von -3 bis 3 in 0,5er-Schritten (ohne 0); t = 0: nur Funktionen vom Typ y = m*x
      do {
        m = randomInt(6, -6) / 2
      } while (m === 0)
      t = 0
      break
  }
  return { m, t }
}

let nextId = 1
/** Neue Aufgabe, deren Steigung sich von den anderen Aufgaben auf der Seite unterscheidet. */
function makeTask(level: Level, others: DrawTask[]): DrawTask {
  let candidate = rawTask(level)
  for (let i = 0; i < 60 && others.some((o) => Math.abs(o.m - candidate.m) < 1e-9); i++) {
    candidate = rawTask(level)
  }
  return { id: nextId++, ...candidate }
}

function makeTasks(level: Level): DrawTask[] {
  const tasks: DrawTask[] = []
  for (let i = 0; i < TOTAL_TASKS; i++) tasks.push(makeTask(level, tasks))
  return tasks
}

// ---------- Eine Aufgabe ----------

interface CardProps {
  number: number
  task: DrawTask
  level: Level
  onNewTask: () => void
  onSolvedChange: (solved: boolean) => void
}

function DrawCard({ number, task, level, onNewTask, onSolvedChange }: CardProps) {
  // Keine automatische Prüfung möglich (gezeichnet wird im Heft) -> Selbsteinschätzung nach der Lösungskontrolle.
  const tracking = useTaskTracking(`Graph zeichnen (${LEVELS.find((l) => l.id === level)?.label})`)
  const [showTipps, setShowTipps] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [selfCheck, setSelfCheck] = useState<'correct' | 'wrong' | null>(null)
  const { m, t } = task
  const decimal = level === 'easy'
  const equationLatex = generateEquationLatex(m, t, decimal)
  const tipps = buildTipps(m, t, decimal)

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}</h2>
      <p className="text-slate-700">Zeichne den Graphen der folgenden Funktion in ein Koordinatensystem.</p>
      <div className="text-2xl font-bold text-slate-800 my-4">
        <InlineMath math={equationLatex} />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={onNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button
          onClick={() => {
            tracking.onHintShown()
            setShowTipps(true)
          }}
          className={btnSecondary}
        >
          Tipps
        </button>
        <button onClick={() => setShowSolution(true)} className={btnPrimary}>Lösungskontrolle anzeigen</button>
      </div>

      {showSolution && (
        <div className="mt-6 bk-taskbox">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-800">Lösungsgraph</h3>
            <button onClick={() => setShowSolution(false)} className="text-slate-500 hover:text-slate-800 text-xl" aria-label="Schließen">✕</button>
          </div>
          <ResponsiveGeoGebraGraph m={m} t={t} />
          {selfCheck === 'correct' ? (
            <p className="font-bold text-green-600">Super, dein Graph stimmt!</p>
          ) : (
            <>
              <p className="text-slate-700 mb-3">Vergleiche mit deiner Zeichnung: Stimmt dein Graph?</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  className={btnPrimary}
                  onClick={() => {
                    tracking.onCheck(true)
                    setSelfCheck('correct')
                    onSolvedChange(true)
                  }}
                >
                  Mein Graph stimmt
                </button>
                <button
                  className={btnSecondary}
                  onClick={() => {
                    tracking.onCheck(false)
                    setSelfCheck('wrong')
                  }}
                >
                  Mein Graph stimmt nicht
                </button>
              </div>
              {selfCheck === 'wrong' && (
                <p className="text-red-600 font-semibold mt-3">Schau dir die Tipps an, korrigiere deine Zeichnung und vergleiche noch einmal.</p>
              )}
            </>
          )}
        </div>
      )}

      {showTipps && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-blue-600">Tipps zum Zeichnen von Funktionsgraphen</h3>
              <button onClick={() => setShowTipps(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">✕</button>
            </div>

            <div className="p-6 space-y-6 text-left">
              <p className="text-gray-700">
                Diese Tipps passen zu deiner aktuellen Aufgabe: <InlineMath math={equationLatex} />
              </p>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">1. Wertetabelle erstellen</h4>
                <p className="text-gray-700 mb-3">
                  Wähle einige x-Werte aus und schreibe sie in die erste Spalte. Setze dann jeden x-Wert für{' '}
                  <InlineMath math="x" /> in die Funktionsgleichung ein und rechne aus. Das Ergebnis ist der passende
                  y-Wert. Jede Zeile der Tabelle ergibt einen Punkt <InlineMath math="(x \mid y)" />.
                </p>
                {tipps.denominator > 1 && (
                  <p className="text-gray-700 mb-3">
                    <strong>Tipp:</strong>{' '}
                    {decimal
                      ? <>Vor dem <InlineMath math="x" /> steht eine Zahl mit Nachkommastelle. Wähle deshalb gerade x-Werte (z. B. −2, 0, 2) – dann kommen beim Rechnen glatte Zahlen heraus.</>
                      : <>Vor dem <InlineMath math="x" /> steht ein Bruch mit dem Nenner {tipps.denominator}. Wähle deshalb x-Werte, die durch {tipps.denominator} teilbar sind – dann kürzt sich der Bruch weg und das Rechnen wird leichter.</>}
                  </p>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm text-gray-800 not-prose">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-300 px-3 py-2 text-center">x</th>
                        <th className="border border-blue-300 px-3 py-2 text-left">x einsetzen und ausrechnen</th>
                        <th className="border border-blue-300 px-3 py-2 text-center">y</th>
                        <th className="border border-blue-300 px-3 py-2 text-center">Punkt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tipps.rows.map((row) => (
                        <tr key={row.x} className="odd:bg-white even:bg-blue-50">
                          <td className="border border-blue-200 px-3 py-2 text-center"><InlineMath math={row.xLatex} /></td>
                          <td className="border border-blue-200 px-3 py-2"><InlineMath math={row.calculation} /></td>
                          <td className="border border-blue-200 px-3 py-2 text-center font-semibold"><InlineMath math={row.yLatex} /></td>
                          <td className="border border-blue-200 px-3 py-2 text-center"><InlineMath math={row.point} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Achte beim Einsetzen von negativen Zahlen auf die Klammern und auf die Vorzeichenregeln: Minus mal Minus ergibt Plus.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">2. Punkte ins Koordinatensystem eintragen</h4>
                <p className="text-gray-700 mb-3">
                  Trage die Punkte aus der letzten Spalte genau ins Koordinatensystem ein. Gehe beim x-Wert nach rechts
                  (positiv) oder links (negativ) und beim y-Wert nach oben (positiv) oder unten (negativ). Markiere jeden
                  Punkt als kleines Kreuz.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">3. Kontrolle mit der Steigung</h4>
                <p className="text-gray-700 mb-3">
                  Die Zahl vor dem <InlineMath math="x" /> ist die Steigung <InlineMath math={`m = ${tipps.mLatex}`} />. {tipps.slopeText}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">4. Gerade zeichnen</h4>
                <p className="text-gray-700 mb-3">
                  Verbinde die Punkte mit einem Lineal zu einer geraden Linie. Verlängere die Linie über die markierten Punkte
                  hinaus bis zum Rand des Koordinatensystems.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4">
                <h4 className="font-bold text-green-700 mb-2">💡 Profi-Tipp:</h4>
                <p className="text-gray-700">
                  Für eine Gerade reichen eigentlich zwei Punkte. Mit einem dritten Punkt kannst du aber prüfen, ob du dich
                  verrechnet hast: Liegen alle Punkte auf einer Linie, hast du richtig gerechnet!
                </p>
              </div>
            </div>

            <div className="bg-gray-100 border-t border-gray-200 p-4 flex justify-end">
              <button onClick={() => setShowTipps(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors">
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Seite ----------

export default function Zeichnen() {
  const navigate = useNavigate()
  const [level, setLevel] = useState<Level>('easy')
  const [tasks, setTasks] = useState<DrawTask[]>(() => makeTasks('easy'))
  const [solved, setSolved] = useState<Record<number, boolean>>({})
  const [finished, setFinished] = useState(false)
  const completionRef = useRef<HTMLDivElement>(null)

  const solvedCount = tasks.filter((t) => solved[t.id]).length
  const allSolved = solvedCount === TOTAL_TASKS

  const startRound = (nextLevel: Level) => {
    setLevel(nextLevel)
    setTasks(makeTasks(nextLevel))
    setSolved({})
    setFinished(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const replaceTask = (index: number) =>
    setTasks((current) => current.map((task, i) => (i === index ? makeTask(level, current.filter((_, j) => j !== index)) : task)))

  // Scrollt zur Abschlussmeldung, sobald alle Aufgaben erledigt sind
  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved])

  return (
    <TaskShell title="Lineare Funktionen zeichnen" width="narrow">
        <div className="flex flex-col gap-6">
        <div>
          <p className="text-center text-slate-600">
            Zeichne die Graphen in dein Heft. Ein guter Zeichenbereich für die x-Achse ist von −5 bis +5; die Länge der y-Achse legst du selbst fest, häufig reicht ebenfalls −5 bis +5.
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {LEVELS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => startRound(id)}
              className={`px-4 py-1.5 rounded font-semibold border transition-colors ${
                level === id ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tasks.map((task, i) => (
          <DrawCard
            key={task.id}
            number={i + 1}
            task={task}
            level={level}
            onNewTask={() => replaceTask(i)}
            onSolvedChange={(value) => setSolved((s) => ({ ...s, [task.id]: value }))}
          />
        ))}

        <div className="flex justify-center">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">Geschafft: {solvedCount} / {TOTAL_TASKS}</div>
        </div>

        {allSolved && (
          <div ref={completionRef} className="bg-green-50 border-2 border-green-400 rounded-xl p-6 text-center">
            {finished ? (
              <>
                <p className="text-green-800 font-semibold mb-4">Alles klar – bis zum nächsten Mal!</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => startRound(level)} className={btnPrimary}>Doch noch neue Aufgaben</button>
                  <button onClick={() => navigate('/lineare_funktionen')} className={btnSecondary}>Zur Übersicht</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-green-800 text-lg font-semibold mb-1">Super, toll gemacht!</p>
                <p className="text-green-800 mb-4">Alle {TOTAL_TASKS} Graphen stimmen.</p>
                <p className="text-slate-700 mb-4">Möchtest du neue Aufgaben üben oder hörst du hier auf?</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => startRound(level)} className={btnPrimary}>Neue Aufgaben</button>
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

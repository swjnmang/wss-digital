import { useEffect, useRef, useState } from 'react'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import TaskShell from '../../components/layout/TaskShell'
import PunktePlot from '../../components/PunktePlot'

interface ProportionalContext {
  id: string
  title: string
  intro: (k: number) => string
  xLabel: string
  xUnit: string
  yLabel: string
  yUnit: string
  kValues: number[]
  xValues: number[]
}

function formatDe(n: number): string {
  return n.toString().replace('.', ',')
}

const CONTEXTS: ProportionalContext[] = [
  {
    id: 'tanken',
    title: 'Tanken',
    intro: (k) => `An einer Tankstelle kostet 1 Liter Super-Benzin ${formatDe(k)} €. Wie viel kosten unterschiedliche Tankmengen?`,
    xLabel: 'Menge',
    xUnit: 'Liter',
    yLabel: 'Preis',
    yUnit: '€',
    kValues: [1.5, 1.6, 1.7, 1.75, 1.8, 1.9],
    xValues: [1, 2, 5, 10],
  },
  {
    id: 'ferienjob',
    title: 'Ferienjob',
    intro: (k) => `Bei deinem Ferienjob verdienst du ${formatDe(k)} € pro Stunde. Wie viel verdienst du bei unterschiedlicher Arbeitszeit?`,
    xLabel: 'Arbeitszeit',
    xUnit: 'Stunden',
    yLabel: 'Lohn',
    yUnit: '€',
    kValues: [8, 9, 10, 11, 12],
    xValues: [1, 2, 4, 8],
  },
  {
    id: 'backrezept',
    title: 'Backrezept',
    intro: (k) => `Für einen Kuchen benötigst du pro Portion ${formatDe(k)} g Mehl. Wie viel Mehl brauchst du für unterschiedlich viele Portionen?`,
    xLabel: 'Portionen',
    xUnit: '',
    yLabel: 'Mehl',
    yUnit: 'g',
    kValues: [40, 50, 60, 75],
    xValues: [2, 4, 6, 10],
  },
  {
    id: 'kopierkosten',
    title: 'Kopierkosten',
    intro: (k) => `Eine Kopie im Copyshop kostet ${formatDe(k)} Cent. Wie viel kosten unterschiedliche Anzahlen von Kopien?`,
    xLabel: 'Anzahl Kopien',
    xUnit: '',
    yLabel: 'Kosten',
    yUnit: 'Cent',
    kValues: [5, 8, 10, 12],
    xValues: [5, 10, 20, 50],
  },
  {
    id: 'fahrradtour',
    title: 'Fahrradtour',
    intro: (k) => `Du fährst mit deinem Fahrrad mit einer konstanten Geschwindigkeit von ${formatDe(k)} km/h. Welche Strecke legst du in unterschiedlichen Zeiten zurück?`,
    xLabel: 'Zeit',
    xUnit: 'h',
    yLabel: 'Strecke',
    yUnit: 'km',
    kValues: [10, 12, 15, 18, 20],
    xValues: [1, 2, 3, 5],
  },
]

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface Round {
  context: ProportionalContext
  k: number
  targets: { x: number; y: number }[]
}

function generateRound(prevContextId?: string): Round {
  let context = randomChoice(CONTEXTS)
  if (CONTEXTS.length > 1) {
    let guard = 0
    while (context.id === prevContextId && guard < 10) {
      context = randomChoice(CONTEXTS)
      guard++
    }
  }
  const k = randomChoice(context.kValues)
  const targets = context.xValues.map((x) => ({ x, y: Math.round(k * x * 100) / 100 }))
  return { context, k, targets }
}

export default function Proportional() {
  const tracking = useTaskTracking('Proportionale Zusammenhänge')
  const [score, setScore] = useState(0)
  const [round, setRound] = useState<Round>(() => generateRound())
  const [yInputs, setYInputs] = useState<string[]>(() => round.targets.map(() => ''))
  const [tableChecked, setTableChecked] = useState<boolean[] | null>(null)
  const [tableSolved, setTableSolved] = useState(false)
  const [tableScored, setTableScored] = useState(false)

  const [achievedX, setAchievedX] = useState<number[]>([])
  const [wrongClick, setWrongClick] = useState<{ x: number; y: number } | null>(null)
  const [plotScored, setPlotScored] = useState(false)
  const [plotFeedback, setPlotFeedback] = useState<string | null>(null)
  const wrongTimer = useRef<number | undefined>(undefined)

  const plotDone = achievedX.length === round.targets.length
  const xMax = Math.max(...round.context.xValues) * 1.1
  const yMax = Math.max(...round.targets.map((t) => t.y)) * 1.1

  useEffect(() => () => window.clearTimeout(wrongTimer.current), [])

  const handlePick = (hit: { x: number; y: number } | null, click: { x: number; y: number }) => {
    if (plotDone) return
    if (hit) {
      setPlotFeedback(null)
      setAchievedX((a) => (a.includes(hit.x) ? a : [...a, hit.x]))
      return
    }
    setWrongClick(click)
    setPlotFeedback('Das passt zu keinem Wertepaar aus deiner Tabelle. Versuch es noch einmal!')
    window.clearTimeout(wrongTimer.current)
    wrongTimer.current = window.setTimeout(() => setWrongClick(null), 900)
  }

  const resetPlot = () => {
    setAchievedX([])
    setWrongClick(null)
    setPlotFeedback(null)
  }

  const checkTable = () => {
    const results = round.targets.map((t, i) => {
      const raw = (yInputs[i] || '').replace(',', '.').replace(/[−–—‐]/g, '-').trim()
      const val = parseFloat(raw)
      if (Number.isNaN(val)) return false
      return Math.abs(val - t.y) <= 0.02
    })
    setTableChecked(results)
    const allCorrect = results.every(Boolean)
    // Bewertet wird die Wertetabelle; das anschließende Einzeichnen ist freiwillige Zusatzübung
    tracking.onCheck(allCorrect)
    setTableSolved(allCorrect)
    if (allCorrect && !tableScored) {
      setScore((s) => s + 1)
      setTableScored(true)
    }
  }

  const newTask = () => {
    tracking.onTaskStart()
    const nextRound = generateRound(round.context.id)
    setRound(nextRound)
    setYInputs(nextRound.targets.map(() => ''))
    setTableChecked(null)
    setTableSolved(false)
    setTableScored(false)
    setAchievedX([])
    setWrongClick(null)
    setPlotScored(false)
    setPlotFeedback(null)
  }

  useEffect(() => {
    if (plotDone && !plotScored) {
      setScore((s) => s + 1)
      setPlotScored(true)
    }
  }, [plotDone, plotScored])

  const ctx = round.context

  return (
    <TaskShell title="Proportionale Zusammenhänge" width="wide">
        <div className="">
        <p className="text-center text-slate-600 mb-6">Ein Einstieg ins Thema lineare Funktionen anhand von Alltagsbeispielen.</p>

        <div className="bk-panel mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-2">{ctx.title}</h2>
          <p className="text-slate-700 mb-6">{ctx.intro(round.k)}</p>

          <div className="overflow-x-auto mb-4">
            <table className="mx-auto border-collapse">
              <tbody>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 px-4 py-2 text-left whitespace-nowrap">
                    {ctx.xLabel}{ctx.xUnit ? ` (${ctx.xUnit})` : ''}
                  </th>
                  {round.targets.map((t, i) => (
                    <td key={`x-${i}`} className="border border-slate-300 px-4 py-2 text-center font-medium">{formatDe(t.x)}</td>
                  ))}
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 px-4 py-2 text-left whitespace-nowrap">
                    {ctx.yLabel}{ctx.yUnit ? ` (${ctx.yUnit})` : ''}
                  </th>
                  {round.targets.map((t, i) => (
                    <td key={`y-${i}`} className="border border-slate-300 px-2 py-2 text-center">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={yInputs[i] || ''}
                        onChange={(e) => {
                          const next = [...yInputs]
                          next[i] = e.target.value
                          setYInputs(next)
                          setTableChecked(null)
                        }}
                        className={`w-20 text-center border rounded px-1 py-1 ${
                          tableChecked ? (tableChecked[i] ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-slate-300'
                        }`}
                        placeholder="?"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center">
            <button onClick={checkTable} className="bk-btn bk-btn-primary">
              Prüfen
            </button>
          </div>

          {tableChecked && (
            <p className={`text-center font-bold mt-3 ${tableChecked.every(Boolean) ? 'text-green-600' : 'text-red-600'}`}>
              {tableChecked.every(Boolean) ? 'Richtig! Du kannst jetzt die Punkte einzeichnen.' : 'Noch nicht alles richtig. Versuch es erneut!'}
            </p>
          )}
        </div>

        {tableSolved && (
          <div className="bk-panel mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Punkte einzeichnen</h2>
            <p className="text-sm text-slate-600 mb-4">
              Klicke (oder tippe) im Koordinatensystem auf die Punkte aus deiner Wertetabelle. Richtige Punkte werden grün markiert; sobald alle Punkte gesetzt sind, zeichnet die App automatisch die passende Gerade ein. Tippe auf die Stelle, an der der Punkt liegt – er rastet ein, wenn du ihn ungefähr triffst.
            </p>

            <div className="mb-4 flex justify-center border rounded-lg overflow-hidden shadow-inner bg-white">
              <PunktePlot
                xMax={xMax}
                yMax={yMax}
                xLabel={ctx.xLabel}
                yLabel={ctx.yLabel}
                points={round.targets.filter((t) => achievedX.includes(t.x))}
                wrong={wrongClick}
                k={plotDone ? round.k : null}
                targets={round.targets}
                disabled={plotDone}
                onPick={handlePick}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
                {achievedX.length} / {round.targets.length} Punkte gesetzt
              </div>
              <button onClick={resetPlot} className="bk-btn">
                Punkte zurücksetzen
              </button>
            </div>

            {plotFeedback && (
              <p className="text-center font-bold text-red-600 mt-3">{plotFeedback}</p>
            )}

            {plotDone && (
              <p className="text-center font-bold text-green-600 mt-3">
                Super! Du hast den proportionalen Zusammenhang {ctx.yLabel} = {formatDe(round.k)} · {ctx.xLabel} als Gerade eingezeichnet.
              </p>
            )}
          </div>
        )}

        <div className="bk-panel">
          <div className="flex flex-wrap justify-center gap-4 items-center">
            <button onClick={newTask} className="bk-btn bk-btn-primary">
              Neue Aufgabe
            </button>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
              Punkte: {score}
            </div>
          </div>
        </div>
      </div>
    </TaskShell>
  )
}

import React, { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    GGBApplet: any
  }
}

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

function injectApplet(containerId: string, width: number, height: number, onLoad: (api: any) => void) {
  const params: any = {
    appName: 'classic',
    width,
    height,
    showToolBar: false,
    showAlgebraInput: false,
    showMenuBar: false,
    perspective: 'G',
    useBrowserForJS: true,
    enableShiftDragZoom: false,
    showResetIcon: false,
    appletOnLoad: onLoad,
  }
  try {
    const applet = new window.GGBApplet(params, true)
    applet.inject(containerId)
  } catch (e) {
    console.error(`GeoGebra Error (${containerId}):`, e)
  }
}

export default function Proportional() {
  const [score, setScore] = useState(0)
  const [round, setRound] = useState<Round>(() => generateRound())
  const [yInputs, setYInputs] = useState<string[]>(() => round.targets.map(() => ''))
  const [tableChecked, setTableChecked] = useState<boolean[] | null>(null)
  const [tableSolved, setTableSolved] = useState(false)
  const [tableScored, setTableScored] = useState(false)

  const [achievedX, setAchievedX] = useState<Set<number>>(new Set())
  const [plotDone, setPlotDone] = useState(false)
  const [plotScored, setPlotScored] = useState(false)
  const [plotFeedback, setPlotFeedback] = useState<string | null>(null)

  const plotApiRef = useRef<any>(null)
  const achievedRef = useRef<Set<number>>(new Set())
  const plotDoneRef = useRef(false)
  const roundRef = useRef(round)
  roundRef.current = round

  // GeoGebra-Skript einmalig laden
  useEffect(() => {
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]')
    if (!existing) {
      const script = document.createElement('script')
      script.src = 'https://www.geogebra.org/apps/deployggb.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // Zeichenfläche erst injizieren, wenn die Wertetabelle korrekt gelöst wurde
  useEffect(() => {
    if (!tableSolved) return

    achievedRef.current = new Set()
    plotDoneRef.current = false
    setAchievedX(new Set())
    setPlotDone(false)
    setPlotFeedback(null)

    let cancelled = false
    const tryInject = () => {
      if (cancelled) return
      if (!window.GGBApplet) {
        setTimeout(tryInject, 150)
        return
      }
      injectApplet('ggb-proportional-plot', 600, 400, (api: any) => {
        plotApiRef.current = api
        setupPlot(api)
      })
    }
    tryInject()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSolved, round])

  const setupPlot = (api: any) => {
    const ctx = roundRef.current.context
    const targets = roundRef.current.targets
    const xMax = Math.max(...ctx.xValues) * 1.25
    const yMax = Math.max(...targets.map((t) => t.y)) * 1.25

    try {
      api.reset()
      api.setCoordSystem(-xMax * 0.08, xMax, -yMax * 0.08, yMax)
      api.setMode(1) // Punkt-Werkzeug: Klicks erzeugen einen Punkt
      api.registerAddListener((objName: string) => {
        handlePointAdded(api, objName, xMax, yMax)
      })
    } catch (e) {
      console.error('GeoGebra Setup-Error:', e)
    }
  }

  const handlePointAdded = (api: any, objName: string, xMax: number, yMax: number) => {
    if (plotDoneRef.current) return

    let rawX = 0
    let rawY = 0
    try {
      rawX = api.getXcoord(objName)
      rawY = api.getYcoord(objName)
    } catch (e) {
      return
    }

    const targets = roundRef.current.targets
    let nearest: { x: number; y: number } | null = null
    let nearestDist = Infinity
    for (const t of targets) {
      const dx = (rawX - t.x) / xMax
      const dy = (rawY - t.y) / yMax
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = t
      }
    }

    const captureRadius = 0.08

    if (nearest && nearestDist <= captureRadius) {
      if (achievedRef.current.has(nearest.x)) {
        try { api.deleteObject(objName) } catch (e) { /* ignore */ }
        return
      }
      try {
        api.setCoords(objName, nearest.x, nearest.y)
        api.setColor(objName, 22, 163, 74)
      } catch (e) { /* ignore */ }

      achievedRef.current.add(nearest.x)
      setAchievedX(new Set(achievedRef.current))
      setPlotFeedback(null)

      if (achievedRef.current.size === targets.length) {
        plotDoneRef.current = true
        setPlotDone(true)
        try {
          const k = roundRef.current.k
          api.evalCommand(`g(x) = ${k}*x`)
          api.setColor('g', 37, 99, 235)
          api.setMode(0)
        } catch (e) { /* ignore */ }
      }
    } else {
      try { api.setColor(objName, 220, 38, 38) } catch (e) { /* ignore */ }
      setPlotFeedback('Das passt zu keinem Wertepaar aus deiner Tabelle. Versuch es noch einmal!')
      setTimeout(() => {
        try { api.deleteObject(objName) } catch (e) { /* ignore */ }
      }, 900)
    }
  }

  const resetPlot = () => {
    const api = plotApiRef.current
    if (!api) return
    achievedRef.current = new Set()
    plotDoneRef.current = false
    setAchievedX(new Set())
    setPlotDone(false)
    setPlotFeedback(null)
    setupPlot(api)
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
    setTableSolved(allCorrect)
    if (allCorrect && !tableScored) {
      setScore((s) => s + 1)
      setTableScored(true)
    }
  }

  const newTask = () => {
    const nextRound = generateRound(round.context.id)
    setRound(nextRound)
    setYInputs(nextRound.targets.map(() => ''))
    setTableChecked(null)
    setTableSolved(false)
    setTableScored(false)
    setAchievedX(new Set())
    setPlotDone(false)
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-8 max-w-4xl w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Proportionale Zusammenhänge</h1>
        <p className="text-center text-slate-600 mb-6">Ein Einstieg ins Thema lineare Funktionen anhand von Alltagsbeispielen.</p>

        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 mb-8">
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
            <button onClick={checkTable} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">
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
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Punkte einzeichnen</h2>
            <p className="text-sm text-slate-600 mb-4">
              Klicke im Koordinatensystem auf die Punkte aus deiner Wertetabelle. Richtige Punkte werden grün markiert; sobald alle Punkte gesetzt sind, zeichnet die App automatisch die passende Gerade ein.
            </p>

            <div className="mb-4 border rounded-lg overflow-hidden shadow-inner bg-white">
              <div id="ggb-proportional-plot" style={{ width: '100%', height: '400px' }}></div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
                {achievedX.size} / {round.targets.length} Punkte gesetzt
              </div>
              <button onClick={resetPlot} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">
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

        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex flex-wrap justify-center gap-4 items-center">
            <button onClick={newTask} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">
              Neue Aufgabe
            </button>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
              Punkte: {score}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

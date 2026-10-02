import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GeoGebraGraph from '../../components/GeoGebraGraph'
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'

const TEXT_TASKS = 3
const GRAPH_TASKS = 3
const TOTAL_TASKS = TEXT_TASKS + GRAPH_TASKS

const VIDEO_URL = 'https://youtu.be/IwNoiR-yfJ0?si=Hklidv10rx1W6YuJ'

// MathJax-Komponente
const MathDisplay = ({ latex }: { latex: string }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && (window as any).MathJax) {
      (window as any).MathJax.contentDocument = document
      ;(window as any).MathJax.typesetPromise?.([ref.current]).catch((err: any) => console.log(err))
    }
  }, [latex])

  return <div ref={ref} className="text-center text-base my-1 leading-relaxed overflow-x-auto">{latex}</div>
}

function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Erlaubte Steigungswerte für Graph-Aufgaben
const allowedSlopes = [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3] as const

function getRandomSlope() {
  return allowedSlopes[Math.floor(Math.random() * allowedSlopes.length)]
}

const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors'
const btnSecondary = 'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors'
const inputCls = 'w-40 text-center border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
const coordCls = 'w-20 text-center border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500'
const panel = 'text-center bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200'

const feedbackEl = (text: string) =>
  text ? (
    <p className={`text-center font-bold mt-3 ${text.includes('Richtig') ? 'text-green-600' : 'text-red-600'}`}>{text}</p>
  ) : null

function solutionEl(
  pa: { x: number; y: number },
  pb: { x: number; y: number },
  dy: number,
  dx: number,
  slope: number,
) {
  const value = Math.round(slope * 100) / 100
  return (
    <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
      <h3 className="text-base font-bold text-slate-800 text-center mb-2">Lösungsweg</h3>
      <MathDisplay latex={`$$P_1(${pa.x}|${pa.y}) \\quad P_2(${pb.x}|${pb.y})$$`} />
      <MathDisplay latex={`$$m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${pb.y} - (${pa.y})}{${pb.x} - (${pa.x})} = \\dfrac{${dy}}{${dx}} = ${value}$$`} />
      <div className="font-bold text-slate-800 mt-2">
        <MathDisplay latex={`$$m = ${value}$$`} />
      </div>
    </div>
  )
}

interface CardProps {
  number: number
  /** Meldet, ob die Aufgabe aktuell richtig gelöst ist (false, wenn eine neue Aufgabe geladen wird). */
  onSolvedChange: (solved: boolean) => void
  /** Meldet jedes Prüfergebnis für die Serie "Richtig in Folge". */
  onResult: (correct: boolean) => void
  onHelp: () => void
}

function newTextPoints() {
  let x1, x2
  do {
    x1 = randomInt(10, -10)
    x2 = randomInt(10, -10)
  } while (x1 === x2)
  return { p1: { x: x1, y: randomInt(10, -10) }, p2: { x: x2, y: randomInt(10, -10) } }
}

// ---------- Textaufgabe: Steigung aus zwei Punkten ----------

function TextTaskCard({ number, onSolvedChange, onResult, onHelp }: CardProps) {
  const tracking = useTaskTracking('Steigung aus zwei Punkten')
  const [{ p1, p2 }, setPoints] = useState(newTextPoints)
  const [slopeSign, setSlopeSign] = useState<'positive' | 'negative' | ''>('')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const correctSlope = (p2.y - p1.y) / (p2.x - p1.x)

  function generateNewTask() {
    tracking.onTaskStart()
    onSolvedChange(false)
    setFeedback('')
    setInput('')
    setSlopeSign('')
    setShowSolution(false)
    setPoints(newTextPoints())
  }

  function checkSolution() {
    if (slopeSign === '') {
      setFeedback('Bitte wähle zuerst aus, ob die Steigung positiv oder negativ ist.')
      return
    }
    if (input.trim() === '') {
      setFeedback('Bitte gib die Steigung ein.')
      return
    }
    const user = parseFloat(input.replace(',', '.').replace(/[−–—‐]/g, '-'))
    if (isNaN(user)) {
      setFeedback('Ungültige Zahl')
      return
    }

    const expectedSign = correctSlope >= 0 ? 'positive' : 'negative'
    if (slopeSign !== expectedSign) {
      tracking.onCheck(false)
      setFeedback(
        expectedSign === 'positive'
          ? 'Das Vorzeichen ist falsch! Die Steigung ist positiv.'
          : 'Das Vorzeichen ist falsch! Die Steigung ist negativ.',
      )
      onResult(false)
      return
    }

    if (Math.abs(user - correctSlope) < 0.01) {
      tracking.onCheck(true)
      setFeedback('Richtig! Super gemacht!')
      setShowSolution(false)
      onResult(true)
      onSolvedChange(true)
    } else {
      tracking.onCheck(false)
      setFeedback('Das Vorzeichen stimmt, aber der Wert ist nicht ganz richtig. Überprüfe deine Rechnung!')
      setShowSolution(false)
      onResult(false)
    }
  }

  function onShowAnswer() {
    setShowSolution(true)
    onHelp()
    tracking.onHintShown()
  }

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}: Steigung aus zwei Punkten</h2>
      <p className="text-slate-700 mb-1">
        Berechne die Steigung m der Geraden durch die beiden Punkte. Runde auf zwei Nachkommastellen.
      </p>
      <p className="text-center text-lg font-semibold text-slate-800 my-4">
        P<sub>1</sub>({p1.x}|{p1.y}) und P<sub>2</sub>({p2.x}|{p2.y})
      </p>

      <fieldset className="mb-4">
        <legend className="text-sm font-semibold text-slate-700 mb-2 mx-auto">Schritt 1: Ist die Steigung positiv oder negativ?</legend>
        <div className="flex flex-wrap justify-center gap-3">
          {([['positive', 'Positiv (steigt)'], ['negative', 'Negativ (fällt)']] as const).map(([value, label]) => (
            <label
              key={value}
              className={`flex items-center gap-2 cursor-pointer rounded border px-3 py-2 text-sm ${
                slopeSign === value ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name={`slope-sign-${number}`}
                value={value}
                checked={slopeSign === value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlopeSign(e.target.value as 'positive' | 'negative')}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {slopeSign && (
        <div className="mb-2">
          <p className="text-sm font-semibold text-slate-700 mb-2">Schritt 2: Gib den Wert ein</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-slate-800">m =</span>
            <input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              className={inputCls}
              placeholder="Deine Lösung"
            />
          </div>
        </div>
      )}

      {feedbackEl(feedback)}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={checkSolution} className={btnPrimary}>Lösung prüfen</button>
        <button onClick={generateNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button onClick={onShowAnswer} className={btnSecondary}>Lösung anzeigen</button>
        <button onClick={() => window.open(VIDEO_URL, '_blank')} className={btnSecondary}>Erklärvideo</button>
      </div>

      {showSolution && solutionEl(p1, p2, p2.y - p1.y, p2.x - p1.x, correctSlope)}
    </div>
  )
}

// ---------- Graphaufgabe: Steigung aus dem Graphen ----------

const GRAPH_HINT = 'Gib die Koordinaten von zwei Punkten ein, die auf der Geraden liegen.'

function newGraphLine() {
  return { m: getRandomSlope(), t: randomInt(4, -4) }
}

function GraphTaskCard({ number, onSolvedChange, onResult, onHelp }: CardProps) {
  const tracking = useTaskTracking('Steigung aus Graph')
  const [{ m: graphM, t: graphT }, setLine] = useState(newGraphLine)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [selectedPoints, setSelectedPoints] = useState<Array<{ x: number; y: number }>>([])
  const [selectionMode, setSelectionMode] = useState(true)
  const [instruction, setInstruction] = useState(GRAPH_HINT)
  const [point1Input, setPoint1Input] = useState({ x: '', y: '' })
  const [point2Input, setPoint2Input] = useState({ x: '', y: '' })

  // Graph-Größe folgt der verfügbaren Breite (in 40-px-Schritten, damit der Graph nicht bei jedem Pixel neu lädt)
  const boxRef = useRef<HTMLDivElement>(null)
  const [graphSize, setGraphSize] = useState(400)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth - 24
      setGraphSize(Math.max(240, Math.min(480, Math.floor(w / 40) * 40)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const correctSlope =
    selectedPoints.length === 2
      ? (selectedPoints[1].y - selectedPoints[0].y) / (selectedPoints[1].x - selectedPoints[0].x)
      : 0
  const deltaY = selectedPoints.length === 2 ? selectedPoints[1].y - selectedPoints[0].y : 0
  const deltaX = selectedPoints.length === 2 ? selectedPoints[1].x - selectedPoints[0].x : 0

  function generateNewTask() {
    tracking.onTaskStart()
    onSolvedChange(false)
    setFeedback('')
    setInput('')
    setShowSolution(false)
    setSelectedPoints([])
    setSelectionMode(true)
    setInstruction(GRAPH_HINT)
    setPoint1Input({ x: '', y: '' })
    setPoint2Input({ x: '', y: '' })
    setLine(newGraphLine())
  }

  function addPoint(index: 1 | 2) {
    const raw = index === 1 ? point1Input : point2Input
    if (!raw.x || !raw.y) {
      setFeedback(`Bitte gib beide Koordinaten für Punkt ${index} ein.`)
      return
    }
    const x = parseFlexibleNumber(raw.x)
    const y = parseFlexibleNumber(raw.y)
    if (isNaN(x) || isNaN(y)) {
      setFeedback(`Ungültige Koordinaten für Punkt ${index}.`)
      return
    }

    const expectedY = graphM * x + graphT
    if (Math.abs(y - expectedY) > 0.15) {
      setFeedback(`Punkt ${index} liegt nicht auf der Geraden! Für x=${x} sollte y=${Math.round(expectedY * 100) / 100} sein.`)
      return
    }

    if (index === 1) {
      setSelectedPoints([{ x, y }])
      setInstruction(`Punkt 1 akzeptiert: (${x}|${y}) - Gib nun Punkt 2 ein.`)
    } else {
      if (selectedPoints[0].x === x && selectedPoints[0].y === y) {
        setFeedback('Punkt 2 muss unterschiedlich von Punkt 1 sein!')
        return
      }
      setSelectedPoints([...selectedPoints, { x, y }])
      setSelectionMode(false)
      setInstruction('Berechne jetzt die Steigung!')
    }
    setFeedback('')
  }

  function checkSolution() {
    if (selectedPoints.length !== 2) {
      setFeedback('Bitte wähle zuerst zwei Punkte im Graphen aus.')
      return
    }
    if (input.trim() === '') {
      setFeedback('Bitte gib die Steigung ein.')
      return
    }
    const user = parseFloat(input.replace(',', '.').replace(/[−–—‐]/g, '-'))
    if (isNaN(user)) {
      setFeedback('Ungültige Zahl')
      return
    }
    if (Math.abs(user - correctSlope) < 0.01) {
      tracking.onCheck(true)
      setFeedback('Richtig! Super gemacht!')
      setShowSolution(false)
      onResult(true)
      onSolvedChange(true)
    } else {
      tracking.onCheck(false)
      setFeedback('Leider nicht ganz richtig. Überprüfe deine Rechnung!')
      setShowSolution(false)
      onResult(false)
    }
  }

  function onShowAnswer() {
    setShowSolution(true)
    onHelp()
    // Lösungsweg wird nur sichtbar, wenn beide Punkte gewählt sind
    if (selectedPoints.length === 2) tracking.onHintShown()
  }

  const pointInput = selectedPoints.length === 0 ? point1Input : point2Input
  const setPointInput = selectedPoints.length === 0 ? setPoint1Input : setPoint2Input

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}: Steigung aus dem Graphen</h2>
      <p className="text-slate-700 mb-4">{instruction}</p>

      <div ref={boxRef} className="flex justify-center mb-4 w-full overflow-hidden">
        <div key={graphSize}>
          <GeoGebraGraph m={graphM} t={graphT} width={graphSize} height={graphSize} />
        </div>
      </div>

      {selectionMode && selectedPoints.length < 2 && (
        <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700 mb-2">Punkt {selectedPoints.length + 1}: (x | y)</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <input type="number" step="0.1" value={pointInput.x} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPointInput({ ...pointInput, x: e.target.value })} className={coordCls} placeholder="x" />
            <span className="text-slate-500">|</span>
            <input type="number" step="0.1" value={pointInput.y} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPointInput({ ...pointInput, y: e.target.value })} className={coordCls} placeholder="y" />
            <button onClick={() => addPoint(selectedPoints.length === 0 ? 1 : 2)} className={btnPrimary}>
              Punkt {selectedPoints.length + 1} annehmen
            </button>
          </div>
        </div>
      )}

      {selectedPoints.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4 text-sm font-semibold text-slate-700">
          {selectedPoints.map((point, idx) => (
            <span key={idx}>Punkt {idx + 1}: ({point.x}|{point.y})</span>
          ))}
          <button onClick={generateNewTask} className="text-blue-600 hover:underline font-semibold">
            Punkte neu eingeben
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <span className="font-semibold text-slate-800">m =</span>
        <input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          className={inputCls}
          placeholder="Deine Lösung"
        />
      </div>

      {feedbackEl(feedback)}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={checkSolution} className={btnPrimary}>Lösung prüfen</button>
        <button onClick={generateNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button onClick={onShowAnswer} className={btnSecondary}>Lösung anzeigen</button>
        <button onClick={() => window.open(VIDEO_URL, '_blank')} className={btnSecondary}>Erklärvideo</button>
      </div>

      {showSolution && selectedPoints.length === 2 &&
        solutionEl(selectedPoints[0], selectedPoints[1], deltaY, deltaX, correctSlope)}
    </div>
  )
}

// ---------- Seite: sechs Aufgaben auf einmal ----------

export default function SteigungBerechnen() {
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState<Record<number, boolean>>({})
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)

  const solvedCount = Object.values(solved).filter(Boolean).length
  const allSolved = solvedCount === TOTAL_TASKS

  useEffect(() => {
    // MathJax Script laden
    const script = document.createElement('script')
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6'
    script.async = true
    document.body.appendChild(script)

    const script2 = document.createElement('script')
    script2.id = 'MathJax-script'
    script2.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
    script2.async = true
    document.body.appendChild(script2)
  }, [])

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

  const cards = Array.from({ length: TOTAL_TASKS }, (_, i) => {
    const props: CardProps = {
      number: i + 1,
      onSolvedChange: (value) => setSolved((s) => ({ ...s, [i]: value })),
      onResult: (correct) => setStreak((s) => (correct ? s + 1 : 0)),
      onHelp: () => setStreak(0),
    }
    // Die Karten bleiben nach einem Neustart per key getrennt (frischer Zustand, eigenes Tracking)
    return (
      <React.Fragment key={`${round}-${i}`}>
        {i < TEXT_TASKS ? <TextTaskCard {...props} /> : <GraphTaskCard {...props} />}
      </React.Fragment>
    )
  })

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-8 max-w-3xl w-full flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Steigung berechnen</h1>
          <p className="text-center text-slate-600">Berechne die Steigung m einer Geraden aus zwei Punkten.</p>
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

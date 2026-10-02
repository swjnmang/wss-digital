import React, { useEffect, useState, useRef } from 'react'
import styles from './SteigungBerechnen.module.css'
import GeoGebraGraph from '../../components/GeoGebraGraph'
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'

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

// Formatiere Brüche mathematisch korrekt mit echtem Bruchstrich
function FractionDisplay({ numerator, denominator }: { numerator: number; denominator: number }) {
  if (denominator === 0) return <>undefined</>
  if (denominator === 1) return <>{numerator}</>
  
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator))
  const num = numerator / divisor
  const den = denominator / divisor
  
  // Negatives Vorzeichen nach oben
  const finalNum = den < 0 ? -num : num
  const finalDen = Math.abs(den)
  
  return (
    <span className={styles.fraction}>
      <span className={styles.numerator}>{finalNum}</span>
      <span className={styles.fractionLine}></span>
      <span className={styles.denominator}>{finalDen}</span>
    </span>
  )
}

export default function SteigungBerechnen() {
  // Text- und Graphaufgabe haben je eine eigene Aufgabe -> je ein Tracker
  const textTracking = useTaskTracking('Steigung aus zwei Punkten')
  const graphTracking = useTaskTracking('Steigung aus Graph')
  const [taskType, setTaskType] = useState<'text' | 'graph'>('text')
  const [p1, setP1] = useState({ x: 1, y: 3 })
  const [p2, setP2] = useState({ x: 4, y: 9 })
  const [correctSlope, setCorrectSlope] = useState<number>((9 - 3) / (4 - 1))
  const [slopeSign, setSlopeSign] = useState<'positive' | 'negative' | ''>('')  // Neue State für Vorab-Auswahl
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<string>('')
  const [streak, setStreak] = useState(0)
  const [showSolution, setShowSolution] = useState(false)

  // Graph-Aufgabe State
  const [graphM, setGraphM] = useState(2)
  const [graphT, setGraphT] = useState(0)
  const [graphInput, setGraphInput] = useState('')
  const [graphFeedback, setGraphFeedback] = useState('')
  const [graphShowSolution, setGraphShowSolution] = useState(false)
  const [selectedPoints, setSelectedPoints] = useState<Array<{x: number, y: number}>>([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [instruction, setInstruction] = useState('Gib die Koordinaten von zwei Punkten ein, die auf der Geraden liegen.')
  const [point1Input, setPoint1Input] = useState({ x: '', y: '' })
  const [point2Input, setPoint2Input] = useState({ x: '', y: '' })

  // Graph-Größe folgt der verfügbaren Breite (in 40-px-Schritten, damit der Graph nicht bei jedem Pixel neu lädt)
  const graphBoxRef = useRef<HTMLDivElement>(null)
  const [graphSize, setGraphSize] = useState(400)
  useEffect(() => {
    const el = graphBoxRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth - 24
      setGraphSize(Math.max(240, Math.min(480, Math.floor(w / 40) * 40)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [taskType])

  const graphCorrectSlope = selectedPoints.length === 2 
    ? (selectedPoints[1].y - selectedPoints[0].y) / (selectedPoints[1].x - selectedPoints[0].x)
    : 0

  useEffect(() => {
    setCorrectSlope((p2.y - p1.y) / (p2.x - p1.x))
  }, [p1, p2])

  function generateNewTask() {
    textTracking.onTaskStart()
    setFeedback('')
    setInput('')
    setSlopeSign('')  // Reset der Vorab-Auswahl
    setShowSolution(false)
    let x1, x2
    do {
      x1 = randomInt(10, -10)
      x2 = randomInt(10, -10)
    } while (x1 === x2)
    const y1 = randomInt(10, -10)
    const y2 = randomInt(10, -10)
    setP1({ x: x1, y: y1 })
    setP2({ x: x2, y: y2 })
  }

  function generateNewGraphTask() {
    graphTracking.onTaskStart()
    setGraphFeedback('')
    setGraphInput('')
    setGraphShowSolution(false)
    setSelectedPoints([])
    setSelectionMode(true)
    setInstruction('Gib die Koordinaten von zwei Punkten ein, die auf der Geraden liegen.')
    setPoint1Input({ x: '', y: '' })
    setPoint2Input({ x: '', y: '' })
    
    // Generiere zufällige Steigung und Intercept
    const m = getRandomSlope()
    const t = randomInt(4, -4)
    
    setGraphM(m)
    setGraphT(t)
  }

  function addGraphPoint1() {
    if (!point1Input.x || !point1Input.y) {
      setGraphFeedback('Bitte gib beide Koordinaten für Punkt 1 ein.')
      return
    }
    const x = parseFlexibleNumber(point1Input.x)
    const y = parseFlexibleNumber(point1Input.y)
    
    if (isNaN(x) || isNaN(y)) {
      setGraphFeedback('Ungültige Koordinaten für Punkt 1.')
      return
    }
    
    // Überprüfe, ob der Punkt auf der Geraden liegt
    const expectedY = graphM * x + graphT
    const tolerance = 0.15
    
    if (Math.abs(y - expectedY) > tolerance) {
      setGraphFeedback(`Punkt 1 liegt nicht auf der Geraden! Für x=${x} sollte y=${Math.round(expectedY * 100) / 100} sein.`)
      return
    }
    
    setSelectedPoints([{ x, y }])
    setInstruction(`Punkt 1 akzeptiert: (${x}|${y}) - Gib nun Punkt 2 ein.`)
    setGraphFeedback('')
  }

  function addGraphPoint2() {
    if (!point2Input.x || !point2Input.y) {
      setGraphFeedback('Bitte gib beide Koordinaten für Punkt 2 ein.')
      return
    }
    const x = parseFlexibleNumber(point2Input.x)
    const y = parseFlexibleNumber(point2Input.y)
    
    if (isNaN(x) || isNaN(y)) {
      setGraphFeedback('Ungültige Koordinaten für Punkt 2.')
      return
    }
    
    // Überprüfe, ob der Punkt auf der Geraden liegt
    const expectedY = graphM * x + graphT
    const tolerance = 0.15
    
    if (Math.abs(y - expectedY) > tolerance) {
      setGraphFeedback(`Punkt 2 liegt nicht auf der Geraden! Für x=${x} sollte y=${Math.round(expectedY * 100) / 100} sein.`)
      return
    }
    
    // Überprüfe, dass die beiden Punkte nicht identisch sind
    if (selectedPoints[0].x === x && selectedPoints[0].y === y) {
      setGraphFeedback('Punkt 2 muss unterschiedlich von Punkt 1 sein!')
      return
    }
    
    setSelectedPoints([...selectedPoints, { x, y }])
    setSelectionMode(false)
    setInstruction('Berechne jetzt die Steigung!')
    setGraphFeedback('')
  }

  function checkSolution() {
    // Überprüfe zuerst, ob das Vorzeichen ausgewählt wurde
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

    // Überprüfe, ob das Vorzeichen korrekt ist
    const expectedSign = correctSlope >= 0 ? 'positive' : 'negative'
    if (slopeSign !== expectedSign) {
      textTracking.onCheck(false)
      setFeedback(
        expectedSign === 'positive'
          ? 'Das Vorzeichen ist falsch! Die Steigung ist positiv.'
          : 'Das Vorzeichen ist falsch! Die Steigung ist negativ.'
      )
      setStreak(0)
      return
    }

    // Überprüfe den Wert
    if (Math.abs(user - correctSlope) < 0.01) {
      textTracking.onCheck(true)
      setFeedback('Richtig! Super gemacht!')
      setStreak((s) => s + 1)
      setShowSolution(false)
    } else {
      textTracking.onCheck(false)
      setFeedback('Das Vorzeichen stimmt, aber der Wert ist nicht ganz richtig. Überprüfe deine Rechnung!')
      setStreak(0)
      setShowSolution(false)
    }
  }

  function checkGraphSolution() {
    if (selectedPoints.length !== 2) {
      setGraphFeedback('Bitte wähle zuerst zwei Punkte im Graphen aus.')
      return
    }
    if (graphInput.trim() === '') {
      setGraphFeedback('Bitte gib die Steigung ein.')
      return
    }
    const user = parseFloat(graphInput.replace(',', '.').replace(/[−–—‐]/g, '-'))
    if (isNaN(user)) {
      setGraphFeedback('Ungültige Zahl')
      return
    }
    if (Math.abs(user - graphCorrectSlope) < 0.01) {
      graphTracking.onCheck(true)
      setGraphFeedback('Richtig! Super gemacht!')
      setStreak((s) => s + 1)
      setGraphShowSolution(false)
    } else {
      graphTracking.onCheck(false)
      setGraphFeedback('Leider nicht ganz richtig. Überprüfe deine Rechnung!')
      setStreak(0)
      setGraphShowSolution(false)
    }
  }

  function onShowAnswer() {
    setShowSolution(true)
    setStreak(0)
    textTracking.onHintShown()
  }

  function onShowGraphAnswer() {
    setGraphShowSolution(true)
    setStreak(0)
    // Lösungsweg wird nur sichtbar, wenn beide Punkte gewählt sind
    if (selectedPoints.length === 2) graphTracking.onHintShown()
  }

  const deltaY = selectedPoints.length === 2 ? selectedPoints[1].y - selectedPoints[0].y : 0
  const deltaX = selectedPoints.length === 2 ? selectedPoints[1].x - selectedPoints[0].x : 0

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

  const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors'
  const btnSecondary = 'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors'
  const inputCls = 'w-40 text-center border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
  const coordCls = 'w-20 text-center border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500'
  const panel = 'text-center bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200'

  const openVideo = () => window.open('https://youtu.be/IwNoiR-yfJ0?si=Hklidv10rx1W6YuJ', '_blank')

  const feedbackEl = (text: string) =>
    text ? (
      <p className={`text-center font-bold mt-3 ${text.includes('Richtig') ? 'text-green-600' : 'text-red-600'}`}>{text}</p>
    ) : null

  const solutionEl = (
    pa: { x: number; y: number },
    pb: { x: number; y: number },
    dy: number,
    dx: number,
    slope: number,
  ) => (
    <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
      <h3 className="text-base font-bold text-slate-800 text-center mb-2">Lösungsweg</h3>
      <MathDisplay latex={`$$P_1(${pa.x}|${pa.y}) \\quad P_2(${pb.x}|${pb.y})$$`} />
      <MathDisplay latex={`$$m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${pb.y} - (${pa.y})}{${pb.x} - (${pa.x})} = \\dfrac{${dy}}{${dx}} = ${Math.round(slope * 100) / 100}$$`} />
      <div className="font-bold text-slate-800 mt-2">
        <MathDisplay latex={`$$m = ${Math.round(slope * 100) / 100}$$`} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-8 max-w-3xl w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Steigung berechnen</h1>
        <p className="text-center text-slate-600 mb-6">Berechne die Steigung m einer Geraden aus zwei Punkten.</p>

        <div className="flex justify-center gap-2 mb-6">
          {([['text', 'Textaufgabe'], ['graph', 'Graphaufgabe']] as const).map(([type, label]) => (
            <button
              key={type}
              onClick={() => {
                setTaskType(type)
                if (type === 'graph') generateNewGraphTask()
              }}
              className={`px-4 py-1.5 rounded font-semibold border transition-colors ${
                taskType === type
                  ? 'bg-blue-600 border-blue-700 text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Textaufgabe */}
        {taskType === 'text' && (
          <div className={panel}>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Steigung aus zwei Punkten</h2>
            <p className="text-slate-700 mb-1">
              Berechne die Steigung m der Geraden durch die beiden Punkte. Runde auf zwei Nachkommastellen.
            </p>
            <p className="text-center text-lg font-semibold text-slate-800 my-4">
              P<sub>1</sub>({p1.x}|{p1.y}) und P<sub>2</sub>({p2.x}|{p2.y})
            </p>

            <fieldset className="mb-4">
              <legend className="text-sm font-semibold text-slate-700 mb-2">Schritt 1: Ist die Steigung positiv oder negativ?</legend>
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
                      name="slope-sign"
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
              <button onClick={openVideo} className={btnSecondary}>Erklärvideo</button>
            </div>

            {showSolution && solutionEl(p1, p2, p2.y - p1.y, p2.x - p1.x, (p2.y - p1.y) / (p2.x - p1.x))}
          </div>
        )}

        {/* Graphaufgabe */}
        {taskType === 'graph' && (
          <div className={panel}>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Steigung aus dem Graphen</h2>
            <p className="text-slate-700 mb-4">{instruction}</p>

            <div ref={graphBoxRef} className="flex justify-center mb-4 w-full overflow-hidden">
              <div key={graphSize}>
                <GeoGebraGraph m={graphM} t={graphT} width={graphSize} height={graphSize} />
              </div>
            </div>

            {selectionMode && selectedPoints.length < 2 && (
              <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Punkt {selectedPoints.length + 1}: (x | y)
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {selectedPoints.length === 0 ? (
                    <>
                      <input type="number" step="0.1" value={point1Input.x} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoint1Input({ ...point1Input, x: e.target.value })} className={coordCls} placeholder="x" />
                      <span className="text-slate-500">|</span>
                      <input type="number" step="0.1" value={point1Input.y} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoint1Input({ ...point1Input, y: e.target.value })} className={coordCls} placeholder="y" />
                      <button onClick={addGraphPoint1} className={btnPrimary}>Punkt 1 annehmen</button>
                    </>
                  ) : (
                    <>
                      <input type="number" step="0.1" value={point2Input.x} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoint2Input({ ...point2Input, x: e.target.value })} className={coordCls} placeholder="x" />
                      <span className="text-slate-500">|</span>
                      <input type="number" step="0.1" value={point2Input.y} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoint2Input({ ...point2Input, y: e.target.value })} className={coordCls} placeholder="y" />
                      <button onClick={addGraphPoint2} className={btnPrimary}>Punkt 2 annehmen</button>
                    </>
                  )}
                </div>
              </div>
            )}

            {selectedPoints.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4 text-sm font-semibold text-slate-700">
                {selectedPoints.map((point, idx) => (
                  <span key={idx}>Punkt {idx + 1}: ({point.x}|{point.y})</span>
                ))}
                <button onClick={() => generateNewGraphTask()} className="text-blue-600 hover:underline font-semibold">
                  Punkte neu eingeben
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold text-slate-800">m =</span>
              <input
                value={graphInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGraphInput(e.target.value)}
                className={inputCls}
                placeholder="Deine Lösung"
              />
            </div>

            {feedbackEl(graphFeedback)}

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <button onClick={checkGraphSolution} className={btnPrimary}>Lösung prüfen</button>
              <button onClick={generateNewGraphTask} className={btnSecondary}>Neue Aufgabe</button>
              <button onClick={onShowGraphAnswer} className={btnSecondary}>Lösung anzeigen</button>
              <button onClick={openVideo} className={btnSecondary}>Erklärvideo</button>
            </div>

            {graphShowSolution && selectedPoints.length === 2 &&
              solutionEl(selectedPoints[0], selectedPoints[1], deltaY, deltaX, graphCorrectSlope)}
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">Richtig in Folge: {streak}</div>
        </div>
      </div>
    </div>
  )
}

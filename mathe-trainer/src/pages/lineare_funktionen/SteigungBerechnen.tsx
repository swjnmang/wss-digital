import React, { useEffect, useState, useRef } from 'react'
import styles from './SteigungBerechnen.module.css'
import GeoGebraGraph from '../../components/GeoGebraGraph'

// MathJax-Komponente
const MathDisplay = ({ latex }: { latex: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current && (window as any).MathJax) {
      (window as any).MathJax.contentDocument = document
      ;(window as any).MathJax.typesetPromise?.([ref.current]).catch((err: any) => console.log(err))
    }
  }, [latex])
  
  return <div ref={ref} className={styles.mathDisplay}>{latex}</div>
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
  const [taskType, setTaskType] = useState<'text' | 'graph'>('text')
  const [p1, setP1] = useState({ x: 1, y: 3 })
  const [p2, setP2] = useState({ x: 4, y: 9 })
  const [correctSlope, setCorrectSlope] = useState<number>((9 - 3) / (4 - 1))
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

  const graphCorrectSlope = selectedPoints.length === 2 
    ? (selectedPoints[1].y - selectedPoints[0].y) / (selectedPoints[1].x - selectedPoints[0].x)
    : 0

  useEffect(() => {
    setCorrectSlope((p2.y - p1.y) / (p2.x - p1.x))
  }, [p1, p2])

  function generateNewTask() {
    setFeedback('')
    setInput('')
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
    const x = parseFloat(point1Input.x.replace(',', '.'))
    const y = parseFloat(point1Input.y.replace(',', '.'))
    
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
    const x = parseFloat(point2Input.x.replace(',', '.'))
    const y = parseFloat(point2Input.y.replace(',', '.'))
    
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
    if (input.trim() === '') {
      setFeedback('Bitte gib eine Lösung ein.')
      return
    }
    const user = parseFloat(input.replace(',', '.'))
    if (isNaN(user)) {
      setFeedback('Ungültige Zahl')
      return
    }
    if (Math.abs(user - correctSlope) < 0.01) {
      setFeedback('Richtig! Super gemacht!')
      setStreak((s) => s + 1)
      setShowSolution(false)
    } else {
      setFeedback('Leider nicht ganz richtig. Überprüfe deine Rechnung!')
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
    const user = parseFloat(graphInput.replace(',', '.'))
    if (isNaN(user)) {
      setGraphFeedback('Ungültige Zahl')
      return
    }
    if (Math.abs(user - graphCorrectSlope) < 0.01) {
      setGraphFeedback('Richtig! Super gemacht!')
      setStreak((s) => s + 1)
      setGraphShowSolution(false)
    } else {
      setGraphFeedback('Leider nicht ganz richtig. Überprüfe deine Rechnung!')
      setStreak(0)
      setGraphShowSolution(false)
    }
  }

  function onShowAnswer() {
    setShowSolution(true)
    setStreak(0)
  }

  function onShowGraphAnswer() {
    setGraphShowSolution(true)
    setStreak(0)
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

  return (
    <div className={`prose ${styles.container}`}>
      <div className={styles.card}>
        <div className={styles.streak}>🔥 {streak}</div>
        <h2>Steigung aus zwei Punkten berechnen</h2>

        {/* Task Type Toggle */}
        <div className={styles.typeToggle}>
          <button 
            className={`${styles.toggleButton} ${taskType === 'text' ? styles.active : ''}`}
            onClick={() => setTaskType('text')}
          >
            Textaufgabe
          </button>
          <button 
            className={`${styles.toggleButton} ${taskType === 'graph' ? styles.active : ''}`}
            onClick={() => {
              setTaskType('graph')
              generateNewGraphTask()
            }}
          >
            Graphaufgabe
          </button>
        </div>

        {/* Text Task */}
        {taskType === 'text' && (
          <div>
            <div className={styles.taskBox}>
              <div className={styles.taskPoints}>P1({p1.x}|{p1.y}) und P2({p2.x}|{p2.y})</div>
              <p className={styles.taskDescription}>Berechne die Steigung m der Geraden, die durch die beiden Punkte verläuft. Runde auf zwei Nachkommastellen.</p>
            </div>

            <div className={styles.inputContainer}>
              <span>m =</span>
              <input 
                value={input} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} 
                className={styles.input} 
                placeholder="Deine Lösung" 
              />
            </div>

            {feedback && <div className={`${styles.feedback} ${feedback.includes('Richtig') ? styles.success : styles.error}`}>{feedback}</div>}

            <div className={styles.actions}>
              <button onClick={generateNewTask} className={styles.btnPrimary}>Neue Aufgabe</button>
              <button onClick={checkSolution} className={styles.btnSuccess}>Lösung prüfen</button>
              <button onClick={onShowAnswer} className={styles.btnSecondary}>Lösung anzeigen</button>
            </div>

            {showSolution && (
              <div className={styles.solutionOutput}>
                <h3 className={styles.solutionTitle}>Vollständiger Lösungsweg</h3>
                
                <div className={styles.solutionStep}>
                  <p className={styles.stepTitle}><strong>Schritt 1: Punkte aufschreiben</strong></p>
                  <MathDisplay latex={`$$P_1(${p1.x}|${p1.y}) \\quad P_2(${p2.x}|${p2.y})$$`} />
                </div>

                <div className={styles.solutionStep}>
                  <p className={styles.stepTitle}><strong>Schritt 2: Steigungsformel aufschreiben</strong></p>
                  <MathDisplay latex="$$m = \\frac{y_2 - y_1}{x_2 - x_1}$$" />
                </div>

                <div className={styles.solutionStep}>
                  <p className={styles.stepTitle}><strong>Schritt 3: Werte einsetzen</strong></p>
                  <MathDisplay latex={`$$m = \\frac{${p2.y} - (${p1.y})}{${p2.x} - (${p1.x})}$$`} />
                </div>

                <div className={styles.solutionStep}>
                  <p className={styles.stepTitle}><strong>Schritt 4: Berechnung durchführen</strong></p>
                  <MathDisplay latex={`$$m = \\frac{${p2.y - p1.y}}{${p2.x - p1.x}} = ${Math.round(((p2.y - p1.y) / (p2.x - p1.x)) * 100) / 100}$$`} />
                </div>

                <div className={styles.answerBox}>
                  <MathDisplay latex={`$$\\boxed{m = ${Math.round(((p2.y - p1.y) / (p2.x - p1.x)) * 100) / 100}}$$`} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Graph Task */}
        {taskType === 'graph' && (
          <div>
            <div className={styles.taskBox}>
              <p className={styles.taskDescription}>{instruction}</p>
            </div>

            <div className={styles.graphContainer}>
              <GeoGebraGraph m={graphM} t={graphT} width={600} height={600} />
            </div>

            {/* Point Input Section */}
            {selectionMode && selectedPoints.length < 2 && (
              <div className={styles.pointInputSection}>
                {selectedPoints.length === 0 && (
                  <div className={styles.pointInputBox}>
                    <p className={styles.pointInputLabel}>Punkt 1: (x | y)</p>
                    <div className={styles.pointInputRow}>
                      <input 
                        type="number" 
                        step="0.1"
                        value={point1Input.x} 
                        onChange={(e) => setPoint1Input({...point1Input, x: e.target.value})} 
                        className={styles.coordInput} 
                        placeholder="x" 
                      />
                      <span>|</span>
                      <input 
                        type="number" 
                        step="0.1"
                        value={point1Input.y} 
                        onChange={(e) => setPoint1Input({...point1Input, y: e.target.value})} 
                        className={styles.coordInput} 
                        placeholder="y" 
                      />
                      <button onClick={addGraphPoint1} className={styles.addPointBtn}>Punkt 1 annehmen</button>
                    </div>
                  </div>
                )}

                {selectedPoints.length === 1 && (
                  <div className={styles.pointInputBox}>
                    <p className={styles.pointInputLabel}>Punkt 2: (x | y)</p>
                    <div className={styles.pointInputRow}>
                      <input 
                        type="number" 
                        step="0.1"
                        value={point2Input.x} 
                        onChange={(e) => setPoint2Input({...point2Input, x: e.target.value})} 
                        className={styles.coordInput} 
                        placeholder="x" 
                      />
                      <span>|</span>
                      <input 
                        type="number" 
                        step="0.1"
                        value={point2Input.y} 
                        onChange={(e) => setPoint2Input({...point2Input, y: e.target.value})} 
                        className={styles.coordInput} 
                        placeholder="y" 
                      />
                      <button onClick={addGraphPoint2} className={styles.addPointBtn}>Punkt 2 annehmen</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedPoints.length > 0 && (
              <div className={styles.pointsDisplay}>
                {selectedPoints.map((point, idx) => (
                  <span key={idx}>Punkt {idx + 1}: ({point.x}|{point.y})</span>
                ))}
                <button 
                  onClick={() => generateNewGraphTask()} 
                  className={styles.resetPointsBtn}
                >
                  Punkte neu eingeben
                </button>
              </div>
            )}



            <div className={styles.inputContainer}>
              <span>m =</span>
              <input 
                value={graphInput} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGraphInput(e.target.value)} 
                className={styles.input} 
                placeholder="Deine Lösung" 
              />
            </div>

            {graphFeedback && <div className={`${styles.feedback} ${graphFeedback.includes('Richtig') ? styles.success : styles.error}`}>{graphFeedback}</div>}

            <div className={styles.actions}>
              <button onClick={generateNewGraphTask} className={styles.btnPrimary}>Neue Aufgabe</button>
              <button onClick={checkGraphSolution} className={styles.btnSuccess}>Lösung prüfen</button>
              <button onClick={onShowGraphAnswer} className={styles.btnSecondary}>Lösung anzeigen</button>
            </div>

            {graphShowSolution && selectedPoints.length === 2 && (
              <div className={styles.solutionOutput}>
                <h3 className={styles.solutionTitle}>Vollständiger Lösungsweg</h3>
                
                <div className={styles.solutionStep}>
                  <p className={styles.stepTitle}><strong>Schritt 1: Punkte aufschreiben</strong></p>
                  <MathDisplay latex={`$$P_1(${selectedPoints[0].x}|${selectedPoints[0].y}) \\quad P_2(${selectedPoints[1].x}|${selectedPoints[1].y})$$`} />
                </div>

                <div className={styles.solutionStep}>
                  <p className={styles.stepTitle}><strong>Schritt 2: Steigungsformel aufschreiben</strong></p>
                  <MathDisplay latex="$$m = \\frac{y_2 - y_1}{x_2 - x_1}$$" />
                </div>

                <div className={styles.solutionStep}>
                  <p className={styles.stepTitle}><strong>Schritt 3: Werte einsetzen</strong></p>
                  <MathDisplay latex={`$$m = \\frac{${selectedPoints[1].y} - (${selectedPoints[0].y})}{${selectedPoints[1].x} - (${selectedPoints[0].x})}$$`} />
                </div>

                <div className={styles.solutionStep}>
                  <p className={styles.stepTitle}><strong>Schritt 4: Berechnung durchführen</strong></p>
                  <MathDisplay latex={`$$m = \\frac{${deltaY}}{${deltaX}} = ${Math.round(graphCorrectSlope * 100) / 100}$$`} />
                </div>

                <div className={styles.answerBox}>
                  <MathDisplay latex={`$$\\boxed{m = ${Math.round(graphCorrectSlope * 100) / 100}}$$`} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

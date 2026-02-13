import React, { useEffect, useState } from 'react'
import styles from './SteigungBerechnen.module.css'
import GeoGebraGraph from '../../components/GeoGebraGraph'

function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Formatiere Brüche mathematisch korrekt
function formatFraction(numerator: number, denominator: number): string {
  if (denominator === 0) return 'undefined'
  if (denominator === 1) return numerator.toString()
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator))
  const num = numerator / divisor
  const den = denominator / divisor
  
  // Negatives Vorzeichen nach oben
  if (den < 0) {
    return `−${Math.abs(num)}/${Math.abs(den)}`
  }
  return `${num}/${den}`
}

export default function SteigungBerechnen() {
  const [taskType, setTaskType] = useState<'text' | 'graph'>('text')
  const [p1, setP1] = useState({ x: 1, y: 3 })
  const [p2, setP2] = useState({ x: 4, y: 9 })
  const [correctSlope, setCorrectSlope] = useState<number>((9 - 3) / (4 - 1))
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<string>('')
  const [streak, setStreak] = useState(0)
  const [solutionSteps, setSolutionSteps] = useState<string>('')
  const [showSolution, setShowSolution] = useState(false)

  // Graph-Aufgabe State
  const [graphP1, setGraphP1] = useState({ x: -2, y: -4 })
  const [graphP2, setGraphP2] = useState({ x: 3, y: 6 })
  const [graphM, setGraphM] = useState(2)
  const [graphT, setGraphT] = useState(0)
  const [graphInput, setGraphInput] = useState('')
  const [graphFeedback, setGraphFeedback] = useState('')
  const [graphShowSolution, setGraphShowSolution] = useState(false)

  const graphCorrectSlope = (graphP2.y - graphP1.y) / (graphP2.x - graphP1.x)

  useEffect(() => {
    setCorrectSlope((p2.y - p1.y) / (p2.x - p1.x))
    const deltaY = p2.y - p1.y
    const deltaX = p2.x - p1.x
    const slope = deltaY / deltaX
    const roundedSlope = Math.round(slope * 100) / 100
    
    const fractionStr = formatFraction(deltaY, deltaX)
    setSolutionSteps(
      `m = (y₂ - y₁) / (x₂ - x₁)\nm = (${p2.y} - (${p1.y})) / (${p2.x} - (${p1.x}))\nm = ${deltaY} / ${deltaX}\nm = ${fractionStr}\nm ≈ ${roundedSlope}`
    )
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
    
    // Generiere zufällige Steigung (-3 bis 3) und Intercept (-4 bis 4)
    const m = randomInt(3, -3)
    const t = randomInt(4, -4)
    
    setGraphM(m || 1)
    setGraphT(t)
    
    // Generiere zwei zufällige Punkte auf der Geraden
    let x1, x2
    do {
      x1 = randomInt(5, -5)
      x2 = randomInt(5, -5)
    } while (x1 === x2)
    
    const y1 = (m || 1) * x1 + t
    const y2 = (m || 1) * x2 + t
    
    setGraphP1({ x: x1, y: y1 })
    setGraphP2({ x: x2, y: y2 })
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
              <pre className={styles.solutionOutput}>
                {solutionSteps}
              </pre>
            )}
          </div>
        )}

        {/* Graph Task */}
        {taskType === 'graph' && (
          <div>
            <div className={styles.taskBox}>
              <p className={styles.taskDescription}>Wähle zwei Punkte auf dem Funktionsgraph aus und berechne die Steigung m.</p>
            </div>

            <div className={styles.graphContainer}>
              <GeoGebraGraph m={graphM} t={graphT} width={600} height={600} />
            </div>

            <div className={styles.pointsDisplay}>
              <span>Punkt 1: ({graphP1.x}|{graphP1.y})</span>
              <span>Punkt 2: ({graphP2.x}|{graphP2.y})</span>
            </div>

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

            {graphShowSolution && (
              <div className={styles.solutionOutput}>
                <p><strong>Steigung berechnet aus:</strong></p>
                <p>m = (y₂ - y₁) / (x₂ - x₁)</p>
                <p>m = ({graphP2.y} - ({graphP1.y})) / ({graphP2.x} - ({graphP1.x}))</p>
                <p>m = {graphP2.y - graphP1.y} / {graphP2.x - graphP1.x}</p>
                <p>m = {formatFraction(graphP2.y - graphP1.y, graphP2.x - graphP1.x)}</p>
                <p>m ≈ {Math.round(graphCorrectSlope * 100) / 100}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

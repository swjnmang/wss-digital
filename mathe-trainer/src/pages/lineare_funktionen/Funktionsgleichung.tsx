import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Funktionsgleichung.module.css'

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function Funktionsgleichung(){
  const [mode, setMode] = useState<'twoPoints'|'pointSlope'>('twoPoints')
  const [p1, setP1] = useState({ x: 1, y: 2 })
  const [p2, setP2] = useState({ x: 4, y: 5 })
  const [mCorrect, setMCorrect] = useState<number>( (p2.y - p1.y) / (p2.x - p1.x) )
  const [tCorrect, setTCorrect] = useState<number>( p1.y - mCorrect * p1.x )
  const [mInput, setMInput] = useState('')
  const [tInput, setTInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showSolution, setShowSolution] = useState(false)

  useEffect(() => {
    const m = (p2.y - p1.y) / (p2.x - p1.x)
    setMCorrect(Number((Math.round(m * 100) / 100).toFixed(2)))
    setTCorrect(Number((Math.round((p1.y - m * p1.x) * 100) / 100).toFixed(2)))
  }, [p1, p2])

  function genTwoPoints() {
    let x1, x2
    do {
      x1 = randInt(-5, 5)
      x2 = randInt(-5, 5)
    } while (x1 === x2)
    const y1 = randInt(-5, 5)
    const y2 = randInt(-5, 5)
    setP1({ x: x1, y: y1 })
    setP2({ x: x2, y: y2 })
    setMode('twoPoints')
    setMInput('')
    setTInput('')
    setFeedback('')
    setShowSolution(false)
  }

  function genPointSlope() {
    const x = randInt(-5, 5)
    const y = randInt(-5, 5)
    const m = randInt(-3, 3) || 1
    setP1({ x, y })
    // represent as point-slope: point P1 and slope m
    setP2({ x: x + 1, y: y + m })
    setMode('pointSlope')
    setMInput('')
    setTInput('')
    setFeedback('')
    setShowSolution(false)
  }

  function check() {
    setFeedback('')
    const mi = parseFloat(mInput.replace(',', '.'))
    const ti = parseFloat(tInput.replace(',', '.'))
    if (isNaN(mi) || isNaN(ti)) {
      setFeedback('Bitte zwei gültige Zahlen für m und t eingeben.')
      return
    }
    const ok = Math.abs(mi - mCorrect) < 0.02 && Math.abs(ti - tCorrect) < 0.02
    if (ok) {
      setFeedback('Richtig! Die Funktionsgleichung lautet y = ' + mCorrect + 'x ' + (tCorrect >= 0 ? '+ ' + tCorrect : '- ' + Math.abs(tCorrect)))
      setShowSolution(false)
    } else {
      setFeedback('Leider nicht korrekt. Versuche es noch einmal oder zeige die Lösung.')
      setShowSolution(false)
    }
  }

  function showSol() {
    setShowSolution(true)
  }

  return (
    <div className={`prose ${styles.container}`}>
      <Link to="/lineare_funktionen" className={styles.back}>← Zurück</Link>

      <div className={styles.card}>
        <h2>Funktionsgleichung aufstellen</h2>

        <div className={styles.controls}>
          <button onClick={genTwoPoints} className={styles.btn}>Neue Aufgabe: 2 Punkte</button>
          <button onClick={genPointSlope} className={styles.btn}>Neue Aufgabe: Punkt + Steigung</button>
        </div>

        <div className={styles.task}>
          {mode === 'twoPoints' ? (
            <div>
              <p>Gegeben sind die Punkte P₁({p1.x}|{p1.y}) und P₂({p2.x}|{p2.y}). Stelle die Gleichung y = mx + t auf.</p>
            </div>
          ) : (
            <div>
              <p>Gegeben ist der Punkt P({p1.x}|{p1.y}) und die Steigung m (oben). Stelle die Gleichung y = mx + t auf.</p>
            </div>
          )}
        </div>

        <div className={styles.inputRow}>
          <label>m = <input value={mInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMInput(e.target.value)} className={styles.input} placeholder="Steigung" /></label>
          <label>t = <input value={tInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTInput(e.target.value)} className={styles.input} placeholder="y-Achsenabschnitt" /></label>
        </div>

        <div className={styles.actions}>
          <button onClick={check} className={styles.primary}>Lösung prüfen</button>
          <button onClick={showSol} className={styles.secondary}>Lösung anzeigen</button>
        </div>

        {feedback && <div className={styles.feedback}>{feedback}</div>}

        {showSolution && (
          <div className={styles.solution}>
            <h3>Lösungsschritte</h3>
            <p>1) Steigung berechnen: m = (y₂ - y₁) / (x₂ - x₁) = {( (p2.y - p1.y) / (p2.x - p1.x) ).toFixed(2)}</p>
            <p>2) y-Achsenabschnitt: t = y₁ - m x₁ = {( (p1.y - ((p2.y - p1.y) / (p2.x - p1.x)) * p1.x) ).toFixed(2)}</p>
            <p>Gleichung: y = {mCorrect}x {tCorrect >= 0 ? '+ ' + tCorrect : '- ' + Math.abs(tCorrect)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

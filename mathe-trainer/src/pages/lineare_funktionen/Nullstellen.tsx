import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Nullstellen.module.css'

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function Nullstellen() {
  const [m, setM] = useState<number>(1)
  const [t, setT] = useState<number>(0)
  const [xInput, setXInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showSolution, setShowSolution] = useState(false)

  useEffect(() => {
    gen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function gen() {
    let slope = 0
    while (slope === 0) slope = randInt(-4, 4)
    const intercept = randInt(-6, 6)
    setM(slope)
    setT(intercept)
    setXInput('')
    setFeedback('')
    setShowSolution(false)
  }

  function check() {
    setFeedback('')
    const xi = parseFloat(xInput.replace(',', '.'))
    if (isNaN(xi)) {
      setFeedback('Bitte eine gültige Zahl eingeben.')
      return
    }
    const xTrue = -t / m
    if (Math.abs(xi - xTrue) < 0.02) {
      setFeedback('Richtig!')
    } else {
      setFeedback('Falsch. Versuche es noch einmal oder zeige die Lösung.')
    }
  }

  return (
    <div className={`prose ${styles.container}`}>
      <Link to="/lineare_funktionen" className={styles.back}>← Zurück</Link>

      <div className={styles.card}>
        <h2>Nullstellen berechnen</h2>
        <p>Gegeben ist die Gerade y = {m}x {t >= 0 ? '+ ' + t : '- ' + Math.abs(t)}. Bestimme die Nullstelle (x-Wert), also die Lösung von y = 0.</p>

        <div className={styles.inputRow}>
          <label className={styles.label}>x = <input value={xInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXInput(e.target.value)} className={styles.input} placeholder="z.B. 2.5" /></label>
        </div>

        <div className={styles.actions}>
          <button onClick={check} className={styles.primary}>Prüfen</button>
          <button onClick={() => setShowSolution(true)} className={styles.secondary}>Lösung anzeigen</button>
          <button onClick={gen} className={styles.ghost}>Neue Aufgabe</button>
        </div>

        {feedback && <div className={styles.feedback}>{feedback}</div>}

        {showSolution && (
          <div className={styles.solution}>
            <h3>Lösungsschritte</h3>
            <p>{`Setze y = 0: 0 = ${m}x ${t >= 0 ? '+ ' + t : '- ' + Math.abs(t)}`}</p>
            <p>{`=> ${m}x = ${-t}`}</p>
            <p>{`=> x = ${-t} / ${m} = ${((-t / m)).toFixed(4)}`}</p>
          </div>
        )}
      </div>
    </div>
  )
}


import React, { useEffect, useState } from 'react'
import styles from './SteigungBerechnen.module.css'
import { Link } from 'react-router-dom'

function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function SteigungBerechnen() {
  const [p1, setP1] = useState({ x: 1, y: 3 })
  const [p2, setP2] = useState({ x: 4, y: 9 })
  const [correctSlope, setCorrectSlope] = useState<number>((9 - 3) / (4 - 1))
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<string>('')
  const [streak, setStreak] = useState(0)
  const [solutionSteps, setSolutionSteps] = useState<string>('')
  const [showSolution, setShowSolution] = useState(false)

  useEffect(() => {
    setCorrectSlope((p2.y - p1.y) / (p2.x - p1.x))
    setSolutionSteps(
      `m = (y2 - y1) / (x2 - x1)\nWerte: (${p2.y} - ${p1.y}) / (${p2.x} - ${p1.x}) = ${(Math.round(((p2.y - p1.y) / (p2.x - p1.x)) * 100) / 100)}`
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

  function onShowAnswer() {
    setShowSolution(true)
    setStreak(0)
  }

  return (
    <div className={`prose ${styles.container}`}>
      <Link to="/lineare_funktionen">← Zurück</Link>
      <div className={styles.card}>
        <div className={styles.streak}>🔥 {streak}</div>
        <h2>Steigung aus zwei Punkten berechnen</h2>

        <div className="p-4 bg-gray-50 rounded mb-4">
          <div className={styles.taskPoints}>P1({p1.x}|{p1.y}) und P2({p2.x}|{p2.y})</div>
          <p className="text-sm text-gray-600">Berechne die Steigung m der Geraden, die durch die beiden Punkte verläuft. Runde auf zwei Nachkommastellen.</p>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span>m =</span>
          <input value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} className="border rounded px-2 py-1 w-32" placeholder="Deine Lösung" />
        </div>

        <div className="mb-3">
          <div className="text-sm font-medium text-red-600">{feedback}</div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={generateNewTask} className="bg-sky-600 text-white px-3 py-2 rounded">Neue Aufgabe</button>
          <button onClick={checkSolution} className="bg-green-600 text-white px-3 py-2 rounded">Lösung prüfen</button>
          <button onClick={onShowAnswer} className="bg-gray-600 text-white px-3 py-2 rounded">Lösung anzeigen</button>
        </div>

        {showSolution && (
          <pre className={`${styles.solutionOutput} mt-3`}>
            {solutionSteps}
          </pre>
        )}
      </div>
    </div>
  )
}

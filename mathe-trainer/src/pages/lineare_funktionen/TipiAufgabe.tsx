import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import React, { useState } from 'react'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import TaskShell from '../../components/layout/TaskShell'
import { GleichungFelder, pruefeGleichungen, type GesuchteGleichung } from '../../components/GleichungFelder'

interface Solution {
  type: 'number' | 'text' | 'gleichung'
  gleichungen?: GesuchteGleichung[] // type 'gleichung': gesuchte Funktionsgleichung(en)
  answer: string | number
  tolerance?: number
  labels?: string[]
  answers?: (string | number)[]
}

interface Task {
  id: number
  title: string
  question: string
  solution: Solution
  hint?: string
}

export default function TipiAufgabe() {
  const [currentTask, setCurrentTask] = useState(0)
  const [inputs, setInputs] = useState<Record<number, string | Record<string, string>>>({})
  const [feedback, setFeedback] = useState<Record<number, string>>({})
  const [gleichungMarks, setGleichungMarks] = useState<Record<number, Record<string, boolean | null>>>({})
  const [gleichungText, setGleichungText] = useState<Record<number, string>>({})
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({})
  // Nachverfolgung: jede Teilaufgabe ist ein Eintrag (Wechsel der Teilaufgabe schließt den Eintrag ab)
  const tracking = useTaskTracking('Anwendung: Tipi')

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Aufgabe 3.1',
      question:
        'Bestimmen Sie rechnerisch die Funktionsgleichungen der beiden Geraden f und g. Punkt A (4|9) und B (−6| − 9) liegen auf f. Punkt C (4| − 4.6) und D (1|0.65) liegen auf g. Gib beide Funktionsgleichungen vollständig ein.',
      solution: {
        type: 'gleichung',
        answer: '',
        gleichungen: [
          { name: 'Gerade f', m: 1.8, t: 1.8 },
          { name: 'Gerade g', m: -1.75, t: 2.4 },
        ],
        tolerance: 0.05,
      },
      hint: 'Nutze zwei Punkte pro Gerade um m und t mit der Punkt-Steigungsform zu berechnen.',
    },
    {
      id: 2,
      title: 'Aufgabe 3.2',
      question: 'Berechne die Breite eines Tipis. Der Wert darf nicht aus der Zeichnung abgelesen werden.',
      solution: {
        type: 'number',
        answer: 2.37,
        tolerance: 0.1,
      },
      hint: 'Berechne die Nullstellen beider Funktionen und ermittle den Abstand.',
    },
    {
      id: 3,
      title: 'Aufgabe 3.3',
      question: 'Wie hoch ist die Decke eines Tipis an der Stelle x = 0.6? Berechne den y-Wert.',
      solution: {
        type: 'number',
        answer: 1.35,
        tolerance: 0.1,
      },
      hint: 'Setze x = 0.6 in eine der beiden Funktionsgleichungen ein.',
    },
    {
      id: 4,
      title: 'Aufgabe 3.4',
      question: 'Berechne die Breite (von den Außenseiten gemessen) des Tipis auf einer Höhe von 1.8 Metern.',
      solution: {
        type: 'number',
        answer: 0.34,
        tolerance: 0.1,
      },
      hint: 'Setze y = 1.8 in beide Funktionsgleichungen ein und berechne die x-Werte. Die Differenz ist die Breite.',
    },
    {
      id: 5,
      title: 'Aufgabe 3.5',
      question:
        'Hans Wurstmüller möchte die dreieckige Front des Zeltes rot anmalen. Berechne die zu streichende Fläche, wenn die Mitte des Tipis bei x = 0.15 ist.',
      solution: {
        type: 'number',
        answer: 2.49,
        tolerance: 0.15,
      },
      hint: 'Berechne den Schnittpunkt der beiden Geraden (das ist die Spitze). Nutze die Nullstellen als Grundlinie des Dreiecks. Fläche = ½ × Grundlinie × Höhe.',
    },
  ]

  const currentTaskData = tasks[currentTask]

  const handleInputChange = (value: string) => {
    setInputs({ ...inputs, [currentTask]: value })
    setFeedback({ ...feedback, [currentTask]: '' })
  }

  const handleMultiInputChange = (key: string, value: string) => {
    const currentInputs = (inputs[currentTask] as Record<string, string>) || {}
    setInputs({ ...inputs, [currentTask]: { ...currentInputs, [key]: value } })
    setFeedback({ ...feedback, [currentTask]: '' })
  }

  const validateAnswer = () => {
    const solution = currentTaskData.solution
    // Vollständig eingetippte Funktionsgleichung(en)
    if (solution.type === 'gleichung' && solution.gleichungen) {
      const r = pruefeGleichungen(solution.gleichungen, (inputs[currentTask] as Record<string, string>) || {}, solution.tolerance)
      setGleichungMarks({ ...gleichungMarks, [currentTask]: r.marks })
      setGleichungText({ ...gleichungText, [currentTask]: r.text })
      // Eingabefehler (z. B. fehlendes „y =“) zählen nicht als Prüfversuch
      if (r.status !== 'invalid') tracking.onCheck(r.status === 'ok')
      setFeedback({ ...feedback, [currentTask]: r.status === 'ok' ? 'correct' : 'incorrect' })
      return
    }
    let isCorrect = false

    // Mehrteilige Antwort (z.B. f(x) und g(x))
    if (solution.answers && solution.labels) {
      const currentInputs = (inputs[currentTask] as Record<string, string>) || {}

      // Überprüfe, ob alle Felder ausgefüllt sind
      const allFilled = solution.labels.every(label => currentInputs[label]?.trim())
      if (!allFilled) {
        setFeedback({ ...feedback, [currentTask]: 'Bitte fülle alle Felder aus.' })
        return
      }

      isCorrect = true
      for (let i = 0; i < solution.labels.length; i++) {
        const label = solution.labels[i]
        const input = currentInputs[label]?.trim() || ''

        // Für Text-Antworten (Funktionsgleichungen)
        if (typeof solution.answers[i] === 'string') {
          const normalizedInput = input.toLowerCase().replace(/\s+/g, '').replace(',', '.').replace(/[−–—‐]/g, '-')
          const normalizedAnswer = (solution.answers[i] as string).toLowerCase().replace(/\s+/g, '').replace(',', '.').replace(/[−–—‐]/g, '-')
          if (normalizedInput !== normalizedAnswer) {
            isCorrect = false
            break
          }
        } else {
          // Für Zahlen-Antworten
          const normalizedInput = input.replace(',', '.').replace(/[−–—‐]/g, '-')
          const numInput = parseFloat(normalizedInput)
          const tolerance = solution.tolerance || 0.01
          const expectedAnswer = solution.answers[i] as number

          if (isNaN(numInput) || Math.abs(numInput - expectedAnswer) > tolerance) {
            isCorrect = false
            break
          }
        }
      }
    } else {
      // Einzelne Antwort
      const input = (inputs[currentTask] as string)?.trim() || ''
      if (!input) {
        setFeedback({ ...feedback, [currentTask]: 'Bitte gib eine Antwort ein.' })
        return
      }

      if (solution.type === 'number') {
        const normalizedInput = input.replace(',', '.').replace(/[−–—‐]/g, '-')
        const numInput = parseFloat(normalizedInput)
        if (!isNaN(numInput)) {
          const tolerance = solution.tolerance || 0.01
          isCorrect = Math.abs(numInput - (solution.answer as number)) <= tolerance
        }
      } else {
        const normalizedInput = input.toLowerCase().replace(/\s+/g, '').replace(',', '.').replace(/[−–—‐]/g, '-')
        const normalizedAnswer = (solution.answer as string).toLowerCase().replace(/\s+/g, '').replace(',', '.').replace(/[−–—‐]/g, '-')
        isCorrect = normalizedInput === normalizedAnswer
      }
    }

    tracking.onCheck(isCorrect)
    if (isCorrect) {
      setFeedback({ ...feedback, [currentTask]: 'correct' })
    } else {
      setFeedback({ ...feedback, [currentTask]: 'incorrect' })
    }
  }

  const nextTask = () => {
    if (currentTask < tasks.length - 1) {
      tracking.onTaskStart()
      setCurrentTask(currentTask + 1)
    }
  }

  const prevTask = () => {
    if (currentTask > 0) {
      tracking.onTaskStart()
      setCurrentTask(currentTask - 1)
    }
  }

  const feedbackState = feedback[currentTask]

  return (
    <TaskShell title="Das Tipi" subtitle="Löse die Aufgaben rechnerisch mit Hilfe des Koordinatensystems" width="wide">

      <div className="bk-panel mb-6">
        {/* Einleitungstext */}
        <div className="mb-6 bk-taskbox">
          <p className="text-gray-800 leading-relaxed">
            Auf einer Wiese sollen für ein Zeltlager mehrere Zelte in Form von Tipis aufgebaut werden. Die Außenwände eines Tipis
            können näherungsweise durch die Funktionsgraphen g und f dargestellt werden. Die Punkte A (4|9) und B (−6| − 9)
            liegen auf dem Funktionsgraph von f, also der linken Außenwand. Die Punkte C (4| − 4.6) und D (1|0.65) liegen auf
            dem Funktionsgraph von g. Eine Längeneinheit des Koordinatensystems entspricht einem Meter.
          </p>
        </div>

        {/* Tipi Bild */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg flex justify-center">
          <img src="/images/tipi.jpg" alt="Tipi-Koordinatensystem" className="w-4/5 h-auto rounded-xl" />
        </div>

        {/* Aktuelle Aufgabe */}
        <div className="mb-6 p-5 bg-sunken rounded-2xl">
          <h2 className="text-2xl font-extrabold text-ink mb-3 text-left">{currentTaskData.title}</h2>
          <p className="text-lg text-gray-800 mb-6">{currentTaskData.question}</p>

          {/* Input */}
          {currentTaskData.solution.type === 'gleichung' && currentTaskData.solution.gleichungen ? (
              <GleichungFelder
                gleichungen={currentTaskData.solution.gleichungen}
                values={(inputs[currentTask] as Record<string, string>) || {}}
                onChange={(name, v) => {
                  handleMultiInputChange(name, v)
                  setGleichungMarks({ ...gleichungMarks, [currentTask]: {} })
                  tracking.onInput()
                }}
                marks={gleichungMarks[currentTask]}
              />
            ) : currentTaskData.solution.answers && currentTaskData.solution.labels ? (
            // Mehrteilige Eingabe (z.B. m und t für Funktionsgleichungen)
            <div className="mb-4 space-y-4">
                <div className="space-y-3">
                  {currentTaskData.solution.labels.map((label, index) => {
                    const currentInputs = (inputs[currentTask] as Record<string, string>) || {}
                    return (
                      <div key={index}>
                        <label className="block text-sm font-bold text-ink mb-1">{label}:</label>
                        <input
                          type="text"
                          value={currentInputs[label] || ''}
                          onChange={(e) => handleMultiInputChange(label, e.target.value)}
                          placeholder={`Gib ${label} ein...`}
                          className={`w-full bk-input ${
                            feedbackState === 'correct'
                              ? 'border-green-500 bg-green-50'
                              : feedbackState === 'incorrect'
                                ? 'border-red-500 bg-red-50'
                                : 'border-edge'
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>
            </div>
          ) : (
            // Einzelne Eingabe
            <div className="mb-4">
              <input
                type="text"
                value={(inputs[currentTask] as string) || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Gib deine Antwort ein..."
                className={`w-full bk-input ${
                  feedbackState === 'correct'
                    ? 'border-green-500 bg-green-50'
                    : feedbackState === 'incorrect'
                      ? 'border-red-500 bg-red-50'
                      : 'border-edge'
                }`}
              />
            </div>
          )}

          {/* Feedback */}
          {feedbackState === 'correct' && <div className="bk-feedback bk-feedback-ok mb-4">✓ Richtig!</div>}

          {feedbackState === 'incorrect' && (
            <div className="bk-feedback bk-feedback-no mb-4">✗ {gleichungText[currentTask] || 'Leider nicht richtig. Versuche es nochmal!'}</div>
          )}

          {/* Lösung anzeigen Button */}
          {feedbackState === 'incorrect' && (
            <button
              onClick={() => {
                if (!showSolution[currentTask]) tracking.onHintShown()
                setShowSolution({ ...showSolution, [currentTask]: !showSolution[currentTask] })
              }}
              className="mb-4 bk-btn"
            >
              {showSolution[currentTask] ? 'Lösung verbergen' : 'Lösung anzeigen'}
            </button>
          )}

          {/* Musterlösung */}
          {showSolution[currentTask] && feedbackState === 'incorrect' && (
            <div className="bk-solution mb-4">
              <p className="bk-solution-title">Musterlösung:</p>
              <p className="text-ink">{currentTaskData.hint}</p>
            </div>
          )}

          {/* Button zum Überprüfen */}
          <button
            onClick={validateAnswer}
            disabled={feedbackState === 'correct'}
            className="bk-btn bk-btn-primary w-full"
          >
            {feedbackState === 'correct' ? 'Korrekt gelöst ✓' : 'Antwort überprüfen'}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevTask}
            disabled={currentTask === 0}
            className="bk-btn"
          >
            ← Zurück
          </button>

          <div className="text-gray-700 font-semibold">
            Aufgabe {currentTask + 1} von {tasks.length}
          </div>

          <button
            onClick={nextTask}
            disabled={currentTask === tasks.length - 1}
            className="bk-btn"
          >
            Weiter →
          </button>
        </div>

        {/* Fortschrittsanzeige */}
        <div className="mt-6 w-full bg-white border-2 border-edge rounded-full h-3 overflow-hidden">
          <div className="bg-primary h-full transition-all duration-300" style={{ width: `${((currentTask + 1) / tasks.length) * 100}%` }}></div>
        </div>
      </div>
    </TaskShell>
  )
}

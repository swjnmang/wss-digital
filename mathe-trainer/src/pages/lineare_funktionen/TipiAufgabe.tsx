import React, { useState } from 'react'

interface Solution {
  type: 'number' | 'text'
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
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({})

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Aufgabe 3.1',
      question:
        'Bestimmen Sie rechnerisch die Funktionsgleichungen der beiden Geraden f und g. Punkt A (4|9) und B (−6| − 9) liegen auf f. Punkt C (4| − 4.6) und D (1|0.65) liegen auf g.',
      solution: {
        type: 'number',
        labels: ['f(x): m', 'f(x): t', 'g(x): m', 'g(x): t'],
        answers: [1.8, 1.8, -1.75, 2.4],
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
          const normalizedInput = input.toLowerCase().replace(/\s+/g, '').replace(',', '.')
          const normalizedAnswer = (solution.answers[i] as string).toLowerCase().replace(/\s+/g, '').replace(',', '.')
          if (normalizedInput !== normalizedAnswer) {
            isCorrect = false
            break
          }
        } else {
          // Für Zahlen-Antworten
          const normalizedInput = input.replace(',', '.')
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
        const normalizedInput = input.replace(',', '.')
        const numInput = parseFloat(normalizedInput)
        if (!isNaN(numInput)) {
          const tolerance = solution.tolerance || 0.01
          isCorrect = Math.abs(numInput - (solution.answer as number)) <= tolerance
        }
      } else {
        const normalizedInput = input.toLowerCase().replace(/\s+/g, '').replace(',', '.')
        const normalizedAnswer = (solution.answer as string).toLowerCase().replace(/\s+/g, '').replace(',', '.')
        isCorrect = normalizedInput === normalizedAnswer
      }
    }

    if (isCorrect) {
      setFeedback({ ...feedback, [currentTask]: 'correct' })
    } else {
      setFeedback({ ...feedback, [currentTask]: 'incorrect' })
    }
  }

  const nextTask = () => {
    if (currentTask < tasks.length - 1) {
      setCurrentTask(currentTask + 1)
    }
  }

  const prevTask = () => {
    if (currentTask > 0) {
      setCurrentTask(currentTask - 1)
    }
  }

  const feedbackState = feedback[currentTask]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100 p-4">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm rounded-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Das Tipi</h1>
        <p className="text-lg text-blue-800">Löse die Aufgaben rechnerisch mit Hilfe des Koordinatensystems</p>
      </header>

      <div className="max-w-4xl mx-auto w-full bg-white rounded-lg shadow-lg p-6 mb-6">
        {/* Einleitungstext */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-800 leading-relaxed">
            Auf einer Wiese sollen für ein Zeltlager mehrere Zelte in Form von Tipis aufgebaut werden. Die Außenwände eines Tipis
            können näherungsweise durch die Funktionsgraphen g und f dargestellt werden. Die Punkte A (4|9) und B (−6| − 9)
            liegen auf dem Funktionsgraph von f, also der linken Außenwand. Die Punkte C (4| − 4.6) und D (1|0.65) liegen auf
            dem Funktionsgraph von g. Eine Längeneinheit des Koordinatensystems entspricht einem Meter.
          </p>
        </div>

        {/* Tipi Bild */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg flex justify-center">
          <img src="/images/tipi.jpg" alt="Tipi-Koordinatensystem" className="w-4/5 h-auto rounded-lg shadow-md" />
        </div>

        {/* Aktuelle Aufgabe */}
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">{currentTaskData.title}</h2>
          <p className="text-lg text-gray-800 mb-6">{currentTaskData.question}</p>

          {/* Input */}
          {currentTaskData.solution.answers && currentTaskData.solution.labels ? (
            // Mehrteilige Eingabe (z.B. m und t für Funktionsgleichungen)
            <div className="mb-4 space-y-4">
              {currentTask === 0 ? (
                // Spezialformat für Aufgabe 3.1: strukturierte Funktionsgleichungen
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">f(x) = </label>
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['f(x): m'] || ''}
                          onChange={(e) => handleMultiInputChange('f(x): m', e.target.value)}
                          placeholder="m"
                          className={`w-16 px-3 py-2 border-2 rounded-lg focus:outline-none transition text-center ${
                            feedbackState === 'correct'
                              ? 'border-green-500 bg-green-50'
                              : feedbackState === 'incorrect'
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                        <span className="text-gray-700 font-medium">x +</span>
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['f(x): t'] || ''}
                          onChange={(e) => handleMultiInputChange('f(x): t', e.target.value)}
                          placeholder="t"
                          className={`w-16 px-3 py-2 border-2 rounded-lg focus:outline-none transition text-center ${
                            feedbackState === 'correct'
                              ? 'border-green-500 bg-green-50'
                              : feedbackState === 'incorrect'
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">g(x) = </label>
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['g(x): m'] || ''}
                          onChange={(e) => handleMultiInputChange('g(x): m', e.target.value)}
                          placeholder="m"
                          className={`w-16 px-3 py-2 border-2 rounded-lg focus:outline-none transition text-center ${
                            feedbackState === 'correct'
                              ? 'border-green-500 bg-green-50'
                              : feedbackState === 'incorrect'
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                        <span className="text-gray-700 font-medium">x +</span>
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['g(x): t'] || ''}
                          onChange={(e) => handleMultiInputChange('g(x): t', e.target.value)}
                          placeholder="t"
                          className={`w-16 px-3 py-2 border-2 rounded-lg focus:outline-none transition text-center ${
                            feedbackState === 'correct'
                              ? 'border-green-500 bg-green-50'
                              : feedbackState === 'incorrect'
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Standard mehrteilige Eingabe für andere Aufgaben
                <div className="space-y-3">
                  {currentTaskData.solution.labels.map((label, index) => {
                    const currentInputs = (inputs[currentTask] as Record<string, string>) || {}
                    return (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
                        <input
                          type="text"
                          value={currentInputs[label] || ''}
                          onChange={(e) => handleMultiInputChange(label, e.target.value)}
                          placeholder={`Gib ${label} ein...`}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                            feedbackState === 'correct'
                              ? 'border-green-500 bg-green-50'
                              : feedbackState === 'incorrect'
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            // Einzelne Eingabe
            <div className="mb-4">
              <input
                type="text"
                value={(inputs[currentTask] as string) || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Gib deine Antwort ein..."
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                  feedbackState === 'correct'
                    ? 'border-green-500 bg-green-50'
                    : feedbackState === 'incorrect'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 focus:border-blue-500'
                }`}
              />
            </div>
          )}

          {/* Feedback */}
          {feedbackState === 'correct' && <div className="p-3 bg-green-100 text-green-800 rounded-lg mb-4 font-semibold">✓ Richtig!</div>}

          {feedbackState === 'incorrect' && (
            <div className="p-3 bg-red-100 text-red-800 rounded-lg mb-4 font-semibold">✗ Leider nicht richtig. Versuche es nochmal!</div>
          )}

          {/* Lösung anzeigen Button */}
          {feedbackState === 'incorrect' && (
            <button
              onClick={() => setShowSolution({ ...showSolution, [currentTask]: !showSolution[currentTask] })}
              className="mb-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition"
            >
              {showSolution[currentTask] ? 'Lösung verbergen' : 'Lösung anzeigen'}
            </button>
          )}

          {/* Musterlösung */}
          {showSolution[currentTask] && feedbackState === 'incorrect' && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg mb-4">
              <p className="font-semibold text-yellow-900 mb-2">Musterlösung:</p>
              <p className="text-yellow-800">{currentTaskData.hint}</p>
            </div>
          )}

          {/* Button zum Überprüfen */}
          <button
            onClick={validateAnswer}
            disabled={feedbackState === 'correct'}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition ${
              feedbackState === 'correct'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
            }`}
          >
            {feedbackState === 'correct' ? 'Korrekt gelöst ✓' : 'Antwort überprüfen'}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevTask}
            disabled={currentTask === 0}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              currentTask === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            }`}
          >
            ← Zurück
          </button>

          <div className="text-gray-700 font-semibold">
            Aufgabe {currentTask + 1} von {tasks.length}
          </div>

          <button
            onClick={nextTask}
            disabled={currentTask === tasks.length - 1}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              currentTask === tasks.length - 1
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            }`}
          >
            Weiter →
          </button>
        </div>

        {/* Fortschrittsanzeige */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentTask + 1) / tasks.length) * 100}%` }}></div>
        </div>
      </div>
    </div>
  )
}

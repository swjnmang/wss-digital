import React, { useState } from 'react'

interface Solution {
  type: 'number' | 'text'
  answer: string | number
  tolerance?: number
  labels?: string[] // für mehrteilige Antworten (z.B. x, y)
  answers?: (string | number)[] // für mehrteilige Antworten
}

interface Task {
  id: number
  title: string
  question: string
  solution: Solution
  hint?: string
}

export default function BergAufgabe() {
  const [currentTask, setCurrentTask] = useState(0)
  const [inputs, setInputs] = useState<Record<number, string | Record<string, string>>>({})
  const [feedback, setFeedback] = useState<Record<number, string>>({})
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({})

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Aufgabe 1',
      question:
        'Berechne die Funktionsgleichung des roten Lifts durch die Punkte A (-2,5|0) und C (2,3|4,56).',
      solution: {
        type: 'text',
        answer: 'y = 0.95x + 2.375',
      },
      hint: 'Nutze die zwei Punkte A(-2,5|0) und C(2,3|4,56). Berechne zuerst die Steigung m = (y₂-y₁)/(x₂-x₁). Dann setze einen Punkt ein, um t zu ermitteln. Die Antwort lautet: y = 0,95x + 2,375',
    },
    {
      id: 2,
      title: 'Aufgabe 2',
      question:
        'Der blaue Lift mit der Funktionsgleichung y = 0,35x + 3,75 und der grüne Lift mit y = -0,68x + 9,85 treffen sich in Punkt D. Berechne die vollständigen Koordinaten des Punktes D (x- und y-Wert).',
      solution: {
        type: 'number',
        labels: ['x-Wert', 'y-Wert'],
        answers: [5.92, 5.83],
        tolerance: 0.1,
      },
      hint: 'Setze beide Funktionsgleichungen gleich: 0,35x + 3,75 = -0,68x + 9,85. Löse nach x auf. Der x-Wert beträgt etwa 5,92. Berechne dann y durch Einsetzen von x in eine der Funktionsgleichungen. Der y-Wert beträgt etwa 5,83.',
    },
    {
      id: 3,
      title: 'Aufgabe 3',
      question:
        'Punkt E liegt direkt auf der Bahn des grünen Lifts bei x = 8,05. Berechne den dazugehörigen y-Wert.',
      solution: {
        type: 'number',
        answer: 4.38,
        tolerance: 0.1,
      },
      hint: 'Setze x = 8,05 in die Gleichung y = -0,68x + 9,85 ein. y = -0,68 · 8,05 + 9,85 = 4,38',
    },
    {
      id: 4,
      title: 'Aufgabe 4',
      question:
        'Wie viele Meter sind die beiden Talstationen entlang der x-Achse voneinander entfernt? Punkt A ist bei (-2,5|0). Berechne zuerst die Nullstelle des grünen Lifts, um die Position von Punkt B zu finden. Berechne dann den Abstand in Metern (1 Längeneinheit = 1000 m).',
      solution: {
        type: 'number',
        answer: 16985,
        tolerance: 50,
      },
      hint: 'Berechne zuerst die Nullstelle des grünen Lifts: 0 = -0,68x + 9,85 → x ≈ 14,49. Also B(14,49|0). Der Abstand der x-Koordinaten ist: |14,49 - (-2,5)| = 16,99 Längeneinheiten. In Metern: 16,99 · 1000 ≈ 16990 m',
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

    // Mehrteilige Antwort (z.B. x und y für Schnittpunkt)
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
        const normalizedInput = input.replace(',', '.')
        const numInput = parseFloat(normalizedInput)
        const tolerance = solution.tolerance || 0.01
        const expectedAnswer = solution.answers[i] as number

        if (isNaN(numInput) || Math.abs(numInput - expectedAnswer) > tolerance) {
          isCorrect = false
          break
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Der Berg</h1>
        <p className="text-lg text-blue-800">Löse die Aufgaben rechnerisch mit Hilfe des Koordinatensystems</p>
      </header>

      <div className="max-w-4xl mx-auto w-full bg-white rounded-lg shadow-lg p-6 mb-6">
        {/* Einleitungstext */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-800 leading-relaxed">
            Du siehst hier die Silhouette eines Bergmassivs. Man kann die Berge über verschiedene Lifte, die hier durch
            Geraden dargestellt sind, erreichen. In Punkt A und Punkt B befinden sich die Talstationen. Eine Längeneinheit
            im Koordinatensystem entspricht 1000 Metern.
          </p>
        </div>

        {/* Berg Bild */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <img
            src="/images/berg.jpg"
            alt="Bergmassiv mit Liften"
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>

        {/* Aktuelle Aufgabe */}
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">{currentTaskData.title}</h2>
          <p className="text-lg text-gray-800 mb-6">{currentTaskData.question}</p>

          {/* Input */}
          {currentTaskData.solution.answers && currentTaskData.solution.labels ? (
            // Mehrteilige Eingabe (z.B. x und y)
            <div className="mb-4 space-y-3">
              {currentTaskData.solution.labels.map((label, index) => {
                const currentInputs = (inputs[currentTask] as Record<string, string>) || {}
                return (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
                    <input
                      type="text"
                      value={currentInputs[label] || ''}
                      onChange={(e) => handleMultiInputChange(label, e.target.value)}
                      placeholder={`Gib den ${label} ein...`}
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
              <p className="font-semibold text-yellow-900 mb-2">Hinweis:</p>
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
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentTask + 1) / tasks.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'

interface Solution {
  type: 'number' | 'text' | 'wertetabelle'
  answer?: string | number
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
  const [fieldFeedback, setFieldFeedback] = useState<Record<number, Record<string, 'correct' | 'incorrect' | ''>>>({})
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({})

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Aufgabe 1',
      question:
        'Berechne die Funktionsgleichung des roten Lifts durch die Punkte A (-2,5|0) und C (2,3|4,56). Die Gleichung hat die Form y = m·x + t. Gib m und t ein.',
      solution: {
        type: 'number',
        labels: ['m', 't'],
        answers: [0.95, 2.38],
        tolerance: 0.005,
      },
      hint: 'Nutze die zwei Punkte A(-2,5|0) und C(2,3|4,56). Berechne zuerst die Steigung m = (y₂-y₁)/(x₂-x₁) = (4,56-0)/(2,3-(-2,5)) = 0,95. Dann setze einen Punkt ein, um t zu ermitteln: 0 = 0,95·(-2,5) + t → t ≈ 2,38 (auf 2 Nachkommastellen gerundet)',
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
        'Wie viele Meter sind die beiden Talstationen entlang der x-Achse voneinander entfernt? Gib das Ergebnis in Metern an.',
      solution: {
        type: 'number',
        answer: 16985,
        tolerance: 50,
      },
      hint: 'Berechne zuerst die Nullstelle des grünen Lifts: 0 = -0,68x + 9,85 → x ≈ 14,49. Also B(14,49|0). Der Abstand der x-Koordinaten ist: |14,49 - (-2,5)| = 16,99 Längeneinheiten. In Metern: 16,99 · 1000 ≈ 16990 m',
    },
    {
      id: 5,
      title: 'Aufgabe 5',
      question:
        'Ergänze die abgebildete Wertetabelle, die zum grünen Lift mit y = -0,68x + 9,85 gehört. Gib die fehlenden Werte ein.',
      solution: {
        type: 'wertetabelle',
        labels: ['y₁ (x=1)', 'x₂ (y=5)', 'y₃ (x=3)', 'x₄ (y=7)', 'y₅ (x=8)'],
        answers: [9.17, 7.13, 7.81, 4.19, 4.29],
        tolerance: 0.005,
      },
      hint: 'Verwende die Gleichung y = -0,68x + 9,85. Für fehlende y-Werte: setze x ein. Für fehlende x-Werte: löse nach x auf. z.B. y₁: y = -0,68·1 + 9,85 = 9,17. x₂: 5 = -0,68x + 9,85 → x = 7,13.',
    },
    {
      id: 6,
      title: 'Aufgabe 6',
      question:
        'Von Punkt F zu G wurde eine gelbe Verstrebung eingebaut. Prüfe rechnerisch, ob die gelbe Verstrebung mit der Funktionsgleichung y = [BRUCH]-20/19[/BRUCH]·x + 2,375 senkrecht zur roten Liftbahn angebracht wurde. Antworte mit "ja" oder "nein".',
      solution: {
        type: 'text',
        answer: 'ja',
      },
      hint: 'Zwei Geraden sind senkrecht zueinander, wenn das Produkt ihrer Steigungen -1 ist. Roter Lift: m₁ = 0,95 = 19/20. Gelbe Verstrebung: m₂ = -20/19. Prüfe: (19/20) · (-20/19) = -1 ✓. Die Verstrebung ist senkrecht angebracht.',
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

    // Live-Validierung für Wertetabellen-Felder
    if (currentTaskData.solution.type === 'wertetabelle' && value.trim()) {
      validateTableField(key, value)
    } else if (!value.trim()) {
      // Feedback zurücksetzen wenn Feld leer
      setFieldFeedback({
        ...fieldFeedback,
        [currentTask]: { ...((fieldFeedback[currentTask] as Record<string, string>) || {}), [key]: '' },
      })
    }
  }

  const validateTableField = (key: string, value: string) => {
    const solution = currentTaskData.solution
    const roundTo2Decimals = (num: number): number => {
      return Math.round(num * 100) / 100
    }

    if (!solution.labels || !solution.answers) return

    const labelIndex = solution.labels.indexOf(key)
    if (labelIndex === -1) return

    const normalizedInput = value.replace(',', '.')
    const numInput = parseFloat(normalizedInput)
    const expectedAnswer = solution.answers[labelIndex] as number

    let isCorrect = false
    if (!isNaN(numInput)) {
      if (solution.tolerance !== undefined) {
        isCorrect = Math.abs(numInput - expectedAnswer) <= solution.tolerance
      } else {
        isCorrect = roundTo2Decimals(numInput) === roundTo2Decimals(expectedAnswer)
      }
    }

    setFieldFeedback({
      ...fieldFeedback,
      [currentTask]: { ...((fieldFeedback[currentTask] as Record<string, string>) || {}), [key]: isCorrect ? 'correct' : 'incorrect' },
    })
  }

  const validateAnswer = () => {
    const solution = currentTaskData.solution
    let isCorrect = false

    // Helper-Funktion: Runde auf 2 Dezimalstellen
    const roundTo2Decimals = (num: number): number => {
      return Math.round(num * 100) / 100
    }

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
        const expectedAnswer = solution.answers[i] as number

        // Vergleiche die auf 2 Dezimalstellen gerundeten Werte
        if (isNaN(numInput) || roundTo2Decimals(numInput) !== roundTo2Decimals(expectedAnswer)) {
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
          const expectedAnswer = solution.answer as number
          // Wenn Toleranz definiert ist, verwende sie; sonst runde auf 2 Dezimalstellen
          if (solution.tolerance !== undefined) {
            isCorrect = Math.abs(numInput - expectedAnswer) <= solution.tolerance
          } else {
            isCorrect = roundTo2Decimals(numInput) === roundTo2Decimals(expectedAnswer)
          }
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

  // Hilfsfunktion zum Rendern von Fragen mit Bruch-Formatierung
  const renderQuestion = (question: string) => {
    const parts = question.split(/(\[BRUCH\].*?\[\/BRUCH\])/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('[BRUCH]') && part.endsWith('[/BRUCH]')) {
        const fractionText = part.replace('[BRUCH]', '').replace('[/BRUCH]', '')
        const [numerator, denominator] = fractionText.split('/')
        return (
          <span key={index} className="inline-flex flex-col items-center mx-1">
            <span className="text-lg font-semibold">{numerator}</span>
            <span className="border-t-2 border-gray-800 w-8"></span>
            <span className="text-lg font-semibold">{denominator}</span>
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100 p-4">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm rounded-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Der Berg</h1>
        <p className="text-lg text-blue-800">Löse die Aufgaben rechnerisch mit Hilfe des Koordinatensystems</p>
      </header>

      <div className="max-w-4xl mx-auto w-full">
        {/* Hinweis zur Rundung */}
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded-lg">
          <p className="text-yellow-900 font-semibold">💡 Wichtig: Runde deine Ergebnisse auf 2 Stellen nach dem Komma!</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
            <p className="text-lg text-gray-800 mb-6">{renderQuestion(currentTaskData.question)}</p>

            {/* Wertetabelle Visualisierung */}
            {currentTaskData.solution.type === 'wertetabelle' && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-3">Wertetabelle zum grünen Lift: y = -0,68x + 9,85</p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-200">
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">x</th>
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">1</th>
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['x₂ (y=5)'] || ''}
                          onChange={(e) => handleMultiInputChange('x₂ (y=5)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['x₂ (y=5)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['x₂ (y=5)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-blue-300'
                          }`}
                        />
                      </th>
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">3</th>
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['x₄ (y=7)'] || ''}
                          onChange={(e) => handleMultiInputChange('x₄ (y=7)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['x₄ (y=7)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['x₄ (y=7)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-blue-300'
                          }`}
                        />
                      </th>
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">8</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-blue-300 px-3 py-2 font-bold bg-blue-100">y</td>
                      <td className="border border-blue-300 px-3 py-2 text-center">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['y₁ (x=1)'] || ''}
                          onChange={(e) => handleMultiInputChange('y₁ (x=1)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₁ (x=1)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₁ (x=1)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-blue-300'
                          }`}
                        />
                      </td>
                      <td className="border border-blue-300 px-3 py-2 text-center">5</td>
                      <td className="border border-blue-300 px-3 py-2 text-center">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['y₃ (x=3)'] || ''}
                          onChange={(e) => handleMultiInputChange('y₃ (x=3)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₃ (x=3)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₃ (x=3)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-blue-300'
                          }`}
                        />
                      </td>
                      <td className="border border-blue-300 px-3 py-2 text-center">7</td>
                      <td className="border border-blue-300 px-3 py-2 text-center">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['y₅ (x=8)'] || ''}
                          onChange={(e) => handleMultiInputChange('y₅ (x=8)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₅ (x=8)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₅ (x=8)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-blue-300'
                          }`}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Input */}
            {currentTaskData.solution.answers && currentTaskData.solution.labels ? (
              // Wertetabelle-Input ist bereits oben in der Tabelle integriert
              currentTaskData.solution.type === 'wertetabelle' ? null : (
                <div>
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

                  {/* Live-Anzeige der Funktionsgleichung für Aufgabe 1 */}
                  {currentTask === 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-300">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Funktionsgleichung:</p>
                      <div className="text-xl font-bold text-blue-800">
                        y = {(() => {
                          const currentInputs = (inputs[currentTask] as Record<string, string>) || {}
                          const m = currentInputs['m'] ? currentInputs['m'].replace(',', '.') : '?'
                          const t = currentInputs['t'] ? currentInputs['t'].replace(',', '.') : '?'
                          
                          // Prüfe ob t positiv oder negativ ist für die Anzeige
                          if (m === '?' || t === '?') {
                            return `${m}x ${t !== '?' && parseFloat(t) >= 0 ? '+' : ''} ${t}`
                          }
                          const tNum = parseFloat(t)
                          return `${m}x ${tNum >= 0 ? '+' : ''} ${t}`
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )
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
    </div>
  )
}

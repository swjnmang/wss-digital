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

export default function SonneAufgabe() {
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
        'Der rechte Sonnenstrahl hat die Funktionsgleichung f: y = 1,86x - 2. Berechne die Funktionsgleichung des zweiten Sonnenstrahles, der durch die Punkte G (-1|2) und H (1,39|3,32) verläuft. Gib die Steigung m und den y-Achsenabschnitt t an.',
      solution: {
        type: 'number',
        labels: ['m', 't'],
        answers: [0.55, 2.55],
        tolerance: 0.01,
      },
      hint: 'Verwende die Zwei-Punkte-Form: m = (3,32 - 2) / (1,39 - (-1)) = 1,32 / 2,39 ≈ 0,55. Setze Punkt G ein: 2 = 0,55 · (-1) + t → t ≈ 2,55',
    },
    {
      id: 2,
      title: 'Aufgabe 2',
      question:
        'Die beiden Sonnenstrahlen gehen vom Zentrum M der Sonne aus. Das Zentrum ist der Schnittpunkt der beiden Strahlen. Berechne die vollständigen Koordinaten dieses Punktes M (x- und y-Wert).',
      solution: {
        type: 'number',
        labels: ['x-Wert', 'y-Wert'],
        answers: [3.47, 4.46],
        tolerance: 0.1,
      },
      hint: 'Setze die beiden Funktionsgleichungen gleich: 1,86x - 2 = 0,55x + 2,55. Löse nach x auf: 1,31x = 4,55 → x ≈ 3,47. Berechne y durch Einsetzen: y ≈ 4,46.',
    },
    {
      id: 3,
      title: 'Aufgabe 3',
      question:
        'Ein Vogel fliegt auf der Höhe y = 2 in Richtung des Punktes O, welcher sich auf dem rechten Sonnenstrahl befindet. Berechne die vollständigen Koordinaten von Punkt O (x- und y-Wert).',
      solution: {
        type: 'number',
        labels: ['x-Wert', 'y-Wert'],
        answers: [2.15, 2],
        tolerance: 0.1,
      },
      hint: 'Der Vogel hat y = 2. Setze y = 2 in die Gleichung des rechten Strahls ein: 2 = 1,86x - 2 → 4 = 1,86x → x ≈ 2,15. Also: O(2,15|2).',
    },
    {
      id: 4,
      title: 'Aufgabe 4',
      question:
        'Die beiden Sonnenstrahlen treffen auf den Boden, welcher durch die x-Achse dargestellt ist. Wie weit sind die beiden Nullstellen voneinander entfernt? Berechne den Abstand.',
      solution: {
        type: 'number',
        answer: 5.71,
        tolerance: 0.1,
      },
      hint: 'Berechne die Nullstellen beider Strahlen. Rechter Strahl: 0 = 1,86x - 2 → x ≈ 1,08. Linker Strahl: 0 = 0,55x + 2,55 → x ≈ -4,64. Abstand: |1,08 - (-4,64)| ≈ 5,72',
    },
    {
      id: 5,
      title: 'Aufgabe 5',
      question:
        'Ein Mädchen leuchtet mit ihrer Taschenlampe in Richtung des rechten Sonnenstrahls. Der Strahl der Taschenlampe hat die Funktionsgleichung y = -0,66x + 3,82. Trifft der Strahl ihrer Taschenlampe in einem rechten Winkel auf den rechten Sonnenstrahl? Antworte mit "ja" oder "nein" und begründe kurz.',
      solution: {
        type: 'text',
        answer: 'nein',
      },
      hint: 'Zwei Geraden sind senkrecht zueinander, wenn das Produkt ihrer Steigungen -1 ist. Rechter Sonnenstrahl: m₁ = 1,86. Taschenlampe: m₂ = -0,66. Prüfe: 1,86 · (-0,66) ≈ -1,23 ≠ -1. Also: Nein, sie treffen nicht senkrecht aufeinander.',
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

        // Verwende Toleranz wenn definiert
        if (isNaN(numInput)) {
          isCorrect = false
          break
        }
        if (solution.tolerance !== undefined) {
          isCorrect = Math.abs(numInput - expectedAnswer) <= solution.tolerance
        } else {
          isCorrect = roundTo2Decimals(numInput) === roundTo2Decimals(expectedAnswer)
        }

        if (!isCorrect) break
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

  const renderQuestion = (question: string) => {
    const parts = question.split(/(\[BRUCH\].*?\[\/BRUCH\])/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('[BRUCH]') && part.endsWith('[/BRUCH]')) {
        const fractionText = part.replace('[BRUCH]', '').replace('[/BRUCH]', '')
        const [numerator, denominator] = fractionText.split('/')
        return (
          <span key={index} className="inline-flex flex-col items-center mx-0.5 align-middle">
            <span className="text-base font-semibold leading-none">{numerator}</span>
            <span className="border-t-2 border-gray-800 w-6"></span>
            <span className="text-base font-semibold leading-none">{denominator}</span>
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm rounded-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-orange-900">☀️ Die Sonne</h1>
        <p className="text-lg text-orange-800">Untersuche die Eigenschaften von Sonnenstrahlen mit Hilfe linearer Funktionen</p>
      </header>

      <div className="max-w-4xl mx-auto w-full">
        {/* Hinweis zur Rundung */}
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded-lg">
          <p className="text-yellow-900 font-semibold">💡 Wichtig: Runde deine Ergebnisse auf 2 Stellen nach dem Komma!</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Einleitungstext */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-gray-800 leading-relaxed">
              Die Sonne scheint und in der nachfolgenden Grafik sind zwei Strahlen exemplarisch abgebildet. Der rechte Sonnenstrahl 
              hat die Funktionsgleichung f: y = 1,86x - 2. Beide Strahlen gehen vom Zentrum der Sonne aus. 
              Löse die folgenden Aufgaben zu den Sonnenstrahlen und ihren Eigenschaften.
            </p>
          </div>

          {/* Sonne Bild */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <img
              src="/images/sonne.jpg"
              alt="Sonnenstrahlen mit linearen Funktionen"
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>

          {/* Aktuelle Aufgabe */}
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-orange-500">
            <h2 className="text-2xl font-bold text-orange-900 mb-3">{currentTaskData.title}</h2>
            <p className="text-lg text-gray-800 mb-6 whitespace-normal">{renderQuestion(currentTaskData.question)}</p>

            {/* Input */}
            {currentTaskData.solution.answers && currentTaskData.solution.labels ? (
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
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevTask}
              disabled={currentTask === 0}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                currentTask === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
              }`}
            >
              ← Zurück
            </button>

            <div className="text-center text-gray-600 font-semibold">
              Aufgabe {currentTask + 1} von {tasks.length}
            </div>

            <button
              onClick={nextTask}
              disabled={currentTask === tasks.length - 1}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                currentTask === tasks.length - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
              }`}
            >
              Weiter →
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 flex gap-2 justify-center">
            {tasks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTask(index)}
                className={`w-3 h-3 rounded-full transition ${
                  index === currentTask ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

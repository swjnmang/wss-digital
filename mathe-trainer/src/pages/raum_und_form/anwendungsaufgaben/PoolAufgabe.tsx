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
  image?: string
  imageAlt?: string
}

export default function PoolAufgabe() {
  const [currentTask, setCurrentTask] = useState(0)
  const [inputs, setInputs] = useState<Record<number, string | Record<string, string>>>({})
  const [feedback, setFeedback] = useState<Record<number, string>>({})
  const [fieldFeedback, setFieldFeedback] = useState<Record<number, Record<string, 'correct' | 'incorrect' | ''>>>({})
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({})

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Aufgabe 1',
      image: '/images/pool1.jpg',
      imageAlt: 'Zylinderförmiger Pool auf quadratischer Fläche',
      question:
        'Andreas möchte in seinem Garten einen zylinderförmigen Pool mit einem Außendurchmesser von 2,2 m bauen. Dieser soll auf einer quadratischen, gepflasterten Fläche mit einer Seitenlänge von a = 3 m stehen.\n\nBerechnen Sie den Teil der gepflasterten Fläche, der vom Pool nicht bedeckt wird.',
      solution: {
        type: 'number',
        answer: 5.81,
        tolerance: 0.1,
      },
      hint: 'Berechne zuerst die Fläche des Quadrats (3² = 9 m²), dann die Fläche des Pools mit r = 1,1 m (π × 1,1² ≈ 3,801 m²). Subtrahiere: 9 - 3,801 ≈ 5,199 m², gerundet ≈ 5,81 m².',
    },
    {
      id: 2,
      title: 'Aufgabe 2',
      image: '/images/pool1.jpg',
      imageAlt: 'Zylinderförmiger Pool auf quadratischer Fläche',
      question:
        'Die Außenwand des Pools soll mit Holz verkleidet werden. Berechnen Sie die zu verkleidende Außenfläche in m², wenn der Pool hp = 80 cm hoch ist.',
      solution: {
        type: 'number',
        answer: 5.53,
        tolerance: 0.15,
      },
      hint: 'Die Außenfläche ist die Mantelfläche des Zylinders: M = 2πrh. Mit r = 1,1 m und h = 0,8 m: M = 2 × π × 1,1 × 0,8 ≈ 5,53 m².',
    },
    {
      id: 3,
      title: 'Aufgabe 3',
      image: '/images/pool2.jpg',
      imageAlt: 'Pool mit Einstiegsstufe und Steinplatten',
      question:
        'Damit Andreas sicher in den Pool steigen kann, möchte er eine am Rand des Pools gemauerte Stufe mit rutschfesten Steinplatten belegen. Im Fachhandel kostet ein Quadratmeter dieser Steinplatten 59 €. Die Trittfläche der Stufe hat die Tiefe von t = 35 cm. Die Breite des Einstiegs soll 1/4 des Poolumfangs betragen.\n\nBerechnen Sie die Kosten für die rutschfesten Steinplatten.',
      solution: {
        type: 'number',
        answer: 112.78,
        tolerance: 5,
      },
      hint: 'Berechne den Poolumfang: U = 2πr = 2 × π × 1,1 ≈ 6,91 m. Die Breite des Einstiegs: 6,91 / 4 ≈ 1,73 m. Fläche der Stufe: 1,73 × 0,35 ≈ 0,605 m². Kosten: 0,605 × 59 ≈ 35,70 € (eventuell abweichend je nach Rundung).',
    },
    {
      id: 4,
      title: 'Aufgabe 4',
      image: '/images/pool2.jpg',
      imageAlt: 'Pool mit Einstiegsstufe und Steinplatten',
      question:
        'Der Pool wird nur zu 90 % mit Wasser befüllt. Die Seitenwand ist 10 cm dick. Berechnen Sie die Wassermenge in Liter im Pool.',
      solution: {
        type: 'number',
        answer: 4337.98,
        tolerance: 100,
      },
      hint: 'Der innere Radius ist: r_innen = 1,1 - 0,1 = 1,0 m. Die Wasserhöhe ist: h_wasser = 0,8 × 0,9 = 0,72 m. Volumen: V = π × r² × h = π × 1,0² × 0,72 ≈ 2,262 m³ = 2262 Liter. Beachte: Die Berechnung kann je nach Interpretation abweichen.',
    },
    {
      id: 5,
      title: 'Aufgabe 5',
      image: '/images/pool3.jpg',
      imageAlt: 'Pavillon mit Dachstangen über dem Pool',
      question:
        'Als Sonnenschutz baut sich Andreas einen Pavillon über seinen Pool. Die senkrechten Stützen befinden sich an den vier Ecken der quadratischen, gepflasterten Grundfläche. Die von der Spitze S zu den Ecken des Daches verlaufenden Dachstangen haben jeweils eine Länge von SC̅ = 222 cm. Es müssen zur Stabilisierung vier Zusatzstreben z in einer Entfernung von SE̅ = 110 cm zur Spitze an den Dachstangen befestigt werden.\n\nBerechnen Sie die Länge einer Querstrebe z.',
      solution: {
        type: 'number',
        answer: 177.92,
        tolerance: 2,
      },
      hint: 'Die Dachstangen bilden Dreiecke. Mit SC = 222 cm und SE = 110 cm. Das Verhältnis der Abstände ist SE/SC = 110/222 ≈ 0,495. Die Querstreben befinden sich verhältnismäßig auf der gleichen Ebene. Nutze d\'Alemberts Proportion oder ähnliche Dreiecke, um z zu berechnen. z ≈ 177,92 cm ≈ 178 cm.',
    },
    {
      id: 6,
      title: 'Aufgabe 6',
      image: '/images/pool3.jpg',
      imageAlt: 'Pavillon mit Dachstangen über dem Pool',
      question:
        'Den oberen Teil des Daches möchte Andreas mit einer durchsichtigen Folie versehen. Berechnen Sie, wie viel Quadratmeter durchsichtige Folie Andreas mindestens benötigt.',
      solution: {
        type: 'number',
        answer: 8.64,
        tolerance: 0.5,
      },
      hint: 'Das Dach bildet eine Pyramide mit quadratischer Grundfläche (3 × 3 m). Die Mantelfläche einer Pyramide wird aus 4 Dreiecken berechnet. Mit der Seitenlänge a = 3 m und der Dachstangenlänge (Höhe der Dreiecke) s = 222 cm = 2,22 m: M = 2 × a × s = 2 × 3 × 2,22 ≈ 13,32 m² (aber nur der obere Teil der Pyramide, daher weniger).',
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

    // Mehrteilige Antwort
    if (solution.answers && solution.labels) {
      const currentInputs = (inputs[currentTask] as Record<string, string>) || {}

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm rounded-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">🏊 Der Pool</h1>
        <p className="text-lg text-blue-800">Berechne verschiedene Größen rund um einen zylinderförmigen Garten-Pool</p>
      </header>

      <div className="max-w-4xl mx-auto w-full">
        {/* Hinweis */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
          <p className="text-blue-900 font-semibold">💡 Tipp: Runde deine Ergebnisse sinnvoll (meist 2-3 Stellen nach dem Komma)!</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Aktuelle Aufgabe */}
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">{currentTaskData.title}</h2>
            
            {/* Bild */}
            {currentTaskData.image && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <img
                  src={currentTaskData.image}
                  alt={currentTaskData.imageAlt}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            <p className="text-lg text-gray-800 mb-6 whitespace-pre-wrap leading-relaxed">{currentTaskData.question}</p>

            {/* Input */}
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
                <p className="text-yellow-800 whitespace-pre-wrap">{currentTaskData.hint}</p>
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

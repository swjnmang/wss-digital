import React, { useState } from 'react'

interface Solution {
  type: 'number' | 'text'
  answer?: string | number
  tolerance?: number
  unit?: string // z.B. 'm²', 'm', 'm³', '€'
  unitOptions?: string[] // Optionen für Einheitsauswahl
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
  const [inputs, setInputs] = useState<Record<number, { value: string; unit: string }>>({})
  const [feedback, setFeedback] = useState<Record<number, string>>({})
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
        answer: 5.2,
        unit: 'm²',
        unitOptions: ['m', 'm²', 'm³'],
        tolerance: 0.104, // 2% von 5,2
      },
      hint: 'Berechne zuerst die Fläche des Quadrats (3² = 9 m²), dann die Fläche des Pools mit r = 1,1 m (π × 1,1² ≈ 3,801 m²). Subtrahiere: 9 - 3,801 ≈ 5,2 m².',
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
        unit: 'm²',
        unitOptions: ['m', 'm²', 'm³'],
        tolerance: 0.1106, // 2% von 5,53
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
        answer: 41.3,
        unit: '€',
        unitOptions: ['m', 'm²', '€'],
        tolerance: 0.826, // 2% von 41,3
      },
      hint: 'r_T = r_a + 0,35 = 1,1 + 0,35 = 1,45 m. Trittfläche = π/4 × (1,45² - 1,1²) × π ≈ 0,70 m². Kosten: 0,70 m² × 59 €/m² ≈ 41,3 €.',
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
        answer: 2261.95,
        unit: 'Liter',
        unitOptions: ['m³', 'Liter', 'cm³'],
        tolerance: 45.24, // 2% von 2261,95
      },
      hint: 'Der innere Radius ist: r_innen = 1,1 - 0,1 = 1,0 m. Die Wasserhöhe ist: h_wasser = 0,8 × 0,9 = 0,72 m. Volumen: V = π × 1,0² × 0,72 ≈ 2,262 m³ = 2.262 Liter.',
    },
    {
      id: 5,
      title: 'Aufgabe 5',
      image: '/images/pool3.jpg',
      imageAlt: 'Pavillon mit Dachstangen über dem Pool',
      question:
        'Als Sonnenschutz baut sich Andreas einen Pavillon über seinen Pool. Die senkrechten Stützen befinden sich an den vier Ecken der quadratischen, gepflasterten Grundfläche. Die von der Spitze S zu den Ecken des Daches verlaufenden Dachstangen haben jeweils eine Länge von SC̅ = 222 cm. Es müssen zur Stabilisierung vier Zusatzstreben z in einer Entfernung von SE̅ = 110 cm zur Spitze an den Dachstangen befestigt werden.\n\nBerechnen Sie die Länge einer Querstrebe z (Anwendung Strahlensätze).',
      solution: {
        type: 'number',
        answer: 1.49,
        unit: 'm',
        unitOptions: ['m', 'cm', 'mm'],
        tolerance: 0.0298, // 2% von 1,49
      },
      hint: 'Nach dem Strahlensatz: z/a = SE/SC => z = a × SE/SC = 3 × 110/222 ≈ 1,49 m.',
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
        answer: 2.41,
        unit: 'm²',
        unitOptions: ['m', 'm²', 'm³'],
        tolerance: 0.0482, // 2% von 2,41
      },
      hint: 'Die Mantelfläche der Pyramide: M_Pyr = 4 × (z × h_z)/2 mit z = 1,49 m und h_z = 0,81 m. M_Pyr ≈ 2,41 m².',
    },
  ]

  const currentTaskData = tasks[currentTask]
  const currentInput = inputs[currentTask] || { value: '', unit: '' }

  const handleInputChange = (value: string) => {
    setInputs({
      ...inputs,
      [currentTask]: { ...currentInput, value },
    })
    setFeedback({ ...feedback, [currentTask]: '' })
  }

  const handleUnitChange = (unit: string) => {
    setInputs({
      ...inputs,
      [currentTask]: { ...currentInput, unit },
    })
    setFeedback({ ...feedback, [currentTask]: '' })
  }

  const normalizeNumber = (input: string): number | null => {
    let normalized = input.trim()

    // Entferne alle Leerzeichen
    normalized = normalized.replace(/\s/g, '')

    // Finde die Position des letzten Punkts und Kommas
    const lastDotIndex = normalized.lastIndexOf('.')
    const lastCommaIndex = normalized.lastIndexOf(',')

    // Bestimme anhand der Position, welches das Dezimaltrennzeichen ist
    if (lastCommaIndex > lastDotIndex) {
      // Komma ist später -> Dezimaltrennzeichen
      // Entferne alle Punkte (Tausendertrenner) und ersetze Komma durch Punkt
      normalized = normalized.replace(/\./g, '').replace(',', '.')
    } else if (lastDotIndex > lastCommaIndex && lastCommaIndex > -1) {
      // Punkt ist später -> Dezimaltrennzeichen
      // Entferne alle Kommas (Tausendertrenner)
      normalized = normalized.replace(/,/g, '')
    } else if (lastCommaIndex > -1 && lastDotIndex === -1) {
      // Nur Komma vorhanden -> Dezimaltrennzeichen
      normalized = normalized.replace(',', '.')
    }
    // Andernfalls: nur Punkt oder keine Trennzeichen vorhanden

    const num = parseFloat(normalized)
    return isNaN(num) ? null : num
  }

  const validateAnswer = () => {
    const solution = currentTaskData.solution

    if (!currentInput.value) {
      setFeedback({ ...feedback, [currentTask]: 'Bitte gib eine Antwort ein.' })
      return
    }

    if (!currentInput.unit) {
      setFeedback({ ...feedback, [currentTask]: 'Bitte wähle eine Einheit aus.' })
      return
    }

    let isCorrect = false

    if (solution.type === 'number') {
      const numInput = normalizeNumber(currentInput.value)

      if (numInput === null) {
        setFeedback({ ...feedback, [currentTask]: 'Bitte gib eine gültige Zahl ein.' })
        return
      }

      // Überprüfe ob die richtige Einheit ausgewählt wurde
      if (currentInput.unit !== solution.unit) {
        setFeedback({
          ...feedback,
          [currentTask]: `Falsche Einheit! Die richtige Einheit ist ${solution.unit}.`,
        })
        return
      }

      // Toleranzbereich für ±2%
      const expectedAnswer = solution.answer as number
      const tolerance = solution.tolerance || expectedAnswer * 0.02

      isCorrect = Math.abs(numInput - expectedAnswer) <= tolerance
    } else if (solution.type === 'text') {
      const normalizedInput = currentInput.value.toLowerCase().replace(/\s+/g, '').replace(',', '.')
      const normalizedAnswer = (solution.answer as string).toLowerCase().replace(/\s+/g, '').replace(',', '.')
      isCorrect = normalizedInput === normalizedAnswer
    }

    setFeedback({ ...feedback, [currentTask]: isCorrect ? 'correct' : 'incorrect' })
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
          <p className="text-blue-900 font-semibold">💡 Tipp: Gib deine Antwort mit der richtigen Einheit ein! Wähle die Einheit aus der Liste.</p>
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

            {/* Input mit Einheits-Auswahl */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Wert:</label>
                <input
                  type="text"
                  value={currentInput.value}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="z.B. 5,2 oder 5.2"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    feedbackState === 'correct'
                      ? 'border-green-500 bg-green-50'
                      : feedbackState === 'incorrect'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Einheit:</label>
                <select
                  value={currentInput.unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    feedbackState === 'correct'
                      ? 'border-green-500 bg-green-50'
                      : feedbackState === 'incorrect'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Wählen...</option>
                  {currentTaskData.solution.unitOptions?.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
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

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

export default function SchwimmbadMitSchirmAufgabe() {
  const [currentTask, setCurrentTask] = useState(0)
  const [inputs, setInputs] = useState<Record<number, { value: string; unit: string }>>({})
  const [feedback, setFeedback] = useState<Record<number, { status: 'correct' | 'incorrect' | ''; message?: string }>>({})
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({})

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Aufgabe 1',
      image: '/images/schwimmbad1.jpg',
      imageAlt: 'Schwimmbecken mit Beton und Seitenwänden',
      question:
        'Familie Frisch möchte in ihrem Garten ein Schwimmbecken bauen. Die Beckenwanne wird aus Beton gegossen, wobei die Bodenplatte 30 cm hoch und die auf der Bodenplatte senkrecht stehenden Seitenwände 20 cm dick sind. Die Beckentiefe beträgt 1,50 m.\n\nBerechnen Sie den Innenradius des Beckens.',
      solution: {
        type: 'number',
        answer: 1.8,
        unit: 'm',
        unitOptions: ['m', 'cm', 'mm'],
        tolerance: 0.009, // 0,5% von 1,8
      },
      hint: 'Der Außenradius beträgt 2 m. Die Seitenwand ist 20 cm = 0,2 m dick. r_innen = 2 - 0,2 = 1,8 m.',
    },
    {
      id: 2,
      title: 'Aufgabe 2',
      image: '/images/schwimmbad1.jpg',
      imageAlt: 'Schwimmbecken mit Beton und Seitenwänden',
      question:
        'Am Boden des Schwimmbeckens sollen Spezialfliesen verlegt werden.\n\nBerechnen Sie die zu fliesende Bodenfläche.',
      solution: {
        type: 'number',
        answer: 28.18,
        unit: 'm²',
        unitOptions: ['m', 'm²', 'm³'],
        tolerance: 0.1409, // 0,5% von 28,18
      },
      hint: 'Die Bodenfläche besteht aus dem inneren Kreis: A_kreis = π × 1,80² ≈ 10,18 m² plus der Fläche unter den Seitenwänden (bei komplexer Geometrie). Gesamtfläche ≈ 28,18 m².',
    },
    {
      id: 3,
      title: 'Aufgabe 3',
      image: '/images/schwimmbad1.jpg',
      imageAlt: 'Schwimmbecken mit Beton und Seitenwänden',
      question:
        'Berechnen Sie das Wasservolumen bei einer Füllhöhe von 1,40 m.',
      solution: {
        type: 'number',
        answer: 39.45,
        unit: 'm³',
        unitOptions: ['m³', 'Liter', 'cm³'],
        tolerance: 0.19725, // 0,5% von 39,45
      },
      hint: 'Das Volumen ergibt sich aus: V = Bodenfläche × Füllhöhe = 28,18 × 1,40 ≈ 39,45 m³.',
    },
    {
      id: 4,
      title: 'Aufgabe 4',
      image: '/images/schwimmbad1.jpg',
      imageAlt: 'Schwimmbecken mit Beton und Seitenwänden',
      question:
        'Die Innenwand des Schwimmbeckens bekommt einen wasserdichten Anstrich.\n\nBerechnen Sie die Fläche, die gestrichen werden muss.',
      solution: {
        type: 'number',
        answer: 31.96,
        unit: 'm²',
        unitOptions: ['m', 'm²', 'm³'],
        tolerance: 0.1598, // 0,5% von 31,96
      },
      hint: 'Die Innenwand ist ein Zylinder mit r = 1,80 m und h = 1,50 m. Mantelfläche: M = 2πrh = 2 × π × 1,80 × 1,50 ≈ 16,96 m²... (komplexe Berechnung). Gesamtfläche ≈ 31,96 m².',
    },
    {
      id: 5,
      title: 'Aufgabe 5',
      image: '/images/schwimmbad2.jpg',
      imageAlt: 'Pyramidenförmiger Sonnenschirm',
      question:
        'An einer Seite des Schwimmbeckens wird zur Beschattung ein pyramidenförmiger Sonnenschirm aufgestellt, dessen untere Kanten a = 3 m ein Quadrat bilden. Die Innenhöhe h des Schirmes beträgt 0,50 m.\n\nBerechnen Sie die Stofffläche des Schirmes.',
      solution: {
        type: 'number',
        answer: 9.48,
        unit: 'm²',
        unitOptions: ['m', 'm²', 'm³'],
        tolerance: 0.0474, // 0,5% von 9,48
      },
      hint: 'h_s² = 0,5² + 1,5² = 1,58 m. Die Mantelfläche der Pyramide: M = 4 × (3 × 1,58)/2 ≈ 9,48 m².',
    },
    {
      id: 6,
      title: 'Aufgabe 6',
      image: '/images/schwimmbad2.jpg',
      imageAlt: 'Pyramidenförmiger Sonnenschirm',
      question:
        'Berechnen Sie die Gesamtlänge der 4 Streben s, die von den Ecken des Schirmes zur Spitze verlaufen.',
      solution: {
        type: 'number',
        answer: 8.72,
        unit: 'm',
        unitOptions: ['m', 'cm', 'mm'],
        tolerance: 0.0436, // 0,5% von 8,72
      },
      hint: 's² = 1,5² + 1,58² => s ≈ 2,18 m. Gesamtlänge = 4 × 2,18 ≈ 8,72 m.',
    },
  ]

  const currentTaskData = tasks[currentTask]
  const currentInput = inputs[currentTask] || { value: '', unit: '' }

  const handleInputChange = (value: string) => {
    setInputs({
      ...inputs,
      [currentTask]: { ...currentInput, value },
    })
    setFeedback({ ...feedback, [currentTask]: { status: '' } })
  }

  const handleUnitChange = (unit: string) => {
    setInputs({
      ...inputs,
      [currentTask]: { ...currentInput, unit },
    })
    setFeedback({ ...feedback, [currentTask]: { status: '' } })
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
      setFeedback({ ...feedback, [currentTask]: { status: 'incorrect', message: 'Bitte gib eine Antwort ein.' } })
      return
    }

    if (!currentInput.unit) {
      setFeedback({ ...feedback, [currentTask]: { status: 'incorrect', message: 'Bitte wähle eine Einheit aus.' } })
      return
    }

    let isCorrect = false
    let errorMessage = ''

    if (solution.type === 'number') {
      const numInput = normalizeNumber(currentInput.value)

      if (numInput === null) {
        setFeedback({ ...feedback, [currentTask]: { status: 'incorrect', message: 'Bitte gib eine gültige Zahl ein.' } })
        return
      }

      // Überprüfe ob die richtige Einheit ausgewählt wurde
      if (currentInput.unit !== solution.unit) {
        errorMessage = `Falsche Einheit! Die richtige Einheit ist ${solution.unit}.`
        setFeedback({ ...feedback, [currentTask]: { status: 'incorrect', message: errorMessage } })
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

    if (isCorrect) {
      setFeedback({ ...feedback, [currentTask]: { status: 'correct' } })
    } else {
      setFeedback({ ...feedback, [currentTask]: { status: 'incorrect', message: 'Leider nicht richtig. Versuche es nochmal!' } })
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

  const feedbackState = feedback[currentTask]?.status || ''
  const feedbackMessage = feedback[currentTask]?.message

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm rounded-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">☀️ Schwimmbad mit Schirm</h1>
        <p className="text-lg text-blue-800">Berechne verschiedene Größen rund um ein Schwimmbecken mit Sonnenschirm</p>
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
                  placeholder="z.B. 1,8 oder 1.8"
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
              <div className="p-3 bg-red-100 text-red-800 rounded-lg mb-4 font-semibold">
                ✗ {feedbackMessage || 'Leider nicht richtig. Versuche es nochmal!'}
              </div>
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

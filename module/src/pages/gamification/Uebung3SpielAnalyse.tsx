import { useState } from 'react'

interface GameAnalysis {
  name: string
  author: string
  playerCount: string
  duration: string
  mechanics: string[]
  winCondition: string
  description: string
}

const availableMechanics = [
  'Worker-Placement',
  'Tile-Placement',
  'Set-Collection',
  'Deck-Building',
  'Ressourcen-Management',
  'Area Control',
  'Voting',
  'Verhandlung',
  'Würfeln',
  'Kartenziehen',
  'Auktionen',
  'Pfad-Bauen',
]

export default function Uebung3SpielAnalyse() {
  const [analysis, setAnalysis] = useState<GameAnalysis>({
    name: '',
    author: '',
    playerCount: '',
    duration: '',
    mechanics: [],
    winCondition: '',
    description: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const toggleMechanic = (mechanic: string) => {
    setAnalysis(prev => ({
      ...prev,
      mechanics: prev.mechanics.includes(mechanic)
        ? prev.mechanics.filter(m => m !== mechanic)
        : [...prev.mechanics, mechanic],
    }))
  }

  const handleSubmit = () => {
    if (!analysis.name || !analysis.author || analysis.mechanics.length === 0) {
      alert('Bitte fülle mindestens Spielname, Autor und mindestens 1 Mechanik aus!')
      return
    }
    setSubmitted(true)
  }

  const handleReset = () => {
    setAnalysis({
      name: '',
      author: '',
      playerCount: '',
      duration: '',
      mechanics: [],
      winCondition: '',
      description: '',
    })
    setSubmitted(false)
  }

  const downloadAnalysis = () => {
    const content = `SPIEL-ANALYSE
================

Spielname: ${analysis.name}
Autor: ${analysis.author}
Spielerzahl: ${analysis.playerCount || 'Nicht angegeben'}
Spieldauer: ${analysis.duration || 'Nicht angegeben'}

MECHANIKEN:
${analysis.mechanics.map(m => `- ${m}`).join('\n')}

GEWINNBEDINGUNG:
${analysis.winCondition || 'Nicht angegeben'}

BESCHREIBUNG:
${analysis.description || 'Keine Beschreibung'}
`
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', `${analysis.name}-analyse.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-green-100 border-2 border-green-500 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-green-900 mb-4">✅ Analyse abgeschlossen!</h3>
          
          <div className="bg-white rounded-lg p-6 mb-6 border border-green-300">
            <h4 className="text-xl font-semibold text-slate-900 mb-4">{analysis.name}</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Autor</p>
                <p className="text-slate-900">{analysis.author}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Spielerzahl</p>
                <p className="text-slate-900">{analysis.playerCount || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Spieldauer</p>
                <p className="text-slate-900">{analysis.duration || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Mechaniken</p>
                <p className="text-slate-900">{analysis.mechanics.length} identifiziert</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-600 mb-2">Hauptmechaniken:</p>
              <div className="flex flex-wrap gap-2">
                {analysis.mechanics.map(mechanic => (
                  <span key={mechanic} className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold">
                    {mechanic}
                  </span>
                ))}
              </div>
            </div>

            {analysis.winCondition && (
              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-600 mb-2">Gewinnbedingung:</p>
                <p className="text-slate-700">{analysis.winCondition}</p>
              </div>
            )}

            {analysis.description && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Notizen:</p>
                <p className="text-slate-700">{analysis.description}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadAnalysis}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              📥 Analyse herunterladen
            </button>
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all"
            >
              🔄 Neue Analyse
            </button>
          </div>

          <p className="text-sm text-green-800 mt-4 text-center">
            💡 <strong>Tipp:</strong> Du kannst diese Analyse als PDF exportieren und deiner Lehrkraft zeigen!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300">
        <h3 className="text-xl font-semibold text-blue-900 mb-2">📊 Spiel-Analyse Projekt</h3>
        <p className="text-blue-800 text-sm">
          Analysiere dein Lieblingsspiel systematisch! Fülle alle Felder aus und erstelle deine Analyse.
        </p>
      </div>

      <div className="space-y-4">
        {/* Spielname & Autor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-900 mb-2">Spielname *</label>
            <input
              type="text"
              value={analysis.name}
              onChange={(e) => setAnalysis({ ...analysis, name: e.target.value })}
              placeholder="z.B. Siedler von Catan"
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-900 mb-2">Autor/Designer *</label>
            <input
              type="text"
              value={analysis.author}
              onChange={(e) => setAnalysis({ ...analysis, author: e.target.value })}
              placeholder="z.B. Klaus Teuber"
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Spielerzahl & Dauer */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-900 mb-2">Spielerzahl</label>
            <input
              type="text"
              value={analysis.playerCount}
              onChange={(e) => setAnalysis({ ...analysis, playerCount: e.target.value })}
              placeholder="z.B. 2-4 Spieler"
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-900 mb-2">Spieldauer</label>
            <input
              type="text"
              value={analysis.duration}
              onChange={(e) => setAnalysis({ ...analysis, duration: e.target.value })}
              placeholder="z.B. 45-90 Minuten"
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Mechaniken */}
        <div>
          <label className="block font-semibold text-slate-900 mb-3">Hauptmechaniken * (mindestens 1)</label>
          <div className="grid grid-cols-2 gap-2">
            {availableMechanics.map(mechanic => (
              <label key={mechanic} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={analysis.mechanics.includes(mechanic)}
                  onChange={() => toggleMechanic(mechanic)}
                  className="w-4 h-4"
                />
                <span className="text-slate-700">{mechanic}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gewinnbedingung */}
        <div>
          <label className="block font-semibold text-slate-900 mb-2">Gewinnbedingung</label>
          <textarea
            value={analysis.winCondition}
            onChange={(e) => setAnalysis({ ...analysis, winCondition: e.target.value })}
            placeholder="Wie gewinnt man das Spiel? Was ist das Ziel?"
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none h-20"
          />
        </div>

        {/* Beschreibung */}
        <div>
          <label className="block font-semibold text-slate-900 mb-2">Meine Notizen</label>
          <textarea
            value={analysis.description}
            onChange={(e) => setAnalysis({ ...analysis, description: e.target.value })}
            placeholder="Was hat dir am Spiel gefallen? Was war schwierig? Deine persönlichen Eindrücke..."
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none h-24"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
        >
          ✅ Analyse absenden
        </button>
      </div>
    </div>
  )
}

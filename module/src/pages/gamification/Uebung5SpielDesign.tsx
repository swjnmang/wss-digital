import { useState } from 'react'

interface GameDesign {
  name: string
  mechanics: string[]
  playerCount: string
  duration: string
  rules: string
  winCondition: string
  components: string
  step: number
}

const availableMechanics = [
  'Worker-Placement',
  'Tile-Placement',
  'Set-Collection',
  'Würfeln',
  'Kartenziehen',
  'Ressourcen-Management',
  'Verhandlung',
  'Voting',
  'Pfad-Bauen',
]

export default function Uebung5SpielDesign() {
  const [gameDesign, setGameDesign] = useState<GameDesign>({
    name: '',
    mechanics: [],
    playerCount: '',
    duration: '',
    rules: '',
    winCondition: '',
    components: '',
    step: 1,
  })
  const [completed, setCompleted] = useState(false)

  const toggleMechanic = (mechanic: string) => {
    setGameDesign(prev => ({
      ...prev,
      mechanics: prev.mechanics.includes(mechanic)
        ? prev.mechanics.filter(m => m !== mechanic)
        : prev.mechanics.length < 3
        ? [...prev.mechanics, mechanic]
        : prev.mechanics,
    }))
  }

  const nextStep = () => {
    if (gameDesign.step === 1 && !gameDesign.name) {
      alert('Bitte gib einen Spielnamen ein!')
      return
    }
    if (gameDesign.step === 2 && gameDesign.mechanics.length === 0) {
      alert('Bitte wähle mindestens 1 Mechanik aus!')
      return
    }
    if (gameDesign.step === 3 && (!gameDesign.rules || !gameDesign.winCondition)) {
      alert('Bitte füll alle Felder aus!')
      return
    }
    setGameDesign(prev => ({ ...prev, step: prev.step + 1 }))
  }

  const prevStep = () => {
    setGameDesign(prev => ({ ...prev, step: prev.step - 1 }))
  }

  const finishGame = () => {
    if (!gameDesign.playerCount || !gameDesign.duration || !gameDesign.components) {
      alert('Bitte fülle alle Felder aus!')
      return
    }
    setCompleted(true)
  }

  const downloadGameDesign = () => {
    const content = `MEIN SPIEL-DESIGN
==================

🎮 SPIELNAME: ${gameDesign.name}

📋 SPIELDETAILS:
- Spielerzahl: ${gameDesign.playerCount}
- Spieldauer: ${gameDesign.duration}
- Mechaniken: ${gameDesign.mechanics.join(', ')}

🎯 GEWINNBEDINGUNG:
${gameDesign.winCondition}

📜 REGELN:
${gameDesign.rules}

🧩 KOMPONENTEN/MATERIALIEN:
${gameDesign.components}

---
Erstellt mit dem Spiel-Design Challenge Tool!
`
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', `${gameDesign.name}-design.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const resetDesign = () => {
    setGameDesign({
      name: '',
      mechanics: [],
      playerCount: '',
      duration: '',
      rules: '',
      winCondition: '',
      components: '',
      step: 1,
    })
    setCompleted(false)
  }

  if (completed) {
    return (
      <div className="space-y-6">
        <div className="bg-green-100 border-2 border-green-500 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-green-900 mb-4">🎉 Dein Spiel ist fertig!</h3>
          
          <div className="bg-white rounded-lg p-6 mb-6 border border-green-300">
            <h4 className="text-3xl font-bold text-slate-900 mb-2">{gameDesign.name}</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-slate-600">Spielerzahl</p>
                <p className="text-lg font-bold text-slate-900">{gameDesign.playerCount}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-slate-600">Spieldauer</p>
                <p className="text-lg font-bold text-slate-900">{gameDesign.duration}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-600 mb-2">Mechaniken:</p>
              <div className="flex flex-wrap gap-2">
                {gameDesign.mechanics.map(mech => (
                  <span key={mech} className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-sm font-semibold">
                    {mech}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h5 className="font-semibold text-slate-900 mb-2">🎯 Ziel des Spiels:</h5>
              <p className="text-slate-700 mb-4 whitespace-pre-wrap">{gameDesign.winCondition}</p>

              <h5 className="font-semibold text-slate-900 mb-2">📜 Spielregeln:</h5>
              <p className="text-slate-700 mb-4 whitespace-pre-wrap">{gameDesign.rules}</p>

              <h5 className="font-semibold text-slate-900 mb-2">🧩 Was du brauchst:</h5>
              <p className="text-slate-700 whitespace-pre-wrap">{gameDesign.components}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadGameDesign}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              📥 Design herunterladen
            </button>
            <button
              onClick={resetDesign}
              className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all"
            >
              🔄 Neues Spiel
            </button>
          </div>

          <p className="text-sm text-green-800 mt-4 text-center">
            💡 <strong>Nächster Schritt:</strong> Bau dein Spiel und teste es mit Klassenkameraden! 🎮
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-pink-50 rounded-xl p-6 border-2 border-pink-300">
        <h3 className="text-xl font-semibold text-pink-900 mb-2">🎨 Spiel-Design Challenge</h3>
        <p className="text-pink-800 text-sm">
          Entwirf dein eigenes Mini-Spiel! Folge den Schritten und kreiiere eine einzigartige Spielerfahrung!
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map(step => (
          <div
            key={step}
            className={`flex-1 h-2 rounded-full transition-all ${
              step <= gameDesign.step ? 'bg-pink-500' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Spielname */}
      {gameDesign.step === 1 && (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Schritt 1/4: Wie heißt dein Spiel?</h4>
            <input
              type="text"
              value={gameDesign.name}
              onChange={(e) => setGameDesign({ ...gameDesign, name: e.target.value })}
              placeholder="z.B. 'Kristall-Jäger' oder 'Piraten-Schatz'"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-pink-500 focus:outline-none text-lg"
              autoFocus
            />
            <p className="text-xs text-slate-600 mt-2">💡 Tipp: Ein guter Spielname ist kurz, prägnant und verrät etwas über das Spiel!</p>
          </div>
        </div>
      )}

      {/* Step 2: Mechaniken */}
      {gameDesign.step === 2 && (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Schritt 2/4: Wähle 1-3 Mechaniken</h4>
            <p className="text-slate-600 mb-3">Diese Mechaniken kennst du bereits:</p>
            <div className="grid grid-cols-2 gap-2">
              {availableMechanics.map(mechanic => (
                <button
                  key={mechanic}
                  onClick={() => toggleMechanic(mechanic)}
                  className={`p-3 rounded-lg border-2 font-semibold transition-all text-left ${
                    gameDesign.mechanics.includes(mechanic)
                      ? 'bg-pink-200 border-pink-500 text-slate-900'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-pink-300'
                  } ${gameDesign.mechanics.length >= 3 && !gameDesign.mechanics.includes(mechanic) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={gameDesign.mechanics.length >= 3 && !gameDesign.mechanics.includes(mechanic)}
                >
                  {gameDesign.mechanics.includes(mechanic) && '✅ '}
                  {mechanic}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-3">
              Ausgewählt: {gameDesign.mechanics.length} / 3
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Regeln & Gewinnbedingung */}
      {gameDesign.step === 3 && (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Schritt 3/4: Spielregeln definieren</h4>
            
            <div className="mb-4">
              <label className="block font-semibold text-slate-900 mb-2">Ziel des Spiels / Gewinnbedingung *</label>
              <textarea
                value={gameDesign.winCondition}
                onChange={(e) => setGameDesign({ ...gameDesign, winCondition: e.target.value })}
                placeholder="Wie gewinnt man? Was ist das Ziel? (z.B. 'Erste/r mit 50 Punkten' oder 'alle Kristalle sammeln')"
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-pink-500 focus:outline-none h-20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-2">Spielregeln / Ablauf *</label>
              <textarea
                value={gameDesign.rules}
                onChange={(e) => setGameDesign({ ...gameDesign, rules: e.target.value })}
                placeholder="Schreib die Regeln auf. Wie funktioniert das Spiel? Was passiert in einer Runde? (z.B. '1. Spieler würfelt 2. Bewegung um X 3. Aktion ausführen')"
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-pink-500 focus:outline-none h-24"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Finale Details */}
      {gameDesign.step === 4 && (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Schritt 4/4: Finale Details</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-semibold text-slate-900 mb-2">Spielerzahl *</label>
                <input
                  type="text"
                  value={gameDesign.playerCount}
                  onChange={(e) => setGameDesign({ ...gameDesign, playerCount: e.target.value })}
                  placeholder="z.B. 2-4"
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-900 mb-2">Spieldauer *</label>
                <input
                  type="text"
                  value={gameDesign.duration}
                  onChange={(e) => setGameDesign({ ...gameDesign, duration: e.target.value })}
                  placeholder="z.B. 10-15 Min"
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-2">Was brauchst du zum Spielen? *</label>
              <textarea
                value={gameDesign.components}
                onChange={(e) => setGameDesign({ ...gameDesign, components: e.target.value })}
                placeholder="z.B. '1 Würfel, 4 Spielfiguren, 20 Kristall-Chips' oder 'Stift & Papier'"
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-pink-500 focus:outline-none h-20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {gameDesign.step > 1 && (
          <button
            onClick={prevStep}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all"
          >
            ← Zurück
          </button>
        )}
        {gameDesign.step < 4 && (
          <button
            onClick={nextStep}
            className="flex-1 px-6 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-all"
          >
            Weiter →
          </button>
        )}
        {gameDesign.step === 4 && (
          <button
            onClick={finishGame}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all text-lg"
          >
            ✅ Spiel fertigstellen!
          </button>
        )}
      </div>
    </div>
  )
}

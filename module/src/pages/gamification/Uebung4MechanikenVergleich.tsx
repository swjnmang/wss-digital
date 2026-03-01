import { useState } from 'react'

interface ComparisonGame {
  name: string
  mechanics: string[]
}

const predefinedGames: ComparisonGame[] = [
  {
    name: 'Siedler von Catan',
    mechanics: ['Ressourcen-Management', 'Verhandlung', 'Würfeln', 'Area Control'],
  },
  {
    name: 'Cascadia',
    mechanics: ['Tile-Placement', 'Pattern-Building', 'Solitär-Spielbar'],
  },
  {
    name: 'Carcassonne',
    mechanics: ['Tile-Placement', 'Area Control', 'Punkte-Scoring'],
  },
  {
    name: 'Dominion',
    mechanics: ['Deck-Building', 'Ressourcen-Management', 'Kartenziehen'],
  },
  {
    name: '7 Wonders',
    mechanics: ['Drafting', 'Zivilisations-Bau', 'Verhandlung'],
  },
  {
    name: 'Ticket to Ride',
    mechanics: ['Pfad-Bauen', 'Set-Collection', 'Area Control'],
  },
]

export default function Uebung4MechanikenVergleich() {
  const [selectedGames, setSelectedGames] = useState<string[]>([
    'Siedler von Catan',
    'Carcassonne',
  ])
  const [customGame, setCustomGame] = useState('')
  const [customMechanics, setCustomMechanics] = useState('')

  const toggleGame = (gameName: string) => {
    setSelectedGames(prev =>
      prev.includes(gameName)
        ? prev.filter(g => g !== gameName)
        : [...prev, gameName]
    )
  }

  const getSelectedGamesData = (): ComparisonGame[] => {
    let games = selectedGames
      .map(name => predefinedGames.find(g => g.name === name))
      .filter((g): g is ComparisonGame => g !== undefined)

    if (customGame && customMechanics) {
      games.push({
        name: customGame,
        mechanics: customMechanics
          .split(',')
          .map(m => m.trim())
          .filter(m => m),
      })
    }

    return games
  }

  const getAllMechanics = () => {
    const data = getSelectedGamesData()
    const mechanics = new Set<string>()
    data.forEach(game => {
      game.mechanics.forEach(m => mechanics.add(m))
    })
    return Array.from(mechanics).sort()
  }

  const getCommonMechanics = () => {
    const data = getSelectedGamesData()
    if (data.length === 0) return []

    const firstGameMechanics = new Set(data[0].mechanics)
    return data
      .slice(1)
      .reduce((common, game) => {
        return common.filter(m => game.mechanics.includes(m))
      }, Array.from(firstGameMechanics))
      .sort()
  }

  const getUniqueMechanics = () => {
    const all = getAllMechanics()
    const common = new Set(getCommonMechanics())
    return all.filter(m => !common.has(m))
  }

  const gameData = getSelectedGamesData()
  const commonMechanics = getCommonMechanics()
  const uniqueMechanics = getUniqueMechanics()

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-300">
        <h3 className="text-xl font-semibold text-purple-900 mb-2">🔄 Mechaniken-Vergleich</h3>
        <p className="text-purple-800 text-sm">
          Vergleiche bis zu 3 Spiele und entdecke, welche Mechaniken sie teilen und welche unique sind!
        </p>
      </div>

      {/* Game Selection */}
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Spiele auswählen (max. 3):</h4>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {predefinedGames.map(game => (
            <label
              key={game.name}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGames.includes(game.name)
                  ? 'bg-purple-200 border-purple-500'
                  : 'bg-slate-100 border-slate-300 hover:border-purple-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedGames.includes(game.name)}
                onChange={() => toggleGame(game.name)}
                disabled={selectedGames.length >= 3 && !selectedGames.includes(game.name)}
                className="mr-2"
              />
              <span className="font-semibold text-slate-900">{game.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Game */}
      <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-300">
        <label className="font-semibold text-slate-900 mb-2 block">Oder: Eigenes Spiel hinzufügen</label>
        <div className="space-y-2">
          <input
            type="text"
            value={customGame}
            onChange={(e) => setCustomGame(e.target.value)}
            placeholder="Spielname"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
          <input
            type="text"
            value={customMechanics}
            onChange={(e) => setCustomMechanics(e.target.value)}
            placeholder="Mechaniken (kommagetrennt, z.B.: Worker-Placement, Ressourcen-Management)"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Comparison Data */}
      {gameData.length > 0 && (
        <div className="space-y-6">
          {/* Vergleichstabelle */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border-2 border-purple-300">
              <thead>
                <tr className="bg-purple-200">
                  <th className="border border-purple-300 p-3 text-left font-semibold text-purple-900">Spiel</th>
                  {getAllMechanics().map(mechanic => (
                    <th
                      key={mechanic}
                      className={`border border-purple-300 p-3 text-center font-semibold text-sm ${
                        commonMechanics.includes(mechanic)
                          ? 'bg-green-100 text-green-900'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      {mechanic}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gameData.map(game => (
                  <tr key={game.name} className="hover:bg-slate-50">
                    <td className="border border-purple-300 p-3 font-semibold text-slate-900">{game.name}</td>
                    {getAllMechanics().map(mechanic => (
                      <td
                        key={`${game.name}-${mechanic}`}
                        className={`border border-purple-300 p-3 text-center ${
                          game.mechanics.includes(mechanic) ? 'bg-green-100' : 'bg-slate-50'
                        }`}
                      >
                        {game.mechanics.includes(mechanic) ? '✅' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            {commonMechanics.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
                <h4 className="font-semibold text-green-900 mb-2">🟢 Gemeinsame Mechaniken ({commonMechanics.length})</h4>
                <div className="space-y-1">
                  {commonMechanics.map(mechanic => (
                    <p key={mechanic} className="text-green-800 text-sm">
                      ✓ {mechanic}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {uniqueMechanics.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-300">
                <h4 className="font-semibold text-orange-900 mb-2">🟠 Unterschiedliche Mechaniken ({uniqueMechanics.length})</h4>
                <div className="space-y-1">
                  {uniqueMechanics.map(mechanic => (
                    <p key={mechanic} className="text-orange-800 text-sm">
                      • {mechanic}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Insights */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Erkenntnisse</h4>
            <div className="space-y-2 text-blue-800 text-sm">
              <p>📊 <strong>Gesamt unterschiedliche Mechaniken:</strong> {getAllMechanics().length}</p>
              <p>🟢 <strong>Gemeinsame Mechaniken:</strong> {commonMechanics.length}</p>
              <p>🟠 <strong>Einzigartige Mechaniken:</strong> {uniqueMechanics.length}</p>
              {gameData.length > 1 && (
                <p className="mt-3">
                  <strong>Fazit:</strong> Diese Spiele teilen {commonMechanics.length > 0 ? 'einige grundlegende Mechaniken' : 'keine Mechaniken'}, unterscheiden sich aber in ihrer Spielweise durch ihre speziellen Mechaniken deutlich.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {gameData.length === 0 && (
        <div className="bg-slate-100 rounded-lg p-6 text-center border-2 border-slate-300">
          <p className="text-slate-600">Wähle mindestens 1 Spiel aus, um den Vergleich zu starten! 🎮</p>
        </div>
      )}
    </div>
  )
}

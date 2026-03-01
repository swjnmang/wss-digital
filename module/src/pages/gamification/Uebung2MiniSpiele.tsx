import { useState } from 'react'

interface GameState {
  activeGame: 'worker' | 'tile' | 'set' | 'emotion' | null
}

export default function Uebung2MiniSpiele() {
  const [gameState, setGameState] = useState<GameState>({ activeGame: null })

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h3 className="text-2xl font-semibold text-slate-900 mb-2">Übung 2: Mini-Digital-Spiele</h3>
      <p className="text-slate-600 mb-6">Erlebe die Spielmechaniken hautnah!</p>

      {gameState.activeGame === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setGameState({ activeGame: 'worker' })}
            className="p-6 bg-blue-50 border-2 border-blue-300 rounded-lg hover:bg-blue-100 transition-all text-left"
          >
            <h4 className="font-semibold text-blue-900 mb-2">👷 Worker-Placement Simulator</h4>
            <p className="text-sm text-blue-800">Platziere deine Worker strategisch auf Aktionsfeldern</p>
          </button>

          <button
            onClick={() => setGameState({ activeGame: 'tile' })}
            className="p-6 bg-purple-50 border-2 border-purple-300 rounded-lg hover:bg-purple-100 transition-all text-left"
          >
            <h4 className="font-semibold text-purple-900 mb-2">🎨 Landschaften bauen (Tile-Placement)</h4>
            <p className="text-sm text-purple-800">Baue Gebiete aus miteinander verbundenen Landschafts-Tiles</p>
          </button>

          <button
            onClick={() => setGameState({ activeGame: 'set' })}
            className="p-6 bg-green-50 border-2 border-green-300 rounded-lg hover:bg-green-100 transition-all text-left"
          >
            <h4 className="font-semibold text-green-900 mb-2">🎴 Set-Collection Challenge</h4>
            <p className="text-sm text-green-800">Sammle Sets von Skat-Karten und gewinne Punkte</p>
          </button>

          <button
            onClick={() => setGameState({ activeGame: 'emotion' })}
            className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg hover:bg-yellow-100 transition-all text-left"
          >
            <h4 className="font-semibold text-yellow-900 mb-2">😊 Emotion-Tracking Game</h4>
            <p className="text-sm text-yellow-800">Spiel & dokumentiere Emotionen + Resilienz</p>
          </button>
        </div>
      ) : gameState.activeGame === 'worker' ? (
        <WorkerPlacementGame onBack={() => setGameState({ activeGame: null })} />
      ) : gameState.activeGame === 'tile' ? (
        <TilePlacementGame onBack={() => setGameState({ activeGame: null })} />
      ) : gameState.activeGame === 'set' ? (
        <SetCollectionGame onBack={() => setGameState({ activeGame: null })} />
      ) : (
        <EmotionTrackingGame onBack={() => setGameState({ activeGame: null })} />
      )}
    </div>
  )
}

function WorkerPlacementGame({ onBack }: { onBack: () => void }) {
  const fields = [
    { id: 'apple', name: '🍎 Äpfel', number: 1, color: 'bg-red-100', borderColor: 'border-red-400' },
    { id: 'pumpkin', name: '🎃 Kürbisse', number: 2, color: 'bg-orange-100', borderColor: 'border-orange-400' },
    { id: 'corn', name: '🌽 Mais', number: 3, color: 'bg-yellow-100', borderColor: 'border-yellow-400' },
    { id: 'grapes', name: '🍇 Trauben', number: 4, color: 'bg-purple-100', borderColor: 'border-purple-400' },
    { id: 'pear', name: '🍐 Birnen', number: 5, color: 'bg-lime-100', borderColor: 'border-lime-400' },
    { id: 'potato', name: '🥔 Kartoffeln', number: 6, color: 'bg-amber-100', borderColor: 'border-amber-400' },
  ]

  const [currentRound, setCurrentRound] = useState(0)
  const [workers, setWorkers] = useState<{ [key: string]: number }>({
    apple: 0,
    pumpkin: 0,
    corn: 0,
    grapes: 0,
    pear: 0,
    potato: 0,
  })
  const [resources, setResources] = useState<{ [key: string]: number }>({
    apple: 0,
    pumpkin: 0,
    corn: 0,
    grapes: 0,
    pear: 0,
    potato: 0,
  })
  const [diceResult, setDiceResult] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [draggedWorker, setDraggedWorker] = useState<string | null>(null)
  const [dragOverField, setDragOverField] = useState<string | null>(null)

  const totalWorkers = Object.values(workers).reduce((a, b) => a + b, 0)
  const availableWorkers = 4 - totalWorkers

  const handleDragStart = (e: React.DragEvent) => {
    setDraggedWorker('worker')
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverField(fieldId)
  }

  const handleDragLeave = () => {
    setDragOverField(null)
  }

  const handleDrop = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault()
    setDragOverField(null)

    if (draggedWorker && availableWorkers > 0) {
      setWorkers({ ...workers, [fieldId]: workers[fieldId] + 1 })
      setDraggedWorker(null)
    }
  }

  const handleRemoveWorker = (fieldId: string) => {
    if (workers[fieldId] > 0) {
      setWorkers({ ...workers, [fieldId]: workers[fieldId] - 1 })
    }
  }

  const rollDice = () => {
    const result = Math.floor(Math.random() * 6) + 1
    setDiceResult(result)
    setMessage('')

    let hasHarvest = false

    // Harvest resources based on dice roll
    fields.forEach(field => {
      if (workers[field.id] === result) {
        const harvestAmount = 10 * result
        setResources({ ...resources, [field.id]: resources[field.id] + harvestAmount })
        setMessage(`🎲 Würfel: ${result}! ${field.name}: +${harvestAmount} Ressourcen!`)
        hasHarvest = true
      }
    })

    // Feedback wenn nichts gewonnen wurde
    if (!hasHarvest) {
      setMessage(`🎲 Würfel: ${result}! Leider keine Worker auf dieser Zahl. Versuch es nächste Runde!`)
    }

    setTimeout(() => {
      if (currentRound < 4) {
        setCurrentRound(currentRound + 1)
        setWorkers({
          apple: 0,
          pumpkin: 0,
          corn: 0,
          grapes: 0,
          pear: 0,
          potato: 0,
        })
        setDiceResult(null)
      } else {
        // Game Over
        const score = Object.values(resources).reduce((a, b) => a + b, 0)
        setTotalScore(score)
        setGameOver(true)
      }
    }, 2000)
  }

  const resetGame = () => {
    setCurrentRound(0)
    setWorkers({
      apple: 0,
      pumpkin: 0,
      corn: 0,
      grapes: 0,
      pear: 0,
      potato: 0,
    })
    setResources({
      apple: 0,
      pumpkin: 0,
      corn: 0,
      grapes: 0,
      pear: 0,
      potato: 0,
    })
    setDiceResult(null)
    setMessage('')
    setGameOver(false)
    setTotalScore(0)
  }

  return (
    <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-blue-900">🌾 Ernte-Wettbewerb (Worker-Placement)</h4>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          ← Zurück
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4 border-2 border-blue-200">
        <h5 className="font-semibold text-blue-900 mb-2">📖 Anleitung:</h5>
        <p className="text-blue-800 text-sm leading-relaxed">
          Es ist Herbst! Du hast <strong>4 Erntehelfer</strong> und 6 Erntefelder, jeweils nummeriert 1-6. <strong>Dein Ziel:</strong> 
          Ziehe deine <strong>Helfer-Plättchen</strong> auf die Felder, die du unterstützen möchtest. <br/>
          <br/>
          Nach jeder Runde wird ein <strong>Würfel geworfen (1-6)</strong>. <strong>Wenn die Würfelzahl genau der Nummer deines Feldes entspricht:</strong> 
          Du erhältst <strong>10 × Würfelergebnis</strong> Ressourcen von diesem Feld! (z.B. Würfel 3 + Helfer auf Feld 3 = 30 Ressourcen)
          <br/><br/>
          <strong>Strategie:</strong> Verteil deine 4 Helfer klug über die 6 Felder. Welche Nummern sind am häufigsten?
          <br/><br/>
          <strong>Warum?</strong> Worker-Placement: Taktische Kontrolle + Würfel-Glück = echtes Spiel-Feeling!
        </p>
      </div>

      {!gameOver ? (
        <>
          <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-lg border-2 border-blue-300">
            <div>
              <p className="font-semibold text-blue-900">Runde: {currentRound + 1} / 5</p>
              <p className="text-sm text-blue-700">Worker verfügbar: {availableWorkers} / 4</p>
            </div>
          </div>

          {/* Worker Pool - Draggable */}
          <div className="mb-6 p-4 bg-white rounded-lg border-2 border-blue-400">
            <p className="font-semibold text-blue-900 mb-3">👷 Deine Erntehelfer (Ziehen & Ablegen):</p>
            <div className="flex gap-2 flex-wrap">
              {Array(availableWorkers)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={handleDragStart}
                    onDragEnd={() => setDraggedWorker(null)}
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg font-bold text-lg cursor-move hover:bg-blue-600 transition-all shadow-lg"
                    title="Ziehen & auf ein Feld ablegen"
                  >
                    👷
                  </div>
                ))}
            </div>
            {availableWorkers === 0 && (
              <p className="text-sm text-blue-600 italic mt-2">Alle Helfer verteilt! Würfle jetzt!</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {fields.map(field => (
            <div
              key={field.id}
              onDragOver={(e) => handleDragOver(e, field.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, field.id)}
              className={`p-4 rounded-lg border-4 transition-all ${field.color} ${
                dragOverField === field.id ? 'border-blue-600 bg-blue-50 scale-105' : field.borderColor
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold text-slate-900">{field.name}</p>
                  <p className="text-xs font-bold text-slate-600">Feld {field.number}</p>
                </div>
                <span className="font-bold text-green-700 bg-white px-2 py-1 rounded text-sm">{resources[field.id]}</span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleRemoveWorker(field.id)}
                  disabled={workers[field.id] === 0}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm disabled:bg-slate-300"
                  title="Helfer entfernen"
                >
                  −
                </button>
                <span className="font-bold text-lg">{workers[field.id]} 👷</span>
                <div className="w-8" />
              </div>
            </div>
            ))}
          </div>

          <button
            onClick={rollDice}
            disabled={totalWorkers === 0 || diceResult !== null}
            className={`w-full px-6 py-6 rounded-lg font-bold text-white text-lg transition-all min-h-[120px] flex flex-col items-center justify-center ${
              totalWorkers === 0 || diceResult !== null
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {diceResult !== null ? (
              <>
                <div className="text-5xl font-black mb-2 animate-spin">🎲</div>
                <div className="text-3xl font-black mb-2">{diceResult}</div>
                {message && (
                  <div className="text-sm font-semibold text-yellow-200 text-center">{message}</div>
                )}
              </>
            ) : (
              <>
                <div className="text-3xl mb-1">🎲</div>
                <div>Würfeln!</div>
              </>
            )}
          </button>
        </>
      ) : (
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6 text-center">
          <p className="font-bold text-green-900 text-xl mb-3">🎉 Ernte vorbei!</p>
          <p className="text-green-900 mb-2">Gesamte Ressourcen eingefahren:</p>
          <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
            {fields.map(field => (
              <div key={field.id} className="bg-white p-2 rounded">
                <p className="font-semibold">{field.name}</p>
                <p className="text-green-700 font-bold">{resources[field.id]}</p>
              </div>
            ))}
          </div>
          <p className="text-green-800 font-bold text-lg mb-4">🏆 Gesamt: {totalScore} Ressourcen</p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
          >
            🔄 Neue Saison starten
          </button>
          <p className="text-sm text-green-800 mt-4">
            💡 <strong>Worker-Placement:</strong> Strategische Planung + Glück = spannend!
          </p>
        </div>
      )}
    </div>
  )
}

function TilePlacementGame({ onBack }: { onBack: () => void }) {
  type Territory = 'forest' | 'meadow' | 'water' | 'empty'

  interface TileCard {
    left: Territory
    right: Territory
  }

  const generateTile = (): TileCard => {
    const territories: Territory[] = ['forest', 'meadow', 'water']
    return {
      left: territories[Math.floor(Math.random() * 3)],
      right: territories[Math.floor(Math.random() * 3)],
    }
  }

  const getTerritoryColor = (territory: Territory): string => {
    switch (territory) {
      case 'forest': return 'bg-green-500'
      case 'meadow': return 'bg-yellow-400'
      case 'water': return 'bg-blue-400'
      default: return 'bg-slate-200'
    }
  }

  const getTerritoryEmoji = (territory: Territory): string => {
    switch (territory) {
      case 'forest': return '🌳'
      case 'meadow': return '🌾'
      case 'water': return '💧'
      default: return '?'
    }
  }

  const calculateScore = (row: TileCard[]): number => {
    if (row.length === 0) return 0

    let score = 0

    // Zähle zusammenhängende Gebiete
    const getConnectedCount = (
      tiles: TileCard[],
      territory: Territory
    ): { count: number; indices: Set<number> }[] => {
      const groups: { count: number; indices: Set<number> }[] = []
      const visited = new Set<number>()

      for (let i = 0; i < tiles.length; i++) {
        if (visited.has(i)) continue

        const tile = tiles[i]
        if (tile.left === territory || tile.right === territory) {
          const group = new Set<number>()
          const queue = [i]

          while (queue.length > 0) {
            const idx = queue.shift()!
            if (visited.has(idx)) continue
            visited.add(idx)
            group.add(idx)

            const currentTile = tiles[idx]
            if (currentTile.right === territory && idx + 1 < tiles.length) {
              if (!visited.has(idx + 1) && (tiles[idx + 1].left === territory)) {
                queue.push(idx + 1)
              }
            }
            if (currentTile.left === territory && idx - 1 >= 0) {
              if (!visited.has(idx - 1) && (tiles[idx - 1].right === territory)) {
                queue.push(idx - 1)
              }
            }
          }

          if (group.size > 0) {
            groups.push({ count: group.size, indices: group })
          }
        }
      }

      return groups
    }

    // Punkte für Gebiete
    const forests = getConnectedCount(row, 'forest')
    const meadows = getConnectedCount(row, 'meadow')
    const waters = getConnectedCount(row, 'water')

    forests.forEach(group => {
      score += group.count * 5 // 5 Punkte pro Wald-Tile in einer Gruppe
    })
    meadows.forEach(group => {
      score += group.count * 3 // 3 Punkte pro Wiesen-Tile in einer Gruppe
    })
    waters.forEach(group => {
      score += group.count * 4 // 4 Punkte pro Wasser-Tile in einer Gruppe
    })

    // Bonus für vollständige Reihe
    if (row.length >= 6) {
      score += 20
    }

    return score
  }

  const [hand, setHand] = useState<TileCard[]>([generateTile(), generateTile(), generateTile()])
  const [row, setRow] = useState<TileCard[]>([])
  const [roundsPlayed, setRoundsPlayed] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState('')
  const [roundScore, setRoundScore] = useState(0)

  const handlePlaceTile = (tileIndex: number) => {
    const tile = hand[tileIndex]
    const newRow = [...row, tile]
    setRow(newRow)

    const newHand = hand.filter((_, idx) => idx !== tileIndex)
    setHand([...newHand, generateTile()])

    const score = calculateScore(newRow)
    setRoundScore(score)
    setMessage(`✅ Tile gelegt! +${score - roundScore} Punkte`)
    setTimeout(() => setMessage(''), 1500)

    if (newRow.length >= 8) {
      // Runde zu Ende
      setTimeout(() => {
        const finalScore = calculateScore(newRow)
        setTotalScore(totalScore + finalScore)
        setRoundScore(0)
        setRow([])
        setRoundsPlayed(roundsPlayed + 1)

        if (roundsPlayed + 1 >= 3) {
          setGameOver(true)
        } else {
          setMessage(`📊 Runde fertig! Neue Reihe startet...`)
        }
      }, 1500)
    }
  }

  const endRound = () => {
    if (row.length === 0) {
      setMessage('❌ Lege mindestens 1 Tile!')
      setTimeout(() => setMessage(''), 1500)
      return
    }

    const finalScore = calculateScore(row)
    setTotalScore(totalScore + finalScore)
    setRoundScore(0)
    setRow([])
    setRoundsPlayed(roundsPlayed + 1)

    if (roundsPlayed + 1 >= 3) {
      setGameOver(true)
    } else {
      setMessage(`📊 Runde fertig! Neue Reihe startet...`)
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const resetGame = () => {
    setHand([generateTile(), generateTile(), generateTile()])
    setRow([])
    setRoundsPlayed(0)
    setTotalScore(0)
    setGameOver(false)
    setMessage('')
    setRoundScore(0)
  }

  if (gameOver) {
    return (
      <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-300">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold text-purple-900">🎨 Landschaften bauen (Tile-Placement)</h4>
          <button onClick={onBack} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">← Zurück</button>
        </div>
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6 text-center">
          <p className="font-bold text-green-900 text-xl mb-3">🎉 Spiel fertig!</p>
          <p className="text-green-900 mb-2">Du hast <strong>{roundsPlayed} Runden</strong> gespielt</p>
          <p className="text-green-800 font-bold text-2xl mb-4">🏆 Gesamtpunkte: {totalScore}</p>
          <button onClick={resetGame} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all">
            🔄 Neues Spiel starten
          </button>
          <p className="text-sm text-green-800 mt-4">
            💡 <strong>Tile-Placement:</strong> Zusammenhängende Gebiete = mehr Punkte!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-300">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-purple-900">🎨 Landschaften bauen (Tile-Placement)</h4>
        <button onClick={onBack} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">← Zurück</button>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4 border-2 border-purple-200">
        <h5 className="font-semibold text-purple-900 mb-2">📖 Anleitung:</h5>
        <p className="text-purple-800 text-sm leading-relaxed">
          <strong>Dein Ziel:</strong> Baue Landschaften aus miteinander verbundenen Gebieten!
          <br /><br />
          <strong>Wie geht es:</strong> Jedes Tile hat 2 Territoriumstypen: 🌳 Wald, 🌾 Wiese, 💧 Wasser.
          Lege Tiles in einer Reihe aneinander an. Je größer eine zusammenhängende Gebietsgruppe, desto mehr Punkte!
          <br /><br />
          <strong>Punkte:</strong> Wald +5 pro Tile | Wiese +3 pro Tile | Wasser +4 pro Tile | Bonus +20 für 6+ Tiles
          <br /><br />
          <strong>3 Runden</strong> spielen. Dann zählen wir zusammen!
        </p>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded border-2 border-purple-400">
          <p className="font-semibold text-purple-900">Runde:</p>
          <p className="text-2xl font-bold text-purple-700">{roundsPlayed + 1} / 3</p>
        </div>
        <div className="bg-white p-4 rounded border-2 border-purple-400">
          <p className="font-semibold text-purple-900">Tiles in Reihe:</p>
          <p className="text-2xl font-bold text-purple-700">{row.length} / 8</p>
        </div>
        <div className="bg-white p-4 rounded border-2 border-purple-400">
          <p className="font-semibold text-green-900">Punkte diese Runde:</p>
          <p className="text-2xl font-bold text-green-700">{roundScore}</p>
        </div>
      </div>

      {message && <p className="text-purple-800 font-semibold mb-4 p-3 bg-white rounded border border-purple-300">{message}</p>}

      {/* Current Row Visualization */}
      {row.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-purple-400">
          <p className="font-semibold text-purple-900 mb-3">📍 Aktuelle Reihe:</p>
          <div className="flex gap-2 flex-wrap">
            {row.map((tile, idx) => (
              <div
                key={idx}
                className="flex border-4 border-purple-600 rounded-lg overflow-hidden shadow-lg"
              >
                <div className={`w-16 h-16 flex items-center justify-center font-bold text-2xl ${getTerritoryColor(tile.left)}`}>
                  {getTerritoryEmoji(tile.left)}
                </div>
                <div className={`w-16 h-16 flex items-center justify-center font-bold text-2xl ${getTerritoryColor(tile.right)}`}>
                  {getTerritoryEmoji(tile.right)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hand */}
      <div className="mb-4">
        <p className="font-semibold text-purple-900 mb-3">🎴 Deine Hand (Wähle ein Tile):</p>
        <div className="flex gap-3 flex-wrap">
          {hand.map((tile, idx) => (
            <button
              key={idx}
              onClick={() => handlePlaceTile(idx)}
              disabled={row.length >= 8}
              className="flex border-4 border-purple-500 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className={`w-16 h-16 flex items-center justify-center font-bold text-2xl ${getTerritoryColor(tile.left)}`}>
                {getTerritoryEmoji(tile.left)}
              </div>
              <div className={`w-16 h-16 flex items-center justify-center font-bold text-2xl ${getTerritoryColor(tile.right)}`}>
                {getTerritoryEmoji(tile.right)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* End Round Button */}
      <button
        onClick={endRound}
        disabled={row.length === 0}
        className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all ${
          row.length === 0
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        ✅ Runde beenden (Score: {calculateScore(row)} Punkte)
      </button>

      <p className="text-xs text-purple-700 mt-3 text-center">
        Lege Tiles in einer Reihe an. Größere zusammenhängende Gebiete = mehr Punkte!
      </p>
    </div>
  )
}

function SetCollectionGame({ onBack }: { onBack: () => void }) {
  const skatSuits = ['♠️ Spade', '♥️ Herz', '♦️ Karo', '♣️ Kreuz']
  const skatValues = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A']

  const [hand, setHand] = useState<string[]>([
    '♠️ 7',
    '♠️ 8',
    '♥️ 7',
    '♥️ 9',
    '♦️ 7',
    '♦️ 8',
  ])
  const [sets, setSets] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')

  const drawCard = () => {
    const randomSuit = skatSuits[Math.floor(Math.random() * skatSuits.length)]
    const randomValue = skatValues[Math.floor(Math.random() * skatValues.length)]
    setHand([...hand, `${randomSuit} ${randomValue}`])
  }

  const checkAndRemoveSet = (value: string) => {
    const count = hand.filter(c => c.includes(value)).length
    if (count >= 3) {
      setHand(hand.filter(c => !c.includes(value)))
      setSets(sets + 1)
      setScore(score + 30)
      setMessage(`Set von ${value}en gesammelt! +30 Punkte`)
      setTimeout(() => setMessage(''), 2000)
      return true
    }
    return false
  }

  return (
    <div className="bg-green-50 rounded-lg p-6 border-2 border-green-300">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-green-900">🎴 Set-Collection Challenge</h4>
        <button onClick={onBack} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          ← Zurück
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4 border-2 border-green-200">
        <h5 className="font-semibold text-green-900 mb-2">📖 Anleitung:</h5>
        <p className="text-green-800 text-sm leading-relaxed">
          Du sammelst <strong>Skat-Karten</strong>. <strong>Dein Ziel:</strong> Sammle 3 oder mehr Karten mit dem gleichen Wert 
          (z.B. drei 7en) um ein <strong>Set</strong> zu bilden und +30 Punkte zu verdienen!
          <br/><br/>
          <strong>Hinweis:</strong> Ziehe neue Karten und überlege strategisch, welche Werte du brauchst.
          <br/><br/>
          <strong>Warum?</strong> Set-Collection ist zentral in Spielen wie Rommé oder Kniffel: 
          Sammle zusammengehörige Teile um Belohnungen zu erhalten!
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-green-900">🎴 Hand: {hand.join(' | ')}</p>
        <p className="font-semibold text-green-900 mt-2">Sets gesammelt: {sets} | 🏆 Punkte: {score}</p>
        {message && <p className="text-green-600 font-semibold mt-2">✓ {message}</p>}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {skatValues.map(value => (
          <button
            key={value}
            onClick={() => checkAndRemoveSet(value)}
            className="px-3 py-2 bg-white border-2 border-green-400 rounded font-semibold text-green-900 hover:bg-green-100 transition-all"
          >
            Set von {value}en?
          </button>
        ))}
      </div>

      <button
        onClick={drawCard}
        className="w-full px-4 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-all"
      >
        🎴 Karte ziehen
      </button>

      <p className="text-sm text-green-800 mt-4">
        💡 <strong>Set-Collection:</strong> Sammle 3+ Karten des gleichen Wertes um Punkte zu verdienen. Strategisch planen zahlt sich aus!
      </p>
    </div>
  )
}

function EmotionTrackingGame({ onBack }: { onBack: () => void }) {
  const [currentEvent, setCurrentEvent] = useState(0)
  const [step, setStep] = useState<'emotion' | 'coping'>('emotion')
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [resilience, setResilience] = useState(3)
  const [feedback, setFeedback] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [adaptiveCount, setAdaptiveCount] = useState(0)

  const gameEvents = [
    {
      scenario: '⚽ Fußball: Du schießt auf das Tor, aber der Torwart hält meisterhaft!',
      emotions: [
        { name: 'Enttäuschung', type: 'negative' },
        { name: 'Frustration', type: 'negative' },
        { name: 'Motivation', type: 'positive' },
        { name: 'Bewunderung', type: 'positive' },
      ],
      copingStrategies: [
        {
          name: 'Mit meinem Team analysieren, was ich falsch gemacht habe',
          type: 'problem-focused',
          adaptive: true,
          feedback: '✅ Problem-focused! Du suchst aktiv nach Lösungen. Das stärkt Resilienz!',
        },
        {
          name: 'Mich kurz ärgern, dann den nächsten Versuch planen',
          type: 'emotion-focused',
          adaptive: true,
          feedback: '⚡ Emotion-focused! Du regulierst deine Gefühle. Gute Balance!',
        },
        {
          name: 'Das Spiel abbrechen, weil ich ohnehin nicht gut bin',
          type: 'avoidance',
          adaptive: false,
          feedback: '❌ Vermeidung! Das verhindert Lernfortschritt. Versuch, dich der Herausforderung zu stellen!',
        },
      ],
    },
    {
      scenario: '🎮 Videospiel: Du besiegst einen schwierigen Boss beim ersten Versuch!',
      emotions: [
        { name: 'Freude', type: 'positive' },
        { name: 'Stolz', type: 'positive' },
        { name: 'Überraschung', type: 'positive' },
        { name: 'Erleichterung', type: 'positive' },
      ],
      copingStrategies: [
        {
          name: 'Mit Freunden teilen und gemeinsam weiterspielen',
          type: 'problem-focused',
          adaptive: true,
          feedback: '✅ Problem-focused + sozial! Du nutzt positive Momente sinnvoll. Super!',
        },
        {
          name: 'Die Emotion genießen und den Erfolg feiern',
          type: 'emotion-focused',
          adaptive: true,
          feedback: '⚡ Emotion-focused! Positive Emotionen zu savoring ist gesund!',
        },
        {
          name: 'Schnell zum nächsten Bild springen, ohne es zu genießen',
          type: 'avoidance',
          adaptive: false,
          feedback: '❌ Du verpasst den Moment! Lerne auch, Erfolge zu schätzen!',
        },
      ],
    },
    {
      scenario: '🃏 Brettspiel: Dein Mitspieler macht einen unerwarteten strategischen Zug, der dich blockiert.',
      emotions: [
        { name: 'Frustration', type: 'negative' },
        { name: 'Überraschung', type: 'positive' },
        { name: 'Respekt', type: 'positive' },
        { name: 'Herausforderung', type: 'positive' },
      ],
      copingStrategies: [
        {
          name: 'Nach dem Spiel fragen, warum dieser Zug strategisch war',
          type: 'problem-focused',
          adaptive: true,
          feedback: '✅ Problem-focused! Du lernst von anderen. Das ist klug!',
        },
        {
          name: 'Mich kurz frustriert fühlen, dann einen neuen Plan machen',
          type: 'emotion-focused',
          adaptive: true,
          feedback: '⚡ Emotion-focused! Du akzeptierst die Emotion & handlest trotzdem.',
        },
        {
          name: 'Wütend reagieren und den anderen kritisieren',
          type: 'avoidance',
          adaptive: false,
          feedback: '❌ Das beschädigt Beziehungen. Versuch, Frustration schneller zu überwinden!',
        },
      ],
    },
    {
      scenario: '🏀 Basketball: Du triffst einen 3-Pointer und dein Team jubelt!',
      emotions: [
        { name: 'Freude', type: 'positive' },
        { name: 'Stolz', type: 'positive' },
        { name: 'Zusammengehörigkeitsgefühl', type: 'positive' },
        { name: 'Motivation', type: 'positive' },
      ],
      copingStrategies: [
        {
          name: 'Das Momentum nutzen & noch besser spielen',
          type: 'problem-focused',
          adaptive: true,
          feedback: '✅ Problem-focused! Du hebst das positive Gefühl auf Leistung!',
        },
        {
          name: 'Mit dem Team den Moment gemeinsam genießen',
          type: 'emotion-focused',
          adaptive: true,
          feedback: '⚡ Emotion-focused! Gemeinsames Feiern stärkt die Gruppe!',
        },
        {
          name: 'Zu entspannt werden und konzentrieren dich nicht mehr',
          type: 'avoidance',
          adaptive: false,
          feedback: '❌ Überconfidence! Bleib konzentriert, auch nach Erfolgen!',
        },
      ],
    },
    {
      scenario: '🎲 Würfelspiel: Du würfelst eine sehr schlechte Zahl zum kritischsten Moment.',
      emotions: [
        { name: 'Pech', type: 'negative' },
        { name: 'Frustration', type: 'negative' },
        { name: 'Verständnis', type: 'positive' },
        { name: 'Neugierde', type: 'positive' },
      ],
      copingStrategies: [
        {
          name: 'Akzeptieren, dass Glück Teil des Spiels ist & weitermachen',
          type: 'problem-focused',
          adaptive: true,
          feedback: '✅ Problem-focused! Du erkennst, was du kontrollieren kannst.',
        },
        {
          name: 'Einen Moment traurig sein, dann sich selbst ermutigen',
          type: 'emotion-focused',
          adaptive: true,
          feedback: '⚡ Emotion-focused! Deine Selbstermuutigung ist wichtig!',
        },
        {
          name: 'Das Spiel aufgeben, weil "eh alles Zufall"',
          type: 'avoidance',
          adaptive: false,
          feedback: '❌ Passivität! In jedem Spiel gibt es Raum für Einfluss. Such ihn!',
        },
      ],
    },
    {
      scenario: '🏃 Marathon: Nach Kilometern der Anstrengung siehst du die Ziellinie!',
      emotions: [
        { name: 'Entschlossenheit', type: 'positive' },
        { name: 'Freude', type: 'positive' },
        { name: 'Stolz', type: 'positive' },
        { name: 'Erleichterung', type: 'positive' },
      ],
      copingStrategies: [
        {
          name: 'Der Schmerz motiviert dich — den ganzen Weg stark gehen!',
          type: 'problem-focused',
          adaptive: true,
          feedback: '✅ Problem-focused! Du nutzt positive Visualisierung!',
        },
        {
          name: 'Dich selbst anfeuern und mit jeder Emotion vorwärts gehen',
          type: 'emotion-focused',
          adaptive: true,
          feedback: '⚡ Emotion-focused! Selbstgespräche sind ein starkes Werkzeug!',
        },
        {
          name: 'Zusammenbrechen und aufgeben, weil es zu hart ist',
          type: 'avoidance',
          adaptive: false,
          feedback: '❌ Resignation! Resilienz ist, weiterzumachen, WENN es schwer wird!',
        },
      ],
    },
    {
      scenario: '🎪 Gesellschaftsspiel: Ein Spieler macht einen dummen Fehler und verliert.',
      emotions: [
        { name: 'Mitleid', type: 'positive' },
        { name: 'Schadenfreude', type: 'negative' },
        { name: 'Humor', type: 'positive' },
        { name: 'Verständnis', type: 'positive' },
      ],
      copingStrategies: [
        {
          name: 'Den Spieler trösten & gemeinsam über den Fehler lachen',
          type: 'problem-focused',
          adaptive: true,
          feedback: '✅ Problem-focused! Du baust soziale Bindung auf (Bonding)!',
        },
        {
          name: 'Dem Spieler sagen, dass Fehler normal sind & weitermachen',
          type: 'emotion-focused',
          adaptive: true,
          feedback: '⚡ Emotion-focused! Du hilfst dem anderen, die Emotion zu regulieren!',
        },
        {
          name: 'Über den Fehler lachen & den Spieler kritisieren',
          type: 'avoidance',
          adaptive: false,
          feedback: '❌ Das verletzt! Empathie = echte Stärke. Lerne, dich in andere zu versetzen!',
        },
      ],
    },
    {
      scenario: '🎸 Musikwettbewerb: Du vergisst mitten in deinem Solo einen Teil des Lieds.',
      emotions: [
        { name: 'Panik', type: 'negative' },
        { name: 'Scham', type: 'negative' },
        { name: 'Bestimmtheit', type: 'positive' },
        { name: 'Vergebung (gegen mich selbst)', type: 'positive' },
      ],
      copingStrategies: [
        {
          name: 'Improviisieren & den Fehler kaschieren — das Show muss weitergehen!',
          type: 'problem-focused',
          adaptive: true,
          feedback: '✅ Problem-focused! Du findest aktiv einen Ausweg!',
        },
        {
          name: 'Tief durchatmen, den Fehler akzeptieren & weiterspielen',
          type: 'emotion-focused',
          adaptive: true,
          feedback: '⚡ Emotion-focused! Akzeptanz ist auch eine Form von Stärke!',
        },
        {
          name: 'Abbrechen & die Bühne verlassen, weil ich versagt habe',
          type: 'avoidance',
          adaptive: false,
          feedback: '❌ Selbstsabotage! Die meisten Menschen vergeben Fehler schneller als du!',
        },
      ],
    },
    {
      scenario: '🎯 Nach mehreren Versuchen erreichst du endlich dein Ziel (z.B. Persistenz-Test)!',
      emotions: [
        { name: 'Erleichterung', type: 'positive' },
        { name: 'Freude', type: 'positive' },
        { name: 'Stolz', type: 'positive' },
        { name: 'Zuversicht', type: 'positive' },
      ],
      copingStrategies: [
        {
          name: 'Reflektieren, warum der letzte Versuch funktioniert hat',
          type: 'problem-focused',
          adaptive: true,
          feedback: '✅ Problem-focused! Du lernst aus Erfolg — sehr wertvoll!',
        },
        {
          name: 'Den Erfolg feiern & genießen, bevor ich weitermache',
          type: 'emotion-focused',
          adaptive: true,
          feedback: '⚡ Emotion-focused! Belohnungspausen sind wichtig für Motivation!',
        },
        {
          name: 'Sofort zum nächsten Ziel hetzen — keine Zeit zu feiern',
          type: 'avoidance',
          adaptive: false,
          feedback: '❌ Burnout-Gefahr! Erfolge verdienen Anerkennung!',
        },
      ],
    },
  ]

  const event = gameEvents[currentEvent]

  const handleEmotionSelect = (emotionName: string) => {
    setSelectedEmotion(emotionName)
    setStep('coping')
  }

  const handleCopingStrategy = (strategy: typeof event.copingStrategies[0]) => {
    setFeedback(strategy.feedback)

    if (strategy.adaptive) {
      setResilience(Math.min(10, resilience + 1))
      setAdaptiveCount(adaptiveCount + 1)
    } else {
      setResilience(Math.max(0, resilience - 1))
    }

    setTimeout(() => {
      if (currentEvent < gameEvents.length - 1) {
        setCurrentEvent(currentEvent + 1)
        setStep('emotion')
        setSelectedEmotion(null)
        setFeedback('')
      } else {
        setGameOver(true)
      }
    }, 2500)
  }

  return (
    <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-300">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-yellow-900">😊 Emotion & Coping-Strategien Game</h4>
        <button onClick={onBack} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
          ← Zurück
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4 border-2 border-yellow-200">
        <h5 className="font-semibold text-yellow-900 mb-2">📖 Anleitung & Ziel:</h5>
        <p className="text-yellow-800 text-sm leading-relaxed">
          <strong>Das Spiel:</strong> Wir stellen dir realistische Szenarien vor. 
          <br/><br/>
          <strong>Dein Weg:</strong> 
          1️⃣ Erkenne die Emotion, die du empfindest (basierend auf PANAS) 
          2️⃣ Wähle eine Coping-Strategie (Problem-focused / Emotion-focused / Avoidance)
          <br/><br/>
          <strong>Das Ziel:</strong> Lerne, adaptive Strategien zu nutzen! 
          <strong>Problem-focused</strong> (aktiv ein Problem lösen) & <strong>Emotion-focused</strong> (Gefühle regulieren) 
          sind beide adaptiv. <strong>Avoidance</strong> (vermeiden) ist kurzfristig einfacher, aber langfristig schädlich.
          <br/><br/>
          <strong>Resilienz:</strong> Basiert auf adaptiven Entscheidungen, nicht bloß auf Gefühle!
        </p>
      </div>

      {!gameOver ? (
        <>
          <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-lg border-2 border-yellow-300">
            <div>
              <p className="font-semibold text-yellow-900">Szenario {currentEvent + 1} / {gameEvents.length}</p>
              <p className="text-sm text-yellow-700">Adaptive Strategien: {adaptiveCount}</p>
            </div>
            <p className="font-semibold text-yellow-900">Resilienz: {'⭐'.repeat(resilience)}</p>
          </div>

          <div className="w-full bg-yellow-200 rounded-full h-2 mb-6">
            <div
              className="bg-yellow-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentEvent + 1) / gameEvents.length) * 100}%` }}
            />
          </div>

          <div className="bg-white border-2 border-yellow-400 rounded-lg p-5 mb-6">
            <p className="text-lg font-semibold text-yellow-900 mb-3">📍 Szenario:</p>
            <p className="text-yellow-800 leading-relaxed mb-4">{event.scenario}</p>
          </div>

          {step === 'emotion' ? (
            <>
              <p className="font-semibold text-yellow-900 mb-3">1️⃣ Welche Emotion empfindest du?</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {event.emotions.map(emotion => (
                  <button
                    key={emotion.name}
                    onClick={() => handleEmotionSelect(emotion.name)}
                    className="p-4 rounded-lg font-semibold transition-all bg-white border-2 border-slate-400 text-slate-900 hover:bg-slate-100"
                  >
                    {emotion.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-yellow-900 mb-3">
                2️⃣ Deine Emotion ist: <span className="text-xl">{selectedEmotion}</span>
              </p>
              <p className="font-semibold text-yellow-900 mb-3">Wie gehst du damit um?</p>
              <div className="space-y-3">
                {event.copingStrategies.map((strategy, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopingStrategy(strategy)}
                    className={`w-full p-4 rounded-lg text-left font-semibold transition-all border-2 ${
                      strategy.type === 'problem-focused'
                        ? 'bg-green-100 border-green-400 text-green-900 hover:bg-green-200'
                        : strategy.type === 'emotion-focused'
                        ? 'bg-blue-100 border-blue-400 text-blue-900 hover:bg-blue-200'
                        : 'bg-red-100 border-red-400 text-red-900 hover:bg-red-200'
                    }`}
                  >
                    {strategy.name}
                    <span className="text-xs block mt-1 opacity-75">
                      {strategy.type === 'problem-focused'
                        ? 'Problem-focused'
                        : strategy.type === 'emotion-focused'
                        ? 'Emotion-focused'
                        : 'Avoidance'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {feedback && (
            <div className="mt-4 p-4 bg-white border-2 border-yellow-400 rounded-lg animate-fadeIn">
              <p className="text-yellow-900 font-semibold">{feedback}</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6 text-center">
          <p className="font-bold text-green-900 text-xl mb-3">🎮 Spiel beendet!</p>
          <p className="text-green-900 mb-2">
            Du hast <strong>{adaptiveCount} adaptive Strategien</strong> gewählt!
          </p>
          <p className="text-green-800 font-bold text-lg mb-4">
            🏆 Dein Resilienz-Level: {'⭐'.repeat(resilience)}
          </p>
          <p className="text-sm text-green-800 leading-relaxed">
            💡 <strong>Was ist Resilienz?</strong> Es ist nicht, keine Emotionen zu haben. Es ist, adaptive Wege zu finden, 
            mit schwierigen Situationen umzugehen. <strong>Problem-focused</strong> (aktiv lösen) & <strong>Emotion-focused</strong> 
            (Gefühle regulieren) sind beide wertvoll. <strong>Avoidance</strong> führt zu Stagnation.
          </p>
        </div>
      )}
    </div>
  )
}

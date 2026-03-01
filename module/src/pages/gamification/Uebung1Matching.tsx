import { useState, useMemo } from 'react'

interface MatchingPair {
  id: string
  term: string
  definition: string
  matched: boolean
}

interface WrongMatch {
  termId: string
  definitionId: string
}

export default function Uebung1Matching() {
  const [matches, setMatches] = useState<MatchingPair[]>([
    {
      id: '1',
      term: 'Tile-Placement',
      definition: 'Das Legen von Spielelementen auf einem Brett, um eine Landschaft zu gestalten, Gebiete zu beanspruchen oder Aktionen auszulösen.',
      matched: false,
    },
    {
      id: '2',
      term: 'Set-Collection',
      definition: 'Das Sammeln von zusammengehörigen Elementen (z.B. Karten einer Farbe, gleiche Zahlen, bestimmte Rohstoffe).',
      matched: false,
    },
    {
      id: '3',
      term: 'Worker-Placement',
      definition: 'Das Einsetzen von Spielfiguren auf Aktionsfelder, um eine bestimmte Aktion für sich zu beanspruchen.',
      matched: false,
    },
    {
      id: '4',
      term: 'Deckbuilding',
      definition: 'Spieler starten mit einem kleinen Kartenstapel und kaufen im Laufe des Spiels stärkere Karten hinzu, um ihre Sammlung zu verbessern.',
      matched: false,
    },
    {
      id: '5',
      term: 'Resilienz',
      definition: 'Die Fähigkeit, mit Pech, Rückschlägen oder Niederlagen umzugehen und trotzdem motiviert weiterzuspielen.',
      matched: false,
    },
    {
      id: '6',
      term: 'Punkte',
      definition: 'Zahlenwerte, die Spieler für erfolgreiche Aktionen erhalten und die oft zum Bestimmen des Siegers dienen.',
      matched: false,
    },
    {
      id: '7',
      term: 'Missionen/Quests',
      definition: 'Spezifische Aufgaben oder Ziele, die Spieler während des Spiels erfüllen müssen, um Fortschritt oder Belohnungen zu erhalten.',
      matched: false,
    },
    {
      id: '8',
      term: 'Abzeichen/Erfolge',
      definition: 'Virtuelle Auszeichnungen, die Spieler für besondere Leistungen oder Meilensteine verdienen.',
      matched: false,
    },
    {
      id: '9',
      term: 'Ranglisten/Level',
      definition: 'Ein System, das den Fortschritt von Spielern sichtbar macht und sie nach Leistung ordnet oder in Stufen einteilt.',
      matched: false,
    },
    {
      id: '10',
      term: 'Feedback-Mechanik',
      definition: 'Unmittelbare Rückmeldung des Spiels über die Auswirkungen von Aktionen (z.B. Sound, Animation, Punkteanzeige).',
      matched: false,
    },
    {
      id: '11',
      term: 'Strategisches Denken',
      definition: 'Die Fähigkeit, langfristige Pläne zu entwickeln und zukünftige Konsequenzen von Entscheidungen vorherzusehen.',
      matched: false,
    },
    {
      id: '12',
      term: 'Problemlösungsfähigkeit',
      definition: 'Die Fähigkeit, auf neue Spielsituationen zu reagieren und kreativ Lösungen zu finden.',
      matched: false,
    },
    {
      id: '13',
      term: 'Kreativität',
      definition: 'Die Fähigkeit, ungewöhnliche Lösungswege zu finden und innovativ zu denken.',
      matched: false,
    },
    {
      id: '14',
      term: 'Spannung/Emotionale Erregung',
      definition: 'Die Emotion, die durch unsichere Spielausgänge oder knappe Situationen ausgelöst wird.',
      matched: false,
    },
    {
      id: '15',
      term: 'Empathie',
      definition: 'Die Fähigkeit, die Gedanken und Gefühle anderer Spieler zu verstehen und nachzuvollziehen.',
      matched: false,
    },
  ])

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [wrongMatch, setWrongMatch] = useState<WrongMatch | null>(null)

  const itemsPerPage = 5
  const totalPages = Math.ceil(matches.length / itemsPerPage)
  const startIdx = currentPage * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const currentMatches = matches.slice(startIdx, endIdx)

  // Shuffle definitions for each page
  const shuffledDefinitions = useMemo(() => {
    const defs = [...currentMatches].sort(() => Math.random() - 0.5)
    return defs
  }, [currentPage, currentMatches])

  const handleTermClick = (termId: string) => {
    setSelectedTerm(selectedTerm === termId ? null : termId)
  }

  const handleDefinitionClick = (definitionId: string) => {
    if (!selectedTerm) return

    if (selectedTerm === definitionId) {
      setMatches(
        matches.map(m =>
          m.id === definitionId ? { ...m, matched: true } : m
        )
      )
      setScore(score + 10)
      setSelectedTerm(null)
      setWrongMatch(null)
    } else {
      setWrongMatch({ termId: selectedTerm, definitionId })
      setScore(Math.max(0, score - 10))
      setTimeout(() => {
        setWrongMatch(null)
        setSelectedTerm(null)
      }, 1500)
    }
  }

  const allMatched = matches.every(m => m.matched)

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h3 className="text-2xl font-semibold text-slate-900 mb-2">Übung 1: Fachbegriffe Zuordnen</h3>
      <p className="text-slate-600 mb-6">Ordne die Fachbegriffe den richtigen Definitionen zu!</p>

      {/* Anleitung & Scoring */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">📖 Anleitung & Punkte-System:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Richtige Zuordnung:</strong> <span className="text-green-700 font-semibold">+10 Punkte</span></p>
          <p><strong>Falsche Zuordnung:</strong> <span className="text-red-700 font-semibold">-10 Punkte</span></p>
          <p className="mt-3 text-blue-900">Wähle einen Fachbegriff, dann eine Definition. Bei falscher Zuordnung werden beide rot markiert!</p>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg font-semibold text-blue-600">Punkte: {score}</div>
        <div className="text-sm font-semibold text-slate-600">
          Seite {currentPage + 1} / {totalPages}
        </div>
        {allMatched && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
            ✅ Alle Begriffe zugeordnet! Gratuliere!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Terms */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 mb-3 text-center">Fachbegriffe</h4>
          {currentMatches.map(item => (
            <button
              key={item.id}
              onClick={() => handleTermClick(item.id)}
              className={`w-full p-4 rounded-lg font-medium text-left transition-all ${
                item.matched
                  ? 'bg-green-100 text-green-800 border-2 border-green-400'
                  : wrongMatch?.termId === item.id
                  ? 'bg-red-200 text-red-800 border-2 border-red-500 animate-pulse'
                  : selectedTerm === item.id
                  ? 'bg-blue-500 text-white border-2 border-blue-600'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-2 border-transparent'
              }`}
            >
              {item.matched && '✅ '}
              {wrongMatch?.termId === item.id && '❌ '}
              {item.term}
            </button>
          ))}
        </div>

        {/* Definitions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 mb-3 text-center">Definitionen</h4>
          {shuffledDefinitions
            .filter(m => !m.matched)
            .concat(shuffledDefinitions.filter(m => m.matched))
            .map(item => (
            <button
              key={item.id}
              onClick={() => handleDefinitionClick(item.id)}
              disabled={item.matched}
              className={`w-full p-4 rounded-lg text-left transition-all text-sm ${
                item.matched
                  ? 'bg-green-100 text-green-800 border-2 border-green-400 cursor-default'
                  : wrongMatch?.definitionId === item.id
                  ? 'bg-red-200 text-red-800 border-2 border-red-500 cursor-pointer animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-transparent cursor-pointer'
              }`}
            >
              {item.matched && '✅ '}
              {wrongMatch?.definitionId === item.id && '❌ '}
              {item.definition}
            </button>
            ))}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            currentPage === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          ← Vorherige Seite
        </button>

        <span className="font-semibold text-slate-700">
          Seite {currentPage + 1} von {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            currentPage === totalPages - 1
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Nächste Seite →
        </button>
      </div>

      {allMatched && (
        <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg text-center">
          <p className="text-green-800 font-semibold">
            🎉 Hervorragend! Du hast alle Begriffe korrekt zugeordnet!<br/>
            <span className="text-sm">Dein Endergebnis: {score} Punkte</span>
          </p>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'

interface Scenario {
  id: number
  title: string
  scenario: string
  options: {
    text: string
    feedback: string
    isCorrect: boolean
    teachingPoint: string
  }[]
}

export default function Uebung3Szenarios() {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [answered, setAnswered] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  const scenarios: Scenario[] = [
    {
      id: 1,
      title: 'Worker-Placement Strategie',
      scenario:
        'Du spielst ein Worker-Placement Spiel. Es gibt 4 Aktionsfelder: "Rohstoffe" (1 Worker), "Handeln" (1 Worker), "Gebäude" (2 Worker), "Gold" (1 Worker). Du hast 3 Worker. Wo platzierst du sie?',
      options: [
        {
          text: '1x Rohstoffe, 2x Gebäude',
          feedback: 'Interessant! Das blockiert andere Spieler beim Gebäudebau.',
          isCorrect: true,
          teachingPoint: 'Strategy: Blocking-Taktik ist ein wichtiger Teil von Worker-Placement!',
        },
        {
          text: '3x auf verschiedene Felder',
          feedback: 'Gute Diversifizierung!',
          isCorrect: true,
          teachingPoint: 'Strategy: Flexibilität ist auch eine gültige Strategie.',
        },
        {
          text: 'Alle auf Rohstoffe',
          feedback: 'Das geht nicht - nur 1 Worker pro Feld!',
          isCorrect: false,
          teachingPoint: 'Worker-Placement: Nur ein Worker pro Aktionsfeld möglich!',
        },
      ],
    },
    {
      id: 2,
      title: 'Set-Collection Taktik',
      scenario:
        'In einer Kartensammel-Phase hast du 2 rote, 2 blaue und 1 grüne Karte. Du kannst noch eine Karte ziehen. Was ist die beste Taktik?',
      options: [
        {
          text: 'Eine rote oder blaue Karte hoffen um ein Set zu vollenden',
          feedback: 'Perfekt! Du verstehst Set-Collection!',
          isCorrect: true,
          teachingPoint:
            'Set-Collection: Strategisch auf Sets hinarbeiten maximiert Punkte.',
        },
        {
          text: 'Eine grüne Karte hoffen um Vielfalt zu haben',
          feedback: 'Das ist möglich, aber weniger strategisch.',
          isCorrect: false,
          teachingPoint:
            'Set-Collection: Fokus auf vollständige Sets bringt mehr Punkte!',
        },
        {
          text: 'Egal welche - Karten sind alle gleich',
          feedback: 'Das ist falsch! Set-Collection funktioniert nur mit Strategie.',
          isCorrect: false,
          teachingPoint:
            'Set-Collection: Die Auswahl der Karten ist essentiell für den Sieg!',
        },
      ],
    },
    {
      id: 3,
      title: 'Emotionale Reaktion',
      scenario:
        'Ein anderer Spieler gewinnt überraschend die Runde, auf die du dich gefreut hast. Es sind noch 2 Runden zu gehen. Wie reagierst du?',
      options: [
        {
          text: 'Ich konzentriere mich und versuche die nächsten Runden zu gewinnen',
          feedback: 'Ausgezeichnet! Das ist wahre Resilienz!',
          isCorrect: true,
          teachingPoint:
            'Resilienz: Mit Rückschlägen umgehen und weiterhin motiviert bleiben.',
        },
        {
          text: 'Ich gebe auf - ich kann nicht mehr gewinnen',
          feedback: 'Das ist Geben auf. Das ist nicht resilient.',
          isCorrect: false,
          teachingPoint:
            'Resilienz: Auch Niederlagen gehören zum Spiel. Weitermachen ist wichtig!',
        },
        {
          text: 'Ich sage dem anderen Spieler, dass er cheatet',
          feedback: 'Das ist nicht fair und destruktiv.',
          isCorrect: false,
          teachingPoint:
            'Fairplay: Andere Spieler zu respektieren ist grundlegend für Spiele!',
        },
      ],
    },
    {
      id: 4,
      title: 'Tile-Placement Planung',
      scenario:
        'Du positionierst Plättchen auf einem Spielfeld. Links sind wertvoll Positionen, rechts gibt es wenig Punkte. Aber der Gegner sitzt links. Was tust du?',
      options: [
        {
          text: 'Ich blockiere die wertvollen Positionen damit der Gegner sie nicht bekommt',
          feedback: 'Strategisch! Das ist Blocking.',
          isCorrect: true,
          teachingPoint:
            'Tile-Placement: Gegner zu hindern ist manchmal besser als eigene Vorteile.',
        },
        {
          text: 'Ich nehme mir die wertvollen Positionen selbst',
          feedback: 'Auch gut - eigener Vorteil ist wichtig.',
          isCorrect: true,
          teachingPoint:
            'Tile-Placement: Balance zwischen eigener Strategie und Gegner blocken.',
        },
        {
          text: 'Ich platziere zufällig überall',
          feedback: 'Keine Strategie = schlechtes Ergebnis.',
          isCorrect: false,
          teachingPoint: 'Tile-Placement: Planung und Strategie sind essentiell!',
        },
      ],
    },
    {
      id: 5,
      title: 'Deckbuilding Investition',
      scenario:
        'Im Deckbau-Spiel kannst du eine neue starke Karte (Kosten: 8 Münzen) oder zwei mittlere Karten (Kosten: 4+4 Münzen) kaufen. Du hast 8 Münzen. Welche Wahl?',
      options: [
        {
          text: 'Eine starke Karte - bessere Langzeitstrategie',
          feedback: 'Guter Fokus! Starke Karten können Game-Changer sein.',
          isCorrect: true,
          teachingPoint:
            'Deckbuilding: Fokus auf wenige, starke Karten kann mächtig sein.',
        },
        {
          text: 'Zwei mittlere Karten - mehr Vielfältigkeit',
          feedback: 'Auch valide! Mehr Optionen = Flexibilität.',
          isCorrect: true,
          teachingPoint:
            'Deckbuilding: Balance zwischen Fokus und Flexibilität ist wichtig.',
        },
        {
          text: 'Gar keine - ich spare die Münzen',
          feedback: 'Sparen ist manchmal nicht optimal in Deckbau-Spielen.',
          isCorrect: false,
          teachingPoint:
            'Deckbuilding: Investition in gute Karten früh gibt später Vorteil!',
        },
      ],
    },
  ]

  const scenario = scenarios[currentScenario]

  const handleAnswer = (optionIndex: number) => {
    const isCorrect = scenario.options[optionIndex].isCorrect
    setSelectedAnswer(optionIndex)
    setAnswered([...answered, currentScenario])

    if (isCorrect) {
      setScore(score + 10)
    } else {
      setScore(Math.max(0, score - 5))
    }
  }

  const handleNext = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1)
      setSelectedAnswer(null)
    }
  }

  const isAnswered = selectedAnswer !== null

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h3 className="text-2xl font-semibold text-slate-900 mb-2">
        Übung 3: Szenario-basierte Entscheidungen
      </h3>
      <p className="text-slate-600 mb-6">
        Treffe strategische Entscheidungen basierend auf Spielszenarien!
      </p>

      <div className="mb-6 flex justify-between items-center">
        <div className="text-lg font-semibold text-blue-600">
          Szenario {currentScenario + 1} / {scenarios.length}
        </div>
        <div className="text-lg font-semibold text-green-600">Punkte: {score}</div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
        <h4 className="text-xl font-semibold text-blue-900 mb-3">{scenario.title}</h4>
        <p className="text-blue-800 mb-4 text-lg">{scenario.scenario}</p>
      </div>

      <div className="space-y-3 mb-6">
        {scenario.options.map((option, idx) => (
          <div key={idx}>
            <button
              onClick={() => handleAnswer(idx)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-lg text-left font-semibold transition-all ${
                isAnswered
                  ? option.isCorrect
                    ? 'bg-green-200 border-2 border-green-500 text-green-900'
                    : selectedAnswer === idx
                    ? 'bg-red-200 border-2 border-red-500 text-red-900'
                    : 'bg-slate-100 border-2 border-slate-300 text-slate-600'
                  : 'bg-slate-100 border-2 border-slate-300 hover:bg-slate-200 text-slate-900 cursor-pointer'
              }`}
            >
              {isAnswered && option.isCorrect && '✅ '}
              {isAnswered && selectedAnswer === idx && !option.isCorrect && '❌ '}
              {option.text}
            </button>

            {isAnswered && selectedAnswer === idx && (
              <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="font-semibold text-blue-900 text-sm mb-1">{option.feedback}</p>
                <p className="text-blue-800 text-sm">💡 {option.teachingPoint}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {isAnswered && currentScenario < scenarios.length - 1 && (
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all"
        >
          Nächstes Szenario →
        </button>
      )}

      {isAnswered && currentScenario === scenarios.length - 1 && (
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6 text-center">
          <p className="text-green-900 font-semibold text-lg">
            🎉 Quiz abgeschlossen!
          </p>
          <p className="text-green-800 mt-2">
            Dein Endergebnis: <span className="font-bold">{score} Punkte</span>
          </p>
          <p className="text-green-700 text-sm mt-3">
            Du kennst dich jetzt mit strategischen Entscheidungen in Spielmechaniken
            aus!
          </p>
        </div>
      )}
    </div>
  )
}

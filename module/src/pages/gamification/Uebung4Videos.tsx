import { useState } from 'react'

interface VideoAnalysisQuestion {
  id: number
  title: string
  youtubeId: string
  timestamp: string
  question: string
  answers: {
    text: string
    correct: boolean
    explanation: string
  }[]
}

export default function Uebung4Videos() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)

  const videos: VideoAnalysisQuestion[] = [
    {
      id: 1,
      title: 'Siedler von Catan - Worker-Placement',
      youtubeId: 'TITr6pLqlGE',
      timestamp: '0:30',
      question:
        'Welche Spielmechanik erkennst du, wenn Spieler ihre Rohstoffe auf bestimmte Aktionsfelder legen?',
      answers: [
        {
          text: 'Worker-Placement - Spieler mit Worker auf Aktionsfeldern',
          correct: true,
          explanation:
            'Korrekt! Das Platzieren von Spielfiguren oder Markern auf Aktionsfelder ist die klassische Worker-Placement Mechanik.',
        },
        {
          text: 'Tile-Placement',
          correct: false,
          explanation:
            'Nein, Tile-Placement ist das Legen von Plättchen. Worker-Placement ist das Platzieren von Spielfiguren.',
        },
        {
          text: 'Set-Collection',
          correct: false,
          explanation:
            'Set-Collection ist das Sammeln von zusammengehörigen Karten/Teilen, nicht das Platzieren von Figuren.',
        },
      ],
    },
    {
      id: 2,
      title: 'Carcassonne - Tile-Placement',
      youtubeId: '9zK8rKuFHvM',
      timestamp: '2:15',
      question:
        'Was ist die Kernmechanik in diesem Spiel, wenn Spieler Landschafts-Kacheln platzieren?',
      answers: [
        {
          text: 'Tile-Placement - Plättchen strategisch auf dem Spielfeld legen',
          correct: true,
          explanation:
            'Perfekt! Carcassonne ist das klassische Beispiel für Tile-Placement - Spieler legen Landschaftskacheln aneinander.',
        },
        {
          text: 'Worker-Placement',
          correct: false,
          explanation:
            'Worker-Placement wäre, wenn Spieler Figuren auf Aktionsfelder setzen würden, nicht Plättchen legen.',
        },
        {
          text: 'Deckbuilding',
          correct: false,
          explanation:
            'Deckbuilding ist der Aufbau eines Kartenstapels. In Carcassonne wird mit Plättchen gespielt.',
        },
      ],
    },
    {
      id: 3,
      title: 'Das Gedächtnisspiel - Emotion Recognition',
      youtubeId: 'x6u7KjgWRPA',
      timestamp: '1:00',
      question:
        'Welche Emotion erkennst du in den Gesichtern der Spieler, die gerade eine Karte umgewendet haben?',
      answers: [
        {
          text: 'Spannung und Hoffnung',
          correct: true,
          explanation:
            'Genau! Spiele erzeugen Spannung (werden sie eine passende Karte finden?) und Hoffnung (hoffentlich gewinne ich).',
        },
        {
          text: 'Traurigkeit',
          correct: false,
          explanation:
            'Obwohl Spieler sauer sein können wenn sie verlieren, in diesem Moment ist es eher Spannung.',
        },
        {
          text: 'Langeweile',
          correct: false,
          explanation:
            'Gedächtnisspiele sind selten langweilig - die Spieler sind konzentriert und angespannt!',
        },
      ],
    },
    {
      id: 4,
      title: 'Kneipenquiz - Set-Collection',
      youtubeId: 'dAkjB93pFPo',
      timestamp: '0:45',
      question:
        'Wann nutzt ein Spieler Set-Collection, um Punkte zu verdienen?',
      answers: [
        {
          text: 'Wenn er drei Karten der gleichen Kategorie sammelt',
          correct: true,
          explanation:
            'Korrekt! In vielen Kartenspielen musst du Sets von 3+ zusammengehörigen Karten sammeln, um Punkte zu bekommen.',
        },
        {
          text: 'Wenn er eine Karte auf dem Spielbrett legt',
          correct: false,
          explanation:
            'Das wäre Tile-Placement. Set-Collection ist das Sammeln von zusammengehörigen Items.',
        },
        {
          text: 'Wenn er zuerst seine Hand ausspielt',
          correct: false,
          explanation:
            'Das ist nicht Set-Collection. Set-Collection ist spezifisch auf das Sammeln von Sets ausgerichtet.',
        },
      ],
    },
    {
      id: 5,
      title: 'Phase 10 - Resilienz nach Rückschlag',
      youtubeId: 'unknown',
      timestamp: 'N/A',
      question:
        'Ein Spieler hat gerade 5 Punkte Rückstand. Er schaff trotzdem noch zwei Runden zu gewinnen. Welche Fähigkeit demonstriert er?',
      answers: [
        {
          text: 'Resilienz - Er gibt nicht auf trotz Rückschlag',
          correct: true,
          explanation:
            'Ausgezeichnet! Resilienz ist genau das: Mit Niederlagen oder Rückschlägen umgehen und trotzdem motiviert weitermachen.',
        },
        {
          text: 'Strategisches Denken',
          correct: false,
          explanation:
            'Strategisches Denken ist auch wichtig, aber hier geht es mehr darum, nicht aufzugeben.',
        },
        {
          text: 'Glück',
          correct: false,
          explanation: 'Während Glück im Spiel hilft, ist Resilienz die mentale Stärke, weiterzumachen.',
        },
      ],
    },
  ]

  const video = videos[currentVideo]

  const handleAnswer = (answerIdx: number) => {
    setSelectedAnswer(answerIdx)
    setAnswered(true)

    if (video.answers[answerIdx].correct) {
      setScore(score + 10)
    }
  }

  const handleNextVideo = () => {
    if (currentVideo < videos.length - 1) {
      setCurrentVideo(currentVideo + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    }
  }

  const isLastVideo = currentVideo === videos.length - 1

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h3 className="text-2xl font-semibold text-slate-900 mb-2">
        Übung 4: Video-Analyse mit Fragen
      </h3>
      <p className="text-slate-600 mb-6">
        Analysiere Spiel-Videos und erkenne Mechaniken & Emotionen!
      </p>

      <div className="mb-6 flex justify-between items-center">
        <div className="text-lg font-semibold text-blue-600">
          Video {currentVideo + 1} / {videos.length}
        </div>
        <div className="text-lg font-semibold text-green-600">Punkte: {score}</div>
      </div>

      {/* Video Info */}
      <div className="bg-slate-100 rounded-lg p-6 mb-6 border-2 border-slate-300">
        <h4 className="text-xl font-semibold text-slate-900 mb-2">{video.title}</h4>
        <p className="text-slate-700 mb-3">
          📺 Zeitstempel: <span className="font-semibold">{video.timestamp}</span>
        </p>

        {/* Video Placeholder */}
        <div className="bg-black rounded-lg overflow-hidden mb-4 aspect-video flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-4xl mb-2">▶️</p>
            <p className="text-sm">Video: {video.title}</p>
            <p className="text-xs text-gray-400">
              {video.youtubeId !== 'unknown'
                ? `YouTube ID: ${video.youtubeId}`
                : 'Beispiel-Video'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              In der Produktivversion würde hier ein eingebettetes YouTube-Video
              angezeigt
            </p>
          </div>
        </div>

        <p className="text-slate-600 italic text-sm">
          💡 Hinweis: In der fertigen Version werden echte YouTube-Videos eingebettet.
        </p>
      </div>

      {/* Question */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">{video.question}</h4>

        <div className="space-y-3">
          {video.answers.map((answer, idx) => (
            <div key={idx}>
              <button
                onClick={() => handleAnswer(idx)}
                disabled={answered}
                className={`w-full p-4 rounded-lg text-left font-semibold transition-all ${
                  answered
                    ? answer.correct
                      ? 'bg-green-200 border-2 border-green-500 text-green-900'
                      : selectedAnswer === idx
                      ? 'bg-red-200 border-2 border-red-500 text-red-900'
                      : 'bg-slate-100 border-2 border-slate-300 text-slate-600'
                    : 'bg-white border-2 border-blue-300 hover:bg-blue-100 text-slate-900 cursor-pointer'
                }`}
              >
                {answered && answer.correct && '✅ '}
                {answered && selectedAnswer === idx && !answer.correct && '❌ '}
                {answer.text}
              </button>

              {answered && selectedAnswer === idx && (
                <div className="mt-2 p-3 bg-blue-100 border-l-4 border-blue-500 rounded">
                  <p className="text-blue-900 text-sm">{answer.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {answered && !isLastVideo && (
        <button
          onClick={handleNextVideo}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all"
        >
          Nächstes Video →
        </button>
      )}

      {answered && isLastVideo && (
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6 text-center">
          <p className="text-green-900 font-semibold text-lg">
            🎉 Video-Analyse abgeschlossen!
          </p>
          <p className="text-green-800 mt-2">
            Dein Endergebnis: <span className="font-bold">{score} Punkte</span>
          </p>
          <p className="text-green-700 text-sm mt-3">
            Du kannst jetzt Spielmechaniken und Emotionen in echten Spielen
            erkennen!
          </p>
        </div>
      )}
    </div>
  )
}

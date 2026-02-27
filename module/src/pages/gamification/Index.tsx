import { Link } from 'react-router-dom'

export default function GamificationIndex() {
  const learningAreas = [
    {
      id: 'gesellschaftsspiele',
      title: 'Gesellschaftsspiele entschlüsseln',
      description: 'Lerne Mechaniken und Strukturen von Gesellschaftsspielen kennen und verstehen.',
      path: '/gamification/gesellschaftsspiele'
    },
    {
      id: 'digitale-spiele',
      title: 'Digitale Spiele untersuchen & bewerten',
      description: 'Analysiere und evaluiere digitale Spiele auf ihre Mechaniken und Wirkung.',
      path: '/gamification/digitale-spiele'
    },
    {
      id: 'lernspielen',
      title: 'Mit Lernspielen motivieren und fördern',
      description: 'Entdecke, wie Lernspiele zur Motivation und Förderung eingesetzt werden.',
      path: '/gamification/lernspielen'
    },
    {
      id: 'gamification-nutzen',
      title: 'Gamification identifizieren und nutzen',
      description: 'Erkenne Gamification-Elemente und lerne, diese strategisch zu nutzen.',
      path: '/gamification/gamification-nutzen'
    },
    {
      id: 'berufliche-moeglichkeiten',
      title: 'Berufliche Möglichkeiten entdecken',
      description: 'Erkunde Karrierechancen im Bereich Gamification und Game Design.',
      path: '/gamification/berufliche-moeglichkeiten'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-12 px-4 text-center shadow-md relative">
        <Link to="/" className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          ← Zurück
        </Link>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">🎮 Gamification</h1>
        <p className="text-lg text-slate-300">Wähle einen Lernbereich, um zu starten.</p>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-12">
        <div className="grid grid-cols-1 gap-6 w-full">
          {learningAreas.map((area) => (
            <Link
              key={area.id}
              to={area.path}
              className="bg-white rounded-2xl p-8 text-left text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-slate-100"
            >
              <h2 className="text-2xl font-semibold mb-3 text-slate-800">{area.title}</h2>
              <p className="text-slate-600 leading-relaxed">
                {area.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

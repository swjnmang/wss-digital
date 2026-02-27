import { Link } from 'react-router-dom'

export default function Home() {
  const modules = [
    {
      id: 'gamification',
      title: 'Gamification',
      emoji: '🎮',
      description: 'Lerne spielerisch mit Punkten, Abzeichen und spannenden Herausforderungen.',
      enabled: true,
      path: '/gamification'
    },
    {
      id: 'gesundheit',
      title: 'Gesundheit',
      emoji: '🏥',
      description: 'Verstehe wirtschaftliche Aspekte im Gesundheitswesen und Pflege.',
      enabled: false,
      path: '/gesundheit'
    },
    {
      id: 'fit4finance',
      title: 'Fit4Finance',
      emoji: '💰',
      description: 'Trainiere deine finanziellen Fähigkeiten und Finanzmanagement.',
      enabled: false,
      path: '/fit4finance'
    },
    {
      id: 'umweltoekonomie',
      title: 'Umweltökonomie',
      emoji: '🌍',
      description: 'Verstehe die Beziehung zwischen Wirtschaft und Umwelt.',
      enabled: false,
      path: '/umweltoekonomie'
    },
    {
      id: 'robotik',
      title: 'Robotik',
      emoji: '🤖',
      description: 'Grundlagen der Robotik und Automatisierung in der Industrie.',
      enabled: false,
      path: '/robotik'
    },
    {
      id: 'umwelttechnik',
      title: 'Umwelttechnik',
      emoji: '♻️',
      description: 'Technologien für nachhaltiges Wirtschaften und Ressourcenschonung.',
      enabled: false,
      path: '/umwelttechnik'
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce',
      emoji: '🛒',
      description: 'Elektronischer Handel und digitale Geschäftsmodelle.',
      enabled: false,
      path: '/ecommerce'
    },
    {
      id: 'tourismus',
      title: 'Tourismus',
      emoji: '✈️',
      description: 'Wirtschaft und Management im Tourismussektor.',
      enabled: false,
      path: '/tourismus'
    }
  ]
      emoji: '🛒',
      description: 'Elektronischer Handel und digitale Geschäftsmodelle.',
      enabled: false
    },
    {
      id: 'tourismus',
      title: 'Tourismus',
      emoji: '✈️',
      description: 'Wirtschaft und Management im Tourismussektor.',
      enabled: false
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-12 px-4 text-center shadow-md relative">
        <a href="https://wss-digital.de/" className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          ← Zurück zu wss-digital
        </a>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          Module <span className="text-blue-400 relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-1 after:bg-blue-600/35">Digital</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-xl mx-auto">
          Wähle ein Modul, um zu starten.
        </p>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-8 flex items-center justify-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          
          {modules.map((module) => (
            module.enabled ? (
              <Link
                key={module.id}
                to={module.path}
                className="bg-white rounded-xl p-6 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
              >
                <div className="text-4xl mb-4 text-blue-500">
                  {module.emoji}
                </div>
                <h2 className="text-lg font-semibold mb-2 text-slate-800">{module.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {module.description}
                </p>
              </Link>
            ) : (
              <div
                key={module.id}
                className="bg-slate-100 rounded-xl p-6 text-center text-slate-500 shadow-sm flex flex-col items-center h-full border border-slate-200 opacity-50 cursor-not-allowed"
              >
                <div className="text-4xl mb-4 text-slate-400">
                  {module.emoji}
                </div>
                <h2 className="text-lg font-semibold mb-2 text-slate-600">{module.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {module.description}
                </p>
                <span className="text-xs font-semibold text-slate-500 mt-3 uppercase tracking-wide">Demnächst</span>
              </div>
            )
          ))}

        </div>
      </main>
    </div>
  )
}

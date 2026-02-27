import { Link } from 'react-router-dom'

export default function ModuleOverview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Neue Module</h1>
        <p className="text-lg text-slate-300">Lerne mit interaktiven Modulen der Wirtschaftsschule</p>
      </header>

      {/* Module Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gamification Module */}
          <Link
            to="/gamification"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow transform hover:scale-105 ease-in-out"
          >
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Gamification</h2>
            <p className="text-slate-600 mb-4">
              Lerne spielerisch! Sammle Punkte, Abzeichen und meistern Sie Herausforderungen.
            </p>
            <div className="text-blue-600 font-semibold">Jetzt starten →</div>
          </Link>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Weitere Module - Demnächst verfügbar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Zusätzliches Modul</h3>
              <p className="text-slate-600">Coming Soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

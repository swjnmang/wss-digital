
import pages from '../data/pages.json'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Mathe-Trainer <span className="text-[var(--accent)] relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-1 after:bg-blue-600/35">Digital</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
            Wähle einen Bereich, um zu starten – übe Funktionen, Finanzmathematik, Trigonometrie, Daten &amp; Zufall und mehr.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pages.map((p) => (
            <Link
              key={p.id}
              to={p.reactPath ? p.reactPath : p.path.replace('.html', '')}
              className="bg-white rounded-2xl p-6 sm:p-8 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 flex items-center justify-center text-xl sm:text-2xl text-[var(--accent)] mb-4 sm:mb-5">
                <i className={p.icon}></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-slate-800">{p.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-4 sm:mb-5 text-sm sm:text-base">{p.description}</p>
              <div className="mt-auto" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </main>

      <footer className="w-full py-8 text-center text-slate-500 bg-white border-t border-slate-200">
        <p>
          © 2025 Mathenkik. Alle Rechte vorbehalten. ·{' '}
          <Link to="/impressum" className="text-[var(--accent)] hover:text-blue-700 font-semibold">
            Impressum
          </Link>
        </p>
      </footer>
    </div>
  )
}


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

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {pages.map((p) => (
            <Link
              key={p.id}
              to={p.reactPath ? p.reactPath : p.path.replace('.html', '')}
              className="bg-white rounded-2xl p-4 sm:p-5 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 flex items-center justify-center text-lg sm:text-xl text-[var(--accent)] mb-3">
                <i className={p.icon}></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 text-slate-800">{p.title}</h3>
              <p className="text-slate-500 leading-snug text-sm">{p.description}</p>
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

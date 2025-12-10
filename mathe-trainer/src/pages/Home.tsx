
import pages from '../data/pages.json'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <section className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white pb-14 pt-16 px-4">
        <div className="app-shell text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Mathe-Trainer <span className="text-[var(--accent)]">Digital</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-3xl mx-auto">
            Wähle einen Bereich, um zu starten – übe Funktionen, Finanzmathematik, Trigonometrie, Daten & Zufall und mehr.
          </p>
        </div>
      </section>

      <main className="flex-1 w-full pt-8 pb-12">
        <div className="app-shell">
          <div className="grid gap-6 sm:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pages.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-7 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-transform"
              >
                <div className="text-4xl mb-4 text-[var(--accent)]"><i className={p.icon}></i></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-slate-600 mb-5 leading-relaxed">{p.description}</p>
                <Link
                  to={p.reactPath ? p.reactPath : p.path.replace('.html', '')}
                  className="btn-pill btn-blue text-sm w-full justify-center"
                >
                  Jetzt üben
                </Link>
              </div>
            ))}
          </div>
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

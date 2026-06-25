import { Link } from 'react-router-dom'

const items = [
  { title: 'Funktionsgleichung aufstellen', desc: 'Stelle die Gleichung einer Parabel aus gegebenen Informationen auf.', href: 'funktionsgleichung_aufstellen', icon: 'fa-solid fa-pen-ruler' },
  { title: 'Graph zeichnen', desc: 'Übe das Zeichnen von quadratischen Funktionen im Koordinatensystem.', href: 'graph_zeichnen', icon: 'fa-solid fa-pencil' },
  { title: 'Normalparabel', desc: 'Lerne die Eigenschaften der Normalparabel kennen.', href: 'normalparabel', icon: 'fa-solid fa-chart-line' },
  { title: 'Nullstellen', desc: 'Finde die Schnittpunkte einer Parabel mit der x-Achse.', href: 'nullstellen', icon: 'fa-solid fa-arrows-down-to-line' },
  { title: 'Scheitelform', desc: 'Wandle Funktionsgleichungen in die Scheitelform um.', href: 'scheitelform', icon: 'fa-solid fa-square-root-variable' },
  { title: 'Scheitelpunkt', desc: 'Bestimme den Scheitelpunkt einer Parabel.', href: 'scheitelpunkt', icon: 'fa-solid fa-bullseye' }
]

export default function QuadratischeIndex() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Quadratische Funktionen</h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
            Übersicht und Aufgaben zu Parabeln und Scheitelpunkten.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((it) => (
            <Link
              key={it.href}
              to={`/quadratische_funktionen/${it.href}`}
              className="bg-white rounded-2xl p-6 sm:p-8 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 flex items-center justify-center text-xl sm:text-2xl text-[var(--accent)] mb-4 sm:mb-5">
                <i className={it.icon}></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-slate-800">{it.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-4 sm:mb-5 text-sm sm:text-base">{it.desc}</p>
              <div className="mt-auto" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

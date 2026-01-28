import { Link } from 'react-router-dom'

export default function LineareIndex() {
  const items = [
    { title: '1. Steigung berechnen', desc: 'Lerne, die Steigung einer Geraden aus zwei Punkten zu ermitteln.', href: 'steigung_berechnen', icon: 'fa-solid fa-chart-line' },
    { title: '2. Funktionsgleichung aufstellen', desc: 'Stelle die Gleichung einer Geraden aus gegebenen Informationen auf.', href: 'funktionsgleichung', icon: 'fa-solid fa-pen-ruler' },
    { title: '3. Funktionsgleichung ablesen', desc: 'Lese die Funktionsgleichung direkt aus einem Graphen ab.', href: 'ablesen', icon: 'fa-solid fa-eye' },
    { title: '4. Graphen zeichnen', desc: 'Übe das Zeichnen von linearen Funktionen im Koordinatensystem.', href: 'zeichnen', icon: 'fa-solid fa-pencil' },
    { title: '5. Nullstellen berechnen', desc: 'Finde den Schnittpunkt einer Geraden mit der x-Achse.', href: 'nullstellen', icon: 'fa-solid fa-arrows-down-to-line' },
    { title: '6. Punkt auf Gerade prüfen', desc: 'Überprüfe rechnerisch, ob ein Punkt auf einer Geraden liegt.', href: 'punkt_gerade', icon: 'fa-solid fa-magnifying-glass-chart' },
    { title: '7. Schnittpunkt zweier Geraden', desc: 'Berechne den gemeinsamen Schnittpunkt von zwei Geraden.', href: 'schnittpunkt', icon: 'fa-solid fa-arrows-turn-to-dots' },
    { title: '8. Spiel: Münzen sammeln', desc: 'Eine spielerische Anwendung zum Thema lineare Funktionen.', href: 'spiel_muenzen', icon: 'fa-solid fa-gamepad' },
    { title: '9. Abschlusstest', desc: 'Teste dein Wissen über lineare Funktionen.', href: 'test', icon: 'fa-solid fa-graduation-cap' }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Lineare Funktionen</h1>
        <p className="text-lg text-blue-800 mb-1">Wähle eine Aufgabe aus der folgenden Liste aus.</p>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <Link key={it.title} to={`/lineare_funktionen/${it.href}`} className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center p-6 hover:shadow-lg transition-shadow hover:border-blue-300">
            <div className="card-icon text-3xl mb-3 text-blue-700"><i className={it.icon}></i></div>
            <h3 className="text-lg font-semibold mb-1 text-blue-900">{it.title}</h3>
            <p className="text-gray-700 mb-4 text-center flex-1">{it.desc}</p>
            <span className="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Start</span>
          </Link>
        ))}
      </main>
    </div>
  )
}

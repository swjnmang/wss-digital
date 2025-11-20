
import pages from '../data/pages.json'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-blue-900">Mathe Wirtschaftsschule</h1>
        <p className="text-lg md:text-xl text-blue-800 mb-1">Deine Plattform für digitale Übungsaufgaben und Lernvideos.</p>
        <p className="max-w-3xl text-center text-gray-700">Hallo und herzlich willkommen! Auf dieser Seite findest du eine wachsende Sammlung an interaktiven Übungen und Tests für den Mathematikunterricht an der Wirtschaftsschule. Wähle einfach ein Thema aus und starte direkt mit dem Üben. Viel Erfolg!</p>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {pages.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center p-6 hover:shadow-xl transition-shadow">
            <div className="card-icon text-4xl mb-3 text-blue-700"><i className={p.icon}></i></div>
            <h3 className="text-xl font-semibold mb-1 text-blue-900">{p.title}</h3>
            <p className="text-gray-700 mb-4 text-center">{p.description}</p>
            <Link
              to={p.reactPath ? p.reactPath : p.path.replace('.html', '')}
              className="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-colors"
            >
              Jetzt üben
            </Link>
          </div>
        ))}
      </main>

      <footer className="w-full py-6 text-center text-gray-500 bg-white/80 border-t mt-8">
        <p>© 2025 Mathenkik. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  )
}

export default function QuadratischeIndex() {
  const items = [
    { title: 'Funktionsgleichung aufstellen', href: 'funktionsgleichung_aufstellen.html' },
    { title: 'Graph zeichnen', href: 'graph_zeichnen.html' },
    { title: 'Normalparabel', href: 'normalparabel.html' },
    { title: 'Nullstellen', href: 'nullstellen.html' },
    { title: 'Scheitelform', href: 'scheitelform.html' },
    { title: 'Scheitelpunkt', href: 'scheitelpunkt.html' }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Quadratische Funktionen</h1>
        <p className="text-lg text-blue-800 mb-1">Übersicht und Aufgaben zu Parabeln und Scheitelpunkten.</p>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 mt-4">
        <a href="/index.html" className="inline-block text-blue-700 hover:underline mb-4">← Zurück zur Themenübersicht</a>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.href} className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold mb-1 text-blue-900">{it.title}</h3>
            <a href={`/quadratische_funktionen/${it.href}`} className="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-colors">Jetzt üben</a>
          </div>
        ))}
      </main>
    </div>
  )
}

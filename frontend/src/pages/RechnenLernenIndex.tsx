import { Link } from 'react-router-dom';

const subpages = [
  {
    title: '1. Terme',
    description: 'Lerne, Terme zu vereinfachen und zusammenzufassen.',
    icon: 'fa-solid fa-calculator',
    path: '/rechnen_lernen/terme',
  },
  {
    title: '2. Brüche',
    description: 'Alles rund um das Rechnen mit Brüchen: Kürzen, Erweitern und mehr.',
    icon: 'fa-solid fa-divide',
    path: '/rechnen_lernen/brueche',
  },
  {
    title: '3. Potenzen',
    description: 'Verstehe die Potenzgesetze und wende sie an.',
    icon: 'fa-solid fa-superscript',
    path: '/rechnen_lernen/potenzen',
  },
  {
    title: '4. Wurzeln',
    description: 'Übungen zum Rechnen mit Wurzeln und zur Vereinfachung.',
    icon: 'fa-solid fa-square-root-variable',
    path: '/rechnen_lernen/wurzeln',
  },
  {
    title: '5. Prozentrechnung',
    description: 'Grundlagen und fortgeschrittene Aufgaben zur Prozentrechnung.',
    icon: 'fa-solid fa-percent',
    path: '/rechnen_lernen/prozentrechnung',
  },
  {
    title: '6. Gleichungen',
    description: 'Löse lineare und quadratische Gleichungen Schritt für Schritt.',
    icon: 'fa-solid fa-equals',
    path: '/rechnen_lernen/gleichungen',
  },
];

export default function RechnenLernenIndex() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Rechnen lernen</h1>
        <p className="text-lg text-blue-800 mb-4">Wähle ein Thema aus, um zu den Übungen zu gelangen.</p>
        <Link to="/" className="text-blue-600 hover:underline mb-4">← Zurück zur Themenübersicht</Link>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {subpages.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center p-6 hover:shadow-xl transition-shadow">
            <div className="card-icon text-4xl mb-3 text-blue-700"><i className={s.icon}></i></div>
            <h3 className="text-lg font-semibold mb-1 text-blue-900">{s.title}</h3>
            <p className="text-gray-700 mb-4 text-center">{s.description}</p>
            <Link to={s.path} className="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-colors">Jetzt üben</Link>
          </div>
        ))}
      </main>
    </div>
  );
}

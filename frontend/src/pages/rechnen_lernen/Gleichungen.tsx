import { Link } from 'react-router-dom';

const aufgaben = [
  {
    title: '1. Lineare Gleichungen',
    description: 'Übe das Lösen von linearen Gleichungen mit einer Unbekannten.',
    path: '/rechnen_lernen/gleichungen/generator_lineare',
  },
  {
    title: '2. Quadratische Gleichungen',
    description: 'Lerne verschiedene Methoden zum Lösen von quadratischen Gleichungen.',
    path: '/rechnen_lernen/gleichungen/quadratisch',
  },
  {
    title: '3. Abschlusstest',
    description: 'Teste dein Wissen im Lösen von linearen und quadratischen Gleichungen.',
    path: '/rechnen_lernen/gleichungen/abschlusstest',
  },
];

export default function Gleichungen() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Gleichungen lösen</h1>
        <p className="text-lg text-blue-800 mb-4">Wähle eine Aufgabe aus der folgenden Liste aus.</p>
        <Link to="/rechnen_lernen" className="text-blue-600 hover:underline mb-4">← Zurück zur Themenübersicht</Link>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 grid gap-8 grid-cols-1 sm:grid-cols-2">
        {aufgaben.map((a) => (
          <div key={a.title} className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold mb-1 text-blue-900">{a.title}</h3>
            <p className="text-gray-700 mb-4 text-center">{a.description}</p>
            <Link to={a.path} className="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-colors">Jetzt üben</Link>
          </div>
        ))}
      </main>
    </div>
  );
}

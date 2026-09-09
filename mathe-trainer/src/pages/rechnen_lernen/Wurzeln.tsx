import { Link } from 'react-router-dom';

const aufgaben = [
  {
    title: '1. Wurzelrechnung',
    description: 'Übungen zum Vereinfachen und Berechnen von Wurzeln.',
    path: '/rechnen_lernen/wurzeln/wurzeln',
  },
];

export default function Wurzeln() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Wurzelrechnung</h1>
        <p className="text-lg text-blue-800">Wähle eine Aufgabe aus der folgenden Liste aus.</p>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 grid gap-8 grid-cols-1 sm:grid-cols-2">
        {aufgaben.map((a) => (
          <Link
            key={a.title}
            to={a.path}
            className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center p-6 hover:shadow-xl transition-shadow no-underline text-inherit"
          >
            <h3 className="text-lg font-semibold mb-1 text-blue-900">{a.title}</h3>
            <p className="text-gray-700 text-center">{a.description}</p>
          </Link>
        ))}
      </main>
    </div>
  );
}

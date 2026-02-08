import { Link } from 'react-router-dom';

const aufgaben = [
  {
    title: '1. Schreibweise und Grundlagen',
    description: 'Lerne die Grundlagen der Potenzschreibweise und einfache Berechnungen.',
    path: '/rechnen_lernen/potenzen/schreibweise',
  },
  {
    title: '2. Zehnerpotenzen',
    description: 'Übungen zur wissenschaftlichen Schreibweise und zum Rechnen mit Zehnerpotenzen.',
    path: '/rechnen_lernen/potenzen/zehnerpotenzen',
  },
  {
    title: '3. Addieren und Subtrahieren',
    description: 'Übe das Addieren und Subtrahieren von Potenzen mit gleicher Basis.',
    path: '/rechnen_lernen/potenzen/addierensubtrahieren',
  },
  {
    title: '4. Multiplizieren und Dividieren',
    description: 'Wende die Potenzgesetze für die Multiplikation und Division an.',
    path: '/rechnen_lernen/potenzen/multiplizierendividieren',
  },
  {
    title: '5. Potenzieren von Potenzen',
    description: 'Lerne, wie Potenzen potenziert werden und wende das Gesetz an.',
    path: '/rechnen_lernen/potenzen/potenzieren',
  },
  {
    title: '6. Gemischte Aufgaben',
    description: 'Wende alle Potenzgesetze in gemischten Aufgaben an.',
    path: '/rechnen_lernen/potenzen/gemischt',
  },
];

export default function Potenzen() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Potenzrechnung</h1>
        <p className="text-lg text-blue-800">Wähle eine Aufgabe aus der folgenden Liste aus.</p>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-center">
            {aufgaben.map((a) => (
              <Link
                key={a.title}
                to={a.path}
                className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center justify-center p-3 hover:shadow-xl transition-shadow no-underline text-inherit max-w-xs"
              >
                <h3 className="text-lg font-semibold mb-3 text-blue-900 text-center">{a.title}</h3>
                <p className="text-gray-700 text-center leading-relaxed">{a.description}</p>
              </Link>
            ))}
      </main>
    </div>
  );
}

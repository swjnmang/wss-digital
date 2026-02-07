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
            <p className="text-lg text-blue-800">Wähle eine Aufgabe aus der folgenden Liste aus.</p>
          </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 grid gap-8 grid-cols-1 sm:grid-cols-2">
            {aufgaben.map((a) => (
              <Link
                key={a.title}
                to={a.path}
                className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col justify-center items-center p-8 min-h-64 hover:shadow-xl transition-shadow no-underline text-inherit text-center"
              >
                <h3 className="text-xl font-semibold mb-3 text-blue-900">{a.title}</h3>
                <p className="text-gray-700">{a.description}</p>
              </Link>
            ))}
      </main>
    </div>
  );
}

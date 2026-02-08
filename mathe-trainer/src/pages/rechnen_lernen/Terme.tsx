import { Link } from 'react-router-dom';

const aufgaben = [
  {
    title: '1. Terme ohne Variablen',
    description: 'Berechne den Wert von Termen, die nur aus Zahlen bestehen.',
    path: '/rechnen_lernen/terme/ohnevariablen',
  },
  {
    title: '2. Terme zusammenfassen',
    description: 'Lerne, gleichartige Terme mit Variablen zu addieren und subtrahieren.',
    path: '/rechnen_lernen/terme/zusammenfassen',
  },
  {
    title: '3. Terme mit Potenzen',
    description: 'Fasse Terme zusammen, die auch Potenzen enthalten. Lerne Potenzregeln!',
    path: '/rechnen_lernen/terme/mitpotenzen',
  },
];

export default function Terme() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Terme</h1>
        <p className="text-lg text-blue-800">Wähle eine Aufgabe aus der folgenden Liste aus.</p>
      </header>
      <main className="flex-1 w-full mx-auto px-4 py-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center justify-items-center max-w-6xl">
        {aufgaben.map((a) => (
          <Link
            key={a.title}
            to={a.path}
            className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col justify-center items-center p-6 hover:shadow-xl transition-shadow no-underline text-inherit text-center max-w-sm"
          >
            <h3 className="text-lg font-semibold mb-2 text-blue-900">{a.title}</h3>
            <p className="text-base text-gray-700">{a.description}</p>
          </Link>
        ))}
      </main>
    </div>
  );
}

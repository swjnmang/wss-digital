import { Link } from 'react-router-dom';

const aufgaben = [
  {
    title: '1. Kürzen und Erweitern',
    description: 'Grundlagen der Bruchrechnung: Lerne, Brüche zu kürzen und zu erweitern.',
    path: '/rechnen_lernen/brueche/kuerzenerweitern',
  },
  {
    title: '2. Addieren und Subtrahieren',
    description: 'Übe das Addieren und Subtrahieren von Brüchen mit gleichen und ungleichen Nennern.',
    path: '/rechnen_lernen/brueche/addierensubtrahieren',
  },
  {
    title: '3. Multiplizieren und Dividieren',
    description: 'Verstehe und übe die Multiplikation und Division von Brüchen.',
    path: '/rechnen_lernen/brueche/multiplizierendividieren',
  },
  {
    title: '4. Gemischte Aufgaben',
    description: 'Wende alle Rechenarten in gemischten Aufgaben zur Bruchrechnung an.',
    path: '/rechnen_lernen/brueche/gemischt',
  },
];

export default function Brueche() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Bruchrechnung</h1>
        <p className="text-lg text-blue-800">Wähle eine Aufgabe aus der folgenden Liste aus.</p>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center">
        {aufgaben.map((a) => (
          <Link
            key={a.title}
            to={a.path}
            className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col justify-center items-center p-6 hover:shadow-xl transition-shadow no-underline text-inherit text-center"
          >
            <h3 className="text-lg font-semibold mb-2 text-blue-900 text-center">{a.title}</h3>
            <p className="text-base text-gray-700 text-center leading-relaxed">{a.description}</p>
          </Link>
        ))}
      </main>
    </div>
  );
}

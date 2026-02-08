import { Link } from 'react-router-dom';

const aufgaben = [
  {
    title: '1. Grundlagen der Prozentrechnung',
    description: 'Lerne die Basics: Prozentwert, Prozentsatz und Grundwert berechnen.',
    path: '/rechnen_lernen/prozentrechnung/prozentrechnung',
  },
  {
    title: '2. Bezugskalkulation',
    description: 'Berechne den Bezugs- oder Einstandspreis von Waren.',
    path: '/rechnen_lernen/prozentrechnung/bezugskalkulation',
  },
  {
    title: '3. Handelskalkulation (Vorwärts)',
    description: 'Kalkuliere den Verkaufspreis vom Listeneinkaufspreis ausgehend.',
    path: '/rechnen_lernen/prozentrechnung/handelskalkvw',
  },
  {
    title: '4. Handelskalkulation (Rückwärts)',
    description: 'Ermittle den maximalen Listeneinkaufspreis vom Verkaufspreis.',
    path: '/rechnen_lernen/prozentrechnung/handelskalkrw',
  },
  {
    title: '5. Handelskalkulation (Differenz)',
    description: 'Berechne Gewinn, Handelsspanne und andere Kennzahlen.',
    path: '/rechnen_lernen/prozentrechnung/handelskalkdif',
  },
];

export default function Prozentrechnung() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Prozentrechnung & Kalkulation</h1>
        <p className="text-lg text-blue-800">Wähle eine Aufgabe aus der folgenden Liste aus.</p>
      </header>
      <main className="flex-1 w-full mx-auto px-4 py-8 flex flex-wrap gap-4 justify-center">
            {aufgaben.map((a) => (
              <Link
                key={a.title}
                to={a.path}
                className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center justify-center p-4 hover:shadow-xl transition-shadow no-underline text-inherit w-56 h-40"
              >
                <h3 className="text-base font-semibold mb-2 text-blue-900 text-center">{a.title}</h3>
                <p className="text-gray-700 text-center leading-relaxed">{a.description}</p>
              </Link>
            ))}
      </main>
    </div>
  );
}

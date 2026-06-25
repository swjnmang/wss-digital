import { Link } from 'react-router-dom';

const subpages = [
  {
    title: '1. Rechtwinklige Dreiecke beschriften',
    description: 'Hypotenuse, Gegenkathete und Ankathete korrekt zuordnen.',
    path: '/trigonometrie/rechtwinklig-beschriften',
  },
  {
    title: '2. Sinus, Kosinus und Tangens erkennen',
    description: 'Verstehen, was die drei Winkelfunktionen als Seitenverhältnisse bedeuten.',
    path: '/trigonometrie/sinus-kosinus-tangens-erkennen',
  },
  {
    title: '3. Streckenlänge mit Sinus, Kosinus und Tangens berechnen',
    description: 'Fehlende Seiten im rechtwinkligen Dreieck mithilfe der Winkelfunktionen bestimmen.',
    path: '/trigonometrie/rechtwinklig-strecken',
  },
  {
    title: '4. Winkel berechnen mit Sinus, Kosinus und Tangens',
    description: 'Fehlende Winkel im rechtwinkligen Dreieck aus den Seitenlängen bestimmen.',
    path: '/trigonometrie/rechtwinklig-winkel',
  },
  {
    title: '5. Sinussatz',
    description: 'Seiten und Winkel mithilfe von gegenüberliegenden Paaren berechnen.',
    path: '/trigonometrie/sinussatz',
  },
  {
    title: '6. Kosinussatz',
    description: 'Mit zwei Seiten und dem eingeschlossenen Winkel fehlende Größen bestimmen.',
    path: '/trigonometrie/kosinussatz',
  },
  {
    title: '7. Flächensatz',
    description: 'Flächeninhalt und fehlende Größen im allgemeinen Dreieck berechnen.',
    path: '/trigonometrie/flaechensatz',
  },
  {
    title: '8. Gemischte Anwendungen',
    description: '20 praxisnahe Aufgaben mit Skizzen, Hinweisen und Konzeptfilter.',
    path: '/trigonometrie/gemischte-aufgaben',
  },
];

export default function TrigonometrieIndex() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-amber-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-orange-900">Trigonometrie</h1>
        <p className="text-lg text-orange-800 mb-4">Wähle ein Thema aus, um zu den Übungen zu gelangen.</p>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {subpages.map((s) => (
          <Link
            key={s.title}
            to={s.path}
            className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col justify-center items-center p-8 min-h-64 hover:shadow-xl transition-shadow no-underline text-inherit text-center"
          >
            <h3 className="text-xl font-semibold mb-3 text-orange-900">{s.title}</h3>
            <p className="text-gray-700">{s.description}</p>
          </Link>
        ))}
      </main>
    </div>
  );
}

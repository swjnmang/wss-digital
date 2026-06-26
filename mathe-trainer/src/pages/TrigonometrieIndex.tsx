import { Link } from 'react-router-dom';

const subpages = [
  {
    title: '1. Rechtwinklige Dreiecke beschriften',
    description: 'Hypotenuse, Gegenkathete und Ankathete korrekt zuordnen.',
    icon: 'fa-solid fa-shapes',
    path: '/trigonometrie/rechtwinklig-beschriften',
  },
  {
    title: '2. Sinus, Kosinus und Tangens erkennen',
    description: 'Verstehen, was die drei Winkelfunktionen als Seitenverhältnisse bedeuten.',
    icon: 'fa-solid fa-wave-square',
    path: '/trigonometrie/sinus-kosinus-tangens-erkennen',
  },
  {
    title: '3. Streckenlänge mit Sinus, Kosinus und Tangens berechnen',
    description: 'Fehlende Seiten im rechtwinkligen Dreieck mithilfe der Winkelfunktionen bestimmen.',
    icon: 'fa-solid fa-ruler',
    path: '/trigonometrie/rechtwinklig-strecken',
  },
  {
    title: '4. Winkel berechnen mit Sinus, Kosinus und Tangens',
    description: 'Fehlende Winkel im rechtwinkligen Dreieck aus den Seitenlängen bestimmen.',
    icon: 'fa-solid fa-angle-right',
    path: '/trigonometrie/rechtwinklig-winkel',
  },
  {
    title: '5. Sinussatz',
    description: 'Seiten und Winkel mithilfe von gegenüberliegenden Paaren berechnen.',
    icon: 'fa-solid fa-draw-polygon',
    path: '/trigonometrie/sinussatz',
  },
  {
    title: '6. Kosinussatz',
    description: 'Mit zwei Seiten und dem eingeschlossenen Winkel fehlende Größen bestimmen.',
    icon: 'fa-solid fa-square-root-variable',
    path: '/trigonometrie/kosinussatz',
  },
  {
    title: '7. Flächensatz',
    description: 'Flächeninhalt und fehlende Größen im allgemeinen Dreieck berechnen.',
    icon: 'fa-solid fa-vector-square',
    path: '/trigonometrie/flaechensatz',
  },
  {
    title: '8. Anwendungsaufgaben',
    description: 'Praxisnahe Aufgaben aus dem Alltag Schritt für Schritt lösen.',
    icon: 'fa-solid fa-shuffle',
    path: '/trigonometrie/anwendungsaufgaben',
  },
];

export default function TrigonometrieIndex() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Trigonometrie</h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
            Wähle ein Thema aus, um zu den Übungen zu gelangen.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {subpages.map((s) => (
            <Link
              key={s.title}
              to={s.path}
              className="bg-white rounded-2xl p-4 sm:p-5 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 flex items-center justify-center text-lg sm:text-xl text-[var(--accent)] mb-3">
                <i className={s.icon}></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 text-slate-800">{s.title}</h3>
              <p className="text-slate-500 leading-snug text-sm">{s.description}</p>
              <div className="mt-auto" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

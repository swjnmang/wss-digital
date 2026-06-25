import { Link } from 'react-router-dom';

const menuItems = [
  {
    title: '1. Normalparabel',
    description: 'Lerne die Grundlagen der Normalparabel und ihre Eigenschaften kennen.',
    path: '/quadratische_funktionen/normalparabel',
    icon: 'fa-solid fa-bezier-curve',
  },
  {
    title: '2. Scheitelpunkt ablesen',
    description: 'Übe das Ablesen des Scheitelpunkts direkt aus dem Graphen.',
    path: '/quadratische_funktionen/scheitelpunkt_ablesen',
    icon: 'fa-solid fa-map-pin',
  },
  {
    title: '3. Scheitelform',
    description: 'Verstehe den Aufbau und die Vorteile der Scheitelpunktform.',
    path: '/quadratische_funktionen/scheitelform',
    icon: 'fa-solid fa-square-root-variable',
  },
  {
    title: '4. Graph zeichnen',
    description: 'Zeichne Parabeln anhand ihrer Funktionsgleichung.',
    path: '/quadratische_funktionen/graph_zeichnen',
    icon: 'fa-solid fa-pencil',
  },
  {
    title: '5. Scheitelpunkt berechnen',
    description: 'Berechne den Scheitelpunkt aus der Normal- oder allgemeinen Form.',
    path: '/quadratische_funktionen/scheitelpunkt',
    icon: 'fa-solid fa-calculator',
  },
  {
    title: '6. Umwandlung in Scheitelform',
    description: 'Forme die allgemeine Form in die Scheitelpunktform um.',
    path: '/quadratische_funktionen/scheitelform_rechnerisch',
    icon: 'fa-solid fa-right-left',
  },
  {
    title: '7. Umwandlung in Allg. Form',
    description: 'Wandle die Scheitelpunktform in die allgemeine Form um.',
    path: '/quadratische_funktionen/scheitel_in_allg_form',
    icon: 'fa-solid fa-left-right',
  },
  {
    title: '8. Funktionsgleichung aufstellen',
    description: 'Stelle eine Funktionsgleichung aus Punkten oder Eigenschaften auf.',
    path: '/quadratische_funktionen/funktionsgleichung_aufstellen',
    icon: 'fa-solid fa-pen-ruler',
  },
  {
    title: '9. Nullstellen berechnen',
    description: 'Finde die Schnittpunkte einer Parabel mit der x-Achse.',
    path: '/quadratische_funktionen/nullstellen',
    icon: 'fa-solid fa-arrows-down-to-line',
  },
  {
    title: '10. Schnittpunkte (Parabel-Gerade)',
    description: 'Berechne die Schnittpunkte zwischen einer Parabel und einer Geraden.',
    path: '/quadratische_funktionen/schnittpunkte_gerade',
    icon: 'fa-solid fa-arrows-turn-to-dots',
  },
  {
    title: '11. Schnittpunkte (Parabel-Parabel)',
    description: 'Berechne die Schnittpunkte zwischen zwei Parabeln.',
    path: '/quadratische_funktionen/schnittpunkte_parabel',
    icon: 'fa-solid fa-code-compare',
  },
  {
    title: '12. Spiel: Nullstellen finden',
    description: 'Eine spielerische Anwendung zum Thema Nullstellen.',
    path: '/quadratische_funktionen/spiel_nullstellen',
    icon: 'fa-solid fa-gamepad',
  },
  {
    title: '13. Abschlusstest',
    description: 'Teste dein Wissen über quadratische Funktionen.',
    path: '/quadratische_funktionen/abschlusstest',
    icon: 'fa-solid fa-graduation-cap',
  },
];

export default function QuadratischeFunktionenMenu() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Quadratische Funktionen</h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
            Wähle eine Aufgabe aus der folgenden Liste aus.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="bg-white rounded-2xl p-4 sm:p-5 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 flex items-center justify-center text-lg sm:text-xl text-[var(--accent)] mb-3">
                <i className={item.icon}></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 text-slate-800">{item.title}</h3>
              <p className="text-slate-500 leading-snug text-sm">{item.description}</p>
              <div className="mt-auto" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

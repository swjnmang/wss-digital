import { Link } from 'react-router-dom';

const tasks = [
  {
    title: 'Olympiapark München',
    description: 'Hängebrücke, Flying-Fox und Dreiecksberechnungen rund um den Olympiasee.',
    icon: 'fa-solid fa-person-falling',
    path: '/trigonometrie/anwendungsaufgaben/olympiapark-muenchen',
  },
  {
    title: 'Stadionneubau',
    description: 'Steigung, Dachneigung und Flutlicht rund um einen Stadionquerschnitt.',
    icon: 'fa-solid fa-futbol',
    path: '/trigonometrie/anwendungsaufgaben/stadion',
  },
];

export default function AnwendungsaufgabenMenu() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Anwendungsaufgaben</h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
            Wähle eine Aufgabe aus, um sie Schritt für Schritt zu bearbeiten.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {tasks.map((t) => (
            <Link
              key={t.path}
              to={t.path}
              className="bg-white rounded-2xl p-4 sm:p-5 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 flex items-center justify-center text-lg sm:text-xl text-[var(--accent)] mb-3">
                <i className={t.icon}></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 text-slate-800">{t.title}</h3>
              <p className="text-slate-500 leading-snug text-sm">{t.description}</p>
              <div className="mt-auto" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

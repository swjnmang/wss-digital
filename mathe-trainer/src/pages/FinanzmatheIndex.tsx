import { Link } from 'react-router-dom';

const subpages = [
  {
    title: 'Zinsrechnung',
    description: 'Grundlagen der Zinsrechnung üben.',
    icon: 'fa-solid fa-percent',
    path: '/finanzmathe/zinsrechnung',
  },
  {
    title: 'Zinseszins',
    description: 'Zinseszins und gemischte Aufgaben.',
    icon: 'fa-solid fa-chart-line',
    path: '/finanzmathe/zinseszins',
  },
  {
    title: 'Kapitalmehrung und - minderung',
    description: 'Kombinierte Zinseszins- und Rentenrechnung.',
    icon: 'fa-solid fa-coins',
    path: '/finanzmathe/mehrung_minderung',
  },
  {
    title: 'Rentenrechnung: Endwert',
    description: 'Berechnung von Endwert, Rate oder Laufzeit (ohne Startkapital).',
    icon: 'fa-solid fa-piggy-bank',
    path: '/finanzmathe/endwert',
  },
  {
    title: 'Ratendarlehen',
    description: 'Tilgungspläne für Ratendarlehen erstellen.',
    icon: 'fa-solid fa-file-invoice-dollar',
    path: '/finanzmathe/ratendarlehen',
  },
  {
    title: 'Annuitätendarlehen',
    description: 'Tilgungspläne für Annuitätendarlehen erstellen.',
    icon: 'fa-solid fa-hand-holding-dollar',
    path: '/finanzmathe/annuitaetendarlehen',
  },
  {
    title: 'Gemischte Übungsaufgaben',
    description: 'Querschnitt mit Zinsen, Zinseszins, Sparplänen und Darlehen.',
    icon: 'fa-solid fa-shuffle',
    path: '/finanzmathe/gemischte-aufgaben',
  },
  {
    title: 'Anwendungsaufgaben',
    description: 'Praktische Anwendungsaufgaben zur Finanzmathematik.',
    icon: 'fa-solid fa-briefcase',
    path: '/finanzmathe/anwendungsaufgaben',
  },
  {
    title: '🎓 Prüfungsmodus',
    description: '10 gemischte Aufgaben unter Prüfungsbedingungen mit PDF-Zertifikat.',
    icon: 'fa-solid fa-graduation-cap',
    path: '/finanzmathe/pruefungsmodus',
  },
];

export default function FinanzmatheIndex() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Finanzmathematik</h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
            Wähle ein Thema aus, um zu den Übungen zu gelangen.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {subpages.map((s) => (
            <Link
              key={s.title}
              to={s.path}
              className="bg-white rounded-2xl p-4 sm:p-5 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-base sm:text-lg text-[var(--accent)] mb-2 sm:mb-3">
                <i className={s.icon}></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 text-slate-800">{s.title}</h3>
              <p className="text-slate-500 leading-snug mb-2 text-xs sm:text-sm">{s.description}</p>
              <div className="mt-auto" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

import { Link } from 'react-router-dom';

const subpages = [
  {
    title: 'Zinsrechnung',
    description: 'Grundlagen der Zinsrechnung üben.',
    path: '/finanzmathe/zinsrechnung',
  },
  {
    title: 'Zinseszins',
    description: 'Zinseszins und gemischte Aufgaben.',
    path: '/finanzmathe/zinseszins',
  },
  {
    title: 'Kapitalmehrung und - minderung',
    description: 'Kombinierte Zinseszins- und Rentenrechnung.',
    path: '/finanzmathe/mehrung_minderung',
  },
  {
    title: 'Rentenrechnung: Endwert',
    description: 'Berechnung von Endwert, Rate oder Laufzeit (ohne Startkapital).',
    path: '/finanzmathe/endwert',
  },
  {
    title: 'Ratendarlehen',
    description: 'Tilgungspläne für Ratendarlehen erstellen.',
    path: '/finanzmathe/ratendarlehen',
  },
  {
    title: 'Annuitätendarlehen',
    description: 'Tilgungspläne für Annuitätendarlehen erstellen.',
    path: '/finanzmathe/annuitaetendarlehen',
  },
  {
    title: 'Gemischte Übungsaufgaben',
    description: 'Querschnitt mit Zinsen, Zinseszins, Sparplänen und Darlehen.',
    path: '/finanzmathe/gemischte-aufgaben',
  },
  {
    title: 'Anwendungsaufgaben',
    description: 'Praktische Anwendungsaufgaben zur Finanzmathematik.',
    path: '/finanzmathe/anwendungsaufgaben',
  },
  {
    title: '🎓 Prüfungsmodus',
    description: '10 gemischte Aufgaben unter Prüfungsbedingungen mit PDF-Zertifikat.',
    path: '/finanzmathe/pruefungsmodus',
  },
];

export default function FinanzmatheIndex() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Finanzmathematik</h1>
        <p className="text-lg text-blue-800 mb-4">Wähle ein Thema aus, um zu den Übungen zu gelangen.</p>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {subpages.map((s) => (
          <Link
            key={s.title}
            to={s.path}
            className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col justify-center items-center p-8 min-h-64 hover:shadow-xl transition-shadow no-underline text-inherit text-center"
          >
            <h3 className="text-xl font-semibold mb-3 text-blue-900">{s.title}</h3>
            <p className="text-gray-700">{s.description}</p>
          </Link>
        ))}
      </main>
    </div>
  );
}

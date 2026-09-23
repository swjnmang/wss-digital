import { Link } from 'react-router-dom';

interface Bausteinstein {
  id: string;
  title: string;
  emoji: string;
  description: string;
  enabled: boolean;
  path: string;
}

const bausteine: Bausteinstein[] = [
  {
    id: 'anschriftenfeld',
    title: 'Anschriftenfeld',
    emoji: '📬',
    description: 'Herrn/Frau, Titel, Firmen als Anschriftpartner und die Zusatz- und Vermerkzone korrekt eintragen.',
    enabled: true,
    path: '/digitale-bildung/word/geschaeftsbrief/anschriftenfeld',
  },
  {
    id: 'infoblock',
    title: 'Infoblock',
    emoji: 'ℹ️',
    description: 'Ihr Zeichen, unser Zeichen, Ansprechpartner und Datum richtig aufbauen.',
    enabled: true,
    path: '/digitale-bildung/word/geschaeftsbrief/infoblock',
  },
  {
    id: 'gruss',
    title: 'Grußformel & Unterschrift',
    emoji: '✍️',
    description: 'Leerzeilen, Unternehmensname und „i. A.“ korrekt platzieren.',
    enabled: false,
    path: '/digitale-bildung/word/geschaeftsbrief/gruss',
  },
  {
    id: 'aufzaehlung',
    title: 'Aufzählung & Nummerierung',
    emoji: '🔢',
    description: 'Leerzeilen, Einzug und Satzzeichen bei Listen nach DIN 5008.',
    enabled: false,
    path: '/digitale-bildung/word/geschaeftsbrief/aufzaehlung',
  },
  {
    id: 'tabellen',
    title: 'Tabellen',
    emoji: '📊',
    description: 'Spalten-, Zeilen- und Summenbeschriftung nach DIN 5008.',
    enabled: false,
    path: '/digitale-bildung/word/geschaeftsbrief/tabellen',
  },
];

export default function GeschaeftsbriefIndex() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-8 px-4 text-center relative">
        <Link
          to="/digitale-bildung/word"
          className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Word
        </Link>
        <h1 className="text-2xl font-bold">✉️ Geschäftsbrief nach DIN 5008</h1>
        <p className="text-slate-300 text-sm mt-1">Wähle einen Baustein des Geschäftsbriefs aus.</p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-4">
        {bausteine.map((baustein) =>
          baustein.enabled ? (
            <Link
              key={baustein.id}
              to={baustein.path}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="text-3xl">{baustein.emoji}</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">{baustein.title}</h2>
                <p className="text-sm text-slate-500">{baustein.description}</p>
              </div>
            </Link>
          ) : (
            <div
              key={baustein.id}
              className="bg-slate-100 rounded-xl border border-slate-200 p-6 flex items-center gap-4 opacity-50 cursor-not-allowed"
            >
              <div className="text-3xl">{baustein.emoji}</div>
              <div>
                <h2 className="text-lg font-bold text-slate-600 mb-1">{baustein.title}</h2>
                <p className="text-sm text-slate-500">{baustein.description}</p>
                <span className="text-xs font-semibold text-slate-500 mt-1 inline-block uppercase tracking-wide">
                  Demnächst
                </span>
              </div>
            </div>
          ),
        )}
      </main>
    </div>
  );
}

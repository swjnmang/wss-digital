import { Link } from 'react-router-dom';
import { ARBEITSAUFTRAEGE } from '../../../lib/word-layout/arbeitsauftraege';
import { LAYOUT_TASKS } from '../../../lib/word-layout/tasks';

const choices = [
  {
    path: '/digitale-bildung/word/layout/arbeitsauftraege',
    emoji: '📄',
    title: 'Arbeitsaufträge für Word',
    text: 'Gestalte vorgegebene Texte direkt in Microsoft Word. Vorlage herunterladen, Schritt für Schritt bearbeiten und am Ende mit der Lösung vergleichen.',
    meta: `${ARBEITSAUFTRAEGE.length} Arbeitsaufträge · Vorlage & Lösung`,
    accent: 'from-blue-600 to-blue-500',
  },
  {
    path: '/digitale-bildung/word/layout/uebungen',
    emoji: '💻',
    title: 'Digitale Übungen',
    text: 'Üben direkt im Browser – ohne Word. Mit „Prüfen“ siehst du sofort, welche Vorgaben du schon erfüllt hast.',
    meta: `${LAYOUT_TASKS.length} Übungen · automatische Prüfung`,
    accent: 'from-emerald-600 to-emerald-500',
  },
];

export default function LayoutHub() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white pt-12 pb-8 sm:py-8 px-4 text-center relative">
        <Link
          to="/digitale-bildung/word"
          className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Word
        </Link>
        <h1 className="text-2xl font-bold">🎨 Layouten mit Word</h1>
        <p className="text-slate-300 text-sm mt-1">Wie möchtest du üben?</p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 content-start">
        {choices.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            <div className={`bg-gradient-to-br ${c.accent} text-white px-6 py-7 flex items-center gap-4`}>
              <span className="text-4xl">{c.emoji}</span>
              <h2 className="text-xl font-bold leading-tight">{c.title}</h2>
            </div>
            <div className="p-6 flex flex-col gap-3 flex-1">
              <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-auto">{c.meta}</p>
              <span className="text-sm font-semibold text-slate-800 group-hover:translate-x-1 transition-transform">Los geht’s →</span>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}

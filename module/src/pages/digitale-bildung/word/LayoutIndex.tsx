import { Link, useNavigate } from 'react-router-dom';
import { LAYOUT_TASKS } from '../../../lib/word-layout/tasks';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function LayoutIndex() {
  const navigate = useNavigate();
  const groups = [
    {
      title: 'Grundlagen',
      text: 'Schritt für Schritt: Zeichen-, Absatz- und Seitenformatierung kennenlernen.',
      tasks: LAYOUT_TASKS.filter((t) => t.kind !== 'projekt'),
    },
    {
      title: 'Projektaufgaben wie im Unterricht',
      text: 'Umfangreiche Arbeitsaufträge mit knappen Vorgaben – Kopf-/Fußzeile, Seitenränder, Spalten, Einzüge, Tabelle und Fußnote.',
      tasks: LAYOUT_TASKS.filter((t) => t.kind === 'projekt'),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-8 px-4 text-center relative">
        <Link
          to="/digitale-bildung/word"
          className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Word
        </Link>
        <h1 className="text-2xl font-bold">🎨 Layouten mit Word</h1>
        <p className="text-slate-300 text-sm mt-1">Wähle eine Aufgabe aus.</p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">📖 Kurz erklärt</p>
          <p>
            Der Text ist jeweils schon vorgegeben. Deine Aufgabe ist es, ihn direkt im Word-Editor zu gestalten:
            Schriftart und -größe, Farben, Ausrichtung, Überschriften, Listen, Tabellen, Absatzabstände, Seitenränder und
            Spalten. Mit „Prüfen“ siehst du, welche Arbeitsaufträge schon erfüllt sind. Am Ende speicherst du dein Ergebnis
            als Word-Datei oder als PDF-Arbeitsnachweis für deine Lehrkraft. Dein Zwischenstand bleibt im Browser erhalten.
          </p>
        </div>

        {groups.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{group.title}</h2>
              <p className="text-sm text-slate-500">{group.text}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => navigate(`/digitale-bildung/word/layout/${task.id}`)}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left flex flex-col items-start justify-start hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <span
                    className={`inline-block text-xs font-semibold uppercase tracking-wide rounded-full px-2 py-1 mb-2 ${
                      task.kind === 'projekt' ? 'text-red-700 bg-red-50' : 'text-blue-600 bg-blue-50'
                    }`}
                  >
                    {LAYOUT_TASKS.indexOf(task) + 1} · {difficultyLabel[task.difficulty] ?? task.difficulty}
                  </span>
                  <h3 className="text-base font-bold text-slate-800 mb-1">{task.title}</h3>
                  <p className="text-sm text-slate-500">{task.intro}</p>
                  <p className="text-xs text-slate-400 mt-2">{task.steps.reduce((n, st) => n + st.checks.length, 0)} Vorgaben</p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

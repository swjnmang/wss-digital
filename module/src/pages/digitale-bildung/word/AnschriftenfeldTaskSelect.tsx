import { Link, useNavigate } from 'react-router-dom';
import { ANSCHRIFTENFELD_TASKS } from '../../../lib/geschaeftsbrief/anschriftenfeld-tasks';
import { AnschriftenfeldTippsButton } from './AnschriftenfeldTipps';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function AnschriftenfeldTaskSelect() {
  const navigate = useNavigate();

  const goToTask = (taskId: string) => {
    navigate(`/digitale-bildung/word/geschaeftsbrief/anschriftenfeld/${taskId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-8 px-4 text-center relative">
        <Link
          to="/digitale-bildung/word/geschaeftsbrief"
          className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Geschäftsbrief
        </Link>
        <AnschriftenfeldTippsButton className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors" />
        <h1 className="text-2xl font-bold">📬 Anschriftenfeld</h1>
        <p className="text-slate-300 text-sm mt-1">Wähle eine Übung aus.</p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">📖 Kurz erklärt</p>
          <p>
            Das Anschriftenfeld ist 40&nbsp;mm hoch, 85&nbsp;mm breit und besteht aus 11&nbsp;Zeilen. Die ersten
            5&nbsp;Zeilen (Schriftgröße 8&nbsp;pt) bilden die Zusatz- und Vermerkzone – hier steht ganz oben die
            Rücksendeangabe. Ab Zeile 6 beginnt die eigentliche Anschrift (Schriftgröße 11&nbsp;pt).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ANSCHRIFTENFELD_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => goToTask(task.id)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 rounded-full px-2 py-1 mb-2">
                {difficultyLabel[task.difficulty] ?? task.difficulty}
              </span>
              <h3 className="text-base font-bold text-slate-800 mb-1">{task.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{task.scenario}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

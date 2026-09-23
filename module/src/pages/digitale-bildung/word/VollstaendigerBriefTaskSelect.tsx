import { Link, useNavigate } from 'react-router-dom';
import { VOLLSTAENDIGER_BRIEF_TASKS } from '../../../lib/geschaeftsbrief/vollstaendiger-brief-tasks';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function VollstaendigerBriefTaskSelect() {
  const navigate = useNavigate();

  const goToTask = (taskId: string) => {
    navigate(`/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief/${taskId}`);
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
        <h1 className="text-2xl font-bold">📄 Vollständiger Geschäftsbrief</h1>
        <p className="text-slate-300 text-sm mt-1">Wähle eine Übung aus.</p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">📖 Kurz erklärt</p>
          <p>
            Jetzt kommt alles zusammen: Anschriftenfeld, Infoblock, Betreff, Anrede sowie Grußformel und Unterschrift
            werden in einem einzigen Arbeitsauftrag geprüft – so, wie in einem echten Geschäftsbrief.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {VOLLSTAENDIGER_BRIEF_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => goToTask(task.id)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 rounded-full px-2 py-1 mb-2">
                {difficultyLabel[task.difficulty] ?? task.difficulty}
              </span>
              <h3 className="text-base font-bold text-slate-800 mb-1">{task.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{task.arbeitsauftrag}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AUFZAEHLUNG_TASKS, getAufzaehlungTaskById } from '../../../lib/geschaeftsbrief/aufzaehlung-tasks';
import { AufzaehlungTippsButton } from './AufzaehlungTipps';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function AufzaehlungTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getAufzaehlungTaskById(taskId) : undefined;
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);

  useEffect(() => {
    if (!task) {
      navigate('/digitale-bildung/word/geschaeftsbrief/aufzaehlung/uebersicht', { replace: true });
    }
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setSelections({});
    setChecked(false);
  }

  if (!task) return null;

  const taskIndex = AUFZAEHLUNG_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = AUFZAEHLUNG_TASKS[taskIndex + 1];

  const choose = (lineId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [lineId]: optionId }));
    setChecked(false);
  };

  const allAnswered = task.lines.every((line) => selections[line.id]);
  const correctCount = task.lines.filter((line) => {
    const chosen = selections[line.id];
    return chosen && line.options.find((o) => o.id === chosen)?.correct;
  }).length;
  const allCorrect = checked && correctCount === task.lines.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-6 px-4 relative">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          <Link
            to="/digitale-bildung/word/geschaeftsbrief/aufzaehlung/uebersicht"
            className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            ← Aufgabenübersicht
          </Link>
          <AufzaehlungTippsButton className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors" />
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-200 bg-white/10 rounded-full px-2 py-1 mb-2">
            {difficultyLabel[task.difficulty] ?? task.difficulty}
          </span>
          <h1 className="text-xl font-bold">{task.title}</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-slate-700 mb-3">{task.intro}</p>
          <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 font-mono text-sm text-slate-800">
            {task.beispiel.map((zeile, i) =>
              zeile.text === '' ? (
                <div key={i} className="text-slate-300">
                  (Leerzeile)
                </div>
              ) : (
                <div key={i} className={zeile.indent ? 'pl-3' : ''}>
                  {zeile.text}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {task.lines.map((line) => {
            const chosenId = selections[line.id];
            const correct = line.options.find((o) => o.id === chosenId)?.correct ?? false;
            return (
              <div key={line.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <p className="text-sm font-semibold text-slate-700 mb-3">{line.caption}</p>
                <div className="flex flex-wrap gap-2">
                  {line.options.map((option) => {
                    const selected = chosenId === option.id;
                    const showResult = checked && selected;
                    return (
                      <button
                        key={option.id}
                        onClick={() => choose(line.id, option.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all text-left ${
                          showResult
                            ? option.correct
                              ? 'bg-green-100 text-green-800 border-green-400'
                              : 'bg-red-100 text-red-800 border-red-400'
                            : selected
                              ? 'bg-blue-100 text-blue-800 border-blue-400'
                              : 'bg-slate-50 text-slate-700 border-transparent hover:border-slate-200'
                        }`}
                      >
                        {showResult && (option.correct ? '✅ ' : '❌ ')}
                        {option.text}
                      </button>
                    );
                  })}
                </div>
                {checked && chosenId && (
                  <p
                    className={`mt-3 text-sm rounded-lg px-3 py-2 ${
                      correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {line.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-600 mb-3">
            {checked ? `${correctCount} / ${task.lines.length} Fragen korrekt` : 'Noch nicht geprüft'}
          </div>
          <button
            onClick={() => setChecked(true)}
            disabled={!allAnswered}
            className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              allAnswered ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Prüfen
          </button>
          {!allAnswered && (
            <p className="mt-2 text-xs text-slate-400 text-center">
              Beantworte alle Fragen, bevor du prüfst.
            </p>
          )}
        </div>

        {allCorrect && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center">
            <p className="text-green-800 font-semibold mb-3">🎉 Super! Alle Fragen richtig beantwortet.</p>
            {nextTask ? (
              <button
                onClick={() => navigate(`/digitale-bildung/word/geschaeftsbrief/aufzaehlung/${nextTask.id}`)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Nächste Aufgabe →
              </button>
            ) : (
              <Link
                to="/digitale-bildung/word/geschaeftsbrief/aufzaehlung/uebersicht"
                className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Zur Aufgabenübersicht
              </Link>
            )}
          </div>
        )}
        {checked && !allCorrect && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 text-center">
            <p className="text-amber-800 font-semibold">
              Noch nicht ganz richtig ({correctCount} / {task.lines.length}). Korrigiere die rot markierten Antworten
              und klicke erneut auf „Prüfen“.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

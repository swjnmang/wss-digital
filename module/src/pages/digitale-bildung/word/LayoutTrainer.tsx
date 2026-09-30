import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UniverLayoutDoc, type UniverLayoutDocHandle } from '../../../components/word-trainer/UniverLayoutDoc';
import { LAYOUT_TASKS, getLayoutTask, runLayoutChecks } from '../../../lib/word-layout/tasks';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

type StepResult = ReturnType<typeof runLayoutChecks>;

export default function LayoutTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getLayoutTask(taskId) : undefined;
  const [results, setResults] = useState<StepResult | null>(null);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);
  const docRef = useRef<UniverLayoutDocHandle>(null);

  useEffect(() => {
    if (!task) navigate('/digitale-bildung/word/layout', { replace: true });
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setResults(null);
  }

  if (!task) return null;

  const taskIndex = LAYOUT_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = LAYOUT_TASKS[taskIndex + 1];

  const handleCheck = () => {
    const doc = docRef.current?.read();
    if (!doc) return;
    setResults(runLayoutChecks(task, doc));
  };

  const all = results?.flatMap((s) => s.results) ?? [];
  const correctCount = all.filter((r) => r.success).length;
  const totalCount = task.steps.reduce((n, s) => n + s.checks.length, 0);
  const allCorrect = results !== null && correctCount === totalCount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-4 px-4 relative">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <Link
            to="/digitale-bildung/word/layout"
            className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            ← Aufgabenübersicht
          </Link>
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-200 bg-white/10 rounded-full px-2 py-1 mb-1">
            {difficultyLabel[task.difficulty] ?? task.difficulty} · Word-Editor
          </span>
          <h1 className="text-lg font-bold">{task.title}</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">📝 Auftrag</p>
          <p className="text-slate-700 text-sm whitespace-pre-line">{task.auftrag}</p>
          <ol className="mt-4 flex flex-col gap-3">
            {task.steps.map((step, i) => {
              const stepResults = results?.[i]?.results;
              const done = stepResults ? stepResults.every((r) => r.success) : null;
              return (
                <li key={step.title} className="flex gap-3">
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center ${
                      done === null ? 'bg-slate-100 text-slate-600' : done ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <div className="text-sm text-slate-700">
                    <p className="font-semibold text-slate-800">{step.title}</p>
                    <p>{step.instruction}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <UniverLayoutDoc ref={docRef} task={task} />
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-600 mb-3">
            {results ? `${correctCount} / ${totalCount} Vorgaben erfüllt` : 'Noch nicht geprüft'}
          </div>
          <button
            onClick={handleCheck}
            className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all"
          >
            Prüfen
          </button>

          {results && (
            <div className="mt-4 flex flex-col gap-4">
              {results.map(({ step, results: stepResults }) => (
                <div key={step.title}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{step.title}</p>
                  <div className="flex flex-col gap-1.5">
                    {stepResults.map(({ check, success }) => (
                      <div
                        key={check.label}
                        className={`text-xs rounded-lg px-3 py-2 ${success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                      >
                        <span className="font-semibold">{success ? '✅' : '❌'} {check.label}</span>
                        {!success && <span className="block mt-0.5 text-red-700">Tipp: {check.hint}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {allCorrect && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center">
            <p className="text-green-800 font-semibold mb-3">🎉 Super! Alle Vorgaben sind erfüllt.</p>
            {nextTask ? (
              <button
                onClick={() => navigate(`/digitale-bildung/word/layout/${nextTask.id}`)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Nächste Aufgabe →
              </button>
            ) : (
              <Link
                to="/digitale-bildung/word/layout"
                className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Zur Aufgabenübersicht
              </Link>
            )}
          </div>
        )}
        {results && !allCorrect && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 text-center">
            <p className="text-amber-800 font-semibold">
              Noch nicht ganz fertig ({correctCount} / {totalCount}). Korrigiere die rot markierten Vorgaben im
              Dokument und klicke erneut auf „Prüfen“.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

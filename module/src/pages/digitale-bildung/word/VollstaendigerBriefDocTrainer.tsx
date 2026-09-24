import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UniverDoc, type UniverDocHandle } from '../../../components/word-trainer/UniverDoc';
import {
  WORD_DOKUMENT_TASKS,
  getWordDokumentTaskById,
} from '../../../lib/geschaeftsbrief/word-dokument-tasks';
import type { ValidationResult } from '../../../lib/excel-trainer/types';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function VollstaendigerBriefDocTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getWordDokumentTaskById(taskId) : undefined;
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);
  const docRef = useRef<UniverDocHandle>(null);

  useEffect(() => {
    if (!task) {
      navigate('/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief-doc/uebersicht', { replace: true });
    }
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setResults(null);
  }

  if (!task) return null;

  const taskIndex = WORD_DOKUMENT_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = WORD_DOKUMENT_TASKS[taskIndex + 1];

  const handleCheck = () => {
    const graded = docRef.current?.grade() ?? [];
    setResults(graded);
  };

  const correctCount = results?.filter((r) => r.success).length ?? 0;
  const totalCount = results?.length ?? 0;
  const allCorrect = results !== null && totalCount > 0 && correctCount === totalCount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-4 px-4 relative">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <Link
            to="/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief-doc/uebersicht"
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
        <details className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <summary className="text-xs font-semibold uppercase tracking-wide text-amber-700 cursor-pointer">
            📝 Arbeitsauftrag
          </summary>
          {task.arbeitsauftrag.split('\n\n').map((absatz, i) => (
            <p key={i} className="text-slate-700 mt-2 whitespace-pre-line text-sm">
              {absatz}
            </p>
          ))}
        </details>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <UniverDoc ref={docRef} task={task} />
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-600 mb-3">
            {results ? `${correctCount} / ${totalCount} Felder korrekt` : 'Noch nicht geprüft'}
          </div>
          <button
            onClick={handleCheck}
            className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all"
          >
            Prüfen
          </button>

          {results && (
            <div className="mt-4 flex flex-col gap-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`text-xs rounded-lg px-3 py-2 flex items-start gap-2 ${
                    r.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  <span className="font-semibold whitespace-nowrap">{r.label}:</span>
                  <span>{r.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {allCorrect && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center">
            <p className="text-green-800 font-semibold mb-3">🎉 Super! Der komplette Geschäftsbrief ist korrekt.</p>
            {nextTask ? (
              <button
                onClick={() =>
                  navigate(`/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief-doc/${nextTask.id}`)
                }
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Nächste Aufgabe →
              </button>
            ) : (
              <Link
                to="/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief-doc/uebersicht"
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
              Noch nicht ganz richtig ({correctCount} / {totalCount}). Korrigiere die rot markierten Felder im
              Dokument und klicke erneut auf „Prüfen“.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

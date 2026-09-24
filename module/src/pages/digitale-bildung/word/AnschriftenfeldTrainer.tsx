import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ANSCHRIFTENFELD_TASKS, getAnschriftenfeldTaskById } from '../../../lib/geschaeftsbrief/anschriftenfeld-tasks';
import type { AnschriftLine } from '../../../lib/geschaeftsbrief/types';
import { AnschriftenfeldTippsButton } from './AnschriftenfeldTipps';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function AnschriftenfeldTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getAnschriftenfeldTaskById(taskId) : undefined;
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);

  useEffect(() => {
    if (!task) {
      navigate('/digitale-bildung/word/geschaeftsbrief/anschriftenfeld/uebersicht', { replace: true });
    }
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setValues({});
    setChecked(false);
  }

  if (!task) return null;

  const taskIndex = ANSCHRIFTENFELD_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = ANSCHRIFTENFELD_TASKS[taskIndex + 1];

  const change = (lineId: string, text: string) => {
    setValues((prev) => ({ ...prev, [lineId]: text }));
    setChecked(false);
  };

  const isLineCorrect = (line: AnschriftLine): boolean => (values[line.id] ?? '').trim() === line.expected.trim();

  const allAnswered = task.lines.every((line) => (values[line.id] ?? '').trim() !== '');
  const correctCount = task.lines.filter(isLineCorrect).length;
  const allCorrect = checked && correctCount === task.lines.length;

  const renderRow = (line: AnschriftLine) => {
    const value = values[line.id] ?? '';
    const correct = isLineCorrect(line);
    const showResult = checked && value.trim() !== '';
    const small = line.zone === 'zusatz';
    return (
      <div key={line.id}>
        <div className="grid grid-cols-[140px_1fr] gap-x-3 items-center">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 leading-tight">
            {line.caption}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => change(line.id, e.target.value)}
            placeholder={line.placeholder}
            className={`w-full px-3 py-2 rounded-lg font-mono border-2 transition-all outline-none ${
              small ? 'text-xs' : 'text-sm'
            } ${
              showResult
                ? correct
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : 'bg-red-50 border-red-400 text-red-800'
                : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400'
            }`}
          />
        </div>
        {showResult && (
          <div className="grid grid-cols-[140px_1fr] gap-x-3">
            <div />
            <p
              className={`mt-1 text-xs rounded-lg px-3 py-2 ${
                correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {line.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-6 px-4 relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <Link
            to="/digitale-bildung/word/geschaeftsbrief/anschriftenfeld/uebersicht"
            className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            ← Aufgabenübersicht
          </Link>
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-200 bg-white/10 rounded-full px-2 py-1 mb-2">
            {difficultyLabel[task.difficulty] ?? task.difficulty}
          </span>
          <h1 className="text-xl font-bold">{task.title}</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">📝 Arbeitsauftrag</p>
          {task.arbeitsauftrag.split('\n\n').map((absatz, i) => (
            <p key={i} className="text-slate-700 mb-2 last:mb-0 whitespace-pre-line">
              {absatz}
            </p>
          ))}
        </div>

        {/* Anschriftenfeld: direkt ausfüllbar */}
        <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-6 md:p-10 flex justify-center">
          <div className="w-full max-w-[460px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Anschriftenfeld</p>
            <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
              <div className="text-[10px] text-slate-500 mb-2 font-mono">{task.senderLine}</div>
              <div className="border-t border-slate-300 mb-3" />
              <div className="flex flex-col gap-3">{task.lines.map(renderRow)}</div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="text-sm font-semibold text-slate-600 mb-3">
                {checked ? `${correctCount} / ${task.lines.length} Zeilen korrekt` : 'Noch nicht geprüft'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChecked(true)}
                  disabled={!allAnswered}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    allAnswered
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Prüfen
                </button>
                <AnschriftenfeldTippsButton className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors whitespace-nowrap" />
              </div>
              {!allAnswered && (
                <p className="mt-2 text-xs text-slate-400 text-center">
                  Fülle alle Zeilen aus, bevor du prüfst.
                </p>
              )}
            </div>
          </div>
        </div>

        {allCorrect && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center">
            <p className="text-green-800 font-semibold mb-3">🎉 Super! Das Anschriftenfeld ist korrekt aufgebaut.</p>
            {nextTask ? (
              <button
                onClick={() => navigate(`/digitale-bildung/word/geschaeftsbrief/anschriftenfeld/${nextTask.id}`)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Nächste Aufgabe →
              </button>
            ) : (
              <Link
                to="/digitale-bildung/word/geschaeftsbrief/anschriftenfeld/uebersicht"
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
              Noch nicht ganz richtig ({correctCount} / {task.lines.length}). Korrigiere die rot markierten Zeilen und
              klicke erneut auf „Prüfen“.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

import { useState } from 'react';
import type { ExcelTask, ValidationResult } from '../../lib/excel-trainer/types';

interface TaskPanelProps {
  task: ExcelTask;
  results: ValidationResult[] | null;
  onCheck: () => void;
}

const difficultyLabel: Record<ExcelTask['difficulty'], string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export function TaskPanel({ task, results, onCheck }: TaskPanelProps) {
  const allCorrect = results !== null && results.every((r) => r.success);

  const [context, ...steps] = task.instruction;
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex] ?? context;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 rounded-full px-2 py-1">
            {difficultyLabel[task.difficulty]}
          </span>
          <h2 className="text-lg font-bold text-slate-800">{task.title}</h2>
        </div>
        <button
          onClick={onCheck}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-2 transition-colors"
        >
          Prüfen
        </button>
      </div>

      {context && <p className="text-sm text-slate-500">{context}</p>}

      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
        <button
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed font-bold text-lg px-1"
          aria-label="Vorheriger Arbeitsauftrag"
        >
          ←
        </button>
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">
            Arbeitsauftrag {stepIndex + 1} von {steps.length}
          </span>
          <p className="text-sm text-slate-800 font-medium">{currentStep}</p>
        </div>
        <button
          onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
          disabled={stepIndex === steps.length - 1}
          className="text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed font-bold text-lg px-1"
          aria-label="Nächster Arbeitsauftrag"
        >
          →
        </button>
      </div>

      <p className="text-xs text-slate-400">
        ℹ️ In dieser Tabellenkalkulation werden Argumente innerhalb einer Formel mit Komma <code>,</code> statt
        Semikolon <code>;</code> getrennt (z. B. <code>=WENN(A1&gt;5,"ja","nein")</code>).
      </p>

      {task.hint && (
        <details className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
          <summary className="cursor-pointer font-semibold text-slate-600">💡 Hinweis</summary>
          <p className="mt-2">{task.hint}</p>
        </details>
      )}

      {results && (
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <p className={`text-sm font-semibold ${allCorrect ? 'text-green-600' : 'text-amber-600'}`}>
            {allCorrect ? '🎉 Alles richtig!' : 'Es sind noch nicht alle Punkte korrekt.'}
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {results.map((r, i) => (
              <li
                key={i}
                className={`text-sm rounded-lg px-3 py-2 ${
                  r.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                <span className="font-semibold">{r.label}: </span>
                {r.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

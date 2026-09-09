import { useState } from 'react';
import type { ExcelTask, ValidationResult } from '../../lib/excel-trainer/types';
import { RecordingControls } from './RecordingControls';

interface TaskPanelProps {
  task: ExcelTask;
  results: ValidationResult[] | null;
  onCheck: () => void;
  recording: boolean;
  onFinishRecording: (studentName: string) => void;
}

const difficultyLabel: Record<ExcelTask['difficulty'], string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export function TaskPanel({ task, results, onCheck, recording, onFinishRecording }: TaskPanelProps) {
  const allCorrect = results !== null && results.every((r) => r.success);

  const [context, ...steps] = task.instruction;
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex] ?? context;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
            {difficultyLabel[task.difficulty]}
          </span>
          <h2 className="text-base font-bold text-slate-800">{task.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {recording && <RecordingControls recording onStart={() => {}} onFinish={onFinishRecording} />}
          <button
            onClick={onCheck}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-1.5 text-sm transition-colors"
          >
            Prüfen
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
        <button
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed font-bold text-lg px-1 shrink-0"
          aria-label="Vorheriger Arbeitsauftrag"
        >
          ←
        </button>
        <p className="text-sm text-slate-800 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-500 mr-2">
            {stepIndex + 1}/{steps.length}
          </span>
          {currentStep}
        </p>
        <button
          onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
          disabled={stepIndex === steps.length - 1}
          className="text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed font-bold text-lg px-1 shrink-0"
          aria-label="Nächster Arbeitsauftrag"
        >
          →
        </button>
      </div>

      <details className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5">
        <summary className="cursor-pointer font-semibold text-slate-600 text-sm">💡 Kontext &amp; Hinweis</summary>
        <div className="mt-2 space-y-2">
          {context && <p>{context}</p>}
          {task.hint && <p>{task.hint}</p>}
          <p className="text-xs text-slate-400">
            ℹ️ Argumente innerhalb einer Formel werden mit Komma <code>,</code> statt Semikolon <code>;</code>{' '}
            getrennt (z. B. <code>=WENN(A1&gt;5,"ja","nein")</code>).
          </p>
        </div>
      </details>

      {results && (
        <div className="space-y-1.5 border-t border-slate-100 pt-2">
          <p className={`text-sm font-semibold ${allCorrect ? 'text-green-600' : 'text-amber-600'}`}>
            {allCorrect ? '🎉 Alles richtig!' : 'Es sind noch nicht alle Punkte korrekt.'}
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5">
            {results.map((r, i) => (
              <li
                key={i}
                className={`text-sm rounded-lg px-3 py-1.5 ${
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

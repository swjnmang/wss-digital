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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 h-full">
      <div>
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 rounded-full px-2 py-1 mb-2">
          {difficultyLabel[task.difficulty]}
        </span>
        <h2 className="text-lg font-bold text-slate-800">{task.title}</h2>
      </div>

      <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
        {task.instruction.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {task.hint && (
        <details className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
          <summary className="cursor-pointer font-semibold text-slate-600">💡 Hinweis</summary>
          <p className="mt-2">{task.hint}</p>
        </details>
      )}

      <button
        onClick={onCheck}
        className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 transition-colors"
      >
        Prüfen
      </button>

      {results && (
        <div className="space-y-2">
          <p className={`text-sm font-semibold ${allCorrect ? 'text-green-600' : 'text-amber-600'}`}>
            {allCorrect ? '🎉 Alles richtig!' : 'Es sind noch nicht alle Punkte korrekt.'}
          </p>
          <ul className="space-y-1.5">
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

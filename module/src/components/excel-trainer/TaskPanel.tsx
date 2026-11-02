import { useState, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { ExcelTask, ValidationResult } from '../../lib/excel-trainer/types';
import { ResultRow, ShellPrimary, StepButtons, TrainerHeader, backLinkClass } from '../digitale-bildung/Werkbank';
import { GuardedBackLink } from './GuardedBackLink';
import { RecordingControls } from './RecordingControls';

interface TaskPanelProps {
  task: ExcelTask;
  results: ValidationResult[] | null;
  onCheck: () => void;
  recording: boolean;
  onFinishRecording: (studentName: string) => void;
  children: ReactNode;
}

const difficultyLabel: Record<ExcelTask['difficulty'], string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export function TaskPanel({ task, results, onCheck, recording, onFinishRecording, children }: TaskPanelProps) {
  const allCorrect = results !== null && results.every((r) => r.success);
  const [showResults, setShowResults] = useState(true);

  const [context, ...steps] = task.instruction;
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = (steps[stepIndex] ?? context).replace(/^\d+\.\s*/, '');

  const check = () => {
    setShowResults(true);
    onCheck();
  };

  return (
    <>
      <TrainerHeader
        title={task.title}
        meta={difficultyLabel[task.difficulty]}
        recent="Excel"
        backSlot={
          <GuardedBackLink to="/digitale-bildung/excel-trainer" label="Zur Aufgabenübersicht" className={backLinkClass}>
            <ArrowLeft size={22} aria-hidden="true" />
          </GuardedBackLink>
        }
      >
        {recording && <RecordingControls recording onStart={() => {}} onFinish={onFinishRecording} />}
        {steps.length > 1 && <StepButtons count={steps.length} current={stepIndex} label="Teilaufgabe" onSelect={setStepIndex} />}
        <ShellPrimary onClick={check}>Prüfen</ShellPrimary>
      </TrainerHeader>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line bg-tool-soft px-4 py-2.5">
        {steps.length > 0 && (
          <span className="font-werkbank-mono text-sm font-medium text-tool-dark">
            {stepIndex + 1}/{steps.length}
          </span>
        )}
        <p className="m-0 min-w-[240px] flex-1 text-lg leading-snug font-medium">{currentStep}</p>
        <details className="text-[15.5px]">
          <summary className="cursor-pointer py-1 font-semibold">Kontext &amp; Hinweis</summary>
          <div className="mt-1 flex max-w-xl flex-col gap-2 leading-snug">
            {context && <p className="m-0">{context}</p>}
            {task.hint && <p className="m-0">{task.hint}</p>}
            <p className="m-0 text-sm text-ink-soft">
              Argumente innerhalb einer Formel werden mit Komma <code>,</code> statt Semikolon <code>;</code> getrennt (z. B.{' '}
              <code>=WENN(A1&gt;5,"ja","nein")</code>).
            </p>
          </div>
        </details>
      </div>

      {children}

      {results && showResults && (
        <div role="status" className="sticky bottom-0 z-10 max-h-52 overflow-y-auto border-t border-line-strong bg-surface px-4 py-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <ResultRow ok={allCorrect}>
              <strong>{allCorrect ? 'Richtig!' : 'Noch nicht.'}</strong> {allCorrect ? 'Alle Punkte stimmen.' : 'Es stimmen noch nicht alle Punkte.'}
            </ResultRow>
            <button onClick={() => setShowResults(false)} className="min-h-11 shrink-0 px-2 text-[15px] font-semibold text-tool-dark underline">
              Ausblenden
            </button>
          </div>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-4 gap-y-1 p-0 md:grid-cols-2 xl:grid-cols-3">
            {results.map((r, i) => (
              <li key={i}>
                <ResultRow ok={r.success}>
                  <strong>{r.label}:</strong> {r.message}
                </ResultRow>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

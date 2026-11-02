import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GRUSSFORMEL_TASKS, getGrussformelTaskById } from '../../../lib/geschaeftsbrief/grussformel-tasks';
import { GrussformelTippsButton } from './GrussformelTipps';
import { ResultBanner, ShellPrimary, TrainerHeader, TrainerPage, TrainerSplit, briefLabelClass, shellSecondaryClass, trainerMainClass } from '../../../components/digitale-bildung/Werkbank';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function GrussformelTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getGrussformelTaskById(taskId) : undefined;
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);

  useEffect(() => {
    if (!task) {
      navigate('/digitale-bildung/word/geschaeftsbrief/grussformel/uebersicht', { replace: true });
    }
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setSelections({});
    setChecked(false);
  }

  if (!task) return null;

  const taskIndex = GRUSSFORMEL_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = GRUSSFORMEL_TASKS[taskIndex + 1];

  const choose = (lineId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [lineId]: optionId }));
    setChecked(false);
  };

  const getLine = (id: string) => task.lines.find((l) => l.id === id);
  const optionText = (lineId: string) => {
    const line = getLine(lineId);
    if (!line || line.type !== 'choice') return '';
    const chosen = selections[lineId];
    return line.options.find((o) => o.id === chosen)?.text ?? '';
  };
  const isCorrect = (lineId: string) => {
    const line = getLine(lineId);
    if (!line || line.type !== 'choice') return false;
    const chosen = selections[lineId];
    return line.options.find((o) => o.id === chosen)?.correct ?? false;
  };

  const allAnswered = task.lines.every((line) => selections[line.id]);
  const correctCount = task.lines.filter((line) => isCorrect(line.id)).length;
  const allCorrect = checked && correctCount === task.lines.length;

  const previewRow = (lineId: string) => {
    const text = optionText(lineId);
    if (!text) return { text: '…', neutral: true };
    if (!checked) return { text, neutral: false, correct: undefined };
    return { text, neutral: false, correct: isCorrect(lineId) };
  };

  const blankRow = <div className="text-ink-muted">(Leerzeile)</div>;

  const rows: { key: string; content: 'blank' | { text: string; neutral: boolean; correct?: boolean } }[] = [
    { key: 'gruss', content: previewRow('gruss') },
    { key: 'blank1', content: 'blank' },
    { key: 'branche', content: previewRow('branche') },
    { key: 'firma', content: previewRow('firma') },
    { key: 'blank2', content: 'blank' },
    { key: 'mittlere-leerzeile', content: getLine('mittlere-leerzeile') ? previewRow('mittlere-leerzeile') : 'blank' },
    { key: 'blank3', content: 'blank' },
    { key: 'name', content: previewRow('name') },
  ];

  return (
    <TrainerPage tool="word">
      <TrainerHeader
        title={task.title}
        meta={difficultyLabel[task.difficulty] ?? task.difficulty}
        back={{ to: '/digitale-bildung/word/geschaeftsbrief/grussformel/uebersicht', label: 'Zur Aufgabenübersicht' }}
        recent="Word · Grußformel & Unterschrift"
      >
        <GrussformelTippsButton className={shellSecondaryClass} />
        <ShellPrimary onClick={() => setChecked(true)} disabled={!allAnswered}>
          Prüfen
        </ShellPrimary>
      </TrainerHeader>

      <TrainerSplit
        brief={
          <>
            <p className={briefLabelClass}>Arbeitsauftrag</p>
            <p className="m-0 mb-3 text-[17px] leading-normal">{task.scenario}</p>
            <p className={briefLabelClass}>Notizzettel</p>
            <ul className="m-0 list-disc space-y-0.5 pl-5 text-[15.5px]">
              {task.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </>
        }
      >
      <main className={trainerMainClass}>
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,320px)_1fr] gap-6 items-start">
          <div className="bg-surface rounded-lg border border-line p-4 xl:sticky xl:top-20">
            <p className="text-[13px] font-semibold text-ink-muted mb-2">Grußformel-Block</p>
            <div className="border border-dashed border-line-strong rounded-lg p-3 bg-canvas font-werkbank-mono text-[15px]">
              {rows.map((row) => {
                if (row.content === 'blank') return <div key={row.key}>{blankRow}</div>;
                const { text, neutral, correct } = row.content as { text: string; neutral: boolean; correct?: boolean };
                return (
                  <div
                    key={row.key}
                    className={
                      neutral
                        ? 'text-ink-muted'
                        : correct === undefined
                          ? 'text-ink font-medium'
                          : correct
                            ? 'text-correct font-medium'
                            : 'text-notyet-ink font-medium'
                    }
                  >
                    {text}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-[15px] font-semibold text-ink-soft">
              {checked ? `${correctCount} / ${task.lines.length} Zeilen korrekt` : 'Noch nicht geprüft'}
            </div>
            {!allAnswered && (
              <p className="mt-2 text-[13px] text-ink-muted text-center">
                Wähle für jede Zeile eine Option, bevor du prüfst.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {task.lines.map((line) => {
              if (line.type !== 'choice') return null;
              const chosenId = selections[line.id];
              const correct = isCorrect(line.id);
              return (
                <div key={line.id} className="bg-surface rounded-lg border border-line p-4">
                  <p className="text-[15px] font-semibold text-ink mb-3">{line.caption}</p>
                  <div className="flex flex-wrap gap-2">
                    {line.options.map((option) => {
                      const selected = chosenId === option.id;
                      const showResult = checked && selected;
                      return (
                        <button
                          key={option.id}
                          onClick={() => choose(line.id, option.id)}
                          className={`min-h-11 px-3 py-2 rounded-lg text-[15px] font-medium border-2 transition-all ${
                            showResult
                              ? option.correct
                                ? 'bg-correct-soft text-correct border-correct'
                                : 'bg-notyet-soft text-notyet-ink border-notyet'
                              : selected
                                ? 'bg-tool-soft text-tool-dark border-tool'
                                : 'bg-canvas text-ink border-transparent hover:border-line-strong'
                          }`}
                        >
                          {showResult && (option.correct ? 'Richtig: ' : 'Noch nicht: ')}
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                  {checked && chosenId && (
                    <p
                      className={`mt-3 text-[15px] rounded-lg px-3 py-2 ${
                        correct ? 'bg-correct-soft text-correct' : 'bg-notyet-soft text-notyet-ink'
                      }`}
                    >
                      {line.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

                <ResultBanner
          allCorrect={allCorrect}
          checked={checked}
          correctText="Grußformel und Unterschrift sind korrekt."
          wrongText={`${correctCount} von ${task.lines.length} Zeilen stimmen. Korrigiere die markierten Zeilen und klicke erneut auf „Prüfen“.`}
          next={
            nextTask
              ? { label: 'Nächste Aufgabe', onClick: () => navigate(`/digitale-bildung/word/geschaeftsbrief/grussformel/${nextTask.id}`) }
              : { label: 'Zur Aufgabenübersicht', to: '/digitale-bildung/word/geschaeftsbrief/grussformel/uebersicht' }
          }
        />
      </main>
      </TrainerSplit>
    </TrainerPage>
  );
}

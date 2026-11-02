import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AUFZAEHLUNG_TASKS, getAufzaehlungTaskById } from '../../../lib/geschaeftsbrief/aufzaehlung-tasks';
import { AufzaehlungTippsButton } from './AufzaehlungTipps';
import { ResultBanner, ShellPrimary, TrainerHeader, TrainerPage, TrainerSplit, briefLabelClass, shellSecondaryClass, trainerMainClass } from '../../../components/digitale-bildung/Werkbank';

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
    <TrainerPage tool="word">
      <TrainerHeader
        title={task.title}
        meta={difficultyLabel[task.difficulty] ?? task.difficulty}
        back={{ to: '/digitale-bildung/word/geschaeftsbrief/aufzaehlung/uebersicht', label: 'Zur Aufgabenübersicht' }}
        recent="Word · Aufzählung & Nummerierung"
      >
        <AufzaehlungTippsButton className={shellSecondaryClass} />
        <ShellPrimary onClick={() => setChecked(true)} disabled={!allAnswered}>
          Prüfen
        </ShellPrimary>
      </TrainerHeader>

      <TrainerSplit
        brief={
          <>
            <p className={briefLabelClass}>Beispiel</p>
            <p className="m-0 mb-3 text-[17px] leading-normal">{task.intro}</p>
            <div className="border border-dashed border-line-strong rounded-lg p-3 bg-canvas font-werkbank-mono text-[15px] text-ink">
            {task.beispiel.map((zeile, i) =>
              zeile.text === '' ? (
                <div key={i} className="text-ink-muted">
                  (Leerzeile)
                </div>
              ) : (
                <div key={i} className={zeile.indent ? 'pl-3' : ''}>
                  {zeile.text}
                </div>
              ),
            )}
          </div>
          </>
        }
      >
      <main className={trainerMainClass}>
        <div className="flex flex-col gap-4">
          {task.lines.map((line) => {
            const chosenId = selections[line.id];
            const correct = line.options.find((o) => o.id === chosenId)?.correct ?? false;
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
                        className={`min-h-11 px-3 py-2 rounded-lg text-[15px] font-medium border-2 transition-all text-left ${
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

        <div className="bg-surface rounded-lg border border-line p-4">
          <div className="text-[15px] font-semibold text-ink-soft mb-3">
            {checked ? `${correctCount} / ${task.lines.length} Fragen korrekt` : 'Noch nicht geprüft'}
          </div>
          {!allAnswered && (
            <p className="mt-2 text-[13px] text-ink-muted text-center">
              Beantworte alle Fragen, bevor du prüfst.
            </p>
          )}
        </div>

                <ResultBanner
          allCorrect={allCorrect}
          checked={checked}
          correctText="Alle Fragen sind richtig beantwortet."
          wrongText={`${correctCount} von ${task.lines.length} Antworten stimmen. Korrigiere die markierten Antworten und klicke erneut auf „Prüfen“.`}
          next={
            nextTask
              ? { label: 'Nächste Aufgabe', onClick: () => navigate(`/digitale-bildung/word/geschaeftsbrief/aufzaehlung/${nextTask.id}`) }
              : { label: 'Zur Aufgabenübersicht', to: '/digitale-bildung/word/geschaeftsbrief/aufzaehlung/uebersicht' }
          }
        />
      </main>
      </TrainerSplit>
    </TrainerPage>
  );
}

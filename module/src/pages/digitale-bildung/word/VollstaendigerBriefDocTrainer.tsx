import { useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UniverDoc, type UniverDocHandle } from '../../../components/word-trainer/UniverDoc';
import {
  WORD_DOKUMENT_TASKS,
  getWordDokumentTaskById,
} from '../../../lib/geschaeftsbrief/word-dokument-tasks';
import type { ValidationResult } from '../../../lib/excel-trainer/types';
import { ResultBanner, ResultRow, ShellPrimary, TrainerHeader, TrainerPage, TrainerSplit, briefLabelClass, trainerMainClass } from '../../../components/digitale-bildung/Werkbank';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

function preventCopy(e: ClipboardEvent | MouseEvent) {
  e.preventDefault();
}

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
    <TrainerPage tool="word">
      <TrainerHeader
        title={task.title}
        meta={`${difficultyLabel[task.difficulty] ?? task.difficulty} · Word-Editor`}
        back={{ to: '/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief-doc/uebersicht', label: 'Zur Aufgabenübersicht' }}
        recent="Word · Vollständiger Geschäftsbrief"
      >
        <ShellPrimary onClick={handleCheck}>Prüfen</ShellPrimary>
      </TrainerHeader>

      <TrainerSplit
        brief={
          <>
            <p className={briefLabelClass}>Arbeitsauftrag</p>
            {task.arbeitsauftrag.split('\n\n').map((absatz, i) => (
              <p key={i} className="m-0 mb-2 text-base leading-normal whitespace-pre-line">
                {absatz}
              </p>
            ))}
            <p className={`${briefLabelClass} mt-4`}>Brieftext (Referenz)</p>
            <p className="m-0 mb-2 text-[15px] text-ink-muted">
              Tippe den Text vollständig und wortgenau in das Dokument ab. Er lässt sich nicht kopieren.
            </p>
            <div
              className="flex flex-col gap-3 rounded-lg border border-dashed border-line-strong bg-canvas p-3 text-[15px] leading-relaxed"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              onCopy={preventCopy}
              onCut={preventCopy}
              onContextMenu={preventCopy}
            >
              {task.brieftextReferenz.map((absatz, i) => (
                <p key={i} className="m-0">
                  {absatz}
                </p>
              ))}
            </div>
          </>
        }
      >
      <main className={trainerMainClass}>
        <div className="bg-surface rounded-lg border border-line overflow-hidden">
          <UniverDoc ref={docRef} task={task} />
        </div>

        {results && (
          <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4">
            {results.map((r, i) => (
              <ResultRow key={i} ok={r.success}>
                <strong>{r.label}:</strong> {r.message}
              </ResultRow>
            ))}
          </div>
        )}

                <ResultBanner
          allCorrect={allCorrect}
          checked={results !== null}
          correctText="Der komplette Geschäftsbrief ist korrekt."
          wrongText={`${correctCount} von ${totalCount} Punkten stimmen. Korrigiere das Dokument und klicke erneut auf „Prüfen“.`}
          next={
            nextTask
              ? { label: 'Nächste Aufgabe', onClick: () => navigate(`/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief-doc/${nextTask.id}`) }
              : { label: 'Zur Aufgabenübersicht', to: '/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief-doc/uebersicht' }
          }
        />
      </main>
      </TrainerSplit>
    </TrainerPage>
  );
}

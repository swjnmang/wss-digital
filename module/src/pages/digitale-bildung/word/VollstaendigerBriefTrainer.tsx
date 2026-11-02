import { useEffect, useState } from 'react';
import type { ClipboardEvent, MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  VOLLSTAENDIGER_BRIEF_TASKS,
  getVollstaendigerBriefTaskById,
} from '../../../lib/geschaeftsbrief/vollstaendiger-brief-tasks';
import { allLineFields, brieftextMatches } from '../../../lib/geschaeftsbrief/vollstaendiger-brief-types';
import { AnschriftenfeldTippsButton } from './AnschriftenfeldTipps';
import { InfoblockTippsButton } from './InfoblockTipps';
import { ResultBanner, ShellPrimary, TrainerHeader, TrainerPage, TrainerSplit, briefLabelClass, shellSecondaryClass, trainerMainClass } from '../../../components/digitale-bildung/Werkbank';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

interface SimpleLine {
  id: string;
  caption: string;
  expected: string;
  explanation: string;
  placeholder?: string;
  zone?: 'zusatz' | 'anschrift';
}

function preventCopy(e: ClipboardEvent | MouseEvent) {
  e.preventDefault();
}

export default function VollstaendigerBriefTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getVollstaendigerBriefTaskById(taskId) : undefined;
  const [values, setValues] = useState<Record<string, string>>({});
  const [brieftext, setBrieftext] = useState('');
  const [checked, setChecked] = useState(false);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);

  useEffect(() => {
    if (!task) {
      navigate('/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief/uebersicht', { replace: true });
    }
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setValues({});
    setBrieftext('');
    setChecked(false);
  }

  if (!task) return null;

  const lines = allLineFields(task) as SimpleLine[];
  const taskIndex = VOLLSTAENDIGER_BRIEF_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = VOLLSTAENDIGER_BRIEF_TASKS[taskIndex + 1];

  const change = (lineId: string, text: string) => {
    setValues((prev) => ({ ...prev, [lineId]: text }));
    setChecked(false);
  };

  const isLineCorrect = (line: SimpleLine) => (values[line.id] ?? '').trim() === line.expected.trim();
  const isBrieftextCorrect = () => brieftextMatches(brieftext, task.brieftextReferenz);

  const isRequired = (line: SimpleLine) => line.expected.trim() !== '';
  const allAnswered =
    lines.filter(isRequired).every((line) => (values[line.id] ?? '').trim() !== '') && brieftext.trim() !== '';

  const totalFields = lines.length + 1; // +1 for the Brieftext
  const correctCount = lines.filter(isLineCorrect).length + (isBrieftextCorrect() ? 1 : 0);
  const allCorrect = checked && correctCount === totalFields;

  const renderRow = (line: SimpleLine) => {
    const value = values[line.id] ?? '';
    const correct = isLineCorrect(line);
    const showResult = checked && (value.trim() !== '' || line.expected === '');
    const small = line.zone === 'zusatz';
    return (
      <div key={line.id}>
        <div className="grid grid-cols-[170px_1fr] gap-x-3 items-center">
          <label className="text-[13px] font-semibold text-ink-soft leading-tight">
            {line.caption}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => change(line.id, e.target.value)}
            placeholder={line.placeholder}
            className={`w-full min-h-11 px-3 py-2 rounded-lg font-werkbank-mono border-2 transition-all outline-none ${
              small ? 'text-[13px]' : 'text-[15px]'
            } ${
              showResult
                ? correct
                  ? 'bg-correct-soft border-correct text-correct'
                  : 'bg-notyet-soft border-notyet text-notyet-ink'
                : 'bg-surface border-line text-ink focus:border-tool'
            }`}
          />
        </div>
        {showResult && (
          <div className="grid grid-cols-[170px_1fr] gap-x-3">
            <div />
            <p
              className={`mt-1 text-[13px] rounded-lg px-3 py-2 ${
                correct ? 'bg-correct-soft text-correct' : 'bg-notyet-soft text-notyet-ink'
              }`}
            >
              {line.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, sectionLines: SimpleLine[], options?: { bare?: boolean }) => {
    const content = (
      <>
        <p className="text-[13px] font-semibold text-ink-muted mb-3">{title}</p>
        <div className="flex flex-col gap-3">{sectionLines.map(renderRow)}</div>
      </>
    );
    if (options?.bare) {
      return <div>{content}</div>;
    }
    return <div className="bg-surface rounded-lg border border-line p-5">{content}</div>;
  };

  const brieftextShowResult = checked && brieftext.trim() !== '';
  const brieftextOk = isBrieftextCorrect();

  return (
    <TrainerPage tool="word">
      <TrainerHeader
        title={task.title}
        meta={difficultyLabel[task.difficulty] ?? task.difficulty}
        back={{ to: '/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief/uebersicht', label: 'Zur Aufgabenübersicht' }}
        recent="Word · Vollständiger Geschäftsbrief"
      >
        <AnschriftenfeldTippsButton className={shellSecondaryClass} label="Tipps Anschrift" />
        <InfoblockTippsButton className={shellSecondaryClass} label="Tipps Infoblock" />
        <ShellPrimary onClick={() => setChecked(true)} disabled={!allAnswered}>
          Prüfen
        </ShellPrimary>
      </TrainerHeader>

      <TrainerSplit
        brief={
          <>
            <p className={briefLabelClass}>Arbeitsauftrag</p>
            {task.arbeitsauftrag.split('\n\n').map((absatz, i) => (
              <p key={i} className="m-0 mb-2 text-[17px] leading-normal whitespace-pre-line last:mb-0">
                {absatz}
              </p>
            ))}
          </>
        }
      >
      <main className={trainerMainClass}>
                <div className="flex flex-col gap-5">
          {/* Der eigentliche Brief: eine durchgehende Briefseite, von oben nach unten wie ein Word-Dokument. */}
          <div className="bg-surface rounded-lg border border-line p-6 md:p-8 flex flex-col gap-8">
            {/* Briefkopf: Anschriftenfeld oben links, Infoblock oben rechts (DIN 5008) */}
            <div className="flex flex-col xl:flex-row xl:justify-between gap-6">
              <div className="w-full xl:w-[340px]">
                {renderSection('1. Anschriftenfeld', task.anschriftenfeld as SimpleLine[], { bare: true })}
              </div>
              <div className="w-full xl:w-[400px]">
                {renderSection('2. Infoblock', task.infoblock as SimpleLine[], { bare: true })}
              </div>
            </div>

            {renderSection('3. Betreff', task.betreff as SimpleLine[], { bare: true })}
            {renderSection('4. Anrede', task.anrede as SimpleLine[], { bare: true })}

            {/* Brieftext: Referenztext anzeigen (nicht kopierbar), Student tippt selbst ab */}
            <div>
              <p className="text-[13px] font-semibold text-ink-muted mb-3">5. Brieftext</p>
              <p className="text-[13px] text-ink-soft mb-2">
                Lies den vorgegebenen Brieftext und tippe ihn vollständig und wortgenau in das Textfeld darunter ab.
                Der Text lässt sich nicht kopieren – du musst ihn selbst schreiben.
              </p>
              <div
                className="bg-canvas border border-dashed border-line-strong rounded-lg p-4 mb-3 text-[15px] text-ink leading-relaxed flex flex-col gap-3"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                onCopy={preventCopy}
                onCut={preventCopy}
                onContextMenu={preventCopy}
              >
                {task.brieftextReferenz.map((absatz, i) => (
                  <p key={i}>{absatz}</p>
                ))}
              </div>
              <textarea
                value={brieftext}
                onChange={(e) => {
                  setBrieftext(e.target.value);
                  setChecked(false);
                }}
                onPaste={preventCopy}
                rows={8}
                placeholder="Tippe hier den Brieftext ab …"
                className={`w-full min-h-11 px-3 py-2 rounded-lg text-[15px] border-2 transition-all outline-none leading-relaxed ${
                  brieftextShowResult
                    ? brieftextOk
                      ? 'bg-correct-soft border-correct text-correct'
                      : 'bg-notyet-soft border-notyet text-notyet-ink'
                    : 'bg-surface border-line text-ink focus:border-tool'
                }`}
              />
              {brieftextShowResult && (
                <p
                  className={`mt-2 text-[13px] rounded-lg px-3 py-2 ${
                    brieftextOk ? 'bg-correct-soft text-correct' : 'bg-notyet-soft text-notyet-ink'
                  }`}
                >
                  {brieftextOk
                    ? 'Der Brieftext stimmt (kleine Abweichungen bei Leerzeichen werden toleriert).'
                    : 'Der abgetippte Text weicht noch vom vorgegebenen Brieftext ab. Vergleiche jedes Wort und jedes Satzzeichen genau.'}
                </p>
              )}
            </div>

            {renderSection('6. Grußformel & Unterschrift', task.grussformel as SimpleLine[], { bare: true })}
          </div>

          <div className="bg-surface rounded-lg border border-line p-5">
            <div className="text-[15px] font-semibold text-ink-soft mb-3">
              {checked ? `${correctCount} / ${totalFields} Felder korrekt` : 'Noch nicht geprüft'}
            </div>
            {!allAnswered && (
              <p className="mt-2 text-[13px] text-ink-muted text-center">
                Fülle alle Felder sowie den Brieftext aus, bevor du prüfst.
              </p>
            )}
          </div>
        </div>

                <ResultBanner
          allCorrect={allCorrect}
          checked={checked}
          correctText="Der komplette Geschäftsbrief ist korrekt."
          wrongText={`${correctCount} von ${totalFields} Feldern stimmen. Korrigiere die markierten Felder und klicke erneut auf „Prüfen“.`}
          next={
            nextTask
              ? { label: 'Nächste Aufgabe', onClick: () => navigate(`/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief/${nextTask.id}`) }
              : { label: 'Zur Aufgabenübersicht', to: '/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief/uebersicht' }
          }
        />
      </main>
      </TrainerSplit>
    </TrainerPage>
  );
}

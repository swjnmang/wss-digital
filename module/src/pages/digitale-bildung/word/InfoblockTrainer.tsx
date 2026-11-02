import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { INFOBLOCK_TASKS, getInfoblockTaskById } from '../../../lib/geschaeftsbrief/infoblock-tasks';
import { nameProblem, deriveInitials, deriveEmail, isTodayGerman } from '../../../lib/geschaeftsbrief/infoblock-types';
import { InfoblockTippsButton } from './InfoblockTipps';
import { ResultBanner, ShellPrimary, TrainerHeader, TrainerPage, TrainerSplit, briefLabelClass, shellSecondaryClass, trainerMainClass } from '../../../components/digitale-bildung/Werkbank';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function InfoblockTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getInfoblockTaskById(taskId) : undefined;
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!task) {
      navigate('/digitale-bildung/word/geschaeftsbrief/infoblock/uebersicht', { replace: true });
    }
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setValues({});
    setChecked(false);
    setRevealed({});
  }

  if (!task) return null;

  const taskIndex = INFOBLOCK_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = INFOBLOCK_TASKS[taskIndex + 1];
  const gradableLines = task.lines;
  const nameValue = values['name'] ?? '';
  const nameLine = task.lines.find((line) => line.type === 'name');
  const bossName = nameLine?.type === 'name' ? nameLine.bossName : undefined;
  const currentNameProblem = nameProblem(nameValue, bossName);
  const ownName = currentNameProblem === null;

  const changeGraded = (lineId: string, text: string) => {
    setValues((prev) => ({ ...prev, [lineId]: text }));
    setChecked(false);
  };

  const isLineCorrect = (line: (typeof task.lines)[number]): boolean => {
    const value = values[line.id] ?? '';
    if (line.type === 'text') {
      return value.trim() === line.expected.trim();
    }
    if (line.type === 'name') {
      return currentNameProblem === null;
    }
    if (line.type === 'zeichen') {
      // Kürzel und E-Mail leiten sich vom eigenen Namen ab – mit dem Namen des Chefs sind sie nicht korrekt.
      if (!ownName) return false;
      const studentInitials = deriveInitials(nameValue);
      if (!studentInitials) return false;
      return value.trim() === `${line.bossInitials}-${studentInitials}`;
    }
    if (line.type === 'email') {
      if (!ownName) return false;
      const expected = deriveEmail(nameValue, line.domain);
      if (!expected) return false;
      return value.trim() === expected;
    }
    if (line.type === 'date') {
      return isTodayGerman(value);
    }
    return true;
  };

  const isRequired = (line: (typeof task.lines)[number]): boolean => {
    if (line.type === 'text') return line.expected.trim() !== '';
    return true;
  };

  const allAnswered = task.lines.filter(isRequired).every((line) => (values[line.id] ?? '').trim() !== '');
  const correctCount = gradableLines.filter((line) => isLineCorrect(line)).length;
  const allCorrect = checked && correctCount === gradableLines.length;

  const explanationOf = (line: (typeof task.lines)[number]): string => {
    if (line.type === 'name' && currentNameProblem === 'vorgesetzter') {
      return `${bossName} ist der Name deiner bzw. deines Vorgesetzten. Hier trägst du deinen EIGENEN Vor- und Nachnamen ein – du schreibst den Brief.`;
    }
    if (line.type === 'name' && currentNameProblem === 'platzhalter') {
      return 'Das ist nur ein Platzhalter. Trage hier deinen EIGENEN Vor- und Nachnamen ein.';
    }
    if ((line.type === 'zeichen' || line.type === 'email') && checked && !ownName) {
      return `${line.explanation} Korrigiere zuerst das Feld „Name“: Dort muss dein eigener Vor- und Nachname stehen.`;
    }
    return line.explanation;
  };

  const solutionOf = (line: (typeof task.lines)[number]): string => {
    const today = new Date();
    switch (line.type) {
      case 'text':
        return line.expected.trim() === '' ? '(Feld bleibt leer)' : line.expected;
      case 'name':
        return 'Dein eigener Vor- und Nachname, z. B. „Lisa Müller“' + (bossName ? ` – nicht ${bossName}` : '');
      case 'zeichen': {
        const initials = ownName ? deriveInitials(nameValue) : null;
        return initials
          ? `${line.bossInitials}-${initials}`
          : `${line.bossInitials}-xy (xy = deine eigenen Initialen in Kleinbuchstaben)`;
      }
      case 'email': {
        const email = ownName ? deriveEmail(nameValue, line.domain) : null;
        return email ?? `vorname.nachname@${line.domain} mit deinem eigenen Namen in Kleinbuchstaben`;
      }
      case 'date':
        return `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
      case 'choice':
        return line.options.find((option) => option.correct)?.text ?? '';
    }
  };

  const renderRow = (line: (typeof task.lines)[number]) => {
    const value = values[line.id] ?? '';
    const correct = isLineCorrect(line);
    // Show a result even for an intentionally empty "text" field (expected === '').
    const showResult = checked && (value.trim() !== '' || (line.type === 'text' && line.expected === ''));
    const placeholder = 'placeholder' in line ? line.placeholder : undefined;
    return (
      <div key={line.id}>
        <div className="grid grid-cols-[130px_1fr] gap-x-3 items-center">
          <label className="text-[13px] font-semibold text-ink-soft leading-tight">
            {line.caption}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => changeGraded(line.id, e.target.value)}
            placeholder={placeholder}
            className={`w-full min-h-11 px-3 py-2 rounded-lg text-[15px] font-werkbank-mono border-2 transition-all outline-none ${
              showResult
                ? correct
                  ? 'bg-correct-soft border-correct text-correct'
                  : 'bg-notyet-soft border-notyet text-notyet-ink'
                : 'bg-surface border-line text-ink focus:border-tool'
            }`}
          />
        </div>
        {showResult && (
          <div className="grid grid-cols-[130px_1fr] gap-x-3">
            <div />
            <p
              className={`mt-1 text-[13px] rounded-lg px-3 py-2 ${
                correct ? 'bg-correct-soft text-correct' : 'bg-notyet-soft text-notyet-ink'
              }`}
            >
              {explanationOf(line)}
            </p>
          </div>
        )}
        {showResult && !correct && !revealed[line.id] && (
          <div className="grid grid-cols-[130px_1fr] gap-x-3">
            <div />
            <button
              type="button"
              onClick={() => setRevealed((prev) => ({ ...prev, [line.id]: true }))}
              className="mt-1 justify-self-start text-[13px] font-semibold text-tool-dark hover:text-ink underline"
            >
              Lösung für dieses Feld anzeigen
            </button>
          </div>
        )}
        {revealed[line.id] && (
          <div className="grid grid-cols-[130px_1fr] gap-x-3">
            <div />
            <p className="mt-1 text-[13px] rounded-lg px-3 py-2 bg-tool-soft text-ink">
              Lösung: <span className="font-werkbank-mono font-semibold">{solutionOf(line)}</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <TrainerPage tool="word">
      <TrainerHeader
        title={task.title}
        meta={difficultyLabel[task.difficulty] ?? task.difficulty}
        back={{ to: '/digitale-bildung/word/geschaeftsbrief/infoblock/uebersicht', label: 'Zur Aufgabenübersicht' }}
        recent="Word · Infoblock"
      >
        <InfoblockTippsButton className={shellSecondaryClass} />
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
                {/* Briefseite: Anschriftenfeld und Infoblock nebeneinander, wie auf einem echten Briefbogen */}
        <div className="bg-surface rounded-lg border border-line p-6 md:p-10">
          <div className="flex flex-col xl:flex-row xl:items-start gap-8 xl:gap-12">
            {/* Anschriftenfeld (Kontext) */}
            <div className="w-full xl:w-[340px] shrink-0">
              <p className="text-[13px] font-semibold text-ink-muted mb-2">Anschriftenfeld</p>
              <div className="border border-dashed border-line-strong rounded-lg p-3 bg-canvas font-werkbank-mono">
                <div className="text-[13px] text-ink-soft mb-1">{task.senderLine}</div>
                <div className="border-t border-line-strong my-1" />
                {task.empfaengerLines.map((line) => (
                  <div key={line} className="text-[15px] text-ink">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Infoblock: direkt ausfüllbar */}
            <div className="w-full xl:w-[460px] xl:shrink-0">
              <p className="text-[13px] font-semibold text-ink-muted mb-3">Infoblock</p>
              <div className="flex flex-col gap-3">
                {task.lines.map((line, i) => (
                  <div key={line.id}>
                    {renderRow(line)}
                    {(i === 3 || i === 7) && <div className="h-1" />}
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-line">
                <div className="text-[15px] font-semibold text-ink-soft mb-3">
                  {checked ? `${correctCount} / ${gradableLines.length} Felder korrekt` : 'Noch nicht geprüft'}
                </div>
                {!allAnswered && (
                  <p className="mt-2 text-[13px] text-ink-muted text-center">
                    Fülle alle Felder aus, die eine Angabe benötigen, bevor du prüfst.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block mt-10 pt-6 border-t border-dashed border-line text-[13px] text-ink-muted text-center">
            (Brieftext folgt hier im weiteren Verlauf des Geschäftsbriefs …)
          </div>
        </div>

                <ResultBanner
          allCorrect={allCorrect}
          checked={checked}
          correctText="Der Infoblock ist korrekt ausgefüllt."
          wrongText={`${correctCount} von ${gradableLines.length} Feldern stimmen. Korrigiere die markierten Felder und klicke erneut auf „Prüfen“. Wenn du nicht weiterkommst, kannst du dir die Lösung einzelner Felder anzeigen lassen.`}
          next={
            nextTask
              ? { label: 'Nächste Aufgabe', onClick: () => navigate(`/digitale-bildung/word/geschaeftsbrief/infoblock/${nextTask.id}`) }
              : { label: 'Zur Aufgabenübersicht', to: '/digitale-bildung/word/geschaeftsbrief/infoblock/uebersicht' }
          }
        />
      </main>
      </TrainerSplit>
    </TrainerPage>
  );
}

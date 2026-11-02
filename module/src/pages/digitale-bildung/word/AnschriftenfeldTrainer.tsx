import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAnschriftenfeldTaskById } from '../../../lib/geschaeftsbrief/anschriftenfeld-tasks';
import { markAnschriftenfeldSeen, pickRandomAnschriftenfeldTask } from '../../../lib/geschaeftsbrief/anschriftenfeld-random';
import type { AnschriftLine } from '../../../lib/geschaeftsbrief/types';
import { AnschriftenfeldTippsButton } from './AnschriftenfeldTipps';
import { ResultBanner, ShellPrimary, ShellSecondary, TrainerHeader, TrainerPage, TrainerSplit, briefLabelClass, shellSecondaryClass, trainerMainClass } from '../../../components/digitale-bildung/Werkbank';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const LOB = [
  'Super gemacht! Dein Anschriftenfeld ist komplett richtig.',
  'Hervorragend! Du hast alle Angaben richtig herausgesucht und korrekt angeordnet.',
  'Klasse! Jede Zeile sitzt – so kann der Brief verschickt werden.',
  'Perfekt gelöst! Du hast dich von den Zusatzinfos nicht ablenken lassen.',
  'Stark! Das Anschriftenfeld entspricht genau der DIN 5008.',
];

export default function AnschriftenfeldTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getAnschriftenfeldTaskById(taskId) : undefined;
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [lob, setLob] = useState(LOB[0]);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (task) markAnschriftenfeldSeen(task.id);
  }, [task]);

  // Neue Aufgabe: Seite kurz „neu laden“ – nach oben springen, kurz Ladehinweis, dann einblenden.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [taskId]);

  useEffect(() => {
    if (!refreshing) return;
    const timer = window.setTimeout(() => setRefreshing(false), 400);
    return () => window.clearTimeout(timer);
  }, [refreshing]);

  useEffect(() => {
    if (!task) {
      navigate('/digitale-bildung/word/geschaeftsbrief/anschriftenfeld/uebersicht', { replace: true });
    }
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setValues({});
    setChecked(false);
    setRevealed({});
    setRefreshing(true);
  }

  if (!task) return null;

  const goToRandomTask = () => {
    const next = pickRandomAnschriftenfeldTask({ excludeId: task.id });
    navigate(`/digitale-bildung/word/geschaeftsbrief/anschriftenfeld/${next.id}`);
  };

  const change = (lineId: string, text: string) => {
    setValues((prev) => ({ ...prev, [lineId]: text }));
    setChecked(false);
  };

  const isLineCorrect = (line: AnschriftLine): boolean => (values[line.id] ?? '').trim() === line.expected.trim();

  const allAnswered = task.lines.every((line) => (values[line.id] ?? '').trim() !== '');
  const correctCount = task.lines.filter(isLineCorrect).length;
  const allCorrect = checked && correctCount === task.lines.length;
  const usedSolution = task.lines.some((line) => revealed[line.id]);

  const check = () => {
    setLob(LOB[Math.floor(Math.random() * LOB.length)]);
    setChecked(true);
  };

  const renderRow = (line: AnschriftLine) => {
    const value = values[line.id] ?? '';
    const correct = isLineCorrect(line);
    const showResult = checked && value.trim() !== '';
    const small = line.zone === 'zusatz';
    return (
      <div key={line.id}>
        <input
          type="text"
          value={value}
          onChange={(e) => change(line.id, e.target.value)}
          placeholder={line.placeholder}
          aria-label="Zeile des Anschriftenfelds"
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
        {showResult && (
          <p
            className={`mt-1 text-[13px] rounded-lg px-3 py-2 ${
              correct ? 'bg-correct-soft text-correct' : 'bg-notyet-soft text-notyet-ink'
            }`}
          >
            {line.explanation}
          </p>
        )}
        {showResult && !correct && !revealed[line.id] && (
          <button
            type="button"
            onClick={() => setRevealed((prev) => ({ ...prev, [line.id]: true }))}
            className="mt-1 text-[13px] font-semibold text-tool-dark hover:text-ink underline"
          >
            Lösung für diese Zeile anzeigen
          </button>
        )}
        {revealed[line.id] && (
          <p className="mt-1 text-[13px] rounded-lg px-3 py-2 bg-tool-soft text-ink">
            Lösung: <span className="font-werkbank-mono font-semibold">{line.expected}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <TrainerPage tool="word">
      <TrainerHeader
        title={task.title}
        meta={difficultyLabel[task.difficulty] ?? task.difficulty}
        back={{ to: '/digitale-bildung/word/geschaeftsbrief/anschriftenfeld/uebersicht', label: 'Zur Aufgabenübersicht' }}
        recent="Word · Anschriftenfeld"
      >
        <AnschriftenfeldTippsButton className={shellSecondaryClass} />
        <ShellSecondary onClick={goToRandomTask}>Andere Aufgabe</ShellSecondary>
        <ShellPrimary onClick={check} disabled={!allAnswered}>
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
      {refreshing ? (
        <main className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-ink-muted">
          <div className="w-8 h-8 border-4 border-line border-t-tool rounded-full animate-spin" />
          <p className="text-[15px] font-medium">Neue Aufgabe wird geladen …</p>
        </main>
      ) : (
      <main key={task.id} className={`aufgabe-einblenden ${trainerMainClass}`}>
                {/* Anschriftenfeld: direkt ausfüllbar */}
        <div className="bg-surface rounded-lg border border-line p-6 md:p-10 flex justify-center">
          <div className="w-full max-w-[460px]">
            <p className="text-[13px] font-semibold text-ink-muted mb-3">Anschriftenfeld</p>
            <div className="border border-dashed border-line-strong rounded-lg p-4 bg-canvas">
              <div className="text-[13px] text-ink-soft mb-2 font-werkbank-mono">{task.senderLine}</div>
              <div className="border-t border-line-strong mb-3" />
              <div className="flex flex-col gap-3">{task.lines.map(renderRow)}</div>
            </div>

            <div className="mt-5 pt-4 border-t border-line">
              <div className="text-[15px] font-semibold text-ink-soft mb-3">
                {checked ? `${correctCount} / ${task.lines.length} Zeilen korrekt` : 'Noch nicht geprüft'}
              </div>
              {!allAnswered && (
                <p className="mt-2 text-[13px] text-ink-muted text-center">
                  Fülle alle Zeilen aus, bevor du prüfst.
                </p>
              )}
            </div>
          </div>
        </div>

                <ResultBanner
          allCorrect={allCorrect}
          checked={checked}
          correctText={usedSolution ? 'Jetzt stimmt alles. Versuch die nächste Aufgabe ganz ohne Lösungshilfe!' : lob}
          wrongText={`${correctCount} von ${task.lines.length} Zeilen stimmen. Korrigiere die markierten Zeilen und klicke erneut auf „Prüfen“. Wenn du nicht weiterkommst, kannst du dir die Lösung einzelner Zeilen anzeigen lassen.`}
          next={{ label: 'Nächste Aufgabe', onClick: goToRandomTask }}
        />
      </main>
      )}
      </TrainerSplit>
    </TrainerPage>
  );
}

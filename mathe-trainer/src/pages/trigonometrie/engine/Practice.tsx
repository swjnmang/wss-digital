import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Rich from '../../raum_und_form/engine/Rich';
import { useTaskTracking } from '../../../hooks/useTaskTracking';
import { parseFlexibleNumber } from '../../../utils/parseFlexibleNumber';
import { VideoEmbed } from '../../../components/VideoButton';
import TaskShell from '../../../components/layout/TaskShell';
import {
  LEVEL_LABEL,
  type ChoiceField,
  type Field,
  type Level,
  type NumField,
  type Task,
  type TopicConfig,
} from './types';

const TOTAL_TASKS = 6;
/** So lange muss eine falsche Eingabe stehen bleiben, bis sie rot wird und als Versuch zählt. */
const WRONG_DELAY = 800;

const btnPrimary = 'bk-btn bk-btn-primary';
const btnSecondary = 'bk-btn';
const panel = 'bk-panel';

const LEVEL_STYLE: Record<Level, string> = {
  einfach: 'bg-green-600 hover:bg-green-700',
  mittel: 'bg-amber-400 hover:bg-amber-300 !text-ink',
  schwer: 'bg-red-600 hover:bg-red-700',
};

// ---------- Prüfung einzelner Felder ----------

type Status = 'idle' | 'right' | 'wrong';

const isIncomplete = (raw: string) =>
  ['', '-', '−', ',', '.', '+'].includes(raw.trim()) || /[,.]$/.test(raw.trim());

function numStatus(field: NumField, raw: string): Status {
  if (isIncomplete(raw)) return 'idle';
  const cleaned = raw.replace(/°|%|cm|dm|mm|km|m/gi, '').trim();
  const x = parseFlexibleNumber(cleaned);
  if (Number.isNaN(x)) return 'wrong';
  const tol = field.tol ?? Math.max(Math.abs(field.value) * 0.01, 0.011);
  return Math.abs(x - field.value) <= tol + 1e-9 ? 'right' : 'wrong';
}

const statusBorder = (s: Status) =>
  s === 'right'
    ? 'border-green-500 bg-green-50'
    : s === 'wrong'
    ? 'border-red-500 bg-red-50'
    : 'border-edge bg-white';

// ---------- Aufgabenkarte ----------

interface CardProps {
  number: number;
  task: Task;
  topic: string;
  onNewTask: () => void;
  onSolvedChange: (solved: boolean) => void;
  onResult: (correct: boolean) => void;
  onHelp: () => void;
}

const TaskCard: React.FC<CardProps> = ({
  number,
  task,
  topic,
  onNewTask,
  onSolvedChange,
  onResult,
  onHelp,
}) => {
  const tracking = useTaskTracking(topic);
  const [inputs, setInputs] = useState<string[]>(() => task.fields.map(() => ''));
  const [choices, setChoices] = useState<(number | null)[]>(() => task.fields.map(() => null));
  // Rot erst nach kurzer Pause, damit beim Tippen nicht jede Zwischeneingabe rot aufleuchtet
  const [settled, setSettled] = useState<boolean[]>(() => task.fields.map(() => false));
  const [hadWrong, setHadWrong] = useState(false);
  const [solved, setSolved] = useState(false);
  const [tipsShown, setTipsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const raw: Status[] = task.fields.map((f, i) =>
    f.kind === 'num'
      ? numStatus(f, inputs[i])
      : choices[i] === null
      ? 'idle'
      : choices[i] === f.correct
      ? 'right'
      : 'wrong'
  );
  const shown: Status[] = raw.map((s, i) =>
    s === 'wrong' && task.fields[i].kind === 'num' && !settled[i] ? 'idle' : s
  );
  const allRight = raw.every((s) => s === 'right');
  const anyWrongShown = shown.some((s) => s === 'wrong');

  // Richtig gelöst
  useEffect(() => {
    if (solved || !allRight) return;
    setSolved(true);
    tracking.onCheck(true);
    onResult(true);
    onSolvedChange(true);
  }, [allRight, solved]);

  // Falsche Zahl-Eingabe: nach kurzer Pause rot färben und als Versuch zählen
  useEffect(() => {
    if (solved) return;
    const pending = task.fields.some(
      (f, i) => f.kind === 'num' && raw[i] === 'wrong' && !settled[i]
    );
    if (!pending) return;
    const timer = setTimeout(() => {
      setSettled(task.fields.map((f, i) => f.kind === 'num' && raw[i] === 'wrong'));
      registerWrong();
    }, WRONG_DELAY);
    return () => clearTimeout(timer);
  }, [inputs, solved]);

  function registerWrong() {
    setHadWrong(true);
    tracking.onCheck(false);
    onResult(false);
  }

  function onType(i: number, value: string) {
    if (solved) return;
    tracking.onInput();
    setInputs((arr) => arr.map((v, k) => (k === i ? value : v)));
    setSettled((arr) => arr.map((v, k) => (k === i ? false : v)));
  }

  function onChoose(i: number, option: number) {
    if (solved) return;
    tracking.onInput();
    setChoices((arr) => arr.map((v, k) => (k === i ? option : v)));
    if (option !== (task.fields[i] as ChoiceField).correct) registerWrong();
  }

  function onShowTip() {
    setTipsShown((n) => Math.min(n + 1, task.tips.length));
    onHelp();
    tracking.onHintShown();
  }

  function onShowSolution() {
    setShowSolution(true);
    onHelp();
    tracking.onHintShown();
  }

  function newTask() {
    onSolvedChange(false);
    onNewTask();
  }

  const tipsLeft = tipsShown < task.tips.length;
  const solutionLocked = !hadWrong;

  return (
    <div className={panel}>
      <h2 className="flex items-center gap-3 text-xl font-extrabold text-ink mb-3 text-left">
        <span className="bk-num">{number}</span>Aufgabe
      </h2>
      <div className={task.figure ? 'grid grid-cols-1 md:grid-cols-2 gap-4 items-center' : ''}>
        <div className="text-ink text-[17px] leading-relaxed text-left">
          <Rich text={task.text} />
        </div>
        {task.figure && <div>{task.figure}</div>}
      </div>

      <div className="mt-4 space-y-3">
        {task.fields.map((f, i) => (
          <div key={i}>
            <FieldInput
              field={f}
              status={shown[i]}
              value={inputs[i]}
              choice={choices[i]}
              disabled={solved}
              onType={(v) => onType(i, v)}
              onChoose={(o) => onChoose(i, o)}
            />
          </div>
        ))}
      </div>

      {solved && (
        <p className="bk-feedback bk-feedback-ok mt-4 justify-center"><i className="fa-solid fa-check mt-1" aria-hidden="true" />Richtig! Super gemacht!</p>
      )}
      {!solved && anyWrongShown && (
        <p className="bk-feedback bk-feedback-no mt-4 justify-center">
          {task.fields.length > 1 && shown.some((s) => s === 'right')
            ? 'Ein Teil stimmt schon – prüfe die rot markierten Felder.'
            : 'Das stimmt noch nicht.'}
        </p>
      )}

      {tipsShown > 0 && (
        <div className="mt-4 bk-feedback bk-feedback-info block font-normal">
          <ol className="space-y-2">
            {task.tips.slice(0, tipsShown).map((tip, i) => (
              <li key={i}>
                <span className="font-semibold text-slate-800">Tipp {i + 1}: </span>
                <Rich text={tip} />
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="bk-actions justify-center mt-6">
        <button onClick={newTask} className={btnSecondary}>
          Neue Aufgabe
        </button>
        <button onClick={onShowTip} disabled={!tipsLeft || solved} className={btnSecondary}>
          {tipsShown === 0 ? 'Tipp' : tipsLeft ? 'Nächster Tipp' : 'Keine weiteren Tipps'} (
          {tipsShown}/{task.tips.length})
        </button>
        <button
          onClick={onShowSolution}
          disabled={solutionLocked || showSolution}
          title={
            solutionLocked
              ? 'Die Lösung kannst du erst nach einem falschen Versuch anzeigen.'
              : undefined
          }
          className={btnSecondary}
        >
          Lösung anzeigen
        </button>
      </div>
      {solutionLocked && !solved && (
        <p className="text-sm text-muted mt-2 text-center">
          Die Lösung kannst du erst nach einem falschen Versuch anzeigen.
        </p>
      )}

      {showSolution && (
        <div className="bk-solution">
          <h3 className="bk-solution-title">Lösungsweg</h3>
          <ol className="space-y-2">
            {task.solution.map((line, i) => (
              <li key={i} className="leading-relaxed">
                <Rich text={line} />
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

interface FieldProps {
  field: Field;
  status: Status;
  value: string;
  choice: number | null;
  disabled: boolean;
  onType: (v: string) => void;
  onChoose: (o: number) => void;
}

const FieldInput: React.FC<FieldProps> = ({
  field,
  status,
  value,
  choice,
  disabled,
  onType,
  onChoose,
}) => {
  if (field.kind === 'num') {
    return (
      <div className="flex items-center justify-center gap-2 text-lg text-ink">
        <span className="font-semibold">
          <Rich text={field.label} />
        </span>
        <span>=</span>
        <input
          value={value}
          readOnly={disabled}
          inputMode="decimal"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onType(e.target.value)}
          className={`bk-input w-32 text-center ${statusBorder(
            status
          )}`}
          placeholder="?"
          aria-label="Ergebnis"
        />
        {field.unit && <span className="min-w-[2rem] text-left">{field.unit}</span>}
      </div>
    );
  }
  return (
    <div className="text-center">
      {field.label && (
        <p className="font-semibold text-slate-800 mb-2">
          <Rich text={field.label} />
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {field.options.map((opt, o) => {
          const selected = choice === o;
          const cls = selected
            ? status === 'right'
              ? 'border-green-500 bg-green-50 text-green-800'
              : 'border-red-500 bg-red-50 text-red-800'
            : 'border-edge bg-white hover:bg-sunken text-ink';
          return (
            <button
              key={o}
              type="button"
              disabled={disabled && !selected}
              onClick={() => onChoose(o)}
              className={`min-w-[4rem] min-h-[48px] px-4 py-2 rounded-xl border-2 font-bold shadow-hard-sm transition-colors disabled:opacity-50 ${cls}`}
            >
              <Rich text={opt} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Seite ----------

/** Erzeugt eine Aufgabe, die sich von den übrigen auf der Seite unterscheidet. */
function uniqueTask(cfg: TopicConfig, level: Level, slot: number, taken: Set<string>): Task {
  let task = cfg.generate(level, slot);
  for (let i = 0; i < 30 && taken.has(task.key); i++) task = cfg.generate(level, slot);
  return task;
}

function buildRound(cfg: TopicConfig, level: Level): Task[] {
  const taken = new Set<string>();
  const tasks: Task[] = [];
  for (let i = 0; i < TOTAL_TASKS; i++) {
    const t = uniqueTask(cfg, level, i, taken);
    taken.add(t.key);
    tasks.push(t);
  }
  return tasks;
}

function Erklaerung({ cfg }: { cfg: TopicConfig }) {
  return (
    <div className={`${panel} text-ink text-left`}>
      <h2 className="text-xl font-extrabold text-ink mb-3 text-left">Erklärung</h2>
      {cfg.videoId && (
        <div className="mb-5">
          <VideoEmbed src={`https://www.youtube.com/embed/${cfg.videoId}`} title={`Erklärvideo: ${cfg.title}`} />
        </div>
      )}
      <div className="space-y-3">{cfg.explanation}</div>
      {cfg.pdf && (
        <div className="mt-4 text-center">
          <a
            href={cfg.pdf}
            download
            className="bk-btn bk-btn-sm"
          >
            <i className="fa-solid fa-file-pdf mr-1" /> Übungsblatt (PDF) herunterladen
          </a>
        </div>
      )}
    </div>
  );
}

export default function Practice({ cfg }: { cfg: TopicConfig }) {
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level | null>(null);
  const [round, setRound] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [versions, setVersions] = useState<number[]>(() => Array(TOTAL_TASKS).fill(0));
  const [solved, setSolved] = useState<Record<number, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const solvedCount = Object.values(solved).filter(Boolean).length;
  const allSolved = level !== null && solvedCount === TOTAL_TASKS;

  const completionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [allSolved]);

  const startRound = (lv: Level) => {
    setTasks(buildRound(cfg, lv));
    setVersions(Array(TOTAL_TASKS).fill(0));
    setRound((r) => r + 1);
    setSolved({});
    setFinished(false);
  };

  const chooseLevel = (lv: Level | null) => {
    setLevel(lv);
    setStreak(0);
    if (lv) {
      startRound(lv);
      setTimeout(
        () =>
          document
            .getElementById('aufgaben')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        50
      );
    }
  };

  const replaceTask = (i: number) => {
    if (!level) return;
    setTasks((ts) => {
      const taken = new Set(ts.filter((_, k) => k !== i).map((t) => t.key));
      taken.add(ts[i].key);
      const next = [...ts];
      next[i] = uniqueTask(cfg, level, i, taken);
      return next;
    });
    setVersions((vs) => vs.map((v, k) => (k === i ? v + 1 : v)));
  };

  const newRound = () => {
    if (!level) return;
    startRound(level);
    document.getElementById('aufgaben')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <TaskShell title={cfg.title} subtitle={cfg.subtitle} width="narrow">
      <div className="flex flex-col gap-6">

        <Erklaerung cfg={cfg} />

        <div id="aufgaben" className={`${panel} text-center scroll-mt-4`}>
          <h2 className="text-xl font-extrabold text-ink mb-4">
            {level
              ? `Schwierigkeitsgrad: ${LEVEL_LABEL[level]}`
              : 'Wähle deinen Schwierigkeitsgrad'}
          </h2>
          <div
            className={`grid grid-cols-1 gap-3 ${
              cfg.levels.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
            }`}
          >
            {cfg.levels.map((l) => (
              <button
                key={l.id}
                onClick={() => chooseLevel(l.id)}
                className={`rounded-2xl text-white p-4 border-2 border-edge shadow-hard text-left transition-all hover:-translate-y-0.5 ${
                  LEVEL_STYLE[l.id]
                } ${level && level !== l.id ? 'opacity-50 hover:opacity-90' : ''} ${
                  level === l.id ? 'ring-4 ring-offset-2 ring-ink' : ''
                }`}
              >
                <p className="text-lg font-bold mb-1 text-inherit">{LEVEL_LABEL[l.id]}</p>
                {l.example && (
                  <p className="text-base mb-1 text-inherit">
                    <Rich text={l.example} />
                  </p>
                )}
                <p className="text-sm text-inherit opacity-90">
                  <Rich text={l.description} />
                </p>
              </button>
            ))}
          </div>
          {cfg.roundingNote && level && (
            <p className="text-sm text-muted mt-4">{cfg.roundingNote}</p>
          )}
        </div>

        {level &&
          tasks.map((task, i) => (
            <div key={`${level}-${round}-${i}-${versions[i]}`}>
              <TaskCard
                number={i + 1}
                task={task}
                topic={`${cfg.trackingTopic} (${LEVEL_LABEL[level]})`}
                onNewTask={() => replaceTask(i)}
                onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
                onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
                onHelp={() => setStreak(0)}
              />
            </div>
          ))}

        {level && (
          <div className="bk-actions justify-center">
            <div className="bk-chip !text-base !py-2.5 !px-4">
              Gelöst: {solvedCount} / {TOTAL_TASKS}
            </div>
            <div className="bk-streak">
              <i className="fa-solid fa-fire" aria-hidden="true" /> Richtig in Folge: {streak}
            </div>
            <button onClick={newRound} className={btnSecondary}>
              Sechs neue Aufgaben
            </button>
          </div>
        )}

        {allSolved && (
          <div
            ref={completionRef}
            className="bk-panel text-center !bg-[var(--correct-soft)]"
          >
            {finished ? (
              <>
                <p className="text-green-800 font-semibold mb-4">
                  Alles klar – bis zum nächsten Mal!
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={newRound} className={btnPrimary}>
                    Doch noch neue Aufgaben
                  </button>
                  <button onClick={() => navigate('/trigonometrie')} className={btnSecondary}>
                    Zur Übersicht
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-green-800 text-lg font-semibold mb-1">Super, toll gemacht!</p>
                <p className="text-green-800 mb-4">
                  Du hast alle {TOTAL_TASKS} Aufgaben richtig gelöst.
                </p>
                <p className="text-slate-700 mb-4">
                  Möchtest du neue Aufgaben üben oder hörst du hier auf?
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={newRound} className={btnPrimary}>
                    Neue Aufgaben
                  </button>
                  <button onClick={() => setFinished(true)} className={btnSecondary}>
                    Fertig für heute
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </TaskShell>
  );
}

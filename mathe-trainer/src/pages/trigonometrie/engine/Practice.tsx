import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Rich from '../../raum_und_form/engine/Rich';
import { useTaskTracking } from '../../../hooks/useTaskTracking';
import { parseFlexibleNumber } from '../../../utils/parseFlexibleNumber';
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

const btnPrimary =
  'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors';
const btnSecondary =
  'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white';
const panel = 'bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200';

const LEVEL_STYLE: Record<Level, string> = {
  einfach: 'bg-green-600 hover:bg-green-700',
  mittel: 'bg-amber-500 hover:bg-amber-600',
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
    : 'border-slate-300 bg-white';

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
      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">Aufgabe {number}</h2>
      <div className={task.figure ? 'grid grid-cols-1 md:grid-cols-2 gap-4 items-center' : ''}>
        <div className="text-slate-700 leading-relaxed">
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
        <p className="text-center font-bold mt-3 text-green-600">Richtig! Super gemacht!</p>
      )}
      {!solved && anyWrongShown && (
        <p className="text-center font-bold mt-3 text-red-600">
          {task.fields.length > 1 && shown.some((s) => s === 'right')
            ? 'Ein Teil stimmt schon – prüfe die rot markierten Felder.'
            : 'Das stimmt noch nicht.'}
        </p>
      )}

      {tipsShown > 0 && (
        <div className="mt-4 border-l-4 border-amber-400 bg-amber-50 rounded p-3 text-left text-slate-700">
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

      <div className="flex flex-wrap justify-center gap-3 mt-6">
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
        <p className="text-xs text-slate-500 mt-2 text-center">
          Die Lösung kannst du erst nach einem falschen Versuch anzeigen.
        </p>
      )}

      {showSolution && (
        <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50 text-slate-800">
          <h3 className="text-base font-bold text-center mb-2">Lösungsweg</h3>
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
      <div className="flex items-center justify-center gap-2 text-lg text-slate-800">
        <span className="font-semibold">
          <Rich text={field.label} />
        </span>
        <span>=</span>
        <input
          value={value}
          readOnly={disabled}
          inputMode="decimal"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onType(e.target.value)}
          className={`w-32 text-center border-2 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${statusBorder(
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
            : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700';
          return (
            <button
              key={o}
              type="button"
              disabled={disabled && !selected}
              onClick={() => onChoose(o)}
              className={`min-w-[4rem] px-3 py-2 rounded-lg border-2 font-semibold transition-colors disabled:opacity-50 ${cls}`}
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
    <div className={`${panel} text-slate-700`}>
      <h2 className="text-lg font-bold text-slate-800 mb-3 text-center">Erklärung</h2>
      {cfg.videoId && (
        <div className="max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden border border-slate-200 mb-5">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${cfg.videoId}`}
            title={`Erklärvideo: ${cfg.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      <div className="space-y-3">{cfg.explanation}</div>
      {cfg.pdf && (
        <div className="mt-4 text-center">
          <a
            href={cfg.pdf}
            download
            className="text-blue-600 hover:underline text-sm font-semibold"
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-8 max-w-4xl w-full flex flex-col gap-6">
        <div>
          <Link to="/trigonometrie" className="text-blue-600 hover:underline text-sm font-semibold">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 mb-2 text-center">
            {cfg.title}
          </h1>
          <p className="text-center text-slate-600">{cfg.subtitle}</p>
        </div>

        <Erklaerung cfg={cfg} />

        <div id="aufgaben" className={`${panel} text-center scroll-mt-4`}>
          <h2 className="text-lg font-bold text-slate-800 mb-4">
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
                className={`rounded-xl text-white p-4 shadow-sm transition-all ${
                  LEVEL_STYLE[l.id]
                } ${level && level !== l.id ? 'opacity-50 hover:opacity-90' : ''} ${
                  level === l.id ? 'ring-4 ring-offset-2 ring-blue-300' : ''
                }`}
              >
                <p className="text-lg font-bold mb-1 text-white">{LEVEL_LABEL[l.id]}</p>
                {l.example && (
                  <p className="text-base mb-1 text-white">
                    <Rich text={l.example} />
                  </p>
                )}
                <p className="text-sm text-white/90">
                  <Rich text={l.description} />
                </p>
              </button>
            ))}
          </div>
          {cfg.roundingNote && level && (
            <p className="text-sm text-slate-500 mt-4">{cfg.roundingNote}</p>
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
          <div className="flex justify-center gap-3 flex-wrap">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
              Gelöst: {solvedCount} / {TOTAL_TASKS}
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
              Richtig in Folge: {streak}
            </div>
            <button onClick={newRound} className={btnSecondary}>
              Sechs neue Aufgaben
            </button>
          </div>
        )}

        {allSolved && (
          <div
            ref={completionRef}
            className="bg-green-50 border-2 border-green-400 rounded-xl p-6 text-center"
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
    </div>
  );
}

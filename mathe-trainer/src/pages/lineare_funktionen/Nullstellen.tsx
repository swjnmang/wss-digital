import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber';
import { useTaskTracking } from '../../hooks/useTaskTracking';

// Sechs Aufgaben auf einer Seite
const TOTAL_TASKS = 6;

const VIDEO_EMBED_URL = 'https://www.youtube-nocookie.com/embed/yIaIp8YaZp4';

// Formel mit KaTeX (ohne Nachladen aus dem Netz)
const MathDisplay = ({ latex }: { latex: string }) => (
  <div
    className="text-center text-base my-1 leading-relaxed overflow-x-auto"
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(latex, { displayMode: true, throwOnError: false }),
    }}
  />
);

function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

// Einfach: ganzzahlige Steigung und ganzzahlige Nullstelle, Fortgeschritten: Dezimalzahlen
type Level = 'einfach' | 'fortgeschritten';

const LEVEL_LABEL: Record<Level, string> = {
  einfach: 'Einfach',
  fortgeschritten: 'Fortgeschritten',
};

const btnPrimary =
  'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors';
const btnSecondary =
  'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors';
const panel = 'text-center bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200';

const round2 = (v: number) => Math.round(v * 100) / 100;

/** Zahl mit deutschem Dezimalkomma */
const fmt = (v: number) => String(round2(v)).replace('.', ',').replace('-', '−');
/** Zahl für LaTeX (Komma ohne Abstand) */
const tex = (v: number) => String(round2(v)).replace('.', '{,}');

/** Eingabe parsen: Dezimalzahl mit Komma/Punkt oder Bruch wie 3/4 */
function parseAnswer(raw: string): number {
  const s = raw.replace(/[−–—‐]/g, '-').replace(/\s+/g, '');
  if (s.includes('/')) {
    const [a, b] = s.split('/');
    const num = parseFlexibleNumber(a);
    const den = parseFlexibleNumber(b);
    return den === 0 ? NaN : num / den;
  }
  return parseFlexibleNumber(s);
}

interface Task {
  id: number;
  m: number;
  t: number;
  /** Schreibweise y = t + m·x statt y = m·x + t */
  swapped: boolean;
}

const zero = (task: Task) => -task.t / task.m;

function mxPart(m: number) {
  if (m === 1) return 'x';
  if (m === -1) return '−x';
  return `${fmt(m)}x`;
}

function equationText({ m, t, swapped }: Task) {
  if (swapped) {
    const abs = Math.abs(m);
    const mx = abs === 1 ? 'x' : `${fmt(abs)}x`;
    return `y = ${fmt(t)} ${m < 0 ? '−' : '+'} ${mx}`;
  }
  return `y = ${mxPart(m)} ${t < 0 ? '−' : '+'} ${fmt(Math.abs(t))}`;
}

function equationTex({ m, t, swapped }: Task) {
  const mx = m === 1 ? 'x' : m === -1 ? '-x' : `${tex(m)}x`;
  if (swapped) {
    const abs = Math.abs(m);
    return `${tex(t)} ${m < 0 ? '-' : '+'} ${abs === 1 ? '' : tex(abs)}x`;
  }
  return `${mx} ${t < 0 ? '-' : '+'} ${tex(Math.abs(t))}`;
}

const advancedSlopes = [-5, -4, -2.5, -2, -1.5, -0.5, 0.5, 1.5, 2, 2.5, 4, 5] as const;

let nextTaskId = 1;

function newTask(level: Level, avoid: Task[] = []): Task {
  const id = nextTaskId++;
  for (;;) {
    let task: Task;
    if (level === 'einfach') {
      const m = pick([-4, -3, -2, -1, 1, 2, 3, 4] as const);
      let x0 = 0;
      while (x0 === 0) x0 = randomInt(6, -6);
      task = { id, m, t: -m * x0, swapped: false };
    } else {
      const m = pick(advancedSlopes);
      let t = 0;
      while (t === 0) t = randomInt(9, -9);
      task = { id, m, t, swapped: Math.random() < 0.35 };
      const x0 = zero(task);
      // Nullstelle mit höchstens zwei Nachkommastellen, keine ganze Zahl und im sichtbaren Bereich
      if (
        Math.abs(x0 * 100 - Math.round(x0 * 100)) > 1e-9 ||
        Number.isInteger(x0) ||
        Math.abs(x0) > 9
      )
        continue;
    }
    if (Math.abs(task.t) > 12) continue;
    if (avoid.some((a) => a.m === task.m && a.t === task.t)) continue;
    return task;
  }
}

function newTaskSet(level: Level): Task[] {
  const tasks: Task[] = [];
  for (let i = 0; i < TOTAL_TASKS; i++) tasks.push(newTask(level, tasks));
  return tasks;
}

// ---------- Koordinatensystem ----------

const RANGE = 10;
const SIZE = 320;

function CoordinateGraph({
  task,
  guess,
  showZero,
}: {
  task: Task;
  guess: number | null;
  showZero: boolean;
}) {
  const sx = (x: number) => ((x + RANGE) / (2 * RANGE)) * SIZE;
  const sy = (y: number) => SIZE - ((y + RANGE) / (2 * RANGE)) * SIZE;
  const ticks = Array.from({ length: 2 * RANGE + 1 }, (_, i) => i - RANGE);
  const x0 = zero(task);
  const clipId = useRef(`clip-${Math.random().toString(36).slice(2, 9)}`).current;
  const guessOk = guess !== null && Math.abs(guess - x0) < 0.01;
  const guessVisible = guess !== null && Math.abs(guess) <= RANGE;

  return (
    <svg
      viewBox={`-6 -6 ${SIZE + 12} ${SIZE + 12}`}
      className="w-full max-w-[340px] mx-auto bg-white rounded border border-slate-200"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={SIZE} height={SIZE} />
        </clipPath>
      </defs>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={0} x2={sx(v)} y2={SIZE} stroke="#e2e8f0" strokeWidth={1} />
          <line x1={0} y1={sy(v)} x2={SIZE} y2={sy(v)} stroke="#e2e8f0" strokeWidth={1} />
        </g>
      ))}
      {/* Achsen */}
      <line x1={0} y1={sy(0)} x2={SIZE} y2={sy(0)} stroke="#334155" strokeWidth={1.5} />
      <line x1={sx(0)} y1={0} x2={sx(0)} y2={SIZE} stroke="#334155" strokeWidth={1.5} />
      <text
        x={SIZE - 4}
        y={sy(0) - 5}
        fontSize={11}
        textAnchor="end"
        fill="#334155"
        fontStyle="italic"
      >
        x
      </text>
      <text x={sx(0) + 5} y={11} fontSize={11} fill="#334155" fontStyle="italic">
        y
      </text>
      {ticks
        .filter((v) => v !== 0 && v % 2 === 0)
        .map((v) => (
          <g key={`l${v}`} fontSize={8} fill="#64748b">
            <text x={sx(v)} y={sy(0) + 10} textAnchor="middle">
              {v}
            </text>
            <text x={sx(0) - 3} y={sy(v) + 3} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
      {/* Gerade */}
      <line
        x1={sx(-RANGE)}
        y1={sy(task.m * -RANGE + task.t)}
        x2={sx(RANGE)}
        y2={sy(task.m * RANGE + task.t)}
        stroke="#2563eb"
        strokeWidth={2.5}
        clipPath={`url(#${clipId})`}
      />
      {/* Eingabe des Schülers */}
      {guessVisible && !(showZero && guessOk) && (
        <g>
          <circle
            cx={sx(guess!)}
            cy={sy(0)}
            r={5}
            fill={guessOk ? '#16a34a' : '#dc2626'}
            stroke="white"
            strokeWidth={1.5}
          />
          <text
            x={sx(guess!)}
            y={sy(0) + 20}
            fontSize={10}
            fontWeight="bold"
            stroke="white"
            strokeWidth={3}
            paintOrder="stroke"
            textAnchor="middle"
            fill={guessOk ? '#16a34a' : '#dc2626'}
          >
            deine Lösung
          </text>
        </g>
      )}
      {/* Richtige Nullstelle */}
      {showZero && (
        <g>
          <circle cx={sx(x0)} cy={sy(0)} r={5} fill="#16a34a" stroke="white" strokeWidth={1.5} />
          <text
            x={sx(x0)}
            y={sy(0) - 9}
            fontSize={10}
            fontWeight="bold"
            stroke="white"
            strokeWidth={3}
            paintOrder="stroke"
            textAnchor="middle"
            fill="#16a34a"
          >
            N({fmt(x0)}|0)
          </text>
        </g>
      )}
    </svg>
  );
}

// ---------- Erklärung mit Beispiel und Video ----------

const EXAMPLE: Task = { id: 0, m: 2, t: -4, swapped: false };

function Intro({ onHide }: { onHide?: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-lg font-bold text-slate-800">So berechnest du eine Nullstelle</h2>
        {onHide && (
          <button
            onClick={onHide}
            className="text-blue-600 hover:underline text-sm font-semibold shrink-0"
          >
            Ausblenden
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="text-slate-700">
          <p className="mb-3">
            Die <strong>Nullstelle</strong> ist die Stelle, an der die Gerade die{' '}
            <strong>x-Achse schneidet</strong>. Jeder Punkt auf der x-Achse hat den y-Wert 0 –
            deshalb setzt man <strong>y = 0</strong> und löst die Gleichung nach x auf.
          </p>
          <p className="font-semibold text-slate-800 mb-1">Beispiel: y = 2x − 4</p>
          <div className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
            <p className="text-sm text-slate-600">1. y = 0 setzen:</p>
            <MathDisplay latex={`0 = 2x - 4 \\quad | + 4`} />
            <p className="text-sm text-slate-600">2. Nach x auflösen:</p>
            <MathDisplay latex={`4 = 2x \\quad | : 2`} />
            <MathDisplay latex={`x = 2`} />
            <p className="text-sm text-slate-600">3. Nullstelle angeben:</p>
            <div className="font-bold">
              <MathDisplay latex={`N(2\\,|\\,0)`} />
            </div>
          </div>
        </div>
        <div>
          <CoordinateGraph task={EXAMPLE} guess={null} showZero />
          <p className="text-sm text-slate-600 text-center mt-2">
            Die Gerade y = 2x − 4 schneidet die x-Achse bei x = 2.
          </p>
        </div>
      </div>
      <h3 className="text-base font-bold text-slate-800 mt-6 mb-2 text-center">Erklärvideo</h3>
      <div className="relative w-full max-w-xl mx-auto aspect-video rounded-lg overflow-hidden border border-slate-200 bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={VIDEO_EMBED_URL}
          title="Erklärvideo: Nullstellen berechnen"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// ---------- Aufgabenkarte ----------

type AnswerStatus = 'idle' | 'right' | 'wrong';

interface CardProps {
  number: number;
  task: Task;
  level: Level;
  onNewTask: () => void;
  /** Meldet, ob die Aufgabe aktuell richtig gelöst ist. */
  onSolvedChange: (solved: boolean) => void;
  /** Meldet jedes Prüfergebnis für die Serie "Richtig in Folge". */
  onResult: (correct: boolean) => void;
  onHelp: () => void;
}

function TaskCard({ number, task, level, onNewTask, onSolvedChange, onResult, onHelp }: CardProps) {
  const tracking = useTaskTracking(`Nullstellen berechnen (${LEVEL_LABEL[level]})`);
  const [input, setInput] = useState('');
  const [solved, setSolved] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  const x0 = zero(task);
  const trimmed = input.trim();
  const parsed = parseAnswer(input);
  const incomplete = trimmed === '' || /^[-−–+.,/]$/.test(trimmed) || trimmed.endsWith('/');
  const status: AnswerStatus =
    incomplete || Number.isNaN(parsed) ? 'idle' : Math.abs(parsed - x0) < 0.01 ? 'right' : 'wrong';

  // Live-Auswertung: richtig sofort, falsch erst, wenn die Eingabe kurz stehen bleibt
  useEffect(() => {
    if (solved) return;
    if (status === 'right') {
      setSolved(true);
      tracking.onCheck(true);
      onResult(true);
      onSolvedChange(true);
      return;
    }
    if (status === 'wrong') {
      const timer = setTimeout(() => {
        tracking.onCheck(false);
        onResult(false);
      }, 900);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, solved]);

  function onShowAnswer() {
    setShowSolution(true);
    onHelp();
    tracking.onHintShown();
  }

  const hint =
    status === 'wrong' && Math.sign(parsed) !== 0 && Math.sign(parsed) !== Math.sign(x0)
      ? 'Das Vorzeichen stimmt nicht.'
      : 'Noch nicht richtig.';

  const border =
    status === 'right'
      ? 'border-green-500 bg-green-50'
      : status === 'wrong'
      ? 'border-red-500 bg-red-50'
      : 'border-slate-300';

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}</h2>
      <p className="text-slate-700 mb-1">Berechne die Nullstelle der Geraden.</p>
      <p className="text-center text-xl font-serif italic text-slate-800 my-4">
        {equationText(task)}
      </p>

      <div className="flex items-center justify-center gap-1 font-semibold text-slate-800">
        <span>N(</span>
        <input
          value={input}
          readOnly={solved}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInput(e.target.value);
            tracking.onInput();
          }}
          className={`w-24 text-center border-2 rounded px-2 py-1.5 focus:outline-none ${border}`}
          placeholder="x"
          inputMode="decimal"
          aria-label={`Nullstelle Aufgabe ${number}`}
        />
        <span>| 0 )</span>
      </div>
      {level === 'fortgeschritten' && (
        <p className="text-xs text-slate-500 mt-1">
          Dezimalzahl (z. B. 1,25) oder Bruch (z. B. 5/4)
        </p>
      )}
      {status === 'right' && (
        <p className="text-center font-bold mt-3 text-green-600">Richtig! Super gemacht!</p>
      )}
      {status === 'wrong' && <p className="text-center font-bold mt-3 text-red-600">{hint}</p>}

      <div className="flex flex-wrap justify-center gap-2 mt-5">
        <button onClick={() => setShowGraph((v) => !v)} className={btnSecondary}>
          {showGraph ? 'Graph ausblenden' : 'Grafisch anzeigen'}
        </button>
        <button onClick={onShowAnswer} className={btnSecondary}>
          Lösung anzeigen
        </button>
        <button onClick={onNewTask} className={btnSecondary}>
          Neue Aufgabe
        </button>
      </div>

      {showGraph && (
        <div className="mt-5">
          <CoordinateGraph
            task={task}
            guess={status === 'idle' ? null : parsed}
            showZero={solved || showSolution}
          />
          <p className="text-sm text-slate-600 mt-2">
            {status === 'idle'
              ? 'Gib eine Lösung ein – dein Punkt erscheint dann auf der x-Achse.'
              : status === 'right'
              ? 'Dein Punkt liegt genau dort, wo die Gerade die x-Achse schneidet.'
              : 'Dein Punkt liegt nicht auf der Geraden – die Gerade schneidet die x-Achse an einer anderen Stelle.'}
          </p>
        </div>
      )}

      {showSolution && (
        <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h3 className="text-base font-bold text-slate-800 text-center mb-2">Lösungsweg</h3>
          <p className="text-sm text-slate-600">An der Nullstelle ist y = 0:</p>
          <MathDisplay
            latex={`0 = ${equationTex(task)} \\quad | ${task.t < 0 ? '+' : '-'} ${tex(
              Math.abs(task.t)
            )}`}
          />
          <MathDisplay
            latex={`${tex(-task.t)} = ${
              task.m === 1 ? '' : task.m === -1 ? '-' : tex(task.m)
            }x \\quad | : ${task.m < 0 ? `(${tex(task.m)})` : tex(task.m)}`}
          />
          <MathDisplay latex={`x = \\dfrac{${tex(-task.t)}}{${tex(task.m)}} = ${tex(x0)}`} />
          <div className="font-bold text-slate-800 mt-2">
            <MathDisplay latex={`N(${tex(x0)}\\,|\\,0)`} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Seite: sechs Aufgaben auf einmal ----------

export default function Nullstellen() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [solved, setSolved] = useState<Record<number, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const solvedCount = Object.values(solved).filter(Boolean).length;
  const allSolved = level !== null && solvedCount === TOTAL_TASKS;

  const completionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [allSolved]);

  const startNewRound = (lvl: Level | null = level) => {
    setTasks(lvl ? newTaskSet(lvl) : []);
    setSolved({});
    setFinished(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chooseLevel = (next: Level | null) => {
    setLevel(next);
    startNewRound(next);
    setStreak(0);
  };

  const replaceTask = (i: number) => {
    if (!level) return;
    setSolved((s) => ({ ...s, [i]: false }));
    setTasks((ts) => ts.map((t, j) => (j === i ? newTask(level, ts) : t)));
  };

  const [showIntro, setShowIntro] = useState(true);

  const header = (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Nullstellen berechnen</h1>
      <p className="text-center text-slate-600">
        Die Nullstelle ist der Punkt, an dem die Gerade die x-Achse schneidet. Dort gilt y = 0.
      </p>
    </div>
  );

  const intro = showIntro ? (
    <Intro onHide={() => setShowIntro(false)} />
  ) : (
    <div className="text-center">
      <button
        onClick={() => setShowIntro(true)}
        className="text-blue-600 hover:underline text-sm font-semibold"
      >
        Erklärung und Erklärvideo einblenden
      </button>
    </div>
  );

  if (!level) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="mx-auto px-4 py-8 max-w-3xl w-full flex flex-col gap-6">
          {header}
          {intro}
          <div className={panel}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Wähle deinen Schwierigkeitsgrad
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => chooseLevel('einfach')}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white p-5 shadow-sm transition-colors"
              >
                <p className="text-lg font-bold mb-1 text-white">Einfach</p>
                <p className="text-xl font-serif italic mb-2 text-white">y = 2x − 6</p>
                <p className="text-sm text-white/90">
                  Ganzzahlige Steigungen – die Nullstelle ist immer eine ganze Zahl.
                </p>
              </button>
              <button
                onClick={() => chooseLevel('fortgeschritten')}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white p-5 shadow-sm transition-colors"
              >
                <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                <p className="text-xl font-serif italic mb-2 text-white">y = 3 − 2,5x</p>
                <p className="text-sm text-white/90">
                  Dezimalzahlen, wechselnde Schreibweise – die Nullstelle ist keine ganze Zahl.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-8 max-w-5xl w-full flex flex-col gap-6">
        {header}
        {intro}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
            Schwierigkeitsgrad: {LEVEL_LABEL[level]}
          </span>
          <button
            onClick={() => chooseLevel(null)}
            className="text-blue-600 hover:underline text-sm font-semibold"
          >
            Schwierigkeitsgrad wechseln
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {tasks.map((task, i) => (
            // Neue Aufgabe -> neue Karte (frischer Zustand, eigenes Tracking)
            <React.Fragment key={task.id}>
              <TaskCard
                number={i + 1}
                task={task}
                level={level}
                onNewTask={() => replaceTask(i)}
                onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
                onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
                onHelp={() => setStreak(0)}
              />
            </React.Fragment>
          ))}
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
            Gelöst: {solvedCount} / {TOTAL_TASKS}
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
            Richtig in Folge: {streak}
          </div>
        </div>

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
                  <button onClick={() => startNewRound()} className={btnPrimary}>
                    Doch noch neue Aufgaben
                  </button>
                  <button onClick={() => navigate('/lineare_funktionen')} className={btnSecondary}>
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
                  <button onClick={() => startNewRound()} className={btnPrimary}>
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

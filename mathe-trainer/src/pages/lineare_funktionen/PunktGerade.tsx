import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber';
import { useTaskTracking } from '../../hooks/useTaskTracking';
import { VideoEmbed } from '../../components/VideoButton'
import TaskShell from '../../components/layout/TaskShell'

// Sechs Aufgaben auf einer Seite (je zwei pro Aufgabentyp)
const TOTAL_TASKS = 6;

const VIDEO_EMBED_URL = 'https://www.youtube-nocookie.com/embed/W14DzAUEMCA';

// Formel mit KaTeX (ohne Nachladen aus dem Netz)
const MathDisplay = ({ latex }: { latex: string }) => (
  <div
    className="text-center text-base my-1 leading-relaxed overflow-x-auto"
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(latex, { displayMode: true, throwOnError: false }),
    }}
  />
);

const InlineMath = ({ latex }: { latex: string }) => (
  <span
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(latex, { throwOnError: false }),
    }}
  />
);

function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Level = 'leicht' | 'mittel' | 'schwer';

const LEVEL_LABEL: Record<Level, string> = {
  leicht: 'Leicht',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const btnPrimary = 'bk-btn bk-btn-primary';
const btnSecondary = 'bk-btn';
const btnDisabled = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white';
const panel = 'bk-panel';

const round2 = (v: number) => Math.round(v * 100) / 100;
const same = (a: number, b: number) => Math.abs(a - b) < 0.005;

/** Zahl mit deutschem Dezimalkomma */
const fmt = (v: number) => String(round2(v)).replace('.', ',').replace('-', '−');
/** Zahl für LaTeX (Komma ohne Abstand) */
const tex = (v: number) => String(round2(v)).replace('.', '{,}');
/** Negative Zahlen beim Einsetzen in Klammern */
const texP = (v: number) => (v < 0 ? `(${tex(v)})` : tex(v));

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

interface Point {
  name: string;
  x: number;
  y: number;
}

type TaskType = 'check' | 'choose' | 'missing';

const TYPE_LABEL: Record<TaskType, string> = {
  check: 'Punktprobe',
  choose: 'Welcher Punkt liegt auf der Geraden?',
  missing: 'Fehlende Koordinate berechnen',
};

interface Task {
  id: number;
  type: TaskType;
  m: number;
  t: number;
  /** check: ein Punkt, choose: drei Punkte, missing: ein Punkt (vollständig) */
  points: Point[];
  /** check: liegt der Punkt auf g? */
  onLine?: boolean;
  /** choose: Index des richtigen Punkts */
  correctIndex?: number;
  /** missing: welche Koordinate gesucht ist */
  missing?: 'x' | 'y';
}

const yOf = (task: Pick<Task, 'm' | 't'>, x: number) => round2(task.m * x + task.t);

// ---------- Darstellung der Geradengleichung ----------

function mxText(m: number) {
  if (m === 1) return 'x';
  if (m === -1) return '−x';
  return `${fmt(m)}x`;
}

function equationText({ m, t }: Pick<Task, 'm' | 't'>) {
  if (t === 0) return `y = ${mxText(m)}`;
  return `y = ${mxText(m)} ${t < 0 ? '−' : '+'} ${fmt(Math.abs(t))}`;
}

/** Rechte Seite mit eingesetztem x, z. B. "2 \\cdot (-3) + 1" */
function substitutedTex({ m, t }: Pick<Task, 'm' | 't'>, x: number) {
  const mx = `${tex(m)} \\cdot ${texP(x)}`;
  if (t === 0) return mx;
  return `${mx} ${t < 0 ? '-' : '+'} ${tex(Math.abs(t))}`;
}

function rhsTex({ m, t }: Pick<Task, 'm' | 't'>) {
  const mx = m === 1 ? 'x' : m === -1 ? '-x' : `${tex(m)}x`;
  if (t === 0) return mx;
  return `${mx} ${t < 0 ? '-' : '+'} ${tex(Math.abs(t))}`;
}

const pointText = (p: Point) => `${p.name}(${fmt(p.x)} | ${fmt(p.y)})`;

// ---------- Aufgaben erzeugen ----------

function randomLine(level: Level): { m: number; t: number } {
  if (level === 'leicht') {
    return { m: pick([-4, -3, -2, -1, 1, 2, 3, 4, 5] as const), t: 0 };
  }
  if (level === 'mittel') {
    let t = 0;
    while (t === 0) t = randomInt(8, -8);
    return { m: pick([-4, -3, -2, -1, 1, 2, 3, 4] as const), t };
  }
  let t = 0;
  while (t === 0) t = randomInt(16, -16) / 2;
  return { m: pick([-2.5, -1.5, -0.5, -0.25, 0.25, 0.5, 0.75, 1.5, 2.5] as const), t };
}

/** x-Werte: im schweren Niveau so gewählt, dass y höchstens zwei Nachkommastellen hat */
const randomX = (level: Level) =>
  randomInt(level === 'leicht' ? 6 : 8, level === 'leicht' ? -6 : -8);

/** Abweichung für Punkte, die nicht auf der Geraden liegen */
function offset(level: Level) {
  const size = level === 'schwer' ? pick([0.5, 1, 1.5, 2, 3] as const) : randomInt(4, 1);
  return Math.random() < 0.5 ? size : -size;
}

const POINT_NAMES = ['P', 'Q', 'R', 'A', 'B', 'C'];

let nextTaskId = 1;

function newTask(type: TaskType, level: Level): Task {
  const id = nextTaskId++;
  const line = randomLine(level);

  if (type === 'check') {
    const x = randomX(level);
    const onLine = Math.random() < 0.5;
    const y = round2(yOf(line, x) + (onLine ? 0 : offset(level)));
    return { id, type, ...line, points: [{ name: pick(POINT_NAMES), x, y }], onLine };
  }

  if (type === 'choose') {
    const xs: number[] = [];
    while (xs.length < 3) {
      const x = randomX(level);
      if (!xs.includes(x)) xs.push(x);
    }
    const correctIndex = randomInt(2);
    const points = ['A', 'B', 'C'].map((name, i) => {
      const y = round2(yOf(line, xs[i]) + (i === correctIndex ? 0 : offset(level)));
      return { name, x: xs[i], y };
    });
    return { id, type, ...line, points, correctIndex };
  }

  // Fehlende Koordinate: x ganzzahlig wählen, damit beide Richtungen exakt aufgehen
  const x = randomX(level);
  return {
    id,
    type,
    ...line,
    points: [{ name: pick(POINT_NAMES), x, y: yOf(line, x) }],
    missing: Math.random() < 0.5 ? 'x' : 'y',
  };
}

function newTaskSet(level: Level): Task[] {
  return shuffle<TaskType>(['check', 'check', 'choose', 'choose', 'missing', 'missing']).map(
    (type) => newTask(type, level)
  );
}

// ---------- Koordinatensystem (für das Beispiel) ----------

const RANGE = 6;
const SIZE = 300;

function ExampleGraph() {
  const line = { m: 2, t: -1 };
  const sx = (x: number) => ((x + RANGE) / (2 * RANGE)) * SIZE;
  const sy = (y: number) => SIZE - ((y + RANGE) / (2 * RANGE)) * SIZE;
  const ticks = Array.from({ length: 2 * RANGE + 1 }, (_, i) => i - RANGE);
  const marks = [
    { name: 'P', x: 3, y: 5, color: '#16a34a' },
    { name: 'Q', x: 1, y: 4, color: '#dc2626' },
  ];

  return (
    <svg
      viewBox={`-6 -6 ${SIZE + 12} ${SIZE + 12}`}
      className="w-full max-w-[300px] mx-auto bg-white rounded border border-slate-200"
    >
      <defs>
        <clipPath id="punkt-gerade-clip">
          <rect x={0} y={0} width={SIZE} height={SIZE} />
        </clipPath>
      </defs>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={0} x2={sx(v)} y2={SIZE} stroke="#e2e8f0" strokeWidth={1} />
          <line x1={0} y1={sy(v)} x2={SIZE} y2={sy(v)} stroke="#e2e8f0" strokeWidth={1} />
        </g>
      ))}
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
      <line
        x1={sx(-RANGE)}
        y1={sy(line.m * -RANGE + line.t)}
        x2={sx(RANGE)}
        y2={sy(line.m * RANGE + line.t)}
        stroke="#2563eb"
        strokeWidth={2.5}
        clipPath="url(#punkt-gerade-clip)"
      />
      {marks.map((p) => (
        <g key={p.name}>
          <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill={p.color} stroke="white" strokeWidth={1.5} />
          <text
            x={sx(p.x) + 8}
            y={sy(p.y) + 4}
            fontSize={11}
            fontWeight="bold"
            stroke="white"
            strokeWidth={3}
            paintOrder="stroke"
            fill={p.color}
          >
            {p.name}({p.x}|{p.y})
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------- Erklärung mit Beispiel und Video ----------

function Intro({ onHide }: { onHide?: () => void }) {
  return (
    <div className={panel}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-lg font-bold text-slate-800">
          So prüfst du, ob ein Punkt auf einer Geraden liegt
        </h2>
        {onHide && (
          <button
            onClick={onHide}
            className="text-blue-600 hover:underline text-sm font-semibold shrink-0"
          >
            Ausblenden
          </button>
        )}
      </div>
      <div className="text-slate-700 text-left">
        <p className="mb-2">
          Ein Punkt liegt auf der Geraden, wenn seine Koordinaten die Geradengleichung erfüllen. Das
          prüfst du mit der <strong>Punktprobe</strong>:
        </p>
        <ol className="list-decimal list-inside mb-4 space-y-1">
          <li>
            Setze die <strong>x-Koordinate</strong> des Punkts in die Gleichung ein.
          </li>
          <li>
            Berechne den <strong>y-Wert</strong>.
          </li>
          <li>
            Vergleiche mit der <strong>y-Koordinate</strong> des Punkts: gleich → der Punkt liegt
            auf der Geraden, verschieden → er liegt nicht darauf.
          </li>
        </ol>
        <p className="font-semibold text-slate-800 mb-1">Beispiel: g: y = 2x − 1</p>
        <div className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 mb-4">
          <p className="text-sm text-slate-600">Liegt P(3 | 5) auf g?</p>
          <MathDisplay
            latex={`y = 2 \\cdot 3 - 1 = 5 \\quad \\Rightarrow \\quad 5 = 5 \\;\\checkmark`}
          />
          <p className="text-sm text-slate-600">Liegt Q(1 | 4) auf g?</p>
          <MathDisplay
            latex={`y = 2 \\cdot 1 - 1 = 1 \\quad \\Rightarrow \\quad 1 \\neq 4 \\;\\times`}
          />
          <p className="text-sm text-slate-700 mt-1">P liegt auf der Geraden, Q nicht.</p>
        </div>
        <ExampleGraph />
        <p className="mt-4 mb-1">
          <strong>Fehlende Koordinate:</strong> Fehlt der y-Wert, setzt du x ein und rechnest y aus.
          Fehlt der x-Wert, setzt du y ein und löst die Gleichung nach x auf.
        </p>
      </div>
      <h3 className="text-base font-bold text-slate-800 mt-6 mb-2 text-center">Erklärvideo</h3>
      <VideoEmbed src={VIDEO_EMBED_URL} title="Erklärvideo: Punkt auf Gerade prüfen" />
    </div>
  );
}

// ---------- Lösungswege ----------

function Solution({ task }: { task: Task }) {
  if (task.type === 'missing') {
    const p = task.points[0];
    return task.missing === 'y' ? (
      <>
        <p className="text-sm text-slate-600">Setze x = {fmt(p.x)} in die Gleichung ein:</p>
        <MathDisplay latex={`y = ${substitutedTex(task, p.x)} = ${tex(p.y)}`} />
        <div className="font-bold text-slate-800">
          <MathDisplay latex={`${p.name}(${tex(p.x)}\\,|\\,${tex(p.y)})`} />
        </div>
      </>
    ) : (
      <>
        <p className="text-sm text-slate-600">
          Setze y = {fmt(p.y)} in die Gleichung ein und löse nach x auf:
        </p>
        {task.t !== 0 && (
          <MathDisplay
            latex={`${tex(p.y)} = ${rhsTex(task)} \\quad | ${task.t < 0 ? '+' : '-'} ${tex(
              Math.abs(task.t)
            )}`}
          />
        )}
        <MathDisplay
          latex={`${tex(p.y - task.t)} = ${
            task.m === 1 ? '' : task.m === -1 ? '-' : tex(task.m)
          }x \\quad | : ${texP(task.m)}`}
        />
        <MathDisplay latex={`x = ${tex(p.x)}`} />
        <div className="font-bold text-slate-800">
          <MathDisplay latex={`${p.name}(${tex(p.x)}\\,|\\,${tex(p.y)})`} />
        </div>
      </>
    );
  }

  return (
    <>
      {task.points.map((p) => {
        const y = yOf(task, p.x);
        const ok = same(y, p.y);
        return (
          <div key={p.name}>
            <p className="text-sm text-slate-600">
              {pointText(p)}: x = {fmt(p.x)} einsetzen
            </p>
            <MathDisplay latex={`y = ${substitutedTex(task, p.x)} = ${tex(y)}`} />
            <p className={`text-sm font-semibold ${ok ? 'text-green-700' : 'text-red-700'}`}>
              {fmt(y)} {ok ? '=' : '≠'} {fmt(p.y)} {ok ? '✓' : '✗'}
            </p>
          </div>
        );
      })}
      <p className="font-bold text-slate-800 text-center mt-2">
        {task.type === 'check'
          ? `${task.points[0].name} liegt ${task.onLine ? 'auf' : 'nicht auf'} der Geraden.`
          : `${task.points[task.correctIndex!].name} liegt auf der Geraden.`}
      </p>
    </>
  );
}

// ---------- Tipps (schrittweise) ----------

function tipsFor(task: Task): React.ReactNode[] {
  const eq = <InlineMath latex={`y = ${rhsTex(task)}`} />;
  const p = task.points[0];

  if (task.type === 'check') {
    return [
      <>
        Setze die x-Koordinate von {p.name} in die Gleichung {eq} ein: x = {fmt(p.x)}.
      </>,
      <>
        Rechne aus: <InlineMath latex={`y = ${substitutedTex(task, p.x)} = \\;?`} />
      </>,
      <>
        Vergleiche dein Ergebnis mit der y-Koordinate von {p.name}: y = {fmt(p.y)}. Sind beide
        gleich, liegt {p.name} auf g – sonst nicht.
      </>,
    ];
  }

  if (task.type === 'choose') {
    return [
      <>Mache für jeden der drei Punkte die Punktprobe: Setze seine x-Koordinate in {eq} ein.</>,
      <>
        Rechne für jeden Punkt den y-Wert aus:
        {task.points.map((pt) => (
          <span key={pt.name} className="block mt-1">
            {pt.name}: <InlineMath latex={`y = ${substitutedTex(task, pt.x)} = \\;?`} />
          </span>
        ))}
      </>,
      <>
        Vergleiche jedes Ergebnis mit der y-Koordinate des Punkts. Nur bei einem Punkt stimmen beide
        überein – dieser Punkt liegt auf g.
      </>,
    ];
  }

  if (task.missing === 'y') {
    return [
      <>
        Die x-Koordinate ist bekannt: x = {fmt(p.x)}. Setze sie in {eq} ein.
      </>,
      <>
        Rechne aus: <InlineMath latex={`y = ${substitutedTex(task, p.x)} = \\;?`} />
      </>,
      <>
        Zuerst multiplizieren:{' '}
        <InlineMath latex={`${tex(task.m)} \\cdot ${texP(p.x)} = ${tex(task.m * p.x)}`} />
        {task.t !== 0 && (
          <>, dann {task.t < 0 ? `${fmt(Math.abs(task.t))} abziehen` : `${fmt(task.t)} addieren`}</>
        )}
        .
      </>,
    ];
  }

  const tips: React.ReactNode[] = [
    <>
      Die y-Koordinate ist bekannt: y = {fmt(p.y)}. Setze sie für y ein:{' '}
      <InlineMath latex={`${tex(p.y)} = ${rhsTex(task)}`} />
    </>,
  ];
  if (task.t !== 0) {
    tips.push(
      <>
        Bringe {fmt(Math.abs(task.t))} auf die linke Seite: Rechne auf beiden Seiten{' '}
        {task.t < 0 ? `+ ${fmt(Math.abs(task.t))}` : `− ${fmt(task.t)}`}. Du erhältst{' '}
        <InlineMath
          latex={`${tex(p.y - task.t)} = ${task.m === 1 ? '' : task.m === -1 ? '-' : tex(task.m)}x`}
        />
        .
      </>
    );
  }
  tips.push(
    <>
      Teile beide Seiten durch {fmt(task.m)}:{' '}
      <InlineMath latex={`x = ${tex(p.y - task.t)} : ${texP(task.m)} = \\;?`} />
    </>
  );
  return tips;
}

function TipBox({ tips, shown }: { tips: React.ReactNode[]; shown: number }) {
  if (shown === 0) return null;
  return (
    <div className="mt-4 border-l-4 border-amber-400 bg-amber-50 rounded p-3 text-left text-slate-700">
      <ol className="space-y-2">
        {tips.slice(0, shown).map((tip, i) => (
          <li key={i}>
            <span className="font-semibold text-slate-800">Tipp {i + 1}: </span>
            {tip}
          </li>
        ))}
      </ol>
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
  const tracking = useTaskTracking(
    `Punkt auf Gerade: ${TYPE_LABEL[task.type]} (${LEVEL_LABEL[level]})`
  );
  const [input, setInput] = useState('');
  const [choice, setChoice] = useState<number | boolean | null>(null);
  const [solved, setSolved] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  // Musterlösung erst nach einem falschen Versuch
  const [hadWrong, setHadWrong] = useState(false);
  const [tipsShown, setTipsShown] = useState(0);
  const tips = tipsFor(task);

  const p = task.points[0];
  const target = task.missing === 'x' ? p.x : p.y;

  // Auswahlaufgaben (Ja/Nein, A/B/C)
  const choiceStatus: AnswerStatus =
    choice === null
      ? 'idle'
      : task.type === 'check'
      ? choice === task.onLine
        ? 'right'
        : 'wrong'
      : choice === task.correctIndex
      ? 'right'
      : 'wrong';

  // Eingabeaufgabe (fehlende Koordinate)
  const trimmed = input.trim();
  const parsed = parseAnswer(input);
  const incomplete = trimmed === '' || /^[-−–+.,/]$/.test(trimmed) || trimmed.endsWith('/');
  const inputStatus: AnswerStatus =
    incomplete || Number.isNaN(parsed)
      ? 'idle'
      : Math.abs(parsed - target) < 0.01
      ? 'right'
      : 'wrong';

  const status = task.type === 'missing' ? inputStatus : choiceStatus;

  function choose(value: number | boolean) {
    if (solved) return;
    setChoice(value);
    const correct = task.type === 'check' ? value === task.onLine : value === task.correctIndex;
    tracking.onCheck(correct);
    onResult(correct);
    if (correct) {
      setSolved(true);
      onSolvedChange(true);
    } else {
      setHadWrong(true);
    }
  }

  // Live-Auswertung: richtig sofort, falsch erst, wenn die Eingabe kurz stehen bleibt
  useEffect(() => {
    if (task.type !== 'missing' || solved) return;
    if (inputStatus === 'right') {
      setSolved(true);
      tracking.onCheck(true);
      onResult(true);
      onSolvedChange(true);
      return;
    }
    if (inputStatus === 'wrong') {
      const timer = setTimeout(() => {
        setHadWrong(true);
        tracking.onCheck(false);
        onResult(false);
      }, 900);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, solved]);

  function onShowTip() {
    setTipsShown((n) => Math.min(n + 1, tips.length));
    onHelp();
    tracking.onHintShown();
  }

  function onShowAnswer() {
    setShowSolution(true);
    onHelp();
    tracking.onHintShown();
  }

  const solutionLocked = !hadWrong;
  const tipsLeft = tipsShown < tips.length;

  const choiceBtn = (selected: boolean) => {
    const base = 'font-semibold py-2 px-5 rounded border-2 transition-colors';
    if (!selected) return `${base} bg-white hover:bg-slate-100 text-slate-700 border-slate-300`;
    return status === 'right'
      ? `${base} bg-green-50 text-green-800 border-green-500`
      : `${base} bg-red-50 text-red-800 border-red-500`;
  };

  const inputBorder =
    inputStatus === 'right'
      ? 'border-green-500 bg-green-50'
      : inputStatus === 'wrong'
      ? 'border-red-500 bg-red-50'
      : 'border-slate-300';

  const inputField = (
    <input
      value={input}
      readOnly={solved}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        tracking.onInput();
      }}
      className={`w-24 text-center border-2 rounded px-2 py-1.5 focus:outline-none ${inputBorder}`}
      placeholder={task.missing}
      inputMode="decimal"
      aria-label={`Fehlende Koordinate Aufgabe ${number}`}
    />
  );

  return (
    <div className={`${panel} text-center`}>
      <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
        <h2 className="text-lg font-bold text-slate-800">Aufgabe {number}</h2>
        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">
          {TYPE_LABEL[task.type]}
        </span>
      </div>

      <p className="text-slate-700 mb-1">
        {task.type === 'check' && 'Prüfe rechnerisch, ob der Punkt auf der Geraden g liegt.'}
        {task.type === 'choose' &&
          'Prüfe rechnerisch, welcher der drei Punkte auf der Geraden g liegt.'}
        {task.type === 'missing' &&
          `Der Punkt ${p.name} liegt auf der Geraden g. Berechne die fehlende ${task.missing}-Koordinate.`}
      </p>
      <p className="text-xl font-serif italic text-slate-800 my-4">g: {equationText(task)}</p>

      {task.type === 'check' && (
        <>
          <p className="text-lg font-semibold text-slate-800 mb-3">{pointText(p)}</p>
          <p className="text-slate-700 mb-2">Liegt {p.name} auf g?</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => choose(true)} className={choiceBtn(choice === true)}>
              Ja
            </button>
            <button onClick={() => choose(false)} className={choiceBtn(choice === false)}>
              Nein
            </button>
          </div>
        </>
      )}

      {task.type === 'choose' && (
        <div className="flex flex-wrap justify-center gap-3">
          {task.points.map((pt, i) => (
            <button key={pt.name} onClick={() => choose(i)} className={choiceBtn(choice === i)}>
              {pointText(pt)}
            </button>
          ))}
        </div>
      )}

      {task.type === 'missing' && (
        <>
          <div className="flex items-center justify-center gap-1 font-semibold text-slate-800">
            <span>{p.name}(</span>
            {task.missing === 'x' ? inputField : <span>{fmt(p.x)}</span>}
            <span>|</span>
            {task.missing === 'y' ? inputField : <span>{fmt(p.y)}</span>}
            <span>)</span>
          </div>
          {level === 'schwer' && (
            <p className="text-xs text-slate-500 mt-1">
              Dezimalzahl (z. B. 1,25) oder Bruch (z. B. 5/4)
            </p>
          )}
        </>
      )}

      {status === 'right' && (
        <p className="font-bold mt-3 text-green-600">Richtig! Super gemacht!</p>
      )}
      {status === 'wrong' && (
        <p className="font-bold mt-3 text-red-600">Noch nicht richtig. Rechne noch einmal nach.</p>
      )}

      <TipBox tips={tips} shown={tipsShown} />

      <div className="flex flex-wrap justify-center gap-2 mt-5">
        <button
          onClick={onShowTip}
          disabled={!tipsLeft || solved}
          className={`${btnSecondary} ${btnDisabled}`}
        >
          {tipsShown === 0 ? 'Tipp' : tipsLeft ? 'Nächster Tipp' : 'Keine weiteren Tipps'} (
          {tipsShown}/{tips.length})
        </button>
        <button
          onClick={onShowAnswer}
          disabled={solutionLocked}
          title={
            solutionLocked
              ? 'Die Lösung kannst du anzeigen, nachdem du einmal eine falsche Antwort gegeben hast.'
              : undefined
          }
          className={`${btnSecondary} ${btnDisabled}`}
        >
          Lösung anzeigen
        </button>
        <button onClick={onNewTask} className={btnSecondary}>
          Neue Aufgabe
        </button>
      </div>
      {solutionLocked && !solved && (
        <p className="text-xs text-slate-500 mt-2">
          Die Lösung kannst du erst nach einem falschen Versuch anzeigen.
        </p>
      )}

      {showSolution && (
        <div className="mt-6 bk-taskbox">
          <h3 className="text-base font-bold text-slate-800 mb-2">Lösungsweg</h3>
          <Solution task={task} />
        </div>
      )}
    </div>
  );
}

// ---------- Seite: sechs Aufgaben auf einmal ----------

const LEVELS: { level: Level; example: string; desc: string; color: string }[] = [
  {
    level: 'leicht',
    example: 'y = 3x',
    desc: 'Ursprungsgeraden mit ganzzahliger Steigung.',
    color: 'bg-green-600 hover:bg-green-700',
  },
  {
    level: 'mittel',
    example: 'y = −2x + 5',
    desc: 'Steigung und y-Achsenabschnitt sind ganze Zahlen.',
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    level: 'schwer',
    example: 'y = 0,75x − 2,5',
    desc: 'Dezimalzahlen in Gleichung und Punkten.',
    color: 'bg-red-600 hover:bg-red-700',
  },
];

export default function PunktGerade() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [solved, setSolved] = useState<Record<number, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

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
    setTasks((ts) => ts.map((t, j) => (j === i ? newTask(t.type, level) : t)));
  };

  const header = (
    <div>
      <p className="text-center text-slate-600">
        Prüfe rechnerisch, ob ein Punkt auf einer Geraden liegt, und berechne fehlende Koordinaten.
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
      <TaskShell title="Punkt auf Gerade prüfen" width="narrow">
        <div className="flex flex-col gap-6">
          {header}
          {intro}
          <div className={`${panel} text-center`}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Wähle deinen Schwierigkeitsgrad
            </h2>
            <div className="flex flex-col gap-4">
              {LEVELS.map((l) => (
                <button
                  key={l.level}
                  onClick={() => chooseLevel(l.level)}
                  className={`rounded-xl ${l.color} text-white p-5 shadow-sm transition-colors`}
                >
                  <p className="text-lg font-bold mb-1 text-white">{LEVEL_LABEL[l.level]}</p>
                  <p className="text-xl font-serif italic mb-2 text-white">{l.example}</p>
                  <p className="text-sm text-white/90">{l.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </TaskShell>
    );
  }

  return (
    <TaskShell title="Punkt auf Gerade prüfen" width="narrow">
        <div className="flex flex-col gap-6">
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

        <div className="flex flex-col gap-6">
          {tasks.map((task, i) => (
            // Neue Aufgabe -> neue Karte (frischer Zustand, eigenes Tracking)
            <TaskCard
              key={task.id}
              number={i + 1}
              task={task}
              level={level}
              onNewTask={() => replaceTask(i)}
              onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
              onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
              onHelp={() => setStreak(0)}
            />
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
    </TaskShell>
  );
}

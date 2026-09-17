import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import type { GeometryGenerator, GeometryTask, GeometrySketch } from '../../utils/geometryGenerators';

const THEMES = {
  coral: {
    badge: 'bg-rose-500/15 text-rose-700 border border-rose-200',
    cardBorder: 'border-rose-100',
    glow: 'shadow-rose-200/70',
    button: 'bg-rose-600 hover:bg-rose-700 text-white',
    accent: 'text-rose-500'
  },
  emerald: {
    badge: 'bg-emerald-500/15 text-emerald-700 border border-emerald-200',
    cardBorder: 'border-emerald-100',
    glow: 'shadow-emerald-200/70',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    accent: 'text-emerald-500'
  },
  indigo: {
    badge: 'bg-indigo-500/15 text-indigo-700 border border-indigo-200',
    cardBorder: 'border-indigo-100',
    glow: 'shadow-indigo-200/70',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    accent: 'text-indigo-500'
  },
  amber: {
    badge: 'bg-amber-500/15 text-amber-700 border border-amber-200',
    cardBorder: 'border-amber-100',
    glow: 'shadow-amber-200/70',
    button: 'bg-amber-500 hover:bg-amber-600 text-white',
    accent: 'text-amber-500'
  },
  cyan: {
    badge: 'bg-cyan-500/15 text-cyan-700 border border-cyan-200',
    cardBorder: 'border-cyan-100',
    glow: 'shadow-cyan-200/70',
    button: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    accent: 'text-cyan-500'
  },
  violet: {
    badge: 'bg-violet-500/15 text-violet-700 border border-violet-200',
    cardBorder: 'border-violet-100',
    glow: 'shadow-violet-200/70',
    button: 'bg-violet-600 hover:bg-violet-700 text-white',
    accent: 'text-violet-500'
  }
} as const;

export interface GeometryTaskPageProps {
  title: string;
  subtitle: string;
  generator: GeometryGenerator;
  description?: string;
  theme?: keyof typeof THEMES;
  badgeLabel?: string;
}

const parseAnswer = (value: string) => {
  if (!value) return NaN;
  return parseFloat(value.replace(',', '.').replace(/[−–—‐]/g, '-'));
};

const formatNumber = (value: number, decimals = 2) =>
  value.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const formatSketchValue = (value: number, unit: string) => {
  const decimals = Number.isInteger(value) ? 0 : Number.isInteger(value * 10) ? 1 : 2;
  return `${value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} ${unit}`;
};

export default function GeometryTaskPage({
  title,
  subtitle,
  generator,
  description,
  theme = 'coral',
  badgeLabel = 'Raum & Form'
}: GeometryTaskPageProps) {
  const themeCfg = THEMES[theme] ?? THEMES.coral;
  const [task, setTask] = useState<GeometryTask>(() => generator());
  const [taskNumber, setTaskNumber] = useState(1);
  const [answer, setAnswer] = useState('');
  const [answerState, setAnswerState] = useState<'correct' | 'wrong' | null>(null);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  const resetTaskUi = () => {
    setAnswer('');
    setAnswerState(null);
    setSolutionVisible(false);
    setHintVisible(false);
  };

  const startNewSession = () => {
    setTask(() => generator());
    setTaskNumber(1);
    resetTaskUi();
  };

  const loadNextTask = () => {
    setTask(() => generator());
    setTaskNumber(prev => prev + 1);
    resetTaskUi();
  };

  const checkTask = (task: GeometryTask) => {
    const entered = parseAnswer(answer);
    if (Number.isNaN(entered)) {
      setAnswerState('wrong');
      return;
    }
    const tolerance = task.tolerance ?? Math.max(0.05, Math.abs(task.result) * 0.02);
    const isCorrect = Math.abs(entered - task.result) <= tolerance;
    setAnswerState(isCorrect ? 'correct' : 'wrong');
  };

  const toggleSolution = () => {
    setSolutionVisible(prev => !prev);
  };

  const toggleHint = () => {
    setHintVisible(prev => !prev);
  };

  const handleAnswerChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAnswer(event.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`uppercase tracking-[0.45em] text-xs mb-2 text-slate-500 ${themeCfg.accent}`}>
              Raum &amp; Form
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-600 text-lg mt-2 max-w-2xl">{subtitle}</p>
            {description && <p className="text-slate-500 text-sm mt-3 max-w-3xl">{description}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/raum-und-form"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50"
            >
              ← Themenübersicht
            </Link>
            <button
              onClick={startNewSession}
              className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition shadow-sm ${themeCfg.button}`}
            >
              ↻ Sitzung zurücksetzen
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-4 mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Aktive Aufgabe #{taskNumber}</p>
          <p className="text-sm text-slate-500">
            Du siehst immer nur eine Aufgabe. Löse sie in Ruhe und lade anschließend die nächste.
          </p>
        </div>

        <div className={`rounded-3xl bg-white text-slate-900 border ${themeCfg.cardBorder} ${themeCfg.glow} p-6 flex flex-col gap-5`}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${themeCfg.badge}`}>
              {badgeLabel}
            </span>
            <button onClick={loadNextTask} className="text-sm font-semibold text-slate-400 hover:text-slate-900">
              ↻ Nächste Aufgabe
            </button>
          </div>

          <div>
            <p className="text-slate-500 text-sm mb-1">{task.contextTag}</p>
            <h2 className="text-2xl font-bold text-slate-900">{task.title}</h2>
          </div>

          <p className="text-slate-600 leading-relaxed">{task.prompt}</p>

          <div className="grid grid-cols-2 gap-4">
            {task.givens.map(info => (
              <div key={info.label} className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-slate-500">{info.label}</p>
                <p className="text-lg font-semibold text-slate-900">{info.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {task.sketch && <GeometrySketchCard sketch={task.sketch} />}
            <FormulaHintCard formula={task.formula} tip={task.tip} isOpen={hintVisible} onToggle={toggleHint} />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
              {task.resultLabel} ({task.unit})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={answer}
                onChange={handleAnswerChange}
                className={`flex-1 rounded-2xl border px-4 py-3 text-right font-mono text-lg transition focus:outline-none focus:ring-2 focus:ring-slate-900/20 ${
                  answerState === 'correct'
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : answerState === 'wrong'
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : 'border-slate-300 bg-white'
                }`}
                placeholder="z.B. 42,50"
              />
              <button onClick={() => checkTask(task)} className={`px-4 py-3 rounded-2xl font-semibold ${themeCfg.button}`}>
                Prüfen
              </button>
            </div>
            {answerState === 'correct' && (
              <p className="text-sm text-emerald-600 font-semibold">Perfekt! Deine Rechnung passt.</p>
            )}
            {answerState === 'wrong' && (
              <p className="text-sm text-rose-600 font-semibold">
                Prüfe nochmal Einheiten und Runde auf {task.decimals} Nachkommastellen.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={toggleSolution} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              {solutionVisible ? 'Lösung ausblenden' : 'Lösung anzeigen'}
            </button>
            <button onClick={loadNextTask} className="text-sm font-semibold text-slate-400 hover:text-slate-900">
              Weiter zur nächsten Aufgabe
            </button>
          </div>

          {solutionVisible && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-500">Rechnung &amp; Lösung</p>
              <ul className="text-sm text-slate-700 space-y-1">
                {task.steps.map(step => (
                  <li key={step} className="font-mono">
                    {step}
                  </li>
                ))}
              </ul>
              <div className="text-slate-900 font-bold text-lg">
                {task.resultLabel}: {formatNumber(task.result, task.decimals)} {task.unit}
              </div>
              {task.tip && <p className="text-xs text-slate-500">Hinweis: {task.tip}</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const strokeColor = '#0f172a';
const fillColor = '#e2e8f0';
const accentColor = '#fb923c';

function GeometrySketchCard({ sketch }: { sketch?: GeometrySketch }) {
  if (!sketch) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Skizze mit Maßen (nicht maßstabsgetreu)</p>
      <div className="bg-slate-50 rounded-xl flex items-center justify-center p-3">
        {renderSketch(sketch)}
      </div>
    </div>
  );
}

interface FormulaHintCardProps {
  formula: string;
  tip?: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FormulaHintCard({ formula, tip, isOpen, onToggle }: FormulaHintCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-widest text-slate-500">Formel &amp; Tipp</p>
        <button onClick={onToggle} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
          {isOpen ? 'Formel ausblenden' : 'Formel einblenden'}
        </button>
      </div>
      {isOpen && (
        <div className="mt-3 space-y-2">
          <p className="font-mono text-lg text-slate-900">{formula}</p>
          <p className="text-sm text-slate-600">{tip ?? 'Nutze die Formel als Hinweis und achte auf die Einheiten.'}</p>
        </div>
      )}
    </div>
  );
}

function renderSketch(sketch: GeometrySketch) {
  switch (sketch.type) {
    case 'rectangle': {
      const aLabel = formatSketchValue(sketch.a, sketch.unit);
      const bLabel = formatSketchValue(sketch.b, sketch.unit);
      return (
        <svg viewBox="0 0 220 140" className="w-full max-w-[220px] h-36" role="img" aria-label="Rechteck">
          <rect x="40" y="40" width="140" height="60" rx="10" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <text x="110" y="30" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${aLabel}`}
          </text>
          <text x="15" y="75" textAnchor="middle" className="fill-slate-600 -rotate-90 origin-center text-xs">
            {`b = ${bLabel}`}
          </text>
        </svg>
      );
    }
    case 'triangle': {
      const baseLabel = formatSketchValue(sketch.base, sketch.unit);
      const heightLabel = formatSketchValue(sketch.height, sketch.unit);
      return (
        <svg viewBox="0 0 220 140" className="w-full max-w-[220px] h-36" role="img" aria-label="Dreieck">
          <polygon points="30,120 190,120 110,30" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="30" x2="110" y2="120" stroke={accentColor} strokeWidth={2} strokeDasharray="4 4" />
          <text x="110" y="135" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${baseLabel}`}
          </text>
          <text x="120" y="75" className="fill-slate-600 text-xs">
            {`h = ${heightLabel}`}
          </text>
        </svg>
      );
    }
    case 'circle': {
      const radiusLabel = formatSketchValue(sketch.radius, sketch.unit);
      return (
        <svg viewBox="0 0 220 140" className="w-full max-w-[220px] h-36" role="img" aria-label="Kreis">
          <circle cx="110" cy="70" r="48" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="70" x2="158" y2="70" stroke={accentColor} strokeWidth={2} />
          <circle cx="110" cy="70" r="4" fill={strokeColor} />
          <text x="110" y="120" textAnchor="middle" className="fill-slate-600 text-xs">
            {`r = ${radiusLabel}`}
          </text>
        </svg>
      );
    }
    case 'sphere': {
      const radiusLabel = formatSketchValue(sketch.radius, sketch.unit);
      return (
        <svg viewBox="0 0 220 140" className="w-full max-w-[220px] h-36" role="img" aria-label="Kugel">
          <ellipse cx="110" cy="70" rx="60" ry="40" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="70" x2="170" y2="70" stroke={accentColor} strokeWidth={2} />
          <text x="110" y="120" textAnchor="middle" className="fill-slate-600 text-xs">
            {`r = ${radiusLabel}`}
          </text>
        </svg>
      );
    }
    case 'trapezoid': {
      const aLabel = formatSketchValue(sketch.a, sketch.unit);
      const cLabel = formatSketchValue(sketch.c, sketch.unit);
      const hLabel = formatSketchValue(sketch.h, sketch.unit);
      return (
        <svg viewBox="0 0 220 140" className="w-full max-w-[220px] h-36" role="img" aria-label="Trapez">
          <polygon points="50,30 170,30 190,110 30,110" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <text x="110" y="20" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${aLabel}`}
          </text>
          <text x="110" y="130" textAnchor="middle" className="fill-slate-600 text-xs">
            {`c = ${cLabel}`}
          </text>
          <line x1="60" y1="30" x2="60" y2="110" stroke={accentColor} strokeWidth={2} strokeDasharray="4 4" />
          <text x="70" y="80" className="fill-slate-600 text-xs">
            {`h = ${hLabel}`}
          </text>
        </svg>
      );
    }
    case 'rightTriangle': {
      const aLabel = formatSketchValue(sketch.a, sketch.unit);
      const bLabel = formatSketchValue(sketch.b, sketch.unit);
      const cLabel = sketch.c ? formatSketchValue(sketch.c, sketch.unit) : null;
      return (
        <svg viewBox="0 0 220 140" className="w-full max-w-[220px] h-36" role="img" aria-label="Rechtwinkliges Dreieck">
          <polygon points="30,120 190,120 30,30" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <rect x="30" y="100" width="20" height="20" fill="none" stroke={accentColor} strokeWidth={2} />
          <text x="110" y="135" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${aLabel}`}
          </text>
          <text x="15" y="75" textAnchor="middle" className="fill-slate-600 -rotate-90 origin-center text-xs">
            {`b = ${bLabel}`}
          </text>
          {cLabel && (
            <text x="120" y="60" className="fill-slate-600 text-xs">
              {`c = ${cLabel}`}
            </text>
          )}
        </svg>
      );
    }
    case 'cone': {
      const radiusLabel = formatSketchValue(sketch.radius, sketch.unit);
      const heightLabel = formatSketchValue(sketch.height, sketch.unit);
      return (
        <svg viewBox="0 0 220 160" className="w-full max-w-[220px] h-40" role="img" aria-label="Kegel">
          <path d="M110 30 L40 130 Q110 150 180 130 Z" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="30" x2="110" y2="132" stroke={accentColor} strokeWidth={2} />
          <text x="110" y="25" textAnchor="middle" className="fill-slate-600 text-xs">
            {`h = ${heightLabel}`}
          </text>
          <text x="110" y="150" textAnchor="middle" className="fill-slate-600 text-xs">
            {`r = ${radiusLabel}`}
          </text>
        </svg>
      );
    }
    case 'pyramid': {
      const baseALabel = formatSketchValue(sketch.baseA, sketch.unit);
      const baseBLabel = formatSketchValue(sketch.baseB, sketch.unit);
      const heightLabel = formatSketchValue(sketch.height, sketch.unit);
      return (
        <svg viewBox="0 0 220 160" className="w-full max-w-[220px] h-40" role="img" aria-label="Pyramide">
          <polygon points="60,40 160,40 190,120 30,120" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="10" x2="60" y2="40" stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="10" x2="160" y2="40" stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="10" x2="190" y2="120" stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="10" x2="30" y2="120" stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="10" x2="110" y2="120" stroke={accentColor} strokeWidth={2} strokeDasharray="4 4" />
          <text x="110" y="150" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${baseALabel}, b = ${baseBLabel}`}
          </text>
          <text x="120" y="70" className="fill-slate-600 text-xs">
            {`h = ${heightLabel}`}
          </text>
        </svg>
      );
    }
    case 'cylinder': {
      const radiusLabel = formatSketchValue(sketch.radius, sketch.unit);
      const heightLabel = formatSketchValue(sketch.height, sketch.unit);
      return (
        <svg viewBox="0 0 220 160" className="w-full max-w-[220px] h-40" role="img" aria-label="Zylinder">
          <ellipse cx="110" cy="40" rx="60" ry="20" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <ellipse cx="110" cy="140" rx="60" ry="20" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <rect x="50" y="40" width="120" height="100" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="40" x2="110" y2="140" stroke={accentColor} strokeWidth={2} />
          <text x="110" y="160" textAnchor="middle" className="fill-slate-600 text-xs">
            {`h = ${heightLabel}`}
          </text>
          <text x="110" y="20" textAnchor="middle" className="fill-slate-600 text-xs">
            {`r = ${radiusLabel}`}
          </text>
        </svg>
      );
    }
    case 'prismRect': {
      const lengthLabel = formatSketchValue(sketch.length, sketch.unit);
      const widthLabel = formatSketchValue(sketch.width, sketch.unit);
      const heightLabel = formatSketchValue(sketch.height, sketch.unit);
      return (
        <svg viewBox="0 0 220 160" className="w-full max-w-[220px] h-40" role="img" aria-label="Quader">
          <polygon points="60,40 160,40 190,80 90,80" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <polygon points="60,40 90,80 90,140 60,100" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <polygon points="160,40 190,80 190,140 160,100" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <text x="125" y="35" textAnchor="middle" className="fill-slate-600 text-xs">
            {`l = ${lengthLabel}`}
          </text>
          <text x="40" y="80" textAnchor="middle" className="fill-slate-600 -rotate-90 origin-center text-xs">
            {`b = ${widthLabel}`}
          </text>
          <text x="150" y="120" className="fill-slate-600 text-xs">
            {`h = ${heightLabel}`}
          </text>
        </svg>
      );
    }
    case 'prismTri': {
      const baseLabel = formatSketchValue(sketch.base, sketch.unit);
      const heightTriLabel = formatSketchValue(sketch.heightTriangle, sketch.unit);
      const prismHeightLabel = formatSketchValue(sketch.prismHeight, sketch.unit);
      return (
        <svg viewBox="0 0 220 160" className="w-full max-w-[220px] h-40" role="img" aria-label="Dreiecksprisma">
          <polygon points="40,120 160,120 100,60" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <polygon points="70,90 190,90 130,30" fill="none" stroke={strokeColor} strokeWidth={2} strokeDasharray="4 4" />
          <line x1="40" y1="120" x2="70" y2="90" stroke={strokeColor} strokeWidth={2} />
          <line x1="160" y1="120" x2="190" y2="90" stroke={strokeColor} strokeWidth={2} />
          <line x1="100" y1="60" x2="130" y2="30" stroke={strokeColor} strokeWidth={2} />
          <text x="100" y="135" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${baseLabel}`}
          </text>
          <text x="110" y="50" className="fill-slate-600 text-xs">
            {`h_Δ = ${heightTriLabel}`}
          </text>
          <text x="170" y="95" className="fill-slate-600 text-xs">
            {`H = ${prismHeightLabel}`}
          </text>
        </svg>
      );
    }
    case 'prismTrap': {
      const baseALabel = formatSketchValue(sketch.baseA, sketch.unit);
      const baseCLabel = formatSketchValue(sketch.baseC, sketch.unit);
      const heightTrapLabel = formatSketchValue(sketch.heightTrap, sketch.unit);
      const prismHeightLabel = formatSketchValue(sketch.prismHeight, sketch.unit);
      return (
        <svg viewBox="0 0 220 170" className="w-full max-w-[220px] h-44" role="img" aria-label="Trapezprisma">
          <polygon points="40,120 170,120 190,60 20,60" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <polygon points="70,90 200,90 220,30 50,30" fill="none" stroke={strokeColor} strokeWidth={2} strokeDasharray="4 4" />
          <line x1="40" y1="120" x2="70" y2="90" stroke={strokeColor} strokeWidth={2} />
          <line x1="170" y1="120" x2="200" y2="90" stroke={strokeColor} strokeWidth={2} />
          <line x1="190" y1="60" x2="220" y2="30" stroke={strokeColor} strokeWidth={2} />
          <line x1="20" y1="60" x2="50" y2="30" stroke={strokeColor} strokeWidth={2} />
          <line x1="35" y1="60" x2="35" y2="120" stroke={accentColor} strokeWidth={2} strokeDasharray="4 4" />
          <text x="105" y="135" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${baseALabel}`}
          </text>
          <text x="105" y="50" textAnchor="middle" className="fill-slate-600 text-xs">
            {`c = ${baseCLabel}`}
          </text>
          <text x="48" y="95" className="fill-slate-600 text-xs">
            {`h_T = ${heightTrapLabel}`}
          </text>
          <text x="185" y="105" className="fill-slate-600 text-xs">
            {`H = ${prismHeightLabel}`}
          </text>
        </svg>
      );
    }
    case 'prismPent': {
      const sideLabel = formatSketchValue(sketch.side, sketch.unit);
      const apothemLabel = formatSketchValue(sketch.apothem, sketch.unit);
      const prismHeightLabel = formatSketchValue(sketch.prismHeight, sketch.unit);
      return (
        <svg viewBox="0 0 220 180" className="w-full max-w-[220px] h-44" role="img" aria-label="Fünfeckiges Prisma">
          <polygon points="110,30 180,70 155,150 65,150 40,70" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <polygon points="140,10 210,50 185,130 95,130 70,50" fill="none" stroke={strokeColor} strokeWidth={2} strokeDasharray="4 4" />
          <line x1="110" y1="30" x2="140" y2="10" stroke={strokeColor} strokeWidth={2} />
          <line x1="180" y1="70" x2="210" y2="50" stroke={strokeColor} strokeWidth={2} />
          <line x1="155" y1="150" x2="185" y2="130" stroke={strokeColor} strokeWidth={2} />
          <line x1="65" y1="150" x2="95" y2="130" stroke={strokeColor} strokeWidth={2} />
          <line x1="40" y1="70" x2="70" y2="50" stroke={strokeColor} strokeWidth={2} />
          <line x1="110" y1="30" x2="110" y2="150" stroke={accentColor} strokeWidth={2} strokeDasharray="4 4" />
          <text x="110" y="165" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${sideLabel}`}
          </text>
          <text x="125" y="95" className="fill-slate-600 text-xs">
            {`a_p = ${apothemLabel}`}
          </text>
          <text x="190" y="90" className="fill-slate-600 text-xs">
            {`H = ${prismHeightLabel}`}
          </text>
        </svg>
      );
    }
    case 'netPrism': {
      const lengthLabel = formatSketchValue(sketch.length, sketch.unit);
      const widthLabel = formatSketchValue(sketch.width, sketch.unit);
      const heightLabel = formatSketchValue(sketch.height, sketch.unit);
      return (
        <svg viewBox="0 0 220 160" className="w-full max-w-[220px] h-40" role="img" aria-label="Netz Quader">
          <rect x="70" y="60" width="80" height="40" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <rect x="-10" y="60" width="80" height="40" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <rect x="150" y="60" width="80" height="40" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <rect x="70" y="20" width="80" height="40" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <rect x="70" y="100" width="80" height="40" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <text x="110" y="55" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${lengthLabel}`}
          </text>
          <text x="30" y="55" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${lengthLabel}`}
          </text>
          <text x="190" y="55" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${lengthLabel}`}
          </text>
          <text x="110" y="150" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${lengthLabel}`}
          </text>
          <text x="65" y="80" className="fill-slate-600 text-xs">
            {`h = ${heightLabel}`}
          </text>
          <text x="150" y="80" className="fill-slate-600 text-xs">
            {`h = ${heightLabel}`}
          </text>
          <text x="110" y="30" textAnchor="middle" className="fill-slate-600 text-xs">
            {`b = ${widthLabel}`}
          </text>
        </svg>
      );
    }
    case 'netCylinder': {
      const radiusLabel = formatSketchValue(sketch.radius, sketch.unit);
      const heightLabel = formatSketchValue(sketch.height, sketch.unit);
      const mantleWidth = formatNumber(2 * Math.PI * sketch.radius, 2);
      return (
        <svg viewBox="0 0 220 160" className="w-full max-w-[220px] h-40" role="img" aria-label="Netz Zylinder">
          <rect x="60" y="50" width="100" height="60" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <circle cx="40" cy="80" r="25" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <circle cx="180" cy="80" r="25" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <text x="110" y="45" textAnchor="middle" className="fill-slate-600 text-xs">
            {`Mantelbreite ≈ ${mantleWidth} ${sketch.unit}`}
          </text>
          <text x="110" y="125" textAnchor="middle" className="fill-slate-600 text-xs">
            {`h = ${heightLabel}`}
          </text>
          <text x="40" y="80" textAnchor="middle" className="fill-slate-600 text-xs">
            {`r = ${radiusLabel}`}
          </text>
          <text x="180" y="80" textAnchor="middle" className="fill-slate-600 text-xs">
            {`r = ${radiusLabel}`}
          </text>
        </svg>
      );
    }
    case 'compositeL': {
      const widthLabel = formatSketchValue(sketch.width, sketch.unit);
      const heightLabel = formatSketchValue(sketch.height, sketch.unit);
      const cutWidthLabel = formatSketchValue(sketch.cutWidth, sketch.unit);
      const cutHeightLabel = formatSketchValue(sketch.cutHeight, sketch.unit);
      return (
        <svg viewBox="0 0 220 170" className="w-full max-w-[220px] h-44" role="img" aria-label="L-Fläche">
          <path d="M40 30 H170 V140 H110 V90 H40 Z" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <line x1="40" y1="30" x2="170" y2="30" stroke={accentColor} strokeWidth={2} />
          <line x1="40" y1="30" x2="40" y2="140" stroke={accentColor} strokeWidth={2} />
          <line x1="110" y1="90" x2="170" y2="90" stroke={accentColor} strokeWidth={2} strokeDasharray="4 4" />
          <line x1="110" y1="90" x2="110" y2="140" stroke={accentColor} strokeWidth={2} strokeDasharray="4 4" />
          <text x="105" y="20" textAnchor="middle" className="fill-slate-600 text-xs">
            {`Breite = ${widthLabel}`}
          </text>
          <text x="25" y="85" textAnchor="middle" className="fill-slate-600 -rotate-90 origin-center text-xs">
            {`Höhe = ${heightLabel}`}
          </text>
          <text x="140" y="85" textAnchor="middle" className="fill-slate-600 text-xs">
            {`Ausschnitt = ${cutWidthLabel}`}
          </text>
          <text x="95" y="130" textAnchor="middle" className="fill-slate-600 text-xs">
            {`Ausschnitthöhe = ${cutHeightLabel}`}
          </text>
        </svg>
      );
    }
    case 'compositeRectSemi': {
      const widthLabel = formatSketchValue(sketch.width, sketch.unit);
      const heightLabel = formatSketchValue(sketch.height, sketch.unit);
      const radiusLabel = formatSketchValue(sketch.radius, sketch.unit);
      return (
        <svg viewBox="0 0 220 170" className="w-full max-w-[220px] h-44" role="img" aria-label="Rechteck mit Halbkreis">
          <rect x="40" y="80" width="140" height="60" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <path d="M40 80 A70 70 0 0 1 180 80" fill={fillColor} stroke={strokeColor} strokeWidth={2} />
          <line x1="40" y1="140" x2="180" y2="140" stroke={accentColor} strokeWidth={2} />
          <line x1="40" y1="80" x2="40" y2="140" stroke={accentColor} strokeWidth={2} />
          <line x1="110" y1="80" x2="110" y2="50" stroke={accentColor} strokeWidth={2} strokeDasharray="4 4" />
          <text x="110" y="155" textAnchor="middle" className="fill-slate-600 text-xs">
            {`a = ${widthLabel}`}
          </text>
          <text x="30" y="115" textAnchor="middle" className="fill-slate-600 -rotate-90 origin-center text-xs">
            {`b = ${heightLabel}`}
          </text>
          <text x="120" y="60" className="fill-slate-600 text-xs">
            {`r = ${radiusLabel}`}
          </text>
        </svg>
      );
    }
    default:
      return null;
  }
}

import { useEffect, useRef, useState } from 'react';
import { Check, X, RefreshCw, Lightbulb } from 'lucide-react';
import Rich from './Rich';
import { checkNum, type CheckResult, type Status } from './check';
import type { ChoicePart, NumPart, Task } from './types';
import { UNIT_GROUPS, type UnitId } from './util';

const FIELD_STYLE: Record<Status, string> = {
  empty: 'border-edge bg-white',
  incomplete: 'border-amber-400 bg-amber-50',
  correct: 'border-emerald-500 bg-emerald-50 text-emerald-900',
  wrong: 'border-rose-500 bg-rose-50 text-rose-900',
};

function NumField({ part, onStatus }: { part: NumPart; onStatus: (s: Status) => void }) {
  const [raw, setRaw] = useState('');
  const [unit, setUnit] = useState<UnitId | ''>('');
  const [shown, setShown] = useState<CheckResult>({ status: 'empty' });
  const timer = useRef<number | undefined>(undefined);

  const commit = (r = raw, u = unit) => {
    window.clearTimeout(timer.current);
    const res = checkNum(part, r, u);
    setShown(res);
    onStatus(res.status);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onChangeRaw = (v: string) => {
    setRaw(v);
    window.clearTimeout(timer.current);
    if (shown.status !== 'empty') {
      setShown({ status: 'empty' });
      onStatus('empty');
    }
    timer.current = window.setTimeout(() => commit(v, unit), 900);
  };

  const style = FIELD_STYLE[shown.status];

  return (
    <div className="space-y-1">
      {part.q && (
        <p className="text-left text-[15px] text-slate-700">
          <Rich text={part.q} />
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-[2.5rem] text-[15px] font-medium text-slate-700">
          <Rich text={part.label} />
        </span>
        <span className="text-slate-400">=</span>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-label="Ergebnis"
          value={raw}
          onChange={(e) => onChangeRaw(e.target.value)}
          onBlur={() => commit()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
          }}
          className={`h-12 w-28 sm:w-36 rounded-xl border-2 px-3 font-display text-lg font-semibold outline-none transition-colors focus:ring-2 focus:ring-blue-300 ${style}`}
          placeholder="Ergebnis"
        />
        {part.unit !== null && (
          <select
            aria-label="Einheit"
            value={unit}
            onChange={(e) => {
              const u = e.target.value as UnitId | '';
              setUnit(u);
              if (raw.trim() !== '') commit(raw, u);
            }}
            className={`h-12 rounded-xl border-2 px-2 text-base font-semibold outline-none ${
              unit === '' ? 'border-edge bg-white text-slate-500' : style
            }`}
          >
            <option value="">Einheit</option>
            {UNIT_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
        {shown.status === 'correct' && <Check className="h-6 w-6 text-emerald-600" aria-label="richtig" />}
        {shown.status === 'wrong' && <X className="h-6 w-6 text-rose-600" aria-label="falsch" />}
      </div>
      {shown.msg && (
        <p className={`text-sm ${shown.status === 'wrong' ? 'text-rose-700' : 'text-amber-700'}`}>{shown.msg}</p>
      )}
    </div>
  );
}

function ChoiceField({ part, onStatus }: { part: ChoicePart; onStatus: (s: Status) => void }) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="space-y-1.5">
      {part.q && (
        <p className="text-left text-[15px] text-slate-700">
          <Rich text={part.q} />
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {part.options.map((opt, i) => {
          const chosen = sel === i;
          const cls = !chosen
            ? 'border-edge bg-white hover:bg-sunken'
            : i === part.correct
              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
              : 'border-rose-500 bg-rose-50 text-rose-900';
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSel(i);
                onStatus(i === part.correct ? 'correct' : 'wrong');
              }}
              className={`min-h-[48px] rounded-xl border-2 px-4 py-1.5 text-[16px] font-semibold shadow-hard-sm transition-colors ${cls}`}
            >
              <Rich text={opt} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  index: number;
  onStatus: (part: number, s: Status) => void;
  onRefresh?: () => void;
}

export default function TaskCard({ task, index, onStatus, onRefresh }: TaskCardProps) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <article className="bk-panel flex flex-col text-left !p-4 sm:!p-5">
      <header className="mb-2 flex items-start gap-2">
        <span className="bk-num !min-w-[36px]">
          {index + 1}
        </span>
        <h3 className="text-left flex-1 pt-0.5 text-lg font-extrabold text-ink">{task.title}</h3>
        {task.badge && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
            {task.badge}
          </span>
        )}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            title="Andere Aufgabe"
            aria-label="Andere Aufgabe"
            className="bk-icon-btn !h-10 !w-10 !text-base"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <p className="text-left min-w-0 flex-1 text-[16px] leading-relaxed text-ink">
          <Rich text={task.text} />
        </p>
        {task.figure && (
          <div className="mx-auto w-full max-w-[260px] shrink-0 sm:mx-0 sm:w-[42%] sm:max-w-[300px]">{task.figure}</div>
        )}
      </div>
      <div className="mt-3 space-y-3">
        {task.parts.map((p, i) =>
          p.kind === 'num' ? (
            <NumField key={i} part={p} onStatus={(s) => onStatus(i, s)} />
          ) : (
            <ChoiceField key={i} part={p} onStatus={(s) => onStatus(i, s)} />
          ),
        )}
      </div>

      <div className="mt-4 border-t-2 border-dashed border-slate-200 pt-3">
        <button
          type="button"
          onClick={() => setShowSolution((v) => !v)}
          className="bk-btn bk-btn-sm"
        >
          <Lightbulb className="h-4 w-4" />
          {showSolution ? 'Lösungsweg ausblenden' : 'Lösungsweg anzeigen'}
        </button>
        {showSolution && (
          <div className="bk-solution !mt-3 space-y-1.5 text-[16px]">
            {task.solution.map((line, i) => (
              <div key={i}>
                <Rich text={line} />
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

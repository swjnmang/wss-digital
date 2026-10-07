import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, RotateCcw, BookOpen } from 'lucide-react';
import { BlockMath } from 'react-katex';
import Rich from './Rich';
import TaskCard from './TaskCard';
import type { Status } from './check';
import type { Gen, PracticeConfig, Task, TopicConfig } from './types';
import { shuffle } from './util';

interface Slot {
  id: number;
  gen: Gen;
  task: Task;
}

let slotCounter = 0;

function validate(t: Task): string | null {
  for (const p of t.parts) {
    if (p.kind === 'num' && (!Number.isFinite(p.value) || (p.value <= 0 && p.unit !== null))) return `Wert ${p.value}`;
    if (p.kind === 'choice' && (p.correct < 0 || new Set(p.options).size !== p.options.length)) return 'Auswahl';
  }
  if (t.solution.some((l) => /NaN|undefined|Infinity/.test(l)) || /NaN|undefined/.test(t.text)) return 'Text';
  return null;
}

function safeGen(gen: Gen): Task {
  // Generatoren arbeiten mit Zufallszahlen; ungültige Aufgaben werden neu gewürfelt.
  let last: Task | null = null;
  for (let i = 0; i < 8; i++) {
    try {
      const t = gen();
      const err = validate(t);
      if (!err) return t;
      console.error(`[raum-und-form] ungültige Aufgabe "${t.title}": ${err}`);
      last = t;
    } catch (e) {
      console.error('[raum-und-form] Generator-Fehler', e);
    }
  }
  return last ?? gen();
}

function takeCycled(gens: Gen[], n: number): Gen[] {
  if (gens.length === 0 || n <= 0) return [];
  const out: Gen[] = [];
  let pool: Gen[] = [];
  while (out.length < n) {
    if (pool.length === 0) pool = shuffle(gens);
    out.push(pool.shift() as Gen);
  }
  return out;
}

function buildSlots(cfg: PracticeConfig, usedFixed: Set<Gen>): Slot[] {
  const nBasic = cfg.nBasic ?? (cfg.apps?.length ? 4 : 6);
  const nApp = cfg.nApp ?? (cfg.apps?.length ? 2 : 0);
  const gens = [...takeCycled(cfg.gens, nBasic), ...takeCycled(cfg.apps ?? [], nApp)];
  if (cfg.fixed?.length) {
    const nFixed = cfg.nFixed ?? 2;
    let fresh = cfg.fixed.filter((g) => !usedFixed.has(g));
    if (fresh.length < nFixed) {
      usedFixed.clear();
      fresh = cfg.fixed;
    }
    const chosen = shuffle(fresh).slice(0, nFixed);
    chosen.forEach((g) => usedFixed.add(g));
    gens.push(...chosen);
  }
  return gens.map((gen) => ({ id: ++slotCounter, gen, task: safeGen(gen) }));
}

export function FormulaBox({ formulas }: { formulas: string[] }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2">
      <p className="text-left mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-800">
        <BookOpen className="h-3.5 w-3.5" /> Merkhilfe
      </p>
      <div className="space-y-0.5 text-[15px] [&_.katex-display]:my-1">
        {formulas.map((f) => (
          <BlockMath key={f} math={f} />
        ))}
      </div>
    </div>
  );
}

export default function PracticePage({ topic, cfg }: { topic: TopicConfig; cfg: PracticeConfig }) {
  const usedFixed = useMemo(() => new Set<Gen>(), []);
  const [slots, setSlots] = useState<Slot[]>(() => buildSlots(cfg, usedFixed));
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [exampleOpen, setExampleOpen] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const regenerate = () => {
    setSlots(buildSlots(cfg, usedFixed));
    setStatus({});
  };

  const refreshSlot = (idx: number) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { id: ++slotCounter, gen: s.gen, task: safeGen(s.gen) } : s)));
  };

  const report = useCallback((slotId: number, part: number, s: Status) => {
    setStatus((prev) => ({ ...prev, [`${slotId}-${part}`]: s }));
  }, []);

  const totalParts = slots.reduce((sum, s) => sum + s.task.parts.length, 0);
  const correctParts = slots.reduce(
    (sum, s) => sum + s.task.parts.filter((_, i) => status[`${s.id}-${i}`] === 'correct').length,
    0,
  );

  const ex = cfg.example;

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-left text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 sm:px-4">
          <Link
            to={`/raum-und-form/${topic.slug}`}
            className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)] hover:underline"
          >
            {topic.title}
          </Link>
          <h1 className="text-left text-lg font-bold tracking-tight sm:text-xl">{cfg.title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2" title="richtig gelöste Teilaufgaben">
              <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-slate-200 sm:block">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${totalParts ? (100 * correctParts) / totalParts : 0}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-600">
                {correctParts}/{totalParts} richtig
              </span>
            </div>
            <button
              type="button"
              onClick={regenerate}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 text-sm font-semibold text-white hover:bg-blue-600"
            >
              <RotateCcw className="h-4 w-4" />
              Neue Aufgaben
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1600px] space-y-3 px-2 py-3 sm:px-4 sm:py-4">
        {(ex || cfg.formulas) && (
          <section className="rounded-xl border border-blue-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setExampleOpen((v) => !v)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left sm:px-4"
            >
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-blue-800">
                Beispiel
              </span>
              <span className="flex-1 font-semibold text-slate-800">{ex?.title ?? 'Formeln'}</span>
              {exampleOpen ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>
            {exampleOpen && (
              <div className="grid gap-3 border-t border-slate-100 px-3 pb-3 pt-2 sm:px-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                {ex && (
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="space-y-2 text-[15px] leading-relaxed">
                      <p className="text-left text-slate-800">
                        <Rich text={ex.text} />
                      </p>
                      <ol className="space-y-1 rounded-lg bg-slate-50 px-3 py-2">
                        {ex.steps.map((s, i) => (
                          <li key={i}>
                            <Rich text={s} />
                          </li>
                        ))}
                      </ol>
                      {ex.tip && (
                        <p className="text-left rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-900">
                          <Rich text={ex.tip} />
                        </p>
                      )}
                    </div>
                    {ex.figure && <div className="mx-auto w-full max-w-[280px]">{ex.figure}</div>}
                  </div>
                )}
                {cfg.formulas && cfg.formulas.length > 0 && (
                  <div className="lg:w-[300px]">
                    <FormulaBox formulas={cfg.formulas} />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <div className="grid gap-3 lg:grid-cols-2">
          {slots.map((s, i) => (
            <TaskCard
              key={s.id}
              task={s.task}
              index={i}
              onStatus={(part, st) => report(s.id, part, st)}
              onRefresh={() => refreshSlot(i)}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 py-4">
          <button
            type="button"
            onClick={() => {
              regenerate();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-5 font-semibold text-white hover:bg-blue-600"
          >
            <RotateCcw className="h-4 w-4" />
            Neue Aufgaben
          </button>
          <Link
            to={`/raum-und-form/${topic.slug}`}
            className="inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Zur Themenübersicht
          </Link>
        </div>
      </main>
    </div>
  );
}

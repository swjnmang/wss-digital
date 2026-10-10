import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, RotateCcw, BookOpen } from 'lucide-react';
import { BlockMath } from 'react-katex';
import Rich from './Rich';
import TaskCard from './TaskCard';
import type { Status } from './check';
import type { Gen, PracticeConfig, Task, TopicConfig } from './types';
import { shuffle } from './util';
import TaskShell from '../../../components/layout/TaskShell';

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
    <div className="rounded-2xl border-2 border-edge bg-sunken px-4 py-3">
      <p className="bk-label text-left mb-1 flex items-center gap-1.5">
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
    <TaskShell
      title={cfg.title}
      width="full"
      parent={{ to: `/raum-und-form/${topic.slug}`, label: topic.title }}
      actions={
        <>
          <span className="bk-chip" title="richtig gelöste Teilaufgaben">
            <i className="fa-solid fa-check" aria-hidden="true" />
            {correctParts}/{totalParts} richtig
          </span>
          <button type="button" onClick={regenerate} className="bk-btn">
            <RotateCcw className="h-4 w-4" />
            Neue Aufgaben
          </button>
        </>
      }
    >
      <div className="space-y-4 text-left">
        {(ex || cfg.formulas) && (
          <section className="bk-panel !p-0">
            <button
              type="button"
              onClick={() => setExampleOpen((v) => !v)}
              className="flex w-full min-h-[56px] items-center gap-3 px-4 py-2 text-left sm:px-5"
            >
              <span className="bk-chip">Beispiel</span>
              <span className="flex-1 font-display text-lg font-extrabold text-ink">{ex?.title ?? 'Formeln'}</span>
              {exampleOpen ? (
                <ChevronUp className="h-5 w-5 text-muted" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted" />
              )}
            </button>
            {exampleOpen && (
              <div className="grid gap-4 border-t-2 border-edge px-4 pb-4 pt-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto]">
                {ex && (
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="space-y-2 text-[16px] leading-relaxed">
                      <p className="text-left text-ink">
                        <Rich text={ex.text} />
                      </p>
                      <ol className="bk-taskbox space-y-1">
                        {ex.steps.map((s, i) => (
                          <li key={i}>
                            <Rich text={s} />
                          </li>
                        ))}
                      </ol>
                      {ex.tip && (
                        <p className="bk-feedback bk-feedback-info text-sm">
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

        <div className="grid gap-4 lg:grid-cols-2">
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

        <div className="bk-actions justify-center py-4">
          <button
            type="button"
            onClick={() => {
              regenerate();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bk-btn bk-btn-primary"
          >
            <RotateCcw className="h-4 w-4" />
            Neue Aufgaben
          </button>
          <Link to={`/raum-und-form/${topic.slug}`} className="bk-btn">
            Zur Themenübersicht
          </Link>
        </div>
      </div>
    </TaskShell>
  );
}

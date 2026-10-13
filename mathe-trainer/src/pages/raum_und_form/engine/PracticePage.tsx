import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, RotateCcw, BookOpen, ArrowRight } from 'lucide-react';
import { BlockMath } from 'react-katex';
import Rich from './Rich';
import TaskCard from './TaskCard';
import type { Status } from './check';
import type { Gen, PracticeConfig, PracticeSection, Task, TopicConfig } from './types';
import { shuffle } from './util';
import TaskShell from '../../../components/layout/TaskShell';
import { VideoEmbed } from '../../../components/VideoButton';

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

type SlotSource = Pick<PracticeConfig, 'gens' | 'apps' | 'fixed' | 'nBasic' | 'nApp' | 'nFixed'>;

function buildSlots(cfg: SlotSource, usedFixed: Set<Gen>): Slot[] {
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
    <div className="min-w-0 rounded-2xl border-2 border-edge bg-sunken px-4 py-3">
      <p className="bk-label text-left mb-1 flex items-center gap-1.5">
        <BookOpen className="h-3.5 w-3.5" /> Merkhilfe
      </p>
      <div className="min-w-0 space-y-0.5 overflow-x-auto text-[15px] [&_.katex-display]:my-1 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden">
        {formulas.map((f) => (
          <BlockMath key={f} math={f} />
        ))}
      </div>
    </div>
  );
}

interface PracticePageProps {
  topic: TopicConfig;
  cfg: PracticeConfig;
  /** Pfad des Bereichs, unter dem die Themen liegen */
  base?: string;
  /** zusätzliche Pfad-Ebene vor dem Thema, z. B. „Vorbereitung FOS/BOS“ */
  root?: { to: string; label: string };
}

export default function PracticePage({ topic, cfg, base = '/raum-und-form', root }: PracticePageProps) {
  const usedFixed = useMemo(() => new Set<Gen>(), []);
  const [params, setParams] = useSearchParams();
  const sections = cfg.sections ?? [];
  const secIdx = sections.findIndex((s) => s.slug === params.get('teil'));
  const sec: PracticeSection | null = secIdx >= 0 ? sections[secIdx] : null;
  // Unterthema gewählt: dessen Erklärung und Aufgabentypen, sonst die ganze Seite gemischt
  const view = sec ? { ...sec, nBasic: sec.nBasic ?? 8 } : cfg;
  const viewKey = sec?.slug ?? '';
  const [built, setBuilt] = useState<{ key: string; slots: Slot[] }>(() => ({ key: viewKey, slots: buildSlots(view, usedFixed) }));
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [exampleOpen, setExampleOpen] = useState(true);
  if (built.key !== viewKey) {
    setBuilt({ key: viewKey, slots: buildSlots(view, usedFixed) });
    setStatus({});
    setExampleOpen(true);
  }
  const slots = built.slots;
  const setSlots = (f: (prev: Slot[]) => Slot[]) => setBuilt((b) => ({ ...b, slots: f(b.slots) }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const selectSection = (slug: string | null) => {
    const next = new URLSearchParams(params);
    if (slug) next.set('teil', slug);
    else next.delete('teil');
    setParams(next, { replace: true });
  };

  const regenerate = () => {
    setSlots(() => buildSlots(view, usedFixed));
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

  const ex = view.example;
  const intro = view.intro;
  const formulas = view.formulas;
  const nextSec = sections.length ? (sec ? sections[secIdx + 1] : sections[0]) : undefined;

  return (
    <TaskShell
      title={cfg.title}
      width="full"
      parent={[...(root ? [root] : []), { to: `${base}/${topic.slug}`, label: topic.title }]}
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
        {sections.length > 0 && (
          <nav className="bk-panel !p-3 sm:!p-4" aria-label="Unterthemen">
            <p className="bk-label mb-2 text-left">Unterthema wählen – oder alles gemischt üben</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectSection(null)}
                aria-pressed={!sec}
                className={`bk-btn bk-btn-sm ${!sec ? 'bk-btn-primary' : ''}`}
              >
                Alles gemischt
              </button>
              {sections.map((s, i) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => selectSection(s.slug)}
                  aria-pressed={sec?.slug === s.slug}
                  title={s.description}
                  className={`bk-btn bk-btn-sm ${sec?.slug === s.slug ? 'bk-btn-primary' : ''}`}
                >
                  {i + 1}. {s.title}
                </button>
              ))}
            </div>
          </nav>
        )}
        {(ex || formulas || intro) && (
          <section className="bk-panel !p-0">
            <button
              type="button"
              onClick={() => setExampleOpen((v) => !v)}
              className="flex w-full min-h-[56px] items-center gap-3 px-4 py-2 text-left sm:px-5"
            >
              <span className="bk-chip">{intro ? 'Erklärung' : 'Beispiel'}</span>
              <span className="flex-1 font-display text-lg font-extrabold text-ink">
                {intro ? (sec?.title ?? cfg.title) : (ex?.title ?? 'Formeln')}
              </span>
              {exampleOpen ? (
                <ChevronUp className="h-5 w-5 text-muted" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted" />
              )}
            </button>
            {exampleOpen && (
              <div className="grid grid-cols-1 gap-4 border-t-2 border-edge px-4 pb-4 pt-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto]">
                {(ex || intro) && (
                <div className="min-w-0 space-y-4">
                {intro && (
                  <div className="space-y-2 text-[16px] leading-relaxed text-ink">
                    {intro.split('\n\n').map((para, i) => (
                      <p key={i} className="text-left">
                        <Rich text={para} />
                      </p>
                    ))}
                  </div>
                )}
                {!sec && cfg.video && (
                  <VideoEmbed src={cfg.video.src} title={cfg.video.title ?? `Erklärvideo: ${cfg.title}`} className="max-w-[640px]" />
                )}
                {ex && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="md:col-span-2">
                      {intro && <p className="bk-label text-left">Beispiel: {ex.title}</p>}
                    </div>
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
                </div>
                )}
                {formulas && formulas.length > 0 && (
                  <div className="min-w-0 lg:w-[300px]">
                    <FormulaBox formulas={formulas} />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 [&>*]:min-w-0">
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
          {nextSec && (
            <button
              type="button"
              onClick={() => {
                selectSection(nextSec.slug);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bk-btn"
            >
              {sec ? 'Nächstes Unterthema' : 'Unterthemen einzeln üben'}: {nextSec.title}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <Link to={`${base}/${topic.slug}`} className="bk-btn">
            Zur Themenübersicht
          </Link>
        </div>
      </div>
    </TaskShell>
  );
}

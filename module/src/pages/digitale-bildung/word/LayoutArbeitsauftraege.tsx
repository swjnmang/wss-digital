import { Fragment, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Download, Printer } from 'lucide-react';
import {
  InfoBox,
  PageHead,
  ShellSecondary,
  TaskTable,
  TrainerHeader,
  TrainerPage,
  WerkbankShell,
  shellSecondaryClass,
} from '../../../components/digitale-bildung/Werkbank';
import { ARBEITSAUFTRAEGE, type Arbeitsauftrag, type AuftragItem } from '../../../lib/word-layout/arbeitsauftraege';
import { druckblattAlsPdf } from '../../../lib/word-layout/auftrag-pdf';
import AuftragDruckblatt, { SHEET_PAD } from './AuftragDruckblatt';

const STORE = (slug: string) => `word-layout-auftrag-erledigt-${slug}`;

function loadDone(slug: string): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(STORE(slug)) ?? '[]');
    return Array.isArray(v) ? v.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}
function saveDone(slug: string, done: number[]) {
  try {
    localStorage.setItem(STORE(slug), JSON.stringify(done));
  } catch {
    /* Speicher nicht verfügbar – Häkchen gelten dann nur bis zum Neuladen */
  }
}

const BASE = '/word-layout';

// Mini-Markup: **fett**  ~~kursiv~~  __unterstrichen__  {{Menü > Pfad}}
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*.+?\*\*|\{\{.+?\}\}|~~.+?~~|__.+?__)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('~~')) return <em key={i}>{p.slice(2, -2)}</em>;
        if (p.startsWith('__')) return <u key={i}>{p.slice(2, -2)}</u>;
        if (p.startsWith('{{')) {
          const steps = p.slice(2, -2).split('>').map((s) => s.trim());
          return (
            <span key={i} className="rounded bg-shell px-1.5 py-0.5 font-werkbank-mono text-[0.88em] text-shell-ink [box-decoration-break:clone]">
              {steps.map((s, j) => (
                <Fragment key={j}>
                  {j > 0 && <span className="mx-1">›</span>}
                  {s}
                </Fragment>
              ))}
            </span>
          );
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

function Item({ item, slug }: { item: AuftragItem; slug: string }): ReactNode {
  if ('t' in item) return <p className="text-[17px] leading-normal text-ink"><Rich text={item.t} /></p>;
  if ('b' in item)
    return (
      <div className="flex gap-2 text-[17px] leading-normal text-ink">
        <span className="text-ink-muted select-none">•</span>
        <span><Rich text={item.b} /></span>
      </div>
    );
  if ('s' in item)
    return (
      <div className="flex gap-2 text-[17px] leading-normal text-ink pl-6">
        <span className="text-ink-muted select-none">›</span>
        <span><Rich text={item.s} /></span>
      </div>
    );
  if ('tipp' in item)
    return (
      <div className="text-[16px] bg-canvas rounded-md px-3 py-2 text-ink">
        <strong>Tipp: </strong>
        <Rich text={item.tipp} />
      </div>
    );
  if ('img' in item)
    return (
      <img
        src={`${BASE}/${slug}/img/${item.img}`}
        alt=""
        draggable={false}
        className="my-1 max-h-56 w-auto max-w-full sm:max-w-md rounded-md border border-line self-start"
      />
    );
  if ('beispiel' in item)
    return (
      <div className="font-[Verdana] text-sm bg-canvas border border-line rounded-md px-3 py-2 flex items-end gap-1 max-w-xs">
        <span>{item.beispiel[0]}</span>
        <span className="flex-1 border-b-2 border-dotted border-line-strong mb-1" />
        <span>{item.beispiel[1]}</span>
      </div>
    );
  return null;
}

const LIST = '/digitale-bildung/word/layout/arbeitsauftraege';

const plain = (text: string) => text.replace(/\*\*|~~|__/g, '');

function AuftragListe() {
  const rows = ARBEITSAUFTRAEGE.map((a) => ({
    key: a.slug,
    to: `${LIST}?auftrag=${a.slug}`,
    title: a.kurz,
    text: a.teaser,
    level: a.level,
    meta: `${a.rows.length} Arbeitsschritte`,
  }));
  return (
    <WerkbankShell
      tool="word"
      tree
      path={[
        { label: 'Digitale Bildung', to: '/digitale-bildung' },
        { label: 'Word', to: '/digitale-bildung/word' },
        { label: 'Layouten', to: '/digitale-bildung/word/layout' },
        { label: 'Arbeitsaufträge' },
      ]}
    >
      <PageHead title="Arbeitsaufträge für Word" intro="Wähle einen Arbeitsauftrag aus." />
      <InfoBox title="So gehst du vor">
        Lies den Arbeitsauftrag hier auf der Seite. Lade die Vorlage herunter, öffne sie in Word und arbeite die Schritte der
        Reihe nach ab. Die dunkel hinterlegten Klickwege zeigen dir, wo du die jeweilige Funktion findest. Wenn du fertig
        bist, vergleichst du dein Ergebnis mit der Lösung.
      </InfoBox>
      <TaskTable tasks={rows} />
    </WerkbankShell>
  );
}

function AuftragDetail({ a, onNext }: { a: Arbeitsauftrag; onNext?: () => void }) {
  const [done, setDone] = useState<number[]>(() => loadDone(a.slug));
  const [step, setStep] = useState(() => {
    const first = a.rows.findIndex((_, i) => !loadDone(a.slug).includes(i));
    return first === -1 ? 0 : first;
  });
  const [pdfBusy, setPdfBusy] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const total = a.rows.length;
  const row = a.rows[step];
  const isDone = done.includes(step);
  const allDone = done.length === total;

  const update = (next: number[]) => {
    setDone(next);
    saveDone(a.slug, next);
  };
  const goTo = (i: number) => {
    setStep(Math.max(0, Math.min(total - 1, i)));
    window.scrollTo({ top: 0 });
  };
  const doneAndNext = () => {
    if (!isDone) update([...done, step]);
    if (step < total - 1) goTo(step + 1);
  };
  const pdf = async () => {
    if (!sheetRef.current || pdfBusy) return;
    setPdfBusy(true);
    try {
      await druckblattAlsPdf(sheetRef.current, SHEET_PAD, `Arbeitsauftrag – ${a.kurz.replace(/[„“"]/g, '')}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <>
      {/* Druckansicht: nur das kompakte Druckblatt (max. 2 A4-Seiten) */}
      <div className="hidden print:block">
        <style>{`@page { size: A4; margin: 12mm; } @media print { .druckblatt { width: auto !important; padding: 0 !important; } body { background: #fff !important; } footer { display: none !important; } }`}</style>
        <AuftragDruckblatt a={a} />
      </div>
      {/* Unsichtbares Druckblatt als Quelle für den PDF-Export */}
      <div aria-hidden className="fixed top-0 pointer-events-none" style={{ left: -10000 }}>
        <AuftragDruckblatt ref={sheetRef} a={a} />
      </div>

      <div className="print:hidden">
        <TrainerPage tool="word">
          <TrainerHeader
            title={a.titel}
            meta={`${a.level} · ${done.length} von ${total} erledigt`}
            back={{ to: LIST, label: 'Zu allen Arbeitsaufträgen' }}
            recent={`Word · ${a.thema}`}
          >
            {a.material.map((m) => (
              <a key={m.datei} href={`${BASE}/${a.slug}/${m.datei}`} download={m.downloadName} className={shellSecondaryClass}>
                <Download size={18} aria-hidden="true" />
                {m.label}
              </a>
            ))}
            <ShellSecondary onClick={() => window.print()}>
              <Printer size={18} aria-hidden="true" />
              Drucken
            </ShellSecondary>
            <ShellSecondary onClick={pdf} disabled={pdfBusy}>
              {pdfBusy ? 'PDF wird erstellt …' : 'Als PDF speichern'}
            </ShellSecondary>
          </TrainerHeader>

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <nav
              aria-label="Schritte"
              className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-line bg-surface p-2.5 lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:w-[300px] lg:flex-col lg:self-start lg:overflow-y-auto lg:border-r lg:border-b-0"
            >
              {a.rows.map((r, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-current={i === step ? 'step' : undefined}
                  aria-label={`Schritt ${a.start + i}: ${plain(r.titel)}${done.includes(i) ? ', erledigt' : ''}`}
                  className={`grid min-h-11 shrink-0 grid-cols-[30px_auto_20px] items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-[15.5px] leading-tight font-medium lg:grid-cols-[30px_1fr_20px] ${
                    i === step ? 'bg-tool-soft text-tool-dark' : 'text-ink hover:bg-canvas'
                  }`}
                >
                  <span className="font-werkbank-mono text-[13.5px]">{a.start + i}</span>
                  <span className="hidden lg:inline">{plain(r.titel)}</span>
                  {done.includes(i) ? <Check size={18} strokeWidth={2.5} aria-hidden="true" /> : <span />}
                </button>
              ))}
              {done.length > 0 && (
                <button onClick={() => update([])} className="hidden min-h-11 px-2.5 text-left text-sm text-ink-muted underline lg:block">
                  Häkchen zurücksetzen
                </button>
              )}
            </nav>

            <main className="flex min-w-0 max-w-[900px] flex-1 flex-col gap-4 p-4 sm:p-6">
              <p className="m-0 text-[16.5px] leading-normal text-ink-soft">{a.szenario}</p>

              <section
                className="flex select-none flex-col gap-2.5 rounded-lg border border-line bg-surface p-5"
                onContextMenu={(e) => e.preventDefault()}
              >
                <p className="m-0 font-werkbank-mono text-sm font-medium text-ink-muted">
                  Schritt {a.start + step}
                </p>
                <h2 className="m-0 text-[28px] leading-tight font-bold">
                  <Rich text={row.titel} />
                </h2>
                <div className="flex flex-col gap-2">
                  {row.inhalt.map((item, j) => (
                    <Item key={j} item={item} slug={a.slug} />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => goTo(step - 1)}
                    disabled={step === 0}
                    className="inline-flex min-h-12 items-center gap-2 rounded-md border border-line-strong bg-surface px-4 font-semibold text-ink hover:bg-canvas disabled:opacity-40"
                  >
                    <ArrowLeft size={18} aria-hidden="true" />
                    Zurück
                  </button>
                  <button onClick={doneAndNext} className="min-h-12 flex-1 basis-56 rounded-md bg-tool px-4 font-bold text-white hover:bg-tool-dark">
                    {step === total - 1 ? (isDone ? 'Erledigt' : 'Als erledigt markieren') : isDone ? 'Weiter' : 'Erledigt und weiter'}
                  </button>
                  {isDone && (
                    <button onClick={() => update(done.filter((n) => n !== step))} className="min-h-12 px-2 text-[15px] text-ink-muted underline">
                      Häkchen entfernen
                    </button>
                  )}
                </div>
              </section>

              <div className={`flex flex-wrap items-center justify-between gap-3 rounded-lg p-4 ${allDone ? 'bg-correct-soft' : ''}`}>
                <p className="m-0 flex-1 basis-64 text-[15.5px] text-ink-soft">
                  {allDone
                    ? 'Super, alle Schritte sind abgehakt! Vergleiche jetzt dein Ergebnis mit der Lösung.'
                    : 'Öffne die Lösung erst, wenn du mit allen Schritten fertig bist.'}
                </p>
                <a
                  href={`${BASE}/${a.slug}/loesung.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-md border border-line-strong bg-surface px-3.5 font-semibold text-ink no-underline hover:bg-canvas"
                >
                  Lösung öffnen (PDF)
                </a>
                {allDone && onNext && (
                  <button onClick={onNext} className="min-h-11 rounded-md bg-tool px-4 font-bold text-white hover:bg-tool-dark">
                    Nächster Auftrag
                  </button>
                )}
              </div>
            </main>
          </div>
        </TrainerPage>
      </div>
    </>
  );
}

export default function LayoutArbeitsauftraege() {
  const [params, setParams] = useSearchParams();
  const current = ARBEITSAUFTRAEGE.find((a) => a.slug === params.get('auftrag')) ?? null;

  if (!current) return <AuftragListe />;

  const next = ARBEITSAUFTRAEGE[ARBEITSAUFTRAEGE.indexOf(current) + 1];
  return (
    <AuftragDetail
      key={current.slug}
      a={current}
      onNext={
        next
          ? () => {
              setParams({ auftrag: next.slug });
              window.scrollTo({ top: 0 });
            }
          : undefined
      }
    />
  );
}

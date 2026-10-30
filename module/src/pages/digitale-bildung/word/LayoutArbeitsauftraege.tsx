import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

// Erledigt-Häkchen pro Arbeitsschritt, im Browser gespeichert
function useErledigt(slug: string | undefined) {
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => setDone(slug ? loadDone(slug) : []), [slug]);
  const update = (next: number[]) => {
    setDone(next);
    if (slug) saveDone(slug, next);
  };
  return {
    done,
    toggle: (i: number) => update(done.includes(i) ? done.filter((n) => n !== i) : [...done, i]),
    reset: () => update([]),
  };
}

// Werkzeugleiste oben: Fortschritt, Drucken, PDF
function Werkzeugleiste({ a, erledigt, onReset }: { a: Arbeitsauftrag; erledigt: number; onReset: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const total = a.rows.length;
  const pct = total ? Math.round((erledigt / total) * 100) : 0;

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
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-semibold text-slate-800">
            {erledigt === total ? '🎉 Alles erledigt!' : `${erledigt} von ${total} Schritten erledigt`}
          </span>
          {erledigt > 0 && (
            <button onClick={onReset} className="text-xs text-slate-500 hover:text-slate-800 underline">
              Zurücksetzen
            </button>
          )}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full transition-all ${erledigt === total ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          🖨 Drucken
        </button>
        <button
          onClick={pdf}
          disabled={pdfBusy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-sm font-semibold hover:border-slate-500 transition-colors disabled:opacity-60"
        >
          {pdfBusy ? '⏳ PDF wird erstellt …' : '📄 Als PDF speichern'}
        </button>
      </div>
      {/* Unsichtbares Druckblatt als Quelle für den PDF-Export */}
      <div aria-hidden className="fixed top-0 pointer-events-none" style={{ left: -10000 }}>
        <AuftragDruckblatt ref={sheetRef} a={a} />
      </div>
    </section>
  );
}

const BASE = '/word-layout';

const levelStyle: Record<string, string> = {
  Einstieg: 'text-slate-700 bg-slate-100',
  Einfach: 'text-blue-700 bg-blue-50',
  Mittel: 'text-amber-700 bg-amber-50',
  Schwer: 'text-red-700 bg-red-50',
};

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
            <span key={i} className="text-red-600 font-medium">
              {steps.map((s, j) => (
                <Fragment key={j}>
                  {j > 0 && <span className="mx-1">➔</span>}
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
  if ('t' in item) return <p className="text-sm text-slate-700"><Rich text={item.t} /></p>;
  if ('b' in item)
    return (
      <div className="flex gap-2 text-sm text-slate-700">
        <span className="text-slate-400 select-none">•</span>
        <span><Rich text={item.b} /></span>
      </div>
    );
  if ('s' in item)
    return (
      <div className="flex gap-2 text-sm text-slate-700 pl-6">
        <span className="text-red-600 select-none">➔</span>
        <span><Rich text={item.s} /></span>
      </div>
    );
  if ('tipp' in item)
    return (
      <div className="text-sm bg-amber-50 border-l-4 border-amber-400 rounded-r-md px-3 py-2 text-amber-950">
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
        className="my-1 max-h-56 w-auto max-w-full sm:max-w-md rounded-md border border-slate-200 self-start"
      />
    );
  if ('beispiel' in item)
    return (
      <div className="font-[Verdana] text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2 flex items-end gap-1 max-w-xs">
        <span>{item.beispiel[0]}</span>
        <span className="flex-1 border-b-2 border-dotted border-slate-400 mb-1" />
        <span>{item.beispiel[1]}</span>
      </div>
    );
  return null;
}

function Material({ a }: { a: Arbeitsauftrag }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800">📥 Material zum Bearbeiten</h3>
        <p className="text-sm text-slate-500">Lade die Dateien herunter und öffne die Vorlage in Microsoft Word.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {a.material.map((m) => (
          <a
            key={m.datei}
            href={`${BASE}/${a.slug}/${m.datei}`}
            download={m.downloadName}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            ⬇ {m.label}
          </a>
        ))}
      </div>
    </section>
  );
}

// Lösung immer ganz unten am Ende des Arbeitsauftrags
function Loesung({ a, fertig }: { a: Arbeitsauftrag; fertig: boolean }) {
  return (
    <section className={`rounded-xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${fertig ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
      <div className="flex-1">
        <h3 className="font-bold text-slate-800">✅ Lösung zum Abgleich</h3>
        <p className="text-sm text-slate-500">
          {fertig ? 'Super, alle Schritte sind abgehakt! Vergleiche jetzt dein Ergebnis mit der Lösung.' : 'Öffne die Lösung erst, wenn du mit allen Arbeitsaufträgen fertig bist.'}
        </p>
      </div>
      <a
          href={`${BASE}/${a.slug}/loesung.pdf`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          Lösung öffnen (PDF)
        </a>
    </section>
  );
}

export default function LayoutArbeitsauftraege() {
  const [params, setParams] = useSearchParams();
  const current = ARBEITSAUFTRAEGE.find((a) => a.slug === params.get('auftrag')) ?? null;
  const { done, toggle, reset } = useErledigt(current?.slug);

  const select = (slug: string | null) => {
    setParams(slug ? { auftrag: slug } : {});
    window.scrollTo({ top: 0 });
  };

  return (
    <>
    {/* Druckansicht: nur das kompakte Druckblatt (max. 2 A4-Seiten) */}
    {current && (
      <div className="hidden print:block">
        <style>{`@page { size: A4; margin: 12mm; } @media print { .druckblatt { width: auto !important; padding: 0 !important; } body { background: #fff !important; } footer { display: none !important; } }`}</style>
        <AuftragDruckblatt a={current} />
      </div>
    )}
    <div className="min-h-screen bg-slate-50 flex flex-col print:hidden">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white pt-12 pb-8 sm:py-8 px-4 text-center relative">
        <Link
          to="/digitale-bildung/word/layout"
          className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Layouten
        </Link>
        <h1 className="text-2xl font-bold">📄 Arbeitsaufträge für Word</h1>
        <p className="text-slate-300 text-sm mt-1">
          {current ? current.kurz : 'Wähle einen Arbeitsauftrag aus.'}
        </p>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Auswahl */}
        <nav className={current ? 'flex flex-wrap gap-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
          {ARBEITSAUFTRAEGE.map((a, i) =>
            current ? (
              <button
                key={a.slug}
                onClick={() => select(a.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  a.slug === current.slug
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                {i + 1}. {a.thema}
              </button>
            ) : (
              <button
                key={a.slug}
                onClick={() => select(a.slug)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left flex flex-col items-start hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <span className={`text-xs font-semibold uppercase tracking-wide rounded-full px-2 py-1 mb-2 ${levelStyle[a.level] ?? ''}`}>
                  {i + 1} · {a.level}
                </span>
                <h2 className="text-base font-bold text-slate-800 mb-1">{a.kurz}</h2>
                <p className="text-sm text-slate-500">{a.teaser}</p>
                <p className="text-xs text-slate-400 mt-2">{a.rows.length} Arbeitsschritte</p>
              </button>
            ),
          )}
        </nav>

        {!current && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900 leading-relaxed">
            <p className="font-semibold mb-1">📖 So gehst du vor</p>
            <p>
              Lies den Arbeitsauftrag hier auf der Seite. Lade die Vorlage herunter, öffne sie in Word und arbeite die
              Schritte der Reihe nach ab. Die <span className="text-red-600 font-medium">roten Klickwege</span> zeigen dir,
              wo du die jeweilige Funktion findest. Wenn du fertig bist, vergleichst du dein Ergebnis mit der Lösung.
            </p>
          </div>
        )}

        {current && (
          <>
            <section className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Digitale Bildung – Klasse 10 – Layout – {current.thema}
              </p>
              <h2 className="text-xl font-bold text-slate-800">{current.titel}</h2>
              <p className="text-sm italic text-slate-600 leading-relaxed">{current.szenario}</p>
            </section>

            <Werkzeugleiste a={current} erledigt={done.length} onReset={reset} />

            <Material a={current} />

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden select-none" onContextMenu={(e) => e.preventDefault()}>
              {current.rows.map((row, i) => {
                const isDone = done.includes(i);
                return (
                <div key={i} className={`flex border-b border-slate-200 last:border-b-0 transition-colors ${isDone ? 'bg-emerald-50/60' : ''}`}>
                  <div className={`w-10 sm:w-12 shrink-0 text-white text-sm font-semibold flex justify-center pt-3 transition-colors ${isDone ? 'bg-emerald-600' : 'bg-[#1F497D]'}`}>
                    {current.start + i}
                  </div>
                  <div className="flex-1 p-3 sm:p-4 flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`font-bold text-slate-800 ${isDone ? 'line-through decoration-emerald-600/60' : ''}`}>
                        <Rich text={row.titel} />
                      </h3>
                      <label className="shrink-0 inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none rounded-md px-2 py-1 hover:bg-slate-100">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggle(i)}
                          className="w-5 h-5 accent-emerald-600 cursor-pointer"
                        />
                        erledigt
                      </label>
                    </div>
                    <div className={`flex flex-col gap-1.5 ${isDone ? 'opacity-50' : ''}`}>
                      {row.inhalt.map((item, j) => (
                        <Item key={j} item={item} slug={current.slug} />
                      ))}
                    </div>
                  </div>
                </div>
                );
              })}
            </section>

            <Loesung a={current} fertig={done.length === current.rows.length} />

            <div className="flex justify-between gap-3 text-sm">
              <button onClick={() => select(null)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold">
                ← Alle Arbeitsaufträge
              </button>
              {(() => {
                const idx = ARBEITSAUFTRAEGE.indexOf(current);
                const next = ARBEITSAUFTRAEGE[idx + 1];
                return next ? (
                  <button onClick={() => select(next.slug)} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold">
                    Nächster Auftrag →
                  </button>
                ) : null;
              })()}
            </div>
          </>
        )}
      </main>
    </div>
    </>
  );
}

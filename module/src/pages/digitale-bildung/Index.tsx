import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FileText, Table2 } from 'lucide-react';
import { KI_URL, PageHead, WerkbankShell } from '../../components/digitale-bildung/Werkbank';
import { loadRecent } from '../../lib/digitale-bildung/recent';
import { ALL_TASKS } from '../../lib/excel-trainer/tasks';
import { ARBEITSAUFTRAEGE } from '../../lib/word-layout/arbeitsauftraege';
import { LAYOUT_TASKS } from '../../lib/word-layout/tasks';

const toolLink =
  'flex min-h-[52px] items-center justify-between gap-3 border-t border-line-soft px-4 py-2 font-semibold text-ink no-underline transition-colors hover:bg-canvas';
const count = 'font-werkbank-mono text-sm font-medium text-ink-muted';
const tileShell = 'flex flex-col overflow-hidden rounded-lg border border-line bg-surface';

export default function DigitaleBildungIndex() {
  const [recent] = useState(loadRecent);

  return (
    <WerkbankShell tool="start" path={[{ label: 'Digitale Bildung' }]}>
      <PageHead title="Digitale Bildung" intro="Übe den Umgang mit digitalen Werkzeugen für den Büroalltag." />

      <div className="flex flex-col items-start gap-5 xl:flex-row">
        <div className="grid w-full min-w-0 flex-1 grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
          <article className={tileShell}>
            <Link to="/digitale-bildung/excel-trainer" className="flex items-center gap-3 bg-[#0f7b4f] px-4 py-3.5 text-[22px] font-bold text-white no-underline">
              <Table2 size={26} aria-hidden="true" />
              Excel
            </Link>
            <p className="m-0 flex-1 p-4 text-base leading-snug text-ink-soft">
              Formeln, Zellbezüge und Formatierung in einer echten Tabellenkalkulation üben, mit direktem Feedback.
            </p>
            <Link to="/digitale-bildung/excel-trainer" className={toolLink}>
              Alle Übungen <span className={count}>{ALL_TASKS.length}</span>
            </Link>
          </article>

          <article className={tileShell}>
            <Link to="/digitale-bildung/word" className="flex items-center gap-3 bg-[#2456c9] px-4 py-3.5 text-[22px] font-bold text-white no-underline">
              <FileText size={26} aria-hidden="true" />
              Word
            </Link>
            <Link to="/digitale-bildung/word/geschaeftsbrief" className={`${toolLink} border-t-0`}>
              Geschäftsbrief nach DIN 5008 <span className={count}>5</span>
            </Link>
            <Link to="/digitale-bildung/word/layout/uebungen" className={toolLink}>
              Digitale Übungen <span className={count}>{LAYOUT_TASKS.length}</span>
            </Link>
            <Link to="/digitale-bildung/word/layout/arbeitsauftraege" className={toolLink}>
              Arbeitsaufträge für Word <span className={count}>{ARBEITSAUFTRAEGE.length}</span>
            </Link>
          </article>

          <article className="flex flex-col gap-1.5 rounded-lg border border-dashed border-line-strong bg-canvas p-4 text-ink-soft">
            <h2 className="m-0 flex items-center justify-between gap-2 text-xl font-bold">
              PowerPoint
              <span className="rounded border border-line-strong px-1.5 py-0.5 font-werkbank-mono text-[13px] font-medium">Demnächst</span>
            </h2>
            <p className="m-0 text-base leading-snug">Präsentationen strukturieren und gestalten.</p>
          </article>

          <a
            href={KI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface p-4 text-ink no-underline transition-[box-shadow,transform] duration-100 hover:-translate-y-px hover:shadow-md"
          >
            <span className="flex items-center justify-between gap-2 text-xl font-bold text-ki">
              Mit einer KI umgehen
              <ExternalLink size={20} role="img" aria-label="Externe Seite" />
            </span>
            <span className="text-base leading-snug text-ink-soft">
              Den sinnvollen und verantwortungsvollen Umgang mit KI-Assistenten lernen. Öffnet eine externe Seite.
            </span>
          </a>
        </div>

        {recent.length > 0 && (
          <aside className="w-full shrink-0 rounded-lg border border-line bg-surface p-4 xl:w-[280px]">
            <h2 className="m-0 text-[17px] font-bold">Zuletzt geöffnet</h2>
            <p className="m-0 mb-2 text-sm text-ink-muted">Nur in diesem Browser gespeichert</p>
            {recent.map((entry) => (
              <Link key={entry.to} to={entry.to} className="-mx-2 block rounded-md px-2 py-2.5 text-ink no-underline transition-colors hover:bg-canvas">
                <strong className="block leading-snug">{entry.title}</strong>
                <span className="text-sm text-ink-muted">{entry.sub}</span>
              </Link>
            ))}
          </aside>
        )}
      </div>
    </WerkbankShell>
  );
}

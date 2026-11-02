import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, FileText, Home, Sparkles, Table2, X } from 'lucide-react';
import '@fontsource-variable/schibsted-grotesk';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import { rememberRecent } from '../../lib/digitale-bildung/recent';

export type Tool = 'start' | 'excel' | 'word';

export const KI_URL = 'https://haemmo.herrzim.de/';
const BASE = '/digitale-bildung';

export interface Crumb {
  label: string;
  to?: string;
}

const railItem =
  'flex-1 md:flex-none h-16 md:w-[72px] flex flex-col items-center justify-center gap-0.5 rounded-md text-[13px] font-medium text-white no-underline transition-colors';

function Rail({ tool }: { tool: Tool }) {
  const item = (active: boolean) => `${railItem} ${active ? (tool === 'start' ? 'bg-shell-2' : 'bg-tool') : 'hover:bg-shell-2'}`;
  return (
    <nav aria-label="Werkzeuge" className="werkbank-dark bg-shell shrink-0 p-2 flex md:flex-col gap-1 md:w-[88px]">
      <NavLink to={BASE} end className={() => item(tool === 'start')}>
        <Home size={22} aria-hidden="true" />
        Start
      </NavLink>
      <NavLink to={`${BASE}/excel-trainer`} className={() => item(tool === 'excel')}>
        <Table2 size={22} aria-hidden="true" />
        Excel
      </NavLink>
      <NavLink to={`${BASE}/word`} className={() => item(tool === 'word')}>
        <FileText size={22} aria-hidden="true" />
        Word
      </NavLink>
      <a href={KI_URL} target="_blank" rel="noopener noreferrer" aria-label="KI, öffnet eine externe Seite" className={item(false)}>
        <Sparkles size={22} aria-hidden="true" />
        KI
      </a>
    </nav>
  );
}

const WORD_TREE = [
  { label: 'Geschäftsbrief nach DIN 5008', to: `${BASE}/word/geschaeftsbrief`, level: 0 },
  { label: 'Layouten mit Word', to: `${BASE}/word/layout`, level: 0, end: true },
  { label: 'Arbeitsaufträge für Word', to: `${BASE}/word/layout/arbeitsauftraege`, level: 1 },
  { label: 'Digitale Übungen', to: `${BASE}/word/layout/uebungen`, level: 1 },
];

function WordTree() {
  return (
    <nav aria-label="Word" className="hidden lg:flex flex-col gap-0.5 shrink-0 w-[272px] bg-surface border-r border-line p-3">
      <p className="m-0 mx-2 mb-1.5 text-sm font-semibold text-ink-muted">Word</p>
      {WORD_TREE.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `min-h-11 flex items-center rounded-md py-2 pr-2.5 text-base no-underline transition-colors ${
              item.level ? 'pl-6' : 'pl-2.5'
            } ${isActive ? 'bg-tool-soft text-tool-dark font-bold' : 'text-ink hover:bg-canvas'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function PathBar({ path }: { path: Crumb[] }) {
  return (
    <header className="min-h-[52px] bg-surface border-b border-line px-4 sm:px-6 flex flex-wrap items-center justify-between gap-x-4">
      <nav aria-label="Pfad" className="font-werkbank-mono text-sm font-medium">
        {path.map((crumb, i) => (
          <span key={crumb.label}>
            {i > 0 && <span className="text-ink-muted"> / </span>}
            {crumb.to ? (
              <Link to={crumb.to} className="inline-block py-2.5 text-tool-dark underline-offset-2 hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <Link to="/" className="py-3 text-[15px] text-tool-dark hover:underline">
        Zu den Modulen
      </Link>
    </header>
  );
}

interface ShellProps {
  tool: Tool;
  path: Crumb[];
  tree?: boolean;
  children: ReactNode;
}

/** Rahmen aller Übersichten: Werkzeugleiste, Pfad und optional die Word-Navigation. */
export function WerkbankShell({ tool, path, tree, children }: ShellProps) {
  return (
    <div data-tool={tool} className="werkbank font-werkbank min-h-screen flex flex-col md:flex-row bg-canvas text-ink">
      <Rail tool={tool} />
      <div className="flex-1 min-w-0 flex flex-col">
        <PathBar path={path} />
        <div className="flex-1 flex min-h-0">
          {tree && <WordTree />}
          <main className="flex-1 min-w-0 p-4 sm:p-6 flex flex-col gap-5 max-w-[1180px]">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function PageHead({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h1 className="m-0 text-[32px] leading-tight font-bold">{title}</h1>
        {intro && <p className="m-0 mt-1 text-[17px] text-ink-muted">{intro}</p>}
      </div>
      {children}
    </div>
  );
}

interface TileProps {
  to: string;
  title: string;
  text: string;
  nr?: string;
  meta?: string;
}

export function Tile({ to, title, text, nr, meta }: TileProps) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-4 text-ink no-underline transition-[box-shadow,transform] duration-100 hover:-translate-y-px hover:shadow-md"
    >
      {nr && <span className="font-werkbank-mono text-sm font-medium text-tool-dark">{nr}</span>}
      <span className="text-[19px] font-bold leading-tight">{title}</span>
      <span className="text-[15.5px] leading-snug text-ink-soft">{text}</span>
      {meta && <span className="mt-1 font-werkbank-mono text-[13px] text-ink-muted">{meta}</span>}
    </Link>
  );
}

export function TileGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-3">{children}</div>;
}

export function InfoBox({ title = 'Kurz erklärt', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-tool-soft p-4 text-[15.5px] leading-relaxed">
      <p className="m-0 mb-1 flex items-center gap-2 font-semibold">
        <BookOpen size={18} aria-hidden="true" />
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}

export function LevelTag({ level }: { level: string }) {
  return <span className="whitespace-nowrap text-[15px]">{level}</span>;
}

export interface TaskRow {
  key: string;
  to: string;
  title: string;
  text: string;
  level: string;
  nr?: string;
  meta?: string;
}

/** Aufgabenliste mit Filter. Jede Zeile ist ein echter Link. */
export function TaskTable({ tasks, filter = true }: { tasks: TaskRow[]; filter?: boolean }) {
  const levels = Array.from(new Set(tasks.map((t) => t.level)));
  const [active, setActive] = useState('Alle');
  const showFilter = filter && levels.length > 1;
  const rows = active === 'Alle' ? tasks : tasks.filter((t) => t.level === active);
  const columns = 'md:grid md:grid-cols-[52px_minmax(0,250px)_minmax(0,1fr)_84px] md:gap-3';

  return (
    <div className="flex flex-col gap-3">
      {showFilter && (
        <div role="group" aria-label="Nach Stufe filtern" className="flex flex-wrap gap-1.5">
          {['Alle', ...levels].map((name) => (
            <button
              key={name}
              onClick={() => setActive(name)}
              aria-pressed={name === active}
              className={`min-h-11 rounded-md border px-4 text-[15.5px] font-semibold ${
                name === active ? 'border-shell bg-shell text-white' : 'border-line-strong bg-surface text-ink hover:bg-canvas'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div aria-hidden="true" className={`hidden border-b border-line px-3.5 py-2.5 text-sm font-semibold text-ink-muted ${columns}`}>
          <span>Nr.</span>
          <span>Übung</span>
          <span>Worum es geht</span>
          <span>Stufe</span>
        </div>
        <ul className="m-0 list-none p-0">
          {rows.map((task) => (
            <li key={task.key} className="border-b border-line-soft last:border-b-0">
              <Link
                to={task.to}
                className={`block min-h-12 items-center px-3.5 py-2.5 text-ink no-underline transition-colors hover:bg-tool-soft ${columns}`}
              >
                <span className="hidden font-werkbank-mono text-sm font-medium text-ink-muted md:block">
                  {task.nr ?? String(tasks.indexOf(task) + 1).padStart(2, '0')}
                </span>
                <span className="block font-bold leading-snug">{task.title}</span>
                <span className="block text-[15.5px] leading-snug text-ink-soft">
                  <span className="line-clamp-2">{task.text}</span>
                  {task.meta && <span className="mt-0.5 block font-werkbank-mono text-[13px] text-ink-muted">{task.meta}</span>}
                </span>
                <span className="mt-1 block md:mt-0">
                  <LevelTag level={task.level} />
                </span>
              </Link>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="p-4 text-[15.5px]">
              Keine Übung in dieser Stufe.{' '}
              <button onClick={() => setActive('Alle')} className="font-semibold text-tool-dark underline">
                Alle zeigen
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/** Rahmen aller Trainer: nur die dunkle Kopfzeile, sonst volle Arbeitsfläche. */
export function TrainerPage({ tool, children }: { tool: 'excel' | 'word'; children: ReactNode }) {
  return (
    <div data-tool={tool} className="werkbank font-werkbank min-h-screen flex flex-col bg-canvas text-ink">
      {children}
    </div>
  );
}

interface TrainerHeaderProps {
  title: string;
  meta?: string;
  /** Zurück-Ziel; alternativ `backSlot` für eigene Logik. */
  back?: { to: string; label: string };
  backSlot?: ReactNode;
  /** Name in „Zuletzt geöffnet“, z. B. „Word · Anschriftenfeld“. */
  recent?: string;
  children?: ReactNode;
}

export const backLinkClass =
  'shrink-0 w-11 h-11 flex items-center justify-center rounded-md text-white hover:bg-shell-2 transition-colors';

export function TrainerHeader({ title, meta, back, backSlot, recent, children }: TrainerHeaderProps) {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (recent) rememberRecent({ to: pathname + search, title, sub: recent });
  }, [recent, title, pathname, search]);

  return (
    <header className="werkbank-dark sticky top-0 z-20 shrink-0 bg-shell text-shell-ink px-2 sm:px-3 py-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
      {back ? (
        <Link to={back.to} aria-label={back.label} title={back.label} className={backLinkClass}>
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
      ) : (
        backSlot
      )}
      <h1 className="m-0 min-w-0 text-[17px] font-bold leading-tight">{title}</h1>
      {meta && <span className="font-werkbank-mono text-[13px] text-shell-muted">{meta}</span>}
      <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">{children}</div>
    </header>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Hauptaktion auf der dunklen Kopfzeile. */
export function ShellPrimary({ className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`h-11 rounded-md bg-tool-on-shell px-5 text-base font-bold text-[#0b1220] transition-opacity disabled:cursor-not-allowed disabled:bg-shell-2 disabled:text-shell-muted ${className}`}
    />
  );
}

/** Nebenaktion auf der dunklen Kopfzeile. */
export const shellSecondaryClass =
  'inline-flex h-11 items-center gap-1.5 rounded-md border border-shell-line bg-transparent px-3.5 text-[15.5px] font-semibold text-white transition-colors hover:bg-shell-2';

export function ShellSecondary({ className = '', ...props }: ButtonProps) {
  return <button {...props} className={`${shellSecondaryClass} ${className}`} />;
}

interface StepButtonsProps {
  count: number;
  current: number;
  done?: boolean[];
  label: string;
  onSelect: (index: number) => void;
}

export function StepButtons({ count, current, done, label, onSelect }: StepButtonsProps) {
  return (
    <div role="group" aria-label={`${label}e`} className="flex max-w-full gap-1 overflow-x-auto">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`${label} ${i + 1}${done?.[i] ? ', erledigt' : ''}`}
          aria-current={i === current ? 'step' : undefined}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-shell-line font-werkbank-mono text-[15px] font-medium text-white transition-colors ${
            i === current ? 'bg-tool' : 'hover:bg-shell-2'
          }`}
        >
          {done?.[i] ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : i + 1}
        </button>
      ))}
    </div>
  );
}

/** Rückmeldung nach dem Prüfen: immer Symbol, Wort und Farbe zusammen. */
export function ResultRow({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <p className={`m-0 flex items-start gap-2 text-[15.5px] leading-snug font-medium ${ok ? 'text-correct' : 'text-notyet-ink'}`}>
      {ok ? (
        <Check size={20} strokeWidth={2.5} className="mt-px shrink-0" aria-hidden="true" />
      ) : (
        <X size={20} strokeWidth={2.5} className="mt-px shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
    </p>
  );
}

interface ResultBannerProps {
  allCorrect: boolean;
  checked: boolean;
  correctText: string;
  wrongText: string;
  next?: { label: string; onClick?: () => void; to?: string };
}

export function ResultBanner({ allCorrect, checked, correctText, wrongText, next }: ResultBannerProps) {
  if (allCorrect) {
    return (
      <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-correct-soft p-4">
        <ResultRow ok>
          <strong>Richtig!</strong> {correctText}
        </ResultRow>
        {next &&
          (next.to ? (
            <Link to={next.to} className="inline-flex min-h-12 items-center gap-2 rounded-md bg-tool px-5 font-bold text-white no-underline hover:bg-tool-dark">
              {next.label}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          ) : (
            <button onClick={next.onClick} className="inline-flex min-h-12 items-center gap-2 rounded-md bg-tool px-5 font-bold text-white hover:bg-tool-dark">
              {next.label}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          ))}
      </div>
    );
  }
  if (!checked) return null;
  return (
    <div role="status" className="rounded-lg bg-notyet-soft p-4">
      <ResultRow ok={false}>
        <strong>Noch nicht.</strong> {wrongText}
      </ResultRow>
    </div>
  );
}

/** Tipps als Seitenleiste: Das Formular bleibt sichtbar und benutzbar. */
export function TipsPanel({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('tips-open');
    return () => document.documentElement.classList.remove('tips-open');
  }, []);

  return (
    <aside
      aria-label={title}
      className="werkbank-light fixed inset-y-0 right-0 z-40 flex w-[min(460px,100vw)] flex-col border-l border-line bg-surface font-werkbank text-ink shadow-xl"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2">
        <h2 className="m-0 text-lg font-bold">{title}</h2>
        <button onClick={onClose} aria-label="Tipps schließen" className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-canvas">
          <X size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </aside>
  );
}

/** Kartenfläche in den Trainern. */
export const panelClass = 'rounded-lg border border-line bg-surface';

/** Tipps-Knopf auf hellen Übersichtsseiten. */
export const tipsLightClass =
  'inline-flex min-h-11 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3.5 text-[15.5px] font-semibold text-ink transition-colors hover:bg-canvas';

/** Trainer-Inhalt: Arbeitsauftrag links, Arbeitsfläche rechts. */
export function TrainerSplit({ brief, children }: { brief: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <aside
        aria-label="Arbeitsauftrag"
        className="shrink-0 border-b border-line bg-surface p-4 [overflow-wrap:anywhere] sm:p-5 lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:w-[320px] lg:self-start lg:overflow-y-auto lg:border-r lg:border-b-0"
      >
        {brief}
      </aside>
      {children}
    </div>
  );
}

export const trainerMainClass = 'flex min-w-0 flex-1 flex-col gap-5 p-4 sm:p-6';
export const briefLabelClass = 'm-0 mb-1 text-sm font-semibold text-ink-muted';

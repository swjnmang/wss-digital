import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, Square } from 'lucide-react';
import { ShellPrimary, ShellSecondary, StepButtons, TrainerHeader } from '../../../components/digitale-bildung/Werkbank';
import { useNavigate, useParams } from 'react-router-dom';
import { UniverLayoutDoc, type UniverLayoutDocHandle } from '../../../components/word-trainer/UniverLayoutDoc';
import { LAYOUT_TASKS, getLayoutTask, runLayoutChecks } from '../../../lib/word-layout/tasks';
import { readLayoutDocument } from '../../../lib/word-layout/grading';
import type { StudentInfo } from '../../../lib/word-layout/export-pdf';
import type { LayoutTask, LayoutTool } from '../../../lib/word-layout/types';

const STUDENT_KEY = 'wss-word-layout:student';
/** So lange bleibt „Erledigt!“ stehen, bevor der nächste Auftrag erscheint. */
const ADVANCE_DELAY = 1600;

type StepResult = ReturnType<typeof runLayoutChecks>;

const TOOL_LABEL: Record<LayoutTool, string> = {
  absatz: '¶ Absatzeinstellungen',
  abschnitt: '▥ Abschnitt & Spalten',
  seite: '📄 Seite einrichten',
  kopfzeile: 'Kopfzeile bearbeiten',
  fusszeile: 'Fußzeile bearbeiten',
};

function loadStudent(): StudentInfo {
  try {
    const raw = localStorage.getItem(STUDENT_KEY);
    if (raw) return { name: '', klasse: '', ...JSON.parse(raw) };
  } catch {
    // ohne gespeicherte Angaben weiter
  }
  return { name: '', klasse: '' };
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Dateiname nach Unterrichtsvorgabe: nachname_aufgabe.docx */
function fileBase(student: StudentInfo, taskId: string) {
  const last = student.name.trim().split(/\s+/).pop() ?? '';
  const clean = (t: string) => t.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^A-Za-z0-9-]+/g, '_').replace(/^_|_$/g, '');
  return [clean(last).toLowerCase() || 'dokument', taskId].join('_');
}

const stepDone = (r: StepResult[number] | undefined) => !!r && r.results.every((x) => x.success);

export default function LayoutTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getLayoutTask(taskId) : undefined;

  useEffect(() => {
    if (!task) navigate('/digitale-bildung/word/layout/uebungen', { replace: true });
  }, [task, navigate]);

  // key: beim Aufgabenwechsel beginnt der Trainer mit frischem Zustand
  return task ? <Trainer key={task.id} task={task} /> : null;
}

function Trainer({ task }: { task: LayoutTask }) {
  const navigate = useNavigate();
  const docRef = useRef<UniverLayoutDocHandle>(null);
  const [results, setResults] = useState<StepResult | null>(null);
  const [current, setCurrent] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [showHints, setShowHints] = useState(false);
  // Auf schmalen Bildschirmen (Tablet hochkant) zählt jeder Zentimeter fürs Dokument
  const [showSituation, setShowSituation] = useState(() => window.innerWidth >= 1024);
  const [showExport, setShowExport] = useState(false);
  const [restored, setRestored] = useState(false);

  const prevDone = useRef<boolean[] | null>(null);
  const advanceTimer = useRef<number | null>(null);
  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const goTo = useCallback((index: number) => {
    docRef.current?.leaveHeaderFooter();
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    setCelebrate(false);
    setShowHints(false);
    setCurrent(Math.max(0, Math.min(task.steps.length - 1, index)));
  }, [task.steps.length]);

  // Live-Prüfung: Dokument regelmäßig auslesen; wird der aktuelle Auftrag erfüllt, geht es automatisch weiter
  useEffect(() => {
    const evaluate = () => {
      const doc = docRef.current?.read();
      if (!doc) return;
      const fresh = runLayoutChecks(task, doc);
      const done = fresh.map(stepDone);
      setResults((old) => {
        const sig = (r: StepResult | null) => r?.map((s) => s.results.map((x) => (x.success ? 1 : 0)).join('')).join('|');
        return sig(old) === sig(fresh) ? old : fresh;
      });

      const before = prevDone.current;
      prevDone.current = done;
      if (!before) {
        // Erster Durchlauf (evtl. wiederhergestellter Stand): beim ersten offenen Auftrag einsteigen
        const firstOpen = done.findIndex((d) => !d);
        if (firstOpen > 0) setCurrent(firstOpen);
        if (done.some(Boolean)) setShowSituation(false);
        return;
      }
      const cur = currentRef.current;
      if (!before[cur] && done[cur] && !advanceTimer.current) {
        setCelebrate(true);
        setShowSituation(false);
        advanceTimer.current = window.setTimeout(() => {
          advanceTimer.current = null;
          docRef.current?.leaveHeaderFooter();
          setCelebrate(false);
          setShowHints(false);
          const latest = prevDone.current ?? done;
          const next = latest.findIndex((d, i) => i > cur && !d);
          const anyOpen = latest.findIndex((d) => !d);
          if (next !== -1) setCurrent(next);
          else if (anyOpen !== -1) setCurrent(anyOpen);
        }, ADVANCE_DELAY);
      }
    };
    const timer = window.setInterval(evaluate, 1000);
    const first = window.setTimeout(evaluate, 400);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(first);
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, [task]);

  const step = task.steps[current];
  const stepResults = results?.[current]?.results;
  const doneFlags = results?.map(stepDone) ?? task.steps.map(() => false);
  const doneCount = doneFlags.filter(Boolean).length;
  const allDone = results !== null && doneCount === task.steps.length;
  const taskIndex = LAYOUT_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = LAYOUT_TASKS[taskIndex + 1];
  const open = stepResults?.filter((r) => !r.success) ?? [];

  const handleReset = () => {
    if (!window.confirm('Alle Änderungen an diesem Dokument verwerfen und neu beginnen?')) return;
    docRef.current?.reset();
    prevDone.current = null;
    setRestored(false);
    goTo(0);
    setShowSituation(window.innerWidth >= 1024);
  };

  return (
    <div data-tool="word" className="werkbank font-werkbank fixed inset-0 z-30 flex flex-col bg-canvas text-ink">
      <TrainerHeader
        title={task.title}
        meta={`${doneCount}/${task.steps.length} erledigt`}
        back={{ to: '/digitale-bildung/word/layout/uebungen', label: 'Zur Aufgabenübersicht' }}
        recent="Word · Digitale Übung"
      >
        <StepButtons count={task.steps.length} current={current} done={doneFlags} label="Auftrag" onSelect={goTo} />
        <ShellSecondary onClick={handleReset} title="Dokument zurücksetzen">
          <RotateCcw size={18} aria-hidden="true" />
          <span className="hidden md:inline">Neu beginnen</span>
        </ShellSecondary>
        <ShellPrimary onClick={() => setShowExport(true)}>Speichern</ShellPrimary>
      </TrainerHeader>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row-reverse">
        {/* Arbeitsauftrag */}
        <aside className="shrink-0 lg:w-80 xl:w-96 bg-surface border-b lg:border-b-0 lg:border-l border-line max-h-[38dvh] lg:max-h-none overflow-y-auto">
          <div className="p-3 flex flex-col gap-3">
            {/* Situation */}
            <div className="rounded-lg bg-canvas border border-line text-[15px]">
              <button onClick={() => setShowSituation((v) => !v)} className="w-full text-left px-3 py-2 font-semibold text-ink flex justify-between">
                <span>Situation</span>
                <span>{showSituation ? '▴' : '▾'}</span>
              </button>
              {showSituation && <p className="px-3 pb-3 text-ink whitespace-pre-line text-[15px] leading-snug">{task.auftrag}</p>}
            </div>

            {allDone ? (
              <div className="rounded-lg bg-correct-soft border-2 border-correct p-4 text-center">
                <p className="text-correct font-bold mb-1">Alle Aufträge erledigt!</p>
                <p className="text-[15px] text-correct mb-3">Speichere jetzt deinen Arbeitsnachweis.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setShowExport(true)} className="px-4 py-2.5 bg-tool hover:bg-tool-dark text-white rounded-lg font-semibold text-[15px]">
                    Arbeitsnachweis speichern
                  </button>
                  {nextTask && (
                    <button onClick={() => navigate(`/digitale-bildung/word/layout/${nextTask.id}`)} className="px-4 py-2 bg-surface border border-line-strong rounded-lg font-semibold text-[15px]">
                      Nächste Aufgabe →
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            {/* Aktueller Auftrag */}
            <section className={`rounded-lg border-2 p-3 transition-colors ${celebrate || doneFlags[current] ? 'border-correct bg-correct-soft' : 'border-line bg-tool-soft/40'}`}>
              <p className="text-[13px] font-semibold text-tool-dark">
                Auftrag {current + 1} von {task.steps.length}
              </p>
              <h2 className="text-base font-bold text-ink leading-snug">{step.title}</h2>
              {step.target && (
                <p className="mt-2 text-[15px] text-ink">
                  <span className="font-semibold">Wo: </span>
                  {step.target}
                </p>
              )}
              <div className="mt-2 text-[15px] text-ink">
                <span className="font-semibold text-ink">Was:</span>
                <ul className="list-disc ml-5 mt-1 space-y-0.5">
                  {step.instruction.split('\n').map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              {step.tools && step.tools.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.tools.map((tool) => (
                    <button
                      key={tool}
                      onClick={() => docRef.current?.openTool(tool)}
                      className="text-[13px] font-semibold min-h-11 px-3 py-1.5 rounded-md bg-surface border border-line-strong hover:bg-canvas"
                    >
                      {TOOL_LABEL[tool]}
                    </button>
                  ))}
                  {step.tools.some((t) => t === 'kopfzeile' || t === 'fusszeile') && (
                    <button
                      onClick={() => docRef.current?.leaveHeaderFooter()}
                      className="text-[13px] font-semibold min-h-11 px-3 py-1.5 rounded-md bg-surface border border-line-strong hover:bg-canvas"
                    >
                      ↩ Zurück zum Text
                    </button>
                  )}
                </div>
              )}

              {/* Live-Checkliste */}
              <ul className="mt-3 flex flex-col gap-1">
                {step.checks.map((check, i) => {
                  const ok = stepResults?.[i]?.success;
                  return (
                    <li key={check.label} className={`text-[13px] flex gap-1.5 ${ok ? 'text-correct' : 'text-ink-soft'}`}>
                      {ok ? <Check size={18} strokeWidth={2.5} className="shrink-0" aria-hidden="true" /> : <Square size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
                      <span>
                        {check.label}
                        {showHints && !ok && <span className="block text-ink mt-0.5">{check.hint}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {celebrate ? (
                <p className="mt-3 text-[15px] font-bold text-correct">✓ Erledigt! Gleich geht es weiter …</p>
              ) : (
                !doneFlags[current] &&
                open.length > 0 && (
                  <button onClick={() => setShowHints((v) => !v)} className="mt-1 min-h-11 text-[15px] font-semibold text-tool-dark underline">
                    {showHints ? 'Tipps ausblenden' : 'Tipps anzeigen'}
                  </button>
                )
              )}
              {!celebrate && doneFlags[current] && current < task.steps.length - 1 && (
                <button onClick={() => goTo(current + 1)} className="mt-3 w-full min-h-11 px-3 py-2 rounded-lg bg-tool hover:bg-tool-dark text-white text-[15px] font-semibold">
                  Weiter zu Auftrag {current + 2} ›
                </button>
              )}
            </section>

            <p className="text-[13px] text-ink-soft leading-snug">
              {restored ? 'Dein letzter Stand wurde wiederhergestellt. ' : ''}
              Änderungen werden automatisch im Browser gesichert. Erfüllte Vorgaben werden sofort abgehakt.
            </p>
          </div>
        </aside>

        {/* Dokument */}
        <main className="flex-1 min-h-[320px] min-w-0 bg-surface">
          <UniverLayoutDoc ref={docRef} task={task} onRestored={setRestored} />
        </main>
      </div>

      {showExport && <ExportDialog task={task} docRef={docRef} onClose={() => setShowExport(false)} />}
    </div>
  );
}

function ExportDialog({ task, docRef, onClose }: { task: LayoutTask; docRef: React.RefObject<UniverLayoutDocHandle | null>; onClose: () => void }) {
  const [student, setStudent] = useState<StudentInfo>(loadStudent);
  const [exporting, setExporting] = useState<'docx' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
    } catch {
      // nicht schlimm
    }
  }, [student]);

  const handleExport = async (kind: 'docx' | 'pdf') => {
    const data = docRef.current?.save();
    if (!data) return;
    setExporting(kind);
    setError(null);
    try {
      const base = fileBase(student, task.id);
      if (kind === 'docx') {
        const { exportDocx } = await import('../../../lib/word-layout/export-docx');
        download(await exportDocx(data), `${base}.docx`);
      } else {
        const results = runLayoutChecks(task, readLayoutDocument(data));
        const { exportPdf } = await import('../../../lib/word-layout/export-pdf');
        download(await exportPdf(data, task, results, student), `${base}.pdf`);
      }
    } catch (err) {
      console.error(err);
      setError('Das Speichern hat leider nicht geklappt. Bitte versuche es noch einmal.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 werkbank-light flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-bold text-ink">Arbeitsnachweis speichern</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink text-xl leading-none px-1" aria-label="Schließen">
            ×
          </button>
        </div>
        <p className="text-[13px] text-ink-soft mb-4">
          Die Word-Datei enthält dein gestaltetes Dokument. Das PDF enthält zusätzlich ein Deckblatt mit deinem Namen und dem Prüfergebnis – das gibst
          du deiner Lehrkraft ab.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <label className="text-[13px] font-semibold text-ink-soft col-span-2 sm:col-span-1">
            Vor- und Nachname
            <input
              value={student.name}
              onChange={(e) => setStudent({ ...student, name: e.target.value })}
              placeholder="z. B. Lena Huber"
              className="mt-1 w-full rounded-lg border border-line-strong px-3 py-2 text-[15px] font-normal"
            />
          </label>
          <label className="text-[13px] font-semibold text-ink-soft col-span-2 sm:col-span-1">
            Klasse
            <input
              value={student.klasse}
              onChange={(e) => setStudent({ ...student, klasse: e.target.value })}
              placeholder="z. B. 10b"
              className="mt-1 w-full rounded-lg border border-line-strong px-3 py-2 text-[15px] font-normal"
            />
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null || !student.name.trim()}
            className="px-4 py-2.5 rounded-lg font-semibold text-[15px] bg-tool hover:bg-tool-dark disabled:opacity-50 text-white"
          >
            {exporting === 'pdf' ? 'PDF wird erstellt …' : 'Als PDF mit Prüfergebnis'}
          </button>
          <button
            onClick={() => handleExport('docx')}
            disabled={exporting !== null}
            className="px-4 py-2.5 rounded-lg font-semibold text-[15px] bg-shell hover:bg-shell-2 disabled:opacity-50 text-white"
          >
            {exporting === 'docx' ? 'Wird erstellt …' : 'Als Word-Datei (.docx)'}
          </button>
        </div>
        {!student.name.trim() && <p className="text-[13px] text-ink-soft mt-2">Für das PDF bitte zuerst deinen Namen eintragen.</p>}
        {error && <p className="text-[13px] text-notyet-ink mt-2">{error}</p>}
      </div>
    </div>
  );
}

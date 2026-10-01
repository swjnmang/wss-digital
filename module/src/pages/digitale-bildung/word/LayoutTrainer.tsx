import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
    if (!task) navigate('/digitale-bildung/word/layout', { replace: true });
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
    <div className="fixed inset-0 z-30 flex flex-col bg-slate-100">
      {/* Kopfleiste */}
      <header className="shrink-0 bg-slate-800 text-white px-3 py-2 flex items-center gap-2">
        <Link to="/digitale-bildung/word/layout" className="shrink-0 text-slate-300 hover:text-white text-sm px-2 py-1.5 rounded-md hover:bg-white/10" title="Zur Aufgabenübersicht">
          ← <span className="hidden sm:inline">Übersicht</span>
        </Link>
        <h1 className="flex-1 min-w-0 truncate text-sm sm:text-base font-semibold">{task.title}</h1>
        <span className="shrink-0 hidden sm:inline text-xs text-slate-300">
          {doneCount}/{task.steps.length} erledigt
        </span>
        <button onClick={handleReset} className="shrink-0 text-xs px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20" title="Dokument zurücksetzen">
          ↺<span className="hidden md:inline"> Neu beginnen</span>
        </button>
        <button onClick={() => setShowExport(true)} className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700">
          ⬇ Speichern
        </button>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* Arbeitsauftrag */}
        <aside className="shrink-0 lg:w-80 xl:w-96 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 max-h-[38dvh] lg:max-h-none overflow-y-auto">
          <div className="p-3 flex flex-col gap-3">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
                className="w-10 h-10 shrink-0 rounded-lg border border-slate-300 text-lg disabled:opacity-30 hover:bg-slate-50"
                aria-label="Vorheriger Auftrag"
              >
                ‹
              </button>
              <div className="flex-1 flex flex-wrap justify-center gap-1">
                {task.steps.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => goTo(i)}
                    title={`Auftrag ${i + 1}: ${s.title}`}
                    aria-label={`Auftrag ${i + 1}`}
                    className={`w-6 h-6 rounded-full text-[11px] font-bold transition-all ${
                      i === current ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                    } ${doneFlags[i] ? 'bg-green-500 text-white' : i === current ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                  >
                    {doneFlags[i] ? '✓' : i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goTo(current + 1)}
                disabled={current === task.steps.length - 1}
                className="w-10 h-10 shrink-0 rounded-lg border border-slate-300 text-lg disabled:opacity-30 hover:bg-slate-50"
                aria-label="Nächster Auftrag"
              >
                ›
              </button>
            </div>

            {/* Situation */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 text-sm">
              <button onClick={() => setShowSituation((v) => !v)} className="w-full text-left px-3 py-2 font-semibold text-amber-800 flex justify-between">
                <span>📝 Situation</span>
                <span>{showSituation ? '▴' : '▾'}</span>
              </button>
              {showSituation && <p className="px-3 pb-3 text-amber-900 whitespace-pre-line text-[13px] leading-snug">{task.auftrag}</p>}
            </div>

            {allDone ? (
              <div className="rounded-lg bg-green-50 border-2 border-green-400 p-4 text-center">
                <p className="text-green-800 font-bold mb-1">🎉 Alle Aufträge erledigt!</p>
                <p className="text-sm text-green-800 mb-3">Speichere jetzt deinen Arbeitsnachweis.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setShowExport(true)} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm">
                    ⬇ Arbeitsnachweis speichern
                  </button>
                  {nextTask && (
                    <button onClick={() => navigate(`/digitale-bildung/word/layout/${nextTask.id}`)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-sm">
                      Nächste Aufgabe →
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            {/* Aktueller Auftrag */}
            <section className={`rounded-lg border-2 p-3 transition-colors ${celebrate || doneFlags[current] ? 'border-green-400 bg-green-50' : 'border-blue-200 bg-blue-50/40'}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Auftrag {current + 1} von {task.steps.length}
              </p>
              <h2 className="text-base font-bold text-slate-800 leading-snug">{step.title}</h2>
              {step.target && (
                <p className="mt-2 text-sm text-slate-800">
                  <span className="font-semibold">📍 Wo: </span>
                  {step.target}
                </p>
              )}
              <div className="mt-2 text-sm text-slate-700">
                <span className="font-semibold text-slate-800">✏️ Was:</span>
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
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50"
                    >
                      {TOOL_LABEL[tool]}
                    </button>
                  ))}
                  {step.tools.some((t) => t === 'kopfzeile' || t === 'fusszeile') && (
                    <button
                      onClick={() => docRef.current?.leaveHeaderFooter()}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50"
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
                    <li key={check.label} className={`text-xs flex gap-1.5 ${ok ? 'text-green-700' : 'text-slate-600'}`}>
                      <span className="shrink-0 w-4 text-center">{ok ? '✅' : '⬜'}</span>
                      <span>
                        {check.label}
                        {showHints && !ok && <span className="block text-amber-800 mt-0.5">💡 {check.hint}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {celebrate ? (
                <p className="mt-3 text-sm font-bold text-green-700">✓ Erledigt! Gleich geht es weiter …</p>
              ) : (
                !doneFlags[current] &&
                open.length > 0 && (
                  <button onClick={() => setShowHints((v) => !v)} className="mt-3 text-xs font-semibold text-amber-800 underline">
                    {showHints ? 'Tipps ausblenden' : '💡 Tipps anzeigen'}
                  </button>
                )
              )}
              {!celebrate && doneFlags[current] && current < task.steps.length - 1 && (
                <button onClick={() => goTo(current + 1)} className="mt-3 w-full px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold">
                  Weiter zu Auftrag {current + 2} ›
                </button>
              )}
            </section>

            <p className="text-[11px] text-slate-500 leading-snug">
              {restored ? '💾 Dein letzter Stand wurde wiederhergestellt. ' : '💾 '}
              Änderungen werden automatisch im Browser gesichert. Erfüllte Vorgaben werden sofort abgehakt.
            </p>
          </div>
        </aside>

        {/* Dokument */}
        <main className="flex-1 min-h-[320px] min-w-0 bg-white">
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-bold text-slate-800">📄 Arbeitsnachweis speichern</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-xl leading-none px-1" aria-label="Schließen">
            ×
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Die Word-Datei enthält dein gestaltetes Dokument. Das PDF enthält zusätzlich ein Deckblatt mit deinem Namen und dem Prüfergebnis – das gibst
          du deiner Lehrkraft ab.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <label className="text-xs font-semibold text-slate-600 col-span-2 sm:col-span-1">
            Vor- und Nachname
            <input
              value={student.name}
              onChange={(e) => setStudent({ ...student, name: e.target.value })}
              placeholder="z. B. Lena Huber"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600 col-span-2 sm:col-span-1">
            Klasse
            <input
              value={student.klasse}
              onChange={(e) => setStudent({ ...student, klasse: e.target.value })}
              placeholder="z. B. 10b"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
            />
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null || !student.name.trim()}
            className="px-4 py-2.5 rounded-lg font-semibold text-sm bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white"
          >
            {exporting === 'pdf' ? 'PDF wird erstellt …' : '⬇ Als PDF mit Prüfergebnis'}
          </button>
          <button
            onClick={() => handleExport('docx')}
            disabled={exporting !== null}
            className="px-4 py-2.5 rounded-lg font-semibold text-sm bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white"
          >
            {exporting === 'docx' ? 'Wird erstellt …' : '⬇ Als Word-Datei (.docx)'}
          </button>
        </div>
        {!student.name.trim() && <p className="text-xs text-slate-500 mt-2">Für das PDF bitte zuerst deinen Namen eintragen.</p>}
        {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
      </div>
    </div>
  );
}

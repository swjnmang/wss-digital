import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UniverLayoutDoc, type UniverLayoutDocHandle } from '../../../components/word-trainer/UniverLayoutDoc';
import { LAYOUT_TASKS, getLayoutTask, runLayoutChecks } from '../../../lib/word-layout/tasks';
import { readLayoutDocument } from '../../../lib/word-layout/grading';
import type { StudentInfo } from '../../../lib/word-layout/export-pdf';

const STUDENT_KEY = 'wss-word-layout:student';

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
  const clean = (t: string) => t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').replace(/[^A-Za-z0-9-]+/g, '_').replace(/^_|_$/g, '');
  return [clean(last).toLowerCase() || 'dokument', taskId].join('_');
}

/** Mehrzeilige Vorgaben als Spiegelstriche; eine Einleitung mit Doppelpunkt bleibt davor stehen. */
function Instruction({ text }: { text: string }) {
  const lines = text.split('\n');
  const hasIntro = lines.length === 1 || lines[0].trim().endsWith(':');
  const first = hasIntro ? lines[0] : null;
  const rest = hasIntro ? lines.slice(1) : lines;
  return (
    <>
      {first && <p>{first}</p>}
      {rest.length > 0 && (
        <ul className="list-disc ml-5 mt-1 space-y-0.5">
          {rest.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </>
  );
}

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

type StepResult = ReturnType<typeof runLayoutChecks>;

export default function LayoutTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getLayoutTask(taskId) : undefined;
  const [results, setResults] = useState<StepResult | null>(null);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);
  const docRef = useRef<UniverLayoutDocHandle>(null);
  const [restored, setRestored] = useState(false);
  const [student, setStudent] = useState<StudentInfo>(loadStudent);
  const [exporting, setExporting] = useState<'docx' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
    } catch {
      // nicht schlimm
    }
  }, [student]);

  useEffect(() => {
    if (!task) navigate('/digitale-bildung/word/layout', { replace: true });
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setResults(null);
  }

  if (!task) return null;

  const taskIndex = LAYOUT_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = LAYOUT_TASKS[taskIndex + 1];

  const handleReset = () => {
    if (!window.confirm('Alle Änderungen an diesem Dokument verwerfen und neu beginnen?')) return;
    docRef.current?.reset();
    setResults(null);
    setRestored(false);
  };

  const handleExport = async (kind: 'docx' | 'pdf') => {
    const data = docRef.current?.save();
    if (!data) return;
    setExporting(kind);
    setExportError(null);
    try {
      const base = fileBase(student, task.id);
      if (kind === 'docx') {
        const { exportDocx } = await import('../../../lib/word-layout/export-docx');
        download(await exportDocx(data), `${base}.docx`);
      } else {
        const fresh = runLayoutChecks(task, readLayoutDocument(data));
        setResults(fresh);
        const { exportPdf } = await import('../../../lib/word-layout/export-pdf');
        download(await exportPdf(data, task, fresh, student), `${base}.pdf`);
      }
    } catch (err) {
      console.error(err);
      setExportError('Das Speichern hat leider nicht geklappt. Bitte versuche es noch einmal.');
    } finally {
      setExporting(null);
    }
  };

  const handleCheck = () => {
    const doc = docRef.current?.read();
    if (!doc) return;
    setResults(runLayoutChecks(task, doc));
  };

  const all = results?.flatMap((s) => s.results) ?? [];
  const correctCount = all.filter((r) => r.success).length;
  const totalCount = task.steps.reduce((n, s) => n + s.checks.length, 0);
  const allCorrect = results !== null && correctCount === totalCount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-4 px-4 relative">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <Link
            to="/digitale-bildung/word/layout"
            className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            ← Aufgabenübersicht
          </Link>
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-200 bg-white/10 rounded-full px-2 py-1 mb-1">
            {difficultyLabel[task.difficulty] ?? task.difficulty} · Word-Editor
          </span>
          <h1 className="text-lg font-bold">{task.title}</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">📝 Auftrag</p>
          <p className="text-slate-700 text-sm whitespace-pre-line">{task.auftrag}</p>
          <ol className="mt-4 flex flex-col gap-3">
            {task.steps.map((step, i) => {
              const stepResults = results?.[i]?.results;
              const done = stepResults ? stepResults.every((r) => r.success) : null;
              return (
                <li key={step.title} className="flex gap-3">
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center ${
                      done === null ? 'bg-slate-100 text-slate-600' : done ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <div className="text-sm text-slate-700">
                    <p className="font-semibold text-slate-800">{step.title}</p>
                    <Instruction text={step.instruction} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
            <span>
              {restored
                ? '💾 Dein letzter Stand wurde wiederhergestellt. Änderungen werden automatisch im Browser gesichert.'
                : '💾 Änderungen werden automatisch im Browser gesichert.'}
            </span>
            <button onClick={handleReset} className="shrink-0 px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-100 font-semibold">
              ↺ Neu beginnen
            </button>
          </div>
          <UniverLayoutDoc ref={docRef} task={task} onRestored={setRestored} />
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-600 mb-3">
            {results ? `${correctCount} / ${totalCount} Vorgaben erfüllt` : 'Noch nicht geprüft'}
          </div>
          <button
            onClick={handleCheck}
            className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all"
          >
            Prüfen
          </button>

          {results && (
            <div className="mt-4 flex flex-col gap-4">
              {results.map(({ step, results: stepResults }) => (
                <div key={step.title}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{step.title}</p>
                  <div className="flex flex-col gap-1.5">
                    {stepResults.map(({ check, success }) => (
                      <div
                        key={check.label}
                        className={`text-xs rounded-lg px-3 py-2 ${success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                      >
                        <span className="font-semibold">{success ? '✅' : '❌'} {check.label}</span>
                        {!success && <span className="block mt-0.5 text-red-700">Tipp: {check.hint}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {allCorrect && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center">
            <p className="text-green-800 font-semibold mb-3">🎉 Super! Alle Vorgaben sind erfüllt.</p>
            {nextTask ? (
              <button
                onClick={() => navigate(`/digitale-bildung/word/layout/${nextTask.id}`)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Nächste Aufgabe →
              </button>
            ) : (
              <Link
                to="/digitale-bildung/word/layout"
                className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Zur Aufgabenübersicht
              </Link>
            )}
          </div>
        )}
        {results && !allCorrect && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 text-center">
            <p className="text-amber-800 font-semibold">
              Noch nicht ganz fertig ({correctCount} / {totalCount}). Korrigiere die rot markierten Vorgaben im
              Dokument und klicke erneut auf „Prüfen“.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
          <p className="text-sm font-semibold text-slate-700 mb-1">📄 Arbeitsnachweis speichern</p>
          <p className="text-xs text-slate-500 mb-3">
            Die Word-Datei enthält dein gestaltetes Dokument (zum Weiterbearbeiten in Word). Das PDF enthält zusätzlich ein Deckblatt mit
            deinem Namen und dem Prüfergebnis – das gibst du deiner Lehrkraft ab.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <label className="text-xs font-semibold text-slate-600">
              Vor- und Nachname
              <input
                value={student.name}
                onChange={(e) => setStudent({ ...student, name: e.target.value })}
                placeholder="z. B. Lena Huber"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Klasse
              <input
                value={student.klasse}
                onChange={(e) => setStudent({ ...student, klasse: e.target.value })}
                placeholder="z. B. 10b"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleExport('docx')}
              disabled={exporting !== null}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white"
            >
              {exporting === 'docx' ? 'Wird erstellt …' : '⬇ Als Word-Datei (.docx)'}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null || !student.name.trim()}
              title={!student.name.trim() ? 'Bitte zuerst deinen Namen eintragen' : undefined}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white"
            >
              {exporting === 'pdf' ? 'PDF wird erstellt …' : '⬇ Als PDF mit Prüfergebnis'}
            </button>
          </div>
          {!student.name.trim() && <p className="text-xs text-slate-500 mt-2">Für das PDF bitte zuerst deinen Namen eintragen.</p>}
          {exportError && <p className="text-xs text-red-700 mt-2">{exportError}</p>}
        </div>
      </main>
    </div>
  );
}

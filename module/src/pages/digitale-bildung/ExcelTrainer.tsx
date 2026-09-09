import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UniverSheet, type UniverSheetHandle } from '../../components/excel-trainer/UniverSheet';
import { TaskPanel } from '../../components/excel-trainer/TaskPanel';
import { GuardedBackLink } from '../../components/excel-trainer/GuardedBackLink';
import { RecordingControls } from '../../components/excel-trainer/RecordingControls';
import { getTaskById } from '../../lib/excel-trainer/tasks';
import { useExcelSession } from '../../lib/excel-trainer/ExcelSessionContext';
import type { ValidationResult } from '../../lib/excel-trainer/types';

export default function ExcelTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const sheetRef = useRef<UniverSheetHandle>(null);
  const { recording, startRecording, enterTask, leaveTask, logCheck, finishRecording } = useExcelSession();

  const task = taskId ? getTaskById(taskId) : undefined;

  useEffect(() => {
    if (!task) {
      navigate('/digitale-bildung/excel-trainer', { replace: true });
      return;
    }
    enterTask(task.id, task.title);
    setResults(null);
    return () => {
      leaveTask();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  if (!task) return null;

  const handleCheck = () => {
    const graded = sheetRef.current?.grade() ?? [];
    setResults(graded);
    logCheck(task.id, task.title, graded);
  };

  const handleStartRecording = () => {
    startRecording();
    enterTask(task.id, task.title);
  };

  const handleFinishRecording = (studentName: string) => {
    finishRecording(studentName);
    navigate('/digitale-bildung/excel-trainer');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-6 px-4 relative">
        <GuardedBackLink
          to="/digitale-bildung/excel-trainer"
          className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Aufgabenübersicht
        </GuardedBackLink>
        <h1 className="text-2xl font-bold text-center">📊 {task.title}</h1>
      </header>

      <main className="flex-1 w-full px-2 sm:px-3 py-3 flex flex-col gap-3">
        <div className="sm:hidden bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          📱 Der Excel-Trainer ist für Tablet oder Computer gemacht. Auf dem Smartphone lässt sich die Tabelle nur eingeschränkt bedienen.
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          {recording ? (
            <div className="flex-1 bg-slate-100 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Aufzeichnung läuft – deine Bearbeitungszeit und Ergebnisse werden festgehalten.
            </div>
          ) : (
            <div className="flex-1 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg px-4 py-2">
              Du arbeitest ohne Aufzeichnung.
            </div>
          )}
          <RecordingControls recording={recording} onStart={handleStartRecording} onFinish={handleFinishRecording} />
        </div>

        <TaskPanel task={task} results={results} onCheck={handleCheck} />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <UniverSheet ref={sheetRef} task={task} />
        </div>
      </main>
    </div>
  );
}

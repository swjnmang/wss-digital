import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UniverSheet, type UniverSheetHandle } from '../../components/excel-trainer/UniverSheet';
import { TaskPanel } from '../../components/excel-trainer/TaskPanel';
import { GuardedBackLink } from '../../components/excel-trainer/GuardedBackLink';
import { getTaskById } from '../../lib/excel-trainer/tasks';
import { useExcelSession } from '../../lib/excel-trainer/ExcelSessionContext';
import type { ValidationResult } from '../../lib/excel-trainer/types';

export default function ExcelTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const sheetRef = useRef<UniverSheetHandle>(null);
  const { recording, enterTask, leaveTask, logCheck, finishRecording } = useExcelSession();

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

  const handleFinishRecording = (studentName: string) => {
    finishRecording(studentName);
    navigate('/digitale-bildung/excel-trainer');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 w-full px-2 sm:px-3 py-2 flex flex-col gap-2">
        <div className="sm:hidden bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          📱 Der Excel-Trainer ist für Tablet oder Computer gemacht. Auf dem Smartphone lässt sich die Tabelle nur eingeschränkt bedienen.
        </div>

        <div className="sticky top-0 z-20 bg-slate-50 pt-2 pb-2 flex flex-col gap-2">
          <GuardedBackLink
            to="/digitale-bildung/excel-trainer"
            className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-xs font-medium transition-colors w-fit"
          >
            ← Aufgabenübersicht
          </GuardedBackLink>

          <TaskPanel
            key={task.id}
            task={task}
            results={results}
            onCheck={handleCheck}
            recording={recording}
            onFinishRecording={handleFinishRecording}
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <UniverSheet ref={sheetRef} task={task} />
        </div>
      </main>
    </div>
  );
}

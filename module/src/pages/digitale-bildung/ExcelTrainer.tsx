import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UniverSheet, type UniverSheetHandle } from '../../components/excel-trainer/UniverSheet';
import { TaskPanel } from '../../components/excel-trainer/TaskPanel';
import { TrainerPage } from '../../components/digitale-bildung/Werkbank';
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
    <TrainerPage tool="excel">
      <p className="m-0 bg-notyet-soft px-4 py-2.5 text-[15.5px] text-notyet-ink sm:hidden">
        Der Excel-Trainer ist für Tablet oder Computer gemacht. Auf dem Smartphone lässt sich die Tabelle nur eingeschränkt
        bedienen.
      </p>
      <TaskPanel
        key={task.id}
        task={task}
        results={results}
        onCheck={handleCheck}
        recording={recording}
        onFinishRecording={handleFinishRecording}
      >
        <main className="min-w-0 flex-1 bg-surface">
          <UniverSheet ref={sheetRef} task={task} />
        </main>
      </TaskPanel>
    </TrainerPage>
  );
}

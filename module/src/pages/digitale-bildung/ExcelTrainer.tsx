import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { UniverSheet, type UniverSheetHandle } from '../../components/excel-trainer/UniverSheet';
import { TaskPanel } from '../../components/excel-trainer/TaskPanel';
import { bueromoebelTask } from '../../lib/excel-trainer/tasks/bueromoebel';
import type { ValidationResult } from '../../lib/excel-trainer/types';

const TASKS = [bueromoebelTask];

export default function ExcelTrainer() {
  const [taskIndex, setTaskIndex] = useState(0);
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const sheetRef = useRef<UniverSheetHandle>(null);

  const task = TASKS[taskIndex];

  const handleCheck = () => {
    setResults(sheetRef.current?.grade() ?? []);
  };

  const goTo = (index: number) => {
    setTaskIndex(index);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-6 px-4 relative">
        <Link
          to="/digitale-bildung"
          className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Digitale Bildung
        </Link>
        <h1 className="text-2xl font-bold text-center">📊 Excel-Trainer</h1>
      </header>

      <main className="flex-1 w-full px-2 sm:px-3 py-3 flex flex-col gap-3">
        <div className="sm:hidden bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          📱 Der Excel-Trainer ist für Tablet oder Computer gemacht. Auf dem Smartphone lässt sich die Tabelle nur eingeschränkt bedienen.
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-slate-600 whitespace-nowrap">
            Aufgabe <span className="font-bold">{taskIndex + 1}</span> von{' '}
            <span className="font-bold">{TASKS.length}</span>
          </div>
          <div className="flex-1 max-w-xs bg-slate-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${((taskIndex + 1) / TASKS.length) * 100}%` }}
            />
          </div>
        </div>

        <TaskPanel task={task} results={results} onCheck={handleCheck} />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <UniverSheet ref={sheetRef} task={task} />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => goTo(taskIndex - 1)}
            disabled={taskIndex === 0}
            className="px-4 py-2 bg-slate-300 hover:bg-slate-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 rounded-lg font-medium transition-colors"
          >
            ← Zurück
          </button>
          <button
            onClick={() => goTo(taskIndex + 1)}
            disabled={taskIndex === TASKS.length - 1}
            className="px-4 py-2 bg-slate-300 hover:bg-slate-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 rounded-lg font-medium transition-colors"
          >
            Weiter →
          </button>
        </div>
      </main>
    </div>
  );
}
